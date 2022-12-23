<?php
ok($this->access);


class graph {
	private $authority = 'https://login.microsoftonline.com';
	// private $outlookApiUrl = 'https://outlook.office.com/api/v2.0';
	private $outlookApiUrl = 'https://graph.microsoft.com/v1.0';

  // private static $authorizeUrl = '/common/oauth2/v2.0/authorize?response_type=code&client_id=%1$s&redirect_uri=%2$s&prompt=login&scope=%3$s&state=%3$s';
  // private static $authorizeUrl = '/common/oauth2/v2.0/authorize?response_type=code&prompt=consent&client_id=%1$s&redirect_uri=%2$s&scope=%3$s';
	// private static $authorizeUrl = '/common/oauth2/v2.0/authorize?response_type=code&client_id=%1$s&redirect_uri=%2$s&scope=%3$s';
	private $authorizeUrl = '/common/oauth2/v2.0/authorize?';
	private $tokenUrl = '/common/oauth2/v2.0/token';
	private $redirect_uri = 'https://graph.aliconnect.nl/api/v1.0/login';
	private $account_data;
	public function __construct ($config) {
		$this->config = $config;
		// $this->aim = $GLOBALS['aim1'];
		// $this->client_id = $aim->secret['graph']['client_id'];
		// $this->client_secret = $aim->secret['graph']['client_secret'];
		//
    // // debug(1);
    // // debug(aim()->secret);
		// $this->client_id = aim()->secret['config']['graph']['client_id'];
		// $this->client_secret = aim()->secret['config']['graph']['client_secret'];
		//
		// aim()->access->sub = 265090;
		// //debug(aim()->access);
		// // if (!isset(aim()->access['sub'])) throw new Exception('Unauthorized', 401);
    // // debug(1);
		// $this->userID = aim()->access['sub'];
    // if (!empty($_GET['code'])) {
    //   // debug(base64_decode($_GET['state']));
    //   $this->getTokenFromAuthCode($_GET['code']);
    //   header('Location: /');
    // } else {
    //   $this->login();
    // }
	}
	public function getLoginUrl($query=[]) {
		return $this->authority.$this->authorizeUrl.http_build_query(array_replace([
			'response_type'=> "code",
			'client_id'=> $this->config['client_id'],
			'redirect_uri'=> $this->redirect_uri,
			'scope'=> implode(' ', $this->config['scopes']),
		],$query));
	}
	public function setUserData($json_vals) {
		// global $accessToken,$refreshToken,$accountEmail,$accountId;
		$profile = self::getProfile($json_vals['id_token']);
    $access = self::getProfile($json_vals['access_token']);

		// $account_data = isset($this->user_data) ? $this->user_data : (object)[];
		// $account_data->access_token = $json_vals['access_token'];
		// $account_data->refresh_token = $json_vals['refresh_token'];
    // debug($json_vals, $profile, $access);
		// $account_data->preferred_username = $profile['preferred_username'];
		// $account_data->name = $profile['name'];
    $accountname = $profile['email'];
    $ip = GetRealUserIp();
    // debug(3, $ip, $accountname, $json_vals);
    $account = sqlsrv_fetch_object(aim()->query($query = "EXEC [account].[get] @accountname='$accountname', @IP = '$ip'"));
    // debug($accountname, $profile, $access, $account);
    // Als account niet bestaat aanmaken en email sturen
    if (empty($account->accountId)) {
      // $this->log("account_created");
      $account = sqlsrv_fetch_object(aim()->query("INSERT INTO item.dt (hostID,classID,title) VALUES (1,1004,'$accountname');
      DECLARE @id INT;
      SET @id=scope_identity();
      EXEC item.attr @ItemID=@id, @NameID=30, @value='$accountname'
      ".$query));
    }
    foreach (['email','name','preferred_username'] as $attributeName) {
      if (empty($profile[$attributeName])) continue;
      $value = str_replace("'","''",$profile[$attributeName]);
      $q .= "EXEC item.attr @ItemID=$account->accountId, @AttributeName='$attributeName', @value='$value', @hostID=1;";
    }
    foreach (['family_name','given_name','name','unique_name'] as $attributeName) {
      if (empty($access[$attributeName])) continue;
      $value = str_replace("'","''",$access[$attributeName]);
      $q .= "EXEC item.attr @ItemID=$account->accountId, @AttributeName='$attributeName', @value='$value', @hostID=1;";
    }
    $q .= "EXEC item.attr @itemID=$account->accountId, @Name='mse_access_token', @Value='$json_vals[access_token]';";
    $q .= "EXEC item.attr @itemID=$account->accountId, @Name='mse_refresh_token', @Value='$json_vals[refresh_token]';";
    aim()->query($q);
    // die($q);
    OAuth2::login($account);
	}
	public function getUserData() {
    if (empty($this->userID)) return;
    $res = aim()->query("SELECT Value
      FROM attribute.dv
      WHERE ItemID=$this->userID AND AttributeName='mse_refresh_token'"
    );
    $row = sqlsrv_fetch_object($res);
    // debug($row);
    $this->refresh_token = sqlsrv_fetch_object($res)->Value;
		$this->user_data->client_id = $this->client_id;
		$this->user_data->login_url = $this->getLoginUrl();
		// return $this->user_data;
		return $this->getRefreshToken();
	}
	public function getTokenFromAuthCode($authCode,$account) {
		$query = http_build_query([
			'grant_type' => 'authorization_code',
			'code' => $authCode,
			'redirect_uri' => $this->redirect_uri,
			'scope'=> implode(' ', $this->config['scopes']),
			'client_id'=> $this->config['client_id'],
			'client_secret' => $this->config['client_secret'],
		]);
		$curl = curl_init($this->authority.$this->tokenUrl);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if ($httpCode >= 400) {
			http_response(400, ['errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode]);
		}
		$curl_errno = curl_errno($curl);
		$curl_err = curl_error($curl);
		if ($curl_errno) {
			$msg = $curl_errno.': '.$curl_err;
			error_log('CURL returned an error: '.$msg);
			http_response(400, ['errorNumber' => $curl_errno,'error' => $msg]);
		}
		curl_close($curl);

		$response = json_decode($response, true);
		$state = json_decode(base64_decode($_REQUEST['state']), true);

		$profile = $this->getProfile($response['id_token']);
		$access = $this->getProfile($response['access_token']);
		global $aim;
		$aim->sql_query($sql = [
			"DECLARE @SubId UNIQUEIDENTIFIER = ?",
			"INSERT INTO aliconnect.dbo.graph (uid) SELECT @SubId WHERE @SubId NOT IN (SELECT uid FROM aliconnect.dbo.graph)",
			// "INSERT INTO aliconnect.dbo.graph (oid) SELECT ? WHERE ? NOT IN(SELECT oid FROM aliconnect.dbo.graph)",
			"UPDATE aliconnect.dbo.graph SET oid = ?,id_token = ?,access_token = ?,refresh_token = ?,profile = ?,access = ? WHERE uid = @SubId",
		], [
			$state['sub'],
			$profile['oid'],
			$response['id_token'],
			$response['access_token'],
			$response['refresh_token'],
			json_encode($profile),
			json_encode($access),
		]);
		// http_response(200, $sql);

		// if (isset($json_vals['access_token'])) {
		// 	self::setUserData($json_vals);
		//   debug(2, $json_vals);
		// 	// Redirect back to home page
		//   $url = base64_decode($_GET['state']);
		//   // debug($state);
		// 	header('Location: '.$url);
		//   die();
		// }
		// debug(1, $json_vals);
		// return $json_vals;
	}
	// public function getTokenFromAuthCode($authCode) {
	// 	// Build the form data to post to the OAuth2 token endpoint
	// 	$token_request_data = array(
	// 		'grant_type' => 'authorization_code',
	// 		'code' => $authCode,
	// 		'redirect_uri' => self::$redirect_uri,
	// 		'scope' => implode(' ', self::$scopes),
	// 		'client_id' => aim()->secret['config']['graph']['client_id'],
	// 		'client_secret' => aim()->secret['config']['graph']['client_secret'],
	// 	);
	// 	$token_request_body = http_build_query($token_request_data);
	// 	error_log('Request body: '.$token_request_body);
	//
	// 	$curl = curl_init(self::$authority.self::$tokenUrl);
	// 	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	// 	curl_setopt($curl, CURLOPT_POST, true);
	// 	curl_setopt($curl, CURLOPT_POSTFIELDS, $token_request_body);
	// 	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	// 	$response = curl_exec($curl);
  //   // echo $response;
  //   // debug($response);
	// 	error_log('curl_exec done.');
	// 	$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	// 	error_log('Request returned status '.$httpCode);
	// 	if ($httpCode >= 400) {
  //     return array('errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode);
  //   }
	// 	// Check error
	// 	$curl_errno = curl_errno($curl);
	// 	$curl_err = curl_error($curl);
	// 	if ($curl_errno) {
	// 		$msg = $curl_errno.': '.$curl_err;
	// 		error_log('CURL returned an error: '.$msg);
	// 		return array('errorNumber' => $curl_errno,'error' => $msg);
	// 	}
	// 	curl_close($curl);
	// 	$json_vals = json_decode($response, true);
	// 	error_log("TOKEN RESPONSE:");
	// 	foreach ($json_vals as $key=>$value) {
	// 		error_log("  $key: $value");
	// 	}
	// 	if ($json_vals['access_token']) {
	// 		self::setUserData($json_vals);
  //     debug(2, $json_vals);
	// 		// Redirect back to home page
  //     $url = base64_decode($_GET['state']);
  //     // debug($state);
	// 		header('Location: '.$url);
  //     die();
	// 	}
  //   debug(1, $json_vals);
	// 	return $json_vals;
	// }
	/* get token form refresh_token */
	public function getRefreshToken() {
		global $accessToken,$refreshToken,$accountEmail,$accountId;
		$accessToken = null;
		$token_request_data = array(
			'grant_type' => 'refresh_token',
			'refresh_token'=> $this->user_data->refresh_token,
			'redirect_uri' => self::$redirect_uri,
			'client_id' => $this->client_id,
			'client_secret' => $this->client_secret,
		);
		// Calling http_build_query is important to get the data formatted as expected.
		$token_request_body = http_build_query($token_request_data);
		error_log('Request body: '.$token_request_body);
		$curl = curl_init(self::$authority.self::$tokenUrl);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $token_request_body);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		error_log('curl_exec done.');
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		error_log('Request returned status '.$httpCode);
		if ($httpCode >= 400) {return array('errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode);}
		// Check error
		$curl_errno = curl_errno($curl);
		$curl_err = curl_error($curl);
		if ($curl_errno) {
			$msg = $curl_errno.': '.$curl_err;
			error_log('CURL returned an error: '.$msg);
			return array('errorNumber' => $curl_errno,'error' => $msg);
		}
		curl_close($curl);
		// The response is a JSON payload, so decode it into an array.
		$json_vals = json_decode($response, true);
		error_log('TOKEN RESPONSE:');
		foreach ($json_vals as $key=>$value) error_log('  '.$key.': '.$value);
		if ($json_vals['access_token']) self::setUserData($json_vals);
		return $this->user_data;
	}
	public static function getProfile($idToken) {
		$token_parts = explode('.', $idToken);
		$token = strtr($token_parts[1], '-_', '+/');
		$jwt = base64_decode($token);
		$json_token = json_decode($jwt, true);
		return $json_token;
	}
	// This function generates a random GUID.
	public static function makeGuid() {
		if (function_exists('com_create_guid')) {
			error_log("Using 'com_create_guid'.");
			return strtolower(trim(com_create_guid(), '{}'));
		}
		else {
			error_log('Using custom GUID code.');
			$charid = strtolower(md5(uniqid(rand(), true)));
			$hyphen = chr(45);
			$uuid = substr($charid, 0, 8).$hyphen.substr($charid, 8, 4).$hyphen.substr($charid, 12, 4).$hyphen.substr($charid, 16, 4).$hyphen.substr($charid, 20, 12);
			return $uuid;
		}
	}
  public function getUserToken() {
    if (empty($this->userID)) return;
    $res = aim()->query("SELECT AttributeName,Value
      FROM attribute.dv
      WHERE ItemID=$this->userID AND AttributeName IN ('mse_access_token','preferred_username','mse_refresh_token')"
    );
    while ($row = sqlsrv_fetch_object($res)) {
      $this->{str_replace('mse_','',$row->AttributeName)} = $row->Value;
    }
		// $this->access_token = $row->mse_access_token;
		// $this->refresh_token = $row->mse_refresh_token;
		// $this->preferred_username = $row->mse_email;
	}
	public function makeApiCall($method, $url, $payload = NULL) {
		//global $accessToken,$refreshToken,$accountEmail,$accountId;
		// Generate the list of headers to always send.
		//echo $accessToken;
		$headers = array(
			"User-Agent: php-tutorial/1.0",						// Sending a User-Agent header is a best practice.
			"Authorization: Bearer ".$this->access_token, // Always need our auth token!
			"Accept: application/json",							// Always accept JSON response.
			// "client-request-id: ".self::makeGuid(),             // Stamp each new request with a new GUID.
			"return-client-request-id: true",                   // Tell the server to include our request-id GUID in the response.
			// "X-AnchorMailbox: ".$this->preferred_username		// Provider user's email to optimize routing of API call
		);
    // debug($url, $headers);
		$curl = curl_init($this->outlookApiUrl.$url);
		switch(strtoupper($method)) {
			case "GET":
			// Nothing to do, GET is the default and needs no
			// extra headers.
			error_log("Doing GET");
			break;
			case "POST":
			error_log("Doing POST");
			// Add a Content-Type header (IMPORTANT!)
			$headers[] = "Content-Type: application/json";
			curl_setopt($curl, CURLOPT_POST, true);
			curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
			break;
			case "PATCH":
			error_log("Doing PATCH");
			// Add a Content-Type header (IMPORTANT!)
			$headers[] = "Content-Type: application/json";
			curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PATCH");
			curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
			break;
			case "DELETE":
			error_log("Doing DELETE");
			curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
			break;
			default:
			error_log("INVALID METHOD: ".$method);
			exit;
		}
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		//curl_setopt($curl, CURLOPT_CAINFO, $_SERVER['DOCUMENT_ROOT'] . "/../cert/aliconnectnl.pem");
		$response = curl_exec($curl);
		error_log("curl_exec done.");
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		error_log("Request returned status ".$httpCode);
		if ($httpCode === 401) {
			self::getRefreshToken();
			if ($accessToken) self::makeApiCall($method, $url, $payload);
			return ;
		}
		else if ($httpCode >= 400) { return array('errorNumber' => $httpCode, 'error' => 'Request returned HTTP error '.$httpCode); }
		$curl_errno = curl_errno($curl);
		$curl_err = curl_error($curl);
		if ($curl_errno) {
			$msg = $curl_errno.": ".$curl_err;
			error_log("CURL returned an error: ".$msg);
			curl_close($curl);
			return array('errorNumber' => $curl_errno, 'error' => $msg);
		}
		else {
			// error_log("Response: ".$response);
			curl_close($curl);
			header("Content-Type: application/json");
			http_response(200,$response);
			// return json_decode($response);
		}
	}
	public function getFolder($folder, $Parameters) {
		foreach ($Parameters as $key => $value) {
      if (in_array($key,array("startDateTime","endDateTime"))) {
        $aimMessagesParameters[$key]=$value;
      } else {
        $aimMessagesParameters["\$".$key]=$value;
      }
    }
		//foreach ($Parameters as $key => $value) $aimMessagesParameters[$key]=utf8_decode($value);
		$aimMessagesUrl = self::$outlookApiUrl."/me/$folder?".http_build_query($aimMessagesParameters);
		// debug(urldecode ($aimMessagesUrl));
		return $this->makeApiCall("GET", $aimMessagesUrl);
	}
	public static function getMsg($folder, $msg) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/$msg";
		//echo "<PLAINTEXT>".$aimMessagesUrl.PHP_EOL;
		return self::makeApiCall("GET", $aimMessagesUrl);
	}
	public static function getFolderPeople($Parameters) {
		foreach ($Parameters as $key => $value) $aimMessagesParameters["\$".$key]=$value;
		$aimMessagesUrl = "https://outlook.office.com/api/beta/me/people?".http_build_query($aimMessagesParameters);
		return self::makeApiCall("GET", $aimMessagesUrl);
	}
	public static function getObject($folder,$id) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/$folder/$id";
		return self::makeApiCall("GET", $aimMessagesUrl);
	}
	public static function getAttachement($id,$fileId) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/messages/$id/attachments/$fileId";
		return self::makeApiCall("GET", $aimMessagesUrl);
	}
	public static function getAttachements($id,$Parameters) {
		foreach ($Parameters as $key => $value) $aimMessagesParameters["\$".$key]=$value;
		$aimMessagesUrl = self::$outlookApiUrl."/me/messages/$id/attachments?".http_build_query($aimMessagesParameters);
		//echo "<PLAINTEXT>".$aimMessagesUrl.PHP_EOL;
		return self::makeApiCall("GET", $aimMessagesUrl);
	}
	public static function setObject($folder,$id,$json_data) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/$folder/$id";
		return self::makeApiCall("PATCH", $aimMessagesUrl, json_encode($json_data));
	}
	public static function insertObject($folder,$json_data) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/$folder";
		$data = json_encode($json_data);
		return self::makeApiCall("POST", $aimMessagesUrl, $data);
	}
	public static function deleteObject($folder,$id) {
		$aimMessagesUrl = self::$outlookApiUrl."/me/$folder/$id";
		return self::makeApiCall("DELETE", $aimMessagesUrl, $data);//'{"GivenName": "Pavel","Surname": "Bansky","EmailAddresses": [{"Address": "pavelb@a830edad9050849NDA1.onmicrosoft.com","Name": "Pavel Bansky"}],"BusinessPhones": ["+1 732 555 0102"]}');
	}
	public static function subscribe($authCode) {
		global $accessToken,$refreshToken,$accountEmail,$accountId;
		$data = [
			"@odata.type"=>"#Microsoft.OutlookServices.PushSubscription",
			"Resource"=>"https://outlook.office.com/api/v2.0/me/events",
			"NotificationURL"=>$GLOBALS[MSE]->redirectUri,
			"ChangeType"=>"Created",
			"ClientState"=>"c75831bd-fad3-4191-9a66-280a48528679"
		];
		$data_string = json_encode($data);
		// Calling http_build_query is important to get the data formatted as expected.
		//$data_string = json_encode($data);
		$body = http_build_query($data);
		error_log("Request body: ".$body);
		//$curl = curl_init(self::$authority.self::$tokenUrl);
		$curl = curl_init("https://outlook.office.com/api/v2.0/me/subscriptions");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
		curl_setopt($curl , CURLOPT_HTTPHEADER, [
			'Content-Type: application/json',
			'Content-Length: ' . strlen($data_string)
		]);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		echo $response;
		error_log("curl_exec done.");
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		error_log("Request returned status ".$httpCode);
		if ($httpCode >= 400) return array('errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode);
		// Check error
		$curl_errno = curl_errno($curl);
		$curl_err = curl_error($curl);
		if ($curl_errno) {
			$msg = $curl_errno.": ".$curl_err;
			error_log("CURL returned an error: ".$msg);
			return array('errorNumber' => $curl_errno,'error' => $msg);
		}
		curl_close($curl);
		echo array('errorNumber' => $curl_errno,'error' => $msg);
		echo "KLAAR";
		return $json_vals;
	}
	public static function subscribe1() {
		global $accessToken,$refreshToken,$accountEmail,$accountId;
		// Build the form data to post to the OAuth2 token endpoint
		$token_request_data = array(
			"@odata.type"=>"#Microsoft.OutlookServices.PushSubscription",
			"Resource"=>"https://outlook.office.com/api/v2.0/me/events",
			"NotificationURL"=>$GLOBALS[MSE]->redirectUri,
			"ChangeType"=>"Created",
			"ClientState"=>"c75831bd-fad3-4191-9a66-280a48528679"
		);
		$token_request_data = array(
			"grant_type" => "authorization_code",
			"code" => $authCode,
			"redirect_uri" => $GLOBALS[MSE]->redirectUri,
			"scope" => implode(" ", self::$scopes),
			"client_id" => $GLOBALS[MSE]->clientId,
			"client_secret" => $GLOBALS[MSE]->clientSecret
		);
		// Calling http_build_query is important to get the data formatted as expected.
		$token_request_body = http_build_query($token_request_data);
		error_log("Request body: ".$token_request_body);
		$curl = curl_init(self::$authority."/api/v2.0/me/subscriptions");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $token_request_body);
		//curl_setopt($curl, CURLOPT_CAINFO, $_SERVER['DOCUMENT_ROOT'] . "/../cert/aliconnect_nl/aliconnect_nl.pfx");
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		echo $response;
		echo "KLAAR";
	}
	public static function validationtoken($token) {
		global $accessToken,$refreshToken,$accountEmail,$accountId;
		$q="UPDATE om.graph SET mse_validation_token = '$token'";
		aim()->query($q);
		// Build the form data to post to the OAuth2 token endpoint
		$token_request_data = array(
			"@odata.context"=>"https://outlook.office.com/api/v2.0/$metadata#Me/Subscriptions/$entity",
			"@odata.type"=>"#Microsoft.OutlookServices.PushSubscription",
			"@odata.id"=>"https://outlook.office.com/api/v2.0/Users('ddfcd489-628b-7d04-b48b-20075df800e5@1717622f-1d94-c0d4-9d74-f907ad6677b4')/Subscriptions('Mjk3QNERDQQ==')",
			"Id"=>"Mjk3QNERDQQ==",
			"Resource"=>"https://outlook.office.com/api/v2.0/me/events",
			"ChangeType"=>"Created, Missed",
			"ClientState"=>"c75831bd-fad3-4191-9a66-280a48528679",
			"NotificationURL"=>$GLOBALS[MSE]->redirectUri,
			"SubscriptionExpirationDateTime"=>"2016-03-05T22:00:00.0000000Z"
		);
		// Calling http_build_query is important to get the data formatted as expected.
		$token_request_body = http_build_query($token_request_data);
		error_log("Request body: ".$token_request_body);
		$curl = curl_init(self::$authority."/api/v2.0/me/subscriptions");
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $token_request_body);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		echo $response;
		echo "KLAAR";
	}
  // public function login() {
  //   $loginurl = $this->getLoginUrl([
	// 		'state'=> isset($_SERVER['HTTP_REFERER']) ? base64_encode($_SERVER['HTTP_REFERER']) : 123456,
	// 	]);
	// 	// die($loginurl);
  //   header('Location: '.$loginurl);
  //   die();
  // }
  public function get() {
    if (!empty($_GET['code'])) {
      // debug(base64_decode($_GET['state']));
      $this->getTokenFromAuthCode($_GET['code']);
      header('Location: /');
    }
    $path = explode('/graph',$_SERVER['REQUEST_URI'])[1];
    $this->getUserToken();

    $result = $this->makeApiCall("GET", self::$outlookApiUrl."/me/".$path);
    // debug($path,$result);

		// $result = $this->getFolder("calendarview",[
    //   "startDateTime"=>'2017-01-01T01:00:00',
    //   "endDateTime"=>'2020-03-31T23:00:00',
    //   "select"=>'Id,Subject,BodyPreview,HasAttachments',
    //   "top"=>100
    // ]);
    // debug($result);
		// $result = $graph->getFolder("contacts",array("select"=>'*',"top"=>10,"order"=>'LastModifiedDateTime DESC'));
		// if (!$result) die("<a href='$loginurl'>$loginurl</a>");
		return $result;

  }
}

$graph = new graph([
  // 'sub'=> isset($this->access['sub']) ? $this->access['sub'] : null,
  'client_id'=> $this->secret['graph']['client_id'],
  'client_secret'=> $this->secret['graph']['client_secret'],
  'scopes'=> [
    'openid',
    'offline_access',
    'profile',
    'email',

    // 'mail.readwrite',
    // 'calendars.readwrite',
    // 'contacts.readwrite',
    // 'people.read',
		// 'tasks.readwrite',

		// 'https://outlook.office.com/tasks.readwrite',
		// 'https://outlook.office.com/mail.readwrite',
		// 'https://outlook.office.com/calendars.readwrite',
		// 'https://outlook.office.com/contacts.readwrite',
		// 'https://outlook.office.com/people.read',

		'https://graph.microsoft.com/tasks.readwrite',
		'https://graph.microsoft.com/mail.readwrite',
    'https://graph.microsoft.com/calendars.readwrite',
    'https://graph.microsoft.com/contacts.readwrite',
    'https://graph.microsoft.com/people.read',

  ],
]);

switch ($request_path) {
	case '/login': {
		if (isset($_REQUEST['code'])) {
			$graph->getTokenFromAuthCode($_REQUEST['code'], $this->access["sub"]);
			//
			// $result = $graph->makeApiCall($_SERVER['REQUEST_METHOD'], $request_path.'?'.$_SERVER['QUERY_STRING']);
			// http_response(200, $result);
			//
			// http_response(200,1);
			exit ("<script>window.close();</script>");
		} else {
			http_response(200, [
				'redirect_uri'=> $graph->getLoginUrl([
					'state'=> base64_encode(json_encode(['ref'=>$_SERVER['HTTP_REFERER'],'sub'=>$this->access['sub']])),
				]),
			]);
		}
	}
}
$account = $this->sql_fetch_array($this->sql_query([
	"SELECT * FROM aliconnect.dbo.graph WHERE uid = ?",
],[
  $this->access["sub"],
]));
if (!$account) {
  http_response(200, [
    'redirect_uri'=> $graph->getLoginUrl([
      'state'=> base64_encode(json_encode(['ref'=>$_SERVER['HTTP_REFERER'],'sub'=>$this->access['sub']])),
    ]),
  ]);
}
$graph->access_token = $account['access_token'];
// http_response(200, $_SERVER);
// http_response(200, $account);
// http_response(200, $request_path);
$url = $request_path.'?'.$_SERVER['QUERY_STRING'];
// http_response(200, [$url,$_SERVER['QUERY_STRING']]);
// http_response(200, $url);
$result = $graph->makeApiCall($_SERVER['REQUEST_METHOD'], $url);
http_response(200, $result);

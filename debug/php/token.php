<?php
require_once(__DIR__.'/aim.php');
require_once(__DIR__.'/account.php');
class token {
	public function __construct() {
		//header('Access-Control-Allow-Origin: '.implode("/",array_slice(explode("/",$_SERVER["HTTP_REFERER"]),0,3)));
		// header('Access-Control-Allow-Origin: *');
		// header('Access-Control-Allow-Methods: GET,POST');
		$this->client_secret = aim()->client_secret;
	}
	public function get () {
		if(isset($_GET['id_token'])) {
			$payload = json_decode(base64_decode(explode('.',$_GET['id_token'])[1]));
			$session = sqlsrv_fetch_object(aim()->query("SELECT sub FROM auth.session WHERE id=$payload->nonce"));
			if(!$session->sub || $session->sub != $payload->sub) throw new Exception('Unauthorized', 401);
			return null;
		}
		throw new Exception('Precondition Failed', 412);
	}
	public function refresh_token() {
		// debug(1);
		foreach (['client_id','refresh_token'] as $key) {
			if (empty($_POST[$key])) throw new Exception('Precondition Failed', 412);
		}
		$account = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[get] @HostName=%s",
			$_POST['client_id']
		));
		if (!$account) throw new Exception('Not Found', 404);
		if (empty($_POST['refresh_token'])) throw new Exception('Unauthorized', 401);
		$refresh_token = get_token($_POST['refresh_token'], $this->client_secret);
		// echo 'ss';debug($refresh_token);
		if (empty($refresh_token)) throw new Exception('Unauthorized', 401);
		$expires_in = ACCESS_TOKEN_EXPIRES_IN;
		return [
			'expires_in'=> $expires_in,
			'access_token'=> jwt_encode(array_replace($refresh_token, [
				'iat'=> time(),
				'exp'=> time() + $expires_in,
			]), $account->client_secret)
		];
	}
	public function authorization_code() {
		if (empty($_POST['client_id'])) throw new Exception('Precondition Failed', 412);
		// DEBUG: Uitgezet voor test
		// if (empty($_POST['client_secret'])) throw new Exception('Precondition Failed', 412);
		$request_client = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[get] @HostName=%s",
			$_POST['client_id']
		));
		if (empty($request_client)) {
			throw new Exception('Not Found', 404);
		}
		// DEBUG: Uitgezet voor test
		// if ($request_client->client_secret != strtoupper($_POST['client_secret'])) throw new Exception('Precondition Failed', 412);
		if (isset($_POST['refresh_token'])) {
			$_POST['code'] = $_POST['refresh_token'];
		}
		if (empty($_POST['code'])) {
			throw new Exception('Precondition Failed', 412);
		}
		if (empty($code = get_token($_POST['code'], $this->client_secret))) {
			throw new Exception('Unauthorized', 401);
		}
		$account = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[get] @hostName=%u, @accountName=%u",
      $request_client->clientId,
			// $code['aud'],
			$code['sub']
		));
		$scope_arr = explode(' ',urldecode($code['scope']));
    foreach ($scope_arr as $key) {
      // if (!strstr($key, '.')) {
        aim()->query(
          "EXEC [item].[attr] @itemId=$account->contactId, @name='$key', @userId=$account->accountId"
        );
      // }
    }
		// $attributes=[
		// 	// 'given_name'=>'given_name',
		// 	// 'family_name'=>'family_name',
		// 	// 'unique_name'=>'unique_name',
		// 	// 'name'=>'name',
		// 	// 'preferred_username'=>'preferred_username',
		// 	// 'email'=>'email',
		// 	// 'Email'=>'email',
		// 	'GivenName'=>'given_name',
		// 	'Surname'=>'family_name',
		// 	'MiddleName'=>'middle_name',
		// 	'NickName'=>'nickname',
		// 	'UserName'=>'preferred_username',
		// 	'EmailVerified'=>'email_verified',
		// 	'Gender'=>'gender',
		// 	'Birthday'=>'birthdate',
		// 	'HomePhones0'=>'phone_number',
		// 	'PhoneVerified'=>'phone_number',
		// 	'PhoneVerified'=>'phone_number_verified',
		// 	'HomeAddress'=>'address',
		// 	'modifiedDT'=>'updated_at'
		// ];
		// $response->id_token = array_fill_keys ($scope_arr, null);
		// DEBUG: Moet expires_in niet in de code, uitzoeken
		$code['expires_in'] = ACCESS_TOKEN_EXPIRES_IN;

		$iat = time();
		$exp_long = $iat + 365 * 24 * 60 * 60;
		$exp = $iat + $code['expires_in'];

		$response = [
			'expires_in'=> ACCESS_TOKEN_EXPIRES_IN,//$payload['expires_in'],
			// 'token_type'=> $payload['token_type'],
			'access_token'=> jwt_encode([
				// 'iss'=> 'login.aliconnect.nl',
				'iss'=> $account->client_name . '.aliconnect.nl',
        // 'client_id'=> (int)$account->client_id,
        'client_id'=> uid($account->client_id),
				'aud'=> id($account->client_id),
				'sub'=> $code['sub'],
				'scope'=> $code['scope'],
				'iat' => $iat,
				'exp' => $exp,
				'nonce' => $code['nonce']
				// 'sct'=> $account->client_secret,
			], $account->client_secret)
		];

		if (isset($code['nonce'])) {
			$id_token = [
        'aud' => $request_client->client_id,
        'exp' => $exp_long,
				'iat' => $iat,
				'iss'=> 'https://login.aliconnect.nl',
        'nonce' => $code['nonce'],
        'oid'=> $account->account_id,
        'oid'=> $account->contact_id,
        'sub'=> $code['sub'],
        'scope'=> $scope_arr,
        // 'contact_id' => $account->contact_id,
				// 'sct'=> aim()->client_secret,
			];
			foreach ($account as $key => $value) {
				foreach ($scope_arr as $scope) {
					if (strstr($key, $scope)) {
						$id_token[$key] = $value;
					}
				}
			}
			$response['id_token'] = jwt_encode($id_token, aim()->client_secret);
		}

		if (isset($_POST['access_type']) && $_POST['access_type'] === 'offline') {
			$response['refresh_token'] = jwt_encode([
				'iss'=> $account->client_name . '.aliconnect.nl',
				'client_id'=> (int)$account->client_id,
				'aud'=> (int)$account->clientId,
				'sub'=> $code['sub'],
				'scope'=> $code['scope'],
				'iat' => $iat,
				'exp' => $exp_long,
				'nonce' => $code['nonce']
			], $this->client_secret);
		}
    // debug(1);
		header('Content-Type: application/json');
		die (json_encode($response));
	}
	public function post () {
    // return;
		if (isset($_POST['grant_type'])) return $this->{$_POST['grant_type']}();
	}
}
$app = new token();
$method = $_SERVER['REQUEST_METHOD'];
$app->$method();

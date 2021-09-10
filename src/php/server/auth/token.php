<?php
namespace Aliconnect\Server\Auth;

use \Aliconnect\Api;
use \Aliconnect\Jwt as Jwt;
use function \Aliconnect\http_response;

class Token extends \Aliconnect\Api {
  // public function init() {
  //   // $res = aim_query('SELECT 1 AS A');
  //   // $row = sqlsrv_fetch_object($res);
  //   // $res = aim_query('SELECT 2 AS A');
  //   // $row1 = sqlsrv_fetch_object($res);
  //   // debug('ba', $row, $row1);
  // }
  public function get() {
    $request_type = $this->request('response_type');
    switch ($request_type) {
      case 'id_token': {
        $headers = array_change_key_case(getallheaders(), CASE_LOWER);
        $authorization = $this->request('authorization', $headers);
        $access_token = trim(strstr($authorization, ' '));
        http_response(200, [
          'id_token'=> $access_token,
        ]);
      }
      case 'token': {
        $jwt = new Jwt;
        $jwt->secret($this->secret['client_secret']);
        http_response(200, [
          'access_token' => $jwt->set($_GET)->get()
        ]);
        // echo $this->jwt->valid();
      }
    }
  }
  public function get1 () {
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
	public function post () {
    switch ($this->grant_type) {
      case 'authorization_code': {
        $this->request('client_id');
        $account = new \Aim\Account([
          "hostName"=>$this->client_id,
        ]);
        if (empty($account)) {
    			throw new \Exception('Not Found', 404);
    		}
    		// DEBUG: Uitgezet voor test
        // $this->require('client_secret'); // DEBUG:
    		// if ($request_client->client_secret != strtoupper($_POST['client_secret'])) throw new Exception('Precondition Failed', 412);

    		if ($this->refresh_token) {
    			$this->code = $_POST['refresh_token'];
    		}
        $this->request('code');
        $jwt = new \Aim\Jwt($this->code, $account->client_secret);
        if (empty($jwt->not_expired)) http_response(408, 'Expired token');
        if (empty($jwt->valid)) http_response(401, 'Invalid token');
        // debug($jwt);
        $account = new \Aim\Account([
          "hostname"=>$this->client_id,
          "accountname"=>$jwt->payload['sub'],
        ]);

        // debug(1, $jwt->payload['sub'], $account);

        // $scope_arr = explode(' ',urldecode($code['scope']));

        // debug(1, $account, $jwt);
        // foreach ($scope_arr as $key) {
        //   // if (!strstr($key, '.')) {
        //     aim()->query(
        //       "EXEC [item].[attr] @itemId=$account->contactId, @name='$key', @userId=$account->accountId"
        //     );
        //   // }
        // }
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
    		// $code['expires_in'] = ACCESS_TOKEN_EXPIRES_IN;
        //
    		// $iat = time();
    		// $exp_long = $iat + 365 * 24 * 60 * 60;
    		// $exp = $iat + $jwt->payload['expires_in'];
        //
    		$response = [
    			'expires_in'=> 3600,
    			// 'token_type'=> $payload['token_type'],
          'access_token'=> $this->token($account, 3600, [
            'token_type' => 'Bearer',
            'aud' => $account->clientId,
            'sub'=> $account->accountId,
            'scope'=> $jwt->payload['scope'],
            'nonce' => strtolower($jwt->payload['nonce']),
          ]),
    		];

    		// if (!empty($jwt->payload['nonce'])) {
    			// $id_token = [
          //   'aud' => $request_client->client_id,
          //   'exp' => $exp_long,
    			// 	'iat' => $iat,
    			// 	'iss'=> 'https://login.aliconnect.nl',
          //   'nonce' => $code['nonce'],
          //   'oid'=> $account->account_id,
          //   'oid'=> $account->contact_id,
          //   'sub'=> $code['sub'],
          //   'scope'=> $scope_arr,
          //   // 'contact_id' => $account->contact_id,
    			// 	// 'sct'=> aim()->client_secret,
    			// ];
    			// foreach ($account as $key => $value) {
    			// 	foreach ($scope_arr as $scope) {
    			// 		if (strstr($key, $scope)) {
    			// 			$id_token[$key] = $value;
    			// 		}
    			// 	}
    			// }
    			$response['id_token'] = $this->token($account, 365 * 24 * 60 * 60, array_filter([
            'sub'=> $account->accountId,
            // 'oid'=> $account->contactId,
            'nonce' => strtolower($jwt->payload['nonce']),
            'account_id'=> $account->account_uid,
            'accountname'=> $account->accountname,
            'name'=> $account->name,
            'email'=> $account->email ?: $account->email_verified,
            'email_verified'=> $account->email_verified,
            'phone_number'=> $account->phone_number,
            'phone_number_verified'=> $account->phone_number_verified,
            'preferred_username'=> $account->preferred_username,
            'nickname'=> $account->nickname,
            'given_name'=> $account->given_name,
            'middle_name'=> $account->middle_name,
            'family_name'=> $account->family_name,
            'unique_name'=> $account->unique_name,
          ]));
    		// }

    		if ($this->access_type === 'offline') {
    			$response['refresh_token'] = $this->token($account, 365 * 24 * 60 * 60, [
    				'aud'=> $account->clientId,
    				'sub'=> $jwt->payload['sub'],
    				'scope'=> $jwt->payload['scope'],
            'nonce' => strtolower($jwt->payload['nonce']),
    			]);
    		}
        http_response(200, $response);
      }
    }
		if (isset($_POST['grant_type'])) return $this->{$_POST['grant_type']}();
	}
}

<?php
namespace Aliconnect\Server;

// use Aliconnect\Aim;
use Aliconnect\Jwt;
use function Aliconnect\aim;
// use function Aliconnect\sql_query;
// use function Aliconnect\sql_exec_string;
// use function Aliconnect\http_response;

class Account {
  public function __construct($options) {
    $this->init($options);
  }
  public function init($options = null) {
    $options = array_intersect_key((array)$options, array_flip([
      'client_id',
      'accountname',
      'phone_number',
      'password',
      'ip',
      'code',
      'redirect_uri',
      'nonce',
    ]));
    // aim()->http_response(200, $options);
    return $this->data = sqlsrv_fetch_object(aim()->sql_query(aim()->sql_exec_string("account.get", $options)));
  }
  public function __get($property) {
    if (isset($this->data->$property)) {
      return $this->data->$property;
    }
  }
  public function __set($property, $value) {
    if (isset($this->data->$property)) {
      $this->data->$property = $value;
    }
    else {
      $this->$property = $value;
    }
  }

  public function token ($expires_in, $options) {
    return (new Jwt)->get(array_merge([
      // 'iss'=> 'https://login.aliconnect.nl',
      'iss'=> $_SERVER['HTTP_HOST'],
      'client_id' => $this->client_id,
      'exp' => time() + $expires_in,
      'iat' => time(),
    ], $options), $this->client_secret);
  }




  public function get_id_token() {
    return (new Jwt)->get([
			'iss' => $_SERVER['SERVER_NAME'],//'login.aliconnect.nl',//aim::$access[iss],//'https://aliconnect.nl', //  Issuer, 'https://aliconnect.nl'
			'sub' => $this->account_id, // Subject, id of user or device
			// 'scrt'=> aim()->secret['config']['aim']['client_secret'],
			// 'azp' => 3666126,//self::$config->clientid, // From config.json
			'client_id'=> $this->client_id,
			'nonce' => $this->nonce, // Value used to associate a Client session with an ID Token, must be verified

			'email' => $this->email,
			'email_verified' => $this->email_verified,
			'phone_number_verified' => $this->phone_number_verified,
			'phone_number' => $this->phone_number,
			'preferred_username' => $this->preferred_username, // Shorthand name by which the End-User wishes to be referred to
			'name' => $this->name, // Fullname
			'nickname' => $this->nickname, // Casual name
			'given_name' => $this->given_name, // Given name(s) or first name(s)
			'middle_name' => $this->middle_name, // Middle name(s)
			'family_name' => $this->family_name, // Surname(s) or last name(s)
			'unique_name' => $this->unique_name, // Not part of JWT

			'auth_time' => time(), // Time when the authentication occurred
			'exp' => time() + 3600, // Expiration Time
      'iat' => time(), // Issued At
			// 'name' => $account->name ?: $account->AccountName ?: trim($account->given_name . ' ' . $account->family_name) ?: $account->preferred_username ?: $account->unique_name,
		]);
  }

  public function get () {
    http_response(200);
  }
  public function post () {
    http_response(200);
  }
  public function patch () {
    http_response(200);
  }
  public function delete () {
    http_response(200);
  }
  public function scope () {
    http_response(200);
  }
  public function scope_delete () {
    http_response(200);
  }
}

<?php
namespace Aliconnect\Server\Auth;

use Aliconnect\Aim;
use Aliconnect\Server\Account;
use function Aliconnect\get_real_user_ip;
use function Aliconnect\attr;
use function Aliconnect\http_response_post;

// die('a');

class OAuth extends Aim {
  // public function __construct() {
  //   die('eee');
  // }

  // public function init() {
  //   // debug(2);
  //   // // http_response_code(500);
  //   // $this->init_config();
  //   // debug(1);
  //
  //   // throw new \Exception('Division by zero.');
  //   // $res = new Dms\Sql('SELECT 1 AS A');
  //   // $row = sqlsrv_fetch_object($res);
  //   // connect('ja');
  //   // $res = aim_query('SELECT 1 AS A');
  //   // $row = sqlsrv_fetch_object($res);
  //   // $res = aim_query('SELECT 2 AS A');
  //   // $row1 = sqlsrv_fetch_object($res);
  //   // debug('ba', $row, $row1);
  // }
  public function get_nonce() {
    if (isset($_REQUEST['keep_loggedin'])) {
      if (empty($_COOKIE['nonce'])) {
        session_start();
        setcookie(session_name(),session_id(),time() + 365 * 24 * 60 * 60);
        $row = sqlsrv_fetch_object(aim()->sql_query("SELECT lower(newid()) AS nonce"));
        setcookie('nonce', $_COOKIE['nonce'] = $row->nonce, [
          'path'=> '/',
          'domain'=> 'login.aliconnect.nl',
          'secure'=> true,
          'httponly'=> false,
          'samesite'=> 'Lax',
          'expires'=> time() + 30 * 24 * 60 * 60,
        ]);
      }
      return $_COOKIE['nonce'];
    }
    else if (isset($_COOKIE['nonce'])){
      return;
      setcookie('nonce', $_COOKIE['nonce'] = null, [
        'path'=> '/',
        'domain'=> 'login.aliconnect.nl',
        'secure'=> true,
        'httponly'=> false,
        'samesite'=> 'Lax',
        'expires'=> time() - 3600,
      ]);
    }
  }
  public function add_nonce($account) {
    if ($nonce = $this->get_nonce()) {
      $this->attr($account->accountId, 'nonce', $nonce, ['max'=>9999,'hostId'=>1,'userId'=>$account->accountId]);
      $this->attr($account->accountId, 'ip', $_REQUEST['ip'], ['max'=>9999,'hostId'=>1]);
    }
  }

  // private function response_code($scope) {
  //   return (new \Aim\Jwt)->get([
  //     'expires_in' => 200,
  //     'token_type' => 'Bearer',
  //     'access_type' => 'offline',
  //     'client_id' => $this->account->client_id,
  //     'aud' => $this->account->clientId,
  //     'sub' => $this->account->accountId,
  //     'scope' => $scope,
  //     'nonce' => $this->nonce,
  //     'exp' => $this->time + 120,
  //     'iat' => $this->time,
  //     // 'azp' => (int)$account->ClientID, // From config.json
  //   ], $this->client_secret);
  // }
  //
  public function get () {
    $_GET = array_replace([
      'response_type'=>'code',
      'prompt'=>'login',
    ], $_GET);
    die(header("Location: /?".http_build_query($_GET)));
  }
  public function post () {
    // debug(1);
    // $this->init_path();

    $_REQUEST['ip'] = $this->ip = get_real_user_ip();
    $_REQUEST['nonce'] = empty($_COOKIE['nonce']) ? null : $_COOKIE['nonce'];

    $prompt = $this->request('prompt', $_GET);
    $response_type = $this->request('response_type', $_GET);
    $redirect_uri = attr('redirect_uri', $_GET);
    $scope = $this->request('scope', $_GET);

    if (isset($_POST['g_csrf_token'])) {
      if (isset($_COOKIE['g_csrf_token']) && $_COOKIE['g_csrf_token'] === $_POST['g_csrf_token']) {
        $CLIENT_ID = "916030731619-t989crc0f9ilh9kvoivapg7216gijtcb.apps.googleusercontent.com";
        $id_token = $_POST['credential'];

        require_once '../vendor/autoload.php';

        $client = new Google_Client(['client_id' => $CLIENT_ID]);  // Specify the CLIENT_ID of the app that accesses the backend

        // Onderstaande is nodig omdat er anders een SSL controle fout ontstaat
        // Uncaught GuzzleHttp\Exception\RequestException: cURL error 60: SSL certificate problem
        $guzzleClient = new \GuzzleHttp\Client(array( 'curl' => array( CURLOPT_SSL_VERIFYPEER => false, ), ));
        $client->setHttpClient($guzzleClient);
        $payload = $client->verifyIdToken($id_token);
        // die(json_encode($payload, JSON_PRETTY_PRINT));
        if ($payload) {

          $_REQUEST['accountname'] = $payload['email'];
          $account = $this->get_account($_REQUEST);

          // $userid = $payload['sub'];
          $this->debug(0, $payload, $_REQUEST, $_COOKIE);
          $this->error(200, 'Alles OK U wordt ingelogt');


          // If request specified a G Suite domain:
          //$domain = $payload['hd'];
        } else {
          // Invalid ID token
          $this->error(401, 'B');
          // $this->debug(1, $_POST, $_GET, $_COOKIE);
        }
      }
      $this->error(401, 'A');
    }

    if ($this->accountname) {
      $keep_loggedin = isset($_REQUEST['keep_loggedin']);
      $account = new Account($_REQUEST);
      // $account = $this->get_account($_REQUEST);
      // debug(2, $account);

      $chapters = [];

      if ($prompt === 'email_code' || $prompt === 'set_password') {
        if (!$account->code_ok) {
          http_response_post([
            'msg'=>'Verkeerde code. <a href="#?prompt=send_email_code">Stuur nieuwe code</a>'
          ]);
        }
        $time = strtotime($account->code_ok);
        if ($time - time() < -120) {
          http_response_post([
            "msg"=>"code verlopen, vraag nieuwe code aan"
          ]);
        }
        $this->attr($account->accountId, 'email_verified', $account->email_verified = $account->accountname);
        $this->add_nonce($account);
        $account = $this->get_account($_REQUEST);
        if ($prompt === 'set_password' && aim_get('password')) {
          $this->attr($account->accountId, 'password', $code = rand(10000,99999), ['encrypt' => 1]);
        } else {
          if ($account->password_ok === null) {
            http_response_post([
              "prompt"=>"set_password",
              "msg"=>"geen wachtwoord, voer in"
            ]);
          }
        }
        $this->attr($account->accountId, 'code', null);
        unset($_POST['code']);
      }

      if ($account->password_ok === 0) {
        if ($prompt === 'password') {
          http_response_post([
            'msg'=>'Verkeerd wachtwoord'
          ]);
        }
        http_response_post([
          'prompt'=>'password'
        ]);
      }

      if ($prompt === 'send_email_code') {
        $this->attr($account->accountId, 'code', $code = rand(10000,99999));
        $this->mail([
          'to'=> $accountname,
          'bcc'=> 'max.van.kampen@alicon.nl',
          'chapters'=> [["title"=>"code $code"]],
        ]);
        http_response_post([
          'prompt'=>'email_code'
        ]);
      }

      if (!$account->email_verified || $account->email_verified !== $account->accountname || $account->password_ok === null) {
        http_response_post([
          'prompt'=>'send_email_code'
        ]);
      }
      if ($prompt === 'phone_number' && !empty($_REQUEST['phone_number'])) {
        $this->attr($account->accountId, 'phone_number', phone_number($_REQUEST['phone_number']));
        $account = $this->get_account($_REQUEST);
      }

      if (!$account->phone_number) {
        http_response_post([
          "prompt"=>"phone_number",
          "msg"=>"geen mobiel nummer, voer in"
        ]);
      }

      if ($prompt === 'sms_code') {
        if (!$account->code_ok) {
          http_response_post([
            'msg'=>'verkeerde code'
          ]);
        }
        $time = strtotime($account->code_ok);
        if ($time - time() < -1200) {
          http_response_post([
            "msg"=>"code verlopen, vraag nieuwe code aan"
          ]);
        }

        $this->add_nonce($account);
        $this->attr($account->accountId, 'code', null);
        unset($_REQUEST['code']);
        // $this->debug($_COOKIE, $account);
        if ($account->phone_number_verified != $account->phone_number) {
          $this->attr($account->accountId, 'phone_number_verified', $account->phone_number_verified = $account->phone_number);
        }
      }
      else if ($prompt === 'send_sms_code') {
        $this->attr($account->accountId, 'code', $code = rand(10000,99999));
        // $this->sms('+'.$account->phone_number, __('sms_code_content', $code), __('sms_code_subject'));
        $this->sms('+'.$account->phone_number, 'sms_code_content = ' . $code, __('sms_code_subject'));
        http_response_post([
          'prompt'=>'sms_code'
        ]);
      }
      else if (!$account->nonce) {
        if ($account->phone_number && $account->phone_number_verified) {
          http_response_post([
            'prompt'=>'send_sms_code'
          ]);
        } else {
          http_response_post([
            'prompt'=>'send_email_code'
          ]);
        }
      }
      if ($account->phone_number !== $account->phone_number_verified) {
        http_response_post([
          'prompt'=>'send_sms_code'
        ]);
      }

      if ($account->ip != $this->ip) {
        $this->mail_message_to($account->email_verified, [
          'title'=>"Aliconnect aanmelding op nieuwe locatie",
          'content'=>"Aliconnect aanmelding op nieuwe locatie: $this->ip",
        ]);
        $this->attr($account->accountId, 'ip', $this->ip, ['max'=>999]);
      }
      $this->add_nonce($account);
      // $this->debug($_COOKIE);
      // $this->debug($options, $account,$_REQUEST);
    }

    switch($prompt) {
      case 'accept': {
        // if (isset($_POST['accept'])) {
        // $accept = $this->request('accept', $_POST);
        if ($this->accept === 'allow') {
          $scope_accepted = [];
          foreach ($_POST as $key => $value) {
            if ($value === 'on') {
              $scope_accepted[] = str_replace('_','.',$key);
            }
          }
          $scope_accepted = implode(' ',$scope_accepted);
          // debug(1, $this->scope, $account->scope_accepted);
          $this->attr($account->accountId, 'scope_accepted', $scope_accepted, ['hostId' => $account->clientId]);
          if ($response_type === 'code') {
            $redirect_uri = $redirect_uri.'?'.http_build_query([
              'code' => $this->token($account, 120, [
                'token_type' => 'Bearer',
                'access_type' => 'offline',
                'aud' => $account->clientId,
                'sub' => $account->accountId,
                'scope' => $scope_accepted,
                'nonce' => strtolower($account->nonce),
              ]),
              'state'=> $this->state,
            ]);
          }
          if ($response_type === 'token') {
            $redirect_uri = $redirect_uri.'?'.http_build_query([
              'token' => $this->token($account, 3600, [
                'token_type' => 'Bearer',
                'aud' => $account->clientId,
                'sub' => $account->accountId,
                'scope' => $scope_accepted,
                'nonce' => strtolower($account->nonce),
              ]),
              'state'=> $this->state,
            ]);
          }
          http_response_post([
            'id_token' => $account->get_id_token(),
            'nonce' => strtolower($account->nonce),
            'socket_id' => $this->socket_id,
            'url' => $redirect_uri,
          ]);
        }
        // }
        else if ($this->accept === 'deny') {

        } else {
          $request_scopes = explode(' ', $this->scope);
          $scopes = $request_scopes;
          $properties = array_map(function($scope){return [
            'name'=> $scope,
            'format'=> 'checkbox',
            'checked'=> 1,
          ];}, $scopes);

          http_response(200, [
            'properties'=> $properties,
            // 'description'=> "For application $applicatie_item->name<br>Company data $host_item->title",
            'description'=> "For application TEST",
          ]);
        }
      }
      default: {
        http_response_post([
          'prompt'=>'accept'
        ]);
      }
    }
    switch($response_type) {
      case 'code': {
        if ($prompt !== 'consent' && $account->scope_accepted === $this->scope) {
          http_response_post([
            'id_token'=>$account->get_id_token(),
            'nonce'=>$account->nonce,
            'socket_id'=>$_GET['socket_id'],
            'url'=>$this->redirect_uri.'?'.http_build_query([
              'code'=> $this->response_code(),
              'state'=> aim_get('state'),
            ])
          ]);
        }
        if ($prompt !== 'accept') {
          http_response_post([
            'prompt'=>'accept'
          ]);
        }

        if (isset($_POST['accept'])) {
          $accept = $this->request('accept', $_POST);
          if ($accept === 'allow') {
            $scope_accepted = [];
            foreach ($_POST as $key => $value) {
              if ($value === 'on') {
                $scope_accepted[] = $key;
              }
            }
            $scope_accepted = preg_replace(
              // '/(_)(read|write|add)/i', '.$2', implode(' ',$scope_accepted)
              '/_/', '.', implode(' ',$scope_accepted)
            );
            // debug(1, $this->scope, $account->scope_accepted);
            $this->attr($account->accountId, 'scope_accepted', $scope_accepted, ['hostId'=>$account->clientId]);
            http_response_post([
              'id_token' => $account->get_id_token(),
              'nonce' => $this->nonce,
              'socket_id' => $this->socket_id,
              'url' => $redirect_uri.'?'.http_build_query([
                'code' => (new \Aim\Jwt)->get([
                  'expires_in' => 200,
                  'token_type' => 'Bearer',
                  'access_type' => 'offline',
                  'client_id' => $account->client_id,
                  'aud' => $account->clientId,
                  'sub' => $account->accountId,
                  'scope' => $scope_accepted,
                  'nonce' => $this->nonce,
                  'auth_time' => time(), // Time when the authentication occurred
                  'exp' => time() + 120, // Expiration Time
                  'iat' => time(), // Issued At
                  // 'azp' => (int)$account->ClientID, // From config.json
                ], $this->client_secret),
                'state'=> $this->state,
              ])
            ]);
          }
        }
      }
      case 'token': {
        http_response(200);
        // if (empty($_REQUEST['accept'])) {
        //   $this->http_response_post(['prompt'=>'accept']);
        // }
        if ($_REQUEST['prompt'] !== 'accept') {
          http_response_post(['prompt'=>'accept']);
        }
        $this->init_path(); // Load path parameters, before config
        $client_id = $this->request('client_id'); // get REQUEST client_id

        $applicatie_item = sqlsrv_fetch_object($this->sql_query(
          "SELECT id,name,hostId,classId FROM item.vw WHERE uid=%s",$client_id
        ));

        $host_item = sqlsrv_fetch_object($this->sql_query(
          "SELECT lower(uid)client_id, id,hostId,header0 title,classId FROM item.vw WHERE id=%s",$applicatie_item->hostId
        ));
        $scope = $this->request('scope');
        $request_scopes = explode(' ', $scope);

        // $this->debug($account->accountId, $applicatie_item->hostId);

        $granted_scopes = $this->get_granted_scopes($applicatie_item->hostId, $account->accountId);
        $scopes = array_values(array_intersect($request_scopes, $granted_scopes));
        // $this->debug($scopes);
        $properties = array_map(function($scope){return [
          'name'=> $scope,
          'format'=> 'checkbox',
          'checked'=> 1,
        ];},$scopes);
        if (empty($_REQUEST['accept'])) {
          $this->reply_json([
            'properties'=> $properties,
            'description'=> "For application $applicatie_item->name<br>Company data $host_item->title",
          ]);
        }

        $scopes = [];
        foreach ($_POST as $key => $value) {
          if ($value === 'on') {
            $scopes[] = str_replace('_','.',$key);
          }
        }

        // $this->debug($host_item->client_id, $_POST, $_REQUEST);

        $redirect_uri = $this->request('redirect_uri');
        $state = $this->request('state');
        $scope = implode(' ', $scopes);

        $config = $this->init_config($host_item->client_id); // Load config into $this->config
        $auth = $this->request('auth', $config);
        $auth_redirect_uri = $this->request('redirect_uri', $auth);
        $this->check(in_array($redirect_uri, $auth_redirect_uri), 400, 'Invalid redirect_uri');
        $jwt = new jwt();
        $config_secret = $this->init_client_config_secret($host_item->client_id);
        // $this->debug($config_secret);
        $client_secret = $this->request('client_secret', $config_secret);
        $jwt->secret($client_secret);
        $url = parse_url($redirect_uri);


        $jwt->set([
          "scope"=> $scope,
          "client_id"=> $host_item->client_id,
          "sub"=> $account->accountId,
          // "iss"=> $url['scheme']."://".$url['host'],
        ]);
        $url = $redirect_uri."?".http_build_query([
          "access_token"=>$jwt->get(),
          "state"=>$state,
        ]);
        // die($url);
        http_response_post(['url'=>$url]);

        error(201, null, 'a', $client);
        error(201, null, $url);
        // die(header("Location: $url"));
        //
      }
    }
  }
}

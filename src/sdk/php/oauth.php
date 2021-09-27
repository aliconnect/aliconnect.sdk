<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once(__DIR__.'/aim.php');

class oauth extends aim {
  public function reply_post($arr) {
    $this->reply_json(array_replace($_POST, $arr));
  }
  public function get_nonce() {
    if (isset($_REQUEST['keep_loggedin'])) {
      if (empty($_COOKIE['nonce'])) {
        session_start();
        setcookie(session_name(),session_id(),time() + 365 * 24 * 60 * 60);
        $row = sqlsrv_fetch_object(aim()->query("SELECT newid() AS nonce"));
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
  public function get_account($options) {
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
    return sqlsrv_fetch_object($this->query(get_sql_exec("[account].[get]", $options)));
  }
  //
	public function init_oauth () {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
      $_GET = array_replace([
        'response_type'=>'code',
        'prompt'=>'login',
      ], $_GET);
      die(header("Location: /?".http_build_query($_GET)));
      die();
    }
    $this->init_path();

    $_REQUEST['ip'] = $this->ip = GetRealUserIp();
    $_REQUEST['nonce'] = empty($_COOKIE['nonce']) ? null : $_COOKIE['nonce'];

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
    if (isset($_REQUEST['accountname'])) {
      $prompt = $this->request('prompt');
      $keep_loggedin = isset($_REQUEST['keep_loggedin']);
      $account = $this->get_account($_REQUEST);
      $chapters = [];

      // if ($prompt === 'login') {
      //   $this->debug($_COOKIE, $account->nonce, $account);
      // }

      if ($prompt === 'email_code' || $prompt === 'set_password') {
        if (!$account->code_ok) {
          $this->reply_post([
            'msg'=>'Verkeerde code. <a href="#?prompt=send_email_code">Stuur nieuwe code</a>'
          ]);
        }
        $time = strtotime($account->code_ok);
        if ($time - time() < -120) {
          $this->reply_post([
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
            $this->reply_post([
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
          $this->reply_post([
            'msg'=>'Verkeerd wachtwoord'
          ]);
        }
        $this->reply_post([
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
        $this->reply_post([
          'prompt'=>'email_code'
        ]);
      }

      if (!$account->email_verified || $account->email_verified  !== $account->accountname || $account->password_ok === null) {
				$this->reply_post([
          'prompt'=>'send_email_code'
        ]);
      }
      if ($prompt === 'phone_number' && !empty($_REQUEST['phone_number'])) {
        $this->attr($account->accountId, 'phone_number', phone_number($_REQUEST['phone_number']));
        $account = $this->get_account($_REQUEST);
      }

      if (!$account->phone_number) {
        $this->reply_post([
          "prompt"=>"phone_number",
          "msg"=>"geen mobiel nummer, voer in"
        ]);
      }

      if ($prompt === 'sms_code') {
        if (!$account->code_ok) {
          $this->reply_post([
            'msg'=>'verkeerde code'
          ]);
        }
        $time = strtotime($account->code_ok);
        if ($time - time() < -1200) {
          $this->reply_post([
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
        $this->sms('+'.$account->phone_number, __('sms_code_content', $code), __('sms_code_subject'));
        $this->reply_post([
          'prompt'=>'sms_code'
        ]);
      }
      else if (!$account->nonce) {
        if ($account->phone_number && $account->phone_number_verified) {
          $this->reply_post([
            'prompt'=>'send_sms_code'
          ]);
        } else {
          $this->reply_post([
            'prompt'=>'send_email_code'
          ]);
        }
      }
      if ($account->phone_number !== $account->phone_number_verified) {
        $this->reply_post([
          'prompt'=>'send_sms_code'
        ]);
      }

      if ($account->ip != $this->ip) {
        $chapters[] = [
          'title'=>"Aliconnect aanmelding op nieuwe locatie",
          'content'=>"Aliconnect aanmelding op nieuwe locatie: $this->ip",
        ];
        // debug(1, $prompt, $account->data);
        $this->attr($account->accountId, 'ip', $this->ip, ['max'=>999]);
      }
      if ($chapters) {
        $this->mail([
          // 'Subject'=> "Aliconnect aanmelding op nieuw systeem",
          'to'=> $account->email_verified,
          'bcc'=> 'max.van.kampen@alicon.nl',
          'chapters'=> $chapters,
        ]);
      }
      $this->add_nonce($account);

      // $this->debug($_COOKIE);
      // $this->debug($options, $account,$_REQUEST);
    }
    if (isset($_GET['response_type'])) switch($_GET['response_type']) {
      case 'token': {
        // if (empty($_REQUEST['accept'])) {
        //   $this->$this->reply_post(['prompt'=>'accept']);
        // }
        if ($_REQUEST['prompt'] !== 'accept') {
          $this->reply_post(['prompt'=>'accept']);
        }
        $this->init_path(); // Load path parameters, before config
        $client_id = $this->request('client_id'); // get REQUEST client_id

        $applicatie_item = sqlsrv_fetch_object($this->query(
          "SELECT id,name,hostId,classId FROM item.vw WHERE uid=%s",$client_id
        ));

        $host_item = sqlsrv_fetch_object($this->query(
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
        $this->reply_post(['url'=>$url]);

        error(201, null, 'a', $client);
        error(201, null, $url);
        // die(header("Location: $url"));
        //
      }
    }
	}
}

$aim = new oauth();
$aim->init_oauth();

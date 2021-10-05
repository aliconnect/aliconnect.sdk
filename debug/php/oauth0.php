<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once(__DIR__.'/aim.php');
require_once(__DIR__.'/account.php');

class oauth extends aim {
  public function reply_post($arr) {
    $this->reply_json(array_replace($_POST, $arr));
  }

  public function account($options) {
    $this->debug((array)$options);
  }

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

    if (empty($_REQUEST['nonce'])) {
      $prompt = $this->request('prompt');

      $accountname = $this->request('accountname');
      $client_id = $this->request('client_id');
      $account = sqlsrv_fetch_object($this->query(get_sql_exec("[account].[get]", [
        "accountname" => $accountname,
        "hostname" => $client_id,
      ])));
      // $this->debug($account,$_REQUEST);
      switch ($prompt) {
        case 'create_account': {
          // $this->account->create_account($_POST);
        }
        case 'login': {
          if (empty($account->accountId)) {
            $this->reply_post([
              "password"=>"",
              "msg"=>"Account bestaat niet. <a href='#?prompt=create_account'>Maak er een</a>"
            ]);
          }
          $this->attr($account->accountId, 'code', $code = rand(10000,99999));
          $this->mail([
            'to'=> $accountname,
            'bcc'=> 'max.van.kampen@alicon.nl',
            'chapters'=> [["title"=>"code $code"]],
          ]);



          $this->reply_post(['prompt'=>'password']);
        }
        case 'password': {
          $this->reply_post(['prompt'=>'accept']);
        }
        case 'email_code': {
        }
        case 'set_password': {
        }
        case 'send_email_code': {
          $this->attr($account->accountId, 'code', $code = rand(10000,99999));
          $this->mail([
            'to'=> $accountname,
            'bcc'=> 'max.van.kampen@alicon.nl',
            'chapters'=> [["title"=>"code $code"]],
          ]);
        }
      }
    }


    if (isset($_GET['response_type'])) switch($_GET['response_type']) {
      case 'token': {
        // if (empty($_REQUEST['accept'])) {
        //   $this->reply_post(['prompt'=>'accept']);
        // }
        if ($_REQUEST['prompt'] !== 'accept') {
          $this->reply_post(['prompt'=>'accept']);
        }
        $this->init_path(); // Load path parameters, before config
        $client_id = $this->request('client_id'); // get REQUEST client_id

        if (empty($_REQUEST['accept'])) {
          $applicatie_item = sqlsrv_fetch_object($this->query(
            "SELECT id,name,hostId,classId FROM item.vw WHERE uid=%s",$client_id
          ));
          $host_item = sqlsrv_fetch_object($this->query(
            "SELECT id,hostId,header0 title,classId FROM item.vw WHERE id=%s",$applicatie_item->hostId
          ));
          $scope = $this->request('scope');
          $scopes = explode(' ', $scope);
          $this->debug($_REQUEST);

          $res = $this->query(
            'SELECT * FROM attribute.dv WHERE nameId=2174 AND itemId=%d AND hostId=%d'
            ,$_GET['sub']
            ,$client->id
          );
          $scopes = [];
          $request_scopes = explode(' ', $_GET['scope']);
          while ($row = sqlsrv_fetch_object($res)) {
            foreach (explode(" ",$row->Value) as $grant_scope) {
              // $grant_scope = "$client->keyname.".$grant_scope;
              echo $grant_scope.PHP_EOL;
              foreach ($request_scopes as $request_scope) {
                if (strpos($grant_scope, $request_scope) === 0) {
                  $scopes[] = $grant_scope;
                }
              }
            }
            // $row_scopes = "$client->keyname.".implode(" $client->keyname.",explode(" ",$row->Value));

            // $scopes[] = "$client->keyname.".implode(" $client->keyname.",explode(" ",$row->Value));
          }
          $scope = implode(' ',array_unique($scopes));


          $this->reply_json([
            'properties'=> [
              'a'=> [
                'name'=> 'a',
                'format'=> 'checkbox',
                'checked'=> 1,
              ]
            ],
            'description'=> "For application $applicatie_item->name<br>Company data $host_item->title",
          ]);
          $this->debug($applicatie_item, $host_item);
        }




        $this->debug($_REQUEST);

        $redirect_uri = $this->request('redirect_uri');
        $state = $this->request('state');
        $scope = $this->request('scope');




        $config = $this->init_config($client_id); // Load config into $this->config
        $auth = $this->request('auth', $config);
        $auth_redirect_uri = $this->request('redirect_uri', $auth);
        $this->check(in_array($redirect_uri, $auth_redirect_uri), 400, 'Invalid redirect_uri');
        $jwt = new jwt();
        $config_secret = $this->init_client_config_secret($client_id);
        // $this->debug($config_secret);
        $client_secret = $this->request('client_secret', $config_secret);
        $jwt->secret($client_secret);
        $url = parse_url($redirect_uri);


        $jwt->set([
          "scope"=> $scope,
          "client_id"=> $client_id,
          "iss"=> $url['scheme']."://".$url['host'],
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

    // debug(1);

    //
    //
    //
    // $_POST['msg'] = '';
    // $this->scope = str_replace(',',' ',aim_get('scope'));
    // $this->url = parse_url($_SERVER['REQUEST_URI']);
    // $this->path = $this->url['path'];
    // if ($_SERVER['REQUEST_METHOD'] === 'GET' && $this->path !== '/') {
    //   die(header('Location: /?'.http_build_query($_GET)));
    // }
    // $this->time = time();
    // $this->redirect_uri = aim_get('redirect_uri');// ?: 'https://aliconnect.nl/';
    // // $this->client_name = 'aliconnect';
    // // if (isset($_GET['client_id'])) {
    // //   $this->client_name = $_GET['client_id'];
    // // } else if ($this->redirect_uri) {
    // //   $url = parse_url($this->redirect_uri);
    // //   $this->client_name = explode('.',$url['host'])[0] ?: 'aliconnect';
    // // }
    // // $this->client_secret = aim()->client_secret;
    // $this->mobile_browser = mobile_browser();
    // $_GET['ip'] = $this->ip = GetRealUserIp();
    //
    // $this->account = new account($_GET);

    // debug(aim_get('redirect_uri', (array)$this), $this->account->data);
	}
  private function redirect($aim_get) {
    die(header('Location: ?'.http_build_query(array_replace($_GET,$aim_get))));
  }
  private function response_code() {
		return jwt_encode([
      'expires_in' => ACCESS_TOKEN_EXPIRES_IN,
			'token_type' => 'Bearer',
			'access_type' => 'offline',
			'client_id' => $this->account->aim_get('client_id'),
			'aud' => $this->account->aim_get('clientId'),
			'sub' => $this->account->aim_get('accountId'),
			'scope' => $this->account->aim_get('scope'),
			'nonce' => aim_get('nonce'),
			'exp' => $this->time + 120,
			'iat' => $this->time,
			// 'azp' => (int)$account->ClientID, // From config.json
    ], $this->client_secret);
	}
	public function index() {
		// if (aim_get('prompt') === 'login_qr') {
		// 	// debug(2);
		// 	return;
		// }
		// // debug(1);
		// if (empty($_GET['redirect_uri']) || empty($_GET['response_type']) || empty($_GET['scope'])) {
		// 	die(header('Location: https://aliconnect.nl?prompt=login'));
		// }
		// if (aim_get('prompt') !== 'login') {
    //   die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    // }
	}
  public function get1() {



    // debug(aim_get('nonce'), $this->account->data);
    // debug(1);
    if (aim_get('prompt') === 'logout' && aim_get('nonce')) {
      aim()->query("UPDATE attribute.dt SET userId=NULL WHERE nameid=2181 AND value=%s", aim_get('nonce'));
      if ($redirect_uri = aim_get('redirect_uri')) {
        die(header("Location: $redirect_uri"));
      }
      return;
    }

    // debug($_GET);
    if (!$this->account->data->accountId && aim_get('prompt') !== 'login' && aim_get('prompt') !== 'consent') {
      $_GET['prompt'] = 'login';
      // debug($this->account->data);
      die(header("Location: ?".http_build_query($_GET)));
    }

    // debug($this->account->data);

    // debug(aim_get('client_id'));
    if (!aim_get('client_id')) {
      // die('missing client id');
      die(header('Location: https://aliconnect.nl'));
    }
    if ($this->redirect_uri && $this->redirect_uri != $this->account->data->redirect_uri) {
      // debug(1, $this->account->data, aim_get('nonce'));
      // die('redirect_uri is invalid'.$this->redirect_uri);
      // die(http_response_code(412));
    }
    if (aim_get('prompt') === 'login' && aim_get('nonce') && aim_get('response_type') === 'code') {
      $row = sqlsrv_fetch_object(aim()->query("SELECT * FROM attribute.dt WHERE nameid=2181 AND userId IS NOT NULL AND value=%s", aim_get('nonce')));
      if ($row) {
        $this->account->get_account(['sub'=>$row->ItemID]);
        if ($this->account->scope_accepted === $this->scope) {
          die(header("Location: $this->redirect_uri?".http_build_query([
            'code'=> $this->response_code(),
            'state'=> aim_get('state'),
          ])));
        }
      }
    }
    // debug(1);
    // debug(aim_get('response_type'), $this->account->data);
    // debug(2, $this->account->data, aim_get('nonce'));
		// if (!aim_get('prompt')) {
    //   die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    // }
    // $prompt=aim_get('prompt');
    // if (aim_get('response_type') === 'code') {
    //   if ($prompt !== 'login') {
    //     die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    //     // die(header("Location: $this->redirect_uri?".http_build_query(['code'=>$this->code])));
    //     // if ($this->inScope) {
    //     //   die(header("Location: $this->redirect_uri?".http_build_query(['code'=>$this->code])));
    //     // }
    //     // if ($this->prompt === 'login') {
    //     //   die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'accept']))));
    //     // }
    //   }
    // } else if (aim_get('prompt') !== 'login') {
    //   die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    // }
    // else {
    //   if ($this->prompt !== 'login') {
    //     die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    //   }
    // }
    // if (!$this->prompt) {
    //   die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    // }
    //
    //
    //
    // if ($this->id_token) {
    //   if ($this->response_type === 'code') {
    //     if ($this->inScope) {
    //       die(header("Location: $this->redirect_uri?".http_build_query(['code'=>$this->code])));
    //     }
    //     if ($this->prompt === 'login') {
    //       die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'accept']))));
    //     }
    //   }
    //   else {
    //     if ($this->prompt !== 'login') {
    //       die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    //     }
    //   }
    //   if (!$this->prompt) {
    //     die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    //   }
    // }
    // else {
    //   if ($this->prompt !== 'login') {
    //     die(header('Location: /?'.http_build_query(array_replace($_GET,['prompt'=>'login']))));
    //   }
    // }
	}
	public function post() {
    $prompt=aim_get('prompt');
    // debug($prompt,$_POST);
    $_POST['prompt'] = '';
    $account = $this->account;
    $chapters = [];

    if (aim_get('prompt') === 'mobile') {
      $this->account->get_account(aim()->access);
      $account->add_nonce();
      reply(
        $this->account->scope_accepted === $this->scope ? [
          'url'=> "$this->redirect_uri?" . http_build_query([
            'code'=> $this->response_code(),
            'state'=> aim_get('state'),
          ]),
        ] : [
          'reply'=> [
            'prompt'=> 'scope_accept',
            'param'=> $_GET,
          ]
        ],
      );
    }

    // controleer of gebruiker is ingelogt
    if (isset($_POST['request_type'])) {
      $this->account = new account(aim()->access);
      if (!$this->account->signin_ok) {
        die(http_response_code(401));
      }
      reply([]);
    }


    if (aim_get('accountname')) {
      $account->set_nonce();
      if (!$account->aim_get('account_id')) {
        if ($prompt === 'create_account') {
          $this->account->create_account($_POST);
        } else {
          // $a=json_encode($account, JSON_PRETTY_PRINT);
          // debug($account);
          reply_post([
            "password"=>"",
            "msg"=>"Account bestaat niet. <a href='#?prompt=create_account'>Maak er een</a>"
          ]);
        }
      }
      if ($prompt === 'email_code' || $prompt === 'set_password') {
				// debug(1, $account->data);
        if (!$account->code_ok) {
          reply_post([
            'msg'=>'Verkeerde code. <a href="#?prompt=send_email_code">Stuur nieuwe code</a>'
          ]);
        }
        $time = strtotime($account->code_ok);
        if ($time-$this->time < -120) {
          reply_post([
            "msg"=>"code verlopen, vraag nieuwe code aan"
          ]);
        }
				$account->email_verified = $account->accountname;
        $account->add_nonce();
        if ($prompt === 'set_password' && aim_get('password')) {
          $account->set_password(aim_get('password'));
        } else {
          if ($account->password_ok === null) {
            reply_post([
              "prompt"=>"set_password",
              "msg"=>"geen wachtwoord, voer in"
            ]);
          }
        }
        $account->code = null;
        unset($_POST['code']);
      }
			if ($account->password_ok === 0) {
        if ($prompt === 'password') {
          reply_post([
            'msg'=>'Verkeerd wachtwoord'
          ]);
        }
        reply_post([
          'prompt'=>'password'
        ]);
      }

      if ($prompt === 'send_email_code') {
        $account->set('code', $code = rand(10000,99999));
        aim()->mail([
          'to'=> aim_get('accountname'),
          'bcc'=> 'max.van.kampen@alicon.nl',
          'chapters'=> [["title"=>"code ".$code]],
        ]);
        reply_post([
          'prompt'=>'email_code'
        ]);
      }
      if (!$account->email_verified || $account->email_verified  !== $account->accountname || $account->password_ok === null) {
				reply_post([
          'prompt'=>'send_email_code'
        ]);
      }

      // debug($prompt, $account->data);
      if ($prompt === 'phone_number' && aim_get('phone_number')) {
        $account->phone_number = phone_number(aim_get('phone_number'));
      }
      if (!$account->phone_number) {
        reply_post([
          "prompt"=>"phone_number",
          "msg"=>"geen mobiel nummer, voer in"
        ]);
      }
      if ($prompt === 'sms_code') {
        if (!$code_ok = $account->code_ok) {
          reply_post([
            'msg'=>'verkeerde code'
          ]);
        }
        $time = strtotime($code_ok);
        if ($time-$this->time < -1200) {
          reply_post([
            "msg"=>"code verlopen, vraag nieuwe code aan"
          ]);
        }
        $account->add_nonce();
        $account->code = null;
        unset($_POST['code']);
        if ($account->phone_number_verified != $account->phone_number) {
          $account->phone_number_verified = $account->phone_number;
        }
      } else if ($prompt === 'send_sms_code') {
        $account->set('code', $code = rand(10000,99999));
        aim()->sms('+'.$account->phone_number, __('sms_code_content', $code), __('sms_code_subject'));
        reply_post([
          'prompt'=>'sms_code'
        ]);
      } else if (!$account->nonce) {
        if ($account->phone_number && $account->phone_number_verified) {
          reply_post([
            'prompt'=>'send_sms_code'
          ]);
        } else {
          reply_post([
            'prompt'=>'send_email_code'
          ]);
        }
      }
      if ($account->phone_number !== $account->phone_number_verified) {
        reply_post([
          'prompt'=>'send_sms_code'
        ]);
      }

      if ($account->ip != $this->ip) {
        $chapters[] = [
          'title'=>"Aliconnect aanmelding op nieuwe locatie",
          'content'=>"Aliconnect aanmelding op nieuwe locatie: $this->ip",
        ];
        // debug(1, $prompt, $account->data);
        aim()->setAttribute([
          'itemId'=>$account->accountId,
          'name'=>'ip',
          'value'=>$this->ip,
          'max'=>9999,
        ]);
      }
      if ($chapters) {
        aim()->mail([
          // 'Subject'=> "Aliconnect aanmelding op nieuw systeem",
          'to'=> $account->email_verified,
          'bcc'=> 'max.van.kampen@alicon.nl',
          'chapters'=> $chapters,
        ]);
      }
      $account->add_nonce();
    }

    if (!aim_get('accountname') && empty($account->access)) {
      reply_post([
        'prompt'=>'login',
        // 'a'=>$account
      ]);
    }


    if (aim_get('response_type') === 'code') {
			if ($prompt !== 'consent' && $account->aim_get('scope_accepted') === $this->scope) {
        reply_post([
          'id_token'=>$account->get_id_token(),
          'nonce'=>$account->aim_get('nonce'),
          'socket_id'=>$_GET['socket_id'],
          'url'=>$this->redirect_uri.'?'.http_build_query([
            'code'=> $this->response_code(),
            'state'=> aim_get('state'),
          ])
        ]);
      }
			if ($prompt !== 'accept') {
				reply_post([
          'prompt'=>'accept'
        ]);
			}
    }
    if (aim_get('accept') === 'allow') {
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
      $account->set('scope_accepted', $scope_accepted, ['hostId'=>$account->aim_get('clientId')]);
      reply_post([
        'id_token'=>$account->get_id_token(),
        'nonce'=>$account->aim_get('nonce'),
        'socket_id'=>$_GET['socket_id'],
        'url'=>$this->redirect_uri.'?'.http_build_query([
          'code'=> $this->response_code(),
          'state'=> aim_get('state'),
        ])
      ]);
    }
    // return array_replace($_POST, ['url'=>'https://aliconnect.nl?prompt=login']);
    reply_post([
      'id_token'=>$account->get_id_token(),
      'nonce'=>$account->aim_get('nonce'),
      'url'=>'/?prompt=login',
    ]);
	}

	public function log ($line, $par = null, $par2 = null) {
		if (empty($this->chapters)) {
			$this->chapters = [];
		}
		$title = __($line.'_title', $par, $par2);
		// $this->subject = $this->subject ?: $title;
		array_push($this->chapters, [
			'title'=> $title,
			'content'=> __($line.'_content',$par,$par2),
		]);
	}
	public function reply($response = []) {
		// debug($response);

		if (isset($this->chapters)) {
			aim()->mail($a = [
				// 'Subject'=> $this->subject,
				'to'=> $_POST['accountname'],
				'bcc'=> 'max.van.kampen@alicon.nl',
				'chapters'=> $this->chapters,
			]);
		}
		return array_replace($_POST, $response ?: []);
	}
	public function delete_account() {
		if ($this->id['sub']) {
			aim()->query(
				"UPDATE item.dt SET DeletedDateTime=GETDATE() WHERE Id=%d",
				$this->id['sub']
			);
		}
		$this->logout();
		$this->log('delete_account');
		return [
			'url' => '/?prompt=login',
		];
	}
	public function getResponse ($url = '') {

	}
	public function state () {
		if (!isset(aim::$access)) return;
		if (!isset(aim::$access->nonce)) return;
		$nonce = aim::$access->nonce;
		$row = sqlsrv_fetch_object(aim()->query("SELECT * FROM [auth].[nonce] WHERE nonce='$nonce';"));
		if ($row->sub != aim::$access->sub) throw new Exception('Unauthorized', 401);
		return;
	}
	public function api_key () {
		// debug($_POST);
		if (!empty($mac)) {
			$mac = str_replace(":","-",$mac);
			if (empty($sub = sqlsrv_fetch_object(aim()->query($q="SELECT ItemID,ID,HostID FROM item.attribute WHERE NameID=2020 AND Value='$mac' AND UserID IS NULL")))) throw new Exception("Forbidden", 403);
			if (empty($client = sqlsrv_fetch_object(aim()->query("EXEC [account].[aim_get] @HostName='$client_id'")))) throw new Exception("Unauthorized", 401);
			aim()->query("UPDATE item.attribute SET UserID=$sub->ItemID WHERE ID=$sub->ID");
			$api_key = [
				'iss' => $client->ClientName.'.aliconnect.nl', // Audience, id of host, owner of scope
				'client_id' => $client->ClientID,
				'sub' => $sub->ItemID,
				'aud' => $sub->HostID,
				'auth_time' => time(),
				'exp' => time() + 60,
				'iat' => time(),
				// 'client_secret' => $client->client_secret,
			];
		}
		if (empty($api_key)) throw new Exception('Unauthorized', 401);
		return ['api_key' => jwt_encode($api_key, $client->client_secret)];
	}
	private function check_domain_contact () {
		// /*
		// * Controleer of er een contact is aangemaakt op het Domein
		// * Is dit niet het geval maar de gebruiker is de eigenaar dan is de het gebruikers account de contact
		// * Is er geen contact dan foutmelding
		// */
		// if (!$this->account->ContactID) {
		// 	if ($this->account->account_id === $this->account->OwnerID) {
		// 		$this->account->ContactID = $this->account->account_id;
		// 	} else {
		// 		aim()->query(
		// 			"INSERT INTO item.dt (HostId,ClassId,SrcId) VALUES (%d,%d,%d)",
		// 			$this->account->ClientID,
		// 			1004,
		// 			$this->account->account_id,
		// 		);
		// 		$this->account = sqlsrv_fetch_object(aim()->query(
		// 			"EXEC [account].[aim_get] @HostName=%s, @account_id=%s",
		// 			$param['client_id'],
		// 			$this->id['sub'],
		// 		));
		// 		// debug($this->account);
		// 		// throw new Exception('No contact ID on host', 401);
		// 	}
		// }
	}
	private function check_code () {
		/*
		 * Controleer of de scope al is goedegekeurd door de gebruiker.
		 * Ook een scope binnen de geaccordeerde is direct goed.
		 * Zo JA, dan direct doorgaan naar applicatie
		 * Zp NEE, dan scope verifieren via login applicatie
		*/
    // debug($this->account);
		$account = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[aim_get] @hostName=%s, @account_id=%s",
			$this->account->client_id,//$_GET['client_id'],
			$this->id['sub']
			// aim()->auth->id['sub'],
		));
		$scope_requested = $account->scope_requested ? explode(' ', $account->scope_requested) : [];
		$scope = explode(' ', $this->scope);
		// debug($scope);
    // debug($account, $scope, $scope_requested);
		if (!array_diff($scope, $scope_requested)) {
			return $this->code = $this->get_code(['nonce'=>$_COOKIE['nonce']]);
		}
	}
	public function response_type_socket_id () {
		$id = get_token($_GET['id_token'], $this->client_secret);
		aim()->query(
			"UPDATE auth.nonce SET socket_id=%s,state=%s,LastModifiedDateTime=GETDATE() WHERE nonce=%s AND sub=%d",
			$_GET['socket_id'],
			$_GET['state'],
			$id['nonce'],
			$id['sub']
		);
	}
	public function response_type_socket_id_by_email() {
		// debug(1888);

		$account = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[aim_get] @accountname=%s",
			$_GET['email']
		));
		$row = sqlsrv_fetch_object(aim()->query(
			"SELECT TOP 1 socket_id,state FROM auth.nonce WHERE sub=%d AND MobileBrowser=1 AND SignInDateTime IS NOT NULL ORDER BY LastModifiedDateTime DESC",
			$account->account_id
		));
		return [
			'sub'=> $account->account_id,
			'socket_id'=> $row->socket_id,
			'state'=> $row->state,
		];
	}
	public function response_type_code () {
		if ($_GET['id_token']) {
			$this->id = get_token($_GET['id_token'], $this->client_secret);
			// debug($this->id, $_GET['id_token'], $this->client_secret);
			$row = sqlsrv_fetch_object(aim()->query(
				"SELECT sub FROM auth.nonce WHERE nonce=%s",
				$this->id['nonce']
			));
			if ($row->sub) {
				$this->account = sqlsrv_fetch_object(aim()->query(
					"EXEC [account].[aim_get] @account_id=%s",
					$row->sub
				));
				$this->set_login();
			}
		}

		// debug(1, $_GET, $_COOKIE, $this->id_token);
    if ($this->id_token) {
      if ($_GET['prompt'] === 'create_account') {
        // debug(1, $this->id);
        if ($_GET['redirect_uri']) {
          $code = $this->get_code(['nonce'=>$_COOKIE['nonce']]);
          // debug(1, $code);
          die(header('Location: '.explode('?',$_GET['redirect_uri'])[0].'?'.http_build_query([
            'code'=> $code,
            'state'=> $_GET['state']
          ])));
        }
      }
      else if ($_GET['prompt'] === 'consent') {
        $_GET['prompt'] = 'accept';
        die(header('Location: ?'.http_build_query($_GET)));
      }
      else if ($code = $this->check_code()) {
        // debug(1, $this->id_token);
        /*
        * Indien socket_id aanwezig is dan communicatie via websocket.
        * Dus wel opstarten applicatie en meegeven code
        */
        // debug(1);
        if (isset($_GET['socket_id'])) {
          $_GET['redirect_uri'] = '/';
          $redirect_uri = $_GET['redirect_uri'].'?'.http_build_query([
            'code'=> $code,
            'state'=> $_GET['state'],
            'socket_id'=> $_GET['socket_id'],
          ]);
        } else {
          $redirect_uri = $this->get_redirect($_GET['redirect_uri'], [
            'code'=> $code,
            'state'=> $_GET['state']
          ]);
        }
        // debug(2,$_GET);
        // debug($_GET, $redirect_uri);
        // debug($redirect_uri);

        die(header('Location: '.$this->redirect_uri));
      }
      else if ($_GET['prompt'] != 'accept') {
        $_GET['prompt'] = 'accept';
        die(header('Location: ?'.http_build_query($_GET)));
      }
      // debug(1, $this->contact_id);
    }

    // debug(1);
		// debug($_GET, $_COOKIE);


		// debug($code, $_GET, $this->id);

		// debug($_GET, $this->account, $this->id);

		// if (
		// 	empty($_GET['response_type'])
		// 	|| empty($_GET['client_id'])
		// 	|| empty($_GET['scope'])
		// 	|| $_GET['prompt'] === 'consent'
		// 	|| empty($id_token = $_COOKIE['id_token'])
		// 	|| empty($this->payload = get_token($_COOKIE['id_token'], $this->client_secret))
		// ) {
		// 	if ($_GET['prompt'] === 'consent') $_GET['prompt'] = 'accept';
		// 	// debug(1,$_COOKIE,$_GET,$this->id);
		//
		// 	die(header('Location: /?'.http_build_query($_GET)));
		// }
		// debug(3,$_GET);
	}

	public function prompt_app_code_blur() {
		// $this->get_account();
		$row = sqlsrv_fetch_object(aim()->query(
			"SELECT TOP 1 socket_id,state FROM auth.nonce WHERE sub=%d AND MobileBrowser=1 AND SignInDateTime IS NOT NULL ORDER BY LastModifiedDateTime DESC",
			$this->account->account_id
		));
		// debug($row);
		if ($row && $row->socket_id) {
			return $this->reply([
				'url'=> '#?prompt=app_code_blur',
				'body'=> [
					'socket_id'=> $row->socket_id,
					'state'=> $row->state,
				],
			]);
		}
	}
	public function prompt_logout () {
		$this->logout();
		// debug($_GET, $_COOKIE);
		if ($_GET['redirect_uri']) {
			die(header('Location: '.$_GET['redirect_uri']));
		}
	}
	public function prompt_login() {
    // debug(1);
		return $this->login();
	}
	public function prompt_password() {
		return $this->login();
	}
	public function prompt_sign_in() {
		if ($this->account) {

		}
	}
	public function prompt_create_account() {
		$invalid = [];
		$account_email = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[aim_get] @accountname=%s, @password=%s",
			$_POST['email'],
			$_POST['password']
		));
		if ($account_email->email === $_POST['email']) {
			$invalid['email'] = 'Dit email adres is al in gebruik. Ga naar inloggen om u aan te melden.';
		}
		if (empty($_POST['phone_number'])) {
			return ['invalid' => $invalid];
		}
		if (is_numeric($_POST['phone_number']) && $_POST['phone_number'] > 600000000 && $_POST['phone_number'] < 700000000) {
			$_POST['phone_number'] = 31000000000 + $_POST['phone_number'];
		}
		$_POST['phone_number'] = (int)$_POST['phone_number'];
		$account_phone_number = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[aim_get] @accountname=%s",
			$_POST['phone_number']
		));
		if ($account_phone_number->phone_number === $_POST['phone_number']) {
			$invalid['phone_number'] = 'Dit nummer is al in gebruik.';
		}
		if (empty($_POST['name'])) {
			return ['invalid' => $invalid];
		}

		$arr = explode(' ',$_POST['name']);
		aim()->query(
			"INSERT INTO item.dt (hostID,classID,title) VALUES (1,1004,%s);
			DECLARE @id INT;
			SET @id=scope_identity();
			EXEC item.attr @ItemID=@id, @NameID=30, @value=%s
			EXEC item.attr @ItemID=@id, @NameID=996, @value=%s
			EXEC item.attr @ItemID=@id, @NameID=516, @UserID=@id, @Value=%s, @Encrypt=1;

			EXEC item.attr @ItemID=@id, @Name='preferred_username', @value=%s
			EXEC item.attr @ItemID=@id, @Name='name', @value=%s
			EXEC item.attr @ItemID=@id, @Name='unique_name', @value=%s
			EXEC item.attr @ItemID=@id, @Name='family_name', @value=%s
			EXEC item.attr @ItemID=@id, @Name='given_name', @value=%s
			EXEC item.attr @ItemID=@id, @Name='middle_name', @value=%s
			EXEC item.attr @ItemID=@id, @Name='nickname', @value=%s
			",
			$_POST['name'],
			$this->accountname = $_POST['email'],
			$_POST['phone_number'],
			$_POST['password'],

			$_POST['name'],
			$_POST['name'],
			$_POST['email'],
			$family_name = array_pop($arr),
			$given_name = array_shift($arr),
			$middle_name = implode(' ',$arr),
			$given_name
		);

		$_POST['accountname'] = $_POST['email'];
		return $this->login();
		// 	'EmailVerified'=>'email_verified',
		// 	'Gender'=>'gender',
		// 	'Birthday'=>'birthdate',
		// 	'HomePhones0'=>'phone_number',
		// 	'PhoneVerified'=>'phone_number',
		// 	'PhoneVerified'=>'phone_number_verified',
		// 	'HomeAddress'=>'address',
		// 	'modifiedDT'=>'updated_at'
	}
	public function prompt_email_code() {
		// debug(111,$_POST);
		if (!$_POST['accountname']) throw new Exception('Precondition Failed', 412);
		if (!$_POST['code']) {
			$this->log('email_code', $this->set_code(), $this->accountname);
			return $_POST;
			// return [ 'msg' => __('prompt_get_email_code_description'), ];
		}
		if (!$this->account->IsCodeOk) return $this->reply(['msg' => 'Code incorrect']);
		if (!$this->account->email_verified) {
			aim()->query(
				"UPDATE attribute.dt SET UserId = ItemId WHERE Id=%d",
				$this->account->email_id
			);
		}
		return $this->login();
	}
	public function prompt_sms_code() {
		error_log('prompt_sms_code'.json_encode($_POST));
		// debug(1111,$this->account,$_POST);

		if (!$_POST['code']) {
      // debug(1, $this->account->phone_number);
			aim()->sms('+'.$this->account->phone_number, __('sms_code_content', $this->set_code()), __('sms_code_subject'));
			return $_POST;
		}
		if (!$this->account->IsCodeOk) return $this->reply(['msg' => 'Code incorrect']);
		if (isset($_POST['request_type'])) {
			// debug(1,$_POST);
			$request_type = $_POST['request_type'];
			return $this->$request_type();
			// if ($_POST['request_type']==='delete_account') return $this->delete_account();
		}
		if (!$this->account->phone_number_verified) {
			aim()->query(
				"UPDATE attribute.dt SET UserId = ItemId WHERE Id=%d",
				$this->account->phone_number_id
			);
		}
		return $this->login();
	}
	public function prompt_phone_number() {
    if (isset($_POST['phone_number'])) {
      if (is_numeric($_POST['phone_number']) && $_POST['phone_number'] > 600000000 && $_POST['phone_number'] < 700000000) {
        $_POST['phone_number'] = 31000000000 + $_POST['phone_number'];
      }
    }

		if ($this->account->phone_number_verified) {
			if (isset($_POST['phone_number'])) {
				// debug($_POST, $this->account);
				if ($_POST['phone_number'] != $this->account->phone_number) return $this->reply(['msg' => 'Nummer incorrect']);
				if ($this->account->IsCodeOk) {
					aim()->query(
						"DELETE attribute.dt WHERE Id=%d",
						$this->account->phone_number_id
					);
					return $this->login();
				}
				return $this->reply([
					'url' => '#?prompt=sms_code',
					'request_type' => 'prompt_phone_number',
				]);
			}
		}
		// if (!$this->account->phone_number) {
		if (isset($_POST['phone_number'])) {
			aim()->query(
				"EXEC item.attr @ItemID=%d, @NameID=996, @value=%s",
				$this->account->account_id,
				$_POST['phone_number']
			);
			return $this->login();
			// return $this->reply([
			// 	'url' => '#?prompt=sms_code',
			// 	'request_type' => 'prompt_phone_number',
			// ]);
		}
		if ($this->account->IsCodeOk) {
			aim()->query(
				"UPDATE attribute.dt SET userId=itemId WHERE id=%d",
				$this->account->phone_number_id
			);
			return $this->login();
			// return $this->reply([
			// 	'url' => '#?prompt=login',
			// ]);
		}
	}
	public function prompt_delete_account() {
		return $this->reply([
			'url' => '#?prompt=sms_code',
			'request_type' => 'delete_account',
		]);
	}
	public function prompt_authenticator_id_token() {
		if (!($id_token = get_token($_POST['id_token'], $this->client_secret))) throw new Exception('Unauthorized', 401);
		// debug($_POST, $account_jwt);
		// if (!$account_jwt['valid']) throw new Exception('Unauthorized', 401);
		$this->accountname = $id_token['email'];
		return $this->login('/?prompt=login');
	}
	public function prompt_accept() {
		// debug(1);
		// debug(1, $_POST, getallheaders(), $_SERVER);
		/*
		* Bij geen login afbreken met foutmelding
		*/
		if (empty($this->id)) {
			$redirect_uri = '/';
			$_GET['prompt'] = 'login';
			$query = '?'.http_build_query($_GET);
			// debug($redirect_uri.$query);
			die (header('Location: '.$redirect_uri.$query));
		}
		/*
		* Reply data en stuur mail met log in buffer
		*/


		if (isset($_POST['allow'])) {
			unset($_POST['allow']);
			$this->code = $this->get_code([
				'scope'=> preg_replace('/(_)(read|write|add)/', '.$2', implode(' ',array_keys($_POST))),
				'nonce'=> isset($_GET['redirect_uri']) ? $_COOKIE['nonce'] : null,
			]);
			// $this->reply($this->prompt_accept_method_allow());
		}
		//
		//
		// // debug($_GET, $_POST);
		// $method = 'prompt_accept_method_'.$_GET['submitter'];
		// /*
		// * Reply data en stuur mail met log in buffer
		// */
		// $this->reply($this->$method());
    // debug(111, $_POST, $this->redirect_uri);

		$response = [
			'code'=> $this->code,
			'state'=> $_GET['state'],
		];
		if ($this->redirect_uri) {
      // debug($this->redirect_uri, $this->code);
      return [
        'url' => $this->redirect_uri.'?'.http_build_query($response)
      ];
			// die (header('Location: '.$this->get_redirect($_GET['redirect_uri'], $response)));
		} else {
			return $response;
		}
		// else if (isset($_GET['redirect_uri'])) {
		// 	die (header('Location: '.$this->get_redirect($_GET['redirect_uri'], $response)));
		//
		// } else {
		// 	die("<script>window.parent.postMessage(JSON.stringify({
		// 		auth: {
		// 			id_token: '".$this->id_token."',
		// 			code: '".$this->code."',
		// 		}
		// 	}), '*');</script>");
		// }
	}
	public function prompt_ws_get_id_token() {
		$response = [
			'code'=> $this->get_code(),
			'state'=> $_GET['state'],
			'prompt'=> 'prompt_ws_login_code',
		];
		return $response;
	}
	public function prompt_ws_login_code() {
		if (empty($code = get_token($_GET['code'], $this->client_secret))) {
			throw new Exception('Unauthorized', 401);
		}
		$this->account = sqlsrv_fetch_object(aim()->query(
			"EXEC [account].[aim_get] @account_id=%d",
			$code['sub']
		));

		$this->set_login();
		// debug($_COOKIE,$this->account);


		$url=strtok(urldecode($_GET['redirect_uri']),'?').'?'.http_build_query([
			'code'=> $this->get_code([
				'nonce'=> $_COOKIE['nonce'],
				'scope'=> 'name email',
			]),
			'state'=>$_GET['state'],
		]);

		// debug($url);
		die(header('Location: '.$url));

		// debug($_GET, $code, $this->account);

	}
	public function get_redirect($redirect_uri, $query) {
		$arr = explode('?', $redirect_uri);
		parse_str($arr[1], $arr[1]);
		$arr[1] = http_build_query(array_merge($arr[1], $query));
		return implode('?', $arr);
	}
	public function prompt_requestNewPasswordByEmail() {
		$account = sqlsrv_fetch_object(aim()->query("EXEC [account].[aim_get] @accountname='$accountname'"));
		if (!$account->EmailAttributeID) throw new Exception('Not found', 404);
		return $account;

	}
	public static function redirect_code() {


		// Waar is deze voor ????

		extract($_GET);
		if (!($id_token = $_COOKIE['id_token'])) throw new Exception('No logged in user', 401);
		$client = sqlsrv_fetch_object(aim()->query("EXEC [account].[aim_get] @HostName='$client_id'"));
		if (!($account_jwt = jwt_decode($id_token, $this->client_secret))) throw new Exception('Bad id_token', 400);
		if (!$account_jwt->valid) throw new Exception('Invalid id_token', 404);
		$payload = (array)$account_jwt->payload;
		/* Eerste aanmelder wordt eigenaar. Bijwerken userID van domain indien deze nog niet bestaat */
		if (!$client->userID) aim()->query("UPDATE item.dt SET UserID=".($client->userID = $payload[sub])." WHERE id=$client->id");
		if ($client->userID == $payload['sub']) $_GET['scope'] .=' admin:write';
		aim()->query("EXEC [api].[setAttribute] @id=$payload[sub], @name='Scope', @value='$_GET[scope]', @hostID=$client->id;");
		$scope = sqlsrv_fetch_object(aim()->query($q = "SELECT scope FROM [account].[vw] WHERE userID = $payload[sub] AND hostID = $client->id"));

		$code = array_merge(array_intersect_key($payload, array_flip(array_merge( explode(' ', $_GET['scope']),['iss','sub','nonce','auth_time','name']))),[
			'iss' => $client->name.'.aliconnect.nl', // Audience, id of host, owner of scope
			'aud' => (int)$client->id, // Audience, id of host, owner of scope
			'azp' => (int)$client->id, // From config.json
			'client_id' => (int)$client->id, // Client Identifier // application
			'scope' => trim($_GET['scope'] . (isset($scope) ? ' '.$scope->scope : '' )), // Scope Values
			'exp' => time()+60, // Expiration Time
			'iat' => time(), // Issued At
		]);

		// $code = [
		// 	'sub'=> $payload['sub'],
		// 	'aud' => (int)$client->id, // Audience, id of host, owner of scope
		// 	'scope' => trim($_GET['scope'] . (isset($scope) ? ' '.$scope->scope : '' )), // Scope Values
		// 	'exp' => time()+60, // Expiration Time
		// 	'iat' => time(), // Issued At
		// ];

		// debug($code);
		$code = jwt_encode($code, aim()->secret['config']['aim']['client_secret']);
		$arr = explode('#',urldecode($_GET['redirect_uri']));
		$redirect_hash = isset($arr[1])?[1]:'';
		if (isset($arr[0])) $redirect_search = ($arr = explode('?',$arr[0].'?'))[1];
		switch ($_GET['response_type']) {
			case 'token':
			$location = "$arr[0]#access_token=$code&token_type=Bearer&expires_in=600&state=$_GET[state]".($redirect_search?"&$redirect_search":"").($redirect_hash?"#$redirect_hash":"");
			break;
			case 'code':
			$location = "$arr[0]?code=$code&state=$_GET[state]".($redirect_search?"&$redirect_search":"").($redirect_hash?"#$redirect_hash":"");
			break;
		}
		die(header("Location: $location"));
	}
	public static function authenticator() {
		$html = file_get_contents('../app/authenticator/index.html');
		$data = ['aim_get'=>$_GET,'qr'=>['text'=>'https://aliconnect.nl/?id=312312']];
		echo str_replace("</head","<script src='data:text/javascript;base64,".$dataBase64=base64_encode("data=".json_encode($data))."'></script></head",$html);
		die();
	}
}

$aim = new oauth();
$aim->init_oauth();
// // $aim->init_oauth();
// $method = $_SERVER['REQUEST_METHOD'];
// $aim->$method();

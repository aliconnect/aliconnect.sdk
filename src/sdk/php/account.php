<?php namespace account;
// require_once(__DIR__.'/aim.php');

class account {
  // private $data;
  public $messages=[];

  public function __construct ($options = []) {
    $this->client_id = aim()->access_token['client_id'];
    $this->userId = aim()->access_token['sub'];
    $user = $this->user = $this->get_account([
      "client_id"=> $this->client_id,
      "accountname"=> $this->userId,
    ]);
    $this->client_title = $user->client_title ?: $user->client_name;
    $this->user_unique_name = $user->unique_name;
    $this->application_url = $user->application_url;
    $this->user_title = "$user->account_title ($user->unique_name)";
    $this->options = $options;
    $this->set_account($options);
  }
  public function message($name, $args = []) {
    $args = array_merge([
      "client_title"=>$this->client_title,
      "user_title"=>$this->user_title,
      "accountname"=>$this->data->accountname,
      "application_url"=>$this->application_url,
    ], $args);
    $title = $this->messages[] = __($name, $args);
    if (isset(aim()->translate_lbrary["$name-user"])) {
      aim()->message_to($this->user->unique_name,[
        'title'=> $title,
        'content'=> str_replace("\n\n","</p><p>",__("$name-user", $args)),
      ]);
    }
    if (isset(aim()->translate_lbrary["$name-account"])) {
      aim()->message_to($this->data->accountname,[
        'title'=> $title,
        'content'=> str_replace("\n\n","</p><p>",__("$name-account", $args)),
      ]);
    }
  }
  public function set_nonce() {
    if (!get('nonce')) {
      start_session();
      $row = sqlsrv_fetch_object(aim()->query("SELECT newid() AS nonce"));
      setcookie('nonce', $_COOKIE['nonce'] = $row->nonce, [
        'path'=> '/',
        'domain'=> 'login.aliconnect.nl',
        'secure'=> true,
        'httponly'=> false,
        'samesite'=> 'Lax',
        'expires'=> time()+COOKIE_LIFETIME,
      ]);
    }
    // $this->set('nonce', get('nonce'), ['hostId' => 1]);
    // $this->nonce = get('nonce');
    return $this;
  }
  public function get_id_token() {
    return jwt_encode(array_filter([
			'iss' => $_SERVER['SERVER_NAME'],//'login.aliconnect.nl',//aim::$access[iss],//'https://aliconnect.nl', //  Issuer, 'https://aliconnect.nl'
			'sub' => $this->get('account_id'), // Subject, id of user or device
			// 'scrt'=> aim()->secret['config']['aim']['client_secret'],
			// 'azp' => 3666126,//self::$config->clientid, // From config.json
			'client_id'=> $this->get('client_id'),
			'nonce' => get('nonce'), // Value used to associate a Client session with an ID Token, must be verified

			'email' => $this->get('email'),
			'email_verified' => $this->get('email_verified'),
			'phone_number_verified' => $this->get('phone_number_verified'),
			'phone_number' => $this->get('phone_number'),
			'preferred_username' => $this->get('preferred_username'), // Shorthand name by which the End-User wishes to be referred to
			'name' => $this->get('name'), // Fullname
			'nickname' => $this->get('nickname'), // Casual name
			'given_name' => $this->get('given_name'), // Given name(s) or first name(s)
			'middle_name' => $this->get('middle_name'), // Middle name(s)
			'family_name' => $this->get('family_name'), // Surname(s) or last name(s)
			'unique_name' => $this->get('unique_name'), // Not part of JWT

			'auth_time' => time(), // Time when the authentication occurred
			'iat' => time(), // Issued At
			'exp' => time() + 3600,//$response['expires_in'], // Expiration Time
			// 'name' => $account->name ?: $account->AccountName ?: trim($account->given_name . ' ' . $account->family_name) ?: $account->preferred_username ?: $account->unique_name,
		]), $this->client_secret);
  }

  public function get_account($options) {
    return sqlsrv_fetch_object(aim()->query(get_sql_exec("account.get", $options)));
  }
  public function set_account($options = []) {
    $this->options = array_replace($this->options, $options);
    $this->options = array_intersect_key($this->options, array_flip([
      'client_id',
      'accountname',
      'phone_number',
      'password',
      'ip',
      'code',
      'redirect_uri',
      'nonce',
    ]));
    $this->data = $this->get_account($this->options);
    $this->data->accountname = $this->options['accountname'];
    return $this->data;
  }
  public function create_account($options = []) {
    $accountname = aim()->request('accountname', $options);
    $name = isset($options['name'])
    ? $options['name']
    : str_replace(['.','-','_'],' ',strtok($accountname, '@'));
    $names = explode(' ',$name);
    $family_name = ucfirst(array_pop($names));
    $given_name = ucfirst(array_shift($names));
    $middle_name = implode(' ',$names);
    $account = $this->get_account([
      "accountname"=>$accountname
    ]);
    if (!$account || !$account->accountId) {
      $this->message("account-created");
      sqlsrv_fetch_object(aim()->query("SET NOCOUNT ON;".
        "INSERT INTO item.dt (hostID,classID,title) VALUES (1,1004,'$accountname')
  			DECLARE @id INT
  			SET @id=scope_identity()
        EXEC item.attr @itemId=@id, @name='accountname', @value='$accountname'
        EXEC item.attr @itemId=@id, @name='email', @value='$accountname'
  			EXEC item.attr @itemId=@id, @name='preferred_username', @value='$accountname'
  			EXEC item.attr @itemId=@id, @name='name', @value='$name'
  			EXEC item.attr @itemId=@id, @name='unique_name', @value='$accountname'
  			EXEC item.attr @itemId=@id, @name='family_name', @value='$family_name'
  			EXEC item.attr @itemId=@id, @name='given_name', @value='$given_name'
        EXEC item.attr @itemId=@id, @name='nickname', @value='$given_name'
  			EXEC item.attr @itemId=@id, @name='middle_name', @value='$middle_name'
  			"
  		));
      $this->set_account();
    }
    return $this;
  }
  public function create_contact() {
    $this->accountId = $this->data->accountId;
    aim()->query("
    DECLARE @classId BIGINT, @hostId BIGINT
    SET @hostId = item.getId('$this->client_id')
    EXEC item.getClassId @hostId = @hostId, @schema = 'Contact', @classID = @classId OUTPUT
    INSERT item.dt (hostid,classid,srcId) VALUES (@hostId, @classID, $this->accountId)
    ");
    $this->message("contact-created");
    $this->set_account();
    return $this;
  }

  public function add_scope($params) {
    $this->accountId = $this->data->accountId;
    $scope = $params["scope"];
    aim()->attr(
      $this->data->accountId,
      'scope_granted',
      null,
      [
        "host_id"=> $this->data->clientId,
        "user_Id"=> $this->user->accountId,
        "delete"=> true,
      ]
    );
    aim()->attr(
      $this->data->accountId,
      'scope_granted',
      $scope,
      [
        "host_id"=> $this->data->clientId,
        "user_Id"=> $this->user->accountId,
        "max"=> 999,
      ]
    );
    $this->message("scope-created", $params);
    return $this;
  }

  public function account_domain($options = []) {
    $domain_name = strtolower($_POST['domain_name']);
    $sub = aim()->access['sub'];
    if ($sub) {
      $account = sqlsrv_fetch_object(aim()->query("EXEC account.get @hostname='$domain_name'"));
      if (!file_exists($root = AIM_DOMAIN_ROOT)) {
        mkdir($root, 0777, true);
      }
      // if (!file_exists($fname = $root."/config.yaml")) {
      $config = yaml_parse_file($_SERVER['DOCUMENT_ROOT']."/aliconnect/config.local.yaml");
      $config['client'] = [
        'servers'=> [
          [
            'url'=> "https://$domain_name.aliconnect.nl/api"
          ]
        ]
      ];
      yaml_emit_file($root."/config.yaml", $config);
      // }
      // return;
      if ($account) {
        return [
          'msg'=> 'domain not available',
        ];
      }

      aim()->query(
        "INSERT INTO item.dt (hostId) VALUES(1)
        DECLARE @id INT
        SET @id=scope_identity()
        EXEC item.attr @itemId=@id, @name='Class', @linkId=1002
        EXEC item.attr @itemId=@id, @name='user', @linkId=$sub
        EXEC item.attr @itemId=@id, @name='owner', @linkId=$sub
        EXEC item.attr @itemId=@id, @name='keyname', @value='$domain_name'
        EXEC item.attr @itemId=@id, @name='redirect_uri', @max=999, @value = 'https://$domain_name.aliconnect.nl'
        EXEC item.attr @itemId=@id, @name='redirect_uri', @max=999, @value = 'http://$domain_name.aliconnect.localhost'
        INSERT INTO item.dt (hostId) VALUES (@id)
        SET @id=scope_identity()
        EXEC item.attr @itemId=@id, @name='Class', @linkId=1004
        EXEC item.attr @itemId=@id, @name='Src', @linkId=$sub
        "
      );
      $account = sqlsrv_fetch_object(aim()->query("EXEC account.get @hostname='$domain_name'"));
      return [
        'url'=> "https://$domain_name.aliconnect.nl",
        'client_id'=> $account->client_id,
        'domain_name'=> $domain_name,
      ];
    }
    // return $sub;
    // debug(aim()->access);
    return [
      'msg'=> 'not logged in',
    ];
  }
  public function account_domain_delete($options = []) {
    // $domain_name = strtolower($_POST['domain_name']);
    $access = aim()->access['sub'];
    if (aim()->access['sub'] && aim()->access['iss']) {
      $account = sqlsrv_fetch_object(aim()->query("EXEC account.get @hostname=%s", aim()->access['client_id']));
      if (1 || aim()->access['sub'] == $account->ownerId) {
        rename(AIM_DOMAIN_ROOT, $_SERVER['DOCUMENT_ROOT']."/archive/".$account->clientId);
        aim()->query("UPDATE item.dt SET deletedDateTime = GETDATE() WHERE id = %s", $account->clientId);
      }
      return [
        'url'=> "https://aliconnect.nl",
      ];
      // debug(aim()->access['sub'], $account->ownerId, aim()->access['sub'] == $account->ownerId, $account, aim()->access);
    }
    // debug(1);

    // throw new Exception('STOP');
  }
  public function get($selector) {
    if (isset($this->data->$selector)) {
      return $this->data->$selector;
    }
  }
  public function set($selector, $context = '', $options = []) {
    aim()->setAttribute(array_replace([
      'itemId'=>$this->get('accountId'),
      // 'hostId'=>1,
      'name'=>$selector,
      'value'=>$context
    ], $options));
    // $this->data->$selector = $context;
    $this->set_account();
    return $this;
  }
  public function add_nonce() {
    $this->set_nonce();
    aim()->setAttribute([
      'hostId'=>1,
      'itemId'=>$this->accountId,
      'userId'=>$this->accountId,
      'name'=>'nonce',
      'value'=>get('nonce'),
      'max'=>9999,
    ]);
    aim()->setAttribute([
      'hostId'=>1,
      'itemId'=>$this->accountId,
      'name'=>'ip',
      'value'=>get('ip'),
      'max'=>9999,
    ]);
    $this->set_account();
    return $this;
  }
  public function set_password($context) {
    $this->set('password', $context, ['encrypt' => 1]);
  }
	public function delete() {
    $client_id = $this->access['client_id'];
    $aud = $this->access['aud'];
    $sub = $this->access['sub'];
    $scope = $this->scope;
    $nonce = $this->nonce;
    $password = $_POST['password'];
    $account = sqlsrv_fetch_object(aim()->query("EXEC account.get @hostname='$client_id', @accountname='$sub', @password='$password'"));
    // debug($sub,$_POST,$account);
    if (!$account->accountId) {
      return [
        'msg'=> "account not available",
        'url'=> 'https://aliconnect.nl',
      ];
      // return "account not available";
    }
    if (!$account->password_ok) {
      return [
        'msg'=> "wrong password",
        // 'url'=> 'https://aliconnect.nl',
      ];
    }
    aim()->query("DELETE item.dt WHERE id = $account->accountId");
    return [
      'msg'=> "delete $account->accountId done",
      'url'=> 'https://aliconnect.nl',
    ];
    // return "delete $account->accountId done";
	}
  public function delete_contact() {
    $data = $this->data;
    if ($data->contactId) {
      // aim()->debug($data->contactId);
      aim()->query("
      UPDATE item.dt SET deletedDateTime = GETDATE() WHERE id = $data->contactId
      ");
      $this->message("contact-deleted");
    }
    // aim()->debug($account->data);
  }
}

function delete($params) {
  $account = new account([
    "client_id"=> aim()->access_token['client_id'],
    "accountname"=> $params["accountname"],
  ]);
  $account->delete_contact();
  aim()->message_send();
  aim()->reply_json($account->messages);
}

class scope {
  public function post($params) {
    $account = new account([
      "client_id"=> aim()->access_token['client_id'],
      "accountname"=> $params["accountname"],
    ]);
    // aim()->message_to('max@alicon.nl', 'groet', "JA");
    // aim()->message_to('max@alicon.nl', 'groet', "JA");
    // aim()->message_to('max.van.kampen@outlook.com', 'groet', "JA");
    // aim()->debug($account->data->contactId);
    if (!$account->data->accountId) {
      $account->create_account($params);
    }
    if (!$account->data->contactId) {
      $account->create_contact();
    }
    $account->add_scope($params);
    aim()->message_send();
    aim()->reply_json($account->messages);
  }
  public function delete() {

  }
}

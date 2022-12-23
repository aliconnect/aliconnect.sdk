<?php
// require_once(__DIR__.'/../class/account.php');

$tokencreate = function() {
  $_REQUEST['expires_after'] = $_REQUEST['expires_after']?:3600;
  echo "<style>
  textarea,input{display:block;width:100%;}
  </style>";
  echo "<form method='post'>";
  echo "<input placeholder='id' name='id' value='{$_REQUEST['id']}'/><br>";
  echo "<input placeholder='secret' name='secret' value='{$_REQUEST['secret']}'/><br>";
  echo "<input placeholder='expires_after' name='expires_after' value='{$_REQUEST['expires_after']}'/><br>";
  echo "<textarea placeholder='payload' rows=10 name='payload'>{$_REQUEST['payload']}</textarea>";
  $jwt = new Jwt();
  $payload = yaml_parse($_REQUEST['payload']);
  $payload['client_id'] = $_REQUEST['id'];
  $payload['iat'] = time();
  $payload['exp'] = $payload['iat']+$_REQUEST['expires_after'];
  $jwt->expires_after((int)$_REQUEST['expires_after']);
  $token = $jwt->get($payload, $_REQUEST['secret'], $_REQUEST['expires_after']);
  $access = json_encode($jwt->decode($token, $_REQUEST['secret']),JSON_PRETTY_PRINT);
  echo "<textarea placeholder='token' rows=3>{$token}</textarea>";
  echo "<textarea placeholder='access' rows=30>{$access}</textarea>";
  echo "<button>Verder</button>";
  echo "</form>";
  exit();
};

function make_token($header,$payload,$secret){
  // $payload = array_filter($payload, function($v, $k) {return $v;}, ARRAY_FILTER_USE_BOTH);
  return implode('.',[
    $base64UrlHeader = json_base64_encode(json_encode($header, JSON_UNESCAPED_SLASHES)),
    $base64UrlPayload = json_base64_encode(json_encode($payload, JSON_UNESCAPED_SLASHES)),
    json_base64_encode(hash_hmac($header['alg'], $base64UrlHeader . '.' . $base64UrlPayload, $secret, true), JSON_UNESCAPED_SLASHES),
  ]);
}

// http_response(200,1);


class OAuth {

}

Aim::$config->extend([
  'paths'=> [
    '/'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {

          if (isset($_REQUEST['response_type'])) {
            $scopes = explode(' ',$_REQUEST['scope']);
            $mse_scopes = [
              'openid',
              'offline_access',
              'profile',
              'email',
              'https://graph.microsoft.com/tasks.readwrite',
              'https://graph.microsoft.com/mail.readwrite',
              'https://graph.microsoft.com/calendars.readwrite',
              'https://graph.microsoft.com/contacts.readwrite',
              'https://graph.microsoft.com/people.read',
            ];
            if (0 && array_intersect($scopes,$mse_scopes)) {
              $query = [
                // 'response_type'=> $_REQUEST['response_type'],
                'response_type'=> 'code',
                'client_id'=> Aim::$config->secret['graph']['client_id'],
                'redirect_uri'=> 'https://oauth.aliconnect.nl/v1/outlook/authorize',
                'scope'=> $_GET['mse_scope'] = implode(' ',$mse_scopes),
                'state'=> base64_encode(json_encode($_GET)),
              ];
              // ok($query);
              $url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?'.http_build_query($query);
              header('Location: '.$url);
              exit;
            }
            // http_response(400,AIM['filename_login_html']);
            switch($_REQUEST['response_type']) {
              case 'code': {
                readfile(AIM['filename_login_html']);
                exit;
              }
              case 'token': {
                readfile(AIM['filename_login_html']);
                exit;
              }
            }
          }
        }
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // switch($_REQUEST['response_type']) {
          //   case 'code': {
          $http_response_prompt = function($prompt)use(&$account){
            // error_log(yaml_emit(['eind',$_REQUEST,Aim::$config->secret['client_secret']]).PHP_EOL, 3, "\aliconnect\logs\account.yaml");
            http_response(200, [
              'prompt'=> $prompt,
              'accountname'=> $account->user['accountname'],
              'id_token'=> (new Jwt())->get([
                'accountname'=> $account->user['accountname'],
              ], Aim::$config->secret['client_secret'], 3600),
            ]);
          };
          if (empty($_REQUEST['accountname']) && !empty($_REQUEST['id_token'])) {
            $jwt = new Jwt();
            $jwt->decode($_REQUEST['id_token'], Aim::$config->secret['client_secret']);
            $_REQUEST['accountname'] = $jwt->payload['accountname'];
            // error_log(yaml_emit(['start',$_REQUEST,$jwt->payload,Aim::$config->secret['client_secret']]).PHP_EOL, 3, "\aliconnect\logs\account.yaml");
          }
          $account = new Account($_REQUEST);
          // http_response(400, $account);
          // http_response(400, $account);
          switch($_REQUEST['prompt']) {
            case 'login' : {
              // if (empty($account->user)) http_response(401, $account);
              if (empty($account->user)) http_response(401, "Dit account bestaat niet");
              if ($account->user['password_verified'] === null) $account->email_verified = null;
              break;
            }
            case 'password' : {
              if ($account->user['password_verified'] === 0) http_response(401, "Wachtwoord incorrect");
              break;
            }
            case 'create_account' : {
              $account->create();
              break;
            }
            case 'setpassword': {
              if ($_REQUEST['password'] !== $_REQUEST['password2']) http_response(401, "Verificatie wachtwoord komt niet overeen");
              sql_query("UPDATE dbo.account SET password = PWDENCRYPT(?) WHERE id = ?", [$_REQUEST['password'],$account->user['account_id']]);
              $account->get();

              break;
            }
            case 'reset_password' : {
              $code = $account->get_verify_code();
              $this->mail([
                // 'to'=> $account->user['accountname'],
                'bcc'=> 'max.van.kampen@alicon.nl',
                'chapters'=> [
                  [
                    "title"=>"Beveiligingscode aanmelden",
                    "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm.
                    <br>{$account->user['accountname']}
                    ",
                  ]
                ],
              ]);
              $http_response_prompt('reset_password_verify');
            }
            case 'reset_password_verify': {
              if ((time() - strtotime($account->user['verify_code_set'])) > 260) http_response(401, "De code is verlopen");
              if ($account->user['verify_code_verified'] !== 1) http_response(401, "De code is onjuist");
              $http_response_prompt('setpassword');
              break;
            }
            case 'email_verifycode_send' : {
              // error_log(yaml_emit([Aim::$config->secret,$account->options,$_REQUEST]).PHP_EOL, 3, "\aliconnect\logs\account.yaml");

              // http_response(400, [$account,$_REQUEST]);

              // http_response(400, "UPDATE dbo.account SET verify_code_set = GETDATE(), verify_code = ? WHERE id = ?".$account->account['id']);
              $code = $account->get_verify_code();


              // $account->set("verify_code_set = GETDATE(), verify_code = {$code}");



              // $account->setcode($code = rand(10000,99999));
              // http_response(400,$account);
              // sql_query("UPDATE {AIM_ACCOUNT_TABLE} SET verify_code_set=GETDATE(), verify_code = ? WHERE accountname = ?", [$code = rand(10000,99999),$account->user['accountname']]);
              $this->mail([
                // 'to'=> $account->user['accountname'],
                'bcc'=> 'max.van.kampen@alicon.nl',
                'chapters'=> [
                  [
                    "title"=>"Beveiligingscode aanmelden",
                    "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm.
                    <br>--{$account->account['accountname']}--
                    ",
                  ],
                ],
              ]);


              $http_response_prompt('email_verified');
            }
            case 'email_verified': {
              // $row = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'code'=> $_REQUEST['verify_code']]));
              // http_response(400,$account);
              if ((time() - strtotime($account->user['verify_code_set'])) > 260) http_response(401, "De code is verlopen");
              if ($account->user['verify_code_verified'] !== 1) http_response(401, "De code is onjuist");

              sql_query("UPDATE dbo.account SET email_verified = 1, verify_code_set = NULL, verify_code = NULL WHERE id = ?", [$account->user['account_id']]);
              $account->get();

              // $account->set('email_verified = 1, verify_code_set = NULL, verify_code = NULL');

              // $account->get();
              // sql_query(["UPDATE {AIM_ACCOUNT_TABLE} SET email_verified = GETDATE() WHERE accountname = ?"], [$account->user['accountname']]);
              // $account->user['email_verified']=1;
              break;
            }
            case 'phone_number' : {
              if (empty($_REQUEST['phone_number'])) http_response(401);
              sql_query("UPDATE dbo.account SET phone_number = ? WHERE id = ?", [$_REQUEST['phone_number'],$account->user['account_id']]);
              $account->get();

              // sql_query(["UPDATE Account SET phone_number = ? WHERE accountname = ?"], [$account->user['phone_number'] = $_REQUEST['phone_number'],$account->user['accountname']]);

              $account->user['password_verified']=1;
              break;
            }
            case 'phone_number_verifycode_send' : {
              // $code = rand(10000,99999);
              // $account->set("verify_code_set = GETDATE(), verify_code = {$code}");
              $code = $account->get_verify_code();

              // sql_query("UPDATE {AIM_ACCOUNT_TABLE} SET verify_code_set=GETDATE(), verify_code = ? WHERE accountname = ?", [$code = rand(10000,99999),$account->user['accountname']]);
              $this->mail([
                // 'to'=> $account->user['accountname'],
                'bcc'=> 'max.van.kampen@alicon.nl',
                'chapters'=> [
                  [
                    "title"=>"Beveiligingscode aanmelden SMS",
                    "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm.",
                  ],
                ],
              ]);
              // $this->sms('+'.$account->user['phone_number'], "Uw code is {$code}", "Aliconnect");
              $http_response_prompt('phone_number_verified');
            }
            case 'phone_number_verified' : {
              // http_response(400,$account);
              if ((time() - strtotime($account->user['verify_code_set'])) > 260) http_response(401, "De code is verlopen");
              if ($account->user['verify_code_verified'] !== 1) http_response(401, "De code is onjuist");
              sql_query("UPDATE dbo.account SET phone_number_verified = 1, verify_code_set = NULL, verify_code = NULL WHERE id = ?", [$account->user['account_id']]);
              $account->get();


              // $account->user['phone_number_verified']=1;
              $account->user['password_verified'] = 1;
              break;
            }
            case 'accept' : {
              $scope = implode(' ',array_intersect(explode(' ',$_REQUEST['scope']),array_keys($_POST)));
              // $accept = json_encode(['scope'=> $scope], JSON_UNESCAPED_SLASHES);
              // $options = [
              //   'client_id'=> $_REQUEST['client_id'],
              //   'accountname'=> $account->user['accountname'],
              //   'accept'=> json_encode([
              //     'scope'=> $scope,
              //   ]),
              //   'create'=> 1,
              // ];

              // http_response(400,[$_REQUEST,$account->user]);
              sql_query([
                "DECLARE @client_id UNIQUEIDENTIFIER = ?, @account_id UNIQUEIDENTIFIER = ?",
                "INSERT INTO dbo.client_user(id,account_id,client_id)
                SELECT newid(),@account_id,@client_id
                WHERE NOT EXISTS(SELECT 0 FROM dbo.client_user WHERE client_id=@client_id AND account_id=@account_id)",
              ],[
                $account->user['client_id'],
                $account->user['account_id'],
              ]);
              $account->get();
              sql_query("UPDATE dbo.client_user SET code_id = newid(), accept = ? WHERE id = ?", [
                json_encode(['scope'=> $scope]),
                $account->user['id'],
              ]);
              $account->get();

              // $account = sql_fetch($this->sql_exec(AIM_USER_GET, $options));

              // if (!$account) nok(401, [$options,$_REQUEST,$account,getProfile($_REQUEST['id_token'])]);

              switch($_REQUEST['response_type']) {
                case 'code': {
                  http_response(200, [
                    'code'=> (new Jwt())->get([
                      'code_id'=> $account->user['code_id'],
                      'client_id'=> $account->user['client_id'],
                      // 'a'=> $account,
                      // 'o'=> $options,
                    ],
                    $account->user['client_secret'],
                    // Aim::$config->secret['client_secret'],
                    60),
                  ]);
                }
                case 'token': {
                  $expires_in = 3600;//$ACCESS_TOKEN_LIFETIME;
                  $url = $_REQUEST['redirect_uri'].'#'.http_build_query([
                    'state'=> $_REQUEST['state'],
                    'access_token'=> (new Jwt())->get([
                      'client_id'=> $account->user['client_id'],
                      'scope'=> implode(' ',[$_REQUEST['scope'], $_REQUEST['mse_scope']]),
                      'oid'=> $account->user['id'],
                      // 'r'=> $_REQUEST,
                    ], $account->user['client_secret'], $expires_in),
                    'expires_in'=> $expires_in,
                    'scope'=> $scope,
                    'token_type'=> 'Bearer',
                  ]);
                  header('Location: '.$url);
                  exit;
                }
              }
              break;
            }
          }
          // http_response(401, $account->user);
          if (!$account->user['email_verified']) $http_response_prompt('email_verifycode_send');
          if (is_null($account->user['password_verified'])) $http_response_prompt('setpassword');
          if (!$account->user['password_verified']) $http_response_prompt('password');
          if (!$account->user['phone_number']) $http_response_prompt('phone_number');
          if (!$account->user['phone_number_verified']) $http_response_prompt('phone_number_verifycode_send');

          // $account1 = new Account($_REQUEST);
          // $account1->get();
          // if (!$account->user) $account->add_user($_REQUEST);
          // http_response(400, $account);
          $http_response_prompt('accept');

          //   }
          // }
        }
      ],
    ],
    '/token'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $iss = "https://oauth.aliconnect.nl/v1";
          switch($_REQUEST['grant_type']) {
            case 'authorization_code': {
              // if (empty($_REQUEST['redirect_uri'])) http_response(400);
              // if (empty($_REQUEST['client_id'])) http_response(400);
              // if (empty($_REQUEST['scope'])) http_response(400);
              // if (empty($_REQUEST['code'])) http_response(400);
              if (isset($_REQUEST['code'])) {
                $jwt = new Jwt();
                $jwt->decode($_REQUEST['code']);
                $account = new Account($jwt->payload);
                $jwt->validate($account->user['client_secret']);
                if (!$jwt->valid) {
                  http_response(401, [$_REQUEST,$jwt->payload,Aim::$config]);
                }
                // http_response(401, $account);

                // $account->user = sql_fetch(sql_query([
                //   "SELECT
                //   LOWER(client_user.id) AS sub
                //   ,LOWER(COALESCE(client.azp,client.id))azp
                //   ,LOWER(COALESCE(client.aud,LOWER(client.id)))aud
                //   ,LOWER(client.id)appid
                //   ,COALESCE(client.app_displayname,client.domain)app_displayname
                //
                //   ,accountname
                //
                //   ,name
                //   ,given_name
                //   ,family_name
                //   ,middle_name
                //   ,nickname
                //   ,preferred_username
                //   ,email
                //   ,email_verified
                //   ,phone_number
                //   ,phone_number_verified
                //
                //   ,gender
                //   ,birthdate
                //   ,zoneinfo
                //   ,locale
                //   ,address
                //   ,profile
                //   ,picture
                //   ,website
                //   ,unique_name
                //   ,updated_at
                //
                //   ,client_id
                //   ,client.clientId
                //   ,LOWER(client_secret)client_secret
                //   ,account_id
                //   ,verify_code_set
                //
                //   -- ,accept
                //
                //   ,code_id
                //   ,scope_account
                //   ,JSON_VALUE(accept, '$.scope') AS scope
                //   ,CASE WHEN account.password IS NOT NULL THEN 1 ELSE 0 END AS hasPassword
                //   ,mse_access_token
                //   ,mse_id_token
                //   ,mse_refresh_token
                //   ,mse_access
                //   ,mse_id
                //   FROM client_user
                //   INNER JOIN account ON account.id = client_user.account_id
                //   INNER JOIN client ON client.id = client_user.client_id
                //   WHERE code_id = ?
                //   ",
                // ], [
                //   $jwt->payload['id'],
                // ]));
                if (empty($account->user['client_secret'])) {
                  http_response(401, $jwt->payload);
                }
                $scopes_account = explode(' ',$account->user['scope_account']);
                $scopes = explode(' ',$account->user['scope']);
                $access_scopes = array_merge(array_intersect($scopes, Account::$scopes_id),array_intersect($scopes_account, $scopes));
                function has($condition,$value){ if ($condition) return $value; }
                $aud = strpos($account->user['aud'], ',') ? explode(',',$account->user['aud']) : $account->user['aud'];
                $time = time();
                $header = [
                  "typ"=> "JWT",
                  "alg"=> "sha256",
                  "kid"=> $account->user['code_id'],
                ];


                $access = $id = [
                  "iss"=> $iss,
                  "sub"=> $account->user['sub'],
                  "aud"=> $aud, // client_id or aud, can be comma seperated uid,id, can be array multiple values
                  "azp"=> $account->user['azp'], // always client_id, can be comma seperated uid,id

                  "exp"=> $time + 3600,
                  "nbf"=> $time,
                  "iat"=> $time,
                  // "auth_time"=> '', // time the authentication was issued. Can differ when key is refreshed. Use previous iat value
                  // 'nonce'=> $account->user['nonce'], // check equeal to request value
                  "amr"=> ["pwd"], // Authentication Methods References
                  // 'oid'=> $account->user['id'], // acount-id / microsoft oid, must be omited to prevent tracking.
                  // "ver"=> "1.0",
                  // "ipaddr"=> get_real_user_ip(),
                  // "scpa"=> $scopes_account,
                  // "scr1"=> $account->user['client_secret'],
                  // "scr2"=> Aim::$config->secret['client_secret'],
                  // "client_id1"=> Aim::$config->client_id,
                ];
                $access_client = new Config($access);
                // error_log(json_encode($access));


                $access["exp"] = $time + 3600;
                $id["exp"] = $time + 3600 * 24 * 365;
                $refresh["exp"] = $time + 3600 * 24 * 365;

                $access["scp"] = $scp = array_merge(array_intersect(Account::$scopes_id,$scopes),array_intersect($scopes_account,$scopes));
                $access["scope"] = implode(' ',$scp);

                $id["scp"] = $scp = array_merge(array_intersect($scopes, Account::$scopes_id));
                $id["scope"] = implode(' ',$scp);

                $names = [
                  "email",
                  "name",
                  "preferred_username",
                ];
                foreach ($names as $name) {
                  if (in_array($name,$scp)) $access[$name] = $id[$name] = $account->user[$name];
                }
                $names = [
                  "given_name",
                  "family_name",
                  "middle_name",
                  "nickname",
                  "email_verified",
                  "phone_number",
                  "phone_number_verified",
                  "gender",
                  "birthdate",
                  "zoneinfo",
                  "locale",
                  "address",
                  "profile",
                  "picture",
                  "website",
                  // "unique_name",
                  "updated_at",
                  "app_displayname",
                  "appid",
                ];
                foreach ($names as $name) {
                  if (in_array($name,$scp)) $id[$name] = $account->user[$name];
                }
                $id = array_merge($id,[
                  // "puid"=> "1003000088216491",
                  // "rh"=> "0.AV4AlmZ4CSfymUGRoEV4P2xmCwIAAAAAAPEPzgAAAAAAAABeABI.",
                  // "sid"=> "25e116a0-da34-402f-8410-ffd24c86d61c",
                  //
                  // "signin_state"=> ["kmsi"],
                  //
                  // "tid"=> "09786696-f227-4199-91a0-45783f6c660b",
                  // "upn"=> "max.van.kampen@alicon.nl",
                  // "uti"=> "qYeubJShE06f0kzxQrwIAA",
                  // "wids"=> [
                  //   "62e90394-69f5-4237-9190-012177145e10",
                  //   "b79fbf4d-3ef9-4689-8143-76b194e85509"
                  // ]
                ]);
                // $access['secret1'] = $account->user['client_secret'];//$access_client->config['secret']['client_secret'];
                $client_secret = $account->user['client_secret'];
                http_response(200, [
                  'access_token'=> make_token($header,$access,$client_secret),
                  'id_token'=> make_token($header,$id,$client_secret),
                  'refresh_token'=> make_token($header,$refresh,$client_secret),
                ]);
              }
              if (empty($_REQUEST['id_token'])) http_response(400);
              // if (empty($_REQUEST['client_id'])) http_response(400);
              // if (empty($_REQUEST['scope'])) http_response(400);
              // $this->id_token = new Jwt();
              // $this->id_token->decode($_REQUEST['id_token'], Aim::$config->secret['client_secret']);
              http_response(200,$aim);
            }
            case 'refresh_token': {
              $jwt = new Jwt();
              $jwt->decode($_REQUEST['refresh_token'], Aim::$config->secret['client_secret']);
              if (!$jwt->valid) {
                http_response(401, 'Invalid');
              }
              $row = sql_fetch(sql_query([
                "SELECT * FROM auth.dbo.client_user_view WHERE code_id = ?",
              ], [
                $jwt->payload['id'],
              ]));
              http_response(200, [
                'access_token'=> (new Jwt())->get([
                  'client_id'=> $row['client_id'],
                  'oid'=> $row['id'],
                  'aud'=> $row['client_id'],
                  'sub'=> $row['id'],
                  'scope'=> $row['scope'],
                ], $row['client_secret'], $ACCESS_TOKEN_LIFETIME),
              ]);
            }
            case 'silent_code': {
              // http_response(200, $aim);
              if (empty($this->access_token)) throw new Exception("geen access_token", 400);
              if (empty($this->client_secret)) throw new Exception("geen client_secret", 400);
              $jwt = new Jwt();
              $jwt->decode($_REQUEST['access_token'], $this->client_secret);
              $access = sqlsrv_fetch_object(sql_query("SELECT scope FROM accountScope WHERE accountname = ? and client_id = ?", [
                $jwt->payload['accountname'],
                $jwt->payload['client_id'],
              ]));
              if ($access) {
                $jwt->payload['scope'] = implode(' ',array_intersect(explode(' ',$access->scope),explode(' ',$jwt->payload['scope'])));
              };
              http_response(200, [
                'access_token'=> (new Jwt())->get($jwt->payload, $this->client_secret, 3600),
              ]);
            }
            case 'word': {
              $account = new Account($_REQUEST);
              http_response(200, [
                'access_token'=> make_token([
                  "typ"=> "JWT",
                  "alg"=> "sha256",
                  "kid"=> $account->user['code_id'],
                ],[
                  "iss"=> $iss,
                  "sub"=> $account->user['sub'],
                  "aud"=> $account->user['aud'],
                  "azp"=> $account->user['azp'],
                  "exp"=> $time + 3600,
                  "nbf"=> $time,
                  "iat"=> $time,
                  "amr"=> ["pwd"],
                ],$account->user['client_secret']),
              ]);
              http_response(200, $account);
            }
          }
        },
      ],
    ],
    '/outlook/authorize'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // ok(1);
          $serviceRoot = 'https://login.microsoftonline.com/common/oauth2/v2.0';
          if ($_REQUEST['code']) {
            $get = json_decode(base64_decode($_REQUEST['state']),true);
            $query = http_build_query([
        			'grant_type' => 'authorization_code',
        			'code' => $_REQUEST['code'],
              'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
        			'scope'=> $get['mse_scope'],
              'client_id'=> Aim::$config->secret['graph']['client_id'],
        			'client_secret' => Aim::$config->secret['graph']['client_secret'],
        		]);
            // ok($query);
            $curl = curl_init($serviceRoot.'/token');
        		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        		curl_setopt($curl, CURLOPT_POST, true);
        		curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
        		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        		$response = curl_exec($curl);
        		// $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        		// if ($httpCode >= 400) {
        		// 	http_response(400, ['errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode]);
        		// }
        		// $curl_errno = curl_errno($curl);
        		// $curl_err = curl_error($curl);
        		// if ($curl_errno) {
        		// 	$msg = $curl_errno.': '.$curl_err;
        		// 	error_log('CURL returned an error: '.$msg);
        		// 	http_response(400, ['errorNumber' => $curl_errno,'error' => $msg]);
        		// }
        		curl_close($curl);
        		$response = json_decode($response, true);
        		$profile = getProfile($response['id_token']);
        		$access = getProfile($response['access_token']);
            $options = [
              'client_id'=> $get['client_id'],
              'accountname'=> $profile['preferred_username'],
              'create'=> 1,
            ];
            $account = sql_fetch($this->sql_exec(AIM_USER_GET, $options));
            sql_query("UPDATE auth.dbo.client_user_view SET mse_access_token = ?, mse_id_token = ?, mse_refresh_token = ?, mse_access = ?, mse_id = ? WHERE id = ?", [
              $response['access_token'],
              $response['id_token'],
              $response['refresh_token'],
        			json_encode($profile),
        			json_encode($access),
              $account->user['id'],
            ]);
            // switch($get['response_type']) {
            //   case 'token': {
            // $url = $serviceRoot.'/authorize?'.http_build_query([
            //   // 'response_type'=> $_REQUEST['response_type'],
            //   'response_type'=> 'code',
            //   'client_id'=> Aim::$config->secret['graph']['client_id'],
            //   'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
            //   'scope'=> $_REQUEST['scope'],
            //   'state'=> base64_encode(json_encode($_GET)),
            // ]);
            // header('Location: '.$url);
            //
            $array_diff = array_diff(explode(' ',$get['scope']),explode(' ',$get['mse_scope']));
            // if (empty($array_diff)) {
            //   ok([$array_diff,$get,$response,$profile,$access]);
            // }
            $get['scope'] = implode(' ',$array_diff);
            $get['id_token'] = (new Jwt())->get(['accountname'=> $account->user['accountname']], Aim::$config->secret['client_secret'], 3600);
            $get['prompt'] = 'accept';
            $url = '/v1?'.http_build_query($get);
            header('Location: '.$url);
            exit;
          }
          switch($_REQUEST['response_type']) {
            case 'token': {
              $url = $serviceRoot.'/authorize?'.http_build_query([
                // 'response_type'=> $_REQUEST['response_type'],
                'response_type'=> 'code',
                'client_id'=> Aim::$config->secret['graph']['client_id'],
                'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
                'scope'=> $_REQUEST['scope'],
                'state'=> base64_encode(json_encode($_GET)),
              ]);
              header('Location: '.$url);
            }
            default: {

              ok($_SERVER['REQUEST_URI']);
            }
          }
        }
      ],
    ],
    '/client_user/scope_account'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $account = new Account($_REQUEST);
          $account->set_account_scope();
          $name = explode('.',explode('@',$_REQUEST['accountname'])[0]);
          $family_name = ucfirst(array_pop($name));
          $given_name = ucfirst(array_shift($name));
          $middle_name = implode(' ',$name);
          $name = implode(' ',array_filter([$given_name, $middle_name, $family_name]));
          sql_query("UPDATE dbo.account SET name=?,email=?,family_name=?,given_name=?,middle_name=?,updated_at=GETDATE() WHERE id = ?", [
            $name,
            $_REQUEST['accountname'],
            $family_name,
            $given_name,
            $middle_name,
            $account->user['account_id'],
          ]);
          http_response(200, $account);
        }
      ],
    ],
  ],
]);

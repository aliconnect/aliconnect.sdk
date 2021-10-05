<?php
require_once(__DIR__.'/fn.php');

class url {
  public function __construct ($url) {
    foreach (parse_url($url) as $k => $v) $this->$k = $v;
    foreach (pathinfo($url) as $k => $v) $this->$k = $v;
    // $this->realpath = realpath($this->path);
  }
}
class jwt {
  private $base64UrlHeader;
  private $base64UrlPayload;
  private $secret;
  private $base64UrlSignature;
  public function __construct () {
    $this->alg = 'sha256';
    $this->expires_after = 3600;
    $this->payload = null;
  	// $result = [
  	// 	// 'header'=> json_decode(base64_decode($base64UrlHeader = array_shift($arr))),
  	// 	'payload'=> $payload = json_decode(base64_decode($base64UrlPayload)),
  	// 	'valid'=> $arr[2] === json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true)),
  	// 	'expired'=> $payload->exp < time(),
  	// 	// 'signature'=> array_shift($arr)
  	// ];
  }
  public function alg($alg) {
    $this->alg = $alg;
    return $this;
  }
  public function expires_after($expires_after) {
    $this->expires_after = $expires_after;
    return $this;
  }
  public function decode($jwt) {
    $arr = explode('.', $jwt);
    if (isset($arr[2])) {
      $this->header = json_decode(base64_decode($this->base64UrlHeader = $arr[0]), true);
      $this->alg = $this->header['alg'];
      $this->payload = json_decode(base64_decode($this->base64UrlPayload = $arr[1]), true);
      $this->not_expired = isset($this->payload['exp']) ? $this->payload['exp'] >= time() : null;
      $this->base64UrlSignature = $arr[2];
    }
    return $this;
  }
  public function secret($secret) {
    $this->secret = $secret;
    return $this;
  }
  public function set($payload) {
    $this->payload=is_string($payload)?json_decode($payload, true):(array)$payload;
    return $this;
  }
  public function get() {
    $this->payload['iat'] = $time = time();
    $this->payload['exp'] = $time + $this->expires_after;
    return implode('.',[
  		$this->base64UrlHeader = json_base64_encode(json_encode(['typ'=>'JWT', 'alg'=>$this->alg])),
  		$this->base64UrlPayload = json_base64_encode(json_encode($this->payload)),
  		$this->base64UrlSignature = json_base64_encode(hash_hmac($this->alg, $this->base64UrlHeader . '.' . $this->base64UrlPayload, strtolower($this->secret), true))
  	]);
  }
  public function validate() {
    if (
      $this->alg &&
      $this->base64UrlHeader &&
      $this->base64UrlPayload &&
      $this->secret
    ) {
      $this->signature = json_base64_encode(
        hash_hmac(
          'SHA256withRSA',//$this->alg,
          $this->base64UrlHeader . '.' . $this->base64UrlPayload,
          $this->secret,
          false//true
        )
      );
      return $this->valid = $this->base64UrlSignature === $this->signature;
    }
  }
}

function get_sql_value($val){
  if (is_null($val)) return 'NULL';
  if (is_numeric($val)) return $val;
  return "'".str_replace("'","''",$val)."'";
}
function get_sql_exec($name, $args){
  $sql = "EXEC $name ".implode(",",array_map(function($key,$value){
    return "@$key=".get_sql_value($value);
  },array_keys($args),array_values($args)))."\n";
  // echo $sql;
  return $sql;
}
function __($message, $args = null) {
  return aim()->translate($message, $args);
}
function chapter($name, $args = null) {
  return [
    'title'=> __("$name-title", $args),
    'content'=> str_replace("\n\n","</p><p>",__("$name-description", $args)),
  ];
}

class aim {
	private $db;
  private $dbconn;
  private $secret;
  private $jwt;
  private $messages_to = [];
  public function message_to($to, $chapter, $options = []) {
    if (empty($this->messages_to[$to])) {
      $this->messages_to[$to] = [
        'to'=> $to,
        'bcc'=> 'max.van.kampen@alicon.nl',
        'chapters'=> [],
        'send'=> 1,
      ];
    }
    $this->messages_to[$to]['chapters'][] = $chapter;
    $this->messages_to[$to] = array_merge_recursive($this->messages_to[$to], $options);
    return $this;
  }
  public function message_send() {
    // $this->debug($this->messages_to);
    foreach ($this->messages_to as $to => $mail) {
      $this->mail($mail);
    }
  }

  public function debug() {
    $t = round(microtime(true)*1000-__startTime);
    $arg_list = func_get_args();
    $bt = debug_backtrace();
    // die(json_encode([
    //   'time'=>$t,
    //   'args'=>func_get_args(),
    //   'trace'=>$bt,
    // ]));
    extract($bt[0]);

    extract(array_merge($bt[0],parse_url($bt[0]['file']),pathinfo($bt[0]['file'])));
    $line = "$basename:$line ";
    if (isset($bt[1]['class'])) $line .= "(".$bt[1]['class'].'->';
    if (isset($bt[1]['function'])) $line .= $bt[1]['function'].") ";
    array_unshift($arg_list, $line . "$t ms");
    $this->reply_json($arg_list);
  }
  public function header($selector, $content = null) {
    if ($content) {
      $this->allow_origin('*');
      header("Access-Control-Expose-Headers: $selector");
      header("$selector: $content");
    } else {
      header("Access-Control-Allow-Headers: $selector");
      $headers = getallheaders();
      return isset($headers[$selector]) ? $headers[$selector] : null;
    }
  }
  public function reply_json($body) {
    $this->allow_origin('*');
    $this->header('Content-Type', 'application/json');
    die(json_encode($body));
  }
  public function check($check, $code, $message = '') {
    if (!$check) {
      $this->error($code, null, $message);
    }
  }
  public function set($selector, $context = null) {
    if (is_array($selector)) {
      foreach ($selector as $key => $value) $this->$key = $value;
    } else {
      $this->$selector = $context;
    }
    // $GLOBALS[$selector] = aim()->args[$selector] = aim()->$selector = $context;
  }
  public function get($selector) {
    if (!isset(aim()->$selector)) {
      aim_error(400, null, "Missing argument $selector");
    }
    return aim()->$selector;
  }
  public function allow_origin($origin) {
    // if (empty(headers_list()['Access-Control-Allow-Origin'])) {
    //   // die(json_encode([$origin, headers_list()]));
    //   header('Access-Control-Allow-Origin: '.$origin);
    // }
  }
  public function error($code, $status = null, $description = null, $errors = null) {
    $error_codes = [
      100 => [
        'status' => 'Continue'
      ],
      101 => [
        'status' => 'Switching Protocols'
      ],
      102 => [
        'status' => 'Processing'
      ],
      200 => [
        'status' => 'OK'
      ],
      201 => [
        'status' => 'Created'
      ],
      202 => [
        'status' => 'Accepted'
      ],
      203 => [
        'status' => 'Non-Authoritative Information'
      ],
      204 => [
        'status' => 'No Content'
      ],
      205 => [
        'status' => 'Reset Content'
      ],
      206 => [
        'status' => 'Partial Content'
      ],
      207 => [
        'status' => 'Multi-Status'
      ],
      300 => [
        'status' => 'Multiple Choices'
      ],
      301 => [
        'status' => 'Moved Permanently'
      ],
      302 => [
        'status' => 'Found'
      ],
      303 => [
        'status' => 'See Other'
      ],
      304 => [
        'status' => 'Not Modified'
      ],
      305 => [
        'status' => 'Use Proxy'
      ],
      306 => [
        'status' => '(Unused)'
      ],
      307 => [
        'status' => 'Temporary Redirect'
      ],
      308 => [
        'status' => 'Permanent Redirect'
      ],
      400 => [
        'status' => 'Bad Request',
        'description' => 'De url is niet correct opgebouwd '
      ],// Invalid ID
      401 => [
        'status' => 'Unauthorized',
        'description' => 'U heeft geen voldoende rechten',
        'description' => 'Er is een probleem met uw rechten op dit domein. Uw account is niet aanwezig of uw bevoegdheden zijn niet voldoende voor uw aanroep.'
      ],
      402 => [
        'status' => 'Payment Required'
      ],
      403 => [
        'status' => 'Forbidden'
      ],
      404 => [
        'status' => 'Not Found',
        'description' => 'Deze pagina op '.$_SERVER['SERVER_NAME'].' kan niet worden gevonden',
        'description' => 'Er is geen webpagina gevonden voor het webadres: '.$_SERVER['REQUEST_URI'],
      ],
      405 => [
        'status' => 'Method Not Allowed'
      ], // Invalid input, validation error
      406 => [
        'status' => 'Not Acceptable'
      ],
      407 => [
        'status' => 'Proxy Authentication Required'
      ],
      408 => [
        'status' => 'Request Timeout'
      ],
      409 => [
        'status' => 'Conflict'
      ],
      410 => [
        'status' => 'Gone'
      ],
      411 => [
        'status' => 'Length Required'
      ],
      412 => [
        'status' => 'Precondition Failed'
      ],
      413 => [
        'status' => 'Request Entity Too Large'
      ],
      414 => [
        'status' => 'Request-URI Too Long'
      ],
      415 => [
        'status' => 'Unsupported Media Type'
      ],
      416 => [
        'status' => 'Requested Range Not Satisfiable'
      ],
      417 => [
        'status' => 'Expectation Failed'
      ],
      418 => [
        'status' => "I\'m a teapot"
      ],
      419 => [
        'status' => 'Authentication Timeout'
      ],
      420 => [
        'status' => 'Enhance Your Calm'
      ],
      422 => [
        'status' => 'Unprocessable Entity'
      ],
      423 => [
        'status' => 'Locked'
      ],
      424 => [
        'status' => 'Failed Dependency'
      ],
      // Unknown in chrome
      424 => [
        'status' => 'Method Failure'
      ],
      425 => [
        'status' => 'Unordered Collection'
      ],
      426 => [
        'status' => 'Upgrade Required'
      ],
      428 => [
        'status' => 'Precondition Required'
      ],
      429 => [
        'status' => 'Too Many Requests'
      ],
      431 => [
        'status' => 'Request Header Fields Too Large'
      ],
      444 => [
        'status' => 'No Response'
      ],
      449 => [
        'status' => 'Retry With'
      ],
      450 => [
        'status' => 'Blocked by Windows Parental Controls'
      ],
      451 => [
        'status' => 'Unavailable For Legal Reasons'
      ],
      494 => [
        'status' => 'Request Header Too Large'
      ],
      495 => [
        'status' => 'Cert Error'
      ],
      496 => [
        'status' => 'No Cert'
      ],
      497 => [
        'status' => 'HTTP to HTTPS'
      ],
      499 => [
        'status' => 'Client Closed Request'
      ],
      500 => [
        'status' => 'Internal Server Error'
      ],
      501 => [
        'status' => 'Not Implemented'
      ],
      502 => [
        'status' => 'Bad Gateway'
      ],
      503 => [
        'status' => 'Service Unavailable'
      ],
      504 => [
        'status' => 'Gateway Timeout'
      ],
      505 => [
        'status' => 'HTTP Version Not Supported'
      ],
      506 => [
        'status' => 'Variant Also Negotiates'
      ],
      507 => [
        'status' => 'Insufficient Storage'
      ],
      508 => [
        'status' => 'Loop Detected'
      ],
      509 => [
        'status' => 'Bandwidth Limit Exceeded'
      ],
      510 => [
        'status' => 'Not Extended'
      ],
      511 => [
        'status' => 'Network Authentication Required'
      ],
      598 => [
        'status' => 'Network read timeout error'
      ],
      599 => [
        'status' => 'Network connect timeout error'
      ],
    ];
    $error = $error_codes[$code];
    http_response_code($code);
    $keys = array_change_key_case(getallheaders(), CASE_LOWER);
    // debug($keys, strstr($keys['accept'], 'text/html'));
    $status = strToUpper($status ?: $error['status']);
    $description = $description ?: (isset($error['description']) ? $error['description'] : $status);
    $request = $_SERVER['REQUEST_METHOD'].' '.$_SERVER['REQUEST_URI'];
    if (!strstr($keys['accept'], 'text/html')) {
      $this->reply_json([
        "error"=> [
          "code"=> $code,
          "message"=> $description,
          "errors"=> $errors ?: [
            [
              "message"=> $description,
              // "domain"=> "usageLimits",
              // "reason"=> "accessNotConfigured",
              // "extendedHelp"=> "https://console.developers.google.com"
            ]
          ],
          "status"=> $status,
        ],
      ]);
    } else {
      readfile(__DIR__.'/error_page.php');
      die("<h1>$status</h1><p>$description</p><p>$request</p><p class='error-code'>HTTP ERROR $code $status</p>");
    }
    die();
  }
  public function request($selector, $context = null) {
    // $this->allow_origin('*');die('a');
    $context = $context ? (array)$context : $_REQUEST;
    if (empty($context[$selector])) {
      $this->error(406, null, "Missing requested parameter $selector");
    }
    return $context[$selector];
  }

  public function query($query, $args = []) {
		// debug($this->secret);
		if (!isset($this->dbconn)) {
      $secret = $this->init_config_secret();
      $config = $this->request('config', $secret);
      $dbs = $this->request('dbs', $config);
      $this->dbconn = sqlsrv_connect ($this->request('server', $dbs),[
        'Database' => $this->request('database', $dbs),
        'UID' => $this->request('user', $dbs),
        'PWD' => $this->request('password', $dbs),
        'ReturnDatesAsStrings' => true,
        'CharacterSet' => 'UTF-8'
      ]);
    }
    if ($args) {
      if (!is_array($args)) {
        $args = func_get_args();
        $query = array_shift($args);
      }
      $args = array_map('get_sql_value', $args);
      $query = vsprintf($query, $args);
    }
    // $GLOBALS['quote'] = strstr($query,"'") ? "" : "'";
		// error_log($query.PHP_EOL, 3, $_SERVER['DOCUMENT_ROOT'].'/log/sql.log');
		// error_log($query, 3, 'sql.log');
		try {
			$query = (isset($nopre) ? '' : 'SET TEXTSIZE -1;SET NOCOUNT ON;').$query;
			// echo $query.PHP_EOL;
			$res = sqlsrv_query ( $this->dbconn, $query , null, ['Scrollable' => 'buffered']);
			return $res;
		} catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
			die();
		}
	}
  public function sqlexec($name, $args) {
    return $this->query(get_sql_exec($name, $args));
  }

  public function init_path(){
    $this->base_path = str_replace([$_SERVER['DOCUMENT_ROOT'],'\\'],['','/'],getcwd());
    $this->set(parse_url($_SERVER['REQUEST_URI']));
    $this->pathname = str_replace($this->base_path,'',$this->path);
    $this->set(pathinfo($this->pathname));
    $this->dirname = str_replace('\\','/',$this->dirname);
    $this->root = realpath($_SERVER['DOCUMENT_ROOT']."/..");
    // $this->debug($this->root);
  }
  public function init_client_config_secret($client_id) {
    return json_decode(file_get_contents($this->root."/config/$client_id.secret.json"), true);
  }
  public function init_config_secret() {
    return $this->secret = isset($this->secret) ? $this->secret : yaml_parse_file($this->root."/config/secret.yaml");
  }

  public function get_granted_scopes($client_id, $account_id) {
    $res = $this->query(
      $q = 'SELECT value FROM attribute.dv WHERE nameId=2174 AND itemId=item.getId(%s) AND hostId=item.getId(%s)'
      ,$account_id
      ,$client_id
    );
    $scopes = [];
    while ($row = sqlsrv_fetch_object($res)) {
      $scopes = array_merge($scopes, explode(" ",$row->value));
    }
    return array_values(array_unique($scopes));
  }

  public function init_auth(){
    // $this->request('client_id');
    header("Access-Control-Allow-Headers: Authorization");
    $headers = getallheaders();
    if (empty($headers["Authorization"])) die();
    $authorization = $headers["Authorization"];
    $jwt = new jwt();
    $this->scopes = [];
    if ($access_token = $authorization ? trim(strstr($authorization, ' ')) : null) {
      $jwt->decode($access_token);
      $payload = $this->request('payload', $jwt);


      $this->client_id = $client_id = $this->request('client_id', $payload);
      $http_origin = $this->request('HTTP_ORIGIN', $_SERVER);
      // $iss = $this->request('iss', $payload);
      // $this->check($http_origin === $iss, 401, "Wrong origin");
      $config_secret = $this->init_client_config_secret($client_id);
      $this->client_secret = $client_secret = $this->request('client_secret', $config_secret);
      $jwt->secret($client_secret)->validate();
      $this->request('valid', $jwt);
      // $this->request('not_expired', $jwt);
      $scope = $this->request('scope', $payload);
      $this->scopes = explode(' ',$scope);
      return $this->access_token = $payload;
      // $this->debug($payload);
    }
    // $client = sqlsrv_fetch_object($this->query('SELECT id,keyname,lower(secret)client_secret FROM item.dv WHERE uid=%s', $this->client_id));
    // $this->jwt->secret($client->client_secret);
  }
  public function init_config($client_id) {
    $this->config = yaml_parse_file($this->root."/config/basic.yaml");
    $this->config = array_replace_recursive(
      yaml_parse_file($this->root."/config/basic.yaml"),
      is_file($fname = $this->root."/config/$client_id.yaml") ? yaml_parse_file($fname) : []
    );
    if (is_file($fname = $this->root."/config/$client_id.yaml")) {
      if ($this->root === '/config.yaml') {
        header('Content-Type: text/yaml');
        readfile ($fname);
        die();
      }
      $this->config = array_replace_recursive($this->config, yaml_parse_file($fname));
    }
    return $this->config;
  }
  public function init_api($scopes = []) {
    foreach($this->config['components']['schemas'] as $schema_name => $schema) {
      $all_schema = [];
      if (isset($schema['allOf'])) {
        foreach($schema['allOf'] as $allOf_schema_name) {
          $all_schema = array_replace_recursive($all_schema, $this->config['components']['schemas'][$allOf_schema_name]);
        }
      }
      $all_schema = array_replace_recursive($all_schema, $schema);
      $this->config['components']['schemas'][$schema_name] = $all_schema;
    }
    $auth_name = 'aliconnect_auth';
    $this->api = [
      'openapi'=>'3.0.1',
      'info'=> array_intersect_key($this->config['info'], array_flip(['title','description','termsOfService','contact','license','version'])),
      // 'externalDocs'=> $this->config['externalDocs'],
      'servers'=> $this->config['servers'],
      'tags'=> isset($this->config['tags']) ? $this->config['tags'] : null,
      'paths'=> $this->config['paths'],
      'components'=> [
        'schemas'=> null,
      ],
    ];
    function get_security_scope($security, $scopes) {
      // return [];
      foreach ($security as $row) {
        if (isset($row['aliconnect_auth'])) {
          return array_values(array_intersect($row['aliconnect_auth'], $scopes));
        }
      }
      return [];
    }
    foreach ($this->api['paths'] as $path_name => $path) {
      foreach ($path as $method_name => $method) {
        if (empty(get_security_scope($method['security'], $scopes))) {
          unset($this->api['paths'][$path_name][$method_name]);
        }
      }
      if (empty($this->api['paths'][$path_name])) {
        unset($this->api['paths'][$path_name]);
      }
    }
    $this->api['components']['securitySchemes'][$auth_name] = [
      "type"=> "oauth2",
      "flows"=> [
        "implicit"=> [
          "authorizationUrl"=> "https://login.aliconnect.nl/oauth/",
        ]
      ]
    ];
    $implict_scopes = [];
    $par_select = [
      'in'=> 'query',
      'name'=> '$select',
      'description'=> 'List of fieldnames',
      // 'required'=> true,
      'schema'=> ['type' => 'string']
    ];
    foreach ($this->config['components']['schemas'] as $schemaName => $schema) {
      $schema_name = strToLower($schemaName);
      $security_write = ["$schema_name.write"];
      $security_read = ["$schema_name.read","$schema_name.write"];
      foreach ($schema['security'] as $name) {
        $security_read[] = "$name.read";
        $security_read[] = "$name.write";
        $security_write[] = "$name.write";
      }
      $security_read = array_values(array_intersect($security_read, $scopes));
      $security_write = array_values(array_intersect($security_write, $scopes));
      if ($security_read) {
        if (isset($schema['properties'])) {
          $schema['properties'] = $this->openapi_properties($schema['properties']);
          $response = [
            '200'=> [
              'description'=> 'Successful operation',
              // 'content'=> (object)[]
            ],
            '400'=> [
              'description'=> 'Invalid ID supplied',
              // 'content'=> (object)[]
            ],
            '404'=> [
              'description'=> 'Attribute not found',
              // 'content'=> (object)[]
            ],
            '405'=> [
              'description'=> 'Invalid input',
              // 'content'=> (object)[]
            ],
          ];
          // foreach ($schema['security'] as $rights => $scopes) {
          //   foreach ($scopes as $scope) {
          //     $api['components']['securitySchemes'][$auth_name]["flows"]["implicit"]["scopes"][$scope] = $scope;
          //   }
          // }
          $implict_scopes = array_merge($implict_scopes, $security_read);
          $par_id = ['in'=> 'path', 'name'=> 'id', 'description'=> "ID of $schemaName",'required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']];
          $this->api['paths']["/$schemaName"]["get"] = [
            'tags'=> [ $schemaName ],
            'summary'=> 'Get list of '.$schemaName,
            'operationId'=> "\item($schemaName).search",
            'parameters'=> [
              $par_select,
              ['in'=> 'query', 'name'=> '$filter', 'description'=> 'Filter', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> '$search', 'description'=> 'Search words seperated with spaces', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> '$order', 'description'=> 'Sort order fieldnames sperated with a comma', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> '$top', 'description'=> 'Maximum number of records', 'schema'=> ['type'=> 'integer', 'format'=> 'int64']],
            ],
            'responses'=> $response,
            'security'=> [[$auth_name=>$security_read]],
          ];
          $this->api['paths']["/$schemaName({id})"]['get'] = [
            'tags' => [ $schemaName ],
            'summary'=> 'Find '.$schemaName.' by ID',
            'description'=> "Returns a single $schemaName object",
            // 'operationId'=> "(new item('$schemaName',{id}))->get();",
            'operationId'=> "item($schemaName).get",
            'parameters'=> [
              $par_id,
              $par_select,
            ],
            'responses'=> $response,
            'security'=> [[$auth_name=>$security_read]],
          ];
          if ($security_write) {
            $implict_scopes = array_merge($implict_scopes, $security_write);
            $this->api['paths']["/$schemaName"]["post"] = [
              'tags'=> [ $schemaName ],
              'summary'=> 'Add a new '.$schemaName,
              'operationId'=> "item($schemaName).add",
              'requestBody'=> [
                'description'=> "$schemaName object that needs to be added",
                'content'=> [
                  'application/json'=> [
                    'schema'=> [
                      '$ref'=> '#/components/schemas/'.$schemaName
                    ]
                  ]
                ],
                'required'=> true
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
            $this->api['paths']["/$schemaName({id})"]['post'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName.' with form data',
              'operationId'=> "item($schemaName).post",
              'parameters'=> [
                $par_id,
              ],
              'requestBody'=> [
                'content'=> [
                  'application/x-www-form-urlencoded'=> [
                    'schema'=> [
                      'properties' => $schema['properties']
                    ]
                  ]
                ]
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
            $this->api['paths']["/$schemaName({id})"]['patch'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName,
              'operationId'=> "item($schemaName).patch",
              'parameters'=> [
                $par_id,
              ],
              'requestBody'=> [
                'description'=> $schemaName.' object that needs to be updated',
                'content'=> [ 'application/json'=> [ 'schema'=> [ '$ref'=> '#/components/schemas/'.$schemaName ]]],
                'required'=> true
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
            $this->api['paths']["/$schemaName({id})"]['delete'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Deletes a '.$schemaName,
              'operationId'=> "item($schemaName).delete",
              'parameters'=> [
                $par_id,
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
          }
          $this->api['tags'][] = array_intersect_key(array_replace([
            'name'=> $schemaName,
          ], $schema), array_flip(['name','description','externalDocs']));
          $this->api['components']['schemas'][$schemaName] = array_intersect_key($schema, array_flip(['properties']));
        }
      }
    }
    foreach ($implict_scopes as $scope) {
      $this->api['components']['securitySchemes'][$auth_name]["flows"]["implicit"]["scopes"][$scope] = "$scope";
    }
  }
  public function translate($message = null, $args = null) {
    if (empty($this->translate_lbrary)) {
      if (empty($this->lang)) {
        if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
          $this->lang = explode('-',explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE'])[0])[0];
        } else {
          $this->lang = 'nl';
        }
      }
      if (function_exists('yaml_parse_file')) {
        if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].'/../translations/'.$this->lang.'.yaml')) {
          $this->translate_lbrary = yaml_parse_file($fname);
        } else {
          $this->translate_lbrary = yaml_parse_file($_SERVER['DOCUMENT_ROOT'].'/../translations/nl.yaml');
          $arr_values = array_chunk(array_values($translate), 100);
          $arr_keys = array_chunk(array_keys($translate), 100);
          $this->translate_lbrary = [];
          foreach ($arr_values as $i => $chuck) {
            $chuck = translate([
              'q' => $chuck,
              'source' => 'nl',
              'target' => $this->lang,
            ]);
            $this->translate_lbrary = array_merge($this->translate_lbrary,array_combine($arr_keys[$i],$chuck));
          }
          yaml_emit_file($fname,$this->translate_lbrary);
        }
        // debug(1, $this->lang, __DIR__.'/lang/'.$this->lang.'.yaml', $translate);
      }
    }
    $message = isset($this->translate_lbrary[$message]) ? $this->translate_lbrary[$message] : $message;
    if ($args) {
      $message = str_replace(array_map(function ($key) {return "%$key%";}, array_keys($args)), array_values($args), $message);
    }
    return $message;
  	// return $args ? vsprintf($message, $args) : $message;
  }

  public function exec($operation, $parameters = []) {
    $this->check(preg_match('/(.+?)\((.*?)\)\.(.+)/', $operation, $match), 406, 'invalid operation id specified');
    $this->check(class_exists($classname = $match[1]), 406, 'Classname not exists');
    $classparams = explode(',',$match[2]);
    $obj = new $classname(...$classparams);
    $this->check(method_exists($obj, $funcname = $match[3]), 406, 'Method not exists');
    return $obj->$funcname($parameters);
  }


  public function attr($id, $name, $value = null, $options = []) {
    $options = array_replace([
      'item_id'=> $id,
      'name'=> $name,
      'value'=> $value,
      // "host_id"=> $this->access_token['client_id'],
      // "user_Id"=> $this->access_token['sub'],
    ], $options);
    $this->sqlexec("item.attr", $options);
  }
  public function mail ($param = []) {
    if (!isset($param['send'])) {
      require_once ('mail.php');
      // debug(3);
      if (!isset($this->mailer)) {
        $this->mailer = new mailer();
      }
      $this->mailer->send($param);
      return $this->mailer;
    } else if ($param['send'] === 1) {
      unset($param['send']);
      aim()->query(
        "INSERT INTO mail.dt (data) VALUES (%s);",
        json_encode($param)
      );
    } else if ($param['send'] === 0) {
    }
  }
  public function sms ($recipients='', $body='', $originator='') {
    // DEBUG: Voor testen email gebruiken
    aim()->mail($a = [
      'to'=> 'max.van.kampen@alicon.nl',
      // 'bcc'=> 'max.van.kampen@alicon.nl',
      'chapters'=> [
        [ 'title' => $recipients . ' ' . $originator, 'content'=> $body ],
      ],
    ]);
    return;
    error_log("AIM.sms send $recipients $body $originator");

		// debug(1);

		require_once ($_SERVER['DOCUMENT_ROOT'].'/../vendor/messagebird/php-rest-api/autoload.php');
		extract($this->secret['config']['sms']);
    // error_log("AIM.sms send $recipients $body $originator $client_id");

		$messagebird = new MessageBird\Client($client_id);
		$message = new MessageBird\Objects\Message;
		$message->originator = substr($originator ?: $_GET['originator'] ?: $put->originator ?: 'Aliconnect', 0, 11);
		$message->recipients = explode(';',$recipients ?: $_GET['recipients'] ?: $put->recipients);
		$message->body = $body?:$_GET['body'] ?: $put->body;
		$response = $messagebird->messages->create($message);
		return $response;
	}

  // OUDE CODE

  public function setAttribute($options) {
    $this->query($q="EXEC item.attr ".implode(',',array_map(function($key,$val){
      if (is_null($val)) {
        $val = 'NULL';
      } else if (!is_numeric($val)) {
        $val = "'".str_replace("'","''",$val)."'";
      }
      return "@$key=$val";
    },array_keys($options),$options)));
    // echo $q;
  }

  private function json_build ($object) {
		if (is_object($object)) foreach ($object as $propertyName => $value) {
			if (is_object($value) && property_exists($value,'$ref')) {
				$path = explode('/',$value->{'$ref'});
				$ref = $this->api;
				array_shift($path);
				foreach ($path as $subname) $ref = property_exists($ref,$subname) ? $ref->$subname : $value;
				$object->$propertyName = $ref;
			}
			else $this->json_build($value);
		}
		return $object;
	}
  private function get_secret () {
		$this->hostroot = $this->root = '/sites/'.$this->hostname;
		if (isset($_GET['base_path'])) {
			// echo $this->root;
			$basePath = $_GET['base_path'];
			// debug($this->root);
		} else {
			$request_url = parse_url($_SERVER['REQUEST_URI']);
			$basePath = '';
			// $path = '/';
			foreach (['/v','/api','/docs','/id','/webroot','/om','?'] as $key) {
				$arr = explode($key, $request_url['path']);
				if (!empty($arr[1])) {
					$basePath = $arr[0];
					// $path = rtrim($arr[1],'/');
					break;
				}
			}
		}
		// debug($this->root, $basePath);

		define('AIM_BASEPATH', $basePath);
		$this->root .= $basePath;



		// $this->root = '/sites/'.$this->hostname;
    if (file_exists($_SERVER['DOCUMENT_ROOT'].$this->root.'/webroot')) {
      $this->root = $this->root.'/webroot';
    }
		$this->secret = [];
		$root_array = explode('/', $this->root);
		$this->paths = [];
		while (!empty($root_array)) {
			$this->paths[] = implode('/', $root_array);
			array_pop($root_array);
		}
		$this->paths[] = '/..';
		$this->paths = array_reverse($this->paths);
		foreach ($this->paths as $path) {
			if (is_file($secretfile = $_SERVER['DOCUMENT_ROOT'].$path.'/secret.json')) {
				$this->secret = array_replace_recursive($this->secret, json_decode(file_get_contents($secretfile), true));
			}
		}
		if (isset($this->secret['config']['aim']['client_secret'])) {
			$this->client_secret = $this->secret['config']['aim']['client_secret'];
		}
	}
  private function get_authorization () {
		$this->headers = array_change_key_case(getallheaders(), CASE_LOWER);
		$cookie = [];
		if (!empty($this->headers['cookie'])) {
			parse_str(str_replace('; ','&',$this->headers['cookie']), $cookie);
		}
		define('AIM_KEYS', $keys = array_change_key_case(array_replace($this->headers, $_GET), CASE_LOWER) );
		if (!empty($keys['authorization'])) {
			$keys['access_token'] = trim(strstr($keys['authorization'], ' '));
			// debug($this->access);
		}
		foreach (['access_token', 'x-api-key', 'api-key', 'api_key', 'apikey'] as $key) {
			if (!empty($keys[$key])) {
				$token = $keys[$key];
			}
		}
		if (!empty($token)) {
			$token_arr = explode('.', $token);
			$this->payload = $payload = get_token($token, $this->client_secret);
		}
    else {
			$payload = [
				'iss'=> $_SERVER['SERVER_NAME'],
			];
		}
		$this->access = $payload;
		if (isset($this->access['sub'])) {
			$sub = $this->access['sub'];
		}
    else if (isset($_GET['sub'])) {
			$sub = $_GET['sub'];
		}
		if (isset($sub)) {
			// debug(1);
      define('__AIM_ROOT_USER__', $this->root .= '/config/'.$sub);
      if (!is_dir($_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__)) {
        mkdir($_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__,0777,true);
      }
			$this->paths[] = $this->root;
		}

		if (file_exists(($aim_root = AIM_DOMAIN_ROOT).'/secret.json')) {
			define('AIM_ROOT', $aim_root );
		}
    else {
			$this->account = sqlsrv_fetch_object($this->query(
				'EXEC account.get @hostName=%1$s,@accountName=%2$s,@method=%3$s,@url=%4$s',
				AIM_DOMAIN,
				$sub = isset($payload['sub']) ? $payload['sub'] : '',
				$_SERVER['REQUEST_METHOD'],
				$_SERVER['REQUEST_URI']
			));
      // debug(AIM_DOMAIN, $this->account);
			if (!file_exists($aim_root)) {
				if (!isset($this->account->client_id)) {
					// die($aim_root);
          header('Location: https://aliconnect.nl?prompt=account_domain&domain=' . $_SERVER['HTTP_HOST']);
          die();
          die(http_response_code(401));
          debug(2,$this->account);
					return aim_log("Unkown client id", 401, $this->account);
				}
				$aim_root = $_SERVER['DOCUMENT_ROOT'].'/'.$this->account->ClientID;
			}
			define('AIM_ROOT', $aim_root );
			if (!is_file(AIM_ROOT.'/secret.json')) {
				file_put_contents(AIM_ROOT.'/secret.json', json_encode([
					'config' => [
						'aim'=> [
							'client_secret'=>$this->account->client_secret,
						],
					],
				], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
			}
		}
		$this->access = $payload;
	}
  private function build_config($paths) {
		$config = [];
		foreach (array_reverse($paths) as $path) {
			$config_json = $path . '/config.json';
			if (is_file($config_json)) {
				$config = array_replace_recursive($config, json_decode(file_get_contents($config_json), true));
			}
		}
		return $config;
	}
  private function initapi ($config = null) {
		if ($config) {
      if (!is_array(yaml_parse($config))) {
        echo $config;
        die();
      }
			if (!file_exists($_SERVER['DOCUMENT_ROOT'].$this->root)) {
				mkdir($_SERVER['DOCUMENT_ROOT'].$this->root, 0777, true);
			}
			file_put_contents($_SERVER['DOCUMENT_ROOT'].$this->root.'/config.yaml', $config);
		}
		$this->api = [];
		$last_modified = 0;
		// debug($this->paths);
		$this->paths = array_values(array_unique($this->paths));
		// debug($this->paths);

		$paths = [];
		$last_ft = 0;
		foreach ($this->paths as $path) {
			$path = $_SERVER['DOCUMENT_ROOT'].$path;
			$paths[] = $path;
			$config_json = $path . '/config.json';
			$api_json = $path . '/api.json';
			if (function_exists('yaml_parse')) {
				$config_yaml = $path . '/config.yaml';
				$config_local_yaml = $path . '/config.local.yaml';
				if (is_file($config_local_yaml)) {
					if (!is_file($config_yaml) || filemtime($config_local_yaml) > filemtime($config_yaml)) {
						file_put_contents($config_yaml, file_get_contents($config_local_yaml));
					}
				}
				if (is_file($config_yaml)) {
					if (!is_file($config_json) || filemtime($config_yaml) > filemtime($config_json)) {
						file_put_contents($config_json, json_encode(yaml_parse_file($config_yaml)));
					}
				}
			}
			if (is_file($config_json)) {
				if (!is_file($api_json) || filemtime($config_json) > filemtime($api_json) || $last_ft > filemtime($api_json)) {
					$config = $this->build_config($paths);
          // debug($config);
					$config['updated'] = date('Y-m-d h:i:s');
					file_put_contents($config_json, json_encode($config));
					$this->config_to_api($path, $config);
				}
				$last_ft = filemtime($config_json);
			}
			if (is_file($api_json)) {
				$apifile = $api_json;
			}
    }

		// debug($apifile);
		$this->api = json_decode(file_get_contents($apifile));
		// $this->api->apifile = $apifile;

		// debug($this->api);
		// $this->api = $this->config_to_api($this->api);





		// if (isset($this->access['sub'])) {
		// 	file_put_contents($this->root.'/api.json', json_encode($this->config_to_api($this->api)));
		// 	// $api = $this->config_to_api($this->api);
		// }

		// if (isset($this->access['sub'])) debug($this->paths);
		// debug(1);
		// $data = file_get_contents($this->apifile);
		// $this->api = json_decode($data);
		// $this->api = $config;

	}
  private function openapi_properties($properties) {
    if ($properties) {
      $openapi_property_properties = [
        'type'=>0,
        'title'=>0,
        'format'=>0,
        'multipleOf'=>0,
        'maximum'=>0,
        'exclusiveMaximum'=>0,
        'minimum'=>0,
        'exclusiveMinimum'=>0,
        'maxLength'=>0,
        'minLength'=>0,
        'pattern'=>0,
        'maxItems'=>0,
        'minItems'=>0,
        'uniqueItems'=>0,
        'maxProperties'=>0,
        'minProperties'=>0,
        'required'=>0,
        'enum'=>0,
        'description'=>0,
      ];
      foreach ($properties as $propertyName => $property) {
        $property = array_intersect_key(array_replace(['type'=>'string'],(array)$property), $openapi_property_properties);
        // $property['description'] = "$propertyName";
        if (isset($property['enum'])) {
          if (!$property['enum']) unset ($property['enum']);
          else if (!is_array($property['enum'])) $property['enum'] = explode("|",$property['enum']);
          else if (is_assoc($property['enum'])) $property['enum'] = array_keys($property['enum']);
        }
        $properties[$propertyName] = $property ?: (object)[];
      }
    }
    return $properties ?: (object)[];
  }
  private function config_to_api ($root,$api) {
    $openapi_schema_properties = array_flip(['properties']);
		$openapi_properties = ['info'=>null,'externalDocs'=>null,'servers'=>null,'tags'=>null,'paths'=>null,'components'=>null,'security'=>null];
    // $this->url_project = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http").'://'.$_SERVER['SERVER_NAME'];
    $this->url_project = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http").'://'.AIM_DOMAIN.'.'.str_replace(AIM_DOMAIN.'.','',$_SERVER['SERVER_NAME']);
    // debug($this->url_project);
		$api['config']['hostname'] = AIM_DOMAIN;
    $api['config']['aim']['servers'][] = ['url'=> $this->url_project.'/api'];

    $account = sqlsrv_fetch_object($this->query(
      "EXEC account.get @hostName=%s",
      AIM_DOMAIN
    ));
		if (!$account) {
			return;
		}
		// debug($account);
    $api = array_replace_recursive($api, [
      'aud'=> $account->clientId,
      'lastModifiedDateTime'=> date('Y-m-d H:i:s.999'),
      'config'=> [
        'aim'=> [
          'client_id'=> $account->client_id = strtolower($account->client_id),
        ]
      ]
    ]);
		$api['tags'] = [ 'Authentication' => ['name'=> 'Authentication' ], 'Messages' => ['name'=> 'Messages' ], 'Files' => ['name'=> 'Files' ] ];
		$get_parameters = [
			['in'=> 'query', 'name'=> 'top', 'description'=> 'Maximum number of records', 'schema'=> ['type'=> 'integer', 'format'=> 'int64']],
			['in'=> 'query', 'name'=> 'select', 'description'=> 'List of fieldnames', 'schema'=> ['type' => 'string']],
			['in'=> 'query', 'name'=> 'filter', 'description'=> 'Filter', 'schema'=> ['type'=> 'string']],
			['in'=> 'query', 'name'=> 'search', 'description'=> 'Search words seperated with spaces', 'schema'=> ['type'=> 'string']],
			['in'=> 'query', 'name'=> 'order', 'description'=> 'Sort order fieldnames sperated with a comma', 'schema'=> ['type'=> 'string']],
		];
		$response = [
			'200'=> [
				'description'=> 'Successful operation',
				// 'content'=> (object)[]
			],
			'400'=> [
				'description'=> 'Invalid ID supplied',
				// 'content'=> (object)[]
			],
			'404'=> [
				'description'=> 'Attribute not found',
				// 'content'=> (object)[]
			],
			'405'=> [
				'description'=> 'Invalid input',
				// 'content'=> (object)[]
			],
		];
		$api['paths']['/account'] = [
			'post'=> [
				'tags' => [ 'Authentication' ],
				'operationId'=> 'account.post',
				'requestBody'=> [ 'content'=> [ 'application/x-www-form-urlencoded'=> ['schema'=> ['properties' => [
					'emailaddress'=> ['type'=> 'string','description'=> ''],
					'scope'=> ['type'=> 'string','description'=> ''],
				]]]]],
				'responses'=> ['200'=> ['description'=> 'successful operation']],
				'security'=> [['aim_auth'=> ['admin.readwrite']]]
			],
      'patch'=> [
				'tags' => [ 'Authentication' ],
				'operationId'=> 'account.patch',
				'requestBody'=> [
					'content'=> [
						'application/json'=> [
							'schema'=> [
								'properties'=> [
									'emailaddress'=> ['type'=> 'string','description'=> ''],
									'scope'=> ['type'=> 'string','description'=> ''],
								]
							]
						]
					]
				],
				'responses'=> ['200'=> ['description'=> 'successful operation']],
				'security'=> [['aim_auth'=> ['admin.readwrite']]]
			],
      'delete'=> [
				'tags' => [ 'Authentication' ],
				'operationId'=> 'account.delete',
				'responses'=> ['200'=> ['description'=> 'successful operation']],
				'security'=> [['aim_auth'=> ['admin.readwrite']]]
			],
		];
		$api['paths']['/file({id})'] = [
			'patch'=> [
				'tags' => [ 'Files' ],
				'summary'=> 'Updates a file',
				'operationId'=> 'file_patch',
				'parameters'=> $id_parameter = [ ['name'=> 'id','in'=> 'path','description'=> 'ID of file','required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']]],
				'responses'=> $response,
        'security'=> [['aim_auth' => ["file.write"]],]
			],
			'delete'=> [
				'tags' => [ 'Files' ],
				'summary'=> 'Deletes a file',
				'operationId'=> 'file_delete',
				'parameters'=> $id_parameter,
				'responses'=> $response,
				'security'=> [['aim_auth' => ["file.write"]],]
			]
		];
		// echo AIM_DOMAIN;
    if (isset($api['components']) && isset($api['components']['schemas'])) {
      foreach ($api['components']['schemas'] as $schemaName => $schema) {
        // debug(1, $schemaName, isset($schema['properties']), empty($schema['properties']));
        // if (!isset($schema['properties'])) continue;
        $path_schemaname = $schemaName;
        $schemaNameLower = strtolower($schemaName);
        $api['tags'][$schemaName] = array_filter([ 'name'=> $schemaName, 'description'=> empty($schema['description']) ? '' : $schema['description'] ]);
        if (!isset($schema['security'])) {
          $schema['security'] = [
            'read' => [
              ['api_key' => ["$schemaNameLower.read"]],
              ['aim_auth' => ["$schemaNameLower.read"]],
            ],
            'write' => [
              ['api_key' => ["$schemaNameLower.readwrite"]],
              ['aim_auth' => ["$schemaNameLower.readwrite"]],
            ],
          ];
        }
        $path = "/$path_schemaname";
        $api['paths'][$path] = isset($api['paths'][$path]) ? $api['paths'][$path] : [
          'get'=> [
            'tags'=> [ $schemaName ],
            'summary'=> 'Get list of '.$schemaName,
            'operationId'=> "item($schemaName).find",
            'parameters'=> $get_parameters,
            'responses'=> $response,
            'security'=> $schema['security']['read'],
          ],
          'post' => [
            'tags'=> [ $schemaName ],
            'summary'=> 'Add a new '.$schemaName,
            'operationId'=> "Item($schemaName).add",
            'requestBody'=> [ 'description'=> "$schemaName object that needs to be added", 'content'=> [ 'application/json'=> [ 'schema'=> [ '$ref'=> '#/components/schemas/'.$schemaName ]]], 'required'=> true ],
            'responses'=> $response,
            'security'=> $schema['security']['write'],
          ]
        ];
        $id_parameter = [
          ['name'=> 'id','in'=> 'path','description'=> "ID of $schemaName",'required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']]
        ];
        $path = "/$path_schemaname({id})";
        // if (empty($schema['properties'])) {
        //   $schema['properties'] = (object)[];
        // }
        $api['paths'][$path] = isset($api['paths'][$path]) ? $api['paths'][$path] : [
          'get' => [
            'tags' => [ $schemaName ],
            'summary'=> 'Find '.$schemaName.' by ID',
            'description'=> "Returns a single $schemaName object",
            'operationId'=> "Item($schemaName,id).get",
            'parameters'=> $id_parameter,
            'responses'=> $response,
            'security'=> $schema['security']['read'],
          ],
          'post'=> [
            'tags' => [ $schemaName ],
            'summary'=> 'Updates a '.$schemaName.' with form data',
            'operationId'=> "Item($schemaName,id).post",
            'parameters'=> $id_parameter,
            'requestBody'=> [ 'content'=> [ 'application/x-www-form-urlencoded'=> ['schema'=> ['properties' => $this->openapi_properties($schema['properties']) ]]]],
            'responses'=> $response,
            'security'=> $schema['security']['write'],
          ],
          'patch'=> [
            'tags' => [ $schemaName ],
            'summary'=> 'Updates a '.$schemaName,
            'operationId'=> "Item($schemaName,id).patch",
            'parameters'=> $id_parameter,
            'requestBody'=> [
              'description'=> $schemaName.' object that needs to be updated',
              'content'=> [ 'application/json'=> [ 'schema'=> [ '$ref'=> '#/components/schemas/'.$schemaName ]]],
              'required'=> true
            ],
            'responses'=> $response,
            'security'=> $schema['security']['write'],
          ],
          'delete'=> [
            'tags' => [ $schemaName ],
            'summary'=> 'Deletes a '.$schemaName,
            'operationId'=> "Item($schemaName,id).delete",
            'parameters'=> $id_parameter,
            'responses'=> $response,
            'security'=> $schema['security']['write'],
          ],
        ];
        $api['paths']["/$path_schemaname({id})/file"] = [
          // 'get' => [
          // 	'tags' => [ $schemaName ],
          // 	'summary'=> 'Select all attachements',
          // 	'description'=> 'Returns a list of attachements',
          // 	'operationId'=> "Item($schemaName,id).file(get)",
          // 	'parameters'=> $id_parameter,
          // 	'responses'=> $response,
          // 	'security'=> $schema['security']['read'],
          // ],
          'post'=> [
            'tags' => [ $schemaName ],
            'summary'=> "Adds an attachement to a $schemaName object with form data",
            'operationId'=> "Item($schemaName,id).file(post)",
            'parameters'=> $id_parameter,
            'requestBody'=> [ 'content'=> [ 'multipart/form-data'=> [ 'schema'=> [ 'properties'=> [ 'additionalMetadata'=> [ 'type'=> 'string', 'description'=> 'Additional data to pass to server' ], 'file'=> [ 'type'=> 'string', 'description'=> 'file to upload',  'format'=> 'binary' ]]]]]],
            'responses'=> $response,
            'security'=> [['aim_auth' => ["file.write"]],],
          ],
        ];
        $api['paths']["/$path_schemaname({id})/children"] = [
          'get' => [
            'tags' => [ $schemaName ],
            'summary'=> "Get children of $schemaName object by ID",
            'description'=> "Returns all child objects of a $schemaName object",
            'operationId'=> "Item($schemaName,id).children()",
            'parameters'=> $child_parameters = [
              ['in'=> 'path', 'name'=> 'id', 'description'=> 'ItemID','required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']],
              ['in'=> 'query', 'name'=> 'top', 'description'=> 'Maximum number of records', 'schema'=> ['type'=> 'integer', 'format'=> 'int64']],
              ['in'=> 'query', 'name'=> 'select', 'description'=> 'List of fieldnames', 'schema'=> ['type' => 'string']],
              ['in'=> 'query', 'name'=> 'filter', 'description'=> 'Filter', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> 'search', 'description'=> 'Search words seperated with spaces', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> 'order', 'description'=> 'Sort order fieldnames sperated with a comma', 'schema'=> ['type'=> 'string']],
            ],
            'responses'=> $response,
            'security'=> $schema['security']['read'],
          ],
        ];
        $api['paths']["/$path_schemaname({id})/references"] = [
          'get' => [
            'tags' => [ $schemaName ],
            'summary'=> "Get children of $schemaName object by ID",
            'description'=> "Returns all child objects of a $schemaName object",
            'operationId'=> "Item($schemaName,id).references()",
            'parameters'=> $child_parameters = [
              ['in'=> 'path', 'name'=> 'id', 'description'=> 'ItemID','required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']],
              ['in'=> 'query', 'name'=> 'top', 'description'=> 'Maximum number of records', 'schema'=> ['type'=> 'integer', 'format'=> 'int64']],
              ['in'=> 'query', 'name'=> 'select', 'description'=> 'List of fieldnames', 'schema'=> ['type' => 'string']],
              ['in'=> 'query', 'name'=> 'filter', 'description'=> 'Filter', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> 'search', 'description'=> 'Search words seperated with spaces', 'schema'=> ['type'=> 'string']],
              ['in'=> 'query', 'name'=> 'order', 'description'=> 'Sort order fieldnames sperated with a comma', 'schema'=> ['type'=> 'string']],
            ],
            'responses'=> $response,
            'security'=> $schema['security']['read'],
          ],
        ];
        if (!empty($schema['properties'])) {
          // $api['components']['schemas'][$schemaName]['properties']['Message'] = ['type'=> 'array', 'schema'=> 'Message'];
          foreach ($schema['properties'] as $propertyName => $property ) {
            $property = (array)$property;
            if (!empty($property['type'])
            && !empty($property['schema'])
            && $property['type'] === 'array'
            && isset($api['components']['schemas'][$property['schema']])) {
              $path = "/$path_schemaname({id})/".$propertyName;
              $api['paths'][$path] = [
                'get' => [
                  'tags' => [ $schemaName, $property['schema'] ],
                  'summary'=> "Find $schemaName by ID and selects all of schema ".$property['schema'],
                  'description'=> "Returns a list of $propertyName",
                  'operationId'=> "Item($schemaName,id).link($propertyName,get)",
                  'parameters'=> $child_parameters,
                  'responses'=> $response,
                  'security'=> $schema['security']['read'],
                ],
                'post'=> [
                  'tags' => [ $schemaName ],
                  'summary'=> "Adds an attachement to a $schemaName object with form data",
                  'operationId'=> "Item($schemaName,id).link($propertyName,post)",
                  'parameters'=> $id_parameter,
                  'requestBody'=> [ 'content'=> [ 'multipart/form-data'=> [ 'schema'=> [ 'properties'=> [ 'additionalMetadata'=> [ 'type'=> 'string', 'description'=> 'Additional data to pass to server' ], 'file'=> [ 'type'=> 'string', 'description'=> 'file to upload',  'format'=> 'binary' ]]]]]],
                  'responses'=> $response,
                  'security'=> $schema['security']['write'],
                ],
              ];
              $path = "/$path_schemaname({id})/$propertyName({linkId})";
              $api['paths'][$path] = [
                'delete' => [
                  'tags' => [ $schemaName, $property['schema'] ],
                  'summary'=> "Find $schemaName by ID and selects all of schema ".$property['schema'],
                  'description'=> "Returns a list of $propertyName",
                  'operationId'=> "Item($schemaName,id).link($propertyName,delete)",
                  'parameters'=> [
                    ['in'=> 'path', 'name'=> 'id', 'description'=> 'ItemID','required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']],
                    ['in'=> 'path', 'name'=> 'linkId', 'description'=> 'ItemID','required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']],
                    ['in'=> 'query', 'name'=> 'top', 'description'=> 'Maximum number of records', 'schema'=> ['type'=> 'integer', 'format'=> 'int64']],
                    ['in'=> 'query', 'name'=> 'select', 'description'=> 'List of fieldnames', 'schema'=> ['type' => 'string']],
                    ['in'=> 'query', 'name'=> 'filter', 'description'=> 'Filter', 'schema'=> ['type'=> 'string']],
                    ['in'=> 'query', 'name'=> 'search', 'description'=> 'Search words seperated with spaces', 'schema'=> ['type'=> 'string']],
                    ['in'=> 'query', 'name'=> 'order', 'description'=> 'Sort order fieldnames sperated with a comma', 'schema'=> ['type'=> 'string']],
                  ],
                  'responses'=> $response,
                  'security'=> $schema['security']['read'],
                ],
              ];
            }
          }
        }
      }
    }
    $api['tags'] = array_values($api['tags']);

    // debug($root);

		if (!file_exists($root)) {
			mkdir($root, 0777, true);
		}

		file_put_contents($root.'/api.json', json_encode($api, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
		// return $api;
    $api['paths']['/'] = [
			'get'=> [
				'operationId'=> 'def.get',
				'responses'=> [
					'200'=> ['description'=> 'successful operation']
				]
			],
			'post'=> [
				'operationId'=> 'def.post',
				'responses'=> [
					'200'=> ['description'=> 'successful operation']
				],
				'security'=> [['aim_auth'=> ['admin.readwrite']]]
			]
    ];
		$openapi = array_merge(['openapi'=>'3.0.1'],array_intersect_key($api, $openapi_properties));
    $openapi['security'] = [ [ 'api_key' => [] ] ];
		if (isset($api['components']) && isset($api['components']['schemas'])) {
			foreach ($openapi['components']['schemas'] as $schemaName => $schema) {
			$schema = $schema ?: [];
			$openapi['components']['schemas'][$schemaName] = array_intersect_key($schema,$openapi_schema_properties) ?: (object)[];
			if (isset($schema['properties'])) {
        $openapi['components']['schemas'][$schemaName]['properties'] = $this->openapi_properties($schema['properties']);
      }
		}
		}
		file_put_contents($root.'/openapi.json', str_replace('    ','  ',json_encode($openapi, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)));
		if (function_exists('yaml_emit')) {
			$yaml = yaml_emit($openapi);
			$yaml = str_replace('!php/object "O:8:\"stdClass\":0:{}"','{}',$yaml);
			// $yaml = str_replace('[]','{}',$yaml);
			file_put_contents($root.'/openapi.yaml', $yaml);
		}
  }
  private function query_items($query) {
    $res = $this->query($q = "
    SET NOCOUNT ON
    DECLARE @hostId BIGINT, @classId BIGINT
    SELECT @hostId = id FROM item.dv WHERE hostId=1 AND classId=1002 AND keyname = '$this->client_id'
    SELECT @classId = id FROM item.dv WHERE hostId=@hostId AND classId=0 AND name = '$this->schema_name'

    DECLARE @T TABLE (ID BIGINT)
    INSERT @T SELECT id FROM item.dt WHERE $query
    SELECT NULL AS [@id],*,'$this->schema_name' AS [schema] FROM @T;

    WITH attr (id, name) AS ( SELECT id,name FROM attribute.name WHERE name IN ('$this->properties_select') )
    SELECT itemId,value,name,linkId,userId,data FROM attribute.dt A
    INNER JOIN attr ON attr.id = A.nameId --AND A.hostID = @hostId
    INNER JOIN @T items ON items.id = A.itemId
    ");
    // die($q);

    $items = [];
    $values = [];
    while ($row = sqlsrv_fetch_object($res)) {
      $values[] = $items[$id = $row->ID] = $row;
      // $id = $row->ID
      // $uid = $row->{'@id'};
      // $row->Id = base64_encode("$id-$uid");
      // $row->{'@id'} = $id_path."/$schema_name($uid)";
      $row->{'@id'} = "$row->schema($row->ID)";
      foreach($this->properties as $key) {
        $row->$key = null;
      }
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      $items[$row->itemId]->{$row->name} = $row->value;
      // $items[$row->itemId]->{$row->name} = array_filter([
      //   'value'=> $row->value,
      //   'userId'=> $row->userId,
      //   'linkId'=> $row->linkId,
      //   'data'=> $row->data,
      // ]);
    }
    return $values;
  }
  public function start() {
    $this->get_config();
    debug(2);
	}
  public function api() {
    // $this->globals = $GLOBALS['globals'];
		$this->request_url = parse_url($_SERVER['REQUEST_URI']);
		$this->hostname = $hostname = AIM_DOMAIN;
		$this->get_secret();
		$this->get_authorization();
		$this->initapi();
		define('AIM_API_SUB_ROOT', empty($this->access['sub']) ? '' : AIM_ROOT . '/api/' . $this->access['sub'] );
		define('AIM_API_ROOT', is_dir(AIM_API_SUB_ROOT) ? AIM_API_SUB_ROOT : AIM_ROOT );
  }

	public function api_string() {
		return $this->data;
	}
	public function delete() { }
	public function init() {

    // $headers = array_change_key_case(getallheaders());
    // if (strstr($headers['accept'], 'markdown')) {
    //   if (preg_match('/wiki/',$_SERVER['REQUEST_URI'])) {
    //     header('Location: https://raw.githubusercontent.com/wiki/aliconnect/api/Home.md');
    //   } else {
    //     header('Location: https://raw.githubusercontent.com/aliconnect/api/main/README.md');
    //   }
    //   // header('Location: /wiki/aliconnect/api/Home.md');
    //   return;
    //   header('Location: https://raw.githubusercontent.com/wiki/aliconnect/api/Home.md');
    //   $paths = [
    //     '/sites/'.AIM_DOMAIN.$_SERVER['REQUEST_URI'],
    //     '/sites'.$_SERVER['REQUEST_URI'],
    //     $_SERVER['REQUEST_URI'],
    //     str_replace('/aliconnect/','/sites/',$_SERVER['REQUEST_URI']),
    //     '/../node_modules/@aliconnect'.str_replace(['/sites','/aliconnect','/sdk','/v1'],'',$_SERVER['REQUEST_URI']),
    //   ];
    //   // debug(1);
    //   foreach ($paths as $path) {
    //     foreach (['','.md','Readme.md','Home.md','Index.md','/Readme.md','/Home.md','/Index.md'] as $filename) {
    //       // echo $_SERVER['DOCUMENT_ROOT'].$path.$filename.PHP_EOL;
    //       if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$path.$filename)) {
    //         $headers = array_change_key_case(getallheaders());
    //         if (strstr($headers['accept'], 'markdown')) {
    //           // die($path.$filename);
    //           // header("Cache-Control: no-store");
    //           // header("filename: $filename");
    //           // header("last-modified: ".filemtime($fname) );
    //           // readfile($fname);
    //           // die();
    //           header('Location: '.$path.$filename);
    //           // echo "# $filename\n";
    //           // die();
    //         }
    //         // die();
    //         return;
    //         // die('mjkmjksadf');
    //         // return this;
    //       }
    //     }
    //   }
    // }


    // echo 'ja';



		// debug(1, $this->apifile, $this->data);
		$this->secret = array_replace_recursive($this->secret,json_decode(file_get_contents(AIM_ROOT.'/secret.json'),true)?:[]);

		$this->query(
			"EXEC account.request_add @method=%s,@url=%s,@host=%s",
			$_SERVER['REQUEST_METHOD'],
			$_SERVER['REQUEST_URI'],
			strtok($_SERVER['SERVER_NAME'],'.')
		);

    foreach (['info', 'config', 'web'] as $key) {
			$this->$key = empty($this->api->$key) ? (object)[] : $this->api->$key;
		}
		$this->client_secret = isset($this->secret['config']['aim']['client_secret']) ? $this->secret['config']['aim']['client_secret'] : [];
		// $this->auth = (object)[
		// 	'id_token'=> empty($_COOKIE['id_token']) ? null : $_COOKIE['id_token'],
		// 	'id'=> empty($_COOKIE['id_token']) ? null : get_token($_COOKIE['id_token'], $this->client_secret),
		// ];
		$this->cookie = $_COOKIE;
		$request_url = parse_url($_SERVER['REQUEST_URI']);
		$basePath = AIM_BASEPATH;
		// $path = '/';
		// foreach (['/api','/docs','/id','/webroot','/om','?'] as $key) {
		// 	$arr = explode($key, $request_url['path']);
		// 	if (!empty($arr[1])) {
		// 		$basePath = $arr[0];
		// 		$path = rtrim($arr[1],'/');
		// 		break;
		// 	}
		// }
		// define('AIM_BASEPATH', $basePath);
		// define('AIM_PATH', $path);
		$scope = empty($this->access['scope']) ? [] : explode(' ',$this->access['scope']);
		$scope[] = 'website.read';
		// $scope[] = 'webpage.read';
		// $scope[] = 'contact(265090).name.read';
		$scope[] = 'name email';
		// $this->access['scope'] = empty($this->access['scope']) ? '' : $this->access['scope'];

		$this->access['scope'] = implode(' ',array_unique($scope));

		$this->json_build($this->api);
		/* determine request langage */
		$arr_lang = [];
		/* check for query parameters in REQUEST_URI or HTTP_REFERER */
		if (!empty($_GET['lang'])) {
			$this->lang = explode(',',$_GET['lang'])[0];
		}
		if (empty($this->lang) && !empty($_SERVER['HTTP_REFERER'])) {
			$url = parse_url($_SERVER['HTTP_REFERER']);
			if (!empty($url['query'])){
				parse_str($url['query'],$query);
				if (!empty($query['lang'])) {
					$this->lang = explode(',',$query['lang'])[0];
				}
			}
		}
		if (empty($this->lang) && !empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
			$this->lang = explode('-',explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE'])[0])[0];
		}
		if (empty($this->lang)) {
			$this->lang='en';
		}
		$translate = [];
		if (function_exists('yaml_parse_file')) {
			if (is_file($fname = __DIR__.'/lang/'.$this->lang.'.yaml')) {
				$translate = yaml_parse_file($fname);
			} else {
				$translate = yaml_parse_file(__DIR__.'/lang/nl.yaml');
				$arr_values = array_chunk(array_values($translate), 100);
				$arr_keys = array_chunk(array_keys($translate), 100);
				$translate = [];
				foreach ($arr_values as $i => $chuck) {
					$chuck = translate([
				    'q' => $chuck,
						'source' => 'nl',
						'target' => $this->lang,
				  ]);
					$translate = array_merge($translate,array_combine($arr_keys[$i],$chuck));
				}
				yaml_emit_file($fname,$translate);
			}
			// debug(1, $this->lang, __DIR__.'/lang/'.$this->lang.'.yaml', $translate);
		}
		define('AIM_TRANSLATE', $translate);
		// $path_array = preg_split('/\//',ltrim(AIM_PATH,'/'));
		// if (method_exists($this, $method_name = $path_array[0])) {
		// 	return $this->$method_name();
		// }

		// debug($this->data);
    // debug(AIM_ROOT);
    // die(AIM_ROOT);
    // debug(1);
		if (is_file($fname = AIM_ROOT.'/api.php')) {
			// die('aaa'.AIM_ROOT.$fname);
			require_once ($fname);
		}
		// debug('aaa', __PATH__);
		// if (strpos($_SERVER['REQUEST_URI'],'/api') !== false) {
			try {
				// debug(1, AIM_ROOT);
				$response = $this->request_uri();
        http_response_code(200);
        if ($response) {
          header('Content-Type: application/json');
          echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        die();
			} catch (Exception $e) {
				// echo 'a';
				// DEBUG: Check for method_exists is required otherwise for some unkown reason throw new Exception is always executed even if the code bock of the throw is not executed????
				error_log(vsprintf("request_error\nurl:%s %s%s\nRemote addr: %s%s\n%s", [
					$_SERVER['REQUEST_METHOD'],
					$_SERVER['HTTP_HOST'],
					str_replace("&","\n&",$_SERVER['REQUEST_URI']),
					$_SERVER['REMOTE_ADDR'],
					isset($_SERVER['HTTP_REFERER']) ? ', referer:' . $_SERVER['HTTP_REFERER'] : '',
					isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''
				]));

				if (method_exists('aim', $_SERVER['REQUEST_METHOD'])) {
					// debug(1);
					// http_response_code(404);
					// return;
					// debug(1, $e->getCode());
					die(http_response_code($e->getCode()));
				}
			}
    //   // debug(!is_null($response));
		// 	// if (!is_null($response)) {
    //   //   debug(1);
		// 	// 	header('Content-Type: application/json');
		// 	// 	die(json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
		// 	// }
		// } else {
		// 	if (isset($_GET['prompt'])) {
		// 		if (is_file($fname = AIM_ROOT.'/'.$_GET['prompt'].'.html')) {
		// 			readfile($fname);
		// 			die();
		// 		}
		// 	}
		// }
		return $this;
		// debug(1);
	}
	public function logout() {
		if (isset($_COOKIE['nonce'])) {
			$this->query("UPDATE auth.nonce SET sub=NULL WHERE nonce='$_COOKIE[nonce]'");
		}
		foreach (['id_token', 'access_token', 'refresh_token'] as $key) {
			setcookie($key, $_COOKIE[$key] = null, ['expires' => null, 'path' => '/', 'domain' => 'login.aliconnect.nl', 'secure' => 1, 'httponly' => 1, 'samesite' => 'Lax' ]);
			setcookie($key, null, 0, '/');
		}
		// if ($_SERVER['SERVER_NAME'] !== 'login.aliconnect.nl') {
		// 	// debug(1);
		// 	// die(header('Location: https://login.aliconnect.nl/api/oauth2?prompt=logout'));
		// 	// debug(getallheaders(), $_SERVER);
		//
		// 	die(header('Location: https://login.aliconnect.nl/api/oauth2?prompt=logout&redirect_uri='.urlencode('https://'.$_SERVER['SERVER_NAME']) ));
		// 	// die(header('Location: https://login.aliconnect.nl/?prompt=logout&redirect_uri='.urlencode('https://'.$_SERVER['SERVER_NAME']) ));
		// } else {
		if (!empty($_GET['redirect_uri'])) {
			header('Location: '.$_GET['redirect_uri'] );
		} else {
			header('Location: /' );
		}
			// die();
		// }
	}
	public function httpRequest($req, $res = null) {
		if (is_string($req)) {
			$req = parse_url($req);
		} else if ($req['url']) {
			$req = array_merge($req, parse_url($req['url']));
			unset($req['url']);
		}
		$options = array_replace([
			'protocol' => empty($req['scheme']) ? ($_SERVER['HTTPS'] === 'on' ? 'https:' : 'http:') : $req['scheme'] . ':',
			'host' => $_SERVER['HTTP_HOST'],
			// 'port' => $_SERVER['HTTPS'] === 'on' ? 443 : 80,
			'basePath' => '',
			'path' => $_SERVER['REQUEST_URI'],
			'method' => 'get',
		], $req);
		// debug($options);

		$options = [
			CURLOPT_URL => unparse_url($req = $options),
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_HTTPHEADER => empty($req['headers']) ? [] : $req['headers'],
			// CURLOPT_HEADERFUNCTION, function ( $curl, $header_line ) {
			// 	$this->headers[] = $header_line;
			// 	return strlen($header_line);
			// },
			// CURLOPT_POST => true,
			// CURLOPT_POSTFIELDS => json_encode($post),//http_build_query($post),
			// CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
		];
		// debug($options);

		switch (strtoupper($req['method'])) {
			case 'GET':
				error_log('Doing GET');
				break;
			case 'POST':
				error_log('Doing POST');
				// Add a Content-Type header (IMPORTANT!) This differs from a normal post. The data is transfered as file!!!
				$options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
				$options[CURLOPT_POST] = true;
				$options[CURLOPT_POSTFIELDS] = $req['input'];
				break;
			case 'PATCH':
				error_log('Doing PATCH');
				$options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
				$options[CURLOPT_CUSTOMREQUEST] = 'PATCH';
				$options[CURLOPT_POSTFIELDS] = $req['input'];
				break;
			case 'DELETE':
				error_log('Doing DELETE');
				$options[CURLOPT_CUSTOMREQUEST] = 'DELETE';
				break;
			default:
				error_log('INVALID METHOD: '.$req['method']);
				exit;
		}

		// if (!empty(AIM::$config->aim->api_key)) {
		// 	$options[CURLOPT_HTTPHEADER][] = 'X-Api-Key: '.AIM::$config->aim->api_key;
		// }
		// if (!empty(AIM::$config->aim->access_token)) {
		// 	$options[CURLOPT_HTTPHEADER][] = 'Authorization: Bearer '.AIM::$config->aim->access_token;
		// }
		if (!empty($req->headers)) {
			foreach ($req->headers as $key => $value) {
				$options[CURLOPT_HTTPHEADER][] = "$key: $value";
			}
		}
		// debug ($req,$options);
		$curl = curl_init();
	  curl_setopt_array($curl, $options);
		// curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		// $this->headers = [];
		// curl_setopt($curl, CURLOPT_HEADERFUNCTION, function ( $curl, $header_line ) {
		// 	$this->headers[] = $header_line;
		// 	return strlen($header_line);
		// });
		$response = curl_exec($curl);
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		//die($this->authTokenUrl);

		// http_response_code($httpCode);
		// $curl_errno = curl_errno($curl);
		// $curl_err = curl_error($curl);
		// if ($curl_errno) {
		// 	error_log("CURL returned an error: ".($msg = $curl_errno . ": " . $curl_err));
		// 	return ['errorNumber' => $curl_errno, 'error' => $msg];
		// }
		curl_close($curl);
		// die($response);
		try {$object = json_decode($response);} catch (Exception $e) {}
		$result = $object ?: $response;
		// debug($result);
		return isset($res) ? $res($result) : $result;
	}
	public function api_property ($object) {
		if (is_object($object)) foreach ($object as $propertyName => $value) {
			if (is_object($value) && property_exists($value,'$ref')) {
				$path = explode("/",$value->{'$ref'});
				$ref = $this->api;
				array_shift($path);
				foreach ($path as $subname) {
					if (!isset($ref->$subname)) break;//throw new Exception("Failed Dependency", 424);
					$ref = $ref->$subname;
				}
				$object->$propertyName = $ref;
			}
			else $this->api_property($value);
		}
		return $object;
	}
	public function html_add_page_header($html, $page) {
		// $head1.="
		// 	<link rel='apple-touch-icon' href='/sites/$aim->host/img/logo/logo-60.png' />
		// 	<link rel='apple-touch-icon' sizes='76x76' href='/sites/$aim->host/img/logo/logo-76.png' />
		// 	<link rel='apple-touch-icon' sizes='120x120' href='/sites/$aim->host/img/logo/logo-120.png' />
		// 	<link rel='apple-touch-icon' sizes='152x152' href='/sites/$aim->host/img/logo/logo-152.png' />
		// 	<link rel='apple-touch-startup-image' href='/sites/$aim->host/img/logo/logo-startup.png' />
		// ";
		//
		// //$qp= $aim->location->folders[1]?"'$aim->root' AND P.keyname='$aim->filename'":"'webpage' AND P.masterID=S.id AND P.idx=0";
		// if(!$page->pageID){
		// 	$page->title='Page not found';
		// 	$page->subject='This page is not available.';
		// }
		// $page->src=json_decode($page->files);
		// $page->src=$page->src[0]->src;
		// $page->mobile=$page->mobile?:preg_match("/(android|webos|avantgo|iphone|ipad|ipod|blackberry|iemobile|bolt|boost|cricket|docomo|fone|hiptop|mini|opera mini|kitkat|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
		// $pageBase64=base64_encode("site=".json_encode($page));
		$head = isset($page->title) ? strip_tags($page->title)."</title>\r\n\t<meta property='og:title' name='og:title' content='".str_replace("'","",strip_tags($page->title))."' />": "</title>";
		if (isset($page->subject)) $head .= "\r\n\t<meta property='og:description' name='og:description' content='".str_replace("'","",strip_tags($page->subject))."' />";
		if (isset($page->src)) $head .= "\r\n\t<meta property='og:image' name='og:image' content='".str_replace("'","",strip_tags($page->src))."' />\r\n\t<meta property='og:image:width' content='450'>\r\n\t<meta property='og:image:height' content='300'>";
		$head .= "\r\n\t<meta property='fb:app_id' content='487201118155493'>\r\n\t<meta property='og:type' content='website'>\r\n\t<meta property='og:url' content='".str_replace("'","",strip_tags($_SERVER["REQUEST_URI"]))."' />";
		return str_replace("</title>",$head,$html);
	}

  // public function config () {
  //   debug(1);
  //   return 1;
  // }

	public function request1 ($req = null, $res = null) {
		// $apipos = strpos($_SERVER['REQUEST_URI'], 'api/');
		// $req = $req ?: [
		// 	'method' => $_SERVER['REQUEST_METHOD'],
		// 	'url' => substr($_SERVER['REQUEST_URI'], $apipos != false ? strpos($_SERVER['REQUEST_URI'], 'api/') + 3 : 0  )
		// ];
		// $this->req = $req;

		extract($req);
		$this->method = $method;
		$headers = isset($headers) ? $headers : getallheaders();
		$path = isset($path) ? $path : $url;


		// debug(AIM::$access);
		$arr = explode('?', $path);
		$path = array_shift($arr);
		parse_str(array_shift($arr),$_GET);
		$path = strtr($path,$_GET);
		preg_match_all('/\(([^\)]*)\)/', $path, $pathmatches);
		$pathmatches = $pathmatches[1];
		$pathId = preg_replace('/(\()(.*?)(\))/', '$1$3', $path);
		$this->param = [];
		// debug($this->api['paths']);
		// debug($req, $pathId, $this->api->paths);
		// debug(1,$this->api->paths);
		// if ($_SERVER['REQUEST_URI'] === '/api/token') debug($this->api->info);
		foreach ($this->api->paths as $path_name => $path_def) {
			// debug($path_name, $pathId);
			if (preg_replace('/(\()(.*?)(\))/', '$1$3', $path_name) === $pathId) {
				if (key_exists($method = strtolower($method), $path_def) || key_exists($method = strtoupper($method), $path_def)) {
					$this->method_def = $method_def = $path_def->{$method};
				} else {
					throw new Exception('Method Not Allowed', 405);
				}
				extract((array)$method_def);


				if (isset($security)) {

          // debug($security);

					// /* CODE VOOR SECURITY CONTACT DATA */
					// $access_scope_array = explode(' ', trim($this->access['scope']));
					// preg_match('/\/(.+)\((.+)\)/', $path, $components);
					// if ($components) {
					// 	$schemaname = $components[1];
					// 	$id = $components[2];
					// 	if ($schemaname === 'Contact') {
					// 		if (!empty($_GET['$select'])) $select = $_GET['$select'];
					// 		if (!empty($_GET['select'])) $select = $_GET['select'];
					// 		$select = explode(',',$select);
					// 		$contact_scope = array_values(array_filter($access_scope_array, function($val){return !strstr($val, '.');}));
					// 		$outside_scope = array_diff($select, $contact_scope);
					// 		if ($outside_scope) throw new Exception('Unauthorized', 401);
					// 		// debug($id,$select,$access_scope_array,$outside_scope,$contact_scope);
					// 	}
					// }


          // foreach ($security as $row) {
          //   // debug($row);
          //   foreach ($row as $key => $value) {
          //     foreach ($value as $scope) {
          //       if ()
          //       // echo $scope.PHP_EOL;
          //     }
          //   }
          // }

					if (!hasScope($security, $this->access['scope'])) {
            // DEBUG: MAX
						// throw new Exception('Unauthorized', 401);
					}
				}
				$operationId = $operationId = empty($operationId) ? $path : $operationId;
				$paramlist = [];
				foreach ($pathmatches as $i => $parameter) {
					if (strstr($parameter,'=')) {
						parse_str(str_replace(',','&',$parameter), $parameter);
						$paramlist[] = $parameter;
					} else {
						array_push($paramlist,...explode(',',$parameter));
					}
				}
				$paramByName = [];
				if (!empty($parameters)) {
          foreach ($parameters as $parameter) {
            if ($parameter->in === 'path') {
              $paramByName[$parameter->name] = array_shift($paramlist);
            }
          }
        }

				// debug($operationId);

				if ($operationId) {
					$obj = $this;
					// $arr = explode('/',ltrim($operationId,'/'));
					$arr = explode('.',$operationId);
					foreach ($arr as $functionName) {
						$param = preg_split('/\(|\)|,/',trim($functionName,')'), NULL);
						$functionName = array_shift($param);
						if ($functionName === 'AIM') {
							continue;
						} else if (!empty($param)) {
							foreach($param as $i => $paramName) {
								if (isset($paramByName[$paramName])) {
									$param[$i] = $paramByName[$paramName];
								}
							}
						}
						if (isset($req['body'])) {
							$param[] = $req['body'];
						}


						// debug($req['body']);
						if (method_exists($obj, $functionName)) {
							// debug($operationId);
							$obj = $obj->$functionName(...$param);
						} else if (class_exists($functionName)) {
							$obj = new $functionName(...$param);
						} else {
							// foreach ($_GET as $key => $value) {
							// 	if (method_exists($obj, $functionName = $key . '_' . $value)) {
							// 		return $obj->$functionName(...$param);
							// 	}
							// }
							// debug($functionName);
							// debug(1);
							throw new Exception('Not Implemented', 501);
						}
					}
					// debug(1,$functionName, $obj);
					// debug(1);
					return $obj;
				}
			}
		}
		// debug(111,$pathId,$this->api->paths);
		throw new \Exception('Not found', 404);
	}
	public function request_uri() {
    // debug($pathinfo, $dirname, $pathname);
    // debug(111);


		$REQUEST_METHOD = strtolower(trim($_SERVER['REQUEST_METHOD']));
		// $path = explode('/',preg_replace('/.*\/api\//','',$this->request_url['path']));
    $path = explode('/',__PATH__);
    $path[] = $REQUEST_METHOD;
    $this->require(array_shift($path), array_shift($path) ?: $REQUEST_METHOD, $response);
    if (!is_null($response)) return $response;
		foreach ($_GET AS $key => $value) {
      $this->require($key, $value, $response);
      if (!is_null($response)) return $response;
      // echo $key.'_'.$value.function_exists($functionName = $key.'_'.$value).PHP_EOL;
			if (function_exists($functionName = $key.'_'.$value)) {
				return $functionName();
			}
		}
		$this->request_url['path'] = __PATH__;//strstr($this->request_url['path'],'/api/');

    // debug($this->request_url['path']);

    // $url = parse_url($_SERVER['REQUEST_URI']);
    // $pathinfo = pathinfo($url['path']);
    // $dirname = $pathinfo['dirname'];
    // $pathname = explode('/api',$dirname)[1]?:'/';
    //
    //
    // if (method_exists($this, $REQUEST_METHOD) && ($result = $this->$REQUEST_METHOD())) {
    //   return $result;
    // }
    // debug($dirname, $this->request_url['path']);

    // if ($pathname === '/' && empty($_GET['request_type'])) {
    if (__PATH__ === '/' && empty($_GET['request_type'])) {
			// if ($_SERVER['REQUEST_URI'] === '/api/token') debug(1);
      // $REQUEST_METHOD = 'POST';
      if (method_exists($this, $REQUEST_METHOD)) {
        return $this->$REQUEST_METHOD();
      }
      // debug(is_callable([$this, $_SERVER['REQUEST_METHOD']]), is_callable([$this, 'post']), method_exists($this, $REQUEST_METHOD));
      // debug($REQUEST_METHOD);
      //
			// return $this->$REQUEST_METHOD();
		}

		if ($REQUEST_METHOD === 'POST' && preg_match('/\/\$batch/', $_SERVER['REQUEST_URI'])) {
			$body = json_decode(file_get_contents('php://input'), true);
			// debug(1);
			$response = ['responses' => []];
			if ($body['requests']) {
				foreach ($body['requests'] as $i => $request) {
					$response['responses'][] = [
						'id'=> isset($body['requests'][$i]['id']) ? $body['requests'][$i]['id'] : $i,
						'status' => 200,
						'body' => $this->request($request)
					];
				}
			}
			return $response;
		}
    else {

			// $apipos = strpos($_SERVER['REQUEST_URI'], 'api/');
      // debug(2,$apipos);
			return $this->request([
				'method' => $REQUEST_METHOD,
        // 'url' => substr($_SERVER['REQUEST_URI'], $apipos != false ? strpos($_SERVER['REQUEST_URI'], 'api/') + 3 : 0  ),
        'url' => __PATH__,
        // 'url' => $pathname,
			]);
		}
	}
	public function login($options = []) {//$prompt = 'login') {
		if (empty($this->client_secret)) return;

		if (isset($_GET['prompt']) && $_GET['prompt'] === 'logout') {
	    $this->logout();
	    die(header('Location: /'));
	  } else if (!empty($_GET['code'])) {
		  $this->get_access_token();
			// debug(1666);

			// debug(1111, $_GET, $_COOKIE);

		  unset($_GET['code']);
		  unset($_GET['state']);
		  $request_uri = explode('?', $_SERVER['REQUEST_URI'])[0] . ( empty($_GET) ? '' : '?' . http_build_query($_GET) );
		  die (header('Location: '.$request_uri));
		} else if (!empty($_COOKIE['id_token'])) {
			// debug(1);
			return;
		} else if (empty($options)) {
			// debug(1);
			return;
		}
		// debug(1);

		// if (isset())

		// if (!empty($_COOKIE['access_token'])) {
		// 	return;
		// } else {
		//   // debug(2);
		//
		//   // debug($_COOKIE);
		//   // $access = json_decode(base64_decode(explode('.', $_COOKIE['access_token'])[1]), true);
		//   // $id = json_decode(base64_decode(explode('.', $_COOKIE['id_token'])[1]), true);
		//   // $refresh = json_decode(base64_decode(explode('.', $_COOKIE['refresh_token'])[1]), true);
		//   //
		//   // $access['time_left'] = $access['exp']-time();
		//   // $id['time_left'] = $id['exp']-time();
		//   // $refresh['time_left'] = $refresh['exp']-time();
		//   //
		//   // debug(1, $_COOKIE, $id, $access, $refresh );
		//   //
		//   // $aim->login([
		//   //   'scope' => 'email name phone test',
		//   // ]);
		//
		// }
		// debug(1);
		if (!isset($_GET['state'])) {
			$_GET['state'] = uniqid();
		}
		setcookie('state', $_GET['state'], time() + 300);
		$request_uri = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
		$options = array_replace([
			'client_id' => $this->api->config->aim->client_id,
			'response_type' => 'code',
			// 'redirect_uri' => $_SERVER['HTTP_REFERER'],//($_SERVER['HTTPS']=='on'?'https://':'http://').$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'],
			'redirect_uri' => $request_uri,
			'scope' => implode(' ', $this->api->config->aim->scope),
			// 'state' => isset($_GET['state']) ? $_GET['state'] : '',
			'state' => isset($_GET['state']) ? $_GET['state'] : '',
			'prompt' => isset($_GET['prompt']) ? $_GET['prompt'] : ''
		], $options);

		// debug(AIM_OAUTH2_URL . '?' . http_build_query($options));
		// debug(1, $_COOKIE);

		die(header('Location: ' . AIM_OAUTH2_URL . '?' . http_build_query($options)));
	}
	public function get_access_token() {
		// debug($this->api->config->aim);
		// debug($_GET, $_COOKIE);
		// extract($_GET);
		// if (isset($_COOKIE['state']) && $_COOKIE['state'] != $_GET['state']) return;

		// debug($url, $request_data, $_GET, $_COOKIE, $this->config);
		$request_data = [
			'grant_type' => 'authorization_code',
			'code' => $_GET['code'],
			'client_id' => $this->config->aim->client_id,
			'client_secret' => $this->client_secret,
			'access_type' => 'offline' // only if access to client data is needed when user is not logged in
		];
		// $url = $this->api->config->aim->auth->tokenUrl;
		$url = 'https://login.aliconnect.nl/api/token';


		// debug(1,$_GET);
		// debug(11666, $url, $request_data);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $request_data);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);




		// die($response);
		$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		if ($httpCode >= 400) {
			// debug($httpCode);
			// debug($httpCode,$response);
			die(http_response_code($httpCode));
			// throw new Exception('Fault', $httpCode);
		}
		$curl_errno = curl_errno($curl);
		$curl_error = curl_error($curl);
		curl_close($curl);
		if ($curl_errno) throw new Exception($curl_error, $curl_err);
		$result = json_decode($response);
		// $access = json_decode(base64_decode(explode('.', $result->access_token)[1]), true);

		// debug($access, $result, $_COOKIE);
		// debug($result, json_decode(base64_decode(explode('.',$result->id_token)[1])), json_decode(base64_decode(explode('.',$result->access_token)[1])));
		// debug($result);
		setcookie('id_token', $result->id_token, time() + 30 * 24 * 3600, '/');
		setcookie('access_token', $result->access_token, time() + $result->expires_in * 1000, '/');
		setcookie('refresh_token', $result->refresh_token, time() + 30 * 24 * 3600, '/');
		// setcookie('device_id', uniqid(), time() + 365 * 24 * 3600);
		// debug(1);
		/* @todo opslaan refresh_token per gebruiker */
		// debug($result, $result->access_token, $result->access_token, $_COOKIE);
		// if ($result->refresh_token) {
		// 	$refresh_token = json_decode(base64_decode(explode('.',$result->refresh_token)[1]));
		// 	if (strstr($_SERVER[SERVER_NAME],'localhost')) setcookie('refresh_token', $result->refresh_token, $refresh_token->exp, '/');
		// 	else setcookie('refresh_token', $result->refresh_token, [expires => $refresh_token->exp, path => '/api/', domain => $_SERVER[SERVER_NAME], secure => 1, httponly => 0, 'samesite' => 'Lax']);
		// }

		// debug($_COOKIE);
		return $result;
	}
  public function account_get ($mailto, $chapters = []) {
    $account = sqlsrv_fetch_object(aim()->query(
      "EXEC [account].[get] @accountname=%s",
      $mailto
    ));
    if (!$account->AccountID) {
      $account = sqlsrv_fetch_object(aim()->query(
        "EXEC [account].[get] @accountId=%d",
        aim()->access['sub']
      ));
      $newaccount = sqlsrv_fetch_object(aim()->query("INSERT INTO item.dt (hostID,classID,title) VALUES (1,1004,'$mailto');
      DECLARE @id INT;
      SET @id=scope_identity();
      EXEC item.attr @ItemID=@id, @NameID=30, @value='$mailto'
      "));
      // Maak nieuwe account aan
      $newaccount = sqlsrv_fetch_object(aim()->query(
        "EXEC [account].[get] @accountname=%s",
        $mailto
      ));
      array_unshift($chapters, [
        'title' => __('new_account_title'),
        'content'=> __('new_account_content', $account->AccountName),
      ]);
    }
    if (!empty($chapters)) {
      $this->mail([
        'send'=> 1,
        'to'=> $mailto,
        'bcc'=> "max.van.kampen@alicon.nl",
        // 'Subject'=> __('qr_registratie'),
        'chapters'=> $chapters,
      ]);
    }
  }
  public function getdata ($insert) {
    if (empty($this->hostId)) {
      $this->hostId = sqlsrv_fetch_object($this->query("SELECT id FROM item.dv WHERE hostId=1 AND classID=1002 AND keyname = '$this->hostname'"))->id;
      // debug($this->hostId);
    }
    $res = $this->query($q="SET NOCOUNT ON;DECLARE @itemlist itemlist;$insert;EXECUTE item.data @hostId=$this->hostId, @userId=265090, @itemlist=@itemlist");
    // die($q);
    $items = (object)[];
    while($row = sqlsrv_fetch_object($res)) $items->{$row->ID} = $row;
    sqlsrv_next_result($res);
    while($row = sqlsrv_fetch_object($res)) {
      $items->{$row->ItemID}->{$row->AttributeName} = $items->{$row->ItemID}->{$row->AttributeName} ? (is_array($items->{$row->ItemID}->{$row->AttributeName}) ? $items->{$row->ItemID}->{$row->AttributeName} : [ ['Value' => $items->{$row->ItemID}->{$row->AttributeName}] ]) : [];
      $items->{$row->ItemID}->{$row->AttributeName}[] = $row;
    }
    return $items;
  }
  public function get1 () {


    // debug(stripcslashes('api\account'), class_exists(addcslashes('api\account')));

    // $url = parse_url($_SERVER['REQUEST_URI']);
    // $pathinfo = pathinfo($url['path']);
    // $dirname = $pathinfo['dirname'];
    // $basename = $pathinfo['basename'];
    // $pathname = explode('/api',$dirname)[1]?:'/';
    //
    // return;
    $sub = $this->access['sub'];
    if (isset(AIM_KEYS['accept']) && strstr(AIM_KEYS['accept'],'yaml')) {
      if (isset($_GET['account'])) {
        // debug(5, $this->access, $_SERVER['DOCUMENT_ROOT'].$this->root."/config/$sub/config.yaml");
        if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$this->root."/config.yaml")) {
          // echo $_GET['account'].$_SERVER['DOCUMENT_ROOT'].$this->root."/config/$sub/config.yaml";
          readfile($fname);
        }
      } else {
        if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$this->hostroot.'/config.yaml')) {
          readfile($fname);
        }
      }
    } else {
      header('Content-Type: application/json');
      // debug($_SERVER['DOCUMENT_ROOT'].$this->root."/api.json");
      if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$this->root."/api.json") || is_file($fname = $_SERVER['DOCUMENT_ROOT'].$this->hostroot."/api.json")) {
        readfile($fname);
      }
      die();
      debug($sub);
      die(json_encode($this->api));

      debug(1);
      $schemaKeys = array_keys((array)$this->api->components->schemas);
      $keys = implode("','",$schemaKeys);
      if (empty($this->hostId)) {
        $account = sqlsrv_fetch_object($this->query("EXEC account.get @hostname='$this->hostname'"));
        $this->api->client_id = $account->client_id;
        // debug($account);
        $row = sqlsrv_fetch_object($this->query("SELECT id,uid FROM item.dv WHERE hostId=1 AND classID=1002 AND keyname = '$this->hostname'"));
        $this->hostId = $row->id;
      }
      $res = $this->query("
      SET NOCOUNT ON
      DECLARE @T TABLE (_ID BIGINT)
      INSERT @T SELECT id FROM item.dt WHERE DeletedDateTime IS NULL AND hostId=$this->hostId AND classId=0;
      SELECT id,name FROM item.dt I INNER JOIN @T T ON T._ID = I.id
      SELECT * FROM attribute.vw A INNER JOIN @T T ON T._ID = A.itemId AND hostId = $this->hostId
      ");
      $items = (object)[];
      while($row = sqlsrv_fetch_object($res)) {
        if (isset($this->api->components->schemas->{$row->name})) {
          $items->{$row->id} = $this->api->components->schemas->{$row->name};
          $items->{$row->id}->ID = $row->id;
          $items->{$row->id}->schema = 'Item';
        }
      }
      sqlsrv_next_result($res);
      while($row = sqlsrv_fetch_object($res)) {
        if (isset($items->{$row->_ID})) {
          $items->{$row->_ID}->{$row->AttributeName} = $items->{$row->_ID}->{$row->AttributeName}
          ? (is_array($items->{$row->_ID}->{$row->AttributeName}) ? $items->{$row->_ID}->{$row->AttributeName}
          : [ ['Value' => $items->{$row->_ID}->{$row->AttributeName}] ]) : [];
          $items->{$row->_ID}->{$row->AttributeName}[] = $row;
        }
      }
      // $items = $this->getdata("INSERT INTO @itemlist SELECT id FROM item.dv WHERE hostId=$this->hostId AND classId = 0 AND name in ('$keys')");
      // debug($items);
      // foreach ($items as $id => $item) {
      //   $this->api->components->schemas->{$item->name} = (object)array_merge(array_filter(itemrow($item)),(array)$this->api->components->schemas->{$item->name});
      // }
      // die($q);
      // debug($q,$items);
      foreach($this->api->components->schemas as $schemaname => $schema) {
        if (!$schema->ID) {
          $res = $this->query(
            "SET NOCOUNT ON
            INSERT INTO item.dt (hostID,classID,masterID,srcID,name)
            VALUES ($this->hostId,0,0,0,'$schemaname')
            DECLARE @itemClassId BIGINT
            SET @itemClassId = item.getClassIdByName($this->hostId, 'Item')
            DECLARE @id BIGINT
            SET @id = scope_identity()
            EXEC item.attr @itemId=@id, @name='Master', @linkId=@itemClassId
            EXEC item.attr @itemId=@id, @name='Src', @linkId=@itemClassId
            SELECT id,name FROM item.dt I WHERE id = @id
            SELECT * FROM attribute.vw A WHERE itemID = @id AND hostId = $this->hostId"
          );
          // debug(2, $this->hostId, $schemaname,  $q);
          // die($q);
          while($row = sqlsrv_fetch_object($res)) {
            if (isset($this->api->components->schemas->{$row->name})) {
              $items->{$row->id} = $this->api->components->schemas->{$row->name};
              $items->{$row->id}->ID = $row->id;
              $items->{$row->id}->schema = 'Item';
            }
          }
          sqlsrv_next_result($res);
          while($row = sqlsrv_fetch_object($res)) {
            if (isset($items->{$row->_ID})) {
              $items->{$row->_ID}->{$row->AttributeName} = $items->{$row->_ID}->{$row->AttributeName}
              ? (is_array($items->{$row->_ID}->{$row->AttributeName}) ? $items->{$row->_ID}->{$row->AttributeName}
              : [ ['Value' => $items->{$row->_ID}->{$row->AttributeName}] ]) : [];
              $items->{$row->_ID}->{$row->AttributeName}[] = $row;
            }
          }
        }
      }
      // debug(1);
      header('Content-Type: application/json');
      die(json_encode($this->api));
		}
		die();
  }
  public function post () {
    // die('a');
    // debug(1);
    // debug(1, $_POST['extend'], $_POST);
    // return;
		if (!function_exists('yaml_parse')) return;
    // $content = file_get_contents('php://input');
    $content = $_POST['config'];
		$content = str_replace("\t","  ",$content);
		// if (isset($_GET['append'])) {
    $this->root = isset($_GET['folder']) ? $_GET['folder'] : $this->root;
    // debug($content, $_POST);
    if ($content[0]==='{') {
      $content=yaml_emit(json_decode($content, true));
    }
    // die($content);
    // debug($_POST);

    $account = sqlsrv_fetch_object(aim()->query(
      "EXEC [account].[get] @hostname=%s",
      aim()->access['client_id']
		));
    // debug($account, aim()->access);
    if ($account->clientId == aim()->access['sub']) {
      // debug($this->root, $_GET, $_POST, aim()->access);
      if (isset($_POST['extend'])) {
        // debug(111, $this->root, $_POST);
        // if ($content[0]==='{') {
        // 	$content = json_decode($content, true);
        // }
        // else {
        // }
        $content = yaml_parse($content);

        $current_config = is_file($fname = $_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__.'/config.json') ? json_decode(file_get_contents($fname), true) : [];
        $config = array_replace_recursive($current_config ?: [], $content ?: []);
        file_put_contents($fname, $config = json_encode($config));
        yaml_emit_file($_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__.'/config.yaml', $config);
        return $fname;




        // $current_config = is_file($fname = $_SERVER['DOCUMENT_ROOT'].$this->root.'/config.yaml') ? yaml_parse_file($fname) : [];
        // $config = array_replace_recursive($current_config ?: [], $content ?: []);
        // $content = yaml_emit($config);





        // debug(133, $_GET, $this->root, $config, $content, $current_config);
        // $this->initapi($content);
        // die("Saved in $this->root $content");
        // } else {
        //   file_put_contents($fname = $_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__.'/config.yaml');
        //   file_put_contents($_SERVER['DOCUMENT_ROOT'].__AIM_ROOT_USER__.'/config.json', json_encode(yaml_parse_file($fname)));
      }
      // debug('POST', $_POST, $_GET, $content);
      // debug('yaml', function_exists('yaml_parse'), file_get_contents('php://input'));
      if (isset($_GET['order'])) {
        $_POST['order'] = json_decode($_POST['order']);
        $KlantID = 'Alicon';
        $KlantRef = 'TestOrder';
        $Remark = 'NIET VERWERKEN, Dit is een test order van Aliconnect';
        $ModifiedBY = 'Webuser';
        $State = 'Besteld';
        $sql = "DECLARE @PakbonID INT
        ERROR
        SET @PakbonID = 202004225
        --SELECT @PakbonID=MAX(PakBonID)+1 FROM abisingen.dbo.Bonnen1 INSERT Bonnen1 (PakbonID) VALUES (@PakbonID)
        UPDATE abisingen.dbo.Bonnen1
        SET
        KlantID= '$KlantID'
        ,Datum = GETDATE()
        ,DatumBesteld = GETDATE()
        ,UwRef = '$KlantRef'
        ,Aanbieding = 0
        ,Verwerkt = 1
        ,FaktuurNR = 0
        ,Status = '$State'
        ,Opmerking = '$Remark'
        ,[User] = '$ModifiedBY'
        ,[ModifiedBy] = '$ModifiedBY'
        ,[TotExcl] = 0
        ,[TotBTW] = 0
        ,[TotIncl] = 0
        WHERE
        PakbonID = @PakbonID
        --DELETE abisingen.dbo.OrderRegels WHERE PakbonID = @PakbonID
        ";
        foreach ($_POST['order']->rows as $row) {
          $sql.="INSERT abisingen.dbo.OrderRegels (PakbonID,FaktuurNR,ProdID,ArtID,Omschrijving,Aantal,Eenheid,Bruto,KlantID,Changed,InkNetto,ArtNR,ModifiedBY)
          SELECT @PakbonID PakbonID,0 FaktuurNR,A.ProdID,A.ArtID,A.Omschrijving,'$row->amount',A.Eenheid,A.Bruto,'$KlantID',GETDATE(),A.InkNetto,A.ArtNR,'$ModifiedBY'
          FROM abisingen.dbo.Artikelen A
          INNER JOIN aim1.item.dt I ON I.ID = $row->ID AND A.ArtID = I.KeyID
          INNER JOIN abisingen.dbo.Producten P ON P.ProdID = A.ProdID
          ";
        }
        die($sql);
        aim()->query($sql);

        return $_POST;
      }
      $this->initapi($content);
      // debug(1,$content);
      // return $this->get();
      // die("Saved in $this->root $content");
      die("Saved in $this->root");
    }
    throw new Exception('Unauthorized', 401);
	}
  public function to_table ($name, $query, $cols) {
    $result = '<!DOCTYPE html><html><head><title>'.$name.'</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
		<body><table><caption>'.$name.'</caption><thead><tr><th>'.implode('</th><th>', $cols).'</th></tr></thead><tbody>';
		$res = aim()->query($query);
		while($row = sqlsrv_fetch_object($res)){
			$result .= "<tr><td>".implode('</td><td>', (array)$row)."</td></tr>";
		}
    $result .= '</tbody></table></body></html>';
    return $result;
  }
  public function require($name, $method = '', &$response = null) {
    $classname = "$name";
    if (empty($this->$name)) {
      if (!class_exists($name)) {
        if (is_file($fname = __DIR__."/$name.php")) {
          require_once($fname);
        }
      }
      if (class_exists($classname)) {
        $this->$name = new $classname();
      }
    }

    // debug($name, $method);
    // $method = 'POST';
    // $_POST=$_GET;
    if ($method && method_exists($classname, $method)) {
      // debug(1,$classname, $method);
      $response = $this->$name->$method();
      // debug(1);
    }
    // debug(1, $name, $method);
    return $this;
  }
}

function aim() { return $GLOBALS['aim']; }

ini_set('default_charset', 'UTF-8');
ini_set('memory_limit', -1);
ini_set('post_max_size', '20M');
ini_set('upload_max_filesize', '20M');
ini_set('session.cookie_samesite', 'Lax');
ini_set('mssql.textlimit', 2147483647);
ini_set('mssql.textsize', 2147483647);
sqlsrv_configure('ClientBufferMaxKBSize', 180240);





// define('__PATH__', str_replace(pathinfo($_SERVER['SCRIPT_NAME'], PATHINFO_DIRNAME), '', $url['path']));
//
//
//
// // die($_SERVER['DOCUMENT_ROOT']);
// define('$this->root', realpath($_SERVER['DOCUMENT_ROOT']."/.."));
// // $aim->start();

<?php
// namespace Aliconnect;

// die(__FILE__);

ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
define('__startTime', microtime(true) * 1000);
$_SERVER['HTTP_ORIGIN'] = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['HTTP_HOST'];

// ini_set('default_charset', 'UTF-8');
// ini_set('post_max_size', '20M');
// ini_set('upload_max_filesize', '20M');
// ini_set('session.cookie_samesite', 'Lax');
// ini_set('memory_limit', -1);
ini_set('mssql.textlimit', 2147483647);
ini_set('mssql.textsize', 2147483647);
sqlsrv_configure('ClientBufferMaxKBSize', 180240);

// use function http_response_code;


use Aliconnect\Account;
use Aliconnect\Mailer;
use Aliconnect\Jwt;
// use Aliconnect\Item;


// function get_real_user_ip($default = NULL, $filter_options = 12582912) {
//   $HTTP_X_FORWARDED_FOR = isset($_SERVER) && isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : getenv('HTTP_X_FORWARDED_FOR');
//   $HTTP_CLIENT_IP = isset($_SERVER) && isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : getenv('HTTP_CLIENT_IP');
//   $HTTP_CF_CONNECTING_IP = isset($_SERVER) && isset($_SERVER['HTTP_CF_CONNECTING_IP']) ? $_SERVER['HTTP_CF_CONNECTING_IP'] : getenv('HTTP_CF_CONNECTING_IP');
//   $REMOTE_ADDR = isset($_SERVER)?$_SERVER['REMOTE_ADDR']:getenv('REMOTE_ADDR');
//
//   $all_ips = explode(",", "$HTTP_X_FORWARDED_FOR,$HTTP_CLIENT_IP,$HTTP_CF_CONNECTING_IP,$REMOTE_ADDR");
//   foreach ($all_ips as $ip) {
//     if ($ip = filter_var($ip, FILTER_VALIDATE_IP, $filter_options))
//     break;
//   }
//   return $_SERVER['HTTP_CLIENT_IP'] = $ip?$ip:$default;
// }

if (!function_exists('str_contains')) {
  function str_contains($haystack, $needle) {
    return strpos($haystack, $needle) !== false;
  }
}


class Aim {
  // private $config;
  // private $secret;
  // private $oas;
  // public static $options;
  // public static $root;
  public function __construct() {
    // debug(getcwd());


    $GLOBALS['aim'] = $this;

    $this->origin = $_SERVER['HTTP_ORIGIN'];
    $this->context = $this->origin.$_SERVER['REQUEST_URI'];
    $this->base_path = dirname(parse_url($_SERVER['SCRIPT_NAME'])['path']);
    $this->request_url = parse_url($_SERVER['REQUEST_URI']);
    $this->request_path = $this->request_url['path'];
    $this->hostname = explode('.',$_SERVER['HTTP_HOST'])[0];
    $this->method = strToLower($_SERVER['REQUEST_METHOD']);
    $this->config_path = $_SERVER['DOCUMENT_ROOT']."/../config";
    $this->client_config_path = "$this->config_path/aliconnect.nl/forms/config";

    $this->config = [];
    $this->secret = [];
    $this->config = array_replace_recursive($this->config, is_file($fname = "$this->config_path/config.yaml") ? yaml_parse_file($this->default_config_filename = $fname) : []);
    $this->secret = array_replace_recursive($this->secret, is_file($fname = "$this->config_path/secret.yaml") ? yaml_parse_file($fname) : []);
    $this->config = array_replace_recursive($this->config, is_file($fname = "$this->client_config_path/$_SERVER[HTTP_HOST].yaml") ? yaml_parse_file($fname) : []);
    // $hostname = explode('.', $_SERVER['HTTP_HOST'])[0];
    // $this->config = array_replace_recursive($this->config, is_file($fname = "$this->client_config_path/$hostname.yaml") ? yaml_parse_file($fname) : []);
    // debug($this->config);
    $this->secret = array_replace_recursive($this->secret, is_file($fname = $_SERVER['DOCUMENT_ROOT']."/../config/".$_SERVER['HTTP_HOST'].".secret.yaml") ? yaml_parse_file($fname) : []);
    $this->client_id = request('client_id', $_REQUEST) ?: request('client_id',$this->config['client']);
    // debug($this->client_id, $this->config);
    header("Access-Control-Allow-Headers: Authorization");
    $headers = $this->headers = getallheaders();
    $this->access = [
      'client_id'=> $this->client_id,
      'scope'=> 'guest.read',
    ];
    $this->access_token = request('access_token', $_GET);
    if ($authorization = request('Authorization', $headers)) {
      $this->access_token = explode(' ', $authorization);
      $this->access_token = request(1, $this->access_token, true);
      // debug($this->access_token);
    }
    if ($this->access_token) {
      $jwt = new jwt();
      $jwt->decode($this->access_token);
      $payload = request('payload', $jwt);
      $this->client_id = $payload['client_id'];
      $this->get_client_config();
      // $this->secret = array_replace_recursive($this->secret, is_file($fname = $_SERVER['DOCUMENT_ROOT']."/../config/".$this->client_id.".secret.yaml") ? yaml_parse_file($fname) : []);
      $jwt->validate(request('client_secret', $this->config['client']));
      if (!$jwt->valid) http_response(401);
    } else {
      $this->get_client_config();
    }
    // debug(12, $this->client_id, $this->config_filename, $this->config);
    // $fname = str_replace('.config.','.oas.',$fname);
    // if (!empty($this->config['client_secret'])) {
    //   $this->config['client_secret'] = null;
    //   yaml_emit_file($fname, $this->config);
    //   yaml_emit_file($fname, $this->oas  = $this->oas($this->config));
    // } else if (!is_file($fname)) {
    //   yaml_emit_file($fname, $this->oas  = $this->oas($this->config));
    // } else {
    //   $this->oas = yaml_parse_file($fname);
    // }
    $this->oas  = $this->oas($this->config);
    // debug($this->config);
    // $this->oas = $this->oas($this->config);

    // debug($this->oas);
    // debug(1);


    // debug($this->config);

    // debug(3, $this->client_id, $this->config);

    // debug(1);
  }
  private function index_with_md($filename) {
    readfile($_SERVER['DOCUMENT_ROOT'].'/index.html');
    $data = base64_encode(json_encode(["md"=>file_get_contents($filename)]));
    echo "<data md='$data'></data>";
    die();
  }
  public function api(){
    // aiminfo();
    $method = $this->method;
    $paths = [
      "/$this->hostname/$this->hostname.github.io$this->request_path",
      "/$this->hostname$this->request_path",
      $this->request_path,
    ];
    if (isset($_GET['md'])) {
      $this->index_with_md($_GET['md']);
    }
    foreach ($paths as $path) {
      foreach([".md", "home.md", "index.md", "readme.md"] as $filename) {
        if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$path.$filename)) {
          $this->index_with_md($fname);
        }
      }
    }
    $scopes = explode(' ', $this->access['scope']);
    // debug($this->request_path,$this->base_path);
    // $api_path = preg_replace('/^\/api/', '', $this->request_path);
    if ($oas = $this->oas) {
      if ($paths = $oas['paths']) {
        // debug($paths);
        $path_to_search = preg_replace('/\(.*?\)/', '()', $this->request_path);
        $path_to_search = str_replace($this->base_path, '', $path_to_search);
        // die($path_to_search);
        $path_to_search = strtolower($path_to_search);
        // debug($paths);
        foreach ($paths as $path_name => $path) {
          // echo strtolower(preg_replace('/\(.*?\)/', '()', $path_name));
          if (strtolower(preg_replace('/\(.*?\)/', '()', $path_name)) === $path_to_search) {
            if (!$path_method = request($method, $path)) {
              http_response(400, 'Method not found');
            }

            // $path = (array)$path;
            // http_response(200, isset($path[$request_method]));
            // $path_method = request($method, $path);
            // http_response(400);
            // $path_method_security = request('security', $path_method);

            // http_response(200, 'JA');
            $operationId = request('operationId', $path_method) ?: str_replace("/","\\",$path_name);

            http_response(200, (new $operationId)->$method());
            // debug($operationId, class_exists($path_name));
            // // : $path_method['operationId'];
            //
            //
            //
            // // $this->debug($operationId, class_exists($operationId), function_exists($operationId));
            //
            // foreach ($path_method_security as $security) {
            //   $aliconnect_auth = request('aliconnect_auth', $security);
            //   // $this->debug($aliconnect_auth, $this->scopes);
            //   // check_argument(array_intersect($aliconnect_auth, $scopes), 406, 'Not correct scope');
            //
            //   debug();
            //
            //   // $this->debug("$operationId\\$request_method", function_exists("$operationId\\$request_method"));
            //
            //   // debug($operationId);
            //   if (function_exists($operationId)) {
            //     $res = $operationId($_REQUEST);
            //   }
            //   else if (function_exists("$operationId\\$request_method")) {
            //     $operationId = "$operationId\\$request_method";
            //     $res = $operationId($_REQUEST);
            //   }
            //   else if (method_exists($operationId, $request_method)) {
            //     $res = (new $operationId())->$request_method($_REQUEST);
            //   }
            //   else {
            //     $path_matcher = $path_name;
            //     $path_matcher = preg_replace([
            //       '/\//',
            //       '/\(/',
            //       '/\)/',
            //       '/\{.*?\}/'
            //     ], [
            //       '\/',
            //       '\(',
            //       '\)',
            //       '(.*?)'
            //     ], $path_matcher);
            //
            //     preg_match("/$path_matcher/", $this->pathname, $match);
            //     array_shift($match);
            //     $parameters = [];
            //     if (isset($path_method['parameters'])) {
            //       foreach ($path_method['parameters'] as $i => $parameter) {
            //         $name = $parameter['name'];
            //         if ($parameter['in'] === 'query') {
            //           if (isset($_GET[$name])) {
            //             $parameters[$name] = $_GET[$name];
            //           } else if (!empty($parameter['required'])) {
            //             self::http_response(400, "parameter $name required");
            //           }
            //         } else if ($parameter['in'] === 'path') {
            //           $parameters[$name] = $match[$i];
            //         }
            //       }
            //     }
            //     $res = eval_operation($operationId, $parameters);
            //   }
            //   // debug(1, $res);
            //   self::http_response(200, $res);
            // }
            // self::http_response(403, 'No aliconnect_auth scope');
          }
        }
      }
      // debug($path_to_search, $this->oas);

    }
  }
  public function attr($id, $name, $value = null, $options = []) {
    $options = array_replace([
      'item_id'=> $id,
      'name'=> $name,
      'value'=> $value,
      // "host_id"=> $this->access_token['client_id'],
      // "user_Id"=> $this->access_token['sub'],
    ], $options);
    $this->sql_exec("item.attr", $options);
  }
  public function access() {
    header("Access-Control-Allow-Headers: Authorization");
    $headers = getallheaders();
    if ($authorization = request('Authorization', $headers)) {
      $access_token = explode(' ', $authorization);
      $access_token = request(1, $access_token, true);
    } else if ($access_token = request('access_token', $_GET)) {
    } else {
      return [
        'client_id'=>request('client_id', $_REQUEST),
        'scope'=>'guest.read',
      ];
    }
    $jwt = new jwt();
    $jwt->decode($access_token);
    $payload = request('payload', $jwt);
    $client_id = $payload['client_id'];
    $secret = $this->secret($client_id);
    $jwt->validate($secret['client_secret']);
    if (!$jwt->valid) $this->http_response(401);
    // if ($jwt->expired) $this->http_response(401);
    return $payload;
  }
  public function account($options){
    return new Account($options);
  }
  public function context(){
    return ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
  }
  public function init() {
    $this->mail_messages = [];
    $this->root = explode('\\vendor\\',__DIR__)[0];
    $this->secret = $this->secret ?: yaml_parse_file($_SERVER['DOCUMENT_ROOT']."/../config/secret.yaml");
    if (is_file($fname = $_SERVER['DOCUMENT_ROOT']."/../config/$this->client_id.secret.json")) {
      $this->secret = array_replace_recursive($this->secret,json_parse_file($fname));
    }

    $this->request_url = parse_url($_SERVER['REQUEST_URI']);
    $this->pathname = $this->request_url['path'];

    $access = $this->access();
    $this->client_id = request('client_id', $access) ?: request('client_id', $_GET) ?: 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';

    $this->account_id = request('account_id', $access);
    $this->scope = request('scope', $access, true);
    $this->scopes = explode(' ', $this->scope);

    $this->config = $this->init_config($this->client_id);
    $this->api = $this->init_api($this->config, $this->scopes);
    // $this->http_response(200, $this->api);
    // aim()->http_response(200, $this->api['paths']);
    $this->handle_api_call($this->pathname, $this->scopes);
  }
  public function init_config($client_id = null) {
    $httphost = request('HTTP_HOST', $_SERVER);
    $this->config = yaml_parse_file($this->root."/config/basic.yaml");
    $fnames = [
      $this->root."/config/$httphost.yaml",
      $this->root."/config/$this->client_id.yaml",
    ];
    foreach ($fnames as $fname) {
      if (is_file($fname)) {
        $this->config = array_replace_recursive($this->config,yaml_parse_file($fname));
      }
    }
    // debug($this->config);
    return $this->config;
  }
  public function get_client_config() {
    if (is_file($this->config_filename = $fname = "$this->client_config_path/$this->client_id.yaml")) {
      $this->config = array_replace_recursive($this->config, yaml_parse_file($fname));
      if ($name = request('name', $this->config['client'])) {
        if (is_file($fname = "$this->client_config_path/$name.yaml")) {
          $this->config = array_replace_recursive($this->config,yaml_parse_file($fname));
        }
      }
    }
  }
  public function get_scopes() {
    $client_id = request('client_id', $this);
    if (isset($_REQUEST['account_id'])) {
      $account_id = request('account_id', $this);
      return $this->get_granted_scopes($client_id, $account_id);
    }
    return [];
  }
  public function get_granted_scopes($client_id, $account_id) {
    // debug($client_id, $account_id);
    $res = $this->sql_query('SELECT value FROM attribute.dv WHERE nameId=2174 AND itemId=item.getId(%s) AND hostId=item.getId(%s)', [
      $account_id,
      $client_id
    ]);
    $scopes = [];
    while ($row = sqlsrv_fetch_object($res)) {
      $scopes = array_merge($scopes, explode(" ",$row->value));
    }
    return array_values(array_unique($scopes));
  }
  public function handle_api_call($pathname,$scopes) {
    // $access_token = $this->init_auth();
    // $this->init_config($access_token['client_id']);
    // $scopes = explode(' ',$access_token['scope']);
    // $scopes = ['admin.write'];
    $script_url = parse_url($_SERVER['SCRIPT_NAME']);
    $base_path = dirname($script_url['path']);


    // $this->init_api($scopes);
    // $this->secret = yaml_parse_file($this->root."/config/secret.yaml");
    $this->context = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];

    $path_to_search = preg_replace('/\(.*?\)/', '()', $this->pathname);
    $path_to_search = str_replace($base_path, '', $path_to_search);
    $request_method = strToLower(request('REQUEST_METHOD', $_SERVER));
    // self::http_response(200, str_replace("/","\/","^$base_path"));
    // $path_to_search = preg_replace("/^".str_replace("/","\/",$base_path)."/", '', $path_to_search);


    // debug($path_to_search, array_keys($this->api['paths']));
    if (isset($this->api['paths'])) {
      foreach ($this->api['paths'] as $path_name => $path) {
        if (preg_replace('/\(.*?\)/', '()', $path_name) === $path_to_search) {
          // $path = (array)$path;
          // http_response(200, isset($path[$request_method]));
          $path_method = request($request_method, $path);
          // http_response(400);
          $path_method_security = request('security', $path_method);

          // http_response(200, 'JA');

          $operationId = empty($path_method['operationId'])
          ? str_replace("/","\\",$this->pathname)
          : $path_method['operationId'];

          // $this->debug($operationId, class_exists($operationId), function_exists($operationId));

          foreach ($path_method_security as $security) {
            $aliconnect_auth = request('aliconnect_auth', $security);
            // $this->debug($aliconnect_auth, $this->scopes);
            check_argument(array_intersect($aliconnect_auth, $scopes), 406, 'Not correct scope');



            // $this->debug("$operationId\\$request_method", function_exists("$operationId\\$request_method"));

            // debug($operationId);
            if (function_exists($operationId)) {
              $res = $operationId($_REQUEST);
            }
            else if (function_exists("$operationId\\$request_method")) {
              $operationId = "$operationId\\$request_method";
              $res = $operationId($_REQUEST);
            }
            else if (method_exists($operationId, $request_method)) {
              $res = (new $operationId())->$request_method($_REQUEST);
            }
            else {
              $path_matcher = $path_name;
              $path_matcher = preg_replace([
                '/\//',
                '/\(/',
                '/\)/',
                '/\{.*?\}/'
              ], [
                '\/',
                '\(',
                '\)',
                '(.*?)'
              ], $path_matcher);

              preg_match("/$path_matcher/", $this->pathname, $match);
              array_shift($match);
              $parameters = [];
              if (isset($path_method['parameters'])) {
                foreach ($path_method['parameters'] as $i => $parameter) {
                  $name = $parameter['name'];
                  if ($parameter['in'] === 'query') {
                    if (isset($_GET[$name])) {
                      $parameters[$name] = $_GET[$name];
                    } else if (!empty($parameter['required'])) {
                      self::http_response(400, "parameter $name required");
                    }
                  } else if ($parameter['in'] === 'path') {
                    $parameters[$name] = $match[$i];
                  }
                }
              }
              $res = eval_operation($operationId, $parameters);
            }
            // debug(1, $res);
            self::http_response(200, $res);
          }
          self::http_response(403, 'No aliconnect_auth scope');
        }
      }
    }

    self::http_response(403, 'Path not available');
    // debug(1);
    //
    // $url = parse_url(__PATH__);
    // $path = explode('/', $url['path']);
    // // $this->context = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['SERVER_NAME'].pathinfo($_SERVER['URL'], PATHINFO_DIRNAME);
    //
    //
    //
    //
    //
    // foreach ($path as $folder) {
    //   if ($folder && preg_match('/(\w+\/|)(\w+)(\((\d+)\)|)/', $folder, $match)) {
    //     $schema_name = $this->schema_name = $match[2];
    //     if (isset($this->config['components']['schemas'][$schema_name]['properties'])) {
    //       $properties = array_keys($this->config['components']['schemas'][$schema_name]['properties']);
    //       foreach ($_GET as $key => $value) {
    //         $_GET[preg_replace('/^\$/','',$key)] = $value;
    //       }
    //       if (isset($_GET['select']) && $_GET['select'] !== '*') {
    //         $properties = array_values(array_intersect($properties, explode(',',$_GET['select'])));
    //       }
    //       $this->properties_select = implode("','", $this->properties = $properties);
    //
    //       debug(8989, $this->scopes);
    //
    //       header('OData-Version: 4.0');
    //       header('Content-Type: application/json');
    //       if ($match[3]) {
    //         $id = $match[4];
    //         $items = $this->sql_query_items("--hostId = @hostId AND classID = @classId AND
    //         id = $id");
    //         if ($items) {
    //           echo json_encode(array_merge([
    //             '@context'=>$this->context,
    //           ], (array)$items[0]));
    //         }
    //         die();
    //       } else {
    //         $items = $this->sql_query_items("--hostId = @hostId AND
    //         classID = @classId");
    //         die(json_encode([
    //           '@context'=>$this->context,
    //           '@ms'=>round(microtime(true)*1000-__startTime),
    //           'values'=>$items,
    //         ]));
    //       }
    //     }
    //   }
    // }
    // error(403, 'NOT FOUND');
    // // die('a');
    // // debug(['values'=>$values]);
  }

  public function method_get() {
  }
  public function method_post() {
  }
  public function method_patch() {
  }
  public function method_delete() {
  }
  public function mail ($param = []) {
    if (!isset($param['send'])) {
      // debug($param);
      $mailer = new Mailer;
      $mailer->send($param);
      return $mailer;
    } else if ($param['send'] === 1) {
      unset($param['send']);
      self::sql_query(
        "INSERT INTO mail.dt (data) VALUES (%s);",
        json_encode($param)
      );
    } else if ($param['send'] === 0) {
    }
  }
  public function mail_message_to($to, $chapter, $options = []) {
    $mail_messages = request('mail_messages', $this);
    if (empty($mail_messages[$to])) {
      $mail_messages[$to] = [
        'to'=> $to,
        'bcc'=> 'max.van.kampen@alicon.nl',
        'chapters'=> [],
        // 'send'=> 1,
      ];
    }
    $mail_messages[$to]['chapters'][] = $chapter;
    $mail_messages[$to] = array_merge_recursive($mail_messages[$to], $options);
    $this->mail_messages = $mail_messages;
    return $this;
  }
  public function oas_($config, $scopes = ['guest.read']) {
    $item_classname = '\Aliconnect\Server\Data\Item';
    $scopes = is_array($scopes) ? $scopes : explode(' ', $scopes);
    // $scopes = $scopes ?: $this->get_scopes();
    // $scopes = $scopes ?: $this->scopes;
    // $config = $this->config ?: $this->init_config(request('client_id', $this));

    foreach($config['components']['schemas'] as $schema_name => $schema) {
      $all_schema = [];
      if (isset($schema['allOf'])) {
        foreach($schema['allOf'] as $allOf_schema_name) {
          $all_schema = array_replace_recursive($all_schema, $config['components']['schemas'][$allOf_schema_name]);
        }
      }
      $all_schema = array_replace_recursive($all_schema, $schema);
      $config['components']['schemas'][$schema_name] = $all_schema;
    }
    $auth_name = 'aliconnect_auth';
    $api = [
      'openapi'=>'3.0.1',
      'info'=> array_intersect_key($config['info'], array_flip(['title','description','termsOfService','contact','license','version'])),
      // 'externalDocs'=> $config['externalDocs'],
      'servers'=> $config['servers'],
      'tags'=> isset($config['tags']) ? $config['tags'] : null,
      'paths'=> $config['paths'],
      'components'=> [
        'schemas'=> null,
      ],
    ];
    foreach ($api['paths'] as $path_name => $path) {
      foreach ($path as $method_name => $method) {
        if (empty(get_security_scope($method['security'], $scopes))) {
          unset($api['paths'][$path_name][$method_name]);
        }
      }
      if (empty($api['paths'][$path_name])) {
        unset($api['paths'][$path_name]);
      }
    }
    $api['components']['securitySchemes'][$auth_name] = [
      "type"=> "oauth2",
      "flows"=> [
        "implicit"=> [
          "authorizationUrl"=> "https://login.aliconnect.nl/oauth/",
        ]
      ]
    ];
    $implicit_scopes = [];
    $par_select = [
      'in'=> 'query',
      'name'=> '$select',
      'description'=> 'List of fieldnames',
      // 'required'=> true,
      'schema'=> ['type' => 'string']
    ];
    foreach ($config['components']['schemas'] as $schemaName => $schema) {
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
          $openapi_properties = $this->openapi_properties($schema['properties']);
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
          $implicit_scopes = array_merge($implicit_scopes, $security_read);
          $par_id = ['in'=> 'path', 'name'=> 'id', 'description'=> "ID of $schemaName",'required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']];
          $api['paths']["/$schemaName"]["get"] = [
            'tags'=> [ $schemaName ],
            'summary'=> 'Get list of '.$schemaName,
            'operationId'=> "$item_classname($schemaName).search",
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
          $api['paths']["/$schemaName({id})"]['get'] = [
            'tags' => [ $schemaName ],
            'summary'=> 'Find '.$schemaName.' by ID',
            'description'=> "Returns a single $schemaName object",
            // 'operationId'=> "(new item('$schemaName',{id}))->get();",
            'operationId'=> "$item_classname($schemaName).get",
            'parameters'=> [
              $par_id,
              $par_select,
            ],
            'responses'=> $response,
            'security'=> [[$auth_name=>$security_read]],
          ];
          if (request('Children', $schema['properties'])) {
            // debug(1);
            $api['paths']["/$schemaName({id})/children"]['get'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Find '.$schemaName.' by ID',
              'description'=> "Returns a single $schemaName object",
              // 'operationId'=> "(new item('$schemaName',{id}))->get();",
              'operationId'=> "$item_classname($schemaName).children",
              'parameters'=> [
                $par_id,
                $par_select,
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_read]],
            ];
          }
          if ($security_write) {
            $implicit_scopes = array_merge($implicit_scopes, $security_write);
            $api['paths']["/$schemaName"]["post"] = [
              'tags'=> [ $schemaName ],
              'summary'=> 'Add a new '.$schemaName,
              'operationId'=> "$item_classname($schemaName).add",
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
            $api['paths']["/$schemaName({id})"]['post'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName.' with form data',
              'operationId'=> "$item_classname($schemaName).post",
              'parameters'=> [
                $par_id,
              ],
              'requestBody'=> [
                'content'=> [
                  'application/x-www-form-urlencoded'=> [
                    'schema'=> [
                      'properties' => $openapi_properties
                    ]
                  ]
                ]
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
            $api['paths']["/$schemaName({id})"]['patch'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName,
              'operationId'=> "$item_classname($schemaName).patch",
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
            $api['paths']["/$schemaName({id})"]['delete'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Deletes a '.$schemaName,
              'operationId'=> "$item_classname($schemaName).delete",
              'parameters'=> [
                $par_id,
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
          }
          $api['tags'][] = array_intersect_key(array_replace([
            'name'=> $schemaName,
          ], $schema), array_flip(['name','description','externalDocs']));
          $api['components']['schemas'][$schemaName] = array_intersect_key($schema, array_flip(['properties']));
        }
      }
    }
    foreach ($implicit_scopes as $scope) {
      $api['components']['securitySchemes'][$auth_name]["flows"]["implicit"]["scopes"][$scope] = "$scope";
    }
    return $this->oas = $api;
  }
  public function oas($config) {
    $item_classname = '\Aliconnect\Server\Data\Item';
    foreach($config['components']['schemas'] as $schema_name => $schema) {
      if (!$schema) continue;
      $all_schema = [];
      if (isset($schema['allOf'])) {
        foreach($schema['allOf'] as $allOf_schema_name) {
          $all_schema = array_replace_recursive($all_schema, $config['components']['schemas'][$allOf_schema_name]);
        }
      }
      $all_schema = array_replace_recursive($all_schema, $schema);
      $config['components']['schemas'][$schema_name] = $all_schema;
    }
    $auth_name = 'aliconnect_auth';
    $api = [
      'openapi'=>'3.0.1',
      'info'=> array_intersect_key($config['info'], array_flip(['title','description','termsOfService','contact','license','version'])),
      // 'externalDocs'=> $config['externalDocs'],
      'servers'=> $config['servers'],
      'tags'=> isset($config['tags']) ? $config['tags'] : null,
      'paths'=> $config['paths'],
      'components'=> [
        'schemas'=> null,
      ],
    ];
    $api['components']['securitySchemes'][$auth_name] = [
      "type"=> "oauth2",
      "flows"=> [
        "implicit"=> [
          "authorizationUrl"=> "https://login.aliconnect.nl/oauth/",
        ]
      ]
    ];
    $implicit_scopes = [];
    $par_select = [
      'in'=> 'query',
      'name'=> '$select',
      'description'=> 'List of fieldnames',
      // 'required'=> true,
      'schema'=> ['type' => 'string']
    ];
    foreach ($config['components']['schemas'] as $schemaName => $schema) {
      if (!$schema) continue;
      $schema_name = strToLower($schemaName);
      $security_write = ["$schema_name.write"];
      $security_read = ["$schema_name.read","$schema_name.write"];
      foreach ($schema['security'] as $name) {
        $security_read[] = "$name.read";
        $security_read[] = "$name.write";
        $security_write[] = "$name.write";
      }
      $security_read = array_values($security_read);
      $security_write = array_values($security_write);
        if (isset($schema['properties'])) {
          $openapi_properties = $this->openapi_properties($schema['properties']);
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
          $implicit_scopes = array_merge($implicit_scopes, $security_read);
          $par_id = ['in'=> 'path', 'name'=> 'id', 'description'=> "ID of $schemaName",'required'=> true,'schema'=> ['type'=> 'integer','format'=> 'int64']];
          $api['paths']["/$schemaName"]["get"] = [
            'tags'=> [ $schemaName ],
            'summary'=> 'Get list of '.$schemaName,
            'operationId'=> "$item_classname($schemaName).search",
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
          $api['paths']["/$schemaName({id})"]['get'] = [
            'tags' => [ $schemaName ],
            'summary'=> 'Find '.$schemaName.' by ID',
            'description'=> "Returns a single $schemaName object",
            // 'operationId'=> "(new item('$schemaName',{id}))->get();",
            'operationId'=> "$item_classname($schemaName).get",
            'parameters'=> [
              $par_id,
              $par_select,
            ],
            'responses'=> $response,
            'security'=> [[$auth_name=>$security_read]],
          ];
          if (request('Children', $schema['properties'])) {
            // debug(1);
            $api['paths']["/$schemaName({id})/children"]['get'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Find '.$schemaName.' by ID',
              'description'=> "Returns a single $schemaName object",
              // 'operationId'=> "(new item('$schemaName',{id}))->get();",
              'operationId'=> "$item_classname($schemaName).children",
              'parameters'=> [
                $par_id,
                $par_select,
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_read]],
            ];
          }
            $implicit_scopes = array_merge($implicit_scopes, $security_write);
            $api['paths']["/$schemaName"]["post"] = [
              'tags'=> [ $schemaName ],
              'summary'=> 'Add a new '.$schemaName,
              'operationId'=> "$item_classname($schemaName).add",
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
            $api['paths']["/$schemaName({id})"]['post'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName.' with form data',
              'operationId'=> "$item_classname($schemaName).post",
              'parameters'=> [
                $par_id,
              ],
              'requestBody'=> [
                'content'=> [
                  'application/x-www-form-urlencoded'=> [
                    'schema'=> [
                      'properties' => $openapi_properties
                    ]
                  ]
                ]
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
            $api['paths']["/$schemaName({id})"]['patch'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Updates a '.$schemaName,
              'operationId'=> "$item_classname($schemaName).patch",
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
            $api['paths']["/$schemaName({id})"]['delete'] = [
              'tags' => [ $schemaName ],
              'summary'=> 'Deletes a '.$schemaName,
              'operationId'=> "$item_classname($schemaName).delete",
              'parameters'=> [
                $par_id,
              ],
              'responses'=> $response,
              'security'=> [[$auth_name=>$security_write]],
            ];
          $api['tags'][] = array_intersect_key(array_replace([
            'name'=> $schemaName,
          ], $schema), array_flip(['name','description','externalDocs']));
          $api['components']['schemas'][$schemaName] = array_intersect_key($schema, array_flip(['properties']));
        }
    }
    foreach ($implicit_scopes as $scope) {
      $api['components']['securitySchemes'][$auth_name]["flows"]["implicit"]["scopes"][$scope] = "$scope";
    }
    return $this->oas = $api;
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
  public function secret($client_id) {
    $root = explode('\\vendor\\',__DIR__)[0];
    $secret = yaml_parse_file($root.'/config/secret.yaml');
    if (is_file($fname = $root."/config/$client_id.secret.json")) {
      $secret = array_replace_recursive($secret,json_parse_file($fname));
    }
    return $secret;
  }
  public function shutdown() {
    if ($mail_messages = request('mail_messages', $this)) {
      foreach ($mail_messages as $to => $mail) {
        $this->mail($mail);
      }
    }
  }
  public function sms ($recipients='', $body='', $originator='') {
    // DEBUG: Voor testen email gebruiken
    $this->mail($a = [
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
  public static function sql_value_string($val){
    if (is_null($val)) return 'NULL';
    // if (is_numeric($val)) return $val;
    return "'".str_replace("'","''",$val)."'";
  }
  public static function sql_exec_string($name, $args){
    $args = (array)$args;
    $sql = "EXEC $name ".implode(",",array_map(function($key,$value){
      return "@$key=".self::sql_value_string($value);
    },array_keys($args),array_values($args)));
    // echo $sql;
    return $sql;
  }
  public function sql_exec($name, $args) {
    return $this->sql_query($this->sql_exec_string($name, $args));
  }
  public function sql_query($query, $args = []) {
    if ($args) {
      if (!is_array($args)) {
        $args = func_get_args();
        $query = array_shift($args);
      }
      $args = array_map('get_sql_value', $args);
      $query = vsprintf($query, $args);
    }
    try {
      if (!isset($this->conn)) {
        $dbs = $this->secret['config']['dbs'];
        $this->conn = sqlsrv_connect($dbs['server'],[
          'Database' => $dbs['database'],
          'UID' => $dbs['user'],
          'PWD' => $dbs['password'],
          'ReturnDatesAsStrings' => true,
          'CharacterSet' => 'UTF-8'
        ]);
      }
      // echo $query.PHP_EOL; // DEBUG:
      $query = (isset($nopre) ? '' : 'SET TEXTSIZE -1;SET NOCOUNT ON;').$query;

      // error_log("AIM.sms send $recipients $body $originator");
      error_log($query."\n", 3, "\aliconnect\webroot\log\sql.log");

      // http_response(501, $query); // DEBUG:
      return sqlsrv_query ( $this->conn, $query , null, ['Scrollable' => 'buffered']);
    }
    catch (Exception $e) {
      echo 'Caught exception: ',  $e->getMessage(), "\n";
      die();
    }
  }
  public function translate($message = null, $args = null) {
    $args = func_get_args();
    $message = array_shift($args);
    if (isset($args[0]) && is_array($args[0])) {
      $args = $args[0];
    }
    // return $message;
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
      if (array_key_exists(0, $args)) {
        $message = vsprintf($message, $args);
      } else {
        $message = str_replace(array_map(function ($key) {return "%$key%";}, array_keys($args)), array_values($args), $message);
      }
    }
    return $message;
  	// return $args ? vsprintf($message, $args) : $message;
  }
  // public function __construct1() {
  //
  //   // $GLOBALS['aim'] = $this;
  //   if (!$this->initialized) {
  //     $this->initialized = true;
  //     // http_response_code(500);
  //     $this->mail_messages = [];
  //
  //     $this->root = explode('\\vendor\\',__DIR__)[0];
  //     $this->secret = $this->secret ?: yaml_parse_file($this->root.'/config/secret.yaml');
  //     if (is_file($fname = $this->root."/config/$this->client_id.secret.json")) {
  //       $this->secret = array_replace_recursive($this->secret,json_parse_file($fname));
  //     }
  //
  //     $this->request_url = parse_url($_SERVER['REQUEST_URI']);
  //     $this->pathname = $this->request_url['path'];
  //     $this->scopes = ['guest.read'];
  //     $this->client_id = request('client_id', $_REQUEST);
  //     $this->account_id = request('account_id', $_REQUEST);
  //
  //
  //     $this->client_id = 'c52aba40-11fe-4400-90b9-cee5bda2c5aa';
  //     $this->scopes = ['guest.read','admin.write'];
  //     $this->sub = 265090;
  //
  //
  //     $this->init_config($this->client_id);
  //     $this->init_api($this->scopes);
  //     $this->handle_api_call($this->pathname, $this->scopes);
  //   }
  //   $this->init();
  // }
  // public function __get($property) {
  //   return isset($this->$property)
  //   if (isset(self::$args[$property])) {
  //     return self::$args[$property];
  //   }
  //   if (isset($_REQUEST[$property])) {
  //     return $_REQUEST[$property];
  //   }
  //   if (isset($_COOKIE[$property])) {
  //     return $_COOKIE[$property];
  //   }
  //   if (isset($_SERVER[$property])) {
  //     return $_SERVER[$property];
  //   }
  // }
  // public function __set($property, $value) {
  //   self::$args[$property] = $value;
  // }
  // public static function get($selector) {
  //   return self::$args[$selector];
  // }
  // public static function has($selector) {
  //   return isset(self::$args[$selector]);
  // }
  // public static function set($selector, $context) {
  //   return self::$args[$selector] = $context;
  // }
  // public function init_path(){
  //   $this->base_path = str_replace([$_SERVER['DOCUMENT_ROOT'],'\\'],['','/'],getcwd());
  //   $this->set(parse_url($_SERVER['REQUEST_URI']));
  //   $this->pathname = str_replace($this->base_path,'',$this->path);
  //   $this->set(pathinfo($this->pathname));
  //   $this->dirname = str_replace('\\','/',$this->dirname);
  //   $this->root = realpath($_SERVER['DOCUMENT_ROOT']."/..");
  //   // $this->debug($this->root);
  // }

}

function aim() { return $GLOBALS['aim']; }
function aiminfo(){
  ?><html xmlns="http://www.w3.org/1999/xhtml"><head>
    <style type="text/css">
    body {background-color: #eee; color: #222; font-family: sans-serif; margin:auto; max-width: 900px;}
    pre {margin: 0; font-family: monospace;}
    a:link {color: #009; text-decoration: none; background-color: #fff;}
    a:hover {text-decoration: underline;}
    table {border: 3px; width: 100%;}
    .center {text-align: center;}
    .center table {margin: 1em auto; text-align: left;}
    .center th {text-align: center !important;}
    td, th {border: none; font-size: 75%; vertical-align: baseline; padding: 4px 5px;}
    h1 {font-size: 150%;}
    h2 {font-size: 125%;}
    .p {text-align: left;}
    .e {background-color: #ccf; width: 300px; font-weight: bold;}
    .h {background-color: #99c; font-weight: bold;}
    .v {background-color: #ddd; max-width: 300px; overflow-x: auto; word-wrap: break-word;}
    .v i {color: #999;}
    img {float: right; border: 0;}
    hr {width: 934px; background-color: #ccc; border: 0; height: 1px;}
    </style>
    <title>aiminfo</title><meta name="ROBOTS" content="NOINDEX,NOFOLLOW,NOARCHIVE" />
  </head>
  <body>
    <div>
      <?php
      $aim = aim();
      $aim->IP = get_real_user_ip();
      function write_chapters($obj, $path = []){
        $s = "<table>";
        $p = '';
        foreach($obj as $key => $value) {
          if (!is_array($value) && !is_object($value)) {
            $s .= "<tr><td class=e>$key</td><td class=v>$value</td></tr>".PHP_EOL;
          } else {
            $keypath = array_merge($path, [$key]);
            $p.= "<details open><summary>".join(".",$keypath)."</summary>";
            $p.= write_chapters($value, $keypath);
            // echo "<tr><td class=e>$key</td><td class=v>$value</td></tr>".PHP_EOL;
            $p.= "</details>";
          }
        }
        $s .= "</table>";
        return  $s.$p;
      }
      echo write_chapters(['aim'=>$aim]);
      ?>
      <table>
      </table>
    </div>
  </body></html><?php
}

function get_real_user_ip($default = NULL, $filter_options = 12582912) {
    $HTTP_X_FORWARDED_FOR = isset($_SERVER) && isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : getenv('HTTP_X_FORWARDED_FOR');
    $HTTP_CLIENT_IP = isset($_SERVER) && isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : getenv('HTTP_CLIENT_IP');
    $HTTP_CF_CONNECTING_IP = isset($_SERVER) && isset($_SERVER['HTTP_CF_CONNECTING_IP']) ? $_SERVER['HTTP_CF_CONNECTING_IP'] : getenv('HTTP_CF_CONNECTING_IP');
    $REMOTE_ADDR = isset($_SERVER)?$_SERVER['REMOTE_ADDR']:getenv('REMOTE_ADDR');

    $all_ips = explode(",", "$HTTP_X_FORWARDED_FOR,$HTTP_CLIENT_IP,$HTTP_CF_CONNECTING_IP,$REMOTE_ADDR");
    foreach ($all_ips as $ip) {
      if ($ip = filter_var($ip, FILTER_VALIDATE_IP, $filter_options))
      break;
    }
    return $_SERVER['HTTP_CLIENT_IP'] = $ip?$ip:$default;
  }

function request($selector, $context = null, $required = false) {
  $context = $context ? (array)$context : $_REQUEST;
  if (isset($context[$selector])) {
    return $context[$selector];
  }
  if ($required) {
    http_response(400, "Missing requested parameter `$selector`");
  }
}
function http_response($code = 200, $body = null, $errors = null) {
  // if (!class_exists('\Aliconnect')) return;
  $ms = time()-$_SERVER['REQUEST_TIME'];
  if ($code >= 400) {
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
    $keys = array_change_key_case(getallheaders(), CASE_LOWER);
    if ($error = $error_codes[$code]) {
      $status = $error['status'];
      $body = $body ?: (isset($error['description']) ? $error['description'] : $status);
    }
    // debug($keys, strstr($keys['accept'], 'text/html'));
    $status = strToUpper($status);
    // $description = $description ?: (isset($error['description']) ? $error['description'] : $status);
    $request = $_SERVER['REQUEST_METHOD'].' '.$_SERVER['REQUEST_URI'];
    $t = round(microtime(true)*1000-__startTime);
    $bt = debug_backtrace();
    $trace = array_map(function ($row){
      // $line = explode('\\src\\',$row['file'])[1];
      $line = $row['file'];
      $line .= "($row[line]): ";
      if (isset($row['class'])) $line .= $row['class'].'->';
      if (isset($row['function'])) $line .= $row['function'];
      return $line;
      // return parse_url(str_replace('\\', '/', $row['file']));
    }, $bt);
    if (!strstr($keys['accept'], 'text/html')) {
      // array_shift($bt);
      $body = [
        "error"=> [
          "code"=> $code,
          "status"=> $status,
          "duration"=> "$t ms",
          "trace"=> $trace,
          "message"=> $body,
          // "errors"=> $body ?: [
          //   [
          //     "message"=> $description,
          //     // "domain"=> "usageLimits",
          //     // "reason"=> "accessNotConfigured",
          //     // "extendedHelp"=> "https://console.developers.google.com"
          //   ]
          // ],
        ],
      ];
      // $body = is_string($body) ? 'ja' : 'nee';
      header("Content-Type: application/json");
      $body = json_encode($body, JSON_PRETTY_PRINT);
      // header("Content-Type: application/json");
    } else {
      $body = json_encode($body, JSON_PRETTY_PRINT);
      $body = "<html><head>
        <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no' />
        <style>
          * { box-sizing: border-box; }
          .message.error {
            font-family:'Segoe UI', Tahoma, sans-serif;
            position: fixed; margin: auto; top: 0; bottom: 0; left: 0; right: 0;
            background-color: rgba(0,0,0,0.1);
            z-index:500;
            word-break: break-all;
          }
          .message.error>div{
            display: flex;
            flex-flow: column;
            position: absolute; margin: auto; top: 50px; bottom: 50px; left: 0; right: 0;
            max-width: 1000px;
            cursor: pointer;
            margin: auto;
            padding: 50px;
            background: white;
          }
          .message.error pre {
            padding: 10px;
            display: block;
            white-space: pre-wrap;
          }
          .message.error pre.err{
            overflow: auto;
            background-color: rgb(255,240,240);
            flex: 1 1 auto;
          }
        </style>
      </head>
      <body><div class='message error'><div>
        <h1>$code $status $ms ms</h1>
        <pre>$request</pre>
        <pre class='err'><ol>".implode("", array_map(function($l){return "<li>$l</li>";}, $trace))."</ol>$body</pre>
      </div></div></body></html>";
    }
  }
  if (!is_null($body) && !is_string($body)) {
    header("Content-Type: application/json");
    $body = json_encode($body);
  }
  // onderstaande check is nodig omdat een request dubbel wordt uitgeveord en een cors probleem ontstaat
  if (method_exists('Aim', 'method_'.$_SERVER['REQUEST_METHOD'])) {
    http_response_code($code);
  }
  die($body);
}
function http_response_post($arr) {
  http_response(200, array_replace($_POST, $arr));
}
function debug() {
  // throw new Exception('a');
  // $t = round(microtime(true)*1000-__startTime);
  // $arg_list = func_get_args();
  // $bt = debug_backtrace();
  // // die(json_encode([
  // //   'time'=>$t,
  // //   'args'=>func_get_args(),
  // //   'trace'=>$bt,
  // // ]));
  // extract($bt[0]);
  //
  // extract(array_merge($bt[0],parse_url($bt[0]['file']),pathinfo($bt[0]['file'])));
  // $line = "$basename:$line ";
  // if (isset($bt[1]['class'])) $line .= "(".$bt[1]['class'].'->';
  // if (isset($bt[1]['function'])) $line .= $bt[1]['function'].") ";
  // array_unshift($arg_list, $line . "$t ms");
  // die('sss');
  http_response(501, func_get_args());
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
function check_argument($check, $code, $message = '') {
  if (!$check) {
    http_response($code, $message);
  }
}
function eval_operation($operation, $parameters = []) {
  $operation = explode('.', $operation);
  $classname = array_shift($operation);
  // debug($classname);
  $methodname = array_shift($operation);
  preg_match('/(.+?)\((.*?)\)/', $classname, $match);


  $classname = $match[1];
  $classparams = explode(',',$match[2]);
  // aim()->http_response(200, $classname, $methodname);
  $obj = new $classname(...$classparams);

  check_argument(method_exists($obj, $methodname), 406, 'Method not exists');


  return $obj->$methodname($parameters);
  //
  // debug($operation, $class, $method, $match);
  // // $
  // // new $operation;
  // check_argument(preg_match('/(.+?)\((.*?)\)\.(.+)/', $operation, $match), 406, 'invalid operation id specified');
  // $this->check(class_exists($classname = $match[1]), 406, 'Classname not exists');
  // $classparams = explode(',',$match[2]);
  // $obj = new $classname(...$classparams);
  // $this->check(method_exists($obj, $funcname = $match[3]), 406, 'Method not exists');
  // return $obj->$funcname($parameters);
}
function get_security_scope($security, $scopes) {
  // return [];
  foreach ($security as $row) {
    if (isset($row['aliconnect_auth'])) {
      return array_values(array_intersect($row['aliconnect_auth'], $scopes));
    }
  }
  return [];
}

function json_parse_file($fname) {
  return json_decode(file_get_contents($fname), true);
}
register_shutdown_function(function () {
  if (isset($GLOBALS['aim'])) {
    $GLOBALS['aim']->shutdown();
  }
});
function aim_id($id){
  return (int)strtok($id,'-');
}
function aim_uid($id){
  $id = explode('-', $id);
  $id = array_slice($id, -5, 5, true);
  return implode('-', $id);
}
new Aim();

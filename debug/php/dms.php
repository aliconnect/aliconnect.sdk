<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
// header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Origin: https://editor.swagger.io');
// header('Access-Control-Allow-Origin: *');

header("Cache-Control: no-store");
define('LOG_MAILTO', 'max@alicon.nl' );
define('MESSAGE_TYPE_ERROR', 0 );
define('MESSAGE_TYPE_MAIL', 1 );
define('MESSAGE_TYPE_WARN', 5 );
define('MESSAGE_TYPE_DEBUG', 6 );
define('startTime', microtime(true) * 1000);
define('__AIM__', __DIR__);
define('AIM_OAUTH2_URL', 'https://login.aliconnect.nl/api/oauth2');
define('AIM_CONFIG_YAML_NAME_ID', 2096);
define('AIM_API_NAME_ID', 2097);
define('AIM_DIR_LIB', $_SERVER['DOCUMENT_ROOT'].'/lib' );
define('root_dir', dirname($_SERVER['SCRIPT_NAME']) );
define('ACCESS_TOKEN_EXPIRES_IN', 3600);
define('COOKIE_LIFETIME', 365 * 24 * 60 * 60);
define('API_ROOT_URL', 'http'.($_SERVER['SERVER_PORT_SECURE'] ? 's' : '').'://'.$_SERVER['SERVER_NAME'].'/api/' );
define('IdIntersectKeys', ['schema'=>1, 'ID'=>1, 'UID'=>1]);

require_once(__DIR__.'/fn.php');

$AccessControlAllowOrigin = '*';
$hostname = isset($_SERVER['HTTP_HOST']) ? extract_hostname($_SERVER['HTTP_HOST']) : null;
if (isset($_GET['script'])) {
	$hostname = $hostname ?: extract_hostname(parse_url($_GET['script'])['host']);
}
if (isset($_GET['origin'])) {
	$origin = $_GET['origin'];
} else if (isset($_SERVER['HTTP_REFERER'])) {
	$origin = $_SERVER['HTTP_REFERER'];
}
if (isset($origin)) {
	$origin = parse_url($origin);
	$hostname = $hostname ?: extract_hostname($origin['host']);
	if ($origin['scheme'] !== 'file' && !strstr($origin['host'],'localhost')) {
		$AccessControlAllowOrigin = $origin['scheme'] . '://' . $origin['host'];
	}
}
$hostname = $hostname ?: 'aliconnect';
// header('Access-Control-Allow-Origin: '.$AccessControlAllowOrigin);
define('AIM_DOMAIN', $hostname );
define('AIM_DOMAIN_ROOT', $_SERVER['DOCUMENT_ROOT'].'/sites/'.AIM_DOMAIN );
// DEBUG: MKAN ONBEKEND WAAROM DEZE CODE
if (isset($_GET['path'])) {
	$url = parse_url($_GET['path']);
	$items=[];
	function readDirs($path){
		global $items;
		$dirHandle = opendir($_SERVER['DOCUMENT_ROOT'].$path);
		$dirs=[];
		while($item = readdir($dirHandle)) {
			if ($item === '.' || $item === '..') continue;
			if ($item[0] === '_' || strstr($item, 'Copy') || preg_match('/[0-9]\./', $item)) continue;
			$ext = pathinfo($item, PATHINFO_EXTENSION);
			$title = str_replace('.'.$ext,'',pathinfo($item, PATHINFO_BASENAME));
			if (is_dir($_SERVER['DOCUMENT_ROOT']."/$path/$item")) {
				$dirs[] = "/$path/$item";
			} else if (in_array($ext, ['md','html','js','css','php'])) {
				$items[] = [
					'title'=> $title,
					'name'=> $item,
					'ext'=> $ext,
					'src'=> $path."/".$item,
					'content'=> htmlentities(file_get_contents($_SERVER['DOCUMENT_ROOT'].$path."/".$item)),
				];
			}
		}
		foreach ($dirs as $item) {
			readDirs($item);
		}
	}
	if (is_file($_SERVER['DOCUMENT_ROOT'].$url['path'])) $url['path'] = dirname($url['path']);
	readDirs($url['path']);
	header('Content-Type: application/json');
  die(json_encode($items, JSON_PRETTY_PRINT));
}

$arr = explode('?',$_SERVER['REQUEST_URI']);
define('request_url', $url = str_replace(['/api','/v1'],'', '/' . (	trim(str_replace(root_dir,'',$d = array_shift($arr)),'/')?:trim (root_dir,'/') )));


// header('Access-Control-Allow-Origin: https://editor.swagger.io');

require_once(__DIR__.'/aim.php');
require_once(__DIR__.'/account.php');
require_once(__DIR__.'/mse.php');
require_once(__DIR__.'/pdf.php');
require_once(__DIR__.'/server.php');
require_once(__DIR__.'/item.php');
require_once(__DIR__.'/prompt.php');
// require_once(__DIR__.'/php/account.php');
require_once(__DIR__.'/message.php');
require_once(__DIR__.'/request_type.php');
require_once(__DIR__.'/me.php');

class dms extends aim {
  public function init_pathname() {
    switch ($this->pathname) {
      case '/send_mail': {
        $row = sqlsrv_fetch_object(aim()->query(
    			"SELECT TOP 1 * FROM mail.dt WHERE sendDateTime IS NULL;"
    		));
    		if ($row) {
    			$mail = aim()->mail(json_decode($row->data, true));
    			aim()->query(
    				"UPDATE mail.dt SET sendDateTime = GETDATE() WHERE id = %d;",
    				$row->id
    			);
    			// header( "refresh:3" );
    			die ($mail->Body);
    		}
    		die ('last try '.date('Y-m-d h:i:s'));
      }
      case '/translate': {
        $lang = $this->request('lang');
        if (!is_file($fname = $this->root."/translations/$lang.yaml")) {
          $translate_template = yaml_parse_file($this->root."/translations/nl.yaml");
          $arr_values = array_chunk(array_values($translate_template), 100);
          $arr_keys = array_chunk(array_keys($translate_template), 100);
          $translate = [];
          foreach ($arr_values as $i => $chuck) {
            $result = translate([
            'q' => $chuck,
            'source' => 'en',
            'target' => $lang,
            ]);
            if ($result['error']) {
              $translate = $translate_template;
              break;
            }
            $translate = array_merge($translate,array_combine($arr_keys[$i], $result));
          }
          yaml_emit_file($fname,$translate);
        }
        $this->reply_json(yaml_parse_file($fname));
      }
      case '/config.json': {
        $client_id = $this->request('client_id');
        $this->init_config($client_id);
        $this->reply_json($this->config);
      }
      case '/config.js': {
        aim_header('Content-Type', 'text/javascript');
        die('aimConfig='.json_encode($this->config));
      }
      case '/': {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
          // if (!$this->jwt->valid()) error(401);
          $content = file_get_contents('php://input');
          try {
            $data = yaml_parse($content);
            if ($data['client_id']) {
              file_put_contents($fname = $this->root."/config/$data[client_id].yaml", file_get_contents('php://input'));
            }
            echo "Saved $fname";
          } catch (Exception $e) {
            echo 'Caught exception: ',  $e->getMessage(), "\n";
          }
          die();
        }
      }
      case '/api.json': {
        $client_id = $this->request('client_id');
        if (isset($_REQUEST['account_id'])) {
          $account_id = $_REQUEST['account_id'];
          $scopes = $this->get_granted_scopes($client_id, $account_id);
        } else {
          $scopes = [];
        }
        $this->init_config($client_id);
        $this->init_api($scopes);
        $this->reply_json($this->api);
      }
      case '/api.yaml': {
        // $this->allow_origin('*');
        $client_id = $this->request('client_id');
        $account_id = $this->request('account_id');
        $scopes = $this->get_granted_scopes($client_id, $account_id);
        $this->init_config($client_id);
        $this->init_api($scopes);
        $this->header('Content-Type', 'text/yaml');
        die(str_replace('!php/object "O:8:\"stdClass\":0:{}"', '{}', yaml_emit($this->api)));
      }
    }
  }
  public function init_request_type() {
    switch($_GET['request_type']) {
      case 'make_token': {
        $jwt = (new jwt())->secret($_GET['client_secret']);
        unset($_GET['client_secret']);
        echo $this->jwt->set($_GET)->get();
        // echo $this->jwt->valid();
        die();
      }
    }
  }

  public function init_dms() {
    $this->init_path();
    $this->init_pathname();
    // die('a');
    // $this->debug(2);
    // $this->debug($this);

    $this->handle_api_call();


    if (isset($_GET['request_type'])) $this->init_request_type();
  }
  public function archive_code() {
    // if (isset($_GET['sub'])) {
    //   $client = sqlsrv_fetch_object($this->query('SELECT id,keyname FROM item.dv WHERE uid=%s', $this->client_id));
    //   // debug($client);

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
      // echo $scope.PHP_EOL;
      // debug(1);
      // debug($client->keyname, $scope, $_GET['scope']);
      // die();
    // }

    // $scopes = explode(' ', $_GET['scope']);
    // $scopes = explode(' ', $this->scope);
    // $this->scopes = ['item.write'];
  }

  public function handle_api_call() {
    $access_token = $this->init_auth();
    $this->init_config($access_token['client_id']);
    $scopes = explode(' ',$access_token['scope']);

    $scopes = ['admin.write'];

    $this->init_api($scopes);
    $this->secret = yaml_parse_file($this->root."/config/secret.yaml");
    $this->context = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
    $path_to_search = preg_replace('/\(.*?\)/', '()', $this->pathname);
    $request_method = strToLower($this->request('REQUEST_METHOD', $_SERVER));

    if (isset($this->api['paths'])) {
      foreach ($this->api['paths'] as $path_name => $path) {
        if (preg_replace('/\(.*?\)/', '()', $path_name) === $path_to_search) {
          $path_method = $this->request($request_method, $path);
          $path_method_security = $this->request('security', $path_method);

          $operationId = empty($path_method['operationId'])
          ? str_replace("/","\\",$this->pathname)
          : $path_method['operationId'];

          // $this->debug($operationId, class_exists($operationId), function_exists($operationId));

          foreach ($path_method_security as $security) {
            $aliconnect_auth = $this->request('aliconnect_auth', $security);
            // $this->debug($aliconnect_auth, $this->scopes);
            $this->check(array_intersect($aliconnect_auth, $scopes), 406, 'Not correct scope');

            // $this->debug("$operationId\\$request_method", function_exists("$operationId\\$request_method"));

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
                      $this->error(400, "parameter $name required");
                    }
                  } else if ($parameter['in'] === 'path') {
                    $parameters[$name] = $match[$i];
                  }
                }
              }
              $res = $this->exec($operationId, $parameters);
            }
            $this->reply_json($res);
          }
          $this->error(403, 'No aliconnect_auth scope');
        }
      }
    }

    $this->error(403, 'Path not available');
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
    //         $items = $this->query_items("--hostId = @hostId AND classID = @classId AND
    //         id = $id");
    //         if ($items) {
    //           echo json_encode(array_merge([
    //             '@context'=>$this->context,
    //           ], (array)$items[0]));
    //         }
    //         die();
    //       } else {
    //         $items = $this->query_items("--hostId = @hostId AND
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
}

$aim = new dms();
$aim->init_dms();
// die('a');
//
// $aim->api();
// $aim->start();
// debug(1);
// $aim->init();

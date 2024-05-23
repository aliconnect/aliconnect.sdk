<?php
// define('AIM_ACCOUNT_TABLE', "[auth].[dbo].[account]");
// define('AIM_USER_GET', "[auth].[dbo].[user_get]");
use Dompdf\Dompdf;
use RtfHtmlPhp\Document;
use RtfHtmlPhp\Html\HtmlFormatter;

$this->find_parameters = [
  ['name'=> '$top', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
  ['name'=> '$skip', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
  ['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
  ['name'=> '$filter', 'in'=> "query", 'schema'=> ['type'=> "string"]],
  ['name'=> '$order', 'in'=> "query", 'schema'=> ['type'=> "string"]],
];

$this->outlook_request = function () {
  // ok($this->request_path);
  $account = sql_fetch(sql_query("SELECT mse_access_token FROM auth.dbo.client_user_view WHERE id = ?", [$this->access['oid']]));
  // ok($this->access);
  // ok($account);
  $headers = [
    "User-Agent: php-tutorial/1.0",						// Sending a User-Agent header is a best practice.
    "Authorization: Bearer ".$account['mse_access_token'], // Always need our auth token!
    "Accept: application/json",							// Always accept JSON response.
    // "client-request-id: ".self::makeGuid(),             // Stamp each new request with a new GUID.
    "return-client-request-id: true",                   // Tell the server to include our request-id GUID in the response.
    // "X-AnchorMailbox: ".$this->preferred_username		// Provider user's email to optimize routing of API call
  ];
  // debug($url, $headers);

  $path = $this->request_path;
  error_log($path);
  // $path = str_replace("/me","/users/f40f8462-da7f-457c-bd8c-d9e5639d2975",$path);
  $url = 'https://graph.microsoft.com/v1.0'.$path.'?'.http_build_query($_GET);
  // error(400,$url);
  $curl = curl_init($url);

  switch($this->request_method) {
    //** POST insert object */
    case "post": {
      // error(400,'post');
      error_log("Doing POST");
      // Add a Content-Type header (IMPORTANT!)
      $headers[] = "Content-Type: application/json";
      curl_setopt($curl, CURLOPT_POST, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($_REQUEST));
      break;
    }
    //** PATCH update object */
    case "patch": {
      $data = file_get_contents('php://input');
      // error(400,[$path,$data]);
    	error_log("Doing PATCH $url");
    	// Add a Content-Type header (IMPORTANT!)
    	$headers[] = "Content-Type: application/json";
    	curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PATCH");
    	curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    	break;
    }
  }
  // 	case "GET":
  // 	// Nothing to do, GET is the default and needs no
  // 	// extra headers.
  // 	error_log("Doing GET");
  // 	break;
  // 	case "POST":
  // 	error_log("Doing POST");
  // 	// Add a Content-Type header (IMPORTANT!)
  // 	$headers[] = "Content-Type: application/json";
  // 	curl_setopt($curl, CURLOPT_POST, true);
  // 	curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
  // 	break;
  // 	case "PATCH":
  // 	error_log("Doing PATCH");
  // 	// Add a Content-Type header (IMPORTANT!)
  // 	$headers[] = "Content-Type: application/json";
  // 	curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PATCH");
  // 	curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
  // 	break;
  // 	case "DELETE":
  // 	error_log("Doing DELETE");
  // 	curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
  // 	break;
  // 	default:
  // 	error_log("INVALID METHOD: ".$method);
  // 	exit;
  // }
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
  //curl_setopt($curl, CURLOPT_CAINFO, $_SERVER['DOCUMENT_ROOT'] . "/../cert/aliconnectnl.pem");
  $response = curl_exec($curl);
  // error_log("curl_exec done.");
  $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
  // error_log("Request returned status ".$httpCode);
  if ($httpCode === 401) {
  	self::getRefreshToken();
  	if ($accessToken) self::makeApiCall($method, $url, $payload);
  	return ;
  }
  else if ($httpCode >= 400) {
    error($httpCode,json_decode($response));
    return array('errorNumber' => $httpCode, 'error' => 'Request returned HTTP error '.$httpCode);
  }
  // $curl_errno = curl_errno($curl);
  // $curl_err = curl_error($curl);
  // if ($curl_errno) {
  // 	$msg = $curl_errno.": ".$curl_err;
  // 	error_log("CURL returned an error: ".$msg);
  // 	curl_close($curl);
  // 	return array('errorNumber' => $curl_errno, 'error' => $msg);
  // }
  // else {
  // 	// error_log("Response: ".$response);
  // 	// return json_decode($response);
  // }
  curl_close($curl);
  header("Content-Type: application/json");
  // error(400,json_decode($response));
  response(200,$response);
};

$tokencreate = function() {
  $_REQUEST['expires_after'] = $_REQUEST['expires_after']?:3600;
  echo "<style>
  textarea,input{display:block;width:100%;}
  </style>";
  echo "<form method='post'>";
  // echo "<input placeholder='id' name='id' value='{$_REQUEST['id']}'/><br>";
  echo "<input placeholder='secret' name='secret' value='{$_REQUEST['secret']}'/><br>";
  echo "<input placeholder='expires_after' name='expires_after' value='{$_REQUEST['expires_after']}'/><br>";
  echo "<textarea placeholder='payload' rows=10 name='payload'>{$_REQUEST['payload']}</textarea>";
  $jwt = new Jwt();
  $payload = yaml_parse($_REQUEST['payload']);
  // $payload['client_id'] = $_REQUEST['id'];
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

class Item {
  static function setAttribute($id, $name, $value) {
    $aim = $GLOBALS['aim'];
    $aim->sql_exec('aim1.item.attr', ['id'=>$id,'name'=>$name,'value'=>$value]);
  }
  static function get($id, $options) {
    $aim = $GLOBALS['aim'];
    // $selectNames = "'".implode("','", array_keys($options['$select']))."'";
    $selectNames = "'".str_replace(",","','",$options['$select'])."'";
    $res = sql_query([
      "SET NOCOUNT ON;DECLARE @id AS UNIQUEIDENTIFIER = ?, @itemId BIGINT",
      "SELECT @itemId = id FROM aim1.item.dt WHERE uid = @id",
      "SELECT null as [@odata.id], uid AS id, id AS itemId, title FROM aim1.item.dt WHERE id = @itemId",
      "SELECT attributeName AS name,value FROM aim1.attribute.vw WHERE itemId = @itemId AND attributeName IN ({$selectNames})",
    ], [$id]);
    $item = sql_fetch($res);
    if (sqlsrv_next_result($res)) {
      while ($row = sql_fetch($res)) {
        $item[$row['name']] = $row['value'];
      }
    }
    $item['@odata.id'] = "{$aim->serviceRoot}/item({$item['id']})";
    ksort($item);
    return $item;
  }
}

Aim::$config->extend([
  'paths'=> [
    '/sitescan'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          switch ($_GET['response_type']) {
            case 'list': {
              $this->http_response_query([
                "DECLARE @domainId INT = ?",
                "SELECT TOP 1000 id,data FROM import.dbo.url2 WHERE domainId = @domainId AND data > ''",
              ], [
                $_GET['domainId'],
              ]);
            }
          }
        },
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $contents = file_get_contents('php://input');
          switch ($_GET['data_type']) {
            case 'page': {
              $data = json_decode($contents, true);
              sql_query([
                "DECLARE @domainId INT = ?",
                "DECLARE @url NVARCHAR(800) = ?",
                "IF NOT EXISTS (SELECT 0 FROM import.dbo.url2 WHERE domainId = @domainId AND url = @url) INSERT import.dbo.url2(domainId,url) VALUES (@domainId,@url)",
                "UPDATE import.dbo.url2 SET html = ?, origin = ?, loadDateTime = GETDATE() WHERE domainId = @domainId AND url = @url",
              ], [
                $data['domainId'],
                $data['url'],
                $data['html'],
                $data['origin'],
                // $data['href'],
              ]);
              foreach($data['refs'] as $href) {
                sql_query([
                  "DECLARE @domainId INT = ?",
                  "DECLARE @url NVARCHAR(800) = ?",
                  "IF NOT EXISTS (SELECT 0 FROM import.dbo.url2 WHERE domainId = @domainId AND url = @url)
                  INSERT import.dbo.url2(domainId,url) VALUES (@domainId,@url)",
                ], [
                  $data['domainId'],
                  $href,
                ]);
              }
              $this->http_response_query([
                "DECLARE @domainId INT = ?",
                "DECLARE @url NVARCHAR(800) = ?",
                "SELECT id FROM import.dbo.url2 WHERE domainId = @domainId AND url = @url",
                "SELECT TOP 1 url FROM import.dbo.url2 WHERE domainId = @domainId AND loadDateTime IS NULL",
              ], [
                $data['domainId'],
                $data['url'],
              ]);
            }
            case 'analyse_page_load': {
              $this->http_response_query([
                "DECLARE @domainId INT = ?",
                "SELECT TOP 1 id,html FROM import.dbo.url2 WHERE domainId = @domainId AND scanDateTime IS NULL",
              ], [
                $_GET['domainId'],
              ]);
            }
            case 'analyse_page_save': {
              $data = json_decode($contents, true);
              $res = sql_query([
                "SELECT CONCAT('/',domainId,basename) AS basename FROM import.dbo.page_image INNER JOIN import.dbo.image ON image.id = page_image.imageId WHERE page_image.pageId = ?",
              ], [
                $_GET['id'],
              ]);
              $data['images'] = [];

              while ($row = sql_fetch($res)) {
                $data['icon'] = $data['icon'] ?: $row['basename'];
                $data['images'][] = ['src'=>$row['basename']];
              }

              $this->http_response_query([
                "UPDATE import.dbo.url2 SET data = ?,scanDateTime = GETDATE() WHERE id = ?",
              ], [
                json_encode($data),
                $_GET['id'],
              ]);
            }

            case 'upload_img': {
              error_reporting(E_ALL ^ E_WARNING);

              if (isset($_GET['basename'])) {
                if (isset($_GET['src'])) {
                  $content = file_get_contents($_GET['src']);
                } else {
                  $content = file_get_contents('php://input');
                  $content = base64_decode(explode('base64,',$content)[1]);
                }
                // $basename = basename(explode('?',$_GET['basename'])[0]);
                $basename = $_GET['basename'];
                // http_response(200, [$basename]);
                sql_query([
                  "DECLARE @domainId INT = ?",
                  "DECLARE @pageId INT = ?",
                  "DECLARE @basename NVARCHAR(800) = ?",
                  "DECLARE @imageId INT",
                  "IF NOT EXISTS (SELECT 0 FROM import.dbo.image WHERE domainId = @domainId AND basename = @basename)
                  INSERT import.dbo.image(domainId,basename) VALUES (@domainId,@basename)",
                  "SELECT @imageId = id FROM import.dbo.image WHERE domainId = @domainId AND basename = @basename",
                  "IF NOT EXISTS (SELECT 0 FROM import.dbo.page_image WHERE pageId = @pageId AND imageId = @imageId)
                  INSERT import.dbo.page_image(pageId,imageId) VALUES (@pageId,@imageId)",
                ], [
                  $domainId = $_GET['domainId'],
                  $_GET['pageId'],
                  $basename = $_GET['basename'],
                ]);
                // sql_query($q="UPDATE import.dbo.img SET loadDateTime=GETDATE() WHERE id = $id");
                $ext = pathinfo($basename, PATHINFO_EXTENSION);
                $filename = "/aliconnect/public/shared/multimedia/$domainId/$basename";
                mkdir(dirname($filename), 0777, true);
                file_put_contents($filename, $content);
                // http_response(200);
              }
              http_response(200);
              // $row = json_decode(file_get_contents('php://input'));
              // // http_response(200,["SELECT * FROM import.dbo.img WHERE src = '$row->src'"]);
              // http_response(200, aim()->sql_resultset("SELECT * FROM import.dbo.img WHERE src = '$row->src'"));
            }
          }
          http_response(200, "Test1 NOK");
          // if ($_GET['data'] === 'prijzen') {
          //   file_put_contents("prijzen.json", $contents);
          //   die();
          // }
          // if ($_GET['data'] === 'page') {
          //   $filename = __DIR__."/pages".rtrim($_GET["pathname"],'/').".json";
          //   mkdir(dirname($filename), 0777, true);
          //   file_put_contents($filename, $contents);
          //   die($filename);
          // }
          // if ($_GET['data'] === 'img') {
          //   $content = base64_decode(explode('base64,',$content)[1]);
          //   $filename = __DIR__."/multimedia".$_GET["filename"];
          //   mkdir(dirname($filename), 0777, true);
          //   file_put_contents($filename, $content);
          // }
        },
      ],
    ],
    '/test1'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          error(200, "Test1 OK");
        },
      ],
    ],

    '/client({client_id})/openapi'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $config = new Config($params);
          // error(400, $params);
          $config->openapi($params);
        },
      ],
    ],
    '/config'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          // error(400,1);
          $config = new Config($params);
          call_user_func([$config,$params['response_type'] ?: 'json'], AIM['request']);
          $config->json();
        },
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // (new Config(['ip'=>'84.83.118.234']))->delete();
          $params = json_decode(file_get_contents('php://input'), true);
          $config = new Config($params);
          $config->save($params);
          $config->json();
        },
      ],
      'delete'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // error(403);
          $params = json_decode(file_get_contents('php://input'), true);
          $config = new Config($params);
          $config->delete();
          exit();
        },
      ],
    ],
    '/json'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $params = json_decode(file_get_contents('php://input'), true);
          $client_secret = Aim::$config->secret['client_secret'];
          $payload = [
            "azp"=> Aim::$config->client_id,
            "sub"=> $params['content']['itemId'],
          ];
          error_log('json: '.json_encode([$payload,$client_secret]));
          $jwt = new Jwt;
          $params['content']['apiKey'] = $jwt->get($payload,$client_secret);
          file_put_contents('/aliconnect/public'.$params['filename'].'.json', json_encode($params['content'],JSON_PRETTY_PRINT));
          http_response(200,$params['content']);
        },
      ],
    ],
    '/his'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $this->http_response_query("SELECT top 1000 id,datepart(HOUR,logDateTime) AS hour,name,avg(value) as value
          from aim_his.dbo.historie
          where itemId = ?
          and name in ('currentTempOutdoor','currentTempSetPoint','currentTempSupplyAir','currentFanSpeedSetPoint','currentTempRoom')
          and datediff(HOUR,logDateTime,getdate())<24
          group by id,name,datepart(HOUR,logDateTime)
          order by datepart(HOUR,logDateTime)
          ", [
            $_REQUEST['itemId'],
            // $_REQUEST['id'],
          ]);

          $this->http_response_query("SELECT TOP 100 tagId,value,name,data FROM aim_his.dbo.historie WHERE data IS NOT NULL AND itemId=? AND id=? ORDER BY ts DESC", [
            $_REQUEST['itemId'],
            $_REQUEST['id'],
          ]);
          // http_response(200);
        },
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          sql_query("INSERT INTO aim_his.dbo.historie (clientId,itemId,tagId,value,id,name,data) VALUES (?,?,?,?,?,?,?)", [
            $_REQUEST['clientId'],
            $_REQUEST['itemId'],
            $_REQUEST['tagId'],
            $_REQUEST['value'],
            $_REQUEST['id'],
            $_REQUEST['name'],
            $_REQUEST['data'],
          ]);
          http_response(200);
        },
      ],
    ],
    '/recorder'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // sql_query("INSERT INTO aim_his.dbo.recorder (camId,startDateTime,duration,filename) VALUES ('1111ee48-564b-4257-8a1a-e05675b0ae8a','2022-10-11T14:30:37.947Z',10001,'d7c3e212-8dfe-4bc8-81e1-bfd2df4d91f9_20221011T143037947Z_1.webm')");
          $content = base64_decode(explode('base64,',file_get_contents('php://input'))[1]);
          $destname = $_SERVER['DOCUMENT_ROOT']."/shared/recorder/{$_REQUEST['cam_id']}/{$_REQUEST['startTimeValue']}/{$_REQUEST['nr']}.webm";
          if (!(file_exists($folder = dirname($destname)))) mkdir($folder,777,true);
          file_put_contents($destname, $content);
          $row = sqlsrv_fetch_object(sql_query([
            // "SET NOCOUNT ON;",
            "INSERT INTO aim_his.dbo.recorder (camId,startTimeValue,nrStartTimeValue,duration,nr) VALUES (?,?,?,?,?)",
            // "SELECT scope_identity() AS id",
          ], [
            $_REQUEST['cam_id'],
            $_REQUEST['startTimeValue'],
            $_REQUEST['nrStartTimeValue'],
            // $_REQUEST['start'],
            $_REQUEST['duration'],
            $_REQUEST['nr'],
            // $_REQUEST['name'],
          ]));
      	  response(200, 1);
        },
      ],
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $res = $row = sqlsrv_fetch_object(sql_query([
            // "SET NOCOUNT ON;DECLARE @start AS DATETIME, @camId AS UNIQUEIDENTIFIER = ?",
            // "SELECT TOP 1 @start = startDateTime FROM aim_his.dbo.recorder WHERE camId = @camId AND startDateTime <= ? ORDER BY startDateTime DESC",
            // "SELECT TOP 1000 startDateTime,trackStartDateTime,duration,id FROM aim_his.dbo.recorder WHERE camId = @camId AND startDateTime >= @start ORDER BY startDateTime,id",
            "SELECT TOP 1 startTimeValue,nrStartTimeValue,duration,nr FROM aim_his.dbo.recorder WHERE camId = ? AND nrStartTimeValue <= ? ORDER BY nrStartTimeValue DESC",
          ], [
            $_REQUEST['camId'],
            $_REQUEST['nrStartTimeValue'],
          ]));
          // $rows = [];
          // while ($row = sqlsrv_fetch_object($res)) {
          //   $rows[] = $row;
          // }
      	  response(200, $row);
        },
      ],
    ],

    '/polymac/project/checklist'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($client_id) {
          if (!empty($_GET['username'])) {
            $this->http_response_query([
              "SELECT project,id,status,remark,status,description,owner,role,prio,phase FROM polymac.dbo.project_checklist WHERE owner = ? AND isnull(status,0) <> 3",
            ], [
              $_GET['username'],
            ]);
          }
          $this->http_response_query([
            "DECLARE @project VARCHAR(50) = ?",
            "SELECT project,id,status,remark,status,description,owner,role,prio,phase FROM polymac.dbo.project_checklist WHERE project = @project",
            "SELECT project,phase,min(startDateTime) AS startDateTime,max(lastModifiedDateTime) AS endDateTime,sum(ISNULL([work],1)) AS [work] FROM polymac.dbo.project_checklist WHERE status IS NOT NULL AND project = @project GROUP BY project,phase",
            "SELECT project,phase,[role],sum(ISNULL([work],1)) AS [work] FROM polymac.dbo.project_checklist WHERE project = @project GROUP BY project,phase,[role]",
          ], [
            $_REQUEST['project'],
          ]);
          // response(200);
        },
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($client_id) {
          $content = json_decode(file_get_contents('php://input'), true);
          $res = sql_query([
            "DECLARE @project VARCHAR(50) = ?,@id INT = ?",
            "INSERT INTO polymac.dbo.project_checklist (project,id) SELECT @project,@id WHERE NOT EXISTS (SELECT 0 FROM polymac.dbo.project_checklist WHERE project = @project AND id = @id)",
            "UPDATE polymac.dbo.project_checklist SET startDateTime = CASE WHEN lastModifiedDateTime IS NOT NULL THEN ISNULL(startDateTime,GETDATE()) END, status = ?,remark = ?,owner = ?,description = ?,phase = ?,prio = ?,role = ?,lastModifiedDateTime = GETDATE() WHERE project = @project AND id = @id",
          ], [
            $content['project'],
            $content['id'],
            $content['status'],
            $content['remark'],
            $content['owner'],
            $content['description'],
            $content['phase'],
            $content['prio'],
            $content['role'],
          ]);
          response(200);
        },
      ],
    ],

    '/client({client_id})/item'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($client_id) {
          // error(400, 1);
          $res = sql_query([
            "SET NOCOUNT ON;DECLARE @client_id AS UNIQUEIDENTIFIER = ?, @id AS UNIQUEIDENTIFIER = newid(), @classId BIGINT, @clientId BIGINT",
            "SELECT @classId = id FROM aim1.item.dt WHERE classId = 0 AND name = ?",
            "SELECT @clientId = id FROM aim1.item.dt WHERE uid = @client_id",
            "INSERT INTO aim1.item.dt (uid,hostId,classId) VALUES (@id,@clientId,@classId)",
            "SELECT uid AS id,id AS itemId,hostId as clientId,classId FROM aim1.item.dt WHERE uid = @id",
          ], [
            $client_id,
            $_REQUEST['schemaName'],
          ]);
          $item = sql_fetch($res);
          $item['@odata.id'] = "{$this->serviceRoot}/item({$item['id']})";
          ksort($item);
      	  response(200, $item);
        },
      ],
    ],
    '/client({client_id})/usage/period'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $this->http_response_query([
            "DECLARE @id UNIQUEIDENTIFIER = ?, @period INT = ?",
            "SELECT TOP 100 method AS name,count(0) AS quant FROM auth.dbo.client_request WHERE client_id = @id AND period = @period GROUP BY client_id,method",
            "SELECT TOP 100 count(0) AS quant FROM (SELECT DISTINCT client_id,period,user_id FROM auth.dbo.client_request WHERE user_id IS NOT NULL AND client_id = @id AND period = @period) S GROUP BY client_id",
          ], [
            $id,
            $_REQUEST['period'],
          ]);
        },
      ],
    ],
    '/client({client_id})/config/mail'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $config = $this->get_client_config($id);
          // $content = file_get_contents("/aliconnect/fs/c9b05c80-4d2b-46c1-abfb-0464854dbd9a/fcbe85cf-8ba2-489e-8455-c062b6a82055");
          $content = file_get_contents("/aliconnect/fs/{$config['client_id']}/{$config['docs']['Explore-Legal-Contract.md']}");
          $this->mail([
            'prio'=>2,
            'to'=> 'max.van.kampen@alicon.nl',
            // 'bcc'=> 'max.van.kampen@alicon.nl',
            'chapters'=> [
              [ 'title' => "Aliconnect Configuratie bijgewerkt 2", 'content'=> "Uw configuratie is bijgewerkt" ],
            ],
            'attachements'=> [
              [ 'name'=> 'Explore-Legal-Contract.pdf', 'content'=> $content ],
            ],
          ]);
          response(200);
        }
      ],
    ],
    '/client({client_id})/product'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $res = sql_query("SELECT id,productId,title,attributes,catalogPrice FROM [{$id}].api.product");
          $value = [];
          while ($row = sql_fetch($res)) {
      	    $value[] = array_replace([
      	      '@odata.id'=> "{$this->serviceRoot}/client({$id})/product({$row['id']})",
      	    ],$row);
      	  }
      	  response(200,[
            '@odata.context'=> "{$this->serviceRoot}/\$metadata#product",
            'value'=> $value,
          ]);
        },
      ],
    ],
    '/client({client_id})/document'=> [
      'get'=> [
        // 'summary'=> "",
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          $config = $this->config;
          // $config = $this->get_client_config($id);
          // $GLOBALS['client_id'] = $this->access['client_id'];
          $schemas = array_change_key_case($config['definitions']);
          // $properties = $schemas['document']['properties'];
          // response(200, $properties);

          // $sql = create_query('aliconnect.dbo.document', $properties);
          // response(200, $sql);
          $res = sql_query([
            "SELECT id,client_id,name,size,type,docId,lastUploadDateTime,lastModified,lastModifiedDateTime,createdDateTime FROM aliconnect.dbo.document WHERE client_id = ? AND name = ?",
          ], [
            $id,
            $_REQUEST['name']
          ]);
          $value = [];
          while ($row = sql_fetch($res)) {
            if (isset($row->data)) {
              $row = array_replace(json_decode($row->data, true),$row);
              unset($row['data']);
            }
            $value[] = $row;
            // $value[] = array_merge([
            // 	// '@odata.id'=> "{$this->serviceRoot}/{$schema['schemaName']}('".base64_encode($row['id'])."')",
            // 	'@odata.id'=> "{$this->serviceRoot}/{$schema['schemaName']}(".strtolower($row['id']).")",
            // ], $row);
          }

          // http_response_query(create_query('aliconnect.dbo.document'));
          response(200, $value);
        }
      ],
      'post'=> [
        'summary'=> "",
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          $config = $this->config;

          // if (empty($this->access['client_id'])) error(401);

          $row = sql_fetch(sql_query($q = [
            "SET NOCOUNT ON;DECLARE @id UNIQUEIDENTIFIER = newid();",
            "INSERT INTO aliconnect.dbo.document (id,client_id,name) VALUES (@id,?,?)",
            "UPDATE aliconnect.dbo.document SET ".implode(',',array_map(function ($key){return "[$key]=?";},array_keys($_REQUEST)))." WHERE id = @id",
            "SELECT id,client_id,name,size,type,docId,lastUploadDateTime,lastModified,lastModifiedDateTime,createdDateTime FROM aliconnect.dbo.document WHERE id = @id",
          ],$p=array_merge([
            $id,
            $_REQUEST['name'],
          ], array_values($_REQUEST))));
          // error(400, [$q,$p,$row]);

          response(200, $row);
        }
      ],
    ],



    '/_item({id})'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function ($id) {
          response(200, Item::get($id,$_REQUEST));
        },
      ],
      'patch'=> [
        'summary'=> "",
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function ($id) {
          $content = json_decode(file_get_contents('php://input'), true);
          foreach($content as $name => $value) Item::setAttribute($id,$name,$value);
          response(200, Item::get($id,['$select'=>implode(',', array_keys($content))]));
        },
      ],
    ],
    '/item({id})/build1'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $config = empty($_REQUEST['template']) ? [] : yaml_parse(file_get_contents($_REQUEST['template']));
          $res = sql_query("EXEC aim1.item.build2 @id = ?",[$id]);
          while ($row = sql_fetch($res)) {
            $config['items'][$row['id']]['id']=$row['id'];
            $config['items'][$row['id']][$row['name']]=$row['value'];
            if (in_array($row['name'],['master','source'])){
              $config['items'][$row['id']][$row['name'].'Id']=$row['linkId'];
            }
          }
          $config['items'] = array_values($config['items']);
          response(200, $config);
        },
      ],
    ],
    '/item({id})/build'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $res = sql_query("EXEC aim1.item.build2 @id = ?",[$id]);
          $items = [];
          while ($row = sql_fetch($res)) {
            $items[$row['id']]['id'] = $row['id'];
            $items[$row['id']][$row['name']] = $row['value'];
          }
          response(200, [
            '@odata.context'=> $this->origin.$_SERVER['REQUEST_URI'],
            'value'=> array_values($items),
          ]);
        },
      ],
    ],
    '/item({id})/children'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id) {
          $client_id = $_REQUEST['client_id'];
          // response(200,$_REQUEST['client_id']);
          $res = sql_query([
            "SET NOCOUNT ON;DECLARE @itemId AS BIGINT",
            "SELECT @itemId = id FROM aim1.item.dt WHERE uid = ?",
            "SELECT id,itemId,title,subject,summary,LOWER([schema])AS[schemaName],masterId FROM aim1.item.vw WHERE masterId = @itemId",
          ], [$id]);
          $value = [];
          while ($row = sql_fetch($res)) {
      	    $value[] = array_replace([
      	      '@odata.id'=> "{$this->serviceRoot}/client({$client_id})/{$row['schemaName']}({$row['id']})",
      	    ],$row);
      	  }
          // error(400,1);
      	  response(200,[
            '@odata.context'=> "{$this->serviceRoot}/\$metadata#item",
            'value'=> $value,
          ]);
          error(400,[$client_id, $id]);
        },
      ],
    ],

    '/google/maps/key'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          response(200,Aim::$config->google['keyClient']);
        },
      ],
    ],
    '/google/maps/geocode/json'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $_GET['key'] = Aim::$config->google['keyServer'];
          $url = "https://maps.googleapis.com/maps/api/geocode/json?".http_build_query($_GET);
          $curl = curl_init($url);
          curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
          curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
          $output = curl_exec($curl);
          curl_close($curl);
          header('Content-Type: application/json');
          response(200,$output);
        },
      ],
    ],
    '/demo/data'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $data = yaml_parse_file('data/demo.yaml');
          response(200,$data[$_REQUEST['response_type']]);
        },
      ],
    ],
    '/tools/config/create/json'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          file_put_contents('/aliconnect/config/client/c9b05c80-4d2b-46c1-abfb-0464854dbd9a.json',json_encode(yaml_parse_file('/aliconnect/config/client/c9b05c80-4d2b-46c1-abfb-0464854dbd9a.yaml'),JSON_PRETTY_PRINT));
          // response(201);
          exit();
        },
      ],
    ],
    '/iot/token/create'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $tokencreate,
      ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $tokencreate,
      ],
    ],
    // '/outlook/authorize'=> [
    //   'get'=> [
    //     'responses'=> [200=>['description'=>"successful operation"]],
    //     'operation'=> function() {
    //       // ok(1);
    //       $serviceRoot = 'https://login.microsoftonline.com/common/oauth2/v2.0';
    //       if ($_REQUEST['code']) {
    //         $get = json_decode(base64_decode($_REQUEST['state']),true);
    //         $query = http_build_query([
    //     			'grant_type' => 'authorization_code',
    //     			'code' => $_REQUEST['code'],
    //           'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
    //     			'scope'=> $get['mse_scope'],
    //           'client_id'=> $this->secret['graph']['client_id'],
    //     			'client_secret' => $this->secret['graph']['client_secret'],
    //     		]);
    //         // ok($query);
    //         $curl = curl_init($serviceRoot.'/token');
    //     		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    //     		curl_setopt($curl, CURLOPT_POST, true);
    //     		curl_setopt($curl, CURLOPT_POSTFIELDS, $query);
    //     		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    //     		$response = curl_exec($curl);
    //     		// $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    //     		// if ($httpCode >= 400) {
    //     		// 	error(400, ['errorNumber' => $httpCode, 'error' => 'Token request returned HTTP error '.$httpCode]);
    //     		// }
    //     		// $curl_errno = curl_errno($curl);
    //     		// $curl_err = curl_error($curl);
    //     		// if ($curl_errno) {
    //     		// 	$msg = $curl_errno.': '.$curl_err;
    //     		// 	error_log('CURL returned an error: '.$msg);
    //     		// 	error(400, ['errorNumber' => $curl_errno,'error' => $msg]);
    //     		// }
    //     		curl_close($curl);
    //     		$response = json_decode($response, true);
    //     		$profile = getProfile($response['id_token']);
    //     		$access = getProfile($response['access_token']);
    //         $options = [
    //           'client_id'=> $get['client_id'],
    //           'accountname'=> $profile['preferred_username'],
    //           'create'=> 1,
    //         ];
    //         $account = sql_fetch($this->sql_exec(AIM_USER_GET, $options));
    //         sql_query("UPDATE auth.dbo.client_user_view SET mse_access_token = ?, mse_id_token = ?, mse_refresh_token = ?, mse_access = ?, mse_id = ? WHERE id = ?", [
    //           $response['access_token'],
    //           $response['id_token'],
    //           $response['refresh_token'],
    //     			json_encode($profile),
    //     			json_encode($access),
    //           $account['id'],
    //         ]);
    //         // switch($get['response_type']) {
    //         //   case 'token': {
    //         // $url = $serviceRoot.'/authorize?'.http_build_query([
    //         //   // 'response_type'=> $_REQUEST['response_type'],
    //         //   'response_type'=> 'code',
    //         //   'client_id'=> $this->secret['graph']['client_id'],
    //         //   'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
    //         //   'scope'=> $_REQUEST['scope'],
    //         //   'state'=> base64_encode(json_encode($_GET)),
    //         // ]);
    //         // header('Location: '.$url);
    //         //
    //         $array_diff = array_diff(explode(' ',$get['scope']),explode(' ',$get['mse_scope']));
    //         // if (empty($array_diff)) {
    //         //   ok([$array_diff,$get,$response,$profile,$access]);
    //         // }
    //         $get['scope'] = implode(' ',$array_diff);
    //         $get['id_token'] = (new Jwt())->get(['accountname'=> $account['accountname']], $this->secret['client_secret'], 3600);
    //         $get['prompt'] = 'accept';
    //         $url = '/v1?'.http_build_query($get);
    //         header('Location: '.$url);
    //         exit;
    //       }
    //       switch($_REQUEST['response_type']) {
    //         case 'token': {
    //           $url = $serviceRoot.'/authorize?'.http_build_query([
    //             // 'response_type'=> $_REQUEST['response_type'],
    //             'response_type'=> 'code',
    //             'client_id'=> $this->secret['graph']['client_id'],
    //             'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
    //             'scope'=> $_REQUEST['scope'],
    //             'state'=> base64_encode(json_encode($_GET)),
    //           ]);
    //           header('Location: '.$url);
    //         }
    //         default: {
    //
    //           ok($_SERVER['REQUEST_URI']);
    //         }
    //       }
    //     }
    //   ],
    // ],
    // '/'=> [
    //   'get'=> [
    //     'responses'=> [200=>['description'=>"successful operation"]],
    //     'operation'=> function() {
    //       if (isset($_REQUEST['response_type'])) {
    //         $scopes = explode(' ',$_REQUEST['scope']);
    //         $mse_scopes = [
    //           'openid',
    //           'offline_access',
    //           'profile',
    //           'email',
    //           'https://graph.microsoft.com/tasks.readwrite',
    //           'https://graph.microsoft.com/mail.readwrite',
    //           'https://graph.microsoft.com/calendars.readwrite',
    //           'https://graph.microsoft.com/contacts.readwrite',
    //           'https://graph.microsoft.com/people.read',
    //         ];
    //         if (array_intersect($scopes,$mse_scopes)) {
    //           $query = [
    //             // 'response_type'=> $_REQUEST['response_type'],
    //             'response_type'=> 'code',
    //             'client_id'=> $this->secret['graph']['client_id'],
    //             'redirect_uri'=> 'https://aliconnect.nl/v1/outlook/authorize',
    //             'scope'=> $_GET['mse_scope'] = implode(' ',$mse_scopes),
    //             'state'=> base64_encode(json_encode($_GET)),
    //           ];
    //           // ok($query);
    //           $url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?'.http_build_query($query);
    //           header('Location: '.$url);
    //           exit;
    //         }
    //         switch($_REQUEST['response_type']) {
    //           case 'code': {
    //             readfile('login.html');
    //             exit;
    //           }
    //           case 'token': {
    //             readfile('login.html');
    //             exit;
    //           }
    //         }
    //       }
    //     }
    //   ],
    //   'post'=> [
    //     'responses'=> [200=>['description'=>"successful operation"]],
    //     'operation'=> function() {
    //       // switch($_REQUEST['response_type']) {
    //       //   case 'code': {
    //           $http_response_prompt = function($prompt)use(&$account){
    //             response(200, [
    //               'prompt'=> $prompt,
    //               'accountname'=> $account['accountname'],
    //               'id_token'=> (new Jwt())->get([
    //                 'accountname'=> $account['accountname'],
    //               ], $this->secret['client_secret'], 3600),
    //             ]);
    //           };
    //           $account = [];
    //
    //           if (!empty($_REQUEST['id_token'])) {
    //             $jwt = new Jwt();
    //             $jwt->decode($_REQUEST['id_token'], $this->secret['client_secret']);
    //             $account = sql_fetch($this->sql_exec(AIM_USER_GET, $options = [
    //               'accountname'=> $jwt->payload['accountname'],
    //               'client_id'=> $_REQUEST['client_id'],
    //               'code'=> $_REQUEST['verify_code'],
    //             ]));
    //             // nok(401, [$account,$options]);
    //             // $account = sql_fetch(sql_query([
    //             //   "SELECT accountname,email_verified,phone_number,phone_number_verified,verify_code FROM Account WHERE accountname = ?",
    //             // ], [
    //             //   $jwt->payload['accountname'],
    //             // ]));
    //           }
    //           switch($_REQUEST['prompt']) {
    //             case 'login' : {
    //               $account = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'password'=> $_REQUEST['password']]));
    //               // error(401, $account);
    //               if (empty($account)) error(401, "Dit account bestaat niet");
    //               if ($account['pwdcompare'] === null) $account['email_verified'] = null;
    //               break;
    //             }
    //             case 'password' : {
    //               $account = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'password'=> $_REQUEST['password']]));
    //               if ($account['pwdcompare'] === 0) error(401, "Wachtwoord incorrect");
    //               break;
    //             }
    //             case 'create_account' : {
    //               $row = sql_fetch(sql_query([
    //                 // "EXEC auth.dbo.user_get @client_id = ?, @accountname = ?, @create = 1",
    //                 "SELECT id FROM {AIM_ACCOUNT_TABLE} WHERE accountname = ?",
    //               ], [
    //                 $_REQUEST['accountname'],
    //               ]));
    //               // error(401, "Dit account bestaat al");
    //
    //               if ($row) {
    //                 error(401, "Dit account bestaat al");
    //               }
    //               $account = sql_fetch($this->sql_exec(AIM_USER_GET, [
    //                 'accountname'=> $_REQUEST['accountname'],
    //                 'create'=> 1,
    //               ]));
    //               break;
    //             }
    //             case 'setpassword': {
    //               if ($_REQUEST['newpassword'] !== $_REQUEST['newpassword2']) error(401, "Verificatie wachtwoord komt niet overeen");
    //               sql_query(["UPDATE Account SET password = PWDENCRYPT(?) WHERE accountname = ?"], [
    //                 $_REQUEST['newpassword'],
    //                 $account['accountname'],
    //               ]);
    //               $account = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'password'=> $_REQUEST['newpassword']]));
    //               break;
    //             }
    //             case 'reset_password' : {
    //               sql_query("UPDATE {AIM_ACCOUNT_TABLE} SET verify_code_set=GETDATE(), verify_code = ? WHERE accountname = ?", [$code = rand(10000,99999),$account['accountname']]);
    //               $this->mail([
    //                 'to'=> $account['accountname'],
    //                 'bcc'=> 'max.van.kampen@alicon.nl',
    //                 'chapters'=> [["title"=>"Beveiligingscode aanmelden", "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm."]],
    //               ]);
    //               $http_response_prompt('reset_password_verify');
    //             }
    //             case 'reset_password_verify': {
    //               $row = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'code'=> $_REQUEST['verify_code']]));
    //               if ((time() - strtotime($row['verify_code_set'])) > 60) { error(401, "De code is verlopen"); }
    //               if ($row['codecompare'] !== 1) { error(401, "De code is onjuist"); }
    //               $http_response_prompt('setpassword');
    //               break;
    //             }
    //             case 'email_verifycode_send' : {
    //               sql_query("UPDATE {AIM_ACCOUNT_TABLE} SET verify_code_set=GETDATE(), verify_code = ? WHERE accountname = ?", [$code = rand(10000,99999),$account['accountname']]);
    //               $this->mail([
    //                 'to'=> $account['accountname'],
    //                 'bcc'=> 'max.van.kampen@alicon.nl',
    //                 'chapters'=> [["title"=>"Beveiligingscode aanmelden", "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm."]],
    //               ]);
    //               $http_response_prompt('email_verified');
    //             }
    //             case 'email_verified': {
    //               // $row = sql_fetch($this->sql_exec(AIM_USER_GET, ['accountname'=> $_REQUEST['accountname'],'code'=> $_REQUEST['verify_code']]));
    //
    //               if ((time() - strtotime($account['verify_code_set'])) > 260) { error(401, "De code is verlopen"); }
    //               if ($account['codecompare'] !== 1) { error(401, "De code is onjuist"); }
    //               sql_query(["UPDATE {AIM_ACCOUNT_TABLE} SET email_verified = GETDATE() WHERE accountname = ?"], [$account['accountname']]);
    //               $account['email_verified']=1;
    //               break;
    //             }
    //             case 'phone_number' : {
    //               if (empty($_REQUEST['phone_number'])) error(401);
    //               sql_query(["UPDATE Account SET phone_number = ? WHERE accountname = ?"], [$account['phone_number'] = $_REQUEST['phone_number'],$account['accountname']]);
    //               $account['pwdcompare']=1;
    //               break;
    //             }
    //             case 'phone_number_verifycode_send' : {
    //               sql_query("UPDATE {AIM_ACCOUNT_TABLE} SET verify_code_set=GETDATE(), verify_code = ? WHERE accountname = ?", [$code = rand(10000,99999),$account['accountname']]);
    //               $this->mail([
    //                 'to'=> $account['accountname'],
    //                 'bcc'=> 'max.van.kampen@alicon.nl',
    //                 'chapters'=> [["title"=>"Beveiligingscode aanmelden SMS", "content"=>"<p>Uw beveiligingscode is <b>{$code}</b></p> <p>Voer deze in op het aanmeldscherm."]],
    //               ]);
    //               // $this->sms('+'.$account['phone_number'], "Uw code is {$code}", "Aliconnect");
    //               $http_response_prompt('phone_number_verified');
    //             }
    //             case 'phone_number_verified' : {
    //               if ((time() - strtotime($account['verify_code_set'])) > 260) { error(401, "De code is verlopen"); }
    //               if ($account['codecompare'] !== 1) { error(401, "De code is onjuist"); }
    //               sql_query(["UPDATE {AIM_ACCOUNT_TABLE} SET phone_number_verified = GETDATE() WHERE accountname = ?"], [$account['accountname']]);
    //               $account['phone_number_verified']=1;
    //               $account['pwdcompare']=1;
    //               break;
    //             }
    //             case 'accept' : {
    //               $scope = implode(' ',array_intersect(explode(' ',$_REQUEST['scope']),array_keys($_POST)));
    //               $options = [
    //                 'client_id'=> $_REQUEST['client_id'],
    //                 'accountname'=> $account['accountname'],
    //                 'accept'=> json_encode([
    //                   'scope'=> $scope,
    //                 ]),
    //                 'create'=> 1,
    //               ];
    //               $account = sql_fetch($this->sql_exec(AIM_USER_GET, $options));
    //               $expires_in = $ACCESS_TOKEN_LIFETIME;
    //               // if (!$account) nok(401, [$options,$_REQUEST,$account,getProfile($_REQUEST['id_token'])]);
    //
    //               switch($_REQUEST['response_type']) {
    //                 case 'code': {
    //                   response(200, [
    //                     'code'=> (new Jwt())->get([
    //                       'id'=> $account['code_id'],
    //                       // 'a'=> $account,
    //                       // 'o'=> $options,
    //                     ], $this->secret['client_secret'], 60),
    //                   ]);
    //                 }
    //                 case 'token': {
    //                   $url = $_REQUEST['redirect_uri'].'#'.http_build_query([
    //                     'state'=> $_REQUEST['state'],
    //                     'access_token'=> (new Jwt())->get([
    //                       'client_id'=> $account['client_id'],
    //                       'scope'=> implode(' ',[$_REQUEST['scope'], $_REQUEST['mse_scope']]),
    //                       'oid'=> $account['id'],
    //                       // 'r'=> $_REQUEST,
    //                     ], $account['client_secret'], $expires_in),
    //                     'expires_in'=> $expires_in,
    //                     'scope'=> $scope,
    //                     'token_type'=> 'Bearer',
    //                   ]);
    //                   header('Location: '.$url);
    //                   exit;
    //                 }
    //               }
    //               break;
    //             }
    //           }
    //           if (!$account['email_verified']) $http_response_prompt('email_verifycode_send');
    //           if (!$account['hasPassword']) $http_response_prompt('setpassword');
    //           if (!$account['pwdcompare']) $http_response_prompt('password');
    //           if (!$account['phone_number']) $http_response_prompt('phone_number');
    //           if (!$account['phone_number_verified']) $http_response_prompt('phone_number_verifycode_send');
    //           $http_response_prompt('accept');
    //       //   }
    //       // }
    //     }
    //   ],
    // ],
    // '/token'=> [
    //   'post'=> [
    //     'responses'=> [200=>['description'=>"successful operation"]],
    //     'operation'=> function() {
    //       switch($_REQUEST['grant_type']) {
    //         case 'authorization_code': {
    //           // response(200,$_REQUEST);
    //           if (isset($_REQUEST['code'])) {
    //             $jwt = new Jwt();
    //             $jwt->decode($_REQUEST['code'], $this->secret['client_secret']);
    //             if (!$jwt->valid) {
    //               error(401, 'Invalid');
    //             }
    //
    //             $row = sql_fetch(sql_query([
    //               "SELECT * FROM auth.dbo.client_user_view WHERE code_id = ?",
    //             ], [
    //               $jwt->payload['id'],
    //             ]));
    //             if (empty($row['client_secret'])) {
    //               error(401, $jwt->payload);
    //             }
    //             $accept = json_decode($row['accept'],true);
    //
    //             //
    //             // response(200, [$jwt->payload,$accept,$row]);
    //             //
    //             //
    //             // $account = sql_fetch(sql_query("EXEC aim1.account.get @hostname = ?, @accountname = ?",[
    //             //   $_REQUEST['client_id'],
    //             //   $jwt->payload['accountname'],
    //             // ]));
    //             // $jwt->payload['client_id'] = $_REQUEST['client_id'];
    //             // $jwt->payload['aud'] = $account['client_id'];
    //             // $jwt->payload['sub'] = $account['account_id'];
    //             // $jwt->payload['iat'] = $time = time();
    //             // $jwt->payload['exp'] = $time + 3600;
    //             // // response(200, $jwt->payload);
    //             // if ($access = sqlsrv_fetch_object(sql_query("SELECT scope FROM accountScope WHERE accountname = ? and client_id = ?", [
    //             //   $jwt->payload['accountname'],
    //             //   $jwt->payload['client_id'],
    //             // ]))) {
    //             //   $jwt->payload['scope'] = implode(' ',array_intersect(explode(' ',$access->scope),explode(' ',$jwt->payload['scope'])));
    //             // }
    //             // $scopes = explode(' ',$jwt->payload['scope']);
    //             // // $account = (array)sqlsrv_fetch_object(sql_query("EXEC aim1.account.get @hostname = ?",[$_REQUEST['client_id']]));
    //             // // response(200, $scopes);
    //             //
    //
    //             $id_token = [
    //               'oid'=> $row['id'],
    //               // 'accountname'=> $row['accountname'],
    //               // 'name'=> $account['name'],
    //               // 'email'=> $account['email'],
    //               // 'account'=> $account,
    //               // 'scopes'=> $scopes,
    //             ];
    //             // $keys = [
    //             //   'name',
    //             //   'accountname',
    //             //   'email',
    //             //   'email_verified',
    //             //   'phone_number',
    //             //   'phone_number_verified',
    //             //   'preferred_username',
    //             //   'nickname',
    //             //   'given_name',
    //             //   'middle_name',
    //             //   'family_name',
    //             //   'upn',
    //             // ];
    //             // foreach ($keys as $key) {
    //             //   if (in_array($key,$scopes)) {
    //             //     $access_token[$key] = $account[$key];
    //             //     $id_token[$key] = $account[$key];
    //             //   }
    //             // }
    //             response(200, [
    //               // 'access_token'=> make_token(
    //               //   [
    //               //     "typ"=> "JWT",
    //               //     "nonce"=> "EqU3jznellWKK9TUg3coNPhV6C5uMtt9x5ZtA_Aa7IQ",
    //               //     "alg"=> "RS256",
    //               //     "x5t"=> "2ZQpJ3UpbjAYXYGaXEJl8lV0TOI",
    //               //     "kid"=> "2ZQpJ3UpbjAYXYGaXEJl8lV0TOI"
    //               //   ],
    //               //   [
    //               //     "aud"=> "24622611-2311-4791-947c-5c1d1b086d6c",
    //               //     "iss"=> "https://login.microsoftonline.com/09786696-f227-4199-91a0-45783f6c660b/v2.0",
    //               //     "iat"=> 1656067982,
    //               //     "nbf"=> 1656067982,
    //               //     "exp"=> 1656071882,
    //               //     "aio"=> "ATQAy/8TAAAAAdkai07emvvkDnFhrCrD2lgtoGByr2SFlyT4OEs0XLBfi1xO7oq8ZWjD7JKARWn+",
    //               //     "email"=> "max.van.kampen@alicon.nl",
    //               //     "name"=> "Max van Kampen",
    //               //     "oid"=> "f40f8462-da7f-457c-bd8c-d9e5639d2975",
    //               //     "preferred_username"=> "max.van.kampen@alicon.nl",
    //               //     "rh"=> "0.AV4AlmZ4CSfymUGRoEV4P2xmCxEmYiQRI5FHlHxcHRsIbWxeABI.",
    //               //     "sub"=> "4UJdAdEawXJy3hei3iNi35-UWSR268fvx7KBmui4zvs",
    //               //     "tid"=> "09786696-f227-4199-91a0-45783f6c660b",
    //               //     "uti"=> "qYeubJShE06f0kzxQrwIAA",
    //               //     "ver"=> "2.0"
    //               //
    //               //     'client_id'=> $_REQUEST['client_id'],
    //               //     'aud'=> $account['client_id'],
    //               //     'sub'=> $account['account_id'],
    //               //     'scope'=> $jwt->payload['scope'],
    //               //   ],
    //               //   $account['client_secret'],
    //               //   3600
    //               // ),
    //               // 'id_token'=> make_token(
    //               //   [
    //               //     "typ"=> "JWT",
    //               //     "alg"=> "RS256",
    //               //     "kid"=> "2ZQpJ3UpbjAYXYGaXEJl8lV0TOI"
    //               //   ],
    //               //   [
    //               //     "aud"=> "https://outlook.office.com",
    //               //     "iss"=> "https://sts.windows.net/09786696-f227-4199-91a0-45783f6c660b/",
    //               //     "iat"=> 1656067982,
    //               //     "nbf"=> 1656067982,
    //               //     "exp"=> 1656073671,
    //               //     "acct"=> 0,
    //               //     "acr"=> "1",
    //               //     "aio"=> "ATQAy/8TAAAA2P761kYc3y9N/0ugLhZ7mNzHCv242RUNe5hAlJNHg+sVkOd5q94SJALSueXvnCoY",
    //               //     "amr"=> [
    //               //       "pwd"
    //               //     ],
    //               //     "app_displayname"=> "Aliconnect",
    //               //     "appid"=> "24622611-2311-4791-947c-5c1d1b086d6c",
    //               //     "appidacr"=> "1",
    //               //     "enfpolids"=> [],
    //               //     "family_name"=> "van Kampen",
    //               //     "given_name"=> "Max",
    //               //     "ipaddr"=> "84.83.118.234",
    //               //     "name"=> "Max van Kampen",
    //               //     "oid"=> "f40f8462-da7f-457c-bd8c-d9e5639d2975",
    //               //     "puid"=> "1003000088216491",
    //               //     "rh"=> "0.AV4AlmZ4CSfymUGRoEV4P2xmCwIAAAAAAPEPzgAAAAAAAABeABI.",
    //               //     "scp"=> "Calendars.Read Calendars.ReadWrite Contacts.Read Contacts.ReadWrite Mail.Read Mail.ReadWrite MailboxSettings.Read People.Read User.Read",
    //               //     "sid"=> "25e116a0-da34-402f-8410-ffd24c86d61c",
    //               //     "signin_state"=> [
    //               //       "kmsi"
    //               //     ],
    //               //     "sub"=> "3mFXau5VikjByNwgDcAaWfRkKS9brJ-CsBVsaK7x3kQ",
    //               //     "tid"=> "09786696-f227-4199-91a0-45783f6c660b",
    //               //     "unique_name"=> "max.van.kampen@alicon.nl",
    //               //     "upn"=> "max.van.kampen@alicon.nl",
    //               //     "uti"=> "qYeubJShE06f0kzxQrwIAA",
    //               //     "ver"=> "1.0",
    //               //     "wids"=> [
    //               //       "62e90394-69f5-4237-9190-012177145e10",
    //               //       "b79fbf4d-3ef9-4689-8143-76b194e85509"
    //               //     ]
    //               //   ],
    //               //   $account['client_secret'],
    //               //   3600
    //               // ),
    //               'access_token'=> (new Jwt())->get([
    //                 'client_id'=> $row['client_id'],
    //                 'cid'=> $row['clientId'],
    //                 'oid'=> $row['id'],
    //                 'aud'=> $row['client_id'],
    //                 'sub'=> $row['id'],
    //                 'scope'=> $row['scope'],
    //               ], $row['client_secret'], $ACCESS_TOKEN_LIFETIME),
    //               'id_token'=> (new Jwt())->get($id_token, $row['client_secret'], 3600*24*365),
    //               'refresh_token'=> (new Jwt())->get([
    //                 'id'=> $row['code_id'],
    //               ], $this->secret['client_secret'], 3600*24*365),
    //             ]);
    //           }
    //           if (empty($_REQUEST['id_token'])) error(400);
    //           // if (empty($_REQUEST['client_id'])) error(400);
    //           // if (empty($_REQUEST['scope'])) error(400);
    //           $this->id_token = new Jwt();
    //           $this->id_token->decode($_REQUEST['id_token'], $this->secret['client_secret']);
    //           response(200,$aim);
    //         }
    //         case 'refresh_token': {
    //           $jwt = new Jwt();
    //           $jwt->decode($_REQUEST['refresh_token'], $this->secret['client_secret']);
    //           if (!$jwt->valid) {
    //             error(401, 'Invalid');
    //           }
    //           $row = sql_fetch(sql_query([
    //             "SELECT * FROM auth.dbo.client_user_view WHERE code_id = ?",
    //           ], [
    //             $jwt->payload['id'],
    //           ]));
    //           response(200, [
    //             'access_token'=> (new Jwt())->get([
    //               'client_id'=> $row['client_id'],
    //               'oid'=> $row['id'],
    //               'aud'=> $row['client_id'],
    //               'sub'=> $row['id'],
    //               'scope'=> $row['scope'],
    //             ], $row['client_secret'], $ACCESS_TOKEN_LIFETIME),
    //           ]);
    //         }
    //         case 'silent_code': {
    //           // response(200, $aim);
    //           if (empty($this->access_token)) throw new Exception("geen access_token", 400);
    //           if (empty($this->client_secret)) throw new Exception("geen client_secret", 400);
    //           $jwt = new Jwt();
    //           $jwt->decode($_REQUEST['access_token'], $this->client_secret);
    //           $access = sqlsrv_fetch_object(sql_query("SELECT scope FROM accountScope WHERE accountname = ? and client_id = ?", [
    //             $jwt->payload['accountname'],
    //             $jwt->payload['client_id'],
    //           ]));
    //           if ($access) {
    //             $jwt->payload['scope'] = implode(' ',array_intersect(explode(' ',$access->scope),explode(' ',$jwt->payload['scope'])));
    //           };
    //           response(200, [
    //             'access_token'=> (new Jwt())->get($jwt->payload, $this->client_secret, 3600),
    //           ]);
    //         }
    //       }
    //     },
    //   ],
    // ],
    '/purchaseorder({id})/lines'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          $clientId = strtolower($this->access['client_id']);
          $res = sql_query("SELECT * FROM [$clientId].dbo.PurchaseOrderLine WHERE salesOrderId = ?",[354153]);
          $data['@odata.context'] = "https://aliconnect.nl/v1/\$metadata#purchase/order({id})/rows";
          while ($row = sql_fetch($res)) $data['value'][] = $row;
          response(200,$data);
        }
      ],
    ],
    '/me/contacts/{id}'=> [
      'get'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'parameters'=> $this->find_parameters,
        'operation'=> $this->outlook_request,
        // 'operation'=> function(){return ok(1);},
        'security'=>[
          [ 'aliconnect'=>['admin','https://graph.microsoft.com/contacts.readwrite','https://graph.microsoft.com/contacts.read'] ],
        ],
      ],
      'patch'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $this->outlook_request,
        'security'=>[
          [ 'aliconnect'=>['admin','https://graph.microsoft.com/contacts.readwrite'] ],
        ],
      ],
    ],
    '/me/contacts'=> [
      'get'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'parameters'=> $this->find_parameters,
        'operation'=> $this->outlook_request,
        // 'operation'=> function(){return ok(1);},
        'security'=>[
          [ 'aliconnect'=>['admin','https://graph.microsoft.com/contacts.readwrite','https://graph.microsoft.com/contacts.read'] ],
        ],
      ],
      'post'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $this->outlook_request,
        'security'=>[
          [ 'aliconnect'=>['https://graph.microsoft.com/contacts.readwrite'] ],
        ],
      ],
    ],
    '/me/calendarView'=> [
      'get'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $this->outlook_request,
      ],
    ],
    '/me/tasks'=> [
      'get'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],

        'operation'=> $this->outlook_request,
      ],
    ],
    '/me/messages'=> [
      'get'=> [
        'tags'=> ['outlook'],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> $this->outlook_request,
      ],
    ],
    '/me/mail/send'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $data = json_decode(file_get_contents('php://input'),true);
          $this->mail($data);
          response(200, $data);
        }
      ],
    ],
    '/system({id})/config'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($clientId,$id) {
          $scopes = explode(' ',$this->access['scope']);
          switch($method) {
            case 'get': {
              error(400, 1);
              if (!empty(strcasecmp($clientId,$this->access['client_id']))) error(401, 'invalid client_id');
              if (empty(array_intersect($scopes,['admin']))) error(401, 'invalid scope');
              $rows = [
                [
                  'id'=>'0-0',
                  // 'parentId'=>'0-0',
                  '<<'=>'*tunnel',
                ],
                [
                  'id'=>'0-1',
                  'parentId'=>'0-0',
                  '<<'=>'*verkeersbuis',
                ],
                [
                  'id'=>'0-2',
                  'parentId'=>'0-1',
                  '<<'=>'*verkeerslicht',
                ],
                [
                  'id'=>'0-3',
                  'parentId'=>'0-1',
                  '<<'=>'*verkeerslicht',
                ],
                [
                  'id'=>'0-4',
                  'parentId'=>'0-1',
                  '<<'=>'*verkeerslicht',
                ],
                [
                  'id'=>'0-5',
                  'parentId'=>'0-1',
                  '<<'=>'*verkeerslicht',
                ],
              ];
              $items = $rows;
              // foreach ($rows as $row) {
              //   // $items[$row['id']] = $row;
              //   $items[$row['id']] = $row;
              //   $items[$row['parentId']]['children'][] = &$items[$row['id']];
              // }

              $yaml2 = yaml_emit([
                'items'=>$items,
              ]);
              $yaml2 = preg_replace("/'\*(.*?)'/","*$1",$yaml2);
              $yaml2 = preg_replace("/^---.*|\.\.\.$/","",$yaml2);

              $yaml1 = file_get_contents("/aliconnect/config/client/{$clientId}.yaml");
              $yaml1 = preg_replace("/^---.*|\.\.\.$/","",$yaml1);
              $yaml = implode(PHP_EOL,[
                $yaml1,
                $yaml2,
                // file_get_contents('test1.yaml'),
              ]);
              // response(200,$yaml);
              $data = yaml_parse($yaml);
              response(200,$data['items']);
              response(200,[strcasecmp($clientId,$this->access['client_id']),$clientId,$this->access['client_id'],$this->access,$systemId,$scopes,array_intersect($scopes,['admin'])]);
            }
          }
          error(400);
        },
      ],
    ],
    '/tools/yaml'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          response(200,1);
        },
      ],
    ],
    '/tools/html2pdf'=> [
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          $content = file_get_contents('php://input');
          $dompdf = new Dompdf(['enable_remote' => true]);
          //$html=str_replace(array("src='/","src='https://aliconnect.nl/"),"src='".$_SERVER['DOCUMENT_ROOT']."/",$html);
          //$html=str_replace(array("href='/","href='https://aliconnect.nl/"),"href='".$_SERVER['DOCUMENT_ROOT']."/",$html);
          //$html=str_replace("img src='https://aliconnect.nl/","img src='".$_SERVER['DOCUMENT_ROOT']."/",$html);
          // die('dsfgsdf');
          $dompdf->load_html($content);
          $dompdf->set_paper("a4");
          $dompdf->render();
          $dompdf->stream("doc.pdf", array("Attachment" => false));
          exit();
        },
      ],
    ],
    '/mailer'=> [
      // 'get'=> [
      //   'responses'=> [200=>['description'=>"successful operation"]],
      //   'operation'=> function(){
      //     $data = json_decode(file_get_contents('php://input'),true);
      //     aim()->mail($data);
      //     response(200, $data);
      //   }
      // ],
      'post'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          $data = json_decode(file_get_contents('php://input'),true);
          aim()->mail($data);
          response(200, $data);
        }
      ],
    ],
    '/document({id})'=> [
      'get'=> [
        'summary'=> "",
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          if (empty($this->referer_url)) error(401, 'geen referer');
        },
      ],
      'patch'=> [
        'summary'=> "",
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          $content = json_decode(file_get_contents('php://input'), true);
          $keys = array_keys($content);
          $keynames = implode(',',array_map(function ($key){return "[$key]=?";},$keys));
          $values = array_values($content);
          $select = "id,client_id,name,size,type,docId,lastUploadDateTime,lastModified,lastModifiedDateTime,createdDateTime";
          $row = sql_fetch(sql_query([
            "SET NOCOUNT ON;DECLARE @id UNIQUEIDENTIFIER = ?;",
            "UPDATE aliconnect.dbo.document SET $keynames WHERE id = @id",
            "SELECT $select FROM aliconnect.dbo.document WHERE id = @id",
          ],array_merge([$id], $values)));
        },
      ],
    ],
    '/document({id})/resource'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          // if (empty($this->referer_url)) error(401, 'geen referer');
          // if ($this->referer_url['host'] !== 'aliconnect.nl') error(401, 'verkeerde host');

          // response(200, json_encode($_SERVER,JSON_PRETTY_PRINT));
          // response(200, getallheaders());
          // if (empty($this->access['client_id'])) error(401);

          $row = sql_fetch(sql_query([
            "SELECT id,client_id,name,size,type,docId,lastUploadDateTime,lastModified,lastModifiedDateTime,createdDateTime FROM aliconnect.dbo.Document WHERE id = ?",
          ],[ $id ]));

          if (isset($_REQUEST['type']) && $_REQUEST['type'] === 'pdf') {
            $html = file_get_contents("/aliconnect/fs/{$row['client_id']}/{$row['id']}");
            // $dompdf = new Dompdf(['enable_remote' => true]);
            $dompdf = new Dompdf();
            // $dompdf->load_html_file("/aliconnect/fs/{$row['client_id']}/{$row['id']}");
            $dompdf->load_html($html);
  					$dompdf->set_paper("a4");
  					$dompdf->render();
            $dompdf->stream("", array("Attachment" => false));
            exit();
          }

          // exit("data:{$row['type']};base64,".base64_encode(file_get_contents("/aliconnect/fs/{$row['client_id']}/{$id}-{$row['name']}")));
          $filename = "{$row['client_id']}/{$id}-{$row['name']}";
          header("Content-Type: ".$row['type']);
          header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
          if (isset($_REQUEST['download'])) {
            header('Content-Disposition: attachment; filename="'.$row['name'].'"');
          } else {
            header('Content-disposition: filename="'.$row['name'].'"');
          }
          readfile("/aliconnect/fs/{$filename}");
          exit();
          // header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date dans le passé
          // readfile($filename);
          // exit($filename);
        },
      ],
      'put'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($id){
          // response(200,$id);
          // if (empty($this->access['client_id'])) nok(401, 'no client id');
          if ($row = sql_fetch(sql_query([
            "SET NOCOUNT ON;DECLARE @id UNIQUEIDENTIFIER = ?;",
            "UPDATE aliconnect.dbo.document SET lastUploadDateTime = GETDATE() WHERE id = @id",
            "SELECT id,client_id,name,size,type,docId,lastUploadDateTime,lastModified,lastModifiedDateTime,createdDateTime FROM aliconnect.dbo.document WHERE id = @id",
          ], [
            $id,
          ]))) {
            $content = file_get_contents('php://input');
            $filename = "/aliconnect/fs/{$row['client_id']}/{$row['id']}-{$row['name']}";
            if (!(file_exists($dirname = dirname($filename)))) mkdir($dirname,777,true);
            file_put_contents($filename, $content);
            // $content = str_replace(' ','+',$content);
            // file_put_contents($filename, base64_decode(explode(',',$content)[1]));
            //
            // file_put_contents($filename, $content);
          };
          response(200, $row);
        },
      ],
    ],
    '/aliconnector/init'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          $_REQUEST['nonce'] = $_REQUEST['nonce'] ?: 12313;
          $_REQUEST['buttons'] = [
            ['name'=> 'test1', 'title'=> 'Test 1'],
          ];


          $_REQUEST['ip'] = get_real_user_ip();
          unset($_REQUEST['dt']);

          // $auth = yaml_parse_file('/aliconnect/config/auth.yaml');
          // $config = [];
          // foreach($auth['abis'] as $row) {
          //   if (isset($row['match'])) {
          //     foreach($row['match'] as $match) {
          //       foreach($match as $key => $value) {
          //         if ($value !== request($key)) {
          //           break 2;
          //         }
          //       }
          //       $config = $row['config'];
          //     }
          //   }
          // }
          // unset($_REQUEST['application_secret']);
          // if (isset($_REQUEST['nonce']) && empty($_REQUEST['nonce'])) {
          //   $res = sql_query([
          //     "INSERT INTO auth.dbo.Device DEFAULT VALUES;",
          //     "SELECT lower(uid) AS uid FROM auth.dbo.Device WHERE Id = scope_identity()",
          //   ]);
          //   $row = sqlsrv_fetch_object($res);
          //   $_REQUEST['nonce'] = $row->uid;
          // }
          // $config['request']=$_REQUEST;


          response(200,1);
        },
      ],
    ],
    '/abis/artlev'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          // error(400);
          http_response(200,1);
        },
      ],
    ],

    '/analyse'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          $client_id = Aim::$access['azp'];
          $dbname = "[{$client_id}]";
          switch ($_REQUEST['response_type']) {
            case 'reportCompany': {
              $this->http_response_query([
                "WITH order1 AS (
                  SELECT customerId,sum(listprice)totaal--,sum(marge)marge,sum(totInkNetto)totInkNetto
                  FROM $dbname.api.purchaseorderLine
                  WHERE sendDateTime>=DATEADD(YEAR,-1,GETDATE())
                  GROUP BY customerId
                  -- SELECT customerId,sum(totexcl)totExcl FROM api.purchaseorder WHERE sendDateTime>=DATEADD(YEAR,-1,GETDATE()) GROUP BY customerId,customerCompanyName
                ), order2 AS (
                  SELECT customerId,sum(listprice)totaal
                  FROM $dbname.api.purchaseorderLine
                  WHERE sendDateTime>=DATEADD(YEAR,-2,GETDATE())
                  AND sendDateTime<DATEADD(YEAR,-1,GETDATE())
                  GROUP BY customerId
                  -- SELECT customerId,sum(totexcl)totExcl FROM api.purchaseorder WHERE sendDateTime>=DATEADD(YEAR,-2,GETDATE()) AND sendDateTime<DATEADD(YEAR,-1,GETDATE()) GROUP BY customerId,customerCompanyName
                ), orderLast AS (
                  SELECT customerId,min(DATEDIFF(day,sendDateTime,GETDATE()))dagen
                  FROM $dbname.api.purchaseorder
                  WHERE sendDateTime>=DATEADD(YEAR,-2,GETDATE())
                  GROUP BY customerId
                ), customer AS (
                  SELECT id,companyName
                  --,clientManager
                  FROM $dbname.api.company
                  WHERE id IN (SELECT customerId FROM $dbname.api.purchaseorder WHERE sendDateTime>=DATEADD(YEAR,-2,GETDATE()))
                  AND supplierId = '{$_REQUEST["id"]}'
                )
                SELECT
                customer.companyName
                ,customer.id
                --,customer.clientManager
                ,CAST(order1.totaal AS INT) AS lastYear
                --,CAST(order1.marge AS INT) AS marge
                --,CAST(order1.totInkNetto AS INT) AS totInkNetto
                ,CAST(order2.totaal AS INT) AS beforeLastYear
                ,CAST(CASE WHEN order2.totaal > 0 THEN (order1.totaal - order2.totaal)/order2.totaal*100 END AS INT) AS diff
                ,orderLast.dagen
                FROM customer
                LEFT OUTER JOIN order1 ON order1.customerId = customer.id
                LEFT OUTER JOIN order2 ON order2.customerId = customer.id
                LEFT OUTER JOIN orderLast ON orderLast.customerId = customer.id"
              ]);
            }



            case 'dashboardVerkoopOrders': {
              $this->http_response_query([
                "SELECT supplierCompanyName AS name
                ,DATEPART(YEAR,orderDateTime)*100+DATEPART(MONTH,orderDateTime) AS category
                ,COUNT(0) AS sum
                ,SUM(listprice) AS listprice
                FROM $dbname.api.purchaseOrder
                WHERE DATEDIFF(DAY,orderDateTime,GETDATE())<365
                AND supplierCompanyName IS NOT NULL
                GROUP BY DATEPART(YEAR,orderDateTime)*100+DATEPART(MONTH,orderDateTime),supplierCompanyName
                ORDER BY DATEPART(YEAR,orderDateTime)*100+DATEPART(MONTH,orderDateTime);",
                "WITH total AS (SELECT
                brand AS name, ROUND(SUM(ROUND(quant*listprice*(100-ISNULL(discount,0))/100,2)),2) AS value
                FROM $dbname.api.purchaseOrderLine
                WHERE DATEDIFF(DAY,orderDateTime,GETDATE())<365
                AND quant IS NOT NULL
                AND listprice IS NOT NULL
                GROUP BY brand)
                SELECT * FROM total ORDER BY value DESC;",
              ]);
            }
          }
          response(202);
        },
      ],
    ],

    '/rtf2text'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          $rtf = file_get_contents($_REQUEST['href']);
          $document = new Document($rtf);
          $formatter = new HtmlFormatter();
          exit($formatter->Format($document));
        },
      ],
    ],
    '/doc2text'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          require_once (__DIR__.'/../class/text-extraction.php');
          $tmpfname = tempnam("/aliconnect/tmp", "rd1");
          $handle = fopen($tmpfname, "w");
          fwrite($handle, file_get_contents($_REQUEST['href']));
          fclose($handle);
          echo Text_Extraction::doc_to_text($tmpfname);
          unlink($tmpfname);
          exit();
          // $content = read_doc($tmpfname);
          // http_response(200);
        },
      ],
    ],
    '/docx2text'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          require_once (__DIR__.'/../class/text-extraction.php');
          $tmpfname = tempnam("/aliconnect/tmp", "rdx");
          $handle = fopen($tmpfname, "w");
          fwrite($handle, file_get_contents($_REQUEST['href']));
          fclose($handle);
          echo Text_Extraction::docx_to_text($tmpfname);
          unlink($tmpfname);
          exit();
        },
      ],
    ],
    '/docx2html'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function(){
          $phpWord = \PhpOffice\PhpWord\IOFactory::load($tmpfname);
          $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'HTML');
          $objWriter->save($tmpfname);
          readfile($tmpfname);
          unlink($tmpfname);
          exit();
        },
      ],
    ],
    '/pdf_ocr'=> [
      'get'=> [
        'parameters'=> [['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true]],
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function() {
          // readfile('/aliconnect/tmp/rd11217.tmp.pdf');
          // echo 'JA';
          // exit();
          $tmpfname1 = tempnam("/aliconnect/tmp", "rd1");
          $tmpfname2 = tempnam("/aliconnect/tmp", "rd1");
          $handle = fopen($tmpfname1, "w");
          fwrite($handle, file_get_contents($_REQUEST['href']));
          fclose($handle);
          $FileHandle = fopen($tmpfname2, 'w+');
          $curl = curl_init();
          $instructions = '{
            "parts": [
              {
                "file": "scanned"
              }
            ],
            "actions": [
              {
                "type": "ocr",
                "language": "dutch"
              }
            ]
          }';
          curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.pspdfkit.com/build',
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_POSTFIELDS => array(
              'instructions' => $instructions,
              'scanned' => new CURLFILE($tmpfname1)
            ),
            CURLOPT_HTTPHEADER => array(
              'Authorization: Bearer pdf_live_XdEz1ZqwdeFH3aMVYHjNxBFuADvhXmOlJXWdN1g80Yz'
            ),
            CURLOPT_FILE => $FileHandle,
          ));
          $response = curl_exec($curl);
          curl_close($curl);
          fclose($FileHandle);
          // rename($tmpfname2, $tmpfname2.'.pdf');
          readfile($tmpfname2);
          unlink($tmpfname1);
          unlink($tmpfname2);
          exit();
        },
      ],
    ],
  ],
  'operation'=> [
    'init_get'=> function(){
      response(200, 'init_get');
    },
  ],
]);

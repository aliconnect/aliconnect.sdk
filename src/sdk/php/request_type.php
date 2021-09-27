<?php
class request_type {
  public function check_access_token () {
  	if (empty(aim()->access['nonce']) || empty(aim()->access['sub'])) {
  		die(http_response_code(204));
  	}
  	$row = sqlsrv_fetch_object(aim()->query(
  		"SELECT * FROM auth.nonce WHERE nonce=%s AND sub=%d",
  		aim()->access['nonce'],
  		aim()->access['sub']
  	));
  	if (empty($row->SignInDateTime)) {
  		// debug(aim()->access['nonce'], $row, aim()->access);
  		die(http_response_code(204));
  	}
  }

  public function build_doc() {
    // om.js
    ini_set('display_errors', 1);
    error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
    // error_reporting(E_ALL & ~E_NOTICE);

    global $recent;

    function readDirs($path){
      global $recent;
      $dirHandle = opendir($_SERVER['DOCUMENT_ROOT'].$path);
      $items=[];
      $dirs=[];
      while($item = readdir($dirHandle)) {
        $newPath = $path."/".$item;
        if ($item === '.' || $item === '..' || strstr($item, 'secret')) continue;
        if ($item[0] === '_') continue;
        $ext = pathinfo($item, PATHINFO_EXTENSION);
        $title = str_replace('.'.$ext,'',pathinfo($item, PATHINFO_BASENAME));
        $first = explode(' ', $title)[0];
        // if (is_numeric($first)) $title = trim(ltrim($title, $first));

        // $title = ucfirst(str_replace(['_','-'],' ',$title));
        $src = $path.'/'.$item;
        if (is_dir($_SERVER['DOCUMENT_ROOT'].$newPath)) {
          if ($dir = readDirs($newPath)) {
            $items[$title] = $dir;
          }
        }
        else if ($ext === 'md') {
          $content = file_get_contents($_SERVER['DOCUMENT_ROOT'].$src);
          $filemtime = date("Y-m-d H:i:s", filemtime($_SERVER['DOCUMENT_ROOT'].$src));
          $wordcount = str_word_count($content);
          if ($item === 'README.md') {
            $items['src']= $src;
            $items['wordcount']= $wordcount;
            $items['lastModifiedDateTime']= $filemtime;
            $recent[$filemtime] = [
              'title'=> $title,
              'src'=> $src,
              'wordcount'=> $wordcount,
              'lastModifiedDateTime'=> $filemtime,
            ];
          }
          else {
            $items[$title] = [
              'src'=> $src,
              'wordcount'=> $wordcount,
              'lastModifiedDateTime'=> $filemtime,
            ];
            $recent[$filemtime] = [
              'title'=> $title,
              'src'=> $src,
              'wordcount'=> $wordcount,
              'lastModifiedDateTime'=> $filemtime,
            ];
          }
        }
        else if ($ext === 'htm') {
          // $content = file_get_contents($_SERVER['DOCUMENT_ROOT'].$src);
          if ($item === 'index.htm') {
            $items['src']= $src;
          }
          else {
            $items[$title] = [
              'src'=>$src,
            ];
          }
        }
        // else if ($ext === 'json') {
        //   $items[$title] = array_merge_recursive(isset($items[$title]) ? $items[$title] : [],json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'].$src), true));
        //   // if ($title === 'web') debug($title, $items[$title]);
        // }
        else if ($ext === 'yaml') {
          if ($item === 'index.yaml') {
            $items = array_merge_recursive($items ?: [],yaml_parse_file($_SERVER['DOCUMENT_ROOT'].$src));
          }
          else {
            $items[$title] = array_merge_recursive($items[$title] ?: [],yaml_parse_file($_SERVER['DOCUMENT_ROOT'].$src));
          }
          // debug($ext);
        }
      }
      return $items;//array_merge($items,$dirs);
    }
    // $path =  '/docs/index';
    // echo "$path<br>";
    // debug(1);
    // $body = $items = array_replace_recursive(readDirs('/docs/index'), readDirs('/sites/'.AIM_DOMAIN.'/docs/index'));
    $body = $items = array_merge(readDirs('/aliconnect/docs/index'),readDirs('/'.AIM_DOMAIN.'/docs/index'));
    krsort($recent);
    $recent = array_slice($recent,0,20);
    $recent = array_values($recent);
    // debug($recent);
    $body['Recent'] = $recent;
    $config['docs']['index'] = $body;
    return $config;
    // header('Content-Type: application/json');
    // die(json_encode($config));

    // $path = $_SERVER['DOCUMENT_ROOT'].'/sites/aliconnect';
    // $config = yaml_parse_file($fname = $path.'/config.yaml');
    // $config['docs']['index'] = $body;
    // yaml_emit_file($fname, $config);
    // die(json_encode($items));
  }
  public function build_clone_data() {
    // aim.js
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->query("EXEC item.build_clonedata $id");
    // die("EXEC item.clone_data $id");
    $value=[];
    while ($row = sqlsrv_fetch_object($res)) {
      $value[] = $row;
    }
    header('Content-type: application/json');
    die(json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
  }
  public function build_tree() {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    $res = aim()->query($q = "EXEC item.build_tree %d", $_GET['id']);

    $value = [];
    $items = (object)[];
    while ($row = sqlsrv_fetch_object($res)) {
      $value[] = $items->{$row->id} = $row;
    }
    sqlsrv_next_result($res);
    while (	$row = sqlsrv_fetch_object($res)) {
      if (isset($items->{$row->attributeItemID})) {
        $items->{$row->attributeItemID}->values->{$row->name} = $row;
      }
    }
    header('Content-type: application/json');
    die(json_encode($value));
  }
  public function build_data() {
    // die('a');
    // zie web.js datainit
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    $content = file_get_contents('php://input');

    // if (isset($_GET['sub'])) {
    //   $ID = $_GET['sub'];
    // }
    // else
    if (isset($_GET['id'])) {
      $ID = $_GET['id'];
    }
    else if (isset(aim()->access['sub'])) {
      $ID = aim()->access['sub'];
    }
    else if ($content) {
      $content = json_decode($content, true);
      if (isset($content['mac'])) {
        foreach ($content['mac'] as $mac_address => $mac_ip) {
          $mac_address = str_replace(":","-",$mac_address);
          $row = sqlsrv_fetch_object(aim()->query(
            // DEBUG:
            // "SELECT * FROM auth.mac WHERE address = %s AND ip IS NULL",
            "SELECT * FROM auth.mac WHERE address = %s",
            $mac_address
          ));
          if (isset($row->ID)) {
            aim()->query(
              "UPDATE auth.mac SET ip = %s WHERE ID = %d",
              $mac_ip,
              $row->ID
            );
            $ID = $row->sub;
          }
        }
      }
    }

    // debug(aim()->access);

    // debug(1);
    // debug(1, $ID);
    // debug('api1',__DIR__,$ID);
    // debug(1, aim()->access, $_POST, $ID);
    // debug($ID, aim()->access, getallheaders());
    if (!isset($ID)) {
      // die(http_response_code(401));
      throw new Exception('Unauthorized', 401);
    }
    // die("THIS IS DATA");

    $data = [
      'info'=>isset(aim()->api->info) ? aim()->api->info : '',
      'paths'=> [],
      'components'=> [
        'schemas'=> [],
      ],
      'value'=> [],
      // 'attributes'=> []
    ];
    // debug(111,$data,aim()->secret['config']);
    // debug("EXEC item.getData $ID");
    // debug("EXEC item.build_data $ID");
    // echo "EXEC item.build_data $ID";
    $res = aim()->query($q = "EXEC item.build_data $ID");
    // die($q);
    $items = (object)[];
    while ($row = sqlsrv_fetch_object($res)) {
      $row->{'@id'} = "/$row->schema($row->ID)";
      $items->{$row->ID} = $row;
      if (isset(aim()->api->components->schemas->{$row->schema})) {
        $data['components']['schemas'][$row->schema] = aim()->api->components->schemas->{$row->schema};
      }
      // if ($row->MasterID && isset($items->{$row->MasterID})) {
      // 	if (empty($items->{$row->MasterID}->Children)) {
      // 		$items->{$row->MasterID}->Children = [];
      // 	}
      // 	$items->{$row->MasterID}->Children[] = $items->{$row->ID};
      // } else {
      // 	$data['value'][] = $items->{$row->ID};
      // }
      $data['value'][] = $items->{$row->ID};
    }
    // foreach ($data['components']['schemas'] as $schemaName => $schema) {
    //   if (isset($schema->operations)) {
    //     foreach ($schema->operations as $operationName => $operation) {
    //       $data['paths']["/$schemaName(id)/$operationName()"]["post"] = [
    //         "operationId"=> "$schemaName(id).$operationName()",
    //       ];
    //     }
    //   }
    // }
    // $data['paths'] = 'sdfasdfas';

    // debug($data);
    sqlsrv_next_result($res);
    while (	$row = sqlsrv_fetch_object($res)) {
      if (isset($items->{$row->ItemID})) {
        $items->{$row->ItemID}->{$row->AttributeName} = $row;//array_push($data['attributes'],$row);
      }
    }

    // foreach ($items as $item) {
    // 	if (!isset($item->schema)) debug($item);
    // 	if (isset(aim()->api->components->schemas->{$item->schema})) {
    // 		$data['components']['schemas'][$item->schema] = aim()->api->components->schemas->{$item->schema};
    // 	}
    // }
    // $data['value'] = array_values((array)$items);


    $date = date("Ymd-his");
    // header("Content-disposition: attachment; filename=aliconnect-export-$date-$ID-data.json");
    header('Content-type: application/json');
    // die(json_encode($data));
    die(json_encode($data));
  }
  public function build_node_data() {
    debug(1);
    // debug(1, aim()->access);
    // gebruikt door node.js, opbouwen data voor node
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    // $sub = aim()->access['sub'];
    // $sub = $_GET['sub'];
    if (isset(aim()->access['sub'])) {
      $sub = aim()->access['sub'];
      $res = aim()->query("EXEC [item].[build_node_data] $sub");
      while ($row = sqlsrv_fetch_object($res)) {
        $items->{$row->ID} = $row = (object)itemrow($row);
      }
      sqlsrv_next_result($res);
      while ($row = sqlsrv_fetch_object($res)) {
        $items->{$row->ItemID}->{$row->AttributeName} = $row;
      }
      header('Content-type: application/json');
      die(json_encode([
        'sub'=>$sub,
        'value'=>array_values((array)$items),
      ]));
      die(json_encode([
        'sub'=>$sub,
        'value'=>array_values((array)$items),
      ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
  }
  public function _build_map() {
    // gebruikt door web.js, build_map opbouwen netwerk overzicht
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->query("EXEC [item].[build_map] $id");
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->ID} = $row = (object)itemrow($row);
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->id}->{$row->AttributeName} = $row->Value;
    }
    header('Content-type: application/json');
    die(json_encode(['value'=>array_values((array)$items)]));
  }
  public function build_link_data() {
    // web.js, showLinks
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->query("EXEC [item].[build_link_data] $id");
    $items = [];
    $links = [];
    while ($row = sqlsrv_fetch_object($res)) {
      $items[$row->id] = (array)$row;
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      $links[] = $row;
      // if ($row->text === 'parent') $items[$row->fromId]['parent'] = $row->toId;
    }
    header('Content-type: application/json');
    die(json_encode(['items'=>array_values($items),'links'=>$links], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
  }
  public function build_breakdown() {
    // web.js, item breakdown
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->query("EXEC [item].[build_breakdown] $id");
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->ID} = $row = (object)array_filter(itemrow($row),function ($v){return !is_null($v);});
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->ItemID}->{$row->AttributeName}[] = $row;
    }
    header('Content-type: application/json');
    // die(json_encode(['value'=>array_values((array)$items)], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    die(json_encode(['value'=>array_values((array)$items)]));
  }
  public function build_2to1() {
    // web.js, export json voor aim versie 1
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $json = (object)[
      'hostID' => null,
      'rootID' => $id,
      'class' => null,
      'attributeName' => null,
      'items' => null,
    ];
    $res = aim()->query("EXEC [item].[build_2to1] $id");
    while ($row = sqlsrv_fetch_object($res)) {
      if ($row->classID == 0) {
        $json->class->{$row->PrimaryKey} = $row->name;
      } else {
        $json->items->{$row->PrimaryKey} = $row;
      }
    }
    $name = $json->items->{$id}->name ?: $json->items->{$id}->title;
    $date = date("Ymd-hi");
    $filename = "aliconnect-$id-$name-export1-$date";
    // debug($filename);
    sqlsrv_next_result($res);
    while($row=sqlsrv_fetch_object($res)){
      $json->attributeName->{$row->fieldID} = $row->name;
      if ($json->items->{$row->id}) {
        $json->items->{$row->id}->values->{$row->name}=$row;
      }
    }
    header('Content-type: application/json');
    if(isset($_GET['download'])) {
      header("Content-disposition: attachment; filename=$filename.json");
    }
    die (json_encode($json, JSON_PRETTY_PRINT));
  }



  public function visit() {
    // om.js
    $sub = aim()->access['sub'];
    if (get('id')) {
      aim()->setAttribute([
        'itemId'=>aim()->access['sub'],
        'name'=>'history',
        'max'=>'999999',
        'linkId'=>get('id'),
      ]);
    } else {
      $res = aim()->query("SELECT linkId,lastModifiedDateTime FROM attribute.dt where itemid=$sub AND nameId = 2184");
      while ($row = sqlsrv_fetch_object($res)) {
        $value[$row->linkId] = $row->lastModifiedDateTime;
      }
      header('Content-type: application/json');
      die(json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
    die();
    // debug(aim()->access);
    // @itemId=265090, @name='history', @linkId=3674027, @max=9999
    // debug($_GET);
  }
  public function yamlToJson() {
    // aim.js
  	$content = file_get_contents('php://input');
  	header('Content-Type: application/json');
  	die(json_encode(yaml_parse($content)));
  }
  public function mail() {
    // debug(4);
    // aim.js
		$content = file_get_contents('php://input');
		if (!empty($content)) {
			$mail = aim()->mail(json_decode($content, true));
			die($content);
		}
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
  public function pdf() {
    // aim.js
		ini_set('display_errors', 0);
		ini_set('log_errors', 1);
		$content = file_get_contents('php://input');
    // debug($_POST, $content);
    // return $content;
		require_once ($_SERVER['DOCUMENT_ROOT'].'/lib/dompdf/dompdf_config.inc.php');
		$dompdf = new DOMPDF();
		$dompdf->load_html($content);
		$dompdf->set_paper("a4");
		$dompdf->render();
    // debug(1);
    $filename = '/temp/'.date('YmdH').uniqid().'.pdf';
		// $attachement['filename'] = '/temp/'.uniqid().'.pdf';
		file_put_contents($_SERVER['DOCUMENT_ROOT'].$filename, $dompdf->output());
    return [
      'src'=> 'https://aliconnect.nl'.$filename,
    ];
	}
  public function uploadfile() {
    // debug(1);
  	$src = $_SERVER['DOCUMENT_ROOT'].explode('alicon.nl',$_POST['src'])[1];
  	unlink($src);
  	file_put_contents($src,base64_decode($_POST['data']));
  	die();
  }
  public function mselogin() {
    $mse = new mse();
    $mse->login();
  }
  public function msecontact() {
    $mse = new mse();
    $mse->login();
  }
  public function account_beheer() {
    $sub = aim()->access['sub'];
    $aud = aim()->access['aud'];
    $rows = [];
    $res = aim()->query(
      "SELECT host.title host_title, host.keyname host_keyname, account.displayName account_displayName, account.title account_title
      FROM item.vw account
      INNER JOIN item.vw host on host.id = account.hostId
      WHERE account.classid = 1004 and account.srcid = $sub"
    );
    while ($row = sqlsrv_fetch_object($res)) $rows['domain_accounts'][] = $row;
    // return aim()->access;
    return $rows;
  }
  public function account_verbruik() {
    $sub = aim()->access['sub'];
    $aud = aim()->access['aud'];
    // return aim()->access;
    $rows = [];
    if ($aud>1) {
      // $rows['free_dir_size'] = 1;
      // $rows['max_dir_size'] = 0;
      // $rows['free_item_count'] = 50;
      // $rows['max_item_count'] = 0;
      // $rows['free_request_count'] = 200;
      // $rows['max_request_count'] = 0;
      $rows['periode']=[];
      $res = aim()->query("
        DECLARE @periode INT
        SET @periode = DATEPART(YEAR, GETDATE())*100+DATEPART(MONTH, GETDATE())
        ;WITH per (periode) as (
        select DATEPART(YEAR, GETDATE())*100+DATEPART(MONTH, GETDATE())
        union all select DATEPART(YEAR, DATEADD(MONTH,-1,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-1,GETDATE()))
        union all select DATEPART(YEAR, DATEADD(MONTH,-2,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-2,GETDATE()))
        union all select DATEPART(YEAR, DATEADD(MONTH,-3,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-3,GETDATE()))
        union all select DATEPART(YEAR, DATEADD(MONTH,-4,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-4,GETDATE()))
        union all select DATEPART(YEAR, DATEADD(MONTH,-5,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-5,GETDATE()))
        union all select DATEPART(YEAR, DATEADD(MONTH,-6,GETDATE()))*100+DATEPART(MONTH, DATEADD(MONTH,-6,GETDATE()))
        )
        ,req (periode,request_count) as (
        	select per.periode,count(0)
        	from aimhis.his.req r
        	inner join per ON r.periode = per.periode
        	where r.client_id = $aud
        	group by per.periode
        )
        ,ic (periode,item_count) as (
        	select per.periode, count(0)
        	from item.dt i
        	inner join per ON DATEPART(YEAR, createdDateTime)*100+DATEPART(MONTH, createdDateTime) <= per.periode
        	where i.hostid = $aud
        	group by per.periode
        )
        ,ac (periode,attribute_count) as (
        	select per.periode, count(0)
        	from attribute.dt a
        	inner join item.dt i ON i.id = a.itemId
        	inner join per ON DATEPART(YEAR, a.createdDateTime)*100+DATEPART(MONTH, a.createdDateTime) <= per.periode
        	where i.hostid = $aud
        	group by per.periode
        )
        select
        per.periode, request_count, item_count, attribute_count
        from per
        left outer join req ON req.periode = per.periode
        left outer join ic ON ic.periode = per.periode
        left outer join ac ON ac.periode = per.periode
        order by periode desc
      ");
      $dir_size = get_dir_size($_SERVER['DOCUMENT_ROOT']."/shared/$aud/");
      while ($row = sqlsrv_fetch_object($res)) {
        $row->dir_size = $dir_size;
        $rows['periode'][] = $row;
      }

      $res = aim()->query("SELECT attributeName,value FROM attribute.vw where itemID=$aud AND attributeName IN ('max_count')");
      while ($row = sqlsrv_fetch_object($res)) $rows[$row->attributeName] = $row->value ?: $rows[$row->attributeName];
      // $rows['item_count'] = sqlsrv_fetch_object(aim()->query("SELECT count(0)value FROM item.dv WHERE hostId=$aud"))->value;
      // $rows['periode'] = $periode = date('Ym');
      //
      // $rows['dir_size'] = round(get_dir_size($_SERVER['DOCUMENT_ROOT']."/shared/$aud/")/1024/1024,0);
      //
      // $startperiode = $periode-100;
      // $rows['request_count']=[];
      // $res = aim()->query("SELECT periode,count(0)value FROM aimhis.his.req WHERE periode >= $startperiode AND client_id = $aud GROUP BY periode ORDER BY periode DESC");
      // while ($row = sqlsrv_fetch_object($res)) $rows['request_count'][] = $row;
    }
    return $rows;
  }
  public function account_secret() {
    $sub = aim()->access['sub'];
    return sqlsrv_fetch_object(aim()->query(
      "SELECT lower([secret])secret FROM item.dt WHERE id=%d",
      $sub
    ));
  }
  public function client_secret() {
    $sub = aim()->access['sub'];
    // debug(1, $sub, $_GET['client_id']);
    return sqlsrv_fetch_object(aim()->query(
      "SELECT lower([secret])secret FROM item.dt WHERE uid=%s AND userId=%d",
      uid($_GET['client_id']),
      $sub
    )) ?: [];
  }

  public function client_attr() {
    $account = sqlsrv_fetch_object(aim()->query(
      "EXEC [account].[get] @hostname=%s",
      $_GET['client_id']
    ));
    if ($account->client_secret !== $_GET['client_secret']) throw new Exception('Unauthorized', 401);
    $par = implode(',',array_map(function($key,$value){return "@$key = '$value'";}, array_keys($_POST), array_values($_POST)));
    aim()->query(
      "exec item.attr @itemid=%d, $par",
      $account->clientId
    );
    die();
  }

  public function words() {
    $words = json_decode(file_get_contents('php://input'));
    if (preg_match('/\w+\((\d+)\)/', $_SERVER['REQUEST_URI'], $match)) {
      $id = $match[1];
      debug(111, $id);
    }
    return;
  }
  public function share() {
    debug(222);
    return;
  }

  public function personal_dashboard_data() {
    $sub = aim()->access['sub'];
    $client_id = aim()->access['client_id'];
    $aud = aim()->access['aud'];
    function get_dashboard_data ($row) {
      $res = aim()->query("
      SET NOCOUNT ON
      SELECT id,header0,keyname FROM item.dv WHERE id=$row->host
      ");
      $row->host = sqlsrv_fetch_object($res);
      // sqlsrv_next_result($res);
      // $row->host1 = sqlsrv_fetch_object($res);
      return $row;
    }
    $data = [];
    $res = aim()->query("
    SET NOCOUNT ON
    SELECT c.id,c.header0,c.hostId host
    FROM item.dt c
		LEFT OUTER JOIN (SELECT hostId,max(LastModifiedDateTime)LastModifiedDateTime FROM attribute.dt a WHERE itemId = $sub GROUP BY hostId) A ON A.hostId = C.hostId
    WHERE srcId=$sub AND C.hostId IN (SELECT id FROM item.dv)
		ORDER BY A.LastModifiedDateTime DESC
    ");
    while($row = sqlsrv_fetch_object($res)) {
      $data[] = get_dashboard_data($row);
    }
    return $data;
  }
  public function personal_dashboard_data_domain() {
    $sub = aim()->access['sub'];
    $client_id = aim()->access['client_id'];
    $aud = aim()->access['aud'];

    function get_dashboard_data ($row) {
      $res = aim()->query($q = "
      SET NOCOUNT ON
      SELECT TOP 5 i.id,i.header0
      FROM attribute.dt a
      INNER JOIN item.dt i ON a.linkid = i.id
      WHERE a.itemid = $row->itemId AND a.nameid = 2184 AND a.hostid = $row->hostId AND item.schemaPath(i.id) = '$row->schemaPath'
      ORDER BY a.LastModifiedDateTime DESC
      ");
      // die($q);
      $row->items = [];
      while($item = sqlsrv_fetch_object($res)) {
        $row->items[] = $item;
      }
      return $row;
    }
    $res = aim()->query($q = "
    SET NOCOUNT ON
    select distinct item.schemaPath(i.id) schemaPath,$sub as itemId,$aud as hostId
    from attribute.dt a inner join item.dt i on a.linkid = i.id
    where a.itemid = $sub and a.nameid = 2184 and a.hostid = $aud
    ");
    // return [$q];
    $data = [];
    while($row = sqlsrv_fetch_object($res)) {
      $data[] = get_dashboard_data($row);
    }
    return $data;
  }
  public function api_key() {
		// debug($_POST, aim()->access);
		// $keys = array_merge($_GET,$_POST);
		// extract($keys);
		// extract($_GET);
		// extract($_POST);
    // {"api_key":"eyJ0eXAiOiJKV1QiLCJhbGciOiJzaGEyNTYifQ.eyJpc3MiOiJyd3MuYWxpY29ubmVjdC5ubCIsImNsaWVudF9pZCI6MzY2NjEzNCwiYXVkIjoiMjgwNDM0MiIsInN1YiI6IjI4MDQzNDIiLCJzY29wZSI6Im5hbWUsZW1haWwsbW9iaWxlIHdlYnNpdGUucmVhZCBuYW1lIGVtYWlsIiwiaWF0IjoxNjIxMzMzODExLCJleHAiOjE2MjEzMzQ1MzEsIm5vbmNlIjoiRjBBNjYzMzYtOTc3RS00NDNELUFEOTAtRTQwMTA0OTNDMzc0In0.mTwK8qwjrn6jCLD0Dr4RjTNR6iaDVDEB8g0DpHz0ZQk"}
		// $client_secret = $_POST['client_secret'];
		// unset($keys['client_secret'], $keys['expires_after'], $keys['request_type']);
		$options = array_replace(aim()->access, $_POST, [
			// 'iss' => AIM_DOMAIN.".aliconnect.nl", // Audience, id of host, owner of scope
			// 'aud' => (int)$account->ClientID, // Audience, id of host, owner of scope
			// 'azp' => (int)$account->ClientID, // From config.json
			// 'client_id' => (int)$account->ClientID, // Client Identifier // application
			// 'scope' => implode(' ',[$scope, $account->GrantScope]),//trim($scope . (isset($scope) ? ' '.$scope->scope : '' )), // Scope Values
			'exp' => time() + 24 * $_GET['expires_after'], // Expiration Time
			'iat' => time(), // Issued At
		]);
		// die($client_secret);0
		// debug(aim()->access, getallheaders());
		// return die(jwt_encode(aim()->access, aim()->client_secret ));
		return [
			'api_key'=> jwt_encode($options, aim()->client_secret),
			// 'options'=> $options,
		];
			// debug($_POST);
		// $content = file_get_contents('php://input');
		// $name = $_SERVER['DOCUMENT_ROOT'].'/shared/upload/'.date('YmdhIs').'.xml';
		// file_put_contents($name, $content);
		// die($name);
	}


  // request_tyoe sms ????
  // request_tyoe translate ????

	public function _config_json() {
		$content = [];
		foreach (['item.dt','attribute.dt'] as $tablename) {
			$row = sqlsrv_fetch_object(aim()->query("SELECT api.getDefinitionTable(OBJECT_ID('$tablename')) AS def;"));
			$content['sql'][] = $row->def;
		}
		$res = aim()->query(
			"SELECT type,type_desc,SCHEMA_NAME(schema_id) schemaname,name,object_definition(object_id) as [code]
			FROM sys.objects
			WHERE type IN ('V','P','FN','IF','TR')"
		);
		while ($row = sqlsrv_fetch_object($res)) {
			$typename = array_end(explode('_', $row->type_desc));
			$content['sql'][] = $row->code;
		}
		return $content;
	}
	public function _zip() {
		$uid = sqlsrv_fetch_object(aim()->query("SELECT newid() AS uid;"))->uid;
		$temproot = $_SERVER['DOCUMENT_ROOT'].'/../tmp';
		// $documentroot = $_SERVER['DOCUMENT_ROOT'];
		// $servername = $_SERVER['SERVER_NAME'];
		// $hostname = explode('.',$servername)[0];
		// $folder = "sites/$hostname";
		// die("$documentroot/$folder/temp");
		// if (!file_exists("$documentroot/../tmp")) {
		// 	mkdir("$documentroot/$folder/temp",0777,true);
		// }

		$code = array_merge(aim()->access, [
			"exp" => time() + 3600,
			"iat" => time(),
		]);
		// $secret = [
		// 	'api_key' => jwt_encode($code, aim()->secret["aim"]["client_secret"]),
		// 	// 'code' => $code,
		// ];

		$zip_filename="$temproot/$uid.zip";
		$zip = new ZipArchive;
		if ($zip->open($zip_filename, ZipArchive::CREATE) === TRUE) {
			// $zip->addFile($filename);
			$lines = [];
			foreach (['item.dt','attribute.dt'] as $tablename) {
				$row = sqlsrv_fetch_object(aim()->query("SELECT api.getDefinitionTable(OBJECT_ID('$tablename')) AS def;"));
				$lines[] = $row->def;
			}
			$res = aim()->query(
				"SELECT type,type_desc,SCHEMA_NAME(schema_id) schemaname,name,object_definition(object_id) as [code]
				FROM sys.objects
				WHERE type IN ('V','P','FN','IF','TR')"
			);
			while ($row = sqlsrv_fetch_object($res)) {
				$typename = array_end(explode('_', $row->type_desc));
				$lines[] = "DROP $typename $row->schemaname.$row->name";
				$lines[] = "GO";
				$lines[] = $row->code;
				$lines[] = "GO";
			}




			// $lines[] = 'DISABLE TRIGGER ALL ON DATABASE';
			// $lines[] = 'SET IDENTITY_INSERT item.dt ON';
			// while (	$row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC )) {
			// 	$lines[] = "INSERT item.dt VALUES ('".implode("','",array_values($row))."')";
			// }
			// $lines[] = 'SET IDENTITY_INSERT item.dt OFF';
			// $lines[] = 'SET IDENTITY_INSERT attribute.dt ON';
			// sqlsrv_next_result($res);
			// while (	$row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC )) {
			// 	$lines[] = "INSERT attribute.dt VALUES ('".implode("','",array_values($row))."')";
			// }
			// $lines[] = 'SET IDENTITY_INSERT attribute.dt OFF';
			// $lines[] = 'ENABLE TRIGGER ALL ON DATABASE';

			// $zip->addFile('test.pdf', 'demo_folder1/test.pdf');

			$zip->addFromString('aim.sql', implode("\r\n",$lines));
			// $zip->addFromString('data.json', json_encode($items));
			// $zip->addFromString('secret.json', json_encode($secret));
			// $zip->addFromString('api.json', file_get_contents("$documentroot/$folder/api.json") );
			// $zip->addGlob('./sites/tms/test/js/*.{js}', GLOB_BRACE, [
			// 	'add_path' => 'sources/',
			// 	'remove_all_path' => TRUE,
			// ]);
			// $zip->addGlob("./lapi/*.*");

			// die();
			$zip->close();
		}

		$zip = new ZipArchive;
		if ($zip->open($zip_filename) === TRUE) {
		    echo $zip->getFromName('aim.sql');
		    $zip->close();
		} else {
		    echo 'failed';
		}

		die();

		header('Content-type: application/zip');
		header("Content-disposition: attachment; filename=aliconnect_export_".date("Ymd_hi").".zip");
		readfile($zip_filename);
		unlink($zip_filename);
		die();
	}
	public function _secret_json() {
		$_GET['expires_after'] = 30;
		if (isset($_GET['release'])) {
			$_GET['expires_after'] = 30 * 12 * 10;
			unset($_GET['release']);
		}
		$keys = array_merge($_GET,$_POST);
		extract($keys);
		unset($keys['client_secret'], $keys['expires_after'], $keys['request_type']);
		$options = array_replace(aim()->access, array_filter($keys), [
			'iss' => AIM_DOMAIN.".aliconnect.nl",
			// 'aud' => aim()->access['aud'], // Audience, id of host, owner of scope
			// 'azp' => (int)$account->ClientID, // From config.json
			// 'client_id' => (int)$account->ClientID, // Client Identifier // application
			// 'scope' => implode(' ',[$scope, $account->GrantScope]),//trim($scope . (isset($scope) ? ' '.$scope->scope : '' )), // Scope Values
			'exp' => time() + 24 * $expires_after, // Expiration Time
			'iat' => time(), // Issued At
		]);
		$data = [
			"config"=> [
		    "aim"=> [
		      "headers"=> [
		        "Authorization"=> "Bearer ".jwt_encode($options, aim()->client_secret)
		      ]
		    ]
		  ]
		];
		header('Content-type: application/json');
		$ID=$_GET['sub'];
		$date = date("Ymd-his");
		header("Content-disposition: attachment; filename=aliconnect-export-$date-$ID-secret.json");
		die(json_encode($data));
	}
	public function _domain_list() {
		// debug(1);
		extract($_GET);
		$sub = aim()->access['sub'];
		$res = aim()->query("SELECT * FROM item.dt WHERE HostID=1 AND classID=1002 AND keyname IS NOT NULL AND OwnerID=$sub;");
		$rows = [];
		while ($row = sqlsrv_fetch_object($res)) {
			$rows[] = $row;
		}
		return $rows;
	}
	public function _qr() {
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			if (!empty($_GET['code'])) {
				$row = sqlsrv_fetch_object(aim()->query(
					"SELECT * FROM aimhis.dbo.qr WHERE code='%s'",
					$_GET['code']
				));
			}
			header('Content-Type: application/json');
			die($row->data);
		}
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			if (isset($_POST['method']) && $_POST['method']==='create') {
				// debug(10);
				$row = sqlsrv_fetch_object(aim()->query(
					"DECLARE @code UNIQUEIDENTIFIER
					SET @code = newid()
					INSERT aimhis.dbo.qr (code,email,data) VALUES (@code,'%s','%s')
					SELECT @code AS code",
					$_POST['email'],
					json_encode($_POST)
				));
				die($row->code);
			} else if (!empty($_POST['code'])) {
				$row = sqlsrv_fetch_object(aim()->query(
					"SELECT * FROM aimhis.dbo.qr WHERE code='%s'",
					$_POST['code']
				));
				$row = sqlsrv_fetch_object(aim()->query(
					"INSERT INTO aimhis.corona.reg (code,[date],arrival,preferred_username,email,phone_number,data) VALUES ('%s','%s','%s','%s','%s','%s','%s')
					SELECT @@identity AS id",
					$_POST['code'],
					$_POST['date'],
					$_POST['arrival'],
					$_POST['preferred_username'],
					$_POST['email'],
					$_POST['phone_number'],
					json_encode($_POST)
				));
				header('Content-Type: application/json');
				die(json_encode($row));
			} else if (!empty($_POST['id'])) {
				$departure = date('H:i:s');
				$row = sqlsrv_fetch_object(aim()->query(
					"UPDATE aimhis.corona.reg SET departure = '%s' WHERE id=%d
					SELECT * FROM aimhis.corona.reg WHERE id=%d",
					$departure,
					$_POST['id'],
					$_POST['id']
				));
				$data = json_decode($row->data,true);
				$data['departure'] = $departure;
				$content = implode('<br>', array_filter(array_map(function($key,$value){
					if ($value) return __('label_'.$key).": $value";
				}, array_keys($data), $data )));
				// debug(array_keys($data), $data);
				// debug($row->email, $content);
				$mail = aim()->mail([
					'send'=> 1,
					'to'=> $row->email,
					'bcc'=> "max.van.kampen@alicon.nl",
					// 'Subject'=> __('qr_registratie'),
					'chapters'=> [
						[
							'title' => 'Corona registratie',
							'content'=> __('corona_registratie_intro'),
						],
						[
							'title' => 'Corona app zelf gebruiken',
							'content'=> __('corona_registratie_gebruiken'),
						],
						[
							'title' => 'Registratie gegevens',
							'content'=> __('corona_registratie_content', $content),
						],
					],
				]);
				die(header('Location: /corona/'));
			}
		}
		debug([$_GET,$_POST]);
	}
	public function _print() {
		$content = file_get_contents('php://input');
		if (!empty($content) && !empty($_GET['printer_id'])) {
			server::print($content, $_GET['printer_id']);
			die();
		}
		if (isset($_GET['id'])) {
			$row = sqlsrv_fetch_object(aim()->query(
				"UPDATE FROM aim.auth.appprintqueue SET printDT = GETDATE() WHERE aid=%d;",
				$_GET['id']
			));
		} else {
			$row = sqlsrv_fetch_object(aim()->query(
				// "SELECT TOP 1 * FROM printer.dt WHERE sendDateTime IS NULL AND printer_id='%s';",
				"SELECT TOP 1 * FROM aim.auth.appprintqueue WHERE printDT IS NULL AND uid='%s';",
				$_GET['printer_id']
			));
			if ($row) {
				aim()->query(
					"UPDATE aim.auth.appprintqueue SET printDT = GETDATE() WHERE aid=%d;",
					$row->aid
				);
				die($row->html);
				// $mail = aim()->mail(json_decode($row->data, true));
				// aim()->query($q = "UPDATE printer.dt SET sendDateTime = GETDATE() WHERE id = '%d';", $row->id);
				// aim()->query($q = "UPDATE aim.auth.appprintqueue SET printDt = GETDATE() WHERE aid = %d;", $row->aid);
				// header( "refresh:5" );
				// die ($row->data."<script>window.print();</script>");
			}
			die();
			// header( "refresh:3" );
			// die ('last try '.date('Y-m-d h:i:s'));
		}
	}
	public function _href() {
		$id = json_decode(base64_decode(explode('.', $_COOKIE['id_token'])[1]), true);
		aim()->query(
			"INSERT INTO aimhis.his.link (address,url,userId) VALUES ('%s','%s','%s');",
			$_GET['address'],
			$_GET['redirect_uri'],
			$id['sub']
		);
		die(header("Location: ".$_GET['redirect_uri']));
	}
	public function _track() {
		if (empty($_SERVER['HTTP_REFERER'])) {
			$id = json_decode(base64_decode(explode('.', $_COOKIE['id_token'])[1]), true);
			aim()->query(
				"DECLARE @AccountId BIGINT
				EXEC account.get @accountName='%s', @AccountId = @AccountId OUTPUT
				INSERT INTO aimhis.his.link (address,url,userId) VALUES ('%s','%s',@AccountId);",
				$_GET['address'],
				$_GET['address'],
				$_GET['track'],
				$id['sub']
			);
		}
		die(header("Location: https://aliconnect.nl/image/pixel.png"));
	}
	public function _sitemap() {
		$content = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
		$res = aim()->query(
			"SELECT TOP 50000 H.keyname AS hostname,I.[schema],I.ID,CONVERT(VARCHAR(50),ISNULL(I.LastModifiedDateTime,I.CreatedDateTime),127)LastModifiedDateTime
			FROM item.vw I
			INNER JOIN item.dt H
			ON H.ID = I.HostID
			AND I.IsPublic=1
			AND I.[schema] > ''
			AND H.keyname > ''
			AND I.ClassID IN (1092,2107)"
		);
		while ($row = sqlsrv_fetch_object($res)) {
			$row->hyperlink = "https://$row->hostname.aliconnect.nl/id/".base64_encode("https://$row->hostname.aliconnect.nl/api/$row->schema($row->ID)");
			// $content.="\n<url><loc>$row->hyperlink</loc><lastmod>$row->LastModifiedDateTime+01:00</lastmod><changefreq>weekly</changefreq></url>";
			$content.="<url><loc>$row->hyperlink</loc><lastmod>$row->LastModifiedDateTime+01:00</lastmod></url>";
		}
		$content .= "</urlset>";
		file_put_contents ($_SERVER['DOCUMENT_ROOT'].'/sitemap.xml',$content);
		die('Sitemap saved');
	}

	public function _code_file() {
		$width = 80;
		$res = aim()->query($aim()->query = sprintf("
		SET NOCOUNT ON
		;WITH P (id) AS (
			SELECT id
			FROM item.vw
			WHERE id = %d
			UNION ALL
			SELECT I.id
			FROM P
			INNER JOIN item.vw I ON I.masterID = P.id
			)
			SELECT I.id,[schema],typical,Title FROM p INNER JOIN item.vw I ON I.id=P.id
			",$_GET['build_id']
		));
		// die($aim()->query);
		$rows=[];
		$lines=[];
		function write_st_code($code, $row) {
			$replaces = [
				'%d'=> $row->id,
				' AND ;'=> " AND ",
				' OR ;'=> " OR ",
				"≤"=> "<=",
				"≥"=> ">=",
				"<;"=> "<",
				"  "=> " ",
				"  "=> " ",
				"ELSE IF"=> "ELSIF",
			];
			$identor = [
				// '\('=> '\)',
				'\bIF\b'=> '\bEND_IF\b;',
				'\bFOR\b'=> '\bEND_FOR\b;',
			];
			$outdentor = "\b".
			implode("\b|\b",['AND','DO','OR','THEN','ELSE','ELSIF'])."\b";
			$ident = implode('|',array_keys($identor));
			$outdent = implode('|',array_values($identor));
			$code = str_replace(array_keys($replaces),array_values($replaces),$code);
			$code = preg_replace("/($ident|$outdent|$outdentor)/","\n$1\n",$code);
			$code = explode("\n", $code);
			$level = 0;
			foreach ($code as $i => $line) {
				$line=trim($line);
				if (preg_match("/$outdent/", $line)) $level--;
				$pos = $level;
				if (preg_match("/$outdentor/", $line)) $pos -= 1;
				$code[$i] = $line ? str_repeat('  ',$pos).$line : null;
				if (preg_match("/$ident/", $line)) $level++;
			}
			// $code = implode("\n",array_filter($code));
			$code = implode("\n",array_filter($code));
			return $code;
		}
		if ($_GET['lang']=='st') {
			while ($row = sqlsrv_fetch_object($res)) {
				if ($schema = AIM::$api->components->schemas->{$row->typical}) {
					$lines[] = "/**";//.str_repeat('=',$width);
					$lines[] = " * $row->typical #$row->id";
					// $lines[] = " * ".str_repeat('=',$width);
					$lines[] = " */";
					if ($schema->properties) {
						foreach ($schema->properties as $name => $object) {
							if ($object->rules) {
								$lines[] = "";
								$lines[] = "/** ";//.str_repeat('-',$width);;
								$lines[] = " * $object->stereotype $row->typical[$row->id].$name";
								// $lines[] = " * $row->typical #$row->id";
								$lines[] = wordwrap(str_replace(". ",".\n *   "," * $object->description"),$width,"\n *   ");
								$lines[] = " * $object->bsttiNr";
								$lines[] = " * Regels";
								foreach ($object->rules as $rule) {
									$lines[] = wordwrap(" * - Conditie: $rule->Conditie",$width,"\n *     ");
									$lines[] = wordwrap(" *   Waarde: $rule->Waarde",$width,"\n *     ");
								}
								// $lines[] = ' * '.str_repeat('-',$width).' */';
								$lines[] = " */";
								$lines[] = "";
								if ($object->{'st()'}) {
									$lines[] = write_st_code($object->{'st()'}, $row);
								}
							}
						}
					}
					if ($schema->operations) {
						foreach ($schema->operations as $name => $object) {
							if ($object->rules) {
								$lines[] = "";
								$lines[] = "/** ";//.str_repeat('-',$width);;
								$lines[] = " * $object->stereotype $row->typical[$row->id].$name ";
								$lines[] = wordwrap(" * $object->bsttiNr $object->description */",$width,"\n *   ");
								foreach ($object->rules as $rule) {
									$lines[] = wordwrap(" * Conditie: $rule->Conditie",$width,"\n *   ");
									$lines[] = wordwrap(" * Actie: $rule->Waarde",$width,"\n *   ");
								}
								// $lines[] = " * ".str_repeat('-',$width).' */';
								$lines[] = " */";
								$lines[] = "";
								if ($object->{'st()'}) {
									$lines[] = write_st_code($object->{'st()'}, $row);
								}
							}
						}
					}
					$rows[]=$row;
				}
			}
			$lines = implode(PHP_EOL,$lines);
			echo "/**\n * main program for ... \n */\n\nPROGRAM main\n\n$lines\n\nEND_PROGRAM;";
		}
		die();
	}
	public function _config() {
		$api=['paths'=>null];
		// $api = yaml_parse_file(__DIR__.'/../config.local.yml');

		// debug(__DIR__,AIM_DIR_PROJECT,aim::$domainroot,AIM::$domainroot);


		$data = json_decode(preg_replace('/\xc2\xa0/i'," ",file_get_contents(__ROOT__.'/data.json')),true);
		// die(yaml_emit($data));

		$stereotypes = [
			'Configuratie-elementen'=>'configuratie_element',
			'Variabelen'=>'variabele',
			'Bedieningen'=>'bediening',
			'Besturingen'=>'besturing',
			'Autonome processen'=>'autonoom_proces',
			'Besturing'=>'lfv',
		];
		function toJS ($line) {
			$line = str_replace(['<>'],['!='], $line);
			$line = preg_replace('/(#|\b_)/','this.', $line);
			$line = preg_replace('/([^\. ]+)\[\]\.(.*)\)/','$1.every(function(){return $2;})', $line);
			$line = preg_replace('/([^\. ]+)\[\i\]\.(.*)\)/','$1.some(function(){return $2;})', $line);
			$line = preg_replace('/\.([^\. ]+)\.([^\. ]+)\[\i\] = ([^\s]+)/','.some(function(){return this.$1.$2;})', $line);
			$line = str_replace(['.this'],[''], $line);
			$line = preg_replace('/  /i',";\n", $line);
			$line = preg_replace('/  /i',' ', $line);
			return $line."\n";
		}
		function toST ($line, $name) {
			$line = preg_replace('/([^\. ]+)\[\]\.(.*)\)/','
			result := true;
			FOR count := 0 TO i BY 1 DO
			IF $2 THEN
			result := false;
			EXIT;
			END_IF;
			END_FOR;
			', $line);
			$line = preg_replace('/([^\. ]+)\[\i\]\.(.*)\)/','
			result := false;
			FOR count := 0 TO i BY 1 DO
			IF $2 THEN
			result := true;
			EXIT;
			END_IF;
			END_FOR;
			', $line);
			$line = preg_replace('/\.([^\. ]+)\.([^\. ]+)\[\i\] = ([^\s]+)/','
			result := false;
			FOR count := 0 TO i BY 1 DO
			IF $2 THEN
			result := true;
			EXIT;
			END_IF;
			END_FOR;
			', $line);
			$line = preg_replace('/\s(#|\b_)/'," ".$name."%d_", $line);
			$line = preg_replace('/(\.#|\._)/',"_", $line);
			$line = preg_replace('/(&&)/',' AND ', $line);
			$line = preg_replace('/(\|\|)/',' OR ', $line);
			$line = preg_replace('/\n /i',"\n", $line);
			// $line = preg_replace('/  /i',' ', $line);
			return $line."\n";
		}
		foreach ($data['requirements'] as $id => $req) {
			// if ($id != 'BSTTI#16855') continue;
			// if (!in_array('Verkeerslichten',$req['path'])) continue;

			// if (in_array($key,$req['path']))

			foreach ($stereotypes as $key => $stereotype) {
				if (in_array($key,$req['path'])) {
					// die($stereotype);
					$lines = array_values(array_filter(explode("\n",$req['innerText'])));
					$path = $req['path'];
					array_pop($path);
					$schemaname = str_replace(' ','_',array_pop($path));
					if ($stereotype == 'lfv') {
						break;
						if (!strstr($req['innerText'],'toestandsvariabelen te hebben')) break;
						$req['description']=$req['innerText'];
						unset($req['innerHTML'],$req['innerText']);
						$api['components']['schemas'][$schemaname] = $req;
						break;
					}
					$enum = explode(':',array_shift($lines));
					$methodname = array_shift($enum);
					$enum = trim(array_shift($arr));
					$par = explode('(',$methodname);
					$methodname = array_shift($par);
					$par = rtrim(array_shift($par),')');
					$descr = explode("Conditie:",implode(" ",$lines));
					$init = explode("Init:",trim(array_shift($descr)));
					$description = array_shift($init);
					$init = trim(array_shift($init));
					$row = array_filter([
						'stereotype' => $stereotype,
						'type' => strstr($methodname,'[]') ? 'array' : null,
						'summary' => $methodname,
						'description' => $description,
						'enum' => empty($enum) ? null : array_map(function($val){return trim($val);},explode('|',trim($enum))),
						'bsttiName' => $methodname,
						'bsttiNr' => $req['id'],
						'bsttiInit' => $init,
						'bsttiPath' => $req['path'],
						'init()' => empty($init) ? null : toJS( "return $init\n"),
						'st()' => empty($init) ? null : toST( "IF init = 1 THEN\n$init\nEND_IF;", $schemaname),
					]);
					$methodname = str_replace(['[]','#'],'',$methodname);
					$methodname = $methodname[0]=='_' ? substr($methodname,1) : $methodname;
					$methodname = ucfirst($methodname);
					if (in_array($stereotype,['configuratie_element','variabele'])) {
						$st = [];
						foreach ($descr as $i => $val) {
							$val = explode("Waarde:",$val);
							$row['rules'][] = ['Conditie' => $conditie = trim($val[0]), 'Waarde' => $actie = trim($val[1]) ];
							// $row['logic'] = $row['logic'] ?: [];
							$actie = str_replace("  ",";\n",$actie);
							$st[] = toST( in_array($conditie,['overige situaties','*']) ? "$schemaname%d_$methodname := $actie;" : "IF $conditie THEN\n$schemaname%d_$methodname := $actie;", $schemaname);
							$conditie = str_replace("=","==",$conditie);
							$row['get()'] = (empty($row['get()']) ? '' : $row['get()']) . toJS( in_array($conditie,['overige situaties','*']) ? "return $actie;" : "if ($conditie)\n{\nreturn $actie;\n}" );
						}
						if ($st) {
							$row['st()'] = implode('ELSE ',$st)."END_IF;";
						}
						$api['components']['schemas'][$schemaname]['properties'][$methodname] = $row;
					}
					else {
						$parameters = empty($par) ? [] : array_map(function($val){
							$val = explode(':',$val);
							return [
								'name' => $parNames[] = $parameterName = trim($val[0]),
								'in' => 'aim()->query',
								'description' => $parameterName,
								'required' => true,
								'schema' => !empty($val[1]) && strstr($val[1],'|')
								? [
									'type' => 'array',
									'items' => [
										'type' => 'string',
										'enum' => $enum = array_map(function($val){ return trim($val);}, explode('|',$val[1])),
										'default' => $enum[0],
									]
								]
								: [
									'type' => 'string',
								]
							];
						},explode(',',$par));
						if ($parameters) {
							$methodname .= '('.implode(',',array_map(function($val){ return $val['name'];},$parameters)).')';
						}
						array_unshift($parameters, [
							'name' => 'id',
							'in' => 'aim()->query',
							'description' => "Identifier of $schemaname",
							'required' => true,
							'schema' => [
								'type' => 'number',
							]
						]);
						$row ['parameters'] = $parameters;
						$row['operationId'] = "$schemaname(id).$methodname";
						$st = [];
						$methodname = lcfirst(str_replace('*','',$methodname));
						foreach ($descr as $val) {
							$val = explode("Acties:",$val);
							// $row['rules'] = $row['rules'] ?: [];
							$row['rules'][] = ['Conditie' => $conditie = trim($val[0]), 'Acties' => $actie = trim($val[1]) ];
							$actie = str_replace("  ",";\n",$actie);
							$st[] = toST( in_array($conditie,['overige situaties','*']) ? "$actie;" : "IF $conditie THEN\n$actie;", $schemaname);
							$conditie = str_replace("=","==",$conditie);
							$actie = str_replace(":=","=",$actie);
							$row['js()'] = (empty($row['js()']) ? '' : $row['js()']) . toJS( $conditie=='*' ? $actie : "if ($conditie)\n{\n$actie;\n}");
						}
						if ($st) {
							$row['st()'] = "IF $schemaname%d_$methodname = 1 THEN\n" . implode('ELSE ',$st)."END_IF;\nEND_IF;";
						}

						$api['components']['schemas'][$schemaname]['operations'][$methodname] = $row;
						// $api['paths']["/$schemaname(id)/$methodname"] = [
						//   'post'=> [
						//     'operationId' => "components.schemas.$schemaname.operations.$methodname",
						//     'responses'=> [
						//       '200'=> ['description'=> 'successful operation']], 'security'=> [['aliconnect_auth'=> ['read:web']]
						//     ]
						//   ]
						// ];
						// $api['components']['schemas'][$schemaname]['operations'][$methodname] = $row;
						// $api['paths']['/'.str_replace([' ','-'],'_',strtolower(implode('/',$path)))."/$schemaname(id)/$methodname"]['post'] = $row;

					}
					break;
				}
			}
		}
		// ksort($api['paths']);
		ksort($api['components']['schemas']);

		echo $content = yaml_emit($api);
		die();
		file_put_contents($fname = __DIR__.'/webroot/config.yml', $content);

		die(yaml_emit($api['components']['schemas']));
		readfile($fname);
		die();
	}
	public function _dev_create_docs_yml() {
		$data = json_decode(file_get_contents('php://input'),true);
		die(yaml_emit($data));

		// die(file_get_contents('php://input'));
	}
	public function _html_cleanup() {
		// die($_SERVER['DOCUMENT_ROOT'].$_GET['href']);
		$fname = $_SERVER['DOCUMENT_ROOT'].$_GET['href'];

		$doc = new DOMDocument();

		// load the HTML into the DomDocument object (this would be your source HTML)
		$doc->loadHTML(file_get_contents($fname));

		function removeElementsByTagName($tagName, $document) {
			$nodeList = $document->getElementsByTagName($tagName);
			for ($nodeIdx = $nodeList->length; --$nodeIdx >= 0; ) {
				$node = $nodeList->item($nodeIdx);
				$node->parentNode->removeChild($node);
			}
		}
		removeElementsByTagName('script', $doc);
		removeElementsByTagName('style', $doc);
		removeElementsByTagName('link', $doc);

		foreach (['a','span','p','div','table','tr','td','img','b','br'] as $tagName) {
			$nodeList = $doc->getElementsByTagName($tagName);
			for ($nodeIdx = $nodeList->length; --$nodeIdx >= 0; ) {
				$node = $nodeList->item($nodeIdx);
				$node->removeAttribute('class');
				$node->removeAttribute('style');
			}
		}



		// output cleaned html
		$html = $doc->saveHtml();
		$html = explode('</head>',$html);
		$html = array_pop($html);
		$html = str_replace("<p><span><p>&nbsp;</p></span></p>","",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		$html = str_replace("\r\n\r\n","\r\n",$html);
		file_put_contents($fname = str_replace('.','_clean.',$fname),$html);
		// file_put_contents($fname,$html);
		die($html);
		die($fname);


		$html = str_replace('>',">\n",str_replace(PHP_EOL,'',file_get_contents($fname)));
		// $html = preg_replace('/ style="[^"]+/i',' ',$html);
		$html = preg_replace("/( style=\'[^\']*\')/",'',$html);
		// $html = preg_replace("/ style='[^']*'/",'',$html);



		// $html = preg_replace('/ class="[^"]+"/','',$html);
		// $html = preg_replace("/ class='[^']+'/",'',$html);
		// $html = preg_replace("/ class=[\w]+/",'',$html);
		$remove = [
			'<!--' => '-->',
			// '<![if !vml]>' => '<![endif]>',
		];
		foreach ($remove as $start => $end) {
			$arr = explode($start,$html);
			$html = [array_shift($arr)];
			foreach ($arr as $chap) {
				$html[] = explode($end,$chap)[1];
			}
			$html = implode('',$html);
		}

		// $html = preg_replace("/\r\n/i",'',$html);
		// $html = preg_replace("/<!--([^-->]*)-->/i",'',$html);
		// header('Content-Type: text/html; charset=utf-8');
		// $html = utf8_encode($html);
		// $html = iconv("CP1252", "UTF-8", $html);
		echo $html;
		die();
		die();
		die(iconv("CP1252", "UTF-8", $html));
		die (mb_convert_encoding($html, "HTML-ENTITIES", "UTF-8"));

		// die(file_get_contents('php://input'));
	}
	public function _xml() {
		$content = file_get_contents('php://input');
		$name = $_SERVER['DOCUMENT_ROOT'].'/shared/upload/'.date('YmdhIs').'.xml';
		file_put_contents($name, $content);
		die($name);
	}
	public function _yaml() {
		$content = file_get_contents('php://input');
		// debug($content, $_POST);
		die(yaml_emit(json_decode($content, true)));
	}

  public function _build() {
    //$get=(object)$_GET;
    /*
    	1 genereer database fiels
    	2 genereer db code (views, stored procedures, triggers, functions)
    	3 creer xml/json data files
    */

    //function clean($row){
    //    unset($row->config);
    //    foreach($row as $key=>$value){
    //        if($value=="")unset($row->$key);
    //        elseif (is_numeric($value))$row->$key=floatval($value);
    //        //$row->$key=intval($value);
    //    }
    //    return $row;
    //}

    if (isset($_GET['setup'])){
    	//die(json_encode($config));
    	// oplossen host enz, geen index.php gestart!!!
    	global $aim;
    	$aim->host=$_GET['host'];
    	//die(json_encode($config));
    	//err($aim);

    	//if($_SERVER[SERVER_NAME]=="aliconnect.nl")die("SETUP ON SERVER aliconnect.nl NOT ALLOWED");
    	echo "
    		<h1>SETUP AIM</h1>
    		<div>SERVER=localhost,HOST=$aim->host</div>
    		<form method='post' enctype='multipart/form-data'>
    			Geef database gebruiker<br>
    			<input type='text' name='username' value='aim' required><br>
    			Geef database wachtwoord<br>
    			<input type='password' name='password' required value=qwertyuiop><br>
    			<input type=submit value='Import' name='submit'>
    		</form>";

    	if($_POST[submit]){
    		if (!file_exists($fdest=__DIR__."/config.json"))copy(__DIR__."/config.template.json",$fdest);
    		$config=json_decode(file_get_contents($fdest));
    		$config->dbs->user=$_POST[username];
    		$config->dbs->password=$_POST[password];
    		$config->dbs->server='localhost';
    		file_put_contents($fdest,stripslashes(json_encode($config,JSON_PRETTY_PRINT)));
    		require_once (__DIR__."/connect.php");
    		$sql=file_get_contents("sql/aim.create.sql");
    		//$sql=str_replace("TEXT (16)","TEXT",$sql);
    		//die($sql);
    		$arr=explode("\r\nGO",$sql);
    		foreach($arr as $sql) query($sql,true);
    		query("USE aim");
    		query("
    			DELETE FROM om.freeID;
    			DELETE FROM om.items;
    			DELETE FROM om.attributes;
    			DBCC CHECKIDENT ('om.items', RESEED, 10000) WITH NO_INFOMSGS;
    			DBCC CHECKIDENT ('om.attributes', RESEED, 10000) WITH NO_INFOMSGS;
    		");

    		$fdest=$_SERVER[DOCUMENT_ROOT]."/Web.config";
    		if (!file_exists($fdest=$_SERVER[DOCUMENT_ROOT]."/Web.config"))copy($_SERVER[DOCUMENT_ROOT]."/Web.template.config",$fdest);

    		if (file_exists($fdest=$_SERVER[DOCUMENT_ROOT]."/$aim->host/api/v1/sql/$aim->host.create.sql")){
    			$row=fetch_object(query("SELECT * FROM sys.databases WHERE name = N'dms'"));
    			if(!$row){
    				echo "Uitvoeren sql".PHP_EOL;
    				$sql=file_get_contents($fdest);
    				querysql($sql);
    			}
    			else {
    				echo"Database $aim->host exists<br>";
    			}
    		}
    		die("<br>AIM Setup done");
    	}
    	die();
    }


    // require_once (__DIR__."/connect.php");

    if (isset($_GET['getAccount'])){
    	$row=fetch_object(query($q="EXEC api.getAccount @hostId='$aim->hostID', @userId='$aim->userID',@select=1"));
    	//$row->q=$q;
    	header('Content-type: application/json');
    	if (isset($_GET[download])) {
        header("Content-disposition: attachment; filename=aliconnectAccount$row->accountId$row->accountName".date("Ymd_hi").".json");
      }
    	die(json_encode($row));
    }

    if (isset($_GET['setAccount'])){
    	$dbs=$config->dbs;
    	if($_SERVER['SERVER_NAME']=="aliconnect.nl" || $dbs->server=="aliconnect.nl")die("User CREATE ON SERVER aliconnect.nl NOT ALLOWED");
    	echo "
    	<style>span{display:inline-block;</style>
    	<div>SERVER=$dbs->server</div>
    	<form method='post' enctype='multipart/form-data'>
    		Select aliconnect export JSON to import
    		<input type='file' name='fileImport'><br>
    		Password<br>
    		<input name='password' type='password' required></input><br>
    	    <input type=submit value='Import' name='submit'>
    	</form>";
    	if($_POST[submit]){
    		$post=(object)$_POST;
    		$put=json_decode(file_get_contents($_FILES["fileImport"]["tmp_name"]));
    		//die(json_encode($put));
    		query($q="EXEC api.setAccount @password='$post->password',".params($put));
    		die($q);
    	}
    	die();
    }

    function array_values_sql($values){
    	return array_map(function($val){return is_null($val)?"NULL":"'".str_replace("'","''",$val)."'";},array_values((array)$values));
    }

    if (isset($_GET['import'])){
    	$dbs=$config->dbs;
    	if($dbs->server!='localhost')die("Setup on $dbs->server not allowed. Only on localhost");

    	//if($_SERVER[SERVER_NAME]=="aliconnect.nl" || $dbs->server=="aliconnect.nl")die("IMPORT ON SERVER aliconnect.nl NOT ALLOWED");
    	$aim->host=$_GET['host'];
    	echo "
    	<div>SERVER=$dbs->server,HOST=$aim->host</div>
    	<form method='post' enctype='multipart/form-data'>
    		Select aliconnect export JSON to import
    		<input type='file' name='fileImport'>
    	    <input type=submit value='Import' name='submit'>
    	</form>";
    	if($_POST[submit]){
    		$content=json_decode(file_get_contents($_FILES["fileImport"]["tmp_name"]));
    		query("USE aim");
    		$path=$_SERVER[DOCUMENT_ROOT]."/$aim->host/app/v1";
    		$config=json_decode(file_get_contents($configFilename="$path/config.json"));
    		$config->client->system->id=$content->rootID;
    		$config->client->system->uid=$content->items->{$content->rootID}->uid;
    		foreach($content->items as $id=>$item){
    			if($item->masterID==$content->rootID && $item->classID==1008) {
    				$config->client->device->id=$id;
    				$config->client->device->uid=$item->uid;
    				break;
    			}
    		}
    		file_put_contents($configFilename,stripslashes(json_encode($config,JSON_PRETTY_PRINT)));
    		file_put_contents("$path/config.bat",'SET id='.$config->client->system->id.PHP_EOL.'SET uid='.$config->client->system->uid.PHP_EOL.'SET root="\aim\www"');

    		echo "<div>Host: <b>".$aim->host."</b> <b>".$content->hostID."</b></div>";
    		echo "<div>System: <b>".$config->client->system->id."</b>, <b>".$config->client->system->uid."</b></div>";
    		echo "<div>Device: <b>".$config->client->device->id."</b>, <b>".$config->client->device->uid."</b></div>";

    		echo "<br><a href='/$aim->host/app/auth/?redirect_uri=/$aim->host/app/oml/' target='oml'>Aanmelden</a>";
    		//die($quser);

    		query($sql.="DISABLE TRIGGER ALL ON om.items;DISABLE TRIGGER ALL ON om.attributes;");

    		$q.="SET DATEFORMAT YMD;DELETE om.attributes;DELETE om.freeid;DELETE om.items;DELETE om.attributeName;";

    		$q.="SET IDENTITY_INSERT om.items OFF;SET IDENTITY_INSERT om.attributeName OFF;SET IDENTITY_INSERT om.attributeName ON;";
    		foreach($content->attributeName as $id=>$value)$q.="\r\nIF NOT EXISTS(SELECT 0 FROM om.attributeName WHERE id=$id)INSERT om.attributeName(id,name)VALUES($id,'$value');";
    		$q.="SET IDENTITY_INSERT om.attributeName OFF;";

    		$q.="SET IDENTITY_INSERT om.items ON;";
    		foreach($content->class as $id=>$value)$q.="IF NOT EXISTS(SELECT 0 FROM om.items WHERE id=$id)INSERT om.items(id,classID,hostID,masterID,srcID,name)VALUES($id,0,0,0,0,'$value');";
    		$q.="SET IDENTITY_INSERT om.items OFF;";


    		if($content->items){
    			//foreach($content->items as $id=>$item) $q.="DELETE om.attributes WHERE id=$id;DELETE om.freeid WHERE id=$id;DELETE om.items WHERE id=$id;";
    			foreach($content->items as $id=>$item){
    				unset($item->PrimaryKey,$item->ChildIndex,$item->CreatedDateTime,$item->StartDateTime,$item->EndDateTime,$item->FinishDateTime,$item->LastModifiedDateTime,$item->UniqueKey);
    				//$qa.="\r\nDELETE om.attributes WHERE id=$id;";
    				//if($item->classID==4133)
    				foreach($item->values as $attributeName=>$attribute){
    					//err($attribute);


    					foreach($attribute as $key=>$value)if(is_object($value))$attribute->$key=json_encode($value);

    					//$attribute=(array)$attribute;
    					//array_walk($attribute,function(&$row){ $row=str_replace("'","''",$row);});
    					//$qa.="INSERT om.attributes(".implode(",",array_keys($attribute)).")VALUES('".  implode("','",array_values($attribute))   ."');";



    					//unset($attribute->values,$attribute->activeCnt);
    					//$attribute=(array)$attribute;
    					//err($attribute);


    					$qa.="INSERT om.attributes(".implode(",",array_keys((array)$attribute)).")VALUES(".implode(",",array_values_sql($attribute)).");";


    					//die($qa);
    				}
    				unset($item->values,$item->itemID,$item->indexDT,$item->itemConfig,$item->location);


    				//foreach($item as $key=>$value)$item->$key=str_replace("'","''",is_object($value)?json_encode($value):$value);

    				//err($item);


    				if(count((array)$item))$qi.="\r\nINSERT om.items(id,".implode(",",array_keys((array)$item)).")VALUES($id,".implode(",",array_values_sql($item)).");";

    				//die($qi);

    				//if(count((array)$item))$qi.="\r\nINSERT om.items(id,".implode(",",array_keys((array)$item)).")VALUES($id,".implode(",",function($val){return is_null($val)?"NULL":"'$val'";},array_values((array)$item))).");";
    			}
    			$q.="SET IDENTITY_INSERT om.attributes OFF;SET IDENTITY_INSERT om.items OFF;SET IDENTITY_INSERT om.items ON;$qi;SET IDENTITY_INSERT om.items OFF;SET IDENTITY_INSERT om.attributes OFF;SET IDENTITY_INSERT om.attributes ON;$qa;SET IDENTITY_INSERT om.attributes OFF;";
    		}
    		query($sql.="ENABLE TRIGGER ALL ON om.items;ENABLE TRIGGER ALL ON om.attributes;");
    		$q=str_replace(";",";\r\n",$q);
    		$q=str_replace("\r\n\r\n","\r\n",$q);
    		$q=str_replace("0000Z","Z",$q);
    		file_put_contents(__DIR__."/sql/aim.import.sql","USE aim\r\nGO\r\n".$q);


    		//$row=fetch_object(query("EXEC api.getAccount @select=1, @hostName='$aim->host', @email='$aim->host@aliconnect.nl'"));
    		//if (!$row->userId){
    		//    $password=getPassword();
    		//    $password="Welkom1234!";
    		//    //EXEC api.setAccount @select=1, @hostName='dms', @email='dms@aliconnect.nl', @password='dynniq', @userName='DMS Admin', @groupName='Admin', @userId=265090, @hostId=3562718, @accountId=3564660, @groupId=3564659
    		//    //query($sql.="EXEC api.setAccount @select=1, @hostName='$aim->host', @email='$aim->host@aliconnect.nl', @password='$password', @userName='$aim->host Admin', @groupName='Admin', @hostID=$content->hostID, @userID=900;");
    		//    query($quser="EXEC api.setAccount @select=1, @hostName='$aim->host', @email='$aim->host@aliconnect.nl', @password='$password', @userName='$aim->host Admin', @groupName='Admin', @hostID=$content->hostID, @userID=800, @accountID=801, @groupID=802, @userUID='718e9b30-72e7-4bcd-a35f-3c3a2c3b247e';");
    		//    //echo "<br>$q<br>";
    		//    echo"<div>AccountName: <b>$aim->host@aliconnect.nl</b><br>AccountPassword: <b>$password</b></div><br>";
    		//}

    		$password="Welkom1234!";
    		$q.="EXEC api.setAccount @select=1, @hostName='$aim->host', @email='$aim->host@aliconnect.nl', @password='$password', @userName='$aim->host Admin', @groupName='Admin', @userID=800, @accountID=801, @groupID=802, @userUID='718e9b30-72e7-4bcd-a35f-3c3a2c3b247e';";
    		echo"<div>AccountName: <b>$aim->host@aliconnect.nl</b><br>AccountPassword: <b>$password</b></div><br>";

    		$q.="delete om.attributes where fieldid in (1738,2007,2006,2004,1921,1920,1919,1918,1917,1916,1915,1914,1890,1891,1898)";

    		querysql($q);
    		echo "<div>Total Items: <b>".$row=fetch_object($res=query("SELECT COUNT(0) AS cnt FROM om.items"))->cnt."</b></div>";
    		echo "<div>Total Attributes: <b>".$row=fetch_object($res=query("SELECT COUNT(0) AS cnt FROM om.attributes"))->cnt."</b></div>";





    		die();
    	}
    	die();
    }
    if (isset($_GET['loadimport'])){
    	$dbs=$config->dbs;
    	if($_SERVER['SERVER_NAME']=="aliconnect.nl" || $dbs->server=="aliconnect.nl")die("IMPORT ON SERVER aliconnect.nl NOT ALLOWED");
    	$sql=file_get_contents(__DIR__."/sql/aim.import.sql");
    	querysql($sql);
    	die("<plaintext>".$sql);
    }

    if (strtolower($_SERVER['REQUEST_METHOD'])=='put') {
    	$put=json_decode(file_get_contents('php://input'));
    	die("Data uploaded".json_encode($put->class));
    }

    if (isset($_GET['phplibs'])) {
    	$files = array_filter(scandir(__DIR__."/"),function($var){return preg_match('/(^\.|^_| Copy| kopie|test|pdfdoc)/',$var)!=1 && preg_match('/(.php)/',$var);});
    	die(json_encode(array_values($files)));
    }

    if (isset($_GET['phpsource'])) {
        die(highlight_file(__DIR__."/".$_GET['phpsource'].".php"));
    }

    if (isset($_GET['phplib'])) {
    	$classes=get_declared_classes();
    	require(__DIR__."/".$_GET[phplib]);
    	$classes=array_slice(get_declared_classes(),count($classes));
    	foreach ($classes as $className){
    		$methods=get_class_methods($className);

    		foreach($methods as $methodName) {
    			$func = new ReflectionMethod( $className, $methodName );
    			//$func = new ReflectionFunction("test::myfunction");
    			$filename = $func->getFileName();
    			$start_line = $func->getStartLine() - 1; // it's actually - 1, otherwise you wont get the function() block
    			$end_line = $func->getEndLine();
    			$length = $end_line - $start_line;
    			$source = file($filename);
    			$body = implode("", array_slice($source, $start_line, $length));
    			//$data->$className->$methodName="";
    			$data->$className->$methodName=$body;
    		}
    	}
    	die(json_encode($data));
    }

    if (isset($_GET['php'])) {
    	$files = array_filter(scandir(__DIR__."/"),function($var){return preg_match('/(^\.|^_| Copy| kopie|test|pdfdoc)/',$var)!=1 && preg_match('/(.php)/',$var);});
    	//$files=array('build.php');
    	//$files=explode(',','aim-mse.php,aim-pdfdoc.php,ana.php,api.php,build.php,company.php,compress.php,connect.php,contact.php,content.php,definitions.php,doctree.php,icon.php,index.php,lf.php,lib.php,mail.php,maildoc.php,mse.php,rc.php,setup.php,shop.php,site.php,sms_send.php,soap.php,system.php,task.php,threed.php,uploadbank.php,uploadfile.php');
    	//$files=explode(',','aim-mse.php,aim-pdfdoc.php,ana.php,api.php,build.php,company.php,compress.php,connect.php,contact.php,content.php,definitions.php,doctree.php,icon.php,index.php,lf.php,lib.php,mail.php,maildoc.php,mse.php,rc.php,setup.php');
    	//$files=explode(',','aim-mse.php,aim-pdfdoc.php,ana.php,api.php,build.php,company.php,compress.php,connect.php,contact.php,content.php,definitions.php,doctree.php,icon.php,index.php,lf.php,lib.php,mail.php,maildoc.php,mse.php,rc.php,setup.php,shop.php,site.php,sms_send.php,soap.php,system.php,task.php,threed.php,uploadbank.php,uploadfile.php');
    	//die(implode(',',$files));
    	//$data->files=$files;
    	foreach($files as $fname)if(is_file($filename=__DIR__."/".$fname))$data->$fname=show_source($filename,true);
    	die(json_encode($data));
    }

    if (isset($_GET['tables'])){
    	$res=query("DECLARE @T TABLE (object_id INT, schema_id INT, name VARCHAR(500))
    		INSERT @T
    		SELECT object_id,schema_id,name FROM sys.tables WHERE name not like '[_]%'

    		SELECT T.object_id,S.name [schema],TB.name--,*
    		FROM @T T
    		INNER JOIN sys.tables TB ON TB.object_id=T.object_id
    		INNER JOIN sys.schemas S ON S.schema_id=TB.schema_id
    		ORDER BY s.name

    		SELECT T.object_id,C.name,TP.name [type] FROM sys.columns C INNER JOIN @T T ON T.object_id=C.object_id INNER JOIN sys.types TP ON TP.system_type_id=C.system_type_id
    	");
    	while ($row=fetch_object($res)) {
    		$data->tables->{"$row->schema.$row->name"}=$tables->{$row->object_id}=$row;
    		unset($row->object_id);
    	}
    	next_result($res);
    	while ($row=fetch_object($res)) {
    		$tables->{$row->object_id}->columns->{$row->name}=$row;
    		unset($row->object_id,$row->name);
    	}
    	die (json_encode($data->tables));
    }

    if (isset($_GET['lib'])){
    	function compress($content){
    		$content = preg_replace('/\/\*[^\/]*\*\/|\t|\r\n/', '', $content);
    		$content = preg_replace('/((\'[^\']*\')(*SKIP)(*FAIL)|(        |       |      |     |    |   |  ))/', " ", $content);
    		//$content = preg_replace('/(("[^"]*"|\'[^\']*\')(*SKIP)(*FAIL)|(        |       |      |     |    |   |  ))/', " ", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(} | } | }))/', "}", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|({ | { | {))/', "{", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(= | = | =))/', "=", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(&& | && | &&))/', "&&", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(\|\| | \|\| | \|\|))/', "||", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(, | , | ,))/', ",", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(: | : | :))/', ":", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(; | ; | ;))/', ";", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(- | - | -))/', "-", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(< | < | <))/', "<", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(> | > | >))/', ">", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(\* | \* | \*))/', "*", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(\+ | \+ | \+))/', "+", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(\? | \? | \?))/', "?", $content);
    		$content = preg_replace('/((replace[^\)]*\))(*SKIP)(*FAIL)|(\/ | \/ | \/))/', "||", $content);
    		return $content;
    	}
    	function compress_js($content){
    		$content = preg_replace('/\t/', '', $content);
    		$content = preg_replace('/(("[^"]*"|\'[^\']*\')(*SKIP)(*FAIL)|\/\/[\s\S]+?)\r\n/', "", $content);
    		$content = compress($content);
    		$content = preg_replace('/\) | \) | \)/', ")", $content);
    		$content = preg_replace('/\( | \( | \(/', "(", $content);
    		return $content;
    	}
    	function compress_css($content){
    		$content = compress($content);
    		return $content;
    	}

    	$files = array_filter(scandir(__DIR__."/../lib/js"),function($var){return preg_match('/(^\.|^_| Copy| kopie|test)/',$var)!=1 && preg_match('/(.js)/',$var);});
    	foreach($files as $fname){
    		$content=compress_js(file_get_contents('../lib/js/'.$fname));
    		file_put_contents('../lib/js/min/'.str_replace(".js","-min.js",$fname),$content);
    	}

    	$files = array_filter(scandir(__DIR__."/../lib/css"),function($var){return preg_match('/(^\.|^_| Copy| kopie|test)/',$var)!=1 && preg_match('/(.css)/',$var);});
    	foreach($files as $fname){
    		$content=compress_js(file_get_contents('../lib/css/'.$fname));
    		file_put_contents('../lib/css/min/'.str_replace(".css","-min.css",$fname),$content);
    	}
    	die(done);
    	die(json_encode($files));

    	//$content=compress_js(file_get_contents('../lib/js/app.js'));file_put_contents('../lib/js/app-min.js',$content);
    	//echo $content=compress_js(file_get_contents('../lib/js/om.js'));file_put_contents('../lib/js/om-min.js',$content);
    	//$content=compress_css(file_get_contents('../lib/css/page.css'));file_put_contents('../lib/css/page-min.css',$content);
    	//$content=compress_css(file_get_contents('../lib/css/om.css'));file_put_contents('../lib/css/om-min.css',$content);
    	//$content=compress_css(file_get_contents('../lib/css/app.css'));file_put_contents('../lib/css/app-min.css',$content);
    }

    if (isset($_GET['sqljson'])){
    	die(file_get_contents(__DIR__."/sql/sql.json"));
    }

    if (isset($_GET['sql'])){
    	$res=query("USE AIM");
    	$res=query("
    	DECLARE @T TABLE (object_id INT,referenced_major_id INT,name VARCHAR(500),ref VARCHAR(500),ot VARCHAR(500),rt VARCHAR(500))
    	INSERT @T
    	SELECT DISTINCT P.object_id,referenced_major_id,S1.name+'.'+O1.name AS obj,S2.name+'.'+O2.name AS ref  ,O1.type,O2.type
    	FROM sys.sql_dependencies P
    	INNER JOIN sys.objects O1 ON O1.object_id=P.object_id AND O1.name NOT LIKE '[_]%' --AND O1.type='V'
    	INNER JOIN sys.schemas S1 ON S1.schema_id=O1.schema_id
    	INNER JOIN sys.objects O2 ON O2.object_id=P.referenced_major_id AND O2.name NOT LIKE '[_]%' --AND O2.type='V'
    	INNER JOIN sys.schemas S2 ON S2.schema_id=O2.schema_id
    	WHERE P.object_id<>P.referenced_major_id

    	DECLARE @P TABLE(level INT,object_id INT,name VARCHAR(500),ot VARCHAR(500),referenced_major_id INT,ref VARCHAR(500),rt VARCHAR(500))
    	DECLARE @level INT
    	SET @level=0

    	INSERT @P
    	SELECT @level,O1.object_id,S1.name+'.'+O1.name AS obj,type,null,null,null
    	FROM sys.objects O1
    	INNER JOIN sys.schemas S1 ON S1.schema_id=O1.schema_id
    	WHERE O1.object_id NOT IN (SELECT object_id FROM @T) AND O1.type NOT IN ('S','D','PK','IT','SQ','UQ') AND O1.name NOT LIKE '[_]%'

    	WHILE @level<5
    	BEGIN
    		SET @level=@level+1
    		INSERT @P
    		SELECT DISTINCT @level,T.object_id,T.name,T.ot,T.referenced_major_id,T.ref,T.rt
    		FROM @T T WHERE object_id NOT IN (
    			SELECT DISTINCT object_id FROM @T WHERE referenced_major_id NOT IN (SELECT object_id FROM @P)
    		)
    		AND T.object_id NOT IN (SELECT DISTINCT object_id FROM @P)
    	END

    	SET NOCOUNT OFF

    	--SELECT TABLE DEF
    	SELECT S.name schemaname,T.name,api.getDefinitionTable(t.object_id) definition
    	FROM sys.tables t
    	INNER JOIN sys.schemas S ON S.schema_id=T.schema_id
    	where t.name not like '[_]%' --and o.name='wordAdd'
    	order by S.name,T.name

    	--SELECT SQL
    	SELECT P.level,P.idx,M.object_ID,S.name schemaname,O.name name,O.type,type_desc,M.definition
    	FROM sys.sql_modules M
    	INNER JOIN (
    	SELECT DISTINCT
    		level,object_id,name,ot,
    		CASE ot WHEN 'U' THEN 0 WHEN 'TR' THEN 3 WHEN 'FN' THEN 11 WHEN 'TF' THEN 12 WHEN 'IF' THEN 13 WHEN 'V' THEN 5 WHEN 'P' THEN 31 ELSE 50 END
    		idx
    		FROM @P
    	) P ON P.object_id = M.object_ID
    	INNER JOIN sys.objects O ON O.object_id=M.object_id
    	INNER JOIN sys.schemas S ON S.schema_id=O.schema_id
    	WHERE o.name NOT LIKE '[_]%'
    	ORDER BY P.level,P.idx,S.name,O.name

    	");

    	$l="\r\n-- ===============================================\r\n";

    	$dbname=$_GET[dbname]?:"AIM";
    	while($row=fetch_object($res)) {//TABLE DEF
    		$schema->{$row->schemaname}=null;
    		//$sql.="$l-- TABLE $row->schemaname.$row->name$l";

    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace("TEXT(16)","TEXT",$row->definition);
    		$sql.=PHP_EOL.str_replace("\r","\r\n",$row->definition);
    		//$json->sql->{"$row->schemaname.$row->name"}=str_replace("\r","\r\n",$row->definition);
    	}
    	next_result($res);
    	while($row=fetch_object($res)) {//SQL
    		$schema->{$row->schemaname}=null;
    		$row->definition=str_replace(array("(","\r\n"),array(" ("," \r\n"),$row->definition);

    		$a=explode("CREATE ",$row->definition);
    		array_shift($a);
    		$row->definition=implode("CREATE ",$a);

    		$a=explode(" ",$row->definition);
    		$row->definition=array_shift($a);
    		array_shift($a);
    		$row->definition.=" [$row->schemaname].[$row->name] ".implode(" ",$a);

    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);
    		$row->definition=str_replace(" (","(",$row->definition);

    		//$row->definition=str_replace(" (","(",$row->definition);
    		//$row->definition=str_replace(" (","(",$row->definition);
    		//$row->definition=str_replace(" (","(",$row->definition);
    		//$row->definition=str_replace(" (","(",$row->definition);

    		$types=array('FN'=>'FUNCTION','TF'=>'FUNCTION','IF'=>'FUNCTION','P'=>'PROCEDURE','TR'=>'TRIGGER','V'=>'VIEW');
    		$type=$types[$row->type];

    		//$sqla.="$l-- $row->type_desc $row->schemaname.$row->name $l";
    		$sqla.="\r\nALTER $row->definition\r\nGO\r\n";
    		//$sql.="$l-- $row->type_desc $row->schemaname.$row->name $l".($s="\r\nIF OBJECT_ID('$row->schemaname.$row->name') IS NOT NULL DROP $type $row->schemaname.$row->name;\r\nGO\r\nCREATE $row->definition\r\nGO\r\n");

    		$sql.=($s="\r\nIF OBJECT_ID('$row->schemaname.$row->name') IS NOT NULL DROP $type $row->schemaname.$row->name;\r\nGO\r\nCREATE $row->definition\r\nGO\r\n");

    		//$sql.="$l-- $row->type_desc $row->schemaname.$row->name $l".($s="IF OBJECT_ID('$row->schemaname.$row->name') IS NOT NULL DROP $type $row->schemaname.$row->name;\r\nGO\r\nCREATE $row->definition\r\nGO");
    		$json->$type->{"$row->schemaname.$row->name"}->code=$s;
    	}
    	foreach($schema as $schemaname=>$val)$sqlschema.="\r\nIF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'$schemaname') EXEC sys.sp_executesql N'CREATE SCHEMA [$schemaname]'\r\nGO";
    	file_put_contents(__DIR__."/sql/aim.alter.sql","USE AIM\r\nGO".$sqla);
    	file_put_contents(__DIR__."/sql/aim.create.sql",$sql="SET NOCOUNT ON;IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'$dbname') CREATE DATABASE [$dbname]\r\nGO\r\nUSE $dbname\r\nGO".$sqlschema.$sql);

    	$res=query("DECLARE @T TABLE (object_id INT, schema_id INT, name VARCHAR(500))
    		INSERT @T
    		SELECT object_id,schema_id,name FROM sys.tables WHERE name not like '[_]%'

    		SELECT T.object_id,S.name [schema],TB.name--,*
    		FROM @T T
    		INNER JOIN sys.tables TB ON TB.object_id=T.object_id
    		INNER JOIN sys.schemas S ON S.schema_id=TB.schema_id
    		ORDER BY s.name

    		SELECT T.object_id,C.name,TP.name [type] FROM sys.columns C INNER JOIN @T T ON T.object_id=C.object_id INNER JOIN sys.types TP ON TP.system_type_id=C.system_type_id
    	");
    	while ($row=fetch_object($res)) {
    		$json->TABLES->{"$row->schema.$row->name"}=$tables->{$row->object_id}=$row;
    		unset($row->object_id);
    	}
    	next_result($res);
    	while ($row=fetch_object($res)) {
    		$tables->{$row->object_id}->columns->{$row->name}=$row;
    		unset($row->object_id,$row->name);
    	}
    	foreach ($tables as $id => $table) {
    		$table->columns=(array)$table->columns;
    		ksort($table->columns);
    	}
    	//die (json_encode($data->tables));

    	file_put_contents(__DIR__."/sql/sql.json",json_encode($json));


    	die("<plaintext>".$sql);
    }


    if ($_GET['rootID']) {
      $json = (object)[
        'hostID' => null,
        'rootID' => $_GET['rootID'],
        'class' => null,
        'attributeName' => null,
        'items' => null,
      ];
    	$filename.="_root".$_GET['rootID'];
    	$res=aim()->query("SET NOCOUNT OFF;EXEC api.getBuild @rootID=".$_GET['rootID']);
      while($row=sqlsrv_fetch_object($res)){
        if ($row->classID == 0) {
          $json->class->{$row->PrimaryKey} = $row->name;
        } else {
          $json->items->{$row->PrimaryKey} = $row;
        }
      }
    	sqlsrv_next_result($res);
    	while($row=sqlsrv_fetch_object($res)){
        $json->attributeName->{$row->fieldID} = $row->name;
        $json->items->{$row->id}->values->{$row->name}=$row;
      }

    	// while($row=fetch_object($res))$json->class->{$row->id}=$row->name;
    	// next_result($res);
    	// while($row=fetch_object($res))$json->attributeName->{$row->id}=$row->name;
    	// next_result($res);
    	// while($row=fetch_object($res)){$json->items->{$row->id}=cleanrow($row);unset($row->id);unset($row->obj);}
    	// next_result($res);
    	// while($row=fetch_object($res))$json->items->{$row->id}->values->{$row->name}=$row;
    	//die (json_encode($json));
    }
    if ($_GET['hostID']){
    	/*
    		Maakt JSON met alle data van een domein hostID
    	*/
    	$json->hostID=$_GET[hostID];
    	$filename.="_host".$_GET[hostID];
    	//$json->dataset=array();
    	$res=query("SET NOCOUNT OFF;EXEC api.getBuild @hostID=".$_GET[hostID]);
    	while($row=fetch_object($res))$json->class->{$row->id}=$row->name;
    	next_result($res);
    	while($row=fetch_object($res))$json->attributeName->{$row->id}=$row->name;
    	next_result($res);
    	while($row=fetch_object($res))$json->items->{$row->id}=cleanrow($row);
    	next_result($res);
    	while($row=fetch_object($res))$json->items->{$row->id}->values->{$row->name}=cleanrow($row);
    	//die (json_encode($json));
    }
    //file_put_contents(__DIR__."/sql/construct.json",json_encode($json));
    header('Content-type: application/json');
    if(isset($_GET['download'])) {
      header("Content-disposition: attachment; filename=aliconnect_export_".date("Ymd_hi")."$filename.json");
    }
    die (json_encode($json,JSON_PRETTY_PRINT));
	}

  public function _cleanup() {
    if ($_GET['task'] === 'children') {
      aim()->query("
      update item.dt set hasChildren = null where hasChildren = 1 and id not in (select distinct masterid from item.dv)
      update item.dt set hasChildren = 1 where hasChildren is null and id in (select distinct masterid from item.dv)
      ");
    }
    die('DONE');
    // $res = aim()->query("SELECT id FROM item.dv WHERE hasChildren = 1 and id not in (SELECT DISTINCT masterID FROM item.children)");
    // while ($row = sqlsrv_fetch_object($res)) {
    //
    // }
  }

  public function _control_data() {
    ini_set('display_errors', 0);
    // debug(1);
    $aim = aim()->api;
    $sub = aim()->access['sub'];
    // debug(555, AIM::$access, getallheaders());
    // if (!$sub) debug('error');
    // debug(AIM::$api);

    $res = aim()->query($q = "SET NOCOUNT ON
      ;WITH P(level,NameID,ItemID,LinkID)
      AS (SELECT 0,I.NameID,I.ItemID,I.LinkID
      FROM attribute.dt I
      WHERE I.NameID = 980 AND I.ItemID = $sub
      UNION ALL
      SELECT level+1,I.NameID,I.ItemID,I.LinkID
      FROM P
      INNER JOIN attribute.dt I ON I.NameID = 980 AND I.LinkID = P.ItemID and level<10
      )
      SELECT * FROM P
      INNER JOIN item.vw I ON I.id=P.itemid
    ");
    // die($q);
    // debug($sub);
    // die($q);
    // debug($aim);
    while ($row = sqlsrv_fetch_object($res)) {
      // debug($row);
      $row->{'@id'} = "$row->schema($row->ID)";
      // $items[$row->LinkID]->{$row->schema}[] = $items[$row->ID] = $row;
      $items[$row->LinkID]->Children[] = $items[$row->ID] = $row;
      $aim->data->value[] = $row;
      if (isset($aim->components->schemas->{$row->schema})) {
        $schema = $schemas->{$row->schema} = $aim->components->schemas->{$row->schema};
        if (isset($schema->operations)) {
          foreach ($schema->operations as $operationName => $operation) {
            $paths->{'/'.$row->schema.'({id})/'.$operationName}->post = $operation;
          }
        }
      }
    }
    // debug($paths,$schemas);
    unset($aim->om,$aim->css,$aim->Docs);
    $aim->tags = [];
    $aim->paths = $paths;
    $aim->components->schemas = $schemas;
    $aim->value[] = $items[$sub];
    // debug($aim);
    header('Content-type: application/json');
    // header('OData-Version: 4.0');
    die(json_encode($aim, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    // debug("jaaacontrol_data111",$_GET['id']);
  }
  public function _data() {
    // die("THIS IS DATA");
    $ID = $_GET['id'];
    $res = aim()->query($q = "SET NOCOUNT ON
    DECLARE @ID INT
    SET @ID = $ID
    DECLARE @T TABLE(level INT, NameID INT, ItemID BIGINT, LinkID BIGINT)

    ;WITH P(level,NameID,ItemID,LinkID)
    AS (SELECT -1,I.NameID,I.ItemID,I.LinkID
    FROM attribute.dt I
    WHERE I.NameID = 980 AND I.ItemID = @ID
    UNION ALL
    SELECT level-1,I.NameID,I.ItemID,I.LinkID
    FROM P
    INNER JOIN attribute.dt I ON I.NameID = 980 AND I.ItemID = P.LinkID and level>-10
    )
    INSERT @T SELECT * FROM P

    ;WITH P(level,NameID,ItemID,LinkID)
    AS (SELECT 0,I.NameID,I.ItemID,I.LinkID
    FROM attribute.dt I
    WHERE I.NameID = 980 AND I.ItemID = @ID
    UNION ALL
    SELECT level+1,I.NameID,I.ItemID,I.LinkID
    FROM P
    INNER JOIN attribute.dt I ON I.NameID = 980 AND I.LinkID = P.ItemID and level<10
    )
    INSERT @T SELECT * FROM P

    SELECT [schema],I.ID,UID,Title,Subject,Summary FROM (SELECT DISTINCT ItemID FROM @T) T INNER JOIN item.vw I ON I.id = T.ItemID

    ;WITH P( level,NameID,ItemID,LinkID,RootID)
    AS (SELECT -1,I.NameID,I.ItemID,I.LinkID,I.ItemID
    FROM attribute.dt I
    INNER JOIN @T T ON I.NameID = 1157 AND I.ItemID = T.ItemID
    UNION ALL
    SELECT level-1,I.NameID,I.ItemID,I.LinkID,P.RootID
    FROM P
    INNER JOIN attribute.dt I ON I.NameID = 1157 AND I.LinkID = P.ItemID and level>-10
    )
    SELECT T.RootID ItemID,A.NameID,A.AttributeName,A.Value,A.LinkID FROM P T INNER JOIN attribute.vw A ON A.ItemID = T.RootID
    ");
    // die($q);
    $data = ['items' => [], 'attributes' => [] ];
    while (	$row = sqlsrv_fetch_object($res)) array_push($data['items'],$row);
    sqlsrv_next_result($res);
    while (	$row = sqlsrv_fetch_object($res)) array_push($data['attributes'],$row);
    header('Content-type: application/json');
    // header("Content-disposition: attachment; filename=aim-$ID-".date("Ymdhis").".json");
    die(json_encode($data));
  }
  public function _item_map_v1() {
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    // debug($id);
    $res = aim()->query("DECLARE @rootID BIGINT
      SET @rootID = $id
      DECLARE @tree TABLE (level tinyint, id int, masterId int, srcId int)
      ;with tree (level, id, masterId, srcId) AS (
      	SELECT 0, item.id, item.masterId, isnull(item.inheritedId,item.srcId) FROM item.dv item
      	WHERE id = @rootID
      	UNION ALL
      	SELECT level+1, item.id, item.masterId, isnull(item.inheritedId,item.srcId) FROM item.dv item
      	INNER JOIN tree ON item.masterId=tree.id
      )
      insert @tree select * from tree

      select
      	tree.level,
      	item.tagname(item.id) tagname,
      	--item.path(item.id) path,
      	--aim.item.path(item.id) path1,
        item.link(item.id) as connection,
      	substring(item.link1(i1.id),62,999) as connection1,
      	item.schemapath(item.id) as schemaPath,
      	item.getattributevalue(item.id, 'Tag') as tag,
      	item.getattributevalue(item.id, 'Prefix') as prefix,
      	item.getattributevalue(item.id, 'Name') as name,
      	item.header0,
      	item.header1,
      	item.header2,
      	item.id
      from
      	@tree tree
      	inner join item.dv item on item.id = tree.id
      	left outer join aim.item.tbl i1 on i1.masterid = item.masterid and i1.name = item.getattributevalue(item.id, 'Name')

      order by item.tagname(item.id)
      ;with
      src (level, id, srcId) AS (
      	SELECT 1, id, srcId
      	FROM @tree where srcId is not null
      	UNION ALL
      	SELECT level+1, item.id, isnull(item.inheritedId,item.srcId)
      	FROM aim.item.tbl item
      	INNER JOIN src ON item.id=src.srcid
      ),
      name (id, name) as (
      	select id,name from aim.item.attributename
      ),
      attributes (ItemID, NameID, AttributeName, Value, LinkID) as (
      	select a.id, a.fieldId, name.name, isnull(l.title, a.value), a.itemId
      	from aim.item.attribute a
      	inner join name on name.id = a.fieldId
      	left outer join aim.item.tbl l on l.id = a.itemid
      	where a.value is not null or a.itemid is not null
      ),
      itemattr (level, ItemID, NameID, AttributeName, Value, LinkID, isOwnProperty) as (
      	select 0, i.id, NameID, AttributeName, Value, LinkID, 1
      	from attributes a
      	inner join @tree i on a.ItemID = i.id
      ),
      detailattr (level, ItemID, NameID, AttributeName, Value, LinkID, isOwnProperty) as (
      	select 0, i.id, null, 'link', aim.item.path(i.detailid), i.detailid, 0
      	from aim.item.tbl i
      	where detailid in (select id from @tree)
      	union
      	select 0, i.detailid, null, 'link', aim.item.path(i.id), i.id, 0
      	from aim.item.tbl i
      	where detailid in (select id from @tree)
      ),
      derivedattr (level, ItemID, NameID, AttributeName, Value, LinkID, isOwnProperty) as (
      	select s.level, s.id, a.NameID, a.AttributeName, a.Value, a.LinkID, null
      	from attributes a
      	inner join src s on a.ItemID = s.srcid
      	left outer join itemattr ia on ia.itemId = s.id and ia.nameId = a.nameId
      	where ia.itemId is null
      )
      select * from itemattr
      union select * from detailattr
      union select * from derivedattr
      order by level desc
    ");
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->id} = $row = (object)array_filter(itemrow($row),function ($v){return !is_null($v);});
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      // $items->{$row->ItemID}->{$row->AttributeName} = $row;
      $items->{$row->ItemID}->{$row->AttributeName} = $row->Value;
    }
    header('Content-type: application/json');
    die(json_encode(['value'=>array_values((array)$items)], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
  }

  public function _camfile () {
  	// debug($_GET);
  	return sqlsrv_fetch_object(aim()->query(
  		"SELECT TOP 1 filename,startDateTime,camId
  		FROM aimhis.dbo.camfile
  		WHERE camId = %d AND startDateTime < %s
  		ORDER BY startDateTime DESC",
  		$_GET['camId'],
  		urldecode($_GET['startDateTime'])
  	));
  	// debug($row);
  }
  /** @function request_type_uploadfile
  * Nodig voor aliconnect upload file
  * url 'http://alicon.nl/v1/api?request_type=uploadfile'
  * @param src url of file
  * @param data base64 encode content of file
  */
  public function _mailtest() {
  	aim()->mail([
  		// 'send'=> 1,
  		'to'=> "max.van.kampen@outlook.com",
  		'bcc'=> "max.van.kampen@alicon.nl",
  		// 'Subject'=> __('qr_registratie'),
  		'chapters'=> [
  			['title'=> 'test']
  		],
  	]);
  	debug (1);
  }

  private function _corona_list ($filter) {
		if (empty(aim()->auth->id)) throw new Exception('Unauthorized', 401);
		$res = aim()->query(
			"SELECT R.email, C.email owner_email, R.data, R.departure FROM aimhis.corona.reg R INNER JOIN aimhis.dbo.qr AS C ON C.code = R.code WHERE C.email = '%s'",
			aim()->auth->id['email']
		);
		$rows=[];
		while ($row = sqlsrv_fetch_object($res)) {
			$data = json_decode($row->data);
			$data->departure = $row->departure;
			$rows[] = $data;
		}
		return $rows;
	}
  public function _my_corona_list () {
		return $this->corona_list("C.email = '%s'");
	}
  public function _my_corona_contact_list () {
		return $this->corona_list("R.email = '%s'");
	}

}

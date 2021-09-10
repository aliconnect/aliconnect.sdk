<?php
namespace Aliconnect\Server\Data;

use function \Aliconnect\debug;
use function \Aliconnect\http_response;
use Aliconnect\Server\Data\Item;
use function \Aliconnect\get_sql_exec;

function create_sub_object($obj, $name) {
  return $obj->$name = isset($obj->$name) ? $obj->$name : (object)[];
}

function sql($qa) {
  return implode(PHP_EOL, $qa);
}

class Build extends \Aliconnect\Api {
  private function data_v1($params) {
    $id = $this->request('id', $params);
    $data = (object)[
      'hostID' => null,
      'rootID' => $id,
      'class' => null,
      'attributeName' => null,
      'items' => null,
    ];
    // $res = $this->sql_query("SELECT 1 AS a");
    $res = $this->sql_query("EXEC [item].[build_2to1] $id");
    while ($row = sqlsrv_fetch_object($res)) {
      // echo 'a';
      if ($row->classID === 0) {
        create_sub_object($json, 'class');
        $data->class->{$row->PrimaryKey} = $row->name;
      } else {
        create_sub_object($data, 'items');
        $data->items->{$row->PrimaryKey} = $row;
      }
    }
    $name = $data->items->{$id}->name ?: $data->items->{$id}->title;
    $date = date("Ymd-hi");
    sqlsrv_next_result($res);
    while($row=sqlsrv_fetch_object($res)){
      create_sub_object($data, 'attributeName');
      $data->attributeName->{$row->fieldID} = $row->name;
      if (isset($data->items->{$row->id})) {
        $data->items->{$row->id}->{$row->name} = $row;
      }
    }
    if(isset($_GET['download'])) {
      header("Content-disposition: attachment; filename=$id-data_v1.json");
    }
    http_response(200, $data);
  }
  private function data_clone($params) {
    $id = $this->request('id', $params);
    $data = [];
    $res = $this->sql_query("EXEC item.build_clonedata $id");
    while ($row = sqlsrv_fetch_object($res)) {
      $data[] = $row;
    }
    http_response(200, $data);
  }
  /**
  * Opbouwen data voor nodejs control version 2
  */
  private function config_data($params) {
    $content = file_get_contents('php://input');
    if (isset($_GET['id'])) {
      $this->id = $_GET['id'];
    }
    else if (isset($this->access['sub'])) {
      $this->id = $this->access['sub'];
    }
    else if ($content) {
      $content = json_decode($content, true);
      if (isset($content['mac'])) {
        foreach ($content['mac'] as $mac_address => $mac_ip) {
          $mac_address = str_replace(":","-",$mac_address);
          $row = sqlsrv_fetch_object(aim()->sql_query(
            // DEBUG:
            // "SELECT * FROM auth.mac WHERE address = %s AND ip IS NULL",
            "SELECT * FROM auth.mac WHERE address = %s",
            $mac_address
          ));
          if (isset($row->ID)) {
            aim()->sql_query(
              "UPDATE auth.mac SET ip = %s WHERE ID = %d",
              $mac_ip,
              $row->ID
            );
            $this->id = $row->sub;
          }
        }
      }
    }
    $items = (object)[];
    $res = $this->sql_query($q = "EXEC item.build_data $this->id");
    while ($row = sqlsrv_fetch_object($res)) {
      $items->{$row->id} = (object)array_filter((array)$row);
    }
    sqlsrv_next_result($res);
    while ($row = sqlsrv_fetch_object($res)) {
      if (isset($items->{$row->id})) {
        $row = $items->{$row->id}->{$row->name} = (object)array_filter((array)$row);
        unset($row->id);
        unset($row->name);
      }
    }
    $data = (object)[
      'info'=>$this->api['info'],
      'components'=> $this->api['components'],
      'items'=> array_values((array)$items),
    ];
    if(isset($_GET['download'])) {
      header("Content-disposition: attachment; filename=$this->id-config_data.json");
    }
    http_response(200, $data);
  }
  private function xls_data($params) {
    ini_set('display_errors', 0);
    // error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
    // error_reporting(E_ALL & ~E_NOTICE);
    $id = $this->request('id', $params);
    $res = $this->sql_query("EXEC [item].[build] $id");
    while($row=sqlsrv_fetch_object($res)) {
      // $value[] = $items->{$row->ID} = array_filter($row, function($field){return field});
      $value[] = $items->{$row->ID} = (object)array_filter((array)$row);
    }
    sqlsrv_next_result($res);
    while (	$row = sqlsrv_fetch_object($res)) {
      if (isset($items->{$row->ItemID})) {
        $row = $items->{$row->ItemID}->{$row->AttributeName} = (object)array_filter((array)$row);
        unset($row->ItemID);
        unset($row->ID);
        unset($row->AttributeName);
      }
    }
    http_response(200, [
      'items'=> $value,
    ]);
  }
  private function _data($params) {
    $content = file_get_contents('php://input');
    // if (isset($_GET['sub'])) {
    //   $ID = $_GET['sub'];
    // }
    // else
    if (isset($_GET['id'])) {
      $this->id = $_GET['id'];
    }
    else if (isset($this->access['sub'])) {
      $this->id = $this->access['sub'];
    }
    else if ($content) {
      $content = json_decode($content, true);
      if (isset($content['mac'])) {
        foreach ($content['mac'] as $mac_address => $mac_ip) {
          $mac_address = str_replace(":","-",$mac_address);
          $row = sqlsrv_fetch_object(aim()->sql_query(
            // DEBUG:
            // "SELECT * FROM auth.mac WHERE address = %s AND ip IS NULL",
            "SELECT * FROM auth.mac WHERE address = %s",
            $mac_address
          ));
          if (isset($row->ID)) {
            aim()->sql_query(
              "UPDATE auth.mac SET ip = %s WHERE ID = %d",
              $mac_ip,
              $row->ID
            );
            $this->id = $row->sub;
          }
        }
      }
    }
    if (!$this->id) {
      throw new Exception('Unauthorized', 401);
    }
    $data = [
      'info'=>$this->api['info'],
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
    $res = $this->sql_query($q = "EXEC item.build_data $this->id");
    // die($q);
    $items = (object)[];
    while ($row = sqlsrv_fetch_object($res)) {
      $row->{'@id'} = "/$row->schema($row->ID)";
      $items->{$row->ID} = $row;
      if (isset($this->api->components->schemas->{$row->schema})) {
        $data['components']['schemas'][$row->schema] = $this->api->components->schemas->{$row->schema};
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
    http_response(200, $data);
    // header('Content-type: application/json');
    // // die(json_encode($data));
    // die(json_encode($data));
    // debug (1,$params);
  }
  private function doc($params) {
    http_response(204, 'UNDER CONSTRUCTION');
    debug('UNDER CONSTRUCTION');
    // om.js
    // ini_set('display_errors', 1);
    // error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
    // // error_reporting(E_ALL & ~E_NOTICE);

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
    http_response(200, $config);
    // header('Content-Type: application/json');
    // die(json_encode($config));

    // $path = $_SERVER['DOCUMENT_ROOT'].'/sites/aliconnect';
    // $config = yaml_parse_file($fname = $path.'/config.yaml');
    // $config['docs']['index'] = $body;
    // yaml_emit_file($fname, $config);
    // die(json_encode($items));
  }
  private function clone_data() {
    debug('UNDER CONSTRUCTION');
    // aim.js
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->sql_query("EXEC item.build_clonedata $id");
    // die("EXEC item.clone_data $id");
    $value=[];
    while ($row = sqlsrv_fetch_object($res)) {
      $value[] = $row;
    }
    header('Content-type: application/json');
    die(json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
  }
  private function tree() {
    debug('UNDER CONSTRUCTION');
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    $res = aim()->sql_query($q = "EXEC item.build_tree %d", $_GET['id']);

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
  private function data_node() {
    debug('UNDER CONSTRUCTION');
    debug(1);
    // debug(1, aim()->access);
    // gebruikt door node.js, opbouwen data voor node
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    // $sub = aim()->access['sub'];
    // $sub = $_GET['sub'];
    if (isset(aim()->access['sub'])) {
      $sub = aim()->access['sub'];
      $res = aim()->sql_query("EXEC [item].[build_node_data] $sub");
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
  private function _build_map() {
    // gebruikt door web.js, build_map opbouwen netwerk overzicht
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->sql_query("EXEC [item].[build_map] $id");
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
  private function link_data() {
    debug('UNDER CONSTRUCTION');
    // web.js, showLinks
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->sql_query("EXEC [item].[build_link_data] $id");
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
  private function breakdown() {
    debug('UNDER CONSTRUCTION');
    // web.js, item breakdown
    $id = preg_replace('/.*\((\d+)\).*/','$1',$_SERVER['REQUEST_URI']);
    $res = aim()->sql_query("EXEC [item].[build_breakdown] $id");
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

  private function clone_children($params) {
    $id = $this->request('id', $params);
    $data=[];
    $res = $this->sql_query($q = "SELECT * FROM item.selectChildren($id)");
    // http_response(200, $q);
    while ($row = sqlsrv_fetch_object($res)) {
      $data[] = $row;
    }
    http_response(200, $data);
  }

  public function getPathId($srcId, $path) {
    foreach ($path as $key) {
      // http_response(200, "SELECT childId AS id FROM item.children WHERE id=$srcId AND tag='$key'");
      $q = "SELECT childId FROM item.children WHERE itemId=$srcId AND item.pretag(childId)='$key'";
      // debug($q);
      $row = sqlsrv_fetch_object($this->sql_query($q));
      if (!$row) http_response(200, ['FOUT GEEN tag', $q, $path]);
      $srcId = $row->childId;
    }
    return $srcId;
  }
  public function get($params) {
    $response_type = $this->request('response_type', $params);
    $this->$response_type($params);
  }
  public function post($params) {
    $type = $this->request('data_type', $params);
    switch($type) {
      case 'prefix' : {
        $input = file_get_contents('php://input');
        $row = json_decode($input);
        // http_response(200, $row);
        $hostId = getallheaders()['Hostid'];
        $libRootId = 3490197;
        $q="DECLARE @id BIGINT, @childId BIGINT, @classId BIGINT;SELECT @id=$hostId\n";
        $qa="";
        $id = $hostId;
        $items=[];
        foreach ($row as $attributeName => $col) {
          if (isset($col->objectField)) {
            $tag = $col->value;
            $schemaname = isset($col->class) ? $col->class : $row->schema->value;
            // echo "Q=SELECT childId FROM item.children where id=$parentId AND tag='$tag'".PHP_EOL;
            $q = "DECLARE @id BIGINT;SET @id=$id;EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname', @hostId=$hostId;SELECT @id AS id";
            // http_response(200, $q);
            // echo PHP_EOL.$q.PHP_EOL."GO".PHP_EOL;
            $items[] = $item = sqlsrv_fetch_object($this->sql_query($q));
            $id = $item->id;
            // $q .= "EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname'\n";
          }
        }
        // http_response(200, [$row,$items]);
        $this->xls_data(["id"=>$id]);
      }
      case 'import' : {
        $input = file_get_contents('php://input');
        $row = json_decode($input);
        $hostId = getallheaders()['Hostid'];
        $libRootId = 3490197;
        // http_response(200, [$hostId, $input]);


        $q="DECLARE @id BIGINT, @childId BIGINT, @classId BIGINT;SELECT @id=$hostId\n";
        $qa="";
        $id = $hostId;
        foreach ($row as $attributeName => $col) {
          if (isset($col->tagfield)) {
            $tag = $col->value;
            $schemaname = isset($col->class) ? $col->class : $row->schema->value;
            // echo "Q=SELECT childId FROM item.children where id=$parentId AND tag='$tag'".PHP_EOL;
            $q = "DECLARE @id BIGINT;SET @id=$id;EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname', @hostId=$hostId;SELECT @id AS id";
            // http_response(200, $q);
            // echo PHP_EOL.$q.PHP_EOL."GO".PHP_EOL;
            $item = sqlsrv_fetch_object($this->sql_query($q));
            $id = $item->id;
            // $q .= "EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname'\n";
          } else {
            $qa .= "EXEC item.attr @itemId=@id, @name='$col->name', @value='$col->value'\n";
          }
        }
        if (isset($row->Typical) && $row->Typical->value) {
          $typical = explode('.', $row->Typical->value);
          $srcId = $this->getPathId($libRootId, $typical);
          $q = "EXEC item.attr @itemId=$id, @name='Src', @LinkId=$srcId";
          // echo PHP_EOL.$q.PHP_EOL."GO".PHP_EOL;
          $this->sql_query($q);
          // http_response(200, $q); // DEBUG:
          // http_response(200, [$typical,$srcId]); // DEBUG:
        }


        // $q .= $qa;
        // $q .= "SELECT @id";
        $q = implode(PHP_EOL, [
          "DECLARE @id BIGINT;SET @id=$id",
          $qa,
          // "SELECT @id AS id",
          // "SELECT * FROM item.vw WHERE id=@id"
        ]);
        // http_response(200, $q);
        $this->sql_query($q);
        // $row = sqlsrv_fetch_object($this->sql_query($q));
        // http_response(200, $row);
        $this->clone_children(["id"=>$id]);
        // $item = array_filter(sqlsrv_fetch_array($this->sql_query($q), SQLSRV_FETCH_ASSOC));
      }
      case 'clone' : {
        $content = file_get_contents('php://input');
        $content = json_decode($content);
        $q = "INSERT INTO item.dt DEFAULT VALUES;DECLARE @id BIGINT;SET @id = scope_identity();".PHP_EOL;
        foreach ($content AS $attributeName => $value) {
          $value = is_object($value) ? $value : (object)['value' => $value];
          $value->name = $attributeName;
          $q .= get_sql_exec("item.attr", $value).",@itemId=@id;".PHP_EOL;
        }
        $q .= "SELECT @id AS id;".PHP_EOL;
        $row = sqlsrv_fetch_object($this->sql_query($q));
        $this->clone_children($row);
        // http_response(200, $q);
        // $res = $this->sql_query($q);
        // $row = sqlsrv_fetch_object($res);
        // http_response(200, $row);
      }
      case 'attr' : {
        $_POST['value'] = $_POST['value'] ?: null;
        // http_response($_POST);
        $this->sql_exec("item.attr", $_POST);
      }
    }
  }
}

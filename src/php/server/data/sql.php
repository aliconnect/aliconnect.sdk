<?php
namespace Aliconnect\Server\Data;

use function Aliconnect\aim;

class Sql {
  public function query_items($client_id, $schema_name, $properties, $query, $params = null) {
    // $config = aim()->init_config($this->client_id);
    // $properties = $config['components']['schemas'][$this->schema_name]['properties'];
    $properties_keys = array_keys($properties);
    if (isset($params['$select']) && $params['$select'] !== '*') {
      $properties_keys = array_values(array_intersect($properties_keys, explode(',',$params['$select'])));
    }
    $properties_select = implode("','", $properties_keys);
    $res = aim()->sql_query($q = "
    SET NOCOUNT ON
    DECLARE @hostId BIGINT, @classId BIGINT
    SET @hostId = item.getId('$client_id')
    EXEC item.getClassID @hostId=@hostId, @schema='$schema_name', @ClassID=@ClassID OUTPUT

    DECLARE @T TABLE (ID BIGINT);
    $query
    --SELECT NULL AS [@id],*,item.schemaPath(id) AS [schema] FROM @T;
    SELECT NULL AS [@id],* FROM item.vw WHERE id IN (SELECT id FROM @T);
    WITH attr (id, name) AS ( SELECT id,name FROM attribute.name WHERE name IN ('$properties_select') )
    SELECT itemId,value,name,linkId,userId,data FROM attribute.dt A
    INNER JOIN attr ON attr.id = A.nameId --AND A.hostID = @hostId
    INNER JOIN @T items ON items.id = A.itemId
    ");
    // aim()->http_response(200, $q);


    $items = [];
    $values = [];
    while ($row = sqlsrv_fetch_object($res)) {
      $values[] = $items[$id = $row->ID] = $row;
      // $id = $row->ID
      // $uid = $row->{'@id'};
      // $row->Id = base64_encode("$id-$uid");
      // $row->{'@id'} = $id_path."/$schema_name($uid)";
      $row->{'@id'} = $_SERVER['HTTP_ORIGIN'] . "/$row->schema($row->ID)";
      // $row->{'@id'} = $_SERVER['HTTP_ORIGIN'] . $_SERVER['REQUEST_URI'];
      foreach($properties_keys as $key) {
        $row->$key = null;
      }
    }
    sqlsrv_next_result($res);
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);

    $headers['aim-version'] = '1.0';

    if (aim()->request('aim-version', $headers) === '1.0') {
      header("Aim-Version: 1.0");
      while ($row = sqlsrv_fetch_object($res)) {
        $items[$row->itemId]->{$row->name} = array_filter([
          'value'=> $row->value,
          'userId'=> $row->userId,
          'linkId'=> $row->linkId,
          'data'=> $row->data,
        ]);
      }
    } else {
      header("OData-Version: 4.0");
      while ($row = sqlsrv_fetch_object($res)) {
        $items[$row->itemId]->{$row->name} = $row->value;
        // $items[$row->itemId]->{$row->name} = array_filter([
        //   'value'=> $row->value,
        //   'userId'=> $row->userId,
        //   'linkId'=> $row->linkId,
        //   'data'=> $row->data,
        // ]);
      }
    }
    return $values;
  }




  public static $conn;
  public static $secret;

  public function __construct111($query = null)
  {
    $this->connect();
    if ($query) {
      $this->sql_query($query);
    }
    // // new \Aliconnect\Debug($secret['config']['dbs']);
    // // // $this->dbconn =
  }
  public function connect() {
    if (!self::$conn) {
      $secret = yaml_parse_file(getcwd().'/../config/secret.yaml');
      $dbs = $secret['config']['dbs'];
      self::$conn = self::$conn ?: sqlsrv_connect($dbs['server'],[
        'Database' => $dbs['database'],
        'UID' => $dbs['user'],
        'PWD' => $dbs['password'],
        'ReturnDatesAsStrings' => true,
        'CharacterSet' => 'UTF-8'
      ]);
    }
  }
  public function query($query) {
    try {
			$query = (isset($nopre) ? '' : 'SET TEXTSIZE -1;SET NOCOUNT ON;').$query;
			$res = sqlsrv_query ( self::$conn, $query , null, ['Scrollable' => 'buffered']);
			return $res;
		} catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
			die();
		}
  }
}

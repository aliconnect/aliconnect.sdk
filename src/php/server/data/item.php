<?php
namespace Aliconnect\Server\Data;

use function \Aliconnect\attr;
use function \Aliconnect\http_response;

class Item extends \Aliconnect\Server\Api {
  public function sql_query_items($query, $params = null) {
    // http_response(200, json_encode($params, JSON_PRETTY_PRINT));
    // http_response(200, json_encode($this->schema['properties'], JSON_PRETTY_PRINT));

    // http_response(200);

    $this->properties = $this->properties ?: $this->schema['properties'];

    $properties_keys = array_keys($this->properties);

    if (isset($params['$select']) && $params['$select'] !== '*') {
      $properties_keys = array_values(array_intersect($properties_keys, explode(',',$params['$select'])));
    }
    $properties_select = implode("','", $properties_keys);
    $res = $this->sql_query($q = "
    SET NOCOUNT ON
    DECLARE @hostId BIGINT, @classId BIGINT
    SET @hostId = item.getId('$this->client_id')
    EXEC item.getClassID @hostId=@hostId, @schema='$this->schema_name', @ClassID=@ClassID OUTPUT

    DECLARE @T TABLE (ID BIGINT);
    $query
    --SELECT NULL AS [@id],*,item.schemaPath(id) AS [schema] FROM @T;
    SELECT NULL AS [@id],* FROM item.vw WHERE id IN (SELECT id FROM @T);
    WITH attr (id, name) AS ( SELECT id,name FROM attribute.name WHERE name IN ('$properties_select') )
    SELECT itemId,value,name,linkId,userId,data FROM attribute.dt A
    INNER JOIN attr ON attr.id = A.nameId --AND A.hostID = @hostId
    INNER JOIN @T items ON items.id = A.itemId
    ");
    // http_response(200, $q);


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

    if (attr('aim-version', $headers) === '1.0') {
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
  public function __construct($schema_name = null) {
    if ($schema_name) {
      $this->schema_name = $schema_name;
      $this->schema = $this->api['components']['schemas'][$schema_name];
    }
    // $this->client_id = aim()->config['client_id'];
    // self::$args['client_id'] = 'ja';
    // debug($schema_name);
    // debug($schema_name, $id);
    // $this->id = $id;
 	}
  public function get($params) {
    $id = $this->request('id', $params);
    $items = $this->sql_query_items(
      "INSERT INTO @T SELECT id FROM item.vw WHERE @classId = classId AND id = item.getId('$id')",
      $params
    );
    http_response(200, array_merge([
      '@context' => $this->context,
    ], isset($items[0]) ? (array)$items[0] : []));
    // debug(1, $headers);
    // debug($this->schema_name, $id);
    // check_argument($items, 412, 'ID NIET BESCHIKBAAR');
 	}
  public function children($params) {
    $id = $this->request('id', $params);
    $properties = $this->schema['properties'];
    $properties['header0'] = [];
    $this->properties = $properties;
    $params['$select'] = 'header0';
    $this->level = $this->level ?: 1;
    $filter = $this->filter . " AND level<$this->level";
    $items = $this->sql_query_items(
      "WITH P(level,id) AS (
        SELECT 0, item.getId('$id')
        UNION ALL
        SELECT Level+1,I.childId
        FROM P
        INNER JOIN item.children I
    		ON I.itemId = P.id AND hostId = @hostId $filter
      )
      INSERT INTO @T SELECT id FROM P WHERE Level>0",
      $params
    );
    http_response(200, [
      '@context' => $this->context,
      'Children' => $items,
    ]);
 	}
  public function search($params) {
    $items = $this->sql_query_items("classID = @classId", $params);
    http_response(200, [
      '@context' => $this->context,
      '@ms'=>round(microtime(true)*1000-__startTime),
      'values'=>$items,
    ]);
  }
}

// die(json_encode([class_exists('item'),class_exists('\item'),class_exists('\item\item')]));

<?php
namespace Aim\Dms;

class Me extends \Aim\Item {
  public function __construct() {
    $this->client_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
    $this->schema_name = 'Contact';
    $this->schema = $this->config['components']['schemas'][$this->schema_name];
    header("OData-Version: 4.0");
  }
  public function get($params) {
    $id = $this->sub;
    $items = $this->sql_query_items("INSERT INTO @T SELECT id FROM item.dt WHERE classId = @classId AND id = $id");
    http_response(200, array_merge([
      '@context' => $this->context,
    ], (array)$items[0]));
  }
}
// die(json_encode([class_exists('item'),class_exists('\item'),class_exists('\item\item')]));

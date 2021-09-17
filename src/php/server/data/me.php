<?php
namespace Aliconnect\Server\Data;

use function Aliconnect\aim;
// use Aliconnect\Server\Data\Item;
use Aliconnect\Server\Data\Sql;

class Me {
  // public function __construct() {
  //   $this->client_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
  //   $this->schema_name = 'Contact';
  //   $this->schema = $this->config['components']['schemas'][$this->schema_name];
  //   $config = aim()->init_config(aim()->request('client_id'), $param);
  //   header("OData-Version: 4.0");
  // }
  public function get($params) {
    $sql = new Sql;
    // $client_id = aim()->client_id;
    $client_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
    $schema_name = 'Contact';

    $access = aim()->access();
    $sub = $access['sub'];
    $items = $sql->query_items(
      aim()->client_id,
      $schema_name,
      aim()->api['components']['schemas'][$schema_name]['properties'],
      "INSERT INTO @T SELECT id FROM item.dt WHERE classId = @classId AND id = $sub"
    );
    header("OData-Version: 4.0");
    aim()->http_response(200, array_merge([
      '@context' => aim()->context(),
    ], (array)$items[0]));
  }
}
// die(json_encode([class_exists('item'),class_exists('\item'),class_exists('\item\item')]));

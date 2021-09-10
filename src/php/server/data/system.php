<?php
namespace Aliconnect\Server\Data;

class System extends \Aim {
  public function getPathId($srcId, $path) {
    foreach ($path as $key) {
      // http_response(200, "SELECT childId AS id FROM item.children WHERE id=$srcId AND tag='$key'");
      $row = sqlsrv_fetch_object($this->sql_query($q = "SELECT childId AS id FROM item.children WHERE id=$srcId AND item.pretag(childId)='$key'"));
      if (!$row) http_response(200, ['FOUT GEEN tag', $q, $path]);
      $srcId = $row->id;
    }
    return $srcId;
  }

}

// die(json_encode([class_exists('item'),class_exists('\item'),class_exists('\item\item')]));

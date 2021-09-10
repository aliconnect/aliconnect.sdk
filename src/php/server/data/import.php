<?php
// namespace Aliconnect\Server\Data;
//
// use function \Aliconnect\debug;
// use function \Aliconnect\http_response;
//
// class Import extends \Aliconnect\Api {
//   public function getPathId($srcId, $path) {
//     foreach ($path as $key) {
//       // http_response(200, "SELECT childId AS id FROM item.children WHERE id=$srcId AND tag='$key'");
//       $q = "SELECT childId FROM item.children WHERE itemId=$srcId AND item.pretag(childId)='$key'";
//       // debug($q);
//       $row = sqlsrv_fetch_object($this->sql_query($q));
//       if (!$row) http_response(200, ['FOUT GEEN tag', $q, $path]);
//       $srcId = $row->childId;
//     }
//     return $srcId;
//   }
//   public function post($params) {
//     // http_response_code(200);
//
//     // debug('NOT IMPLEMENTED');
//
//     $input = file_get_contents('php://input');
//     $row = json_decode($input);
//     $hostId = getallheaders()['Hostid'];
//     $libRootId = 3490197;
//     // http_response(200, [$hostId, $input]);
//
//
//     $q="DECLARE @id BIGINT, @childId BIGINT, @classId BIGINT;SELECT @id=$hostId\n";
//     $qa="";
//     $id = $hostId;
//     foreach ($row as $attributeName => $col) {
//       if (isset($col->tagfield)) {
//         $tag = $col->value;
//         $schemaname = isset($col->class) ? $col->class : $row->schema->value;
//         // echo "Q=SELECT childId FROM item.children where id=$parentId AND tag='$tag'".PHP_EOL;
//         $q = "DECLARE @id BIGINT;SET @id=$id;EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname';SELECT @id AS id";
//         // http_response(200);
//         $item = sqlsrv_fetch_object($this->sql_query($q));
//         $id = $item->id;
//         // $q .= "EXEC item.getChild @id=@id OUTPUT, @tag='$tag', @schema='$schemaname'\n";
//       } else {
//         $qa .= "EXEC item.attr @itemId=@id, @name='$col->name', @value='$col->value'\n";
//       }
//     }
//     if (isset($row->Typical) && $row->Typical->value) {
//       $typical = explode('.', $row->Typical->value);
//       $srcId = $this->getPathId($libRootId, $typical);
//       $q = "EXEC item.attr @itemId=$id, @name='Src', @LinkId=$srcId";
//       $this->sql_query($q);
//       // http_response(200, $q); // DEBUG:
//       // http_response(200, [$typical,$srcId]); // DEBUG:
//     }
//
//
//     // $q .= $qa;
//     // $q .= "SELECT @id";
//     $q = "DECLARE @id BIGINT;SET @id=$id;\n".$qa."\nSELECT * FROM item.vw WHERE id=@id";
//     http_response(200, $q);
//     $item = array_filter(sqlsrv_fetch_array($this->sql_query($q), SQLSRV_FETCH_ASSOC));
//     http_response(200, $item);
//   }
//
// }

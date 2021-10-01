<?php
namespace Aim\Tools;

class Dir {
  public function get() {
    header('Content-Type: application/json');
    echo json_encode(scandir($_SERVER['DOCUMENT_ROOT'].dirname($_GET['fn'])));
  }
}

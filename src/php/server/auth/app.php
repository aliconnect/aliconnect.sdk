<?php
namespace Aliconnect\Server\Auth;

use Aliconnect\Aim;

class App {
  public function get() {
    if ($_GET['prompt'] !== 'login') {
      $_GET['prompt'] = 'login';
      die(header("Location: ?".http_build_query($_GET)));
    }
    readfile(getcwd().'\/index.html');
    Aim::http_response(200);
  }
}

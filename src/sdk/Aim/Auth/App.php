<?php
namespace Aim\Auth;

class App {
  public function get() {
    if ($_GET['prompt'] !== 'login') {
      $_GET['prompt'] = 'login';
      die(header("Location: ?".http_build_query($_GET)));
    }
    readfile(getcwd().'\/index.html');
    http_response(200);
  }
}

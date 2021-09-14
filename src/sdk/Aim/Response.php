<?php
namespace Aliconnect;

class Response {
  public function __construct($body = null) {
    $this->json($body);
  }
  public function json($body = null) {
    $this->header('Content-Type', 'application/json');
    die(json_encode($body));
  }
  public function header($selector, $content = null) {
    if ($content) {
      // $this->allow_origin('*');
      header("Access-Control-Expose-Headers: $selector");
      header("$selector: $content");
    } else {
      header("Access-Control-Allow-Headers: $selector");
      $headers = getallheaders();
      return isset($headers[$selector]) ? $headers[$selector] : null;
    }
  }
}

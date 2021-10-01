<?php
namespace Aim;

class Config {
  public function get() {
    header('Access-Control-Allow-Origin: *');
    $config = aim()->config;
    $headers = getallheaders();
    $accept = request('Accept', $headers);
    // debug($accept, $headers);
    if (str_contains($accept, 'javascript')) {
      header('Content-Type: text/javascript');
      http_response(200, 'aimConfig='.json_encode(aim()->config));
    }
    if (str_contains($accept, 'yaml')) {
      header('Content-Type: text/yaml');
      http_response(200, yaml_emit(aim()->config));
    }
    if (str_contains($accept, 'json')) {
      http_response(200, $config);
    }
    http_response(200, $config);
  }
}

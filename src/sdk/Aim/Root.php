<?php
namespace Aim;

class Root extends \Aim {
  public function config($param) {
    $config = $this->init_config($this->request('client_id'), $param);
    if (isset($param['accept'])) {
      if ($param['accept'] === 'text/yaml') {
        header('Content-Type: text/yaml');
        http_response(200, yaml_emit($config));
      } else if ($param['accept'] === 'text/javascript') {
        header('Content-Type: text/javascript');
        http_response(200, 'aimConfig='.json_encode($config));
      }
    }
    http_response(200, $config);
    // http_response(501, $this->config); // DEBUG:
  }
  public function get($param) {
    // $client_id = $this->request('client_id');
    // $account_id = $this->request('account_id');
    // $scopes = $this->get_granted_scopes($client_id, $account_id);

    // $scopes = ['admin.write']; // DEBUG:

    // $this->init_config($client_id);
    // $this->init_api($scopes);
    $body = $this->api;
    if (isset($param['accept'])) {
      if ($param['accept'] === 'text/yaml') {
        $body = yaml_emit($body);
        {$body = str_replace('!php/object "O:8:\"stdClass\":0:{}"', "{}", $body);
        }
        header('Content-Type: text/yaml');
      }
    }
    http_response(200, $body);
  }
  public function post($param) {
    // if (!$this->jwt->valid()) error(401);
    $content = file_get_contents('php://input');
    try {
      $data = yaml_parse($content);
      if ($data['client_id']) {
        file_put_contents($fname = $this->root."/config/$data[client_id].yaml", file_get_contents('php://input'));
      }
      echo "Saved $fname";
    } catch (Exception $e) {
      echo 'Caught exception: ',  $e->getMessage(), "\n";
    }
    die();
  }
}

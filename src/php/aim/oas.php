<?php
namespace Aim;

class Oas {
  public function __construct() {
    // debug(1);
    $headers = getallheaders();
    $accept = request('Accept', $headers);
    $config = aim()->config;
    $data = aim()->oas;
    // $data = aim()->config;
    switch (request('response_type', $_GET)) {
      case 'config': {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
          $input = file_get_contents('php://input');
          $new_config = yaml_parse($input);
          if (!empty($new_config['client']['client_id']) && !empty($new_config['client']['client_secret'])) {
            if ($new_config['client']['client_id'] !== $config['client']['client_id']) http_response(401);
            if ($new_config['client']['client_secret'] !== $config['client']['client_secret']) http_response(401);
            if (empty($new_config['last_modified'])) {
              $new_config = yaml_parse_file(aim()->config_filename);
              $new_config = array_replace_recursive(yaml_parse_file($_SERVER['DOCUMENT_ROOT']."/../config/getstarted.yaml"),$new_config);
            }
            $new_config['last_modified'] = date('Y-m-d\TH:i:s');
            if (!empty($new_config['components']['schemas']['Contact']) && !is_array($new_config['components']['schemas']['Contact'])) {
              $new_config = array_replace_recursive($new_config,yaml_parse_file(__DIR__."/../../../config/schemas/Contact.yaml"));
              // $new_config['components']['schemas']['Contact']
            }
            yaml_emit_file(aim()->config_filename, $new_config);
            http_response(200, $new_config);
          }
          if (empty($new_config['client']['client_id'])) {
            $new_config = array_replace_recursive([
              'info'=>[
                'name'=> null,
                'contact'=> [
                  'email'=> null,
                  // 'phone_number'=> null,
                ],
              ],
              'client'=>[
                'client_id'=> '',
                'client_secret'=> '',
              ],
            ],$new_config);
            $name = $new_config['info']['name'] = $new_config['info']['name'] ?: null;
            $email = $new_config['info']['contact']['email'] = $new_config['info']['contact']['email'] ?: null;
            // $phone_number = $new_config['info']['contact']['phone_number'] = $new_config['info']['contact']['phone_number'] ?: null;

            if ($name && $account = sqlsrv_fetch_object(aim()->sql_query("EXEC account.get @hostname='$name'"))) {
              $new_config['info']['name'] = '  Ingevoerde naam is reeds in gebruik  ';
              http_response(200, $new_config);
            }
            if (!$email) {
              $new_config['info']['contact']['email'] = null;
              http_response(200, $new_config);
            }
            // if (!$phone_number) {
            //   $new_config['info']['contact']['phone_number'] = null;
            //   http_response(200, $new_config);
            // }
            // $new_config['info']['contact']['emailCode'] = null;
            // $new_config['info']['contact']['smsCode'] = null;
            // http_response(200, $new_config);
            // aim()->mail([
            //   'to'=> $accountname,
            //   'bcc'=> 'max.van.kampen@alicon.nl',
            //   'chapters'=> [["title"=>"code $code"]],
            // ]);
            $accountname = $email;
            $account = sqlsrv_fetch_object(aim()->sql_query("EXEC account.get @accountname='$accountname'"));
            if (empty($account)) {
              // aanmaken
              // http_response(200, $new_config);
            }
            $accountId = $account->accountId;
            if (empty($new_config['info']['contact']['emailCode'])) {
              $new_config['info']['contact']['emailCode'] = null;
              aim()->attr($account->accountId, 'code', $code = rand(10000,99999));
              aim()->mail([
                'to'=> $accountname,
                'bcc'=> 'max.van.kampen@alicon.nl',
                'chapters'=> [["title"=>"code $code"]],
              ]);
              http_response(200, $new_config);
              // http_response(200, ['msg'=>'Code verstuurd']);
            }
            $code = $new_config['info']['contact']['emailCode'];
            $account = sqlsrv_fetch_object(aim()->sql_query("EXEC account.get @accountname='$accountname', @code='$code'"));
            if (!$account->code_ok) {
              $new_config['info']['contact']['emailCode'] = '  Code ongeldig of verlopen  ';
              aim()->attr($account->accountId, 'code', $code = rand(10000,99999));
              aim()->mail([
                'to'=> $accountname,
                'bcc'=> 'max.van.kampen@alicon.nl',
                'chapters'=> [["title"=>"code $code"]],
              ]);
              http_response(200, $new_config);
            }
            // aim()->sql_query("INSERT INTO item.dt (classId,userId,ownerId,hostId,keyname)VALUES(1002,$accountId,$accountId,1,'$domain')");
            $account = sqlsrv_fetch_object(aim()->sql_query(
              "INSERT INTO item.dt (secret,classId,userId,ownerId,hostId,keyname)VALUES(newid(),1002,$accountId,$accountId,1,'$name');
              EXEC account.get @hostname='$name', @accountname='$accountname'"
            ));
            $new_config['client']['client_id'] = $account->client_id;
            $new_config['client']['client_secret'] = $account->client_secret;
            unset($new_config['info']['contact']['emailCode']);
            // $new_config = array_replace_recursive(yaml_parse_file($_SERVER['DOCUMENT_ROOT']."/../config/config.yaml"),$new_config);
            yaml_emit_file($_SERVER['DOCUMENT_ROOT']."/../config/client/".$account->client_id.".config.yaml", $new_config);
            http_response(200, $new_config);
            debug($account);



            aim()->mail([
              'to'=> $accountname,
              'bcc'=> 'max.van.kampen@alicon.nl',
              'chapters'=> [["title"=>"code 1"]],
            ]);

            debug($new_config['info']['contact']['email']);

            //  // IN SQL CLIENT AANMAKEN!!!!
            $new_config['client_id'] = 'JAAA';
            http_response(200, $new_config);
          }
          http_response(200);
        }
        if (!request('client_secret', $_GET)) {
          $data = yaml_parse_file(aim()->default_config_filename);
        } else {
          if (request('client_secret', $_GET) !== $config['client_secret']) {
            http_response(401);
          }
          $data = $config;
        }
      }
    }
    if (request('response_type'))
    // header('Access-Control-Allow-Origin: *');
    // debug($accept, $headers);
    if (str_contains($accept, 'javascript')) {
      header('Content-Type: text/javascript');
      http_response(200, 'aimConfig='.json_encode($data));
    }
    if (str_contains($accept, 'yaml')) {
      header('Content-Type: text/yaml');
      http_response(200, yaml_emit($data));
    }
    // if (str_contains($accept, 'json')) {
    // }
    http_response(200, $data);
    // http_response(200, $config);
    // header('Content-Type: text/html');
    // readfile(__DIR__.'/oas/index.html');
    // echo "<data config='".json_encode($data)."'>";
  }
  public function get() {
  }
  public function post() {
  }
}

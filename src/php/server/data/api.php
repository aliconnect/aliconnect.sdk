<?php
namespace Aliconnect\Server\Data;

// die('a');
use function yaml_parse_file;
use \Aliconnect;
use function \Aliconnect\http_response;
use function \Aliconnect\debug;
use function \Aliconnect\json_parse_file;
use function \Aliconnect\attr;
use function \Aliconnect\aim_uid;
use \Aliconnect\Jwt as Jwt;


class Api extends \Aliconnect\Server\Api {
  public function __construct() {
    // http_response(200, []);
    $GLOBALS['aim'] = $this;
    if (!$this->initialized) {
      $this->initialized = true;
      // http_response_code(500);
      $this->mail_messages = [];
      $this->root = explode('\\vendor\\',__DIR__)[0];
      $this->secret = $this->secret ?: yaml_parse_file($this->root.'/config/secret.yaml');
      if (is_file($fname = $this->root."/config/$this->client_id.secret.json")) {
        $this->secret = array_replace_recursive($this->secret,json_parse_file($fname));
      }
      $this->request_url = parse_url($_SERVER['REQUEST_URI']);
      $this->pathname = $this->request_url['path'];
      $this->scopes = ['guest.read'];
      $this->client_id = attr('client_id', $_REQUEST);
      $this->account_id = attr('account_id', $_REQUEST);
      $headers = array_change_key_case(getallheaders(), CASE_LOWER);
      if ($authorization = attr('authorization', $headers)) {
        $access_token = trim(strstr($authorization, ' '));
        $jwt = new Jwt($access_token);
        $this->client_id = aim_uid($jwt->payload['client_id']);
        $scope = $this->request('scope', $jwt->payload);
        $this->sub = $this->request('sub', $jwt->payload);
        $this->scopes = explode(' ', $scope);
        // debug($client_id, $jwt);
      }



      $this->client_id = 'c52aba40-11fe-4400-90b9-cee5bda2c5aa';
      $this->scopes = ['guest.read','admin.write'];
      $this->sub = 265090;



      $this->init_config($this->client_id);
      $this->init_api($this->scopes);
      // debug($this->api);
      $this->handle_api_call($this->pathname, $this->scopes);
    }
    $this->init();
  }
  public function init() {
    debug(2);
  //   http_response_code(500);
  //   // debug($this->root,$this->pathname);
  //   $client_id = $this->client_id;
  //   $account_id = $this->account_id;
  //   // $scopes = $this->get_granted_scopes($client_id, $account_id);
  //   $scopes = ['admin.write']; // DEBUG:
  //   $this->init_config($client_id);
  //   $this->init_api($scopes);
  //   $this->handle_api_call($this->pathname, $scopes);
  }
  public function archive_code() {
    // if (isset($_GET['sub'])) {
    //   $client = sqlsrv_fetch_object($this->sql_query('SELECT id,keyname FROM item.dv WHERE uid=%s', $this->client_id));
    //   // debug($client);

      $res = $this->sql_query(
        'SELECT * FROM attribute.dv WHERE nameId=2174 AND itemId=%d AND hostId=%d'
        ,$_GET['sub']
        ,$client->id
      );
      $scopes = [];
      $request_scopes = explode(' ', $_GET['scope']);
      while ($row = sqlsrv_fetch_object($res)) {
        foreach (explode(" ",$row->Value) as $grant_scope) {
          // $grant_scope = "$client->keyname.".$grant_scope;
          echo $grant_scope.PHP_EOL;
          foreach ($request_scopes as $request_scope) {
            if (strpos($grant_scope, $request_scope) === 0) {
              $scopes[] = $grant_scope;
            }
          }
        }
        // $row_scopes = "$client->keyname.".implode(" $client->keyname.",explode(" ",$row->Value));

        // $scopes[] = "$client->keyname.".implode(" $client->keyname.",explode(" ",$row->Value));
      }
      $scope = implode(' ',array_unique($scopes));
      // echo $scope.PHP_EOL;
      // debug(1);
      // debug($client->keyname, $scope, $_GET['scope']);
      // die();
    // }

    // $scopes = explode(' ', $_GET['scope']);
    // $scopes = explode(' ', $this->scope);
    // $this->scopes = ['item.write'];
  }





}

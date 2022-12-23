<?php
// chdir(__DIR__);
require_once("class/aim.php");
new Aim;

// function make_token($header, $payload, $secret) {
//   $header = json_base64_encode(json_encode(['typ'=>'JWT', 'alg'=>$aim->alg]));
// }
$aim->secret['config']['dbs']['database'] = 'auth';

$path = explode(dirname($_SERVER['URL']), parse_url($_SERVER['REQUEST_URI'])['path'])[1];

$ACCESS_TOKEN_LIFETIME = 3600;
// $ACCESS_TOKEN_LIFETIME = 30;
$account_table = "[auth].[dbo].[account]";
$user_get = "[auth].[dbo].[user_get]";
$aim->api();

// readfile('index.html');

// die('1a');

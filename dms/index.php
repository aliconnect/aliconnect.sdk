<?php
ini_set('display_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
header('Access-Control-Allow-Origin: *');
require_once('../../../autoload.php');
new \Aliconnect\Server\Data\Api;

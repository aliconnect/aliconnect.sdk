<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
require_once('../../../autoload.php');
use Aliconnect\Aim;
use function Aliconnect\sql_query;
sql_query('a');
// sql_query('b');
// new \Aliconnect\Server\Auth\Api;

<?php
namespace CrmConnect;

use function \Aliconnect\http_response;
use function \Aliconnect\debug;

class setup extends \Aliconnect\Api {
  public function post() {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    http_response(200, $_POST);
    $company_name = preg_replace("/ |-/","_",strtolower($_POST["company_name"]));
    // debug($company_name, $password, $_POST);
    $options = [
      "database"=> $db_name = "crmc_$company_name",
      "username"=> $user_name = $db_name."_user",
      "password"=> $password = uniqid(),
    ];
    $q="";
    $this->sql_query($q.="CREATE DATABASE [$db_name]");
    $this->sql_query($q.="CREATE LOGIN [$user_name] WITH PASSWORD=N'$password', DEFAULT_DATABASE=[$db_name], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF");
    $this->sql_query($q.="USE [$db_name]");
    $this->sql_query($q.="CREATE USER [$user_name] FOR LOGIN [$user_name]");
    $this->sql_query($q.="EXEC sp_addrolemember 'db_owner', '$user_name'");
    http_response(200, $q);

    http_response(200, $options);
    // header('Location: https://crmconnect.aliconnect.nl/setup/index.html');
    // die();
    // http_response(200, 'JA');
    // header('')
  }
}

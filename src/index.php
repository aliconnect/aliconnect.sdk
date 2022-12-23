<?php
require_once("class/aim.php");
$config = yaml_parse_file($_SERVER['DOCUMENT_ROOT'].'/../config/config.yaml');
new Aim($config);
$aim->api();

<?php
$parse_url = parse_url($_SERVER['REQUEST_URI']);
echo yaml_parse_file($_SERVER['DOCUMENT_ROOT'].$parse_url['path'].'.md');

<link href="../../dist/font/aliconnect-icon.css" rel="stylesheet" />
<link href="../../src/css/web.css" rel="stylesheet" />
<?php
$css = file_get_contents('aliconnect-icon.css');
$data = yaml_parse_file('aliconnect-icon.yaml');
foreach ($data as $groupName => $group) {
  echo "<h1>$groupName</h1>";
  echo "<nav style=flex-wrap:wrap>";
  foreach ($group as $name => $i) {
    echo "<button class='abtn $name' caption='$name'></button>";
    $css .= ".abtn.$name::before{content:'\\$i';}\n";
  }
  echo "</nav>";
}
file_put_contents("../../dist/font/aliconnect-icon.css", $css);

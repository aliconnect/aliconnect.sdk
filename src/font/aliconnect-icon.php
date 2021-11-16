<!-- <link href="/assets/css/aliconnect.css" rel="stylesheet" /> -->
<link href="../../src/font/aliconnect-icon.css" rel="stylesheet" />
<link href="../../src/css/web.css" rel="stylesheet" />
<style>
html {--basebg: white;--basefg: black;}body{padding: 20px;}
</style>
<?php
// $css = file_get_contents('aliconnect.css');
$css = '@font-face {
  font-family: "AliconnectIcon";
  src: url("aliconnect-icon.woff") format("woff"), url("aliconnect-icon.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}
[class^="icn-"] {
  font-family: AliconnectIcon;
  font-style: normal;
}
';
$data = yaml_parse_file('aliconnect-icon.yaml');

// foreach ($data as $name => $x) {
//   $data1->$x = $name;
// }
foreach ($data as $groupName => $group) {
  echo "<h1>$groupName</h1>";
  echo "<nav style=flex-wrap:wrap>";
  foreach ($group as $name => $i) {
    echo "<button class='abtn $name' caption='$name'></button>";
    $data1->{$i} = $name;
    // $data1->{$i} = $name;
    $css .= ".icn-$name::before,.abtn.$name::before{content:'\\$i';}\n";
  }
  echo "</nav>";
}

echo '<table>';
for ($x = 61440; $x <= 62894; $x++) {
  $data2->{dechex($x)} = $data1->{dechex($x)};
  echo "<tr><td style='font-family: AliconnectIcon'>&#$x</td><td>$x</td><td>".dechex($x)."</td><td>".$data1->{dechex($x)}."</td></tr>";
}

yaml_emit_file('aliconnect-icon-all.yaml', (array)$data2);
file_put_contents("../../src/font/aliconnect-icon.css", $css);

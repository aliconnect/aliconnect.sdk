<div><input></div>
<script>
document.querySelector('input').addEventListener('change', event => {
  if (event.target.value) {
    document.querySelectorAll('a').forEach(el => el.style = 'display:none');
    document.querySelectorAll(`[class*="${event.target.value}"]`).forEach(el => el.style = '');
  } else {
    document.querySelectorAll('a').forEach(el => el.style = '');
  }
  document.querySelectorAll(`[class*="_filled"]`).forEach(el => el.style = 'display:none');
})
</script>

<?php
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_startup_errors', true);
ini_set('display_errors', true);

$html = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aliconnect</title>
  <link rel="stylesheet" type="text/css" href="AliconnectIcons.css" />
  <style>
  * {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    position: relative;
    z-index: 0;
  }
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 10px 20px;
    _text-align: center;
  }
  .preview {
    width: 100px;
    display: inline-block;
    margin: 10px;
  }
  .preview .inner {
    display: inline-block;
    width: 100%;
    text-align: center;
    background: #f5f5f5;
    -webkit-border-radius: 3px 3px 0 0;
    -moz-border-radius: 3px 3px 0 0;
    border-radius: 3px 3px 0 0;
  }
  .preview .inner  {
    line-height: 85px;
    font-size: 40px;
    color: #333;
  }
  .label {
    display: inline-block;
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    font-size: 10px;
    font-family: Monaco, monospace;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: #ddd;
    -webkit-border-radius: 0 0 3px 3px;
    -moz-border-radius: 0 0 3px 3px;
    border-radius: 0 0 3px 3px;
    color: #666;
  }
  i{
    background: rgba(140,140,140,0.1);
  }
  nav {
    display: flex;
    flex-wrap: wrap;
  }
  a {
    flex: 0 0 350px;
  }
  li {
    line-height: 36px;
    display: block;
  }
  [class^="icn-"]:before, [class*=" icn-"]:before {
    font-size: 40px;
  }
  </style>
</head>
<body>
  <h1>AliconnectIcons</h1>
  <nav>
';
$css = '@font-face {
  font-family: "AliconnectIcons";
  src: url("./AliconnectIcons.woff?8df2fc6f5cf4edcd27e2a4083a05672b") format("woff"),
  url("./AliconnectIcons.ttf?8df2fc6f5cf4edcd27e2a4083a05672b") format("truetype");
}

.icn, [class^="icn-"], [class*=" icn-"] {
  background-color: inherit;
  color: inherit;
  border: none;
  border-radius: 0;
  display: flex;
  font: inherit;
  line-height: inherit;
  white-space: nowrap;
  outline: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  align-items: center;
  text-decoration: none;
}
.icn:before, [class^="icn-"]:before, [class*=" icn-"]:before {
  content: "";
  font-family: AliconnectIcons !important;
  font-style: normal;
  font-weight: normal !important;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 20px;
  text-align: center;

  color: var(--icn-color);
  direction: ltr;
}
';
$data = yaml_parse_file('./AliconnectIcons.yaml');
ksort($data);
// yaml_emit_file('./AliconnectIcons6.yaml', $data);
// $x = 57344;
foreach ($data as $name => $x) {
  // foreach ([$name.'_filled', $name] as $icn_name) {
    // $icons[$name] = $x;
    $hex = dechex($x);
    $css .= ".icn-{$name}:before { content: \"\\{$hex}\"; }".PHP_EOL;
    // $x++;
  // }
  $html .= "<a class=\"icon icn-{$name}\">{$name}</button>";
}
file_put_contents('./AliconnectIcons.css', $css);

file_put_contents('./AliconnectIcons.html', $html);
// exit($html);
readfile('./AliconnectIcons.html');
exit();

// for ($x = 61564+1; $x <= 62804; $x++) {
//   $icons[$x] = $x;
// }
// die(json_encode($icons));

$top = (object)[];

foreach ($icons as $name => $x) {
  $arr = explode("_",$name);
  $obj = $top;
  foreach ($arr as $key) {
    $last = $obj;
    $obj = $obj->{$key} = $obj->{$key} ?: (object)[];
  }
  $obj->icon_name = $name;
}
foreach ($icons as $name => $x) {
  if (is_string($x)) $hex = $x;
  else $hex = dechex($x);
  $css .= ".icn-{$name}:before { content: \"\\{$hex}\"; }".PHP_EOL;
  // $html .= "<div class=\"preview\"><span class=\"inner\"><i class=\"icn-{$name}\"></i></span><br><span class='label'>{$name}</span></div>".PHP_EOL;
  // $html .= "<button class=\"icn-{$name}\">{$name}</button>".PHP_EOL;
}

file_put_contents('./AliconnectIcons.json', json_encode($icons, JSON_PRETTY_PRINT));
file_put_contents('./AliconnectIcons.css', $css);


function make_list($obj) {
  global $html;
  unset($obj['icon_name']);
  if (!empty($obj)) {
    $html .= "<ul>";
    foreach ($obj as $key => $value) {
      // die(json_encode($key));

      $html .= "<li>";
      if ($value['icon_name']) {
        $html .= "<button class=\"icon icn-{$value['icon_name']}\">{$value['icon_name']}</button>";
      } else {
        $html .= $key;
      }
      if (is_array($value)) {
        // ksort($value);
        make_list($value);
      }
      $html .= "</li>";
    }
    $html .= "</ul>";
  }
}
$top = json_decode(json_encode($top), true);
// ksort($top);
make_list($top);
// die();


// die(json_encode($top,JSON_PRETTY_PRINT));





file_put_contents('./AliconnectIcons.html', $html);
readfile('./AliconnectIcons.html');

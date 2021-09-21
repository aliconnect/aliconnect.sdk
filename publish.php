<?php
ini_set('display_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
function compress_code ($content) {
  global  $no_space_chars;
  $content = implode(' ', array_filter( array_map( function($content){
    $content = trim($content);
    // $content = preg_replace('/\t/', '', $content);
    $content = preg_replace('/,\}/', '}', $content);
    return $content;
  }, explode("\n", $content) ), function($val){return trim($val)==='' ? false : true;}) );
  // $content = implode(' ', array_filter(explode(' ',$content), function($val){return trim($val)==='' ? false : true;}));
  $content = preg_replace("/ ($no_space_chars)/", "$1", $content);
  $content = preg_replace("/($no_space_chars) /", "$1", $content);
  $content = preg_replace("/,\}/", "}", $content);
  $content = preg_replace("/,\]/", "]", $content);
  return $content;
}
function compress_js($content) {
  $chars = str_split($content);
  $code = $s = '';
  for ($x = 0; $x <= count($chars); $x++) {
    if ($chars[$x] === '/') {
      if ($chars[$x+1] === '/' && $chars[$x-1] !== '\\') {
        for ($x; $x <= count($chars); $x++) {
          if ($chars[$x+1] === "\n") {
            break;
          }
        }
        continue;
      }
      if ($chars[$x+1] === '*') {
        for ($x; $x <= count($chars); $x++) {
          if ($chars[$x] === '/' && $chars[$x-1] === '*') {
            break;
          }
        }
        continue;
      }
      if ($chars[$x-1] === '(') {
        $s .= compress_code(trim($code));
        $code = '';
        // $code .= '<<<';
        $s .= $chars[$x];
        for ($x++; $x <= count($chars); $x++) {
          $s .= $chars[$x];
          if ($chars[$x] === '/' && ( $chars[$x-1] !== '\\' || ( $chars[$x-1] === '\\' && $chars[$x-2] === '\\' ))) {
            // $code .= '>>>';
            break;
          }
        }
        continue;
      }
    }
    if (in_array($chars[$x], ['"','`',"'"])) {
      $s .= compress_code(trim($code));
      $code = '';
      // $s .= '<<<';
      $s .= $chars[$x];
      $b = $chars[$x];
      for ($x++; $x <= count($chars); $x++) {
        $s .= $chars[$x];
        if ($chars[$x] === $b && ($chars[$x-1] !== '\\' || $chars[$x-2] === '\\') ) {
          // $s .= '>>>';
          break;
        }
      }
      continue;
    }
    $code .= $chars[$x];
  }
  $s .= compress_code($code);
  // $s = preg_replace("/console.debug\(.*?\);/", "", $s);
  // $s = preg_replace("/console.log\(.*?\);/", "", $s);
  $s = preg_replace("/;\}/", "}", $s);
  $s = preg_replace("/,\)/", ")", $s);
  $s = preg_replace("/,\)/", ")", $s);
  $s = preg_replace("/ \./", ".", $s);
  // die($s);
  return $s;
}
function compress_css($content) {
  $content = preg_replace('/  /', ' ', $content);
  $content = compress_js($content, ':|;|\{|\}');
  $content = str_replace("{ ", "{", $content);
  $content = preg_replace('/; /', ';', $content);
  // $content = str_replace("}","}\r\n", $content);
  return $content;
}


$di = new RecursiveDirectoryIterator('src');
foreach (new RecursiveIteratorIterator($di) as $filename => $file) {
  $destname = preg_replace('/^src/','dist', $filename);
  if (preg_match('/__/', $filename)) {
    continue;
  }
  if (preg_match('/\.js$/', $filename)) {
    $no_space_chars = ';|>|<|\*|\?|\+|\-|\&|:|,|!|=|\)|\(|\{|\}|\|';
    $content = file_get_contents($filename);
    $MTime = date('Y-m-d H:i:s', $file->getMTime());
    file_put_contents($destname, "/**\n  Last modified $MTime \n*/\n" . compress_js($content));
    echo "$filename $destname" . ' - ' . $file->getSize() . ' bytes' . date('Y-m-d H:i:s', $file->getMTime()) . PHP_EOL;
  }
  if (preg_match('/\.css$/', $filename)) {
    $no_space_chars = '\{|\}';
    $content = file_get_contents($filename);
    file_put_contents($destname, compress_css($content));
    echo "$filename $destname" . ' - ' . $file->getSize() . ' bytes <br/>' . PHP_EOL;
  }
}
die();




$sources = [
  // 'web',
  // 'om',
  // 'doc',
  'src/markdown/markdown',
];

foreach ($sources as $name) {
  if (is_file($fname = "$name.js")) {
    $content = file_get_contents($fname);
    file_put_contents("../$name/dist/$name.js", $content);
    file_put_contents("../$name/dist/$name.min.js", compress_js($content));
  }
  if (is_file($fname = "../$name/src/$name.css")) {
    $content = file_get_contents($fname);
    file_put_contents("../$name/dist/$name.css", $content);
    file_put_contents("../$name/dist/$name.min.css", compress_css($content));
  }
  echo compress_js($content);
}



die();




die(getcwd());
// error_reporting(E_ALL);

// function save ($name, $ext, $content) {
//   $version = $_GET['ver'] ?: 1;
//   // file_put_contents($fname = __DIR__."/../$ext/v$version.$name.debug.$ext", $content);
//   // file_put_contents($fname = __DIR__."/../$ext/$name.debug.$ext", $content);
//   // $content = str_replace(PHP_EOL,'',$content);
//   file_put_contents("$path/$name.$ext", $content);
//   if (!file_exists($path = __DIR__."/../v$version/$ext")) {
//     mkdir($path, 0777, true);
//   }
//   file_put_contents(__DIR__."/../$ext/$name.$ext", $content);
//   echo "saved v$version/$ext/$name.$ext\n";
// }

// $files = ['aim.js','web.js'];
// $content = '';
// $doc=[];
// foreach($files as $fname) {
//   $content = file_get_contents(__DIR__."/../js/$fname");
//   // $doc = [];
//   $lines = explode(PHP_EOL, $content);
//   $block=[];
//   for ($x = 0; $x <= count($lines); $x++) {
//     if (strstr($lines[$x], '/**')) {
//       // die($lines[$x]);
//       $block = [
//         'name'=>'',
//         'description'=>[],
//         'file'=> $fname,
//         'row'=> $x,
//       ];
//       for ($x; $x <= count($lines); $x++) {
//         $line = trim(strtok(strstr(trim($lines[$x]), ' '), '*/'));
//         // $line = trim($lines[$x]);
//
//         preg_match('/@(\w+)(.*)/', $line, $match);
//         if ($match) {
//           if ($match[1] === 'todo') {
//             $block['todo'][] = $todo = trim($match[2]);
//             $todos[] = [
//               'todo'=> $todo,
//               'src'=> $fname,
//               'row'=> $x+1,
//             ];
//           } else if ($match[1] === 'param') {
//             $arr = explode(' ', trim($match[2]));
//             $param=[];
//             // array_shift($arr);
//             // preg_match('/\{(\w+)\}\s(\w+)(.*)/', $line, $match);
//             // $block['param'][] = [
//             //   'class'=> $match[1],
//             //   'name'=> $match[2],
//             //   'description'=> trim($match[3]),
//             // ];
//             while ($value = array_shift($arr)) {
//               if (empty($param['class'])) {
//                 $param['class'] = $value;
//               } else if (empty($param['name'])) {
//                 $param['name'] = $value;
//               } else if (in_array($value, ['optional'])) {
//                 $param[$value] = true;
//               } else {
//                 $param['description'] = trim($value . ' ' . implode(' ', $arr));
//                 break;
//               }
//             }
//             $block['param'][] = $param;
//           } else {
//             $block[$match[1]] = trim($match[2]);
//           }
//         } else {
//           $block['description'][] = $line;
//         }
//         // $line = trim(strstr(trim($lines[$x]), ' '));
//         if (strstr($lines[$x], '*/')) {
//           $block['name'] = $block['name'] ?: trim($lines[$x+1]);
//           break;
//         }
//       }
//       // var_dump($block);
//       // die();
//
//       // $block = implode(PHP_EOL,$block);
//       $block['description'] = implode("\n", $block['description']);//trim(strtok(strstr($block['description'], ' '), '*/'));
//       $doc[] = $block;
//     }
//   }
//   // $docs[$fname] = $doc;
// }
//
// $path = $_SERVER['DOCUMENT_ROOT']."/docs/index/3-Develop/3-Use_the_API's/1-Javascript/";
// $md=[];
// foreach ($todos as $todo) {
//   $md[] = "1. ".$todo['todo'];
// }
// file_put_contents($name = $path."ToDo.md", implode(PHP_EOL,$md));
//
// $md=[];
// foreach ($doc as $chapter) {
//   $md[] = "# ".$chapter['name'];
//   $md[] = $chapter['description'];
// }
// file_put_contents($name = $path."aim$version.md", implode(PHP_EOL,$md));

// yaml_emit_file($name = __DIR__."/../js/aim$version.yml", [
//   'todo'=> $todos,
//   'api'=> $doc,
// ]);
// readfile($name);
// die();


// $files = ['web.src'];


// die (strstr('a.s.a.b','.'));
// $name = 'asdfas.js';
// die (strstr($name,'.') === '.js');

// die (json_encode($dir));




// $version = $_GET['ver'] ?: 1;
// $version = 1;
// $path = __DIR__."/../v$version";
// if (!file_exists($path)) {
//   mkdir($path, 0777, true);
// }

// die($path);

$no_space_chars_config = [
  'css'=> '\{|\}',
  'js'=> ';|>|<|\*|\?|\+|\-|\&|:|,|!|=|\)|\(|\{|\}|\|',
];
$params = [
  'css'=> [
    'web'=> ['web', 'icon'],
  ],
  'js'=> [
    'web'=> ['aim','markdown','qrcode','qrscan','web'],
  ]
];
$compressed_file = [];
foreach ($params as $ext => $dest_arr) {
  $no_space_chars = $no_space_chars_config[$ext];
  $func_name = "compress_$ext";
  // if (!file_exists("$path/$ext")) {
  //   mkdir("$path/$ext", 0777, true);
  // }
  // $arr = array_values(array_filter(scandir("../$ext"), function($name){ return strstr($name,'.') === ".".$GLOBALS['ext']; }));
  // foreach($arr as $name) {
  //   $input = file_get_contents(__DIR__."/../v0/$ext/$name.$ext");
  //   file_put_contents("$path/$ext/$name.$ext", $input);
  //   $compress = $func_name($input);
  //   file_put_contents("$path/$ext/$name-min.$ext", $compress);
  //   $content .= $compress;
  // }

  // $dir = array_filter(scandir("../$ext"), function($name,$ext){ die('a'.$ext); return strstr($name,'.') === ".$ext"; }, $ext);
  // die (json_encode($dir));
  // die($ext);

  foreach ($dest_arr as $dest_name => $arr) {
    $content = '';
    foreach($arr as $name) {
      // $input = file_get_contents(__DIR__."/..$ext/$name.$ext");
      if (empty($compressed_file[$name])) {
        $compressed_file["$name.$ext"] = $func_name(file_get_contents("../$ext/$name.$ext"));
        file_put_contents("../$ext/$name-min.$ext", $compressed_file["$name.$ext"]);
      }
      $content .= $compressed_file["$name.$ext"];
      // file_put_contents("$path/$ext/$name.$ext", $input);
      // $compress = $func_name($input);
      // file_put_contents("$path/$ext/$name-min.$ext", $compress);
    }
    file_put_contents("../$ext/$dest_name-min.$ext", $content);
    echo "saved $dest_name-min.$ext\n";
  }
}
//
//
// $files = ['web', 'icon'];
// $ext = 'css';
// $css = '';
// // $no_space_chars = ':|;|\{|\}';
//
// foreach($files as $name) {
//   $content = file_get_contents(__DIR__."/../$ext/$name.src.$ext");
//   save ($name, $ext, $css, $_GET['ver']);
//   $content = preg_replace('/  /', ' ', $content);
//   $content = compress($content, ':|;|\{|\}');
//   $content = preg_replace('/\{ /', '{', $content);
//   $content = preg_replace('/; /', ';', $content);
//   $css .= $content;
// }
// save ("web.min", $ext, $css, $_GET['ver']);
//
// $no_space_chars = ';|>|<|\*|\?|\+|\-|\&|:|,|!|=|\)|\(|\{|\}|\|';
// $ext = 'js';
// $files = [
//   'web'=> ['web'],
//   'web'=> ['aim','markdown','web','qrcode','qrscan'],
// ];

$fnames = [
  "../lib/go/release/go.js",
  "../lib/go/release/go.js",
  "../lib/three/three.min.js",
  "../lib/three/stats.min.js",
  "../lib/three/OrbitControls.js",
  "../lib/three/Projector.js",
  "../js/web-min.js",
  // __DIR__."/../lib/amcharts4/core.js",
  // __DIR__."/../lib/amcharts4/charts.js",
  // __DIR__."/../lib/amcharts4/animated.js",
];

foreach ($fnames as $fname) {
  $all .= file_get_contents($fname);
}

file_put_contents("../js/full-min.js", $all);
echo 'done '.date('Y-m-d H:i:s');

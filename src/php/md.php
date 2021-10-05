<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/../vendor/autoload.php');
$data = "";
$aim = aim();
$files = [
  $aim->request_path.'.md',
  "/$aim->hostname/$aim->hostname.github.io$aim->request_path.md",
  "/$aim->hostname$aim->request_path.md",
];
foreach ($files as $filename) {
  if (is_file($fname = $_SERVER['DOCUMENT_ROOT'].$filename)) {
    $data = [
      'md'=>file_get_contents($fname),
    ];
    // debug($fname);
    $data = base64_encode(json_encode($data));
    break;
  }
}
// debug($files);
// aim()->test = "/$aim->hostname/$aim->hostname.github.io/".$aim->request_path.'.md';
// aiminfo();
// phpinfo();

?><!DOCTYPE html>
<html>
<head>
  <title><?php echo basename($aim->request_path)?></title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.font@0.0.0/dist/aliconnect-icon.css" rel="stylesheet" />
  <!-- <link href="https://aliconnect.nl/assets/css/src/aliconnect.css" rel="stylesheet" /> -->
  <link href="/css/page.css" rel="stylesheet" />
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/jszip.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/xlsx.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/pdf.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/jspdf.debug.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/pdf-lib.js"></script>

  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/js/aim.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/js/web.js" libraries="md"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/js/aim/web/md.js"></script>
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/web.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/web/md.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/web/doc.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/web/markdown.css" rel="stylesheet" />
  <script src="/js/page.js"></script>
</head>
<body class="col">
  <data doc='<?php echo $data; ?>'></data>
  <nav><div id="nav-top"></div></nav>
  <header><div></div></header>
  <main class="row">
    <aside class="left"></aside>
    <section class="aco doc-content">
      <nav id="doc-nav"></nav>
      <header id="doc-header"></header>
      <article id="doc-content"></article>
    </section>
    <aside class="right"></aside>
  </main>
  <footer><div id="footer"></div></footer>
</body>
</html>

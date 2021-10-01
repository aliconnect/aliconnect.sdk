<!DOCTYPE html>
<html>
<head>
  <title>SDK MD 2</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.font@0.0.0/dist/aliconnect-icon.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/markdown.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/web.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/doc.css" rel="stylesheet" />
  <link href="https://aliconnect.nl/assets/css/src/aliconnect.css" rel="stylesheet" />
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/jszip.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/xlsx.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/pdf.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/jspdf.debug.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/dist/js/pdf/pdf-lib.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/js/aim.js"></script>
  <script src="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/js/aim/web.js"></script>
  <style>
  article li a{
    text-decoration: none;
    border-radius: 2px;
    padding: .1em .2em;
    margin: -.1em;
    color: #43853d;
  }
  article li a:hover{
    background-color: #43853d;
    color:white;
  }
  article ul>li{
    list-style: square outside;
  }
  section>header {
    margin-top: 50px;
  }
  @media print {
    nav,aside,button,#doc-header {
      display:none;
    }
  }
  </style>
</head>
<body class="col">
  <data doc='<?php $parse_url = parse_url($_SERVER['REQUEST_URI']);$data = ['md'=>file_get_contents($_SERVER['DOCUMENT_ROOT'].$parse_url['path'].'.md'),];$data = base64_encode(json_encode($data));echo $data; ?>'></data>
  <nav></nav>
  <main class="row">
    <aside class="right"><ul id="doc-list"></ul></aside>
    <section class="aco doc-content">
      <nav id="doc-nav"></nav>
      <header id="doc-header"></header>
      <article id="doc-content"></article>
    </section>
    <aside class="right"><ul id="doc-index"></ul></aside>
  </main>
  <footer>FOOTER</footer>
  <script>
  const data = JSON.parse(atob(document.querySelector('data').getAttribute('doc')));
  let body = data.md;
  const lastModified = '';
  $("doc-nav").text('').append(
    $('a').text('Home').href('/aliconnect/aliconnect.sdk/wiki/Home')
  );
  $("doc-header").text('').append(
    $('h1').text(document.title),
    // $('time').text('Laatst gewijzigd', lastModified.toLocaleDateString(), lastModified.toLocaleTimeString()),
  );

  $("doc-index").index("doc-content");

  $("doc-content").text('').append(aim.markdown().render(body));//.renderCode(e.target.responseURL);

  if (document.location.hash) {
    const hash = document.location.hash.substr(1);
    const anchor = (document.getElementsByName(hash)||[])[0];
    anchor.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  async function render(){
    if (sessionStorage.getItem('password')) {
      const config = await fetch('myconfig.php?password='+sessionStorage.getItem('password')).then(res => res.json());
      (function rep(cfg, path){
        Object.entries(cfg).forEach(([key,value]) => {
          if (typeof value === 'object') {
            rep(value, path.concat(key));
          } else {
            body = body.replace(`{${path.concat(key).join('.')}}`, `<span title="${value}">{${path.concat(key).join('.')}}</span>`);
          }
        });
      })(config, []);
      $("doc-content").text('').append(aim.markdown().render(body));//.renderCode(e.target.responseURL);
    }
  }
  function mdSignin(el){
    sessionStorage.setItem('password', el.value);
    render();
  }
  render();
  // load(document.location.pathname);
  // $().url('/api/Aim/Tools/Dir').query('fn', document.location.pathname).get().then(e => {
  //   const folders = {};
  //   const filename = document.location.pathname.split('/').pop();
  //   // console.log(filename);
  //
  //   e.body
  //   .filter(name => !name.match(/^\.|^_/))
  //   .filter(name => name.match(/\.md$/))
  //   .map(name => name.replace(/\.md$/, ''))
  //   // .map(name => Object({name: name, path: name.split(/-(?=[A-Z])/)}))
  //   .forEach(name => {
  //     var elem = $("doc-list");
  //     var link;
  //     name.split(/-(?=[A-Z])/).forEach(folder => {
  //       elem = elem[folder] = elem[folder] || $('ul').parent($('li').parent(elem).append($('a').attr('open', '0').text(folder)));
  //     });
  //     var link = elem.parentElement.children[0].href(name);
  //     if (name === filename) {
  //       for (var link; link; link = link.parentElement.parentElement.parentElement.children[0]) {
  //         link.attr('open', 1);
  //         if (!link.parentElement.parentElement.parentElement) break;
  //       }
  //     }
  //     // name = name.split(/-(?=[A-Z])/);
  //     // console.log(elem, name);
  //   })
  //   // console.log(e.body);
  //   // $("doc-list").append(
  //   //   e.body.map(name => $('li').append(
  //   //     $('a').href(name = name.replace(/\.md$/,'')).text(name.replace(/-/g, ' ')),
  //   //   ))
  //   // );
  //   // console.log(e.body);
  // });
  $(window).on('click', e => {
    if (e.target && e.target.hasAttribute('open')) {
      e.target.setAttribute('open', e.target.getAttribute('open') ^1)
    }
  })
  // $.initEvents();
  </script>
</body>
</html>

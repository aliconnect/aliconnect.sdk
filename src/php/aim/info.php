<?php
namespace Aim;

class Info {
  public function get() {
    ?><html xmlns="http://www.w3.org/1999/xhtml"><head>
      <style type="text/css">
      body {background-color: #fff; color: #222; font-family: sans-serif;}
      pre {margin: 0; font-family: monospace;}
      a:link {color: #009; text-decoration: none; background-color: #fff;}
      a:hover {text-decoration: underline;}
      table {border-collapse: collapse; border: 0; width: 934px; box-shadow: 1px 2px 3px #ccc;}
      .center {text-align: center;}
      .center table {margin: 1em auto; text-align: left;}
      .center th {text-align: center !important;}
      td, th {border: 1px solid #666; font-size: 75%; vertical-align: baseline; padding: 4px 5px;}
      h1 {font-size: 150%;}
      h2 {font-size: 125%;}
      .p {text-align: left;}
      .e {background-color: #ccf; width: 300px; font-weight: bold;}
      .h {background-color: #99c; font-weight: bold;}
      .v {background-color: #ddd; max-width: 300px; overflow-x: auto; word-wrap: break-word;}
      .v i {color: #999;}
      img {float: right; border: 0;}
      hr {width: 934px; background-color: #ccc; border: 0; height: 1px;}
      </style>
      <title>aliconnect/info</title><meta name="ROBOTS" content="NOINDEX,NOFOLLOW,NOARCHIVE" />
    </head>
    <body>
      <div class="center">
        <table>
          <tr class="h"><td>Aliconnect</td></tr>
        </table>
        <table>
          <tr><td class="e">IP</td><td class="v"><?php echo get_real_user_ip() ?></td></tr>
        </table>
      </div>
    </body></html><?php
  }
}

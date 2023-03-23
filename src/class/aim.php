<?php
// file_put_contents($_SERVER['DOCUMENT_ROOT']."/../logs/php_errors.log", '');
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_startup_errors', true);
ini_set('display_errors', true);
ini_set('display_errors', false);
ini_set('log_errors', true);

ini_set('mssql.textlimit', 2147483647);
ini_set('mssql.textsize', 2147483647);
sqlsrv_configure('ClientBufferMaxKBSize', 180240);
sqlsrv_configure("WarningsReturnAsErrors", 0);

define("__ROOT__",realpath(__DIR__."/.."));

require_once($_SERVER['DOCUMENT_ROOT']."/../vendor/autoload.php");

function shutdown() {
  foreach (Aim::$accounts as $account) {
    if (!empty($account->$chapters)) {
      Aim::mail([
        'prio'=> 2,
        'to'=> $account->$user['email'] ?: $account->$user['accountname'],
        'bcc'=> 'max.van.kampen@alicon.nl',
        'chapters'=> $account->$chapters,
      ]);
    }
  }
}
register_shutdown_function('shutdown');
function debug_log($s) {
  error_log(Aim::$user_ip." ".$s);
}

if (!function_exists('str_contains')) {
  function str_contains($haystack, $needle){
    return $haystack && $needle && strpos($haystack, $needle) !== false ? true : false;
  }
}

require_once(__DIR__."/odata.php");

class Account {
  // private static $SP_USER_GET = "[auth].[dbo].[user_get]";
  // private static $SELECT_CLIENT_USER = "SELECT id,client_id,account_id,scope_account FROM dbo.client_user WHERE client_id = @client_id AND account_id = @account_id";
  public $chapters = [];
  public $attachements = [];
  static $scopes_id = [
    "name",
    "given_name",
    "family_name",
    "middle_name",
    "nickname",
    "preferred_username",

    "email",
    "email_verified",
    "phone_number",
    "phone_number_verified",
    "gender",
    "birthdate",
    "zoneinfo",
    "locale",
    "address",
    "profile",
    "picture",
    "website",
    "unique_name",
    "updated_at",
  ];

  public function __construct ($options) {
    $this->options = $options;
    $this->get();
    Aim::$accounts[] = $this;
  }
  public function create() {
    $row = sql_fetch(sql_query([
      "SELECT id FROM dbo.account WHERE accountname = ?",
    ], [
      $this->options['accountname'],
    ]));

    if ($row) {
      http_response(401, "Dit account bestaat al");
    }
    $name = explode('.',explode('@',$this->options['accountname'])[0]);
    sql_query([
      "DECLARE @id UNIQUEIDENTIFIER = newid(), @client_id UNIQUEIDENTIFIER = ?, @accountname NVARCHAR(50) = ?",
      "INSERT INTO dbo.account(id,accountname,email,family_name,given_name,middle_name,name,updated_at)
      SELECT @id,@accountname,@accountname,?,?,?,?,GETDATE()",
      "INSERT INTO dbo.client_user(id,account_id,client_id) VALUES (newid(),@id,@client_id)",
    ], [
      $this->options['client_id'],
      $this->options['accountname'],
      $family_name = ucfirst(array_pop($name)),
      $given_name = ucfirst(array_shift($name)),
      $middle_name = implode(' ',$name),
      $name = implode(' ',array_filter([$given_name, $middle_name, $family_name])),
    ]);
    $this->get();
    $this->chapters[] = ['title'=>"Account aangemaakt",'content'=>"Uw account is aangemaakt"];
  }

  public function get_verify_code() {
    sql_query("UPDATE dbo.account SET verify_code_set = GETDATE(), verify_code = ? WHERE id = ?", [$code = rand(10000,99999),$this->user['account_id']]);
    return $code;
  }

  public function get() {
    global $aim;
    // http_response(404,Aim::$config);
    $this->user = sql_fetch(sql_query([
      "SET NOCOUNT ON; DECLARE
      @client_id UNIQUEIDENTIFIER = ?
      ,@accountname VARCHAR(50) = ?
      ,@account_id UNIQUEIDENTIFIER = ?
      ,@verify_code VARCHAR(50) = ?
      ,@password VARCHAR(50) = ?
      ,@code_id VARCHAR(50) = ?
      ",
      "SELECT TOP 1
      LOWER(client_user.id) AS id
      ,LOWER(client_user.code_id) AS code_id

      ,LOWER(client.id) AS client_id
      ,client.clientId AS clientId
      ,LOWER(client.client_secret) AS client_secret
      ,LOWER(COALESCE(client.azp,client.id)) AS azp
      ,LOWER(COALESCE(client.aud,LOWER(client.id))) AS aud
      ,LOWER(client.id) AS appid
      ,COALESCE(client.app_displayname,client.domain) AS app_displayname

      ,client_user.scope_account AS scope_account
      ,LOWER(client_user.id) AS sub

      ,LOWER(account.id) AS account_id
      ,account.updated_at
      ,account.accountname
      ,account.name
      ,account.given_name
      ,account.family_name
      ,account.middle_name
      ,account.nickname
      ,account.preferred_username
      ,account.unique_name
      ,account.email
      ,account.email_verified
      ,account.phone_number
      ,account.phone_number_verified
      ,account.gender
      ,account.birthdate
      ,account.zoneinfo
      ,account.locale
      ,account.address
      ,account.profile
      ,account.picture
      ,account.website
      ,account.verify_code
      ,account.verify_code_set

      -- ,account_id
      ,accept
      ,JSON_VALUE(accept, '$.scope') AS scope
      ,client_user.mse_access_token
      ,client_user.mse_id_token
      ,client_user.mse_refresh_token
      ,client_user.mse_access
      ,client_user.mse_id
      ,CASE WHEN account.password IS NOT NULL THEN 1 ELSE 0 END AS hasPassword

      ,PWDCOMPARE(@password,account.password) AS password_verified
      ,CASE WHEN verify_code = @verify_code THEN 1 ELSE 0 END AS verify_code_verified

      -- FROM dbo.client
      -- INNER JOIN dbo.client_user ON client_user.client_id = client.id AND client.id = @client_id
      -- INNER JOIN dbo.account ON account.id = client_user.account_id AND (account.accountname = @accountname OR client_user.code_id = @code_id)
      FROM dbo.account
      LEFT OUTER JOIN dbo.client ON client.id = @client_id
      LEFT OUTER JOIN dbo.client_user ON client_user.client_id = client.id AND client_user.account_id = account.id
      WHERE account.accountname = @accountname OR client_user.code_id = @code_id
      ",
    ], [
      $this->options['client_id'],
      $this->options['accountname'],
      $this->options['account_id'],
      $this->options['verify_code'],
      $this->options['password'],
      $this->options['code_id'],
    ]));
    // error_log(yaml_emit(['aaa',$this->user,$this->options]).PHP_EOL, 3, "\aliconnect\logs\account.yaml");

    // unset($this->user['password']);
  }
  public function add_user() {
    // http_response(400,1);
    $this->user = sql_fetch(sql_query([
      "SET NOCOUNT ON; DECLARE @client_id UNIQUEIDENTIFIER = ?, @account_id UNIQUEIDENTIFIER = ?",
      "INSERT INTO dbo.client_user (client_id,account_id) VALUES (@client_id, @account_id)",
      self::$SELECT_CLIENT_USER,
    ], [
      $this->options['client_id'],
      $this->account['id'],
    ]));
    $this->get();
  }
  public function set_account_scope() {
    $row = sql_fetch(sql_query([
      "EXEC aim1.account.get @hostname = ?, @accountname = ?",
    ], [$this->options['client_id'], $this->options['accountname']]));
    // http_response(200,$row);
    sql_query([
      "SET NOCOUNT ON",
      "DECLARE @client_id UNIQUEIDENTIFIER = ?",
      "DECLARE @hostname NVARCHAR(50) = ?",
      "DECLARE @client_secret UNIQUEIDENTIFIER = ?",
      "DECLARE @accountname VARCHAR(50) = ?",
      "DECLARE @account_id UNIQUEIDENTIFIER = ?",
      "DECLARE @scope_account VARCHAR(50) = ?",
      "DECLARE @password VARCHAR(50) = ?",
      "INSERT INTO dbo.client (id) SELECT (@client_id) WHERE @client_id NOT IN (SELECT id FROM dbo.client)",
      "INSERT INTO dbo.client_host (hostname,client_id) SELECT @hostname,@client_id WHERE NOT EXISTS (SELECT 0 FROM dbo.client_host WHERE hostname = @hostname)",
      "INSERT INTO dbo.account (accountname) SELECT (@accountname) WHERE @accountname NOT IN (SELECT accountname FROM dbo.account)",
      "UPDATE dbo.account SET id=COALESCE(id,@account_id,newid()), password=COALESCE(PWDENCRYPT(@password),password) WHERE accountname = @accountname",

      "SELECT @account_id = id FROM dbo.account WHERE accountname = @accountname",
      "INSERT INTO dbo.client_user (client_id,account_id) SELECT @client_id,@account_id
      WHERE NOT EXISTS(SELECT 0 FROM dbo.client_user WHERE client_id = @client_id AND account_id = @account_id)",
      "UPDATE dbo.client SET client_secret = @client_secret WHERE id = @client_id",
      "UPDATE dbo.client_user SET scope_account = @scope_account WHERE client_id = @client_id AND account_id = @account_id",
    ], [
      $this->options['client_id'],
      $this->options['hostname'],
      $row['client_secret'],
      $this->options['accountname'],
      $row['account_id'],
      $this->options['scope_account'],
      $this->options['password'],
    ]);
    $this->get();
  }
  public function mail($options) {
    Aim::mail ([
      // 'prio'=>2,
      'to'=> $this->user['email'],
      'bcc'=> 'max.van.kampen@alicon.nl',
      'chapters'=> $this->chapters,
      'attachements'=> $this->attachements,
    ]);

  }
  // public function set($set) {
  //   sql_query([
  //     "UPDATE dbo.client_user_view SET {$set} WHERE id = ?",
  //   ], [$this->user['id']]);
  //   $this->get();
  // }
  // public function setcode($code) {
  //   sql_query([
  //     "UPDATE dbo.account SET verify_code_set = GETDATE(),verify_code = ? WHERE id = ?",
  //   ], [$code, $this->user['account_id']]);
  //   $this->get();
  // }

}
class Schema {
  public function __construct($schemaName){
    $schemaname = strtolower($schemaName);
    $definitions = array_change_key_case(Aim::$config->definitions);
    $this->config = $definitions[$schemaname];
    if (empty($this->config)) return;
  }
  public function __get($selector) {
    if (key_exists($selector, $this->config)) {
      return $this->config[$selector];
    }
  }
  // public function patch() {
  //   sql_query($sql = [
  //     "SET DATEFORMAT DMY",
  //     "UPDATE [$client_id].[api].[{$schemaname}] SET $keys WHERE id = ?",
  //   ], $args);
  // }
}
class Config {
  public $config = [];
  public function get_client_config_json_filename() {
    return $_SERVER['DOCUMENT_ROOT']."/../config/.config.{$this->client_id}.json";
  }
  public function get_client_config_yaml_filename() {
    return $_SERVER['DOCUMENT_ROOT']."/../config/config.{$this->client_id}.yaml";
  }
  public function __get($selector) {
    if (key_exists($selector, $this->config)) {
      return $this->config[$selector];
    }
  }
  public function __construct ($config = null) {
    $this->initFiles([
      $_SERVER['DOCUMENT_ROOT']."/../config/config.server.yaml",
      $_SERVER['DOCUMENT_ROOT']."/../config/.config.server.yaml",
    ]);
    $this->init($config ?: $this->config);
  }
  public function init($config) {
    global $aim;
    if ($config['clientYaml']) {
      $configClientYaml = yaml_parse($config['clientYaml']);
      if (!$configClientYaml) error(400, 'Yaml parse error');
      $config = array_replace_recursive($config, $configClientYaml);
    }
    unset($this->config['client_id']);
    $client_id = $config['client_id'] ?: $config['clientId'] ?: $config['azp'] ?: $config['aud'];
    // $this->step = $client_id;

    if ($client_id) {
      // error(400,$config);
      $this->config['client_id'] = $client_id;
    }
    else if ($config['hostname']) {
      $row = sql_fetch(sql_query("SELECT TOP 1 LOWER(client_id) AS client_id FROM dbo.client_host WHERE hostname=?",[$config['hostname']]));
      if (empty($row)) return $this;
      $this->config = array_replace($this->config, $row);
    }
    else if ($config['domain']) {
      $row = sql_fetch(sql_query("SELECT TOP 1 LOWER(id) AS client_id, LOWER(owner_id) AS owner_id FROM dbo.client WHERE domain = ?",[$config['domain']]));
      if (empty($row)) return $this;
      $this->config = array_replace($this->config, $row);
    }
    else {
      $row = sql_fetch(sql_query([
        "SET NOCOUNT ON;DECLARE @ip VARCHAR(50) = ?",
        "SELECT TOP 1 LOWER(id) AS client_id,LOWER(client_secret) client_secret FROM dbo.client WHERE ip = @ip ORDER BY createdDateTime",
      ], [
        Aim::$user_ip,
      ]));
      $this->config['client_id'] = $row['client_id'];
      $this->config['secret']['client_secret'] = $row['client_secret'];
    }
    if ($this->client_id) {
      $this->initFiles([
        file_exists($this->get_client_config_json_filename()) ? $this->get_client_config_json_filename() : $this->get_client_config_yaml_filename()
      ]);
    }
    // error(400,[1,$config]);
    return $this;
  }
  public function initFiles($files){
    foreach ($files as $filename) {
      if (file_exists($filename)) {
        $this->config = array_replace_recursive($this->config, yaml_parse_file($filename)?:[]);
      }
    }
  }
  public function extend($config) {
    $this->config = array_replace_recursive($this->config, $config);
  }
  public function get($selector = null) {
    $config = $selector ? $this->config[$selector] : $this->config;
    unset($config['secret']);
    unset($config['private']);
    return $config;
  }
  public function json() {
    $config = $selector ? $this->config[$selector] : $this->config;
    if (empty($config['client_id'])) response(204);
    unset($config['secret']);
    unset($config['private']);
    unset($config['paths']);
    response(200, $config);
  }
  public function yaml() {
    header("Content-Type: text/yaml; charset=utf-8");
    if (file_exists($this->get_client_config_yaml_filename())) {
      readfile($this->get_client_config_yaml_filename());
    }
    exit();
  }
  public function zip() {
    $file = tempnam("tmp", "zip");
    $zip = new ZipArchive;
    if ($zip->open($file, ZipArchive::CREATE) === TRUE) {
      $zip->addEmptyDir('aliconnect');
      $zip->close();
      header('Content-Type: application/zip');
      header('Content-Length: ' . filesize($file));
      header('Content-Disposition: attachment; filename="file.zip"');
      readfile($file);
      unlink($file);
    }
    exit();
  }
  public function _zip() {
    $config = $this->config;
    $client_id = $config['client_id'];
    $domain = $config['domain'];
    $uid = uniqid();
    $body = [];
    if ($zip->open($zip_filename = "/aliconnect/public/shared/download/aliconnect-{$uid}.zip", ZipArchive::CREATE) === TRUE) {
      $files = [];
      $zip->addEmptyDir('aliconnect');
      $zip->addEmptyDir('aliconnect/config');
      $zip->addEmptyDir('aliconnect/public');
      if (in_array('aliconnector', $config['options'])) {
        $files[] = "aliconnect/bin/aliconnector.exe";
      }
      if (in_array('app', $config['options'])) {
        $files=array_merge($files,[
          'aliconnect/bin/notification_helper.exe',
          'aliconnect/bin/nw.exe',
          'aliconnect/bin/nw.dll',
          'aliconnect/bin/node.dll',
          'aliconnect/bin/nw_elf.dll',

          'aliconnect/bin/vulkan-1.dll',
          'aliconnect/bin/ffmpeg.dll',
          'aliconnect/bin/libEGL.dll',
          'aliconnect/bin/libGLESv2.dll',
          'aliconnect/bin/d3dcompiler_47.dll',
          'aliconnect/bin/vk_swiftshader.dll',
          'aliconnect/bin/swiftshader/libEGL.dll',
          'aliconnect/bin/swiftshader/libGLESv2.dll',

          'aliconnect/bin/resources.pak',
          'aliconnect/bin/nw_100_percent.pak',
          'aliconnect/bin/nw_200_percent.pak',
          'aliconnect/bin/icudtl.dat',
          'aliconnect/bin/v8_context_snapshot.bin',
          'aliconnect/bin/vk_swiftshader_icd.json',

          // 'bin/debug.log',
          // 'bin/credits.html',

          'aliconnect/bin/locales/am.pak',
          'aliconnect/bin/locales/am.pak.info',
          'aliconnect/bin/locales/ar-XB.pak',
          'aliconnect/bin/locales/ar-XB.pak.info',
          'aliconnect/bin/locales/ar.pak',
          'aliconnect/bin/locales/ar.pak.info',
          'aliconnect/bin/locales/bg.pak',
          'aliconnect/bin/locales/bg.pak.info',
          'aliconnect/bin/locales/bn.pak',
          'aliconnect/bin/locales/bn.pak.info',
          'aliconnect/bin/locales/ca.pak',
          'aliconnect/bin/locales/ca.pak.info',
          'aliconnect/bin/locales/cs.pak',
          'aliconnect/bin/locales/cs.pak.info',
          'aliconnect/bin/locales/da.pak',
          'aliconnect/bin/locales/da.pak.info',
          'aliconnect/bin/locales/de.pak',
          'aliconnect/bin/locales/de.pak.info',
          'aliconnect/bin/locales/el.pak',
          'aliconnect/bin/locales/el.pak.info',
          'aliconnect/bin/locales/en-GB.pak',
          'aliconnect/bin/locales/en-GB.pak.info',
          'aliconnect/bin/locales/en-US.pak',
          'aliconnect/bin/locales/en-US.pak.info',
          'aliconnect/bin/locales/en-XA.pak',
          'aliconnect/bin/locales/en-XA.pak.info',
          'aliconnect/bin/locales/es-419.pak',
          'aliconnect/bin/locales/es-419.pak.info',
          'aliconnect/bin/locales/es.pak',
          'aliconnect/bin/locales/es.pak.info',
          'aliconnect/bin/locales/et.pak',
          'aliconnect/bin/locales/et.pak.info',
          'aliconnect/bin/locales/fa.pak',
          'aliconnect/bin/locales/fa.pak.info',
          'aliconnect/bin/locales/fi.pak',
          'aliconnect/bin/locales/fi.pak.info',
          'aliconnect/bin/locales/fil.pak',
          'aliconnect/bin/locales/fil.pak.info',
          'aliconnect/bin/locales/fr.pak',
          'aliconnect/bin/locales/fr.pak.info',
          'aliconnect/bin/locales/gu.pak',
          'aliconnect/bin/locales/gu.pak.info',
          'aliconnect/bin/locales/he.pak',
          'aliconnect/bin/locales/he.pak.info',
          'aliconnect/bin/locales/hi.pak',
          'aliconnect/bin/locales/hi.pak.info',
          'aliconnect/bin/locales/hr.pak',
          'aliconnect/bin/locales/hr.pak.info',
          'aliconnect/bin/locales/hu.pak',
          'aliconnect/bin/locales/hu.pak.info',
          'aliconnect/bin/locales/id.pak',
          'aliconnect/bin/locales/id.pak.info',
          'aliconnect/bin/locales/it.pak',
          'aliconnect/bin/locales/it.pak.info',
          'aliconnect/bin/locales/ja.pak',
          'aliconnect/bin/locales/ja.pak.info',
          'aliconnect/bin/locales/kn.pak',
          'aliconnect/bin/locales/kn.pak.info',
          'aliconnect/bin/locales/ko.pak',
          'aliconnect/bin/locales/ko.pak.info',
          'aliconnect/bin/locales/lt.pak',
          'aliconnect/bin/locales/lt.pak.info',
          'aliconnect/bin/locales/lv.pak',
          'aliconnect/bin/locales/lv.pak.info',
          'aliconnect/bin/locales/ml.pak',
          'aliconnect/bin/locales/ml.pak.info',
          'aliconnect/bin/locales/mr.pak',
          'aliconnect/bin/locales/mr.pak.info',
          'aliconnect/bin/locales/ms.pak',
          'aliconnect/bin/locales/ms.pak.info',
          'aliconnect/bin/locales/nb.pak',
          'aliconnect/bin/locales/nb.pak.info',
          'aliconnect/bin/locales/nl.pak',
          'aliconnect/bin/locales/nl.pak.info',
          'aliconnect/bin/locales/pl.pak',
          'aliconnect/bin/locales/pl.pak.info',
          'aliconnect/bin/locales/pt-BR.pak',
          'aliconnect/bin/locales/pt-BR.pak.info',
          'aliconnect/bin/locales/pt-PT.pak',
          'aliconnect/bin/locales/pt-PT.pak.info',
          'aliconnect/bin/locales/ro.pak',
          'aliconnect/bin/locales/ro.pak.info',
          'aliconnect/bin/locales/ru.pak',
          'aliconnect/bin/locales/ru.pak.info',
          'aliconnect/bin/locales/sk.pak',
          'aliconnect/bin/locales/sk.pak.info',
          'aliconnect/bin/locales/sl.pak',
          'aliconnect/bin/locales/sl.pak.info',
          'aliconnect/bin/locales/sr.pak',
          'aliconnect/bin/locales/sr.pak.info',
          'aliconnect/bin/locales/sv.pak',
          'aliconnect/bin/locales/sv.pak.info',
          'aliconnect/bin/locales/sw.pak',
          'aliconnect/bin/locales/sw.pak.info',
          'aliconnect/bin/locales/ta.pak',
          'aliconnect/bin/locales/ta.pak.info',
          'aliconnect/bin/locales/te.pak',
          'aliconnect/bin/locales/te.pak.info',
          'aliconnect/bin/locales/th.pak',
          'aliconnect/bin/locales/th.pak.info',
          'aliconnect/bin/locales/tr.pak',
          'aliconnect/bin/locales/tr.pak.info',
          'aliconnect/bin/locales/uk.pak',
          'aliconnect/bin/locales/uk.pak.info',
          'aliconnect/bin/locales/vi.pak',
          'aliconnect/bin/locales/vi.pak.info',
          'aliconnect/bin/locales/zh-CN.pak',
          'aliconnect/bin/locales/zh-CN.pak.info',
          'aliconnect/bin/locales/zh-TW.pak',
          'aliconnect/bin/locales/zh-TW.pak.info',
        ]);
      }
      if (in_array('word-addin', $config['options'])) {
        $zip->addFromString("aliconnect/public/office/$domain-word.xml", preg_replace('/^ +/m', '', '<?xml version="1.0" encoding="utf-8"?>
        <OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="TaskPaneApp">
        <Id>'.$client_id.'</Id>
        <Version>1.0</Version>
        <ProviderName>Alicon</ProviderName>
        <DefaultLocale>NL-NL</DefaultLocale>
        <DisplayName DefaultValue="Aliconnect"/>
        <Description DefaultValue="Integrate with aliconnect web service"/>
        <IconUrl DefaultValue="https://aliconnect.nl/assets/img/favicon.png"/>
        <Hosts>
        <Host Name="Document"/>
        <Host Name="Workbook"/>
        </Hosts>
        <DefaultSettings>
        <SourceLocation DefaultValue="https://'.$domain.'.aliconnect.nl/word/"/>
        </DefaultSettings>
        <Permissions>ReadWriteDocument</Permissions>
        </OfficeApp>
        '));
      }
      if (in_array('crmc', $config['options'])) {
        $server = "dms.aliconnect.nl";
        $password = "***";
        $zip->addFromString('crmc/config/config.ini', preg_replace('/^ +/m', '', "[Config]
        MSSQLDatabaseConnection=Provider=SQLOLEDB.1;Persist Security Info=True;Data Source=$server;Initial Catalog=$client_id;User ID=$client_id;Password=$password;
        DatabaseConnectionString=Provider=sqloledb;Data Source=$server;Initial Catalog=$client_id;User ID=$client_id;Password=$password;
        MSSQLDataReaderConnection=Server=$server;Database=$client_id;User ID=$client_id;Password=$password;

        AppName=CRM Connect
        Database=
        PostcodeDatabase=\crmc\mdb\PC.mdb
        UserFiles=\crmc\data
        Templates=\crmc\data\word\Sjablonen
        Documents=\crmc\data\word\Documenten
        EmailTemplates=\crmc\data\outlook\Sjablonen
        Emails=\crmc\data\outlook\Emails
        Temp=\crmc\data\temp
        LicenseFile=\crmc\config\max.lic
        DebugModus=0
        "));
        $files=array_merge($files,[
          // 'crmc/config/max.lic',
          // 'Applicatie/Snel_aan_de_slag.pdf',
          'crmc/bin/crmconnect.application',
          'crmc/bin/crmconnect.exe',
          'crmc/bin/crmconnect.exe.config',
          'crmc/bin/crmconnect.exe.manifest',
          'crmc/bin/crmconnect.pdb',
          'crmc/bin/crmconnect.xml',
          'crmc/bin/en/crmconnect.resources.dll',
          'crmc/bin/adodb.dll',
          'crmc/bin/CheckDotNetVersion.cmd',
          'crmc/bin/LumiSoft.Net.dll',
          'crmc/bin/LumiSoft.Net.xml',
          'crmc/bin/Microsoft.Office.Interop.Outlook.dll',
          'crmc/bin/Newtonsoft.Json.dll',
          'crmc/bin/Newtonsoft.Json.xml',
          'crmc/bin/stdole.dll',
          'crmc/bin/System.Windows.Forms.Calendar.dll',
          'crmc/bin/tvSBI.bin',
          'crmc/bin/Resources.en.Designer.vb',
          'crmc/bin/Resources.en.resx',
          'crmc/bin/bg.jpg',
          'crmc/bin/dossier-contactpersoon.htm',
          'crmc/bin/dossier-project.htm',
          'crmc/bin/dossier-relatie.htm',
          'crmc/bin/dossier-style.css',
          'crmc/bin/htmlLogo.jpg',
          'crmc/bin/logo.bmp',
          'crmc/bin/office.dll',
          'crmc/bin/office.xml',

          // 'crmc/data/PC.mdb',
        ]);
      }
      if (in_array('crmc-word', $config['options'])) {
        $files=array_merge($files,[
          'crmc/bin/WordAddin/adodb.dll',
          'crmc/bin/WordAddin/ico.ico',
          'crmc/bin/WordAddin/Microsoft.Office.Tools.Common.v4.0.Utilities.dll',
          'crmc/bin/WordAddin/Microsoft.Office.Tools.v4.0.Framework.dll',
          'crmc/bin/WordAddin/Microsoft.Office.Tools.Word.dll',
          'crmc/bin/WordAddin/Microsoft.VisualStudio.Tools.Applications.Runtime.dll',
          'crmc/bin/WordAddin/crmconnectWord.dll',
          'crmc/bin/WordAddin/crmconnectWord.dll.manifest',
          'crmc/bin/WordAddin/crmconnectWord.pdb',
          'crmc/bin/WordAddin/crmconnectWord.vsto',
          'crmc/bin/WordAddin/crmconnectWord.xml',
        ]);
      }
      if (in_array('crmc-outlook', $config['options'])) {
        $files=array_merge($files,[
          'crmc/bin/OutlookAddin/adodb.dll',
          'crmc/bin/OutlookAddin/crmconnectOutlook.dll',
          'crmc/bin/OutlookAddin/crmconnectOutlook.dll.manifest',
          'crmc/bin/OutlookAddin/crmconnectOutlook.pdb',
          'crmc/bin/OutlookAddin/crmconnectOutlook.vsto',
          'crmc/bin/OutlookAddin/crmconnectOutlook.xml',
          'crmc/bin/OutlookAddin/Microsoft.Office.Tools.Common.v4.0.Utilities.dll',
          'crmc/bin/OutlookAddin/Microsoft.Office.Tools.Outlook.v4.0.Utilities.dll',
          'crmc/bin/OutlookAddin/en/crmconnectOutlook.resources.dll',
        ]);
      }
      foreach ($files as $filename) $zip->addFile("/".$filename, $filename);
      $zip->close();
      // $body[] = ["title"=>'Aliconnect', "filename"=>'aliconnect.zip', "href"=>'data:application/zip;base64,'.base64_encode(file_get_contents($zip_filename))];
      $body[] = ["title"=>'Aliconnect', "filename"=>'aliconnect.zip', "href"=>"https://share.aliconnect.nl/download/aliconnect-{$uid}.zip"];
      // unlink($zip_filename);
    }
    // if (isset($config['options']['crm'])) {
    //   if ($zip->open($filename = "/aliconnect/public/shared/download/{$uid}.zip", ZipArchive::CREATE) === TRUE) {
    //     $zip->addEmptyDir('config2');
    //     $zip->close();
    //     $body[] = ["title"=>'Test', "filename"=>'test.zip', "href"=>'data:application/zip;base64,'.base64_encode(file_get_contents($filename))];
    //     unlink($filename);
    //   }
    // }
    response(200, $body);
  }

  public function validate($params) {
    if ($params['clientYaml']) {
      $configClientYaml = yaml_parse($params['clientYaml']);
      if (!$configClientYaml) error(401, 'Yaml parse error');
      $params = array_replace_recursive($params, $configClientYaml);
      // error(400, $params);
    }
    if ($params['email']) {
      $params['info']['contact']['email'] = $params['email'];
    }

    if (empty($params['info']['contact']['email'])) error(400, $params);
    if (empty($params['info']['contact']['email'])) error(400, 'Email required');

    $email = $params['info']['contact']['email'];
    // require_once(__DIR__.'/../class/account.php');
    $this->account = $account = new Account(['accountname'=>$email,'client_id'=>Aim::$config->client_id]);
    $browser = AIM['headers']['user-agent'];

    if ($this->config['client_id']) {
      $row = sql_fetch(sql_query([
        "SELECT TOP 1 LOWER(id) AS client_id, LOWER(owner_id) AS owner_id, LOWER(client_secret) AS client_secret FROM dbo.client WHERE id=?",
      ], [$this->client_id]));
      $this->config['owner_id'] = $row['owner_id'];
      $this->config['secret']['client_secret'] = $row['client_secret'];
    }

    if (empty($account->user)) $account->create();
    else if ($browser && $account->user['account_id'] && empty(Aim::$access['sub'])) error(400, 'Dit email adres bestaat al. Meld u eerst aan');
    else if ($browser && $account->user['id'] !== Aim::$access['sub']) error(400, 'EMail adres niet van u');
    else if ($browser && isset($this->config['owner_id']) && $this->config['owner_id'] !== $account->user['id']) error(400, "U bent ! geen eigenaar van dit domein {$this->config['owner_id']} - userId = {$account->user['id']}");
    // Indien config onbekend dan aankaen config gebaseerd op IP adres gebruiker
    // ip adres is nog niet in gebruik anders was de client gevonden
    // één standaard client per ip adres
    // error(400,1);

    if (empty($this->config['client_id'])) {
      $row = sql_fetch(sql_query($q=[
        "SET NOCOUNT ON;DECLARE @ip VARCHAR(50) = ?, @domain NVARCHAR(50) = ?, @owner_id UNIQUEIDENTIFIER = ?, @client_id UNIQUEIDENTIFIER = newid()",
        "INSERT INTO dbo.client (id,ip,domain,client_secret,owner_id) VALUES (@client_id,@ip,@domain,newid(),@owner_id)
        IF @domain IS NOT NULL INSERT INTO dbo.client_host (client_id,hostname) VALUES(@client_id,CONCAT(@domain,'.aliconnect.nl'))",
        "SELECT LOWER(id) AS client_id, LOWER(client_secret) AS client_secret, LOWER(owner_id) AS owner_id FROM dbo.client WHERE id = @client_id",
      ], $args = [
        Aim::$user_ip,
        $params['domain'],
        $account->user['id'],
      ]));
      $this->init($row);
    }
    else {
      $row = sql_fetch(sql_query([
        "SELECT TOP 1 LOWER(id) AS client_id, LOWER(owner_id) AS owner_id, LOWER(client_secret) AS client_secret FROM dbo.client WHERE id=?",
      ], [$this->client_id]));
      if (!$browser) {
        if (!$params['secret']['client_secret']) {
          error(401, "Geen client_secret opgegeven in configuratie bestand");
        }
        if (!$browser && $params['secret']['client_secret'] !== $row['client_secret']) {
          error(401, "Client_secret niet correct voor client_id {$this->client_id}");
        }
      }
    }

    $this->config['client_id'] = $row['client_id'];
    $this->config['owner_id'] = $row['owner_id'];
    $this->config['secret']['client_secret'] = $row['client_secret'];
    // debug('1 client_id '.$config['client_id']);
    if (!$account->user) error(401, "EMail adres {$email} is niet in gebruik. U dient een account aan te maken op internet");
    if ($this->config['secret']['client_secret'] === $params['secret']['client_secret']) return $params;
    $sub = Aim::$access['sub'];
    if ($sub && $sub !== $account->user['id']) error(401, "U bent !! geen eigenaar van deze configuratie {$account->user['id']} {$sub}");
    return $params;
  }
  public function save($params) {
    $params = $this->validate($params);
    if ($params['clientYaml']) {
      if (!yaml_parse($params['clientYaml'])) error(400, 'Yaml parse error');
      file_put_contents($this->client_config_yaml_filename, $params['clientYaml']);
      unset($params['clientYaml']);
    }
    $this->account->$chapters[] = [ 'title' => "Configuratie bijgewerkt", 'content'=> "Uw configuratie is bijgewerkt" ];
    $this->verwerk($params);
  }
  public function verwerk($params) {
    // error_log('verwerk');
    // error(400,3);
    $yaml_config = file_exists($this->clientConfigYamlFilename) ? yaml_parse_file($this->clientConfigYamlFilename) : [];
    $params['options'] = is_string($params['options']) ? explode(',', $params['options']) : array_keys($params['options']);
    // debug_log(json_encode($params['info']));
    $config = array_replace_recursive(
      yaml_parse_file("/aliconnect/config/config.default.yaml"),
      $params,
      [
        'client_id'=> $this->client_id,
        'secret'=> sql_fetch(sql_query("SELECT lower(client_secret)AS[client_secret] FROM dbo.client WHERE id = ?",[$this->client_id])),
      ]
    );
    // debug_log(json_encode($params['info']));
    $config['tags'] = array_values(array_filter($config['tags'], function($tag)use($config){
      return in_array($tag['name'], $config['options']);
    }));
    $config['definitions'] = array_filter($config['definitions'], function($schema)use($config){
      return empty($schema['tags']) || array_intersect($schema['tags'], $config['options']);
    });
    $config = array_replace_recursive($config, $yaml_config ?: []);
    $this->config = $config;
    $this->create_accounts();
    $config = $this->db_create($this->config);
    // error_log('verwerk '.$this->get_client_config_json_filename());
    file_put_contents($this->get_client_config_json_filename(), json_encode($config, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    // error(400,$params);
    // debug('verwerk klaar '.json_encode($config));
  }
  public function openapi($params) {
    function properties ($prop) {
      return array_filter([
        'type'=> $prop['type'] ?: 'string',
        'format'=> $prop['format'],
        'example'=> $prop['example'],
        'enum'=> $prop['enum'],
        'xml'=> $prop['xml'],
        'items'=> $prop['items'],
        'properties'=> array_map('properties',$prop['properties']),
        // 'summary'=> $prop['summary'],
        // 'description'=> $prop['description'],
        // 'operationId'=> $prop['operationId'],
      ]);
    }
    $config = $this->config;
    $oas = array_filter([
      'openapi'=> '3.0.1',
      'info'=> array_filter([
        'title'=> $config['info']['title'],
        'description'=> $config['info']['description'],
        'termsOfService'=> $config['info']['termsOfService'],
        'contact'=> array_filter([
          'name'=> $config['info']['contact']['name'],
          'email'=> $config['info']['contact']['email'],
        ]),
        'license'=> array_filter([
          'name'=> $config['info']['license']['name'],
          'url'=> $config['info']['license']['url'],
        ]),
        'version'=> $config['info']['version'],
      ]),
      'externalDocs'=> array_filter([
        'description'=> $config['externalDocs']['description'],
        'url'=> $config['externalDocs']['url'],
      ]),
      'servers'=> $config['servers'],
      'tags'=> $config['tags'],
      'paths'=> [],
      'components'=> $config['components'],
    ]);
    foreach($config['definitions'] as $schemaname => $def) {
      $oas['paths']["/{$schemaname}"] = [
        'get'=> [
          'tags'=> $def['tags'] ?: [ $schemaname ],
          'summary'=> "Zoek $schemaname",
          // 'description'=> "Multiple status values can be provided with comma separated strings",
          'parameters'=> [
            ['name'=> '$top', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
            ['name'=> '$skip', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
            ['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
            ['name'=> '$filter', 'in'=> "query", 'schema'=> ['type'=> "string"]],
            ['name'=> '$orderby', 'in'=> "query", 'schema'=> ['type'=> "string"]],
          ],
          'responses'=> [
            200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
            // 400=> ['description'=> "Invalid status value"],
            401=> ['description'=> "Unauthorized"],
          ],
          // 'security'=> [['aliconnect'=> ["{$schemaname}:write", "{$schemaname}:read"]]],
        ],
        'post'=> [
          'tags'=> $def['tags'] ?: [ $schemaname ],
          'summary'=> "Toevoegen {$schemaname}",
          'responses'=> [
            200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
          ],
          'security'=> [
            ['aliconnect'=> ["{$schemaname}:write"]]
          ],
        ],
      ];
      $oas['paths']["/{$schemaname}({id})"] = [
        'get'=> [
          'tags'=> $def['tags'] ?: [ $schemaname ],
          'summary'=> "Opvragen details van {$schemaname}",
          'parameters'=> [
            ['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
            ['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
          ],
          'responses'=> [
            200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
          ],
          // 'security'=> [['aliconnect'=> ["{$schemaname}:write", "{$schemaname}:read"]]],
        ],
        'patch'=> [
          'tags'=> $def['tags'] ?: [ $schemaname ],
          'summary'=> "Bijwerken {$schemaname}",
          'parameters'=> [
            ['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
          ],
          'responses'=> [
            200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
          ],
          // 'security'=> [['aliconnect'=> ["{$schemaname}:write"]]],
        ],
        'delete'=> [
          'tags'=> $def['tags'] ?: [ $schemaname ],
          'summary'=> "Verwijder {$schemaname}",
          'parameters'=> [
            ['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
          ],
          'responses'=> [
            200=> ['description'=> "successful operation"],
          ],
          // 'security'=> [['aliconnect'=> ["{$schemaname}:write"]]],
        ],
      ];
      // $oas['tags'][] = ['name'=> $schemaname, 'description'=> "Alles over {$schemaname}"];
      $oas['components']['schemas'][$schemaname] = array_filter([
        'type'=> $prop['type'],
        'allOf'=> null,
        'properties'=> array_map('properties',$def['properties']),
      ]);
      $oas['components']['securitySchemes']['aliconnect']['type'] = 'oauth2';
      $oas['components']['securitySchemes']['aliconnect']['flows']['implicit']['authorizationUrl'] = 'https://aliconnect.nl/v1';
      $oas['components']['securitySchemes']['aliconnect']['flows']['implicit']['scopes']["$schemaname:write"] = "Modify $schemaname";
      $oas['components']['securitySchemes']['aliconnect']['flows']['implicit']['scopes']["$schemaname:read"] = "Read $schemaname";
    }
    // foreach($this->operation as $path => $methods) {
    //   foreach($methods as $methodname => $method) {
    //     unset($method['operation']);
    //     $oas['paths'][$path][$methodname] = $method;
    //   }
    // }
    ksort($oas['paths']);
    ksort($oas['components']['schemas']);
    if (str_contains($params['accept'],'application/json')) {
      response(200,$config);
    }
    header("Content-Type: text/yaml; charset=utf-8");
    exit(yaml_emit($oas));



    return $oas;
    if (str_contains(AIM['request']['accept'],'application/json')) {
      response(200, $oas);
    }
    $oas = yaml_emit($oas);
    $oas = str_replace('!php/object "O:8:\"stdClass\":0:{}"','{}',$oas);
    $oas_keynames = [
      'max'=> 'maximum',
      'min'=> 'minimum',
      'unit'=> 'x-unit',
      'low'=> 'x-low',
      'high'=> 'x-high',
      'options'=> 'x-options',
      'enumTitles'=> 'x-enumTitles',
      'enumColors'=> 'x-enumColors',
      'options'=> 'x-options',
      'header'=> 'x-header',
      'legend'=> 'x-legend',
      'filter'=> 'x-filter',

      'outlook'=> 'x-outlook',
      'crmc'=> 'x-crmc',
      'abis2'=> 'x-abis2',
    ];
    foreach($oas_keynames as $key=> $oas_key) {
      $oas = preg_replace("/\\b{$key}\\b:/","{$oas_key}:",$oas);
    }

    header("Content-Type: text/yaml; charset=utf-8");
    exit($oas);
  }
  public function db_create($config) {
    ini_set('display_errors', false);
    $config = json_decode(json_encode($config));
    $dbname = $config->client_id;
    if($res = sql_fetch(sql_query("SELECT name FROM sys.databases WHERE name = ?",[$dbname]))) {
      error_log("DB EXISTS {$dbname} - ".$res);
    } else {
      error_log("CREATE DATABASE {$dbname}");
      sql_query("CREATE DATABASE [{$dbname}]");
    }
    sql_query("USE [{$dbname}]");
    sql_query("IF NOT EXISTS (SELECT * FROM information_schema.schemata WHERE SCHEMA_NAME = 'api') EXEC sp_executesql N'CREATE SCHEMA api'");
    if (!empty($config->definitions)) {
      foreach ($config->definitions as $schemaName => $schema) {
        // unset($schema->properties->messages);
        foreach ($schema->properties AS $propertyname => $property) {
          $property->sqlcomment = "-- ".implode(', ',[
            str_pad($property->type . ($property->size ? "({$property->size})" : "") ,20),
            str_pad($property->format, 20),
            str_pad($property->sourceDataType, 20),
            str_pad($property->crmcDataType, 20),
            $property->description,
          ]);
        }
      }
      // error_log(PHP_EOL.'3', 3, "\aliconnect\logs\client.log");
      foreach ($config->definitions as $schemaName => $schema) {
        if ($schema->sourceTablename) {
          // response(400,$schema);
          $sql = [];
          $select = [];
          foreach ($schema->properties AS $propertyname => $property) {
            if (!$property->linkFieldname) {
              if ($property->sourceFieldname) {
                $select[] = str_pad("[{$property->sourceFieldname}]",60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
              } else {
                // $select[] = str_pad("NULL",60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
                unset($schema->properties->{$propertyname});
                unset($this->config['definitions'][$schemaName]['properties'][$propertyname]);
              }
            }
          }
          $sql[] = "CREATE VIEW dbo.{$schema->tablename} AS SELECT";
          $sql[] = '   '.implode(PHP_EOL.'  ,',$select);
          $sql[] = "FROM {$schema->sourceTablename} AS {$schemaName}";
          sql_query(["IF OBJECT_ID('[dbo].[{$schema->tablename}]') IS NOT NULL DROP VIEW [dbo].[{$schema->tablename}]"]);
          sql_query($sql);
        }
        else if ($schema->create !== false && $schema->tablename) {
          $tablename = $schema->tablename;
          $cols = [];
          $sql = [];
          $sql[] = "IF NOT EXISTS (SELECT * FROM sysobjects WHERE ID=OBJECT_ID('{$tablename}') AND xtype='U')
          BEGIN
          CREATE TABLE [dbo].[{$tablename}] (
          id UNIQUEIDENTIFIER DEFAULT NEWID()
          ,[{$schemaName}Id] [INT] IDENTITY(1,1) NOT NULL
          CONSTRAINT [PK_{$tablename}]
          PRIMARY KEY CLUSTERED ([Id] ASC)
          WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
          ) ON [PRIMARY]
          END
          ";
          $keys = [
            "id"=> "[{$schemaName}].[id]",
            "{$schemaName}Id"=> "[{$schemaName}].[{$schemaName}Id]",
          ];
          $from = "[dbo].[{$tablename}] AS [{$schemaName}]";
          foreach($schema->properties as $propertyName => $property) {
            // error_log(PHP_EOL."JA", 3, "\aliconnect\logs\client.log");
            if ($propertyName === 'messages') continue;
            if (isset($property->linkFieldname)) continue;
            // if (isset($property->notablefield)) continue;
            if (!empty($property->type)) {
              $size = $property->size ?: 'max';
              $datatypes = [
                'string'=> "VARCHAR({$size})",
                'array'=> "VARCHAR(MAX)",
                'integer'=> "INT",
                'number'=> "FLOAT",
                'datetime'=> "DATETIME",
                'timestamp'=> "DATETIME",
                'dateTimeOffset'=> "DATETIME",
                'date'=> "DATE",
                'boolean'=> "BIT",
                'guid'=> "UNIQUEIDENTIFIER",
                'identifier'=> "UNIQUEIDENTIFIER",
              ];
              $property->dataType = $datatypes[$property->format] ?: $datatypes[$property->type];
              $cols[$propertyName] = $property->dataType;
            }
          }
          foreach($schema->properties as $propertyName => $property) {
            if (isset($property->schema)) {
              $propertySchemaName = $property['schema'];
              $cols[$propertyName.'Id'] = 'UNIQUEIDENTIFIER';
              $keys[$propertyName.'Id'] = "[{$propertyName}].[Id]";
              $from .= PHP_EOL."  LEFT OUTER JOIN [api].[{$property['schema']}] AS [{$propertyName}] ON [{$propertyName}].[Id] = [{$schemaName}].[{$propertyName}Id]";
              foreach($GLOBALS['schemas'][$property['schema']]['properties'] as $linkPropertyName => $linkProperty) {
                if (empty($linkProperty['type'])) continue;
                $linkPropertyName = ucfirst($linkPropertyName);
                $keys[$propertyName.$linkPropertyName] = "[{$propertyName}].[{$linkPropertyName}]";
                $GLOBALS['schemas'][$schemaName]['properties'][$propertyName.$linkPropertyName] = empty($GLOBALS['schemas'][$schemaName]['properties'][$propertyName.$linkPropertyName])
                ? $linkProperty
                : array_replace_recursive($linkProperty,$GLOBALS['schemas'][$schemaName]['properties'][$propertyName.$linkPropertyName]);
              }
            }
          }
          unset($cols["id"]);
          unset($cols["{$schemaName}Id"]);
          foreach($cols as $propertyName => $dataType) {
            $sql[] = "IF NOT EXISTS (SELECT 0 FROM syscolumns WHERE ID=OBJECT_ID('{$tablename}') AND NAME='{$propertyName}') ALTER TABLE {$tablename} ADD [{$propertyName}] {$dataType}";
            $keys[$propertyName] = "[{$schemaName}].[{$propertyName}]";
          }
          sql_query($sql);
        }
      }
      foreach ($config->definitions as $schemaName => $schema) {
        if ($schema->tablename) {
          $sql = [];
          $select = [];
          $schema->join = [];
          foreach ($schema->properties AS $propertyname => $property) {
            if ($property->notablefield) continue;
            if ($property->linkId) {
              $property->linkName = $property->linkName ?: $property->linkSchemaName;
              $schema->join[$property->linkName] = "LEFT OUTER JOIN [".($property->linkSchemaName === $schema->tablename ? "dbo" : "api")."].[{$property->linkSchemaName}] AS [{$property->linkName}] ON {$property->linkName}.{$property->linkId} = {$schema->tablename}.{$propertyname}";
              // $property->linkName = $property->linkName;
              $select[] = str_pad($schemaName.".[{$propertyname}]",60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
              // if ($property->selectFieldname) {
              //   $select[] = str_pad($property->linkName.".[{$property->selectFieldname}]",60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
              // }
            }
            else if ($property->sql) {
              $select[] = str_pad($property->sql,60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
            }
            else {
              $fieldname = $property->linkFieldname ?: $propertyname;
              $select[] = str_pad("[".($property->linkName ?: $schemaName)."].[{$fieldname}]",60).str_pad("AS [{$propertyname}]",40).$property->sqlcomment;
              if ($property->format === 'address') {
                $addressProperties = [
                  'street',
                  'street2',
                  'street3',
                  'postalCode',
                  'city',
                  'state',
                  'country',
                ];
                foreach($addressProperties as $addressPropertyName) {
                  $select[] = str_pad("JSON_VALUE([".($property->linkName ?: $schemaName)."].[{$fieldname}],'$.{$addressPropertyName}')",60).str_pad("AS [".$propertyname.ucfirst($addressPropertyName)."]",40);
                }
                $select[] = str_pad("JSON_VALUE([".($property->linkName ?: $schemaName)."].[{$fieldname}],'$.lat')",60).str_pad("AS [".$propertyname."Lat]",40);
                $select[] = str_pad("JSON_VALUE([".($property->linkName ?: $schemaName)."].[{$fieldname}],'$.lng')",60).str_pad("AS [".$propertyname."Lng]",40);
              }
            }
          }
          $sql[] = "CREATE VIEW api.{$schema->tablename} AS SELECT '{$schemaName}' AS [schemaName]";
          $sql[] = '  ,'.implode(PHP_EOL.'  ,',$select);
          $sql[] = "FROM [dbo].[{$schemaName}]";

          $sql[] = implode(PHP_EOL,array_values($schema->join));

          sql_query("IF OBJECT_ID('[api].[{$schemaName}]') IS NOT NULL DROP VIEW [api].[{$schemaName}]");
          // error_log(PHP_EOL.implode(PHP_EOL,$sql), 3, "\aliconnect\logs\client.log");
          sql_query($sql);
        }
      }
      // foreach ($config->definitions as $schemaName => $schema) {
      //   if ($schema->crmcTablename1) {
      //     $sql = [];
      //     $select = [];
      //     foreach ($schema->properties AS $propertyname => &$property) {
      //       if ($property->crmcFieldname) {
      //         $select[] = str_pad("[{$schemaName}].[{$propertyname}]",60).str_pad("AS [{$property->crmcFieldname}]",40).$property->sqlcomment;
      //       }
      //     }
      //     $sql[] = "CREATE VIEW {$schema->crmcTablename} AS SELECT";
      //     $sql[] = '   '.implode(PHP_EOL.'  ,',$select);
      //     $sql[] = "FROM api.{$schemaName}";
      //     $sql = implode(PHP_EOL,$sql);
      //     sql_query("IF OBJECT_ID('{$schema->crmcTablename}') IS NOT NULL DROP VIEW {$schema->crmcTablename}");
      //     sql_query($sql);
      //   }
      // }
    }
    sql_query(["USE [".Aim::$config->client_id."]"]);
    return $config;
  }
  public function create_accounts() {
    // sql_query([
    //   "DECLARE @client_id UNIQUEIDENTIFIER = ?",
    //   "INSERT INTO dbo.client (id) SELECT @client_id WHERE NOT EXISTS(SELECT 0 FROM dbo.client WHERE id = @client_id)",
    // ], [
    //   $this->config['client_id'],
    // ]);

    if ($this->config['hostnames']) {
      foreach($this->config['hostnames'] as $hostname) {
        sql_query([
          "DECLARE @client_id UNIQUEIDENTIFIER = ?, @hostname NVARCHAR(50) = ?",
          "INSERT INTO dbo.client_host (hostname,client_id) SELECT @hostname,@client_id WHERE NOT EXISTS (SELECT 0 FROM dbo.client_host WHERE hostname = @hostname)",
        ], [
          $this->config['client_id'],
          $hostname,
        ]);
      }
    }
    if ($this->config['users']) {
      foreach($this->config['users'] as $user) {
        sql_query([
          "SET NOCOUNT ON",
          "DECLARE @client_id UNIQUEIDENTIFIER = ?",
          "DECLARE @accountname VARCHAR(50) = ?",
          "DECLARE @scope_account VARCHAR(50) = ?",
          "DECLARE @account_id UNIQUEIDENTIFIER",
          "SELECT @account_id = id FROM dbo.account WHERE accountname = @accountname",
          "INSERT INTO dbo.client_user (client_id,account_id) SELECT @client_id,@account_id WHERE NOT EXISTS(SELECT 0 FROM dbo.client_user WHERE client_id = @client_id AND account_id = @account_id)",
          "UPDATE dbo.client_user SET scope_account = @scope_account WHERE client_id = @client_id AND account_id = @account_id",
        ], [
          $this->config['client_id'],
          $user['accountname'],
          $user['scope_account'],
        ]);
      }
    }
  }
  public function delete() {
    if ($this->client_id) {
      unlink($this->get_client_config_json_filename());
      unlink($this->get_client_config_yaml_filename());
      sql_query("DELETE client WHERE id = ?",[$this->client_id]);
      sql_query("DELETE client_host WHERE client_id NOT IN (SELECT id FROM client)");
      sql_query("DELETE client_user WHERE client_id NOT IN (SELECT id FROM client)");
      sql_query("DELETE client_user WHERE account_id NOT IN (SELECT id FROM account)");
      sql_query("sp_renamedb '{$this->client_id}' , '_{$this->client_id}'");
    }
  }
}
class Jwt {
  public $base64UrlHeader;
  public $base64UrlPayload;
  public $secret;
  public $base64UrlSignature;
  public $signature;
  public $alg = "sha256";
  public $valid = false;
  public function __construct ($jwt = null, $secret = null) {
    $this->alg = 'sha256';
    $this->expires_after = 3600;
    $this->payload = null;
    $this->decode($jwt, $secret);
    // $this->validate($secret);
  	// $result = [
  	// 	// 'header'=> json_decode(base64_decode($base64UrlHeader = array_shift($arr))),
  	// 	'payload'=> $payload = json_decode(base64_decode($base64UrlPayload)),
  	// 	'valid'=> $arr[2] === json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true)),
  	// 	'expired'=> $payload->exp < time(),
  	// 	// 'signature'=> array_shift($arr)
  	// ];
  }
  public function alg($alg) {
    $this->alg = $alg;
    return $this;
  }
  public function expires_after($expires_after = 3600) {
    $this->expires_after = $expires_after;
    return $this;
  }
  public function decode($jwt, $secret = null) {
    if ($jwt) {
      $this->token = $jwt;
      $arr = explode('.', $jwt);
      if (isset($arr[2])) {
        $this->header = json_decode(base64_decode($this->base64UrlHeader = $arr[0]), true);
        $this->alg = $this->header['alg'];
        $this->payload = json_decode(base64_decode($this->base64UrlPayload = $arr[1]), true);
        $this->not_expired = isset($this->payload['exp']) ? $this->payload['exp'] >= time() : null;
        $this->expired = !$this->not_expired;
        $this->base64UrlSignature = $arr[2];
      }
      if ($secret) {
        $this->validate($secret);
      }
    }
    return $this;
  }
  public function secret($secret) {
    if ($secret) {
      $this->secret = $secret;
    }
    return $this;
  }
  public function set($payload) {
    if ($payload) {
      $this->payload=is_string($payload)?json_decode($payload, true):(array)$payload;
    }
    return $this;
  }
  public function get($payload = null, $secret = null, $expires_after = null) {
    $this->set($payload);
    $this->secret($secret);
    $this->payload['iat'] = $time = time();
    $this->payload['exp'] = $time + ($expires_after ?: $this->expires_after ?: 3600);
    // $this->payload['expires_after'] = $expires_after;
    return $this->token = implode('.',[
  		$this->base64UrlHeader = json_base64_encode(json_encode(['typ'=>'JWT', 'alg'=>$this->alg])),
  		$this->base64UrlPayload = json_base64_encode(json_encode($this->payload)),
  		$this->base64UrlSignature = json_base64_encode(hash_hmac($this->alg, $this->base64UrlHeader . '.' . $this->base64UrlPayload, strtolower($this->secret), true))
  	]);
  }
  public function validate($secret = null) {
    $this->valid = 0;
    $this->secret($secret);
    if (
      !empty($this->token) &&
      !empty($this->alg) &&
      !empty($this->base64UrlHeader) &&
      !empty($this->base64UrlPayload) &&
      !empty($this->secret)
    ) {
      $this->signature = json_base64_encode(
        hash_hmac(
          $this->alg,
          $this->base64UrlHeader . '.' . $this->base64UrlPayload,
          $this->secret,
          true
        )
      );
      $this->valid = $this->base64UrlSignature === $this->signature;
    }
    else {
      $this->valid = false;
    }
    return $this->valid;
  }
}
class Aim {
  static $conn;
  static $secret;
  static $config;
  static $user_ip;
  static $access = [];
  static $accounts = [];

  private function validate_scope($scopes = []) {
    return !empty(array_intersect($scopes,explode(' ',$this->access['scope'])));
  }
  private function sql_resultset($query, $args = []) {
    if ($res = sql_query($query, $args)) {
      $data = [];
      while ($res) {
        $rows = [];
        // while ($row = sqlsrv_fetch_object($res)) $rows[] = $row;
        while ($row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC)) $rows[] = $row;
        $data[] = $rows;
        if (!sqlsrv_next_result($res)) break;
      }
      return $data;
    } else {
      error(400, [
        "query"=> $query
      ]);
    }
  }
  private function http_response_query($query, $args = []) {
    response(200, $this->sql_resultset($query, $args));
  }
  private function http_response_query_value($query, $args = []) {
    response(200, ['value'=>$this->sql_resultset($query, $args)[0]]);
  }
  private function http_response_odata_value($sql,$args = [],$root = '',$context = ''){
    $res = sql_query($sql, $args);
    $value = [];
    while ($row = sql_fetch($res)) {
      $value[] = array_replace(['@odata.id'=> "{$root}({$row['id']})"],$row);
    }
    response(200,[
      '@odata.context'=> $context,
      'value'=> $value,
    ]);
  }
  private function http_response_odata_item($sql,$args = [],$root = '',$context = ''){
    $row = sql_fetch(sql_query($sql, $args));
    response(200,array_replace(['@odata.id'=> "{$root}({$row['id']})"],$row));
  }
  private function http_response_odata_table($schemaname,$id = null){
	  $clientId = strtolower($this->access['client_id']);
	  // response(200,[$clientId,$schemaname,$id]);
	  $api = yaml_parse_file("/aliconnect/config/client/{$clientId}.yaml");
	  $schema = $api['components']['schemas'][$schemaname];
		$tablename = "[{$clientId}].api.[{$schemaname}]"; //$schema['tablename'];
	  $properties = $schema['properties'];
	  $_REQUEST = array_change_key_case($_REQUEST);
	  if (isset($_REQUEST['$select'])) {
	    $request_select = explode(',',strtolower($_REQUEST['$select']));
	    $properties = array_filter($properties,function($v)use($request_select){return in_array(strtolower($v),$request_select);},ARRAY_FILTER_USE_KEY);
	  }
	  unset($properties['id']);
	  $select = array_keys($properties);
	  $top = empty($_GET['$top']) ? 10 : $request['$top'];
	  $sql = ["SET TEXTSIZE -1;SET NOCOUNT ON;"];
	  $sql[] = "SELECT";
	  if (empty($_GET['$skip'])) {
	    $sql[] = "TOP {$top}";
	  }
	  $sql[] = implode(',',$select);
	  $sql[] = "FROM {$tablename}";
	  if ($id) {
	    $sql[] = "WHERE id = '{$id}'";
	    // response(200,$sql);
	    $res = sql_query($sql);
	    $row = sql_fetch($res);
			return $row;
	    $data['@odata.context'] = "{$this->service_root}/\$metadata#{$schemaname}/\$entity";
	    $data['@odata.id'] = "{$this->service_root}/{$schemaname}({$row['id']})";
	    $data['@odata.editLink'] = "{$this->service_root}/{$schemaname}({$row['id']})";
	    response(200,array_replace($data,$row));
	  }


	  if (isset($_REQUEST['$filter'])) {
	    $operators = [
	      " eq null "=>" IS NULL ",
	      " ne null "=>" IS NOT NULL ",
	      " eq "=>" = ",
	      " ne "=>" <> ",
	      " gt "=>" > ",
	      " ge "=>" >= ",
	      " lt "=>" < ",
	      " le "=>" <= ",
	      " and "=>" AND ",
	      " or "=>" OR ",
	      " && "=>" AND ",
	      " || "=>" OR ",
	      " not "=>" NOT ",
	      // "add"=>"",
	      // "sub"=>"",
	      // "mul"=>"",
	      // "div"=>"",
	      // "mod"=>"",
	      "=("=>" IN(",
	      "eq("=>" IN(",
	    ];
	    $sql[] = "WHERE ".str_replace(array_keys($operators), array_values($operators), ' '.strtolower($_REQUEST['$filter']).' ');
	  }
	  if (isset($_REQUEST['$order'])) {
	    $sql[] = "ORDER BY {$_REQUEST['$order']}";
	  }
	  if (isset($_REQUEST['$skip'])) {
	    $sql[] = "OFFSET {$_REQUEST['$skip']} ROWS FETCH NEXT {$top} ROWS ONLY";
	  }
	  $data = [];
	  $data['@odata.context'] = "{$this->service_root}/\$metadata#{$schemaname}";

	  if (isset($_REQUEST['$top'])) {
	    $_GET['$skip'] = $_GET['$skip'] + $_GET['$top'];
	    $data['@odata.nextLink'] = "{$this->service_root}/Client({$client_id})/{$schemaname}?".urldecode(http_build_query($_GET));
	  }

	  $value = [];
	  $res = sql_query($sql);
	  while ($row = sql_fetch($res)) {
	    $value[] = array_replace([
	      '@odata.id'=> "{$this->service_root}/client({$client_id})/{$schemaname}({$row['id']})",
	    ],$row);
	  }
	  $data['value'] = $value;
	  response(200,$data);
	}

  public function __construct ($config = []) {
    // error(402);
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();
    Aim::$user_ip = get_real_user_ip();
    $GLOBALS['aim'] = $this;
    $headers = array_change_key_case(getallheaders());
    $access_token = isset($headers['authorization']) ? explode(' ', $headers['authorization'])[1] : null;
    if ($access_token) {
      // error(409,$headers['authorization']);
      $jwt = new Jwt($access_token);
      Aim::$access = $jwt->payload;
      Aim::$config = new Config(['client_id'=>self::$access['azp']]);
      Aim::$access['valid'] = $jwt->validate(self::$config->secret['client_secret']);
    } else {
      Aim::$config = new Config;
    }




    // self::$config->set(self::$config->config);
    // error(406,self::$config);
    // $filenames = [
    //   // $_SERVER['DOCUMENT_ROOT']."/../config/config.json",
    //   // $_SERVER['DOCUMENT_ROOT']."/../config/.config.json",
    //   $_SERVER['DOCUMENT_ROOT']."/../config/server.config.yaml",
    //   $_SERVER['DOCUMENT_ROOT']."/../config/server.secret.yaml",
    //   // $_SERVER['DOCUMENT_ROOT']."/../config/.config.yaml",
    // ];
    // foreach ($filenames as $filename) {
    //   if (file_exists($filename)) {
    //     self::$config->set(yaml_parse_file($filename)?:[]);
    //   }
    // }
    // self::$config->set(['b'=>1]);
    // response(200,self::$config->get());
    // response(200,self::$config->secret['sqlsrv']);


    // response(200, $this->client);


    // response(200, $this->client->init());

    // response(200, $this->get_config());


    // $this->a=1;
    // $this->setConfig($config);
    // foreach ($filenames as $filename) {
    //   if (file_exists($filename)) {
    //     $config = array_replace_recursive($config, yaml_parse_file($filename));
    //   }
    // }
    // $filenames = [$_SERVER['DOCUMENT_ROOT']."/../config/.config.json",$_SERVER['DOCUMENT_ROOT']."/../config/.config.yaml"];
    // foreach ($filenames as $filename) {
    //   if (file_exists($filename)) {
    //     $config = array_replace_recursive($config, ['secret'=>yaml_parse_file($filename)]);
    //   }
    // }

    $domain = explode('.',$_SERVER['HTTP_HOST'])[0];
    $php_self = dirname($_SERVER['PHP_SELF']);
    $php_self = str_replace("{$domain}/","",$php_self);
    $request_uri = explode($php_self, $_SERVER['REQUEST_URI'])[1];
    // error(200,[
    //   $_SERVER['PHP_SELF'],
    //   $_SERVER['REQUEST_URI'],
    // ]);
    if (preg_match_all('/\/(\w+?)\((.*?)\)/',$request_uri,$matches,PREG_SET_ORDER)) {
      foreach ($matches as $match) {
        $_REQUEST[$match[1]."_id"] = trim($match[2], "'");
        $name = $match[1];
        $request_uri = str_replace($match[0], "/{$name}({{$name}_id})", $request_uri);
      }
    }
    $client_id = strtolower(Aim::$access['azp'] ?: Aim::$access['aud'] ?: Aim::$access['client_id'] ?: $_REQUEST['client_id'] ?: $_REQUEST['clientId'] ?: $config['client_id']);
    $filenames = [
      $_SERVER['DOCUMENT_ROOT']."/../config/.config.{$client_id}.json",
      $_SERVER['DOCUMENT_ROOT']."/../config/config.{$client_id}.yaml",
      $_SERVER['DOCUMENT_ROOT']."/../config/.config.{$client_id}.yaml",
    ];
    foreach ($filenames as $filename) {
      if (file_exists($filename)) {
        // error(400,$filename);
        self::$config->init(yaml_parse_file($filename)?:[]);
        // $config = array_replace_recursive($config, yaml_parse_file($filename));
      }
    }
    // response(200, self::$config);
    // $this->request = array_change_key_case(array_replace(getallheaders(),$_REQUEST));
    // $this->request['accept'] = explode(',',$this->request['accept']);

    define('AIM', [
      // 'filename_login_html'=> __ROOT__.'/html/login.html',
      // 'filename_mail_html'=> __ROOT__.'/html/mail.html',
      'filename_login_html'=> __DIR__.'/../html/login.html',
      'filename_mail_html'=> __DIR__.'/../html/mail.html',

      'request_method'=> strtolower($_SERVER['REQUEST_METHOD']),
      'request_uri'=> $request_uri,
      'request_url'=> $request_url = parse_url($request_uri),
      'request_path'=> $request_url['path'],
      'request'=> array_change_key_case(array_replace(getallheaders(),$_REQUEST)),

      'origin'=> $origin = ($_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://').$_SERVER['HTTP_HOST'],
      'context'=> $origin . $_SERVER['REQUEST_URI'],
      'dirname'=> $dirname = dirname(parse_url($_SERVER['URL'])['path']),
      'baseurl'=> $origin . $dirname,
      'service_root'=> $origin . $dirname,

      'domain'=> $domain,
      // 'url'=> $url = parse_url(explode(dirname($_SERVER['SCRIPT_NAME']),$_SERVER['REQUEST_URI'])[1]),

      'headers'=> $headers,
      'access_token'=> $access_token,
      // 'access'=> Aim::$access,
      'scopes'=> isset(Aim::$access['scope']) ? explode(' ',Aim::$access['scope']) : [],
      // 'access_client_id'=> $access['client_id'],

      'client_id'=> $client_id,
      // 'config'=> $config,
    ]);
    // response(200,$GLOBALS['aim']);
  }
  public function api(){
    extract(AIM);
    $top = $this->top = empty($_GET['$top']) ? 10 : $request['$top'];
    $user_id = null;

		sql_query([
			"DECLARE @now AS DATETIME = GETDATE()",
			"DECLARE @period AS INT = DATEPART(YEAR,@now)*100+DATEPART(MONTH,@now)",
			"INSERT INTO dbo.client_request (period,requestDateTime,client_id,method,uri,user_id)
			VALUES (@period,@now,?,?,?,?)",
		], [
			$client_id,
			$_SERVER['REQUEST_METHOD'],
			$_SERVER['REQUEST_URI'],
			Aim::$access['oid'],
		]);
    // response(200,$GLOBALS['aim']);

    $sources = [
      __ROOT__."/domain/{$domain}.php",
      getcwd()."/{$domain}.php",
    ];
    foreach($sources as $filename) {
      if (file_exists($filename)) {
  			require_once($filename);
        break;
  		}
    }
    // error(400, self::$config->paths);
    // response(200, $sources);
    // response(200,$filename);
    // error(402, [
    //   $_SERVER['PHP_SELF'],
    //   $_SERVER['HTTP_HOST'],
    //   AIM,
    // ]);
    $libname = explode('/',$request_path)[1];
    if (file_exists($filename = __ROOT__."/domain/{$libname}.php")) {
      $request_path = preg_replace("/^\/{$libname}/","",$request_path) ?: '/';
			require_once($filename);
      // response(200, [1,$request_path,$libname,self::$config->paths]);
		}

    if ($method = self::$config->paths[$request_path][$request_method]) {
      $this->check_security($method);
      if ($method['operation']) {
        response(200,call_user_func($method['operation'], $_REQUEST));
      }
      if ($method['operationId']) {
        response(200,call_user_func(self::$config->operation[$method['operationId']], $_REQUEST));
      }
    }
		$request_path = preg_replace("/(\/me\/)/i", "/", $request_path);

    if ($request_path === '/') {
      switch ($_REQUEST['response_type']) {
        case 'mailer_send': {
          echo date('Y-m-d H:i:s');
          // exit();
          if ($row = sql_fetch(sql_query([
            "SELECT TOP 1 id,data FROM dbo.mailer WHERE sendDateTime IS NULL ORDER BY prio,createdDateTime",
          ]))) {
            $data = json_decode($row['data'],true);
            unset($data['prio']);
            // echo $row['data'];
            // // $data = json_decode($row['data']);
            // echo 1;
            Aim::mail($data);
            // response(200, $data);
            echo 'send';
            $row = sql_fetch(sql_query([
              "UPDATE dbo.mailer SET sendDateTime = GETDATE() WHERE Id = ?",
            ], [
              $row['id'],
            ]));
            echo 'updated';
          //   header("refresh:5");
          // } else {
          //   header("refresh:10");
          };
          response(200);
        }
      }
    }
		$path = explode('/',$request_path);
		$arr = preg_split('/\(|\)/',$path[1]);
    $schemaName = array_shift($arr);
    $schemaname = strtolower($schemaName);
    $definitions = array_change_key_case(self::$config->definitions);
    if (empty($definitions)) error(400, 'Geen definitions, wellicht niet ingelogt of geen rechten');
    $schema = new Schema($schemaname);
		if ($schema) {
			if (empty(Aim::$access)) error(401, 'not signed in');
			if (empty(Aim::$access['azp'])) error(401, 'azp');
			$client_id = Aim::$access['azp'];
			$scopes = explode(' ',Aim::$access['scope']);


			// if (empty(array_intersect($scopes,["admin","{$schemaname}:read","{$schemaname}:write"]))) error(401, 'scope');
			// $id = array_shift($arr);
      $id = $_REQUEST[$schemaName.'_id'];
      // error(400,[$$schemaName,$_REQUEST,$arr,$id]);

      if (preg_match("/children$/",$request_path,$matches)) {
        switch ($request_method) {
          case 'get': {
            $client_id = $_REQUEST['client_id'];
            // error(200,$_REQUEST['client_id']);
            $res = sql_query([
              "SET NOCOUNT ON;DECLARE @itemId AS BIGINT",
              "SELECT @itemId = id FROM aim1.item.dt WHERE uid = ?",
              "SELECT id,itemId,title,subject,summary,LOWER([schema])AS[schemaName],masterId FROM aim1.item.vw WHERE masterId = @itemId",
            ], [$id]);
            $value = [];
            while ($row = sql_fetch($res)) {
        	    $value[] = array_replace([
        	      '@odata.id'=> "{$this->service_root}/client({$client_id})/{$row['schemaName']}({$row['id']})",
        	    ],$row);
        	  }
            // error(400,1);
        	  response(200,[
              '@odata.context'=> "{$this->service_root}/\$metadata#item",
              'value'=> $value,
            ]);
          }
        }
      }
			if ($schema->tablename) {
        if (preg_match("/messages$/",$request_path,$matches)) {
          switch ($request_method) {
            case 'get': {
              $this->http_response_odata_value([
                "SELECT * FROM [{$client_id}].[dbo].[itemMessage] WHERE itemId = ? ORDER BY createdDateTime",
              ],[$id], "{$this->service_root}/me/messages", "{$this->service_root}/me/\$metadata#itemMessage/\$entity");
            }
            case 'post': {
              $this->http_response_odata_item([
                "SET NOCOUNT ON;DECLARE @id UNIQUEIDENTIFIER = newid()",
                "INSERT INTO [{$client_id}].[dbo].[itemMessage] (id,itemId,aud,sub,value,name,createdDateTime) VALUES (@id,?,?,?,?,?,GETDATE())",
                "SELECT * FROM [{$client_id}].[dbo].[itemMessage] WHERE id = @id",
              ],[$id,$_REQUEST['aud'],$_REQUEST['sub'],$_REQUEST['value'],$_REQUEST['name']], "{$this->service_root}/me/itemMessage", "{$this->service_root}/me/\$metadata#messages/\$entity");
            }
          }
        }

        $odata = new OData;
        // error_log('ja');

        if (!$id && $request_method === 'post') {
          $data = file_get_contents('php://input');
          $data = $data ? json_decode($data, true) : $_POST;
          unset($data['schemaName']);
          // if ($schema->properties['createdDateTime']) {
          //   $data['createdDateTime'] = date("Y-m-dTH:i:s");
          // }
          $keys = implode(",",array_map(function($name){return "[$name]=?";},array_keys($data)));
          $values = array_values($data);
          $row = sql_fetch(sql_query($sql = [
            "SET NOCOUNT ON;DECLARE @id UNIQUEIDENTIFIER = newid();",
            "INSERT INTO [$client_id].[dbo].[{$schemaname}] (id) VALUES (@id)",
            empty($keys) ? "" : "UPDATE [$client_id].[api].[{$schemaname}] SET $keys WHERE id = @id",
            "SELECT @id AS id",
          ], $values));
          // error_log(json_encode([$sql,$keys,$values,$row]));
          $id = $row['id'];
        }
        if ($id && $request_method === 'delete') {
          sql_query($sql = [
            "DELETE [$client_id].[dbo].[{$schemaname}] WHERE id = ?",
          ], [$id]);
          response(200,[$sql,$id]);
        }
        if ($id && $request_method === 'patch') {
          $data = json_decode(file_get_contents('php://input'),true);
          if ($schema->properties['lastModifiedDateTime']) {
            $data['lastModifiedDateTime'] = date("d-m-Y H:i:s");
          }
          $args = array_merge(array_values($data),[$id]);
          $args = array_map(function($arg){return is_array($arg) ? json_encode($arg): $arg;},$args);
          if (!empty($args)) {
            $keys = implode(",",array_map(function($name){return "[$name]=NULLIF(?,'')";},array_keys($data)));
            if (!empty($keys)) {
              // error_log(json_encode($data));
              sql_query($sql = [
                "SET DATEFORMAT DMY",
                "UPDATE [$client_id].[api].[{$schemaname}] SET $keys WHERE id = ?",
              ], $args);
            }
          }
        }
				// $request = array_change_key_case($_REQUEST);
				// $top = empty($_GET['$top']) ? 10 : $request['$top'];
				$properties = $schema->properties;
        unset($properties['messages']);
				if (isset($request['$select'])) {
					$request_select = explode(',',strtolower($request['$select']));
					$properties = array_filter($properties,function($v)use($request_select){return in_array(strtolower($v),$request_select);},ARRAY_FILTER_USE_KEY);
				}
				unset($properties['id']);
				$select = array_keys($properties);

        if ($_GET['$top'] === '*') $top = "";
        else if (!$_GET['$top']) $top = "TOP 10";
        else $top = "TOP {$_GET['$top']}";

				if (is_array($schema->allOf) && in_array('item',$schema->allOf)) {
					$value = [];
					// response(200,[$client_id,$user_id,$schemaname,$id]);
					$res = sql_query([
						"SET NOCOUNT ON",
						"DECLARE @item TABLE (itemId BIGINT,id UNIQUEIDENTIFIER,schemaname NVARCHAR(50))",
						"INSERT INTO @item SELECT {$top} itemId,id,lower([schema]) FROM aim1.item.vw WHERE [client_id] = ? AND [schema] = ? ",
						$id ? " AND [id] = '$id'" : "",
						$user_id ? " AND [user_id] = '$user_id'" : "",
						"SELECT lower(id) AS id,schemaname,itemId FROM @item",
						"SELECT itemId,attributeName AS [name],value FROM aim1.attribute.vw WHERE itemId IN (SELECT itemId FROM @item) AND attributeName IN ('".implode("','",$select)."')",
					], [$client_id,$schemaname]);
					while ($row = sql_fetch($res)) $value[$row['itemId']] = [
						'@odata.id'=> "{$row['schemaname']}({$row['id']})",
					];
					sqlsrv_next_result($res);
					while ($row = sql_fetch($res)) $value[$row['itemId']][$row['name']] = $row['value'];
					response(200,[
						// '@odata.context'=> "{$this->service_root}/client({$client_id})",
						'@odata.context'=> "{$this->service_root}{$request_path}",
						'value'=> array_values($value),
					]);
				}
				// response(200, [$name,$id]);
				$data = [];

        sql_query("USE [{$client_id}]");
				$tablename = "[api].[{$schemaname}]";
				$sql = ["SET TEXTSIZE -1;SET NOCOUNT ON;"];
				$sql[] = "SELECT";
				if (empty($_GET['$skip'])) {
					$sql[] = $top;
				}
				// array_unshift($select,'lower([id]) AS [id]');
				// $sql[] = 'lower([id])AS[id],['.implode('],[',$select).']';

        if (!empty($request['$apply'])) {
          if (preg_match('/aggregate\((.*)?\)/', $request['$apply'], $matches)) {
            $arr = explode(',', $matches[1]);
            foreach($arr as $i => $cmd) {
              if (preg_match('/(.*?) with countdistinct as (.*)/', $cmd, $matches)) {
                $arr[$i] = "APPROX_COUNT_DISTINCT({$matches[1]}) AS {$matches[2]}";
              }
              // $select = implode(',', $arr);
              // $arr[] = $matches;
            }
            $sql[] = implode(',', $arr);
            // // error(400,$sql);
            // // error(400,$matches[1]);
            // $res = sql_query($sql, [$client_id,$user_id]);
            // while ($row = sql_fetch($res)) {
    				// 	$value[] = array_replace([
    				// 	'@odata.id'=> "{$service_root}/me/{$schemaName}({$row['id']})",
    				// 	],$row);
    				// }
            // response(200, [
    				// 	'@odata.context'=> "{$service_root}{$request_path}",
    				// 	'value'=> array_values($value),
    				// ]);
          }

				} else {
          $sql[] = 'lower([id])AS[id],'.implode(',',array_map(function($key)use($properties){
          // if ($properties[$key]['format'] === 'data') return "[$key]";
          if ($properties[$key]['format'] === 'location') return "CONVERT(VARCHAR(MAX),[$key])AS[$key]";
          return "[$key]";
        },$select));
        }



				$sql[] = 'FROM '.$tablename;

				if ($id) {
					$sql[] = "WHERE[id]=?";
          // error(400,1);
          // error(400,implode(PHP_EOL,$sql));
          // error(400,self::$config->config);
					// error(400,implode(PHP_EOL,$sql));
          // error(400, $sql);
					$res = sql_query($sql,[$id]);
					$row = sql_fetch($res);
					// $data['@odata.context'] = "{$this->service_root}/client({$clientId})/\$metadata#{$schemaname}/\$entity";
					// $data['@odata.id'] = "{$this->service_root}/client({$clientId})/{$schemaname}({$row['id']})";
					// $data['@odata.editLink'] = "{$this->service_root}/client({$clientId})/{$schemaname}({$row['id']})";

					$data['@odata.context'] = "{$service_root}/me/\$metadata#{$schemaName}/\$entity";
					$data['@odata.id'] = "{$service_root}/me/{$schemaName}({$row['id']})";
					$data['@odata.editLink'] = "{$service_root}/me/{$schemaName}({$row['id']})";
					response(200,array_replace($data,$row));
				}
				// $data['@odata.context'] = "{$this->service_root}/\$metadata#{$schemaname}";
				// $and = ["NULLIF(ClientId,?) IS NULL","NULLIF(UserId,?) IS NULL"];
				$and = [];
				// if (isset($GLOBALS['client_id'])) {
				// 	$and[] = "clientId='{$GLOBALS['client_id']}'";
				// }
        if (!empty($request['$filter'])) {
					$operators = [
					"/ eq null/"=>" IS NULL",
					"/ ne null/"=>" IS NOT NULL",
					"/ eq (\\S+)/"=>" = '$1'",
					"/ ne /"=>" <> ",
					"/ gt /"=>" > ",
					"/ ge /"=>" >= ",
					"/ lt /"=>" < ",
					"/ le /"=>" <= ",
					"/ and /"=>" AND ",
					"/ or /"=>" OR ",
					"/ && /"=>" AND ",
					"/ \|\| /"=>" OR ",
					"/ not /"=>" NOT ",
					// "add"=>"",
					// "sub"=>"",
					// "mul"=>"",
					// "div"=>"",
					// "mod"=>"",
					"/=\(/"=>" IN(",
					"/eq\(/"=>" IN(",
					];
          $filter = ' '.strtolower($request['$filter']).' ';
          $filter = preg_replace(array_keys($operators), array_values($operators), $filter);
          $filter = str_replace("''","'",$filter);
          // $filter = preg_replace(['/ eq /'], [' E-Q '], $filter);
					$and[] = $filter;
				}
        if (isset($request['$search'])) {
          if (empty($request['$search'])) {
              $and[] = "1 = 0";
          } else if ($request['$search'] !== "*") {
            foreach (explode(' ',$request['$search']) as $word) {
              $word = str_replace(['#','?','*'],['[0-9]','_','%'],$word);
              $or = [];
              foreach ($schema->search as $columnName) {
                $or[] = "({$columnName} LIKE '%{$word}%')";
              }
              $and[] = implode('OR',$or);
            }
          }
				}

        // error(400, $request);
				if ($and) {
					$sql[] = "WHERE(".implode(')AND(', $and).")";
				}
        $orderby = $request['$order'] ?: $request['$orderby'];
        if ($orderby) {
					$sql[] = "ORDER BY {$orderby}";
				}
				if (isset($request['$skip'])) {
					$sql[] = "OFFSET {$request['$skip']} ROWS FETCH NEXT {$top} ROWS ONLY";
				}
				if (isset($request['$top'])) {
					$_GET['$skip'] = $_GET['$skip'] + $_GET['$top'];
					$data['@odata.nextLink'] = "{$this->service_root}/Client({$client_id})/{$schemaname}?".urldecode(http_build_query($_GET));
				}
				// $sql = create_query($tablename, $properties, $id);
				error_log(implode(PHP_EOL,$sql));
				// error(400,$sql);
				$value = [];
        // error(400,1);


				$res = sql_query($sql, [$client_id,$user_id]);
				while ($row = sql_fetch($res)) {
					$value[] = array_replace([
					// '@odata.id'=> "{$this->service_root}/client({$client_id})/{$schemaname}({$row['id']})",
					'@odata.id'=> "{$service_root}/me/{$schemaName}({$row['id']})",
					],$row);
				}
				// $data['value'] = $value;
				// ok($sql);
				response(200, [
					// '@odata.context'=> "{$this->service_root}/client({$client_id})",
					'@odata.context'=> "{$service_root}{$request_path}",
					'value'=> array_values($value),
				]);
				// response(200,$data);
			}
			else {
				// error(400);
				$res = sql_query([
					"SELECT TOP 10 id AS itemId,uid AS id,title FROM aim1.item.dt WHERE hostId = ?",
				], [
					$this->access['cid'],
				]);
        $value = [];
        while ($row = sql_fetch($res)) {
    	    $value[] = array_replace([
    	      '@odata.id'=> "{$service_root}/client({$client_id})/item({$row['id']})",
    	    ],$row);
    	  }
    	  response(200,[
          '@odata.context'=> "{$service_root}/\$metadata#item",
          'value'=> $value,
        ]);
				//
				// $this->http_response_query("SELECT TOP 10 * FROM aim1.item.dt");
				// error(400);
			}
		}
    // response(200,$request_path);
		//
		//
		//
		//
		// if (isset($api['components']['schemas'])) {
		// 	foreach ($api['components']['schemas'] as $schemaname => $schema) {
		// 	}
		// }

    // response(200, self::$config->json());


    error(400);
		// response(200,realpath($this->src));
		// response(200,$api);
		// }



		// $request_path = preg_replace('/.*?api\/.*?(?=\/)/','',parse_url($_SERVER['REQUEST_URI'])['path'])?:'/';
		//
		//
		//
		// // if (preg_match("/^\/client\((.+?)\)(.*)/i",$request_path,$matches)) {
		// // 	$client_id = $matches[1];
		// // 	$request_path = $matches[2]?:'/';
		// // 	$api = json_decode(file_get_contents("/aliconnect/config/client/{$client_id}.json"),true);
		// // } else {
		// // 	$client_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
		// // 	$api = yaml_parse_file("{$this->domain}.yaml");
		// // }
		// // if ($this->access['sub']) {
		// // 	$request_path = preg_replace("/(\/me\/)/i", "/user({$this->access['sub']})/", $request_path);
		// // }
		// if (preg_match("/^\/user\((.+?)\)(.*)/i",$request_path,$matches)) {
		// 	$user_id = $matches[1];
		// 	$request_path = $matches[2]?:'/';
		// }

		// if (isset($api['components']['schemas'])) {
		// 	foreach ($api['components']['schemas'] as $schemaname => $schema) {
		// 		$api['components']['securitySchemes']['aliconnect_auth']['type'] = 'oauth2';
		// 		$api['components']['securitySchemes']['aliconnect_auth']['flows']['implicit']['authorizationUrl'] = 'https://login.aliconnect.nl/oauth/dialog';
		// 		$api['components']['securitySchemes']['aliconnect_auth']['flows']['implicit']['scopes']["$schemaname.write"] = "Modify $schemaname";
		// 		$api['components']['securitySchemes']['aliconnect_auth']['flows']['implicit']['scopes']["$schemaname.read"] = "Read $schemaname";
		// 		$api['paths']["/{$schemaname}"] = [
		// 			'get'=> [
		// 				// 'operationId'=> "client_data",
		// 				'tags'=> [ $schemaname ],
		// 				'summary'=> "Finds $schemaname",
		// 				'description'=> "Multiple status values can be provided with comma separated strings",
		// 				'parameters'=> [
		// 					// ['name'=> "clientId", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
		// 					['name'=> '$top', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
		// 					['name'=> '$skip', 'in'=> "query", 'schema'=> ['type'=> "integer"]],
		// 					['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
		// 					['name'=> '$filter', 'in'=> "query", 'schema'=> ['type'=> "string"]],
		// 					['name'=> '$order', 'in'=> "query", 'schema'=> ['type'=> "string"]],
		// 				],
		// 				'responses'=> [
		// 				  200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
		// 				  400=> ['description'=> "Invalid status value", 'content'=> (object)[]],
		// 				],
		// 				'security'=> [
		// 					['aliconnect_auth'=> ["{$schemaname}.write", "{$schemaname}.read"]]
		// 				],
		// 			],
		// 		];
		// 		$api['paths']["/{$schemaname}({id})"] = [
		// 			'get'=> [
		// 				// 'operationId'=> "client_data",
		// 				'tags'=> [ $schemaname ],
		// 				'summary'=> "Finds Document",
		// 				'description'=> "Multiple status values can be provided with comma separated strings",
		// 				'parameters'=> [
		// 					['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
		// 					['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
		// 				],
		// 				'responses'=> [
		// 					200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
		// 				  400=> ['description'=> "Invalid status value", 'content'=> (object)[]],
		// 				],
		// 				'security'=> [
		// 					['aliconnect_auth'=> ["{$schemaname}.write", "{$schemaname}.read"]]
		// 				],
		// 			],
		// 			'post'=> [
		// 				// 'operationId'=> "client_data",
		// 				'tags'=> [ $schemaname ],
		// 				'summary'=> "Finds Document",
		// 				'description'=> "Multiple status values can be provided with comma separated strings",
		// 				'parameters'=> [
		// 					// ['name'=> "clientId", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
		// 					['name'=> "id", 'in'=> "path", 'schema'=> ['type'=> "string"], 'required'=> true],
		// 					['name'=> '$select', 'in'=> "query", 'schema'=> ['type'=> "string"]],
		// 				],
		// 				'responses'=> [
		// 					200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "array", 'items'=> ['$ref'=> "#/components/schemas/{$schemaname}"]]]]],
		// 				  400=> ['description'=> "Invalid status value", 'content'=> (object)[]],
		// 				],
		// 				'security'=> [
		// 					['aliconnect_auth'=> ["{$schemaname}.write"]]
		// 				],
		// 			],
		// 		];
		// 	}
		// }

		// $api['paths']['/'] = [
		// 	'get'=> [
		// 		'summary'=> "API Configuration",
		// 		'responses'=> [
		// 			200=> ['description'=> "successful operation", 'content'=> ['application/json'=> ['schema'=> ['type'=> "object" ]]]],
		// 			// 400=> ['description'=> "Invalid status value", 'content'=> (object)[]],
		// 		],
		// 		'operation'=> function()use($api){
		// 			response(200, $api);
		// 		},
		// 	],
		// ];
		// function change_path($path){
		// 	return preg_replace('/\\\{.*?\\\}/','(.*?)',preg_quote($path,'/'));
		// }
		// $paths = array_convert_key_case($api['paths'], 'change_path');


		// response(200, [__DIR__,getcwd(),$paths,$request_path,$_SERVER['REQUEST_URI'],$_SERVER['URL'],dirname($_SERVER['SCRIPT_NAME']),$_SERVER]);
		// response(200,$paths);

		// response(200, [$api]);
		// if (preg_match("/^\/(.+?)$/i",$request_path,$matches)) {
		// 	$path_schemaname = $matches[1];
		// 	response(200,$api['components']['schemas']);
		// 	if (isset($api['components']['schemas'])) {
		// 		foreach ($api['components']['schemas'] as $schemaname => $schema) {
		// 			if (strtolower($schemaname) === $path_schemaname) {
		// 				// response(200,[$client_id,$user_id,$path_schemaname]);
		// 				$data = [];
		// 				$tablename = "[{$client_id}].[dbo].[{$schemaname}]";
		// 				$request = array_change_key_case($_REQUEST);
		// 				$sql = ["SET TEXTSIZE -1;SET NOCOUNT ON;"];
		// 				$sql[] = "SELECT";
		// 				$top = empty($_GET['$top']) ? 10 : $_GET['$top'];
		// 				if (empty($_GET['$skip'])) {
		// 					$sql[] = "TOP {$top}";
		// 				}
		// 				$properties = $schema['properties'];
		// 				if (isset($request['$select'])) {
		// 					$request_select = explode(',',strtolower($request['$select']));
		// 					$properties = array_filter($properties,function($v)use($request_select){return in_array(strtolower($v),$request_select);},ARRAY_FILTER_USE_KEY);
		// 				}
		// 				unset($properties['id']);
		// 				$select = array_keys($properties);
		// 				array_unshift($select,'lower(id) AS id');
		// 				$sql[] = implode(',',$select);
		// 				$sql[] = 'FROM '.$tablename;
		// 				if ($id) {
		// 					$sql[] = "WHERE id = '{$id}'";
		// 					// response(200,$sql);
		// 					$res = sql_query($sql);
		// 					$row = sql_fetch($res);
		// 					$data['@odata.context'] = "{$this->service_root}/client({$clientId})/\$metadata#{$schemaname}/\$entity";
		// 					$data['@odata.id'] = "{$this->service_root}/client({$clientId})/{$schemaname}({$row['id']})";
		// 					$data['@odata.editLink'] = "{$this->service_root}/client({$clientId})/{$schemaname}({$row['id']})";
		// 					ok(array_replace($data,$row));
		// 				}
		// 				$data['@odata.context'] = "{$this->service_root}/\$metadata#{$schemaname}";
		// 				$and = ["NULLIF(ClientId,?) IS NULL","NULLIF(UserId,?) IS NULL"];
		// 				// if (isset($GLOBALS['client_id'])) {
		// 				// 	$and[] = "clientId='{$GLOBALS['client_id']}'";
		// 				// }
		// 				if (!empty($request['$filter'])) {
		// 					$operators = [
		// 						" eq null "=>" IS NULL ",
		// 						" ne null "=>" IS NOT NULL ",
		// 						" eq "=>" = ",
		// 						" ne "=>" <> ",
		// 						" gt "=>" > ",
		// 						" ge "=>" >= ",
		// 						" lt "=>" < ",
		// 						" le "=>" <= ",
		// 						" and "=>" AND ",
		// 						" or "=>" OR ",
		// 						" && "=>" AND ",
		// 						" || "=>" OR ",
		// 						" not "=>" NOT ",
		// 						// "add"=>"",
		// 						// "sub"=>"",
		// 						// "mul"=>"",
		// 						// "div"=>"",
		// 						// "mod"=>"",
		// 						"=("=>" IN(",
		// 						"eq("=>" IN(",
		// 					];
		// 					$and[] = str_replace(array_keys($operators), array_values($operators), ' '.strtolower($request['$filter']).' ');
		// 				}
		// 				if ($and) {
		// 					$sql[] = "WHERE(".implode(')AND(', $and).")";
		// 				}
		// 				if (isset($request['$order'])) {
		// 					$sql[] = "ORDER BY {$request['$order']}";
		// 				}
		// 				if (isset($request['$skip'])) {
		// 					$sql[] = "OFFSET {$request['$skip']} ROWS FETCH NEXT {$top} ROWS ONLY";
		// 				}
		// 				if (isset($request['$top'])) {
		// 					$_GET['$skip'] = $_GET['$skip'] + $_GET['$top'];
		// 					$data['@odata.nextLink'] = "{$this->service_root}/Client({$client_id})/{$schemaname}?".urldecode(http_build_query($_GET));
		// 				}
		// 				// $sql = create_query($tablename, $properties, $id);
		// 				// response(200,[implode(PHP_EOL,$sql)]);
		// 				$res = sql_query($sql, [$client_id,$user_id]);
		// 				$value = [];
		// 				while ($row = sql_fetch($res)) {
		// 					$value[] = array_replace([
		// 						'@odata.id'=> "{$this->service_root}/Client({$client_id})/{$schemaname}({$row['id']})",
		// 					],$row);
		// 				}
		// 				$data['value'] = $value;
		// 				response(200,$data);
		// 			}
		// 		}
		// 	}
		// 	// response(200,[1,$client_id,$api]);
		// }
  }
  public function log($msg = ''){
    if (empty($this->body['log'])) $this->response['log']=[];
    $this->body['log'][] = $msg;
    return $this;
  }
  public function set($key, $value){
    $this->body[$key] = $value;
    return $this;
  }

  static function mail ($param = [], $options = []) {
		// echo '1';
    $param['from'] = $param['from'] ?: 'mailer@alicon.nl';
    if (empty($param['prio'])) {
			require_once(__DIR__.'/mailer.php');
      // debug($param);
      // error(400, self::$config->secret['mail']);
      $mailer = new Mailer(self::$config->secret['mail']);
      $mailer->send($param);
      // return $mailer;
    } else {
      sql_query("INSERT INTO [".Aim::$config->client_id."].dbo.mailer (data,prio) VALUES (?,?)", [
				json_encode($param),
				$param['prio'],
			]);
			// response(200,$param);
    }
  }
  static function sms ($recipients='', $body='', $originator='') {
		require_once ($_SERVER['DOCUMENT_ROOT'].'/../vendor/messagebird/php-rest-api/autoload.php');
		$messagebird = new MessageBird\Client($this->secret['config']['sms']['client_id']);
		$message = new MessageBird\Objects\Message;
		$message->originator = substr($originator ?: $_GET['originator'] ?: $put->originator ?: 'Aliconnect', 0, 11);
		$message->recipients = explode(';',$recipients ?: $_GET['recipients'] ?: $put->recipients);
		$message->body = $body?:$_GET['body'] ?: $put->body;
		$response = $messagebird->messages->create($message);
		return $response;
	}

	public function get_client_config($client_id, $public = true) {
		$config = [
      'client_id'=> $client_id,
      'service_root'=> 'https://aliconnect.nl/v1',
      'definitions'=> [],
    ];
		$filenameJson = "/aliconnect/config/client/{$client_id}.json";
		$filenameYaml = "/aliconnect/config/client/{$client_id}.yaml";

    if (file_exists($filenameYaml) && file_exists($filenameJson) && filemtime($filenameYaml)>filemtime($filenameJson)) {
			file_put_contents($filenameJson, json_encode(yaml_parse_file($filenameYaml), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
		}
		// if (file_exists($filenameYaml)) {
		// 	if (!file_exists($filenameJson)) {
		// 		file_put_contents($filenameJson, json_encode(yaml_parse_file($filenameYaml), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
		// 	}
		// }
		if (file_exists($filenameJson)) {
			$config = json_decode(file_get_contents($filenameJson), true);
		}
		else if (file_exists($filenameYaml)) {
			$config = yaml_parse_file($filenameYaml);
		}
		if ($public) {
			unset($config['secret']);
		}
		$config['client_id']= $client_id;
		return $config;

	}
  public function check_security($method){
    if (isset($method['security'])) {
      /** controleer scope */
      $scopes = explode(' ',$this->access['scope']);
      foreach ($method['security'] as $security) {
        if (isset($security['aliconnect'])) {
          if (empty(array_intersect($scopes,$security['aliconnect']))) error(401, 'invalid scope');
        }
      }
    }
  }
  public function db(){
    require_once(__DIR__.'/db.php');
    return new db;
  }

	static function sql_connect() {
		if (!isset(self::$conn)) {
      $dbs = self::$config->secret['sqlsrv'];
			self::$conn = sqlsrv_connect( empty($dbs['server']) ? 'localhost' : $dbs['server'], [
        'UID'=> $dbs['user'],
        'PWD'=> $dbs['password'],
				'Database'=> $dbs['database'],
				'ReturnDatesAsStrings'=> true,
				'CharacterSet'=> 'UTF-8'
			]);
      if( self::$conn === false ) {
        error(500, sqlsrv_errors());
      }
		}
    return self::$conn;
	}
  static function sql_query($query, $args = []) {
    response(500, 'Depricated');
		// self::sql_connect();
		// if (is_array($query)) {
		// 	$query = implode(PHP_EOL,$query);
		// }
    // $curTime = microtime(true);
		// $res = sqlsrv_query ( self::$conn, $query, $args, ['Scrollable'=> 'buffered']);
    // if( $res === false ) {
    //   if( ($errors = sqlsrv_errors() ) != null) {
    //     error_log("SQL CONNECT ".json_encode($errors,JSON_PRETTY_PRINT));
    //     error(500, $errors);
    //     // foreach( $errors as $error ) {
    //     //   echo "SQLSTATE: ".$error[ 'SQLSTATE']."<br />";
    //     //   echo "code: ".$error[ 'code']."<br />";
    //     //   echo "message: ".$error[ 'message']."<br />";
    //     // }
    //   }
    // }
    // return $res;
  }

	public function sql_query1($query, $args = []) {
    response(500, 'Depricated');
		// self::sql_connect();
		// if (is_array($query)) {
		// 	$query = implode(PHP_EOL,$query);
		// }
		// // try {
		// // $query = (isset($nopre) ? '' : 'SET TEXTSIZE -1;SET NOCOUNT ON;').$query;
		// // error_log($query."\n", 3, "\aliconnect\logs\sql.log");
		// // debug_log($query.PHP_EOL);
    // $curTime = microtime(true);
		// if ($res = sqlsrv_query ( self::$conn, $query, $args, ['Scrollable'=> 'buffered'])) {
    //   // error_log(PHP_EOL.date("d-m-y H:i:s")." ".(round(microtime(true) - $curTime,3)*1000)."ms ".$query, 3, "\aliconnect\logs\sql.log");
		// 	return $res;
		// }
		// // error(400, $query);
		// // }
		// // catch (Exception $e) {
		// //   echo 'Caught exception: ',  $e->getMessage(), "\n";
		// //   die();
		// // }
  }
	public function sql_exec($proc_name, $args = []) {
    response(500, 'Depricated');
		return sql_query("EXEC {$proc_name} ".implode(',',array_map(function($k){return "@$k=?";},array_keys($args))),array_values($args));
		// $stmt = sqlsrv_prepare($this->conn, $sql, $args);

  }
  public function sql_fetch($res, $fetchType = SQLSRV_FETCH_ASSOC) {
    response(500, 'Depricated');
    return sqlsrv_fetch_array($res, $fetchType);
    // return array_convert_key_case(sqlsrv_fetch_array($res, $fetchType));
  }
}

function sql_fetch($res, $fetchType = SQLSRV_FETCH_ASSOC) {
  return sqlsrv_fetch_array($res, $fetchType);
}
function sql_query($query, $args = []) {
  if (is_array($query)) {
    $query = implode(PHP_EOL,$query);
  }
  $curTime = microtime(true);
  // error_log($query.PHP_EOL.json_encode($args).PHP_EOL, 3, "\aliconnect\logs\sql.log");
  $res = sqlsrv_query ( Aim::sql_connect(), $query, $args, ['Scrollable'=> 'buffered']);
  if( $res === false ) {
    if( ($errors = sqlsrv_errors(SQLSRV_ERR_ERRORS) ) != null) {
      error_log("SQL QUERY ".json_encode($errors,JSON_PRETTY_PRINT));
      $errors = array_map(function($e){return preg_replace('/\[.*?\]/','',$e['message']);}, $errors);
      $errors[] = $query;
      $errors[] = json_encode($args);
      error(500,implode(PHP_EOL,$errors));
      // foreach( $errors as $error ) {
      //   echo "SQLSTATE: ".$error[ 'SQLSTATE']."<br />";
      //   echo "code: ".$error[ 'code']."<br />";
      //   echo "message: ".$error[ 'message']."<br />";
      // }
    }
  }
  return $res;
}
function sql_exec($proc_name, $args = []) {
  return sql_query("EXEC {$proc_name} ".implode(',',array_map(function($k){return "@$k=?";},array_keys($args))),array_values($args));
}

function aim() { return $GLOBALS['aim']; }
function get_real_user_ip($default = NULL, $filter_options = 12582912) {
  $HTTP_X_FORWARDED_FOR = isset($_SERVER) && isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : getenv('HTTP_X_FORWARDED_FOR');
  $HTTP_CLIENT_IP = isset($_SERVER) && isset($_SERVER['HTTP_CLIENT_IP']) ? $_SERVER['HTTP_CLIENT_IP'] : getenv('HTTP_CLIENT_IP');
  $HTTP_CF_CONNECTING_IP = isset($_SERVER) && isset($_SERVER['HTTP_CF_CONNECTING_IP']) ? $_SERVER['HTTP_CF_CONNECTING_IP'] : getenv('HTTP_CF_CONNECTING_IP');
  $REMOTE_ADDR = isset($_SERVER)?$_SERVER['REMOTE_ADDR']:getenv('REMOTE_ADDR');

  $all_ips = explode(",", "$HTTP_X_FORWARDED_FOR,$HTTP_CLIENT_IP,$HTTP_CF_CONNECTING_IP,$REMOTE_ADDR");
  foreach ($all_ips as $ip) {
    if ($ip = filter_var($ip, FILTER_VALIDATE_IP, $filter_options))
    break;
  }
  return $_SERVER['HTTP_CLIENT_IP'] = $ip?$ip:$default;
}
function json_base64_encode ($obj){
	return str_replace(['+', '/','='], ['-','_',''], base64_encode($obj));
}
function par($k,$v) {
  return $k."='".str_replace("'","''",$v)."'";
}
function his($s){
  error_log(date("d-m-y H:i:s")." {$s}".PHP_EOL, 3, "\aliconnect\logs\his.log");
}
function error_handler($errno, $errstr, $errfile, $errline){
	return true;
}

function error($code = 400, $message = null, $backtrace = 1) {
  response($code,$message,$backtrace);
}

function ok($body = null) {response(200, $body);}
function http_response($code = 200, $body = null) {response($code, $body);}

function response($code = 200, $body = null) {
	$error_codes = [
		100=> ['status'=> 'Continue'],
		101=> ['status'=> 'Switching Protocols'],
		102=> ['status'=> 'Processing'],
		200=> ['status'=> 'OK'],
		201=> ['status'=> 'Created'],
		202=> ['status'=> 'Accepted'],
		203=> ['status'=> 'Non-Authoritative Information'],
		204=> ['status'=> 'No Content'],
		205=> ['status'=> 'Reset Content'],
		206=> ['status'=> 'Partial Content'],
		207=> ['status'=> 'Multi-Status'],
		300=> ['status'=> 'Multiple Choices'],
		301=> ['status'=> 'Moved Permanently'],
		302=> ['status'=> 'Found'],
		303=> ['status'=> 'See Other'],
		304=> ['status'=> 'Not Modified'],
		305=> ['status'=> 'Use Proxy'],
		306=> ['status'=> '(Unused)'],
		307=> ['status'=> 'Temporary Redirect'],
		308=> ['status'=> 'Permanent Redirect'],
		400=> ['status'=> 'Bad Request', 'message'=> 'De url is niet correct opgebouwd'],
		401=> ['status'=> 'Unauthorized', 'message'=> 'U heeft geen voldoende rechten', 'message'=> 'Er is een probleem met uw rechten op dit domein. Uw account is niet aanwezig of uw bevoegdheden zijn niet voldoende voor uw aanroep.'],
		402=> ['status'=> 'Payment Required'],
		403=> ['status'=> 'Forbidden'],
		404=> ['status'=> 'Not Found', 'message'=> "Deze pagina op {$_SERVER['SERVER_NAME']} kan niet worden gevonden" ],
		404=> ['status'=> 'Not Found', 'message'=> "Er is geen webpagina gevonden voor het webadres: {$_SERVER['REQUEST_URI']}" ],
		405=> ['status'=> 'Invalid input, validation error' ],
		405=> ['status'=> 'Method Not Allowed' ],
		406=> ['status'=> 'Not Acceptable' ],
		407=> ['status'=> 'Proxy Authentication Required' ],
		408=> ['status'=> 'Request Timeout' ],
		409=> ['status'=> 'Conflict' ],
		410=> ['status'=> 'Gone' ],
		411=> ['status'=> 'Length Required' ],
		412=> ['status'=> 'Precondition Failed' ],
		413=> ['status'=> 'Request Entity Too Large' ],
		414=> ['status'=> 'Request-URI Too Long' ],
		415=> ['status'=> 'Unsupported Media Type' ],
		416=> ['status'=> 'Requested Range Not Satisfiable' ],
		417=> ['status'=> 'Expectation Failed' ],
		418=> ['status'=> "I\'m a teapot" ],
		419=> ['status'=> 'Authentication Timeout' ],
		420=> ['status'=> 'Enhance Your Calm' ],
		422=> ['status'=> 'Unprocessable Entity' ],
		423=> ['status'=> 'Locked' ],
		424=> ['status'=> 'Failed Dependency' ],
		// Unknown in chrome
		424=> ['status'=> 'Method Failure' ],
		425=> ['status'=> 'Unordered Collection' ],
		426=> ['status'=> 'Upgrade Required' ],
		428=> ['status'=> 'Precondition Required' ],
		429=> ['status'=> 'Too Many Requests' ],
		431=> ['status'=> 'Request Header Fields Too Large' ],
		444=> ['status'=> 'No Response' ],
		449=> ['status'=> 'Retry With' ],
		450=> ['status'=> 'Blocked by Windows Parental Controls' ],
		451=> ['status'=> 'Unavailable For Legal Reasons' ],
		494=> ['status'=> 'Request Header Too Large' ],
		495=> ['status'=> 'Cert Error' ],
		496=> ['status'=> 'No Cert' ],
		497=> ['status'=> 'HTTP to HTTPS' ],
		499=> ['status'=> 'Client Closed Request'],
		500=> ['status'=> 'Internal Server Error'],
		501=> ['status'=> 'Not Implemented'],
		502=> ['status'=> 'Bad Gateway'],
		503=> ['status'=> 'Service Unavailable'],
		504=> ['status'=> 'Gateway Timeout'],
		505=> ['status'=> 'HTTP Version Not Supported'],
		506=> ['status'=> 'Variant Also Negotiates'],
		507=> ['status'=> 'Insufficient Storage'],
		508=> ['status'=> 'Loop Detected'],
		509=> ['status'=> 'Bandwidth Limit Exceeded'],
		510=> ['status'=> 'Not Extended'],
		511=> ['status'=> 'Network Authentication Required'],
		598=> ['status'=> 'Network read timeout error'],
		599=> ['status'=> 'Network connect timeout error'],
	];
  // if (!class_exists('\Aliconnect')) return;
  // $ms = time()-$_SERVER['REQUEST_TIME'];
	$headers = array_change_key_case(getallheaders(), CASE_LOWER);
	// http_response_code($code);
  if ($code >= 400) {
		$trace = debug_backtrace();
		$trace = array_map(function($trace){return ['file'=> $trace['file'],'line'=> $trace['line']]; },$trace);
		array_shift($trace);
		$error = array_replace([
      "code"=> $code,
    ], $error_codes[$code], [
			"message"=> $body,
			"innererror"=> [
				"trace"=> $trace,
			],
		]);
    error_log(json_encode($error));
    // error_log(yaml_emit($error));
		// exit(json_encode($trace));
		if ($headers['sec-fetch-mode'] === 'navigate') {
			$request = $_SERVER['REQUEST_METHOD'].' '.$_SERVER['REQUEST_URI'];
			$body = "<html><head>
        <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no' />
        <style>
          * { box-sizing: border-box; }
          .message.error {
            font-family:'Segoe UI', Tahoma, sans-serif;
            position: fixed; margin: auto; top: 0; bottom: 0; left: 0; right: 0;
            background-color: rgba(0,0,0,0.1);
            z-index:500;
            word-break: break-all;
          }
          .message.error>div{
            display: flex;
            flex-flow: column;
            position: absolute; margin: auto; top: 50px; bottom: 50px; left: 0; right: 0;
            max-width: 1000px;
            cursor: pointer;
            margin: auto;
            padding: 50px;
            background: white;
          }
          .message.error pre {
            padding: 10px;
            display: block;
            white-space: pre-wrap;
          }
          .message.error pre.err{
            overflow: auto;
            background-color: rgb(255,240,240);
            flex: 1 1 auto;
          }
        </style>
      </head>
      <body><div class='message error'><div>
        <h1>{$code} {$error['status']}</h1>
        <pre>{$request}</pre>
        <pre class='err'><ol><li>".implode("</li><li>", array_map(function($trace){return "{$trace['file']}:{$trace['line']}";}, $trace))."</li></ol>".json_encode($body, JSON_PRETTY_PRINT)."</pre>
      </div></div></body></html>";
		} else {
			header("Content-Type: application/json");
			$body = json_encode(["error"=> $error]);
			// exit(json_encode($body));
		}
  }
  if (!is_null($body) && !is_string($body)) {
    header("Content-Type: application/json");
    $body = json_encode($body, JSON_UNESCAPED_SLASHES);
  }
  // onderstaande check is nodig omdat een request dubbel wordt uitgeveord en een cors probleem ontstaat
  if ($_SERVER['REQUEST_METHOD']!=='OPTIONS') {
    http_response_code($code);
  }
  exit($body);
}

function array_convert_key_case($array, $callback = 'lcfirst') {
  return $array ? array_combine(
    array_map($callback, array_keys($array)),
    array_values($array)
  ) : $array;
}
function create_query($tablename, $properties, $id=null){
	// $request = array_change_key_case($_REQUEST);
	// $sql = ["SET TEXTSIZE -1;SET NOCOUNT ON;"];
	// $sql[] = "SELECT";
	// $top = empty($_REQUEST['$top']) ? 10 : $_REQUEST['$top'];
	// if (empty($_REQUEST['$skip'])) {
	// 	$sql[] = "TOP {$top}";
	// }
	//
	// if (isset($request['$select'])) {
	// 	$request_select = explode(',',strtolower($request['$select']));
	// 	$properties = array_filter($properties,function($v)use($request_select){return in_array(strtolower($v),$request_select);},ARRAY_FILTER_USE_KEY);
	// }
	// unset($properties['id']);
	// $select = array_keys($properties);
	// array_unshift($select,'lower(id) AS id');
	// $sql[] = implode(',',$select);
	// $sql[] = 'FROM '.$tablename;
	// if ($id) {
	// 	$sql[] = "WHERE id = '{$id}'";
	// 	return $sql;
	// }
	// $and = [];
	// if (isset($GLOBALS['client_id'])) {
	// 	$and[] = "clientId='{$GLOBALS['client_id']}'";
	// }
	// if (!empty($request['$filter'])) {
	// 	$operators = [
	// 		" eq null "=>" IS NULL ",
	// 		" ne null "=>" IS NOT NULL ",
	// 		" eq "=>" = ",
	// 		" ne "=>" <> ",
	// 		" gt "=>" > ",
	// 		" ge "=>" >= ",
	// 		" lt "=>" < ",
	// 		" le "=>" <= ",
	// 		" and "=>" AND ",
	// 		" or "=>" OR ",
	// 		" && "=>" AND ",
	// 		" || "=>" OR ",
	// 		" not "=>" NOT ",
	// 		// "add"=>"",
	// 		// "sub"=>"",
	// 		// "mul"=>"",
	// 		// "div"=>"",
	// 		// "mod"=>"",
	// 		"=("=>" IN(",
	// 		"eq("=>" IN(",
	// 	];
	// 	$and[] = str_replace(array_keys($operators), array_values($operators), ' '.strtolower($request['$filter']).' ');
	// }
	// if ($and) {
	// 	$sql[] = "WHERE(".implode(')AND(', $and).")";
	// }
	// if (isset($request['$order'])) {
	// 	$sql[] = "ORDER BY {$request['$order']}";
	// }
	// if (isset($request['$skip'])) {
	// 	$sql[] = "OFFSET {$request['$skip']} ROWS FETCH NEXT {$top} ROWS ONLY";
	// }
	// // $sql[] = "TOP ".(isset($request['$top']) ? $request['$top'] : 10);
	// return $sql;
}
function nok($code,$body = null) {
	response($code, $body);
}
function array_get_key(array $keys, array $array) {
  foreach ($keys as $key) $array = $array[$key];
  return $array;
}
function getProfile($idToken) {
	$token_parts = explode('.', $idToken);
	$token = strtr($token_parts[1], '-_', '+/');
	$jwt = base64_decode($token);
	$json_token = json_decode($jwt, true);
	return $json_token;
}

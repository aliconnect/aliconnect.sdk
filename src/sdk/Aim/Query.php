<?php
namespace Aim;

class Query {
  public static $conn;
  public function __construct($query = null)
  {
    $this->connect();
    if ($query) {
      $this->query($query);
    }
    // // new \Aliconnect\Debug($secret['config']['dbs']);
    // // // $this->dbconn =
  }
  public function connect() {
    if (!self::$conn) {
      $secret = yaml_parse_file(getcwd().'/../config/secret.yaml');
      $dbs = $secret['config']['dbs'];
      self::$conn = self::$conn ?: sqlsrv_connect($dbs['server'],[
        'Database' => $dbs['database'],
        'UID' => $dbs['user'],
        'PWD' => $dbs['password'],
        'ReturnDatesAsStrings' => true,
        'CharacterSet' => 'UTF-8'
      ]);
    }
  }
  public function query($query) {
    try {
			$query = (isset($nopre) ? '' : 'SET TEXTSIZE -1;SET NOCOUNT ON;').$query;
			$res = sqlsrv_query ( self::$conn, $query , null, ['Scrollable' => 'buffered']);
			return $res;
		} catch (Exception $e) {
			echo 'Caught exception: ',  $e->getMessage(), "\n";
			die();
		}
  }
}

<?php
define('__startTime', microtime(true) * 1000);

// function set($selector, $context) {
//
// }
// function get($selector, $context = []) {
//   $AIM = $GLOBALS['aim'];
//   foreach ([(array)$context, $_COOKIE, $_GET, $_POST, $_SERVER, $GLOBALS] as $context) {
//     if (array_key_exists($selector, $context)) {
//       return $context[$selector];
//     }
//   }
//
// }
//



// function debug() {
// 	$t = round(microtime(true)*1000-__startTime);
// 	$arg_list = func_get_args();
// 	$bt = debug_backtrace();
// 	// die(isset($bt[1]));
//   if (isset($bt[1])) {
//     $bt0 = (object)$bt[0];
//     $bt1 = (object)$bt[1];
//     $url = new url($bt0->file);
//     $class = isset($bt1->class) ? $bt1->class : '';
//     $function = isset($bt1->function) ? $bt1->function : '';
//     array_unshift ($arg_list, "$url->basename:$bt0->line $function $t ms");
//   }
// 	header('Content-Type: application/json');
// 	die(json_encode($arg_list,JSON_PRETTY_PRINT,JSON_UNESCAPED_SLASHES));
// }
function schemaName($row) {
  $schema = isset($row['schemaPath']) ? $row['schemaPath'] : $row['schema'];
  return current(
    array_filter(
      explode(':',$schema),
      function($val){
        return isset(aim()->api->components->schemas->$val);
      }
    )
  ) ?: 'Item';
}
function itemrow($row){
  // debug ($row);
  $row = (array)$row;
  foreach (['files','Categories', 'filterfields'] as $key) {
    if (isset($row[$key])) $row[$key] = json_decode($row[$key]);
  }
  foreach (['CreatedBy','ModifiedBy','Owner','User','Host','Source','Master'] as $key) {
    if (isset($row[$key])) $row[$key] = ['@id' => API_ROOT_URL.$row[$key]];
  }
  foreach (['LastModifiedDateTime','CreatedDateTime','StartDateTime','EndDateTime','FinishDateTime','IndexedDateTime'] as $key) {
    if (isset($row[$key]) && ($date = date_create($row[$key]))) {
      $row[$key] = $date->format('Y-m-d\TH:i:s.u\Z');
    }
  }
  foreach (['HasChildren','HasAttachements','IsClass','IsSelected','IsRead','IsPublic'] as $key) {
    if (isset($row[$key])) {
      $row[$key] = $row[$key] ? true : false;
    }
  }
  $schemaName = schemaName($row);
  // if (isset($row['header0'])) $row['header0'] = strip_tags($row['header0']);
  // if (isset($row['header1'])) $row['header1'] = strip_tags($row['header1']);
  // if (isset($row['header2'])) $row['header2'] = strip_tags($row['header2']);
  return array_replace(
    [
      '@id' => API_ROOT_URL."$schemaName($row[_ID])",
      'Id' => base64_encode(API_ROOT_URL."$schemaName($row[_ID])"),
      'schema' => $schemaName ?: 'Item',
      // 'schema2' => $schemaName,
      'UID' => empty($row['UID']) ? '' : $row['UID'],
      'ID' => isset($row['ID']) ? $row['ID'] : (isset($row['_ID']) ? $row['_ID'] : $row['id'])
      // 'Id' => base64_encode(json_encode(array_intersect_key($row,$IdIntersectKeys)))
    ],
    array_diff_key($row, IdIntersectKeys, ['_ID' => 0])
  );
}


function id($id){
  return (int)strtok($id,'-');
}
function uid($id){
  return substr($id,strpos($id,'-')+1);
}
function start_session() {
  session_start();
  setcookie(session_name(),session_id(),time() + 365 * 24 * 60 * 60);
}
function mobile_browser() {
  return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}
function array_end($arr) {
	return end($arr);
}
function ordered_list($order,&$rows) {
  foreach (array_reverse(explode(',',$order)) as $orderkey) {
    $orderdir = explode(' ',$orderkey);
    $orderkey = array_shift($orderdir);
    $orderdir = array_shift($orderdir);
    $orderby = [];
    foreach ($rows as $key => $row) {
      $orderby[$key] = is_object($row->$orderkey)
      ? $row->$orderkey->Value
      : $row->$orderkey;
    }
    // $orderarr = array_column($rows, $key);
    array_multisort($orderby, $orderdir == 'DESC' ? SORT_DESC : SORT_ASC, SORT_NATURAL|SORT_FLAG_CASE, $rows);
  }
}
function translate($post) {
  $options = [
    CURLOPT_URL => "https://translation.googleapis.com/language/translate/v2?key=".aim()->secret['config']['google']['translate_key'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($post),//http_build_query($post),
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
  ];
  // $ch = curl_init('https://translation.googleapis.com/language/translate/v2?key=AIzaSyAKNir6jia2uSgmEoLFvrbcMztx-ao_Oys');
  $curl = curl_init();
  curl_setopt_array($curl, $options);
  $result = curl_exec($curl);
  curl_close($curl);
  // die($result);
  // debug($post,$param,$result);
  // die($result);
  $result = json_decode($result, true);
  if ($result['error']) {
    return $result;
  }
  $translate = [];
  if (isset($result->data->translations)) {
    foreach ($result->data->translations as $i => $translation) {
      $translate[] = isset($translation->translatedText) ? $translation->translatedText : $post['q'][$i];
    }
  }
  return $translate;
}
function is_assoc(array $arr) {
    if (array() === $arr) return false;
    return array_keys($arr) !== range(0, count($arr) - 1);
}
function videorecorder_add () {
  // debug(file_get_contents('php://input'));
  aim()->query(
    "INSERT INTO aimhis.dbo.camfile (camId,startDateTime,duration,filename) VALUES (%s,%s,%s,%s)",
    $_GET['cam_id'],
    $_GET['start'],
    $_GET['duration'],
    $_GET['name']
  );
  $content = base64_decode(explode('base64,',file_get_contents('php://input'))[1]);
  file_put_contents($_SERVER['DOCUMENT_ROOT'].'/shared/videorecorder/'.$_GET['name'], $content);
  die();
  debug(1);
}
function check_postcondition ($arr) {
	foreach ($arr as $key) {
		if (empty($_POST[$key])) throw new Exception('Precondition Failed', 412);
	}
}
function pathname($url) {
	$url = parse_url($url);
	return substr($url['path'],0,strrpos($url['path'],'/'));
}
function sql_build_exec($procname,$param) {
	return 'EXEC '.$procname.' '.implode(',',array_map(function($key, $value) { return "@$key='$value'"; }, array_keys($param), array_values($param)));
}
function json_base64_encode ($obj){
	return str_replace(['+', '/','='], ['-','_',''], base64_encode($obj));
}
function jwt_encode ($payload, $secret = null, $alg = 'sha256') {
	$payload=is_string($payload)?json_decode($payload):(object)$payload;
	$jwt=implode('.',[
		$base64UrlHeader = json_base64_encode(json_encode(['typ'=>'JWT', 'alg'=>$alg])),
		$base64UrlPayload = json_base64_encode(json_encode($payload)),
		$base64UrlSignature = json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true))
	]);
	return $jwt;
}
function jwt_decode ($jwt, $secret = null, $alg = 'sha256') {
	$arr = explode('.', $jwt);
	$base64UrlHeader = $arr[0];
	$base64UrlPayload = $arr[1];
	$signature = $arr[2];
	$result = [
		// 'header'=> json_decode(base64_decode($base64UrlHeader = array_shift($arr))),
		'payload'=> $payload = json_decode(base64_decode($base64UrlPayload)),
		'valid'=> $arr[2] === json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true)),
		'expired'=> $payload->exp < time(),
		// 'signature'=> array_shift($arr)
	];
	return (object)$result;
}
function get_token ($jwt, $secret = null) {
	$arr = explode('.', $jwt);
	$base64UrlHeader = $arr[0];
	$urlHeader = json_decode(base64_decode($base64UrlHeader), true);
	$alg = $urlHeader['alg'];
	if (empty($arr[1])) return;
	// error_log('ARR_1 '.$arr[1]);
	$base64UrlPayload = $arr[1];
	$signature = $arr[2];
	$token_signature = json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true));
	// $token_signature = json_base64_encode(hash_hmac($alg, $base64UrlHeader . '.' . $base64UrlPayload, strtolower($secret), true));
	$payload = json_decode(base64_decode($base64UrlPayload), true);
	// error_log(json_encode([
	// 	$_SERVER['HTTP_HOST'].$secret,
	// 	$signature,
	// 	$token_signature,
	// 	$payload['sct'],
	// 	$payload['exp'] < time() ? "timeout" : "",
	// ]));
	if ($secret && $signature !== $token_signature) {
		// debug($secret, $signature, $token_signature, $payload, $_SERVER['HTTP_HOST']);
		// die(http_response_code(401)); // Unauthorized
		// return;
		// debug('SECRET', $payload);
		// throw new Exception('Unauthorized', 401);
	}
	if (isset($payload['exp']) && $payload['exp'] < time()) {
		// die(http_response_code(401)); // Unauthorized
		// return;
		// debug('EXP', $payload);
		// debug($payload['exp'], time());
		// die(http_response_code(401)); // Unauthorized
		// die(http_response_code(408)); // Request Timeout
		// throw new Exception('Unauthorized', 401);
		// throw new Exception('Request Timeout', 408);
	}
	return $payload;
}
function unparse_url($parsed_url) {
	extract($parsed_url);
	if (!empty($hostname)) $host = $hostname;
	if (!empty($protocol)) $scheme = $protocol;
	return
	( empty($scheme) ? '' : trim($scheme,':') . '://' ) .
	( empty($host) ? '' : $host ) .
  ( empty($port) ? '' : ':' . $port ) .
  ( empty($user) ? '' : $user . ( empty($pass) ? '' : ':' . $pass ) . '@' ) .
	( empty($basePath) ? '' : $basePath ) .
	( empty($path) ? '' : $path ) .
  ( empty($query) ? '' : '?' . (is_array($query) ? http_build_query($query) : $query) ) .
  ( empty($fragment) ? '' : '#' . $fragment );
}
function array_change_key_case_recursive($arr, $case=CASE_LOWER) {
	return array_map(function($item)use($case){
		if(is_array($item)) {
			$item = array_change_key_case_recursive($item, $case);
		}
		return $item;
	},array_change_key_case($arr, $case));
}
function aim_log ($message, $message_type, $data = null) {
	error_log("Exception $message_type, $message");
	if ($message_type === MESSAGE_TYPE_MAIL) {
		aim()->mail([
			'send'=> 1,
			'to'=> LOG_MAILTO,
			'chapters'=> [
				[
					'title' => 'Aliconnect log ' . $message,
					'content'=> json_encode($data, JSON_PRETTY_PRINT),
				],
			],
		]);
	} else if ($message_type >= 100) {
		throw new Exception($message, $message_type);
	}
}
function extract_hostname($httphost) {
	$httphost = str_replace('www.','',$httphost);
	$httphost = str_replace('localhost','aliconnect.nl',$httphost);
	$host_array = array_reverse(explode('.', $httphost));
	if (isset($host_array[2]) && $host_array[0] === 'nl' && $host_array[1] === 'aliconnect') {
		return $host_array[2];
	}
}
function phone_number($phone_number) {
  return is_numeric($phone_number) && $phone_number < 999999999 ? $phone_number = 31000000000 + $phone_number : $phone_number;
}
function get_dir_size($directory){
    $size = 0;
    $files = glob($directory.'/*');
    foreach($files as $path){
        is_file($path) && $size += filesize($path);
        is_dir($path)  && $size += get_dir_size($path);
    }
    return $size;
}
function hasScope($security, $access_scope) {
  $access_scope_array = explode(' ', trim($access_scope));
  // debug($security,$access_scope_array);
  foreach ($access_scope_array as $access_scope_name) {
    foreach ($security as $security_row) {
      foreach($security_row as $auth_name => $auth_array) {
        foreach ($auth_array as $auth_scope_name) {
          if (strpos($auth_scope_name, $access_scope_name) === 0) {
            // debug($access_scope_name, $auth_scope_name);
            return true;
          }
        }
      }
    }
  }
}

// function par($selector = null, $context = null) {
//   if (empty($GLOBALS['params'])) {
//     $GLOBALS['params'] = [];
//   }
//   // debug($GLOBALS['params'], $selector, $context);
//   $selector = is_object($selector) ? (array)$selector : $selector;
//   if (is_array($selector)) {
//     foreach ($selector as $key => $value) {
//       if (!is_object($value) && !is_array($value)) {
//         $GLOBALS['params'][$key] = $value;
//       }
//     }
//   } else if ($selector) {
//     if (is_null($context)) {
//       if (isset($GLOBALS['params'][$selector])) {
//         return $GLOBALS['params'][$selector];
//       }
//       if (isset($_GET[$selector])) {
//         return $_GET[$selector];
//       }
//       if (isset($_POST[$selector])) {
//         return $_POST[$selector];
//       }
//       if (isset($_COOKIE[$selector])) {
//         return $_COOKIE[$selector];
//       }
//       if (isset($GLOBALS[$selector])) {
//         return $GLOBALS[$selector];
//       }
//       return null;
//     }
//     return $GLOBALS['params'][$selector] = $context;
//   }
//   return $GLOBALS['params'];
// }

function request_type_translate() {
  $fname = __DIR__."/lang/$_GET[lang].yaml";
  header('Content-type: application/json');
  die(json_encode(yaml_parse_file($fname), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

<?php
namespace Aim;

function json_base64_encode ($obj){
	return str_replace(['+', '/','='], ['-','_',''], base64_encode($obj));
}

class Jwt {
  private $base64UrlHeader;
  private $base64UrlPayload;
  private $secret;
  private $base64UrlSignature;
  public function __construct ($jwt = null, $secret = null) {
    $this->alg = 'sha256';
    $this->expires_after = 3600;
    $this->payload = null;
    $this->decode($jwt);
    $this->validate($secret);
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
  public function expires_after($expires_after) {
    $this->expires_after = $expires_after;
    return $this;
  }
  public function decode($jwt) {
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
  public function get($payload = null, $secret = null) {
    $this->set($payload);
    $this->secret($secret);
    // $this->payload['iat'] = $time = time();
    // $this->payload['exp'] = $time + $this->expires_after;
    return $this->token = implode('.',[
  		$this->base64UrlHeader = json_base64_encode(json_encode(['typ'=>'JWT', 'alg'=>$this->alg])),
  		$this->base64UrlPayload = json_base64_encode(json_encode($this->payload)),
  		$this->base64UrlSignature = json_base64_encode(hash_hmac($this->alg, $this->base64UrlHeader . '.' . $this->base64UrlPayload, strtolower($this->secret), true))
  	]);
  }
  public function validate($secret = null) {
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
      return $this->valid = $this->base64UrlSignature === $this->signature;
    }
  }
}

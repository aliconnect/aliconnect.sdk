<?php
namespace Aliconnect\Server\Auth;

// class Server extends Aliconnect\Api {
//   public function token ($account, $expires_in, $options) {
//     return (new \Aim\Jwt)->get(array_merge([
//       // 'iss'=> 'https://login.aliconnect.nl',
//       'iss'=> $_SERVER['HTTP_HOST'],
//       'client_id' => aim_uid($account->client_id),
//       'exp' => time() + $expires_in,
//       'iat' => time(),
//     ], $options), $account->client_secret);
//   }
//   // public function code_token ($account) {
//   //   return $this->token($account, 200, [
//   //     'token_type' => 'Bearer',
//   //     'access_type' => 'offline',
//   //     'aud' => $account->clientId,
//   //     'sub' => $account->accountId,
//   //     'scope' => $account->scope,
//   //     'nonce' => $account->nonce,
//   //   ]);
//   // }
//   // public function access_token ($account, $options = []) {
//   //   return $this->token($account, 200, array_replace([
//   //     'token_type' => 'Bearer',
//   //     'aud' => $account->clientId,
//   //     'sub' => $account->accountId,
//   //     'scope' => $account->scope,
//   //     'nonce' => $account->nonce,
//   //   ], $options));
//   // }
//
//
//
//
//   // public function init() {
//   //
//   // }
//   // public function init() {
//   //   debug(1);
//   // }
//   // public function init() {
//   //   // debug($this->root,$this->pathname);
//   //   $client_id = $this->request('client_id');
//   //   $account_id = $this->account_id;
//   //   // $scopes = $this->get_granted_scopes($client_id, $account_id);
//   //   $this->init_config($client_id);
//   //   $this->init_api($this->scopes);
//   //   $this->handle_api_call($this->pathname, $this->scopes);
//   // }
//   // public function get () {
//   //   debug(__DIR__);
//   // }
// }

<?php
namespace Aliconnect\Server\Auth;

use function Aliconnect\aim;

class Api {
  public function __construct() {
    aim()->init();
  }
}

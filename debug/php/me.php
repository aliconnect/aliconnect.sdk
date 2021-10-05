<?php
class me {
  function get() {
    if (!aim()->access['sub']) debug ('error');
    aim()->access['aud'] = 1;
    $item = new item('Contact',id(aim()->access['sub']));
    $item = $item->get();
    foreach ($item as $key => $value) {
      $item[$key] = $value->Value ?: $value;
    }
    return $item;
  }
}

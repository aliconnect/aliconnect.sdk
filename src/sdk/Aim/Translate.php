<?php
namespace Aim;

class Translate extends \Aim
{
  public function get($param) {
    $lang = $this->request('lang', $param);
    if (!is_file($fname = $this->root."/translations/$lang.yaml")) {
      $translate_template = yaml_parse_file($this->root."/translations/nl.yaml");
      $arr_values = array_chunk(array_values($translate_template), 100);
      $arr_keys = array_chunk(array_keys($translate_template), 100);
      $translate = [];
      foreach ($arr_values as $i => $chuck) {
        $result = translate([
        'q' => $chuck,
        'source' => 'en',
        'target' => $lang,
        ]);
        if ($result['error']) {
          $translate = $translate_template;
          break;
        }
        $translate = array_merge($translate,array_combine($arr_keys[$i], $result));
      }
      yaml_emit_file($fname,$translate);
    }
    http_response(200, yaml_parse_file($fname));
  }
}

<?php
class server {
  public function print($html, $printer_id) {
    aim()->query("INSERT INTO printer.dt (data, printer_id) VALUES ('%s','%s');", $html, $printer_id);
  }
}

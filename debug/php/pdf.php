<?php
class pdf {
  public function __construct () {
    require_once(__DIR__.'/dompdf/dompdf_config.inc.php');
    $this->dompdf = new DOMPDF();
  }
  public function output($html) {
    $this->dompdf->load_html($html);
    // $this->dompdf->set_base_path('');
    $this->dompdf->set_paper('A4', 'portrait');
    $this->dompdf->render();
    $this->dompdf->stream('document.pdf', array("Attachment" => false));
    // >output();
  }
}

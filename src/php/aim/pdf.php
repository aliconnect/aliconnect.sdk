<?php
namespace Aim;
use Dompdf\Dompdf;

class Pdf {
  public function get() {
    $dompdf = new Dompdf();
    $dompdf->set_option('isRemoteEnabled', TRUE);
    $dompdf->load_html('<link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/pdf.css" rel="stylesheet" />'.'HOI');
    $dompdf->set_paper("a4");
    // $dompdf->setBasePath($this->projectDir . DIRECTORY_SEPARATOR . 'www');
    // $dompdf->set_base_path($_SERVER['DOCUMENT_ROOT']'https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/pdf.css');
    $dompdf->render();
    $dompdf->stream("HALLO.pdf", array("Attachment" => false));
    die();
    // die('a');
  }
  public function post() {
    $input = file_get_contents('php://input');
    $dompdf = new Dompdf();
    $dompdf->set_option('isRemoteEnabled', true);
    $dompdf->load_html('<link href="https://aliconnect.nl/aliconnect/aliconnect.sdk/src/css/pdf.css" rel="stylesheet" />'.$input);
    $dompdf->set_paper("a4");
    $dompdf->render();
    $dompdf->stream("JA.pdf", array("Attachment" => false));
    die();
    // die('a');
  }
}

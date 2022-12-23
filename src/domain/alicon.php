<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use Dompdf\Dompdf;
use Aim\Jwt;

sql_query("USE aliconadmin");

Aim::$config->extend([
  'paths'=> [
    '/jaarverslag'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            "EXEC b17.balansget {$_REQUEST['jaar']}",
          ]);
        },
      ],
    ],
    '/grootboek'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            // "SELECT * FROM api.grootboek1 WHERE Jaar = ? ORDER BY CompanyId,Jaar,BoekNr",
            "EXEC api.grootboek ?",
          ], [$_REQUEST['jaar']]);
        },
      ],
    ],
    '/balans'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            "SELECT jaar,q,bedrijf,boeknr,boekOms,relatie,datum,excl,btw
            FROM b17.boeking
            WHERE jaar={$_REQUEST['jaar']} and bedrijf_id in (2,3,4)
            ORDER BY boeknr,boekOms,datum,relatie",
            "SELECT datum,bankId,rekening,AfBijBedrag * cASE WHEN AfBij = 'AF' THEN -1 ELSE 1 END AS bedrag FROM dbo.bank WHERE DATEPART(year,datum) = {$_REQUEST['jaar']}",
            // "SELECT * FROM dbo.bank WHERE DATEPART(year,datum) = {$_REQUEST['jaar']}",
            "SELECT * FROM gb.boekingBank WHERE bankid IN (SELECT bankid FROM dbo.bank WHERE DATEPART(year,datum) = {$_REQUEST['jaar']})",
          ]);
        },
      ],
    ],
    '/boekbalans'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            "SELECT jaar,bedrijfId,boekNr,mutatie,beginwaarde,eindwaarde,eindwaardeAangifte
            FROM tblBoekBalans",
          ]);
        },
      ],
    ],
    '/boek'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            "SELECT jaar,q,bedrijf,boeknr,boekOms,relatie,datum,excl,btw
            FROM b17.boeking
            WHERE jaar=? and bedrijf_id in(2,3,4)
            ORDER BY boeknr,boekOms,datum,relatie",
          ],[
            $_REQUEST['jaar'],
          ]);
        },
      ],
    ],
    '/omzet'=> [
      'get'=> [
        'responses'=> [200=>['description'=>"successful operation"]],
        'operation'=> function($params) {
          $this->http_response_query([
            "EXEC api.omzetbelastingoverzicht",
          ]);
        },
      ],
    ],
  ],
]);

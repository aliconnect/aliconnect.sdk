<?php
namespace Proving;

use function Aliconnect\aim;
use Dompdf\Dompdf;

function make11nr ($inputnr) {
  $weegfactor = array(2,4,8,5,10,9,7,3,6,1,2,4,8,5,10,9);
  $l = ceil(strlen($inputnr)/4)*4;
  $l = strlen($inputnr);
  $sum = 0;
  for ($x = 0; $x < $l ; $x++) {
    $w=$weegfactor[$x];
    $n=substr($inputnr,$l-$x-1,1);
    $t=$w*$n;
    $sum+=$t;
  }
  return 11-($sum % 11).$inputnr;
}

class Factuur {
  public function __construct($factuur_id) {
    $factuur_nr = null;
    $faktuur = $this->faktuur = sqlsrv_fetch_object(aim()->sql_query(
      "SELECT * FROM api.vOrderInvoice WHERE ".($factuur_id ? "invoiceUid='$factuur_id'" : "invoiceNr=$factuur_nr"
    )));
    $client = $this->client = sqlsrv_fetch_object(aim()->sql_query(
      "SELECT * FROM api.vClient WHERE KeyName = '$faktuur->ClientKeyName'"
    ));
    $this->account = sqlsrv_fetch_object(aim()->sql_query(
      "SELECT * FROM api.vAccount WHERE AccountName = '$client->AccountName'"
    ));
    $res = aim()->sql_query(
      "SELECT Omschrijving,Netto,Aantal,Bedrag FROM api.vOrderRow WHERE OrderNr = $faktuur->OrderNr"
    );
    $this->rows = [];
    while ($row = sqlsrv_fetch_object($res)) $this->rows[] = $row;
    // aim()->http_response(200, [$q,$faktuur,$rows]);
    // if (!$faktuur->faktuurNr) {
    //   $faktuur=fetch_object(query("SELECT pakbonId,factuurNr,CONVERT(VARCHAR(50),uid)uid FROM abisingen.dbo.Bonnen1 WHERE ".($aim->id?"$aim->id IN(FaktuurNr,PakbonID)":"uid='$aim->uid'")));
    //   //err($faktuur);
    //   if ($aim->uid && $aim->uid!=$faktuur->uid) die('Wrong key');
    //   if ($aim->id=$faktuur->PakbonID) pakbon::get();
    //   die('Factuurnr niet bekend');
    // }
    // if ($aim->uid && $aim->uid!=$faktuur->uid) die('Wrong key');
    //
    // $_GET[id]=$aim->id=$faktuur->FaktuurNr;
    // if ($aim->extension==pdf) $_GET[pdf]=true;
    // //die(asdfasd);
    // require_once (__DIR__."/../../doc/doc.php");
    // //die(asdfasd);
    // die();
    //
    // die('a');
  }
  public function toHtml() {
    $html = file_get_contents(__DIR__.'/proving/faktuur.html');

    $options = [
      'accountName' => strtolower($this->client->AccountName),
      'Betalingskenmerk'=>implode('.',str_split(str_pad(make11nr($this->faktuur->InvoiceNr),16,'0', STR_PAD_LEFT),4)),
      'regels' => implode('',array_map(function($row){
        return'<tr><td>'.implode('</td><td>',array_values((array)$row)).'</td></tr>';
      }, $this->rows)),
    ];
    foreach ([$this->faktuur,$this->client,$this->account,$options] as $options) {
      foreach ($options as $key => $value) $html = preg_replace("/#$key#/",$value,$html);
    }

    // aim()->http_response(200, $html);
    $pdf = new Dompdf;
    $pdf->load_html($html);
    // $this->dompdf->set_base_path('');
    $pdf->set_paper('A4', 'portrait');
    $pdf->render();
    $pdf->stream('document.pdf', array("Attachment" => false));
    die();
  }
}

function dofactuur ($id,$dataname,$send,$makepdf) {
  $a=explode(';',$id);
  $post->keyId=array_pop($a);
  if ($_GET[uid]) $res = query ("EXEC abisingen.www.faktuurGet @uid='".$_GET[uid]."'");
  else $res = query ("EXEC abisingen.www.faktuurGet '$post->keyId'");
  $row = fetch_array($res);
  next_result ( $res );
  $bedrijf = strtolower($row[bedrijf]);
  $faktuurnr = $row['FaktuurNr'];
  $row[Datum]=date("d-m-Y",strtotime($row[Datum]));
  $downloadfilename = 'Factuur_'.str_replace(" ","_",$row[bedrijf]."_".$row[Firma]."_".$row[FaktuurNr]."_".str_replace('-','',$row[Datum]));
  $body = file_get_contents(__DIR__.'/faktuur.htm');
  if ($dataname=='faktuur_nietbetaald') {
    $body=str_replace('<div id="header">','<div id="header"><div class="herinner"></div>',$body);
  }
  $sjabloon = $_GET['sjabloon'];
  $body=str_replace("#Betalingskenmerk#",make11nr($row[FaktuurNr]),$body);
  $body=str_replace("#Tot#",n($row[Tot]),$body);
  $body=str_replace("#KortContant#",n($row[KortContant]),$body);
  $body=str_replace("#TotExcl#",n($row[TotExcl]),$body);
  $body=str_replace("#TotBTW#",n($row[TotBTW]),$body);
  $body=str_replace("#TotIncl#",n($row[TotIncl]),$body);
  $body=str_replace("#bedrijf#",$bedrijf,$body);
  foreach($row as $key => $value) $body=str_replace("#$key#",str_replace("\r","<br>",$value),$body);
  $subject="$bedrijf Faktuur $faktuurnr ".$row[datum];
  $pakbonid='';
  while ($row1 = fetch_object($res)) {
    if ($pakbonid!=$row1->pakbonid) {
      $regels .= PHP_EOL."<tr><td colspan=5><i>Pakbon ".$row1->pakbonid."</i></td></tr>";
      $pakbonid=$row1->pakbonid;
    }
    $regels .= PHP_EOL."<tr>";
    $c= '';
    $styler="style='text-align:right;width:1.5cm;'";
    $regels .= "<td style='width:13.3cm;'>".($row1->artnr?'Artnr:'.$row1->artnr.', ':'').($row1->omschrijving?icp($row1->omschrijving).", ":'').$row1->eenheid."</td><td $styler>".nv($row1->netto,2)."</td><td $styler>".n($row1->aantal,2)."</td><td style='text-align:right;width:2cm;'>".nv($row1->bedrag,2).'</td>';
    $regels .= "</tr>";
  }
  $body=str_replace ("#regels#",$regels,$body);
  if ($makepdf) {
    require_once ($_SERVER['DOCUMENT_ROOT'].'/aim/v1/api/aim-pdfdoc.php');
    $pdf = new pdfdoc();
    $pdf->name=$downloadfilename;
    $body=str_replace('="/','="'.$_SERVER['DOCUMENT_ROOT'].'/',$body);
    $pdf->make($body);
    if ($_GET[fuid]) $q="UPDATE abisingen.dbo.fakturen1 SET status=CASE WHEN gezienDt IS NULL THEN 'Gezien' ELSE status END,gezienDt=ISNULL(gezienDt,GETDATE()) where faktuurnr='$post->keyId'";
    else $q="UPDATE abisingen.dbo.fakturen1 SET status='Geprint',DatumGeprint=ISNULL(DatumGeprint,GETDATE()) where faktuurnr='$post->keyId'";
    query($q);
    if ($_GET[filename]) { $pdf->save($_GET[filename]); return; }
    else $pdf->write();
    die();
  }
  else
  exit($body);
}



class Lijst {
  private function query($query) {
    $res = aim()->sql_query($query);
    $items=[];
    while ($row = sqlsrv_fetch_object($res)) {
      $items[]= $row;
    }
    aim()->http_response(200, [
      '@context' => aim()->context,
      '@ms'=>round(microtime(true)*1000-__startTime),
      'values'=>$items,
    ]);
  }
  public function get() {
    switch ($_GET['request_type']) {
      case 'klanten_openstaand': {
        return $this->query(
          "SELECT klantId,min(factuurDatum)factuurDatum,CAST(min(datum) AS DATE)datum,MAX(DATEDIFF(day,factuurDatum,GETDATE()))day,COUNT(0)aantal
          FROM abisingen.dbo.bonnen1
          WHERE betaaldDT IS NULL AND DatumVerwerkt IS NULL AND klantId IS NOT NULL
          AND pakbonid IN (SELECT DISTINCT pakbonId FROM abisingen.dbo.orderregels)
          GROUP BY klantId
          ORDER BY MAX(DATEDIFF(day,factuurDatum,GETDATE()))DESC
          "
        );
      }
      case 'klant_pakbonnen': {
        $klantId = str_replace("'","''",$_GET['klantId']);
        return $this->query(
          "SELECT klantId,pakbonId,status,uwRef,opmerking,CAST(datum AS DATE)datum,factuurDatum,CAST(geboektDT AS DATE)boekDatum,factuurNr,faktuurNr,totExcl,totBtw,CAST(totIncl AS decimal(8,2))totIncl
          FROM abisingen.dbo.bonnen1
          WHERE betaaldDT IS NULL AND DatumVerwerkt IS NULL
          AND klantId = '$klantId'
          AND pakbonid IN (SELECT DISTINCT pakbonId FROM abisingen.dbo.orderregels)
          ORDER BY datum
          "
        );
      }
      case 'pakbon_verwerkt': {
        return $this->query(
          "UPDATE abisingen.dbo.bonnen1 SET DatumVerwerkt = GETDATE() WHERE pakbonId = $_GET[pakbonId]"
        );
      }
      case 'pakbon_betaald': {
        return $this->query(
          "UPDATE abisingen.dbo.bonnen1 SET betaaldDT = GETDATE() WHERE pakbonId = $_GET[pakbonId]"
        );
      }
      case 'factuur': {
        aim()->sql_query("USE abisingen");
        $factuur = new Factuur($_GET["factuur_id"]);
        aim()->http_response(200,$factuur->toHtml());
      }

      case 'klant_herinnering': {
        $klantId = str_replace("'","''",$_GET['klantId']);
        $klant = sqlsrv_fetch_object(aim()->sql_query(
          "SELECT lower(bedrijf)bedrijf,ISNULL([extra 1],[extra 2])contactEmail,Firma,CONVERT(VARCHAR(50),klantuid)uid
          FROM abisingen.dbo.klanten
          WHERE klantId='$klantId'"
        ));
        $receivers=[];

        // foreach (explode(';',$klant->contactEmail) as $mailaddress) {
        //   array_push($receivers,['to',$mailaddress]);
        // }
        // array_push($receivers,['bcc','mieke@proving.nl']);
        // array_push($receivers,['bcc','max@alicon.nl']);

        array_push($receivers,['to','max@alicon.nl']);
        // die("EXEC abisingen.api.facturenOpenstaand @klantUID='$klant->uid';");
        $res = aim()->sql_query("EXEC abisingen.api.facturenOpenstaand @klantUID='$klant->uid';");
        // $d->facturen = [];
        function nf($n){
          return number_format($n,2,',','.');
        };
        $s=" style='padding:5px;'";
        $sh=" style='padding:5px;font-weight:bold;background:#eee;'";
        $faklijst = "";
        while ($row=sqlsrv_fetch_object($res)) {
          // if (!$aim->send) {
          $betaald = " - <a onclick='Aim.facturen.betaald($row->FaktuurNr,this);'>Betaald</a>";
          // }
          $faklijst .= implode('', [
            "<tr><td $s>$row->FaktuurNr</td><td $s>$row->FactuurDatum</td><td $s>",
            $row->days>30 ? "30+".($row->days-30) : $row->days,
            "</td><td $s>",
            $row->days>30 ? "termijn verstreken" : "",
            "</td><td align=right $s>",
            nf( $row->TotIncl),
            "</td><td $s>",
            "<a target=pdf href='https://dms.aliconnect.nl/lijst?requets_type=factuur&client_id=",
            aim()->client_id,
            "&factuur_id=",
            $row->uid,
            ".pdf'>PDF</a>$betaald</td></tr>",
          ]);
        }
        $faklijst = "<table style='border-collapse:collapse;width:100%;'><tr><td $sh>Factuurnr</td><td $sh>Datum</td><td $sh>Dagen</td><td $sh>Status</td><td align=right $sh>Bedrag</td><td $sh>PDF</td></tr>$faklijst</table>";
        $html = "<p>".implode("</p><p>",[
          "Geachte heer/mevrouw,"
          ,"Volgens onze administratie heeft $klant->Firma nog een of meerdere facturen bij ons openstaan, waarvan de betalingstermijn inmiddels is verstreken."
          ,"U vindt hieronder een overzicht."
          ,"Wij vragen u vriendelijk om deze facturen te controleren en aan ons te voldoen."
          ,$faklijst
          ,"In alle gevallen kunt u de factuur bekijken en/of downloaden via de link onder PDF achter de factuur."
          ,"Mochten er redenen zijn waarom u niet kunt overgaan tot betaling,dan verzoeken wij u om contact met ons op te nemen."
          ,"Indien dit bericht uw betaling heeft gekruist,dan mag u deze e-mail uiteraard als niet verzonden beschouwen."
          ,"Heeft u nog vragen,neem dan gerust contact met ons op. We helpen u graag verder!"
          ,"Alvast bedankt."
          ,"Met vriendelijke groet,"
          ,"Debiteurenbeheer"
        ]
        )."</p>";


        aim()->mail([
          'to'=> 'max.van.kampen@alicon.nl',
          // 'bcc'=> 'max.van.kampen@alicon.nl',
          'chapters'=> [
            [ 'title' => 'Betalingsachterstand Airo', 'content'=> $html ],
          ],
        ]);
        aim()->http_response(200,$html);


        if ($aim->send) {
          $mailmsg=array(
            //mail=>1,
            //Hostname=>strtolower($klant->bedrijf),
            //FromName=>$klant->bedrijf,
            host=>"$klant->bedrijf.aliconnect.nl",

            //FromEmail=>'aliconnect@alicon.nl',
            Receivers=>$receivers,
            Subject=>"Betalingsherinnering $klant->bedrijf",
            Summary=>'Herinnering in verband met openstaande facturen.',
            msgs=>array(array(content=>$html))
          );
          query("INSERT mail.queue (msg) VALUES ('".dbvalue(utf8_encode(json_encode($mailmsg)))."')");
          echo "<p>Verzonden</p>";
        }
        die($html);

      }
    }
  }
}

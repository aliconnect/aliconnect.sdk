<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use Dompdf\Dompdf;


class Mailer extends PHPMailer {
  public function __construct ($param = []) {
		parent::__construct();
    $this->isSMTP();
    foreach($param as $key => $value) {
      $this->{$key} = $value;
    }
    // $secret = aim()->secret;
		// extract($secret['config']['mail']);
    // extract($param);
		// $this->SMTPSecure	= $param['SMTPSecure'];
		// $this->Port = $param['Port'];
		// $this->SMTPAuth = $param['SMTPAuth'];
		// $this->Host = $param['Host'];
		// $this->Username = $Username;
		// $this->Password = $Password;
		$this->WordWrap = 78;
		// $this->domain = AIM_DOMAIN;
		$this->AltBody = "";
		$this->Summary = "";
		$this->setFrom ($Username);
		//$this->header = $this->addchapter(array("content"=>"<a href='https://$this->domain.aliconnect.nl' target='_blank'><img src='https://$this->domain.aliconnect.nl/img/logo/mail.png' alt='$this->domain' title='$this->domain' border='0' style='max-width:100%;'></a>"));
		$this->style = (object)[];
		$this->barstyle = '';
		// if (isset(aim()->web)){
		// 	$this->web = aim()->web;
		// 	if(isset($this->web->css->rules->{'.row.top.bar'})) $this->barstyle = $this->web->css->rules->{'.row.top.bar'};
		// }
    // http_response(200, $param);
	}
	public function addchapter($param) {
		extract(array_replace([
			'content'=>'',
			'type'=>'paragraph',
			'src'=>'',
			'swidth'=>'',
			'cwidth'=>'',
			'title'=>'',
			'style'=>'',
			'top'=>'',
			'href'=>'',
			'Basecolor'=>''],
			$param
		));
		if (!empty($content) && empty($nosummary)) {
			$this->AltBody .= strip_tags($content).' ';
			$this->Summary .= strip_tags($content).' ';
		}

		//debug($type);
		$style = empty($style) ? 'LINE-HEIGHT: 20px;' : $style;//isset($this->style->$type) ? $this->style->$type : $style;
		$wstyle = '';

		// $wstyle = 'style="width:100%;"';
		if ($src) {
			$src = "<img src='$src' alt='$name' border=0 hspace=0 align=left width=300 class=fullwidth>";
			if ($href) {
				$src = "<a href='$href' target='_blank'>$src</a>";
			}
			$src = "
			<table border=0 cellspacing=0 cellpadding=0 align=left>
			<tr>
			<td style='PADDING:20px;'>$src</td>
			</tr>
			</table>";
			$wstyle='style="width:290px;"';
		}
		$this->Body .= "
		<table style='MIN-WIDTH:320px;BACKGROUND-COLOR:#ffffff;WIDTH:100%;MAX-WIDTH:640px;$style' class='width640' border=0 cellspacing=0 cellpadding=0 align=center>
		<tr>
		<td>$src
		<table style='WIDTH:100%;' border=0 cellspacing=0 cellpadding=0 width=640 class=fullwidth align=center $wstyle>
		<tr>
		<td style='PADDING: 10px;' valign=top>
		<table style='WIDTH:100%;' border=0 cellspacing=0 cellpadding=0>";

		if ($title) {
			if (empty($this->Subject)) $this->Subject = iconv("UTF-8", "CP1252", $title);
			$this->Body .= "
			<tr>
			<td style='TEXT-ALIGN: left; PADDING: 5px 10px; LINE-HEIGHT: 26px;' class=fullwidth valign=top>
			<h1>".mb_convert_encoding($title, "HTML-ENTITIES", "UTF-8")."</h1>
			</td>
			</tr>";
		}
		if ($content) {
			$this->Body .= "
			<tr>
			<td style='TEXT-ALIGN: left; PADDING: 5px 10px; $style'".(isset($this->style->paragraph) ? $this->style->paragraph : '')."\" class=fullwidth valign=top>
			<p>".mb_convert_encoding($content, "HTML-ENTITIES", "UTF-8")."</p>
			</td>
			</tr>";
		}
		if ($href) {
			$this->Body .= "
      <tr>
      <td style='TEXT-ALIGN: left; PADDING: 5px 10px;' class=fullwidth>
      <table border=0 cellspacing=0 cellpadding=0>
      <tr>
      <td cellpadding=0 style=\"PADDING: 5px 10px; TEXT-ALIGN: center; BACKGROUND-COLOR:%baseColor; FONT-SIZE: 14px\">
      <a style='COLOR: #ffffff; TEXT-DECORATION: none' href='$href' target='_blank'><strong>Lees meer</strong></a>
      </td>
      </tr>
      </table>
      </td>
      </tr>";
		}
		$this->Body .= "
		</table>
		</td>
		</tr>
		</table>
		</td>
		</tr>
		</table>
		<table><tr><td height=20></td></tr></table>
		";
	}
	public function sendrow($row) {
		//die(a);
		$succes = $this->sendMail($row);
		die();

		$msg=json_decode($row->msg);
		unset($row->msg);
		foreach ($row as $key=>$value) if (!$msg->$key) $msg->$key=$row->$key;
		//$msg->FromName='MAXJE111';//iconv("UTF-8", "CP1252",utf8_encode(
		//$msg->FromName=iconv("UTF-8", "CP1252",$msg->FromName);
		//$msg->FromName=iconv("CP1252", "UTF-8",$msg->FromName);
		//$msg->FromName=utf8_decode($msg->FromName);



		$succes=$this->sendMail($msg);
		//echo "<li>$row->aid $row->ReplayToName $row->ReplyToEmail to: $row->ToName ($row->ToEmail) </li>$mail->html";
		//query("UPDATE mail.queue SET sendDT=GETDATE(),reply=CONVERT(VARCHAR(250),'$succes') WHERE aid=$row->aid;");
	}
	public function send($param = []) {
    $this->Body = "";
    $this->Subject = "";
		extract($param);
		// debug($param);

		$this->clearAllRecipients();
		foreach (['to','cc','bcc'] as $type) {
			if (!empty($param[$type])) {
				if ($recipients = is_string($param[$type]) ? explode(";",$param[$type]) : $param[$type]) {
					foreach ($recipients as $recipient) {
						if (is_string($recipient)) {
							if (strpos($recipient, '<') !== false) {
								$recipient = explode('<',$recipient);
								$emailname = trim(array_shift($recipient));
								$recipient = [trim(str_replace('>','',array_shift($recipient))), $emailname];
							} else {
								$recipient = [trim($recipient), trim($recipient)];
							}
						}
						$this->{$type}[] = $recipient;
						$this->all_recipients[$recipient[0]] = true;
					}
				}
			}
		}
		if (!empty($Subject)) {
      $this->Subject = iconv("UTF-8", "CP1252", $Subject);
    }

    // $this->Subject = "";


		foreach ($chapters as $chapter) {
      $this->addchapter($chapter);
    }
		$this->addchapter([
			'style'=> 'background-color:#eee; color:#333; font-size:0.8em;',
			'content'=> 'De informatie opgenomen in dit bericht kan vertrouwelijk zijn en is uitsluitend bestemd voor de geadresseerde. Indien u dit bericht onterecht ontvangt, wordt u verzocht de inhoud niet te gebruiken en de afzender direct te informeren door het bericht te retourneren. Aan de inhoud van dit bericht kunnen geen rechten worden ontleend.',
			'nosummary'=> true,
		]);

    $remove_files = [];
		if (isset($param['attachements'])) {
			foreach ($param['attachements'] as $attachement) {
        if (isset($attachement['content'])) {
					ini_set('display_errors', 0);
					ini_set('log_errors', 1);
          $dompdf = new Dompdf(['enable_remote' => true]);
					$dompdf->load_html($attachement['content']);
					$dompdf->set_paper("a4");
					$dompdf->render();
					$remove_files[] = $attachement['filename'] = $_SERVER['DOCUMENT_ROOT']."/../tmp/".uniqid().".pdf";
					file_put_contents($attachement['filename'], $dompdf->output());
				}
        if (isset($attachement['base64'])) {
					ini_set('display_errors', 0);
					ini_set('log_errors', 1);
          $remove_files[] = $attachement['filename'] = $_SERVER['DOCUMENT_ROOT']."/../tmp/".uniqid().$attachement['name'];
					file_put_contents($attachement['filename'], base64_decode($attachement['base64']));
				}
        if (isset($attachement['text'])) {
					ini_set('display_errors', 0);
					ini_set('log_errors', 1);
          $remove_files[] = $attachement['filename'] = $_SERVER['DOCUMENT_ROOT']."/../tmp/".uniqid().$attachement['name'];
					file_put_contents($attachement['filename'], $attachement['text']);
				}

				$this->addAttachment(
          isset ($attachement['filename']) ? $attachement['filename'] : $attachement['name'],
					basename(isset ($attachement['name']) ? $attachement['name'] : $attachement['filename']),
				);
			}
		}
		if (isset($track)) {
			$this->Body.="<img style='display:none;' src='https://login.aliconnect.nl?request_type=track&track=$track&address=$to'>";
		}


		//$this->Body    = 'This is the HTML message body <b>in bold!</b>';
		// $this->AltBody = 'This is the body in plain text for non-HTML mail clients';


		$html = file_get_contents(AIM['filename_mail_html']);
		$this->isHTML(true);

    global $aim;
    // http_response(200, $aim);


		$this->Body = str_replace([
			'%body',
			'%title',
			'%baseColor',
			'%logosrc',
			'%subject',
			'%summary',
		],[
			$this->Body,
			'',//isset(aim()->info->title) ? aim()->info->title : '',
			'',//isset(aim()->web->baseColor) ? aim()->web->baseColor : '',
			'',//isset(aim()->web->logo) ? aim()->web->logo : '',
			$this->Subject,
			substr($this->Summary,0,500),
		],$html);
		// if ($param['send'] !== false) {

    // $this->Sender='airo.nl@alicon.nl';
    // $this->SetFrom('airo.nl@alicon.nl', 'Airo Facturatie', FALSE);
    // $this->AddReplyTo('airo.nl@alicon.nl', 'Airo Facturatie');
    if (isset($param['from'])) {
      $this->SetFrom($param['from']);
    }
    // if ($param['replyTo']) {
    //   $this->AddReplyTo($param['replyTo']);
    // }

		parent::send();
		foreach ($remove_files as $fname) {
			unlink($fname);
		}
	}
}
// http_response(400,3);

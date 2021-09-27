<?php
class prompt {
  public function __construct () {
    $this->messages = [];
    $this->chapters = [];
    $this->account = new account($aim->access);
	}
  public function send() {
    if (!empty($this->chapters)) {
      $this->add_message("prompt-mail-send");
      aim()->mail([
        // 'Subject'=> $this->subject,
        'to'=> $this->account->preferred_username,
        'bcc'=> 'max.van.kampen@alicon.nl',
        'chapters'=> $this->chapters
      ]);
    } else {
      $this->add_message("prompt-mail-not-send");
    }
    $_POST['msg'] = $this->messages;
    return $_POST;
  }
  public function add_message($message, $args = []) {
    $this->messages[] = $message_title = vsprintf(__($message.'-title'), $args);
    if (isset(AIM_TRANSLATE[$message.'-description'])) {
      $this->chapters[] = [
        'title'=> $message_title,
        'content'=> vsprintf(AIM_TRANSLATE[$message.'-description'], $args),
      ];
    }
  }

  public function share_item() {
    $referer = parse_url($_SERVER['HTTP_REFERER']);
    $origin = $referer['scheme'] . "://" . $referer['host'];
    // $origin = 'https://' . $account->client_name . '.aliconnect.nl';

    $aim = aim();
    $user = $this->account;
    $account = $this->account = new account($_POST);
    $tag = get('tag');
    preg_match('/(\w+)\((\d+)\)/', $tag, $match);
    $schema_name = strtolower($match[1]);
    $itemId = $match[2];
    $tag_link = "$origin/?l=$origin/api/$tag";

    if (!$account->accountId) {
      $account->create_account($_POST);
      $this->add_message("prompt-account-created", [
        $account->client_name,
        $user->name,
      ]);
    } else {
      $this->add_message("prompt-account-exists", [
        $account->client_name,
        $user->name,
      ]);
    }

    $accountname = get('accountname');
    if (!$account->contactId) {
      $this->add_message('prompt-contact-created', [
        $account->client_name,
        $user->name,
      ]);
      sqlsrv_fetch_object(aim()->query("SET NOCOUNT ON;".
      $q="INSERT INTO item.dt (hostID,classID,title) VALUES ($account->clientId,1004,'$accountname')
      DECLARE @id INT
      SET @id=scope_identity()
      EXEC item.attr @itemId=@id, @nameID=30, @value='$accountname'
      EXEC item.attr @itemId=@id, @name='Src', @LinkID=$account->accountId, @HostID=$account->clientId
      "));
      $account->get_account();
    } else {
      $this->add_message("prompt-contact-exists", [
        $account->client_name,
        $user->name,
      ]);
    }

    // $scope_granted = explode(' ',get('scope_granted'));
    $scope_granted = explode(' ',$schema_name.".".(get('readonly') ? 'read' : 'readwrite'));
    $account_scope_granted = explode(' ',$account->scope_granted);
    $scope_granted = implode(' ', array_filter(array_unique(array_merge($account_scope_granted, $scope_granted))));
    // debug($scope_granted, $account->scope_granted);

    $attr = [
      $origin,
      // $account->client_name,
      $user->name,
      implode('</li><li>',explode(' ',$scope_granted)),
    ];

    if ($account->scope_granted !== $scope_granted) {
      $account->scope_granted = $scope_granted;
      $this->add_message("prompt-scope_granted-changed", $attr);
    } else {
      $this->add_message("prompt-scope_granted-exists", $attr);
    }

    $scope_requested = get('scope_requested');
    $attr = [
      $origin,
      // $account->client_name,
      $user->name,
      implode('</li><li>',explode(' ',$scope_requested)),
    ];
    if ($account->scope_requested !== $scope_requested) {
      $account->scope_requested = $scope_requested;
      $this->add_message("prompt-scope_requested-changed", $attr);
    } else {
      $this->add_message("prompt-scope_requested-exists", $attr);
    }

    // $attr = sqlsrv_fetch_object($aim->query("SELECT * FROM attribute.vw WHERE hostId=$account->clientId AND itemID=$account->accountId AND attributeName='child' AND linkId=$itemId"));
    $attr = null;
    if (empty($attr)) {
      $aim->setAttribute([
        'hostId'=>$account->clientId,
        'itemId'=>$account->accountId,
        'linkId'=>$itemId,
        'name'=>'child',
        'max'=>9999,
      ]);
      $this->add_message("prompt-share_item-done", [
        $origin,
        // $account->client_name,
        $user->name,
        $tag_link,
        // $tag,
      ]);
    } else {
      $this->add_message("prompt-share_item-exists", [
        $origin,
        // $account->client_name,
        $user->name,
        $tag_link,
        // $tag,
      ]);
    }
    return $this->send();
	}
  public function account_delete() {
    $aim = aim();
    $account = new account($aim->access);
    if ($_POST['code']) {
      if ($account->code_ok) {
        aim()->query("UPDATE item.dt SET deletedDateTime = GETDATE() WHERE id = $account->accountId");
        $this->add_message("prompt-account_delete-done");
      }
    }
    if ($account->password_ok) {
      // debug($aim->access, $account->password_ok);
      $account->set('code', $code = rand(10000,99999));
      aim()->sms('+'.$account->phone_number, __('sms_code_content', $code), __('sms_code_subject'));
      return 'code_send';
    }
    return $this->send();
	}
  public function account_delete_domain() {
    $messages = [];
    $chapters = [];
    $aim = aim();
    $account = new account($aim->access);
    if ($_POST['code']) {
      if ($account->code_ok) {
        $this->add_message("prompt-account_delete_domain-done");
      }
    }
    if ($account->password_ok) {
      $account->set_code($code = rand(10000,99999));
      aim()->sms('+'.$account->phone_number, __('sms_code_content', $code), __('sms_code_subject'));
      return 'code_send';
    }
    return $this->send();
	}
  public function account_overview() {
    $res = aim()->query("exec account.overview %d", aim()->access['sub']);
    $items = (object)[];
    while($row = sqlsrv_fetch_object($res)) $items->{$row->ID} = $row;
    sqlsrv_next_result($res);
    while($row = sqlsrv_fetch_object($res)) {
      $items->{$row->ItemID}->{$row->AttributeName} = $items->{$row->ItemID}->{$row->AttributeName} ? (is_array($items->{$row->ItemID}->{$row->AttributeName}) ? $items->{$row->ItemID}->{$row->AttributeName} : [ ['Value' => $items->{$row->ItemID}->{$row->AttributeName}] ]) : [];
      $items->{$row->ItemID}->{$row->AttributeName}[] = $row;
    }
    return $items->{aim()->access['sub']};
	}
}

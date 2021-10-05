<?php
class item {
 	public function __construct ($schemaname = null, $id = null) {
    // debug(1);
    $this->ATTRIBUTE_PROPERTIES = "A.ItemID,A.AttributeID,A.AttributeName,A.Value,A.LastModifiedDateTime,A.ID,A.[schema],A.Scope,A.Data,A.LinkID";
    $this->method = $_SERVER['REQUEST_METHOD'];
    $this->uri = $_SERVER['REQUEST_URI'];
    // $this->LastModifiedDateTime = date('Y-m-d h:i:s');
    $this->schemaname = $schemaname;
    $this->id = $id;
    if (isset($this->id) && !is_numeric($this->id)) {
      // echo ">>>>>>>>$this->id";
      $this->id = sqlsrv_fetch_object(aim()->query("SELECT id FROM item.dt WHERE uid='$this->id'"))->id;
    }

    $this->root_url = 'http'.($_SERVER['SERVER_PORT_SECURE'] ? 's' : '').'://'.$_SERVER['SERVER_NAME'].'/api/';
    // $this->client_id = isset(aim()->api->config->aim->aud) ? aim()->api->config->aim->aud : 1;
    // debug(aim()->config->aim->client_id);
    // $this->client_id = uid(aim()->config->aim->client_id);

    $this->client_id = uid(aim()->config->aim->client_id);
    $this->client_id = id(aim()->access['aud'] ?: aim()->config->aim->client_id);
    // $this->client_id = 265090;

    //isset(aim()->access['client_id']) ? aim()->access['client_id'] : AIM_CLIENT_ID; //$this->req["headers"]["aud"];
    // debug(aim()->access);
    // $this->client_id = 2347321;
    $this->sub = isset(aim()->access['sub']) ? aim()->access['sub'] : aim()->config->aim->client_id;//AIM_CLIENT_ID; //$this->req["headers"]["aud"];

    $this->schema = (isset(aim()->api->components->schemas->{$this->schemaname})) ? aim()->api->components->schemas->{$this->schemaname} : null;
    $this->properties = $this->schema->properties;



    $this->filter = '';
    $this->search_query = '';
    foreach ($_GET as $key => $value) {
      $key = ltrim($key,'$');
      $this->$key = $_GET[$key] = urldecode($value);
    }

    $selactable = array_keys((array)$this->properties);
    $select = explode(',',$this->select)?:[];
    $selactable = array_intersect($selactable, $select);

    // $selactable = array_map(function($name){return isset($this->properties->$name->security) ? null : $name;}, $selactable);
    $this->scope = explode(' ',aim()->access['scope']);
    $selactable = array_values(array_filter($selactable, function($name) {
      return !$this->properties->$name->security || array_filter($this->properties->$name->security, function($scope){
        $this->testscope = $scope;
        return array_filter($this->scope, function($hasname){
          return strpos($this->testscope, $hasname) === 0;
        });
      });
    }));
    // debug($selactable, $this->scope);


    // $this->select = implode(',', $selactable);


    // debug($this->select, $select, $selactable);

    $filterReplace = [
      '/schema/'=> '[schema]',
      ' and '=> ') AND (',
      ' or '=> ') OR (',
      '"'=> "'",
      '*'=> '%',
      ' IS '=> ' IS ',
      ' eq NULL'=> ' IS NULL',
      ' ne NULL'=> ' IS NOT NULL',
      ' eq ('=> ' IN (',
      ' eq '=> ' = ',
      ' ne '=> ' <> ',
      ' gt '=> ' > ',
      ' ge '=> ' >= ',
      ' lt '=> ' < ',
      ' le '=> ' <= ',
    ];
    if (!empty($this->filter)) {
      // preg_match_all("/\((.*)\)/",$this->filter,$matches,PREG_PATTERN_ORDER);
      $this->filter = 'AND '.'(('.str_replace(array_keys($filterReplace),array_values($filterReplace),$this->filter).'))';
      $this->filter = preg_replace('/\b(schema)\b/','[$1]',$this->filter);
      // debug ($this->filter);
    }
    // debug($this);
    $this->top = isset($this->top) ? $this->top : 10;

    $this->defaultItemProperties = [
      'schema','schemaPath','filterfields','files','InheritedID',
      'header0','header1','header2','name','Tagname',
      'State','Categories','Title','Subject','Summary',
      'KeyID','Scope','Tag','Keyname','Name','HasChildren','HasAttachements','IsClass','IsPublic','IsSelected','MessageCount','Location',
      'CreatedBy','LastModifiedBy','CreatedDateTime','LastModifiedDateTime','StartDateTime','EndDateTime','FinishDateTime',//'LastIndexDateTime'
      'CreatedByTitle',
    ];
    $this->itemProperties = array_merge($this->defaultItemProperties,[
      'ID','UID','HostID','ItemID','ClassID','SrcID','DetailID','OwnerID','UserID','CreatedByID','LastModifiedByID','InheritedID',//'MasterID'
    ]);
    $this->defaultProperties = array_merge($this->defaultItemProperties,[
      'Host','Source','Owner','User','Inherited'//,'Master',
    ]);


    // filter op security scope, uitbreiden om werkend te maken
    // $this->select = implode(',',array_unique(array_intersect(explode(' ', aim()->access['scope']), explode(',', $this->select))));


    // debug(aim()->api, aim()->access['scope']);


    $this->arrselect = isset($this->select) ? explode(',',$this->select) : $this->defaultProperties;


    // $this->schema


    $this->hide_properties = array_flip(array_diff(['schema','id','ID','UID'],$this->arrselect));
    $this->properties = array_values(array_unique(array_merge(['schema','ID','UID'],array_intersect($this->arrselect,$this->itemProperties))));
    $this->properties = '['.implode('],[',$this->properties).']';


    $this->attributes = array_values(array_diff($this->arrselect,$this->itemProperties));
    if (isset($this->search)) {
      $this->search = trim(str_replace('*','%',urldecode($this->search)));
      $or = [];
      function explodeq($sep,$aq){
        $aq = explode($sep,$aq);
        foreach ($aq as $i => $q) $aq[$i] = strpos($q,'%') ? $q : "$q";
        return $aq;
      }
      $qword = "id IN (SELECT ItemID FROM item.word WI INNER JOIN word.dt W ON W.id = WI.WordID AND W.word LIKE '";
      $this->search_query = "AND (
        (
          ($qword".implode("'))
          AND
          ($qword",explode(' ',$this->search))."'))
        )
        OR
        (
          (Title+Subject LIKE '%".implode("%')
          AND
          (Title+Subject LIKE '%",explode(' ',$this->search))."%')
        )
      )
      ";
    }

    // $this->sub = 265090;

    $this->sql_request = "
    SET TEXTSIZE -1;
    DECLARE @ClientId BIGINT, @UserId BIGINT, @Id BIGINT
    SELECT @ClientId = item.getId('$this->client_id'), @UserID = item.getId('$this->sub')".(empty($this->id) ? "" : ", @ID = item.getId('$this->id')")."
    INSERT aimhis.his.req(client_id,sub,id,method,url)VALUES(@ClientId,@UserID,@ID,'$this->method','$this->uri')
    ";
    $this->sql = $this->sql_request."
    DECLARE @T TABLE (_ID BIGINT,Path VARCHAR(MAX));
    ";
 	}
 	private function row($row) {
 		$schema = $this->schema;
 		$row->schema = $this->schemaname;
 		$this->odata_prefix = '@';
 		$id = $row->ID = isset($row->ID) ? $row->ID : $row->{$this->table->idname};
 		if ($schema->header) {
      foreach (['header0','header1','header2'] as $i => $key) {
        if (!isset($this->array_select_param) || in_array($key,$this->array_select_param)) {
          $row->$key = implode(' ',array_intersect_key((array)$row,array_flip($schema->header[$i])));
        }
      }
    }
 		foreach ($row as $key=>$value)if($value && $value[0]=='{')$row->$key=json_decode($value);
 		return array_replace([
 			$this->odata_prefix.'context' => 'https://'.$_SERVER['SERVER_NAME'].'/api/v1/$metadata#'.$this->schemaname.'/$entity',
 			$this->odata_prefix.'id' => 'https://'.$_SERVER['SERVER_NAME']."/api/$this->schemaname($id)",
 			'Id' => base64_encode(json_encode(array_intersect_key((array)$row,$this->IdPropertyNames))),
 		],isset($this->array_select_param_flip)?array_intersect_key((array)$row,$this->array_select_param_flip):(array)$row);
 	}
 	private function table () {
 		$this->IdPropertyNames = array_flip(['schema','ID','UID','header','State']);
 		$schema = $this->schema;
		$table = $this->table = $this->schema->table;
 		$schema->path = '/'.$this->schemaname;
    $idname = empty($this->table->idname) ? 'ID' : $this->table->idname;
 		// $headerProperties = [$table->idname = isset($table->idname) ? $table->idname : 'ID'];
    $table->filter = isset($table->filter) ? $table->filter : [];

    if (empty($this->select) || $this->select === '*') {
      $this->array_select_param = array_keys((array)$schema->properties);
      // debug($schema->properties, $this->array_select_param);
      $select = '*';
    } else {
      $this->array_select_param = isset($this->select) ? explode(',',$this->select) : (isset($this->id) ? array_keys((array)$this->schema->properties) : []);
      if (in_array('header0', $this->array_select_param )) {
        $headerProperties = array_merge($schema->header[0], $headerProperties?:[]);
      }
      if (in_array('header1', $this->array_select_param )) {
        $headerProperties = array_merge($schema->header[1], $headerProperties?:[]);
      }
      if (in_array('header2', $this->array_select_param )) {
        $headerProperties = array_merge($schema->header[2], $headerProperties?:[]);
      }
      // debug(1,$select,$headerProperties);
      // $this->select = array_merge($this->select, ['ID']);
      // debug ($this->select);
      // debug($headerProperties, $schema->header);
      $this->array_select = array_diff($this->array_select_param,['header0','header1','header2']);
      $this->array_select = array_merge($this->array_select,[$idname]);
      $this->array_select_param_flip = array_flip(array_merge($this->array_select_param,$table->filter));
      $select = '['.implode('],[',array_values(array_filter(array_unique(array_merge($this->array_select,$headerProperties?:[],$table->filter?:[]))))).']';
      // debug(1,$select,$this->array_select);
    }
    if (isset($table->idname)) {
      $select.=",$table->idname AS ID";
    }
    // debug($this->array_select_param, $schema->header);
    // $select = str_replace('[*]','*',$select);
 		if (isset($this->id)) {

 			$q = "SELECT '$this->schemaname'[schema],$select FROM $table->name WHERE [$idname]=$this->id;";
      // debug($q);
 			$row = sqlsrv_fetch_object($res = aim()->query($q));
 			header('OData-Version: 4.0');
 			return $this->row($row);
 		}
 		$this->top = isset($this->top) ? $this->top : 5000;
 		$q = "SELECT TOP ".$this->top." '$this->schemaname'[schema],$select FROM $table->name";
 		if (!empty($this->search)) {
 			$search = explode(' ',$this->search);
 			foreach($search as $value) {
 				$or=[];
 				foreach($table->search as $key) {
          $or[] = "[$key]LIKE'%$value%'";
        }
 				$where[] = implode('OR',$or);
 			}
 		}
 		if (!empty($this->filter)) $where[] = $this->filter;
 		if (!empty($where)) $q.=' WHERE('.implode(')AND(',$where).')';
 		if (!empty($this->order)) $q.=" ORDER BY $this->order";
    // die($q);
		$res = aim()->query($q);
 		$result['value'] = [];
 		while($row = sqlsrv_fetch_object($res)) {
      array_push($result['value'],$this->row($row));
    }
 		header('OData-Version: 4.0');
 		return $result;
 	}
 	public function linkadd () {
 		extract($parameters);
 		$q.=";EXEC item.attr @ItemID=$id,@LinkID='$requestBody->itemID'";
 		aim()->query($q);
 		return;
 	}
 	public function link ($attributeName, $method) {
    $id = $this->id;
    // debug(1);

    // $this->subschemaname = $attributeName;
    if ($method === 'delete') {
      $pathParam = preg_match_all('/\(([^\)]+)\)/', $_SERVER['REQUEST_URI'], $matches, PREG_PATTERN_ORDER);
      aim()->query('DELETE attribute.dt WHERE ItemID=%1$d AND LinkID=%2$d AND NameID IN (SELECT id FROM attribute.name WHERE name=\'%3$s\')', $matches[1][0], $matches[1][1], $attributeName);
      return;
    }
    if ($method === 'get') {
      $this->sql = "
      SET TEXTSIZE -1;
      DECLARE @ClientId BIGINT, @UserId BIGINT, @Id BIGINT
      SELECT @ClientId = item.getId('$this->client_id'), @UserID = item.getId('$this->sub')

      SELECT ID _ID, ID, UID, [schema] FROM item.vw WHERE ID = $this->id
      DECLARE @T TABLE (Level TINYINT, ItemID BIGINT, _ID BIGINT, AttributeName VARCHAR(250), Data VARCHAR(MAX),Path VARCHAR(MAX))
      INSERT @T
      SELECT TOP $this->top 0,$this->id,LinkID,'$attributeName',Data,''
      FROM attribute.dv
      WHERE ItemID = $this->id
      AND NameID IN (Select ID FROM attribute.name WHERE name='$attributeName')
      AND LinkID IN (SELECT ID FROM item.vw);
      ";
      // die($this->sql);
      $this->sql_add_attributes ();
      $items = $this->build_response ();
      array_shift($items['value']);
      return $items;
    }
    $this->add = true;
    $this->requestBody = $_POST;
    // debug($this->schema->properties->{$attributeName}->schema);


    $this->schemaname = $this->schema->properties->{$attributeName}->schema;
    $item = $this->update(1);
    // debug($item);

    // debug(1, "EXEC item.attr @ItemID=$this->id, @Name='Message', @LinkID=$item->ID, @max=9999");
    aim()->query(
      "EXEC item.attr @ItemID=%s, @Name=%s, @LinkID=%d, @max=9999",
      $id,
      $attributeName,
      $item['ID']
    );

    // debug(
    //   $id,
    //   $attributeName,
    //   $item->ID,
    // );
    //


 		return $item;
 	}
  public function file ($method=null, $ofile=null) {
    $hostid = aim()->access['aud'];
    $item = sqlsrv_fetch_object(aim()->query("INSERT INTO item.dt (hostid,classid) VALUES ($hostid,3);SELECT id,uid FROM item.dt WHERE id=SCOPE_IDENTITY();"));
    $_GET['LinkID'] = $item->id;
    $path = implode('/',[
      "/shared",
      $hostid,
      date('Y/m/d'),
      $item->uid,
      // empty($_GET['uid']) ? uniqid() : $_GET['uid'],
    ]);
    if (!is_dir($_SERVER['DOCUMENT_ROOT'].'/../fs1'.$path)) {
      mkdir($_SERVER['DOCUMENT_ROOT'].'/../fs1'.$path,0777,true);
    }
    $filename = pathinfo($_GET['name'], PATHINFO_FILENAME);
    $ext = pathinfo($_GET['name'], PATHINFO_EXTENSION);
    $i=0;
    while (is_file($fname = $_SERVER['DOCUMENT_ROOT'].'/../fs1'.( $src = $path."/".$filename.($i?$i:'').".$ext" ))) {
      $i++;
    }
    if (strstr($_GET['type'],'openxmlformats')) {
      $content = file_get_contents('php://input');
      file_put_contents($fname, $content);

      // Create new ZIP archive
      $zip = new ZipArchive;
      // Open received archive file
      $dataFile = "word/document.xml";
      if (true === $zip->open($fname)) {
        // If done, search for the data file in the archive
        if (($index = $zip->locateName($dataFile)) !== false) {
          // If found, read it to the string
          $data = $zip->getFromIndex($index);
          // Close archive file
          $zip->close();
          // debug(3, $fname);
          // Load XML from a string
          // Skip errors and warnings
          $xml = new DOMDocument();
          $xml->loadXML($data, LIBXML_NOENT | LIBXML_XINCLUDE | LIBXML_NOERROR | LIBXML_NOWARNING);
          // Return data without XML formatting tags
          $xmltext = $xml->saveXML();
          // file_put_contents(str_replace('.docx','.xml',$fname), $xmltext);
          $text = strip_tags($xmltext, '<w:p>');
          // file_put_contents(str_replace('.docx','1.txt',$fname), $text);
          $text = preg_replace('/<w:p.*?>/i','',$text);
          $text = preg_replace('/<\\/w:p>/i',"\r\n",$text);

          // $xmltext = str_replace('w:p','p',$xmltext);

          file_put_contents(str_replace('.docx','.txt',$fname), $text);
        }
        // debug(2, $fname);
        $zip->close();
      } else {
        // debug(1, $fname);
      }

    } else {
      file_put_contents($fname, file_get_contents('php://input'));
    }
    $_GET['src'] = 'https://fs1.aliconnect.nl'. $src;
    return $_GET;


    $ofile = (array)($ofile ?: $_GET);
    $content = null;
    $fieldnames = 'name,ext,title,alt,type,size,lastmodifieddate,host,src';
    $url = '';

    // debug($ofile, $this->id);
    if (!empty($ofile['data'])) {
      $content = $ofile['data'];
      unset($ofile['data']);
    }
    if (!empty($ofile['url'])) {
      $row = sqlsrv_fetch_object(aim()->query("SELECT $fieldnames FROM item.attachement WHERE url='$ofile[url]';"));
      if (!empty($row)) return $row;
      $content = $content ?: file_get_contents($ofile['url']);
      $arr = explode('/',(explode('?', $ofile['url'])[0]));
      $ofile['name'] = empty($ofile['name']) ? array_pop($arr) : $ofile['name'] ;
    } else {
      $content = file_get_contents('php://input');
    }
    if (strstr($content,'base64')) {
      $content = base64_decode(explode('base64,',$content)[1]);
    }
    $ext = strtolower(pathinfo($ofile['name'], PATHINFO_EXTENSION));
    $document_root = str_replace('\\','/',$_SERVER['DOCUMENT_ROOT']);
    // debug(aim()->access);
    $src = '/'.implode('/',['shared',aim()->access['aud'],date('Y/m/d'),uniqid().'.'.$ext]);
    $path = pathinfo($source = $document_root.$src, PATHINFO_DIRNAME);
    if (!is_dir($path)) {
      mkdir($path,0777,true);
    }
    file_put_contents($source,$content);
    $ofile = array_replace([
      'itemid'=> $this->id,
      'hostid'=> aim()->access['aud'],
      'userid'=> aim()->access['sub'],
      'name'=> $ofile['name'],
      'ext'=> $ext,
      'type'=> '',
      'title'=> '',
      'alt'=> '',
      'size'=> filesize($source),
      'lastmodifieddate'=> '',
      'host'=> 'https://aliconnect.nl',
      'src'=> $src,
      'url'=> $url,
    ],array_change_key_case($ofile, CASE_LOWER));
    // debug($document_root, $path, $source, $src, $method, $ofile, strstr($content,'base64') ? 1 : 0);
    $fields = implode('],[',array_keys($ofile));
    $values = implode("','",array_values($ofile));
    $q = "INSERT INTO item.attachement ([$fields])VALUES('$values');
    SELECT $fieldnames FROM item.attachement WHERE ID=@@IDENTITY;";
    // die($q);
    $row = sqlsrv_fetch_object(aim()->query($q));
    return $row;
 	}
 	public function find () {
 		// if (empty($_GET['search'])) throw new Exception('Precondition failed', 412);
 		return $this->get ();
 	}
  public function children () {
    if (empty($this->level)) {
      $this->level=1;
    }
    $this->filter=(empty($this->filter) ? "" : $this->filter) . " AND level<$this->level";
    // debug($this->filter);
 		$this->sql = $this->sql_request."SET @ID=$this->id; "."SELECT ID _ID,ID,UID,[schema],schemaPath FROM item.vw WHERE ID = @ID;
    DECLARE @T TABLE (Level TINYINT, ItemID BIGINT, _ID BIGINT, AttributeName VARCHAR(250),ChildIndex INT);
    WITH P(level,ItemID,_ID,AttributeName,ChildIndex) AS (
      SELECT 0,@ID,@ID,'Children',CONVERT(INT,0)
      UNION ALL
      SELECT Level+1,I.MasterID,I.ID,'Children',I.idx
      FROM P
      INNER JOIN item.children I ON I.MasterID = P._ID AND I.id IN (SELECT id FROM item.vw WHERE I.HostID = @ClientId $this->filter)
      --INNER JOIN item.vw I ON I.MasterID = P._ID AND I.HostID = @ClientId $this->filter
    )
    INSERT @T SELECT * FROM P WHERE Level>0
    ";
 		// if (isset($this->filter)) $this->sql .= "\n".$this->filter;
 		// if (isset($this->search)) $this->sql .= "\n".$this->search_query;
 		$this->sql_add_attributes ();

    $retvalue = $this->build_response();
    // debug($retvalue);

 		return $retvalue;
 	}
  public function references () {
    if (empty($this->level)) $this->level=1;
    $referenceList = [];
    $this->sql = "SET TEXTSIZE -1;";
    foreach ($this->schema->properties as $attributeName => $attribute) {
      if (isset($attribute->schema) && isset($attribute->attributeName)) {
        $referenceList[] = $attribute;
        $this->sql .= "SELECT ID _ID, ID, UID, [schema],schemaPath FROM item.vw WHERE ID = $this->id;
        DECLARE @T TABLE (Level TINYINT, ItemID BIGINT, _ID BIGINT, AttributeName VARCHAR(250),ChildIndex VARCHAR(MAX),Path VARCHAR(MAX));
        WITH P(level,ItemID,_ID,AttributeName,ChildIndex,Path) AS (
          SELECT 1,A.ID,A.ItemID,'$attributeName',A.Data,''
          FROM (SELECT ID,ItemID,Data,NameID FROM attribute.dv WHERE NameID IN (SELECT id FROM attribute.name WHERE Name = '$attribute->attributeName')) A
          INNER JOIN item.vw I ON I.ID = A.ItemID AND I.ClassID=SET @classID=item.getClassIdByName(I.hostId, '$attribute->schema') $this->filter
          WHERE A.ID = $this->id
          UNION ALL
          SELECT Level+1,A.ID,A.ItemID,'$attributeName',A.Data,''
          FROM (SELECT ID,ItemID,Data,NameID FROM attribute.dv WHERE NameID IN (SELECT id FROM attribute.name WHERE Name = '$attribute->attributeName')) A
          INNER JOIN item.vw I ON I.ID=A.ItemID AND I.ClassID = item.getClassIdByName(I.HostId, '$attribute->schema') $this->filter
          INNER JOIN P ON A.ID=P._ID AND level<$this->level
        )
        INSERT @T SELECT * FROM P --ORDER BY Level,ChildIndex
        ";
      }
    }
 		// if (isset($this->filter)) $this->sql .= "\n".$this->filter;
 		// if (isset($this->search)) $this->sql .= "\n".$this->search_query;
 		$this->sql_add_attributes ();
 		return $this->build_response ();
 	}
  private function build(&$b) {
    global $o;
    if (!$b->children) unset($b->children);
    if ($b->geo) {
      $b=(object)array_merge((array)$this->o->geo->{$b->geo},(array)$b);
    }
    foreach ($b->children as $i => $c) $b->children[$i]=$this->build($c);
    return $b;
  }
  public function get () {
    // debug($_SERVER['REQUEST_METHOD']);

		if (isset($this->search) && empty($this->search)) die(http_response_code(202));
 		if ($this->schemaname !== 'Item' && class_exists($this->schemaname) && method_exists($schemaname = $this->schemaname, $method = $this->method)) {
      return (new $schemaname())->$method($parameters);
    }
    // debug($this);
    if (isset($this->schema->table)) {
      return $this->table();
    }
 		if (isset($_GET['three'])) {
 			error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
 			//global $aim;
 			$this->o = $o = (object)["scale" => 10, "shape" => (object)[], "geo" => (object)[] ];
 			$obj = sqlsrv_fetch_object(aim()->query("SELECT files FROM item.dt WHERE id=$this->id;"));
 			$files = json_decode($obj->files);
 			$o->floorplan->src = $files[0]->src;
      // debug($this->id);
 			$res=aim()->query("EXEC [item].[getTreeModel] @id=$this->id;");
 			while($row = sqlsrv_fetch_object($res)) {
        foreach($row as $key => $value) {
          if (is_null($value)) {
            unset($row->$key);
          }
        }
        // $row = (object)array_filter()
 				$row->children=$row->children ? json_decode($row->children) : [];
 				foreach ($row as $key=>$value) if ($value==='') unset($row->$key); else if (is_numeric($value)) $row->$key=(float)$value;
 				$items->{$row->id}=$row;
 				if (!$root) $root=$items->{$row->id};
 				if ($row->masterID && $items->{$row->masterID}) array_push($items->{$row->masterID}->children,$items->{$row->id});
 			}
 			$o->object = $root;
      $cfg = json_decode(file_get_contents(AIM_DOMAIN_ROOT.'/app/three/json/objects.json'));
 			foreach ($cfg as $key => $value)$o->{$key} = $value;
 			$cfg = json_decode(file_get_contents(AIM_DOMAIN_ROOT.'/app/three/json/shapes.json'));
 			foreach ($cfg->shape as $shapename=>$shape)$o->shape->{$shapename} = $shape;
 			foreach ($o->shape as $obj) foreach ($obj->vectors as $i=>$value) $obj->vectors[$i] = round($obj->vectors[$i] * 1000/39.370);
 			//we bouwen nu recursive een boom op van het top object en alle kinderen
      // debug($o->geo);
 			$o->object = $this->build($o->object);
 			// header('Content-Type: application/json');
 			// exit(json_encode($o));
      return $o;
 		}
 		if (!empty($this->id)) {
      // if (!is_numeric($this->id)) {
      //   $row = sqlsrv_fetch_object(aim()->query(
      //     "SELECT id FROM item.dt WHERE uid='%s'",
      //     $this->id,
      //   ));
      //   $this->id = $row->id;
      //   // debug($this->id);
      // }
      // $id = $_GET['id'] = $this->id;
      // if (is_numeric($this->id)) $this->sql .= "INSERT INTO @T VALUES ($this->id,'');";
      // else $this->sql .= "INSERT INTO @T SELECT (id,'') FROM item.dt WHERE uid = '$this->id';";
      $this->sql .= "INSERT INTO @T VALUES(@Id,'');";
 			if (!isset($this->select)) {
        $this->select = '*';
      }
      // debug($this->select);
 		}
    else {
      $this->sql .= "INSERT INTO @T
      SELECT TOP $this->top ID,''
      FROM item.dv
      WHERE HostID IN (@ClientId) AND ClassID=item.getClassIdByName(@ClientId, '$this->schemaname')
      $this->filter
      $this->search_query
      ";
    }
 		$this->sql_add_attributes ();
 		return $this->build_response ();
 	}
  public function sql_add_attributes () {
    // $this->sub = 265090;
    // debug($this->properties, $this->select);
    $selectProperties = isset($this->select) && $this->select === '*' ? 'I.*' : $this->properties;
 		$this->sql .= "SELECT T.*, $selectProperties
    FROM @T T
    INNER JOIN account.item(@UserId) I ON I.ID = T._ID
    ";
 		$this->attribute_filter = "";//"AND(HostID IS NULL OR HostID=$this->client_id) AND (UserID IS NULL OR UserID=0$this->sub) AND";

    preg_match('/LastModifiedDateTime >= ([^\)]+)\)/',$this->filter,$match);
    if ($match) {
      $this->attribute_filter = "AND A.LastModifiedDateTime >= '".str_replace('000Z','Z',$match[1])."'";
    }

    if (isset($this->select) || isset($this->unselect) || $this->attributes) {




      // $this->sql .= "SELECT COUNT(0) AS MessageCount, $this->id AS ItemID FROM item.attribute WHERE ItemID=$this->id AND NameID=2016;
      // SELECT A.* --$this->ATTRIBUTE_PROPERTIES
      // FROM account.attribute($this->sub,$this->client_id) A
      // INNER JOIN @T T ON A.ItemID = T._ID $this->attribute_filter;
      // ";
      // debug($this->select,$this->attributes,$this->attributes?1:0);
      // debug ($this->select, $this->attributes);
      if (empty($this->select) || $this->select !== '*') {
        if ($this->attributes) {
          $nameFilter = "AND A.NameID IN(SELECT id FROM attribute.name WHERE name IN('".implode("','",$this->attributes)."'))";
        }
      } else {
        $nameFilter = "";
      }
      // debug($this->select, $nameFilter);
      if (!empty($this->unselect)) {
        $nameFilter .= " AND A.NameID NOT IN(SELECT id FROM attribute.name WHERE name IN('".implode("','",explode(',',$this->unselect))."'))";
      }
      // SELECT COUNT(0) AS MessageCount, $this->id AS ItemID FROM item.attribute WHERE ItemID=$this->id AND NameID=2016;
      if ($this->id) {
        $this->sql .= "SELECT COUNT(0) AS MessageCount, @Id AS ItemID FROM attribute.dv WHERE ItemID=@Id AND NameID=2016;";
      }
      // debug($this->attributes, $this->attribute_filter, $nameFilter);
      if (isset($nameFilter)) {
        // $hostId = AIM_CLIENT_ID;
        $this->sql .= ";WITH P (Level,RootID,SrcId) AS (
            SELECT 0,T._id,T._id
            FROM @T T INNER JOIN account.item(@UserId) I ON I.ID = T._ID
            UNION ALL
            SELECT Level+1,P.RootID,ISNULL(ISNULL(I.InheritedID,I.SrcID),I.ClassID)
            FROM P INNER JOIN Item.VW I ON I.ID = P.SrcID AND level<10 AND P.SrcID<>I.SrcID
        	)
        	SELECT
            AN.Name AS AttributeName
            ,ISNULL(A.Value,attrSource.Value) Value
            ,P.RootID ItemID
            ,A.ItemID SrcID
            ,A.HostID
            ,A.CreatedDateTime
            ,A.LastModifiedDateTime
            ,A.LastModifiedByID
            ,A.UserID
            ,A.AttributeID
            -- ,A.NameID
            -- ,A.ClassID
            ,A.Scope
            ,A.Data
            ,item.schemaPath(A.LinkID) AS [schema]
            ,item.schemaPath(A.LinkID) AS schemaPath
            ,A.LinkID
            ,A.LinkID AS ID
          FROM
            P
            INNER JOIN Attribute.vw A ON A.ItemID = P.SrcID
            LEFT OUTER JOIN attribute.dt attrSource ON attrSource.itemId = A.userId AND attrSource.nameId = A.nameId AND attrSource.hostId = 1
            INNER JOIN Attribute.Name AN ON AN.id = A.NameID
        	WHERE
            --A.HostID IN (@ClientId,1,0)
            A.HostID = @ClientId AND
            ISNULL(A.UserID,A.HostID) IN (@UserId,A.HostID,0) AND
            A.NameId NOT IN (516,1823,2184)
            $this->attribute_filter
            $nameFilter
          ORDER BY P.level
        ";
      }
    }
 		// else if ($this->attributes) {
    //   $this->sql .= "SELECT A.* --$this->ATTRIBUTE_PROPERTIES
    //   FROM account.attribute($this->sub,$this->client_id) A
    //   INNER JOIN @T T ON A.itemID=T._ID $this->attribute_filter AND NameID IN(SELECT id FROM attribute.name WHERE name IN('".implode("','",$this->attributes)."'));";
    // }
 	}
 	public function build_response () {
    extract($_GET);
    // debug(aim()->api->config);

    // echo $this->sql.PHP_EOL;

    // die();
    if (!$res = aim()->query('SET NOCOUNT ON;' . $this->sql)) {
 			if( ($errors = sqlsrv_errors() ) != null) {
 				foreach( $errors as $error ) {
 					die(json_encode([
 						'SQLSTATE'=>$error['SQLSTATE'],
 						'code'=>$error['code'],
 						'message'=>$error['message'],
 						'query'=>$this->sql,
 					]));
 				}
 			}
 		}
 		// if (empty($res)) throw new Exception("Conflict", 409);
 		$rows = $items = $refItems = [];
    $IdIntersectKeys = ['schema'=>1, 'ID'=>1, 'UID'=>1];
 		while ($res) {
 			while ($row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC )) {
        // echo json_encode($row['AttributeName']).PHP_EOL;
        // echo json_encode($row).PHP_EOL;

        if (isset($row['MessageCount'])) $this->id = $row['ItemID'];
        unset($row['Path']);
        // debug($row);
        // echo PHP_EOL.json_encode($row);
        // if (!empty($row['_ID'])) $rows[] = $items[$row['_ID']] = $row;
 				if (array_key_exists('@id',$row) && $row['@id'])$row['@id'] = $this->root_url.$row['@id'];

        if (isset($row['schemaPath'])) {
          $row['schema'] = schemaName($row);
        //   $row['schemas'] = json_decode($row['schemas']);
        //   // if (in_array('Verkeersbuis',$row['schemas'])) {
        //   //   debug($row);
        //   // }
        //   foreach ($row['schemas'] as $schemaname) {
        //     if (isset(aim()->api->components->schemas->$schemaname)) {
        //       if ($row['schema'] !== $schemaname) {
        //         $row['Class'] = $row['schema'];
        //         $row['schema'] = $schemaname;
        //       }
        //       break;
        //     }
        //   }
        }
        // unset($row['schemas']);



        if (isset($row['_ID'])) {
          // debug($row);
          // if (isset($row['filterfields'])) {
   				// 	$row = array_replace($row,json_decode($row['filterfields'], true));
   				// 	unset($row['filterfields']);
   				// }
          // if (isset($row['Level'])) debug($row);



   				$rows[] = $items[$row['_ID']] = (object)itemrow($row);
          // if (!empty($row['Title'])) debug($row,$rows);
        }
        if (!empty($row['AttributeName'])) {

          // echo json_encode($row).PHP_EOL;
          // debug(2,$row,$value,$item);



          // $row['AttributeName'] = ucfirst($row['AttributeName']);
          $item = $items[$row['ItemID']] = empty($items[$row['ItemID']])
          ? (object)[]
          : $items[$row['ItemID']];




          // if (isset())
          // if (empty($item->schema)) continue;
          // if (empty(aim()->api->components->schemas->{$item->schema})) continue;
          // if (empty(aim()->api->components->schemas->{$item->schema}->properties)) continue;
          // if (empty(aim()->api->components->schemas->{$item->schema}->properties->{$row['AttributeName']})) continue;
          // $property = aim()->api->components->schemas->{$item->schema}->properties->{$row['AttributeName']};
          // debug($row);
          // debug($row['AttributeName'],aim()->api->components->schemas->{$item->schema}->properties);


          $type = null;
          if (!empty(aim()->api->components->schemas->{$item->schema}->properties->{$row['AttributeName']})) {
            $property = aim()->api->components->schemas->{$item->schema}->properties->{$row['AttributeName']};
            $type = empty($property->type) ? null : $property->type;
          }
          if (!empty($row['schema']) && !empty($row['ID'])) {
            $row['@id'] = API_ROOT_URL.schemaName($row)."($row[ID])";
          }
          $value = array_filter($row,function($val){
            return !is_null($val);
          });
          if (!empty($row['ID']) && !empty($items[$row['ID']])) {
            if ($row['ID'] != $this->id ) {
              if (empty($refItems[$row['ID']])) {
                $value = $refItems[$row['ID']] = $items[$row['ID']];
              }
            }
            unset($value->ItemID,$value->LinkID,$value->AttributeName);
          } else {
            $value = array_diff_key($value,['ID'=>0,'schema'=>0,'ItemID'=>0,'AttributeName'=>0,'_ID'=>0]);
          }
          $value = (object)$value;
          if (isset($value->Value)) {
            $decodeValue = json_decode($value->Value);
            if (!is_null($decodeValue)) {
              $value->Value = $decodeValue;
            }
          }
          // if (!empty($value->SrcID)) {
          //   if ($value->SrcID == $row['ItemID']) {
          //     unset($value->SrcID);
          //   }
          //   else {
          //     if (empty($value->Value)) {
          //       continue;
          //     }
          //     $value->SrcValue = $value->Value;
          //     unset($value->Value);
          //   }
          // }
          if (empty($item->{$row['AttributeName']})) {
            $item->{$row['AttributeName']} = $type === 'array' ? [$value] : $value;
          } else if (is_array($item->{$row['AttributeName']})) {
            $item->{$row['AttributeName']}[] = $value;
          } else if (!is_object($item->{$row['AttributeName']})) {
            $item->{$row['AttributeName']} = $value;
          // } else if (!empty($value->SrcID)) {
          //   if (empty($item->{$row['AttributeName']}->SrcValue)) {
          //     $item->{$row['AttributeName']}->SrcValue = $value->SrcValue;
          //   }
          //   if (empty($item->{$row['AttributeName']}->Value)) {
          //     $item->{$row['AttributeName']}->Value = $value->SrcValue;
          //   }
          } else {
            $item->{$row['AttributeName']} = [ $item->{$row['AttributeName']}, $value ];
          }
          // debug($item);
 				} else if (!empty($row['ItemID']) && isset($items[$this->id])) {
          $id=$row['ItemID'];
          unset($row['ItemID']);
          if(empty($items[$id])) $items[$id] = (object)[];
          foreach ($row as $key=>$value) {
            $items[$id]->{$key} = $value;
          }
        }
 			}
 			if (!sqlsrv_next_result($res)) break;
 		}

    header('OData-Version: 4.0');

    // debug()

    if (empty($this->id)) {
      if (!empty($order)) {
        ordered_list($order,$rows);
      }
      // {
      //   foreach (array_reverse(explode(',',$order)) as $orderkey) {
      //     $orderdir = explode(' ',$orderkey);
      //     $orderkey = array_shift($orderdir);
      //     $orderdir = array_shift($orderdir);
      //     $orderby = [];
      //     foreach ($rows as $key => $row) {
      //       $orderby[$key] = is_object($row->$orderkey)
      //       ? $row->$orderkey->Value
      //       : $row->$orderkey;
      //     }
      //     // $orderarr = array_column($rows, $key);
      //     array_multisort($orderby, $orderdir == 'DESC' ? SORT_DESC : SORT_ASC, SORT_NATURAL|SORT_FLAG_CASE, $rows);
      //   }
      // }
      // debug($sort);
      // $volume  = array_column($data, 'volume');
      // $edition = array_column($data, 'edition');
      // // Sort the data with volume descending, edition ascending
      // // Add $data as the last parameter, to sort by the common key
      // array_multisort($volume, SORT_DESC, $edition, SORT_ASC, $data);

      // array_multisort($sort, SORT_ASC, SORT_NATURAL|SORT_FLAG_CASE, $rows);
      // debug(111,$rows);
      return [
        '@context' => $this->root_url."\$metadata#/\$entity",
        'value' => $rows,
      ];
    }

    // function wr($items,$level){
    //   if ($level>5) return;
    //   foreach ($items as $key => $value) {
    //     echo PHP_EOL.str_repeat('  ',$level).$key;
    //     if (is_object($value)) wr($value,$level+1);
    //     else if (is_array($value)) wr($value,$level+1);
    //     // else echo $value;
    //   }
    // }

    if (!empty($items[$this->id])) {
      // wr($items[$this->id],1);
      // // foreach ($items as $key => $value) {
      // //   echo $this->id.'-'.$key.json_encode($value).PHP_EOL;
      // // }
      // // echo json_encode($items[$this->id]).PHP_EOL;
      // // debug($this->id, $items[$this->id]);
      // //
      // //
      // //
      // die();
      // // debug($rows);
      //


      $row = (array)$items[$this->id];
      // if (!empty($order)) {
      //   if (!empty($row['Children'])) ordered_list($order,$row['Children']);
      // }
      return array_merge([
        '@context' => $this->root_url."\$metadata#/$this->schemaname/\$entity"
      ],$row);
    }
    // debug(1);
  }
 	public function put ($req) {
 		self::PATCH($req);
 	}
 	public function add () {
 		$this->add = true;
    $input = file_get_contents('php://input');
    $this->requestBody = $input ? json_decode($input) : (object)array_map(function($value){return ['Value'=>$value];}, $_POST);
    // $this->requestBody->CreatedByID = $this->sub;
    return $this->update();
    //
    //
    // if (empty($_GET)) {
    //   return $this->update();
    // } else {
    //   $q="SET NOCOUNT ON
    //   SET DATEFORMAT YMD;
    //   DECLARE @id BIGINT,@classID BIGINT
    //   EXEC item.getClassID @ClassID=@ClassID OUTPUT,@schema='$this->schemaname'
    //   SELECT id FROM item.vw WHERE HostID=$this->client_id AND ClassID=@ClassID AND ".implode('AND',array_map(
    //     function($key,$val) {
    //       return "(ID IN (SELECT ItemID FROM attribute.dv WHERE NameID IN (SELECT ID FROM attribute.name WHERE name='$key') AND Value='$val'))";
    //     },
    //     array_keys((array)$_GET),
    //     array_values((array)$_GET)
    //   ));//.";IF @id IS NULL BEGIN;INSERT INTO item.dt (HostID,ClassID)VALUES($this->client_id,@ClassID);SET @id=scope_identity();END;SELECT @id AS id;"
    //   $res = aim()->query($q);
    //   // echo 'JA';
    //   // debug($q,'JA',empty($res),$this->id );
    //   if ($row = sqlsrv_fetch_object($res)) {
    //     while ($row) {
    //       // echo 'ROW';
    //       $this->requestBody = json_decode($input);
    //       $this->requestBody->CreatedByID = $this->sub;
    //       $this->update($this->id = empty($row) ? null : $row->id);
    //       $row = sqlsrv_fetch_object($res);
    //     }
    //   } else {
    //     return $this->update();
    //   }
    // }
    // // return $this->get();
 	}
  public function patch ($requestBody = null) {
    // debug($requestBody, $this->id);

    $this->requestBody = $requestBody ?: json_decode(file_get_contents('php://input'));
    return $this->update();
  }
  public function post () {
    // return;
    // $input = file_get_contents('php://input');
    // $this->requestBody = $input ? json_decode($input) : (object)array_map(function($value){return ['Value'=>$value];}, $_POST);
    // debug($this->requestBody);

    // debug(1);

    $headers = getallheaders();
    if (strstr($headers['Content-Type'], 'multipart/form-data')) {
      $schema = aim()->api->components->schemas->{$this->schemaname};
      // $this->requestBody->schema = $schema;
      $item = (object)[];
      $q = '';
      $clientId = id(aim()->access['client_id']);
      foreach($_POST as $attributeName => $value) {
        // debug(1, aim()->access['client_id']);

        // if (empty($schema->properties->$attributeName)) continue;
        // if (!empty($schema->properties->$attributeName)) {
        //   $property = $schema->properties->$attributeName;
        // }
        $value = str_replace("'","''",$value);
        $q .= "EXEC item.attr @hostId=$clientId, @ItemID=$this->id, @name='$attributeName', @value='$value';";
        $item->$attributeName = $value;
        // debug($propertyName, $property);
      }
      if (!empty($q)) {
        // die($q);
        // debug($q);
        aim()->query($q);
        if (!empty($_GET['mailto'])) {
          // echo 'sss';debug(getallheaders(),aim()->access);
          $account = sqlsrv_fetch_object(aim()->query(
            "EXEC account.get @AccountId=%d",
            aim()->access['sub']
          ));
          aim()->account_get($item->{$_GET['mailto']}, [
            ['title' => $item->{$_GET['mailto']},'content'=> ''],
            [
              'title' => __('new_data'),
              'content'=> __('new_data_intro', $_GET['uri']),
            ],
          ]);
          aim()->mail([
            'send'=> 1,
            'to'=> $account->email,
            'bcc'=> "max.van.kampen@alicon.nl",
            'chapters'=> [
              ['title' => $account->email,'content'=> ''],
              [
                'title' => __('new_data_send'),
                'content'=> __('new_data_send_intro', $_GET['uri']),
              ]
            ],
          ]);



          // debug($item->{$_GET['mailto']});
        }
        return $this->update();
        // return $item;
      }



      // debug($this, $headers['Content-Type'], getallheaders());
      // debug($_POST);
      return;
      http_response_code(201);
    }
    // extract($param = array_merge(empty(aim()->api->components->schemas->{$tag}) ? [] : (array)aim()->api->components->schemas->{$tag}, $_POST));
    //debug('POST', $param);
 		//$aud = $this->req[headers][aud];
 		$path = $this->req['path'];
 		$schema = array_shift(explode('(',trim($path,'/')));
 		$q .= "
    DECLARE @classID INT;SET @classID=item.getClassIdByName($aud,'$schema')
    DECLARE @id INT;INSERT item.dt(classID,hostID,userID)VALUES(@classID,$aud,$sub)
    SET @id = scope_identity()
    ";
 		foreach($requestBody as $attributeName => $value) {
      $q .= "
      EXEC item.attr @ItemID=@id,@name='$attributeName',@value='$value'
      ";
    }
 		sqlsrv_fetch_object(aim()->query($q));


 		http_response_code(201);
 		/* @todo response bevat minimaal gegevens van toegevoegd item */
 		return;
 	}
  public function update ($asRow = 0) {
    // debug(1, $this->schemaname);
    // debug(3);
    // $this->parameters($_GET);
    // debug(3, $this->requestBody);
    // debug(11);
    // if (empty($this->requestBody)) return;
    $requestBody = $this->requestBody;

    $q = "SET NOCOUNT ON
    SET DATEFORMAT YMD;
    DECLARE @ClientId BIGINT, @UserId BIGINT, @Id BIGINT, @classID BIGINT, @LastModifiedDateTime DATETIME;
    SELECT
    @ClientId = item.getId('$this->client_id'),
    @UserID = item.getId('$this->sub'),
    @LastModifiedDateTime = GETDATE()
    EXEC item.getClassID @hostId=@ClientId, @schema='$this->schemaname', @ClassID=@ClassID OUTPUT
    ";

    if (empty($this->id) || !empty($this->add) ) {
      $this->id = sqlsrv_fetch_object(aim()->query(
        $q."INSERT INTO item.dt (HostID, ClassID, CreatedByID) VALUES (@ClientId,@ClassID,@UserID);SET @id=scope_identity()
        SELECT @id AS id
        EXEC item.attr @HostID=@ClientId, @ItemID=@id, @Value=@UserID,@AttributeName='CreatedByID'
        "
      ))->id;
      // $requestBody->CreatedByID = $this->sub;
    }
    // debug(1, $this->id, $this->requestBody);
    $q .= ";SET @id=$this->id;";
    // if (isset($requestBody->files)) {
    //   foreach ($requestBody->files as $i => $ofile) {
    //     if (isset($ofile->data)) $requestBody->files[$i] = $this->file('post',$ofile);
    //   }
    //   $q.=";UPDATE item.dt SET files='".json_encode($requestBody->files,JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."' WHERE id=@id";
    //   unset($requestBody->files);
    // }
    if (isset($requestBody->schema)) {
      // $this->schemaname = $this->schemaname
      $q.=";SELECT @classID=id FROM item.class WHERE name='$requestBody->schema';UPDATE item.dt SET ClassID=@ClassID WHERE ID=@id";
      unset($requestBody->schema);
    }
    foreach($requestBody as $attributeName => $value) {
      if (is_array($value)) {
        $value = (object)$value;
      } else if (!is_object($value)) {
        $value = (object)['Value' => is_object($value) ? json_encode($value,JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : $value];
      }
      if (isset($this->schema->properties->{$attributeName}) && !empty($this->schema->properties->{$attributeName}->schema)) {
        $value->schema = $this->schema->properties->{$attributeName}->schema;
      }
      $value->AttributeName = $attributeName;
      // $value->LastModifiedDateTime = $this->LastModifiedDateTime;
      // debug($value);
      // debug($value);
      $q.="\n;EXEC item.attr @HostID=@ClientId, @ItemID=@id, ".implode(',',array_map(
        function($key,$val) {
          return "@$key='".str_replace("'","''",is_object($val) || is_array($val) ? json_encode($val,JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : $val)."'";
        },
        array_keys((array)$value),
        array_values((array)$value)
      ));
    }
    $q .= "
    ;SET NOCOUNT OFF
    SELECT ID,@LastModifiedDateTime AS LastModifiedDateTime FROM item.vw WHERE ID=@id
    ";
    // echo $q;
    // debug(1);

    $item = sqlsrv_fetch_object(aim()->query($q));
    // return $item;
    $this->LastModifiedDateTime = $item->LastModifiedDateTime;
    // if ($asRow) {
    //   return $item;
    // }
    $this->reindex($this->id = $item->ID);



    $item = (object)[];
    $this->sql = "SELECT ID AS _ID,*--[schema],'$this->LastModifiedDateTime' AS LastModifiedDateTime
    FROM item.vw
    WHERE ID=$this->id;
    SELECT $this->ATTRIBUTE_PROPERTIES
    FROM attribute.vw AS A
    WHERE ItemID=$this->id
    AND HostID=item.getId('$this->client_id')
    AND LastModifiedDateTime >= '$this->LastModifiedDateTime'";
    // debug(1);
    // debug($this->sql);

    // $res = aim()->query(";SELECT AttributeName,Value FROM attribute.dv WHERE ItemID=$this->id AND LastModifiedDateTime = '$this->LastModifiedDateTime'");
    // while ($row = sqlsrv_fetch_object($res)) {
    //   $item->{$row->AttributeName} = $row->Value;
    // }
    return $this->build_response();
    // die();
    // return $item;
    //
    // die($q);
    //
    // // debug ($item);
    // // die($q);
    //
    // // return $item;
    //
    //
    // // die(str_replace(';',"\n;",$q));
    // // debug('PATCH',str_replace("\n","",$q));
    //
    // // return $requestBody;
    //
    //
    // return sqlsrv_fetch_object(aim()->query($q));
    //
    // return $q;
    // // if ($input->masterID || $input->finishDT) $q.="
    // // 	DECLARE @T TABLE (id INT,cnt INT,finishDT DATETIME)
    // // 	INSERT @T
    // // 	SELECT M.id,C.cnt,C.finishDT
    // // 	FROM om.itemMasters(@id)M
    // // 	LEFT OUTER JOIN (
    // // 		SELECT masterID,SUM(CASE WHEN finishDT IS NULL THEN 1 ELSE 0 END)cnt,MAX(finishDT)finishDT FROM item.vw GROUP BY masterID
    // // 	)C ON C.masterID=M.id
    // // 	UPDATE item.dt SET finishDT=T.finishDT FROM @T T WHERE item.dt.id=T.id AND cnt=0
    // // 	UPDATE item.dt SET activeCnt=cnt,finishDT=NULL FROM @T T WHERE item.dt.id=T.id AND cnt>0
    // // ";
    // $q .= "
    // SET NOCOUNT OFF
    // SELECT id,[schema],idx,keyname,keyID,name,title,masterID,srcID,hostID,detailID FROM item.vw WHERE id=$id
    // ";
    // //die('<plaintext>'.$q);
    //
    // //die($q);
    //
    //
    // $item = sqlsrv_fetch_object($res = aim()->query($q));
    // if(!$item && sqlsrv_next_result($res)) $item = sqlsrv_fetch_object($res);
    // if(isset($param["reindex"]) && $item->id) item::reindex($item->id);
    // if ($param["select"] == '*'){
    //   $res = aim()->query("SELECT name,value FROM item.attributelist WHERE id=$item->id");
    //   while($row = sqlsrv_fetch_object($res))$item->values->{$row->name}->value=$row->value;
    // }
    //
    // //die(json_encode($req));
    // return ["status" => 200, "body" => $item];
    // //
    // // http_response_code(202); // Accepted
    // // die(json_encode($item));

  }
 	public function delete () {
    if (empty($this->requestBody = json_decode(file_get_contents('php://input')))) {
      aim()->query($q="UPDATE item.dt SET DeletedDateTime=GETDATE() WHERE ID=$this->id;DELETE attribute.dt WHERE linkID=$this->id;");
    } else {
      $q='';
      foreach($this->requestBody as $attributeName => $value) {
        if (empty($value)) $q.="DELETE attribute.dv WHERE ItemID=$this->id AND name='$attributeName';";
        else if ($value->LinkID) $q.="DELETE attribute.dt WHERE ItemID=$this->id AND nameID IN (SELECT id FROM attribute.name WHERE name='$attributeName') AND LinkID='$value->LinkID'";
      }
      aim()->query($q);
      // return $q;
    }
 		return;
 	}
  public function reindex ($id) {
		// if (!$this->id && !empty($_GET['scan'])) {
		// 	$row = fetch_object($res=aim()->query($q="SELECT TOP 1 id FROM api.items WHERE id>10000 AND indexDT IS NULL ORDER BY id DESC"));
		// 	if(!$row->id)die();
		// 	item::reindex($row->id);
		// 	header("Refresh:1");
		// 	die($row->id);
		// }
		// if (!$this->id && $_GET[schemaName]) {
		// 	$aim=(object)$_GET;
		// 	$res=aim()->query($q="SELECT TOP 50 id,title,indexDT FROM api.citems WHERE hostID=$aim->hostID AND class='$aim->schemaName' AND indexDT IS NULL ORDER BY indexDT");
		// 	//die($q);
		// 	//$log=array();
		// 	while($row=fetch_object($res)) {
		// 		$log[$row->id]=$row;
		// 		item::reindex($row->id);
		// 	}
		// 	die(json_encode(array_values($log)));
		// }

		$q = "SELECT Tag,[schema],Keyname,Name,Title FROM item.vw WHERE id=$id
    SELECT AttributeName,Value FROM attribute.vw WHERE HostID=item.getId('$this->client_id') AND ItemID=$id";
		if (empty($item = sqlsrv_fetch_object($res = aim()->query($q)))) return;
    // debug($item);
		$allwords = implode(' ',array_values((array)$item));
		if (sqlsrv_next_result($res)) {
      while ($row = sqlsrv_fetch_object($res)) {
        $item->{$row->AttributeName} = $row->Value;
        $allwords .= ' '.strip_tags(preg_replace('/>/','> ',$row->Value));
      }
    }
    $q=[];
    $schemaname = $item->schema;
    $schema = aim()->api->components->schemas->{$item->schema};
    if (!empty($schema->header)) {
      $headers = $schema->header;
      $headerValues = [[],[],[]];
      $headerNames = ['Title','Subject','Summary'];
      foreach ($headers as $i => $attributeNames) {
        foreach ($attributeNames as $attributeName) {
          if (!empty($item->$attributeName)) {
            $headerValues[$i][] = strip_tags($item->$attributeName);
          }
        }
        $value = $headerValues[$i] = trim(substr(implode(' ',$headerValues[$i]),0,500));
        $key = $headerNames[$i];
        // if ($key === 'Subject') debug($attributeNames,empty($item->$key),$item->$key,empty($value),$value);
        $oldvalue = !empty($item->$key) ? $item->$key : '';
        // if (empty($item->$key) && empty($value)) continue;
        if ($oldvalue == $value) continue;
        // debug($oldvalue,$value);
        $q[]="EXEC item.attr @HostID='$this->client_id',@ItemID=$id,@Name='$key',@Value='".str_replace("'","''",$value)."'";
      }
    }
    if ($q) aim()->query($q=implode(";\n",$q));
    // debug($q);
    //
    //
    // aim()->query("UPDATE item.dt SET ".implode(
    //   ',',
    //   array_map(
    //     function($key,$val) {
    //       return "[$key]='".str_replace("'","''",is_object($val) || is_array($val) ? json_encode($val) : $val)."'";
    //     },
    //     ['Title','Subject','Summary'],
    //     $headerValues
    //   )
    // )." WHERE ID=$id");

		$allwords = array_values(
      array_filter(
        array_unique(
          preg_split(
            '/ /',
            preg_replace(
              '/\[|\]|\(|\)|\+|\-|:|;|\.|,|\'|~|\/|_|=|\?|#|>/',
              ' ',
              strtolower(
                mb_convert_encoding(
                  $allwords,
                  'HTML-ENTITIES',
                  'UTF-8'
                )
              )
            ),
            -1,
            PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY
          )
        ),
        function($word){
          return !is_numeric($word) && strlen(trim($word))>2 && !in_array($word,['de','het','een','op','in','van','voor','bij','dit','dat','https','html','geen']);
        }
      )
    );
    $q="
    DECLARE @W TABLE (word VARCHAR(500))
    DELETE item.word WHERE itemID=$id
    INSERT @W VALUES('".implode("'),('",$allwords)."')
    INSERT word.dt (word) SELECT word FROM @w WHERE word NOT IN (SELECT word FROM word.dt)
    INSERT item.word (ItemID,WordID) SELECT $id,W.id FROM @W T INNER JOIN word.dt W ON W.word=T.word
    UPDATE item.dt SET LastIndexDateTime=GETDATE() WHERE ID=$id
    SELECT W.AttributeName,W.Value FROM item.word IW
    INNER JOIN word.dt W ON W.ID = IW.WordID AND IW.ItemID=$id AND W.AttributeName IS NOT NULL
    ";
    // die($q);
    $res = aim()->query($q);
    if (!$res) die($q);
    $filterfields = (object)array();
    foreach ($schema->properties as $AttributeName => $property) {
      if (!empty($property->filter) && !empty($item->$AttributeName)) {
        $filterfields->{$AttributeName} = $item->$AttributeName;
      }
    }
    while ($row = sqlsrv_fetch_object($res)) {
      $filterfields->{$row->AttributeName} = $row->Value;
    }
    if (!empty($filterfields)) aim()->query($q="UPDATE item.dt SET filterfields='".str_replace("'","''",json_encode($filterfields))."' WHERE ID=$id;");
    // debug($q);

		//foreach ($wordcnt as $word=>$cnt)$q.=";EXEC api.addItemWord '".toUtf8(dbvalue($word))."',$id,$cnt";
	}
}

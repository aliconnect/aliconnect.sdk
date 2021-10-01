// let aimClient;

console.debug('client.js');

Aim.Client = function Client (config) {

  console.log('Aim', Aim.aimClient);

  this.config = config;
  // aimClient.clients.push(this);
  config.servers = config.servers || [{url: $.config.url}];
  console.warn(config.servers, $.config.url);
  Array.from(config.servers).forEach(server => aimClient.servers.set(server.url, this));
  this.url = config.servers[0].url;
  // this.hostname = this.url.match(/\/\/(.*?)\//)[1];


  return this;
  // client(options){
  //   this.get(Client, options ? Object.assign(options,{authProvider: options.authProvider || this.authProvider()}) : null);
  //   return this;
  // },
  // console.error(...arguments);
  // [...arguments].forEach($(this).extend)
  this.config = {
    id: {},
    server: [
      {
        url: window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api',
      }
    ]
  };
  [...arguments].forEach(options => $(this.config).extend(options));
  this.url = this.config.servers[0].url;
  this.hostname = this.url.match(/\/\/(.*?)\//)[1];
  clients.set(this.hostname, this);



  // this.config = config;
  // console.debug(this.authProvider);
  // if (this.access_token = this.authProvider.getAccessToken()){
  // 	this.access = JSON.parse(atob(this.access_token.split('.')[1]));
  // 	this.sub = this.access.sub;
  // 	this.aud = this.access.aud;
  // }
  // $.his.dms = $.his.dms || [];
  // $.his.dms.push(this);
  // $().dms[selector] = this;
  // Object.assign(this, context);
  // this.config = context;
  // console.debug('SERVERS', this.servers);

  // this.id = {};
  // this.servers = this.servers || [];
  // this.server = this.servers[0] || {};
  // this.url = this.server.url || (window.document ? document.location.origin+'/api' : 'https://aliconnect.nl/api');
  // const hostname = this.hostname = this.url.match(/\/\/(.*?)\//)[1];
  // $[hostname] = this;
  // console.debug('Client', this.hostname, this);
  // const servers = this.servers || [];
  // this.server = servers[0] || {};
  // console.debug(`Client ${selector} = ${context.info ? context.info.title : ''}`);
}
Aim.Client.prototype = {
  loginUrl() {
    console.error(this.config.client_id);
    return $()
    .url('https://login.aliconnect.nl/')
    .query({
      prompt: 'login',
      response_type: 'code',
      client_id: this.config.client_id,
      redirect_uri: document.location.origin + (this.config.redirect_path || ''),
      // client_id: config.auth.client_id || config.auth.clientId,
      // state: state,
      scope: this.config.scope,//('all'),
      // socket_id: data.socket_id,
    });
  },
  // configGet() {
  //   return $().url(this.url+'/../config.json').get().then(e => {
  //     console.warn('configGet', e.body);
  //     $.extend(this.config, e.body);
  //     // $.config = e.body;
  //   }).catch(console.error);
  // },
  // configUserGet() {
  //   return $().url(this.url+`/../config/${this.authProvider.sub}/config.json`).get().then(e => {
  //     $.extend(this.config, e.body);
  //     // $.extend($.config, JSON.parse(e.target.responseText));
  //     // $($.config).extend(aimClient.api_user = e.body);
  //   }).catch(err => {
  //     // aimClient.api_user = {};
  //   });
  // },
  api(src){
    // console.error(this.config.servers[0]);
    return $()
    .url(new URL(src.replace(/^\//, ''), this.config.servers[0].url + '/').href)
    .authProvider(this.config.authProvider)
    .body()
  },
  // getApi(){
  //   return $.promise( 'Get API', (resolve,fail) => {
  //     const api = this.api('/').get().then(e => {
  //       if (e.body.components && e.body.components.schemas) {
  //         $().schemas(e.body.components.schemas);
  //       }
  //       // console.warn(e.body);
  //       resolve(e.body);
  //     })
  //   });
  // },



  Get_Aliconnector_Key(){
    copyText = document.body.createElement('INPUT', { value: $.deviceUID });
    copyText.select();
    document.execCommand("Copy");
    document.body.removeChild(copyText);
    alert('Plak (Ctrl+V) de code in het veld "User device UID" van uw aliconnector app');
  },
  addrules(){
    if (this.web && this.web.css && this.web.css.rules){
      for (let [name, value] of Object.entries(this.web.css.rules)){
        new $.css(name, value);
      }
    }
  },
  createLoginFrame(params){
    params = Object.assign(params, {
      response_type: 'code',
      // redirect_uri: document.location.href,
      prompt: 'accept',
      scope: 'name email',
    });
    // params = new URLSearchParams({
    // 	client_id: client_id || $.config.$.client_id,
    // 	response_type: 'code',
    // 	// redirect_uri: document.location.href,
    // 	scope: 'name email',
    // 	state: '12345',
    // 	prompt: 'login',
    // });
    let url = 'https://login.aliconnect.nl?' + new URLSearchParams(params).toString();
    console.debug('LOGIN', url);
    // let login_window = window.open(url, 'login', 'top=0,left=0,width=300,height=300');
    // let loginElement = document.body.createElement('iframe', {src: url, style: 'position:fixed;margin:auto;width:100%;height:100%;top:50px;right:50px;bottom:50px;left:50px;'});
    let loginElement = document.body.createElement('DIV', { style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.5);' }, [
      ['IFRAME', { src: url, style: 'position:fixed;margin:auto;top:0;right:0;bottom:0;left:0;width:100%;height:100%;max-width:500px;max-height:500px;border:none;' }]
    ]);
    window.addEventListener('message', e => {
      loginElement.remove();
      $.auth.getLogin();
      // if (callback) callback($.auth.id);
    }, false);
    return;
    // const params = new URLSearchParams({
    // 	client_id: client_id || $.config.$.client_id,
    // 	response_type: 'code',
    // 	redirect_uri: document.location.href,
    // 	scope: 'name email',
    // 	state: '12345',
    // 	prompt: 'login',
    // });
    // document.location.href = 'https://login.aliconnect.nl?' + params.toString();
  },
  mail(){
    return new $.HttpRequest('POST', $.origin + '/api?request_type=mail', params, res).send();
  },
  pdf(){
    return new $.HttpRequest('POST', $.origin + '/api?request_type=pdf', params, res).send();
  },
  publish(){
    console.debug("PUBLISH");
    new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
      console.debug("API", this.responseText );
      return;
      var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
      var onlineUrl = 'https://' + $.config.$.domain + '.aliconnect.nl';
      console.debug(swaggerUrl, onlineUrl);
      if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
      //else console.debug(swaggerUrl);
      if (confirm("Show online")) window.open(onlineUrl, "om");
      return;
      console.debug(onlineUrl, this.responseText);
      document.location.href = document.location.pathname;
    }).send();
    return;
    var def = {
      paths: {
        item: {
          get: {
            parameters: [
              {name: "id", in: "path", description: "", required: true, schema: { type: "integer", format:"int64"}},
              {name: "child", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "tree", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "master", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "src", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "user", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "refby", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "link", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "select", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "search", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "sync", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "order", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "filter", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "three", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "top", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "Accept", in: "query", description: "", schema: { type: "integer", format:"int64"}},
              {name: "Accept", in: "header", description: "", schema: { type: "integer", format:"int64"}},
              {name: "Odata-Version", in: "header", description: "", schema: { type: "integer", format:"int64"}},
              {name: "aud", in: "header", description: "", schema: { type: "integer", format:"int64"}},
              {name: "sub", in: "header", description: "", schema: { type: "integer", format:"int64"}},
            ],
            responses: {
              405: { description: "Invalid input", content: { } }
            },
          },
        }
      }
    };
    var api = JSON.parse(aimapi);
    api.paths = api.paths || {};
    for (var SchemaName in api.components.schemas){
      var schemaName = SchemaName, schema = api.components.schemas[SchemaName];
      (api.tags = api.tags || []).push({name:SchemaName});
      schema.security = schema.security || {
        get: [{ default_auth: ['read:web'] }],
        post: [{ default_auth: ['read:web'] }],
        patch: [{ default_auth: ['read:web'] }],
        delete: [{ default_auth: ['read:web'] }],
      };
      api.paths['/' + schemaName] = api.paths['/' + schemaName] || {
        get: {
          //"tableName": schema.tableName, "idname": schema.idname, "searchNames": schema.searchNames,
          tags: [schemaName],
          Summary: "Get list of " + SchemaName,
          operationId: "item('" + SchemaName + "').find",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
          security: schema.security.get,
        },
        post: {
          tableName: schema.tableName, "idname": schema.idname,
          tags: [schemaName],
          Summary: "Add a new " + SchemaName,
          operationId: "item('" + SchemaName + "').add",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
          requestBody: {
            description: SchemaName + " object that needs to be added to the store",
            content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } }
          },
          security: schema.security.post,
        },
      };
      api.paths['/' + schemaName + "(id)"] = api.paths['/' + schemaName + "(id)"] || {
        get: {
          // tableName: schema.tableName,
          // idname: schema.idname,
          tags: [schemaName],
          Summary: "Find " + SchemaName + " by ID",
          description: "Returns a single " + SchemaName,
          operationId: "item('" + SchemaName + "').get",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: {
            200: { description: "successful operation", content: { "application/json": { schema: { "$ref": "#/components/schemas/" + SchemaName } } } },
            400: { description: "Invalid ID supplied", content: {} },
            404: { description: SchemaName + " not found", content: {} }
          },
          security: schema.security.get,
        },
        post: {
          // tableName: schema.tableName, "idname": schema.idname,
          tags: [schemaName],
          Summary: "Updates a " + SchemaName + " with form data",
          operationId: "item('" + SchemaName + "').post",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
          requestBody: {
            content: {
              "application/x-IsPublic-form-urlencoded": {
                schema: {
                  properties: {
                    name: { type: "string", description: "Updated name of the " + SchemaName },
                    status: { type: "string", description: "Updated status of the " + SchemaName }
                  }
                }
              }
            }
          },
          security: schema.security.post,
        },
        patch: {
          // tableName: schema.tableName,
          // idname: schema.idname,
          tags: [schemaName],
          Summary: "Updates a " + SchemaName,
          operationId: "item('" + SchemaName + "').patch",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
          security: schema.security.patch,
        },
        delete: {
          // "tableName": schema.tableName, "idname": schema.idname,
          tags: [schemaName],
          Summary: "Deletes a " + SchemaName,
          operationId: "item('" + SchemaName + "').delete",
          parameters: def.paths.item.get.parameters, //{ "$ref": "#/paths/item/get/parameters" },
          responses: def.paths.item.get.responses, //{ "$ref": "#/paths/item/get/responses" },
          security: schema.security.delete,
        }
      }
      //"security, usertasks".split(", ").forEach(function(key){delete(schema[key]);});
      // var properties = {};
      // for (var propertyName in schema.properties){
      // 	var property = properties[propertyName] = {};
      // 	for (var key in ref.properties){
      // 		if (schema.properties[propertyName][key]) property[key] = schema.properties[propertyName][key];
      // 	}
      // }
      //api.components.schemas[SchemaName] = {properties: properties};
    }
    console.debug(api.paths);
    aimapi = JSON.stringify(api, null, 2);
    var js = $.operations ? JSON.stringify($.operations, function(key, value){ return typeof value == "function" ? value.toString() : value }, 4).replace(/\\r\\n/g, '\r\n').replace(/\\t/g, '    ').replace(/"function /g, 'function ').replace(/}"/g, '}') : "";
    //return;
    //console.debug("FN", "$.extend({operations: {\n" + fn.join(", \n") + "\n}});" );
    new $.HttpRequest($.config.$, 'POST', '/', aimapi, e => {
      console.debug("API", this.responseText );
      new $.HttpRequest($.config.$, 'POST', '/?js', `$.operations = ${js};`, e => {
        console.debug("JS", this.responseText );
        var swaggerUrl = 'https://editor.swagger.io/?url=https://'+$.config.$.domain+'.aliconnect.nl/openapi.json';
        var onlineUrl = 'https://'+$.config.$.domain+'.aliconnect.nl';
        console.debug(swaggerUrl, onlineUrl);
        if (confirm("Show in Swagger editor")) window.open(swaggerUrl, "swagger");
        //else console.debug(swaggerUrl);
        window.open(onlineUrl, "om");
        return;
        console.debug(onlineUrl, this.responseText);
        document.location.href = document.location.pathname;
      });
    }).send();
  },
  qrcode(selector){
    if (typeof QRCode === 'undefined'){
      return Object.assign(document.head.createElement('script'), {
        src: 'https://aliconnect.nl/api/js/lib/qrcode.js',
        onload: arguments.callee.bind(this, ...arguments),
      });
    }
    new QRCode(selector, {
      // text: $.config.$.websocket.socket_id,
      text: $.config.$.websocket.socket_id ? 'https://login.aliconnect.nl?s=' + $.config.$.websocket.socket_id : '',
      width: 160,
      height: 160
    });
  },
  randompassword(){
    a = [];
    for (var i = 0; i < 20; i++){
      // a.push(String.fromCharCode(48 + Math.round(74 * Math.random())));
      a.push(String.fromCharCode(33 + Math.round((126-33) * Math.random())));
    }
    return a.join('');
  },
  setUserstate(userstate){
    clearTimeout(this.stateTimeout);
    const config = this.config;
    if (this.access && this.access.sub){
      if (userstate === 'available'){
        this.stateTimeout = setTimeout(() => $.setUserstate('inactive'), 5 * $.config.minMs);
      } else if (userstate === 'inactive'){
        this.stateTimeout = setTimeout(() => $.setUserstate('appear_away'), 5 * $.config.minMs);
      }
      if (this.userstate !== userstate){
        $.send({
          // to: { aud: $.auth.access.aud, sub: $.auth.access.sub },
          sub: this.access.sub,
          userstate: this.userstate = userstate,
        });
      }
    }
  },
  setState(activestate){
    //// console.debug('setactivestate', activestate);
    //var data = { activestate: activestate, accountID: $.client.account.id, userID: $.Account.sub, to: [$.key] };
    //fieldset($.Account.sub, 'state', activestate, true);
    //fieldset($.client.account.id, 'state', activestate, true);
    // Check if current logged in user is still logged in
    if (activestate == 'focus'){
      //if ('auth' in $) $.auth.check_state();
      // src='https://login.aliconnect.nl/api/v1/oauth/token/index.php';
      // src='https://login.aliconnect.nl/$-connect/$-api/v1/oauth/token/index.php';
      // new $.Client({
      // 	src: src, onload: function(e){
      // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
      // 		if (this.status != 200) $.auth.login();
      // 		//// console.debug('api', this.data);
      // 	}
      // });
      // src=$.authurl + 'token/';
      // new $.Client({
      // 	src: src, onload: function(e){
      // 		// console.debug('SETACTIVESTATE', this.status, this.responseText, this.data);
      // 		if (this.status != 200) $.auth.login();
      // 		//// console.debug('api', this.data);
      // 	}
      // });
      return;
      ws.send({
        //broadcast: true,
        //to: { host: $.Account.aud },
        value: [{ id: $.Account.sub, values: { state: activestate } }, { id: $.client.account.id, values: { state: activestate } }]
      });
    }
    //return;
    //ws.send(data);
    //ws.send({ a: 'set', id: $.client.account.id, name: 'online', value: false });
    //ws.send({ a: 'blur' });
    //clearTimeout(msg.to);
    //new $.Client({
    //    api: 'window/blur/' + aliconnect.deviceUID,
    //    //post: { exec: 'onblur', deviceUID: aliconnect.deviceUID, },
    //    onload: function(){
    //        //// console.debug('onblur done', this.post);
    //    }
    //});
  },
  sms(){
    return new $.HttpRequest('POST', $.origin + '/api?request_type=sms', params, res).send();
  },
  then(callback){
    this.callback = callback;
  },
  ws_send_code(socket_id, code){
    $.WebsocketClient.request({
      to: {
        sid: socket_id,
      },
      body: {
        // id_token: $.auth.id_token,
        code: code,
      },
    });
    window.close();
  },
};
Object.assign(Aim.Client, {
  initWithMiddleware() {
    // const options = Object.assign()
    return new this(Object.assign({}, ...arguments));
  },
})

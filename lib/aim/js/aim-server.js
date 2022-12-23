const {on,emit,forEach,error,config,fs,atob,makeToken,getToken} = Aim;
crypto = require('crypto');
const aimServer = module.exports = {
  emit,forEach,on,
  create(options){
    let {client_id,client_secret,http,sqlsrv} = options;
    if (sqlsrv) {
      const {port, server, userName, password, database} = sqlsrv;
      const requests = [];
      const {Connection,Request} = require('tedious');
      let sqlBusy;
      function query(sql){
        return new Promise((resolve, reject) => {
          const connection = new Connection({
            port,
            server,
            authentication: {
              type: 'default',
              options: {userName,password}
            },
            options: {
              database,
              encrypt: true,
              validateBulkLoadParameters: true,
              trustServerCertificate: true,
              cryptoCredentialsDetails: { minVersion: 'TLSv1' },
            },
          });
          connection.on('connect', err => {
            if (err) throw err;
            const recordsets = [];
            let rows = [];
            // return new mssql.Request().query(sql, (err, res) => {
            //   if (err) console.error(err);
            //   end(200, JSON.stringify(res.recordsets), { 'Content-Type': 'application/json' });
            // })
            const request = new Request(sql, (err, res) => {
              if (err) {
                reject(err);
              }
              connection.close();
            });
            request.on('done', rowCount => console.debug('Done is called!'));
            request.on('error', err => console.debug('error!', err));
            request.on('doneInProc', (rowCount, more) => {
              recordsets.push(rows);
              rows = [];
            });
            request.on('requestCompleted', () => resolve(recordsets));
            request.on('row', columns => rows.push(Object.fromEntries(columns.map(col => [col.metadata.colName, col.value]))));
            connection.execSql(request);
          });
          connection.on('error', function(err) {
            console.debug(err);
          });
          connection.connect();
        });
      }
      Object.assign(aimServer, {query});
    }
    if (http) {
      const {ca,key,cert,port} = http;
      // crypto = require('crypto');
      url = require('url');
      let paths = [process.mainModule.path+'/public', process.mainModule.path];
      (function addpath(module) {
        if (module.parent) addpath(module.parent);
        paths.push(...module.paths);
      })(module);
      paths = paths.unique().filter(path => fs.existsSync(path));
      // YAML = require('yaml');
      const server = ca
      ? require('https').createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert), ca: ca ? fs.readFileSync(ca) : null }, processRequest)
      : require('http').createServer(processRequest);
      server.listen(port);
      const webSocketServer = new WebSocket.Server({server}).on('connection', connection);
      const {clients} = webSocketServer;
      function connection(webSocket, req) {
        function send(data){
          webSocket.send(JSON.stringify(data));
        }
        const remoteAddress = req.connection.remoteAddress.split(':').pop();
        const sid = webSocket.sid = Crypto.btoaToJson(req.headers['sec-websocket-key']);
        console.debug(sid, remoteAddress, 'CONNECTION');
        webSocket.on('close', connection => {
          console.debug(sid, remoteAddress, 'CLOSE');
          const message = JSON.stringify({ sid, path: 'CONNECTION_CLOSE' });
          Array.from(clients)
          .filter(client => client !== webSocket && client.aud === webSocket.aud)
          .forEach(client => client.send(message));
          if (webSocket.connector) {
            Array.from(clients)
            .filter(client => client.connectorClient && client.connectorClient.nonce === webSocket.connector.nonce)
            .forEach(client => client.send(JSON.stringify({path: '/aliconnector/connector/close'})));
          }
        });
        webSocket.addEventListener('message', async (event) => {
          try {
            let {data,target} = event;
            // aimServer.query(`INSERT INTO auth.dbo.log(data) VALUES('${data}')`);
            data = JSON.parse(data);
            return Aim.emit('message', {data,target,sid,remoteAddress});
            return;
            if (sid) {
              data.sid = webSocket.sid;
              console.debug(path, sid, data);
              data = JSON.stringify(data);
              Array.from(clients).filter(client => client.sid === sid).forEach(client => client.send(data));
              return;
            }
            switch (path) {
              default: {
                // var match;
                // if (match = path.match(/^\/(.+?)\((.+?)\)(.+?)/)) {
                //   const [s,key,id] = match;
                //   console.debug(333, key,id);
                //   console.debug(Array.from(clients).map(client => client.access));
                //   const to = Array.from(clients).filter(client => client.access && client.access[key] == id);
                //   data = JSON.stringify(Object.assign(data,{sid:webSocket.sid}));
                //   to.forEach(client => client.send(data));
                //   // console.debug(key,id,to);
                // }
                // console.debug();
                const stringData = JSON.stringify(data);
                // console.debug(Array.from(clients).map(client => client.access));
                if (headers) {
                  const access = getAccess(headers, true);
                  if (access && access.aud) {
                    Array.from(clients)
                    .filter(client => client.readyState === client.OPEN &&
                      client !== webSocket &&
                      client.access &&
                      client.access.id &&
                      client.access.id === access.aud
                      // || client.access.client_id == client.access.client_id
                    ).forEach(client => client.send(stringData));
                  }
                }
              }
            }
            if (body) {
              const {notify,accept} = body;
              if (notify) {
                //console.debug('NOTIFY', window.document.hasFocus());
                if (!window.document.hasFocus()) {
                  if ("Notification" in window) {
                    if (Notification.permission === "granted") {
                      // var notification = new Notification(...Object.values(data.body.notify));
                      // notification.onclick = function(e) {
                      //   window.focus();
                      //   //console.debug('CLICKED', data.body.notify);
                      // }
                      new Aim().sw.showNotification(...Object.values(notify));
                      // `test modified SW`, {
                      //   body: `Bla Bla`,
                      //   icon: 'https://aliconnect.nl/favicon.ico',
                      //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
                      //   data: {
                      //     url: document.location.href,
                      //   },
                      //   actions: [
                      //     {
                      //       action: 'new',
                      //       title: 'New',
                      //       // icon: 'https://aliconnect.nl/favicon.ico',
                      //     },
                      //     {
                      //       action: 'open',
                      //       title: 'Open',
                      //       // icon: 'https://aliconnect.nl/favicon.ico',
                      //     },
                      //     // {
                      //     //   action: 'gramophone-action',
                      //     //   title: 'gramophone',
                      //     //   icon: '/images/demos/action-3-128x128.png'
                      //     // },
                      //     // {
                      //     //   action: 'atom-action',
                      //     //   title: 'Atom',
                      //     //   icon: '/images/demos/action-4-128x128.png'
                      //     // }
                      //   ]
                      // });
                    }
                  }
                }
              }
              if (accept) {
                Aim().prompt('accept').accept_scope(accept.scopes, origin);
              }
            }
            switch (state) {
              case 'disconnect': {
                //console.debug('disconnect', Aim().aliconnector_id, data.origin);
                // return;
                if (Aim().aliconnector_id === data.origin) {
                  Aim().status('aliconnector', 'offline');
                  Aim().aliconnector_id = null;
                }
              }
            }
            if (data.id_token) {
              const id = JSON.parse(atob(data.id_token.split('.')[1]));
              if (getId(id.sub) !== getId(aimClient.sub)) {
                return Aim().logout();
              }
            }
            if (data.origin === Aim().aliconnector_id) {
              if (data.param) {
                if (data.param.filedownload) {
                  //console.debug('filedownload', data.param.filedownload);
                }
                if (data.param.fileupload) {
                  //console.debug('fileupload', data.param.fileupload);
                }
              }
            }
            if (attr) {
              attr(...data.attr);
              const {systemId,name,state} = attr;
              const system = systems[systemId];
              if (system) {
                const systemAttr = system.data[name];
                // //console.debug(attr);
                const oldValue = systemAttr.value;
                if (systemAttr.state != state) {
                  setItemTypeValue(systemAttr.item, state, -1);
                  setItemTypeValue(systemAttr.item, systemAttr.state, 1);
                }
                Object.assign(systemAttr, attr);
                if (systemAttr.attributeType) {
                  setItemTypeValue(system, systemAttr.attributeType, - Number(oldValue));
                  setItemTypeValue(system, systemAttr.attributeType, Number(systemAttr.value));
                }
                attributeRowUpdate(systemAttr);
              }
            }
            if (path.match('/aliconnector')) {
              if (target.connectorClient) {
                return Array.from(clients)
                .filter(client => client.connector && client.connector.nonce === target.connectorClient.nonce)
                .forEach(client => client.send(data));
              }
              if (target.connector) {
                return Array.from(clients)
                .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
                .forEach(client => client.send(data));
              }
              console.debug(path);
            }
            aimServer.emit('message', data);
          } catch (err) {
            console.error(err);
          }
        });
      };
      async function processRequest (req, res) {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const responseText = Buffer.concat(buffers).toString();
        const {code,body} = res;
        const {headers} = req;
        const method = req.method.toLowerCase();
        const url = new URL(req.url, 'http://localhost');
        let {pathname,href,searchParams} = url;
        function end(statusCode, body, header) {
          res.writeHead(res.statusCode = statusCode, header);
          res.end(body);
        }
        if (pathname.match(/secret/)) {
          return end(401, `401 No authorize Aim{pathname}`, { 'Content-Type': 'text/html' } );
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
        res.setHeader('Access-Control-Request-Method', '*');
        if (Aim.paths && Aim.paths[pathname] && Aim.paths[pathname][method]) {
          const {operation,opertaionId} = Aim.paths[pathname][method];
          if (operation) {
            return operation(end);
          } else if (Aim[operationId]) {
            (async function () {
              const res = await Aim[operationId]();
              // const body = JSON.stringify(res);
              // console.debug(res);
              // return end(200, 'AOK', {});
              return end(code,body,headers);
            })()
            return;
          }
        }
        // const config = {
        //   paths:{
        //     '/api/v1.0/process/exit': {
        //       get: {
        //         operationId: 'fasdfasdf',
        //         // operation(){
        //         //
        //         // }
        //       }
        //     }
        //   }
        // }
        // const config = YAML.parse(fs.readFileSync('./webroot/api/v1.0/aliconnect.yaml'));
        if (pathname.match(/client\((.*?)\)\/config/)) {
          const config = require(Aim.publicConfigJson);
          // config.items = Array.from(Item.items.values()).map(item => item.data);
          return end(200, JSON.stringify(config), { 'Content-Type': 'application/json' })
        }
        switch(pathname) {
          // case '/config': {
          //   switch(method) {
          //     case 'get': {
          //       http_response(200, 1);
          //     }
          //   }
          // }
          case '/items': {
            const value = Array.from(Item.items.values()).map(item => item.data);
            return end(200, JSON.stringify({value}), { 'Content-Type': 'application/json' })
          }

          case '/login': {
            return end(200, `<!DOCTYPE html><html><head>
              <script src="https://aliconnect.nl/sdk@0.0.10/src/js/Aim.js"></script>
              <script src="https://aliconnect.nl/sdk@0.0.10/src/js/web.js"></script>
              <title>Signin</title>
              </head><body><script>
              const client = Aim.Client.init({
                serviceRoot: 'https://aliconnect.nl/v1',
                scope: 'admin',
              });
              client.login();
              </script></body></html>
              `
            );
          }
          // case '/config/load': {
          //   const {authorization} = headers;
          //   const accessToken = authorization.split(' ').pop();
          //
          //   return end(200);
          // }
          case '/config': {
            return end(200, `
              <!DOCTYPE html>
              <html>
              <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <script src="https://aliconnect.nl/sdk@0.0.10/src/js/Aim.js"></script>
              <script src="https://aliconnect.nl/sdk@0.0.10/src/js/web.js"></script>
              <title>Config</title>
              </head>
              <body><script src="config.yaml"></script></body>
              </html>
              `
            );
          }
          case '/v1/config/save': {
            switch(method) {
              case 'post': {
                const data = JSON.parse(responseText);
                console.debug(data.items.filter(client => client.http));
                data.items.filter(client => client.http).forEach(client => {
                  client.info = {
                    client_id: client.id,
                  }
                  fs.writeFileSync(`./config/client/${client.id}.json`, JSON.stringify(client, null, 2));
                });
                // data.clients.forEach(client => {
                //   fs.writeFileSync(`./config/client/${client.client_id}.json`, JSON.stringify(client, null, 2));
                // })
                // console.debug('CONFIG SAVE', data);
                return end(200);
              }
            }
          }
          case '/api/v1.0/process/exit': {
            switch(method) {
              case 'get': {
                return process.exit(1);
              }
            }
          }
          case '/api/v1.0/oas': {
            switch(method) {
              case 'get': {
                const contents = fs.readFileSync('./webroot/api/v1.0/aliconnect.yaml', 'utf8');
                const config = YAML.parse(contents);
                // console.debug(YAML.parse(contents));
                return end(200, YAML.stringify(config), { 'Content-Type': 'text/yaml' });
              }
            }
          }
          case '/api/v1.0/test': {
            switch(method) {
              case 'get': {
                return Aim.query('select top 50000 id from aim1.item.dt;select top 50000 id from aim1.item.dt;')
                .then(recordsets => end(200, JSON.stringify(recordsets), { 'Content-Type': 'application/json' }));
              }
            }
            return end(200);
          }
          case '/api/v1.0/test/headers': {
            switch(method) {
              case 'get': {
                const {sid} = headers;
                const access = getAccess(headers);
                const message = JSON.stringify({pathname});
                Array.from(clients).filter(client => client.access && client.access.client_id === access.client_id && client.sid !== sid).forEach(client => client.send(message));
                return end(200, JSON.stringify(access), { 'Content-Type': 'application/json' })
              }
            }
            return end(200);
          }
          case '/config.js': {
            return end(200, 'config='+JSON.stringify(config), { 'Content-Type': 'application/json' });
          }
          case '/sql.json': {
            const sql = `SELECT TOP 1000 * FROM attr WHERE Aim{searchParams.get('filter')}`;
            debug(sql);
            return new mssql.Request().query(sql, (err, res) => {
              if (err) console.error(err);
              end(200, JSON.stringify(res.recordsets), { 'Content-Type': 'application/json' });
            })
          }
        }
        const extensionHeaders = {
          json: {'Content-Type': 'application/json','OData-Version': '4.0'},
          js: {'Content-Type': 'text/javascript','Service-Worker-Allowed': '/'},
          md: {'Content-Type': 'text/md','Service-Worker-Allowed': '/'},
          css: {'Content-Type': 'text/css','Service-Worker-Allowed': '/'},
          html: {'Content-Type': 'text/html','Service-Worker-Allowed': '/'},
        };
        // pathname = pathname.replace(/\/blob\/main(.*?)\.md/, '$1');
        // pathname = pathname.replace(/^\/(.*?)\/.*?\.(.*?)\//, '/@$1/$2/');
        // console.debug(pathname, paths);
        // for (var fname of paths.map(path => path+pathname)) {
        //   if (fs.existsSync(fname) && fs.statSync(fname).isFile()) {
        //
        //   }
        // }
        var filenames = [
          process.cwd() + '/node_modules' + pathname,
          process.mainModule.path + '/node_modules' + pathname,
        ];
        var filename = filenames.find(filename => fs.existsSync(filename) && fs.statSync(filename).isFile());
        if (filename) {
          return end(200, fs.readFileSync(filename));
        }
        var fname = paths.map(path => path+pathname).find(fname => fs.existsSync(fname) && fs.statSync(fname).isFile())||paths.map(path => path+pathname+'index.html').find(fs.existsSync);
        if (!fname && paths.map(path => path+pathname+'.md').find(fs.existsSync)) {
          return fs.readFile(module.path+'/../../public/md.html', (err, data) => {
            data = String(data)
            .replace(/\@\d+\.\d+\.\d+/g, '')
            .replace(/=".*aliconnect.sdk/g, '="/@aliconnect/sdk')
            .replace(/="\/\/.*?\.github\.io\/(.*?)\./g, '="/@aim1/')
            end(200, data, headers.html);
          });
          // fname = paths.map(path => '/@aliconnect/sdk/public/md.html').find(fs.existsSync);
        }
        if (!fname) {
          fname = process.mainModule.path + '/public/404.html';
        }
        if (fname) {
          return fs.readFile(fname, (err, data) => {
            if (err) {
              return end(404, `404 Not Found 1 ${req.url}`, { 'Content-Type': 'text/html' });
            }
            var ext = fname.split('.').pop();
            if (fname.match(/\.html/)) {
              data = String(data)
              // .replace(/\@\d+\.\d+\.\d+/g, '')
              // .replace(/=".*?aliconnect.*?sdk.*?src/g, '="/@aliconnect/sdk/src')
              .replace(/="\/\/.*?\.github\.io\/(.*?)\./g, '="/@aim1/')
            }
            end(200, data, extensionHeaders[ext]);
          })
        }
        return end(404, `404 Not Found 1 ${fname}`, { 'Content-Type': 'text/html' });
        res.end();
      };
      Object.defineProperty(aimServer, 'clients', {
        get() {
          return Array.from(webSocketServer.clients);
        }
      })

      Aim.on('message', async event => {
        var {data,target,sid,remoteAddress} = event;
        var {message_type,content,to,headers,sub,aud} = data;
        // if (content) console.debug(content);
        if (headers) {
          var {authorization,apiKey} = headers||{};
          var token = authorization ? authorization.split(' ').pop() : apiKey;
          if (token) {
            var access = await getToken(token) || {};
            var {sub,aud,error,azp} = access;
            if (error) console.error(error);
            else {
              Object.assign(target,{aud,sub,azp});
              if (aimServer.query) {
                try {
                  aimServer.query(
                    `DECLARE @now AS DATETIME = GETDATE()
                    DECLARE @period AS INT = DATEPART(YEAR,@now)*100+DATEPART(MONTH,@now)
                    INSERT auth.dbo.client_request(period,requestDateTime,client_id,messageType,data,access) VALUES(@period,@now,${azp ? `'${azp}'` : 'NULL'},'${message_type||''}','${String(content||'').replace(/'/g,"''")}','${JSON.stringify(access).replace(/'/g,"''")}')
                    `
                  );
                } catch (err) {
                  console.error(err);
                }
              }
            }
          }
        }
        console.debug(sid, remoteAddress, message_type);
        if (message_type) {
          switch(message_type) {
            case 'CONNECTION_OPEN': {
              return target.send(JSON.stringify({message_type,content:{sid}}));
            }
            case 'CONNECTION_SIGNIN': {
              const {authorization,apiKey} = headers||{};
              const token = authorization ? authorization.split(' ').pop() : apiKey;
              const {aud,sub} = await getToken(token);
              // console.debug(555, getToken(token));
              Object.assign(target,{aud,sub});
              return target.send(JSON.stringify({message_type}));
            }
            case 'OPTIONS': {
              target.options = content;
              break;
            }
            case '/item/modified': {
              console.debug(itemsModified);
              if (body && body.requests) {
                Aim.saveRequests(body.requests);
              }
              if (Aim.ws) {
                Aim.ws.send(event.data);
              }
              break;
            }
            case '/user/state/set': {
              console.debug('userstate', data);
              // console.debug(Item.items, Item.items.filter(item => item.ID == data.sub));
              Array.from(Item.items.values()).filter(item => item.ID == data.sub)
              .forEach(item => item.elements.forEach(element => element.hasAttribute('userstate') ? element.setAttribute('userstate', data.userstate) : null))

              const states = [
                'unknown',
                'offline',
                'blocked',
                'busy_inactive',
                'inactive',
                'appear_away',
                'urgentonly',
                'donotdisturb',
                'busy',
                'available',
              ];
              const userstate = states.indexOf(data.userstate);
              // var clients = Array.from(webSocketServer.clients).filter(ws => ws.access && ws.access.aud === wsc.access.aud);
              var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
              const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
              wsc.userstate = userstate;
              // var sub = wsc.access.sub;
              const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
              if (currentState !== newState) {
                //console.debug('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
                data.userstate = states[newState];
                const msg = JSON.stringify(data);
                clients.forEach(ws => ws.send(msg));
              }
            }
            case '/aliconnector/client/init': {
              target.connectorClient = body;
              break;
              // return Array.from(Aim.webSocketServer.clients)
              // .filter(client => client.connector && client.connector.nonce === body.nonce)
              // .forEach(client => client.send(data));
            }
            case '/aliconnector/connector/init': {
              target.connector = body || target.connector;
              break;
              // return Array.from(Aim.webSocketServer.clients)
              // .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
              // .forEach(client => client.send(data));
            }
            case '/aliconnector/request': {
              console.debug(body);
              return;
            }
            // case 'TOKEN': {
            //   const access = await getToken(content);
            //   console.debug('TOKEN',access);
            //   return;
            // };
            // case '/chat/cam/avail': {
            //   Object.assign(webSocket, body);
            //   const {camId,wallId} = body;
            //   Array.from(clients)
            //   .filter(client => client.readyState && !client.camId && client.wallId === wallId)
            //   .forEach(client => client.send(e.data));
            //   return;
            // }
            // case '/chat/wall/avail': {
            //   Object.assign(webSocket, body);
            //   const {camId,wallId} = body;
            //   Array.from(clients)
            //   .filter(client => client.readyState && client.camId && client.wallId === wallId)
            //   .forEach(client => client.send(e.data));
            //   return;
            // }
            // case '/init': {
            //   console.debug(headers,body);
            //   break;
            // }
            // case '/aliconnector/connector/close': {
            //   return Array.from(Aim.webSocketServer.clients)
            //   .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
            //   .forEach(client => client.send(data));
            // }
            default: {
              // Als de auth van sender gericht is aan deze server dan bericht uitvoeren
              // Controleer of deze server een authenticatie heeft
              if (module.exports.getAccessToken) {
                var token = await module.exports.getAccessToken();
                var access = await Aim.getToken(token) || {};
                // Vergelijk server authenticatie met sender authenticatie
                if ([access.sub, access.aud].includes(aud) || [access.sub, access.aud].includes(sub)) {
                  // Voer bericht uit
                  Aim.onmessage(event);
                }
              }
            }
          }
          var {clients} = aimServer;
          // aimServer.emit('message', {data,target});
          // data.sid = target.sid;
          Object.assign(data,{from:target.from||target.sid,options:target.options});
          // delete data.headers;
          var dataString = JSON.stringify(data);
          var {options,aud,sub} = target;
          var toClients = clients.filter(client => client !== target && client.readyState && client.sid);
          toClients = to
          ? toClients.filter(client => [client.sub, client.aud, client.from, client.sid].includes(to))
          : toClients.filter(client => [client.sub, client.aud].includes(aud) || [client.sub, client.aud].includes(sub));
          toClients.forEach(client => client.send(dataString));
        }
      });
      Aim.on('patch', ({id,name,value}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'PATCH',content:{id,name,value}}))));
      Aim.on('delete', ({id}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'DELETE',content:{id}}))));
      Aim.on('post', ({id,schemaName}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'POST',content:{id,schemaName}}))));
      // Aim.on('change', attr => {
      //   const data = JSON.stringify({attr});
      //   Array.from(clients)
      //   .filter(client => client.readyState === client.OPEN)
      //   .forEach(client => client.send(data));
      // });
      console.debug(`http server online`, port);
    }
    return aimServer;
  },
}

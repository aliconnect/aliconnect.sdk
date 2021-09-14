  function NodeApplication(config) {
    console.log('NodeApplication', config);
    return this;




    // console.debug('NODE SRC');
    // try {
    //   const ws = require.resolve("ws");
    // } catch(e) {
    //   console.error("WS is not found");
    // }
    // try {
    //   const jsmodbus = require.resolve("jsmodbus");
    // } catch(e) {
    //   console.error("jsmodbus is not found");
    // }
    //
    // return;
    //
    // // process.exit();
    //
    // console.log(1, this.WebSocket);

    setTitle = function (title) {
      console.log(process.title = [...arguments].filter(Boolean).join(' '));
    };
    fs = require('fs');
    atob = require('atob');
    crypto = require('crypto');






    Object.assign (console, {
      color : {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        steelblue: "\x1b[36m",
        white: "\x1b[37m",
        debug: "\x1b[33m",
        error: "\x1b[31m",
      },
      bgColor : {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        steelblue: "\x1b[46m",
        white: "\x1b[47m",
        debug: "\x1b[40m",
        error: "\x1b[47m",
      },
      code : {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",
      },
    });
    ['debug'].forEach(name => {
      console[name] = function () {
        // console.log('DEBUG', Aim.config.debug);
        // if (Aim.config && !Aim.config.debug) return;
        var args = [...arguments];//, sCode = '', color = '', bgColor = '';
        // console.log('DEBUG', Aim.config.debug, args);
        //if (args[0] && colors[args[0]]) sCode += colors[color = args.shift()];
        //if (args[0] && bgColors[args[0]]) sCode += bgColors[bgColor = args.shift()];
        args = args.filter(val => val != null);
        // args = args.map(val => val instanceof Object ? Aim.stringify(val).substr(0,1000): val);
        var initiator = 'unknown place';
        try { throw new Error(); }
        catch (event) {
          if (typeof event.stack === 'string') {
            let isFirst = true;
            for (var line of event.stack.split('\n')) {
              const matches = line.match(/^\s+at\s+(.*)/);
              if (matches) {
                if (!isFirst) { // first line - current function
                  // second line - caller (what we are looking for)
                  initiator = matches[1];
                  break;
                }
                isFirst = false;
              }
            }
          }
        }
        initiator = initiator.split('\\').pop().split('/').pop().split(':').slice(0, 2).join(':').replace('.js', '').padEnd(12, ' ');
        process.stdout.write(console.bgColor[name] + console.color[name]);
        console.log.apply(console, [initiator, ...args]);
        process.stdout.write(console.code.reset);
      };
    });

    console.msg = function (msg) {
      var args = [...arguments];
      var args = [].concat(args.shift().padEnd(16) + '\x1b[36m', ...args, '\x1b[0m');
      console.log.apply(this, [...args]);
    }
    hasKey = function (obj, keys) {
      var o = obj;
      keys.slice(0, -1).forEach(function (key) {
        o = (o[key] || {});
      });
      var key = keys[keys.length - 1];
      return key in o;
    };
    isNumber = function (x) {
      if (typeof x === 'number') return true;
      if (/^0x[0-9a-f]+Aim/i.test(x)) return true;
      return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(event[-+]?\d+)?Aim/.test(x);
    };
    bitTo = function (typename, s) {
      var s = s.match(/.{1,16}/g).reverse().join('');
      var type = types[typename], arr = s.replace(/ /g, '').split(''), sign = type.signed ? (Number(arr.shift()) ? -1 : 1) : 1;
      if (!type.exponent) return parseInt(arr.join(''), 2) * sign;
      var mantissa = 0, exponent = parseInt(exp = arr.splice(0, type.exponent).join(''), 2) - (Math.pow(2, type.exponent - 1) - 1);
      arr.unshift(1);
      arr.forEach(function (val, i) { if (Number(val)) mantissa += Math.pow(2, -i); });
      return sign * mantissa * Math.pow(2, exponent);
    };
    strToOid = function (oid) {
      oid = oid.split(".");
      oid.forEach(function (nr, i) { oid[i] = Number(nr); });
      return oid;
    };
    writeCommand = function (cmd, path) {
      var buffer = new Buffer(cmd + "\n");
      //// console.log('MKA', cmd , path);
      var fd = fs.open(path, "w", undefined, function (err, fd) {
        if (err)
          console.debug("Error opening file: " + err);
        else {
          fs.write(fd, buffer, 0, buffer.length, -1, function (error, written, buffer) {
            //return;
            if (error)
              console.error("Error occured writing to " + path + ": " + error);
            else
              fs.close(fd, function (err) { });
          });
        }
      });
    }

    for (var topparent = module; topparent.parent; topparent = topparent.parent);
    approot = topparent.filename.replace(/\\/g,'/').split('/');
    approot.pop();
    approot = approot.join('/');
    projectroot = process.cwd();


    // console.log(approot, projectroot,__dirname, search_dirnames, module.paths, process.mainModule.filename
    // console.log(
    //   module.paths.map(fname => fname.replace(/node_modulesAim/,'public'))
    //   .concat(module.paths.map(fname => fname.replace(/node_modulesAim/,'webroot')))
    //   .concat(process.mainModule.paths.map(fname => fname.replace(/node_modulesAim/,'public')))
    //   .concat(process.mainModule.paths.map(fname => fname.replace(/node_modulesAim/,'webroot')))
    //   .filter(fname => fs.existsSync(fname)),
    //   // process.mainModule.paths
    // );

    // const search_dirnames = this.search_dirnames = [
    //   __dirname,
    //   projectroot,
    //   approot + '/webroot',
    //   approot + '/public',
    //   // approot,
    //   // __dirname + '/..',
    //   // __dirname + '/../..',
    //   // __dirname + '/../../..',
    //   // __dirname + '/../../../..',
    //   // __dirname + '/../../../../..',
    //   projectroot + '/webroot',
    //   projectroot + '/public',
    //   // projectroot,
    //   // projectroot + '/..',
    //   // projectroot + '/../..',
    //   // projectroot + '/../../..',
    //   // approot,
    //   // approot + '/..',
    //   // approot + '/../..',
    //   // approot + '/../../..',
    //   approot + '/node_modules/@aliconnect',
    // ]
    // .map(
    //   path => path
    //   .replace(/\\/g,'/')
    //   // .replace(/\/(public|webroot).*/g,''))
    //   // .map(path => [
    //   //   path + '/webroot',
    //   //   path + '/public',
    //   //   // path + '/node_modules',
    //   // ])
    // )
    // .filter(fname => fs.existsSync(fname))
    // .unique();

    // console.log(search_dirnames, module.paths);


    const virtual_maps = new Map();
    virtual_maps.set ('sdk', __dirname.replace(/\\public\\.*/,''));
    // console.log(virtual_maps);

    this.addVirtualMap = (name, path) => {
      virtual_maps.set(name, path);
      console.log(virtual_maps);
    };

    function getFileExists(basename) {
      return search_dirnames
      .map(path => path + basename)
      // .map(path => { console.log(path); return path; }) // DEBUG:
      .find(fname => !console.log(fname) && fs.existsSync(fname) && (fileExists = fs.statSync(fname).isFile()))
    };
    function requireExists(basename) {
      var filename = getFileExists(basename);
      return filename ? require(filename) : {};
    };
    function parseCookies(request) {
      var list = {},
      rc = request.headers.cookie;

      rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
      });

      return list;
    };
    function createMachine(stateMachineDefinition) {
      Object.assign(this,stateMachineDefinition);
      // this.stateMachineDefinition = stateMachineDefinition;
      this.transition = (destinationState) => {
        // console.debug('switch state from',this.value,'to',destinationState)
        this.destinationState = destinationState;
        const currentStateDefinition = this[this.value];
        const destinationTransition = currentStateDefinition[destinationState];
        if (destinationTransition) {
          if (typeof destinationTransition === 'string') eval(destinationTransition);
          else destinationTransition.call(this);
        }
        // const destinationState = event//destinationTransition.target
        const destinationStateDefinition = this[destinationState];
        if (currentStateDefinition.onExit) {
          if (typeof currentStateDefinition.onExit === 'string') eval(currentStateDefinition.onExit);
          else currentStateDefinition.onExit.call(this);
        }
        if (destinationStateDefinition.onEnter) {
          if (typeof destinationStateDefinition.onEnter === 'string') eval(destinationStateDefinition.onEnter);
          else destinationStateDefinition.onEnter.call(this);
        }
        this.value = destinationState
        // // console.debug('switch state DONE',this.value)
        return this.value;
      }
      this.value =  stateMachineDefinition.initialState
      const currentStateDefinition = this[this.value];
      if (currentStateDefinition) {
        if (typeof currentStateDefinition.onEnter === 'string') eval(currentStateDefinition.onEnter);
        else currentStateDefinition.onEnter.call(this);
      }
    };
    function isFile(fname) {
      return fs.existsSync(fname) && fs.statSync(fname).isFile();
    }
    function getData(fname) {
      return isFile(fname) ? require(fname) : {}
    }

    aimconfig = {};
    [
      { info:package = getData(approot + '/package.json')},
      getData(approot + '/config.json'),
      getData(projectroot + '/config.json'),
      getData(projectroot + '/secret.json'),
      config,
      minimist(process.argv.slice(2)),
    ].forEach(config => Aim.extend(aimconfig, config));


    // Aim().extend(aimconfig);

    // config = Aim().config;

    // [
    //   { info:package = getData(approot + '/package.json')},
    //   getData(approot + '/config.json'),
    //   getData(projectroot + '/config.json'),
    //   getData(projectroot + '/secret.json'),
    //   minimist(process.argv.slice(2)),
    // ].forEach(data => Aim().extend(data))

    // console.debug(Aim());process.exit();
    // console.log(projectroot, approot, require(projectroot + '/config.json'));

    const networkInterfaces = require('os').networkInterfaces();
    const mac_addresses = {};
    const ip_addresses = [];
    const isIp = s => s.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
    const isMac = s => s.match(/[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]:[\w][\w]/);
    Object.values(networkInterfaces).forEach(int => {
      int.forEach(conn => {
        if (conn.mac && isMac(conn.mac) && conn.mac !== '00:00:00:00:00:00' && isIp(conn.address)) {
          ip_addresses.push(conn.address);
          mac_addresses[conn.mac] = conn.address;
        }
      });
    });

    // console.log(approot, projectroot);


    if (config.http && config.http.port) {


      function forward (response, responseText, wsc) {
        Array.from(wsServer.clients).filter(ws => ws !== wsc).forEach(ws => {
          ws.access.sid = ws.sid;
          // if (wsChild.readyState !== 1 || wsc === wsChild || !wsChild.access || wsChild.sid === response.forward) return;
          if (ws.readyState !== 1 || wsc === ws || !ws.access ) return;
          if (response.to) {
            for (let [name, value] of Object.entries(response.to)) {
              if (ws.access[name] && ws.access[name] == value) {
                ws.send(responseText);
                return;
              }
            }
          } else {
            if (
              ws.access.sub == wsc.access.aud ||
              ws.access.aud == wsc.access.sub ||
              String(ws.access.aud).split(',').includes(String(wsc.access.aud))
            ) {
              return ws.send(responseText);
            }
          }
        });
      }


      function httpServerRequest (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Request-Method', '*');
        // const pathname = new URL(req.url, 'https://aliconnect.nl').pathname.replace(/npm/, 'node_modules');


        const cookies = parseCookies(req);
        body = '';
        req.on('data', chunk => body += chunk.toString());


        var fname = new URL(req.url, 'https://aliconnect.nl').pathname
        .replace(
          /\/dist\//,'/'
        );

        virtual_maps.forEach((value, key) => {
          fname = fname.replace(new RegExp(`^\/${key}\/`), `${value}/`);
        });

        fname = fname.replace(
          /^\//,
          process.cwd() + '/public/'
        );

        // console.log(1, req.url, fname);

        function end(statusCode, header, body) {
          res.writeHead(res.statusCode = statusCode, header);
          res.end(body);
        }

        if (fname = [
          '',
          '.html',
          'index.html',
          'index.htm',
          'README.md'
        ]
        .map(name => fname + name)
        .find(fname => fs.existsSync(fname) && fs.statSync(fname).isFile())) {
          // console.log(fname);
          return fs.readFile(fname, (err, data) => {
            if (err) {
              return end(404, { 'Content-Type': 'text/html' }, `404 Not Found 1 ${req.url}`);
            }
            var ext = fname.split('.').pop()
            // if (ext == 'md') {
            // 	data = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><link rel="stylesheet" href="/css/theme/aliconnect.css" /><link rel="stylesheet" href="/css/document.css" /><div class="doc-content">' + converter.makeHtml(String(data)) + '</div>';
            // 	ext = 'html';
            // }
            if (config.access_token && config.id_token ) {
              end(200, {
                'Set-Cookie': 'access_token=' + config.access_token + '; id_token=' + config.id_token,
                'Content-Type': ext == 'json' ? 'application/json' : 'text/' + ext
              });
            }
            const headers = {
              json: {
                'Content-Type': 'application/json',
                'OData-Version': '4.0',
              },
              js: {
                'Content-Type': 'text/javascript',
                'Service-Worker-Allowed': '/',
              },
              css: {
                'Content-Type': 'text/css',
                'Service-Worker-Allowed': '/',
              },
              html: {
                'Content-Type': 'text/html',
                'Service-Worker-Allowed': '/',
              },
            };
            if (ext === 'html') {
              // console.log(data.toString());
              // data = data.toString().replace(/github.io/gs, '');
              data = data.toString()
              // .replace(/"\/\/.*?\//gs, '"/')
              // .replace(/".*?(npm\/.*?)@\d.*?\//g, '"Aim1/')
              .replace(/"\/\/(npm.aliconnect.nl\/sdk@\d+\.\d+\.\d+|aliconnect.github.io\/sdk\/dist)/g, '"/sdk')
            }
            end(200, headers[ext], data);
          });
        } else {
          end(404, { 'Content-Type': 'text/html' }, `404 Not Found 2 ${req.url}`);
        }
        return;

        if (!filename) {
          if (req.url === ('/data.json')) {
            const data = { config: {Aim: {headers: config.headers }}};
            console.log(data);
            [
              { info:package = getData(approot + '/package.json')},
              getData(approot + '/config.json'),
              getData(approot + '/webroot/config.json'),
              getData(projectroot + '/config.json'),
              // require(data_filename),
            ].forEach(options => Aim(data).extend(options))
            // if (data.value) {
            // 	data.value.forEach(item => Object.assign(item, Aim.find(item.ID).values));
            // }
            // console.log(data.config);

            const content = JSON.stringifyReplacer({
              info: data.info,
              components: data.components,
              value: data.value,
            });
            // console.log(config);
            return req.on('end', () => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.write(content);
              return res.end();
            })
          }

          res.setHeader('OData-Version', '4.0');
          if (root !== 'api') {
            res.statusCode = 404;
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found: " + req.url);
          }
          return req.on('end', () => {
            req.search = req.url.split('?')[1];
            req.search = !req.search ? {} : Object.assign.apply(Object, req.search.split('&').map(val => {
              val = val.split('='); return {
                [val.shift()]: val.shift()
              };
            }));



            // if (req.search.code) return Aim.getTokenFromAuthCode(req.search.code, res);
            try {
              req.url = req.url.split('?').shift().replace('/api', '');
              if (req.url === '/js/config') {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                fs.readFile(config_filename, function read(err, data) {
                  if (err) {
                    throw err;
                  }
                  res.write(`Aim=${data};`);
                  return res.end();
                });
                return;
              } else {
                // return // console.debug('DEBUG', req.url);
                var result = Aim.request({ path: req.url, method: req.method, headers: req.headers, body: body }, res);
                if (!result) {
                  res.statusCode = 202; // no content
                } else {
                  res.writeHead(result ? 200 : 202, { 'Content-Type': 'application/json' });
                  res.write(JSON.stringify(result));
                }
              }
            } catch (err) {
              // console.debug('ERROR', err);
              //res.statusCode = err;
            }
            return res.end();
          });
        }
      }
      try {
        if (config.http.cert && fs.existsSync(process.cwd() + config.http.key)) {
          const options = {
            key: fs.readFileSync(process.cwd() + config.http.key),
            cert: fs.readFileSync(process.cwd() + config.http.cert),
            ca: config.http.ca ? fs.readFileSync(process.cwd() + config.http.ca) : null,
          };
          var httpServer = require("https").createServer(options, httpServerRequest);
        } else {
          var httpServer = require("http").createServer(httpServerRequest);
        }
        httpServer.listen(config.http.port);
        console.log('HTTP loaded', config.http.port);
      } catch(e) {
        console.error("HTTP is not found");
        process.exit();
      }
      try {
        const ws = require("ws");
        Aim.server = new ws.Server({ server: httpServer })
        .on('connection', (wsc, req) => {
          wsc.remoteAddress = req.connection.remoteAddress.split(':').pop();
          wsc.sid = Crypto.btoaToJson(req.headers['sec-websocket-key']);
          wsc.access = {sid: wsc.sid};
          console.msg('CONNECTION', wsc.sid, wsc.remoteAddress);
          wsc.on('close', connection => {
            if (wsc.access) {
              const message = JSON.stringify({from_id: wsc.sid, state: 'disconnect'});
              wsServer.clients
              .filter(ws => ws !== wsc && ws.access && (ws.access.sub === wsc.access.sub || ws.access.aud === wsc.access.aud || ws.access.nonce === wsc.access.nonce))
              .forEach(ws => ws.send(message));
            }
            console.msg('DISCONNECT', wsc.sid, wsc.remoteAddress, wsc.access.sub);
            // console.debug(userConnected);

            // wsServer.clients.forEach(wsChild => {
            // 	console.msg('DISCONNECT CHILDS', wsChild.sid);
            // });
            // wsServer.clients.splice(wsServer.clients.indexOf(wsc), 1);
          });
          wsc.onmessage = event => {
            // if (!event.data) return;
            // let data = event.data;
            // console.log(event.data, JSON.parse(data));
            // let data;
            try {
              // console.debug('ONMESSAGE', String(event.data));
              data = wsc.response = JSON.parse(event.data);
            } catch (err) {
              console.error('json_error', event.data.substr(0,1000));
            }
            if (!data) {
              console.error('no data');
              return;
            } else if (typeof data !== 'object') {
              console.error('data is not object', data);
              return;
            }
            console.log(wsc.sid);
            if ('userstate' in data) {
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
              var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud === wsc.access.aud);
              var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
              const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
              wsc.userstate = userstate;
              // var sub = wsc.access.sub;
              const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
              if (currentState !== newState) {
                console.log('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
                data.userstate = states[newState];
                event.data = JSON.stringify(data);
                clients.forEach(ws => ws.send(event.data));
              }


              // if (subclients.every(ws => ws.userstate < userstate)) {
              // 	console.log('newstate', userstate, data.userstate);
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
              // 	clients.forEach(ws => ws.send(event.data));
              // }


              // if (!subclients.some(ws => ws.userstate > userstate)) {
              // 	console.log('newstate', userstate, data.userstate);
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
              // 	clients.forEach(ws => ws.send(event.data));
              // }
              // if (!subclients.some(ws => ws.userstate < userstate)) {
              // 	console.log('newstate some');
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud && ws.userstate);
              // 	clients.forEach(ws => ws.send(event.data));
              // }

              // var a = subclients.map(ws => ws.userstate);
              // console.debug(data.userstate);
              // console.log(subclients.filter(ws => ws.userstate === data.userstate).map(ws => ws.userstate));
              // console.log(data.userstate, a, a.every(userstate => userstate == data.userstate));
              // console.log(['ja','ja','ja','ja'].every(ws => ws === 'ja'));

              // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              // wsc.userstate = data.userstate;
              // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }


              // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              // wsc.userstate = data.userstate;
              // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              return;

              // console.debug(wsServer.clients.map(ws => ws.access));

              // console.debug('userstate',data,clients,sub);
            }


            if (data.itemsModified) {
              // console.log('response.itemsModified FROM CLIENT');
              if (data.body && data.body.requests) {
                Aim.saveRequests(data.body.requests);
              }
              if (Aim.ws) {
                Aim.ws.send(event.data);
              }
            }

            if (data.forward && Aim.WebsocketClient && Aim.WebsocketClient.conn) {
              // console.debug('FORWARD TO SERVER', response.forward, Aim.WebsocketClient.socket_id);
              Aim.WebsocketClient.conn.send(event.data);
              // Aim.server.forward(response, responseText, Aim.WebsocketClient.conn);
            }


            // CHAT ROOM
            if (data.message_type) {
              var { message_type, content, to } = data;
              if (message_type === 'OPTIONS') {
                wsc.options = content;
                // return;
              }
              data.from = wsc.sid;
              data.options = wsc.options;
              let message = JSON.stringify(data);
              if (to) {
                var clients = wsServer.clients
                .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid === to);
              } else {
                var clients = wsServer.clients
                .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid);
              }
              clients.forEach(ws => {
                console.msg('SEND', message_type, ws.sid);
                ws.send(message);
              });
              return;
            }

            // console.debug('server ws client');
            // Aim.onmessage.call(wsc, event);

            if (this.response) {
              try {
                data = this.response = JSON.parse(this.responseText);
              } catch (err) {
                console.error('json_error', String(this.responseText).substr(0,1000));
              }
            }

            if (wsc.response.headers) {
              wsc.headers = wsc.response.headers;
              // console.debug('wsc.headers', wsc.headers);
              // this.hostname = this.response.hostname;
              let apiKey = Object.keys(wsc.headers).find(key => ['api_key','api-key','x-api-key'].includes(key.toLowerCase()));
              let accessToken;
              if (apiKey) {
                accessToken = wsc.headers[apiKey];
              } else {
                let authorizationKey = Object.keys(wsc.headers).find(key => ['authorization'].includes(key.toLowerCase()));
                if (authorizationKey) {
                  accessToken = wsc.headers[authorizationKey].split(' ')[1];
                }
              }
              if (accessToken) {
                let accessTokenArray = accessToken.split('.');
                try {
                  var data = wsc.response = JSON.parse(event.data);
                } catch (err) {
                  throw 'json_error';
                }
                try {
                  let payload = wsc.access = JSON.parse(atob(accessTokenArray[1]));
                  let domainName = payload.iss.split('.').shift();
                  Aim().url('https://' + payload.iss + '/api/').query({
                    request_type:'check_access_token',
                    headers: {
                      Authorization: 'Bearer ' + accessToken,
                    },
                  }).get().then(event => {
                    console.msg('SIGNIN', wsc.sid );
                    if (payload.nonce) {
                      const message = JSON.stringify({signin: wsc.sid, access:wsc.access });
                      wsServer.clients
                      .filter(ws => ws !== wsc && ws.access.nonce === payload.nonce)
                      .forEach(ws => ws.send(message));
                    }
                    wsc.send(JSON.stringify({ socket_id: wsc.sid, payload: payload }));
                    return;
                  });
                } catch (err) {
                  console.error(err, accessTokenArray)
                }
                return;
              }
            }
            if (wsc.response.hostname) {
              // console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname, wsc.response);
              console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname);
              wsc.access = wsc.response;
              wsc.access.socket_id = wsc.sid;
              return wsc.send(JSON.stringify(wsc.access));
            }



            // if (!this.access) return;
            // console.debug('wsc.access && wsServer.clients');
            if (wsc.access && wsServer.clients) {
              data.from_id = wsc.sid;
              data.nonce = wsc.access.nonce;
              responseText = JSON.stringify(data);
              var sendto = [];
              // console.debug('server onmessage clients', this.response.path, this.response.form_id, 'aud', wsc.access.aud, 'sub', wsc.access.sub);
              // console.msg('clients', response.to, this.responseText);
              Aim.server.forward(data, responseText, wsc);
            }

          };
        });
        Aim.server.forward = function (response, responseText, wsc) {
          // console.debug('FORWARD TO', response.forward);
          // return;
          // const clients = wsServer.clients.filter(ws => ws !== wsc);
          wsServer.clients.forEach(ws => {
            ws.access.sid = ws.sid;
            // if (wsChild.readyState !== 1 || wsc === wsChild || !wsChild.access || wsChild.sid === response.forward) return;
            if (ws.readyState !== 1 || wsc === ws || !ws.access ) return;
            if (response.to) {
              for (let [name, value] of Object.entries(response.to)) {
                if (ws.access[name] && ws.access[name] == value) {
                  ws.send(responseText);
                  return;
                }
              }
            } else {
              if (
                ws.access.sub == wsc.access.aud ||
                ws.access.aud == wsc.access.sub ||
                String(ws.access.aud).split(',').includes(String(wsc.access.aud))
              ) {
                return ws.send(responseText);
              }
            }
          });
        }
        console.log('WS loaded');
      } catch(e) {
        console.error("WS is not found");
        process.exit();
      }
      return;


      if (config.http.cert && fs.existsSync(process.cwd() + config.http.key)) {
        HttpServer = require('https').createServer({
          key: fs.readFileSync(process.cwd() + config.http.key),
          cert: fs.readFileSync(process.cwd() + config.http.cert),
          ca: config.http.ca ? fs.readFileSync(process.cwd() + config.http.ca) : null,
        }, httpServerRequest);
      } else {
        HttpServer = require('http').createServer(httpServerRequest);
      }
      HttpServer.listen(config.http.port);
      Aim.server = new WebSocket
      .Server({ server: HttpServer })
      .on('connection', (wsc, req) => {
        wsc.remoteAddress = req.connection.remoteAddress.split(':').pop();
        wsc.sid = Crypto.btoaToJson(req.headers['sec-websocket-key']);
        wsc.access = {sid: wsc.sid};
        console.msg('CONNECTION', wsc.sid, wsc.remoteAddress);
        wsc.on('close', connection => {
          if (wsc.access) {
            const message = JSON.stringify({from_id: wsc.sid, state: 'disconnect'});
            wsServer.clients
            .filter(ws => ws !== wsc && ws.access && (ws.access.sub === wsc.access.sub || ws.access.aud === wsc.access.aud || ws.access.nonce === wsc.access.nonce))
            .forEach(ws => ws.send(message));
          }
          console.msg('DISCONNECT', wsc.sid, wsc.remoteAddress, wsc.access.sub);
          // console.debug(userConnected);

          // wsServer.clients.forEach(wsChild => {
          // 	console.msg('DISCONNECT CHILDS', wsChild.sid);
          // });
          // wsServer.clients.splice(wsServer.clients.indexOf(wsc), 1);
        });
        wsc.onmessage = event => {
          // if (!event.data) return;
          // let data = event.data;
          // console.log(event.data, JSON.parse(data));
          // let data;
          try {
            // console.debug('ONMESSAGE', String(event.data));
            data = wsc.response = JSON.parse(event.data);
          } catch (err) {
            console.error('json_error', event.data.substr(0,1000));
          }
          if (!data) {
            console.error('no data');
            return;
          } else if (typeof data !== 'object') {
            console.error('data is not object', data);
            return;
          }
          console.log(wsc.sid);
          if ('userstate' in data) {
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
            var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud === wsc.access.aud);
            var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
            const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
            wsc.userstate = userstate;
            // var sub = wsc.access.sub;
            const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
            if (currentState !== newState) {
              console.log('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
              data.userstate = states[newState];
              event.data = JSON.stringify(data);
              clients.forEach(ws => ws.send(event.data));
            }


            // if (subclients.every(ws => ws.userstate < userstate)) {
            // 	console.log('newstate', userstate, data.userstate);
            // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
            // 	clients.forEach(ws => ws.send(event.data));
            // }


            // if (!subclients.some(ws => ws.userstate > userstate)) {
            // 	console.log('newstate', userstate, data.userstate);
            // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
            // 	clients.forEach(ws => ws.send(event.data));
            // }
            // if (!subclients.some(ws => ws.userstate < userstate)) {
            // 	console.log('newstate some');
            // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud && ws.userstate);
            // 	clients.forEach(ws => ws.send(event.data));
            // }

            // var a = subclients.map(ws => ws.userstate);
            // console.debug(data.userstate);
            // console.log(subclients.filter(ws => ws.userstate === data.userstate).map(ws => ws.userstate));
            // console.log(data.userstate, a, a.every(userstate => userstate == data.userstate));
            // console.log(['ja','ja','ja','ja'].every(ws => ws === 'ja'));

            // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
            // 	clients.forEach(ws => ws.send(event.data));
            // 	console.debug('send', data.userstate);
            // }
            // wsc.userstate = data.userstate;
            // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
            // 	clients.forEach(ws => ws.send(event.data));
            // 	console.debug('send', data.userstate);
            // }


            // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
            // 	clients.forEach(ws => ws.send(event.data));
            // 	console.debug('send', data.userstate);
            // }
            // wsc.userstate = data.userstate;
            // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
            // 	clients.forEach(ws => ws.send(event.data));
            // 	console.debug('send', data.userstate);
            // }
            return;

            // console.debug(wsServer.clients.map(ws => ws.access));

            // console.debug('userstate',data,clients,sub);
          }


          if (data.itemsModified) {
            // console.log('response.itemsModified FROM CLIENT');
            if (data.body && data.body.requests) {
              Aim.saveRequests(data.body.requests);
            }
            if (Aim.ws) {
              Aim.ws.send(event.data);
            }
          }

          if (data.forward && Aim.WebsocketClient && Aim.WebsocketClient.conn) {
            // console.debug('FORWARD TO SERVER', response.forward, Aim.WebsocketClient.socket_id);
            Aim.WebsocketClient.conn.send(event.data);
            // Aim.server.forward(response, responseText, Aim.WebsocketClient.conn);
          }


          // CHAT ROOM
          if (data.message_type) {
            var { message_type, content, to } = data;
            if (message_type === 'OPTIONS') {
              wsc.options = content;
              // return;
            }
            data.from = wsc.sid;
            data.options = wsc.options;
            let message = JSON.stringify(data);
            if (to) {
              var clients = wsServer.clients
              .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid === to);
            } else {
              var clients = wsServer.clients
              .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid);
            }
            clients.forEach(ws => {
              console.msg('SEND', message_type, ws.sid);
              ws.send(message);
            });
            return;
          }

          // console.debug('server ws client');
          // Aim.onmessage.call(wsc, event);

          if (this.response) {
            try {
              data = this.response = JSON.parse(this.responseText);
            } catch (err) {
              console.error('json_error', String(this.responseText).substr(0,1000));
            }
          }

          if (wsc.response.headers) {
            wsc.headers = wsc.response.headers;
            // console.debug('wsc.headers', wsc.headers);
            // this.hostname = this.response.hostname;
            let apiKey = Object.keys(wsc.headers).find(key => ['api_key','api-key','x-api-key'].includes(key.toLowerCase()));
            let accessToken;
            if (apiKey) {
              accessToken = wsc.headers[apiKey];
            } else {
              let authorizationKey = Object.keys(wsc.headers).find(key => ['authorization'].includes(key.toLowerCase()));
              if (authorizationKey) {
                accessToken = wsc.headers[authorizationKey].split(' ')[1];
              }
            }
            if (accessToken) {
              let accessTokenArray = accessToken.split('.');
              try {
                var data = wsc.response = JSON.parse(event.data);
              } catch (err) {
                throw 'json_error';
              }
              try {
                let payload = wsc.access = JSON.parse(atob(accessTokenArray[1]));
                let domainName = payload.iss.split('.').shift();
                Aim().url('https://' + payload.iss + '/api/').query({
                  request_type:'check_access_token',
                  headers: {
                    Authorization: 'Bearer ' + accessToken,
                  },
                }).get().then(event => {
                  console.msg('SIGNIN', wsc.sid );
                  if (payload.nonce) {
                    const message = JSON.stringify({signin: wsc.sid, access:wsc.access });
                    wsServer.clients
                    .filter(ws => ws !== wsc && ws.access.nonce === payload.nonce)
                    .forEach(ws => ws.send(message));
                  }
                  wsc.send(JSON.stringify({ socket_id: wsc.sid, payload: payload }));
                  return;
                });
              } catch (err) {
                console.error(err, accessTokenArray)
              }
              return;
            }
          }
          if (wsc.response.hostname) {
            // console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname, wsc.response);
            console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname);
            wsc.access = wsc.response;
            wsc.access.socket_id = wsc.sid;
            return wsc.send(JSON.stringify(wsc.access));
          }



          // if (!this.access) return;
          // console.debug('wsc.access && wsServer.clients');
          if (wsc.access && wsServer.clients) {
            data.from_id = wsc.sid;
            data.nonce = wsc.access.nonce;
            responseText = JSON.stringify(data);
            var sendto = [];
            // console.debug('server onmessage clients', this.response.path, this.response.form_id, 'aud', wsc.access.aud, 'sub', wsc.access.sub);
            // console.msg('clients', response.to, this.responseText);
            wsServer.clients
            .filter(ws => ws !== wsc)

            Aim.server.forward(data, responseText, wsc);
          }

        };
      });
    }


    console.log(aimconfig);
    return console.debug(config);

    try {
      const ws = require.resolve("ws");
    } catch(e) {
      console.error("WS is not found");
    }


    WebSocket = module.parent.require('ws');
    // btoa = require('btoa');

    return;


    // return module.exports = Aim;

    Aim.saveRequests = function (param) {
      // console.debug('SAFE ITEMS TO SQL', param);
      param.forEach(row => {
        for (let [attributeName, attribute] of Object.entries(row.body)) {
          if (Aim.has(row.ID)) {
            const item = Aim.get(row.ID);
            item.data[attributeName] = Object.assign(item.data[attributeName] || {}, attribute);
          }
          var param = [ `itemID=${row.ID}`, `name='${attributeName}'` ];
          for (let [key, value] of Object.entries(attribute)) {
            param.push (key + '=' + (value === null || value === '' ? 'NULL' : `'${value}'` ) );
          }
          // sqlArray.push('EXEC item.setAttribute @' + param.join(',@'));
          const sql = 'EXEC item.attr @' + param.join(',@');
          Aim.log(sql);
          executeStatement(sql);
        }
      });
    }
    Aim().on('load', async event => {

      // console.log('LOAD', Aim().authProvider());

      // await Aim().login();
      // Aim().client({
      //   servers: [
      //     {
      //       url: 'https://rws-tms.aliconnect.nl/api',
      //     },
      //   ]
      // });

      // const sub = Aim().authProvider().sub;
      // process.exit();
      // console.debug(Aim().authProvider());
      // return;
      // data_filename = projectroot + `/data_${sub}.json`;

      // dataJsFilename = projectroot + `/webroot/data.js`;
      // if (0 && isFile(dataJsFilename)) {
      //   Aim.log('REQUIRE', dataJsFilename);
      //   // require(projectroot + `/webroot/data1.js`);
      //   require(dataJsFilename);
      // } else {
      //   console.log('LOAD1', sub);
      //   Aim.log('GET', dataJsFilename)
      //   await Aim()
      //   .api('/')
      //   .query('request_type', 'build_node_data')
      //   // .patch({mac: mac_addresses})
      //   .get()
      //   .then(event => {
      //     // return console.debug(event.target.responseText.substr(0,1000));
      //     if (event.body) {
      //       // Aim().extend(event.body)
      //       fs.writeFile(dataJsFilename, `Aim().body=${event.target.responseText}`, err => {
      //         if (err) throw err;
      //         console.msg('SAVED', dataJsFilename);
      //       });
      //
      //       data = JSON.parse(event.target.responseText);
      //       data = {
      //         info: data.info,
      //         components: data.components,
      //         value: data.value,
      //       }
      //
      //
      //       // fs.writeFile(data_filename, event.target.responseText, err => {
      //       //   if (err) throw err;
      //       //   console.msg('SAVED', data_filename);
      //       // });
      //       // if (!isFile(dataJsFilename)) {
      //       //   fs.writeFile(projectroot + `/webroot/data.js`, `Aim().extend(${JSON.stringify(data,null,2)})`, err => {
      //       //     if (err) throw err;
      //       //     console.msg('SAVED', dataJsFilename);
      //       //   });
      //       // }
      //     }
      //   });
      // }
    })
    .on('connect', event => {
      console.log('CONNECT');
      // Aim.WebsocketClient.login();
      Aim().emit('init');
    })
    .on('ready', event => {
      console.log('READY', config)
      if (config.http) {
        if (config.http.cert && fs.existsSync(process.cwd() + config.http.key)) {
          HttpServer = require('https').createServer({
            key: fs.readFileSync(process.cwd() + config.http.key),
            cert: fs.readFileSync(process.cwd() + config.http.cert),
            ca: config.http.ca ? fs.readFileSync(process.cwd() + config.http.ca) : null,
          }, httpServerRequest);
        } else {
          HttpServer = require('http').createServer(httpServerRequest);
        }
        HttpServer.listen(config.http.port);
        Aim.server = new WebSocket
        .Server({ server: HttpServer })
        .on('connection', (wsc, req) => {
          wsc.remoteAddress = req.connection.remoteAddress.split(':').pop();
          wsc.sid = Crypto.btoaToJson(req.headers['sec-websocket-key']);
          wsc.access = {sid: wsc.sid};
          console.msg('CONNECTION', wsc.sid, wsc.remoteAddress);
          wsc.on('close', connection => {
            if (wsc.access) {
              const message = JSON.stringify({from_id: wsc.sid, state: 'disconnect'});
              wsServer.clients
              .filter(ws => ws !== wsc && ws.access && (ws.access.sub === wsc.access.sub || ws.access.aud === wsc.access.aud || ws.access.nonce === wsc.access.nonce))
              .forEach(ws => ws.send(message));
            }
            console.msg('DISCONNECT', wsc.sid, wsc.remoteAddress, wsc.access.sub);
            // console.debug(userConnected);

            // wsServer.clients.forEach(wsChild => {
            // 	console.msg('DISCONNECT CHILDS', wsChild.sid);
            // });
            // wsServer.clients.splice(wsServer.clients.indexOf(wsc), 1);
          });
          wsc.onmessage = event => {
            // if (!event.data) return;
            // let data = event.data;
            // console.log(event.data, JSON.parse(data));
            // let data;
            try {
              // console.debug('ONMESSAGE', String(event.data));
              data = wsc.response = JSON.parse(event.data);
            } catch (err) {
              console.error('json_error', event.data.substr(0,1000));
            }
            if (!data) {
              console.error('no data');
              return;
            } else if (typeof data !== 'object') {
              console.error('data is not object', data);
              return;
            }
            console.log(wsc.sid);
            if ('userstate' in data) {
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
              var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud === wsc.access.aud);
              var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
              const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
              wsc.userstate = userstate;
              // var sub = wsc.access.sub;
              const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
              if (currentState !== newState) {
                console.log('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
                data.userstate = states[newState];
                event.data = JSON.stringify(data);
                clients.forEach(ws => ws.send(event.data));
              }


              // if (subclients.every(ws => ws.userstate < userstate)) {
              // 	console.log('newstate', userstate, data.userstate);
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
              // 	clients.forEach(ws => ws.send(event.data));
              // }


              // if (!subclients.some(ws => ws.userstate > userstate)) {
              // 	console.log('newstate', userstate, data.userstate);
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud);
              // 	clients.forEach(ws => ws.send(event.data));
              // }
              // if (!subclients.some(ws => ws.userstate < userstate)) {
              // 	console.log('newstate some');
              // 	var clients = wsServer.clients.filter(ws => ws.access && ws.access.aud && ws.access.aud === wsc.access.aud && ws.userstate);
              // 	clients.forEach(ws => ws.send(event.data));
              // }

              // var a = subclients.map(ws => ws.userstate);
              // console.debug(data.userstate);
              // console.log(subclients.filter(ws => ws.userstate === data.userstate).map(ws => ws.userstate));
              // console.log(data.userstate, a, a.every(userstate => userstate == data.userstate));
              // console.log(['ja','ja','ja','ja'].every(ws => ws === 'ja'));

              // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              // wsc.userstate = data.userstate;
              // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }


              // if (data.userstate === 'available' && !subclients.some(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              // wsc.userstate = data.userstate;
              // if (data.userstate === 'inactive' && subclients.every(ws => ws.userstate === data.userstate)) {
              // 	clients.forEach(ws => ws.send(event.data));
              // 	console.debug('send', data.userstate);
              // }
              return;

              // console.debug(wsServer.clients.map(ws => ws.access));

              // console.debug('userstate',data,clients,sub);
            }


            if (data.itemsModified) {
              // console.log('response.itemsModified FROM CLIENT');
              if (data.body && data.body.requests) {
                Aim.saveRequests(data.body.requests);
              }
              if (Aim.ws) {
                Aim.ws.send(event.data);
              }
            }

            if (data.forward && Aim.WebsocketClient && Aim.WebsocketClient.conn) {
              // console.debug('FORWARD TO SERVER', response.forward, Aim.WebsocketClient.socket_id);
              Aim.WebsocketClient.conn.send(event.data);
              // Aim.server.forward(response, responseText, Aim.WebsocketClient.conn);
            }


            // CHAT ROOM
            if (data.message_type) {
              var { message_type, content, to } = data;
              if (message_type === 'OPTIONS') {
                wsc.options = content;
                // return;
              }
              data.from = wsc.sid;
              data.options = wsc.options;
              let message = JSON.stringify(data);
              if (to) {
                var clients = wsServer.clients
                .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid === to);
              } else {
                var clients = wsServer.clients
                .filter(ws => ws.options && ws.options.wall === wsc.options.wall && wsc !== ws && ws.readyState && ws.sid);
              }
              clients.forEach(ws => {
                console.msg('SEND', message_type, ws.sid);
                ws.send(message);
              });
              return;
            }

            // console.debug('server ws client');
            // Aim.onmessage.call(wsc, event);

            if (this.response) {
              try {
                data = this.response = JSON.parse(this.responseText);
              } catch (err) {
                console.error('json_error', String(this.responseText).substr(0,1000));
              }
            }

            if (wsc.response.headers) {
              wsc.headers = wsc.response.headers;
              // console.debug('wsc.headers', wsc.headers);
              // this.hostname = this.response.hostname;
              let apiKey = Object.keys(wsc.headers).find(key => ['api_key','api-key','x-api-key'].includes(key.toLowerCase()));
              let accessToken;
              if (apiKey) {
                accessToken = wsc.headers[apiKey];
              } else {
                let authorizationKey = Object.keys(wsc.headers).find(key => ['authorization'].includes(key.toLowerCase()));
                if (authorizationKey) {
                  accessToken = wsc.headers[authorizationKey].split(' ')[1];
                }
              }
              if (accessToken) {
                let accessTokenArray = accessToken.split('.');
                try {
                  var data = wsc.response = JSON.parse(event.data);
                } catch (err) {
                  throw 'json_error';
                }
                try {
                  let payload = wsc.access = JSON.parse(atob(accessTokenArray[1]));
                  let domainName = payload.iss.split('.').shift();
                  Aim().url('https://' + payload.iss + '/api/').query({
                    request_type:'check_access_token',
                    headers: {
                      Authorization: 'Bearer ' + accessToken,
                    },
                  }).get().then(event => {
                    console.msg('SIGNIN', wsc.sid );
                    if (payload.nonce) {
                      const message = JSON.stringify({signin: wsc.sid, access:wsc.access });
                      wsServer.clients
                      .filter(ws => ws !== wsc && ws.access.nonce === payload.nonce)
                      .forEach(ws => ws.send(message));
                    }
                    wsc.send(JSON.stringify({ socket_id: wsc.sid, payload: payload }));
                    return;
                  });
                } catch (err) {
                  console.error(err, accessTokenArray)
                }
                return;
              }
            }
            if (wsc.response.hostname) {
              // console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname, wsc.response);
              console.msg('CONNECT', wsc.sid, wsc.remoteAddress, wsc.response.hostname);
              wsc.access = wsc.response;
              wsc.access.socket_id = wsc.sid;
              return wsc.send(JSON.stringify(wsc.access));
            }



            // if (!this.access) return;
            // console.debug('wsc.access && wsServer.clients');
            if (wsc.access && wsServer.clients) {
              data.from_id = wsc.sid;
              data.nonce = wsc.access.nonce;
              responseText = JSON.stringify(data);
              var sendto = [];
              // console.debug('server onmessage clients', this.response.path, this.response.form_id, 'aud', wsc.access.aud, 'sub', wsc.access.sub);
              // console.msg('clients', response.to, this.responseText);
              Aim.server.forward(data, responseText, wsc);
            }

          };
        });
        Aim.server.forward = function (response, responseText, wsc) {
          // console.debug('FORWARD TO', response.forward);
          // return;
          // const clients = wsServer.clients.filter(ws => ws !== wsc);
          wsServer.clients.forEach(ws => {
            ws.access.sid = ws.sid;
            // if (wsChild.readyState !== 1 || wsc === wsChild || !wsChild.access || wsChild.sid === response.forward) return;
            if (ws.readyState !== 1 || wsc === ws || !ws.access ) return;
            if (response.to) {
              for (let [name, value] of Object.entries(response.to)) {
                if (ws.access[name] && ws.access[name] == value) {
                  ws.send(responseText);
                  return;
                }
              }
            } else {
              if (
                ws.access.sub == wsc.access.aud ||
                ws.access.aud == wsc.access.sub ||
                String(ws.access.aud).split(',').includes(String(wsc.access.aud))
              ) {
                return ws.send(responseText);
              }
            }
          });
        }
      }
      /* download source files form server */
      if (Aim.src) {
        for (var i = 0, cfg; cfg = Aim.src[i]; i++) {
          const req = require("https").request({ hostname: 'aliconnect.nl', port: 443, method: 'GET', path: '/' + cfg.source }, function (res) {
            res.on('data', function (d) {
              // console.debug('974 data', String(d));
              fs.writeFile(process.cwd() + '/' + this.dest, String(d), function (err) {
                if (err) throw err;
              }.bind(this));

            }.bind(this));
          }.bind(cfg));
          req.on('error', (error) => { console.error(error) });
          //req.write(par.input);
          req.end();
        }
      }
      if (Aim.require) {
        // Aim.require.forEach(function (fname) {
        // 	Aim.extend(Aim, require(fname));
        // });
        for (var name in Aim.require) {
          const req = require('https').request({ hostname: 'aliconnect.nl', port: 443, method: 'GET', path: '/' + Aim.require[name] }, function (res) {
            res.on('data', function (d) {
              fs.writeFile(process.cwd() + '/' + this.name + '.js', String(d), function (err) {
                if (err) throw err;
                module[this.name] = require(process.cwd() + '/' + this.name + '.js');
              }.bind(this));
            }.bind(this));
          }.bind({ name: name }));
          req.on('error', (error) => { console.error(error) });
          req.end();
        }
      }

      if (this.data) {
        Aim.extend(this.data);
        Aim.emit('config');
        Aim.operations = Aim.operations || {};
        // console.log(Aim.operations);
        // console.log('paths', data.paths);


        if (this.data.value) {
          const ids = data.value.map(item => item.ID);
          executeStatement(`SELECT ItemID AS ID,* FROM attribute.vw WHERE ItemID IN (${ids.join(',')})`, rows => {
            rows.forEach(row => {
              const item = data.value.find(item => item.ID == row.ItemID);
              item[row.AttributeName] = row;
            })
            Aim.evalData(data);
            for (let [schemaName, schema] of Object.entries(data.components.schemas)) {
              // let [schemaName] = item;
              // console.log(1, schemaName);
              if (schema.operations && Aim.ref[schemaName]) {
                Aim.ref[schemaName].forEach(item => {
                  // eval(schemaName + `=item;`);
                  for (let [operationName, operation] of Object.entries(schema.operations)) {
                    if (operation.js) {
                      try {
                        let code = operation.js.replace(/\b([A-Z_]+)\b/g,'"Aim1"');
                        // console.log(operationName,code);
                        // code = `console.log('${'ja'}');`;
                        item[operationName] = new Function(schemaName + `=this;` + code);
                      } catch (err) {
                        console.debug('error js code', schemaName, operationName, code);
                      }
                    }
                  }

                  Aim.operations[schemaName] = id => Aim.find(id);
                    // this.id = 'TEST';
                    // console.log(schemaName, id, item.Aimid, this.title, operations);
                    // return operations;
                    // console.log(schemaName, operationName, id, Verkeersbuis.title, operation.js);
                    // return new Function(operation.js);
                  // }
                });
              }
            }
          });
          {
            // 	Aim.items.forEach(Aim.get);

            // Unselect all unselected items
            // 	Aim.ref.forEach(function (item) {
            // 		if (item.selected == 0) {
            // 			(recursive = function (item) {
            // 				item = items[item.detailID || item.id];
            // 				item.selected = 0;
            // 				(item.values.Value = item.values.Value || {}).value = item.Value = null;
            // 				item.Children.forEach(recursive);
            // 			})(item);
            // 		}
            // 	});

            // attributeChange on all items
            // 	Aim.ref.forEach(Aim.attributeChange);
            // 	control_items(Aim.ref);
            // 	Aim.emit('data');
            // 	return // console.debug('done');

            // 	setState(items[Aim.freeMemID], 'connect');
            // 	setState(items[Aim.freeDiskSpaceID], 'connect');
            // 	setState(items[Aim.timeSyncID], 'connect');

          }
        }
      }
      // if websocket configured, connect to server
      // if (Aim.config.Aim.websocket) {
      // 	new Aim.WebsocketRequest();
      // }

      setTitle(
        // Aim.auth.access && Aim.auth.access.sub && Aim.find(Aim.auth.access.sub) ? Aim.find(Aim.auth.access.sub).title : null,
        Aim().info.name,
        // Aim.auth.access.sub,
        Aim().info.version,
        // ip_addresses.join(', ') + ':' + Aim().config.http.port,
      );
      if (Aim().info.description) {
        console.log(Aim().info.description);
      }
      console.log('READY END')
    })


    // require("./node.js");
    setTimeout(async e => await Aim().emit('load') && await Aim().emit('ready'));
  };
  NodeApplication.prototype = new Application;

(function(){
  const aim = require('./public/js/aim');
  const fs = require('fs');

  const paths = process.mainModule.paths
  .concat(module.parent.paths, module.paths)
  .map(path => path.replace(/node_modules$/,'public'))
  .filter(path => fs.existsSync(path))
  .unique();

  console.log(paths);

  function Server(config) {
    function processRequest (req, res) {
      console.log(req.url);
      function end(statusCode, header, body) {
        res.writeHead(res.statusCode = statusCode, header);
        res.end(body);
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Request-Method', '*');

      var url = new URL(req.url, 'http://localhost');
      // console.log(url.pathname, fname);

      if (url.pathname === '/js/config.js') {
        return end(200, { 'Content-Type': 'application/json' }, 'config='+JSON.stringify(config));
      }
      if (url.pathname === '/sql.json') {
        const sql = `SELECT TOP 1000 * FROM his.attr WHERE ${url.searchParams.get('filter')}`;
        debug(sql);
        return new mssql.Request().query(sql, (err, res) => {
          if (err) console.log(err);
          end(200, { 'Content-Type': 'application/json' }, JSON.stringify(res.recordsets));
        })
      }

      for (var path of paths) {
        for (var fname of [path+url.pathname, path+url.pathname+'index.html']) {
          console.log(fname);
          if (fs.existsSync(fname) && fs.statSync(fname).isFile()) {
            return fs.readFile(fname, (err, data) => {
              if (err) {
                return end(404, { 'Content-Type': 'text/html' }, `404 Not Found 1 ${req.url}`);
              }
              var ext = fname.split('.').pop();
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
              console.log('JA');
              end(200, headers[ext], data);
            })
          }
        }
      }
      return end(404, { 'Content-Type': 'text/html' }, `404 Not Found 1 ${req.url}`);
      // console.log(url.pathname, fname);
      //
      //
      //
      // res.writeHead(200);
      // //res.end(JSON.stringify({ clients: wss, a: a }));
      //
      // res.end("This is the Aliconnect messageserver");
      //
    };
    function connection (ws, req) {
      // aimdb.log('connect');
      //var a = 2;
      ws.on('close', function (connection) {
        console.log('disconnected')
        // aimdb.log('disconnect', this.client.socket.id);
        // if (this.client) send({ from: this.client, state: 'disconnected' }, this);
      }).on('message', data => {
        data = JSON.parse(data);
        if (data.attr) {
          attr(...data.attr);
        }
      });
    };
    const protocol = config.http.ca ? "https" : "http";
    const options = config.http.ca ? {
      key: fs.readFileSync(process.cwd() + config.http.key),
      cert: fs.readFileSync(process.cwd() + config.http.cert),
      ca: config.http.ca ? fs.readFileSync(process.cwd() + config.http.ca) : null,
    } : null;
    console.log(protocol, config.http.port, options);
    const http = require(protocol);
    const httpServer = http.createServer(options, processRequest).listen(config.http.port);
    const ws = require('ws');
    const wsServer = new ws.Server({server: httpServer}).on('connection', connection);
    const clients = this.clients = Array.from(wsServer.clients);
    Object.defineProperties(this.clients, {
      send: { value: function(msg) {
        msg = JSON.stringify(msg);
        clients.filter(wsa => wsa.readyState === wsa.OPEN).forEach(wsa => wsa.send(msg))
      }}
    });
  }
  Object.defineProperties(Server.prototype, {

  });

  function Sql() {}
  Object.defineProperties(Sql.prototype, {
    requests: {value: []},
    // busy: {value: false, writeable: true},
    connect: {value: function(config) {
      return new Promise((succes,fail) => {
        const options = {
          port: config.port || 1433,
          server: config.server,
          options: {
            database: config.database,
            encrypt: true,
            validateBulkLoadParameters: true,
            trustServerCertificate: true,
            cryptoCredentialsDetails: {
              minVersion: 'TLSv1'
            }
          },
          authentication: {
            type: 'default',
            options: {
              userName: config.user,
              password: config.password,
            }
          },
        };
        this.tedious = require('tedious');
        this.conn = new this.tedious.Connection(options);
        this.conn.on('connect', err => err ? fail(err) : succes());
        this.conn.connect();
      })
    }},
    query: {value: function(sql) {
      return new Promise((succes,fail) => {
        if (sql) this.requests.push([sql,succes,fail]);
        else this.busy = false;
        if (!this.busy && this.requests.length) {
          this.busy = true;
          [sql,succes,fail] = this.requests.shift();
          const rows = [];
          const request = new this.tedious.Request(sql, err => err ? fail(err) : succes(rows) || this.query());
          request.on('row', columns => rows.push(Object.fromEntries(columns.map(col => [col.metadata.colName, col.value]))));
          this.conn.execSql(request);
        }
      });
    }},
  });



  Object.defineProperties(aim, {
    Server: { value: Server },
    sql: { value: new Sql },
  });
  module.exports = aim;
})()

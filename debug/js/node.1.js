/**
* gsdkjfhgskjdlfhgskjdfhgslkjdfhgjksdf
* @version 1.0.3
* @author Max van Kampen (max.van.kampen@alicon.nl)
*/
const EventEmitter = require('events');
const osutils = require('os-utils');
const checkDiskSpace = require('check-disk-space')
const util = require('util');
const cmd = require('node-cmd');
const net = require('net')
const Modbus = require('jsmodbus');
const snmp = require('snmp-native');
const fs = require('fs');
const atob = require('atob');
const WebSocketServer = require('ws').Server;
const sql = require('mssql');
const minimist = function (args, opts) {
  if (!opts) opts = {};
  var flags = { bools: {}, strings: {}, unknownFn: null };
  if (typeof opts['unknown'] === 'function') {
    flags.unknownFn = opts['unknown'];
  }
  if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
    flags.allBools = true;
  } else {
    [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
      flags.bools[key] = true;
    });
  }
  var aliases = {};
  Object.keys(opts.alias || {}).forEach(function (key) {
    aliases[key] = [].concat(opts.alias[key]);
    aliases[key].forEach(function (x) {
      aliases[x] = [key].concat(aliases[key].filter(function (y) {
        return x !== y;
      }));
    });
  });
  [].concat(opts.string).filter(Boolean).forEach(function (key) {
    flags.strings[key] = true;
    if (aliases[key]) {
      flags.strings[aliases[key]] = true;
    }
  });
  var defaults = opts['default'] || {};
  var argv = { _: [] };
  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });
  var notFlags = [];
  if (args.indexOf('--') !== -1) {
    notFlags = args.slice(args.indexOf('--') + 1);
    args = args.slice(0, args.indexOf('--'));
  }
  function argDefined(key, arg) {
    return (flags.allBools && /^--[^=]+$/.test(arg)) ||
    flags.strings[key] || flags.bools[key] || aliases[key];
  }
  function setArg(key, val, arg) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return;
    }

    var value = !flags.strings[key] && isNumber(val)
    ? Number(val) : val
    ;
    setKey(argv, key.split('.'), value);

    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split('.'), value);
    });
  }
  function setKey(obj, keys, value) {
    var o = obj;
    keys.slice(0, -1).forEach(function (key) {
      if (o[key] === undefined) o[key] = {};
      o = o[key];
    });
    var key = keys[keys.length - 1];
    if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
      o[key] = value;
    }
    else if (Array.isArray(o[key])) {
      o[key].push(value);
    }
    else {
      o[key] = [o[key], value];
    }
  }
  function aliasIsBoolean(key) {
    return aliases[key].some(function (x) {
      return flags.bools[x];
    });
  }
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (/^--.+=/.test(arg)) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      var key = m[1];
      var value = m[2];
      if (flags.bools[key]) {
        value = value !== 'false';
      }
      setArg(key, value, arg);
    }
    else if (/^--no-.+/.test(arg)) {
      var key = arg.match(/^--no-(.+)/)[1];
      setArg(key, false, arg);
    }
    else if (/^--.+/.test(arg)) {
      var key = arg.match(/^--(.+)/)[1];
      var next = args[i + 1];
      if (next !== undefined && !/^-/.test(next)
      && !flags.bools[key]
      && !flags.allBools
      && (aliases[key] ? !aliasIsBoolean(key) : true)) {
        setArg(key, next, arg);
        i++;
      }
      else if (/^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg);
        i++;
      }
      else {
        setArg(key, flags.strings[key] ? '' : true, arg);
      }
    }
    else if (/^-[^-]+/.test(arg)) {
      var letters = arg.slice(1, -1).split('');

      var broken = false;
      for (var j = 0; j < letters.length; j++) {
        var next = arg.slice(j + 2);

        if (next === '-') {
          setArg(letters[j], next, arg)
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
          setArg(letters[j], next.split('=')[1], arg);
          broken = true;
          break;
        }

        if (/[A-Za-z]/.test(letters[j])
        && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letters[j], next, arg);
          broken = true;
          break;
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg);
          broken = true;
          break;
        }
        else {
          setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
        }
      }

      var key = arg.slice(-1)[0];
      if (!broken && key !== '-') {
        if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1])
        && !flags.bools[key]
        && (aliases[key] ? !aliasIsBoolean(key) : true)) {
          setArg(key, args[i + 1], arg);
          i++;
        }
        else if (args[i + 1] && /true|false/.test(args[i + 1])) {
          setArg(key, args[i + 1] === 'true', arg);
          i++;
        }
        else {
          setArg(key, flags.strings[key] ? '' : true, arg);
        }
      }
    }
    else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(
          flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
        );
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1));
        break;
      }
    }
  }
  Object.keys(defaults).forEach(function (key) {
    if (!hasKey(argv, key.split('.'))) {
      setKey(argv, key.split('.'), defaults[key]);

      (aliases[key] || []).forEach(function (x) {
        setKey(argv, x.split('.'), defaults[key]);
      });
    }
  });
  if (opts['--']) {
    argv['--'] = new Array();
    notFlags.forEach(function (key) {
      argv['--'].push(key);
    });
  }
  else {
    notFlags.forEach(function (key) {
      argv._.push(key);
    });
  }

  return argv;
};
const hasKey = function (obj, keys) {
  var o = obj;
  keys.slice(0, -1).forEach(function (key) {
    o = (o[key] || {});
  });
  var key = keys[keys.length - 1];
  return key in o;
};
const isNumber = function (x) {
  if (typeof x === 'number') return true;
  if (/^0x[0-9a-f]+$/i.test(x)) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
};
const argv = minimist(process.argv.slice(2));
const config = Object.assign(require(require('path').resolve(argv.config ? (argv.config[0] === "/" ? argv.config : process.cwd() + "/" + argv.config) : __dirname + "/../../config.json").replace(/\\/g, "/")), argv);
const http = require(config.ws.protocol);
const send = function (message, wsc) {
  //console.log('TO',message.to);
  wss.clients.forEach(function (wsa) {
    if (wsa.readyState !== wsa.OPEN || !wsa.client || wsc == wsa) return;
    if (!wsc) return wsa.send(JSON.stringify(message));
    //if (!message.from.app) console.log(message.from);
    //if (message.state=='test') console.log(message.from.app, message.state, message.to);
    if (message.to) {
      for (var name in message.to) if (!wsa.client[name] || message.to[name] != (wsa.client[name].id || wsa.client[name])) return
      return wsa.send(JSON.stringify(message));
    }
    for (var name in message.from) if (message.from[name] && message.from[name].id && wsa.client[name] && message.from[name].id == wsa.client[name].id) return wsa.send(JSON.stringify(message));
  });
  //return wsc && wsc.readyState === wsc.OPEN ? wsc.send(JSON.stringify({ ack: 1, to: message.to })) : null;
};
var setItems = [], rows = [], items = [];
const getSqlParams = function (object) {
  var params = [];
  for (var property in object) params.push('@' + property + "='" + String(object[property]).replace(/'/g, "''") + "'");
  return params.join(',');
};
aimdb = {
  querylist: [],
  exec: function () {
    var request = new sql.Request();
    request.query(this.querylist.join(';'), function (err, res) { if (err) console.log(err); });
    this.querylist = [];
  },
  post: function (sql) {
    this.querylist.push(sql);
    clearTimeout(this.querylist.to);
    this.querylist.to = setTimeout(this.exec.bind(this), 0);
  },
  log: function (level) {
    var arg = Array.prototype.slice.call(arguments);
    if (!config.loglevel || Number(config.loglevel) <= Number(level)) return;
    if (Number(level)) arg.shift();
    var method = arg.shift();
    var id = Number(arg[0]) ? arg.shift() : null;
    var path = !id ? "" : function () {
      var item = items[id];
      for (var path = [], master = item; master; master = items[master.masterID]) {
        path.push(master.title);
        if (master.class == 'dms_Location') break;
      }
      return path.reverse().join(".");
    }();
    aimdb.post("INSERT aimhis.om.event(method,value,id,path)VALUES('" + method + "','" + JSON.stringify(arg) + "'," + (id || 'NULL') + ",'" + path + "')");
    console.log(new Date().toISOString().replace("T", " ").replace("Z", ""), path, id, method, String(JSON.stringify(arg)).replace(/":/g, '=').replace(/"|{|}/g, ""));
  }
};
const postAttribute = function (item, name, attribute) {
  if (['id', 'values', 'eventType', 'ofile'].indexOf(name) != -1) return;
  if (typeof attribute != "object") attribute = { value: attribute };
  aimdb.post("EXEC api.setAttribute " + getSqlParams(Object.assign(attribute||{}, { id: item.id, name: name })));
};
const setValue = function (value) {
  value.forEach(function (row) {
    if (!row.id) return;
    var item = items[row.id];
    if (row.values) for (var name in row.values) postAttribute(row, name, (item.values[name] = item.values[name] || {}).value = item[name] = row.values[name].value);
    for (var name in row) if (name != 'values') postAttribute(row, name, item[name] = row[name]);
  });
  attributes.emit('change', value);
};
timers = {};
const attributeChange = function (item) {
  if (!(item = items[item.id])) return;
  if (item.detailID) item = items[item.detailID];
  if (!item || item.selected == 0) return;
  if (item.schema != 'Attribute' && item.schema != 'ControlIO') return;
  var inputvalue = this.Value, newvalue = Number(inputvalue || 0);
  item.Quality = "Valid";
  if (item.Value && item.Min && item.Max && (item.Min > item.Value || item.Max < item.Value)) item.Quality = "NotValid";
  if (item.Quality != "Valid") {
    aimdb.log("AFKEUR EXIT", item.id, { Quality: item.Quality, value: item.Value, inputvalue: inputvalue });
    return;
  }
  //if (item.id == 3563430) console.log('onchange', item.title, item.Value);
  //if (item.id == 3664213) console.log('onchange', item.title, item.Value);
  //console.log('CALC',item.Calc, inputvalue);

  if (inputvalue != undefined) {
    if (this.MaxEngValue != null && this.MinEngValue != null && this.MaxRawValue != null && this.MinRawValue != null) newvalue = Math.round(((Number(this.MaxEngValue) - Number(this.MinEngValue)) / (Number(this.MaxRawValue) - Number(this.MinRawValue)) * (newvalue - Number(this.MinRawValue)) + Number(this.MinEngValue)) * 100) / 100;
    if (item.Low != null && item.High != null && item.High <= item.Low) { newvalue = newvalue >= Number(item.High) && newvalue <= Number(item.Low) ? 1 : ((newvalue <= Number(item.High) - (Number(item.Hysteresis || 0))) || (newvalue >= Number(item.Low) + Number(item.Hysteresis || 0)) ? 0 : Number(item.Value)); }
    else if (item.Low != null) { newvalue = newvalue <= Number(item.Low) ? 1 : (newvalue >= Number(item.Low) + Number(item.Hysteresis || 0) ? 0 : Number(item.Value)); }
    else if (item.High != null) { newvalue = newvalue >= Number(item.High) ? 1 : (newvalue <= Number(item.High) - Number(item.Hysteresis || 0) ? 0 : Number(item.Value)); }
    //console.log(item.Calc);
    if (item.Calc == 'OnlineHours') {
      //console.log('OnlineHours event',item.title, item.Value);
      item.deltaTimeS = 3600;
      (item.OnlineHours = function () {
        clearTimeout(timers[this.id]);

        var master = items[this.masterID], masterOn = Number(master.Value);
        //masterOn = 1; // MKA
        //console.log('OnlineHours', masterOn, this.masterStart);
        if (this.masterStart) setAttribute(this, 'Value', Number(this.Value || 0) + ((new Date().valueOf() - this.masterStart.valueOf()) / 1000 / 3600), true);
        this.masterStart = masterOn ? new Date() : null;
        if (masterOn) timers[this.id] = setTimeout(this.OnlineHours.bind(this), this.deltaTimeS * 1000);
      }).call(item);
    }
    else setAttribute(item, 'Value', newvalue);
  }
  else if (item.children) item.children.forEach(attributeChange.bind(item));
}
const setState = function (item, value) {

  // if (!item) throw new Error('sdfa');
  // console.log(item);

  // MKAN item bestaat niet ???
  if (item && item.State != value) setAttribute(item, 'State', value);
};
const setAttribute = function (item, attributeName, value, nochange) {
  // MKAN item bestaat niet ???
  if (!item || item[attributeName] === value) return;
  //aimdb.log('setAttribute', item.id, { [attributeName]: value, extra: [item[attributeName], typeof item[attributeName], typeof value], });
  aimdb.log('setAttribute', item.id, { [attributeName]: value });
  //item.values = item.values || {};
  item.values[attributeName] = item.values[attributeName] || {};
  item[attributeName] = item.values[attributeName].value = value;
  item.modifiedDT = new Date().toISOString();
  //if ([3562893, 3562891, 3562878, 3562876, 3549983].indexOf(item.id) != -1) { console.log('setAttribute CriticalFailure', item.CriticalFailure, item.values.CriticalFailure); }
  //if ([3562891].indexOf(item.id) != -1) {
  //	console.log('setAttribute CriticalFailure', item.id, item.title, item.CriticalFailure, item.values);
  //}

  setItem({ id: item.id, values: { [attributeName]: { value: value } } });
  //attributes.emit('change', item, attributeName, value);
  //if (attributeName == 'Value' && !nochange) attributeChange.call({ inout: 'in' }, { id: item.id, [attributeName]: value, values: { [attributeName]: { value: value } } });
  // MKAN
  // console.log(attributeName, nochange, item);
  if (attributeName == 'Value' && !nochange && item.children) {
    item.children.forEach(attributeChange.bind(item));
  }

};
const setItem = function (item) {
  clearTimeout(setItems.setItemTimeout);
  if (!item) {
    //setItems.forEach(function (row) { row.values.modifiedDT = { value: new Date().toISOString() }; });
    setValue(setItems);
    //console.log('SEND', JSON.stringify(setItems));
    send({ value: setItems });
    setItems = [];
    return;
  }
  //log(3, 'setItemValues', JSON.stringify(item));
  setItems.push(item);
  setItems.setItemTimeout = setTimeout(setItem, 100);
};
const types = {
  D: { title: "Digital", BitLength: 1 },
  Bool: { title: "Boolean", BitLength: 1 },
  SByte: { title: "Signed Byte", BitLength: 8, signed: 1 },
  UByte: { title: "Unsigned Byte", BitLength: 8 },
  SInt: { title: "Signed Integer", BitLength: 16, signed: 1 },
  UInt: { title: "Unsigned Integer", BitLength: 16 },
  SDInt: { title: "Signed Double Integer", BitLength: 32, signed: 1 },
  UDInt: { title: "Unsigned Double Integer", BitLength: 32 },
  Float: { title: "Float", BitLength: 32, signed: 1, exponent: 8 },
  Double: { title: "Double", BitLength: 64, signed: 1, exponent: 11 },
};
const bitTo = function (typename, s) {
  var s = s.match(/.{1,16}/g).reverse().join('');
  var type = types[typename], arr = s.replace(/ /g, '').split(''), sign = type.signed ? (Number(arr.shift()) ? -1 : 1) : 1;
  if (!type.exponent) return parseInt(arr.join(''), 2) * sign;
  var mantissa = 0, exponent = parseInt(exp = arr.splice(0, type.exponent).join(''), 2) - (Math.pow(2, type.exponent - 1) - 1);
  arr.unshift(1);
  arr.forEach(function (val, i) { if (Number(val)) mantissa += Math.pow(2, -i); });
  return sign * mantissa * Math.pow(2, exponent);
};
const strToOid = function (oid) {
  oid = oid.split(".");
  oid.forEach(function (nr, i) { oid[i] = Number(nr); });
  return oid;
};
const connection = function (ws, req) {
  aimdb.log('connect');
  //var a = 2;
  ws.on('close', function (connection) {
    aimdb.log('disconnect', this.client.socket.id);
    if (this.client) send({ from: this.client, state: 'disconnected' }, this);
  });
  ws.on('message', function incoming(message) {
    var wsc = this;
    if (message[0] == '{') {
      message = JSON.parse(message);
      if (message.access_token) message.login = message.login || JSON.parse(atob(message.access_token.split('.')[1]));
      if (message.login) {
        wsc.client = message.login;
        wsc.client.socket = { id: req.headers['sec-websocket-key'] };
        message.from = wsc.client;
        message.state = 'connected';
        if (wsc.readyState == wsc.OPEN) {
          message.value = rows.map(function (item) { return Object.assign({}, item, { children: null, device: null }); });
          wsc.send(JSON.stringify(message));
          delete message.value;
        }
        delete message.login;
        delete message.access_token;
      }
      if (message.post && message.value) setValue(message.value);
      message.from = wsc.client;
      send(message, wsc);
    }
  });
};
var processRequest = function (req, res) {
  res.writeHead(200);
  //res.end(JSON.stringify({ clients: wss, a: a }));
  res.end("This is the Aliconnect messageserver");
};
wss_start = function () {
  if (config.secure) config.wss.options = { key: fs.readFileSync(config.secure.key), cert: fs.readFileSync(config.secure.cert), ca: fs.readFileSync(config.secure.ca) };
  (wss = config.wss.protocol == "wss" ? new WebSocketServer({ server: require('https').createServer(config.wss.options, processRequest).listen(config.wss.port) }) : new WebSocketServer({ server: require('http').createServer(null, processRequest).listen(config.wss.port) })).on('connection', connection);
  console.log('Websocket server is up and running', config.wss.protocol + "://" + config.wss.hostname + ":" + config.wss.port, config.dbs.server + ":" + config.dbs.port + "/" + config.dbs.database);

  if (config.mqqt) {
    if (config.secure) config.mqqt.secure = { keyPath: config.secure.key, certPath: config.secure.cert };
    const mosca = require('mosca');
    var server = new mosca.Server(config.mqqt);

    server.on('ready', function () {
      console.log('MQTT server is up and running')
    });
    // fired when a message is published
    server.on('published', function (packet, client) {
      //console.log('Published', packet);
      //console.log('Client', client);
    });
    // fired when a client connects
    server.on('clientConnected', function (client) {
      //console.log('Client Connected:', client.id);
    });
    // fired when a client disconnects
    server.on('clientDisconnected', function (client) {
      //console.log('Client Disconnected:', client.id);
    });
  }
}
sql.connect(config.dbs, function (err) {
  if (err) console.log(err);
  if (config.client && config.client.system) {
    console.debug(config.client.system.id);
    new sql.Request().query("EXEC api.getTree " + config.client.system.id, function (err, res) {
      if (err) console.log(err);
      rows = res.recordsets[0];
      for (var i = 0, row; row = rows[i]; i++) items[row.id] = Object.assign(row, { children: [], values: {} });
      for (var i = 0, row; row = res.recordsets[1][i]; i++) items[row.id].values[row.name] = { value: items[row.id][row.name] = isNaN(row.value) ? row.value : Number(row.value) };
      items.forEach(function (item) { if (item.masterID && items[item.masterID]) items[item.masterID].children.push(item); });
      items.forEach(function (item) {
        if (item.selected == 0) {
          (recursive = function (item) {
            item = items[item.detailID || item.id];
            item.selected = 0;
            (item.values.Value = item.values.Value || {}).value = item.Value = null;
            item.children.forEach(recursive);
          })(item);
        }
      });
      items.forEach(attributeChange);
      // console.log('freeMemID', items);
      //items.forEach(function (item) { if (item.schema=='ControlIO') attributeChange(item); });
      wss_start();

      var item = items.filter(Boolean).find(item => item.name==='MEMORY_USED_SPACE');
      if (item) {
        setState(items[config.freeMemID = item.id], 'connect');
        (function freeMem() {
          setAttribute(items[config.freeMemID], 'Value', Math.round(100 - osutils.freememPercentage() * 100));
          setTimeout(freeMem, config.intervalSystemAttributes);
        })();
      }
      var item = items.filter(Boolean).find(item => item.name==='HDD_USED_SPACE');
      if (item) {
        setState(items[config.freeDiskSpaceID = item.id], 'connect');
        (function freeDiskSpace() {
          checkDiskSpace('C:/').then((diskSpace) => { setAttribute(items[config.freeDiskSpaceID], 'Value', Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)); });
          setTimeout(freeDiskSpace, config.intervalSystemAttributes);
        })();
      }
      var item = items.filter(Boolean).find(item => item.name==='TIME_SYNC');
      if (item) {
        setState(items[config.timeSyncID = item.id], 'connect');
        (function timeSync() {
          cmd.get('w32tm /query /status', function (err, data, stderr) {
            var value = Number(data.split(/\n/).shift().split(':').pop().split('(').shift().trim());
            setAttribute(items[config.timeSyncID], 'Value', value);
            //console.log('timesync', value, data);
          });
          setTimeout(timeSync, config.intervalSystemAttributes);
        })();
      }

      var item = items.filter(Boolean).find(item => item.name==='WATCHDOG_ACSM');
      if (item) {
        config.acmsHartbeatID = item.id;
      }
      // 2021 MKAN VERVALLEN IVM VOORGAANDE CODE
      // (resourceInfo = function () {
      // 	setAttribute(items[config.freeMemID], 'Value', Math.round(100 - osutils.freememPercentage() * 100));
      // 	checkDiskSpace('C:/').then((diskSpace) => { setAttribute(items[config.freeDiskSpaceID], 'Value', Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)); });
      // 	//checkDiskSpace('C:/').then((diskSpace) => { setAttribute(items[config.freeDiskSpaceID], 'Value', 92); });
      // 	//TEST:MKA:190913: Uitwerken result van DOS, omzeten naar data object, PAS OP: ook nog doorvoeren in EM, hoe dit dataobject te verwerken.
      // 	//cmd.get('w32tm /query /status', function (err, data, stderr) { setItemValues([{ id: 3563538, values: { Value: { value: data } } }]); });
      // 	//cmd.get('w32tm /query /status', function (err, data, stderr) { setItemValues([{ id: 3563538, values: { Value: { value: JSON.parse('{"' + data.replace(/: [a-zA-Z0-9]/g, '":"').replace(/\n/g, '","') + '"}') } } }]); });
      // 	cmd.get('w32tm /query /status', function (err, data, stderr) {
      // 		var value = Number(data.split(/\n/).shift().split(':').pop().split('(').shift().trim());
      // 		setAttribute(items[config.timeSyncID], 'Value', value);
      // 		//console.log('timesync', value, data);
      // 	});
      // 	setTimeout(resourceInfo, config.intervalSystemAttributes);
      // })();

      var snmpDevices = [], modbusDevices = [], devices = [];
      devices.connect = function () {
        var device = devices.shift();
        if (device) device.connect();
      }
      // console.log(items);
      testID = 0;
      // testID = 3682529;//3682365;//0;//3563448;

      items.forEach(function (item, i) {

        // console.debug(item.selected, item.IPAddress, item.PollInterval);

        if (!item.selected || !item.IPAddress || !item.PollInterval) return;
        if (item.Community) return snmpDevices.push(item);
        /**
        * @author Max van Kampen <max.van.kampen@alicon.nl>
        * @todo Write the documentation.
        * @version Write the documentation.
        * @example Alleen aanmaken modbus device met sepcifiek IP adres voor testen.
        */
        if (testID) {
          if (item.id == testID) modbusDevices.push(item);
        } else {
          modbusDevices.push(item);
        }
        // if (item.IPAddress == '192.168.2.22') modbusDevices.push(item);
        // if (item.IPAddress == '192.168.2.42') modbusDevices.push(item);
        //if (item.IPAddress == '192.168.2.5') modbusDevices.push(item);
      });
      /**
      * @author Max van Kampen <max.van.kampen@alicon.nl>
      * @test Leegmaken van lijsten voor testen.
      */
      //snmpDevices = [];
      //modbusDevices = [];
      // console.log(modbusDevices);
      modbusDevices.forEach(function (item, i) {
        devices.push(device = { item: item });
        var socket = device.socket = new net.Socket();
        device.client = new Modbus.client.TCP(device.socket, i + 1);
        device.client.device = device.socket.device = device;
        // console.log(item.ReadLength);
        Object.assign(device, { ReadAddress: item.children.ReadAddress = item.ReadAddress || 0, ReadLength: item.ReadLength || 0, Registers: {} });
        var register = {};
        (setdevice = function (subdevice) {
          var item = subdevice.item, subdevices = [];
          item.children.sort(function (a, b) { return a.idx > b.idx ? 1 : a.idx < b.idx ? -1 : 0; });
          register.BitStart = 16 * (register.ReadLength || 0);
          item.children.forEach(function (child, i, children) {
            child.SignalType = child.SignalType || 'UInt';
            var ReadAddress = child.ReadAddress || child.ReadAddress || 0;
            register = device.Registers[ReadAddress] = device.Registers[ReadAddress] || { device: device, ReadAddress: ReadAddress, ReadLength: device.ReadLength = device.ReadLength || 0, children: [], BitStart: 0, BitPos: 0 };
            if (child.class == "Device") {
              child.ReadAddress = ReadAddress; subdevices.push({ item: child });
            } else if (child.class == "ControlIO") {
              var control = { id: child.id, title: child.title, SignalType: child.SignalType, Deadband: child.Deadband || 0, Permission: child.Permission, BitPos: register.BitPos = Number(register.BitStart) + Number(child.ReadAddressBit || 0), BitLength: types[child.SignalType].BitLength };
              register.ReadLength = Math.ceil((Number(register.BitPos) + Number(control.BitLength)) / 16);
              register.children.push(control);
            } else {
              // delete child.children;
              // console.log(child.id, child, items[1060]);
              // return;
            }
          });
          subdevices.forEach(setdevice);
        })(device);
        // return;

        /*
        console.log('Device', 'IPAddress', item.IPAddress);
        Object.values(device.Registers).forEach(function (register) {
        console.log('  Register', 'ReadAddress', register.ReadAddress, 'ReadLength', register.ReadLength);
        register.children.forEach(function (control) {
        console.log('    Control', JSON.stringify(control));
      });
    });
    */
    socket.on('connect', function (event) {
      var device = this, item = device.item;
      // console.log(item.id);
      if (item.id == testID) console.log('socket=connect');
      //clearTimeout(device.toRead);
      setState(item, 'connect');
      devices.connect();
      (device.readdata = function () {
        var device = this, item = device.item;
        clearTimeout(device.toRead);
        device.toRead = setTimeout(device.readdata, device.readCount ? config.timeWaitAfterTimeout : item.PollInterval);
        if (device.readCount) return setState(item, 'error_read');
        for (var ReadAddress in device.Registers) {
          device.readCount++;
          register = device.Registers[ReadAddress];
          if (item.id == testID) {
            console.log('readInputRegisters-start', register.ReadAddress, register.ReadLength);
          }
          device.client.readInputRegisters(register.ReadAddress, register.ReadLength).then(function (resp) {
            var register = this, device = register.device, item = device.item;
            if (item.id == testID) {
              console.log('readInputRegisters-then', item.title, device.readCount);
            }
            if (item.State != 'connect') {
              setState(item, 'connect');
            }
            device.readCount--;
            for (var bitArray = [], byteArray = resp.response._body._valuesAsArray, i = byteArray.length - 1 ; i >= 0; i--) {
              bitArray.push(('0000000000000000' + byteArray[i].toString(2)).substr(-16));//value = (value * 65536) + byteArray[i];
            }
            var bitString = bitArray.join('');//value.toString(2);
            // console.log(item.id, testID, 'bitString', bitString);
            register.children.forEach(function (control, i) {
              var item = items[control.id], ReadValue = bitTo(control.SignalType, control.bitString = bitString.substr(bitString.length - control.BitLength - control.BitPos, control.BitLength)), OffsetValue = Math.abs(ReadValue - (item.Value || 0));
              // control.Deadband = 0;
              // MKAN
              if (item.Value === null || item.Value === undefined || OffsetValue > control.Deadband) {
                //console.log('read set',ReadValue);
                setAttribute(item, 'Value', ReadValue);
              }
            });
          }.bind(register)).catch(function (resp) {
            var register = this, device = register.device, item = device.item;
            if (item.id == testID) console.log('readInputRegisters-catch', item.title, device.readCount);
            device.readCount--;
            if (item.State != 'error') setState(item, 'error_read');
          }.bind(register));
        }
      }.bind(device))();
    }.bind(device)).on('disconnect', function (event) {
      var device = this, item = device.item;
      if (item.id == testID) console.log(item.title, 'disconnect');
      setState(item, 'disconnect');
    }.bind(device)).on('error', function (event) {
      var device = this.device, item = device.item;
      if (item.id == testID) console.log(item.title, 'error');
      setState(item, 'error');
      clearTimeout(device.toRead);
      device.toRead = setTimeout(device.connect.bind(device), config.timeWaitAfterTimeout);
      devices.connect();
    });
    device.connect = function () {
      var device = this, item = this.item;
      if (item.id == testID) console.log(item.title, 'device do connect');
      setState(item, 'connecting');
      device.readCount = 0;
      device.socket.connect({ host: item.IPAddress, port: item.Port || 502 });
    }
  });
  devices.connect();
  snmpDevices.forEach(function (item, i) {
    aimdb.log('snmpDevices', item.id);
    var device = { item: item };
    device.session = new snmp.Session({ host: item.IPAddress, community: item.Community });
    device.get = [];
    device.get.oids = [];
    item.children.forEach(function (child) {
      child.device = device;
      device.get.push(child);
      device.get.oids.push(strToOid(child.OID));
    });
    (device.LoadSNMP = function () {
      var device = this, item = device.item;
      device.toRead = setTimeout(device.LoadSNMP, item.PollInterval);
      setTimeout(function () {
        var device = this, item = device.item;
        if (device.reading) {
          if (item.State != 'error_read') setState(item, 'error_read');
          clearTimeout(device.toRead);
          device.toRead = setTimeout(device.LoadSNMP, config.timeWaitAfterTimeout);
        }
      }.bind(device), 1000);
      device.reading = true;
      if (device.get.length) {
        device.get.oids.forEach(function (oid, i) {
          device.session.get({ oid: oid }, function (err, varbinds) {
            var child = this.child, device = this.device, item = device.item;//, setItems = [];
            if (err) {
              if (device.State != 'error_read') setState(item, 'error_read');
            }
            else {
              device.reading = false;
              if (item.State != 'connect') setState(item, 'connect');
              vb = varbinds[0];
              if (child.Value != vb.value) setAttribute(child, 'Value', vb.value);
            }
          }.bind({ child: device.get[i], device: device }));
        });
      }
    }.bind(device))();
  });
});
}
else {
  wss_start();
}
});
class MyEmitter extends EventEmitter { };
attributes = new MyEmitter();
module.exports = {
  config: config,
  items: items,
  setAttribute: setAttribute,
  setState: setState,
  setTest: function (val) {
    test = val;
    console.log(test, val);
  },
  attributes: attributes,
  log: aimdb.log,
  load: function (par) {
    if (par.input) {
      par.input = JSON.stringify(par.input);
      par.options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': par.input.length
      };
    }
    const req = require(par.protocol).request(par.options, (res) => {
      //console.log(`statusCode: ${res.statusCode}`);
      res.on('data', (d) => {
        d = String(d);
        try {
          res.data = d[0] == '{' ? JSON.parse(d) : d;
        }
        catch (err) {
          console.log('error json', d);
        }
        //console.log('d:consolelog',String(d));
        //process.stdout.write('d:'+d)
      });
      res.on('end', par.onload);
    });
    req.on('error', (error) => {
      console.error(error)
    });
    req.write(par.input);
    req.end();
  }
}

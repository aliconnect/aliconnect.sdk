(function(){
  const aim = require('@aliconnect/sdk/src/aim');
  const fs = require('fs');
  const atob = require('atob');
  const events = require('events');
  const attributes = new events;
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
  const items = [];
    const timers = {};
  var setItems = [];
  function debug(s){
    console.log(s);
    fs.appendFile("logger.log", `${new Date().toISOString()}: ${s}\n`, err => console.log);
  }
  function exit(s){
    debug(s);
    process.exit();
  }
  function attrSet(attribute, name, value) {
    if (attribute[name] !== value) {
      attribute[name] = value;
            attributes.emit('change', attribute);
    }
  }
  function attrSetValue(attribute, value, path = []) {
    function has(name) {
      return (name in attribute) && attribute[name] !== null;
    }
        if (!isNaN(value)) {
      value = Number(value || 0);
            if (has('MaxEngValue') && has('MinEngValue') && has('MaxRawValue') && has('MinRawValue')) {
        value = Math.round(((Number(attribute.MaxEngValue) - Number(attribute.MinEngValue)) / (Number(attribute.MaxRawValue) - Number(attribute.MinRawValue)) * (value - Number(attribute.MinRawValue)) + Number(attribute.MinEngValue)) * 100) / 100;
      }
            const low = Number(attribute.Low || 0);
      const high = Number(attribute.High || 0);
      if (has('Low') && has('High') && high <= low) {
        if (value >= high && value <= low) {
          value = 1;
        } else if (value <= high || value >= low) {
          value = 0;
        }
      } else if (has('Low')) {
        if (value <= low) {
          value = 1;
        } else if (value >= low) {
          value = 0;
        }
      } else if (has('High')) {
        if (value >= high) {
          value = 1;
        } else if (value <= high) {
          value = 0;
        }
      }
      if (has('Eq')) {
        value = value == attribute.Eq ? 1 : 0;
      }
      if (has('Ne')) {
        value = value != attribute.Ne ? 1 : 0;
      }
      curValue = Number(attribute.value || 0);
            const hyst = Number(attribute.Hysteresis || 0);
      if (value < curValue - hyst || value > curValue + hyst) {
                        if (attribute.SystemId) {
          const name = path.concat(attribute.name).join('.');
          attribute.modifiedDT = new Date().toISOString();
          attrSet(attribute, 'value', value);
          const values = [
            attribute.id,
            name,
            attribute.value,
            attribute.parent,
            attribute.title,
            attribute.AttributeType,
          ];
          aim.sql.query(`INSERT his.attr(id,name,value,parent,title,AttributeType) VALUES('${values.join("','")}')`);
          attributes.emit('changeValue', attribute);
        }
        (attribute.children||[]).forEach(child => attrSetValue(child, value, path.concat(attribute.name)));
      }
                                                                                                                            }
  }
  function bitTo (typename, s) {
    var s = s.match(/.{1,16}/g).reverse().join('');
    var type = types[typename], arr = s.replace(/ /g, '').split(''), sign = type.signed ? (Number(arr.shift()) ? -1 : 1) : 1;
    if (!type.exponent) return parseInt(arr.join(''), 2) * sign;
    var mantissa = 0, exponent = parseInt(exp = arr.splice(0, type.exponent).join(''), 2) - (Math.pow(2, type.exponent - 1) - 1);
    arr.unshift(1);
    arr.forEach(function (val, i) { if (Number(val)) mantissa += Math.pow(2, -i); });
    return sign * mantissa * Math.pow(2, exponent);
  };
  function getSqlParams (object) {
    var params = [];
    for (var property in object) params.push('@' + property + "='" + String(object[property]).replace(/'/g, "''") + "'");
    return params.join(',');
  };
  function initControlEquipment(items) {
    function itemSetState(item, state){
      attrSet(item, 'state', state);
      (item.children||[]).filter(Boolean).forEach(child => itemSetState(child, state));
    }
    function initAttributes(item) {
      const attributes = [];
      let parent;
      let parentItem;
      (function addChildren(item, path) {
        if (item) {
          attributes.push(item);
          (item.children||[]).forEach(child => addChildren(child, path));
        }
      })(item, []);
      return attributes;
    }
    const modbusDevices = items.filter(item => item.Device === 'MODBUS' && item.IPAddress);
    const snmpDevices = items.filter(item => item.Device === 'SNMP' && item.IPAddress);
            if (modbusDevices) {
      const net = require('net');
      const jsmodbus = require('jsmodbus');
      modbusDevices.forEach((item, i) => {
        let readAddress = item.ReadAddress || 0;
        const devices = item.children;
        let readLength = devices.length;
        const attributes = initAttributes(item);
        console.log('MODBUS', item.IPAddress);
        function setSate(state){
          attributes.forEach(attr => attrSet(attr, 'state', state));
        }
        const socket = new net.Socket();
        const client = new jsmodbus.client.TCP(socket, i + 1);
        function connect() {
          setSate('connecting');
          socket.connect({ host: item.IPAddress, port: item.Port || 502 });
        }
        socket.on('connect', e => {
          setSate('connected');
                    (function readData() {
            client.readInputRegisters(readAddress, readLength).then(resp => {
              var readArray = resp.response._body._valuesAsArray;
                            devices.forEach((device,i) => {
                if (device && device.children) {
                  const readValue = readArray[i];
                  const bitString = ('0000000000000000' + readValue.toString(2)).substr(-16);
                  const bitArray = bitString.split('').reverse();
                  device.children.forEach((child,i) => {
                    if (child && child.type) {
                                            switch(child.type) {
                        case 'UInt': return attrSetValue(child, readValue);
                        case 'Bool': return attrSetValue(child, bitArray[i]);
                      }
                    }
                  })
                }
              });
              setTimeout(readData, item.PollInterval);
            }).catch(err => {
                            attributes.forEach(attr => attrSet(attr, 'state', 'error'));
              setTimeout(connect, 2000);
            })
          })();
        }).on('disconnect', e => {
          setSate('disconnect');
          console.error('disconnect');
        }).on('error', e => {
          console.error('error', item.parent, item.name, item.id );
          setSate('error');
          setTimeout(connect, 5000);
        });
        connect();
              });
    }
    if (snmpDevices) {
      function strToOid (oid) {
        oid = oid.split(".");
        oid.forEach(function (nr, i) { oid[i] = Number(nr); });
        return oid;
      };
      const snmpNative = require('snmp-native');
      snmpDevices.forEach(item => {
        item.PollInterval = 400;
        item.children = Array.from(item.children);
        const session = new snmpNative.Session({ host: item.IPAddress, community: item.Community || 'public' });
        const children = item.children.filter(Boolean);
        const oids = children.map(child => strToOid(child.oid));
        (function read() {
          session.getAll({ oids: oids }, (err, varbinds) => {
            if (err) {
              itemSetState(item, 'error');
              console.error(err);
                            setTimeout(() => {
                itemSetState(item, 'connecting');
                                read();
              }, 5000);
                          } else {
              itemSetState(item, 'connected');
              children.forEach((child,i) => attrSetValue(child, varbinds[i] && varbinds[i].value));
              setTimeout(read, item.PollInterval);
            }
          })
        })();
      });
    }
  }
  const sql = {};
  sql.requests = [];
  /**
   * Tests whether or not the given path exists.
   * @param {string | Buffer | URL} path
   * @param {(exists?: boolean) => any} callback
   * @returns {void}
   */
  sql.connect = function(config) {
    return new Promise((succes,fail) => {
      const options = {
        port: config.port || 1433,
        server: config.server,
        authentication: {
          type: 'default',
          options: {
            userName: config.user,
            password: config.password,
          }
        },
        options: {
          encrypt: true,
          validateBulkLoadParameters: true,
          trustServerCertificate: true,
          cryptoCredentialsDetails: { minVersion: 'TLSv1' },
          database: config.database,
        },
      };
      this.tedious = require('tedious');
      this.conn = new this.tedious.Connection(options);
      this.conn.on('connect', err => err ? fail(err) : succes());
      this.conn.connect();
    })
  };
  sql.query = function(sql) {
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
  };
  function ControlServer(config) {
    console.log('nodeApplication');
    if (config.dbs) {
      aim.sql.connect(config.dbs).then(a => {
        console.log('SQL ONN');
        aim.sql.query(
          `IF OBJECT_ID('his.attr') IS NULL
          BEGIN
          CREATE TABLE [his].[attr](
            [ts] [timestamp] NULL,
            [id] [bigint] NULL,
            [name] [varchar](50) NULL,
            [value] [varchar](max) NULL,
            [modifiedDateTime] [datetime] NULL CONSTRAINT [DF_attr_modifiedDateTime]  DEFAULT (getdate())
          ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
          END`
        );
                                                                        const systemTimeoutMs = 2000;
        systemAttributes = {
          MEMORY_USED_SPACE(item) {
            const osUtils = require('os-utils');
            (function memoryUsedSpace() {
              attrSetValue(item, Math.round(100 - osUtils.freememPercentage() * 100));
              setTimeout(memoryUsedSpace, systemTimeoutMs);
            })();
          },
          HDD_USED_SPACE(item) {
            const checkDiskSpace = require('check-disk-space');
            (function hddUsedSpace() {
              checkDiskSpace('C:/').then(diskSpace => attrSetValue(item, Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)));
              setTimeout(hddUsedSpace, systemTimeoutMs);
            })();
          },
          TIME_SYNC(item) {
            const nodeCmd = require('node-cmd');
            (function timeSync() {
              nodeCmd.get('w32tm /query /status', (err, data, stderr) => {
                if (!err) {
                  attrSet(item, 'state', 'connected');
                  const [s,value] = data.match(/Leap Indicator: (\d)/) || [];
                  return attrSetValue(item, value === '0' ? 0 : 1);
                } else {
                  attrSet(item, 'state', 'disconnected');
                  console.error(err);
                }
                attrSetValue(item, 1);
              });
              setTimeout(timeSync, systemTimeoutMs);
            })();
          },
          WATCHDOG_ACSM(item) {
            let acsmCount = 0;
            (function watchdogAcsm() {
              attrSetValue(item, acsmCount = acsmCount >= 100 ? 1 : acsmCount+1);
              setTimeout(watchdogAcsm, systemTimeoutMs);
            })();
          },
        };
        Array.from(config.items).forEach(function addChildren(item) {
          if (item) {
            if (systemAttributes[item.name]) {
                            systemAttributes[item.name](item);
            }
            if (item.Enumeration) {
              item.enum = item.Enumeration.replace(/, /g,',').split(',');
            }
            items.push(item);
            (item.children||[]).forEach(child => addChildren(child));
          }
        });
        initControlEquipment(items);
        new Server(config);
        attributes.on('change', attr => server.clients.send({attr:attr}));
      }).catch(console.error);
    } else {
      new Server(config);
    }
  }
  function Request(url) {
    this.url = new URL(url, 'https:        this.options = {
      method: 'get',
      host: this.url.hostname,
      path: this.url.pathname + '?' + this.url.searchParams.toString(),
      headers:{},
    };
  }
  Object.defineProperties(Request.prototype, {
    headers:{value(selector, context) {
      if (typeof selector === 'object'){
        Object.assign(this.options.headers, selector)
      } else {
        this.options.headers[selector] = context;
      }
      return this;
    }},
    end:{value(method, data) {
      return new Promise((resolve, fail) => {
        const protocol = this.url.protocol.replace(/:/,'');
        const http = require(protocol);
        if (data) {
          this.headers('Content-Length', data.length);
        }
        const xhr = http.request(this.options, e => {
          let responseText = '';
          e.on('data', data => {
            responseText += data;
          }).on('end', () => {
            e.status = e.statusCode;
            e.statusText = e.statusMessage;
            e.target = xhr;
            e.target.response = e.target.responseText = responseText;
            try {
              if (e.headers['content-type'].includes('application/json')) {
                e.target.response = JSON.parse(responseText);
              }
            } catch(err){
              console.debug('ERROR JSON', err, responseText.substr(0,1000));
            }
            e.body = e.target.response;
            resolve(e);
          });
        }).on('error', e => {
          fail(e);
        });
        if (data){
          xhr.write(data);
        }
        xhr.startTime = new Date();
        xhr.end();
      })
    }},
    get:{value() {
      return this.end(this.options.method = 'get');
    }},
    post:{value(data) {
      return this.end(this.options.method = 'post', this.data = data);
    }},
  });
  module.exports = {
    Server,
    ControlApplication,
    attributes,
    sql,
  };
  })()
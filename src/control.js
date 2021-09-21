(function(){
  const aim = require('./server');

  const fs = require('fs');
  const atob = require('atob');
  const events = require('events');

  function debug(s){
    console.log(s);
    fs.appendFile("logger.log", `${new Date().toISOString()}: ${s}\n`, err => console.log);
  }
  function exit(s){
    debug(s);
    process.exit();

  }

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
  // let itemId = 0;
  const timers = {};
  var setItems = [];

  function attrSet(attribute, name, value) {
    if (attribute[name] != value) {
      attribute[name] = value;
      attributes.emit('change', attribute);
    }
  }
  function attrSetValue(attribute, value, path = []) {
    function has(name) {
      return (name in attribute) && attribute[name] !== null;
    }
    // Valideer waarde
    if (!isNaN(value)) {
      value = Number(value || 0);

      // // Validate value
      // let quality = "Valid";
      // if (has('min') && has('max') && (attribute.min > value || attribute.max < value)) {
      //   console.error('NotValid', id, attributeName, value);
      //   return attrSet(attribute, 'quality', "NotValid");
      // }


      // Omrekenen raw value naar value
      if (has('MaxEngValue') && has('MinEngValue') && has('MaxRawValue') && has('MinRawValue')) {
        value = Math.round(((Number(attribute.MaxEngValue) - Number(attribute.MinEngValue)) / (Number(attribute.MaxRawValue) - Number(attribute.MinRawValue)) * (value - Number(attribute.MinRawValue)) + Number(attribute.MinEngValue)) * 100) / 100;
      }

      // Low High
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
      // Hysteresis
      const hyst = Number(attribute.Hysteresis || 0);
      if (value < curValue - hyst || value > curValue + hyst) {

        // if (attribute.systemId)
        if (attribute.SystemId) {
          const name = path.concat(attribute.name).join('.');
          console.log(attribute.SystemId, attribute.parent, name, value);

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

      // // OnlineHours
      // if (attribute.Calc == 'OnlineHours') {
      //   //console.log('OnlineHours event',item.title, item.Value);
      //   attribute.deltaTimeS = 3600;
      //   (attribute.OnlineHours = function () {
      //     clearTimeout(timers[attribute.id]);
      //     var master = items[this.masterID];
      //     var masterOn = Number(master.Value);
      //     //masterOn = 1; // MKA
      //     //console.log('OnlineHours', masterOn, this.masterStart);
      //     if (this.masterStart) {
      //       attr(this.id, 'Value', Number(this.Value || 0) + ((new Date().valueOf() - this.masterStart.valueOf()) / 1000 / 3600), true);
      //     }
      //     this.masterStart = masterOn ? new Date() : null;
      //     if (masterOn) {
      //       timers[this.id] = setTimeout(this.OnlineHours.bind(this), this.deltaTimeS * 1000);
      //     }
      //   }).call(item);
      //   return;
      // }
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
    // console.log(modbusDevices);
    // console.log(snmpDevices);
    if (modbusDevices) {
      const net = require('net')
      const jsmodbus = require('jsmodbus');
      modbusDevices.forEach((item, i) => {
        let readAddress = item.ReadAddress || 0;
        const devices = item.children;
        let readLength = devices.length;
        const attributes = initAttributes(item);
        console.log('MODBUS', item.IPAddress);
        function setSate(state){
          return;
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
          // console.log('MODBUS', item.IPAddress, 'CONNECTED');
          (function readData() {
            client.readInputRegisters(readAddress, readLength).then(resp => {
              var readArray = resp.response._body._valuesAsArray;
              // console.log('MODBUS', item.IPAddress, 'READ', readArray);
              devices.forEach((device,i) => {
                if (device && device.children) {
                  const readValue = readArray[i];
                  const bitString = ('0000000000000000' + readValue.toString(2)).substr(-16);
                  const bitArray = bitString.split('').reverse();
                  device.children.forEach((child,i) => {
                    if (child && child.type) {
                      // console.log(child.type, i, bitArray[i], bitArray, readValue);
                      switch(child.type) {
                        case 'UInt': return attrSetValue(child, readValue);
                        case 'Bool': return attrSetValue(child, bitArray[i]);
                      }
                    }
                  })
                }
              })
              setTimeout(readData, item.PollInterval);
            }).catch(err => {
              // console.log('read error', item.IPAddress, readAddress, readLength);
              attributes.forEach(attr => attrSet(attr, 'state', 'error'));
              setTimeout(connect, 2000);
            })
          })();
        }).on('disconnect', e => {
          setSate('disconnect');
          console.log('disconnect');
        }).on('error', e => {
          console.log('error', item.parent, item.name, item.id );
          setSate('error');
          setTimeout(connect, 5000);
        });
        connect();
        // return;
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
              console.error(err);
              children.forEach(child => attrSet(child, 'state', 'error'))
              setTimeout(() => {
                children.forEach(child => attrSet(child, 'state', 'connecting'))
                read();
              }, 5000);
              return;
            }
            children.forEach((child,i) => attrSetValue(child, varbinds[i] && varbinds[i].value))
            setTimeout(read, item.PollInterval);
          })
        })();
      });
    }
  }
  function initSystemAttributes(systemId) {
    const osUtils = require('os-utils');
    const checkDiskSpace = require('check-disk-space')
    const nodeCmd = require('node-cmd');
    let acsmCount = 0;
    (function getSystemAttributes() {
      attr(systemId, 'MEMORY_USED_SPACE', Math.round(100 - osUtils.freememPercentage() * 100));
      checkDiskSpace('C:/').then((diskSpace) => { attr(systemId, 'HDD_USED_SPACE', Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)); });
      nodeCmd.get('w32tm /query /status', (err, data, stderr) => {
        console.log(data);
        var value = Number(data.split(/\n/).shift().split(':').pop().split('(').shift().trim());
        attr(systemId, 'TIME_SYNC', value);
      });
      attr(systemId, 'WATCHDOG_ACSM', acsmCount = acsmCount >= 100 ? 1 : acsmCount+1);
      setTimeout(getSystemAttributes, 5000);
    })();
  }

  function ControlApplication(config) {
    console.log('nodeApplication');
    aim.sql.connect(config.dbs).then(a => {
      console.log('SQL COnnected');
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

      // items = config.items;
      // console.log(config.items);

      // config.items.forEach(function addItem(item) {
      //   if (item) {
      //     items.push(item);
      //     (item.children||[]).forEach(addItem)
      //   }
      //   // items[item.id = item.id || item.SystemId || items.length]=item;
      // });
      items.push(...config.items);

      // items.forEach((item,i) => item.id = i);
      // return console.log(config.items, items);
      //
      // items.forEach(item => {
      //   if (item.parent) {
      //     const parent = items.find(row => item.parent === [row.parent,row.name].join('.'));
      //     if (!parent) {
      //
      //     }
      //     console.log(item.parent, parent ? 1 : 0);
      //   }
      // })
      //
      //
      // // console.log(items);
      // return;

      // initSystemAttributes(config.items[0].id);

      initControlEquipment(items);
      const server = new aim.Server(config);
      attributes.on('change', attr => server.clients.send({attr:attr}));
    }).catch(console.error);
  }
  function Request(url) {
    this.url = new URL(url, 'https://aliconnect.nl');
    // console.log(this.url);
    this.options = {
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
  // function Aim() {}
  Object.defineProperties(aim, {
    ControlApplication: { value: ControlApplication },
    attributes: { value: attributes },
  });
  module.exports = aim;


  // console.log(aim);
})()

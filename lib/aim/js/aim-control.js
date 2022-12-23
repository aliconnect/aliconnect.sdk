const {on,emit,forEach} = Aim;
module.exports = Object.create({
  on,
  emit,
  forEach,
  create(options){
    const {server,systemTimeoutMs,connectTimeoutMs,pollIntervalMs,attributeTypes} = options;
    const control = this;
    Object.assign(this, {
      attrSet,
      attrSetValue,
      items: options.items,
    });
    // const events = require('events');
    const types = {
      D: { title: "Digital", bitLength: 1 },
      Bool: { title: "Boolean", bitLength: 1 },
      SByte: { title: "Signed Byte", bitLength: 8, signed: 1 },
      UByte: { title: "Unsigned Byte", bitLength: 8 },
      SInt: { title: "Signed Integer", bitLength: 16, signed: 1 },
      UInt: { title: "Unsigned Integer", bitLength: 16, dec:0 },
      SDInt: { title: "Signed Double Integer", bitLength: 32, signed: 1 },
      UDInt: { title: "Unsigned Double Integer", bitLength: 32 },
      Float: { title: "Float", bitLength: 32, signed: 1, exponent: 8, dec: 2 },
      Double: { title: "Double", bitLength: 64, signed: 1, exponent: 11, dec: 2 },
    };
    const timers = {};
    const items = [];
    var setItems = [];

    function debug(s){
      console.debug(s);
      fs.appendFile("logger.log", `${new Date().toISOString()}: ${s}\n`, err => console.debug);
    }
    function exit(s){
      debug(s);
      process.exit();

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
      for (var property in object) {
        params.push('@' + property + "='" + String(object[property]).replace(/'/g, "''") + "'");
      }
      return params.join(',');
    };

    function attrSet(attribute, propertyName, value) {
      const {name,path} = attribute;
      if (attribute[propertyName] !== value) {
        attribute[propertyName] = value;
        console.debug([path,name,propertyName].filter(Boolean).join('.'), '=', value);
        control.emit('change', attribute);
      }
    }
    function attrSetValue(attribute, newvalue, path = []) {
      if (attribute) {
        let {maxEngValue,minEngValue,maxRawValue,minRawValue,low,high,eq,ne,hysteresis,systemId,name,value,id,parent,title,attributeType,children} = attribute || {};
        low = Number(low || 0);
        high = Number(high || 0);
        value = Number(value || 0);
        hysteresis = Number(hysteresis || 0);
        function has(name) {
          return (name in attribute) && attribute[name] !== null;
        }
        // Valideer waarde
        if (!isNaN(newvalue)) {
          newvalue = Number(newvalue || 0);
          // // Validate newvalue
          // let quality = "Valid";
          // if (has('min') && has('max') && (attribute.min > newvalue || attribute.max < newvalue)) {
          //   console.error('NotValid', id, attributeName, newvalue);
          //   return attrSet(attribute, 'quality', "NotValid");
          // }

          // Omrekenen raw newvalue naar newvalue
          if (has('maxEngValue') && has('minEngValue') && has('maxRawValue') && has('minRawValue')) {
            newvalue = Math.round(((Number(maxEngValue) - Number(minEngValue)) / (Number(maxRawValue) - Number(minRawValue)) * (newvalue - Number(minRawValue)) + Number(minEngValue)) * 100) / 100;
          }
          // Binnenkomende waarde bewaren voor enum text
          if (has('ne')) {
            attribute.displayValue = newvalue;
          }
          // Low high
          if (has('Low') && has('high') && high <= low) {
            if (newvalue >= high && newvalue <= low) {
              newvalue = 1;
            } else if (newvalue <= high || newvalue >= low) {
              newvalue = 0;
            }
          } else if (has('low')) {
            if (newvalue <= low) {
              newvalue = 1;
            } else if (newvalue >= low) {
              newvalue = 0;
            }
          } else if (has('high')) {
            if (newvalue >= high) {
              newvalue = 1;
            } else if (newvalue <= high) {
              newvalue = 0;
            }
          }
          if (has('eq')) {
            newvalue = newvalue == eq ? 1 : 0;
          }
          if (has('ne')) {
            newvalue = newvalue != ne ? 1 : 0;
          }
          // Hysteresis
          if (newvalue < value - hysteresis || newvalue > value + hysteresis || !('value' in attribute)) {
            if (systemId) {
              name = path.concat(name).join('.');
              // console.debug(attribute.systemId, attribute.parent, name, newvalue);
              attribute.modifiedDT = new Date().toISOString();
              attrSet(attribute, 'value', newvalue);
              server.query(`INSERT attr(id,name,value,parent,title,attributeType) VALUES('${[
                id,
                name,
                value,
                parent,
                title,
                attributeType,
              ].join("','")}')`).catch(err => console.error('attrSetValue', err));
              control.emit('changeValue', attribute);
            }
            (children||[]).forEach(child => attrSetValue(child, newvalue, path.concat(name)));
          }

          // // OnlineHours
          // if (attribute.Calc == 'OnlineHours') {
          //   //console.debug('OnlineHours event',item.title, item.Value);
          //   attribute.deltaTimeS = 3600;
          //   (attribute.OnlineHours = function () {
          //     clearTimeout(timers[attribute.id]);
          //     var master = items[this.masterID];
          //     var masterOn = Number(master.Value);
          //     //masterOn = 1; // MKA
          //     //console.debug('OnlineHours', masterOn, this.masterStart);
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
    }
    function initControlEquipment(items) {
      function itemSetState(item, state){
        attrSet(item, 'state', state);
        (item.children||[]).filter(Boolean).forEach(child => itemSetState(child, state));
      }
      function initAttributes(item) {
        const attributes = [];
        let parent;
        let parentItem;
        (function addChildren(item) {
          if (item) {
            attributes.push(item);
            (item.children||[]).forEach(child => addChildren(child));
          }
        })(item, []);
        return attributes;
      }
      const modbusDevices = items.filter(item => item.device === 'MODBUS' && item.host);
      const snmpDevices = items.filter(item => item.device === 'SNMP' && item.host);
      // console.debug(modbusDevices);
      // console.debug(snmpDevices);
      if (modbusDevices) {
        const net = require('net');
        const jsmodbus = require('jsmodbus');
        modbusDevices.forEach((item,i) => {
          let {host,port,readAddress,children,pollInterval,state} = item;
          let readTimeout;
          let connectTimeout;
          const attributes = initAttributes(item);
          const socket = new net.Socket();
          const client = new jsmodbus.client.TCP(socket, i + 1);
          function setSate(state){
            attributes.forEach(attr => attrSet(attr, 'state', state));
          }
          function connect() {
            setSate('connecting');
            socket.connect({ host, port: port || 502 }); // port 502 default
          }
          socket.on('connect', e => {
            setSate('connected');
            console.debug('MODBUS', host, 'CONNECTED');
            (async function readData() {
              let readAddress = item.readAddress || 0;
              for (let device of children) {
                if (device) {
                  const {systemId,name,attributeType,children} = device;
                  readAddress = device.readAddress || readAddress;
                  device.type = device.type || 'UInt';
                  const bitPos = device.bitPos || 0;
                  const type = types[device.type];
                  const bitLength = type.bitLength;
                  const readLength = Math.ceil(bitLength/16);
                  await client.readInputRegisters(readAddress, readLength).then(resp => {
                    const byteArray = resp.response._body._valuesAsArray;
                    const bitString = byteArray.reverse().map(b => ('0000000000000000' + b.toString(2)).substr(-16)).join('');
                    const bitArray = bitString.split('').reverse();
                    const childBitString = bitString.substr(bitString.length - bitLength - bitPos, bitLength);
                    let readValue = bitTo(device.type, device.bitString = bitString.substr(bitString.length - bitLength - bitPos, bitLength));
                    if (systemId,name,attributeType) {
                      if (type.dec) readValue = Math.round ( readValue * 10**type.dec ) / 10**type.dec || 0;
                      attrSetValue(device, readValue);
                    }
                    (children||[]).filter(Boolean).forEach((child,i) => {
                      // console.debug('aaa', item.host, device.readAddress, device.readAddress, child.type, readValue, byteArray, readAddress, readLength);
                      switch(child.type) {
                        case 'UInt': return attrSetValue(child, readValue);
                        case 'Bool': return attrSetValue(child, bitArray[i]);
                      }
                    })
                  }).catch(err => {
                    console.debug('modbus read error', host);
                    attributes.forEach(attr => attrSet(attr, 'state', 'error'));
                    clearTimeout(readTimeout);
                    clearTimeout(connectTimeout);
                    connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
                  })
                }
                readAddress++;
              }
              clearTimeout(readTimeout);
              readTimeout = setTimeout(readData, pollInterval || pollIntervalMs || 500);
            })();
          }).on('disconnect', e => {
            console.error('modbus disconnect', host);
            setSate('disconnect');
            clearTimeout(readTimeout);
            clearTimeout(connectTimeout);
            connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
          }).on('error', e => {
            console.error('modbus error', state, host);
            setSate('error');
            clearTimeout(readTimeout);
            clearTimeout(connectTimeout);
            connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
          });
          connect();
        });
      }
      if (snmpDevices) {
        const snmpNative = require('snmp-native');
        snmpDevices.forEach(item => {
          let {pollInterval,children,host,community} = item;
          let readTimeout;
          let connectTimeout;
          if (children) {
            children = children.filter(Boolean);
            const session = new snmpNative.Session({ host, community:community || 'public' });
            const oids = children.map(child => child.oid.split(".").map(Number));
            itemSetState(item, 'connecting');
            // console.debug(oids);
            (function read() {
              session.getAll({ oids }, (err, varbinds) => {
                if (!varbinds.length) {
                  itemSetState(item, 'error');
                  clearTimeout(readTimeout);
                  clearTimeout(connectTimeout);
                  connectTimeout = setTimeout(() => {
                    itemSetState(item, 'connecting');
                    read();
                  }, 5000);
                } else {
                  itemSetState(item, 'connected');
                  children.forEach((child,i) => attrSetValue(child, varbinds[i] && varbinds[i].value));
                  clearTimeout(readTimeout);
                  readTimeout = setTimeout(read, pollInterval || pollIntervalMs || 500);
                }
              })
            })();
          }
        });
      }
    }

    if (server.query) {
      server.query(
        `IF OBJECT_ID('attr') IS NULL
        BEGIN
        CREATE TABLE [attr](
          [ts] [timestamp] NULL,
          [id] [bigint] NULL,
          [name] [varchar](50) NULL,
          [value] [varchar](max) NULL,
          [modifiedDateTime] [datetime] NULL,
          [parent] [varchar](500) NULL,
          [attributeType] [varchar](50) NULL,
          [title] [varchar](500) NULL
        ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
        END`
      );
    }
    systemAttributes = {
      MEMORY_USED_SPACE(item) {
        const osUtils = require('os-utils');
        (function memoryUsedSpace() {
          attrSetValue(item, Math.round(100 - osUtils.freememPercentage() * 100));
          setTimeout(memoryUsedSpace, systemTimeoutMs);
        })();
      },
      HDD_USED_SPACE(item) {
        const checkDiskSpace = require('check-disk-space').default;
        (function hddUsedSpace() {
          checkDiskSpace('C:/').then(diskSpace => attrSetValue(item, Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)));
          setTimeout(hddUsedSpace, systemTimeoutMs);
        })();
      },
      // TIME_SYNC(item) {
      //   const nodeCmd = require('node-cmd');
      //   (function timeSync() {
      //     nodeCmd.get('w32tm /query /status', (err, data, stderr) => {
      //       if (!err) {
      //         attrSet(item, 'state', 'connected');
      //         const [s,value] = data.match(/Leap Indicator: (\d)/) || [];
      //         return attrSetValue(item, value === '0' ? 0 : 1);
      //       } else {
      //         attrSet(item, 'state', 'disconnected');
      //         console.error(err);
      //       }
      //       attrSetValue(item, 1);
      //     });
      //     setTimeout(timeSync, systemTimeoutMs);
      //   })();
      // },
      // WATCHDOG_ACSM(item) {
      //   let acsmCount = 0;
      //   (function watchdogAcsm() {
      //     attrSetValue(item, acsmCount = acsmCount >= 100 ? 1 : acsmCount+1);
      //     setTimeout(watchdogAcsm, systemTimeoutMs);
      //   })();
      // },
    };
    (function addChildren(children,path=[]){
      Array.from(children).forEach(item => {
        if (item) {
          const {name,children,enumeration} = item;
          item.path = path.filter(Boolean).join('.');
          if (systemAttributes[name]) {
            systemAttributes[name](item);
          }
          if (enumeration) {
            item.enum = enumeration.replace(/, /g,',').split(',');
          }
          items.push(item);
          addChildren(children||[],path.concat(name));
        }
      });
    })(options.items);
    initControlEquipment(items);
    Aim.paths({
      '/api/config': {
        get: {
          operation: end => end(200, JSON.stringify({items: options.items,attributeTypes}), { 'Content-Type': 'application/json' }),
        },
      },
    });
    return control;
  },
});

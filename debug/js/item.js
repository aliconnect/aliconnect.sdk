Item = function () {};
Object.assign(Item, {
  get(selector, schemaName){
    // console.log(selector.schemaName);
    // iii++;
    // if (iii>1000) throw 'STOP';
    if (!selector) throw 'No Item selector';
    if (selector instanceof Item) return selector;
    if (typeof selector !== 'object'){
      if ($.his.map.has(selector)){
        return $.his.map.get(selector);
      } else if (isNaN(selector)){
        selector = { '@id' : selector };
      } else {
        return null;
      }
    }
    if (selector.AttributeID){
      selector = {
        '@id': selector['@id'],
        header0: selector.Value,
      };
    }
    let match = (selector['@id'] || selector['@odata.id'] || selector.tag || '').match(/(\w+)\((\d+)\)/);
    // console.log(selector.schema);
    if (match && !selector.schema && !selector.schemaName) {
      selector.schema = match[1];
      selector.ID = match[2];
    }
    const ID = selector.ID = selector.ID ? selector.ID.Value || selector.ID : String('item'+(selector.nr = Item.nr = Item.nr ? ++Item.nr : 1));
    // console.log(selector.ID);
    // if (selector.schemaPath) console.debug(selector.schemaPath)
    // if (!selector.schema) console.error(selector.schemaPath, selector)
    // console.log(selector.schema);
    schemaName = validSchemaName(selector.schema = selector.schema || selector.schemaName || schemaName || 'Item');
    const tag = `${schemaName}(${ID})`;
    if (tag.includes('[')) console.warn(tag, selector);
    const id = selector.id || tag;
    var item = $.his.map.get(id);
    // console.warn(111,schemaName,id);
    if (item) {
      // console.log(item.data);
      item.data = Object.assign(item.data, selector);
    } else {
      // console.debug(schemaName, window[schemaName]);
      // if (!window[schemaName]) return console.warn(schemaName, 'not exists');
      // console.log(schemaName, window[schemaName]);
      var item = window[schemaName] ? new window[schemaName]() : new Item();
      // console.debug(selector, item.schema, window[schemaName].prototype);
      // console.log(selector.properties);
      item.properties = Object.fromEntries(
        Object.entries(selector.properties || item.schema.properties)
        .map(([propertyName, property]) => [
          propertyName,
          Object.assign({
            item: item,
            get value(){
              return item[propertyName];
            },
            set value(value) {
              item[propertyName] = value;
            },
          }, property)
        ])
      );
      item.tag = tag;
      if (item.href = selector['@id'] || selector['@odata.id']) {
        item.Id = btoa(item.href);
      }
      item.data = selector;
      item.schemaName = schemaName;
      if (window[schemaName] && window[schemaName].set){
        window[schemaName].set(tag, item);
      }
      $.his.map.set(ID,item);
      // console.debug(ID, $.his.map.get(ID));
      $.his.map.set(tag,item);
      $.his.map.set(id,item);
      // item.on('change', e => {
      //   // console.debug($().list())
      //   // Object.values(this).filter(obj => typeof obj === 'object' && obj.emit).forEach(obj => obj.emit('change'));
      // });
    }
    return item;
    Object.entries(item.data).forEach(([propertyName,property]) => {
      // console.log(propertyName,property, item.hasOwnProperty(propertyName));
      if (!item.hasOwnProperty(propertyName)) {
        Object.defineProperty(item, propertyName, {
          get(){
            return this.getValue(propertyName);
          },
          set(value){
            this.attr(propertyName, value, true);
          }
        });
      }
    });
    return item;
  },
  mergeinto(newID, oldID){
    //om drop action move into
    // console.debug('SAMENVOEGEN');
    new $.HttpRequest($.config.$, 'GET', `/item(${newID})`, {
      oldID: oldID,
    }, this.onload || function (){
      // console.debug(this.data);
    }).send();
  },
  new(item){
    return $.promise( 'New item', resolve => {
      //Geeft inzicht in bal bla
      //// console.debug('ADD', this.caller);
      //return;
      //var a = String(this.id || get.lid).split(';');
      //var schemaname;// = api.find(post.classID);
      //var schema = $.config.components.schemas[this.caller.schema];// || $.config.components.schemas[schemaname = api.find(post.classID)];
      //var post = { id: a.shift(), };
      //if (schema.onadd) schema.onadd.call(post);
      // var put = { schema: item.schema || item.get.folder };
      //// console.debug('ADD', this, put, this.caller);
      if (item.source){
        const [s,schemaName,id] = item.source.match(/(\w+)\((\d+)\)/);
        var url = `/${schemaName}`;
        item
      }
      aimClient.api(url).patch(item).then(body => {
        console.debug(body);
        resolve(body);
      });
      return;
      new $.HttpRequest($.config.$, 'PATCH', '/' + this.schema, {
        value: [put],
      }, this.onload || function(e){
        // console.debug('ADDED', this.data);
        //return;
        //// console.debug(this.src, this.responseText, this.data.id, this.data, $.getItem(this.data.id]);
        //var itemID = this.data[];//.set[0][0].id;
        var item = ItemAdded = $.getItem(e.body.Value.shift().id);
        item.onloadEdit = true;
        for (var name in item.properties){
          if (item.properties[name].initvalue){
            item.setAttribute(name, item.properties[name].initvalue);
          }
        }
        $.url.set({ schema: item.schema, id: item.id });
        //// console.debug('LV', $.listview);
        //$.listview.elItems.insertBefore($.listview.items.appendListitem(item), $.listview.elItems.firstChild);
        //$.show({ id: item.id });
      }).send();
      resolve('ja');
    })
  },
  toData(item){
    console.debug('TODATA', item);
    return {
      ID: item.ID,
      tag: item.tag,
      index: item.index,
      title: item.headerTitle,
      // hostID: item.hostID,
      // srcID: item.srcID,
      // classID: item.classID,
      Master: item.elemTreeLi && item.elemTreeLi.elem.parentElement.item ? { tag: item.elemTreeLi.elem.parentElement.item.tag } : null,
      Class: item.data.Class,
      // type: type,
    }
  },
  toHtml(item){
    return `<table>${Object.entries(item).filter(entry => !['object', 'function'].includes(typeof entry[1])).map(entry => `<tr><td>${entry[0]}</td><td>${entry[1]}</td></tr>`).join('')}</table>`;
  },
  toText(item){
    return `${Object.entries(item).filter(entry => !['object', 'function'].includes(typeof entry[1])).map(entry => `${entry[0]}\t${entry[1]}\n`).join('')}`;
  },
});
Item.prototype = {
  api(selector = '') {
    // console.log(aimClient.api(`/${this.tag}` + selector))
    console.log(1, aimClient)
    return aimClient.api(`/${this.tag}` + selector);
  },
  attr(attributeName, value, postdata){
    return $.promise( 'Attribute', async resolve => {
      try {
        // console.warn(1, 'attr', attributeName, value, postdata);
        const item = this;
        const property = this.schema.properties[attributeName] || {};
        if (property.readOnly) return resolve(item);
        if (value === undefined){
          return resolve(item);// console.error('value is undefined', arguments.length, attributeName, this);
        }
        if (value instanceof String){
          value = String(value);
        }
        const values = item.data = item.data || {};
        if (Array.isArray(value)){
          values[attributeName] = value;
          // console.debug('attr1', attributeName, value);
          return resolve(item);
        }
        let data = values[attributeName] = values[attributeName] || {};
        data = [].concat(data);
        data = data.filter(data => !data.SrcID || data.SrcID == item.ID);
        if (typeof value !== 'object' || value === null) {
          value = { Value: value };//values[attributeName] = values[attributeName] || value;
        }
        function getItem(selector) {
          if (selector instanceof Item) return selector;
          selector = typeof selector === 'object' ? selector.tag : selector;
          if ($.his.map.has(selector)) return $.his.map.get(selector);
        }
        if (value.target) {
          console.log(value.target);
          value.LinkID = getItem(value.target).ID;
        }
        if (value.current) {
          const current = getItem(value.current);
          data = data.find(attr => attr.AttributeName === attributeName && attr.LinkID === current.ID) || null;
        } else if (value.AttributeID) {
          data = data.find(data => data.AttributeID === value.AttributeID)
        } else if (value.type !== 'append') {
          data = data.shift();
        }
        // if (value === data){
        //   console.debug('attr2', attributeName, value);
        //   return resolve(item);
        // }
        if (typeof data !== 'object' || data === null){
          data = values[attributeName] = { Value: data };
        }
        value = Object.assign({},{
          AttributeID: data.AttributeID,
          Value: data.Value,
          HostID: data.HostID,
          Data: data.Data,
          LinkID: data.LinkID
        },value);
        if (value.LinkID1) {
          async function reindex(parent) {
            await parent.children.then(children => {
              if (children.length) {
                // children.forEach((item,i) => item.getIndex(attributeName, parent) != i ? item.setLink(attributeName, parent, i, parent) : null);
              }
              // parent.attr('HasChildren', children.length ? 1 : 0, true);
            })
          }
          const to = $.his.map.get(value.LinkID);
          // const name = attributeName || 'link';
          const action = value.action || 'move';
          if (attributeName === 'Master') {
            if (action === 'move') {
              const current = item.elemTreeLi.elem.parentElement.item;
              value.Data = Math.max(0, value.Data === undefined ? 99999 : value.Data );
              await current.children.then(children => {
                children.splice(children.indexOf(item), 1);
                if (current !== to) {
                  // reindex(current);
                }
              });
              if (to) {
                await to.children.then(children => {
                  children.splice(value.Data, 0, item);
                  reindex(to);
                });
                // } else {
                //   item.setLink(attributeName, to, value.Data, current);
              }
              // } else {
              //   item.setLink(attributeName, to, params.index, current);
            }
            // setTimeout(() => resolve(item));
            // return;
          }
        }
        const currentJson = [data.AttributeID,data.Value,data.HostID,data.Data,data.LinkID].join();
        const newJson = [value.AttributeID,value.Value,value.HostID,value.Data,value.LinkID].join();
        if (value.max) {
          delete value.AttributeID;
        } else if (currentJson === newJson){
          return resolve(item);
        } else {
          // console.log(attributeName,currentJson,newJson,value,data);
        }
        // console.debug(attributeName, value);
        if ($.threeObjects && $.threeObjects[item.tag] && $.threeObjects[item.tag].obj.onchange){
          $.threeObjects[item.tag].obj.onchange(attributeName, value.Value);
        }
        item['@id'] = item['@id'] || item.tag;
        // console.debug(attributeName, value);
        Object.assign(data, value);
        if (item.elems) {
          item.elems.forEach(elem => {
            var displayvalue = newvalue = typeof value === 'object' ? value.Value : value;
            // console.debug(attributeName, value, item.elems);
            // var displayvalue = property.displayvalue || displayvalue;
            const el = elem.elem;
            if (el.hasAttribute('displayvalue')) {
              elem.displayvalue(this.displayvalue(attributeName));
            }
            // if (property.type === 'datetime'){
            // 	newvalue = new Date(newvalue).toISOString().substr(0,19);
            // }
            // Do not update if type in files
            // if (!['files','radio','select'].includes(property.format)){
            // displayvalue = String(displayvalue).split('-').length == 3 && String(displayvalue).split(':').length == 3 && new Date(displayvalue) !== "Invalid Date" && !isNaN(new Date(displayvalue)) ? new Date(displayvalue).toISOString().substr(0, 19).replace(/T/, ' ') : displayvalue;
            // if (displayvalue && !isNaN(displayvalue)){
            // 	displayvalue = Math.round(displayvalue * 100) / 100;
            // }
            if (el.hasAttribute(attributeName) && el.getAttribute(attributeName) != newvalue){
              el.setAttribute(attributeName, newvalue);
              el.setAttribute('modified', new Date().toLocaleString());
            }
            // [...el.getElementsByClassName(attributeName)].forEach((attributeElement, i) => {
            //   // if (attributeElement.noupdate) return;
            //   // if (attributeElement === document.activeElement) return;
            //
            //   if (['files','radio','select'].includes(attributeElement.format)) return;
            //   if (attributeElement.hasAttribute('checked')){
            //     if (newvalue){
            //       attributeElement.setAttribute('checked', '');
            //     } else {
            //       attributeElement.removeAttribute('checked');
            //     }
            //     attributeElement.setAttribute('modified', new Date().toLocaleString());
            //   } else if ('value' in attributeElement && attributeElement.type === 'radio'){
            //     attributeElement.checked = attributeElement.value === newvalue;
            //   } else if ('value' in attributeElement){
            //     // return console.error(attributeElement, document.activeElement, attributeElement === document.activeElement);
            //     // return console.error(1);
            //     // console.error(attributeElement.value, newvalue)
            //     if (attributeElement.value != newvalue){
            //       attributeElement.value = newvalue;
            //       attributeElement.setAttribute('modified', new Date().toLocaleString());
            //     }
            //   } else if (attributeElement.hasAttribute('value')){
            //     if (attributeElement.getAttribute('value') != newvalue){
            //       attributeElement.setAttribute('value', newvalue);
            //       attributeElement.setAttribute('modified', new Date().toLocaleString());
            //     }
            //   } else if (['SPAN', 'DIV', 'TD'].includes(attributeElement.tagName)){
            //     // console.debug(attributeElement.tagName, attributeElement, attributeElement.children);
            //     if (property && property.options && property.options[newvalue] && property.options[newvalue].color){
            //       if (attributeElement.style.backgroundColor){
            //         attributeElement.style.backgroundColor = property.options[newvalue].color;
            //       }
            //     } else if (!attributeElement.children.length){
            //       attributeElement.innerHTML = displayvalue != undefined ? displayvalue : '';
            //     }
            //     // attributeElement.setAttribute('modified3', new Date().toLocaleString());
            //   }
            // });
            setTimeout(e => elem.emit('change'));
            // if (el.onupdate){
            //   setTimeout(el.onupdate);
            // }
          })
        }
        if (!$.his.noPost && postdata){
          // console.error(arguments);
          // for (var callee = arguments.callee, caller = callee.caller;caller;caller = caller.caller){
          // 	console.debug(caller);
          // }
          // return;
          const itemModified = $.his.itemsModified[item['@id']] = $.his.itemsModified[item['@id']] || {
            ID: item.data.ID ? item.data.ID.Value || item.data.ID : null,
            method: 'patch',
            path: '/' + item.tag,
            body: {
              // ID: item.data.ID,
            },
            // res: (e) => {
            // 	// console.debug('DONE', item.tag, e.request );
            // }
          };
          // console.log(itemModified);
          const updateProperty = itemModified.body[attributeName] = itemModified.body[attributeName] || {};
          Object.assign(updateProperty, (({ AttributeID, Value, HostID, UserID, LinkID, Data }) => ({ AttributeID, Value, HostID, UserID, LinkID, Data }))(data));
          if ('max' in property && !('max' in value)) {
            value.max = property.max;
          }
          if ('max' in value) {
            updateProperty.max = value.max;
            if (value.LinkID !== null || value.Value !== null) {
              delete updateProperty.AttributeID;
            }
          }
          // if (value.LinkID === null) return console.warn(value,updateProperty);
          let values = Object.values($.his.itemsModified);
          if (values.length){
            clearTimeout($.his.itemsModifiedTimeout);
            $.his.itemsModifiedResolve = $.his.itemsModifiedResolve || [];
            $.his.itemsModifiedResolve.push([resolve, item]);
            $.his.itemsModifiedTimeout = setTimeout(() => {
              $.his.itemsModified = {};
              const param = { requests: values };
              // console.debug('saveRequests', param.requests);
              if ($.config && $.config.dbs) {
                $.saveRequests(param.requests);
              } else if (this.schema.table) {
              } else {
                $().send({
                  to: { aud: $.aud, sub: $.aud },
                  body: param,
                  itemsModified: true,
                });
                // DEBUG: MKAN STAAT UIT IVM SCHIPHOL
                $().send({body: param});
              }
              $.handleData({body: { requests: values }});
              $.his.itemsModifiedResolve.forEach(([resolve, item]) => resolve(item));
              $.his.itemsModifiedResolve = [];
            });
          }
        } else {
          resolve(item);
        }
        // if (properties[attributeName]){
        // var property = item.properties[attributeName];
        // if (property.type === 'datetime'){
        // 	if (value.Value){
        // 		value.Value = (value.Value + ':00').substr(0,19);
        // 	}
        // }
        // return;
        if (property.type === 'datetime'){
          if (value.Value && value.Value.match(/T\d+:\d+$/)){
            value.Value = (value.Value + ':00').substr(0,19);
          }
        }
        // let {UserID,Value} = value;
        // console.debug(Object.entries(value), JSON.stringify(data), JSON.stringify(value));
        // Object.assign(data, value);
        //
        // for (let [key, keyValue] of Object.entries(value)){
        // 	if (values[key] != keyValue){
        // 		let object = Object.assign(data, value);
        // 		['UserID', 'Value', 'LinkID', 'Data'].forEach(key => {
        // 			if (key in data){
        // 				var bodyAttribute = itemModified.body[attributeName] = itemModified.body[attributeName] || {};
        // 				bodyAttribute[key] = value[key];
        // 			}
        // 		});
        // 		break;
        // 	}
        // }
        // execute autonoom_proces for item and parent
        for (let parent = item; parent; parent = parent.parent){
          if (parent.operations){
            for (let [operationName, operation] of Object.entries(parent.operations)){
              if (parent[operationName] && operation.stereotype === 'autonoom_proces' && typeof parent[operationName] === 'function'){
                // console.debug('setAttribute autonoom_proces', operationName);
                try {
                  // item[operationName]();
                } catch (err){
                  console.debug('ERROR', err);
                }
              }
            }
          }
        }
        // }
        /* bij data van database, item.loading dan stoppen met uitvoeren, niet wegschrijven naar database, is ook actief bij data van WS  */
        /* If attribute exists (been loaded) then this is an update and the change should be writen to the database			*/
        (recursive = function (item){
          if (!item) return;
          if (typeof item.onchange === 'function') item.onchange();
          recursive(item.master);
        })(item);
        // $().emit("attributeChange", { item: this, [attributeName]: modvalues });
        // return ref.itemsModified;
      } catch (err) {
        console.error(err);
      }
    });
  },
  append(item, index){
    return $.promise( 'Append', async resolve => {
      if (item.parent) {
        await item.parent.children.then(children => {
          const index = children.indexOf(item);
          children.splice(index, 1);
          if (item.parent !== this) {
            children.forEach((item,i) => item.index !== i ? item.Masterindex = i : i);
          }
        });
      }
      this.children.then(children => {
        children.splice(index = Math.max(index,0), 0, item);
        item.attr('Master', { LinkID: this.data.ID }, true);
        console.debug('MASTER',this.data.ID,item.data.Master.LinkID)
        children.forEach((item,i) => item.index !== i ? item.index = i : i);
        setTimeout(() => resolve(item));
      });
    });
  },
  get bccRecipients(){
    console.log(this);
    return this.data.bccRecipients || 0;
  },
  get ccRecipients(){
    return this.data.ccRecipients || 0;
  },
  get children() {
    return $.promise( 'Children', resolve => {
      if (this.items) return resolve(this.items);
      const api = this.api(`/children`).filter('FinishDateTime eq NULL')
      .select($.config.listAttributes).get().then(body => {
        // const children = Array.isArray(this.data.Children) ? this.data.Children : this.data.children;
        // console.log('children_then', this.header0, this.data.Children, this.data.children, this.data, JSON.parse(e.target.responseText));
        const children = this.data.Children || this.data.children;
        this.items = [].concat(children).filter(Boolean).map($).unique();
        this.items.url = body.data['@id'];
        this.HasChildren = this.items.length>0;
        resolve (this.items);
      })
    });
  },
  get class() {
    console.debug(this,this.schemaName,this.schema,this.classID);
    return $.his.map.get(this.classID);
  },
  get classItemName(){
    return (this.source && this.source.name ? this.source.name : '') + (this.name || '');
  },
  get classTag(){
    return (this.source && this.source.tag ? this.source.tag : '') + (this.tag || '');
  },
  get className() {
    // console.debug(this.schema.Name, this.schema.allOf);
    return [
      // this.schema.Name || 'Item',
      ...(this.schema.allOf || []),
      this.name,
      this.schemaName,
      this.isSchema ? 'constructor' : '',
      // this.schema.Name === 'Item' ? 'isclass' : 'noclass',
      // this.ID,
    ].join(' ')
  },
  get created(){
    return dateText(this.data.CreatedDateTime);
  },
  get createdDateTime(){
    return this.data.createdDateTime;
  },
  combine(config){
    return config.split(',')
    .map(name => this.data[name] ? this.data[name].Value || this.data[name] || '' : '')
    .filter(Boolean)
    .join(' ');
  },
  clone() {
    if (this.data.Src) {
      return $.promise( 'Clone', resolve => {
        console.debug('CLONE', this.data);
        const sourceId = [].concat(this.data.Src).shift().LinkID;
        aimClient.api(`/${this.tag}`).query('request_type','build_clone_data').get().then(async items => {
          // console.warn('clone1',e.body);
          (async function clone(targetId,sourceId){
            // console.warn('clone',targetId,sourceId);
            if (targetId && sourceId) {
              const children = items.filter(row => row.masterId && sourceId && row.masterId == sourceId);
              await children.forEach(async (child,i) => {
                let allOf = JSON.parse(child.allOf);
                const schemaName = allOf.find(schemaName => $().schemas().has(schemaName));
                if (child.cloneId === null){
                  const data = {
                    header0: child.header0,
                    header1: child.header1,
                    header2: child.header2,
                    Master: {
                      LinkID: targetId,
                      Data: i,
                    },
                    Src: {
                      LinkID: child.itemId,
                    },
                    Inherited: {
                      LinkID: child.itemId,
                    },
                  };
                  console.debug('create',data);
                  // console.debug(targetId, sourceId, i, child.id, child.title, child.schemaName);
                  await aimClient.api(`/${schemaName}`).input(data).post().then(body => clone(body.data.ID, child.itemId));
                } else {
                  clone(child.cloneId, child.itemId)
                }
              });
              const target = $(targetId);
              if(target && target.elemTreeLi) {
                target.elemTreeLi.emit('toggle')
              }
            }
          })(this.data.ID,sourceId);
          resolve(this);
        });
      });
    }
  },
  get detail(){
    return this.detailID ? Item.create({ id: this.detailID }) : {};
  },
  details(reload){
    return $.promise( 'Details', resolve => {
      if (reload || !this.hasDetails){
        this.data = {};
        this.get().then(e => resolve(e.body, this.hasDetails = true)).catch(console.error);
      } else {
        resolve(this)
      }
    })
  },
  delete(){
    this.remove();
    return aimClient.api(`/${this.tag}`).delete();
  },
  displayvalue(attributeName) {
    return $.attr.displayvalue(this.getValue(attributeName), ((this.schema||{}).properties||{})[attributeName]);
  },
  get elements(){
    return Object.values(this).filter(value => value instanceof Element);
  },
  eval(name){
    const config = this.schema[name] || '';
    // console.debug(name);
    if (typeof config === 'function'){
      return config.call(this);
    }
    return this.combine(config);
  },
  get fav(){
    let isFavorite = 'Fav' in this ? Number(this.Fav) : $.his.fav.includes(this.tag);
    // console.debug('isFavorite', isFavorite);
    return isFavorite;
  },
  set fav(value){
    console.debug(value);
    let id = this.tag;
    $.his.fav.splice($.his.fav.indexOf(id), 1);
    if (value){
      $.his.fav.unshift(this.tag);
    }
    // console.debug('SET FAV', private.fav, this.tag, this.id, value, $.auth.access.sub);
    this.Fav = { UserID: $.auth.access.sub, Value: value };
    this.rewriteElements();
  },
  get filternames() {
    return Object.entries(this.schema.properties||{}).filter(([name,prop]) => prop.filter).map(([name,prop]) => name);
  },
  get flag(){
    return this.data.flag || false;
  },
  flagState(){
    const today = new Date();
    if (String(this.FinishDateTime)){
      return 'done';
    } else if (String(this.EndDateTime)){
      let daysLeft = Math.round((new Date(this.EndDateTime) - today) / 1000 / 60 / 60 / 24);
      if (daysLeft > 28) return '4weeks';
      if (daysLeft > 21) return '3weeks';
      if (daysLeft > 14) return '2weeks';
      if (daysLeft > 7) return 'nextweek';
      if (daysLeft > 1) return 'thisweek';
      if (daysLeft > 0) return 'tomorrow';
      if (daysLeft == 0) return 'today';
      return 'overdate';
    }
    return '';
  },
  flagMenu: {
    vandaag: { title: 'Vandaag', className: 'flag', flag: 'today', onclick: e => {
      // console.debug(this, new Date().toISOString().substr(0, 10));
      this.FinishDateTime = '';
      this.EndDateTime = new Date().toISOString().substr(0, 10) + 'T17:00:00';
      // this.item.set({ FinishDateTime: '', EndDateTime: aDate().toISOString().substr(0, 10) });
    }},
    morgen: { title: 'Morgen', className: 'flag', flag: 'tomorrow', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + (0 < today.getDay() < 5 ? 1 : 3));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    }},
    dezeweek: { title: 'Deze week', className: 'flag', flag: 'thisweek', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + (5 - today.getDay()));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    }},
    volgendeWeek: { title: 'Volgende week', className: 'flag', flag: 'nextweek', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7 + (5 - today.getDay()));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    }},
    over2weken: { title: 'Over 2 weken', className: 'flag', flag: '2weeks', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14 + (5 - today.getDay()));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    } },
    over3weken: { title: 'Over 3 weken', className: 'flag', flag: '3weeks', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 21 + (5 - today.getDay()));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    } },
    over4weken: { title: 'Over 4 weken', className: 'flag', flag: '4weeks', onclick: e => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 28 + (5 - today.getDay()));
      this.FinishDateTime = '';
      this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
    } },
    none: { title: 'Geen', className: 'flag', flag: '', onclick: e => {
      this.EndDateTime = '';
    } },
    // datum: { title: 'Datum', className: 'calendar', onclick: e => {
    // 	// console.debug(this.item);
    // } },
    gereed: { title: 'Gereed', className: 'flag', flag: 'done', onclick: e => {
      const today = new Date();
      this.FinishDateTime = today.toISOString().substr(0, 19);
    } },
  },
  get fullName(){
    var text = [this.classItemName], item = this.master;
    while (item){
      if (item.tag) text.unshift(item.classItemName);
      item = item.master;
    }
    return text.join('_');
  },
  get fullTag(){
    var text = [this.classTag], item = this.master;
    while (item){
      if (item.tag) text.unshift(item.classTag);
      item = item.master;
    }
    return text.join('.');
  },
  get from(){
    return this.data.from || 0;
  },
  get() {
    return this.api().select('*').get();
  },
  getrel(name, root){
    if (!this[name]) return;
  },
  getPropertyAttributeName(propertyName){
    for (var attributeName in this.properties){
      if (this.properties[attributeName].idname == propertyName){
        return attributeName;
      }
    }
  },
  getValue(name) {
    if (this.data && this.data[name]) {
      const data = [].concat(this.data[name]);
      const value =
      data.find(value => typeof value === 'object' && value.SrcID == this.data.ID && 'Value' in value) ||
      data.find(value => typeof value === 'object' && 'Value' in value) ||
      data.shift();
      // // console.debug(name, this.data[name]);
      // value = value
      // .filter(value => value.Value)
      // .map(value => value.Value)
      // .shift() ||
      // value
      // .filter(value => value.SrcValue)
      // .map(value => value.SrcValue)
      // .shift();
      return typeof value === 'object' ? value.Value : value;
    }
    return null;
  },
  getDisplayValue(attributeName) {
    return $.attr.displayvalue(this.getValue(attributeName), ((this.schema||{}).properties||{})[attributeName]);
  },
  get hasAttach(){
    return Object.values((this.schema || {}).properties || {}).find(property => property.format === 'files' && this.data[property.name]) ? true : false;
  },
  get hasAttachments(){
    return this.data.hasAttachments || false;
  },
  get hasChildren(){
    if (this.data && this.data.children) return true;
    // console.debug(this.data);
    return this.getValue('HasChildren');
    const children = this.data.Children || this.data.children;
    return children ? children.length > 0 : this.getValue('HasChildren');
  },
  set hasChildren(value){
    new $(this).elements.forEach(element => {
      if (element.hasAttribute('open')){
        if (value){
          if (element.getAttribute('open') === ''){
            element.setAttribute('open', 0);
            element.onopen = e => this.open();
            element.onclose = e => this.close();
          }
        } else {
          element.setAttribute('open', '');
          element.onopen = null;
          element.onclose = null;
          console.debug('REMOVE OPEN', element.getAttribute('open'), element);
        }
      }
    });
  },
  get hasImage(){
    return this.hasAttach && $.object.isFile(this.files[0]);
  },
  headerId(id) {
    return this.schema.header && this.schema.header[id] ? this.schema.header[id] : Object.entries(this.schema.properties).filter(([name,prop]) => prop.header === id).map(([name,prop]) => name);
  },
  headerValue(id,name) {
    if (this.hasDetails) {
      const headerValue = this.headerId(id).map(name => String(this.getValue(name)||'').stripTags()).filter(Boolean).join(' ').substr(0,500) || null;
      const value = this.getValue(name) || null;
      // console.debug(headerValue, value)
      if (headerValue != value) {
        // console.warn([headerValue, value]);
        this.attr(name, headerValue, true);
      }
    }
    return this.getValue(name)||'';
  },
  get header0(){
    var value = this.headerValue(0,'header0') || this.getValue('header0') || this.getValue('Title') || this.getValue('Name') || this.title || this.name || this.tag || '';
    return (typeof value === 'object' ? value.Value : value);
  },
  set header0(value) {
    this[this.headerId(0)[0]] = value;
  },
  get header1() {
    // console.debug('header1', this.headerValue(1,'header1'));
    return this.headerValue(1,'header1');
  },
  get header2() {
    return this.headerValue(2,'header2');
  },
  get iconsrc(){
    if (!this.files || !this.files.length) return '';
    for (var i = 0, f; f = this.files[i]; i++){
      if ($.object.isFile(f)){
        break;
      }
    }
    if (f && f.src && f.src[0] == '/'){
      f.src = 'https://aliconnect.nl' + f.src;//// console.debug(f.src);
    }
    return f ? f.src : '';
  },
  get index(){
    return Number(this.getIndex('Master', this.parent));
  },
  set index(value){
    if (this.parent) this.Master = { LinkID: this.parent.data.ID, Data: value };
  },
  get ID(){
    return this.data.ID;
  },
  getIndex(name, to) {
    if (this.data[name] && to) {
      to = to instanceof Item ? to : $(to.tag);
      const attribute = [].concat(this.data[name]).find(attr => attr.AttributeName === name && attr.LinkID === to.ID) || {};
      return attribute.Data;
    }
  },
  get id(){
    return this.data.ID;
  },
  get importance(){
    return this.data.importance || 0;
  },
  get isClass(){
    return this.data && this.data.Class && [].concat(this.data.Class).shift().LinkID == 0 ? true : false;
  },
  get isInherited(){
    // console.debug(this.tag,this.header0,this.data.InheritedID);
    return this.getValue('InheritedID') ? 1 : 0;//this.data && this.data.InheritedID;
  },
  get isDraft(){
    return this.data.isDraft || false;
  },
  get lastModified(){
    return dateText(this.data.LastModifiedDateTime);
  },
  get lastModifiedDateTime(){
    return this.data.lastModifiedDateTime;
  },
  get lastModifiedBy(){
    var value = (this.data || {}).lastModifiedBy || '';
    value = value.user || value;
    value = value.displayName || value.Value || value.value || value || '';
    return value;
  },
  get modified(){
    return !this.LastModifiedDateTime ? '' : (!this.LastVisitDateTime ? 'new' : (new Date(this.LastModifiedDateTime).valueOf() > new Date(this.LastVisitDateTime).valueOf() ? 'modified' : ''));
  },
  async movetoidx(parent, index, noput){
    return parent.append(this, index === undefined ? 99999 : index, true);
    // return;
    // DEBUG: CLASS LOGICA
    if (this.isClass && master.isClass){
      this.srcID = master.id;
    } else if (this.isClass && !master.isClass){
      if (confirm("Class '" + this.Title + "' moved into object '" + master.Title + "', do you want to instantiate?")) return this.copytoidx(master, index);
      if (confirm("Make '" + this.Title + "' a derived class from '" + master.Title + "'?")) set.srcID = master.id;
      else if (!confirm("Continue move?")) return;
    } else if (!this.isClass && master.isClass){
      if (confirm("Object '" + this.Title + "' moved into class '" + master.Title + "', make this an inherited?")) set.srcID = master.id;
      //else if (!confirm("Continue move?")) return;
    }
  },
  moveup() {
    return $.link({
      item: this,
      to: this.parent,
      name: 'Master',
      index: this.index - 1,
      action: 'move',
    });
    // return this.parent.append(this, this.index - 1);
    // if (this.index > 0){
    //   this.movetoidx(this.parent, this.index - 1);
    // }
  },
  movedown(e){
    return $.link({
      item: this,
      to: this.parent,
      name: 'Master',
      index: this.index - 1,
      action: 'move',
    });
    // return this.parent.append(this, this.index + 1);
    // if (this.index < this.parent.items.length - 1){
    //   this.movetoidx(this.parent, this.index + 1);
    // }
  },
  get name() {
    return this.getValue('name') || this.getValue('Name') ;
  },
  options(attr){
    const properties = (this.schema || {}).properties || {};
    const property = properties[attr] || {};
    const options = property.options || {};
    const value = this[attr] || '';
    const option = value.split(',').map(v => options[v] || { color: '' });
    return [option, options];
  },
  get parent() {
    if (this.elemTreeLi && this.elemTreeLi.elem.parentElement) {
      return this.elemTreeLi.elem.parentElement.item;
    }
    return this.data.Master ? $([].concat(this.data.Master).shift()) : null
    // return this.elemTreeLi && this.elemTreeLi.elem.parentElement ? this.elemTreeLi.elem.parentElement.item : null;
  },
  get properties(){
    return this.schema.properties;
  },
  get receivedDateTime(){
    return this.data.receivedDateTime || 0;
  },
  reindex(e){
    return $.promise( 'Reindex', async resolve => {
      // return;
      if (this.hasChildren){
        console.warn('reindexOOOO1');
        const children = await this.children;
        console.warn('reindexOOOO', children);
        if (this.elemTreeLi) this.elemTreeLi.emit('toggle');
        children.forEach((child, i) => {
          if (child.elemListLi && child.elemListLi.elem && child.elemListLi.elem.parentElement){
            child.elemListLi.elem.parentElement.appendChild(child.elemListLi.elem);
          }
        });
      }
      resolve(this);
    });
  },
  refresh(row){
    const deadline = {
      'done': 'Gereed',
      'overdate': 'Te laat',
      'today': 'Vandaag',
      'tomorrow': 'Morgen',
      'thisweek': 'Deze week',
      'nextweek': 'Volgende week',
      'afternextweek': 'Later',
      '': 'Geen'
    };
    this.filterfields = this.filterfields || {
    };
    this.filterfields.Deadline = deadline[this.flagState()];
    this.filterfields.Bijlagen = this.hasAttach ? 'Ja' : 'Nee';
    this.filterfields.Status = this.state;
    this.filterfields.Schema = this.schema;
    if (this.elLvLi) this.elLvLi.rewrite();
    if (this.createTreenode) this.createTreenode();
  },
  refreshAttribute(attributeName){
  },
  refreshAttributes(){
    var s = new Date();
    var attributes = {
      Title: { displayvalue: this.Title }, Subject: { displayvalue: this.Subject }, Summary: { displayvalue: this.Summary }, ModifiedDT: { displayvalue: this.modifiedDT = new Date().toISOString() }
    };
    if (this.data)
    for (var attributeName in this.data)
    if (!attributes[attributeName]) attributes[attributeName] = {
      value: this.data[attributeName].value, displayvalue: this.properties[attributeName].displayvalue
    };
    //this.ModifiedDT = (this.data.ModifiedDT = this.data.ModifiedDT || {}).value =
    //this.modifiedDT = attributes.ModifiedDT = new Date().toISOString();
    for (var i = 0, e, c = document.getElementsByClassName(this.id) ; e = c[i]; i++){
      //$.Alert.appendAlert({ id: 1, condition: 1, Title: 'TEMP HOOG', created: new Date().toISOString(), categorie: 'Alert', ack: 0 });
      //if (row.attr) for (var name in row.attr) if (row.attr[name]) e.setAttribute(name, row.attr[name]); else e.removeAttribute(name);
      for (var attributeName in attributes){
        //if (attributeName == 'ModifiedDT') // console.debug(attributeName, attributes[attributeName]);
        var displayvalue = attributes[attributeName].displayvalue, value = attributes[attributeName].value;//typeof attributes[attributeName] == 'object' ? attributes[attributeName].value : attributes[attributeName];
        //if (attributeName=='Value') // console.debug('hhhhhh', attributeName, displayvalue);
        displayvalue = String(displayvalue).split('-').length == 3 && String(displayvalue).split(':').length == 3 && new Date(displayvalue) !== "Invalid Date" && !isNaN(new Date(displayvalue)) ? new Date(displayvalue).toISOString().substr(0, 19).replace(/T/, ' ') : displayvalue;
        displayvalue = (isNaN(displayvalue) ? displayvalue : Math.round(displayvalue * 100) / 100);
        //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, e.getAttribute(attributeName), val);
        if (e.hasAttribute(attributeName) && e.getAttribute(attributeName) != value){
          e.setAttribute(attributeName, value);
          e.setAttribute('modified', new Date().toLocaleString());
        }
        for (var i1 = 0, e1, c1 = e.getElementsByClassName(attributeName) ; e1 = c1[i1]; i1++){
          if (e1.hasAttribute('checked')){
            if (value) e1.setAttribute('checked', ''); else e1.removeAttribute('checked');
            e1.setAttribute('modified', new Date().toLocaleString());
          }
          else if ("value" in e1){
            if (e1.value != value){
              e1.value = value;
              e1.setAttribute('modified', new Date().toLocaleString());
            }
          }
          else if (e1.hasAttribute('value')){
            if (e1.getAttribute('value') != value){
              e1.setAttribute('value', value);
              e1.setAttribute('modified', new Date().toLocaleString());
            }
          }
          else if (['SPAN', 'DIV', 'TD'].indexOf(e1.tagName) != -1){
            //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, e.getAttribute(attributeName), val);
            //MKAN DIsplay value of value, probleem DMS
            e1.innerHTML = displayvalue != undefined ? displayvalue : "";
            e1.setAttribute('modified', new Date().toLocaleString());
          }
        }
      }
    }
  },
  remove(){
    console.warn('remove', this);
    if (this.parent){
      if (this.parent.items){
        this.parent.items.splice(this.parent.items.indexOf(this), 1);
        this.elemTreeLi.elem.remove();
        if (this.parent) {
          this.parent.reindex();
        }
        // $.delay(this.parent.reindex);
      }
    }
    Object.entries(this).filter(elem => elem instanceof Element).forEach(elem => elem.remove());
  },
  rewriteElements(){
    [...document.getElementsByClassName(this.tag)].forEach(element => element.rewrite ? element.rewrite() : null);
  },
  get replyTo(){
    return this.data.replyTo || 0;
  },
  get schemaColor() {
    return (this.data||{}).color || (this.schema||{}).color || '';
  },
  set(values, onload){
    api.request({
      put: { value: [{ schema: this.schema, id: this.detailID || this.id, values: values }] },
      item: this
    }, onload || function (){
      // console.debug('SET DONE', this.src, this.put, this.data);
      //if (this.item.id == get.id) this.item.reload();
    });
    this.refresh();
    this.show();
  },
  setAttribute(selector, context){
    if (window.document && this.elems) {
      this.elems.forEach( elem => elem.attr(selector, context))
      // Object.entries(this).filter(entry => entry[1] instanceof Element).forEach(entry => context === undefined ? entry[1].removeAttribute(selector) : entry[1].setAttribute(selector, context))
    }
  },
  get sender(){
    return this.data.sender || 0;
  },
  get sentDateTime(){
    return this.data.sentDateTime || 0;
  },
  get state(){
    const data = this.data.State || '';
    return data.Value || data;
  },
  get _stateColor(){
    return (((((this.schema || {}).properties || {}).State || {}).options || {})[((this.data || {}).State || {}).Value] || {}).color;
  },
  get stateColor(){
    return this.properties && this.properties.State && this.properties.State.options && this.properties.State.options[this.State] ? this.properties.State.options[this.State].color : 'inherited';
  },
  get scope(){
    // let isFavorite = 'Fav' in this ? Number(this.Fav) : private.fav.includes(this.tag);
    // console.debug('isFavorite', isFavorite);
    let userId = Number(this.UserID);
    if (!userId) return 'public';
    if (userId && userId == $.auth.access.sub) return 'private';
    return 'read';
  },
  set scope(value){
    /// console.debug(value);
    const values = {
      private: () => this.UserID = $.auth.access.sub,
      public: () => this.UserID = 0,
    }[value]();
    this.rewriteElements();
    // values[value]();
    // let id = this.tag;
    // private.fav.splice(private.fav.indexOf(id), 1);
    // if (value){
    // 	private.fav.unshift(this.tag);
    // }
    // console.debug('SET FAV', private.fav, this.tag, this.id, value, $.auth.access.sub);
    // this.Fav = { UserID: $.auth.access.sub, Value: value };
    // this.rewriteElements();
  },
  get source(){
    return this.data && this.data.Src ? $([].concat(this.data.Src).shift()) : null;
  },
  get sourceName() {
    // console.debug(this.data.Source);
    return this.data && this.data.Src
    ? [].concat(this.data.Src)
    .filter(v=>v['@id'])
    .map(v=>v['@id'].match(/(\w+)\(\d+\)/)[1])
    .shift()
    : null;
    // return this.data.schemaPath ? this.data.schemaPath.split('/')[1] : '';
  },
  schema: {
    properties: {}
  },
  get toRecipients(){
    return this.data.toRecipients || 0;
  },
  get tooltipText(){
    return;
    var s = '';
    var fnames = 'keyname, name, fullName, tag, fullTag'.split(', ');
    for (var i = 0, name; name = fnames[i]; i++) if (this[name]) s += name + ':' + this.getAttribute(name) + "\r\n";
    return s;
  },
  get typicalIdx(){
    if (!this.master) return null;
    var index = 0;
    for (var i = 0, item; item = this.master.Children[i]; i++){
      if ('selected' in item && item.selected == 0) continue;
      if (item.srcID == this.srcID) index++;
      if (item == this) return index;
    }
  },
  get type(){
    if (this.data){
      const parent = this.parent;
      const sourceID = this.data.Src ? Number([].concat(this.data.Src).shift().LinkID) : null;
      if (sourceID) {
        const masterID = this.parent ? this.parent.ID : null;
        if (this.getValue('InheritedID')) {
          return 'inherit';
        } else if (![...$().schemas().values()].some(schema => schema.ID == sourceID)) {
          // console.debug(sourceID, [...$().schemas().values()].some(schema => schema.ID == sourceID));
          return 'copy';
        }
      }
    }
    return 'nodata';
  },
  get viewstate(){
    return $.his.items[this.data.ID] ? 'read' : 'new';
  },
  emit: $.prototype.emit,
  forEach: $.prototype.forEach,
  on: $.prototype.on,
  async appendItem (previousItem, item, sourceItem, noedit) {
    // const itemIndex = previousItem ? this.children.indexOf(previousItem) + 1 : (this.children ? this.children.length : 0);
     // ? this.children.indexOf(previousItem) + 1 : (this.children ? this.children.length : 0);
    // Update all indexes of childs after inserted item
    item.Master = { LinkID: this.ID };
    if (sourceItem) {
      item.schema = sourceItem.schema;
      item.userID = 0;
      item.srcID = sourceItem.ID;
    };
    // let e = await aimClient.api(`/${item.schemaName}`).input(item).post();
    // TODO: 1 aanroep naar api
    const newItem = await aimClient.api(`/${e.body.tag}`).select('*').get();
    newItem.selectall = true;
    const index = previousItem ? previousItem.index + 1 : this.children.length;
    // TODO: index meenemen in aanroep => een api call, => na aanroep wel sorteren.
    //console.log(index, previousItem);
    await newItem.movetoidx(this, index);
    return newItem;
    // await this.open();
  },
  _catElement() {
    if (this.Categories && this.Categories.options) {
      let categories = String(this.Categories);
      categories = 'draft,concept';
      let catElement = $.createElement('DIV', 'cat');
      var cats = categories.split(',');
      cats.forEach((cat)=>{
        // //console.log(cat, this.Categories.options[cat].color);
        catElement.createElement('SPAN').style.backgroundColor = this.Categories.options[cat].color;
      });
      return catElement;
    }
  },
  copytoidx(master, index) {
    //console.debug('COPY TO', master, index);
    master.appendChild(null, { srcID: this.detailID || this.id });
    this.master.reindex();
  },
  _createPriceElement(parentElement) {
    // this.CatalogPrice = 0;
    // this.SalesDiscount = 3;
    // this.AccountDiscount = 4;
    let catalogPrice = this.catalogPrice = Number(this.CatalogPrice || 0);
    if (!catalogPrice) {
      return;
    }
    let salesDiscount = Number(this.SalesDiscount);
    let accountDiscount = Number(this.AccountDiscount);
    let discount = accountDiscount || salesDiscount;
    let price = this.price = discount ? catalogPrice * (100 - discount) / 100 : catalogPrice;
    let customer = $.shop.customer, item = this;
    let product = customer && customer.Product && customer.Product.find
    ? customer.Product.find(function(row){
      return row == item;
    })
    : null;
    // writeprice: function(el, index) {
    // //console.log('CatalogPrice', this.CatalogPrice);
    // //console.log('SalesDiscount', this.SalesDiscount);
    // //console.log('AccountDiscount', this.AccountDiscount);
    if (accountDiscount) {
      parentElement.createElement('DIV', 'tagAccountDiscount', __('Account discount'));
    }
    if (discount) {
      parentElement.createElement('DIV', 'tagSalesDiscount', -discount.toFixed(1));
    }
    return parentElement.createElement('DIV', 'pricerow col', [
      ['DIV', 'aco', [
        discount ? ['SPAN', 'currency strikeThrough', catalogPrice.toFixed(2)] : null,
        ['SPAN', 'currency price', price.toFixed(2)],
      ]],
      ['DIV', 'shopbag', [
        ['INPUT', 'addbag', {type:'number', value:this.amount = product ? product.Data : '', onchange: (e)=>{
          return // //console.log(this.tag, e.target.value);
          $.shop.add(this.row, e.target.value);
        }}],
        ['BUTTON', 'abtn icn bagAdd', {type:'button', tabindex: -1, onclick: (e)=>{
          e.stopPropagation();
          e.preventDefault();
          return // //console.log(this.tag);
          $.shop.add(
            this.id,
            $.shop.data && $.shop.data[this.id]
            ? Number($.shop.data[this.id].quant) + 1
            : 1
          );
        }}],
      ]],
      ['DIV', this.Stock ? 'delivery onstock' : 'delivery notonstock', __('notonstock', this.Stock) ],
    ]);
  },
  fieldDefault() {
    for (var attributeName in this.properties) { if (this.properties[attributeName].default) break; }
    if (!attributeName) for (var attributeName in this.properties) { if (this.properties[attributeName].kop === 0) break; }
    return this.properties[attributeName];
  },
  init() {},
  model2d(e) {
    //console.debug('MODEL 2d', this.id, this.ID, this.tag, this, this.item);
    //get:{masterID: this.id} ?
    new $.HttpRequest($.config.$, 'GET', `/item(${this.id})/model2d`, e => {
      self.innerText = '';
      self.createElement('DIV', 'row top btnbar np', { operations: {
        filter: { Title: 'Lijst filteren', onclick: function(e) { $.show({ flt: get.flt ^= 1 }); } },
      } });
      function ondrop (e) {
        //console.debug(e, this, e.clientX, e.clientY);
        e.stopPropagation();
        var childItem = $.dragdata.item;
        with (this.newTag = this.createElement('DIV', { Title: childItem.Title, className: 'symbol icn ' + childItem.schema + " " + childItem.typical + " " + (childItem.name || childItem.Title) + " " + childItem.id, item: childItem, id: childItem.id, value: 1 })) {
          style.top = (e.offsetY - 25) + 'px';
          style.left = (e.offsetX - 25) + 'px';
        }
        var children = [];
        new $.HttpRequest($.config.$, 'POST', `/item(${this.id})/model2d`, {
          masterID: this.id,
          childID: childItem.id,
          offsetTop: this.newTag.offsetTop,
          offsetLeft: this.newTag.offsetLeft,
        });
        return false;
      };
      this.elContent = self.createElement('DIV', 'row aco model2d', { id: this.get.masterID, ondrop: ondrop });
      this.data.forEach(row => {
        var childItem = $.getItem(row.id);
        let el = this.elContent.createElement('DIV', { Title: row.Title, className: 'symbol icn ' + row.schema + " " + row.typical + " " + (childItem.name || childItem.Title) + " " + row.id, id: row.id, value: childItem.Value, onclick: Element.onclick, set: { schema: row.schema, id: row.id } });
        el.style.top = (row.offsetTop) + 'px';
        el.style.left = (row.offsetLeft) + 'px';
      });
    }).send();
  },
  networkdiagram(e) {
    new $.HttpRequest($.config.$, 'GET', `/item(${this.item.id})/network`, e => {
      //console.debug(this.src, this.data);
      new $.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
      //if (!$.graph.init()) return;
      //$.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
    }).send();
  },
  post(postfields) {
    setItems([{ id: this.id, schema: this.schema, values: postfields }], true);
  },
  popout(left = 0,top = 0,width = 600,height = 600) {
    const item = this;
    var url = document.location.origin;
    var url = 'about:blank';
    if (item.popoutWindow) {
      return item.popoutWindow.focus();
    }
    const win = item.popoutWindow = window.open(url, item.tag, `top=${top},left=${left},width=${width},height=${height}`);
    // //console.log(window.innerHeight,window.outerHeight,window.outerHeight-window.innerHeight,window.screen,this.elem.getBoundingClientRect());
    window.addEventListener('beforeunload', e => win.close());
    const doc = win.document;
    //console.log(pageHtml);
    doc.open();
    doc.write(pageHtml);
    doc.close();
    win.onload = function (e) {
      const $ = this.$;
      $(this.document.documentElement).class('app');
      $(this.document.body).class('col $ om bg').id('body').append(
        $('section').class('row aco main').append(
          $('section').class('col aco apv printcol').id('view'),
        ),
      );
      console.log(item);
      $('view').show(item);
      win.addEventListener('beforeunload', e => item.popoutWindow = null);
    }
    // win.$.on('load', e => {
    //   win.elem = win.$(doc.body)
    //   win.elem.append(
    //     $('div').text('JAsfdssdfgs')
    //   )
    // })
    //popout: { schema: this.schema, id: this.id, uid: this.uid, onclick: $.windows.open },
    //
    // dragItems.forEach(item => window.open(
    //   document.location.href.split('/id').shift()+'/id/'+ btoa(item['@id']),
    //   '_blank',
    //   'width=640, height=480, left=' + (e.screenX || 0) + ', top=' + (e.screenY || 0)
    // ));
  },
  selectitem(e) {
    if (e) {
      ////console.debug('selectitem stopPropagation');
      e.stopPropagation();
      return this.item.selectitem();
    }
    this.selectitemset(this.elemTreeLi.getAttribute('sel') ^ 1);
  },
  selectitemcheckchildren(value) {
    if (isnull(this.selected, false) !== false) {
      this.selectcnt = 0;
      for (var i = 0, e; e = this.items[i]; i++) if (e.selected) this.selectcnt += 1;
      if (this.selectcnt) this.selectitemset(1);
      else this.selectitemset(0);
      if (this.parent && this.parent.selectitemcheckchildren) this.parent.selectitemcheckchildren();
    }
  },
  selectitemset(value) {
    if (this.groupname) {
      var c = this.elemTreeLi.parentElement.children;
      for (var i = 0, e; e = c[i]; i++) if (e.item.groupname == this.groupname && e.item.selected) {
        e.setAttribute('sel', 0);
        e.item.selected = 0;
        e.item.set({ selected: e.item.selected });
        e.item.close();
      }
    }
    var a = [];
    var ia = [];
    e = this.elemTreeLi;
    if (value) {
      while (e.item) {
        a.push(e);
        e = e.parentElement.parentElement;
      }
    }
    else
    a.push(e);
    var c = this.elemTreeLi.getElementsByTagName('LI');
    for (var i = 0, e; e = c[i]; i++) a.push(e);
    for (var i = 0, e; e = a[i]; i++) {
      e.item.selected = value;
      e.setAttribute('sel', value);
    }
    this.set({ selected: value });
  },
  setClass(className, unique) {
    this.elements.forEach(elem => elem.className = elem.className.split(' ').concat(className).filter((value, index, self) => self.indexOf(value) === index).join(' '));
  },
  setChecked(checked) {
    this.checked = checked;
    // 	if (!item.elemTreeLi.getAttribute('checked')) {
    // 		item.elemTreeLi.removeAttribute('checked');
    // 	}
    let elements = [this.elemListLi,this.elemTreeLi];
    if (this.checked) {
      $.clipboard.push(this);
      elements.forEach((elem)=>{
        if (elem) {
          elem.setAttribute('checked', '');
        }
      });
    } else {
      $.clipboard.remove(this);
      elements.forEach((elem)=>{
        if (elem) {
          elem.removeAttribute('checked');
        }
      });
    }
  },
  setFocus() {
    // if ($.focusItem) {
    //
    // }
    // $.focusItem = this;
    // this.checked = checked;
    // // 	if (!item.elemTreeLi.getAttribute('checked')) {
    // // 		item.elemTreeLi.removeAttribute('checked');
    // // 	}
    // let elements = [this.elemListLi,this.elemTreeLi];
    // if (this.checked) {
    // 	$.clipboard.push(this);
    // 	elements.forEach((elem)=>{
    // 		if (elem) {
    // 			elem.setAttribute('checked', '');
    // 		}
    // 	});
    // } else {
    // 	$.clipboard.remove(this);
    // 	elements.forEach((elem)=>{
    // 		if (elem) {
    // 			elem.removeAttribute('checked');
    // 		}
    // 	});
    // }
  },
  submit(e) {
    if (e) e.preventDefault();
    this.remove();
    return;
    //// //console.debug('SUBMIT', this, this.elUsers.innerText, this.oldusers);
    var item = { id: this.id };
    //// //console.debug(this.oldusers, this.elUsers.innerText);
    if (this.elUsers && this.oldusers != this.elUsers.innerText) {
      var users = (this.link = this.link || {}).users = [];
      item.userlist = {};
      for (var i = 0, e, c = this.elUsers.getElementsByTagName('A') ; e = c[i]; i++) if (e.id) users.push(item.userlist[e.innerText] = e.id);// || e.getAttribute('itemID') || '';
    }
    // //console.debug('SUBMIT ITEM', item);
    $.ws.request({
      to: [ { sub: $.auth.sub } ],
      showNotification: [this.Title, {
        // title: 'Come',
        tag: this.ID,
        body: 'Modified', //this.Subject,
        click_action: document.location.href,
        data: { click_action: document.location.href },
        actions: [ {action: "open_url", title: "Read Now"} ],
      }]
    });
    // (new $.showNotification(this.Title, {
    // 	// title: 'Come',
    // 	tag: this.ID,
    // 	body: 'Modified', //this.Subject,
    // 	click_action: document.location.href,
    // 	data: { click_action: document.location.href },
    // 	actions: [ {action: "open_url", title: "Read Now"} ],
    // })).send();
    //// //console.debug('item.submit', document.activeElement);
    this.editclose();
    setTimeout(function(item) {
      //// //console.debug(item);
      //return;
      new $.HttpRequest($.config.$, 'PATCH', `/item(${item.id})`, item, {
        query: { reindex: 1 },
      }).send();
    }, 10, item);
    // //console.log(this);
    // this.remove();
  },
  stateElementArray () {
    if (this.properties && this.properties.state && this.properties.state.options) {
      return ['DIV', 'stateicon', {
        // item: this,
        contextmenu: this.properties.state.options,
        onselect: e => {
          //console.log(e);
          let el = [...e.path].find(el => el.value);
          this.state = el.value;
        },
      }, [
        ['SPAN', 'state', {
          style: 'background-color:' + (this.state ? this.state.color : ''),
        }]
      ]]
    } else {
      return [];
    }
  },
  show(e) {
    if (e) return this.item.show();
    //if ()
    // get.id = this.id;
    if (colpage.item && colpage.item.editing) colpage.item.editclose();
    this.PageElement();
    if ($.his.err) {
      var c = $.his.err.children;
      for (var i = 0, elErrRow; elErrRow = c[i]; i++) if (elErrRow.meshitem.src.itemID == this.id) break;
      if (elErrRow) {
        elErrRow.accept = new Date();
        elErrRow.elAccept.innerText = elErrRow.accept.toISOString().substr(11, 8);
        elErrRow.refresh();
      }
    }
  },
  showinfo() {
    //this.load(function() {
    colinfo = document.getElementById('colinfo') || document.body.createElement('SECTION', 'col ainf', {id: 'colinfo'});
    colinfo.innerText = '';
    setTimeout(() => {
      colinfo.createElement([
        this.createHeaderElement(),
        ['DIV', 'row top btnbar', [
          ['A', 'abtn icn form r', ]
        ]]
      ]);
    })
    // with (colinfo.createElement('DIV', { className: 'row top btnbar' })) {
    // 	createElement('A', {
    // 		className: 'abtn icn form r', onclick: Element.onclick, par: { id: this.itemID, lid: this.itemID }, onclick: function(e) {
    // 			//console.debug('show ifo');
    // 			e.stopPropagation();
    // 			private.info.innerText = '';
    // 		}
    // 	});
    // }
    // var elDetails = createElement('DIV', { className: 'details' });
    // elDetails.createElement('DIV', { className: 'name', innerText: this.Title });
    // this.writedetails(elDetails);
    //});
  },
  get url() {
    return (this.data||{})['@id'] || '/'+this.schemaName;
  },
};

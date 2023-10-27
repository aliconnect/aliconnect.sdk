(function () {
  // localStorage.clear();
  // sessionStorage.clear();
  const {Item,Markdown,config,s2ab,Client,emit,on,forEach} = Aim;
  const {num} = Format;
  const {currentScript} = document;
  const scriptPath = new URL(currentScript.src).href.replace(/lib.*?$/,'');
  const pageHtml = `<!DOCTYPE HTML><html><head><link href="${currentScript.src.replace(/js/g,'css')}" rel="stylesheet"/><script src="${currentScript.src.replace(/web/g,'aim')}"></script><script src="${currentScript.src}"></script></head><body></body></html>`;

  function error (error) {
    const {
      code,
      status,
      statusText,
      message,
      innererror,
      href,
      url, // deprecated
      body, // deprecated
    } = error || {};
    const {trace} = innererror || {};
    console.error(error);
    const elem = $('div').parent(document.body).class('message error').append(
      $('h1').text(`${code||''} ${status||''} ${statusText||''}`),
      $('pre').text(href||url||''),
      $('pre').class('message').html(typeof message === 'object' ? JSON.stringify(message, null, 2) : message || ''),
      $('pre').html(body||'').append(
        $('ol').append(
          (trace||[]).map(({file,line}) => $('li').text(file,line)),
        )
      ),
      // $('pre').text(JSON.stringify(error, null, 2)),
      $('div').append($('button').text('Gezien').on('click', event => elem.remove())),
    )
  }

  Nav = Object.create({
    set(selector, content) {
      const url = new URL(document.location);
      if (window.history && url.searchParams.get(selector) !== content) {
        url.hash = '';
        window.history.replaceState('','',url);
        url.searchParams.set(selector, content);
        window.history.pushState('','',Web.url = url);
        // console.warn('push', url.href);
      }
    },
  });
  Aim.config({
    maps: {
      options: {
        zoom: 10,
        center: {lat: 51, lng: 6},
        styles: [
          {featureType: 'landscape', elementType: 'labels', stylers: [ {visibility: 'off'} ]},
          {featureType: 'poi', stylers: [ {visibility: 'simplified'},{saturation: -100}, {lightness: 45} ]},
        ],
      },
    },
  })
  Aim.extend({
    Item: {
      prototype: {
        get cols() {
          if (!this.properties) return [];
          // console.warn(this.properties, this);
          return Object.entries(this.properties).map(([name,prop]) => Object.assign({name}, prop));
        },
        get headers() {
          const headers = this.headercols.map(cols => cols.map(col => col.name).map(name => this[name]).filter(Boolean).join(', '));
          // console.debug(this.headercols.map(cols => cols.map(col => col.name)),headers,this.headercols);
          return headers;
        },
        get headercols() {
          if (this.headernames) return this.headernames.map(names => names.split(',').map(name => this.cols.find(col => col.name === name)));
          return [1,2,3].map(i => this.cols.filter(property => property.header === i));
          // if (this.headers) return this.headers.map(s => s.split(/ |,/).map(name => this.cols.find(property => property.name === name)));
          // else if (this.cols)
          // return [];
        },
        get className() {
          return [
            // this.schema.Name || 'Item',
            ...Array.from(this.allOf || []),
            this.name,
            this.schemaName,
            this.isSchema ? 'constructor' : '',
            // this.schema.Name === 'Item' ? 'isclass' : 'noclass',
            // this.ID,
          ].join(' ')
        },
        get _children() {
          return Aim.promise( 'Children', (resolve, reject) => {
            if (this.items) return resolve(this.items);
            const api = this.api(`/children`).filter('FinishDateTime eq NULL')
            .select(Aim.config.listAttributes).get().then(body => {
              // const children = Array.isArray(this.data.Children) ? this.data.Children : this.data.children;
              const children = body.Children || body.children;
              this.items = [].concat(children).filter(Boolean).map(Aim).unique();
              // console.warn('BODY', this.items);
              this.items.url = body['@context'];
              this.HasChildren = this.items.length>0;
              resolve(this.items);
            })
          });
        },
        get color() {
          return (this.data||{}).color || (this.schema||{}).color || '';
        },
        /** @todo bij state change color instellen voor alle elements --statecolor:red ofzo */
        // document.querySelectorAll('#'+this.id).forEach(el => el.css('--statecolor', 'red'));
        get colorState() {
          return this.properties && this.properties.State && this.properties.State.options && this.properties.State.options[this.State] ? this.properties.State.options[this.State].color : 'inherited';

          // const data = this.data.State || '';
          // return data.Value || data;
        },
        /** elem tree */
        get elemTreeNode() {

        },
        /** elem list row */
        get elemListNode() {

        },
        /** elem pagina */
        get elemPage() {

        },
        /** elem links info */
        get elemInfo() {

        },
        /** elem bij hover link */
        get elemTip() {

        },
        get flagState () {
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
        get hasAttachments () {

        },
        get hasChildren () {

        },
        get hasIcon () {
          return this.hasAttach && Aim.object.isFile(this.files[0]);
        },
        /** bepaal of item is class voor tonen indicatie in gui */
        get isClass () {

        },
        /** bepaal of item is inherited voor tonen indicatie in gui */
        get isInherited () {

        },
        /** bepaal of item is gewijzigd voor tonen indicatie in gui */
        get isModified () {
          return !this.LastModifiedDateTime ? '' : (!this.LastVisitDateTime ? 'new' : (new Date(this.LastModifiedDateTime).valueOf() > new Date(this.LastVisitDateTime).valueOf() ? 'modified' : ''));
        },
        get parent () {
          if (this.elemTreeLi && this.elemTreeLi.el.parentElement) {
            return this.elemTreeLi.el.parentElement.item;
          }
          return this.data.Master ? Aim([].concat(this.data.Master).shift()) : null
          // return this.elemTreeLi && this.elemTreeLi.el.parentElement ? this.elemTreeLi.el.parentElement.item : null;
        },
        // get properties () {
        //   return this.schema.properties;
        // },
        get scope () {
          // let isFavorite = 'Fav' in this ? Number(this.Fav) : private.fav.includes(this.tag);
          let userId = Number(this.UserID);
          if (!userId) return 'public';
          if (userId && userId == Aim.auth.access.sub) return 'private';
          return 'read';
        },
        set scope (value) {
          const values = {
            private: () => this.UserID = Aim.auth.access.sub,
            public: () => this.UserID = 0,
          }[value]();
          this.rewriteElements();
          // values[value]();
          // let id = this.tag;
          // private.fav.splice(private.fav.indexOf(id), 1);
          // if (value){
          // 	private.fav.unshift(this.tag);
          // }
          // this.Fav = { UserID: Aim.auth.access.sub, Value: value };
          // this.rewriteElements();
        },
        /** toevoegen child node */
        append(item, index) {
          return Aim.promise( 'Append', async resolve => {
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
              console.debug('MASTER',this.data.ID,item.data.Master.LinkID);
              children.forEach((item,i) => item.index !== i ? item.index = i : i);
              setTimeout(() => resolve(item));
            });
          });
        },
        /** toevoegen child node, versie 2? */
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
          // let event = await aimClient.api(`/${item.schemaName}`).input(item).post();
          // TODO: 1 aanroep naar api
          const newItem = await aimClient.api(`/${event.body.tag}`).select('*').get();
          newItem.selectall = true;
          const index = previousItem ? previousItem.index + 1 : this.children.length;
          // TODO: index meenemen in aanroep => een api call, => na aanroep wel sorteren.
          await newItem.movetoidx(this, index);
          return newItem;
          // await this.open();
        },
        /** aanpassen item attribute, update database, webSocket message, bijwerken scherm, enz */
        attr(attributeName, value, postdata) {
          return Aim.promise( 'Attribute', async resolve => {
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
                if (Aim.his.map.has(selector)) return Aim.his.map.get(selector);
              }
              if (value.target) {
                value.LinkID = getItem(value.target).ID;
              }
              if (value.current) {
                const current = getItem(value.current);
                data = data.find(attr => attr.attributeName === attributeName && attr.LinkID === current.ID) || null;
              } else if (value.AttributeID) {
                data = data.find(data => data.AttributeID === value.AttributeID)
              } else if (value.type !== 'append') {
                data = data.shift();
              }
              // if (value === data){
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
                const to = Aim.his.map.get(value.LinkID);
                // const name = attributeName || 'link';
                const action = value.action || 'move';
                if (attributeName === 'Master') {
                  if (action === 'move') {
                    const current = item.elemTreeLi.el.parentElement.item;
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
              }
              if (Aim.threeObjects && Aim.threeObjects[item.tag] && Aim.threeObjects[item.tag].obj.onchange){
                Aim.threeObjects[item.tag].obj.onchange(attributeName, value.Value);
              }
              item['@id'] = item['@id'] || item.tag;
              Object.assign(data, value);
              if (item.elems) {
                item.elems.forEach(elem => {
                  var displayvalue = newvalue = typeof value === 'object' ? value.Value : value;
                  // var displayvalue = property.displayvalue || displayvalue;
                  const el = elem.el;
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
                  setTimeout(event => elem.emit('change'));
                  // if (el.onupdate){
                  //   setTimeout(el.onupdate);
                  // }
                })
              }
              if (!Aim.his.noPost && postdata){
                // console.error(arguments);
                // for (var callee = arguments.callee, caller = callee.caller;caller;caller = caller.caller){
                // 	console.debug(caller);
                // }
                // return;
                const itemModified = Aim.his.itemsModified[item['@id']] = Aim.his.itemsModified[item['@id']] || {
                  ID: item.data.ID ? item.data.ID.Value || item.data.ID : null,
                  method: 'patch',
                  path: '/' + item.tag,
                  body: {
                    // ID: item.data.ID,
                  },
                  // res: (event) => {
                  // 	// console.debug('DONE', item.tag, event.request );
                  // }
                };
                // //console.debug(itemModified);
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
                let values = Object.values(Aim.his.itemsModified);
                if (values.length){
                  clearTimeout(Aim.his.itemsModifiedTimeout);
                  Aim.his.itemsModifiedResolve = Aim.his.itemsModifiedResolve || [];
                  Aim.his.itemsModifiedResolve.push([resolve, item]);
                  Aim.his.itemsModifiedTimeout = setTimeout(() => {
                    Aim.his.itemsModified = {};
                    const param = { requests: values };
                    // console.debug('saveRequests', param.requests);
                    if (Aim.config && Aim.config.dbs) {
                      Aim.saveRequests(param.requests);
                    } else if (this.schema.table) {
                    } else {
                      Aim().send({
                        to: { aud: Aim.aud, sub: Aim.aud },
                        body: param,
                        itemsModified: true,
                      });
                      // DEBUG: MKAN STAAT UIT IVM SCHIPHOL
                      Aim().send({body: param});
                    }
                    Aim.handleData({body: { requests: values }});
                    Aim.his.itemsModifiedResolve.forEach(([resolve, item]) => resolve(item));
                    Aim.his.itemsModifiedResolve = [];
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
                if (value.Value && value.Value.match(/T\d+:\d+Aim/)){
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
              // Aim().emit("attributeChange", { item: this, [attributeName]: modvalues });
              // return ref.itemsModified;
            } catch (err) {
              console.error(err);
            }
          });
        },
        // constructor (options) {
        //   this.assign(options);
        //   Item.items.set(this.id, this);
        //   const {schemaName} = this.data;
        //   const schema = this.schema = config.definitions[schemaName];
        //   const {properties,headers} = schema;
        //   const cols = schema.cols = schema.cols || Object.entries(properties||{}).map(([name,prop]) => Object.assign({name}, prop));
        //   if (!schema.headercols) {
        //     if (headers) schema.headercols = headers.map(s => s.split(/ |,/).map(name => cols.find(property => property.name === name)));
        //     else if (cols) schema.headercols = [1,2,3].map(i => cols.filter(property => property.header === i));
        //     else schema.headercols = [];
        //   }
        //   Object.defineProperties(this,{
        //     id: {
        //       enumerable: true,
        //       get: () => this.data.id,
        //     }
        //   });
        //   Object.defineProperties(this, Object.fromEntries(cols.filter(({name}) => !this[name]).map(({name}) => [name, {
        //     enumerable: true,
        //     get: () => this.data[name],
        //     set: (value) => this.setAttribute(name,value),
        //   }])));
        // },
        getAttributeOptions (name) {
          const properties = (this.schema || {}).properties || {};
          const property = properties[attr] || {};
          const options = property.options || {};
          const value = this[name] || '';
          const option = value.split(',').map(v => options[v] || { color: '' });
          return [option, options];

        },
        getNetworkDiagram () {
          new Aim.HttpRequest(Aim.config.Aim, 'GET', `/item(${this.item.id})/network`, event => {
            //console.debug(this.src, this.data);
            new Aim.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
            //if (!Aim.graph.init()) return;
            //Aim.graph(Listview.createElement('DIV', { className: 'slidepanel col bgd oa pu', }), this.data);
          }).send();
        },
        getModel2D (event) {
          // new Aim.HttpRequest(Aim.config.Aim, 'GET', `/item(${this.id})/model2d`, event => {
          //   self.innerText = '';
          //   self.createElement('DIV', 'row top btnbar np', { operations: {
          //     filter: { Title: 'Lijst filteren', onclick: function (event) { Aim.show({ flt: get.flt ^= 1 }); } },
          //   } });
          //   function ondrop (event) {
          //     //console.debug(event, this, event.clientX, event.clientY);
          //     event.stopPropagation();
          //     var childItem = Aim.dragdata.item;
          //     with (this.newTag = this.createElement('DIV', { Title: childItem.Title, className: 'symbol icn ' + childItem.schema + " " + childItem.typical + " " + (childItem.name || childItem.Title) + " " + childItem.id, item: childItem, id: childItem.id, value: 1 })) {
          //       style.top = (event.offsetY - 25) + 'px';
          //       style.left = (event.offsetX - 25) + 'px';
          //     }
          //     var children = [];
          //     new Aim.HttpRequest(Aim.config.Aim, 'POST', `/item(${this.id})/model2d`, {
          //       masterID: this.id,
          //       childID: childItem.id,
          //       offsetTop: this.newTag.offsetTop,
          //       offsetLeft: this.newTag.offsetLeft,
          //     });
          //     return false;
          //   };
          //   this.elContent = self.createElement('DIV', 'row aco model2d', { id: this.get.masterID, ondrop: ondrop });
          //   this.data.forEach(row => {
          //     var childItem = Aim.getItem(row.id);
          //     let el = this.elContent.createElement('DIV', { Title: row.Title, className: 'symbol icn ' + row.schema + " " + row.typical + " " + (childItem.name || childItem.Title) + " " + row.id, id: row.id, value: childItem.Value, onclick: Element.onclick, set: { schema: row.schema, id: row.id } });
          //     el.style.top = (row.offsetTop) + 'px';
          //     el.style.left = (row.offsetLeft) + 'px';
          //   });
          // }).send();
        },
        moveDown () {
          return Aim.link({
            item: this,
            to: this.parent,
            name: 'Master',
            index: this.index - 1,
            action: 'move',
          });
        },
        async moveTo (parent, index, noput) {
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
        moveUp () {
          return Aim.link({
            item: this,
            to: this.parent,
            name: 'Master',
            index: this.index - 1,
            action: 'move',
          });
        },
        /** reindex tree items */
        reindex (event) {
          return Aim.promise( 'Reindex', async resolve => {
            // return;
            if (this.hasChildren){
              console.warn('reindexOOOO1');
              const children = await this.children;
              console.warn('reindexOOOO', children);
              if (this.elemTreeLi) this.elemTreeLi.emit('toggle');
              children.forEach((child, i) => {
                if (child.elemListLi && child.elemListLi.el && child.elemListLi.el.parentElement){
                  child.elemListLi.el.parentElement.appendChild(child.elemListLi.el);
                }
              });
            }
            resolve(this);
          });
        },
        /** refresh */
        refresh (row) {
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
        refreshAttributes () {
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
          for (var i = 0, event, c = document.getElementsByClassName(this.id) ; event = c[i]; i++){
            //Aim.Alert.appendAlert({ id: 1, condition: 1, Title: 'TEMP HOOG', created: new Date().toISOString(), categorie: 'Alert', ack: 0 });
            //if (row.attr) for (var name in row.attr) if (row.attr[name]) event.setAttribute(name, row.attr[name]); else event.removeAttribute(name);
            for (var attributeName in attributes){
              //if (attributeName == 'ModifiedDT') // console.debug(attributeName, attributes[attributeName]);
              var displayvalue = attributes[attributeName].displayvalue, value = attributes[attributeName].value;//typeof attributes[attributeName] == 'object' ? attributes[attributeName].value : attributes[attributeName];
              //if (attributeName=='Value') // console.debug('hhhhhh', attributeName, displayvalue);
              displayvalue = String(displayvalue).split('-').length == 3 && String(displayvalue).split(':').length == 3 && new Date(displayvalue) !== "Invalid Date" && !isNaN(new Date(displayvalue)) ? new Date(displayvalue).toISOString().substr(0, 19).replace(/T/, ' ') : displayvalue;
              displayvalue = (isNaN(displayvalue) ? displayvalue : Math.round(displayvalue * 100) / 100);
              //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, event.getAttribute(attributeName), val);
              if (event.hasAttribute(attributeName) && event.getAttribute(attributeName) != value){
                event.setAttribute(attributeName, value);
                event.setAttribute('modified', new Date().toLocaleString());
              }
              for (var i1 = 0, e1, c1 = event.getElementsByClassName(attributeName) ; e1 = c1[i1]; i1++){
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
                  //if (attributeName == "CriticalFailure") // console.debug('REFESH', this.id, this.Title, attributeName, event.getAttribute(attributeName), val);
                  //MKAN DIsplay value of value, probleem DMS
                  e1.innerHTML = displayvalue != undefined ? displayvalue : "";
                  e1.setAttribute('modified', new Date().toLocaleString());
                }
              }
            }
          }
        },
        /** veranderen classs van item */
        setClass (className, unique) {
          this.elements.forEach(elem => elem.className = elem.className.split(' ').concat(className).filter((value, index, self) => self.indexOf(value) === index).join(' '));
        },
        setChecked (checked) {
          this.checked = checked;
          // 	if (!item.elemTreeLi.getAttribute('checked')) {
          // 		item.elemTreeLi.removeAttribute('checked');
          // 	}
          let elements = [this.elemListLi,this.elemTreeLi];
          if (this.checked) {
            Aim.clipboard.push(this);
            elements.forEach((elem)=>{
              if (elem) {
                elem.setAttribute('checked', '');
              }
            });
          } else {
            Aim.clipboard.remove(this);
            elements.forEach((elem)=>{
              if (elem) {
                elem.removeAttribute('checked');
              }
            });
          }
        },
        /** het aan/uit zetten cvan een select optie voor meenemen in overzichten enz, was selectitemset */
        setSelect () {
          if (this.groupname) {
            var c = this.elemTreeLi.parentElement.children;
            for (var i = 0, event; event = c[i]; i++) if (event.item.groupname == this.groupname && event.item.selected) {
              event.setAttribute('sel', 0);
              event.item.selected = 0;
              event.item.set({ selected: event.item.selected });
              event.item.close();
            }
          }
          var a = [];
          var ia = [];
          event = this.elemTreeLi;
          if (value) {
            while (event.item) {
              a.push(event);
              event = event.parentElement.parentElement;
            }
          }
          else
          a.push(event);
          var c = this.elemTreeLi.getElementsByTagName('LI');
          for (var i = 0, event; event = c[i]; i++) a.push(event);
          for (var i = 0, event; event = a[i]; i++) {
            event.item.selected = value;
            event.setAttribute('sel', value);
          }
          this.set({ selected: value });
        },

        on,
        forEach,
        emit,

        get _statusElem(){
          if ('status' in this) {
            const {options} = this.properties.status;
            const option = options.find(option => option.value == this.status) || {};
            return $('div').class('status').contextmenu(this.statusMenu).style(`--color: ${option.color}`);
          }
        },
        get _flagMenu() {
          return {
            vandaag: { title: 'Vandaag', className: 'flag', flag: 'today', onclick(event) {
              this.FinishDateTime = '';
              this.EndDateTime = new Date().toISOString().substr(0, 10) + 'T17:00:00';
              // this.item.set({ FinishDateTime: '', EndDateTime: aDate().toISOString().substr(0, 10) });
            }},
            morgen: { title: 'Morgen', className: 'flag', flag: 'tomorrow', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + (0 < today.getDay() < 5 ? 1 : 3));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            }},
            dezeweek: { title: 'Deze week', className: 'flag', flag: 'thisweek', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + (5 - today.getDay()));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            }},
            volgendeWeek: { title: 'Volgende week', className: 'flag', flag: 'nextweek', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + 7 + (5 - today.getDay()));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            }},
            over2weken: { title: 'Over 2 weken', className: 'flag', flag: '2weeks', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + 14 + (5 - today.getDay()));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            } },
            over3weken: { title: 'Over 3 weken', className: 'flag', flag: '3weeks', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + 21 + (5 - today.getDay()));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            } },
            over4weken: { title: 'Over 4 weken', className: 'flag', flag: '4weeks', onclick: event => {
              const today = new Date();
              const endDate = new Date();
              endDate.setDate(today.getDate() + 28 + (5 - today.getDay()));
              this.FinishDateTime = '';
              this.EndDateTime = endDate.toISOString().substr(0, 10) + 'T17:00:00';
            } },
            none: { title: 'Geen', className: 'flag', flag: '', onclick: event => {
              this.EndDateTime = '';
            } },
            gereed: { title: 'Gereed', className: 'flag', flag: 'done', onclick: event => {
              const today = new Date();
              this.FinishDateTime = today.toISOString().substr(0, 19);
            } },
          }
        },
        get flagMenu(){
          if ('endDateTime' in this) {
            // function onclick(event) {
            //   console.debug(111, event, this);
            // }
            const set = (start,days,finish) => {
              this.startDateTime = start.toLocaleDateString();
              this.endDateTime = start.addDays(days).toLocaleDateString();
              this.finishedDateTime = null;
              this.refresh();
            }
            return {
              icn:'flag',
              caption: 'Opvolgen',
              items:[
                {icn:'flag', caption: 'Vandaag', onclick: () => set(new Date(),0,null)},
                {icn:'flag', caption: 'Morgen', onclick: () => set(new Date().addDays(1),0,null)},
                {icn:'flag', caption: 'Deze week', onclick: () => set(new Date().addDays(5 - new Date().getDay()),0,null)},
                {icn:'flag', caption: 'Volgende week', onclick: () => set(new Date().addDays(8 - new Date().getDay()),4,null)},
                this.startDateTime ? {icn: 'flag_off', caption: 'Vlag wissen', onclick: () => this.refresh(this.startDateTime = this.endDateTime = null)} : undefined,
                this.finishedDateTime
                ? {icn:'circle_multiple_subtract_checkmark', caption: 'Wissen voltooid', onclick: () => this.refresh(this.finishedDateTime = null)}
                : {icn:'checkmark', caption: 'Markeren als voltooid', onclick: () => this.refresh(this.finishedDateTime = new Date().toLocaleString())},
                // {caption: 'Aangepast...', onclick },
                // null,
                // {caption: 'Herinnering toevoegen...', onclick },
              ]
            }
          }
        },
        get flagElem() {
          if ('endDateTime' in this) {
            const {endDateTime,startDateTime,finishedDateTime} = this;
            var icn = 'flag';
            // var color = 'red';
            if (finishedDateTime) {
              icn = 'checkmark';
              // color = 'lawngreen';
            } else if (endDateTime) {
              icn = 'flag_filled';
            }
            return $('div').class(`icn-${icn}`).attr({endDateTime,startDateTime,finishedDateTime}).contextmenu(this.flagMenu)
            // if (endDateTime || startDateTime || finishedDateTime) {
            // }
          }
        },
        get favElem() {
          if ('fav' in this) {
            return $('div').class('icn-star').on('click', event => {
            })
          }
        },
        get pinElem() {
          if ('pin' in this) {
            return $('div').class('icn-pin').on('click', event => {
            })
          }
        },
        get attachElem() {
          if ('attach' in this) {
            if (this.attach) {
              return $('div').class('icn-attach').on('click', event => {
              })
            }
          }
        },
        get categoriesMenu() {
          // console.warn('categoriesMenu', this);
          if ('categories' in this) {
            const options = this.properties.categories.options || [];
            let categories = JSON.parseDefault(this.categories,[]);
            // console.debug(categories);
            const items = options.map(option => option = Object.assign({
              checked: option.checked = categories.includes(option.value),
              icn: option.checked ? 'tag_filled' : 'tag',
              onclick: () => {
                option.checked ^= 1;
                this.categories = JSON.stringify(items.filter(option => option && option.checked).map(option => option.value));
                this.refresh();
              },
            }, option)).concat([
              null,
              {icn:'tag_dismiss', caption: 'Alle categorieën wissen', _hotkey: 'CtrlB', onclick: () => {
                this.categories = '';
                this.refresh();
              }},
            ]);
            return {
              icn: 'tag_multiple',
              caption: 'Categoriseren',
              items,
            }
          }
        },
        get categoriesElem() {
          if ('categories' in this) {
            let categories = JSON.parseDefault(this.categories,[]);
            const options = this.properties.categories.options || [];
            // console.debug(categories, options, item);
            // categories = Array.isArray(categories) ? categories : (categories||'').split(',');
            // console.debug(categories);
            return $('div').class('categories').append(
              JSON.parseDefault(this.categories,[]).map(
                category => $('div').css('background', (options.find(option => option.value == category)||{}).color),
              )
            ).contextmenu(this.categoriesMenu)
          }
        },
        get statusMenu(){
          if ('status' in this) {
            return {
              caption: 'Status',
              icn: 'status',
              minWidth: 300,
              minHeight: 400,
              items: this.properties.status.options.map(option => Object.assign({
                icn: option.checked = option.value == this.status ? 'status_filled' : 'status',
                onclick: () => this.refresh(this.status = option.value),
              }, option)),
            }
          }
        },
        get elemId() {
          return 'item-'+this.id;
        },
        setHeaderElem(elem, long){
          // console.debug(elem);
          var {iconSrc,packQuant,listprice,price,vatprice,discount,stock,quant,bgColor,fgColor,color,properties,app,images,status,schemaName,id,data,schema,headers,endDate,startDate,finishedDate,fav,lastModifiedDateTime,createdDateTime} = this;
          // console.debug(this,headers);


          let [icon] = images||[];
          const dateTime = lastModifiedDateTime || createdDateTime;

          if ('status' in this) {
            console.debug(this);
            const {options} = this.properties.status||{};
            const option = (options||[]).find(option => option.value == this.status) || {};
            var {bgColor,fgColor} = option;
          }


          if (listprice) {
            listprice = listprice * (packQuant || 1);
            discount = discount || 0;
            price = listprice * (100 - discount) / 100;
            vatprice = price * 1.21;
          }
          // function priceElem(item) {
          //   var {listprice,discount,stock,quant} = item;
          //   // discount = discount || 0;
          //   // const price = listprice * (100 - discount) / 100;
          //   // const vatprice = price * 1.21;
          //   const inputElem = $('input').name('aantal').type('number').min(0).value(quant).on('keyup', (event) => item.quant = event.target.value);
          //   return $('div').class('price').append(
          //     // !row.iconUrl ? null : $('img').src(row.iconUrl).style('max-width:80px;max-height:80px;').on('click', toonImage),
          //     // $('div').append(
          //     //   discount ? $('span').attr('listprice', num(listprice)).attr('discount', discount) : null,
          //     //   $('span').attr('price', num(price)),
          //     // ),
          //     // $('div').attr('vatprice', num(vatprice)),
          //     'quant' in item ? $('div').class('quant').append(
          //       $('button').type('button').text('-').value(-1).on('click', event => {
          //         event.stopPropagation();
          //         item.quant = inputElem.el.value = Math.max(0,Number(inputElem.el.value) - 1,0);
          //       }),
          //       // $('input').name('aantal').type('number').min(0).value(quant).on('keyup', (event) => $(event.target.form).emit('submit')),
          //       inputElem,
          //       $('button').type('button').text('+').value(1).on('click', event => {
          //         event.stopPropagation();
          //         item.quant = inputElem.el.value = Number(inputElem.el.value) + 1;
          //       }),
          //     ) : null,
          //     'stock' in item  ? $('div').attr('stock', stock) : null,
          //     // inkKorting ? $('div').attr('inkkorting', num(inkKorting,0)).attr('inknetto', num(bruto * (100 - inkKorting) / 100)) : null,
          //     // levBruto ? $('div').attr('levkorting', num(levKorting,0)).attr('levbruto', num(levBruto)) : null,
          //   )
          // }
          const delElem = () => {
            return $('div').class('icn-delete').on('click', event => {
              this.delete();
              this.deletedDateTime = new Date().toValueDateTimeString();
              console.debug(1, this.deletedDateTime, event.name);
            })
          }
          // console.debug(this);
          return $(elem).text('')
          .disabled(this.disabled)
          .style(this.style)
          // .class((schemaName||'')+row.id)
          .draggable(true)
          .on('dragstart', event => {
            event.dataTransfer.setData("application/json", JSON.stringify({schemaName,id}));
            event.dataTransfer.effectAllowed = "move";
          })
          .on('drop', (event) => this.ondrop(event))
          // .on('drop', (event) => {
          //   const {dataTransfer} = event;
          //   const {types,items,files} = dataTransfer;
          //   // console.debug('ONDROP',event);
          //   // console.debug({types,items,files});
          //   if (types.includes('application/json')) {
          //     const item = Item.get(JSON.parse(dataTransfer.getData('application/json')));
          //     console.debug(item.schemaName);
          //     if (item.schemaName === 'person') {
          //       Item.get({schemaName:'contact', personId:item.id, companyId:this.id}).post().then(item => item.select());
          //     } else if ('companyId' in item) {
          //       item.companyId = this.id;
          //     }
          //   }
          // })
          .class('item',schemaName)
          .contextmenu({
            items: [
              // {name: 'Kopieren', click: event => console.debug(event, row)},
              // {name: 'Snel afdrukken', click: event => console.debug(event, row)},
              // null,
              // {name: 'Beantwoorden', click: event => console.debug(event, row)},
              // {name: 'Allen beantwoorden', click: event => console.debug(event, row)},
              // {name: 'Doorsturen', click: event => console.debug(event, row)},
              // null,
              // {name: 'Markeren al ongelezen', click: event => console.debug(event, row)},
              this.statusMenu,
              this.categoriesMenu,
              this.flagMenu,
              null,
              {icn:'search', caption: 'Verwante items zoeken', click: event => console.debug(event, row)},
              null,
              {icn:'delete', caption: 'Verwijderen', click: event => console.debug(event, row)},
              // {caption: 'Archiveren', click: event => console.debug(event, row)},
            ],
          })

          // .attr('status', status ? status.split(/-/)[0] : null)
          .append(
            $('div').class(`icn-${this.icn || schemaName} icon`)
            .contextmenu(this.statusMenu)
            .style(`--icn-bgcolor:${bgColor||''};--icn-color:${fgColor||''};font-size:1.2em;--icn-image:url("${iconSrc||''}");`),
            // .append(
            //   // images && images[0] ? $('img').src(images[0]) : $('span').text((headers.join('').match(/([A-Z]).*?([A-Z])/)||[]).slice(1,3).join('')),
            //   long && iconSrc ? $('img').src(iconSrc) : null,
            // ),
            // this.statusElem,
            $('div').class('aco').append(
              // item.headers ? item.headers.map((s,i)=>$('h'+(i + 1)).html(wordRegExp ? s.replace(wordRegExp,'<b>$1</b>') : s)) : null,
              // schema.headers ? schema.headers.map((s,i)=>$('h'+(i + 1)).text(s.split(/ |,/).map(n => row[n]).join(' '))) : null,
              $('h1').class(`h header1`).append(
                $('span').class('nowrap').text(headers[0]),
                // $('div').class('options').append(
                this.attachElem,
                this.favElem,
                this.categoriesElem,
                this.flagElem,
                this.pinElem,
                // 'fav' in this ? favElem(this) : null,
                // 'categories' in this ? categoriesElem(this) : null,
                // 'endDateTime' in this ? flagElem(this) : null,
                // ),
                discount ? $('span').attr('listprice', num(listprice)).attr('discount', discount) : null,
                price ? $('span').attr('price', num(price)) : null,

              ),
              $('h2').class(`h header2`).append(
                $('span').class('nowrap').text(headers[1]),
                dateTime ? $('span').class('date').text(new Date(dateTime).toDisplayString(long)) : null,
                vatprice ? $('span').attr('vatprice', num(vatprice)) : null,

              ),
              $('h3').class(`h header3`).append(
                $('span').class('nowrap').text(headers[2]),
                true ? delElem(this) : null,
                'quant' in this ? $('div').class('quant').append(
                  $('button').type('button').text('-').value(-1).on('click', event => event.stopPropagation(this.quant = (this.quant||0)-1)),
                  // $('input').name('aantal').type('number').min(0).value(quant).on('keyup', (event) => $(event.target.form).emit('submit')),
                  this.quantElem = $('input').name('quant').type('number').min(0).value(quant).on('keyup', (event) => this.quant = event.target.value),
                  $('button').type('button').text('+').value(1).on('click', event => event.stopPropagation(this.quant = (this.quant||0)+1)),
                ) : null,
              ),
              'stock' in this && price ? $('div').attr('stock', stock) : null,
              // this.listprice ? priceElem(this) : null,
              (app||{}).header ? app.header(data) : null,
              data.options ? $('div').append(
                Object.entries(data.options).map(entry => [
                  $('label').text(entry[0]),
                  $('span').text(entry[1])
                ])
              ) : null,
              this.getRowButtons(),
            ),
          );

        },
        get rowElem() {
          const {id,schemaName,itemIndex} = this;
          const elem = $('div')
          .id(this.elemId)
          .style('user-select: none;')
          .attr('draggable',true)
          .on('dragover', (event) => {
            event.preventDefault();
            const {path} = event;
          })
          .on('drop', (event) => {
            event.preventDefault();
            const json = event.dataTransfer.getData('application/json');
            if (json) {
              const data = JSON.parse(json);
              console.debug(data);
            }
            //   const {dataTransfer} = event;
            //   if (dataTransfer.types.includes('Aim')) {
            //     event.preventDefault();
            //     const {client_id,aud,sub,id} = JSON.parse(dataTransfer.getData('Aim'));
            //     Aim.api('/links').post({fromId,fromClientId,toId:id,toClientId:client_id,aud,sub}).then(body => console.debug(body));
            //   }
          })
          .on('dragstart', (event) => {
            event.target.classList.add("dragging");
            event.dataTransfer.clearData();
            event.dataTransfer.setData('application/json', JSON.stringify({schemaName,id}));
            event.dataTransfer.setData('text/plain', schemaName);
            event.dataTransfer.setData('text/html', `<b>${schemaName}</b>`);
            // event.dataTransfer.setData('text/link-uri', 'https://aliconnect.nl');
            // event.dataTransfer.setData('Aim', JSON.stringify({client_id,aud,sub,id,schemaName})))
          })
          .on('dragend', (event) => {
            const {dataTransfer} = event;
            const {dropEffect} = dataTransfer;
            // return console.debug(event);
            if (dropEffect === 'none') {
              event.target.classList.remove("dragging");
              var outside = event.screenX > window.screenX + window.outerWidth || event.screenX < window.screenX || event.screenY > window.screenY + window.outerHeight || event.screenY < window.screenY;
              if (outside) {
                event.preventDefault();
                event.stopPropagation();
                this.popout(event.pageX,event.pageY);
                // event.preventDefault();
                // console.debug(this,event.dataTransfer.dropEffect, event, event.dataTransfer.getData('aim'), event.dataTransfer.getData('text/plain'));
                //
                // return dragItems.forEach(item => this.popout(event.screenX,event.screenY));
              }
            }
            // console.debug(event);
          })
          .append(this.setHeaderElem($('header')))
          .attr('focus', Aim.pageTag === (schemaName||'')+id ? '' : null);
          elem.row = this;
          return elem;
        },
        get cardElem() {
          const elem = $('div').class('pucard');
          // console.warn(1);
          // const schema = Item.getSchema(source);
          let {headercols} = this;
          const select = headercols.flat().map(r => r.name).join(',');
          // console.warn(2, select);
          // headers = headers.join(',');
          this.api().select(select).get().then(Item.get).then(item => {
            // console.debug(item,this);
            let {headers} = item;
            // console.debug(headers);
            // headers = headers.map(header => header.split(',').map(name => data[name]).join(', '));
            elem.append(
              headers.map(header => $('div').text(header))
            )
            // console.debug(serviceRoot,schemaName,value,schema,data,headers);
          });

          return elem;
        },
        refresh () {
          document.querySelectorAll(`#${this.elemId} header`).forEach((el) => this.setHeaderElem(el))
          this.get();//.then(item => this.select());
        },
        pageElem(editmode) {
          const target = Aim.pageRow = this;
          var {options} = config;
          options = options || {};
          let {schemaName,id,data,schema,headers,itemIndex,properties,hasMessages} = target;
          // console.debug(222, target);
          // hasMessages = false;
          // const {properties} = schema;
          // const {messages} = properties;
          const [title,subject,summary] = headers;
          // let {pageNav} = schema;
          // const itemIndex = Array.from(itemsMap.keys()).indexOf(row.id);
          // const tag = Aim.pageTag = row.schemaName + row.id;
          if (document.body.querySelector(`.listview .item`+itemIndex)) {
            // $(`.listview .`+Aim.pageTag).emit('focus');
          }
          const initials = (headers.join('').match(/([A-Z]).*?([A-Z])/)||[]).slice(1,3).join('');
          document.title = headers[0];
          // const selector = '.listview>:last-child';
          // const elem = document.querySelector(selector+'>.pv') ? $(selector+'>.pv').clear() : $('div').class('pv').parent(selector);
          const elem = $('div').class('pageview').parent('.pages');
          // elem.animate([
          //   { transform: 'translate(10%, 0%)' },
          //   { transform: 'translate(0%, 0%)' },
          //   // { transform: 'rotate(360deg) scale(0)' }
          // ], {
          //   duration: 200,
          //   // iterations: 1,
          // });
          // console.debug(Aim.account);
          // elem.seperator(-1);

          const {sub,name} = Aim.account.id;

          function visible(element) {
            if (element.offsetWidth === 0 || element.offsetHeight === 0) return false;
            var height = document.documentElement.clientHeight,
            rects = element.getClientRects(),
            on_top = function(r) {
              var x = (r.left + r.right)/2, y = (r.top + r.bottom)/2;
              return document.elementFromPoint(x, y) === element;
            };
            for (var i = 0, l = rects.length; i < l; i++) {
              var r = rects[i],
              in_viewport = r.top > 0 ? r.top <= height : (r.bottom > 0 && r.bottom <= height);
              if (in_viewport && on_top(r)) return true;
            }
            return false;
          }
          const Links = Object.create({
            get() {
              Aim.api(target.uri + '/links').get().then(({value}) => value.forEach(Links.add))
            },
            add(link) {
              // console.debug(link);
              const {id,schemaName,typeId,dir} = link;
              const elem = $('header').parent('.links').class('link',schemaName).on('click', event => Item({id,schemaName}).select());
              Aim.api(`/${schemaName}('${id}')`).query({$select:'companyName'}).get().then(body => {
                elem.class('icn-schema-'+schemaName).caption(schemaName[0].toUpperCase()).append(
                  // $('span').class('icn-schema-'+schemaName).caption(schemaName[0].toUpperCase()),
                  $('div').append(
                    $('div').text(body.companyName),
                  ),
                  $('button').class('icn-delete').on('click', event => {
                    event.stopPropagation();
                    Aim.api('/links').query({id}).delete().then(body => elem.remove());
                  }),
                )
              });
            }
          });
          const Attachements = Object.create({
            get() {
              Aim.api(target.href + '/attachements').get();
            },
            add(body) {
              console.debug(body);
              const {id,name,lastModifiedDate,size,type,dirname,basename,src} = body;
              const {serviceRoot} = Aim.config;
              const {origin,hostname} = new URL(serviceRoot);

              // const filename = src ? [`//share.${hostname}/assets/img`,src].join('') : 'https://aliconnect.nl/api/v1.0/dms'+`/${Aim.config.client_id}/${dirname}/${id}-${name}`;
              const filename = src ? [`//share.${hostname}/assets/img`,src].join('') : serviceRoot+'/dms'+`/${Aim.config.client_id}/${dirname}/${id}-${name}`;
              const ext = filename.split('.').pop();
              const elem = $('header');
              if (['jpg','jpeg','png','bmp','gif'].includes(ext)) {
                elem.parent('.attach>.images').append(
                  $('img').src(filename),
                );
              } else {
                elem.class('icn-ext-'+ext).parent('.attach>.docs').caption(ext[0].toUpperCase()).append(
                  // $('span').class('icn-ext-'+ext).caption(ext[0].toUpperCase()),
                  $('div').append(
                    $('a').text(name).href(filename+'?filename='+name).download(name),
                    $('div').text(Aim.num(size/1000,0)+'KB', new Date(lastModifiedDate).toLocaleDateString()),
                  ),

                );
              }
              elem.append(
                $('button').class('icn-delete').on('click', event => {
                  Aim.api('/attachements').delete().then(body => elem.remove());
                }),
              );
              return body;
            },
          });
          const Messages = Object.create({
            create(){
              if (hasMessages) {
                return [
                  target.messagesElem = $('div').class('messages'),
                  $('div').style('display:flex;flex:0 0 auto;background-color:var(--trans1);padding:5px;').append(
                    target.newMessageElem = $('textarea').class('newmessage').style('border-radius:5px;background-color:var(--bg);font:inherit;color:inherit;flex:1 0 auto;resize:none;border:none;outline:none;padding:5px;max-height:100px;height:41px;').placeholder('Typ een bericht').on('input', event => {
                      event.target.style.height = 0;
                      event.target.style.height = (event.target.scrollHeight + 10) + 'px';
                    }).on('keydown', event => {
                      if (event.keyName === 'CtrlEnter') Messages.post(event);
                    }),
                    // $('button').text('send').on('click', messageSend),
                  ),
                ]
              }
            },
            get() {
              target.api('/messages').get().then(({value}) => value ? value.forEach(Messages.add) : null);
            },
            add(row) {
              // console.debug(1231, row);
              const {value,createdDateTime,name} = row;
              const elem = $('div')
              .class(String(row.sub).toLowerCase()===String(sub).toLowerCase() ? 'me' : null)
              .parent(target.messagesElem)
              .append(
                $('span').text(value).append(
                  $('small').text((name||'') + ', ' + new Date(createdDateTime).toDisplayString(true))
                )
              );
              target.messagesElem.el.scrollTop = target.messagesElem.el.scrollHeight;
              // elem.scrollIntoView();
            },
            post(event) {
              // const createdDateTime = new Date().toLocaleString();
              const {el} = target.newMessageElem;
              const {value} = el;
              el.value = '';
              el.style.height = '41px';
              // console.debug({value,sub});
              // target.api('/messages').post({value,sub}).then(body => console.debug(body));
              target.api('/messages').post({value,sub,name}).then(body => Messages.add(body));
            },
          });
          elem.append(
            $('div').class('form view').id(this.elemId)
            .on('dragover', event => event.preventDefault())
            .on('drop', event => {
              const {dataTransfer} = event;
              const {types,files} = dataTransfer;
              if (types.includes('Files')) {
                event.preventDefault();
                Array.from(files).forEach(file => attachementPost(file,row).then(Attachements.add));
              } else if (types.includes('Aim')) {
                event.preventDefault();
                const {client_id,aud,sub,id,schemaName} = JSON.parse(dataTransfer.getData('Aim'));
                Aim.api('/links')
                .post({fromId,fromSchemaName,fromClientId,toId:id,toClientId:client_id,toSchemaName:schemaName,aud,sub})
                .then(body => links.add(body));
              }
            })
            .append(
              $('nav').append(
                editmode ? [
                  // $('button').class('icn-delete'),
                  // $('span'),
                  // $('button').class('icn-back').style('margin-right:auto;').on('click', event => target.pageElem()),
                  $('button').class('icn-back').style('margin-right:auto;').on('click', event => this.select(this.refresh())),
                ] : [
                  $('button').class('icn-back').style('margin-right:auto;').on('click', event => {
                    const url = new URL(document.location);
                    url.searchParams.delete('id');
                    Statusbar.replaceState(url.href);
                    elem.remove();
                  }),
                  $('button').class('icn-arrow_sync').on('click', event => this.get().then(item => this.select(this.refresh()))),
                  target.pageNav || [
                    $('button').class('icn-edit').on('click', event => target.pageElem(true)),
                  ],
                  // $('button').class('icn-window').on('click', event => target.popout(5000,0)),
                  // $('button').class('icn-edit').on('click', event => target.pageElem(true)),
                ],
                // $('button').text('select').on('click', event => {
                //   sessionStorage.setItem('clientId', body.id);
                //   document.location.href = '/';
                // })
              ),
              this.setHeaderElem($('header'), true),
              // $('div').append(this.imageElem),

              !options.files ? null : $('div').class('attach').append(
                $('div').class('images'),
                $('div').class('docs'),
                $('div').class('links'),
              ),
              $('form').properties({row: target, properties}, editmode),
              Messages.create(),
              // (
              //
              // $('div').append(
              //   Object.entries(schema.properties)
              //   .filter(([name, property]) => Aim.readOnly === false || data[name])
              //   .map(([name, property]) => $('div').class('attr').append(
              //     $('label').text(property.title || name),
              //     $(Aim.readOnly === false ? 'input' : 'span').text(data[name]).value(data[name] || ''),
              //   ))
              // )
            )
          );
          if (hasMessages) Messages.get();
          if (properties.files) Attachements.get();
          if (properties.links) Links.get();
          if (editmode) {
            setTimeout(event => {
              const elInView = Array.from(document.querySelectorAll('.pageview input')).find(el => visible(el));
              if (elInView) elInView.focus();
            });
          }
          return elem;
        },
        docElem(doc){
          // console.debug(doc);
          const {src} = doc;
          return Aim.fetch(src).get().then(content => {
            return $('div').class(doc.class||'').html(content.replaceTags(this).render()).append(
              $('link').rel('stylesheet').href('https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css'),
            );
          });
        },
        getCompany(id) {
          return this.client.api(`/company(${id})`).select([
            'id,companyId,companyName,businessAddress,otherAddress',
            // 'businessAddressStreet,businessAddressStreet2,businessAddressStreet3,businessAddressPostalCode,businessAddressCity,businessAddressState,businessAddressCountry',
            // 'otherAddressStreet,otherAddressStreet2,otherAddressStreet3,otherAddressPostalCode,otherAddressCity,otherAddressState,otherAddressCountry',
            'businessHomePage,businessEmailAdres,emailAddress0,emailAddress1,businessPhone,businessFax,businessMobilePhone',
            'logoUrl,organizationalIDNumber,btwNummer,btwTarief,bic,iban,supplierCode,keyword,invoiceSenderMailAddress',
          ].join(',')).get().then(company => {
            // console.debug(company.businessAddress,company.otherAddress);
            company.businessAddress = JSON.parse(company.businessAddress);
            company.otherAddress = JSON.parse(company.otherAddress);
            return company;
          });
        },
        getRowButtons() {

        },
        async letterElem(options){
          const {from,to,name,addressname,barcode,qrcode,fromId,toId} = options;
          // const from = await this.getCompany(fromId);
          // const to = await this.getCompany(toId);
          // console.debug({name,fromId,toId,from,to});
          const toAddress = to[addressname] || to.businessAddress;
          // from.businessAddress = from.businessAddress ? JSON.parse(from.businessAddress) : null;
          // from.otherAddress = from.otherAddress ? JSON.parse(from.otherAddress) : null;
          // from.businessAddress = from.businessAddress ? JSON.parse(from.businessAddress) : {};
          // var toAddress = {
          //   street: to.businessAddressStreet,
          //   street2: to.businessAddressStreet2,
          //   street3: to.businessAddressStreet3,
          //   postalCode: to.businessAddressPostalCode,
          //   city: to.businessAddressCity,
          //   state: to.businessAddressState,
          //   country: to.businessAddressCountry,
          // };
          // if (addressname && to[addressname+'Street']) {
          //   toAddress = {
          //     street: to[addressname+'Street'],
          //     street2: to[addressname+'Street2'],
          //     street3: to[addressname+'Street3'],
          //     postalCode: to[addressname+'PostalCode'],
          //     city: to[addressname+'City'],
          //     state: to[addressname+'State'],
          //     country: to[addressname+'Country'],
          //   };
          // } else if (to[addressname]) {
          //   toAddress = to[addressname];
          // } else if (to.businessAddress) {
          //   toAddress = to.businessAddress;
          // }
          // console.debug(423423, toAddress);
          return $('div').class('letter').append(
            $('link').rel('stylesheet').href('https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css'),
            $('table').style('width:100%;').append(
              $('tr').append(
                $('td').style('width:100%;').append(
                  $('img').src(from.logoUrl).style('height:12mm;margin-bottom:10mm;'),
                  $('div').style('height:26mm;').append(
                    $('div').text(to.companyName),
                    // $('div').text('T.a.v.', to.operationalContact.name),
                    $('div').text(
                      toAddress.street,
                      toAddress.street2,
                      toAddress.street3,
                    ),
                    $('div').text(
                      toAddress.postalCode,
                      toAddress.city,
                    ),
                    $('div').text(
                      toAddress.country,
                    ),
                    // $('div').text('Per mail', to.operationalContact.email),
                    qrcode ? await $('img').style('position:absolute;right:5mm;top:0;height:20mm;').qrcode(qrcode) : null,
                    barcode ? $('div').class('bc').text(`*${barcode}*`) : null,
                  ),
                  $('div').style('font-weight:bold;font-size:1.2em;line-height:10mm;').text(name),

                ),
                $('td').style('white-space:nowrap;padding:0;font-size:0.8em;').append(
                  $('div').style('font-weight:bold;').text(from.companyName),
                  $('p').append(
                    from.otherAddress ? $('div').text('Bezoekadres:') : null,
                    $('div').text(
                      from.businessAddress.street,
                      from.businessAddress.street2,
                      from.businessAddress.street3,
                    ),
                    $('div').text(
                      from.businessAddress.postalCode,
                      from.businessAddress.city,
                    ),
                    $('div').text(
                      from.businessAddress.state,
                      from.businessAddress.country,
                    ),
                  ),
                  from.otherAddress ? $('p').append(
                    $('div').text('Postadres:'),
                    $('div').text(
                      from.otherAddress.street,
                      from.otherAddress.street2,
                      from.otherAddress.street3,
                    ),
                    $('div').text(
                      from.otherAddress.postalCode,
                      from.otherAddress.city,
                    ),
                    $('div').text(
                      from.otherAddress.state,
                      from.otherAddress.country,
                    ),
                  ) : null,
                  $('p').append(
                    from.businessPhone ? $('div').text('Telefoon:', from.businessPhone) : null,
                    from.businessHomePage ? $('div').text('Website:', from.businessHomePage) : null,
                    from.businessEmailAdres ? $('div').text('EMail:', from.businessEmailAdres) : null,
                  ),
                  $('p').append(
                    from.iban ? $('div').text('IBAN:', from.iban) : null,
                    from.btwNummer ? $('div').text('BTW:', from.btwNummer) : null,
                    from.organizationalIDNumber ? $('div').text('KvK:', from.organizationalIDNumber) : null,
                  ),
                ),
              ),
            ),
          );
        },
        focus () {
          document.querySelectorAll('[focus]').forEach(el => el.removeAttribute('focus'));
          document.querySelectorAll('#'+this.id).forEach(el => el.setAttribute('focus', ''));
        },
        popout(left = 0,top = 0,width = 600,height = 600) {
          console.debug(this);
          const item = this;
          var url = document.location.origin;
          var url = 'about:blank';
          if (item.popoutWindow) {
            return item.popoutWindow.focus();
          }
          var win = openwindows.find(win => win.name === item.id);
          if (win) return win.focus();
          win = self.open(url, item.id, `scrollbars=no,resizable=yes,toolbar=no,top=${top},left=${left},width=${width},height=${height}`);
          openwindows.push(win);
          self.addEventListener('beforeunload', event => win.close());
          const doc = win.document;
          const {el} = item.pageElem().style('flex: 1 0 0;');
          doc.open();
          doc.write(pageHtml);
          doc.close();
          win.addEventListener("load", (event) => {
            // win.document.title = headers[0];
            const Aim = win.Aim;
            Aim(doc.documentElement).class('app').attr('dark', Web.getItem('dark'));
            // doc.body.appendChild(elem.el);
            Aim(doc.body).class('col').append(
              Aim('main').class('row').append(
                Aim('div').class('row mw').append(
                  Aim('div').class('row lv').append(
                    Aim('div').class('row').append(
                      el,
                    ),
                  ),
                ),
              ),
            );
            item.pageElem();
            win.addEventListener('beforeunload', event => item.popoutWindow = null);
          });
          // dragItems.forEach(item => self.open(
          //   document.location.href.split('/id').shift()+'/id/'+ btoa(item['@id']),
          //   '_blank',
          //   'width=640, height=480, left=' + (event.screenX || 0) + ', top=' + (event.screenY || 0)
          // ));
        },
        async select() {
          const {href} = this;
          Nav.set('id', btoa(href));
          this.api().get().then(body => {
            this.assign(body);
            document.querySelectorAll('.pages>div').forEach(el => el.remove());
            $('.pages').clear();
            this.pageElem();
          });
        },
        async _select() {
          /** highlight all elements with id */
          //   document.querySelectorAll('[selected]').forEach(el => el.removeAttribute('selected'));
          //   document.querySelectorAll('#'+this.id).forEach(el => el.setAttribute('selected', ''));

          // const url = new URL(document.location);
          // url.searchParams.set('id', btoa(uri));
          // if (window.history && window.history.replaceState) {
          //   window.history.replaceState('','',url);
          // }
          // if (uid) {
          //   const $select = 'id,uid,name,title,subject,summary,parentId,masterId,srcId';
          //   Aim.api('/Aim/item').query({uid,$select}).get().then(([[item],props]) => {
          //     // Object.assign(item, Object.fromEntries()
          //     props.forEach(prop => item[prop.name] = prop.value);
          //     console.debug(item,props);
          //     Item(item).pageElem();
          //     const {KeyName} = item;
          //     const data = JSON.stringify({KeyName});
          //     Aim.api('/Aim/item').query({uid}).post({data}).then(res => console.debug(res));
          //   });
          //
          //   // document.location.hash = `#?id=${btoa('/Aim/item?uid='+uid)}`;
          // } else if (row['@id']) {
          //   const url = new URL(document.location);
          //   const ref = row['@id'];//`${row.schemaName}(${row.id})`;
          //   // console.debug(999, ref);°
          //   document.location.hash = `#?id=${btoa(ref)}`;
          // } else if (id) {
          //   const idUrl = new URL(listUrl);
          //   idUrl.searchParams.set('$select', '*');
          //   idUrl.searchParams.set('$filter', 'id='+id);
          //   console.debug(idUrl.href);
          //   document.location.hash = `#?id=${btoa(idUrl.href)}`;
          // }
        },
        updateAttribute(selector, context) {
          console.debug('updateweb', this.id, selector, 'to', context)
        },
        webstart() {
          console.debug('WEBSTART');
        },
        dashboard() { },
        slideshow() {
          var el = document.documentElement, rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
          rfs.call(el);
          $.show({ sv: this.item.id });
        },
        model3d() {
          const elem = $('div').parent($('list')).class('col abs').append(
            $('div').class('row top abs btnbar').append(
              $('button').class('abtn icn r refresh').on('click', event => this.rebuild() ),
              $('button').class('abtn icn close').on('click', event => elem.remove()),
            ),
            this.three = $('div').class('col aco').three(
              this.init = three => (this.rebuild = event => aimClient.api('/'+item.tag).query('three', '').get().then(three.build))()
            ),
          );
        },
        network() {
          (function init() {
            const elem = $('div').parent($('list')).class('col abs').append(
              $('div').class('row top abs btnbar').append(
                $('button').class('abtn icn r refresh').on('click', event => {
                  elem.remove();
                  init();
                }),
                $('button').class('abtn icn close').on('click', event => elem.remove()),
              ),
            );
            aimClient.api(`/${item.tag}`).query('response_type','build_link_data').get().then(
              body => $('div').class('col aco').parent(elem).style('background:white;').modelDigraph(body)
            );
          })();
        },
        showInherited() {
          items.show({ id: this.item.srcID })
        },
        clone() {
          this.setAttribute('clone', 1, { post: 1 })
        },
        //revert: { disabled: !this.srcID, Title: 'Revert to inherited', item: this, onclick: function() { this.item.revertToInherited(); } },
        apikey() {
          aimClient.api('/').query('response_type', 'api_key').query('expires_after', 30).post({
            sub: item.ID,
            aud: item.ID
          }).get().then(body => {
            $('dialog').open(true).parent(document.body).text(body);
            console.debug(body);
          })
        },
        breakdown() {
          $().list([]);
          aimClient.api(`/${item.tag}`).query('response_type', 'build_breakdown').get().then(body => {
            const data = body.value;
            console.debug(data);
            const topitem = data.find(child => child.ID == item.data.ID);
            const items = [];
            (function build(item, tagname) {
              console.debug(item);
              // if (!item) return;
              items.push(item);
              item.data.Tagname = tagname = (tagname ? tagname + '.' : '') + (item.data.Prefix || '') + (item.data.Tag || item.data.Name || '');
              item.data.children = data
              .filter(child => child.data.MasterID == item.data.ID)
              .sort((a,b) => String(a.data.idx||'').localeCompare(b.data.idx||'', undefined, {numeric: true}))
              .map(child => build(child, tagname));
              return item;
            })(topitem);
            items.forEach(item => {
              if (item.data && item.data.link) {
                const link = item.data.link.shift();
                const linkItem = $(link.LinkID);
                item.data.LinkTagname = linkItem.data.Tagname;
                linkItem.data.LinkTagname = item.data.Tagname;
                // item.data.Linktagname = $(item.data.link.shift().LinkID).data.Tagname;
              }
            });
            // items.sort((a,b) => (a.data.Tagname || '').localeCompare(b.data.Tagname || ''));
            return $().list(items);
          });

        },
        doc() {
          (async function init() {
            const elem = $('div').parent($('list')).class('col abs').append(
              $('div').class('row top abs btnbar').append(
                $('button').class('abtn icn r refresh').on('click', event => {
                  elem.remove();
                  init();
                }),
                $('button').class('abtn icn close').on('click', event => elem.remove()),
              ),
            );
            breakdown_data().then(event => {
              const items = event.body.value;
              console.debug(items);
              const topitem = items.find(child => child.ID == item.data.ID);
              function chapter(item, level) {
                // console.debug(item.schema, item.schemaPath);
                // const schemaName = item.schemaPath.split(':').pop();
                const properties = Object.entries(item.schema.properties)
                .filter(([propertyName, property])=> item[propertyName])
                .map(([propertyName, property])=> $('li').class('prop').append(
                  $('label').text(propertyName+': '),item[propertyName],
                ));
                return [
                  $('h'+level).text(item.header0),
                  // $('div').text('inleiding'),
                  $('ul').append(properties),
                ].concat(...items.filter(child => child.data.MasterID === item.ID).map(item => chapter(item, level + 1)));
              }
              $('div').parent(elem).class('row doc aco').append(
                (this.docElem = $('div')).class('aco doc-content counter oa').append(
                  chapter(topitem, 1)
                ),
                $('div').class('mc-menu right np oa').append(
                  $('div').class('ac-header').text('Table of contents'),
                  $('ul').index(this.docElem)
                ),
              )
            });
          })();
        },
        toggleFav() { },
        showMessages() { },
        send() {},
        downloadConfigdata() {
          // $('a').class('abtn download').text('config_data').href('https://dms.aliconnect.nl/system/build?response_type=config_data&download&id='+item.data.ID),
        },
        downloadV1() {
          // $('a').class('abtn download').text('data_v1').href('https://dms.aliconnect.nl/system/build?response_type=data_v1&download&id='+item.data.ID),
        },



      },
      getId (id) {
        return Number(id.split('-').shift());
      },
      getUid (id) {
        return id.replace(/^\d+-/,'')
      },
    },
    prototype: {
      dashboard () {
      const panel = Aim('div').panel();
      aimClient.api('/').query('response_type', 'personal_dashboard_data_domain').get().then(body => {
        panel.elemMain.class('dashboard').append(
          Aim('div').class('row wrap').append(
            ...body.map(row => Aim('div').class('col').append(
              Aim('h1').text(row.schemaPath),
              ...row.items.map(item => Aim('a').text(item.header0).on('click', event => Aim('view').show(Aim(`${row.schemaPath}(${item.id})`)) ))
            )),
            ...[0,0,0,0,0,0,0,0,0].map(a => Aim('div').class('ghost')),
          )
        );
      })
    },
      document (mainElem, buttons) {
        Aim('doc').append(
          this.pageElem = Aim('div').class('col doc').append(
            Aim('div').class('row top stickybar').append(
              Aim('span').class('aco'),
              Aim('button').class('abtn pdf').on('click', async event => {
                const html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>'+this.docElem.el.innerHTML;
                Aim.fetch(dmsUrl + '?response_type=pdf').post(html).then(event => {
                  const elem = Aim('div').parent(this.pageElem).class('col abs').append(
                    Aim('div').class('row top btnbar').append(
                      Aim('button').class('abtn close').on('click', event => elem.remove()),
                    ),
                    Aim('iframe').class('aco').src(event.body.src)
                  )
                })
              }),
              Aim('button').class('abtn close').on('click', event => this.pageElem.remove()),
            ),
            Aim('div').class('row aco').append(
              this.leftElem = Aim('div').class('mc-menu left np oa').append(),
              Aim('div').class('aco col').on('click', event => {
                const href = event.target.getAttribute('href');
                if (href && href.match(/^http/)) {
                  event.stopPropagation();
                  event.preventDefault();
                  self.history.pushState('page', '', '?l='+url_string(href));
                  const panel = Aim('div').parent(elem.docElem).class('col abs').append(
                    elem.elemBar = Aim('div').class('row top abs btnbar').append(
                      Aim('span').class('aco'),
                      Aim('button').class('abtn close').on('click', event => panel.remove()),
                    ),
                    Aim('iframe').src(href),
                  );
                }
              }).append(
                Aim('nav').class('row docpath').append(Aim('small').id('navDoc')),
                this.docNavTop = Aim('nav').class('row dir'),
                this.docElem = mainElem.class('doc-content aco'),
              ),
              Aim('div').class('mc-menu right np oa').append(
                Aim('div').class('ac-header').text('Table of contents'),
                this.indexElem = Aim('ul').index(this.docElem)
              ),
            ),
          )
        );
        // Aim(document.body).on('scroll', event => this.scrollTop.set(this.src, event.target.scrollTop));
        // this.doc.indexElem.index(this.doc.docElem)
        this.pageElem.el.doc = this;
        return this;
      },
      css (selector, context) {
        if (document) {
          if (selector instanceof Object) {
            Object.entries(selector).forEach(entry => arguments.callee(...entry))
          } else {
            document.querySelector('html').style.setProperty('--' + selector, context);
          }
        }
        return this;
        //
        //
        // let style = [...document.getElementsByTagName('style')].pop() || Aim('style').parent(document.head).elem;
        // const sheet = style.sheet;
        // function addRule(selector, context) {
        // 	if ('insertRule' in sheet) {
        // 		sheet.insertRule(selector + "{" + context + "}", sheet.cssRules.length);
        // 	} else if ('addRule' in sheet) {
        // 		sheet.addRule(selector, context);
        // 	}
        // }
        // if (selector instanceof Object) {
        // 	Object.entries(selector).forEach(entry => addRule(...entry))
        // } else {
        // 	addRule(...arguments);
        // }
        // return this;
      },
      cam () {
        const elem = document.head.appendChild(document.createElement('script'));
        elem.setAttribute('src', Aim.config.apiPath + '/js/cam.js');
      },
      cookies () {
        Aim().on({
          async load() {
            if (!localStorage.getItem('cookieSettings')) {
              const elem = Aim('div')
              .parent(document.body)
              .class('cookieWarning')
              .text('Opslag van uw gegevens')
              .append(
                Aim('button')
                .text('Werkende website')
                .on('click', event => {
                  localStorage.setItem('cookieSettings', 'session');
                  elem.remove();
                }),
                Aim('button')
                .text('Allen voor u persoonlijk')
                .on('click', event => {
                  localStorage.setItem('cookieWarning', 'private');
                  elem.remove();
                }),
                Aim('button')
                .text('Delen met onze organisatie')
                .on('click', event => {
                  localStorage.setItem('cookieWarning', 'shared');
                  elem.remove();
                }),
                Aim('a').text('Cookie beleid').href('#?l=//aliconnect.nl/aliconnect/wiki/Explore-Legal-Cookie-Policy')
              )
            }
            return this;
          }
        })
      },
      accountConfig (config, extend, save) {
        const panel = Aim('form').class('col')
        .style('position:absolute;margin:auto;left:0;right:0;top:0;bottom:0;background-color:white;z-index:200;')
        .parent(Aim('list'));
        const tabControl = Aim('div').parent(panel).class('row top btnbar');
        const pageControl = Aim('div').parent(panel).class('row aco').style('height:100%;');
        function upload() {
          // //console.debug('UPLOAD', page);
          configInput.el.value = configText.el.innerText;
          aimClient.api('/').post(panel).then(body => {
            console.debug("API", body);
          });
          // aimClient.api(url).post(page).query({
          //   base_path: document.location.protocol === 'file:' ? '/' : document.location.pathname.split(/\/(api|docs|om)/)[0],
          // }).input(this.value).post().then(event => {
          //   console.debug("API", event.target.responseText );
          // });
        }
        const page = Aim('div').parent(pageControl)
        .class('aco oa col')
        .css('margin:auto;position:absolute;top:0;bottom:0;left:0;right:0;')
        .css('background-color:var(--bg);');
        const configText = Aim('pre').parent(page)
        .class('aco')
        .css('margin:0;padding:0 10px;outline:none;')
        .text(config.replace(/^---\n/, '').replace(/\n\.\.\./, '').trim())
        .contenteditable('')
        .spellcheck(false)
        .on('keydown', event => {
          if (event.key === "s" && event.ctrlKey) {
            event.preventDefault();
            upload();
          }
          if (event.key == 'Tab' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            document.execCommand('insertHTML', false, '&#009');
            event.preventDefault()
          }
        });
        const configInput = Aim('input').parent(page).name('config').type('hidden');
        function focus () {
          [...pageControl.el.children].forEach(elem => elem.style.display = 'none');
          page.el.style.display = '';
        }
        function close () {
          page.remove();
          tab.remove();
          if (!tabControl.el.innerText) {
            panel.remove();
          }
        }
        const tab = Aim('div').parent(tabControl).append(
          Aim('span').text('config.yaml').on('click', focus),
          Aim('input').type('checkbox').name('extend').id('expand').checked(extend),
          Aim('label').text('extend').for('expand'),
          Aim('button').class('abtn close').on('click', close),
        );
        focus();
        if (save) upload();
        // open(aimClient.api('/').accept('yaml'));
      },
      signin () {
        Aim().on({
          async load() {
            Aim().server.url = Aim().server.url || document.location.origin;
            await Aim.fetch(Aim().server.url+'/api.json').get().then(event => Aim().extend(event.body));
            await Aim().login();
          }
        });
      },
      execUrl (url) {
        console.warn('execUrl', url);
        const documentUrl = new URL(document.location);
        // const currentUrl = new URL(document.location);
        // Aim.url = Aim.url || new URL(document.location.origin);
        url = new URL(url, document.location);

        // //console.debug(url.hash, url.searchParams.get('l'), Aim.url.searchParams.get('l'));
        if (url.hash) {
          if (this.execUrl(url.hash.substr(1))) {
            Aim.his.mergeState(url.hash.substr(1));
            return;
          }
          // if (Aim[url.hash.substr(1)]) {
          //   return Aim[url.hash.substr(1)]();
          // }
          // this.execUrl(url.hash.substr(1));
        }
        // //console.debug(url.searchParams.get('l'));
        // if (url.searchParams.get('l')) {// && url.searchParams.get('l') !== Aim.url.searchParams.get('l')) {
        //   documentUrl.searchParams.set('l', url.searchParams.get('l'));
        //
        //   const listUrl = idToUrl(url.searchParams.get('l'));
        // }
        if (url.searchParams.get('v') && url.searchParams.get('v') !== documentUrl.searchParams.get('v')) {
          documentUrl.searchParams.set('v', url.searchParams.get('v'));
          if (url.searchParams.get('v')) {
            var refurl = new URL(idToUrl(url.searchParams.get('v')), document.location);
            if (refurl.hostname.match(/^dms\./)) {
              // const client = clients.get(refurl.hostname) || Aim();
              // aimClient.api(refurl.href).get().then(console.error);
              aimClient.api(refurl.href).get().then(async body => Aim('view').show(body));
            }
          } else {
            Aim('view').text('');
          }
        }
        for ([key, value] of url.searchParams) {
          if (typeof Aim[key] === 'function'){
            return Aim[key].apply(Aim, value ? value.split(', ') : []) || true;
          }
        }
        self.history.replaceState('page', '', documentUrl.href);

        // if (!Aim.fetch(document.location.hash ? document.location.hash.substr(1) : document.location.href).exec()) {
        //   if (url.searchParams.get('p')) {
        //     return Aim('list').load(url.searchParams.get('p'));
        //   }
        // }
        // if (url.searchParams.get('id')) {
        //   var refurl = new URL(atob(url.searchParams.get('id')));
        //   if (refurl.pathname.match(/^\/api\//)) {
        //     Aim.fetch(refurl.href).get().then(async event => {
        //       Aim('view').show(event.body);
        //     });
        //   }
        // }
        // return;
        // //console.debug('POPSTATE2', document.location.pathname);
      },
      ga () {
        if (self.ga) {
          ga(arguments);
        }
        return this;
      },
      panel () {
        return Aim('div').panel();
      },
      procstate (selector) {
        return Aim('div').class('procstate').text(selector);
      },
      // progress (value = 0, max = 0) {
      //   if (Aim.his.el.statusbar) {
      //     value = Aim.his.el.statusbar.progress.el.value = (Aim.his.el.statusbar.progress.el.value || 0) + value;
      //     max = Aim.his.el.statusbar.progress.el.max = (Aim.his.el.statusbar.progress.el.max || 0) + max;
      //     Aim.his.el.statusbar.progress
      //     .max(max)
      //     .value(value || null)
      //     .attr('proc', max ? Math.round(value / max * 100) : null)
      //   }
      // },
      pdfpages (selector) {
        return Aim.promise('pdf-pages', resolve => {
          let pages=[];
          function read_pages(pdf) {
            // pagesProgress.max = pdf.numPages;
            Aim().progress(0, pdf.numPages);
            (function getPage(pageNumber) {
              // //console.debug(pageNumber);
              pdf.getPage(pageNumber).then(function (page) {
                page.getTextContent({
                  normalizeWhitespace: true,
                  disableCombineTextItems: false,
                }).then(item => {
                  pages.push(item.items);
                  if (pageNumber < pdf.numPages) {
                    Aim().progress(pageNumber);
                    setTimeout(() => getPage(++pageNumber),0);
                  } else {
                    resolve(pages);
                  }
                });
              });
            })(1);
          }
          if (selector instanceof File) {
            //console.debug('is file', selector);
            var fileReader = new FileReader();
            fileReader.onload = function (event){
              const array = new Uint8Array(event.target.result);
              pdfjsLib.getDocument({data: array}).promise.then(read_pages);
            };
            fileReader.readAsArrayBuffer(selector);
          } else {
            pdfjsLib.getDocument(selector).promise.then(read_pages);
          }
        });
      },
    },
    error,
  });
  /** Popups in scherm */
  function Popup(event) {
    const {elem, menuElement, contextmenu, target, clientX, clientY} = event;
    const {innerWidth, innerHeight} = window;
    const {items, sub, minWidth, minHeight} = contextmenu;
    // const {availWidth, availHeight} = screen;

    event.preventDefault();
    // console.warn(menuElement, contextmenu, screen, window);
    const rect = (menuElement || target).getBoundingClientRect();
    // console.debug(rect);
    var top = rect.bottom;
    if ('sub' in contextmenu) {
      var top = rect.top;
      var left = rect.left + rect.width + sub;
    } else if ('left' in contextmenu) {
      var left = contextmenu.left;
    } else if ('right' in contextmenu) {
      var left = rect.left + rect.width - contextmenu.right;
      //   var left = contextmenu.right - menuElement.clientWidth;
    } else {
      var left = Math.max(0,Math.min(clientX,innerWidth-(minWidth||300)));
      var top = Math.max(0,Math.min(clientY,innerHeight-(minHeight||400)));
    }
    const elemPopup = $('div').parent(document.body).class('col popup')
    .style(`top:${top}px;left:${left}px;max-height:${innerHeight - top}px;min-width:${minWidth}px;`)
    // .on('contextmenu', event => event.preventDefault(event.stopPropagation()))
    .append(
      items.map(item => {
        if (item === null) return $('hr');
        if (!item) return;
        const {caption,name,title,hotkey,click,onclick,items,fgColor,bgColor,color,classname,icn,checked} = item;
        // console.debug(fgColor,bgColor,color,item);
        return $('button')
        .class(`icn-${icn || name}`)
        .attr({caption,name,title,hotkey,checked})
        .style(bgColor||color ? `--icn-color:${bgColor||color};` : null)
        .on('click', click)
        .on('click', onclick)
        .on('mouseenter', event => {
          if (this.subPopup) {
            this.subPopup.close();
          }
          // console.debug(event);
          const {target} = event;
          if (items) {
            this.subPopup = new Popup(Object.assign(event,{contextmenu:{items,sub:0}}))
          }
        })
        // .on('mouseleave', event => {
        //   // if (item.elem) item.elem.remove();
        // })
      }),
    );
    const listeners = {
      contextmenu: (event) => this.close(),
      click: (event) => this.close(),
      keydown: (event) => {
        const {key,keyName,path} = event;
        if (key === 'Escape') this.close();
        for (var el of path) {
          if (el.menu) {
            console.debug(el);
            const {items} = el.menu;
            items.filter(({hotkey,click}) => hotkey === keyName && click).forEach(({click}) => {
              event.preventDefault();
              event.stopPropagation();
              click(event);
            });
          }
        }
      },
    }
    Object.entries(listeners).forEach(entry => window.addEventListener(...entry, true));
    this.close = function close(event) {
      // console.debug(event)
      Object.entries(listeners).forEach(entry => window.removeEventListener(...entry, true));
      elemPopup.remove();
    }
  }
  window.addEventListener('contextmenu', event => {
    for (var menuElement of event.path) {
      var {contextmenu} = menuElement;
      if (contextmenu) {
        // console.debug(67576, contextmenu);
        new Popup(Object.assign(event,{menuElement,contextmenu}));
        return;
      }
    }
    // this.close();
  }, true);
  /** applicatie clipboard voor beheer items, multi select enz*/
  Clipboard = Object.create({
    undo() {
      //console.debug('UNDO', $.his.updateList);
      if (this.undoData = $.his.updateList.shift()) {
        this.undoData.Value.reverse().forEach(function(row) {
          if (row.eventType == 'paste') row.eventType = 'cut';
          else if (row.eventType == 'cut') row.eventType = 'paste';
        });
        this.undoData.from = true;
        $.data.update(this.undoData, true);
      }
    },
    update(data, targetItem, eventType) {
      //if (!data || !targetItem) return false;
      if (!data) return false;
      if (typeof data == 'string') data = JSON.parse(data);
      if (data.Value) {
        //var updateAction = '';
        if (!data.from) $.his.updateList.unshift(data); // Add data to update history list
        data.Value.forEach(function(row, i, rows) {
          var item = Item.create(row.id);
          row.eventType = row.eventType || eventType;
          ////console.debug("UPDATE", eventType, row.eventType, row, targetItem, item);
          if (!item) return;
          switch (eventType || row.eventType) {
            case 'copy':
            targetItem.appendItem(null, { schema: item.schema, Title: item.Title, userID: 0, srcID: item.id }, null, true);
            break;
            case 'link':
            //console.debug('LINK', item);
            new $.HttpRequest($.config.$, 'POST', '/' + targetItem.tag + '/link', { itemID: item.id } ).send();
            // targetItem.appendChild(null, { schema: item.schema, Title: item.Title, detailID: item.id }, null, true);
            break;
            case 'cut':
            ////console.debug('CUT', row.masterID, item.masterID);
            if (row.masterID != item.masterID) {
              //console.debug('NO CUT', row.masterID, item.masterID);
              return;
            }
            if (item.master && item.master.children && item.master.children.length) {
              item.master.children.splice(item.master.children.indexOf(item), 1);
              item.master.children.forEach(function(item, i) { item.index = i });
            }
            if (item.elemTreeLi) item.elemTreeLi.parentElement.removeChild(item.elemTreeLi);
            if (item.elemListLi && item.elemListLi.parentElement) item.elemListLi.parentElement.removeChild(item.elemListLi);
            if (targetItem) {
              ////console.debug('MOVE TO');
              if (targetItem.masterID == targetItem.srcID) {
                //target isClass en verplaatsen: ITEM wordt afgeleid van nieuwe CLASS
                //item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
                //console.debug('MOVE TO CLASS', targetItem, item.srcID = row.srcID = item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
                var propertyAttributeName = item.getPropertyAttributeName('srcID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.srcID };
                var propertyAttributeName = item.getPropertyAttributeName('masterID');
                if (propertyAttributeName) row[propertyAttributeName] = { itemID: row.masterID };
              }
              else {
                //console.debug('MOVE TO', targetItem.elLI, item.masterID = row.masterID = row[item.getPropertyAttributeName('masterID')] = targetItem.id, item.master);
              }
              ////Item isClass en target !isClass, dus verplaatsen en ITEM wordt afgeleid van nieuwe CLASS
              //if (row.masterID == row.srcID && targetItem.masterID != targetItem.srcID && eventType=="paste") item.masterID = item.srcID = row.srcID = row.masterID = targetItem.id;
              //item.masterID = targetItem.id;
              if (item.master) {
                item.master.children = item.master.children || [];
                item.master.children.push(item);
                if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
              }
            }
            $.Selection.cancel();
            break;
            //case 'paste':
            //	if (row.masterID) {
            //		item.masterID = row.masterID;
            //		if (item.master) {
            //			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
            //			if (row.masterID == row.srcID && item.master.masterID == item.master.srcID);
            //			item.master.children.push(item);
            //			if (item.master.elemTreeLi.elemTreeUl) item.appendTo(item.master.elemTreeLi.elemTreeUl);
            //		}
            //	}
            //	break;
            default:
            break;
          }
        });
        ////console.debug('UPDATE', data);
        //return true;
        // @todo: mkan, versturen via ws
        // if (!data.from) $.ws.send(Object.assign({ post: 1, to: { host: $.config.$.auth.accessToken.aud } }, data));
        return true;
      }
    },
    cancel() {
      //console.debug($.his.items.oncancel);
      return $.his.items.oncancel && $.his.items.oncancel.length ? $.his.items.oncancel.pop()() : null;
    },
    oncancel(fn) {
      const oncancel = $.his.items.oncancel = $.his.items.oncancel || [];
      if (oncancel.includes(fn)) {
        oncancel.splice(oncancel.indexOf(fn), 1);
      }
      oncancel.push(fn);
    },
    reload(href) {
      //console.error('$.reload', href);
      setTimeout(() => {
        if (href) document.location.href = href;
        else document.location.reload();
      },0);
    },
    // attr(items, attributeName, value) {
    // 	//console.debug(items, attributeName, value, this[attributeName]);
    // 	if (this[attributeName]) {
    // 		this[attributeName].forEach(item => {
    // 			Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, null))
    // 		})
    // 	}
    // 	items.forEach(item => {
    // 		Object.values(item).filter(value => value instanceof Elem).forEach(selector => selector.attr(attributeName, value))
    // 	})
    // 	this[attributeName] = items;
    // },
    items: [],
    setItem(item, attributeName, value) {
      if (!item) throw 'no item';
      event = window.event;
      let items = this[attributeName] || [];
      items.forEach(item => item.setAttribute ? item.setAttribute(attributeName, null) : null);
      // this.items.forEach(item => item.setAttribute(attributeName));
      // $.attr(this.items,'checked');
      // $.attr(this.items,'clipboard');
      if (item) {
        if (Array.isArray(item)) {
          items = item;
          this.itemFocussed = item[0];
        } else {
          if (!event.altKey) {
            if (event.ctrlKey) {
              if (event.shiftKey) {
                // !ALT + CTRL + SHIFT
              } else {
                // !ALT + CTRL+!SHIFT
                items.push(item);
              }
            } else if (event.shiftKey) {
              // !ALT+!CTRL + SHIFT
              // if (this.items.length) {
              // 	//console.error ('find first elem', event.path);
              //
              // }
              items.push(item); // lijst
            } else {
              // !ALT+!CTRL+!SHIFT
              items = [item];
            }
          }
        }
        // items.forEach(item => item.setAttribute(attributeName, this.items.length));
      } else {
        items = [];
      }
      // //console.debug(item);
      value = items.length;
      $().status('is_checked', value);
      items.forEach(item => {
        Object.values(item)
        .filter(value => value instanceof Elem)
        .forEach(selector => selector.attr(attributeName, value))
      });
      this[attributeName] = items;
      return this;
    },
    get length() {
      return this.items.length;
    },
    push(item) {
      if (!this.items.includes(item)) {
        this.items.push(item);
      }
    },
    copy(event) {
      const selection = window.getSelection();
      if (selection.focusNode.nodeType === 3) {
        return;
      }
      // console.debug('CLIPBOARD', event.type, selection, selection.focusNode.nodeType, selection.focusNode, selection.ancherNode, selection.extendNode, selection.baseNode);
      if(document.activeElement.isContentEditable || ['INPUT'].includes(document.activeElement.tagName)) {
        return;
      }
      let type = '';
      if (this.clipboardItems) {
        this.clipboardItems.forEach(item => item.setAttribute('clipboard'));
        this.clipboardItems = [];
      }
      if (event) {
        event.preventDefault();
        if (this.data) {
          event.clipboardData.setData('application/json', JSON.stringify(this.data));
          event.clipboardData.setData('Text', JSON.stringify(this.data));
          this.data = null;
        } else {
          type = event.type;
          const items = this.clipboardItems = this.checked;
          items.forEach(item => item.setAttribute('clipboard', type));
          const data = {type: type, value: items.map(item => {return { tag: item.tag, title: item.title }})};
          event.clipboardData.setData('Aim/items', JSON.stringify(data));
          event.clipboardData.setData('text', items.map(Item.toText).join('\n'));
          event.clipboardData.setData('text/html', items.map(Item.toHtml).join(''));
          $().status('clipboard', `${type}: ${this.clipboardItems.length}`);
        }
      }
    },
    remove(item) {
      console.debug('REMOVE');
      if (this.items.includes(item)) {
        this.items.splice(this.items.indexOf(item), 1);
      }
    },
    cancel(event) {
      this.setItem([]);
    },
    clear(event) {
      //console.debug('clear');
      $.attr(this.items,'clipboard');
      this.items = [this.itemFocussed];
      document.execCommand('copy');
      // this.setItem([]);
      return;
    },
    paste(event) {
    },
    link() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
        //console.debug(o);
      }
    },
    delete() {
      for (var i = 0, o; o = $.selapi.item[i]; i++) {
        //console.debug(o);
      }
    },
    copyToClipboard(obj) {
      $.clipboard.data = obj;
      // // $('input').value(JSON.stringify(obj)).focus().select();
      // const el = event => {
      //   event.preventDefault();
      //   event.stopPropagation();
      //   console.debug(obj);
      // };
      // window.addEventListener('copy', el);
      document.execCommand('copy');
      // window.removeEventListener('copy', el);
      // const el = $('input')
      // .parent(document.body)
      // // .value(JSON.stringify(obj))
      // .focus()
      // .select()
      // .on('copy', event => {
      //   event.preventDefault();
      //   event.stopPropagation();
      //   console.debug('COPY', obj);
      // });
      // // window.addEventListener('copy', el, true);
      // document.execCommand('copy');
      // el.remove();
      // // window.removeEventListener('copy', el, true);
    },
  });
  /** @todo Attribute functies */
  Attr = Object.create({
    displayvalue(value, property) {
      if (value === undefined) {
        return null;
      }
      if (property) {
        if (property.options && property.options[value]) {
          // console.debug(property.name, value, property.options[value].title);
          return property.options[value].title;
        }
        if (property.type === 'datetime') {
          return value ? new Date(value).toDisplayString() : null;
        }
      }
      return value;
    },
  });
  eol = '\n';
  const url = new URL(document.location);
  const {searchParams} = url;
  const openwindows = [];
  const rowsMap = new Map;
  const types = {
    boolean: 'checkbox',
    number: 'number',
    string: 'text',
    object: 'object',
  };
  const {displayvalue,nameToTitle} = Format;
  let inputId = 0;
  Aim.searchParams = searchParams;
  // console.log(document.currentScript);
  Aim.sdkUrl = document.currentScript.src.replace(/js\/web\.js.*/,'');
  if (url.searchParams.get('aliconnect_token')) {
    sessionStorage.setItem('aliconnect_token', url.searchParams.get('aliconnect_token'));
    url.searchParams.delete('aliconnect_token');
    Statusbar.replaceState(url.href);
  };
  function swipedetect(el, callback) {
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function (swipedir) { };
    touchsurface.addEventListener('touchstart', function (event) {
      var touchobj = event.changedTouches[0],
      swipedir = 'none',
      dist = 0,
      startX = touchobj.pageX,
      startY = touchobj.pageY,
      startTime = new Date().getTime(); // record time when finger first makes contact with surface
      event.preventDefault();
    }, false);
    touchsurface.addEventListener('touchmove', function (event) {
      event.preventDefault(); // pre scrolling when inside DIV
    }, false);
    touchsurface.addEventListener('touchend', function (event) {
      var touchobj = event.changedTouches[0],
      distX = touchobj.pageX - startX, // get horizontal dist traveled by finger while in contact with surface
      distY = touchobj.pageY - startY, // get vertical dist traveled by finger while in contact with surface
      elapsedTime = new Date().getTime() - startTime; // get time elapsed
      if (elapsedTime <= allowedTime) { // first condition for awipe met
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
          swipedir = (distX < 0) ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
        }
        else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
          swipedir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
        }
      }
      handleswipe(swipedir);
      event.preventDefault();
    }, false);
  }
  function search(s, callback) {
    Aim.searchFunction = callback || Aim.searchFunction;
    Web.url.searchParams.set('$search', s = s || new URL(document.location).searchParams.get('$search'));
    // console.debug('SEARCH', s, callback);
    if (Aim.searchFunction) {
      Aim.searchFunction(s);
    } else {
      if (Web.url.searchParams.has('l')) {
        const {serviceRoot} = Aim.config;

        const url = new URL(atob(Web.url.searchParams.get('l')), serviceRoot);
        url.searchParams.set('$search', s);
        Web.url.searchParams.set('l', btoa(url.href));
        Statusbar.replaceState(Web.url);
        // console.debug(url.href);
        Aim.api(url.href).get().then(body => Web.listview.render(body));
      } else if (s) {
        const searchArray = s.split(' ');
        const rows = Array.from(Item.items.values()).filter(row => searchArray.every(word => (row.headers.concat(row.schemaName).join(' ')).match(new RegExp(word,'i'))));
        // console.log(rows);
        Web.listview.render(rows);
        Statusbar.replaceState(Web.url);
      }
    }
    Array.from(document.querySelectorAll('input.search')).forEach(el => el.value=s);
    return false;
  }
  function replaceFields(body,data) {
    (function replaceFields(data,path = []) {
      for (let [name,value] of Object.entries(data)) {
        if (value && typeof value === 'object') replaceFields(value, path.concat(name));
        else body = body.replace(new RegExp('{'+path.concat(name).join('.')+'}','g'), value||' ');
      }
    })(data);
    return body;
  }
  function orderChangeCell(col, row, isInput) {
    if (isInput) {
      return $('input').text(col.title || col.name).on('change', event=>{
        Aim.api('/abis/data').body({
          response_type: 'order',
          id: row.id,
          name: col.name,
          value: event.target.value,
        }).post().then(async res => {
          console.debug(await res.text());
        });
      })
    }
    return $('button').text(col.title || col.name).on('click', event=>{
      Aim.api('/abis/data').body({
        response_type: 'order',
        id: row.id,
        name: col.name,
        value: new Date.toISOString(),
      }).post().then(async res => {
        console.debug(await res.text());
      });
    })
  };
  async function attachementPost(file,row) {
    const {aud,sub,accountname} = Aim.account;
    const {name,lastModified,lastModifiedDate,size,type} = file;
    const {id} = row;
    return Aim.api('/attachements').body(file).query({aud,sub,id,name,lastModified,lastModifiedDate:lastModifiedDate.toISOString(),size,type}).post();
  }
  function toLink(s) {
    return s.replace(/\(|\)|\[|\]|,|\.|\=|\{|\}/g,'').replace(/ /g,'-').toLowerCase();
  }
  function url_string(s) {
    return s.replace(/%2F/g, '/');
  }
  function childObject(object, schemaName) {
    // console.debug(schemaName);
    if (object) {
      const obj = Object.fromEntries(Object.entries(object).filter(([name, obj]) => typeof obj !== 'object'));
      obj.children = Object
      .entries(object)
      .filter(([name, obj]) => typeof obj === 'object')
      .map(([name, obj]) => Item.get(Object.assign({
        schema: schemaName,
        name: name,
        title: name.replace(/^\d+[-| ]/,'')
      }, childObject(obj, schemaName))));
      return obj;
    }
  }
  require = function (src) {
    return new Promise((resolve, reject) => {
      console.debug(src,scriptPath);
      const url = new URL(src,new URL(scriptPath, document.location));
      src = url.href;
      // console.debug(url.href);
      const progress = Web.progress(src);
      var el = Array.from(document.querySelectorAll('script')).find(el => el.src === src) ||
      $('script').src(src).attr('loading', '').on('load', event => event.target.removeAttribute('loading')).parent(document.head).el;
      if (el.hasAttribute('loading')) {
        return el.addEventListener('load', event => progress.done(resolve()));
      }
      progress.done(resolve());
    });
  }
  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }
  function copyToClipboard(value) {
    const el = document.body.createElement('INPUT', { value });
    el.select();
    document.execCommand("Copy");
    el.remove();
  }

  Media = Object.create({
    _gotDevices(mediaDevices) {
      select.innerHTML = '';
      select.appendChild(document.createElement('option'));
      let count = 1;
      mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
          const option = document.createElement('option');
          option.value = mediaDevice.deviceId;
          const label = mediaDevice.label || `Camera ${count++}`;
          const textNode = document.createTextNode(label);
          option.appendChild(textNode);
          select.appendChild(option);
        }
      });
    },
    stopMediaTracks(stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    },
  });
  XLSBook = Object.create({
    async create (options) {
      // console.log(scriptPath+'lib/js/jszip.js');
      // await require(scriptPath+'lib/js/jszip.js');
      await require(scriptPath+'lib/aim/js/xlsx.js');
      // await require(scriptPath+'lib/js/xlsx.full.min.js');
      // await require(scriptPath+'lib/js/xlsx.core.min.js');

      // <script src="https://aliconnect.nl/sdk@0.0.8/dist/js/jszip.js"></script>
      // <script src="https://aliconnect.nl/sdk@0.0.8/dist/js/xlsx.js"></script>


      const wb = XLSX.utils.book_new();
      const {props,sheets} = options;
      wb.Props = options.props;//{Title,Subject,Author,CreatedDate: new Date()};
      for (let sheet of sheets) {
        const {name,cols,rows} = sheet;
        wb.SheetNames.push(name);
        // sheet.rows.unshift(sheet.cols.map(r => Object({v:r.v})));
        // const ws = XLSX.utils.aoa_to_sheet(sheet.rows.map(row => Object.assign(row,sheet.cols)));
        // const ws = XLSX.utils.aoa_to_sheet([cols].concat(rows.map(row => cols.map(col => Object.assign({v: String(row[col.n] !== null ? row[col.n] : '').trim() }, col.f)))));
        // sheet.rows.forEach(row => row.forEach(cell => cell.v = cell.v === null ? '' : cell.v));
        // rows.forEach(row => row.forEach((cell,i) => Object.assign(cell, cols[i].f));
        rows.unshift(cols);
        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = cols;
        wb.Sheets[sheet.name] = ws;
      }
      const out = XLSX.write(wb, {bookType:'xlsx', type: 'binary'});
      return Object.create({
        get out() {
          return out;
        },
        get base64() {
          return btoa(out);
        },
        get href() {
          return URL.createObjectURL(new Blob([s2ab(out)],{type: "application/octet-stream"}));
        },
        objectURL() {
          return URL.createObjectURL(new Blob([s2ab(out)],{type: "application/octet-stream"}));
        },
      });
    },
    importXlsFile (file) {
      // new Aim.HttpRequest(Aim.config.Aim, '/')
      const basePath = document.location.pathname.split(/\/(api|docs|om)/)[0];
      const sub = Aim.access.sub;
      const path = `/${sub}/config.json`;
      const config = {app:{nav:{items:{List:{items:{}}}}}};
      // //console.error(importXlsFile);
      // //console.error('IMPORT XLS', XLSX, file.name);
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = event => {
        //console.error(XLSX, jszip);
        const {definitions} = config;
        // const {definitions} = config;
        // const components = config.components = config.components || {};
        const schemas = definitions;//definitions = definitions || {};
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        function importSheet(sheetname) {
          const wbsheet = workbook.Sheets[sheetname];
          const schema = schemas[sheetname] = schemas[sheetname] || {};
          const properties = schema.properties = schema.properties || {};
          // const Aim.his = wbsheet['!Aim.his'].split(':').pop();
          const [start,end] = wbsheet['!ref'].split(':');
          const [end_colstr] = end.match(/[A-Z]+/);
          const col_index = XLSX.utils.decode_col(end_colstr);
          const types = {
            s: 'string',
          };
          for (var c=0;c<=col_index;c++) {
            var cellstr = XLSX.utils.encode_cell({c:c,r:0});
            var cell = wbsheet[cellstr];
            if (!cell || !cell.v) {
              break;
            }
            properties[cell.v] = properties[cell.v] || { type: types[cell.t] || 'string' }
            // ////console.debug(cellstr, cell);
          }
          // var irows = Number(Aim.his.match(/\d+/g));
          // ////console.debug(sheetname, wbsheet, ref, irows);
        }
        for (let sheetname in workbook.Sheets) {
          importSheet(sheetname);
          config.app.nav.items.List.items[sheetname] = {
            title: sheetname,
            href: '#/' + sheetname,
          }
        }
        ////console.debug(config);
        // Aim.fetch(Aim.config.Aim).post('/').input(config).res(event => {
        // 	////console.debug(event.target.responseText);
        // 	// Aim.SampleWindow('/om/?prompt=config_edit');
        // }).send();
        new Aim.HttpRequest(Aim.config.Aim, 'post', '/').query({append: true}).body(config).send().onload = event => {
          ////console.debug(event.target.responseText);
        };
      }
    },
    createExcel (props) {
    const wb = XLSX.utils.book_new();
    const {Title,Subject,Author,sheets} = props;
    wb.Props = {Title,Subject,Author,CreatedDate: new Date()};
    for (let sheet of sheets) {
      wb.SheetNames.push(sheet.name);
      // sheet.rows.unshift(sheet.cols.map(r => Object({v:r.v})));
      // const ws = XLSX.utils.aoa_to_sheet(sheet.rows.map(row => Object.assign(row,sheet.cols)));
      // const ws = XLSX.utils.aoa_to_sheet([cols].concat(rows.map(row => cols.map(col => Object.assign({v: String(row[col.n] !== null ? row[col.n] : '').trim() }, col.f)))));
      sheet.rows.forEach(row => row.forEach(cell => cell.v = cell.v === null ? '' : cell.v));
      // console.debug(sheet.rows);
      const ws = XLSX.utils.aoa_to_sheet([sheet.cols].concat(sheet.rows));
      ws['!cols'] = sheet.cols;
      wb.Sheets[sheet.name] = ws;
    }
    return XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    // return URL.createObjectURL(new Blob([s2ab(wbout)],{type:"application/octet-stream"}));
    // saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), ws_title + ' Proving.xlsx');
  },
    downloadExcel (props) {
    $('a')
    .download(`${props.Title} ${props.Subject}.xlsx`.toLowerCase().replace(/ /g,'-'))
    .rel('noopener')
    // .href(createExcel(props))
    .href(URL.createObjectURL(new Blob([s2ab(createExcel(props))],{type:"application/octet-stream"})))
    .click()
    .remove();
  },
  });
  const AimMaps = Object.create({
    async create(el, options) {
      if (!this.google) {
        // console.debug(Client.clients);
        const {serviceRoot} = Aim.config;
        const {origin} = new URL(serviceRoot);
        const client = Client.clients.find(client => client.origin === origin);
        const key = await client.api('/google/maps/key').get();
        await require('https://maps.googleapis.com/maps/api/js?libraries=places&key='+key);
      }
      options = options || Aim.config.maps.options;
      return new google.maps.Map(el, options);
    }
  });
  Elem = function (selector) {
    if (!selector) return;
    if (this.el = selector) {
      this.el.elem = this;
    }
    // const args = Array.from(arguments);
    // selector = args.shift();
    // // selector = element ? element : (Aim.Elem && Aim.Elem.tagnames.includes(selector) ? document.createElement(selector) : selector);
    // if (selector instanceof Element) {
    //   this.el = selector;
    // } else if (tagnames.includes(selector)) {
    //   this.el = document.createElement(selector);
    // } else {
    //   this.el = document.getElementById(selector) || document.querySelector(selector);
    // }
    // // this.el = this.el;
    // if (!this.el) return selector;
    // // if (!(this instanceof Elem)) return new Elem(...arguments);
    //
    // // this.el.selector = this.el.elem = this.el.el = this;
    // this.map = new Map();
    // if (args.length) {
    //   if (typeof this[this.el.id] === 'function') {
    //     // console.debug(elem.id);
    //     this[this.el.id](...args);
    //   } else {
    //     args.forEach(arg => {
    //       if (arg instanceof Object) {
    //         Object.assign(this.el, arg);
    //       } else if (typeof arg === 'string') {
    //         if ('className' in this) {
    //           this.innerHTML = this.el.innerHTML = arg;
    //         } else if (this.className = arg) {
    //           this.el.className = arg;
    //         }
    //       }
    //     })
    //   }
    // }
  };
  Object.assign(Elem, {
    tagnames: ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'frameset', 'frame', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', ],
    qrscan() {
      const {nav,elem,close} = new Panel;
      const videoElem = $('video').style('width:640px;height:480px;');
      const stateElem = $('div');
      elem.style('width:640px;height:480px;background:white;').append(
        stateElem,
        videoElem,
      );
      (async function () {
        await require(scriptPath+'lib/js/qrscan.js'); // jsQR

        videoElem.attr('playsinline', '');
        const canvasElem = $('canvas').style('display:none');
        const canvas = canvasElem.el.getContext("2d");
        function drawLine(begin, end, color) {
          canvas.beginPath();
          canvas.moveTo(begin.x, begin.y);
          canvas.lineTo(end.x, end.y);
          canvas.lineWidth = 4;
          canvas.strokeStyle = color;
          canvas.stroke();
        }
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            frameRate: {
              ideal: 5,
              max: 10
            }
          }
        }).then(function (stream) {
          // navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (stream) {
          const videostream = videoElem.el.srcObject = stream;
          nav.append(
            $('button').class('icn-back').type('button').on('click', event => {
              videostream.getTracks().forEach(track => track.stop());
              close();
            }),
          );
          videoElem.attr("playsinline", true); // required to tell iOS safari we don't want fullscreen
          videoElem.el.play();
          requestAnimationFrame(tick);
          function tick() {
            if (videoElem.el.readyState === videoElem.el.HAVE_ENOUGH_DATA) {
              canvasElem.el.hidden = false;
              canvasElem.el.height = videoElem.el.videoHeight;
              canvasElem.el.width = videoElem.el.videoWidth;
              canvas.drawImage(videoElem.el, 0, 0, canvasElem.el.width, canvasElem.el.height);
              var imageData = canvas.getImageData(0, 0, canvasElem.el.width, canvasElem.el.height);
              var code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert", });
              if (code && code.data) {
                console.debug(code.data);
                videostream.getTracks().forEach(track => track.stop());
                canvas.clearRect(0, 0, canvasElem.el.width, canvasElem.el.height);
                canvasElem.el.hidden = true;
                canvasElem.el.style.display = 'none';
                close();
                elem.emit('data', code.data);
                // alert(code.data);
                return;
                if (code.data.includes('aliconnect.nl')) {
                  $().ws().sendto(code.data.split('s=').pop(), {
                    path: '/?prompt=mobile',
                  }).then(body => {
                    if (body === 'request_id_token') {
                      $().ws().reply({
                        id_token: window.localStorage.getItem('id_token'),
                      }).then(body => {
                        if (body.prompt) {
                          panel = $().prompt(body.prompt);//.show(body.par);
                          panel.append(
                            $('div').text('JA NU LUKT HET, VRAAG OM ACCEPT'),
                          )
                        } else {
                          $().prompt('');
                        }
                      });
                    }
                  });
                }
              }
            }
            requestAnimationFrame(tick);
          }
        });
      }());
      return elem;
    },
  });
  Elem.prototype = {
    width(value) { return this.attr('width', value) },
    height(value) { return this.attr('height', value) },
    default() { return this.attr('default', '') },
    autoplay() { return this.attr('autoplay', '') },
    draggable(value) { return this.attr('draggable', true) },
    checked(value) { return this.attr('checked', value ? '' : null); },
    disabled(value) { return this.attr('disabled', value ? '' : null); },
    hasChildren(value) { return this.attr('hasChildren', value ? '' : null); },
    selected(value) { return this.attr('selected', value ? '' : null); },

    querySelector(selector, fn) {
      const el = this.el.querySelector(selector);
      if (fn) {
        if (el) {
          fn($(el));
        }
        return this;
      }
      if (el) return new Elem(el);
    },
    querySelectorAll(selector, fn) {
      if (fn) {
        Array.from(this.el.querySelectorAll(selector)).map(Aim).forEach(fn);
        return this;
      }
      return Array.from(this.el.querySelectorAll(selector)).map(el => new Elem(el));
    },

    hasAttribute() {
      return this.el.hasAttribute(...arguments);
    },
    getAttribute() {
      return this.el.getAttribute(...arguments);
    },
    removeAttribute() {
      this.el.removeAttribute(...arguments);
      return this;
    },
    setAttribute() {
      this.el.setAttribute(...arguments);
      return this;
    },

    highlight(options) {
      const rect = this.el.getBoundingClientRect();
      var {top,left,width,height} = rect;
      var {pos,size} = options;
      size = size || 80;
      left -= size/2;
      top -= size/2;
      top += height/2;
      if (pos === 'right') {
        left += width;
      } else {
        left += width/2;
      }

      // console.debug(rect);
      const elem = $('div')
      // .parent(this)
      .parent(document.body)
      .class('highlight')
      .style(`top:${top}px;left:${left}px;width:${size}px;height:${size}px;`).animate([
        { transform: 'scale(0%)' },
        { transform: 'scale(100%)' },
        { transform: 'scale(50%)' },
        { transform: 'scale(100%)' },
        // { transform: 'scale(0%)' },
      ], {
        duration: 1000,
        // iterations: 2,
        easing: 'ease-in-out',
        fill: 'forwards',
      });
      return elem;
      // setTimeout(() => elem.remove(), 1000);
      return this;
    },

    submit() { return this.emit('submit', ...arguments); },
    get children() { return Array.from(this.el.children).map(el => $(el)); },
    get firstChild() { return $(this.el.firstChild) },
    // get lastChild() { return $(this.el.lastChild) },

    attr(selector, context, save) {
      if (save && this.el.id) {
        $.localAttr.set(this.el.id, selector, context);
      }
      if (selector) {
        if (typeof selector === 'object') {
          Object.entries(selector).forEach(entry => this.attr(...entry));
        } else {
          if (arguments.length === 1) {
            return this.el.getAttribute(selector)
          } else if (context === null || context === undefined) {
            // console.debug(selector,context)
            this.el.removeAttribute(selector)
          } else if (typeof context === 'function') {
            this.on(selector, context)
          } else if (typeof context === 'object') {
            this.el[selector] = context;
            // } else if (selector in this.el) {
            //   this.el[selector] = context;
          } else if (this.el) {
            this.el.setAttribute(selector.replace(/ |%/g, ''), [].concat(context).join(' '))
          }
        }
      }
      return this;
    },
    append() {
      this.el = this.el || document.body;
      // const args = [].concat(...arguments);
      // console.debug(arguments, args);
      Array.from(arguments).forEach(arg => {
        if (typeof arg === 'string') {
          this.el.insertAdjacentHTML('beforeend', arg);
        } else if (Array.isArray(arg)) {
          arg.forEach(arg => this.append(arg));
        } else if (arg instanceof Elem) {
          this.el.append(arg.el);
        } else if (arg) {
          this.el.append(arg);
        }
      });
      // args.forEach(a => a ? this.el.append(typeof a === 'string' ? document.createTextNode(a) : a.el || a) : null);
      return this;
    },

    emit,
    on,
    forEach,

    clear() {
      // console.warn('CLEAR',this);
      this.el.innerText = '';
      return this;
    },
    /** Webcam object pera to pear */
    webcam(options, socketClient) {
      (async ()=>{
        await require(scriptPath+'lib/aim/js/web-cam.js');
        const webcam = new Webcam(options, this, socketClient);
        webcam.startChat(options);
      })();
      return this;
    },
    /** Camera */
    cam() {
      const video = this.video = $('video').parent(this).autoplay().on('click', event => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }).el;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          try {
            video.srcObject = stream;
          } catch (error) {
            video.src = window.URL.createObjectURL(stream);
          }
          video.play();
        });
      }
      return this;
    },
    paint(options) {
      require(scriptPath+'lib/aim/js/web-paint.js').then(() => new Paint(this.el, options));
      return this;
    },

    /** property: innerHTML, ophalen innerHTML en elem verwijderen  */
    get innerHTML() {
      const content = this.el.innerHTML;
      this.el.remove();
      return content;
    },
    /** property: innerHTML, ophalen innerHTML en elem verwijderen  */
    get outerHTML() {
      const content = this.el.outerHTML;
      this.el.remove();
      return content;
    },
    /**
    * Alle canvas omzetten naar images
    * @todo
    * @author Valentino Gagliardi <valentinoDOTvalentinog.com>
    * @param {param type} param name - description
    * @return {number} - The exponent power
    */
    convasToImg() {
      this.el.querySelectorAll("canvas").forEach(el => {
        var image = new Image();
        image.src = el.toDataURL();
        image.style = el.style;
        image.className = el.className;
        el.parentElement.insertBefore(image, el);
        el.remove();
      });
      return this;
    },
    /** Aanmaken index voor pagina
    */
    index(docelem) {
      docelem = $(docelem);
      const all = Array.from(docelem.el.querySelectorAll('a.anchor')).filter(el => el.nextElementSibling);
      if (all.length) {
        const topItem = docelem.topItem = all[0].parentElement;
        const elemTop = docelem.elemTop = docelem.el.getBoundingClientRect().top;
        const findAll = docelem.findAll = all.slice().reverse();
        const allmenu = docelem.allmenu = [];
        let i = 0;
        var li;
        var path = [];
        function addChapters (ul, level) {
          for (let elem = all[i]; elem; elem = all[i]) {
            // console.debug(elem);
            const tagLevel = Number(elem.nextElementSibling.tagName[1]);
            path.slice(0, tagLevel-1);
            // console.debug(path);
            const title = elem.getAttribute('title');
            path[tagLevel-1] = title.toLowerCase().replace(/ /g,'_');
            const name = elem.getAttribute('name');//path.join('-');
            // console.debug(i,title,name,tagLevel,level);
            if (tagLevel === level) {
              // $(elem).append(
              //   // $('a').attr('name', 'chapter' + i)
              //   $('a').attr('name', name)
              // );
              li = $('li').parent(ul).append(
                elem.a = $('a').text(title).href('#' + name).attr('target', '_self')
              );
              i++;
              allmenu.push(elem.a);
              // all.shift();
            } else if (li && tagLevel > level) {
              li.append(
                addChapters($('ul'), level + 1)
              )
            } else {
              return ul;
            }
          }
          return ul;
        }
        let to;
        // all.reverse();
        var lastScrollTop = 0;
        addChapters($('ul').parent(this.clear()), 1);
        const listItems = Array.from(this.el.querySelectorAll('li'));
        const linkItems = Array.from(this.el.querySelectorAll('a'));
        linkItems.forEach(el => $(el).on('click', event => event.stopPropagation()));
        const ulItems = Array.from(this.el.querySelectorAll('ul'));
        ulItems.forEach(el => $(el).on('click', event => {
          event.preventDefault();
          event.stopPropagation();
          el.parentElement.setAttribute('open', Number(el.parentElement.getAttribute('open')) ? 0 : 1);
        }));
        const openItems = ulItems.map(el => el.parentElement);
        openItems.forEach(el => el.setAttribute('open', 0));




        // console.debug(all,linkItems);

        function openIndex(event) {
          clearTimeout(to);
          to = setTimeout(() => {
            openItems.forEach(el => $(el).attr('open', 0));
            linkItems.forEach(el => $(el).attr('selected', null));
            const elem = findAll.find(el => el.getBoundingClientRect().top < elemTop - 48 - 36 + 2) || topItem;
            const name = elem.getAttribute('name');
            linkItems.filter(el => el.getAttribute('href') === "#"+name).forEach(asel => {
              $(asel).attr('selected', '').scrollIntoView();
              for (var el = asel; el; el = el.parentElement) {
                if (el.hasAttribute('open')) {
                  el.setAttribute('open', 1);
                }
              }
            });
          }, 500);
        }
        window.addEventListener('scroll', openIndex);
        // document.body.removeEventListener('scroll', docelem.onscroll);
        // document.body.addEventListener('scroll', docelem.onscroll);
        return this;
        // return $('ul').append(...[...this.el.querySelectorAll("h1, h2, h3")].map(elem => $('li').text(elem.innerText)))
        // this.addNextPreviousButtons()

      }
    },
    indexto(selector = 'aside.right') {
      const target = $(selector);
      docelem = this;
      docelem.el.querySelectorAll('h1, h2, h3').forEach((el,i) => el.parentElement.insertBefore($('a').class('anchor').title(el.innerText).name('chapter'+i).el, el))
      const all = Array.from(docelem.el.querySelectorAll('a.anchor')).filter(el => el.nextElementSibling);
      // console.log(all);

      if (all.length) {
        const topItem = docelem.topItem = all[0].parentElement;
        const elemTop = docelem.elemTop = docelem.el.getBoundingClientRect().top;
        const findAll = docelem.findAll = all.slice().reverse();
        const allmenu = docelem.allmenu = [];
        let i = 0;
        var li;
        var path = [];
        function addChapters (ul, level) {
          for (let elem = all[i]; elem; elem = all[i]) {
            // console.debug(elem);
            const tagLevel = Number(elem.nextElementSibling.tagName[1]);
            path.slice(0, tagLevel-1);
            // console.debug(path);
            const title = elem.getAttribute('title');
            path[tagLevel-1] = title.toLowerCase().replace(/ /g,'_');
            const name = elem.getAttribute('name');//path.join('-');
            // console.debug(i,title,name,tagLevel,level);
            if (tagLevel === level) {
              // $(elem).append(
              //   // $('a').attr('name', 'chapter' + i)
              //   $('a').attr('name', name)
              // );
              li = $('li').parent(ul).append(
                elem.a = $('a').text(title).href('#' + name).attr('target', '_self')
              );
              i++;
              allmenu.push(elem.a);
              // all.shift();
            } else if (li && tagLevel > level) {
              li.append(
                addChapters($('ul'), level + 1)
              )
            } else {
              return ul;
            }
          }
          return ul;
        }
        let to;
        // all.reverse();
        var lastScrollTop = 0;
        addChapters($('ul').parent(target.clear()), 1);
        const listItems = Array.from(target.el.querySelectorAll('li'));
        const linkItems = Array.from(target.el.querySelectorAll('a'));
        linkItems.forEach(el => $(el).on('click', event => event.stopPropagation()));
        const ulItems = Array.from(target.el.querySelectorAll('ul'));
        ulItems.forEach(el => $(el).on('click', event => {
          event.preventDefault();
          event.stopPropagation();
          el.parentElement.setAttribute('open', Number(el.parentElement.getAttribute('open')) ? 0 : 1);
        }));
        const openItems = ulItems.map(el => el.parentElement);
        openItems.forEach(el => el.setAttribute('open', 0));




        // console.debug(all,linkItems);

        function openIndex(event) {
          clearTimeout(to);
          to = setTimeout(() => {
            openItems.forEach(el => $(el).attr('open', 0));
            linkItems.forEach(el => $(el).attr('selected', null));
            const elem = findAll.find(el => el.getBoundingClientRect().top < elemTop - 48 - 36 + 2) || topItem;
            const name = elem.getAttribute('name');
            linkItems.filter(el => el.getAttribute('href') === "#"+name).forEach(asel => {
              $(asel).attr('selected', '').scrollIntoView();
              for (var el = asel; el; el = el.parentElement) {
                if (el.hasAttribute('open')) {
                  el.setAttribute('open', 1);
                }
              }
            });
          }, 500);
        }
        window.addEventListener('scroll', openIndex);
        // document.body.removeEventListener('scroll', docelem.onscroll);
        // document.body.addEventListener('scroll', docelem.onscroll);
        return this;
        // return $('ul').append(...[...this.el.querySelectorAll("h1, h2, h3")].map(elem => $('li').text(elem.innerText)))
        // this.addNextPreviousButtons()

      }
    },


    svg(src) {
      Aim.fetch(src).get().then(body => body.match(/^<svg/) ? this.html(body.replace(/ clip-path="url\(#clip\d\)"/g,'').replace(/<svg width="(\d+)" height="(\d+)"/, '<svg viewBox="0 0 $1 $1"')) : null);
      return this;
    },
    chart(config) {
      (async () => {
        await require(scriptPath+'lib/amcharts4/core.js');
        await require(scriptPath+'lib/amcharts4/charts.js');
        // await require(scriptPath+'lib/amcharts4/themes/dark.js');
        // const {name,category,value,rows} = config;
        // const {name,category,value,rows} = config;
        // const data = {};
        // console.debug(config,rows);
        // rows.forEach(row => {
        //   const cat = data[row[category]] = data[row[category]] || {category: String(row[category])};
        //   cat[row[name]] = (cat[row[name]] || 0) + row[value];
        // });
        // config.series = rows.map(row => String(row[name])).unique().map(name => Object.assign({
        //   dataFields: { valueX: name, valueY: name, categoryX: "category", categoryY: "category", },
        //   name,
        // },config.series));


        // console.debug(data,config);

        // config.data = Object.values(data);
        // console.debug(config);
        // await Web.require('https://aliconnect.nl/lib/amcharts4/animated.js');
        // config = config || {
        //   cursor: { type: "XYCursor", behavior: "zoomY" },
        //   legend: { type: "Legend", position: "right" },
        //   scrollbarX: { type: "XYChartScrollbar", scrollbarX: "scrollbarX" },
        //   yAxes: [{ type: "CategoryAxis", renderer: { minGridDistance: 20, grid: { location: 0 } }, dataFields: { category: "category" } }],
        //   xAxes: [{ type: "ValueAxis" }],
        // };
        //
        // config.series = rows.map(row => String(row.name)).unique().map(name => Object.assign({
        //   type: "ColumnSeries",
        //   dataFields: { valueX: name, categoryY: "category" },
        //   name,
        //   //fill: "#FAFAFA",
        //   strokeWidth: 1,
        //   stroke: '#FAFAFA',
        //   columns: { tooltipText: "[bold]{name}[/]\n[font-size:14px]{categoryY}: {valueX}" },
        //   bullets: [
        //     { type: "LabelBullet", locationX: 0.5, label: { text: "{valueX}", fill: "black" } }
        //   ],
        //   // stacked: true,
        // }, config.series));
        // console.debug(config);
        // config.data = rows.map(row => String(row.category)).unique().map(category => Object.assign({
        //   category: category
        // }, Object.fromEntries(config.series.map(s => [s.name, rows.filter(r=>r.name==s.name && r.category==category).map(r=>r.value||0).reduce((a,b)=>a + b)]))));
        // rows.forEach(row => config.data.find(data => String(data.category).toLowerCase() == String(row.category).toLowerCase())[row.name] += Number(row.value));
        // config.data.sort((a,b) => b.category.localeCompare(a.category));
        // config.series.sort((a,b) => a.name.localeCompare(b.name));

        // var chart = am4core.createFromConfig(config, this.el, "XYChart");
        // am4core.useTheme(am4themes_dark);
        var chart = am4core.createFromConfig(config, this.el, config.type);
        // console.debug(chart);
        Array.from(this.el.querySelectorAll('g')).find(el => el.getAttribute('aria-labelledby') && el.getAttribute('aria-labelledby').split('-').pop() === 'title').remove();
      })();
      return this;
    },
    graph(data) {
      const el = this.el;
      /**
      {
        "nodeDataArray": [
          { key: 1, text: "Alpha", fill: "lightblue", stroke: 'red', strokeWidth: 3 },
          { key: 2, text: "Beta", fill: "orange" },
          { key: 3, text: "Gamma", fill: "lightgreen", group: 5 },
          { key: 4, text: "Delta", fill: "pink", group: 5 },
          { key: 5, text: "Epsilon", fill: "green", isGroup: true },
        ],
        linkDataArray: [
          { from: 1, to: 2, stroke: "blue", fill:'red', },
          { from: 2, to: 2 },
          { from: 3, to: 4, stroke: "green" },
          { from: 3, to: 1, stroke: "purple", strokeWidth: 5 },
        ],
        layout: {
          direction: 0,
          direction: 90,
          direction: 180,
          direction: 270,
          layerSpacing: 25,
          columnSpacing: 25,
          cycleRemoveOption: 'CycleDepthFirst',
          cycleRemoveOption: 'CycleGreedy',
          layeringOption: 'LayerLongestPathSource',
          layeringOption: 'LayerLongestPathSink',
          layeringOption: 'LayerOptimalLinkLength',
          initializeOption: 'InitDepthFirstOut',
          initializeOption: 'InitDepthFirstIn',
          initializeOption: 'InitNaive',
          aggressiveOption: 'AggressiveNone',
          aggressiveOption: 'AggressiveMore',
          aggressiveOption: 'AggressiveLess',
        }
      }
      */
      (async () => {
        await require(scriptPath+'lib/go/go.js');
        let {nodeDataArray,linkDataArray,layout} = data;
        var $ = go.GraphObject.make;
        var myDiagram = $(
          go.Diagram,
          el,
          {
            initialContentAlignment: go.Spot.Center, // center Diagram contents
            // "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
            // initialAutoScale: go.Diagram.UniformToFill,
            layout: $(go.LayeredDigraphLayout),
          }
        );
        myDiagram.groupTemplate = $(
          go.Group,
          "Vertical",
          {
            selectionObjectName: "PANEL",  // selection handle goes around shape, not label
            ungroupable: true  // enable Ctrl-Shift-G to ungroup a selected Group
          },
          $(
            go.TextBlock,
            {
              //alignment: go.Spot.Right,
              font: "bold 19px sans-serif",
              isMultiline: false,  // don't allow newlines in text
              editable: true  // allow in-place editing by user
            },
            new go.Binding("text", "text").makeTwoWay(),
            new go.Binding("stroke", "color")
          ),
          $(
            go.Panel,
            "Auto",
            {
              name: "PANEL"
            },
            $(
              go.Shape,
              "Rectangle",  // the rectangular shape around the members
              {
                fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3,
                portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                // allow all kinds of links from and to this port
                fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
              }
            ),
            $(
              go.Placeholder,
              {
                margin: 10,
                background: "transparent"
              }
            )  // represents where the members are
          ),
          { // this tooltip Adornment is shared by all groups
            toolTip: $(
              "ToolTip",
              $(
                go.TextBlock,
                {
                  margin: 4
                },
                // bind to tooltip, not to Group.data, to allow access to Group properties
                new go.Binding("text", "", function groupInfo(adornment) {  // takes the tooltip or context menu, not a group node data object
                  var g = adornment.adornedPart;  // get the Group that the tooltip adorns
                  var mems = g.memberParts.count;
                  var links = 0;
                  g.memberParts.each(part => {
                    if (part instanceof go.Link) links++;
                  });
                  return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
                }).ofObject()
              )
            ),
            // the same context menu Adornment is shared by all groups
            // contextMenu: partContextMenu
          }
        );
        myDiagram.nodeTemplate = $(
          go.Node,
          "Spot",
          {
            locationSpot: go.Spot.Center,
          },
          $(
            go.Shape,
            "Rectangle",
            {
              fill: "lightgray",  // the initial value, but data binding may provide different value
              stroke: null,
              desiredSize: new go.Size(30, 30),
            },
            new go.Binding("fill", "fill"),
            new go.Binding("stroke", "stroke"),
            new go.Binding("strokeWidth", "strokeWidth")
          ),
          $(
            go.TextBlock,
            new go.Binding("text", "text")
          )
        );
        myDiagram.linkTemplate = $(
          go.Link,
          {
            toShortLength: 3,
            relinkableFrom: true, // allow the user to relink existing links
            relinkableTo: true, // allow the user to relink existing links
            selectable: false,
          },
          $(
            go.Shape,
            {
              strokeWidth: 3,
              stroke: "#333",
            },
            new go.Binding("stroke", "stroke"),
            new go.Binding("strokeWidth", "strokeWidth")
          ),
          $(
            go.Shape,
            {
              toArrow: "OpenTriangle",
              stroke: "#333",
              fill: null
            },
            new go.Binding("fill", "fill"),
            new go.Binding("stroke", "stroke")
          ),
        );
        layout = layout || {};
        layout.cycleRemoveOption = go.LayeredDigraphLayout[layout.cycleRemoveOption];
        layout.layeringOption = go.LayeredDigraphLayout[layout.layeringOption];
        layout.initializeOption = go.LayeredDigraphLayout[layout.initializeOption];
        layout.aggressiveOption = go.LayeredDigraphLayout[layout.aggressiveOption];
        var lay = Object.assign(myDiagram.layout,layout);
        lay.packOption = parseInt(0, 10);
        // lay.packOption |= parseInt(1, 10);
        // lay.packOption |= parseInt(2, 10);
        lay.packOption |= parseInt(4, 10);
        lay.setsPortSpots = false;
        myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        myDiagram.alignDocument(go.Spot.Center, go.Spot.Center);
      })();
      return this;
    },
    three(data) {
      console.debug(data);
      setTimeout(async () => {
        const {el} = this;
        const {clientWidth,clientHeight} = el;
        let {src,floor,walls,stockpos} = data;
        let controls;
        await require(scriptPath+'lib/three/three.js');
        const scene = new THREE.Scene();
        scene.add( new THREE.HemisphereLight() );
        let camera = new THREE.PerspectiveCamera( 50, clientWidth / clientHeight, 1, 10 );
        camera.fov = data.camera.fov || camera.fov;
        camera.near = data.camera.near || camera.near;
        camera.far = data.camera.far || camera.far;
        camera.position.x = data.camera.posX || camera.position.x;
        camera.position.y = data.camera.posY || camera.position.y;
        camera.position.z = data.camera.posZ || camera.position.z;

        const directionalLight = new THREE.DirectionalLight( 0xffeedd );
        directionalLight.position.set( 0, 0, 2 );
        scene.add( directionalLight );
        const renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( clientWidth, clientHeight );
        this.append( renderer.domElement );
        if (data.hasControls) {
          animate();
        }
        function resize() {
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( clientWidth, clientHeight );
        }
        function animate() {
          controls.update();
          renderer.render( scene, camera );
          requestAnimationFrame( animate );
        }
        if (data.controls) {
          if (data.controls === 'trackbal') {
            await require(scriptPath+'lib/three/controls/TrackballControls.js');
            controls = new THREE.TrackballControls( camera, renderer.domElement );
          } else if (data.controls === 'orbit') {
            await require(scriptPath+'lib/three/controls/OrbitControls.js');
            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.zoomSpeed = 0.2;
            // controls.addEventListener('change', event => renderer.render(scene, camera));
          }
          animate();
        } else {
          setTimeout(() => renderer.render( scene, camera ),200);
        }
        if (src && src.split('.').pop() === '3ds') {
          await require(scriptPath+'lib/three/loaders/TDSLoader.js');
          var loader = new THREE.TDSLoader( );
          loader.load( src, function ( object ) {
            scene.add( object );
            setTimeout(() => renderer.render( scene, camera ));
          } );
        } else {
          let mesh;
          // const {floor,walls,stockpos} = data;
          THREE.Mesh.prototype.setPosition = function(x,y,z) {
            // console.debug(this, this.geometry.parameters);
            this.position.x = -floor.width/2 + x + this.geometry.parameters.width/2;
            this.position.z = floor.depth/2-z-this.geometry.parameters.depth/2;
            this.position.y = y + this.geometry.parameters.height/2;
            this.material.opacity = 0.1;
            // this.up.y=0;
            return this;
          };
          THREE.Mesh.prototype.pos = function(x,y,z) {
            // console.debug(this, this.geometry.parameters);
            this.position.set(x,y,z);
            return this;
          };
          init();
          function init() {

            // console.debug(123, data.camera.y, floor.width/5, data)
            //
            // camera.position.y = data.camera.y || floor.width/5 || camera.position.y;
            // camera.position.z = data.camera.z || floor.width/2 || camera.position.z;

            holder = new THREE.Group();
            el.appendChild( renderer.domElement );
            var floorMaterial = new THREE.MeshBasicMaterial({ color: floor.color });
            var floorGeometry = new THREE.PlaneGeometry(floor.width, floor.depth, 0, 0);
            var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
            floorMesh.rotation.x = -Math.PI / 2;
            // floorMesh.position.y = -10;
            holder.add(floorMesh);
            scene.add( holder );
            // holder.position.y = -200;
            // holder.rotation.x = -Math.PI / 2;
            function hsl(h, s, l) {
              return (new THREE.Color()).setHSL(h, s, l);
            }
            function box(width, height, depth, material = {color: 0x888888}) {
              return new THREE.Mesh(
                new THREE.BoxGeometry( width, height, depth ),
                new THREE.MeshPhongMaterial (material),
              )
            }
            Object.values(walls).forEach(wall => holder.add(box(wall.width,wall.height,wall.depth,wall.mat).setPosition(wall.left||0, wall.bottom||0, wall.distance||0)));
            // var light = new THREE.PointLight( 0xff0000, 1, 100 );
            // light.position.set( 50, 50, 50 );
            // holder.add( light );
            //
            // var light = new THREE.PointLight(0xffffff, 0.8, 0, 20);
            // camera.add(light);
            var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
            light.position.set(0, 5000, 5000);
            holder.add(light);
            var light = new THREE.DirectionalLight(0xFFFFFF, 1);
            var light = new THREE.PointLight(0xffffff, 0.8, 0, 1000);
            light.position.set(0,5000,-5000);
            holder.add(light);
            // var light = new THREE.PointLight(0x0000ff, 0.8, 0, 1000);
            // light.position.set(0,5000,-5000);
            // holder.add(light);
            // holder.add(box(100,100,100,{color:'red'}).pos(0,5000,0));
            // var light = new THREE.PointLight(0xffffff, 0.8, 0, 20);
            // light.position.set(5000 , 5000, 5000);
            // holder.add(light);
            // return;
            // console.debug(data.stockpos,Array.from(data.stockpos));
            data.stockpos.parameters = {width:floor.width,depth:-floor.depth};
            data.stockpos.mesh = holder;
            (function addpos(stockpos) {
              // console.debug(stockpos);
              const parameters = stockpos.parameters || {};
              for (var i=1,pos; i in stockpos; i++) {
                const pos=stockpos[i];
                if (!pos) continue;
                const ppos = pos.pos || {};
                const box = pos.box || {};

                const width = pos.width || box.width;
                const height = pos.height || box.height;
                const depth = pos.depth || box.depth;
                const left = pos.left || ppos.left || 0;
                const up = pos.up || ppos.up || 0;
                const distance = pos.distance || ppos.distance || 0;
                const dleft = pos.dleft || ppos.dleft || 0;
                const dup = pos.dup || ppos.dup || 0;
                const ddistance = pos.ddistance || ppos.ddistance || 0;
                // parent[i] = pos;
                // pos.i = i;
                // console.debug(pos,ppos,i,);
                let [px,py,pz] = [
                  left + dleft*(i-1) - (parameters.width||0)/2,
                  up + dup*(i-1) - (parameters.height||0)/2,
                  -distance - ddistance*(i-1) - (parameters.depth/2||0),
                ];
                if (width || height || depth) {
                  const geo = pos.geo = new THREE.BoxGeometry(width,height,depth);
                  pos.parameters = geo.parameters;
                  const edges = new THREE.EdgesGeometry( geo );
                  const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x777777 } ) );
                  px += geo.parameters.width/2;
                  py += geo.parameters.height/2;
                  pz += geo.parameters.depth/2;
                  line.position.set(px,py,pz);
                  stockpos.mesh.add(line);
                  // pos.mesh = new THREE.Mesh(geo,material);
                  pos.mesh = new THREE.Group();
                } else {
                  pos.mesh = new THREE.Group();
                  pos.parameters = {};
                }
                pos.mesh.position.set(px,py,pz);
                stockpos.mesh.add(pos.mesh);
                addpos(pos);
              }
            })(data.stockpos);
            // console.debug(data.stockpos);
            // data.stockpos[1][1][1].mesh.material.opacity = 0.3;
            // data.stockpos[1][2][3].mesh.material.opacity = 0.3;
            // data.stockpos.forEach(pos => {
            //   if (Math.random()<0.05) pos.mesh.material.opacity = 0.3;
            // })
          }
          data.pickpos.forEach(p => {
            const [a,b,c] = p.pos;
            if (
              data.stockpos[Number(a)] &&
              data.stockpos[Number(a)][Number(b)] &&
              data.stockpos[Number(a)][Number(b)][Number(c)]
            ) {
              const stockpos = data.stockpos[Number(a)][Number(b)][Number(c)];
              if (stockpos.mesh) {
                const material = new THREE.MeshBasicMaterial ({
                  color: 'yellow',
                  opacity: 0,
                  // transparent: true,
                });
                stockpos.mesh.add(new THREE.Mesh(stockpos.geo,material));
                // console.debug(mesh.material, p.color, 0xffffff);
                // mesh.material.opacity = p.opacity || 1;
                // mesh.material.color.setHex( p.color || 0xffffff );
              }
            }
          })
        }
        $(window).on('resize', resize, false).emit('resize');
      });
      return this;
    },

    googleMap(rows, options = {zoom:10}) {
      const {el} = this.class('googlemap');
      (async function() {
        const map = await AimMaps.create(el, options);
        var bounds = new google.maps.LatLngBounds();
        const geocoder = new google.maps.Geocoder();
        function placemarker(row) {
          var {location,title,scale,fillColor,fillOpacity,strokeColor,strokeWeight} = row;
          // console.debug({fillColor,fillOpacity,strokeColor,strokeWeight});
          if (typeof location === 'string') {
            var [lat,lng] = location.split(',').map(Number);
            location = {lat,lng};
          }
          // if (typeof position === 'string') {
          //   var [lat,lng] = position.split(',').map(Number);
          // }
          // map.setCenter(results[0].geometry.location);
          var path = "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z";
          // anchor: new google.maps.Point(-25, -35),
          const marker = new google.maps.Marker({
            position: location,
            map,
            title,
            row,
            // zIndex: 1,
            icon: {
              path,
              scale,
              fillColor,
              fillOpacity,
              strokeWeight,
              strokeColor,
              rotation: 0,
            },
            // icon: (row.state) ? 'icon/' + row.state.value + '.png' : null,
          });
          // marker.addListener('click', event => $('view').show(item));
          marker.addListener('click', event => row.select());
          bounds.extend(marker.getPosition());
          map.fitBounds(bounds);
        }
        // console.debug(rows);
        rows.filter(row => row.location).forEach(row => placemarker(row));
        // rows.filter(row => !row.position && row.address).forEach(row => {
        //   const {address} = row;
        //   geocoder.geocode({address}, function(results, status) {
        //     if (status === 'OK') {
        //       row.position = results[0].geometry.location;
        //       console.debug(row.position.lat(),row.position.lng());
        //       placemarker(row);
        //     } else {
        //       alert('Geocode was not successful for the following reason: ' + status);
        //     }
        //   })
        // });
        const {zoom} = options;
        if (google.maps.event) {
          google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
            this.setZoom(Math.min(zoom, this.getZoom()));
            // this.setZoom(zoom);
            // zoom
          });
        }
      })();
      return this;
    },
    googleRoute(rows) {
      // const {el} = this.class('googlemap');
      const pages = document.querySelector('.pages');
      if (pages) pages.innerText = '';
      console.debug(rows);
      rows.forEach(row => {
        var {location} = row;
        if (typeof location === 'string') {
          var [lat,lng] = location.split(',').map(Number);
          location = {lat,lng};
        }
        row.location = location;
      });
      // types.route = () => $('div').class('row').append(
      //   $('div').css('flex: 1 0 0;min-height: 600px;').googleRoute(rowsVisible.filter(row => row.location)),
      //   $('div').class('pv').style('display:flex;flex-direction:column;'),
      // );


      this.class('row').append(
        this.mapElem = $('div').css('flex: 1 0 0;min-height: 600px;').class('googlemap'),
        this.directionsElem = $('div').class('directions pageview').style('display:flex;flex-direction:column;background:white;overflow:overlay;'),
      );
      (async () => {
        const map = await AimMaps.create(this.mapElem.el);
        // const routePlanElem = $('.routeplan').parent('.col.list>div').append(
        //   $('div').class('directions').style('background:white;overflow:overlay;'),
        //   $('div').class('total'),
        // );
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          panel: document.querySelector('.directions'),//document.getElementById("panel"),
          draggable: true,
        });
        directionsRenderer.addListener("directions_changed", () => {
          const directions = directionsRenderer.getDirections();
          if (directions) {
            computeTotalDistance(directions);
          }
        });
        const {company} = Aim.config.client;
        const {businessAddress} = company || {};
        const {street,postalCode,city,state,country} = businessAddress || {};
        const home = [street,postalCode,city,state,country].join(',');
        displayRoute(
          home,
          home,
          directionsService,
          directionsRenderer
        );
        function displayRoute(origin, destination, service, display) {
          service
          .route({
            origin,
            destination,
            // waypoints: rows.filter(row => row.address).map(row => Object({location: row.address})),
            waypoints: rows.filter(row => row.location).map(row => Object({location: row.location})),
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls: true,
          })
          .then((result) => display.setDirections(result))
          .catch((event) => alert("Could not display directions due to: " + event));
        }
        function computeTotalDistance(result) {
          let total = 0;
          const myroute = result.routes[0];
          if (!myroute) return;
          for (let i = 0; i < myroute.legs.length; i++) {
            total += myroute.legs[i].distance.value;
          }
          total = total / 1000;
          $('div').parent('.directions').text("Totaal reisafstand",num(total) + " km");//document.querySelector('.directions>.total').innerHTML = total + " km";
        }
      })();
      return this;
    },

    assign(selector, context) {
      if (typeof selector === 'string') {
        this.el[selector] = context;
      } else if (selector instanceof Object) {
        Object.assign(this.el, context);
      }
      // //console.debug(this.el);
      return this;
    },
    btns(selector, context) {
      const elem = $('nav').parent(this).class('row btns');
      function btn(selector, context) {
        if (typeof selector === 'object') {
          return Object.entries(selector).forEach(entry => btn(...entry));
        }
        $(context.href ? 'a' : 'button').parent(elem).class('abtn').name(selector).text(selector).attr(context)
      }
      [].concat(...arguments).forEach(
        selector => typeof selector !== 'object' ? null : (
          selector.name
          ? btn(selector.name, selector)
          : Object.entries(selector).forEach(entry => btn(...entry))
        )
      );
      return this;
    },
    cancel() {
      this.el.innerText;
      // if (this.el.innerText) {
      // 	if (this.selector.contains(this.form)) {
      // 		this.form.remove();
      // 	} else {
      // 		this.selector.innerText = '';
      // 	}
      // 	return this;
      // } else {
      // 	return false;
      // }
      // el.innerText = '';
      // targetElement.item = null;
      // if ($.show) $.show({ id: 0 });
      // if (window.onWindowResize) window.onWindowResize();
    },
    caption() {
      return this.attr('caption', __(...arguments))
    },
    calendar(data) {
      new Calendar(data, this);
      return this;
    },
    calendar(data) {
      (async () => {
        if (!this.Calendar) {
          await require(scriptPath+'lib/aim/js/web-calendar.js');
          $('link').attr('rel', 'stylesheet').attr('href', scriptPath+'lib/aim/css/web-calendar.css').parent(document.head);
        }
        Calendar.init(data, this);
        // console.debug(Ganth);
      })();
      // setTimeout(() => new Ganth(data, this));
      return this;
    },
    chat(selector, context) {
      const $chat = this.sections.get('chat', selector => {
        $().main().append(
          selector = $('section').id('chat-room').append(
            $('div').id('videos').append(
              $('video').id('self-view').attr('autoplay', ''),
              $('video').id('remote-view').attr('autoplay', ''),
            )
          ),
        );
        return selector;
      });
      return this;
    },
    class(className, condition) {
      // console.warn(className, condition, condition instanceof Boolean, Array.from(arguments).join(' ').trim().split(' ').filter(Boolean));
      // console.warn(className, condition, typeof condition);
      if (['boolean','number'].includes(typeof condition)) this.el.classList.toggle(className, condition);
      else this.el.classList.add(...Array.from(arguments).join(' ').trim().split(' ').filter(Boolean));
      // this.el.className = [].concat(this.el.className.split(' '), [...arguments]).unique().join(' ').trim();
      // this.el.className = [...arguments].join(' ').trim();
      // console.debug(this);
      return this;
    },
    code(content, format) {
      this.class('code');
      if (typeof content === 'function') {
        format = 'js';
        content = String(content).replace(/^(.*?)\{|\}$/g,'');
      }
      content = format && $.string[format] ? $.string[format](content) : content;
      this.el.innerHTML = content;
      return this;
    },
    contextmenu(menu) {
      this.el.contextmenu = menu;
      return this;
    },
    messagesPanel() {
      this.append(
        $('div')
        .class('col err')
        .append(
          $('div').class('row err hdr').append(
            $('span').class('').clear(),
            $('span').class('').text('System'),
            $('span').class('aco').text('Message'),
            $('span').class('time').text('Start'),
            $('span').class('time').text('Accept'),
            $('span').class('time').text('End'),
          ),
          $().elemMessages = $('div').class('col aco'),
        ),
      );
      return this;
    },
    css(selector, value) {
      if (value !== undefined) {
        const args = [...arguments];
        const elem = this.el || this.selector;
        if (selector instanceof Object) {
          Object.entries(selector).forEach(entry => arguments.callee.call(this, ...entry))
        } else {
          const css = elem.style.cssText.split(';').filter(s => s.trim()).filter(s => s.split(':')[0].trim() !== selector);
          if (value === '') {
            css.push(selector);
          } else if (value === null) {
          } else {
            css.push(`${selector}:${value}`);
            // let id = elem === document.body ? '_body' : elem.id;
            // if (id) {
            // 	let css = localStorage.getItem('css');
            // 	css = css ? JSON.parse(css) : {};
            // 	(css[id] = css[id] || {})[selector] = value;
            // 	localStorage.setItem('css', JSON.stringify(css));
            // }
          }
          elem.style.cssText = css.join(';');
        }
      }
      return this;
    },
    displayvalue(selector) {
      if (this.el.item) {
        this.text(this.el.item.displayvalue(selector));
      }
      return this;
    },
    // draw: paint,
    insertBefore(newNode, referenceNode) {
      console.debug(newNode, referenceNode);
      this.el.insertBefore(newNode.el || newNode, referenceNode ? referenceNode.el || referenceNode : null)
    },
    extend() {
      $.extend(this, ...arguments);
      return this;
    },
    edit(item) {
      console.debug('EDIT', item);
      item.editing = true;
      item.onloadEdit = false;
      function stopVideo() {
        var c = document.getElementsByTagName('video');
        for (var i = 0, event; event = c[i]; i++) {
          event.pause();
        }
      }
      function users() {
        return;
        // TODO: Item Users
        return ['A', 'c ' + row.ID, row.Value || ($.getItem(row.tag) ? $.getItem(row.tag).Title : row.ID), {
          onclick: Web.Element.onclick,
          id: row.ID,
          // innerText: row.Value || ($.getItem(row.tag] ? $.getItem(row.tag].Title : row.ID),
        },[
          ['BUTTON', {
            type: 'BUTTON',
            row: row,
            onclick: $.removeUser = (event)=>{
              event.preventDefault();
              event.stopPropagation();
              // //console.debug();
              new $.HttpRequest($.config.$, 'DELETE', `/${this.tag}/Users(${event.target.row.ID})`, event => {
                //console.debug(event.target.responseText);
              }).send();
              event.target.parentElement.remove();
              inputElement.focus();
              return false;
            }
          }]
        ]];
      }
      item.elemFiles = $('div').files(item, 'Files');
      function openDialog (accept) {
        $('input').type('file').multiple(true).accept(accept).on('change', event => {
          if (event.target.files) {
            [...event.target.files].forEach(item.elemFiles.appendFile)
          }
        }).click().remove()
      }
      const buttons = {
        attach: () => openDialog(''),
        image: () => openDialog('image/*'),
        camera: () => {
          const panelElem = $('div').parent(document.querySelector('#section_main')).class('col aco abs panel').append(
            $('nav').class('row top abs btnbar np').append(
              $('span').class('aco'),
              $('button').class('icn-draw_image').on('click', this.openFreedraw = event => {
                window.event.stopPropagation();
                buttons.freedraw().canvas.context.drawImage(this.cam.video, 0, 0, this.canvas.width, this.canvas.height);
                return this;
              }),
              $('button').class('icn-save').on('click', event => {
                window.event.stopPropagation();
                this.openFreedraw().save().closeFreedraw();
                //
                // const video = this.cam.video;
                // const canvasElem = $('canvas').parent(panelElem).width(video.videoWidth).height(video.videoHeight).draw();
                // const canvas = canvasElem.paint._canvas;
                // const context = canvasElem.paint._ctx;
                // context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // canvas.toBlob(blob => {
                //   item.elemFiles.appendFile(new File([blob], `image_${new Date().toISOString().replace(/\.|:|Z|-/g,'')}.png`));
                //   // canvas.remove();
                // });
              }),
              $('button').class('icn-close').on( 'click', this.closeCam = event => panelElem.remove() )
              // this.panelElem
            ),
            this.cam = $('div').class('aco').cam()
          )
        },
        freedraw: () => {
          const panelElem = $('div').parent(document.querySelector('#section_main')).class('col aco abs panel').append(
            $('nav').class('row top abs btnbar np').append(
              $('span').class('aco'),
              $('button').class('icn-clean').on('click', event => {
                this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
              }),
              $('button').class('icn-save').on('click', this.save = event => {
                window.event.stopPropagation();
                this.canvas.toBlob(blob => {
                  item.elemFiles.appendFile(new File([blob], `image.png`));
                });
                return this;
              }),
              $('button').class('icn-close').on( 'click', this.closeFreedraw = event => panelElem.remove() )
              // this.panelElem
            ),
            this.canvasElem = $('canvas').width(640).height(480).draw()
          );
          this.canvas = this.canvasElem.el;
          return this;
        },
        close() {
          const {serviceRoot} = Aim.config;
          const {origin} = new URL(serviceRoot);
          $().send({
            body: {
              notify: {
                title: `${item.header0} modified`,
                options:  {
                  body: `Bla Bla`,
                  icon: origin + '/favicon.ico',
                  image: origin + '/shared/265090/2020/07/09/5f0719fb8fa69.png',
                  data: {
                    url: document.location.href,
                  },
                  // actions: [
                  //   {
                  //     action: 'new',
                  //     title: 'New',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   {
                  //     action: 'open',
                  //     title: 'Open',
                  //     // icon: 'https://aliconnect.nl/favicon.ico',
                  //   },
                  //   // {
                  //   //   action: 'gramophone-action',
                  //   //   title: 'gramophone',
                  //   //   icon: '/images/demos/action-3-128x128.png'
                  //   // },
                  //   // {
                  //   //   action: 'atom-action',
                  //   //   title: 'Atom',
                  //   //   icon: '/images/demos/action-4-128x128.png'
                  //   // }
                  // ]
                }
              }
            }
          });
          // return;
          // var notification = new Notification('sadfasd');
          // notification.onclick = function(event) {
          //   console.debug('CLICKED');
          //   window.focus();
          //   // window.open("http://www.stackoverflow.com");
          //   // window.location.href = 'https://aliconnect.nl';
          // }
          // notification.onclick = event => {
          //   console.debug('CLICKED');
          //   window.focus();
          // }
          // return;
          //
          // $().notify(`${item.header0} modified`, {
          //   body: `Bla Bla`,
          //   url: 'https://moba.aliconnect.nl',
          //   icon: 'https://aliconnect.nl/favicon.ico',
          //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
          //   data: {
          //     href: document.location.href,
          //     url: 'test',
          //   },
          // });
          return $('view').show(item)
        },
      };
      const edit = $('div').parent(this).class('col aco abs').append(
        $('nav').class('row top abs btnbar np').append(
          $('span').class('aco'),
          Object.entries(buttons).map(([name, fn])=>$('button').class('icn-'+name).on('click', fn))
        ),
        this.header(item),
        $('form').class('oa aco').append(
          item.elemFiles,
        ).properties(item.properties),
      );
      return this;
    },
    markup(lang) {
      // const replace = {
      //   yaml(str) {
      //     return str
      //     .replace(/\n/g, '')
      //     .replace(/^(.*?)(#.*?|)$/, (s,codeString,cmt) => {
      //       return codeString
      //       .replace(/^(\s*)(.+?):/, '$1<span class="hl-fn">$2</span>:')
      //       .replace(/: (.*?)$/, ': <span class="hl-string">$1</span>')
      //       + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
      //     });
      //   }
      // };
      // this.el.innerHTML = replace.yaml(this.el.innerText);
      console.debug(this.el.innerText);
      this.el.innerHTML = this.el.innerText.code(lang).split(/\n/).join('</div><div>');
      this.el.markup = true;
      return this;
    },

    editor(lang) {
      // const statusbar =
      // setTimeout(() => {
      //   console.debug('EDITOR', this.parentElement);
      //   this.parentElement.insertBefore($('div').text('ja'), this.nextSibling)
      // })
      // this.parentElement.insertBefore($('div').text('pos'), this.nextSibling);
      console.debug(lang);
      this.class('code-editor');
      const his = [];
      const elem = this.el;
      const rectContainer = this.el.getBoundingClientRect();
      const html = this.el.innerHTML = lang ? elem.innerText.code(lang).split(/\n/).map(s => `<div>${s}</div>`).join('') : elem.innerText;
      // const html = this.el.innerHTML = elem.innerText;
      console.debug(html);
      let rows;
      let selLine;
      // console.debug(html);
      function toggleOpen (el, open) {
        if (open === -1) {
          return s.removeAttribute('open');
        }
        if (el.hasAttribute('open')) {
          open = open === undefined ? el.getAttribute('open') ^1 : open;
          el.setAttribute('open', open);
          for (var s = el.nextSibling;s;s = s.nextSibling) {
            if (s.level <= el.level) break;
            if (open) {
              if (s.level<=el.level + 2) {
                s.removeAttribute('hide');
              }
            } else {
              s.setAttribute('hide', '');
              if (s.hasAttribute('open')) {
                s.setAttribute('open', 0);
              }
            }
          }
        }
      }
      this.on('click', event => {
        if (event.offsetX<0) {
          toggleOpen(event.target);
        }
      });
      function checkOpen(el, open = 1) {
        if (!el) return;
        el.level = el.innerText.search(/\S/);
        if (el.nextSibling && el.nextSibling.innerText) {
          el.nextSibling.level = el.nextSibling.innerText.search(/\S/);
          if (el.nextSibling.level > el.level) {
            if (!el.hasAttribute('open')) {
              el.setAttribute('open', open);
            }
          } else if (el.hasAttribute('open')) {
            el.removeAttribute('open');
          }
        } else if (el.hasAttribute('open')) {
          el.removeAttribute('open');
        }
      }
      this.text = content => {
        this.el.innerText = '';
        this.append(content.split(/\n/).map(l => $('div').text(l).markup()));
        this.append($('div').html('<br>'));
        var children = Array.from(this.el.children);
        children.forEach(el => {
          checkOpen(el, 0);
          if (el.level > 0) el.setAttribute('hide', '');
        });
        // this.createRows();
      };
      this.src = url => {

      };
      function caret (el) {
        const range = window.getSelection().getRangeAt(0);
        const prefix = range.cloneRange();
        prefix.selectNodeContents(el);
        prefix.setEnd(range.endContainer, range.endOffset);
        return prefix.toString().length;
      }
      function getNode (parent, pos) {
        if (parent.childNodes) {
          for (var node of parent.childNodes) {
            if (node.nodeType == Node.TEXT_NODE) {
              if (pos <= node.length) {
                return [node, pos, true];
              } else {
                pos = pos - node.length;
              }
            } else {
              var [node, pos, done] = getNode(node, pos);
              if (done) {
                return [node, pos, done];
              }
            }
          }
        }
        return [parent, pos];
      };
      function setCaret (parent, pos) {
        var [node, nodepos] = getNode(parent, pos);
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(node, nodepos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      };
      function clean(el) {
        el.querySelectorAll('span').forEach(el => el.removeAttribute('style'))
      }

      return this
      .attr('contenteditable','')
      .attr('spellcheck',false)
      // .css("display:inline-block;width:100%;")
      .on('paste', event => {
        event.preventDefault();
        var text = event.clipboardData.getData("text");
        // document.execCommand('insertText', false, text.replace(/\r/gs,''));
        document.execCommand('insertHTML', false, text.code(lang).split(/\n/).join('</div><div>'));
        clean(this.el);
      })
      .on('focus', event => {
        document.execCommand("defaultParagraphSeparator", false, "div");
      })
      .on('keydown', event => {
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        event.target.querySelectorAll('[selected]').forEach(el => el.removeAttribute('selected'));
        for (var el = range.startContainer.parentElement; el.tagName !== 'DIV'; el = el.parentElement);
        // if (event.keyPressed === 'ctrl_alt_BracketLeft') {
        //   event.preventDefault();
        //   toggleOpen(el, 0)
        // }
        // if (event.keyPressed === 'ctrl_alt_BracketRight') {
        //   event.preventDefault();
        //   toggleOpen(el, 1)
        // }
        if(event.keyCode==9 && !event.shiftKey) {
          event.preventDefault();
          // document.execCommand('insertHTML', false, '&#009');
          document.execCommand('insertHTML', false, '  ');
        }
        setTimeout(() => {
          var sel = window.getSelection();
          var {focusNode} = sel;
          var range = sel.getRangeAt(0);
          for (var el = focusNode.nodeType === 3 ? focusNode.parentNode : focusNode; el.tagName !== 'DIV'; el = el.parentElement);
          Array.from(this.el.children).filter(el => el.contains(focusNode)).forEach(el => el.setAttribute('selected',''));

          var children = Array.from(this.el.children);
          const row = children.indexOf(el);
          const prefix = range.cloneRange();
          prefix.selectNodeContents(el);
          prefix.setEnd(range.endContainer, range.endOffset);
          var col = prefix.toString().length;
          $('.statusbar>.pos').text(`${row + 1}:${col + 1}`);
          var el = children[row] || focusNode.parentNode;
          // // console.debug(el, sel, event.keyCode);
          // if (el) {
          //   if (el.hasAttribute('hide')) {
          //     for (var el; el && el.hasAttribute('hide'); el = event.keyCode >= 39 ? el.nextSibling : el.previousSibling);
          //     if (el) {
          //       if (event.keyCode === 37) col=el.innerText.length;
          //       if (event.keyCode === 39) col=0;
          //       var range = window.getSelection().getRangeAt(0).cloneRange();
          //       var [node,pos] = getNode(el, Math.min(col, el.innerText.length));
          //       // console.debug(node,pos);
          //       range.setEnd(node,pos);
          //       if (!event.shiftKey) {
          //         range.setStart(node,pos);
          //         range.collapse(true);
          //       }
          //       sel.removeAllRanges();
          //       sel.addRange(range);
          //     }
          //   }
          //   rows = Array.from(this.el.children);
          //   rows.filter(el => el.hasAttribute('selected')).forEach(el => el.removeAttribute('selected'));
          //   el.setAttribute('selected', '');
          //   checkOpen(el);
          //   checkOpen(el.previousElementSibling);
          // }

          // console.debug('pos', row, col);
          if (!event.ctrlKey) {
            if (event.keyCode >= 0x30 || event.keyCode == 0x20) {
              const rowsOpen = children.map(el => el.getAttribute('open'));
              console.debug(el.innerText);
              el.innerHTML = lang ? el.innerText.code(lang) : el.innerText;
              // $(el).markup(lang);
              // clean(el);
              // console.debug(col);

              setCaret(el, col);

              //
              //
              // // rowsOpen.forEach(i => children[i].setAttribute('open', ''));
              //
              // return;
              //
              // var content = children.map(el => el.innerText.replace(/\n$/, '')).join('\n');
              // his.push(content);
              // // console.debug(content);
              // this.el.innerText = '';
              // this.append(content.split(/\n/).map(l => $('div').html(replace.yaml(l) || '<br>')));
              // var children = Array.from(this.el.children);
              // var el = children[row];
              //
              // setCaret(col, el);
              // // this.refresh();
              // // console.debug('up');
              // // const pos = caret(elem);
              // //
              // // const range = window.getSelection().getRangeAt(0);
              // // const el = range.startContainer.parentElement;
              // // el.innerHTML = replace.yaml(el.innerText);
              // // // console.debug(el, el.innerText, el.innerHTML)
              // // // Array.from(this.el.children).forEach(el => el.innerText = el.innerText);
              // // // js(el);
              // // // this.attr('showall', 1);
              // // // this.text(elem.innerText.replace(/\n\n/gs, '\n'));
              // // // this.attr('showall', null);
              // // // elem.innerHTML = lang ? $.string[lang](elem.innerText) : elem.innerHTML;
              // // // elem.innerText = elem.innerText.replace(/\n\n/gs, '\n');
              // // setCaret(pos, elem);
            }
          }
          // this.el.getElementsByTagName('SPAN')

        })
      })
    },
    editorCollapse() {

    },

    emit(selector, detail) {
      this.el.dispatchEvent(new CustomEvent(selector, {detail: detail}));
      return this;
    },
    exists(parent) {
      return (parent || document.documentElement).contains(this.el)
    },
    files(item, attributeName) {
      this.item = item;
      console.debug('FILES', item, attributeName);
      this.files = item[attributeName];
      // this.files = [];
      if (this.files === 'string' && this.files[0] === '[') this.files = JSON.parse(this.files);
      if (this.files === 'string' && this.files[0] === '{') this.files = [JSON.parse(this.files)];
      if (!Array.isArray(this.files)) this.files = [];
      this.appendFile = file => $.promise( 'appendFile', callback => {
        console.debug(file, file.type, file.name);
        aimClient.api(`/${this.item.tag}/file`)
        .query({
          uid: this.item.data.UID,
          name: file.name,
          lastModified: file.lastModified,
          // lastModifiedDate: file.lastModifiedDate,
          size: file.size,
          type: file.type,
        })
        .post(file)
        .then(file => {
          this.files.push(file);
          if (file.type === 'application/pdf') {
            $().pdfpages(event.body.src).then(pages => {
              const textpages = pages.map(lines => lines.map(line => line.str).join("\n"));
              let words = [].concat(textpages.map(page => page.match(/\b\w+\b/gs))).map(words => words.map(word => word.toLowerCase()).unique().sort());
              console.debug('PDF PAGES', words);
              aimClient.api(`/${this.item.tag}/?response_type=words`).patch(words).then(body => {
                console.debug('WORDS', body);
              })
            })
          }
          console.debug(event.target.responseText, attributeName, this.files);
          // item[attributeName] = { max:999, Value: JSON.stringify(event.body) };
          item[attributeName] = JSON.stringify(this.files);
          // console.debug(item[attributeName]);
          this.emit('change');
          callback(file);
        })
      });
      this.removeElem = (elem, event) => {
        event.stopPropagation();
        elem.remove();
        this.files = [...this.el.getElementsByClassName('file')].map(event => event.elem.get('ofile'));
        // console.debug(this.files);
        item[attributeName] = JSON.stringify(this.files);
        return false;
      };
      return this.class('col files')
      .on('drop', event => {
        event.preventDefault();
        if (event.dataTransfer.files) {
          [...event.dataTransfer.files].forEach(this.appendFile)
        }
      })
      .on('dragover', event => {
        event.dataTransfer.dropEffect = 'link';
        event.preventDefault();
      })
      .on('change', event => {
        this.clear().append(
          this.imagesElem = $('div').class('row images'),
          this.attachElem = $('div').class('row attach'),
        );
        console.debug(this, files, item, attributeName); // DEBUG:
        return;
        this.files.filter(Boolean).forEach(ofile => {
          let filename = ofile.src.split('/').pop();
          let ext = ofile.ext || ofile.src.split('.').pop();
          filename = filename.split('_');
          if (filename[0].length == 32) filename.shift();
          filename = filename.join('_');
          let href = ofile.src;
          if (ofile.src.match(/jpg|png|bmp|jpeg|gif|bin/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('img').class('aimage').src(ofile.src).set('ofile', ofile),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('icn-delete').on('click', event => this.removeElem(elem, event)),
              ),
            );
            // elem.el.ofile = ofile;
            return;
            // return elem;
            if (ofile.src) {
              this.src(ofile.src);
            }
            return this;
            const access_token = $.auth.access_token;
            const iss = $.auth.access.iss;
            if (!ofile.src) return imgElement;
            var src = (ofile.srcs || ofile.src) + '?access_token=' + access_token;
            imgElement.src = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            var src = (ofile.src) + '?' + ofile.lastModifiedDate;
            imgElement.srcl = (src.indexOf('http') === -1 ? ofile.host || "https://" + iss : '') + src;
            imgElement.alt = ofile.name || '';
            // return imgElement;
            return this;
          } else if (ofile.src.match(/3ds/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('div').class('aimage').set('ofile', ofile).width(120).height(120).tds({src: ofile.src}),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('icn-delete').on('click', event => this.removeElem(elem, event)),
              ),
            );
          } else if (ofile.src.match(/mp4|webm|mov/i)) {
            const elem = $('span')
            .parent(this.imagesElem)
            .class('row file elplay')
            .set('ofile', ofile)
            .append(
              $('i').class('bt sel'),
              $('video').class('aimage').src(ofile.src).set('ofile', ofile),
              $('div').class('row title').append(
                $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                $('i').class('icn-delete').on('click', event => {
                  event.stopPropagation();
                  elem.remove();
                  item[attributeName] = JSON.stringify([...this.el.getElementsByClassName('file')].map(event => event.ofile));
                  return false;
                })
              ),
            );
          } else {
            const elem = $('a')
            .parent(this.attachElem)
            .class('row file icn file_'+ext)
            .set('ofile', ofile)
            .href(href)
            .download(ofile.name)
            .draggable()
            .on('click', event => {
              if (ext === 'pdf') {
                const href = ofile.host + ofile.src;
                const iframeElem = $('view').append(
                  $('div').class('col aco iframe').append(
                    $('iframe').class('aco').src(href),
                    $('button').class('icn-close abs').on('click', event => iframeElem.remove()),
                  )
                );
                return false;
              }
            })
            .append(
              $('div').class('col aco').target('file').draggable().append(
                $('div').class('row title').append(
                  $('span').class('aco').text(ofile.alt || ofile.name).title(ofile.title),
                  $('i').class('icn-delete').on('click', event => this.removeElem(elem, event)),
                ),
                $('div').class('row dt').append(
                  $('span').class('aco').text(ofile.size ? Math.round(ofile.size / 1000) + 'kB' : ''),
                  $('i').class('icn-arrow_download').href(href).download(ofile.name).on('click', event => {
                    event.stopPropagation();
                    if ($().aliconnector_id && href.match(/(.doc|.docx|.xls|.xlsx)$/)) {
                      event.preventDefault();
                      console.debug(href);
                      $().ws().sendto($().aliconnector_id, {external: {filedownload: ['http://alicon.nl'+href]}}).then(event => {
                        console.debug(event);
                      });
                    }
                  }),
                  // el.elModDate = createElement('SPAN', { className: 'aco', innerText: (ofile.lastModifiedDate ? new Date(ofile.lastModifiedDate).toLocaleString() + ' ' : '') + ((ofile.size) ? Math.round(ofile.size / 1000) + 'kB' : '') });
                  // if (hasEdit) {
                  // 	createElement('A', 'abtn pulldown', { popupmenu: {
                  // 		bewerken: {
                  // 			Title: 'Bewerken',
                  // 			onclick: editFile,
                  // 		},
                  // 	} });
                  // }
                ),
              ),
            );
            elem.el.ofile = ofile;
            // return elem;
          }
        })
      })
      .emit('change')
    },
    filesNext() {
      this.filesSlide(1);
      if (this.slideIdx == 0 && get.pv) {
        //// //console.debug('NEXT PAGE');
      }
    },
    filesSlide(step) {
      //var elSlide = this.images[this.slideIdx];
      //if (elSlide) {
      //    if (elSlide.pause) this.elSlide.pause();
      //    elSlide.parentElement.removeAttribute('show');
      //}
      this.images = this.el.getElementsByClassName('aimage');
      //// //console.debug('IMAGES', this.images);
      this.slideIdx += step || 0;
      this.imagesElement.setAttribute('prev', this.slideIdx > 0);
      this.imagesElement.setAttribute('next', this.slideIdx < this.images.length - 1);
      //if (this.slideIdx == 0) this.setAttribute('dir', 'r');
      //if (this.slideIdx < 0) this.slideIdx = this.images.length - 1;
      //// //console.debug(this, step, elSlide, this.slideIdx);
      var elSlide = this.images[this.slideIdx];
      if (!elSlide) {
        this.slideIdx = 0;
        var elSlide = this.images[this.slideIdx];
      }
      if (!elSlide) return;
      elSlide.show();
      if (elSlide.play && checkVisible(elSlide)) {
        if ($.player.elPlaying) items.player.elPlaying.pause();
        elSlide.currentTime = 0;
        //items.player.elPlaying = elSlide;
        elSlide.play();
      }
      //else
      //    items.player.play();
    },
    ganth(data) {
      (async () => {
        if (!this.Ganth) {
          await require(scriptPath+'lib/aim/js/web-ganth.js');
          $('link').attr('rel', 'stylesheet').attr('href', scriptPath+'lib/aim/css/web-ganth.css').parent(document.head);
        }
        Ganth.init(data, this);
        console.debug(Ganth);
      })();
      // setTimeout(() => new Ganth(data, this));
      return this;
    },
    get() {
      return this.map.get(...arguments);
    },
    has() {
      return this.map.has(...arguments);
    },
    header(item) {
      // let startDate = new Date(this.StartDateTime.replace('000Z','Z'));
      // let endDate = new Date(this.EndDateTime.replace('000Z','Z'));
      // let createdDate = new Date(this.CreatedDateTime.replace('000Z','Z'));
      // if (item.IsPublic) {
      // 	item.publicElement = ['DIV', 'icn IsPublic ' + (item.hostID === 1 ? 'public' : '')];
      // }
      return $('header')
      .class('row header', item.tag)
      .draggable()
      // .item(item, 'view')
      .on('change', function (event) {
        function linkMaster(item, name, elem) {
          if (item && item.data && item.data[name]) {
            const master = $(data = [].concat(item.data[name]).shift());
            elem.insert($('span').itemLink(master), '/');
            if (master && master.details) {
              master.details().then(item => linkMaster(item, name, elem));
            }
          }
          return elem;
        }
        function linkSource(item, name, elem) {
          if (item && item.data && item.data[name]) {
            const master = $(data = [].concat(item.data[name]).shift());
            elem.append(':', $('span').itemLink(master));
            if (master && master.details) {
              master.details().then(item => linkSource(item, name, elem));
            }
          }
          return elem;
        }
        this.elem.clear().append(
          // $('div').class('modified'),
          // .contextmenu(this.properties.State.options)
          // .on('contextmenu', event => //console.debug(event))
          $('button').class('icn-stateicon')
          .append(
            $('i').append(
              $('i').css('background-color', item.stateColor),
            ),
            item.elemStateUl = $('ul').class('col').append(
              $('li').class('abtn').text('JAdsfg sdfg sd'),
              $('li').class('abtn').text('JAdsfg sdfg sd'),
              $('li').class('abtn').text('JAdsfg sdfg sd'),
              $('li').class('abtn').text('JAdsfg sdfg sd'),
            )
          )
          .on('mouseenter', function (event) {
            const rect = this.getBoundingClientRect();
            //console.debug(window.innerHeight);
            item.elemStateUl.css('top', (rect.top)+'px').css('left', rect.left+'px');
          }),
          item.IsPublic ? $('div', 'icn IsPublic').class(item.hostID === 1 ? 'public' : '') : null,
          $('div')
          .class('icn itemicon', item.className)
          .css('border-color', item.modColor)
          .css('color', item.schemaColor)
          .append(
            item.gui && item.gui.global
            ? $('div', 'gui').append(
              $('div', 'detail').append(
                $('div', 'object').append(
                  $('div', item.tag, item.gui.detail),
                ),
              ),
            )
            : (item.iconsrc ? $('img').src(item.iconsrc) : null),
          ),
          $('div').class('aco col headername inline').append(
            $('div', 'header title', item.header0).append(
              // linkSource(item, 'Src', $('span').class('path source')),
            ),
            $('div', 'header subject', item.header1),
            $('div', 'header preview', item.header2),
            // linkMaster(item, 'Master', $('div').class('row path master')),
            $('div', 'row date')
            // .contextmenu(item.flagMenu)
            ,
          ),
        );
      }).emit('change')
    },
    html(content, format) {
      const elem = this.el;
      [].concat(content).forEach(content => {
        if (typeof content === 'function') {
          format = 'js';
          content = String(content).replace(/^(.*?)\{|\}$/g,'');
        }
        content = format && $.string[format] ? $.string[format](content) : content;
        if (this.el) {
          this.el.innerHTML += content;
        }
      });
      return this;
    },
    write(content) {
      return this.el.innerHTML += content;
    },
    insert() {
      this.el = this.el || document.body;
      const args = [].concat(...arguments);
      args.forEach(a => !a ? null : this.el.insertBefore(typeof a === 'string' ? document.createTextNode(a) : a.el || a, this.el.firstChild));
      return this;
    },
    id(selector) {
      this.el.setAttribute('id', selector);
      Aim.his.set(selector, this);
      // this.attr('id', ...arguments);
      // if ($.localAttr[selector]) {
      // 	Object.entries($.localAttr[selector]).forEach(entry => this.el.setAttribute(...entry));
      // }
      return this;
    },
    item(item, name) {
      if (item) {
        if (name) {
          // console.debug(item.elems);
          item.elems = item.elems || new Map();
          // console.debug(item.elems, Map, new Map());
          item.elems.set(name, this);
        }
        this.el.item = item;
        return this;
        this.set('item', item);
      }
      // console.debug(elem, elem.item)
      for (var elem = this.el; elem && !elem.item; elem = elem.parentElement);
      // console.debug(elem, elem.item)
      return elem ? elem.item : null;
      // return this;
    },
    itemAttr(items, attributeName, value) {
      items = Array.isArray(items) ? items : [items];
      const a = $.his.attributeItems = $.his.attributeItems || {};
      if (a[attributeName]) {
        a[attributeName].forEach(item => {
          delete item[attributeName];
          Object.values(item)
          .filter(value => value instanceof Element)
          .forEach(elem => elem.removeAttribute(attributeName));
        })
      }
      // set attributen van nieuwe lijst
      items.forEach(item => {
        const elements = Object.values(item).filter(value => value instanceof Element);
        if (value === undefined) {
          delete item[attributeName];
          elements.forEach(elem => elem.removeAttribute(attributeName));
        } else {
          item[attributeName] = value;
          elements.forEach(elem => elem.setAttribute(attributeName, value));
        }
      });
      return a[attributeName] = items || [];
    },
    itemLink(link) {
      if (link) {
        item = link instanceof Item ? link : $(link);
        return this.append(
          (this.linkElem = $('a'))
          .text(item.header0)
          .item(item)
          .href('#/id/' + item.id)
          .on('mouseenter', event => {
            console.debug('a mouseenter');
            const targetElement = this.linkElem.el;
            const rect = targetElement.getBoundingClientRect();
            const popupElem = $.popupcardElem = $.popupcardElem || $('div').parent(document.body).class('pucard');
            popupElem
            .style(`top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height + 10}px;`)
            .on('close', event => {
              console.debug('div close', this);
              $.popupcardElem = null;
              popupElem.remove();
            })
            .on('mouseleave', event => {
              console.debug('div mouseleave', this);
              popupElem.to = clearTimeout(popupElem.to);
              popupElem.emit('close');
            })
            .on('mouseenter', event => {
              console.debug('div mouseenter');
              clearTimeout(this.to);
              const divElem = $('div').parent(popupElem.clear());
              console.debug(item);
              this.to = setTimeout(() => item.details().then(item => {
                popupElem.css(`opacity:1;`);
                const infoID = item.tag;
                divElem.append(
                  $('div').class(' shdw col').append(
                    $('div').class('aco point').append(
                      $('div').class('kop0').text(item.header0),
                      $('div').class('kop1').text(item.header1),
                      $('div').class('kop2').text(item.header2),
                    ),
                    $('div').class('row top btnbar').append(
                      Array.isArray(item.Email) ? item.Email.map(email => $('a').class('abtn icn email').text(email.Value).href(`mailto:${property.Value}`)) : null,
                    )
                  ).on('click', event => {
                    popupElem.emit('close');
                    $().preview(item);
                  })
                );
              }),500);
            });
          })
        );
      }
    },
    langtext(value) {
      return this.ttext(...arguments);
    },
    async load(src, callback) {
      console.warn(src);
      if (src.match(/\w+\(\d+\)/)) {
        return;
      }
      if (src.match(/wiki$/)) {
        src += '/';
      }
      if (src.match(/wiki\/$/)) {
        src += 'Home';
      }
      function rawSrc(src) {
        console.debug(777, src, document.location.hostname);
        src = src.replace(/\/(blob|tree)\/main/,'');
        if (document.location.hostname.split('.').pop() === 'localhost') {
          // src = src.replace(/github.com/, 'github.localhost');
          // console.error(333, new URL(new URL(src, document.location).pathname, document.location).href);
          src = new URL(new URL(src, document.location).pathname, 'http://github.aliconnect.nl').href;
        } else if (!src.match(/githubusercontent/)) {
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1/$1.github.io');
          // src = src.replace(/\/\/([\w\.-]+)\.github\.io$/, '//github.com/$1/$1.github.io');
          src = src.replace(/\/\/([\w\.-]+)\.github\.io/, '//github.com/$1');
          src = src.replace(/github.com/, 'raw.githubusercontent.com');
        }
        if (src.match(/githubusercontent/)) {
          if (src.match(/\/wiki/)) {
            src = src.replace(/wiki$/,'wiki/Home');
            src = src.replace(/raw.githubusercontent.com\/(.*?)\/wiki/, 'raw.githubusercontent.com/wiki/$1');
          } else if (!src.match(/\/main/)) {
            src = src.replace(/raw.githubusercontent.com\/([\w\.-]+)\/([\w\.-]+)/, 'raw.githubusercontent.com/$1/$2/main');
          }
        } else {
          src = src.replace(/\/main/g, '');
          // src = src.replace(/\/main|\/aliconnect/g, '');
        }
        src = src.replace(/\/tree|\/glob|\/README.md/g, '');
        src = new URL(src, document.location).href;
        console.debug(1, src);
        return src;
      }
      const elem = this;
      elem.paths = elem.paths || [];
      const homePath = document.location.origin;
      const origin = new URL(src, document.location).origin;
      const linksrc = hrefSrc(src).toLowerCase();
      this.links = this.links || [];
      src = rawSrc(src);
      this.loadMenu = async function (src) {
        // console.warn(4, src, rawSrc(src).replace(/wiki$/, 'wiki/'));
        var wikiPath = rawSrc(src).replace(/wiki$/, 'wiki/').replace(/[\w\.-]*$/,'');
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        // wikiPath = wikiPath.match(/wiki/) ? wikiPath : new URL(wikiPath).origin + '/wiki/';
        if (!elem.paths.includes(wikiPath)) {
          console.debug(9, 'loadMenu', wikiPath, this.links);
          elem.paths.push(wikiPath);
          await Aim.fetch(rawSrc(wikiPath+'_Sidebar.md')).accept('text/markdown').get().catch(err => console.error(err))
          .then(event => {
            this.doc.leftElem.md(event.target.responseText);
            Array.from(this.doc.leftElem.el.getElementsByTagName('A')).forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), event.target.responseURL)));
          });
          Array.from(this.doc.leftElem.el.getElementsByTagName('LI')).forEach(li => {
            if (li.childNodes.length) {
              if (li.childNodes[0].nodeValue) {
                li.replaceChild($('span').text(li.childNodes[0].nodeValue.trim()).elem, li.childNodes[0]);
              }
              const nodeElem = li.firstChild;
              if (!nodeElem.hasAttribute('open') && nodeElem.nextElementSibling) {
                nodeElem.setAttribute('open', '0');
                $(nodeElem).attr('open', '0').on('click', event => {
                  nodeElem.setAttribute('open', nodeElem.getAttribute('open') ^ 1);
                });
              }
            }
            // console.debug(li.childNodes);
          });
          this.links = Array.from(this.doc.leftElem.el.getElementsByTagName('A'));
        }
        // console.debug('loadMenu2', src, wikiPath, this.links);
      };
      if (!this.doc) {
        this.doc = $().document(
          $('div'),
        );
        await this.loadMenu($.config.ref.home);
      }
      (this.findlink = () => {
        this.link = this.links.find(link => link.getAttribute('href') && link.getAttribute('href').toLowerCase() === linksrc);
      })();
      if (!this.link) {
        await this.loadMenu(src);
        this.findlink();
      }
      if (src.match(/wiki/)) {
      } else if (!src.match(/\.md$/)) {
        src += '/README';
      }
      if (!src.match(/\.md$/)) {
        src += '.md';
      }
      this.src = src;
      this.scrollTop = this.scrollTop || new Map();
      (this.url = Aim.fetch(src).accept('text/markdown').get()).then(async event => {
        if (elem.pageElem && elem.pageElem.el.parentElement) {
          elem.loadIndex = false;
          // console.debug('elem.docElem', elem, elem.docElem && elem.docElem.el.parentElement);
        } else {
          elem.loadIndex = true;
        }
        let content = event.target.responseText;
        if (callback) {
          content = callback(content);
        }
        const responseURL = event.target.responseURL;
        var title = responseURL.replace(
          /\/\//g,
          '/'
        );
        var match = content.match(/^#\s(.*)/);
        if (match) {
          content = content.replace(/^#.*/,'').trim();
          title = match[1];
        } else {
          title = title.match(/README.md$/)
          ? title.replace(/\/README.md$/,'').split('/').pop().split('.').shift().capitalize()
          : title.split('/').pop().split('.').shift().replace(/-/g,' ');
          title = title.replace(/-/,' ');
        }
        const date = event.target.getResponseHeader('last-modified');
        content = content.replace(/<\!-- sample button -->/gs,`<button onclick="$().demo(event)">Show sample</button>`);

        try {
          // eval('content=`'+content.replace(/\`/gs,'\\`')+'`;');
        } catch (err) {
          //console.error(err);
        }

        this.doc.docElem.clear().append(
          this.doc.navElem = $('nav'),
          $('h1').text(title),
          date ? $('div').class('modified').text(__('Last modified'), new Date(date).toDisplayString()) : null,
        )
        .md(content)
        .mdAddCodeButtons();
        this.doc.docElem.renderCode();

        // [...this.doc.docElem.el.getElementsByTagName('code')].forEach(elem => {
        //   if (elem.hasAttribute('source')) {
        //     Aim.fetch(hrefSrc(elem.getAttribute('source'), responseURL)).get()
        //     .then(event => {
        //       var content = event.target.responseText.replace(/\r/g, '');
        //       if (elem.hasAttribute('id')) {
        //         var id = elem.getAttribute('id');
        //         var content = content.replace(new RegExp(`.*?<${id}>.*?\n(.*?)\n(\/\/|<\!--) <\/${id}.*`, 's'), '$1').trim();
        //       }
        //       if (elem.hasAttribute('function')) {
        //         var id = elem.getAttribute('function');
        //         var content = content.replace(/\r/g, '').replace(new RegExp(`.*?((async |)function ${id}.*?\n\})\n.*`, 's'), '$1').trim();
        //       }
        //       elem.innerHTML = elem.hasAttribute('language') ? $.string[elem.getAttribute('language')](content) : content;
        //       // console.debug(content);
        //       // $(elem).html(content, elem.getAttribute('language'));
        //     });
        //   }
        // });
        [...this.doc.docElem.el.getElementsByTagName('A')].forEach(elem => $(elem).href(hrefSrc(elem.getAttribute('href'), responseURL)));
        [...this.doc.docElem.el.getElementsByTagName('IMG')].forEach(elem => {
          // let imgsrc = elem.getAttribute('src')||'';
          // if (imgsrc.match(/\/\//)) {
          //   const url = new URL(imgsrc);
          //   src = url.origin + url.pathname;
          // } else if (src.match(/^\//)) {
          //   const url = new URL(filename);
          //   src = url.origin + src;
          // } else {
          //   const url = new URL(src, filename.replace(/[^\/]+$/,''));
          //   src = url.origin + url.pathname;
          // }
          // src = src.replace(/\/wiki$/, '/wiki/Home');
          // src = src.replace(/github.com/, 'raw.githubusercontent.com');
          // src = src.replace(/raw.githubusercontent.com\/(.*?)\/wiki/, 'raw.githubusercontent.com/wiki/$1');
          // src = src.replace(/\/tree|\/blob/, '');
          elem.setAttribute('src', new URL(elem.getAttribute('src'), new URL(src, document.location)).href.replace(
            /^.*?\//,
            '/'
          ));
        });
        setTimeout(() => this.doc.indexElem.index(this.doc.docElem));

        this.links.forEach(link => link.removeAttribute('selected'));
        if (this.link) {
          $(this.link).attr('selected', '');
          for (var link = this.link; link; link = link.parentElement.parentElement ? link.parentElement.parentElement.previousElementSibling : null) {
            if (link.hasAttribute('open')) {
              link.setAttribute('open', '1');
            }
          }
          const children = Array.from(this.link.parentElement.parentElement.children);
          const total = children.length;
          const index = children.indexOf(this.link.parentElement) + 1;
          var elemPrevious;
          var elemNext;
          this.doc.docNavTop.clear();
          if (this.link.parentElement.previousElementSibling) {
            elemPrevious=$('a').class('row prev').href(this.link.parentElement.previousElementSibling.firstChild.getAttribute('href')).append(
              $('span').text('←'),
              $('small').class('aco').text('Previous'),
            );
            this.doc.docNavTop.append(
              $('a').class('row prev').href(this.link.parentElement.previousElementSibling.firstChild.getAttribute('href')).append(
                $('span').text('←'),
                $('small').text(this.link.parentElement.previousElementSibling.firstChild.innerText),
              )
            )
          }
          if (this.link.parentElement.nextElementSibling) {
            elemNext=$('a').class('row next').href(this.link.parentElement.nextElementSibling.firstChild.getAttribute('href')).append(
              $('small').class('aco').text('Next'),
              $('span').text('→'),
            );
            this.doc.docNavTop.append(
              $('a').class('row next').href(this.link.parentElement.nextElementSibling.firstChild.getAttribute('href')).append(
                $('small').class('aco').text(this.link.parentElement.nextElementSibling.firstChild.innerText),
                $('span').text('→'),
              )
            )
          }
          $('div').parent(this.doc.docElem).class('row').append(
            $('span').append(elemPrevious),
            $('span').class('aco').align('center').text(`${index} van ${total}`),
            $('span').append(elemNext),
          );
        }

        this.doc.docElem.el.scrollTop = this.scrollTop.get(src);

        return this;

      });
      return this.url;
    },
    async load(href) {
      this.clear();
      const path = href.replace(/[^\/]*$/,'');
      await Aim.fetch(href.replace(/\.mdh/, '.md')).get().then(body => {
        this.html(body.render());
        this.querySelectorAll('a').filter(elem => elem.hasAttribute('href')).forEach(elem => {
          var href = elem.getAttribute('href');
          elem.setAttribute('href', (href.match(
            /^http|^\/|^#/
          ) ? '' : path) + href.replace(/\.md/,'.mdh'));
        })
      });
      return this;
    },
    async loadPage(href, selector) {
      const parentElem = this;
      const url = new URL(href||'/', document.location);
      if (href && Web.url && Web.url.pathname != url.pathname) {
        Web.url = url;
        Statusbar.pushState(Web.url);
      }
      // $(document.documentElement).class('page');
      let leftElem = parentElem.querySelector('.page>aside.left');
      let divElem = parentElem.querySelector('.page>div');
      let rightElem = parentElem.querySelector('.page>aside.right');
      if (!leftElem) {
        parentElem.clear().append(
          $('div').class('col').append(
            $('div').class('col').append(
              $('nav').append(
                $('button').class('icn-back').style('margin-right: auto;').on('click', event => {
                  $(document.documentElement).class('app');
                  parentElem.clear();
                }),
              ),
              $('div').class('row page').append(
                leftElem = $('aside').class('col left'),
                divElem = $('div'),
                rightElem = $('aside').class('col right'),
              )
            )
          )
        );
        if ((config.pages||{}).pagemenu) {
          await leftElem.load(config.pages.pagemenu);
        }
        leftElem.querySelectorAll('a').forEach(elem => elem.on('click', event => {
          event.stopPropagation();
          // event.preventDefault();
        }));
        const docitems = leftElem.querySelectorAll('ul');
        docitems.forEach(elem => {
          elem.parentElement.attr('open',0).on('click', event => {
            event.preventDefault();
            event.stopPropagation();
            elem.parentElement.attr('open', Number(elem.parentElement.attr('open')) ? 0 : 1);
          });
        });
      }
      const doclinks = leftElem.querySelectorAll('a');
      doclinks.forEach(elem => elem.removeAttribute('selected'));
      doclinks.filter(elem => new URL(elem.el.href).pathname === document.location.pathname).forEach(elem => {
        elem.setAttribute('selected', '');
        for (var elem; elem; elem = elem.parentElement) {
          if (elem.hasAttribute('open')) {
            elem.setAttribute('open', 1);
          }
        }
      });
      if (href) {
        await divElem.class(href.split('/').pop().toLowerCase(),'col').load(href);
        rightElem.index('.page>div');
        divElem.render();
      }
      if (url.hash) {
        document.location.href = url.hash;
      };
      // console.debug(divElem);
      return divElem;
    },
    render() {
      this.querySelectorAll('pre[source]').forEach(elem => {
        const language = elem.getAttribute('language');
        const codeElem = $('code').parent(elem).setAttribute('language', language);
        Aim.fetch(codeElem.getAttribute('source')).get().then(body => {
          var content = body.replace(/\r/g, '');
          if (codeElem.hasAttribute('id')) {
            var id = codeElem.getAttribute('id');
            var content = content.replace(new RegExp(`.*?<${id}>.*?\n(.*?)\n(\/\/|<\!--) <\/${id}.*`, 's'), '$1').trim();
          }
          if (codeElem.hasAttribute('function')) {
            var id = el.getAttribute('function');
            var content = content.replace(/\r/g, '').replace(new RegExp(`.*?((async |)function ${id}.*?\n\})\n.*`, 's'), '$1').trim();
          }
          codeElem.html(content.render(language).trim());
        });
      });
      this.querySelectorAll('pre>code').forEach(el => {
        const language = el.getAttribute('language');
        $(el.parentElement).append(
          $('nav').append(
            $('button').class('icn-copy').css('margin-left: auto'),
            $('button').class('icn-edit').on('click', event => $(el).editor(language)),
            $('button').class('icn-eye').on('click', event => {
              const block = {
                html: '',
                css: '',
                js: '',
              };
              for (let codeElem of this.docElem.el.getElementsByClassName('code')) {
                const type = codeElem.previousElementSibling.innerText.toLowerCase();
                if (type === 'html') {
                  block[type] = block[type].includes('<!-- html -->') ? block[type].replace('<!-- html -->', codeElem.innerText) : codeElem.innerText;
                } else if (type === 'js') {
                  block.html = block.html.replace(
                    /\/\*\* js start \*\*\/.*?\/\*\* js end \*\*\//s, codeElem.innerText
                  );
                } else if (type === 'yaml') {
                  block.html = block.html.replace(
                    /`yaml`/s, '`'+codeElem.innerText + '`',
                  );
                } else if (type === 'css') {
                  block.html = block.html.replace(
                    /\/\*\* css start \*\*\/.*?\/\*\* css end \*\*\//s, codeElem.innerText
                  );
                }
                if (codeElem === elem) break;
              }
              var html = block.html
              .replace('/** css **/', block.css)
              .replace('/** js **/', block.js);
              console.debug(html);
              return;
              const win = window.open('about:blank', 'sample');
              const doc = win.document;
              doc.open();
              doc.write(html);
              doc.close();
            }),
          )
        );
      });
      /** vervang div source pdf voor afbeelding van pdf */
      this.querySelectorAll('div[source]').forEach(async elem => {
        // await Web.require('https://mozilla.github.io/pdf.js/build/pdf.js'); // pdfjsLib
        await require(scriptPath+'lib/js/pdf.js'); // pdfjsLib
        var loadingTask = pdfjsLib.getDocument(elem.getAttribute('source'));
        loadingTask.promise.then(async pdf => {
          // console.debug('PDF loaded');
          var numPages = pdf.numPages;
          // console.debug(pdf);
          for (var pageNumber=1, numPages = pdf.numPages;pageNumber<=numPages;pageNumber++) {
            await pdf.getPage(pageNumber).then(function(page) {
              // console.debug('Page loaded');

              var scale = 1;
              var viewport = page.getViewport({scale: scale});

              // Prepare canvas using PDF page dimensions
              var a = $('a').parent(elem).href(elem.getAttribute('source'));
              var canvas = $('canvas').parent(a).el;
              // document.body.appendChild(canvas);
              // var canvas = document.getElementById('the-canvas');
              var context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              // Render PDF page into canvas context
              var renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              var renderTask = page.render(renderContext);
              renderTask.promise.then(function () {
                // console.debug('Page rendered');
              });
            });
          }

          // Fetch the first page
        }, function (reason) {
          // PDF loading error
          console.error(reason);
        });

      });

      return this;
    },
    /** Vervang koppen voor details en voeg google analytics toe bij openen kop, hierdoor weten we waar de aanadcht op de pagina naar gaat */
    mdc(s) {
      const newlines = [];
      let level = 0;
      $.string.mdHtml(s).split(/\n/).forEach(line => {
        const match = line.match(/^<h(\d)>(>\s)/);
        if (match) {
          // line = line.replace(/h\d>/g,'summary>')
          // if (match[1]==level) {
          //   newlines.push('</details><details>'+line);
          // } else if (match[1]>level) {
          //   newlines.push('<details>'+line);
          // } else if (match[1]<level) {
          //   newlines.push('</details></details><details>'+line);
          // }
          line = '<summary>'+line.replace(/>\s/,'')+'</summary>';
          if (match[1]==level) {
            newlines.push('</details><details>'+line);
          } else if (match[1]>level) {
            newlines.push('<details>'+line);
          } else if (match[1]<level) {
            newlines.push('</details></details><details>'+line);
          }
          level = match[1];
          return;
        }
        return newlines.push(line);
      });
      this.el.innerHTML += newlines.join('\n');
      [...this.el.getElementsByTagName('DETAILS')].forEach(
        el => el.addEventListener('toggle', event => el.open ? ga('send', 'pageview', el.firstChild.innerText) : null)
      );
      //   if (el.open) {
      //     console.debug(el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //   }
      // }))
      // this.on('click', event => {
      //   const el = event.path.filter(el => el.tagName === 'SUMMARY').shift();
      //   if (el && el.firstChild) {
      //     // ga('send', 'event', 'click', el.firstChild.innerText);
      //     ga('send', 'pageview', el.firstChild.innerText);
      //     // ga('send', 'event', {
      //     //   'hitType': 'pageview',
      //     //   'page': 'Testpage'
      //     // });
      //     // ga('send', 'event', 'Videos', 'play', 'Fall Campaign');
      //     // ga('send', 'event', {
      //     //   'eventCategory': 'Category',
      //     //   'eventAction': 'Action'
      //     // });
      //     // ga('set', 'title', el.firstChild.innerText);
      //     console.debug(el.firstChild.innerText);
      //   }
      // })
      return this;
    },
    /** Maak een navigatie lijst UL>LI ??? */
    navlist(selector, context) {
      (function init(parent, selector, context) {
        if (selector) {
          if (typeof selector === 'string') {
            const li = $('li').parent(parent);
            const a = $('a').parent(li).attr('id', 'nav'+selector).text(selector.replace(/^\d+-/,''));
            if (context && typeof context === 'object') {
              Object.entries(context).forEach(entry => {
                if (typeof entry[1] === 'object') {
                  a.attr('open', a.attr('open') || '0');
                  const ul = li.ul = li.ul || $('ul').parent(li);
                  init(ul, ...entry);
                } else if (typeof entry[1] === 'function') {
                  a.el[entry[0]] = entry[1];
                } else {
                  a.attr(...entry);
                }
              });
              a.class('abtn')
            }
          } else {
            if (Array.isArray(selector)) {
              selector.forEach(item => init(parent, item))
            } else if (selector instanceof Object) {
              Object.entries(selector).forEach(entry => init(parent, ...entry));
            }
          }
        }
      })(this, ...arguments);
      return this;
    },
    /** Vervangt open */
    open(state) {
      if (!arguments.length) {
        return this.el.hasAttribute('open')
      }
      if ('open' in this.el) {
        this.el.open = state;
      } else {
        this.attr('open', state ? '' : null);
      }
      return this;
    },
    parent(selector) {
      $(selector).append(this.el);
      return this;
    },
    path() {
      const path = [];
      for (let p = this.el; p ;p = p.parentElement) {
        // //console.debug(p);
        path.push(p);
      }
      return path;
    },
    print(success) {
      const {cssPrintUrl} = config;
      const pageHtml = `<!DOCTYPE HTML><html><head><link href="${cssPrintUrl}" rel="stylesheet"/></head><body></body></html>`;
      // console.debug(pageHtml);
      const {el} = this;
      this.style('width:18cm;');
      var iframe = document.createElement('iframe');
      iframe.style='position:absolute;visibility:hidden;';
      document.body.appendChild(iframe);
      const win = iframe.contentWindow;
      const doc = win.document;
      var to;
      doc.open();
      doc.write(pageHtml);
      doc.close();
      var loaded = 0;
      function print(event) {
        win.print();
        iframe.remove();
        if (success) success(event);
      }
      function done() {
        // console.warn('done', loaded);
        clearTimeout(to);
        to = setTimeout(() => loaded ? null : print(), 10);
      }
      doc.fonts.onloading = () => loaded++;
      doc.fonts.onloadingdone  = () => done(loaded--);
      win.addEventListener("load", (event) => {
        doc.body.appendChild(el);
        var images = doc.body.querySelectorAll("img[src],link");
        // console.debug(Array.from(images).map(e => e.src || e.href));
        loaded += images.length;
        images.forEach(el => el.complete ? loaded-- : el.addEventListener("load", event => done(loaded--)));
        done();
      });
      return this;
    },
    printpdf(success) {
      let iframe = document.querySelector('body>iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.style='position:absolute;visibility:hidden;';
        document.body.appendChild(iframe);
        iframe.addEventListener("load", (event) => iframe.contentWindow.print());
      }
      const {serviceRoot} = Aim.config;
      // console.debug(serviceRoot);
      fetch(serviceRoot + "/tools/html2pdf", {
        method: 'post',
        body: this.el.outerHTML,
      })
      .then(response => response.blob())
      .then(blob => iframe.src = URL.createObjectURL(blob));
    },
    properties (options, editmode) {
      const {row, properties} = options;
      const {schemaName} = row;
      const types = {
        boolean: 'checkbox',
        number: 'number',
        string: 'text',
        object: 'object',
      };
      var legendName, legendElem;
      (function buildForm(parent, parentProperties, row, path = [], parentProperty) {
        Object.entries(parentProperties).forEach(([name,property])=>{
          property = property || {};
          property.name = name;
          property.legend = property.legend || legendName || row.schemaName;
          const {properties,legend} = property = property || {};
          if (properties) {
            const tabname = name;
            legendElem = $('details').parent(parent)
            .open(localStorage.getItem('tab'+tabname+'Open'))
            .on('toggle', event => localStorage.setItem('tab'+tabname+'Open', event.target.open ? 1 : ''))
            .append($('summary').text(nameToTitle(tabname)));
            row[name] = row[name] || {};
            // console.debug(row[name]);
            // if (typeof row[name] === 'string') row[name] = JSON.parse(row[name]);
            // console.debug(row[name]);
            buildForm(legendElem, properties, row[name] = row[name] || {}, path.concat(name), {row,property});
          } else {
            if (legendName !== legend) {
              const tabname = legendName = legend;
              legendElem = $('details').parent(parent)
              .open(localStorage.getItem('tab'+tabname+'Open'))
              .on('toggle', event => localStorage.setItem('tab'+tabname+'Open', event.target.open ? 1 : ''))
              .append($('summary').text(nameToTitle(tabname)));
            }
            if (!(name in row)) row[name] = null;
            legendElem.append(
              $('div').property(property, row, editmode, parentProperty, parentProperties),
              // propertyElem(row, property, editmode),
            );
          }
        })
      })(this, properties, row);
      return this;
    },
    property (property, row, editable, parentProperty, parentProperties) {
      // console.debug('property', property, row);
      let {icn,before,properties,linkSchemaName,linkName,linkFieldname,linkId,source,fieldnameId,fieldnameCaption,value,pattern,accept,name,type,minlength,maxlength,size,format,options,autocomplete,readOnly,required,unit,placeholder,step,min,max,low,high,optimum,hidden,description,title,disabled,schemaName} = property;
      const patterns = {
        mail: '[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
        email: '[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
        mailaddress: '[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
        tel: '[0-9]{10,11}',
      };
      pattern = pattern || patterns[format||type];
      let oldValue = value = row[name] || '';
      type = format || type || 'text';
      if (format === 'hidden') return $('input').type('hidden').name(name).value(value).attr('tabindex', -1);
      if (['datetime','timestamp','datetimeoffset'].includes(format)) format = type = 'datetime-local';
      if (type === 'boolean') format = 'checkbox';
      if (type === 'integer') type = options ? 'select' : 'number';
      if (type === 'string') type = 'text';
      const propertyName = name;
      var elem2;
      let onchange = event => {
        row[event.target.name] = event.target.value;
        if (parentProperty && parentProperty.property.type === 'string') {
          console.debug('MAKE PARENT STRING', parentProperty);
          parentProperty.row[parentProperty.property.name] = JSON.stringify(row);
        }
        console.debug(property, row, parentProperty);
      };
      title = __(title || name);
      var view = () => $('span').append(value);
      var edit = () => $('input').value(value).on('change', onchange);
      // console.debug(name,value);

      function filesElem(name) {
        // console.debug(111, editable, this);
        const files = row[name] ? JSON.parse(row[name]) : [];
        const elem = $('div').tabindex(0).append(
          $('div').style('position:absolute;top:0;left:0;padding:3px;').text('Paste images, Dubbel click or drop files here'),

        ).on('dblclick', event => {
          $('input').type('file').multiple(true).accept(accept).on('change',event=>addfiles(event.target.files)).click().remove()
        })
        .on('dragover', event => {
          event.preventDefault();
        })
        .on('drop', eventData)
        .on('paste', eventData);

        files.forEach(fileElem);

        function fileElem(file) {
          const {src,lastModified,name,size,type} = file;
          const [format,ext] = (type||'').split('/');
          console.debug(24234, format,ext, editable, file);
          var fileElem = $('div').class(`icn-document_${ext}`, 'file',format).parent(elem).append(
            format === 'image' ? $('img').src(src) : null,
            $('div').append(
              $('div').append(
                $('span').text(name||'ONBEKEND'),
                $('button').type('button').class('icn-delete').on('click', event => { event.stopPropagation();save(fileElem.remove()); }),
              ),
              $('div').append(
                $('span').text(new Date(lastModified).toDisplayString(),Math.round(size/1000)+'kb'),
                $('button').type('button').class('icn-arrow_download').on('click', event => { event.stopPropagation();downloadURI(src,name); }),
              ),
            )
          );
          if (format !== 'image') {
            fileElem.on('click', event => {
              const {nav,elem,close} = new Panel;
              elem.style('display: flex; flex-direction: column;');
              $('iframe').style('flex:1 0 auto;border:none;').parent(elem).src(encodeURI(src));
              nav.append(
                $('button').class('icn-back').type('button').on('click', close),
              )
              // window.open("").document.write(`<iframe width='100%' height='100%' src='${encodeURI(src)}'></iframe>`)
            });
          }
          fileElem.el.file = file;
          // return elem;

        }
        function save() {
          const files = Array.from(elem.el.querySelectorAll('.file')).map(el => el.file);
          row[name] = JSON.stringify(files);
          // for (var p=elem.el;p;p=p.parentElement) {
          //   if (p.tagName === 'FORM') {
          //     // $(p).emit('change');
          //   }
          // }
        }
        function addfile(file) {
          const {lastModified,name,size,type} = file;
          const reader = new FileReader();
          reader.addEventListener("load", event=>save(fileElem({lastModified,name,size,type,src:value=reader.result})), false);
          reader.readAsDataURL(file);
        }
        function addfiles(files) {
          if (files) {
            Array.from(files).forEach(addfile)
          }
        }
        function eventData(event) {
          event.preventDefault();
          const eventData = event.dataTransfer || event.clipboardData;
          addfiles(eventData.files);
        }
        function fileIsImg(file){
          return file.type && file.type.includes('image');
        }
        return elem;
      }

      const types = {
        text: {view,edit},
        email: {
          view: () => $('a').text(value).href('mailto:'+value),
          edit,
        },
        tel: {
          view: () => $('a').text(value).href('tel:'+value),
          edit,
        },
        url: {
          view: () => $('a').text(value.replace(/^https:\/\/|^http:\/\/|www\./g,'')).class('trim').href(value).target(propertyName),
          edit,
        },
        time: {
          view: () => $('span').text(value ? new Date(value).toDisplayString(true) : ''),
          edit: () => $('input').value(value ? new Date(value).toValueTimeString() : '').on('blur', event => row[event.target.name] = event.target.value.replace(/T/, ' ')),
        },
        date: {
          view: () => $('span').text(value ? new Date(value).toDisplayString(true) : ''),
          edit: () => $('input').value(value ? new Date(value).toValueDateString() : '').on('blur', event => row[event.target.name] = event.target.value.replace(/T/, ' ')),
        },
        'datetime-local': {
          view: () => $('span').text(value ? new Date(value).toDisplayString(true) : ''),
          // view: () => $('span').text(value ? new Date(value).toLocaleString('nl-NL', {dateStyle:'short',timeStyle:'short'}) : ''),
          edit: () => $('input').value(value ? new Date(value).toValueDateTimeString() : '').on('blur', event => row[event.target.name] = event.target.value.replace(/T/, ' ')),
        },
        checkbox: {
          view,
          edit: () => {
            if (options) {
              return $('span').append(
                options.map(option => [
                  $('input').type('checkbox').checked(option === value).id(name + option),
                  $('label').attr('for', name + option).attr('on', option).attr('off', option),
                ])
              );
            }
            return $('span').append(
              $('input').type('checkbox').id(name).on('change', event => row[name] = event.target.checked ? 'on' : null),
              $('label').attr('for', name).attr('on', 'ja').attr('off', 'nee'),
            );
          },
        },
        radio: {
          view,
          edit: () => $('div').append(
            options.map(option => {
              const {value,title,color} = option;
              if (value) {
                return $('span').style(`--bgcolor:${color}`).append(
                  $('input').type('radio').name(name).value(value).id(name + value).checked(value === oldValue).on('change', onchange),
                  $('label').attr('caption', title || value).attr('for', name + value),
                );
              }
              return [
                $('input').type('radio').name(name).value(option).id(name + option).checked(option === value).on('change', onchange),
                $('label').attr('caption', option).attr('for', name + option),
              ];
            })
          )
        },
        range: {
          view: () => $('meter').value(value),
          edit,
        },
        _select: {
          view,
          edit: () => $('div').append(
            Object.entries(options).map(([key,params])=>{
              const {color,title} = params;
              const value = typeof params === 'string' ? params : key;
              return [
                $('input').class('check').type('checkbox').value(key).name(name).id(name + key).on('change', event => row[name] = elem.querySelectorAll('input').filter(elem => elem.el.checked).map(elem => elem.el.value).join(',')),
                $('label').text(Format.displayName(title||value)).for(name + key).setProperty('btbg', color||'var(--rowselect)'),
              ];
            })
          ),
        },
        link: {
          view: () => {
            // let {linkSchemaName,linkName,linkFieldname,linkId,source,schemaName,fieldnameId,fieldnameCaption} = property;

            // schemaName = schemaName || source;
            let {client} = row;
            let {serviceRoot} = client;

            const [linkPropertyName,linkProperty] = Object.entries(parentProperties).find(([propertyName,property])=>property.linkId && property.linkName === linkName);
            const id = row[linkPropertyName];
            schemaName = linkProperty.linkSchemaName;
            // console.debug(1111111, schemaName, id);
            let elem = $('a').class('pucardlink').append(value)
            .on('mouseenter', async (event) => {
              elem.pucard = Item.get({schemaName, id}).cardElem.parent(elem);
            })
            .on('mouseleave', async (event) => {
              elem.pucard.remove();
            })
            .on('click', event => {
              // console.debug(schemaName, id);
              Item.get({schemaName, id}).get().then(item => item.pageElem().animate([
                { transform: 'translate(20%, 0%)' },
                { transform: 'translate(0%, 0%)' },
              ], {
                duration: 200,
              }));
            });
            return elem;
          },
          edit: () => {
            let {schemaName} = property;
            return $('select').append(
              options.map(option => $('option').text(option).selected(option === value)),
            ).value(value);
          },
          edit,

        },
        select: {
          view: () => {
            const option = options.find(option => option.value == value) || {};
            options.forEach((option,i) => option.value = ('value' in option ? option.value : i));
            options.forEach((option,i) => option.caption = option.caption || option.title || option.value);


            return $('span').text(option.caption).style(`--color: ${option.color}`);


            let {schemaName} = property;
            if (schemaName) {
              let elem = $('a').class('pucardlink').append(value)
              .on('mouseenter', async (event) => {
                elem.pucard = $('div').parent(elem).class('pucard');
                const schema = Item.getSchema(schemaName);
                let {headers} = schema;
                headers = headers.join(',');
                Aim.api(`${serviceRoot}/${schemaName}(${value})`).select(headers).get().then(data => {
                  let {headers} = schema;
                  // headers = headers.map(header => header.split(',').map(name => data[name]).join(', '));
                  elem.pucard.append(
                    headers.map(header => $('div').text(header.split(',').map(name => data[name]).join(', '))),
                  )
                  // console.debug(serviceRoot,schemaName,value,schema,data,headers);
                });
              })
              .on('mouseleave', async (event) => {
                if (elem.pucard) {
                  elem.pucard.remove();
                }
              })
              .on('click', event => {
                document.location.hash = `#?id=${btoa(`${serviceRoot}/${schemaName}(${value})`)}`;
                // console.debug(schemaName,value,schema,1);
              });
              return elem;
            } else {
              return $('span').append(value);
            }
          },
          edit: () => {
            size = 0;
            let {schemaName} = property;
            options.forEach((option,i) => option.value = 'value' in option ? option.value : i);
            options.forEach((option,i) => option.caption = option.caption || option.name || option.title || option.value);
            return $('select').append(
              options.map((option,i) => $('option').attr(option).text(option.caption).selected(option.value === value)),
            ).value(value).on('change', onchange);
          },
        },
        list: {
          view,
          edit: () => $('input').attr('list','datalist'+name).append(
            $('datalist').id('datalist'+name).append(
              options.map(option => $('option').text(option).selected(option === value)),
            )
          ),
        },
        address: {
          view: () => {
            const object = JSON.parse(row[name]) || {};
            const {street,street2,street3,postalCode,city,state,country,lat,lng} = object;
            return $('div').style('flex:1 0 0;width:0%;').append(
              $('div').text(street,street2,street3,postalCode,city,state,country),
              lat && lng ? $('div').style('height: 200px;width:100%;').googleMap([{
                location: {lat,lng},
                fillColor: 'orange',
                fillOpacity: 1,
                scale: 0.5,
                // strokeWeight: 2,
                // strokeColor: 'yellow',
              }], {
                zoom: 5.8,
                disableDefaultUI: true,
                styles: [
                  {featureType: 'administrative.locality', elementType: 'labels', stylers: [ {visibility: 'off'} ]},
                  {featureType: 'administrative', elementType: 'labels', stylers: [ {visibility: 'off'} ]},
                  {featureType: 'landscape', elementType: 'labels', stylers: [ {visibility: 'off'} ]},
                  {featureType: 'poi', stylers: [ {visibility: 'simplified'},{saturation: -100}, {lightness: 45} ]},
                  // {featureType: 'road', elementType: "geometry.fill", stylers: [ {visibility: 'off' } ]},
                  // {featureType: 'road', elementType: "geometry.stroke", stylers: [ {visibility: 'off' } ]},
                  {featureType: 'road', stylers: [ {visibility: 'off' } ]},
                ],
              }) : null,
            );
          },
          edit: () => {
            console.debug(name,row);
            // const fieldName = name;
            const prefix = name;
            const object = JSON.parse(row[name]) || {};
            // const addressObj = {};
            // const componentNames = {
            //   route: prefix + 'Street',
            //   sublocality_level_2: prefix + 'Street',
            //   sublocality: prefix + 'Street',
            //   street_number: prefix + 'Number',
            //   postal_code: prefix + 'PostalCode',
            //   locality: prefix + 'City',
            //   administrative_area_level_2: prefix + 'Town',
            //   administrative_area_level_1: prefix + 'State',
            //   country: prefix + 'Country',
            // };
            const componentNames = {
              route: 'street',
              sublocality_level_2: 'street',
              sublocality: 'street',
              street_number: 'street2',
              postal_code: 'postalCode',
              locality: 'city',
              administrative_area_level_2: 'city',
              administrative_area_level_1: 'state',
              country: 'country',
            };
            var to;
            function geocode(event) {
              clearTimeout(to);
              const {target} = event;
              const {name,value,form} = event.target;
              event.target.setAttribute('modified', '');
              event.target.modified = true;
              object[name] = value;
              // object[subname] = value;
              // const subname = name.split('_').pop();
              // row[fieldName] = JSON.stringify(object);
              // row[name] = addressObj[subname] = value;
              const address = Object.values(object).join(' ');
              to = setTimeout(() => {
                Aim.api('https://aliconnect.nl/v1/google/maps/geocode/json').query({address}).get().then(body => {
                  console.debug(body);
                  body.results.forEach(result => {
                    const {address_components,geometry} = result;
                    if (address_components) {
                      const {location} = geometry;
                      const {lat,lng} = location;
                      Object.assign(object,{lat,lng});
                      address_components.forEach(component => {
                        component.types.forEach(type => {
                          const fieldname = componentNames[type];
                          if (fieldname) {
                            const {el} = $(`div.${prefix}>input[name="${fieldname}"]`);
                            if (!el.value || !el.hasAttribute('modified')) {
                              el.value = object[fieldname] = component.long_name;
                            }
                          }
                        })
                      });
                    }
                  });
                  row[prefix] = JSON.stringify(object);
                });
              },300);
            }
            return $('div').class('row wrap',prefix).append(
              $('input').name('street').value(object.street).attr('modified',object.street ? '' : null).class('input').style('flex:1 0 auto;width:auto;').placeholder('Straat').on('change', geocode),
              $('input').name('street2').value(object.street2).attr('modified',object.street2 ? '' : null).class('input').style('flex:1 0 80px;').type('number').placeholder('Nr').on('change', geocode),
              $('input').name('street3').value(object.street3).attr('modified',object.street3 ? '' : null).class('input').style('flex:1 0 80px;').placeholder('Toe').on('change', geocode),
              $('input').name('postalCode').value(object.postalCode).attr('modified',object.postalCode ? '' : null).class('input').style('flex:1 0 50%;').placeholder('PostCode').on('change', geocode),
              $('input').name('city').value(object.city).attr('modified',object.city ? '' : null).class('input').style('flex:1 0 50%;').placeholder('Plaats').on('change', geocode),
              $('input').name('state').value(object.state).attr('modified',object.state ? '' : null).class('input').style('flex:1 0 50%;').placeholder('Provincie').on('change', geocode),
              $('input').name('country').value(object.country).attr('modified',object.country ? '' : null).class('input').style('flex:1 0 50%;').placeholder('Land').on('change', geocode),
            );
          }
        },
        textarea: {
          view,
          edit: () => $('textarea').html(value).on('change', onchange)
        },
        blob: {
          view: () => $('img').src('data:image/png;base64,' + value),
          view: () => $('img').src(value),
          edit: () => {
            const elem = $('img').src(value);
            return $('div').tabindex(0).append(elem).on('paste', event => {
              const eventData = event.dataTransfer || event.clipboardData;
              const {types,files} = eventData;
              console.debug(types,files);
              if (files) {
                Array.from(files).forEach(file => {
                  const reader = new FileReader();
                  reader.addEventListener("load", () => {
                    console.debug(reader.result);
                    // convert image file to base64 string
                    row[name] = reader.result;
                    elem.src(reader.result);
                  }, false);
                  reader.readAsDataURL(file);
                })
              }
            })
          },
        },
        image: {
          view: () => $('img').src('data:image/png;base64,' + value),
          edit: () => {
            function paste(event) {
              event.preventDefault();
              const eventData = event.dataTransfer || event.clipboardData;
              const {types,files} = eventData;
              if (files) {
                Array.from(files).forEach(file => {
                  const reader = new FileReader();
                  reader.addEventListener("load", event => save(img.src(value = reader.result)), false);
                  reader.readAsDataURL(file);
                })
              }
            }
            const elem = $('div').style('padding:0;display:flex;flex-direction:column;background:white;')
            .on('dragover', event => event.preventDefault())
            .on('drop', paste)
            .on('paste', paste);
            function save() {
              row[name] = value;
              for (var p=elem.el;p;p=p.parentElement) {
                if (p.tagName === 'FORM') {
                  $(p).emit('change');
                }
              }
            }
            function cam() {
              const {nav,elem,close} = new Panel;
              const videoElem = $('video').parent(elem.style('width:640px;height:480px;background:white;')).autoplay(true).style('width:640px;height:480px;');
              let snap = value;
              nav.append(
                $('button').class('icn').type('button').text('PAUSE').on('click', event => {
                  videoElem.el.pause();
                  const [clientWidth,clientHeight] = [640,480];
                  const canvas = $('canvas').width(clientWidth).height(clientHeight);
                  const {el} = canvas;
                  const context = el.getContext('2d');
                  context.drawImage(videoElem.el, 0, 0, clientWidth, clientHeight);
                  snap = el.toDataURL();
                }),
                $('button').class('icn').type('button').text('PLAY').on('click', event => videoElem.el.play()),
                $('button').class('icn').type('button').text('CANCEL').on('click', event => close()),
                $('button').class('icn').type('button').text('CLOSE').on('click', event => save(close(img.src(value=snap)))),
              );
              if (!videoElem.el.srcObject) {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                    try {
                      videoElem.el.srcObject = stream;
                    } catch (error) {
                      videoElem.el.src = window.URL.createObjectURL(stream);
                    }
                    videoElem.el.play();
                  });
                }
              } else if (videoElem.el.paused) {
                videoElem.el.play();
              } else {
                videoElem.el.pause();
              }
            }
            function paint() {
              const {nav,elem,close} = new Panel;
              const canvas = $('canvas').parent(elem.style('width:640px;height:480px;background:white;')).style('height:480px;').paint();
              const {el} = canvas;
              const context = el.getContext('2d');
              nav.append(
                $('button').class('icn').type('button').text('CLEAR').on('click', event => context.clearRect(0, 0, el.width, el.height)),
                $('button').class('icn').type('button').text('CANCEL').on('click', event => close()),
                $('button').class('icn').type('button').text('CLOSE').on('click', event => save(close(img.src(value=el.toDataURL())))),
              );
              // context.drawImage(img.el, 0, 0);
              const image = new Image();
              image.addEventListener("load",()=>context.drawImage(image, 0, 0));
              image.src = value;

            }
            const img = $('img').src(value).style('object-fit:cover;object-position:center;height:480px;');
            elem.append(
              img,
              $('div').tabindex(0).style('position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;'),
              $('nav').style('position:absolute;top:0;left:0;right:0;color:white;margin:auto;').append(
                $('button').class('icn').type('button').text('PAINT').on('click', paint),
                $('button').class('icn').type('button').text('CAM').on('click', cam),
              )
            );
            return elem;
          }
        },
        files: {
          view: () => filesElem(name),
          edit: () => filesElem(name),
        },
        file: {
          view: () => $('img').src(value),
          edit: () => $('input').on('change', event => {
            Array.from(event.target.files).forEach(file => attachementPost(file,row).then(body => {
              const {id,name,lastModifiedDate,size,type,dirname} = body;
              const {serviceRoot} = Aim.config;
              row[propertyName] = serviceRoot + `/${Aim.config.client_id}/${dirname}/${id}-${name}`;
            }));
          })
        },
        html: {
          view: () => $('div').html(value),
          edit: () => {

            // let html = (this.value||'').trim()
            // 				.replace(/<p><\/p>/gis, '')
            // 				.replace(/<p><br><\/p>/gis, '')
            // 				.replace(/<div><\/div>/gis, '')
            // 				.replace(/<div><br><\/div>/gis, '')
            // 				.replace(/^<p>/is, '')
            // 				.replace(/<\/p>$/is, '')
            // 				.replace(/^/is, '<p>')
            // 				.replace(/$/is, '</p>')
            // 				;
            const elem = $('div');
            const stateButtons = {};
            function button() {
              return $('button').type('button')
            }
            function formatButton(name, classname) {
              return stateButtons[name] = button().class(`icn-${classname}`).attr('title', name).on('click', event => formatDoc(name))
            }
            const divElem = $('div')
            .parent(elem)
            .placeholder('')
            .html(value)
            .contenteditable('')
            .on('paste', event => {
              // event.preventDefault();
              console.debug(event, event.clipboardData, event.clipboardData.files, event.clipboardData.types.includes('Files'));
            })
            .on('drop', event => {
              event.preventDefault();
              if (event.dataTransfer.files) {
                [...event.dataTransfer.files].forEach(file => {
                  property.item.elemFiles.appendFile(file).then(file => {
                    console.debug(file);
                    // return;
                    if (window.getSelection) {
                      var sel, range, html;
                      sel = window.getSelection();
                      if (sel.getRangeAt && sel.rangeCount) {
                        //let offset = sel.focusOffset;
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        var elImg = document.createElement('img');
                        elImg.src = file.srcs || file.src;
                        range.insertNode(elImg);
                        range.setStartAfter(elImg);
                        //range.setEnd(elImg, 0);
                        //range.setStart()
                        //range.set
                        //window.getSelection().addRange()
                        //range.setStart(el.childNodes[2], 5);
                        //range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        //document.activeElement.setSelectionRange(5,5);
                      }
                    }
                    else if (document.selection && document.selection.createRange) {
                      document.selection.createRange().text = text;
                    }
                  });
                })
              }
            })
            .on('focus', event => {
              el.currentRange = null;
              document.execCommand('defaultParagraphSeparator', false, 'p');
            })
            .on('keyup', event => {
              if (el.innerHTML && el.innerHTML[0] !== '<') {
                el.innerHTML='<p>'+el.innerHTML+'</p>';
                const node = el.childNodes[0];
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(node, 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                event.preventDefault();
              }
              contentEditableCheck();
            })
            .on('keydown', event => {
              if (event.keyName in keydown) {
                event.preventDefault();
                keydown[event.keyName]();
              }
            })
            .on('blur', event => {
              el.currentRange = window.getSelection().getRangeAt(0);
              row[name] = el.innerHTML;
              console.debug(el.innerHTML);
            })
            .on('mouseup', event => contentEditableCheck);
            const navElem = $('nav').parent(elem).append(
              // formatButton('undo r'),
              // formatButton('redo'),
              // formatButton('cut', 'split'),
              // formatButton('copy'),
              // formatButton('paste'),

              button().class('icn-text_font split').append(
                $('nav').append(
                  ['Arial','Arial Black','Courier New','Times New Roman'].map(
                    fontname => button().class('icn').text(fontname).on('click', event => formatDoc('fontname', fontname))
                  )
                )
              ),
              button().class('icn-text_font_size').append(
                $('nav').append(
                  [
                    [1, 'Very small'],
                    [2, 'A bit small'],
                    [3, 'Normal'],
                    [4, 'Medium-large'],
                    [5, 'Big'],
                    [6, 'Very big'],
                    [7, 'Maximum'],
                  ].map(([size, text]) => button().class('icn').text(text).on('click', event => formatDoc('fontsize', size)))
                )
              ),
              button().class('icn-text_edit_style').append(
                $('nav').append(
                  [
                    {tag:'h1', icn:'text_header_1', text: __('Header 1') + ' <h1>'},
                    {tag:'h2', icn:'text_header_2', text: __('Header 2') + ' <h2>'},
                    {tag:'h3', icn:'text_header_3', text: __('Header 3') + ' <h3>'},
                    {tag:'p', icn:'text_paragraph', text: __('Paragraph') + ' <p>'},
                    {tag:'code', icn:'code_block', text: __('Codeblock') + ' <code>'},
                    {tag:'pre', icn:'', text: __('Preformated') + ' <pre>'},
                  ].map(btn => button().class(`icn-${btn.icn}`).text(btn.text).on('click', event => formatDoc('formatblock', btn.tag)))
                )
              ),
              formatButton('removeFormat', 'text_clear_formatting split'),
              formatButton('bold', 'text_bold split'),
              formatButton('italic', 'text_italic'),
              formatButton('underline', 'text_underline'),
              formatButton('strikeThrough', 'text_strikethrough'),
              formatButton('subscript', 'text_subscript'),
              formatButton('superscript', 'text_superscript'),
              button().class('icn-highlight split').append(
                $('nav').append(
                  ['black','red','orange','yellow','green','blue','white'].map(
                    color => button().class(`icn-highlight_filled`).style(`--icn-color: ${color};`).text(color).on('click', event => formatDoc('backcolor', color))
                  )
                )
              ),
              button().class('icn-text_color').append(
                $('nav').append(
                  ['black','red','orange','yellow','green','blue','white'].map(
                    color => button().class(`icn-text_color_filled`).style(`--icn-color: ${color};`).text(color).on('click', event => formatDoc('forecolor', color))
                  )
                )
              ),
              formatButton('insertunorderedlist', 'text_bullet_list_ltr split'),
              formatButton('insertorderedlist', 'text_number_list_ltr'),
              formatButton('indent', 'text_indent_increase_ltr'),
              formatButton('outdent', 'text_indent_decrease_ltr split'),
              formatButton('justifyleft', 'text_align_left split'),
              formatButton('justifycenter', 'text_align_center'),
              formatButton('justifyright', 'text_align_right'),
              formatButton('justifyfull', 'text_align_justify'),
              stateButtons.blockquote = button().class('icn-text_quote split').on('click', event => formatDoc('formatblock', 'blockquote')),
              stateButtons.hyperlink = button().class('icn-link split').on('click', event => {
                var sLnk = prompt('Write the URL here', 'http:\/\/');
                if (sLnk && sLnk != '' && sLnk != 'http://') {
                  formatDoc('createlink', sLnk)
                }
              }),
              stateButtons.unlink = button().class('icn-link_dismiss').on('click', event => formatDoc('unlink')),
              button().class('icn-eraser split').on('click', event => {
                if(validateMode()&&confirm('Are you sure?')) { this.innerHTML = this.value; }
              }),
              button().class('icn-print').on('click', event => printDoc()),
              // $('button').class('abtn paste').attr('cmd', 'paste').on('click', setDocMode),
            ).on('click', event => clearTimeout(el.blurTimeout), true);

            const {el} = divElem;
            function formatDoc(sCmd, sValue) {
              if (el.currentRange) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(el.currentRange);
              }
              if (validateMode()) {
                document.execCommand(this.cmd || sCmd, false, this.value || this.name || this.Title || sValue || this.cmd || sCmd);
                el.focus();
              }
            }
            function validateMode() {
              if (!el.codeview || !el.codeview.checked) { return true; }
              alert("Uncheck \"Show HTML\".");
              el.focus();
              return false;
            }
            function setDocMode() {
              var oContent;
              if (el.contentEditable !== 'false') {
                oContent = document.createTextNode(el.innerHTML);
                el.innerHTML = '';
                var oPre = document.createElement('PRE');
                oPre.onfocus = function(event) { this.parentElement.onfocus() };
                el.contentEditable = false;
                oPre.id = 'sourceText';
                oPre.contentEditable = true;
                oPre.appendChild(oContent);
                el.appendChild(oPre);
                document.execCommand('defaultParagraphSeparator', false, 'p');
              }
              else {
                if (document.all) {
                  el.innerHTML = el.innerText;
                } else {
                  oContent = document.createRange();
                  oContent.selectNodeContents(el.firstChild);
                  el.innerHTML = oContent.toString();
                }
                el.contentEditable = true;
              }
              el.focus();
            }
            function printDoc() {
              if (!validateMode()) { return; }
              var oPrntWin = window.open('', '_blank', 'width=450, height=470, left=400, top=100, menubar=yes, toolbar=no, location=no, scrollbars=yes');
              oPrntWin.document.open();
              oPrntWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + el.innerHTML + "<\/body><\/html>");
              oPrntWin.document.close();
            }
            const contentEditableCheck = (event) => {
              const sel = window.getSelection();
              const {anchorNode,extentNode} = sel;

              stateButtons.hyperlink.attr('checked', sel.focusNode.parentElement.tagName === 'A');
              stateButtons.unlink.attr('disabled', !(
                (anchorNode.nextSibling && anchorNode.nextSibling.tagName === 'A' && extentNode.previousSibling && extentNode.previousSibling.tagName === 'A') ||
                (extentNode.nextSibling && extentNode.nextSibling.tagName === 'A' && anchorNode.previousSibling && anchorNode.previousSibling.tagName === 'A') ||
                (anchorNode.parentElement.tagName === 'A' && extentNode.parentElement.tagName !== 'A') ||
                (anchorNode.parentElement.tagName !== 'A' && extentNode.parentElement.tagName === 'A')
              ));
              stateButtons.blockquote.attr('checked', anchorNode.parentElement === extentNode.parentElement && extentNode.parentElement.tagName === 'BLOCKQUOTE');
              [
                'bold',
                'italic',
                'underline',
                'strikeThrough',
                'superscript',
                'subscript',
                'insertunorderedlist',
                'insertorderedlist',
                'justifyleft',
                'justifycenter',
                'justifyright',
                'justifyfull'
              ].forEach(name => stateButtons[name].attr('checked', document.queryCommandState(name) ? "" : null))
            };
            const keydown = {
              CtrlKeyD: event => formatDoc('strikeThrough'),
              CtrlAltDigit1: event => formatDoc('formatblock', 'H1'),
              CtrlAltDigit2: event => formatDoc('formatblock', 'H2'),
              CtrlAltDigit3: event => formatDoc('formatblock', 'H3'),
              AltShiftArrowRight: event => formatDoc('indent'),
              AltShiftArrowLeft: event => formatDoc('outdent'),
              CtrlSpace: event => formatDoc('removeFormat'),
              CtrlShiftPeriod: event => {
                var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
                for (var i = 1; i <= 7; i++) {
                  formatDoc('fontsize', i);
                  if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) > startSize) break;
                }
              },
              CtrlShiftComma: event => {
                var startSize = parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize);
                for (var i = 7; i >= 1; i--) {
                  formatDoc('fontsize', i);
                  if (parseInt(window.getComputedStyle(window.getSelection().anchorNode.parentElement, null).fontSize) < startSize) break;
                }
              },
            };
            return elem;
          },
        },
      };
      var {view,edit} = types[format] || types[type] || types.text;
      if (!editable && !value) return;
      // console.debug(name,format)
      var elem = editable ? edit() : view();
      if (elem) {
        return this.class('attr',format,type,name).append(
          icn || description ? $('i').class(`icn-${icn || 'info'}`).title(String(description||'').replace(/\.\s/,'.\n')) : null,
          $('label').attr('caption', title || nameToTitle(name)),
          elem.class(editable ? 'input' : 'view')
          .attr({pattern,name,step,readOnly,required,placeholder,min,low,optimum,high,max,disabled,autocomplete,minlength,maxlength,size,type})
          .on('change', event => onchange),
          unit ? $('span').class('unit').text(unit) : null,
          $('i'),
        )
      }
    },
    async qrcode(selector, context) {
      const {el} = this;
      await require(scriptPath+'lib/js/qrcode.js').then(() => {
        new QRCode(el, selector);
        if (el.tagName === 'IMG') {
          el.src = el.firstChild.toDataURL("image/png");
          el.firstChild.remove();
        }
      });
      return this;
    },
    remove(selector) {
      if (selector) {
        if (this.el.hasAttribute(selector)) {
          this.el.removeAttribute(selector)
        } else {
          (this.el || this.selector).removeEventListener(...arguments);
        }
      } else if (this.el) {
        this.el.remove()
      }
      return this;
    },
    resizable() {
      this.class('resizable');
      const table = this.el;
      const row = table.querySelector('thead>tr');
      console.debug(table,row);
      // const row = table.getElementsByTagName('tr')[0];
      if (!row) return this;
      const cols = [...row.children];
      cols.forEach(elem => {
        $('i').parent(elem).class('resizer').on('mousedown', event => {
          let pageX,curCol,nxtCol,curColWidth,nxtColWidth;
          table.style.cursor = 'col-resize';
          curCol = event.target.parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = event.pageX;
          let padding = paddingDiff(curCol);
          curColWidth = curCol.offsetWidth - padding;
          if (nxtCol) {
            nxtColWidth = nxtCol.offsetWidth - padding;
          }
          function mousemove (event) {
            if (curCol) {
              let diffX = event.pageX - pageX;
              if (nxtCol)
              clearTimeout(to);
              to = setTimeout(() => {
                // nxtCol.style.width = (nxtColWidth - (diffX))+'px';
                curCol.style.width = (curColWidth + diffX)+'px';
              }, 100);
            }
          }
          function mouseup (event) {
            table.style.cursor = '';
            curCol = nxtCol = pageX = nxtColWidth = curColWidth = undefined;
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
          }
          document.addEventListener('mousemove', mousemove);
          document.addEventListener('mouseup', mouseup);
        });
        elem.style.width = Math.max(elem.offsetWidth + 5,50) + 'px';
      });
      table.style.tableLayout = 'fixed';
      let to;
      function paddingDiff(col) {
        if (getStyleVal(col,'box-sizing') == 'border-box') {
          return 0;
        }
        var padLeft = getStyleVal(col,'padding-left');
        var padRight = getStyleVal(col,'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));
      }
      function getStyleVal(elm,css) {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
      }
      return this;
    },
    sample(selector, sample) {
      const {serviceRoot} = Aim.config;
      const {origin} = new URL(serviceRoot);
      const htmlScript = `<html><head><link rel="stylesheet" href="/v1/api/css/web.css" /><script src="/v1/api/js/aim.js"></script><style><!-- style --></style><script><!-- script --></script></head><body></body>`;
      const head = `<script src="/v1/api/js/aim.js"></script><script src="/v1/api/js/web.js"></script>`;
      function codeJs (f) {
        let content = String(f);
        content = String(content).replace(/^(.*?)\{|\}$/g,'').split(/\n/);
        let ident = content.filter(line => line.trim());
        if (ident.length) {
          ident = ident[0].search(/\S/);
          content = content.map(line => line.substr(ident));
        }
        // //console.debug(content);
        return content.join('\n').trim();
      }
      //console.debug(selector);
      const ref = {};
      sample.template = sample.template || htmlScript;
      // const elemHtml = $('td', 'code');
      if (sample.type === 'iframe') {
        this.el.append(
          $('table').append(
            $('tr').append(
              $('th', '', 'script'),
              $('th', '', 'iframe'),
            ),
            $('tr').append(
              $('td', 'code', $().toHtml(codeJs(sample.script), 'js')),
              $('td').append(sampleBody = $('iframe')),
            ),
          ),
        );
        const doc = sampleBody.el.contentWindow.document;
        const html = sample.template.replace(/<\!-- script -->/, script);
        doc.open();
        doc.write(html);
        doc.close();
      } else {
        ref.table = $('table').append(
          $('tr').append(
            $('th', '', 'script'),
            $('th', '', 'div'),
          ),
          $('tr').append(
            $('td', 'code', $().toHtml(codeJs(sample.script), 'js')),
            $('td').append(sampleBody = $('div')),
          ),
        );
        document._body = sampleBody.el;
        //console.debug(document._body);
        sample.script();
        document._body = null;
      }
      this.el.append(
        $('h1', '', selector),
      );
      return this;
    },
    scrollIntoView(options = { block: "nearest", inline: "nearest" }) {
      this.el.scrollIntoView(options);
      return this;
    },
    seperator(name, factor = 1) {
      setTimeout(() => {
        const selectorElem = factor === 1 ? this.previousElementSibling : this.nextElementSibling;
        const {className} = this.el;
        if (selectorElem) {
          selectorElem.css('width', localStorage.getItem(name + '.width'));
        }
        // console.debug(name, selectorElem);
        const pos = factor === 1 ? 'right' : 'left';
        const el = this.class('seperator noselect').on('mousedown', start);
        let moveX;
        let cursor;
        function start(event) {
          if (event.which === 1) {
            moveX = 0;
            if (!event) event = window.event;
            cursor = document.body.style.cursor;
            // document.body.style.cursor = 'col-resize';
            event.stopPropagation();
            event.preventDefault();
            window.getSelection().removeAllRanges();
            el.el.clientX = event.clientX;
            el.css(pos, el.el.moveX = 0).attr('active', '');
            document.addEventListener("mouseup", checkmouseup, true);
            document.addEventListener("mousemove", doresizeelement, true);
          }
        };
        function doresizeelement(event) {
          el.css(pos, - factor * (moveX = event.clientX - el.el.clientX) + 'px');
        };
        function checkmouseup (event) {
          document.removeEventListener('mousemove', doresizeelement, true);
          document.removeEventListener('mouseup', checkmouseup, true);
          document.body.style.cursor = cursor;
          const width = selectorElem.offsetWidth + factor * moveX;
          console.debug(width);
          selectorElem.css('width', width + 'px');
          localStorage.setItem(name + '.width', selectorElem.el.style.width);
          el.style(null).attr('active', null);
        };
      });
      return this;
    },
    set(selector,context) {
      this[selector] = this.el[selector] = context;
      // this.map.set(...arguments);
      return this;
    },
    slider(element) {
      console.error('SLIDER');
      const elements = [...document.getElementsByClassName('aimage')].filter(elem => elem.elem.has('ofile'));
      let imageNr = elements.indexOf(element);
      elements.forEach(element => { if (element.pause) element.pause() });
      // let imageNr = 0;
      this.show = element => {
        const elem = element.elem;
        const ofile = elem.get('ofile') || {};
        const src = ofile.src;
        console.debug(imageNr, elements.length, src);
        this.titleElem.text(
          element.alt,
          ofile.lastmodifieddate ? new Date(ofile.lastmodifieddate).toDisplayString(): null,
          ofile.size ? ofile.size + 'kB': null,
        );
        if (this.srcElem) {
          this.srcElem.remove();
        }
        this.scrollPlay = () => {
          this.srcElem.el.currentTime = frameNumber;
          //window.requestAnimationFrame(scrollPlay);
        };
        if (ofile.src.match(/jpg|png|bmp|jpeg|gif|bin/i)) {
          this.srcElem = $('img')
          .parent(this.containerElem)
          .class(element.className)
          .src(ofile.src)
        } else if (ofile.src.match(/3ds/i)) {
          this.srcElem = $('div')
          .parent(this.containerElem)
          .class(element.className)
          .tds({src:ofile.src, hasControls: true})
        } else if (ofile.src.match(/mp4|webm|mov/i)) {
          frameNumber = 0;
          this.srcElem = $('video')
          .parent(this.containerElem)
          .class(element.className)
          .src(ofile.src)
          .controls('')
          .autobuffer('')
          .preload('')
          .autoplay('')
          .on('click', event => {
            if (!this.srcElem.el.paused) {
              this.srcElem.el.pause();
              frameNumber = this.srcElem.el.currentTime;
            } else {
              this.srcElem.el.play();
            }
          })
          .on('wheel', event => {
            if (!this.srcElem.el.paused) {
              this.srcElem.el.pause();
              frameNumber = this.srcElem.el.currentTime;
            }
            frameNumber += event.deltaY / 1000;
            window.requestAnimationFrame(this.scrollPlay);
          });
          window.requestAnimationFrame(this.scrollPlay);
          // this.srcElement.onended = event => {
          // 	this.next();
          // };
        }
      };
      this.prior = event => {
        console.warn(imageNr, elements.length);
        this.show(elements[imageNr = imageNr ? imageNr - 1 : elements.length - 1]);
      };
      this.next = event => {
        console.warn(imageNr, elements.length);
        this.show(elements[imageNr = imageNr < elements.length - 1 ? imageNr + 1 : 0]);
      };
      const onkeydown = event => {
        if (event.code === "ArrowLeft") {
          event.stopPropagation(event.preventDefault(this.prior(event)))
        } else if (event.code === "ArrowRight") {
          event.stopPropagation(event.preventDefault(this.next(event)))
        } else if (event.code === "Escape") {
          event.stopPropagation(event.preventDefault(this.closeSlider(event)))
        }
      };
      document.addEventListener('keydown', onkeydown, true);
      this.closeSlider = event => {
        document.removeEventListener('keydown', onkeydown, true);
        this.sliderElem.remove();
        // this.el = null;
      };
      this.sliderElem = $('div')
      .class('imageSlider')
      .parent(this.el)
      .on('click', event => event.stopPropagation())
      .append(
        $('div').class('row top').append(
          $('button').class('abtn icn close abs').on('click', this.closeSlider),
          this.titleElem = $('div').class('aco'),
        ),
        this.containerElem = $('div').class('Image').append(
          $('div').class('sliderButton prior').on('click', this.prior).append(
            $('span'),
          ),
          $('div').class('sliderButton next').on('click', this.next).append(
            $('span'),
          ),
        ),
      );
      // swipedetect(divElement, swipedir => {
      // 	if (swipedir === 'left') next();
      // 	else if (swipedir === 'right') prior();
      // });
      this.show(element);
    },
    text(value) {
      if (arguments.length) {
        if (this.el) {
          this.el.innerText = [].concat(...arguments).join(' ');
        }
        return this;
      }
      return this.el.innerText;
    },
    ttext(value) {
      this.el.innerText = [].concat(...arguments).map(s => __(s)).join(' ');
      return this;
    },
    toggle() {
      this.open(!this.open());
      return this;
    },
    type() {
      return this.attr('type', ...arguments);
    },
    tileboard(menuname) {
      if (menuname) return ($.$.menu.items[menuname]) ? $.tileboard.call($.$.menu.items[menuname]) : null;
      if (this.el) return $.elBrd.appendChild(this.el);
      with (this.el = $.elBrd.createElement('DIV', 'col aco start aimitems')) {
        with (createElement('DIV', 'row')) {
          for (var menuname in this.items) {
            var menuitem = this.items[menuname];
            if (menuitem) {
              with (menuitem.elTegel = createElement('DIV', { className: 'col card' })) {
                menuitem.get = menuitem.get || { bv: menuname };
                createElement('DIV', { className: 'row bgd' }).createElement('A', {
                  name: menuname, className: 'row aco abtn icn ' + menuitem.className, innerText: menuitem.Title, menuitem: menuitem,
                  par: menuitem.get,
                  onclick: Element.onclick,
                  //href: '#' + $.url.stringify(menuitem.get || { bv: menuname })
                });
                if (menuitem.showbody) menuitem.showbody();
                for (var itemname in menuitem.items) {
                  var item = $.$.menu.items[itemname];
                  if (item) {
                    item.elLink = createElement('DIV', { className: 'row bgd' }).createElement('A', {
                      name: itemname, className: 'row aco abtn icn ' + item.className, innerText: item.Title, menuitem: item,
                      //par: { mn: this.name },
                      par: item.get,
                      onclick: Element.onclick,
                      //href: '#' + $.url.stringify({ mn: itemname })
                    });
                    if (item.showtitle) item.showtitle();
                  }
                }
              }
            }
          }
          for (var i = 0; i < 4; i++) createElement('DIV', { className: 'card ghost' });
        }
      }
    },
    panel(parent) {
      return this.parent(parent || $('list')).class('col abs').append(
        this.elemBar = $('div').class('row top abs btnbar').append(
          $('span').class('aco'),
          $('button').class('abtn close').on('click', event => this.el.remove()),
        ),
        this.elemMain = $('main').class('aco oa'),
      );
      // return this.parent($('list')).class('col abs').append(
      //   this.elemBar = $('div').class('row top abs btnbar').append(
      //     $('span').class('aco'),
      //     $('button').class('abtn close').on('click', event => this.el.remove()),
      //   ),
      //   this.elemMain = $('main').class('aco oa'),
      // );
    },

    refresh(){
      // console.log(this.property)
      return this;
    },
    setProperty(property, item) {
      Object.assign(this, {property, item})
      this.refresh = function () {
        const {name,min,max} = property;
        const value = item[name];
        // console.log('REFRESH',name,value,this)
        if (min || max) {
          this.css('--value', (Math.round((Number(value) - min) / (max - min) * 100)) +'%');
          this.attr('displayvalue', Math.round(( Number(value) - min) / (max - min) * 100), 2);
        }
        this.value(value || 0);
        // const {el} = this;
        // if (el.tagName === 'METER') {
        //   el.value = value || 0;
        // } else if (el.tagName === 'PROGRESS') {
        //   if (value) {
        //     max = max == 1 ? value : max;
        //     el.value = max - value;
        //     el.setAttribute('perc', Math.round(el.value / max * 100))
        //   } else {
        //     max = 1;
        //     el.value = 0;
        //     el.removeAttribute('perc');
        //   }
        //   // console.debug(el.tagName, el.max, el.value, value);
        // } else if (el.type === 'checkbox') {
        //   el.checked = value;
        // } else {
        //   this.value(el.value = value || 0);
        // }
        return this;
      };
      return this.class(property.name,property.className)
      .min(property.min).max(property.max)
      .css('--min',property.min).css('--max',property.max)
      .attr('format', property.format)
      .attr('unit', property.unit)
      .refresh()
    },
  };
  [
    'accept',
    'animate',
    'accesskey',
    'action',
    'align',
    'allow',
    'alt',
    'async',
    'autocapitalize',
    'autocomplete',
    'autofocus',
    'background',
    'bgcolor',
    'border',
    'buffered',
    'capture',
    'challenge',
    'charset',
    'cite',
    'click',
    // 'class',
    // 'code',
    'codebase',
    'color',
    'cols',
    'colspan',
    'content',
    'contenteditable',
    // 'contextmenu',
    'controls',
    'coords',
    'crossorigin',
    'csp',
    'data',
    'datetime',
    'decoding',
    'defer',
    'dir',
    'dirname',
    // 'displayvalue',
    'download',
    'enctype',
    'enterkeyhint',
    'for',
    'focus',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hreflang',
    'hotkey',
    'icon',
    // 'id',
    'importance',
    'integrity',
    'intrinsicsize',
    'inputmode',
    'ismap',
    'itemprop',
    'keytype',
    'kind',
    'label',
    'lang',
    'language',
    'loading',
    // 'list',
    'loop',
    'low',
    'manifest',
    'max',
    'maxlength',
    'minlength',
    'media',
    'method',
    'min',
    'multiple',
    'muted',
    'name',
    'novalidate',
    // 'open',
    'optimum',
    'pattern',
    'ping',
    'placeholder',
    'poster',
    'preload',
    'radiogroup',
    'readonly',
    'referrerpolicy',
    'rel',
    'required',
    'reversed',
    'rows',
    'rowspan',
    'sandbox',
    'scope',
    'scoped',
    'select',
    'shape',
    'size',
    'sizes',
    'slot',
    'span',
    'spellcheck',
    'src',
    'srcdoc',
    'srclang',
    'srcset',
    'start',
    'step',
    'style',
    'summary',
    'tabindex',
    'target',
    // 'tag',
    'title',
    'translate',
    // 'type',
    'usemap',
    'value',
    // 'width',
    'wrap'
  ].forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    value: function attrValue(value) {
      const {el} = this;
      if (el[name] instanceof Function) {
        el[name](...arguments)
      } else if (value !== undefined) {
        if (name in el) el[name] = value;
        this.attr(name, value);
      }
      return this;
    }
  }));
  'parentElement,nextSibling,previousSibling,nextElementSibling,previousElementSibling'.split(',').forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    get: function property () {
      if (this.el[name]) return new Elem(this.el[name]);
    },
  }));
  'offsetWidth,tagName,maxWidth'.split(',').forEach(name => Object.defineProperty(Elem.prototype, name, {
    enumerable: false,
    get() { return this.el[name] },
    set(value) { this.el[name] = value },
  }));

  Doc = class {
    static async find(options) {
      const {client_id,name} = options;
      const rows = await client.api(`/client(${client_id})/document`).get({name});
      return rows.map(row => new Doc(row));
    }
    constructor(options) {
      this.assign(options);
    }
    assign() {
      Object.assign(this, ...arguments)
    }
    async post() {
      const {client_id,name,type,size,lastModified} = this;
      await client.api(`/client(${client_id})/document`).post({name,type,size,lastModified}).then(body => this.assign(body));
    }
    async find() {
      const {client_id,name} = this;
      return client.api(`/client(${client_id})/document`).get({name});
    }
    async get() {
      const {id} = this;
      return client.api(`/document(${id})`).get();
    }
    async put(content) {
      const {id} = this;
      await client.api(`/document(${id})/resource`).put(content).then(body => this.assign(body));
    }
    async patch(content) {
      const {id} = this;
      content.lastModifiedDateTime = new Date(content.lastModified).toISOString();
      await client.api(`/document(${id})`).patch(content).then(body => this.assign(body));
    }
    content() {
      const {id} = this;
      return client.api(`/document(${id})/resource`).get();
    }
    update() {
      const {id} = this;
      return new Promise((success,fail)=>{
        $('input').type('file').name(name).on('change',event=>{
          Array.from(event.target.files).forEach(async file => {
            const {type,size,lastModified} = file;
            await this.patch({type,size,lastModified});
            await this.put(file);
            success();
          })
        }).click().remove()
      });
    }
    async download() {
      const {id,name,type} = this;
      const content = await client.api(`/document(${id})/resource`).get();
      console.debug(content,name);
      downloadURI(content,name);
    }
    async view() {
      const {id,name,type} = this;
      const {serviceRoot} = Aim.config;
      return window.open(`${serviceRoot}/document(${id})/resource`);
      // return console.debug(`${serviceRoot}/document(${id})/resource`);
      //
      //
      // const src = await client.api(`/document(${id})/resource`).get();
      // console.debug(src);
      //
      // return window.open("").document.write(`<iframe width=100% height=100% src="">`);
      // return window.open("").document.write(`<iframe width=100% height=100% src="${encodeURI(src)}">`);
      //
      // const {nav,elem,close} = new Panel;
      // elem.style('display: flex; flex-direction: column;');
      // $('iframe').style('flex:1 0 auto;border:none;').parent(elem).src(encodeURI(src));
      // nav.append(
      //   $('button').class('icn-back').type('button').on('click', close),
      // )
      // // $('iframe').style('flex:1 0 auto;border:none;').parent(elem).src(encodeURI(src));
      // // var image = new Image();
      // // image.src = content;
      // // window.open("").document.write(`<iframe width=100% height=100% src="${encodeURI(content)}">`);
      // // window.open(content);
      // // window.open("")
    }
    get href() {
      return client.api(`/document(${this.id})/resource`).href;
    }
  };
  class Panel {
    constructor() {
      const focusElems = Array.from(document.body.querySelectorAll(
        'a[href],button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])'
      )).filter(
        el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      );
      focusElems.forEach(el => {
        if (el.hasAttribute('tabindex')) {
          el.setAttribute('ti', el.getAttribute('tabindex'));
        }
        el.setAttribute('tabindex', -1);
      });
      const {overflow} = document.body.style;
      document.body.style.overflow = 'hidden';
      this.nav = $('nav').style('position:absolute;top:0;left:0;right:0;background-color:black;color:white;z-index:1;').append(
      );
      const parent = $('div').parent(document.body).class('pupanel');
      this.elem = $('div').append(this.nav).parent(parent);
      this.onkeydown = (event) => {
        if (event.keyName === 'Escape') this.close();
      }
      window.addEventListener('keydown', this.onkeydown, true)
      this.close = () => {
        window.removeEventListener('keydown', this.onkeydown, true);
        document.body.style.overflow = overflow;
        focusElems.forEach(el => {
          if (el.hasAttribute('ti')) {
            el.setAttribute('tabindex', el.getAttribute('ti'));
          }
          el.setAttribute('tabindex', -1);
        });
        parent.remove();
      }
    }
  }
  const Statusbar = Object.create({
    create() {
      return $('footer').class('statusbar').append(
        $('span').class('pos'),
        $('span').class('main aco'),
        // $('span').class('is_checked'),
        // $('span').class('clipboard'),
        // $('span').class('source'),
        // $('span').class('target'),
        // $('span').class('http'),
        $('span').class('aliconnector'),
        $('span').class('ws'),
        $('progress').max(0).value(0),
      );
    },
    setState(systemName, state) {
      $('.statusbar>.'+systemName).attr('state', state);
    },
    replaceState(selector, name = 'replaceState') {
      // console.warn(selector);
      const url = new URL(selector, document.location);
      // console.debug(window.history, name, selector);
      if (document.location.href !== url.href && window.history && window.history[name] instanceof Function) {
        window.history[name]('','',Web.url = url);
      }
    },
    pushState(selector) {
      this.replaceState(selector, 'pushState');
    },
  });
  Treeview = function() {};
  Object.assign(Treeview, {
    prototype: {
      checkedElements: [],
      focus(el){
        console.debug('focus', el);
        if (this.focusElement) this.focusElement.removeAttribute('focus');
        this.focusElement = el || this.focusElement;
        this.focusElement.setAttribute('focus', '');
        console.debug(this.focusElement)
        this.focusElement.firstChild.focus();
        $(this.focusElement.firstChild).scrollIntoView();
        // return this.focusElement;
      },
      onkeydown(event){

      },
      create() {
        window.addEventListener('copy', event => {
          this.checkedElements.forEach(el => el.setAttribute('checked', 'copy'));
          console.debug('copy', event);
        })
        window.addEventListener('cut', event => {
          this.checkedElements.forEach(el => el.setAttribute('checked', 'cut'));
          console.debug('cut', event);
        })
        window.addEventListener('paste', event => {
          console.debug('paste', event);
        })
        const onevent = (event) => {
          const {name,type,target} = event;
          const {tagName} = target;
          // console.debug(name, target, type, tagName);
          // console.debug(this, focusElement);
          event.stopPropagation();
          const summaryElements = Array.from(document.querySelectorAll('.treeview summary'));
          const elements = summaryElements.filter(elem => elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
          const focusElement = document.querySelector('.treeview summary:focus');
          const index = elements.indexOf(focusElement);
          // console.debug(focusElement,index,elements,event.keyName);
          const shiftSelect = (step) => {
            summaryElements.forEach(el => el.removeAttribute('checked'));
            this.startElement = this.startElement || focusElement;
            this.endElement = elements[index + step];
            this.endElement.focus();
            this.startIndex = elements.indexOf(this.startElement);
            this.endIndex = elements.indexOf(this.endElement);
            const [startIndex,endIndex] = this.startIndex>this.endIndex ? [this.endIndex,this.startIndex] : [this.startIndex,this.endIndex];
            console.debug('Start select', this.startElement,startIndex,endIndex);
            this.checkedElements = elements.slice(startIndex,endIndex + 1);
            this.checkedElements.forEach(el => el.setAttribute('checked', ''));
          }
          const focus = (step) => {
            this.endElement = this.startElement = this.focusElement = elements[index + step];
            this.focusElement.focus();
          }
          const select = () => {
            $(event.target).emit('select');
          }
          const events = {
            // click: () => select(),
            keydownSpace: () => select(),
            keydownArrowUp: () => focus(-1),
            keydownArrowDown: () => focus(1),
            keydownArrowRight: () => focusElement.parentElement.open = true,
            keydownArrowLeft: () => focusElement.parentElement.open = false,
            keydownCtrlC: () => {
              console.debug('Start Copy')
            },

            keydownCtrlArrowUp: () => {
              console.debug('MOVE UP')
            },
            keydownCtrlArrowDown: () => {
              console.debug('MOVE DOWN')
            },
            keydownShiftArrowUp: () => shiftSelect(-1),
            keydownShiftArrowDown: () => shiftSelect(1),
            keydownInsert: () => {
              console.debug('NIEUW SUB REGEL')
            },
            keydownEnter: () => {
              console.debug('NIEUW REGEL')
            },
            keydownCtrlEnter: () => {
              console.debug('NIEUW REGEL CTRL')
            },
            keydownCtrlShiftEnter: () => {
              console.debug('NIEUW REGEL CTRL SHIFT')
            },
            keydownAltShiftEnter: () => {
              console.debug('NIEUW REGEL ALT SHIFT')
            },
            keydownCtrlAltEnter: () => {
              console.debug('NIEUW REGEL CTRL ALT')
            },
            keydownShiftEnter: () => {
              console.debug('NIEUW REGEL SHIFT')
            },
            keydownAltEnter: () => {
              console.debug('NIEUW REGEL ALT')
            },
          }
          if (events[event.name]) {
            event.preventDefault();
            events[event.name]();
          }
        }


        return this.elem = $('div').class('col treeview noselect np')
        .css('width', localStorage.getItem('.treeview.width'))
        .append(
          $('nav').class('np').append(
            $('button').class('icn-back').on('click', event => Web.listview.elem.loadPage('/docs/Home.mdh')),
            // $('button').class('icn-window').on('click', event => Treeview.popout()),
            // $('button').class('icn-pin').on('click', event => => Treeview.pin()),
            $('span'),
          ),
          this.treeElem = $('div').class('col oa list')
          // .on('click', onevent, true)
          .on('keydown', onevent)
          .on('keyup', onevent)
        )
      },

      append(menu, elem) {
        // console.log({menu, elem});
        elem = $(elem || this.treeElem);
        this.menuChilds = (menu, level = 1) => {
          // console.log({menu, elem});
          if (menu) {
            if (!Array.isArray(menu)) {
              // menu = Array.from(Object.entries(menu)).filter(([name,value]) => name[0]!=='$' && !['list', 'exec', 'args', 'href', 'send', 'metaData', 'item'].includes(name)).map(([name,value]) => Object({name,value}));
              // menu = Array.from(Object.entries(menu)).filter(([name,value]) => value).map(([name,value]) => typeof value !== 'function' ? Object.assign(value,{name}) : value);
              menu = Object.entries(menu).map(([name,menuitem]) => Object.assign({name},menuitem));
            }
            return menu.map((menuitem,i) => {
              // console.debug(menuitem)
              let {name,id,icn,hasChildren,ontoggle,onclick,enabled,children,value,$title,title,$list,$select,$filter,$order,$orderby,$search,$top,$path,item,$exec,$args,send,metaData,href} = menuitem;
              // name = isNaN(name) ? name : menuitem.name;
              // console.debug(name,menuitem,children);
              // if ('enabled' in menuitem && !enabled) return;
              if (enabled === false) return;
              // {children} = item||children||{};
              // console.debug(name,value,$title);
              // title = title||Format.displayName(name);
              const elem = menuitem.summaryElem = $('summary')
              .class('icn-'+(icn||''), name)
              // .draggable(true)
              // .on('dragstart', event => {
              //   console.debug(event.type, event);
              //   event.dataTransfer.setData('application/json', JSON.stringify({id}));
              //   // event.preventDefault();
              // })
              // .on('dragover', event => {
              //   // console.debug(event.type);
              //   event.preventDefault();
              //   const {target,type,ctrlKey,altKey,shiftKey} = event;
              //   if (ctrlKey) event.dataTransfer.dropEffect = 'copy';
              //   else if (shiftKey) event.dataTransfer.dropEffect = 'move';
              //   else if (altKey) event.dataTransfer.dropEffect = 'link';
              //   else event.dataTransfer.dropEffect = 'none';
              //   // console.debug(event.type, event);
              // })
              // .on('dragend', event => {
              //   // console.debug(event.type, event);
              // })
              // .on('drop', event => {
              //   // console.debug(event.type, event);
              // })
              .append(
                // level === 1 ? $('i').svg('https://aliconnect.nl/assets/img/options/'+name+'.svg') : $('i'),
                // $('i'),
                $('a').text(Format.displayName(name)).attr({title,href}).on('click', event => {
                  event.stopPropagation();
                  event.preventDefault();
                  elem.emit('select')
                })
              ).on('select', (event) => {
                // console.debug(this, this.focusElement, document.querySelector('div.tv :focus'));
                document.querySelectorAll('.treeview summary[select]').forEach(el => el.removeAttribute('select'));

                this.checkedElements.forEach(el => el.removeAttribute('checked'));
                this.endElement = this.startElement = this.focusElement = event.target;
                this.focusElement.focus();

                // document.querySelectorAll('div.tv [focus]').forEach(el => el.removeAttribute('focus'));
                // this.focusElement = elem;
                elem.attr('select', '');
                // elem.attr('focus', '');
                if (typeof menuitem === 'function') {
                  menuitem();
                } else if (onclick) {
                  onclick();
                } else if (name && name[0] === '$') {
                  Aim[name.substr(1)](...value);
                } else if ($path) {
                  Listview.list($path, {$select,$filter,$order,$orderby,$search,$top});
                } else if ($exec) {
                  $args = Array.isArray($args) ? $args : [$args];
                  Web[$exec](...Array.from($args||[]));
                } else if (send) {
                  Aim.send('/aliconnector/execute', { body: send })
                } else if (item) {
                  const {uid,id} = item;
                  const $select = 'id,uid,name,title,subject,summary,parentId,masterId,srcId';
                  Aim.api('/Aim/item/children').query({uid,$select}).get().then(([children]) => {
                    Listview.render(children);
                    const meer = Object.fromEntries(children.map(item => [item.id, {item}]));
                    details.clear().append(elem, menuChilds(meer));
                    // console.debug(meer);
                  });
                } else if (metaData && metaData.l) {
                  const url = metaData.l.url;
                  const entries = Object.entries(metaData.l);
                  entries.shift();
                  const search = '?'+entries.map(event => event.join('=')).join('&').replace(/ /g,'+');
                  console.debug(search);
                  document.location.hash = `#?l=${Aim.Web.urlToId(url + search)}`;
                }
              }).on('focus', (event) => {
                // this.focusElement = event.target;
                // console.debug('FOCUS', this, event.target);
              });
              const details = menuitem.detailsElem = $('details')

              .hasChildren(hasChildren)
              .open(localStorage.getItem('treeview-'+name))
              .on('toggle', event => {
                localStorage.setItem('treeview-' + name, event.target.open ? 1 : '');
              })
              .on('toggle', ontoggle)
              .append(
                elem,
                this.menuChilds(children, level + 1),
              );
              // console.log(name,details);
              return details;
            });
          }
        }
        elem.append(this.menuChilds(menu));
        return elem;
      },
      pin() {
        $(document.body).attr('tv', $(document.body).attr('tv') ? null : 0);
      },
      popout() {
        var url = document.location.origin;
        // var url = 'about:blank';
        const rect = this.el.getBoundingClientRect();
        console.debug(this.win);
        if (this.win) {
          console.debug(this.win);
          return this.win.focus();
        }
        const win = this.win = window.open(url, null, `top=${window.screenTop},left=${window.screenLeft + document.body.clientWidth-rect.width},width=${rect.width},height=${rect.height}`);
        window.addEventListener('beforeunload', event => win.close());
        const doc = this.win.document;
        doc.open();
        doc.write(pageHtml);
        doc.close();
        const Aim = $;
        win.onload = function (event) {
          const $ = this.$;
          const document = win.document;
          $(document.documentElement).class('app');
          $(document.body).class('col Aim om bg').id('body').append(
            // $('section').class('row aco main').id('section_main').append(
            $('section').tree().class('aco').style('max-width:auto;'),
            // ),
            $('footer').statusbar(),
          );
          (async function () {
            await $().translate();
            await $().getApi(document.location.origin+'/api/');
            await $().login();
            if (Aim().menuChildren) {
              $().tree(...Aim().menuChildren);
            }
            // await $(`/Contact(${aimClient.sub})`).details().then(item => $().tree($.user = item));
            // console.debug(Aim.user.data);
            $().tree(Aim.user.data);
          })()
        }
      },
    }
  });
  Listview = function() {};


  Object.assign(Listview, {
    list(selector, options = {}, search) {
      Aim.listselector = selector;
      const schemaName = String(selector).split('/').pop();
      const schema = Item.getSchema(schemaName);
      const {cols} = schema;
      const headerCols = cols.filter(col => col.header || col.filter);
      // const $select = headerCols.map(col => col.name).join(',');
      options.$select = options.$select || headerCols.map(col => col.name).join(',');
      selector = selector.match(/^http/) ? selector : Aim.config.serviceRoot + selector;
      const url = new URL(selector);
      Object.entries(options).forEach(([name,value]) => value !== undefined ? url.searchParams.append(name,value) : null);
      // console.debug(decodeURIComponent(url.href),selector,schemaName);
      document.location.hash = `#?l=${Web.urlToId(url.href)}`;
    },
    prototype: {
      create() {
        return this.elem = $('div').class('row listview');
      },
      render(rows, options = {}) {
        this.elem.clear();
        const self = this;
        let {schemaName} = options;
        const listUrl = new URL(atob(Web.url.searchParams.get('l')), document.location);
        if (!schemaName && listUrl) {
          schemaName = (listUrl.pathname.match(/(\w+)$/)||[]).pop();
        }

        const schema = Aim.config.definitions[schemaName];
        const context = rows['@odata.context'];
        // $('div.tv').attr('hide',1);
        rows = this.rows = (rows ? rows.value || rows.rows || rows : this.rows).map(row => row instanceof Item ? row : new Item({schemaName},row));

        // rows.forEach(row => row.schemaName = row.schemaName||schemaName);

        const schemaNames = rows.map(row => row.schemaName).unique().filter(Boolean);
        const schemas = schemaNames.map(Item.getSchema);

        let focusElem;
        let selectElem;
        let filter = {
          schemaName: {
            name: 'schemaName',
            title: 'Schema',
            values: {},
          }
        };
        // rows.filter(row => row['@odata.id']).forEach(row => row.schemaName = row['@odata.id'].match(/(\w+?)\(/)[1]);
        try {
          rows = rows.map(row => row.data ? Object.assign(row,JSON.parse(row.data)) : row);
        } catch (err) {

        }

        function focus(elem) {
          if (!elem) return;
          elem = elem.elem||elem;
          const {el} = elem;
          if (!el) return;
          const {row} = el;
          if (!row) return;
          if (focusElem !== elem) {
            focusElem = this.focusElem = elem;
            clearTimeout(selectTimeout);
            document.querySelectorAll('[focus]').forEach(event => event.removeAttribute('focus'));
            focusElem.attr('focus', '').scrollIntoView();
          }
          return focusElem;
        }
        function select(elem) {
          if (elem = focus(elem)) {
            if (this.selectElem !== this.focusElem) {
              selectElem = this.selectElem = this.focusElem;
              const {el} = selectElem;
              const {row} = el;
              const {uid,id} = row;
              document.querySelectorAll('[select]').forEach(event => event.removeAttribute('select'));
              selectElem.attr('select', '');
              $('span.pos').text(rows.length + (rowsVisible.length === rows.length ? '' : '/' + rowsVisible.length) + ':' + ( rowsVisible.indexOf(row) + 1));
              if (options.select) return options.select(row);
              console.log(3,row);
              row.select();
              // document.location.hash = `#?id=${Web.urlToId(row.href)}`;
            }
            return elem;
          }
        }
        function move(event, offset) {
          // console.debug(event.target.parentElement);
          console.debug(event.target.parentElement);
          const itemElem = event.path.find(el => el.item);
          this.setFocusElement(itemElem);
          if (this.focusElement) {
            event.preventDefault();
            event.stopPropagation();
            const parent = this.focusElement.parentElement.item;
            const index = [...this.focusElement.parentElement.children].indexOf(this.focusElement) - 1;
            // this.focusElement.item.attr('Master', {
            //   action: 'move',
            //   LinkID: parent.ID,
            //   Data: index + offset,
            // }).then(item => item.elemTreeLi.elemTreeDiv.scrollIntoView());
            $.link({
              name: 'Master',
              item: this.focusElement.item,
              to: parent,
              // current: parent,
              index: index + offset,
              action: 'move',
            })
            .then(item => {
              console.debug('move done', item, item.elemTreeLi.el);
              this.setFocusElement(item.elemTreeLi.el);
            });
            // }).then(item => this.setFocusElement(event.target.parentElement)item.elemTreeLi.elemTreeDiv.scrollIntoView());
          }
        }
        function moveUp(event) {
          if(focusElem.previousElementSibling) {
            focusElem.parentElement.insertBefore(focusElem,focusElem.previousElementSibling);
          }
        }
        function moveDown(event) {
          if(focusElem.nextElementSibling && focusElem.nextElementSibling.tagName==='DIV') {
            focusElem.parentElement.insertBefore(focusElem,focusElem.nextElementSibling.nextElementSibling);
          }
        }
        function setSelect() {
          selectTimeout = setTimeout(() => select(focusElem), 300);
        }

        const types = {
          rows: () => {
            elements=[];
            return $('div').class('col cards',options.type)
            // .style('height:300px;')
            .on('click', event => {
              // handleEvent(event);
              // console.debug(1,event);
              if (event.shiftKey) {
                const start = elements.indexOf(selectElem.el);
                const el = event.path.find(focus);
                const end = elements.indexOf(el);
                elements.forEach((el,i) => i>=start && i<=end || i<=start && i>=end ? el.setAttribute('checked', '') : el.removeAttribute('checked'));
              } else if (event.ctrlKey) {
                const el = event.path.find(focus);
                el.setAttribute('checked', '');
              } else {
                elements.forEach(el => el.removeAttribute('checked'));
                console.log(1231, event);
                const el = event.path ? event.path.find(select) : null;
              }
            })
            .on('keydown', event => key.down[event.keyName] ? key.down[event.keyName](event) : null)
            .on('keyup', event => key.up[event.keyName] ? key.up[event.keyName](event) : null)
            .append(
              $('div').class('col').append(
                rowsVisible.map(row => {
                  const elem = row.rowElem
                  .on('drop', event => row.ondrop(event))
                  .on('focus', event => focus(elem));
                  // .on('click', event => select(elem));
                  elements.push(elem.el);
                  elem.el.row = elem.row = row;
                  return elem;
                }),
                ['','','','','','','','','','','','','','','','','','','','','',''].map(i => $('span').class('ghost')),
              )
            )
            .tabindex(0);
          },
          cols: () => types.rows(),
          table: () => {
            var cols = {};
            if (rows.every(row => 'schemaName' in row)) {
              rows.forEach(row => {
                const schema = Aim.config.definitions[row.schemaName] || { properties: {} };
                Object.entries(schema.properties).forEach(([propertyName,property]) => {
                  if ((propertyName in row) && row[propertyName]) {
                    cols[propertyName] = cols[propertyName] || Object.assign({name: propertyName},property);
                  }
                });
              });
            } else {
              // console.debug(11111,  Object.keys(rows[0]));
              cols = Object.keys(rows[0]).filter(name => name[0] !== '@').map(name => {
                const values = rows.map(row => row[name]).unique().map(val => Object({ val: val, rows: rows.filter(row => row[name] === val)}));
                // filter = values.some(val => val.rows.length>1);
                return {
                  name,
                  values,
                  // filter,
                };
              })
            }
            console.debug(1111, cols);
            cols = Object.values(cols);
            return $('div').append(
              $('table').class('products').append(
                $('thead').append(
                  $('tr').append(
                    $('th').append(
                      $('i').class('checkbox'),
                    ),
                    cols.map(col => $('th').append(
                      $('div').text(col.title || Format.displayName(col.name)).class(this.sortName === col.name ? 'sort' : '', this.sortDir ? 'asc' : '').on('click', event => {
                        this.sortDir = this.sortName === col.name ? this.sortDir ^ 1 : 0;
                        const sortFactor = 1-2*this.sortDir;
                        // console.debug(this.sortName, col.name, sortFactor, this.sortDir);
                        this.sortName = col.name;
                        rowsVisible.sort((a,b) => sortFactor * String(a[col.name]).localeCompare(String(b[col.name]), undefined, {numeric: true}));
                        Aim.om.listView(rows, options.type, filter, rowsVisible);
                      })
                    ))
                  )
                ),
                $('tbody').append(
                  rowsVisible.map(row => {
                    const elem = row.elemList = $('tr').append(
                      $('td').append(
                        $('i').class('checkbox').on('click', event => {
                          event.stopPropagation();
                          elem.checked(row.checked ^= 1)
                        }),
                      ),
                      cols.map(col => $('td').class(col.name).style(isNaN(row[col.name]) ? '' : 'text-align:right;').append(valueTag(col,row))),
                    ).on('click', event => {
                      rowsVisible.forEach(row => row.elemList.checked(row.checked = 0));
                      elem.checked(row.checked = 1);
                      select(elem);
                    });
                    elem.row = row;
                    return elem;
                  })
                )
              )
            )
          },
          calendar: () => $('div').calendar(rowsVisible),
          gantt_chart: () => $('div').ganth(rowsVisible),
        };
        const key = {
          down: {
            ArrowDown: event => {
              event.preventDefault(event.stopPropagation());
              elements.forEach(el => el.removeAttribute('checked'));
              focus(focusElem.nextElementSibling||focusElem);
            },
            ArrowUp: event => {
              event.preventDefault();
              elements.forEach(el => el.removeAttribute('checked'));
              focus(focusElem.previousElementSibling||focusElem);
            },
            CtrlHome: event => {
              event.preventDefault();
              focus(Array.from(document.querySelectorAll('div.col.cards>div.col>div')).shift().elem);
            },
            CtrlEnd: event => {
              event.preventDefault();
              focus(Array.from(document.querySelectorAll('div.col.cards>div.col>div')).pop().elem);
            },
            PageDown: event => {
              event.preventDefault();
              for (var i=0,el=focusElem.el;elements.includes(el.nextElementSibling) && i<10;el = el.nextElementSibling) i++;
              focus(el.el);
            },
            PageUp: event => {
              event.preventDefault();
              for (var i=0,el=focusElem.el;elements.includes(el.previousElementSibling) && i<10;el = el.previousElementSibling) i++;
              focus(el.el);
            },
            ShiftArrowDown: event => {
              event.preventDefault();
              focusElem.checked(true);
              focus(focusElem.nextElementSibling||focusElem);
              focusElem.checked(true);
            },
            ShiftArrowUp: event => {
              event.preventDefault();
              focusElem.checked(true);
              focus(focusElem.previousElementSibling||focusElem);
              focusElem.checked(true);
            },
            AltShiftArrowDown: moveDown,
            AltShiftArrowUp: moveUp,
            CtrlArrowDown: moveDown,
            CtrlArrowUp: moveUp,
          },
          up: {
            CtrlHome: setSelect,
            CtrlEnd: setSelect,
            PageUp: setSelect,
            PageDown: setSelect,
            ArrowUp: setSelect,
            ArrowDown: setSelect,
          }
        };
        const listNav = rows.map(row => row.schemaName).filter(Boolean).unique().map(Item.getSchema).map(schema => schema.listNav ? schema.listNav : null).filter(Boolean);
        let selectTimeout;
        let elements = [];
        var cols = [];
        // maak kolommen uit schemas
        if (schemas.length) {
          schemas.forEach(schema => {
            // const schema = Aim.config.definitions[schemaName];
            // if (schema) {
            cols = schema.cols = schema.cols || Object.entries(schema.properties||{}).map(([name,prop]) => Object.assign({name: name}, prop));
            cols.filter(col => col.filter || col.enum).forEach(col => {
              // console.debug(col);
              filter[col.name] = Object.assign({
                name: col.name,
                title: col.title || col.name.replace(/^\w/, s => s.toUpperCase()),
                values: {},
                // rows: [],
              },col)
            })
            // }
          })
        }
        // als kolomen niet bestaan genereer kolomen uit rows


        if (!cols && rows.length) {
          cols = Object.keys(rows[0]).map(name => {
            values = rows.map(row => row[name]).unique().map(val => Object({
              val: val,
              rows: rows.filter(row => row[name] === val),
            }));
            if (values.some(val => val.rows.length>1)) {
              // console.debug(name);
              filter[name] = {
                name,
                title: Format.displayName(name),
                values: {},
                // rows: [],
              }
            }
            // filter = values.some(val => val.rows.length>1);
            // return {
            //   name,
            //   values,
            //   filter,
            // };
          })
        }
        // bereid alle kolommen voor
        rows.forEach(row => {
          if (row.address = row.businessAddress || row.otherAddress || row.address) {
            row.address = JSON.parse(row.address);
            const {lat,lng} = row.address;
            row.location = {lat,lng};
          }
          if (row.precompile) {
            schema.app.precompile(row, filter);
          }
          // console.debug(row.address);
          // const schema = Aim.config.definitions[row.schemaName];
          // if (schema) {
          //   const cols = schema.cols;
          //   if (schema.app) {
          //     if (schema.app.precompile) {
          //       schema.app.precompile(row, filter);
          //     }
          //   }
          // }
        });

        const searchString = new URL(document.location).searchParams.get('$search');
        var searchRegExp;
        if (searchString && searchString!=='*') {
          var searchRegExp = new RegExp(`(${searchString.replace(/\s/g,'|')})`,'ig');
          var wordRegExp = new RegExp(`\\b(${searchString.replace(/\s/g,'|')})\\b`,'ig');
          // console.debug(searchString, rows.map(a => (a.headers||[''])[0].match(wordRegExp)));
          rows.sort((a,b) => ( (b.headers||[''])[0].match(wordRegExp) ? 1 : 0) - ((a.headers||[''])[0].match(wordRegExp)?1:0));
        }

        function displayvalue(value, col) {
          // console.debug(col, value)
          if (col.options) {

            const option = col.options.find(option => option.value === value) || {};
            return option.caption || value;
          }
          if (col.type === 'boolean') {
            return value ? 'Ja' : 'Nee';
          }
          return String(value).replace(/\w/, s => s.toUpperCase());
        }

        filter = Object.values(filter);
        // console.debug(filter);
        rows.forEach(row => {
          filter.filter(attribute => attribute.name in row).forEach(attribute => {
            function addValue(value) {
              if (isNaN(value)) value = String(value).trim().toLowerCase();
              const attributeValue = attribute.values[value] = attribute.values[value] || {
                value: value,
                title: displayvalue(value, attribute),
                rows: [],
              };
              attributeValue.rows.push(row);
            }
            const {format} = attribute;
            // console.debug(attribute);
            if (format === 'string collection') {
              if (row[attribute.name]) {
                let value = JSON.parse(row[attribute.name]);
                value.forEach(addValue);
              }
            } else {
              addValue(row[attribute.name]);
            }
            // let value = row[attribute.name];
            // if (isNaN(value)) value = String(value).trim().toLowerCase();
            // const attributeValue = attribute.values[value] = attribute.values[value] || {
            //   value: value,
            //   title: displayvalue(value, attribute),
            //   rows: [],
            // };
            // attributeValue.rows.push(row);
          })
        })

        // console.debug(123, filter);

        // filter.forEach(attribute => {
        //   attribute.values = rows
        //   .map(row => {
        //     if (attribute.name in row) {
        //       if (isNaN(row[attribute.name])) return String(row[attribute.name]).trim().toLowerCase();
        //       return row[attribute.name];
        //     }
        //     // attribute.name in row ? (isNaN(row[attribute.name]) ? String(row[attribute.name]).trim().toLowerCase() : row[attribute.name]) : ''
        //   })
        //   .unique()
        //   .sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric: true}))
        //   .map(value => Object({
        //     value,
        //     title: displayvalue(value, attribute),
        //     rows: rows.filter(row => attribute.name in row && String(row[attribute.name]).toLowerCase().trim() == String(value||'').toLowerCase().trim() )
        //   }))
        // });
        filter.forEach(attribute => {
          attribute.values = Array.from(Object.values(attribute.values))
          .sort((a,b) => String(a.value).localeCompare(String(b.value), undefined, {numeric: true}))
          // .map(value => Object({
          //   value,
          //   title: displayvalue(value, attribute),
          //   rows: rows.filter(row => attribute.name in row && String(row[attribute.name]).toLowerCase().trim() == String(value||'').toLowerCase().trim() )
          // }))
        });
        filter.sort((a,b) => a.values.length - b.values.length);

        let rowsVisible = Aim.listRows = rows || [];
        if (rows.some(row => row.location)) {
          types.map = () => $('div').append(
            $('div').css('height:100%;width:100%;').googleMap(rowsVisible.filter(row => row.location)),
          );
          // types.route = () => $('div').class('row').append(
          //   $('div').css('flex: 1 0 0;min-height: 600px;').googleRoute(rowsVisible.filter(row => row.location)),
          //   $('div').class('pv').style('display:flex;flex-direction:column;'),
          // );
          types.route = () => $('div').googleRoute(rowsVisible.filter(row => row.location));
        }
        filter = filter.filter(attribute => attribute.values.length>1);

        function valueTag(col,row) {
          if (col.schema) {
            return $('a').text(row[col.name]).href(`#${col.schema}(${row[col.name]})`)
          }
          if (col.cell) {
            if (typeof col.cell !== 'function') {
              col.cell = new Function('col', 'row', col.cell);
            }
            return col.cell(col,row);
          }
          // console.debug(col.name, row[col.name], row);
          return $('span').append(row[col.name])
          // let inpElem;
          // const elem = $('td').class(col.name).align(isNaN(row[col.name]) ? 'left' : 'right').append(
          //   (function() {
          //     function span() {
          //       return $('span').text(col.name in row ? row[col.name] : '')
          //     }
          //     return span();//col.cell ? col.cell(row) : span();
          //   })()
          // ).on('click', event => {
          //   if (!col.readOnly) {
          //     // event.preventDefault();
          //     // event.stopPropagation();
          //     if (!elem.querySelector('input')) {
          //       $('input').parent(elem).value(row[col.name] || '')
          //       .on('change', event => {
          //         console.debug(row);
          //         const value = row[col.name] = elem.querySelector('span').innerText = elem.querySelector('input').value;
          //         fetch('https://aliconnect.nl/abis/data', {
          //           method: 'POST',
          //           body: JSON.stringify({
          //             response_type: requestType,
          //             id: row.id,
          //             name: col.name,
          //             value: value,
          //           }),
          //         }).then(async res => {
          //           console.debug(await res.text());
          //         });
          //       })
          //       .on('blur', event => {
          //         elem.querySelector('input').remove();
          //       }).select();
          //     }
          //   }
          // });
          // return elem;
        }
        function labelTag(col,row) {
          return $('label').text(col.title || col.name)
        }
        function rowsFiltered(filter) {
          return rows.filter(row => !filter.some(val => !val.values.some(value => value.rows.includes(row))));
        }

        // $('.listview').attr('hidefilter', Aim.showfilter).clear();
        const parentElem = this.elem;
        const listelem = $('div').class('col list').parent( $('div').class('row').parent(parentElem) );
        // $('div').class('flex').parent('.listview').append(
        //   $('div').class('flex-col list'),
        // );
        // const navElem = $('nav').parent($('.listview'));
        // const listContainerElem = $('div').parent($('.listview'));
        // const filterElem = $('aside').class('oa filter').parent(listContainerElem);
        // const rowsElem = $('div').parent(listContainerElem)
        // console.debug(cols);
        cols = cols.filter(col => rows.some(row => row[col.name]))
        cols.sort((a,b) => a.name.localeCompare(b.name));


        (function buildlist(type) {
          type = options.type = type || options.type || sessionStorage.getItem('listType') || 'rows';
          sessionStorage.setItem('listType', type);
          const checkedFilters = filter
          .filter(col => col.checked = col.values.some(val => val.checked))
          .map(col => Object({name: col.name, values:col.values.filter(val => val.checked) }));
          Aim.listRows = rowsVisible = rowsFiltered(checkedFilters);
          $('span.pos').text(rows.length + (rowsVisible.length === rows.length ? '' : '/' + rowsVisible.length));
          var hidefilter = parseInt(Web.getItem('hidefilter'));
          listelem.class('hidefilter', hidefilter ? true : false).clear().append(
            $('nav').append(
              $('button').class('icn-back').on('click', event => {
                $('main>div>div.listview').clear();
                // Web.url = new URL(document.location);
                Web.url.searchParams.delete('l');
                Statusbar.replaceState(Web.url.href);
              }),
              $('input').class('search').placeholder('Typ hier om te zoeken').on('change', event => search(event.target.value)).value(Web.url.searchParams.get('$search')),
              $('button').class('icn-add').on('click', async event => {
                // const row = await Aim.api(context).post();
                // console.debug(context, row);
                Item.get(await Aim.api(context).post()).pageElem(true);
              }),
              // $('button').class('icn-add').append(
              //   $('nav').append(
              //     schemaNames.map(schemaName => $('button').text(schemaName).on('click', event => {
              //       // console.debug('ADD', schemaName);
              //       Aim.row({}, schemaName).pageElem(true);
              //     })),
              //     $('button').text(schemaName).on('click', event => {
              //       // console.debug('ADD', schemaName);
              //       Aim.row({}, schemaName).pageElem(true);
              //     })
              //   ),
              // ),
              filter.length ? $('button').class('icn-filter').on('click', e => listelem.class('hidefilter', Web.getItem('hidefilter',hidefilter^=1))) : null,
              $('span'),
              ...listNav.map(fn => fn()),
              $('button').class('icn-arrow_sort').append(
                $('nav').append(
                  cols.map(col => $('button').class(rows.sortBy === col.name ? 'icn-text_sort_descending' : 'icn-text_sort_ascending').caption(col.name).on('click', event => {
                    rows.sortDir = rows.sortBy === col.name ? rows.sortDir ^ 1 : 0;
                    rows.sortBy = col.name;
                    rows.sort((a,b) => (rows.sortDir ? -1 : 1) * String(a[rows.sortBy]).localeCompare(b[rows.sortBy], undefined, { numeric: true }));
                    buildlist(type);
                  }))
                ),
              ),
              $('button').class('icn-eye').append(
                $('nav').append(
                  Object.keys(types).map(key => $('button').caption(key).class('icn-'+key).on('click', event => buildlist(type = key)))
                ),
              ),
            ),
            $('div').class('row').append(
              filter.length ? [
                $('aside').class('col filter').css('width', localStorage.getItem('aside.filter.width') || '200px').append(
                  $('div').append(
                    filter.filter(col => col.checked).map(col => $('div').append(
                      // $('span').text(Format.displayName(col.title)),
                      $('i').class('icn-dismiss_square')
                      // .caption(Format.displayName(col.title)+':', col.values.filter(val => val.checked).map(val => val.title).join(', '))
                      .caption(col.values.filter(val => val.checked).map(val => val.title).join(', '))
                      .on('click', event => {
                        col.values.forEach(v => delete(v.checked));
                        buildlist();
                      }),
                      // ': ',
                      // $('b').text(col.values.filter(val => val.checked).map(val => val.title).join(', ')),
                    )),
                    filter.filter(col => col.checked || col.values.some(val => val.rows.some(row => rowsVisible.includes(row)))).map(col => {
                      // const colRowsVisible = rows.filter(row => !checkedFilters.filter(fcol => fcol.name !== col.name).some(val => !val.values.includes(String(row[val.name]).toLowerCase())));
                      const colRowsVisible = rowsFiltered(checkedFilters.filter(fcol => fcol.name !== col.name));
                      const values = col.values.filter(val => col.checked || val.rows.some(row => colRowsVisible.includes(row)));
                      if(values.some(val => val.checked) || values.length>1) {
                        return $('div').attr('more', col.more).append(
                          $('legend').text(Format.displayName(col.title)),
                          values
                          .filter(val => val.value !== null)
                          .filter(val => val.rows.filter(row => colRowsVisible.includes(row)).length).map((val,i) => [
                            i == 5 ? $('div').class('more').on('click', event => event.target.parentElement.setAttribute('more', col.more ^= 1)) : null,
                            $('div')
                            .append(
                              $('i').class('icn-checkbox_unchecked').caption(val.title)
                            )
                            .checked(val.checked)
                            .attr('cnt', val.rows.filter(row => colRowsVisible.includes(row)).length)
                            .on('click', event => buildlist(type, val.checked ^= 1))
                          ])
                        );
                      }
                    }),
                  )
                ),
                $('i').seperator('filter'),
              ] : null,
              // $('i').seperator('aside.filter'),
              types[type] ? types[type]() : types.cols(),
              // $('div').class('oa').append(
              //   (types[type] ? types[type]() : types.cols())
              // )
              // .tabindex(0)
              // .on('keydown', event => {
              //   switch (event.key) {
              //     case 'ArrowDown': {
              //       event.preventDefault();
              //       return focusElem.nextElementSibling ? focus(focusElem.nextElementSibling) : null;
              //     }
              //     case 'ArrowUp': {
              //       event.preventDefault();
              //       return focusElem.previousElementSibling ? focus(focusElem.previousElementSibling) : null;
              //     }
              //   }
              //   // console.debug(event);
              // })
              // .on('keyup', event => selectTimeout = setTimeout(() => select(), 300)),
            ),
          )
        })()
      },
      show(path, options) {
        const api = Aim.api(path).query(options);
        // console.debug(88,path,api);
        // console.warn(11111, path, api+'', api.href);
        Web.url.searchParams.set('l', btoa(api));
        Web.url.pathname = '';
        Web.url.hash = '';
        Statusbar.replaceState(Web.url);
        return api.get().then(body => this.render(body));
      },
      showUrl(path, options) {
        Aim.fetch(path).headers(localStorage.getItem('access_token') ? {
          Authorization: 'bearer ' + localStorage.getItem('access_token'),
        } : {}).query(options).get().then(([rows]) => Listview.render(rows));
      },
    },
  });
  const Aliconnector = Object.create({
		/** @function Aliconnector.outlookImportMail
		*/
		outlookImportMail() {
			ws.send({ to: { deviceUID: $.deviceUID }, msg: { external: 'mailimport' } });
		},
		/** @function Aliconnector.outlookImportContacts
		*/
		outlookImportContacts() {
			ws.send({ to: { deviceUID: $.deviceUID }, msg: { external: 'mailimport' } });
		},
    getAliconnectorKey() {
      const {deviceId} = Aim;
      copyToClipboard(deviceId);
      alert('Plak (Ctrl + V) de code in het veld "User device UID" van uw aliconnector app');
    },
    setConnectorId(connectorId) {
      // connectorId = '4328291f-8542-42cc-bd67-5021b5e54a58';
      localStorage.setItem('connectorId', connectorId);
      Aim.send('/aliconnector/client/init', { body: { nonce: localStorage.getItem('connectorId') } });
    }
	});
  His = Object.create({
    map: new Map(),
    api_parameters: {},
    classes: {},
    fav: [],
    items: [],
    elem: {},
    itemsModified: {},
    handlers: {},
    httpHandlers: {},
    openItems: (localStorage.getItem('openItems')||'').split(','),
    mergeState(url) {
      var documentUrl = new URL(document.location);
      url = new URL(url, document.location);
      url.searchParams.forEach((value, key) => documentUrl.searchParams.set(key, value));
      // documentUrl.hash='';
      self.history.replaceState('page', '', documentUrl.href.replace(/%2F/g, '/'));
    },
    replaceUrl(selector, context) {
      if (self.history) {
        if (typeof selector === 'object') {
          Object.entries(selector).forEach(entry => arguments.callee(...entry));
        } else if (arguments.length>1) {
          var url = new URL(document.location);
          if (context) {
            url.searchParams.set(selector, context);
          } else {
            url.searchParams.delete(selector)
          }
          url.hash='';
        } else {
          var url = new URL(selector, document.location.origin);
        }
        url = url.pathname.replace(
          /^\/\//,
          '/'
        ) + url.search;
        console.warn(6);
        self.history.replaceState('page', '', url);
      }
    },
  });
  Pdf = Object.create({
    getPages(url) {
      // progress = document.querySelector('progress');
      return new Promise(async (success,fail)=>{
        const progress = Web.progress('Pdf worker');
        await require(scriptPath+'lib/js/pdf.js'); // pdfjsLib
        await require(scriptPath+'lib/js/pdf.worker.js');
        let items=[];
        pdfjsLib.getDocument(url).promise.then(pdf => {
          const max = pdf.numPages;
          progress.max += max;
          let imageCount = 0;
          (function getPage(pageNumber) {
            progress.value++;
            pdf.getPage(pageNumber).then(async page => {
              let opList = await page.getOperatorList();
              imageCount += opList.fnArray.filter((v,i) => opList.fnArray[i] == pdfjsLib.OPS.paintImageXObject).length;
              page.getTextContent({
                normalizeWhitespace: true,
                disableCombineTextItems: false,
              }).then(page => {
                // console.debug(item);
                items.push(...page.items);
                if (pageNumber < pdf.numPages) {
                  setTimeout(() => getPage(pageNumber + 1),0);
                } else {
                  // console.log(items);
                  progress.max -= max;
                  progress.value -= max;
                  progress.done();
                  success(Object.create({
                    items () {
                      return items;
                    },
                    lines () {
                      const lines = [];
                      const par = [];
                      let str = '';
                      let prevLeft = 0;
                      let prevTop = 0;
                      let prevTransform = {};
                      let prevItem;
                      items.forEach((item,i) => {
                        let {hasEOL,transform,str} = item;
                        // if (str && hasEOL) str += '#\n\n';
                        if (str) {
                          const [s1,z2,z3,s,l,t] = item.transform;
                          const a1 = l - prevLeft < 2;
                          const a2 = prevTop - t > 2 * s;
                          const a3 = prevTop - t > 2 * prevTransform.s;
                          // console.log({hasEOL,l,t,s1,s,a1,a2,a3}, str);
                          prevTransform = {l,t,s1,s};
                          prevLeft = l;
                          prevTop = t;
                          if (a3) {
                            lines.push('\n\n');
                          } else if (!a1) {

                          } else if (a1 && prevItem && prevItem.hasEOL === false) {
                            lines.push('  \n');
                          }
                          // else if (!hasEOL) lines.push('  \n');
                          lines.push(str);
                          prevItem = item;
                        } else {
                          lines.push(' ');
                        }

                        // lines.push(str || ' ');
                        // if (prevLeft >= left || top > prevTop) {
                        //   lines.push(str);
                        //   str = '';
                        // }
                        // str += item.str;
                      });
                      // lines.push(str);
                      // console.debug(imageCount);

                      if (imageCount) {
                        lines.unshift(`Dit document bevat afbeeldingen die tekst kunnen bevatten. Voor het bekijken van alle tekst kan het document met OCR worden geanalyseerd. Dit is echter een betaalde dienst en is niet geactiveerd.\n\n`);
                      }
                      return lines;//.map(item => item.str);
                    },
                    text () {
                      const text = this.lines().join('');
                      // console.log(text);
                      return text;
                      // .replace(/\n\n/g, ' ')
                      // .replace(/(\w)\n(\w)/, '$1 $2')
                      // .replace(/\n\n/, '\r\n')
                    },
                  }));
                  // success(pages);
                }
              });
            });
          })(1);
        }, err => console.error(err));
      })
    },
    toText(url) {
      this.getPages(url).then(items => {
        const lines = [];
        const par = [];
        let args = {};
        let fonts = {};
        let str = '';
        let prevLeft = 0;
        // let line = '';
        console.log(items);

        function addstr(str) {
          if (str.match(/Basisspecificatie TTI RWS Tunnelsysteem \|/)) return;
          if (str.match(/Pagina.*van/)) return;

          // str = str.trim();
          // par.push({s:str});
          lines.push(str);
        }

        items.forEach(item => {
          const [p1,p2,p3,p4,left,top] = item.transform;
          if (prevLeft >= left) {
            addstr(str);
            str = '';
          }
          str += item.str;
          prevLeft=left;
        });
        addstr(str);
        let chapter = [0];
        let inhoud = true;
        let index = 0;
        let level = 0;
        let doc = [];
        let doclevel = [];
        let docitem = doc[index] = doclevel[level] = [];
        let match;
        let linestr;
        function updateDocitem() {
          if (docitem.lines) {
            docitem.lines = docitem.lines
            .map(line => line === ' ' ? '\n' : line)
            .join('')
            .split(/\n/)
            .map(line => line.trim()).filter(Boolean)
            ;
          }
        }
        lines.forEach((line,i) => {
          if (line.match(/Inhoud/)) inhoud = false;
          function setdocitem (newlevel) {
            level = newlevel;
            index = chapter[level] = chapter[level]+1;
            updateDocitem();

            doclevel[level+1] = doclevel[level][index] = docitem = [];
            docitem.title = line;
            chapter[level+1]=0;
          }
          const isBody = !inhoud && !line.match(/\.\.\./);
          if (isBody && (match = line.match(/^([0-9]+)\s+[0-9A-Z]/))) {
            if (match[1] == chapter[0]+1 && !lines[i-1].trim()) {
              setdocitem(0);
              lines[i] = line.replace(/^[0-9\.]+\s/,'# ');
            }
          } else if (isBody && (match = line.match(/^([0-9]+)\.([0-9]+)\s+[0-9A-Z]/))) {
            if (match[1] == chapter[0] && match[2] == chapter[1]+1) {
              setdocitem(1);
              lines[i] = line.replace(/^[0-9\.]+\s/,'## ');
            }
          } else if (isBody && (match = line.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\s+[A-Z]/))) {
            if (match[1] == chapter[0] && match[2] == chapter[1] && match[3] == chapter[2]+1) {
              setdocitem(2);
              lines[i] = line.replace(/^[0-9\.]+\s/,'### ');
            }
          } else if (isBody && (match = line.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\s+[A-Z]/))) {
            if (match[1] == chapter[0] && match[2] == chapter[1] && match[3] == chapter[2] && match[4] == chapter[3]+1) {
              setdocitem(3);
              lines[i] = line.replace(/^[0-9\.]+\s/,'#### ');
            }
          } else if (isBody && (match = line.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\s+[A-Z]/))) {
            if (match[1] == chapter[0] && match[2] == chapter[1] && match[3] == chapter[2] && match[4] == chapter[3] && match[5] == chapter[4]+1) {
              setdocitem(4);
              lines[i] = line.replace(/^[0-9\.]+\s/,'##### ');
            }
          } else if (isBody && (match = line.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)\s+[A-Z]/))) {
            if (match[1] == chapter[0] && match[2] == chapter[1] && match[3] == chapter[2] && match[4] == chapter[3] && match[5] == chapter[4] && match[6] == chapter[5]+1) {
              setdocitem(5);
              lines[i] = line.replace(/^[0-9\.]+\s/,'##### ');
            }
          } else {
            docitem.lines = docitem.lines || [];
            docitem.lines.push(line);
          }
        });
        updateDocitem();
        // text = lines.join('\n');
        // AIM.HttpRequest('').query({ext: 'md'}).post(text).then(event => console.log('done'));
        let docdata = {document:[]};
        (makesub = function (doc, docu) {
          doc.forEach(doc => {
            let sub = {};
            const title = doc.title.trim().replace(/^[0-9\.]+\s/,'');
            doc.lines = doc.lines || [];
            // doc.lines = doc.lines.map(line => {
            //   let match = line.match(/^(BSTTI#[0-9]+)\s(.*)/);
            //   if (match) {
            //     var [str,eisNr,eisTekst] = match;
            //     let obj = {};
            //     obj[eisNr] = {
            //       type: title.toLowerCase(),
            //       eisTekst: eisTekst,
            //     };
            //     return obj;
            //   }
            //   return line;
            // });
            let subarray = sub[title] = doc.lines;
            docu.push(sub);
            makesub(doc, subarray);
          })
        })(doc[0], docdata.document);

        console.log(par);
        return par;
      })
    },
    async producties(elem) {
      const {el} = $(elem);
      await require(scriptPath+'lib/js/jspdf.debug.js'); // jsPDF
      await require(scriptPath+'lib/js/pdf-lib.js'); // PDFLib
      // await Web.require('https://aliconnect.nl/sdk/dist/js/pdf/jspdf.debug.js'); // jsPDF
      // await Web.require('https://aliconnect.nl/sdk/dist/js/pdf/pdf-lib.js'); // PDFLib
      const { PDFDocument } = PDFLib;
      const producties = [];

      // var doc = new jsPDF();
      // var elementHandler = {
      //   '#ignorePDF': function (element, renderer) {
      //     return true;
      //   }
      // };
      // var source = document.getElementById('doc-content');//window.document.getElementsByTagName("body")[0];
      // doc.fromHTML(
      //     source,
      //     15,
      //     15,
      //     {
      //       'width': 180,'elementHandlers': elementHandler
      //     });
      //
      //     window.open(doc.output('bloburl'))
      //
      // // doc.output("dataurlnewwindow");
      //
      // return;
      // var pdf = new jsPDF('p','pt','a4');
      // pdf.addHTML(document.getElementById('doc-content'), event => {
      //   pdf.save('web.pdf');
      // });
      // return;
      const docs = [];
      const pdfDoc = await PDFDocument.create();

      const buttons = Array.from(el.querySelectorAll('button'));
      buttons.forEach(el => el.style = 'display:none;');
      const links = Array.from(el.querySelectorAll('a')).filter(a => a.href && a.href.match(/\.pdf$/));
      console.debug(links);
      let i=1;
      Array.from(el.querySelectorAll('a')).filter(a => a.href && a.href.match(/\.pdf$/)).forEach(a => {
        a.className = 'productie-link';
        if (producties[a.href]) {
          a.text = producties[a.href].link;
        } else {
          producties.push(producties[a.href] = {
            text: a.innerText,
            // link: a.innerText = `productie ${i}, ${a.innerText.toLowerCase()}`,
            link: a.innerText = `productie ${i}`,
            href: a.href,
            i: i++,
          });
        }
      });

      await (async function() {
        const {serviceRoot} = Aim.config;
        const pdfBytes = await fetch(serviceRoot + '/tools/html2pdf', {
        // const pdfBytes = await Aim.fetch(Aim.dmsUrl + 'Aim/Pdf', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          // mode: 'cors', // no-cors, *cors, same-origin
          // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          // credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'text/html'
            // 'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          // redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          // body: JSON.stringify(data), // body data type must match "Content-Type" header
          body: el.innerHTML,//document.querySelector('.doc-content').innerHTML, // body data type must match "Content-Type" header
        }).then((res) => res.arrayBuffer());
        const pdfLoad = await PDFDocument.load(pdfBytes);
        const pages = pdfLoad.getPages();
        for (let page of pages) {
          const embedPage = await pdfDoc.embedPage(page);
          pdfDoc.addPage().drawPage(embedPage);
        }
      })();

      for (let productie of producties) {

        var doc = new jsPDF();

        let top = 20;
        let marginLeft = 20;
        doc.setFontSize(22);
        doc.setFontSize(22);
        doc.text(marginLeft, top+=10, 'Productie');
        doc.setFont('helvetica'); // string: courier | times | helvetica
        doc.setFontType("italic"); // string: italic | bold | bolditalic
        doc.setTextColor(255, 0, 0); // red
        doc.setTextColor(150); // light gray
        doc.setTextColor(100); // gray
        doc.text(marginLeft, top+=10, String(productie.i));
        doc.setTextColor(0); // black
        doc.setFontSize(16);
        doc.text(marginLeft, top+=10, productie.text);
        // doc.fromHTML('');

        const docArray = doc.output('arraybuffer');

        const firstDoc = await PDFDocument.load(docArray);
        const firstPage = await pdfDoc.copyPages(firstDoc, firstDoc.getPageIndices());
        firstPage.forEach((page) => pdfDoc.addPage(page));


        const pdfBytes = await fetch(productie.href).then((res) => res.arrayBuffer());
        const pdfLoad = await PDFDocument.load(pdfBytes);
        const pages = pdfLoad.getPages();
        for (let page of pages) {
          const embedPage = await pdfDoc.embedPage(page);
          pdfDoc.addPage().drawPage(embedPage);
        }
      }
      const pdfBytes = await pdfDoc.save();

      let file = new Blob([pdfBytes], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL);
      buttons.forEach(el => el.style = '');

      // download(pdfBytes, "doc.pdf", "application/pdf");

      // window.open(doc.output('bloburl'))
      // return;
      // window.open(doc.output('dataurlnewwindow'));
      // return doc.output('dataurlnewwindow');     //opens the data uri in new window
      // return doc.output('datauri');              //opens the data uri in current window
      // doc.output('datauristring');        //returns the data uri string
      // doc.output('save', 'filename.pdf'); //Try to save PDF as a file (not works on ie before 10, and some mobile devices)
      // doc.save('Test.pdf');
      //
      // return
      // // console.debug(111, elem, elem.getElementsByTagName('A'));
      // const links = Array.from(elem.getElementsByTagName('A')).filter(a => a.href);
      // let ip = 1;
      // links.forEach((a,i) => {
      //   if (a.href.match(/pdf$/)) {
      //     if (producties[a.href]) return a.text = producties[a.href].toLowerCase();
      //     const title = producties[a.href] = 'Productie ' + ip++ + ', ' + a.text;
      //     a.text = title.toLowerCase();
      //
      //     $(elem).append($('h1').class('productie').text(title));
      //
      //     const divElem = $('div').parent(elem);
      //     var loadingTask = pdfjsLib.getDocument(a.href);
      //     loadingTask.promise.then(async pdf => {
      //       // console.debug('PDF loaded');
      //       var numPages = pdf.numPages;
      //       // console.debug(pdf);
      //       for (var pageNumber=1, numPages = pdf.numPages;pageNumber<=numPages;pageNumber++) {
      //         await pdf.getPage(pageNumber).then(function(page) {
      //           // console.debug('Page loaded');
      //
      //           var scale = 1;
      //           var viewport = page.getViewport({scale: scale});
      //
      //           // Prepare canvas using PDF page dimensions
      //           // var a = $('a').parent(divElement).href(divElement.getAttribute('source'));
      //           var canvas = $('canvas').parent(divElem).elem;
      //           // document.body.appendChild(canvas);
      //           // var canvas = document.getElementById('the-canvas');
      //           var context = canvas.getContext('2d');
      //           canvas.height = viewport.height;
      //           canvas.width = viewport.width;
      //
      //           // Render PDF page into canvas context
      //           var renderContext = {
      //             canvasContext: context,
      //             viewport: viewport
      //           };
      //           var renderTask = page.render(renderContext);
      //           renderTask.promise.then(function () {
      //             // console.debug('Page rendered');
      //           });
      //         });
      //       }
      //
      //       // Fetch the first page
      //     }, function (reason) {
      //       // PDF loading error
      //       console.error(reason);
      //     });
      //     // console.debug(source);
      //   }
      //   if (a.href.match(/jpg$/)) {
      //     if (producties[a.href]) return a.text = producties[a.href].toLowerCase();
      //     const title = producties[a.href] = 'Productie ' + (i + 1) + ', ' + a.text;
      //     $(elem).append($('h1').class('productie').text(title));
      //     a.text = title.toLowerCase();
      //     $('img').parent(elem).src(a.href);
      //   }
      // })
    },
  });
  Prompt = Object.create({
    DURATION: 1000,
    DURATION: 500,
    promptIndex: 0,
    pages: {},
    set(selector, context) {
      if (selector instanceof Object) {
        Object.entries(selector).forEach(entry => Prompt.set(...entry));
      } else {
        const prompt = this.pages[selector] = context;
        prompt.index = this.promptIndex++;
        prompt.className = '';
      }
      return this;
    },
    open(selector) {
      const { DURATION } = this;
      console.debug('prompt', selector);
      const parent = this.parent = this.parent || $('div').parent('main>div').class('prompt');
      const children =  Array.from(parent.el.children);
      if (!selector) {
        children.forEach(el => $(el).class('done'));
        // prompt.parent.clear();
      }
      const prompt = this.pages[selector];
      if (prompt) {
        const url = new URL(document.location);
        url.searchParams.set('prompt', selector);
        Statusbar.replaceState(url);

        var timeMs = 0;
        function fadein() {
          if (!prompt.elem || !document.body.contains(prompt.elem.el)) {
            console.debug('nieuw',prompt.className);
            prompt.elem = $('div').parent(parent).class(prompt.className);
          }
          const {elem} = prompt;
          prompt(elem);
          setTimeout(() => elem.class('out', false).class('in'), 50);
          const inputElement = elem.el.querySelector('input');
          if (inputElement) {
            setTimeout(() => $(inputElement).select().focus(), 500);
          }
        }
        if (this.prompt) {
          const {elem,index} = this.prompt;
          elem.class('out', this.prompt.className = prompt.index > index);
          // elem.class(arguments.callee.prompt.className = prompt.index > index ? 'out' : arguments.callee.prompt.className);
          setTimeout(() => {
            elem.remove();
            setTimeout(() => fadein());
          }, timeMs = DURATION);
        } else {
          fadein();
        }
        this.prompt = prompt;
      } else {
        if (this.prompt) {
          const {elem} = this.prompt;
          elem.class(this.prompt.className = 'out');
          setTimeout(() => elem.remove(), DURATION);
          this.prompt = null;
        }
      }
      return this;
    },
  });
  Player = Object.create({
		unlock() {
			console.debug("unlocking");
			var buffer = this.audioContext.createBuffer(1, 1, 22050);
			var source = this.audioContext.createBufferSource();
			source.buffer = buffer;
			source.connect(this.audioContext.destination);
			source.start ? source.start(0) : source.noteOn(0);
		},
		async init(options) {
			var AudioContext = window.AudioContext || window.webkitAudioContext;
			const audioContext = this.audioContext = new AudioContext(); // Make it crossbrowser
			var gainNode = audioContext.createGain();
			gainNode.gain.value = 1; // set volume to 100%
			function getAudioData(url) {
				return new Promise((success,fail)=>{
					window.fetch(url)
					.then(response => response.arrayBuffer())
					.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer,success,error => console.error(error)));
				});
			}
			for (let [name,url] of Object.entries(options)) {
				const audioData = await getAudioData(url);
				let bufferSource;
				this[name] = Object.create({
					start() {
						bufferSource = audioContext.createBufferSource();
						bufferSource.buffer = audioData;
						bufferSource.connect(audioContext.destination);
						// bufferSource.loopEnd = 2.3;
						// bufferSource.loop = true;
						bufferSource.start();
					},
					stop() {
						bufferSource.stop();
					},
				});
			}
		},
	});
  Messenger = Object.create({
    init: () => {
      if ('Notification' in this) {
        this.permission = Notification.permission;
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    },
    show: (content) => {
      const {title, options} = content;
      if ("Notification" in self) {
        if (Notification.permission === "granted") {
          var notification = new Notification(title, options);
          notification.onclick = function (event) {
            //console.debug('CLICKED', options);
            // self.open("http://www.stackoverflow.com");
            // self.location.href = 'https://aliconnect.nl';
          }
        }
      }
    },
  });
  Web = Object.setPrototypeOf({
    Aliconnector,
    Clipboard,
    Elem,
    Pdf,
    Prompt,
    Player,
    Popup,
    Statusbar,
    XLSBook,
    Panel,
    analytics () {
      (function (i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function (){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(self,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', {
        trackingId: 'UA-28018977-1',
        cookieDomain: 'auto',
        // name: 'schiphol',
        // userId: '12345'
      });
      ga('send', 'pageview');
    },
    get pageHtml() {
      return `<!DOCTYPE HTML><html><head><link href="${this.sdkUrl}css/web_debug.css" rel="stylesheet"/><script src="${this.sdkUrl}js/aim_debug.js" libraries="web"></script></head><body></body></html>`;
    },
    progress(message) {
      const messageElem = $('span').parent('footer>.main').text('Wachten op', message);
      const progressElem = document.querySelector('footer>progress')||{};
      progressElem.value += 1;
      return {
        get max(){
          return progressElem.max;
        },
        set max(value){
          progressElem.max = value;
        },
        get value(){
          return progressElem.value;
        },
        set value(value){
          progressElem.value = value;
        },
        text(){
          messageElem.text(...arguments);
        },
        done(){
          progressElem.value -= 1;
          messageElem.remove();
        }
      }
    },

    url: new URL(document.location.origin),
    downloadURI,
    async contentLoaded(event) {
      // await Web.init();
      /** @deprecated Eerst volder in url is librarie, zo ja uitvoeren */
      // var firstFolder = document.location.pathname.match(/(\w+)\//);
      // if (firstFolder && libraries[firstFolder[1]]) {
      //   await libraries[firstFolder[1]]();
      // } else {
      // }
      if (currentScript.attributes.libraries) {
        for (lib of currentScript.attributes.libraries.value.split(',')) {
          if (this[lib]) await this[lib]();
        }
      }
      await Web.init();
      await Web.emit('loaded', Aim);
      $(window).on('popstate', this.seturl);
      $(window).on('hashchange', this.seturl);
      await $(window).emit('popstate');
      await $(window).emit('focus');
    },

    /** @deprecated  messagePopup, use error */
    error,
    urlToId (href) {
      return btoa(href).replace(/[=]+Aim/g,'');
    },
    idToUrl (id) {
      return atob(id);
    },
    async init(config) {
      Aim.config(config);
      Aim.on('message', Aim.onmessage);
      return Web;
    },

    /** @deprecated */
    _focusSection(event, offset) {
      if (event.clickEvent && document.activeElement === document.body) {
        const currentSection = event.clickEvent.path.find(elem => elem.tagName === 'SECTION');
        const children = [...document.body.getElementsByTagName('SECTION')];
        const index = children.indexOf(currentSection);
        const nextSection = children[index + offset];
        if (nextSection) {
          nextSection.click();
        }
        event.preventDefault();
      }
    },
    async seturl(event) {
      // console.debug(event.type);
      event.preventDefault();
      const url = new URL(document.location);
      // console.warn(Web.url.href);
      // console.warn(1, lasturl);
      // console.warn(2, url.href);
      // if (lasturl === url.href) return;
      // lasturl = url.href;
      if (Web.url.href === url.href) return;
      var {hash} = url;
      var search = hash.split('?').pop() || url.search;
      var searchParams = new URLSearchParams(search);
      Array.from(searchParams.entries()).forEach(([key,value])=>url.searchParams.set(key,value));
      url.hash = '';
      // console.debug('SETURL', search, searchParams.has('l'), searchParams.has('id'));
      if (Web.listview) {
        if (url.searchParams.has('l')) {
          if (Web.listview.id !== url.searchParams.get('l')) {
            Nav.set('l', url.searchParams.get('l'));
            const href = atob(url.searchParams.get('l'));
            // console.debug(1,href);
            url.pathname = '';
            url.hash = '';
            // Web.url = url;
            const loadUrl = new URL(href, document.location.origin);
            // console.debug(1,href,loadUrl);
            await Web.listview.show(loadUrl.href);
          }
          Web.listview.id = url.searchParams.get('l')
        } else {
          Web.listview.id = null;
        }
      }
      if (url.searchParams.get('id') !== Web.url.searchParams.get('id')) {
        if (url.searchParams.has('id')) {
          Nav.set('id', url.searchParams.get('id'));
          const href = atob(url.searchParams.get('id'));
          // console.warn(href);
          // console.debug(81);

          // const row = await Aim.api(href).get();
          // console.debug(href);
          Item.get(await Aim.api(href).get()).select();
        } else {
          $('.pages').clear();
        }
      }
      var {pathname} = Web.url;
      Web.url = url;
      if (window.history.replaceState) window.history.replaceState('','',url);
      if (pathname !== url.pathname && url.pathname.match('.md')) {
        if (Web.listview) {
          await Web.listview.elem.loadPage(Web.url.pathname + Web.url.hash);
        }
      } else {
        Web.goUrl(url.href);
      }
      Statusbar.replaceState(Web.url);
      // console.debug(1234);
    },
    goUrl(href) {
      const url = new URL(href);
      // console.debug(url.pathname);
      const {operations,paths} = config;
      if (paths && paths[url.pathname] && paths[url.pathname].get && paths[url.pathname].get.operation) {
        Statusbar.replaceState(url, 'pushState');
        paths[url.pathname].get.operation();
        return true;
      }
      if (operations) {
        // console.debug(operations);
        // console.debug('goUrl',url.pathname);
        // const path = url.pathname.split('/');
        const fn = operations[url.pathname.replace(/\//g,'_').slice(1)];
        if (fn instanceof Function) {
          Statusbar.replaceState(url, 'pushState');
          fn();
          return true;
        }
      }
    },
    // ScriptLoader,
    // App,
    require,
    getItem(name, value) {
      if (value === undefined) {
        return localStorage.getItem(name);
      }
      localStorage.setItem(name, value);
      return value;
    },


    // importScript,
    orderChangeCell,
    async web() {
      if (document && !["interactive","complete"].includes(document.readyState)) {
        await new Promise((succes,fail) => window.addEventListener("DOMContentLoaded",succes));
      }
    },
    async ready() {
      if (document && !["interactive","complete"].includes(document.readyState)) {
        await new Promise((succes,fail) => window.addEventListener("DOMContentLoaded",succes));
      }
    },
    errorPopup(error) {
      const {innererror} = error;
      const {trace} = innererror || {};
      const elem = $('div').parent(document.body)
      .style('position:fixed;display:flex;flex-direction:column;margin:auto;top:0;right:0;bottom:0;left:0;max-width:600px;max-height:300px;border:solid 1px gray;background:white;')
      .append(
        $('nav').append(
          $('button').class('icn-back').on('click', event => elem.remove()).style('position:sticky;top:0;'),
        ),

        $('h1').text(error.code, error.status),
        $('pre').text(JSON.stringify(error.message,null,2)).style('overflow:auto;'),
        $('pre').text(trace ? trace.map(trace => `${trace.file}:${trace.line}`).join('\r\n') : null).style('overflow:auto;'),
      );
      console.error(error);
    },
    errorMessage(error) {
      const {innererror} = error;
      const {trace} = innererror || {};
      const elem = $('div').parent(document.body).style('position:sticky;bottom:0;background:red;display:flex;').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span').text(error.code, error.status),
      );
      // const elem = $('span').parent('.statusbar>main').class('error').text(error.code, error.status)
      console.error(error);
    },
    // _pages(options) {
    //   if (!url.searchParams.get('id') && !url.searchParams.get('l')) {
    //     if (document.location.pathname === '/' && !document.location.search) {
    //       var href = '/docs/Home.md';
    //       Web.listview.elem.loadPage(href);
    //       Statusbar.replaceState(href+'h');
    //     }
    //   }
    //   Aim.loadMd('/docs/Nav-Top.md', '.pagemenu');
    //   Aim.loadMd('/docs/Page-Footer.md', 'body>footer>div.mw');
    // },
    /** serviceWorker, noodzakelijk voor opstarten als app in chrome
    kan worden geladen met libraries
    @todo serviceWorker opruimen
    */
    sw() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
          console.debug('MESSAGE', event);
          if (event.data && event.data.url) {
            const url = new URL(event.data.url);
            document.location.href = '#' + url.pathname + url.search;
          }
          // alert('sadfasdfa');
          // window.focus();
        });
        // return;
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(registration) {
          // console.debug('Registration successful, scope is:', registration.scope, navigator.serviceWorker);
          return;
          if ($().sw = registration) {
            // return;
            // registration.showNotification('sfasdfa');
            registration.pushManager
            .subscribe({ userVisibleOnly: true })
            .then(function(sub) {
              // From your client pages:
              const channel = new BroadcastChannel('sw-messages');
              channel.addEventListener('message', event => {
                console.debug('Received', event.data);
              });
              // console.debug('SW', sub);
              // $().sw = registration.active;
              if ($().sw.active) {
                $().sw.active.postMessage(
                  JSON.stringify({
                    hostname: document.location.hostname,
                    // device_id: $.his.cookie.device_id,
                    // access_token: $.his.cookie.access_token,
                    // id_token: $.his.cookie.id_token,
                    // refresh_token:$.his.cookie.refresh_token,
                  }),
                );
              }
              // //console.debug("Posted message");
            });

          }
        })
        .catch(function(error) {
          // //console.debug('Service worker registration failed, error:', error);
        });
      }
    },
    async _init(options) {
      Aim.scopes=[];
      window.addEventListener('click', event => {
        const el = event.target;
        if (el.hasAttribute('href')) {
          let href = el.getAttribute('href');
          // console.debug(href);
          if (Aim[href]) {
            $(el).on('click', event => {
              event.preventDefault();
              event.stopPropagation();
              Aim[href]();
            });
          }
          if (href.match('.mdh')) {
            event.preventDefault();
            Web.listview.elem.loadPage(href);
          }
        }
      }, true);
    },
    replaceFields,
    search,
    checkPath: event => {
      let elem;
      if (elem = event.path.find(elem => elem.item)) {
        event.itemElement = elem;
        event.item = event.itemElement.item;
      }
    },
    checkkey: event => {
      const path = $.his.clickEvent ? [...$.his.clickEvent.path] : [];
      path.push($);
      path.forEach(elem => {
        // const onkey = elem['on' + event.type];
        // // //console.debug(event, elem, onkey);
        // if (onkey) {
        // 	onkey.call(elem, event);
        // }
        const keys = elem[event.type];
        if (keys && keys[event.keyPressed]) {
          keys[event.keyPressed].call(elem, event);
        }
      })
    },
    eventKeyState: event => {
      return event ? (event.shiftKey && event.ctrlKey ? 'link' : (event.shiftKey ? 'move' : (event.ctrlKey ? 'copy' : 'default'))) : 'default';
    },
    hrefSrc: (href, src = '/') => {
      if (href[0]==='#') return href;
      // console.debug(href, src, new URL(src, document.location).href);
      if (href.match(/^http/)) return href;
      href = new URL(href, new URL(src, document.location)).href.replace(/^.*?\//,'/');
        // console.debug(href);
      return href;
      // return href.toLowerCase();
    },
    linkify: (inputText) => {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;

        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText;
    },
    loadStoredCss: () => {
      const css = JSON.parse(localStorage.getItem('css')) || {};
      for (let [id, param] of Object.entries(css)) {
        let selector = id === '_body' ? document.body : document.getElementById(id);
        if (selector) {
          selector.style.cssText += Object.entries(param).map(entry => entry.join(':')).join(';');
        }
      }
    },
    onkey: event => {
      window.event = event;
      event.keyPressed = [
        event.ctrlKey ? 'ctrl_' : '',
        event.shiftKey ? 'shift_' : '',
        event.altKey ? 'alt_' : '',
        event.code,
      ].join('');
      $.his.keyEvent = null;
      clearTimeout($.his.keydownTimeout);
      clearTimeout($.his.keyupTimeout);
      clearTimeout($.his.keybufferTimeout);
      $.his.keybufferTimeout = setTimeout(() => $.his.keybuffer = [], 300);
      $.his.keybuffer = $.his.keybuffer || [];
      $.his.keybuffer.push(event.key);
      event.keybuffer = $.his.keybuffer;
      // if (document.activeElement !== document.body) {
      // 	event.keyPressed += '_edit';
      // }
      // 	key = key.replace('Arrow', '').replace('Escape', 'Esc');
      checkPath(event);
      if ($.his.clickEvent) {
        event.itemElement = event.itemElement || $.his.clickEvent.itemElement;
        event.item = event.item || $.his.clickEvent.item;
        event.clickEvent = $.his.clickEvent;
      }
    },
    prompt,
    s2ab,
    // paint,
    // promptform,
    // search,
    urlString: (s = '') => {
      return s.replace(/%2F/g, '/');
    },
    initEvents() {
      $(window)
      .on('afterprint', event => {
        //var event = Listview.elOa;
        ////console.debug('BEFORE PRINT'); //items.printiframe(Listview.elOa);
        //if ($.elPrintDiv) $.elPrintDiv.innerText = '';
      })
      .on('beforeunload', event => {
        if ($.his.handles) for (var name in $.his.handles) { $.his.handles[name].close(); }
      })
      .on('beforeprint', event => {
        //var event = Listview.elOa;
        //console.debug('BEFORE PRINT'); //items.printiframe(Listview.elOa);
        return;
        if (!$.printElement) {
          $.printElement = document.body.createElement('DIV', 'doc-content printablediv' ); //document.body.createElement('table', { className: 'printablediv', style: 'width:100%;' });
        }
        //$.elPrintDiv.innerHTML = $.printdiv.innerHTML;
        with ($.printElement) {
          //console.debug($.printSource, $.printHeader);
          innerText = '';
          if (!$.printHeader) return innerHTML = $.printSource.innerHTML;
          with (createElement('TABLE', 'border', {  style: 'width:100%;' })) {
            //with (createElement('thead').createElement('TR').createElement('th').createElement('DIV', { style: 'display:table;table-layout:fixed;width:100%;' }).createElement('DIV', { style: 'display:table-row;' })) {
            //    createElement('DIV', { style: 'display:table-cell;width:35mm;padding:10px;border-bottom:solid 1px #ccc;vertical-align:middle;' }).createElement('img', { src: Files && Files[1] ? Files[1].src : '' });
            //    with (createElement('DIV', { style: 'display:table-cell;padding:10px;border-bottom:solid 1px #ccc;vertical-align:top;' })) {
            //        if ($.printheader) {
            //            createElement('DIV', { className: 'kop0', innerText: $.printheader.kop0 || '' });
            //            createElement('DIV', { className: 'kop1', innerText: $.printheader.kop1 || '' });
            //            createElement('DIV', { className: 'kop2', innerText: $.printdiv ? $.printdiv.Title : $.printheader.kop2 || '' });
            //        }
            //    }
            //}
            createElement('thead').createElement('TR').createElement('TH', '', $.printHeader.innerHTML );
            createElement('tbody').createElement('TR').createElement('TD', 'doc', $.printSource.innerHTML );
            with (createElement('tfoot').createElement('TR').createElement('TH').createElement('DIV')) {
              createElement('SPAN', '', 'Printed: ' + new Date().toLocaleString() + ' by ' + $.accountName, { style: 'float:right;'});
            }
          }
        }
      })
      .on('blur', event => {
        $.his.focussed = false;
        document.body.setAttribute('blur', '');
        clearTimeout($.his.stateTimeout);
        $.his.stateTimeout = setTimeout(() => $().state('inactive'), 500);
      })
      .on('click', event => {
        // return; // DEBUG:
        checkPath(event);
        $.his.clickEvent = event;
        const sectionElement = event.path.find(elem => elem.tagName === 'SECTION' && elem.id);
        if (sectionElement) {
          document.body.setAttribute('section', sectionElement.id);
        }
      }, true)
      .on('click', event => {
        // return; // DEBUG:
        $.clickEvent = event;
        // return;
        $.his.clickElement = event.target;
        $.his.clickPath = event.path = event.path || function(el) {
          var path = [];
          while (el) {
            path.push(el);
            el = el.parentElement;
          };
          return path;
        } (event.target);
        // //console.debug($('colpanel'));
        if (document.getElementById('colpanel') && !$.his.clickPath.includes($('colpanel'))) {
          // $.request('?prompt=');
        }
        // const itemElement = event.path.find(itemElement => itemElement.item);
        // if (itemElement) {
        // 	$.clipboard.setItem(itemElement.item);
        // }
        let elem = event.target;
        // //console.debug('CLICK', el, el.$infoID);
        //if (this.printable) $.printdiv = this;
        // //console.debug(this);
        //// //console.debug('CLICK', this.get);
        // if (el.hasAttribute('accept') && el.tagName !== 'INPUT') {
        // 	//console.debug('ACCEPT', itemElement.item);
        // 	if (itemElement.files) {
        // 		itemElement.files.openDialog();
        // 		return;
        // 	}
        // }
        // DEBUG: MAX
        // if (elem.hasAttribute('open')) {
        //   $(elem).select();
        // }
        // if (elem = event.path.find(elem => elem instanceof Element && elem.hasAttribute('open'))) {
        // 	$.el.select.call(elem);
        // }
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
          for (let elem of event.path.filter(elem => elem instanceof Element)) {
            if (elem.elem && elem.elem.has('ofile') && elem.elem.get('ofile').src.match(/\.(jpg|png|bmp|jpeg|gif|bin|mp4|webm|mov|3ds)/i)) {
              return $(document.body).slider(elem)
            }
            // if (elem.hasAttribute('src')) {
            //   return document.location.href = '#?src='+elem.getAttribute('src');
            // }
            if (elem.hasAttribute('href')) {
              if (elem.getAttribute('href').match(/^\/\//)) {
                console.debug('CLICK MAIN href REL');

                event.preventDefault();
                $().execQuery('l', Web.urlToId(elem.getAttribute('href')));
                // $('list').load(elem.getAttribute('href'))
                return;
              }
              if (window.colpage) {
                if (elem.getAttribute('href')[0] === '#' && elem.getAttribute('href')[1] === '/') {
                  return $().exec(elem.getAttribute('href').substr(1));
                } else if (elem.getAttribute('href').includes('.pdf') && !elem.download) {
                  event.preventDefault();
                  return new $.Frame(elem.href);
                }
                // } else if (elem.getAttribute('href')[0] !== '#' && elem.href.includes(document.location.origin)) {
                //   event.preventDefault();
                //   window.history.pushState('page', 'test1', elem.href);
                //   $(window).emit('popstate');
                //   // $('list').load(elem.getAttribute('href')+'.md');
                //
                //   // console.debug();
                //   return;// event.preventDefault();
              }
            }
          }
        }
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        //if (window.colpanel && ref.clickPath.indexOf(colpanel) == -1) $.prompt.open();
        //alert(ref.clickPath);
        // //console.debug(1, event.target);
        for (var i = 0, el; el = $.his.clickPath[i]; i++) {
          if (el.itemID) {
            console.debug('itemID');
            var item = $.getItem(el.itemID);
            if (item) document.location.href = '#' + item.schema + '/' + item.id + '?select=*';
            return false
            //$.show({ id: this.itemID });
          }
          else if (el.set) {
            $.url.set(el.set);
            return false
            //$.show({ id: this.itemID });
          }
          else if (el.$infoID) {
            //console.debug('infoID');
            event.stopPropagation();
            $.getItem(el.$infoID, item => {
              item.showinfo();
              el.remove();
            });
            return;
          }
          //if (this.pnl)
          //if (this.par) {
          //	$.show(this.par);
          //	event.stopPropagation();
          //	event.preventDefault();
          //	return false;
          //}
          //else if (this.colName) $.setfocus(this);
          else if (el.colName) {
            document.body.setAttribute('ca', el.colName);
            $.colActive = el;
            $.elColActive = el;
            $.printSource = el;
          }
          else if (el.elClose) el.elClose.parentElement.removeChild(el.elClose);
          // else if (el.get) $().exec(el.get);//$.url.set(typeof this.get == 'function' ? this.get() : this.get);
          if ($.targetItem = el.item) {
            break;
          }
        }
        // //console.debug('ONCLICK MAIN', event.target);
        // //if ($.targetItem && $.targetItem.focus) $.targetItem.focus(event);
        //
        // // if ($.prompt.panelName) {
        // // 	$.prompt('');
        // // }
        //
        //
        //
        //  // MKA is denk ik vervallen omdat er een algemeen window on click event is die het path bepaald
        // return;
        //
        // ////console.debug('OM CLICK', event);
        //
        // //if ($.mainPopup) {
        // //	$.mainPopup.close();
        // //	$.subPopup.close();
        // //}
        // //$.clickElement = event.target;
        // //$.clickPath = event.path;
        // //for (var i = 0, el; el = $.clickPath[i]; i++) if ($.targetItem = el.item) break;
        // //if ($.targetItem && $.targetItem.focus) $.targetItem.focus(event);
        // return;
        //
        //
        // var el = $.clickElement = event.target;
        // while (el && !el.item) el = el.parentElement;
        // if (!el) return;
        // $.targetItem = el.item;
        // //console.debug('itemClicked', $.clickElement, $.targetItem.id, $.targetItem.Title, $.targetItem, event);
        //
        // if (msg.newItem) msg.write();
        //
        // //$.play('/wav/Windows Notify Email.wav').then(function() { //console.debug('PLAYING'); }, function() { //console.debug('NOT PLAYING'); });
        //
        //
        //
        //
        //
        // $.activeElement = event.path ? event.path.shift() : event.target;
        // if ($.activeElement.item && $.activeElement.item.focus) $.activeElement.item.focus(event);//aimClient.selection.cancel();
        // //Element.Pulldown.el.innerText = '';
      })
      .on('copy', event => $.clipboard.copy(event))
      .on('cut', event => $.clipboard.copy(event))
      .on('dragend', event => {
        $().status('source');
        $().status('target');
        const dragItems = $.clipboard.dragItems;
        //console.debug('dragend', event.dataTransfer.dropEffect, dragItems, event, event.view === window);
        switch (event.dataTransfer.dropEffect) {
          // case 'move': {
          // 	if (dragItems) {
          // 		if (event.view === window) return;
          // 		//console.debug('dragend', event);
          // 		dragItems.forEach(item => item.remove());
          // 	}
          // 	return;
          // }
          // // if drop outside window then open window
          case 'none': {
            var outside = event.screenX > window.screenX + window.outerWidth || event.screenX < window.screenX || event.screenY > window.screenY + window.outerHeight || event.screenY < window.screenY;
            if (outside) {
              return dragItems.forEach(item => item.popout(event.screenX,event.screenY));
            }
          }
          // case 'move' : {
          // 	dragItems.forEach(item => item.parent.removeChild(item));
          // }
        }
      })
      .on('dragenter', event => {
        if (
          event.dataTransfer.types.includes('Aim/items') ||
          event.dataTransfer.types.includes('Files')
        ) {
          const targetItemElement = event.path.filter(elem => elem.item).shift();
          if (targetItemElement instanceof Element) {
            event.stopPropagation();
            setTimeout(() => ($.his.targetItemElement = targetItemElement).setAttribute('target', ''));
          }
        }
      })
      .on('dragleave', event => {
        if ($.his.targetItemElement) {
          $.his.targetItemElement.removeAttribute('target');
        }
      })
      .on('dragover', event => {
        if ($.his.targetItemElement) {
          $().status('target', $.his.targetType = eventKeyState(event));
          event.dataTransfer.dropEffect = event.ctrlKey ? (event.shiftKey ? 'link' : 'copy') : 'move';
          // event.dataTransfer.dropEffect = event.ctrlKey ? (event.shiftKey ? 'link' : 'copy') : 'move';
        }
        event.preventDefault();
      })
      .on('dragstart', event => {
        // letop ook files selecteren in AIm.Selection gebaseerd op ofile in path
        // console.debug(event.type);
        $().status('source', $.his.sourceType = eventKeyState($.his.keyEvent));
        var elem = event.path.find(elem => elem.ofile);
        if (elem) {
          var dragItems = $.clipboard.items.includes(elem.ofile) ? $.clipboard.items : [elem];
          event.dataTransfer.setData('Aim/items', JSON.stringify({files: dragItems.map(elem => elem.ofile)}));
        } else {
          var item = event.path.filter(elem => elem.item).map(elem => elem.item).shift();
          var dragItems = $.clipboard.items.includes(item) ? $.clipboard.items : [item];
          event.dataTransfer.setData('Aim/items', JSON.stringify({
            value: dragItems.map(Item.toData),
            sid: $().ws().socket_id,
          }));
          event.dataTransfer.setData('text', dragItems.map(Item.toText).join('\n'));
          event.dataTransfer.setData('text/html', dragItems.map(Item.toHtml).join(''));
        }
        $.clipboard.dragItems = dragItems;
        //console.debug(dragItems);
      })
      // .on('drop', event => $.his.targetItemElement ? handleData($.his.targetItemElement.item, event) : null)
      .on('drop', event => {
        event.preventDefault();
        handleData($.his.targetItemElement.item, event);
      })
      .on('focus', event => {
        // console.debug('FOCUS');
        if (!$.his.focussed) {
          $.his.focussed = true;
          document.body.removeAttribute('blur');
          $().state('available');
          // $.send();
          // setTimeout(function() { $.auth.setstate('focus'); }, 100);
          // if ($.user.sub) $.auth.check_state();
          ////if (!aimClient.user) return;
          //var data = { activestate: 'focus', accountID: $.client.account.id, userID: $.auth.sub, to: [$.key] };
          //ItemSetAttribute(data.userID, 'activestate', data.activestate);
          //ItemSetAttribute(data.accountID, 'activestate', data.activestate);
          //ws.send(data);
          ////// //console.debug('onfocus start');
          ////msg.check(true); HOEFT NIET GEBEURD VIA EVENT RT SERVER
          //new $.HttpRequest({
          //    api: 'window/focus/' + aliconnect.deviceUID,
          //    //post: { exec: 'onfocus', deviceUID: aimClient.user ? aliconnect.deviceUID : '', },
          //    onload: function() {
          //        //// //console.debug('onfocus done', this.post, this.responseText);
          //        //if (aimClient.user && $.auth.sub && this.data.UserID != $.auth.sub) $.show({ wv: 1, apnl: 'login' });//document.location.href = '?wv=1&apnl=login';
          //    }
          //});
        }
      })
      .on('keyup', onkey, true)
      .on('keyup', checkkey)
      .on('keydown', onkey, true)
      .on('keydown', checkkey)
      .on('keydown', event => {
        switch (event.keyPressed) {
          case 'F1': {
            Prompt.open('help');
            event.preventDefault();
            return;
          }
          case 'Escape': {
            if (window.activeElement) return;
            if ($.clipboard.copyItems && $.clipboard.copyItems.length) {
              return $.clipboard.copy();
            }
            // if ($('view').show() && $('view').show().elem && $('view').show().elem.innerText) {
            //   return $('view').show().elem.innerText = '';
            // }
            if (document.activeElement && document.activeElement.cancel && document.activeElement.cancel()) {
              return;
            }
            if ($.his.iframeElement) {
              $.his.iframeElement.remove();
            }
            if ($.imageSlider && $.imageSlider.el) {
              $.imageSlider.close();
            }
            if (new URLSearchParams(document.location.search).has('prompt')) {
              Prompt.open('');
            }
            if (document.activeElement === $.elMsgTextarea) {
              contentEditableEnd($.elMsgTextarea.blur());
            }
            if ($().tree().editing) {
              $().tree().editcancel(Treeview.elINP.Value = Treeview.elINP.initValue)
            }
            if ($('colpage').elFrame) {
              $('colpage').elFrame.close(event);
            }
            // $().tree().cancel();
            // $.tree().edit.cancel() ||
            // $.popup().cancel() ||
            // $.edit().cancel() ||
          }
          // EscapeEdit: keyEscape,
          // F2(event) {
          // 	if ($.path.includes($('self'))) {
          // 		if (self.focusElement) {
          // 			return self.focusElement.edit();
          // 		}
          // 	}
          // 	if ($.pageItem) {
          // 		return $.pageItem.PageEditElement();
          // 	}
          // },
          // pv: {
          // 	EscEdit: function(event) {
          // 		if ($.pageItem && $.pageItem.editing) {
          // 			event.preventDefault();
          // 			$.pageItem.editclose();
          // 		}
          // 	},
          // 	UpShiftAlt: function(event) {
          // 		var field = document.activeElement.field;
          // 		if (field.aid) {
          // 			var el = field.el;
          // 			if (el.previousElementSibling) {
          // 				el.parentElement.insertBefore(el, el.previousElementSibling);
          // 				field.elINP.focus();
          // 			}
          // 		}
          // 		event.preventDefault();
          // 	},
          // 	Up: function(event) {
          // 		if (document.activeElement.tagName != 'DIV' && document.activeElement.field && document.activeElement.field.el.previousElementSibling) {
          // 			document.activeElement.field.el.previousElementSibling.field.elINP.focus();
          // 			event.preventDefault();
          // 		}
          // 		event.preventDefault();
          // 	},
          // 	Down: function(event) {
          // 		if (document.activeElement.tagName != 'DIV' && document.activeElement.field && document.activeElement.field.el.nextElementSibling) {
          // 			document.activeElement.field.el.nextElementSibling.field.elINP.focus();
          // 			event.preventDefault();
          // 		}
          // 	},
          // 	DownShiftAlt: function(event) {
          // 		var field = document.activeElement.field;
          // 		if (field.aid) {
          // 			var el = field.el;
          // 			if (el.nextElementSibling) {
          // 				el.parentElement.insertBefore(el, el.nextElementSibling.nextElementSibling);
          // 				field.elINP.focus();
          // 			}
          // 		}
          // 	},
          // },
          // //tv: {		},
          // //lv: {		},
          // //CtrlKeyP: function() {
          // //	//if (!) document.body.createElement('DIV', { className: 'divprint' , innerHTML:colpage.innerHTML});
          // //	//event.preventDefault();
          //
          // //},
          //
          //
          // // ShiftShift wordt gegenereerd door scanner voor barcode. Bij scannen code tree select resetten
          // ShiftShift: function() {
          // 	Treeview.selstart = null;
          // },
          // CtrlKeySEdit: function(event) {
          // 	if ($.pageItem && $.pageItem.editing) {
          // 		event.preventDefault();
          // 		//if (document.activeElement && document.activeElement.onblur) document.activeElement.onblur();
          // 		//if (document.activeElement && document.activeElement.onchange) document.activeElement.onchange();
          // 		//$.pageItem.btnSave.focus();
          // 		$.pageItem.btnSave.click();
          // 	}
          // },
          // CtrlKeyZ: function(event) {
          // 	$.undo();
          // },
          // //KeyCCtrl: function(event) {
          // //    return $.clipboard.copy();
          // //},
        }
      })
      .on('keydown', event => {
        // //console.debug(event, window.event);
        $().state('available');
        // 	if (key == 'Enter') {
        // 		if ($.setting.keybuf.length == 10 && !isNaN($.setting.keybuf)) return auth.keyloggin($.setting.keybuf);
        // 		$.setting.keybuf = $.setting.keybuf.split('CapsLockCapsLock');
        // 		if ($.setting.keybuf[1]) {
        // 			bc = $.setting.keybuf.pop();
        // 			//console.debug(bc);
        // 			private.search.Value = bc;
        // 			$.formfind.onsubmit();
        // 		};
        // 		$.setting.keybuf = '';
        // 	} else {
        // 		$.setting.keybuf += event.key;
        // 	}
        // onkey(event);
        $.his.keyEvent = event;
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
          event.preventDefault();
          document.execCommand('copy');
        }
        // //console.debug('keydown', event, event.keyPressed);
        event.previousKey = $.his.previousKey;
        $.his.previousKey = event.keyPressed;
      }, true)
      .on('message', event => {
        // if (event && event.body && event.body.code) {
        // 	$.auth.get_access_token(event.body);
        // 	// return $.auth.login({
        // 	// 	code: event.body.code,
        // 	// 	client_id: $.config.$.client_id,
        // 	// });
        //
        // 	// $.his.cookie = {
        // 	// 	id_token: event.body.id_token,
        // 	// }
        // 	// //console.error('document.cookie', document.cookie);
        // 	//
        // 	//
        // 	// //console.debug('id_token', event.body.id_token);
        // 	// $.extendLocal({auth:{id_token: event.body.id_token}});
        // 	// document.cookie = 'id_token=' + event.body.id_token;
        // 	// $.auth.id_token = event.body.id_token;
        // 	// new $.WebsocketRequest({
        // 	// 	to: {
        // 	// 		sid: event.from_id,
        // 	// 	},
        // 	// 	message_id: event.id,
        // 	// 	body: {
        // 	// 		state: 'ack',
        // 	// 	},
        // 	// }, event => {
        // 	// 	//console.debug('RESPONSE ACK ACK', event.body);
        // 	// });
        // 	//
        // }
        // var data = event.body;
        // if (!data) return;
        // //console.debug('ON MESSAGE WEB DATA', event);
        const data = event;
        if (event.body && event.body.Master && event.body.Master.LinkID) {
          const parent = $.ref[Number(event.body.Master.LinkID)];
          const item = $.ref[Number(data.ID)];
          if (parent && item) {
            $.noPost(() => {
              item.movetoidx(parent, Number(event.body.Master.Data));
            })
          }
        }
        // if (data.changeData) {
        // 	return changeData(data.changeData);
        // }
        if (data.state && data.description && document.getElementById('aimStatusMsg'))
        document.getElementById('aimStatusMsg').innerText = data.description;
        switch (data.state) {
          case 'datatransfered':
          for (var name in data.values) {
            for (var c = document.getElementsByName(name), el, i = 0; el = c[i]; i++) el.Value = data.values[name];
          }
          break;
        }
        if (data.systemalert) {
          // //console.debug('ONMESSAGE ALERT', data);
          if (!document.getElementById('alertpanel')) return;
          if (!$.elAlertrow) {
            with (document.getElementById('alertpanel')) {
              $.elAlertsum = document.getElementById('alertsum') || createElement('DIV', { className: 'col', id: 'alertsum' });
              $.elAlertrow = document.getElementById('alertrow') || createElement('DIV', { className: 'col aco', id: 'alertrow' });
            }
          }
          if (!$.alerts[data.systemalert.id]) $.alerts[data.systemalert.id] = $.elAlertrow.createElement('DIV', {
            className: data.systemalert.categorie, innerText: [data.systemalert.Title, data.systemalert.created].join(' '),
            onchange: function(event) {
              // //console.debug('CHANGE', this);
              if ('condition' in this) this.setAttribute('condition', this.condition);
              if ('ack' in this) this.setAttribute('ack', this.ack);
              if (this.ack && !this.condition) { $.alerts[this.id] = null; $.elAlertrow.removeChild(this); }
            },
            onclick: function() {
              ws.send({ systemalert: { id: this.id, ack: this.ack = 1 } });
              this.onchange();
            }
          });
          Object.assign($.alerts[data.systemalert.id], data.systemalert).onchange();
        }
        return;
        if (data.itemID && data.attributeName && ('value' in data)) {
          c = document.getElementsByName([data.itemID, data.attributeName].join('.'));
          for (var i = 0, event; event = c[i]; i++) event.setAttribute('value', data.Value);
          var c = document.getElementsByClassName(data.itemID);
          for (var i = 0, event; event = c[i]; i++) event.setAttribute(data.attributeName, data.Value);
          if (window.meshitems && window.meshapi.item[data.itemID] && data.attributeName == 'MeshColor') {
            window.meshapi.item[data.itemID].src.basiccolor = data.Value;
            window.meshapi.item[data.itemID].colorSet(data.Value);
          }
          if (window.meshitems && window.meshapi.item[data.itemID] && data.attributeName == 'err') {
            for (var i = 0, c = $.his.err.children, elErrRow; elErrRow = c[i]; i++) if (elErrRow.meshitem.src.itemID == data.itemID) break;
            if (elErrRow) {
              elErrRow.elEnd.innerText = (elErrRow.end = new Date()).toISOString().substr(11, 8);
              elErrRow.refresh();
            }
            else with ($.his.err.insertBefore(elErrRow = $.his.err.createElement('DIV', { className: 'row err start', itemID: data.itemID, meshitem: window.meshapi.item[data.itemID], start: new Date() }), $.his.err.firstChild)) {
              createElement('SPAN', { className: 'icon' });
              createElement('SPAN', { className: '', innerText: window.meshapi.item[data.itemID].src.name });
              createElement('SPAN', { className: '', innerText: data.Value });
              createElement('SPAN', { className: '', innerText: elErrRow.start.toISOString().substr(11, 8) });
              elErrRow.elAccept = createElement('SPAN', { className: '', innerText: '' });
              elErrRow.elEnd = createElement('SPAN', { className: '', innerText: '' });
              elErrRow.refresh = function() {
                if (this.end && this.accept) {
                  this.meshitem.colorSet();
                  $.his.err.removeChild(this);
                }
                $.his.errCont.style = $.his.err.children.length ? '' : 'display:none;';
                window.onWindowResize();
              };
              elErrRow.refresh();
            }
          }
        }
        return;
        //console.debug('message', event.body);
        if (event.body) $.data.update(event.body);
        // var data = event.body;
        if (data.Value)
        ////console.debug('ONMESSAGE OM', this, event);
        ////console.debug('onreceive', this.data);
        //if (data.Notification) $.Notification.create(data.Notification);
        if (data.state && data.fraim.app === 'aliconnector' && data.fraim.ip == $.client.ip) {
          ////console.debug('CONNECT');
          document.body.setAttribute('aliconnector', $.aliconnector.state = data.state);
          // if (data.state=='disconnected') {
          // 	$.hasConnector=false;
          // 	//document.body.style.color='red';
          // }
          if (data.state == 'connected') {
            //$.hasConnector=true;
            //document.body.style.color='green';
            if (!data.ack) ws.send({ to: { client: data.fraim.client }, state: 'connected', ack: 1 });
            if (data.fraim.device != $.client.device.id) {
              //alert('SYNC ALICONNECT DEVICE_ID');
              ws.send({ to: { client: data.fraim.client }, device: $.client.device });
              ////console.debug('CONNECT ALICONNECTOR', senddata);
            }
          }
        }
        //{
        //	//console.debug('Notification', data.Notification);
        //	$.Notification.Notify(data.Notification.Title, data.Notification.options);
        //	//{
        //	//	body: "Bericht geplaatst door " + data.get.from,
        //	//	url: "https://aliconnect.nl/tms/app/om/#id=" + data.get.id,
        //	//	//url: "https://aliconnect.nl/moba/app?lid=;2101;;FinishDateTime + IS + NULL&q=*&n=EWR&id=2776611&pv=1",
        //	//	//icon: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //	//	//image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //	//	data: data,
        //	//});
        //}
        //if (data.Value) data.Value.forEach(function(item) {
        //});
        ////console.debug('OnReceive', data);
        ////console.debug(data);
        //if (data.supportmessage) $.Notification.create(data.supportmessage);
        if (data.reload) document.location.href = document.location.href;
        if (data.app === 'aliconnector') {
          if (!msg) return;
          $.aliconnector = msg;
          //console.debug('aliconnector', msg);
          if (msg.state == 'connected') {
            ws.send({ to: { deviceUID: $.deviceUID }, msg: { userName: $.accountName || $.client.user.name, userUID: $.userUID } });
            //Notify("EWR 4292 Updated", {
            //    body: "TL20 on packing lanes before CP12",
            //    url: "https://aliconnect.nl/moba/app?lid=;2101;;FinishDateTime + IS + NULL&q=*&n=EWR&id=2776611&pv=1",
            //    icon: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
            //    //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
            //});
            //Notify('fdsgsdfgsdfgs');
          }
          if (msg.state) {
            //ws.send({ broadcast: true, msg: { id: $.Account.sub, uid: $.userUID, state: msg.state } });
            //document.body.setAttribute('aliconnector', msg.state);
          }
          //{
          //    document.body.setAttribute('aliconnector', 'online');
          //}
          //return;
          //if ($.aliconnector.state == 'init') ws.send({ to: { deviceUID: $.deviceUID }, msg: { userName: $.accountName } });
          //clearTimeout($.toaliconnector);
          //$.toaliconnector = setTimeout(function() { document.body.setAttribute('aliconnector', $.aliconnector.state = 'offline'); }, 40000);
          ////console.debug('ONLINE SERVICE', data);
          //document.body.setAttribute('aliconnector', 'online');
        }
        //if (msg.post && msg.post.item && $.ref[msg.post.item.id]) {
        //    var item = $.ref[msg.post.item.id];
        //    //console.debug(document.location.href);
        //    //Notify(item.Title, {
        //    //    body: "Modified by user",
        //    //    icon: item.files && item.files[0] ? "https://aliconnect.nl" + item.files[0].src : null, //"https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //    //    //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
        //    //    data: { id: item.id, url: document.location.href },
        //    //});
        //}
        if (data.editfiledone) {
          var c = document.getElementsByName(data.editfiledone);
          for (var i = 0, event; event = c[i]; i++) event.setAttribute('state', '');
        }
        if (data.editfile) {
          data.editfile = data.editfile.split('/').pop();
          var c = document.getElementsByName(data.editfile);
          for (var i = 0, event; event = c[i]; i++) event.setAttribute('state', 'editing');
        }
        //if ($.ref[data.id]) ItemSetAttribute(data.id, data.name, data.Value);
        //if (msg.items) itemset(msg.items);//for (var id in msg.items) if ($.ref[id]) { msg.items[id].id = id; itemset(msg.items[id]); }
        //if (data.activestate) {
        //    ItemSetAttribute(data.userID, 'activestate', data.activestate);
        //    ItemSetAttribute(data.accountID, 'activestate', data.activestate);
        //    //if ($.ref[data.userID]) {
        //    //    $.ref[data.userID].guistate = data.guistate;
        //    //    var c = document.getElementsByName('state' + data.accountID);
        //    //}
        //    //if ($.ref[data.accountID]) $.ref[data.accountID].guistate = data.guistate;
        //    //for (var i = 0, event; event = c[i]; i++) event.setAttribute('state', 'online');
        //    //if ($.ref[data.accountID]) $.ref[data.accountID].onlinestate = 'online';
        //}
        //if (data.a == 'blur') {
        //    var c = document.getElementsByName('state' + data.accountID);
        //    for (var i = 0, event; event = c[i]; i++) event.setAttribute('state', 'offline');
        //    if ($.ref[data.accountID]) $.ref[data.accountID].onlinestate = 'offline';
        //}
        if (data.alert) alert(data.alert);
        //if (data.deviceUID == $.deviceUID) {
        return;
        //}
        if (data.a == 'submit' && $.getItem(data.id) && $.getItem(data.id).modifiedDT != data.modifiedDT) {
          ////console.debug('SUBMIT', data.id);
          //if (data.hostID == $.config.$.auth.accessToken.aud) {
          ////console.debug('SUBMIT', data, $.config.$.auth.accessToken.aud, get.id, data.id);
          if (get.id == data.id) {
            $.getItem(data.id).reload();
          } else if ($.getItem(data.id)) {
            $.getItem(data.id).loaded = false;
          }
          msg.check();
          //}
        }
      })
      .on('mousemove', event => {
        $.his.clickPath = event.path;
        $().state('available');
        // if (event.target.item) // //console.debug(event.target.tagName, event.target.item);
        // if (!$.his.clickPath.includes($)) $.his.clickPath.push($);
      })
      .on('paste', event => handleData($.clipboard.itemFocussed, event))
      .on('resize', event => {
        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        // if (document.body.clientWidth < 400 && document.body.clientWidth < document.body.clientHeight) document.body.setAttribute('device', device = 'phone');
        // else if (document.body.clientHeight < 400 && document.body.clientWidth > document.body.clientHeight) document.body.setAttribute('device', device = 'phonewide');
        // else if (document.body.clientWidth < 800 && document.body.clientWidth < document.body.clientHeight) document.body.setAttribute('device', device = 'tablet');
        // else if (document.body.clientHeight < 800 && document.body.clientWidth > document.body.clientHeight) document.body.setAttribute('device', device = 'tabletwide');
        // else document.body.setAttribute('device', device = 'pc');
      })
      .on('scroll', event => {

        if ($('doc') && $('doc').elem && $('doc').elem.lastChild) {
          const lastdoc = $('doc').elem.lastChild;
          if (lastdoc && lastdoc.doc) {
            const docelem = lastdoc.doc.docElem;
            // console.debug(docelem, docelem.findAll);
            if (!$.toScroll) {
              // const div = Math.abs(lastScrollTop - docelem.el.scrollTop);
              // clearTimeout(to);
              $.toScroll = setTimeout(() => {
                // console.debug('re');
                $.toScroll = null;
                // if (div > 50) {
                lastScrollTop = document.body.scrollTop;
                let elem = docelem.findAll.find(elem => elem.getBoundingClientRect().top < docelem.elemTop) || docelem.topItem;
                // console.debug(docelem.findAll);
                // let elem = all.find(elem => elem.offsetParent );
                // console.debug(elem.innerText, elemTop, elem.getBoundingClientRect().top, elem.getBoundingClientRect().height, all.indexOf(elem));
                // return;
                // elem = all[all.indexOf(elem)-1];
                docelem.allmenu.forEach(a => a.attr('open', '0').attr('select', null));
                const path = [];
                for (var p = elem.a.el; p.tagName === 'A' && p.parentElement && p.parentElement.parentElement; p=p.parentElement.parentElement.parentElement.firstChild) {
                  p.setAttribute('select', '');
                  p.setAttribute('open', '1');
                  path.push(p);
                }
                $(elem.a.el).scrollIntoView();
                if ($('navDoc')) {
                  $('navDoc').clear().append(...path.reverse().map(elem => ['/', $('a').text(elem.innerText)]))
                }
                // elem.li.select();
                // $()
                // let elem = all.forEach(elem => //console.debug(elem.getBoundingClientRect().top));
                // //console.debug(elem, elem.li);
                // }
              }, 500);
            }
          }
        }
        // console.error(docelem, docelem.doc);



        if ($.mainPopup) {
          $.mainPopup.close();
          $.subPopup.close();
        }
        var st = window.pageYOffset || document.documentElement.scrollTop;
        var scrolldir = st > 50 && st > $.lastScrollTop ? 'down' : 'up';
        if ($.his.body) $.his.body.setAttribute('scroll', scrolldir);
        $.lastScrollTop = st;
        if (Element && Element.iv) {
          if (window.toscroll) clearTimeout(window.toscroll);
          toscroll = setTimeout(function() {
            var event = Element.iv, ot = 0;
            while (event = event.parentElement) ot += event.offsetTop;
            ////console.debug(ot);
            for (var i = 0, elHFocus, elNext; elNext = hapi.item[i]; i++) {
              if (elNext.offsetTop > st - ot) break;
              elHFocus = elNext;
            }
            elHFocus = elHFocus || elNext;
            var c = Element.iv.getElementsByTagName('LI');
            ////console.debug(c);
            //var elFocus = null, elPrev = null;
            for (var i = 0, event; event = c[i]; i++) {
              //if (event.h.offsetTop - 25 >= st) elFocus = elFocus || elPrev || event;
              //elPrev = event;
              if (event.hasAttribute('open')) event.setAttribute('open', 0);
              event.removeAttribute('focus');
            }
            ////console.debug(elHFocus.innerText, elHFocus.elemTreeLi);
            Element.iv.style.paddingTop = Math.max(0, st - ot + 50) + 'px';
            if (elHFocus) {
              elPar = elFocus = elHFocus.elemTreeLi;
              ////console.debug('FOCUS', elHFocus.innerText, elHFocus.elemTreeLi, elPar.innerText);
              //var otf = elFocus.offsetTop;
              //elFocus = elFocus || elPrev || event;
              elFocus.setAttribute('focus', 1);
              while (elPar.h) {
                ////console.debug('FOCUS', elPar.innerText, elPar.offsetTop, elPar.tagName);
                //otf += elPar.offsetTop + 30;
                if (elPar.hasAttribute('open')) elPar.setAttribute('open', 1);
                elPar = elPar.parentElement.previousElementSibling;
              }
              ////console.debug('go');
              //while ((elFocus = elFocus.parentElement) && elFocus != Element.iv.firstChild) {
              //    //console.debug(elFocus.offsetTop);
              //    otf += elFocus.offsetTop;
              //}
              //console.debug('TOTAL', Element.iv.firstChild.getBoundingClientRect().top, elFocus.getBoundingClientRect().top);
              ////console.debug(elPar.innerText, elPar.offsetTop);
              //otf += elPar.offsetTop;
              //elFocus.scrollIntoView({ block: "nearest", inline: "nearest" });
              //var br = Element.iv.getBoundingClientRect();
              //var bre = elFocus.getBoundingClientRect();
              if (scrolldir == 'down') Element.iv.style.paddingTop = (st - ot - elFocus.getBoundingClientRect().top + Element.iv.firstChild.getBoundingClientRect().top + 50) + 'px';
              //else Element.iv.style.paddingTop = (st - ot + 50) + 'px';
              ////console.debug(st, bre.top, elHFocus.offsetTop);
            }
          }, 300);
        }
        // $.player.onscroll();
        ////console.debug(document.documentElement.clientHeight, Element.iv.clientHeight, Element.iv.firstChild.clientHeight, document.documentElement.clientHeight);
        //Element.iv.style.paddingTop = Math.min(Element.iv.clientHeight - Element.iv.firstChild.clientHeight - 300, Math.max(0, document.documentElement.scrollTop - 300)) + 'px';
      })
      .on('unload', event => {
        // aimClient.api.setactivestate('offline');
      });
    },
  }, Aim);
  Prompt.set({
    account: elem => elem.parent(elem.parentElement.clear()).append(
      $('nav').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span'),
        // $('button').class('icn-next').on('click', event => Prompt.open('test2')),
      ),
      $('div').append(
        $('h1').text('Gebruiker'),
        $('button').class('icn-login').text('Aanmelden').on('click', Aim.login),
        $('button').class('icn-logout').text('Afmelden').on('click', Aim.logout),
        // $('div').text('test1'),
      ),
    ),
    tasks: elem => elem.parent(elem.parentElement.clear()).append(
      $('nav').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span'),
        // $('button').class('icn-next').on('click', event => Prompt.open('test2')),
      ),
      $('div').append(
        $('h1').text('Taken'),
        // $('div').text('test1'),
      ),
    ),
    config: elem => elem.parent(elem.parentElement.clear()).append(
      $('nav').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span'),
        // $('button').class('icn-next').on('click', event => Prompt.open('test2')),
      ),
      $('div').append(
        $('h1').text('Instellingen'),
        // $('div').text('test1'),
      ),
    ),
    help: elem => elem.parent(elem.parentElement.clear()).append(
      $('nav').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span'),
        // $('button').class('icn-next').on('click', event => Prompt.open('test2')),
      ),
      $('div').append(
        $('h1').text('Help'),
        // $('div').text('test1'),
      ),
    ),
    messages: elem => elem.parent(elem.parentElement.clear()).append(
      $('nav').append(
        $('button').class('icn-back').on('click', event => elem.remove()),
        $('span'),
        // $('button').class('icn-next').on('click', event => Prompt.open('test2')),
      ),
      $('div').append(
        $('h1').text('Berichten'),
        // $('div').text('test1'),
      ),
    ),
  });
  let localAttr = localStorage.getItem('attr');
  Aim.localAttr = localAttr = localAttr ? JSON.parse(localAttr) : {};
  const apiorigin = Aim.httpHost === 'localhost' && Aim.storage === 'api' ? 'http://localhost' : Aim.origin;

  function handleEvent(event){
    if (event.target) {
      event.path = event.path || (function(){
        const path = [];
        for (var p = event.target; p.parentElement; p = p.parentElement) {
          path.push(p);
        }
        return path;
      })();
    }
    // console.debug(event);
  }
  function keypress(event) {
    handleEvent(event);
    const {target,type,ctrlKey,altKey,shiftKey,code} = event;
    event.keyName = [
      ctrlKey ? 'Ctrl' : '',
      altKey ? 'Alt' : '',
      shiftKey ? 'Shift' : '',
      code,
    ].join('');
    event.name = type + event.keyName;
  }
  window.addEventListener('keyup', keypress, true);
  window.addEventListener('keydown', keypress, true);
  window.addEventListener("keydown", event => {
    const {name} = event;
    if (name === 'keydownEscape') {
      const elems = Array.from(document.querySelectorAll('.error'));
      if (elems.length) {
        event.preventDefault();
        event.stopPropagation();
        elems.pop().remove();
      }
    }
  });
  window.addEventListener('click', event => {
    handleEvent(event);
    const {target,type,ctrlKey,altKey,shiftKey} = event;
    // console.debug(event);
    event.name = type + [
      ctrlKey ? 'Ctrl' : '',
      altKey ? 'Alt' : '',
      shiftKey ? 'Shift' : '',
    ].join('');
    const href = target.getAttribute('href');
    if (href) {
      if (href.match(/\.mdh/)) {
        event.preventDefault();
        Web.listview.elem.loadPage(href);
      } else if (href.match(/^http/) && Web.goUrl(href)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true);
  window.addEventListener("drop", event => {
    handleEvent(event);
    const {dataTransfer} = event;
    const {types,files} = dataTransfer;
    if (types.includes('application/json')) {
      event.data = JSON.parse(dataTransfer.getData('application/json'));
      const {schemaName,id} = event.data;
      if (schemaName && id) {
        event.item = Item.get({schemaName,id});
      }
    }
    // console.debug(333, event);
  }, true);
  window.addEventListener("unhandledrejection", function(event) {
    // handle error here, for example log
    console.error('unhandledrejection', event)
    const {reason} = event;
    error (reason);
    // console.error("unhandledrejection", reason, event);
  });
  window.addEventListener("DOMContentLoaded", event => Web.contentLoaded(event));
  window.addEventListener('beforeunload', event => openwindows.filter(win => win.window).forEach(win => win.close()));
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    // Stash the event so it can be triggered later.
    // deferredPrompt = event;
    // Update UI notify the user they can install the PWA
    // showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    // console.error(`LETOP 'beforeinstallprompt' event was fired.`);
    // alert('install');
  });
  window.console = window.console || { log: function() { } };
  window.Object = window.Object || {
    assign: function(dest) {
      for (var i = 1, source; source = arguments[i]; i++) for (var name in source) dest[name] = source[name];
      return dest;
    },
    values: function(obj) {
      var arr = [];
      for (var name in obj) arr.push(obj[name]);
      return arr;
    }
  };
  (function(arr) {
    arr.forEach(function(item) {
      if (item.hasOwnProperty('append')) {
        return;
      }
      Object.defineProperty(item, 'append', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function append() {
          const argArr = Array.prototype.slice.call(arguments);
          const docFrag = document.createDocumentFragment();
          argArr.forEach(function(argItem) {
            const isNode = argItem instanceof Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
          });
          this.appendChild(docFrag);
        }
      });
    });
  })([Element.prototype, Document.prototype, DocumentFragment.prototype]);
  let match = document.location.pathname.match(/(.*)(api|docs|omd|om)(?=\/)/);
  if (match) {
    $.basePath = match[0];
  }
  localAttr.set = function(id, selector, context) {
    localAttr[id] = localAttr[id] || {};
    if (context === null) {
      delete localAttr[id][selector];
    } else {
      localAttr[id][selector] = context;
    }
    localStorage.setItem('attr', JSON.stringify(localAttr));
  };
  $(document.documentElement).attr('lang', navigator.language);
  config(Object.fromEntries(Array.from(currentScript.attributes).filter(({name,value}) => name !== 'src').map(({name,value}) => [name.camelCase(),value])));
  config(Object.fromEntries(Array.from(new URLSearchParams(document.location.search))));
  // Aim.config(Object.fromEntries(Array.from(currentScript.attributes).filter(({name,value}) => name !== 'src').map(({name,value}) => [name,value])));
  // Array.from(currentScript.attributes).forEach(attribute => Aim.extend({config: Format.minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
  // (new URLSearchParams(document.location.search)).forEach((value,key)=>Aim.extend({config: Format.minimist([key,value])}));
})();

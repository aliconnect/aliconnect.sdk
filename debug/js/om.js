(function (){
  function url_string(s) {
    return s.replace(/%2F/g, '/');
  }

  function TreeListview() {}
  Object.defineProperties(TreeListview.prototype, {
    construct:{ value: function construct(selector) {
      this.selector = selector;
      const elem = this.elem = this.selector.elem;
      const self = this;
      this.menu = {
        items: {
          previous: {
            class: 'previous',
            text: 'previous',
            hotkey: 'Up',
            key: 'ArrowUp',
            on: {
              click: e => this.setFocusElement(this.getPreviousElement(e), e),
            },
          },
          next: {
            class: 'next',
            text: 'next',
            hotkey: 'Down',
            key: 'ArrowDown',
            on: {
              click: e => this.setFocusElement(this.getNextElement(e), e),
            },
          },
          selectUp: {
            class: 'previous',
            text: 'Select previous',
            hotkey: 'Shift+Up',
            key: 'shift_ArrowUp',
            on: {
              click: e => this.setFocusElement(this.getPreviousElement(e), e),
            },
          },
          selectDown: {
            class: 'next',
            text: 'Select next',
            hotkey: 'Shift+Down',
            key: 'shift_ArrowDown',
            on: {
              click: e => this.setFocusElement(this.getNextElement(e), e),
            },
          },
          moveUp: {
            class: 'moveup',
            text: 'Move up',
            hotkey: 'Ctrl+Up',
            key: 'ctrl_ArrowUp',
            on: {
              click: e => this.moveUp(e),
            },
          },
          moveDown: {
            class: 'movedown',
            text: 'Move down',
            hotkey: 'Ctrl+Down',
            key: 'ctrl_ArrowDown',
            on: {
              click: e => this.moveDown(e),
            },
          },
        }
      };
      elem.addEventListener('click', e => {
        if (e.itemElement) {
          self.setFocusElement(e.itemElement, e);
        }
      }, true);
      $(elem).extend({
        cancel(e) {},
        onkeydown(e) {
          clearTimeout(self.arrowTimeout);
          if (document.activeElement === document.body) {
            const str = e.keybuffer.join('').trim();
            if (str) {
              const listItems = [...elem.getElementsByClassName('item')];
              const elementFind = listItems.find(elem => elem.is.item() && String(elem.is.item().header0) && String(elem.is.item().header0).toLowerCase().includes(str));
              if (elementFind) {
                self.setFocusElement(elementFind, e);
              }
            }
          }
        },
      });
    }},
    getOffsetElement:{ value: function getOffsetElement(offset, e) {
      // console.log('getOffsetElement', e);
      const focusElement = e && e.target && e.target.is && e.target.is.srcEvent ? e.target.is.srcEvent.path.find(el => el.item) : this.focusElement;
      // if (e) this.focusElement = e.path.find(el => el.item);
      const listElements = [...this.elem.getElementsByClassName('item')].filter(el => el.tagName !== 'I');
      for (var index = listElements.indexOf(focusElement) + offset, elem; elem = listElements[index]; index+=offset) {
        if (elem.offsetParent !== null) {
          break;
        }
      };
      return elem;
    }},
    getPreviousElement:{ value: function getPreviousElement(e) {
      return this.getOffsetElement(-1, e);
    }},
    getNextElement:{ value: function getNextElement(e) {
      return this.getOffsetElement(1, e);
    }},
    move:{ value: function move(e, offset) {
      // console.log(e.target.parentElement);
      console.log(e.target.parentElement);
      const itemElem = e.path.find(el => el.item);
      this.setFocusElement(itemElem);
      if (this.focusElement) {
        e.preventDefault();
        e.stopPropagation();
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
          console.log('move done', item, item.elemTreeLi.elem);
          this.setFocusElement(item.elemTreeLi.elem);
        });
        // }).then(item => this.setFocusElement(e.target.parentElement)item.elemTreeLi.elemTreeDiv.scrollIntoView());
      }
    }},
    moveUp:{ value: function moveUp(e) {
      this.move(e, -1);
    }},
    moveDown:{ value: function moveDown(e) {
      this.move(e, 1);
    }},
    setFocusElement:{ value: function setFocusElement(newFocusElement, e) {
      // console.log('setFocusElement', newFocusElement, e);
      const elem = this.elem;
      const list = [...elem.getElementsByClassName('item')].filter(elem => elem.item);
      if (e) {
        e.preventDefault();
      }
      // console.log('FOCUS', newFocusElement, this.focusElement);
      if (newFocusElement && newFocusElement !== this.focusElement) {
        if (e && e.shiftKey) {
          e.stopPropagation();
          elem.multiSelectStartElement = elem.multiSelectStartElement || newFocusElement;
          const startIndex = list.indexOf(elem.multiSelectStartElement);
          const thisIndex = list.indexOf(newFocusElement);
          const [firstIndex,lastIndex] = thisIndex > startIndex ? [startIndex,thisIndex] : [thisIndex,startIndex];
          const all = list.slice(firstIndex,lastIndex+1);
          $.clipboard.setItem(all.map(elem => $(elem).item()), 'checked', '');
        } else {
          if (e && e.ctrlKey) {
            e.stopPropagation();
          } else {
            elem.multiSelectStartElement = newFocusElement;
            // //console.log(newFocusElement);
            if (newFocusElement) {
              $(newFocusElement).emit('focusselect');
              if (newFocusElement.item) {
                $.clipboard.setItem([newFocusElement.item], 'checked', '');
              }
            }
            // const e = window.event;
            // elem.arrowTimeout = setTimeout(() => setSelectElement(this.focusElement), e.type === 'keydown' ? 200 : 0);
          }
        }
        if (this.focusElement && this.focusElement.removeAttribute) {
          this.focusElement.removeAttribute('focus');
        }
        if (newFocusElement instanceof Aim.Elem) {
          console.log('Elem', newFocusElement);
        }
        this.focusElement = newFocusElement;
      }
      if (this.focusElement instanceof Element) {
        $(this.focusElement).attr('focus', '');
        if (this.focusElement && this.focusElement.firstChild && this.focusElement.firstChild.focus) {
          $(this.focusElement.firstChild).scrollIntoView();
          setTimeout(() => this.focusElement.firstChild.focus(), 100);
        }
      }
      return this.focusElement;
    }},
    setSelectElement:{ value: function setSelectElement(elem) {
      console.log('setSelectElement', elem);
      // return;
      if (elem && elem.is.item()) {
        const item = elem.is.item();
        $('view').show(item);
        //console.log(item, item.tag, item.header0);
        return;
        if (elem && elem.is.item() && elem !== this.selectElement) {
          // //console.log('SELECT PAGE', elem.is.item());
          this.selectElement = elem;
          $('view').show(elem.is.item());
          // elem.is.item().PageElement();
        }
        return elem;
      }
      // //console.log(arguments.callee.name, ...arguments);
    }},
    selectFocusElement:{ value: function selectFocusElement(newFocusElement) {
      if (newFocusElement) {
        //console.log('selectFocusElement', newFocusElement);
        const e = window.event;
        this.setFocusElement(newFocusElement, e);
        clearTimeout(this.arrowTimeout);
        this.arrowTimeout = setTimeout(() => this.setSelectElement(this.focusElement), e.type === 'keydown' ? 200 : 0);
        // $.view()
        return;
        //console.log(arguments.callee.name, newFocusElement);
      }
    }},
  });

  Listview = function (selector) {
    selector.class('row aco listview');
    this.construct(...arguments);
    const elem = this.elem;
    const self = this;
    this.viewType = document.body.getAttribute('view');
    $(elem).extend({
      keyup: {
        ArrowUp: e => this.selectFocusElement(),
        ArrowDown: e => this.selectFocusElement(),
      },
      keydown: {
        // shift_ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),
        // ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),
        // ArrowDown: e => this.setFocusElement(this.getNextElement(), e),
        // shift_ArrowDown: e => this.setFocusElement(this.getNextElement(), e),
        shift_alt_ArrowDown: e => this.moveDown(e),
        shift_alt_ArrowUp: e => this.moveUp(e),
        ctrl_ArrowDown: e => this.moveDown(e),
        ctrl_ArrowUp: e => this.moveUp(e),
        ArrowRight: e => {
          // $.url.set({ folder: this.focusElement.item.id });
        },
        ArrowLeft: e => {
          // var master = this.focusElement.item.master;
          // if (master) {
          // 	if (master.master) $.url.set({ folder: master.master.id });
          // 	$.url.setitem(master);
          // }
        },
      },
    });
    console.log('Listview',this)
  }
  Listview.prototype = new TreeListview;
  Object.defineProperties(Listview.prototype, {
    activeFilterAttributes:{ value: {}},
    calendar:{ value: function calendar() {
      $('div').class('aco').parent(this.div.text(''))
      .calendar(this.itemsVisible)
    }},
    chart:{ value: function chart() {
      $('div').class('aco').parent(this.div.text('')).chart(this.itemsVisible)
      // var data = [];
      // for (var i=0, item; item = this.items[i]; i++) {
      //   for (var category in item.Datachart) data.push({category:category, label:item.Title, value:item.Datachart[category]});
      //   if(i>10) break;
      //   // //console.log(item.Datachart);
      // }
      // // //console.log(data);
      // // return;
      // return $.Charts.show(data, listItemElement);
    }},
    clickfilter:{ value: function clickfilter(e) {
      const target = e.target;
      const activeFilterAttributes = this.activeFilterAttributes;
      activeFilterAttributes[target.name] = activeFilterAttributes[target.name] || [];
      if (activeFilterAttributes[target.name].includes(target.value)) {
        activeFilterAttributes[target.name].splice(activeFilterAttributes[target.name].indexOf(target.value), 1);
      } else {
        activeFilterAttributes[target.name].push(target.value);
      }
      if (!activeFilterAttributes[target.name].length) {
        delete activeFilterAttributes[target.name];
      }
      var searchParams = new URLSearchParams(document.location.search);
      searchParams.set('f',btoa(JSON.stringify(activeFilterAttributes)));//$.Object.stringify(this.activeFilterAttributes);
      window.history.pushState('page', 'PAGINA', '?' + searchParams.toString() );
      this.refilter();
    }},
    data:{
      get(){
        return this.items;
      },
      set(data) {
        if (Array.isArray(data)) {
        }
        if (typeof data === 'string')
        this.show(data);
      },
    },
    elementSelect:{ value: function elementSelect(el) {
      //// //console.log("select");
      if (this.elSelect) this.elSelect.removeAttribute('selected');
      if (!el) return;
      this.setFocusElement(el);
      (this.elSelect = el).setAttribute('selected', '');
    }},

    filtersOpen:{ value:{}, writable: true },
    filterAttributes:{ value:{}, writable: true },

    fill:{ value: function fill() {
      this.itemsVisible.forEach(row => {
        if (row.elemListLi && row.elemListLi.elem) {
          const h = document.documentElement.clientHeight;
          const rect = row.elemListLi.elem.getBoundingClientRect();
          const visible = rect.bottom > -h && rect.top < h + h;
          if (!visible) {
            row.elemListLi.text('');
          } else if (!row.elemListLi.elem.innerText) {
          this.listnode(row)
        }
        }
      });
    }},
    ganth:{ value: function ganth() {
      $('div').class('aco').parent(this.div.text('')).ganth(this.itemsVisible)
    }},
    go:{ value: function go() {
      return $.Go.create({ el: listItemElement, data: this.items });
    }},

    get:{ value:{}},
    getProperties:{ value: function getProperties() {
      const schemaNames = this.itemsVisible.map(item => item.schemaName).unique();
      const schemas = [...Object($().schemas()).entries()].filter(([schemaName, schema]) => schemaNames.includes(schemaName));
      const schemaKeys = schemas.map(([schemaName, schema]) => schemaName);
      let properties = [].concat(
        'Tagname',
        'LinkTagname',
        'header0',
        'header1',
        'header2',
        // 'schemaPath',
        // 'schemaName',
        ...schemas.map(([schemaName, schema]) => schemaName), ...schemas.filter(([key, schema]) => !['hidden'].includes(schema.format)).map(([key, schema]) => Object.keys(schema.properties)),
        'ID',
        'level',
      ).unique();
      properties = properties.filter(name => this.itemsVisible.some(item => item.data[name]));
      return properties;
    }},
    listnode:{ value: function listnode(item) {
      const li = item.elemListLi;
      const [stateOption, stateOptions] = item.options('State');
      const [catOption, catOptions] = item.options('Categories');
      const iconsrc = item.iconsrc;
      let icon;
      if (iconsrc) {
        icon = $('img', {src: iconsrc || ''});
      } else if (item.gui && item.gui.global) {
        icon = $('div', 'gui global').append(
          $('div', 'object').append(
            $('div', item.tag).append(
              $('div', item.tag).append(item.gui.global),
            ),
          ),
        );
        // [...guiElement.attributes].forEach(attribute => {
        // 	const key = attribute.name[0].toUpperCase() + attribute.name.substr(1);
        // 	if (key === 'Class') return;
        // 	$.HttpRequest($.config.$, this['@id']).select(key).get().then(e => {
        // 		const value = String(this[key]);
        // 		guiElement.setAttribute(attribute.name, value);
        // 	})
        // 	// //console.log(key, this[key]);
        // 	// if (key in this) {
        // 	//   const value = String(this[key]);
        // 	//   if (value) {
        // 	//     childElement.setAttribute(attribute.name, value);
        // 	//     // //console.log(attribute.name, value);
        // 	//   }
        // 	// }
        // });
      }
      if (item.elemListLi) {
        item.elemListLi
        .text('')
        .attr('online', item.online)
        .checked(item.checked)
        .css('border-color', item.modColor)
        .attr('viewstate', item.viewstate)
        .append(
          $('div').class('itemrow row card noselect aco').append(
            $('i', 'modified'),
            $('button').class('abtn stateicon').append(
              $('i').append(
                $('i').css('background-color', item.stateColor),
              ),
              li.elemStateUl = $('ul').class('col').append(
                // $('li').class('abtn').text('JAdsfg sdfg sd'),
                // $('li').class('abtn').text('JAdsfg sdfg sd'),
                // $('li').class('abtn').text('JAdsfg sdfg sd'),
                // $('li').class('abtn').text('JAdsfg sdfg sd'),
              )
            )
            .on('mouseenter', function (e) {
              const rect = this.getBoundingClientRect();
              // //console.log(window.innerHeight,rect.top,li.elemStateUl.elem,li.elemStateUl.elem.clientHeight);
              // setTimeout(() => //console.log(window.innerHeight,rect.top,li.elemStateUl.elem,li.elemStateUl.elem.clientHeight));
              li.elemStateUl.css('top', Math.min(rect.top, window.innerHeight-li.elemStateUl.elem.clientHeight-20)+'px').css('left', rect.left+'px');
            }),
            // $('i', 'stateicon')
            // .contextmenu(stateOptions)
            // .on('select', e => item.state = [...e.path].find(el => el.value).value)
            // .append(
            // 	$('i').css(item.stateColor ? { style: 'background-color:' + item.stateColor } : null),
            // ),
            // ...item.schemaPath.toLowerCase().split(':'),
            $('div')
            .class('icn itemicon', item.className)
            .css('color', item.schemaColor)
            .append(
              icon,
              $('div', 'bt sel').on('click', e => e.stopPropagation(item.checked ^= 1)),
            ),
            $('div', 'col aco').append(
              $('div', 'kop row')
              .attr('hassrc', item.srcID ? 1 : 0)
              // haslink: li.linkrow ? 1 : 0,
              .attr('hasattach', item.hasAttach)
              .attr('type', item.type) // class, copy, inherit
              .append(
                $('span', 'aco header title').text(item.header0),
                $('div', 'icn hdn type').on('click', e => document.location.href = '#id=' + item.srcID),
                $('div', 'icn del').on('click', e => item.delete()),
                $('div', 'icn hdn attach'),
                $('div', 'icn fav').attr('checked', item.fav).on('click', e => {
                  item.fav ^= 1;
                  e.stopPropagation();
                }),
                $('div', 'icn flag').on('click', e => {
                  if (!item.FinishDateTime) {
                    item.FinishDateTime = aDate().toISOString();
                  } else {
                    item.FinishDateTime = '';
                    var d = aDate();
                    d.setDate(aDate().getDate() + 6);
                    d.setHours(16, 0, 0, 0);
                    d.toLocal();
                    item.EndDateTime = d.toISOString();
                  }
                }),
              ),
              $('div', 'header subject', item.header1),
              $('div', 'header preview', item.header2).append(
                item.operations ? item.operations.map(o => $('a', '', o.title, o)) : null,
              ),
            ),
          )
        )
      }
      // if (this === $.pageItem) {
      // 	$(listItemElement).classAdd('pageItem');
      // }
      //if (this.hasModified = !$.clipboard.replace[this.id] || new Date($.his[this.id]) < new Date(this.modifiedDT)) createElement('DIV', { className: !$.his[this.id] ? 'created' : 'modified' });
      // kopElement.createElement(item.srcID && item.revertshow ? ['A', 'copy', { par: { id: item.srcID } }] : null);
    }},

    // itemsVisible:{ value:[]},
    // items:{ value:[]},

    maps:{ value: async function maps() {
      // this.setAttribute('view', 'maps');
      // //console.debug('MAPSSSSSS');
      //this.rewrite();
      this.div.text('').append(
        this.mapElem = $('div').class('googlemap').css('width:100%;height:100%;'),
      );
      const maps = await $.his.maps();
      const mapOptions = {
        zoom: 10,
        center: { lat: 51, lng: 6 },//new maps.LatLng(51,6),
        mapTypeId: maps.MapTypeId.ROADMAP,
        // mapId: 'cb830478947dbf25',
        // styles: [
        //   {
        //     "featureType": "all",
        //     "stylers": [
        //       { "color": "#C0C0C0" }
        //     ]
        //   },{
        //     "featureType": "road.arterial",
        //     "elementType": "geometry",
        //     "stylers": [
        //       { "color": "#CCFFFF" }
        //     ]
        //   },{
        //     "featureType": "landscape",
        //     "elementType": "labels",
        //     "stylers": [
        //       { "visibility": "off" }
        //     ]
        //   }
        // ],
        // https://mapstyle.withgoogle.com/
        styles: $().maps.styles,
      };
      const map = new maps.Map(this.mapElem.elem, mapOptions);
      // return;
      // new maps.Marker({
      //   position: {
      //     // lat: Number(loc[0]),
      //     // lng: Number(loc[1]),
      //     lat: 51.93281270000000,
      //     lng: 6.07558600000000,
      //   },
      //   map: map,
      //   title: 'Hello world',
      // });
      var bounds = new maps.LatLngBounds();
      // var focusmarker;
      const dataItems = this.itemsVisible.filter(item => item.data.Location && item.data.data);
      if (dataItems.length) {
        dataItems.forEach(item => item.value = Object.values(item.data.data).reduce((a,b) => a+b));
        const maxValue = dataItems.map(item => item.value).reduce((a,b) => Math.max(a,b));
        console.log(maxValue);
        dataItems.forEach(item => item.scale = 1 + 2 / maxValue * item.value);
      }
      this.itemsVisible.filter(item => item.data.colorid && item.schema.colorid).forEach(item => item.color = item.schema.colorid[item.data.colorid] || item.schema.colorid.default);
      this.itemsVisible.filter(item => item.data.Location).forEach(item => {
        const loc = item.data.Location.split(',');
        const marker = new maps.Marker({
          position: {
            lat: Number(loc[0]),
            lng: Number(loc[1]),
          },
          map: map,
          item: item,
          zIndex: Number(1),
          title: [item.header0,item.header1,item.header2].join('\n'),
          // icon: getCircle((row.state && row.state.value && row.fields.state.options && row.fields.state.options[row.fields.state.value]) ? row.fields.state.options[row.fields.state.value].color : 'red')
          icon: {
            //url: document.location.protocol+'//developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            //// This marker is 20 pixels wide by 32 pixels high.
            //size: new google.maps.Size(20, 32),
            //// The origin for this image is (0, 0).
            //origin: new google.maps.Point(0, 0),
            //// The anchor for this image is the base of the flagpole at (0, 32).
            //anchor: new google.maps.Point(0, 32)
            path: maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: .6,
            scale: 10, //Math.pow(2, magnitude) / 2,
            strokeColor: 'white',
            strokeWeight: .5
          },
          icon: {
            // path: "M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z",
            // path: "M146.667,0C94.903,0,52.946,41.957,52.946,93.721c0,22.322,7.849,42.789,20.891,58.878 c4.204,5.178,11.237,13.331,14.903,18.906c21.109,32.069,48.19,78.643,56.082,116.864c1.354,6.527,2.986,6.641,4.743,0.212 c5.629-20.609,20.228-65.639,50.377-112.757c3.595-5.619,10.884-13.483,15.409-18.379c6.554-7.098,12.009-15.224,16.154-24.084 c5.651-12.086,8.882-25.466,8.882-39.629C240.387,41.962,198.43,0,146.667,0z M146.667,144.358 c-28.892,0-52.313-23.421-52.313-52.313c0-28.887,23.421-52.307,52.313-52.307s52.313,23.421,52.313,52.307 C198.98,120.938,175.559,144.358,146.667,144.358z",
            // path: "M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z",
            // path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
            path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
            scale: (item.scale || 1)/2,
            fillColor: item.color || "blue",
            fillOpacity: 0.6,
            strokeWeight: 0,
            strokeColor: 'white',
            rotation: 0,
            anchor: new maps.Point(15, 30),
          },
          //icon: (row.state) ? 'icon/' + row.state.value + '.png' : null,
        });
        // console.log(marker);
        marker.addListener('click', e => $('view').show(item));
        bounds.extend(marker.getPosition());
      });
      // if (bounds) {
      map.fitBounds(bounds);
      // //console.log(google.maps);
      if (maps.e) {
        maps.e.addListenerOnce(map, 'bounds_changed', function () { this.setZoom(Math.min(15, this.getZoom())); });
      }
      // }
    }},
    refilter:{ value: function refilter() {
      for (let [attributeName, attribute] of Object.entries(this.filterAttributes)) {
        attribute.cnt = 0;
        attribute.checked = false;
        for (var fieldvalue in attribute.values) {
          var field = attribute.values[fieldvalue];
          field.cnt = 0;
          field.checked = this.activeFilterAttributes && this.activeFilterAttributes[attributeName] && this.activeFilterAttributes[attributeName].indexOf(fieldvalue) > -1;
          attribute.checked = attribute.checked || field.checked;
        }
      }
      this.items.forEach(row => {
        row.hidden = false;
        for (let [attributeName, attribute] of Object.entries(this.activeFilterAttributes)) {
          if (!(attributeName in row.filterfieldslower) || attribute.indexOf(row.filterfieldslower[attributeName]) === -1) {
            row.hidden = true;
            break;
          }
        }
      });
      // add: this.childClasses && this.childClasses.length > 1
      // ? {
      // 	Title: __('newitem'),
      // 	popupmenu: (function (childClasses) {
      // 		for (var i = 0, childclass; childclass = childClasses[i]; i++) {
      // 			//var schema = $.config.components.schemas[className];
      // 			//// //console.debug(childclass);
      // 			//if (!schema) return;
      // 			//var menuitem = menuitems[className] = { Title: schema.Title || className };
      // 			////var childclass = childClasses[name];
      // 			////schema.Title = schema.Title || className;
      // 			////if (item) menuitem.masterID = item.id;
      // 			////menuitem.onclick = $.config.components.schemas.item.add.bind({ schema: className, srcID: childclass.scrID, masterID: childclass.masterID, });
      // 			childclass.onclick = $.config.components.schemas.item.add.bind({ schema: childclass.schema || childclass.Title, masterID: item ? item.id : null });
      // 			//if (item && item.schema == name) childClasses["Typical"] = { schema: "System", srcID: item.scrID }
      // 		}
      // 		//// //console.debug('childClasses', childClasses);
      // 		return childClasses;
      // 	})(this.childClasses)
      // }
      // : {
      // 	Title: __('newitem'),
      // 	onclick: e => {
      // 		let schemaname = this.path.split('/')[1];
      // 		//console.log(1,schemaname);
      // 		$(schemaname).post();
      // 	}
      // },
      this.itemsVisible = this.items.filter(item => !item.hidden);
      this.selector.text('')
      .attr('hidefilter', $().storage('hidefilter'))
      .append(
        $('div', 'row top abs btnbar np').append(
          $('button').class('abtn select').on('click', e => this.selector.attr('hidefilter', $().storage('hidefilter', this.selector.attr('hidefilter')^1).storage('hidefilter'))),
          $('span').class('aco').text(this.title + ' (' + this.items.length + ')'),
          $('button').class('abtn add').append(
            $('ul').append(
              [...$().schemas().entries()].map(
                ([name,schema]) => $('li')
                .class('abtn')
                .draggable()
                .text(name)
                .item($(schema), 'elemAdd')
                .on('click', e => {
                  e.stopPropagation();
                  const targetItem = this.tag ? $(this.tag) : null;
                  const sourceItem = Item.toData($(schema));
                  // return console.log(this.tag, sourecItem, targetItem);
                  $().copyFrom(sourceItem, targetItem).then(item => {
                    $('view').show(item, true);
                  });
                })
              ),
            ),
          ),
          $('button').class('abtn refresh').on(
            'click', e => aimClient
            .api(document.location.pathname.replace(/\/id\/.*/,''))
            .query(document.location.search).get().then(item => $().list(item))
          ),
          $('button').class('abtn download').append(
            $('ul').append(
              $('li').class('abtn toexcel').text('Excel').on('click', e => {
                const properties = this.getProperties();
                const data = this.itemsVisible.map(item => Object.fromEntries(properties.map(key => [key, item[key]] )));
                let ws = XLSX.utils.json_to_sheet(data);
                let wb = XLSX.utils.book_new();
                // let title = this.title.replace(/\/|\(|\)|\_/g,'');
                let title = 'export';
                XLSX.utils.book_append_sheet(wb, ws, title);
                XLSX.writeFile(wb, title + '.xlsx');
              }),
            )
          ),
          $('button').class('abtn print').on('click', null),
          $('button').class('abtn filter').attr('title', 'Lijst filteren').on('click', e => $.show({ flt: get.flt ^= 1 }) ),
          $('button').class('abtn sort').attr('title', 'Menu Opties sorteren openen').append(
            $('ul').append(
              $('li').class('abtn').text('Title').on('click', e => this.sortby('Title')),
              $('li').class('abtn').text('Subject').on('click', e => this.sortby('Subject')),
              $('li').class('abtn').text('Summary').on('click', e => this.sortby('Summary')),
              $('li').class('abtn').text('Deadline').on('click', e => this.sortby('EndDateTime')),
            ),
          ),
          $('button').class('abtn view', this.viewType).append(
            $('ul').append(
              $('li').class('abtn rows').text('Lijst').on('click', e => this.rewrite('rows')),
              $('li').class('abtn cols').text('Tegels').on('click', e => this.rewrite('cols')),
              $('li').class('abtn table').text('Tabel').on('click', e => this.rewrite('table')),
              !this.hasMapsData ? null : $('li').class('abtn maps').text('Maps').on('click', e => this.rewrite('maps')),
              !this.hasChartData ? null : $('li').class('abtn chart').text('Graph').on('click', e => this.rewrite('chart')),
              !this.hasDateData ? null : $('li').class('abtn ganth').text('Ganth').on('click', e => this.rewrite('ganth')),
              !this.hasDateData ? null : $('li').class('abtn calendar').text('Calendar').on('click', e => this.rewrite('calendar')),
              $('li').class('abtn flow').text('Flow').on('click', e => this.rewrite('flow')),
              !this.hasModelData ? null : $('li').class('abtn model').text('Model').on('click', e => this.rewrite('go')),
              $('li').class('abtn model2d').text('2D').on('click', e => {
                //get hidden() {
                //	var item = colpage.item;
                //	return !item || !item.attributes || !item.attributes.x || !item.attributes.y || !item.attributes.z || !(item.attributes.x.value || item.attributes.y.value || item.attributes.z.value);
                //},
                colpage.item.model2d();
              }),
              $('li').class('abtn model3d').text('3D').on('click', e => {
                //get hidden() {
                //	var item = colpage.item;
                //	return !item || !item.attributes || !item.attributes.x || !item.attributes.y || !item.attributes.z || !(item.attributes.x.value || item.attributes.y.value || item.attributes.z.value);
                //},
                colpage.item.model3d();
              }),
            ),
          ),
        ),
        this.filter = $('ul', 'col afilter liopen np noselect').id('afilter')
        .css('max-width', $().storage('afilter.width') || '150px').on('click', e => document.body.setAttribute('ca', 'lvfilter')),
        $('div').seperator(),
        this.div = $('div', 'col aco oa').on('scroll', e => {
          clearTimeout($.toBodyScroll);
          $.toBodyScroll = setTimeout(() => this.fill(), 100);
        }),
      );
      this.rewrite();
      this.filterFields.forEach(filterfield => filterfield.avalues.sort((a,b)=>{
        if (a.cnt > 0 && b.cnt === 0) return -1;
        if (a.cnt === 0 && b.cnt > 0) return 1;
        return a.value.localeCompare(b.value, {}, 'numeric');
      }));
      this.filter.append(...this.filterFields.filter(
        filterfield => filterfield.avalues.length > 1 || filterfield.avalues[0].items.length != this.items.length
      ).map(
        filterfield => $('li', 'col')
        .open(filterfield.open = this.filtersOpen[filterfield.name] || filterfield.checked)
        .attr('cnt', filterfield.cnt || 0)
        .checked(filterfield.checked)
        .append(
          $('a').class('row')
          // .on('click', e => this.filtersOpen[filterfield.name] = filterfield.listItemElement.getAttribute('open') = filterfield.open)
          .on('click', e => this.filtersOpen[filterfield.name] = filterfield.listItemElement.getAttribute('open') = filterfield.open)
          .append(
            $('span').class('aco attrlabel').ttext(filterfield.Title),
          ),
          $('ul')
          .checked(filterfield.checked)
          .attr('meer', filterfield.meer || 0)
          .open(filterfield.avalues.some(field => field.checked))
          .append(
            filterfield.avalues
            .filter(field => field.Title && (filterfield.checked || field.checked || field.cnt))
            .map(
              (field,i) => $('li').class('row')
              .setProperty('btbg', 'red')
              .append(
                $('input')
                .type('checkbox')
                .on('change', e => this.clickfilter(e))
                .checkbox(filterfield, field),
              )),
              $('div')
              .class('meer')
              .on('click', e => $(e.target.parentElement)
              .attr('meer', $(e.target.parentElement).attr('meer')^1)),
              // $('div').class('minder').on('click', e => $(e.target.parentElement).attr('meer', '0')),
            )
          )
        )
      );
      return this;
      if (filterElement) {
        filterElement.innerText = '';
        this.filterFields.forEach(filterfield => {
          filterfield.avalues.sort((a,b)=>{
            if (a.cnt > 0 && b.cnt === 0) return -1;
            if (a.cnt === 0 && b.cnt > 0) return 1;
            return a.value.localeCompare(b.value, {}, 'numeric');
          });
          filterfield.listItemElement = filterElement.createElement('LI', 'col', {
            cnt: filterfield.cnt || 0,
            checked: filterfield.checked || 0,
            open: filterfield.open = this.filtersOpen[filterfield.name] || filterfield.checked || 1
          }, [
            ['A', 'row', {
              onclick: (e)=> {
                this.filtersOpen[filterfield.name] = filterfield.listItemElement.getAttribute('open') = filterfield.open;
              }
            }, [
              ['SPAN', 'aco', __(filterfield.Title)]
            ]],
          ]);
          filterfield.listItemElement = filterfield.listItemElement.createElement('UL', {
            checked: filterfield.checked || 0,
            meer: filterfield.meer || 0
          });
          var ic = 0;
          for (var i = 0, field; field = filterfield.avalues[i]; i++) {
            if (!field.Title) continue;
            if (filterfield.checked || field.checked || field.cnt) {
              if (field.checked) {
                filterfield.listItemElement.setAttribute('open', filterfield.open = 1);
              }
              filterfield.listItemElement.createElement('LI', 'row', {
                ondragover(e) {
                  e.dataTransfer.dropEffect = 'move';
                  e.stopPropagation();
                  e.preventDefault();
                },
                ondrop(e) {
                  // //console.debug(this.filterfield, this.field, $.dragdata.item, e);
                  var par = {};
                  par[this.filterfield.name] = field.Title;
                  if ($.dragdata.item) $.dragdata.item.set(par);
                }
              }, [
                ['INPUT', '', {
                  type: 'checkbox',
                  value: field.value,
                  name: filterfield.name,
                  id: filterfield.name + field.value + i,
                  checked: field.checked,
                  onchange: e => this.clickfilter(e),
                }],
                ['LABEL', 'aco', __(field.Title), { for: filterfield.name + field.value + i }],
                ['SPAN', '', field.cnt],//{ for: filterfield.name + field.value + i, cnt: field.cnt, caption: __(field.Title) }],
              ]);
              ic++;
            }
          }
          if (ic > 5) {
            filterfield.listItemElement.createElement('LI', 'meer', {
              onclick() {
                filterfield.listItemElement.setAttribute('meer', filterfield.meer ^= 1)
              }
            });
          }
        });
      }
    }},
    rewrite:{ value: function rewrite(viewType) {
      localStorage.setItem('viewType', viewType = this.viewType = viewType || localStorage.getItem('viewType'));
      const itemsVisible = this.itemsVisible;
      itemsVisible.forEach(row => {
        for (var attributeName in this.filterAttributes) {
          if (row.filterfieldslower && row.filterfieldslower[attributeName] && this.filterAttributes[attributeName].values) {
            var value = row.filterfieldslower[attributeName];
            if (this.filterAttributes[attributeName].values[value]) {
              this.filterAttributes[attributeName].values[value].cnt++;
              this.filterAttributes[attributeName].cnt++;
            }
          }
        }
      });
      this.div.text('');
      if (this[this.viewType]) {
        return this[this.viewType]();
      }
      $('summary')
      .class('col list')
      .parent(this.div)
      .contextmenu(this.menu)
      .append(...itemsVisible.map(
        item => item.elemListLi = $('li')
        .class('item')
        .draggable()
        .item(item, 'listview')
        .on('click', e => this.select(item))
        .on('focusselect', e => {
          clearTimeout($.arrowTimeout);
          $.arrowTimeout = setTimeout(() => this.select(item), window.event.type === 'keydown' ? 300 : 0);
        })
        .on('change', e => this.listnode(item))
        .emit('change')
        // .attr('userID', item.userID || '0')
        // .attr('level', item.level || '0')
        // .on('rewrite', () => this.listnode(item))
        // .on('select', function () {
        // 	if (!this.innerText) this.createListRowElement(this, this.item);
        // 	Web.Element.scrollIntoView(this);//.scrollIntoViewIfNeeded(false);
        // 	if (this.item.listItemElement) this.item.listItemElement.click();
        // })
        // .assign({
        // 	// item: item,
        // 	//oncontextmenu: $.mainPopup.show,
        // 	//attr: function (row) {
        // 	//	var res = {};
        // 	//	if ($.fav && $.fav[row.id]) res.Fav = 1;
        // 	//	if (row.fields && row.fields.state) res.state = row.fields.state.value;
        // 	//	//if (row.srcID) res.derived = '';
        // 	//	return res;
        // 	//}(row),
        // 	// userID: item.userID || '0',
        // 	// level: item.level || '0',
        // 	select: function () {
        // 		return;
        // 		if (!this.innerText) this.createListRowElement(this, this.item);
        // 		Web.Element.scrollIntoView(this);//.scrollIntoViewIfNeeded(false);
        // 		if (this.item.listItemElement) this.item.listItemElement.click();
        // 	},
        // 	rewrite: () => this.listnode(item),
        // })
        // .contextmenu($(item).popupmenuitems())
        // .on('click', e => this.selectFocusElement(item.elemListLi.elem, e))
        // .on('click', e => //console.log(item.tag, item.header0))
      ));
      this.fill();
    }},
    select:{ value: function select(item, e) {
      // //console.log(2);
      // $.clipboard.setItem([item], 'checked', '');
      // this.focus(item);
      this.setFocusElement(item.elemListLi.elem, e);
      $().execQuery({
        v: urlToId(item.data['@id']),
      });
      //
      // $('view').show(item);
    }},
    set:{ value: function set(set) {
      //// //console.debug('LIST SET', this.get.filter, set);
      //// //console.debug('LIST SET', set);
      //if (!set.q) this.get = {};
      //'folder, function, q, filter, search, Title, id, child, select, src, master, users, link, refby, origin, source'.split(', ').forEach(function (name) { if (name in set) this.get[name] = set[name]; }, this);
      //$.url.sethis(this.get);
      //Object.assign(set, { id: '', schema: '', tv: '', lv: '', reload: '' , Title: '' });
      //Object.assign(set, { id: '', schema: '', reload: '' });
      //// //console.debug('LIST SET', set.Title, set.filter);
      for (var name in set) if (this.get[name] != set[name]) break; else name = null;
      if (!name) return;
      //// //console.debug('LIST SET', set);
      //// //console.debug(set);
      //// //console.debug('LIST SET', this.get.filter, set);
      Object.assign(this.get, set);
      //indien er een filter aanstaat en er een zoekopdracht wordt gegeven, schakelen we het filter uit. Zoeken vindt plaats op alle items van een masterclass
      //Voorbeeld is EWR moba. Filter is actief, alleen actieve items. Bij zoeken alle items.
      //if (this.get.q && this.get.q != '*' && this.get.filter) this.get.filter = '';
      this.schema = this.get.schema || ($.getItem(this.get.folder) ? $.getItem(this.get.folder).schema : null) || this.get.folder;
      this.childClasses = $.config.components.schemas[this.schema] && $.config.components.schemas[this.schema].childClasses ? $.config.components.schemas[this.schema].childClasses : [this.schema];
      //// //console.debug('SCHEMA', this.schema, this.childClasses);
      //// //console.debug('LIST SET', this.get.filter, set);
      for (var name in this.get) if (!this.get[name]) delete this.get[name];
      //// //console.debug('LIST SET', this.get.filter, set.filter);
      if (this.get.folder && Number(this.get.folder) && $.getItem(this.get.folder)) {
        $.getItem(this.get.folder).focus();
        if ($.getItem(this.get.folder).children.length) {
          this.show($.getItem(this.get.folder).children);
          return
        }
      }
      this.show(this.data[this.get.Title] || []);
      //// //console.debug('LIST SET', this.get);
      if (!this.get.q) return;
      //// //console.debug('LIST SET', this.get.filter, set.filter);
      var get = this.get;
      this.loadget = {};
      "folder, filter, child, q, select".split(", ").forEach(function (name) { if (get[name]) this.loadget[name] = get[name]; });
      delete this.loadget.select;
      new $.HttpRequest($.config.$, 'GET', this.loadget, e => {
        //// //console.debug('list_set', this.responseText, e.body);
        this.show(e.body.value);
      }).send();
      //if (!get.value) this.items = [];
      //var par = Object.assign($.url.par(document.location.search.substr(1)), { q: this.value, search: 'Title, Subject, Summary' }), get = {};
      //'folder, q, filter, search'.split(', ').forEach(function (name) { if (par[name]) get[name] = par[name]; });
      //$.url.set(get);
    }},
    show:{ value: async function show(items, path) {
      if (Array.isArray(this.items = (await items) || [])) {
        this.viewMap = new Map();
        this.title = path || '';
        this.tag = ((this.items.url||'').match(/\w+\(\d+\)/)||[''])[0];
        if (this.items.url) {
          // const url = new URL(document.location);
          // console.log('this.items.url', this.items.url, document.location.href);
          // url.searchParams.set('p', this.items.url);
          // window.history.pushState('page', '', url);
          // $.his.replaceUrl(url.toString());
          //
          // const url = new URL(this.items.url, document.location.origin);
          // url.searchParams.set('p', )
          // url.hostname = document.location.hostname;
          // this.title = url.pathname = url.pathname.replace(/.*(?=\b\w+\()/,'');
          // url.pathname += document.location.pathname.replace(/.*(?=\/id\/)/,'');
          // // console.log('show', this.title, this.items.url);
          // $.his.replaceUrl(url.toString())
          // this.title = this.items.url.replace(/.*\/api/,'');
          // const url = new URL(this.items.url.replace(/.*\/api/,''), document.location.origin);
          // TODO: werkt niet altijd
          // const match = document.location.pathname.match(/(\/id\/.*)/);
          // if (match) {
          //   url.pathname += match[0];
          //   $.his.replaceUrl(url.toString())
          // }
        }
        itemsVisible = [];
        this.elMeer = null;
        this.filterAttributes = {};
        if (document.getElementById('elBanner')) {
          document.getElementById('elBanner').style.display = 'none';
        }
        if (window.aThree && window.aThree.initdone) {
          return;
        }
        if ($.clipboardtree) {
          if ($.clipboardtree.elSelected) $.clipboardtree.elSelected.removeAttribute('selected');
          if ($.his.folder) {
            var item = $.getItem($.his.folder.substr(1).split('?').shift());
            if (item && item.elemTreeLi) ($.clipboardtree.elSelected = item.elemTreeLi).setAttribute('selected', '');
          }
        }
        // const this.viewType = document.body.getAttribute('view');
        // if (this.get.function && this.get.folder && $.config.components.schemas[this.get.folder] && $.config.components.schemas[this.get.folder][this.get.function]) {
        // 	$.config.components.schemas[this.get.folder][this.get.function](this.items);
        // }
        // this.items.sort((a, b) => { return a.index > b.index ? 1 : a.index < b.index ? -1 : 0; });
        // //console.error(this.items);
        this.items = this.items.filter(Boolean).map(item => item instanceof Item ? item : Item.get(item));
        // console.log(this.items);
        this.hasDateData = this.items.some(item => item.data.EndDateTime && item.data.StartDateTime);
        // this.hasChartData = this.items.some(item => item.data.data || (item.data.key && item.data.category && item.data.value));
        this.hasChartData = this.items.some(item => item.data.data && item.data.key);
        this.hasMapsData = this.items.some(item => item.data.Location);
        this.hasModelData = this.items.some(item => item.data.Title && item.data.linkto);
        // console.log('hasMapsData', this.hasMapsData, this.hasChartData);
        this.items.forEach((row, i) => {
          // row = row instanceof Item ? row : Item.get(row);
          // if (row.EndDateTime && row.StartDateTime) this.viewMap.set('ganth', true);
          // //console.error(row.schema, row);
          row.createListRowElement = row.createListRowElement || Item.createListRowElement;
          if (row['@id'] && Item(row['@id'])) row = this.items[i] = Item(row['@id']);
          const properties = row.schema.properties || {};
          const filternames = Object.entries(properties).filter(([name,prop])=>prop.filter);
          row.filterfields = Object.fromEntries(row.filternames.filter(name => row[name]).map(name => [name,row[name]]));
          // console.log(row.filternames, row.filterfields);
          //   Object.entries(properties)
          //   .filter(([name,prop])=>prop.filter && row[name])
          //   .map(([name,prop])=>[name, row[name]])
          // );
          row.filterfields.schemaName = row.schemaName;
          row.filterfields.hasAttach = row.hasAttach ? 'ja' : 'nee';
          // row.filterfields.test1 = 1;
          row.filterfields.state = row.state;
          // //console.log(row.state, row.State)
          // row.filterfields.lastModified = row.lastModified;
          // row.filterfields.created = row.created;
          // if (row.state && properties.state && properties.state.options && properties.state.options[row.state]) {
          //   row.stateColor = properties.state.options[row.state].color;
          // }
          //this.iconsrc = (this.files && this.files.avalue && this.files.avalue[0]) ? this.iconsrc = files.avalue[0].src : (this.class && this.class.className ? apiroot + 'img/icon/' + this.class.className + '.png' : '');
          //aimClient.listitem.call(row);
          // var cfgclass = $.config.components.schemas[aimClient.api.find(row.classID)], filterfields = {};
          $.config.components = $.config.components || {};
          $.config.components.schemas = $.config.components.schemas || {};
          var cfgclass = $.config.components.schemas[row.schema] || {};
          var filterfields = {};
          row.filtervalues = [];
          for (var attributeName in row.filterfields) {
            // //console.log(row.properties[attributeName].title);
            var fieldtitle = __(row.properties && row.properties[attributeName] && row.properties[attributeName].title ? row.properties[attributeName].title : attributeName);
            if (cfgclass && cfgclass.fields && cfgclass.fields[attributeName]) var fieldtitle = cfgclass.fields[attributeName].Title || cfgclass.fields[attributeName].placeholder || attributeName;
            row.filtervalues.push(row.filterfields[attributeName]);
            var value = String(row.filterfields[attributeName]).trim().toLowerCase();
            filterfields[attributeName] = value;
            this.filterAttributes[attributeName] = this.filterAttributes[attributeName] || {
              values: [],
              avalues: [],
              Title: fieldtitle
            };
            this.filterAttributes[attributeName].values[value] = this.filterAttributes[attributeName].values[value] || {
              value: value,
              Title: row.filterfields[attributeName],
              items: [],
              checked: false,
            };
            this.filterAttributes[attributeName].values[value].items.push(row);
          };
          row.filterfieldslower = filterfields;
        });
        if (this.viewType === 'chart' && !this.hasChartData) {
          $(document.body).attr('view', '');
        }
        this.filterFields = [];
        for (let [attributeName, attribute] of Object.entries(this.filterAttributes)) {
          attribute.name = attributeName;
          for (let [fieldvalue, value] of Object.entries(attribute.values)) {
            attribute.avalues.push(attribute.values[fieldvalue]);
          }
          // console.log(attributeName, attribute.avalues, attribute.values);
          if (attribute.avalues.length > 1 || attribute.avalues[0].cnt != this.items.length) {
            this.filterFields.push(attribute);
          }
        };
        var searchParams = new URLSearchParams(document.location.search);
        if (searchParams.has('f')) {
          this.activeFilterAttributes = JSON.parse(atob(searchParams.get('f')));
          for (var attributeName in this.activeFilterAttributes) {
            if (!(attributeName in this.filterAttributes)) {
              delete this.activeFilterAttributes[attributeName];
            } else {
              for (var i = 0, val; val = this.activeFilterAttributes[attributeName][i]; i++) if (!(val in this.filterAttributes[attributeName].values)) {
                this.activeFilterAttributes[attributeName].splice(this.activeFilterAttributes[attributeName].indexOf(val), 1);
                i--;
              }
              if (!this.activeFilterAttributes[attributeName].length) {
                delete this.activeFilterAttributes[attributeName];
              }
            }
          }
        }
        this.idxstart = 0;
        this.filterFields.sort((a, b)=> {
          return a.name.localeCompare(b.name, {}, 'numeric');
        });
        this.refilter();
      }
      return this;
    }},
    sortby:{ value: function sortby(sortname) {
      this.sortdir = this.sortname == sortname ? -this.sortdir : 1;
      this.sortname = sortname;
      console.debug(sortname);
      this.btns.sort.className = this.sortdir == 1 ? '' : 'asc';
      this.items.sort(function (a, b) {
        return this.sortdir * String(a[this.sortname]).localeCompare(String(b[this.sortname]), {}, 'numeric');
      }.bind(this));
      refilter();
      //this.show();
    }},
    sortlist:{ value: function sortlist(a, b) {
      //// //console.debug('SORT', a, b);
      if (a.masterID && b.masterID && a.masterID == b.masterID) {
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
      }
      if (a.prio && b.prio && a.prio < b.prio) return -1;
      if (a.prio && b.prio && a.prio > b.prio) return 1;
      if (a.FinishDateTime && !b.FinishDateTime) return 1;
      if (!a.FinishDateTime && b.FinishDateTime) return -1;
      if (a.FinishDateTime && b.FinishDateTime) {
        if (a.FinishDateTime < b.FinishDateTime) return -1;
        if (a.FinishDateTime > b.FinishDateTime) return 1;
      }
      if (a.fav && !b.fav) return -1;
      if (!a.fav && b.fav) return 1;
      //// //console.debug(a, b);
      if (a.lastvisitDT && !b.lastvisitDT) return -1;
      if (!a.lastvisitDT && b.lastvisitDT) return 1;
      if (a.lastvisitDT && b.lastvisitDT) {
        if (a.lastvisitDT.substr(0, 10) < b.lastvisitDT.substr(0, 10)) return -1;
        if (a.lastvisitDT.substr(0, 10) > b.lastvisitDT.substr(0, 10)) return 1;
      }
      if (a.accountprice && !b.accountprice) return -1;
      if (!a.accountprice && b.accountprice) return 1;
      //if (sortname) {
      //    if (a[sortname].value < b[sortname].value) return -1;
      //    if (a[sortname].value > b[sortname].value) return 1;
      //}
      //if (a.EndDateTime && !b.EndDateTime) return -1;
      //if (!a.EndDateTime && b.EndDateTime) return 1;
      if (a.EndDateTime && b.EndDateTime) {
        if (a.EndDateTime < b.EndDateTime) return -1;
        if (a.EndDateTime > b.EndDateTime) return 1;
      }
      //if (a.StartDateTime && !b.StartDateTime) return 1;
      //if (!a.StartDateTime && b.StartDateTime) return -1;
      if (a.StartDateTime && b.StartDateTime) {
        if (a.StartDateTime < b.StartDateTime) return -1;
        if (a.StartDateTime > b.StartDateTime) return 1;
      }
      //if (a.lastvisitDT && b.lastvisitDT) {
      //    if (a.lastvisitDT < b.lastvisitDT) return -1;
      //    if (a.lastvisitDT > b.lastvisitDT) return 1;
      //}
      if (a.searchname && b.searchname) {
        var awords = a.searchname.match(/\w+/g),
        bwords = b.searchname.match(/\w+/g),
        ia = 999,
        ib = 999,
        l = $.his.search.value.length;
        for (var i = 0, word; word = awords[i]; i++) {
          //// //console.debug(word);
          if (word.indexOf($.his.search.value) != -1) ia = Math.min(ia, word.indexOf($.his.search.value) + word.length - l);
          //var pos = word.indexOf($.his.search.value);
          //ia -= pos != -1 ? l + word.length - pos : 0;
        }
        for (var i = 0, word; word = bwords[i]; i++) {
          //// //console.debug(word);
          if (word.indexOf($.his.search.value) != -1) ib = Math.min(ib, word.indexOf($.his.search.value) + word.length - l);
          //var pos = word.indexOf($.his.search.value);
          //ib -= pos != -1 ? l + word.length - pos : 0;
          //ib += word.length - l + (pos != -1 ? pos - l : 0);
          //ib += pos != -1 ? pos : word.length;
          //ib += word.indexOf($.his.search.value) || word.length;
        }
        //// //console.debug(a, a.searchname, ia, b, b.searchname, ib);
        //var ia = a.searchname.indexOf($.his.search.value);
        //var ib = b.searchname.indexOf($.his.search.value);
        //if (ia == -1 && ib != -1) return 1;
        //if (ia != -1 && ib == -1) return -1;
        if (ia < ib) return -1;
        if (ia > ib) return 1;
      }
      return 0;
    }},
    table:{ value: function table() {
      const properties = this.getProperties();
      const tableElem = $('table').parent(this.div.text('')).class('list').append(
        $('thead').append(
          $('tr').append(
            $('th'),
            properties.map(propertyName => $('th').class('attrlabel').ttext(propertyName)),
          ),
        ),
        $('tbody').append(
          this.itemsVisible.map(item => $('tr')
          .item(item, 'tableview')
          .on('click', e => $('view').show(item))
          .draggable()
          .append(
            $('td')
            .class('icn', item.schemaName)
            .css('color', item.schemaColor),
            properties.map(propertyName => $('td').text(item.getDisplayValue(propertyName))),
          )),
        ),
      ).resizable();
    }},
    _init1:{ value: function (get) {
      Object.assign(this, get);
      refilter();
    }},
    _focus:{ value: function (item, e) {
      //console.log(1);
      // item.elemListLi
      // return;
      $.clipboard.setItem([item], 'checked', '');
      clearTimeout(this.arrowTimeout);
      this.arrowTimeout = setTimeout(() => this.select(item), e && e.type === 'keydown' ? 500 : 0);
      $().view(item);
      // //console.log(item.tag, item.header0);
      return;
      if (newFocusElement) {
        //console.log('selectFocusElement', newFocusElement);
        const e = window.event;
        this.setFocusElement(newFocusElement, e);
        // $.view()
        return;
        //console.log(arguments.callee.name, newFocusElement);
      }
    }},
  });

  Treeview = function (selector) {
    this.construct(...arguments);
    selector.class('col aco atv noselect np')
    .contextmenu(this.menu)
    .append(
      $('nav', 'row top abs btnbar np').append(
        $('button').class('abtn r popout').on('click', e => {
          var url = document.location.origin;
          // var url = 'about:blank';
          const rect = this.elem.getBoundingClientRect();
          console.log(this.win);
          if (this.win) {
            console.log(this.win);
            return this.win.focus();
          }
          const win = this.win = window.open(url, null, `top=${window.screenTop},left=${window.screenLeft+document.body.clientWidth-rect.width},width=${rect.width},height=${rect.height}`);
          window.addEventListener('beforeunload', e => win.close());
          const doc = this.win.document;
          doc.open();
          doc.write(pageHtml);
          doc.close();
          const aim = $;
          win.onload = function (e) {
            const $ = this.$;
            const document = win.document;
            $(document.documentElement).class('app');
            $(document.body).class('col aim om bg').id('body').append(
              // $('section').class('row aco main').id('section_main').append(
                $('section').tree().class('aco').style('max-width:auto;'),
              // ),
              $('footer').statusbar(),
            );
            (async function () {
              await $().translate();
              await $().getApi(document.location.origin+'/api/');
              await $().login();
              if (aim().menuChildren) {
                $().tree(...aim().menuChildren);
              }
              // await $(`/Contact(${aimClient.sub})`).details().then(item => $().tree($.user = item));
              // console.log(aim.user.data);
              $().tree(aim.user.data);
            })()
          }
        }),
        $('button').class('abtn pin').on('click', e => {
          $(document.body).attr('tv', $(document.body).attr('tv') ? null : 0);
        }),
        // $('button', 'abtn icn close'),
      ),
      this.listElem = $('div').class('col aco oa list')
    );
    const elem = this.elem;
    const self = this;
    Object.assign(Item.prototype, {
      edit() {
        const elem = $('input')
        .parent(this.elemTreeTitle.text(''))
        .class('aco')
        .value(this.header0)
        .on('focus', e => e.stopPropagation())
        .on('change', e => this.header0 = e.target.value)
        .on('blur', e => this.elemTreeLi.emit('change'))
        .on('keydown', e => {
          e.stopPropagation();
          if (['Enter','Escape'].includes(e.key)) {
            $(e.target).emit('blur');
            this.elemTreeDiv.focus();
            e.preventDefault();
          }
        })
        .focus().select()
      },
      close(e) {
        var item = this.item || this;
        // if (item.opened) item.elemTreeLi.elemTreeDiv.setAttribute('open', item.opened = 0);
      },
      focus(e) {
        self.setFocusElement(this.elemTreeLi);
        return;
        //console.warn('FOCUS');
        return;
        // self.focusElement =
        //if (!e) e = window.event;
        //$.setfocus(navtree);
        if (self.focusElement && self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.removeAttribute('focus');
          // $.clipboard.items.push(self.focusElement);
        }
        // $.clipboard.cancel();
        // $.clipboard.items.forEach(function (item) {
        // 	if (!item.elemTreeLi.getAttribute('checked')) {
        // 		item.elemTreeLi.removeAttribute('checked');
        // 	}
        // });
        // $.targetItem = $.selectEndItem = self.focusItem = this;
        if (!e || e.type !== 'mousemove') {
          $.scrollIntoView(self.focusElement.elemTreeLi.elemTreeDiv.elem);
        }
        if (self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.setAttribute('focus', '');
          //if (!e) return;
          // if (e && e.shiftKey) {
          //   $.clipboard.items = [this];
          //   var selactive = 0;
          //   [...elem.getElementsByTagName('LI')].forEach(listItemElement => {
          //     if (listItemElement.item === $.selectStartItem) {
          //       selactive ^= 1;
          //       if ($.clipboard.items.indexOf(listItemElement.item) === -1) {
          //         $.clipboard.items.push(listItemElement.item);
          //       }
          //     }
          //     if (listItemElement.item === $.selectEndItem) {
          //       selactive ^= 1;
          //       if ($.clipboard.items.indexOf(listItemElement.item) === -1) {
          //         $.clipboard.items.push(listItemElement.item);
          //       }
          //     }
          //     if (selactive && $.clipboard.items.indexOf(listItemElement.item) === -1) {
          //       $.clipboard.items.push(listItemElement.item);
          //     }
          //   });
          //   $.clipboard.items.forEach(listItemElement => {
          //     listItemElement.elemTreeLi.setAttribute('checked', '');
          //   });
          // } else if (e && e.ctrlKey) {
          //   $.clipboard.items.push(this);
          //   $.clipboard.items.forEach(listItemElement => {
          //     listItemElement.elemTreeLi.setAttribute('checked', '');
          //   });
          // } else {
          //   $.clipboard.items = [this];
          //   $.selectStartItem = $.selectEndItem;
          // }
        }
        // //console.error($.clipboard);
      },
      setSelect(e) {
        this.focus();
        if (this.selectedElement) {
          this.selectedElement.removeAttribute('selected');
        }
        if (this.elemTreeLi) {
          (this.selectedElement = this.elemTreeLi).setAttribute('selected', '');
        }
      },
      select(e) {
        $('view').show(this);
        $().list(this.children);
        return;
        //console.log(this, e);
        this.setSelect();
        $.attr(this, 'treeselect', '');
        document.location.href = `#/${this.tag}/children/id/${btoa(this['@id'])}?$select=${$.config.listAttributes}&$filter=FinishDateTime+IS+NULL`;
        // document.location.href = `#/id/${btoa(this['@id'])}?$select=${LIST_ATTRIBUTES}&$filter=FinishDateTime+IS+NULL`;
        // //console.log('JA', btoa(this['@id']));
        // document.location.href = `#/id/${btoa(this['@id'])}`;
      },
      close(e) {
        if (this.elemTreeLi.elemTreeDiv) {
          // this.elemTreeLi.elemTreeDiv.setAttribute('open', 0);
          self.openItemsSave();
        }
      },
      async open(e) {
        return self.open(this);
      },
    });
    $(elem).extend({
      close() {
        $(document.body).attr('tv', 0);
      },
      // cancel() {
      // 	// //console.log('cancel', self.editItem);
      // 	if (self.editItem) {
      // 		self.editItem.createTreenode();
      // 		self.editItem = null;
      // 	}
      // 	return;
      // 	// if (e) return this.item.editclose();
      // 	delete Treeview.elFocus;
      // 	return;
      // 	//this.loaded = false;
      // 	// document.getElementById('ckeTop').style = "display:none;";
      // 	// document.body.appendChild(document.getElementById('ckeTop'));
      // 	if ($.pageEditElement && $.pageEditElement.parentElement === colpage) {
      // 		$.pageEditElement.remove();
      // 	}
      // 	if ($.elCover) $.his.body.removeChild($.elCover);
      // 	//if ($.elPc) $.elPc.innerText = '';
      // },
      selitems: function () {
        //var items = [];
        $.clipboard.items.forEach(function (item) {
          $.clipitems.push(item);
          e.elemTreeLi.setAttribute('checked', e.type);
        });
      },
      keydown: {
        // Space: e => {
        // 	if (document.activeElement === document.body) {
        // 		if (self.focusElement) {
        // 			self.focusElement.item.select();
        // 		}
        // 		e.preventDefault();
        // 	}
        // },
        ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),//.focusElement ? this.focusElement.previousElementSibling : null, e),
        shift_ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),//this.focusElement ? this.focusElement.previousElementSibling : null, e),
        ArrowDown: e => this.setFocusElement(this.getNextElement(), e),//this.focusElement ? this.focusElement.nextElementSibling : null, e),
        shift_ArrowDown: e => this.setFocusElement(this.getNextElement(), e),//this.focusElement ? this.focusElement.nextElementSibling : null, e),
        shift_alt_ArrowDown: e => this.moveDown(e),
        shift_alt_ArrowUp: e => this.moveUp(e),
        ctrl_ArrowDown: e => this.moveDown(e),
        ctrl_ArrowUp: e => this.moveUp(e),
        ArrowLeft(e) {
          if (self.focusElement) {
            const item = self.focusElement.item;
            if (item.elemTreeLi.elemTreeDiv.attr('open') == 1) {
              item.elemTreeLi.elemTreeDiv.attr('open', 0);
            } else if (item.master) {
              item.master.focus();
            }
          }
        },
        ArrowRight(e) {
          return;
          // //console.log('ArrowRight', self.focusElement);
          if (self.focusElement) {
            const item = self.focusElement.item;
            // //console.log('ArrowRight', elem.keydown, elem.keydown.ArrowDown);
            //console.log(e, e.target, elem, elem.open);
            if (elem.open) return elem.open = 1;//self.open(item);
            elem.keydown.ArrowDown(e);
            item.select();
          }
        },
        shift_alt_ArrowLeft: e => this.outdent(e),
        shift_alt_ArrowRight: e => this.ident(e),
        ctrl_ArrowLeft: e => this.outdent(e),
        ctrl_ArrowRight: e => this.ident(e),
        ctrl_Delete(e) {
          if (self.focusElement) {
            const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
            self.focusElement.item.delete();
            self.setFocusElement(nextElement);
          }
        },
        ctrl_Backspace(e) {
          if (self.focusElement) {
            const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
            self.focusElement.item.delete();
            self.setFocusElement(nextElement);
          }
        },
        async Enter(e) {
          // toeboegen sibling
          if (document.activeElement === document.body && self.focusElement) {
            const focusItem = self.focusElement.item;
            // indien listitem niet geselcteerd, dan selecteren
            if (!self.focusElement.hasAttribute('treeselect')) {
              return focusItem.select();
            }
            const schemaName = focusItem.schemaName;
            const parentItem = focusItem.master;
            const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
            const item = await parentItem.appendItem(focusItem, {
              schemaName: schemaName,
              Title: schemaName + schemaIndex,
            });
            if (focusItem.isClass) {
              param.srcID = param.masterID = master.id;
            }
            item.focus();
            item.edit();
          }
        },
        // async ctrl_Enter(e) {
        // 	// maak een kopie van het huidige item, idem aan class
        // 	if (document.activeElement === document.body && self.focusElement) {
        // 		const focusItem = self.focusElement.item;
        // 		const schemaName = focusItem.schemaName;
        // 		const parentItem = focusItem.master;
        // 		const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
        // 		const item = await parentItem.appendItem(focusItem, {
        // 			schemaName: schemaName,
        // 			Title: schemaName + schemaIndex,
        // 		});
        // 		const sourceID = focusItem.values.Source ? focusItem.values.Source.LinkID : focusItem.ID;
        // 		item.Source = { LinkID: sourceID };
        // 		item.focus();
        // 		item.edit();
        // 	}
        // },
        async Insert(e) {
          // toevoegen child
          if (document.activeElement === document.body && self.focusElement) {
            e.preventDefault();
            //console.debug('keys.tv.Insert', self.focusElement );
            const parentElement = self.focusElement;
            const parentItem = parentElement.item;
            const schemaName = parentItem.schemaName;
            const childItem = {
              schemaName: schemaName,
              Title: schemaName,
            };
            parentItem.appendItem(null, childItem);
          }
        },
        async ctrl_Insert(e) {
          // toevoegen child derived class
          if (document.activeElement === document.body && self.focusElement) {
            const parentItem = self.focusElement.item;
            const schemaName = parentItem.schemaName;
            const schemaIndex = parentItem.children ? parentItem.children.filter(child => child.schemaName === schemaName).length : 0;
            const item = await parentItem.appendItem(null, {
              schemaName: schemaName,
              Title: schemaName + schemaIndex,
            });
            item.Src = { LinkID: parentItem.ID };
            item.focus();
            item.edit();
          }
        },
      }
    });
    console.log('Treeview',this)
  }
  Treeview.prototype = new TreeListview;
  Object.defineProperties(Treeview.prototype, {
    childnode:{ value: function childnode(child) {
      return (child.elemTreeLi = $('details'))
      .open($.his.openItems.includes(child.tag))
      .item(child, 'treeview')
      .on('toggle', async e => {
        // if (!e.target.open) e.target.open = true;
        // e.target.open = !e.target.open;
        // console.warn('TOGGLE', e.target.open);
        // return;
        // e.target.open = true;
        if (e.target.open) {//child.elemTreeLi.open) {
          let children = await child.children || [];
          // console.log(111, children);
          children.sort((a, b) => a.index > b.index ? 1 : a.index < b.index ? -1 : 0 );
          child.elemTreeLi.append(
            children
            .filter(item => !(item.elemTreeLi || this.childnode(item)).elem.contains(child.elemTreeLi.elem) )
            .map(child => child.elemTreeLi || this.childnode(child))
          );
        }
        this.openItemsSave();
      })
      .on('close', e => this.close(child))
      .on('keyup', e => {
        e.preventDefault();
        e.stopPropagation();
      })
      .on('keydown', e => {
        // console.log('kd', e);
        // if (e.target.tagName === 'INPUT') return e.preventDefault();
        const keydown = {
          Space: e => {
            if (this.focusElement) {
              this.focusElement.item.select();
            }
          },
          // ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),//.focusElement ? this.focusElement.previousElementSibling : null, e),
          // shift_ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),//this.focusElement ? this.focusElement.previousElementSibling : null, e),
          // ArrowDown: e => this.setFocusElement(this.getNextElement(), e),//this.focusElement ? this.focusElement.nextElementSibling : null, e),
          // shift_ArrowDown: e => this.setFocusElement(this.getNextElement(), e),//this.focusElement ? this.focusElement.nextElementSibling : null, e),
          // shift_alt_ArrowDown: e => this.moveDown(e),
          // shift_alt_ArrowUp: e => this.moveUp(e),
          // ctrl_ArrowDown: e => this.moveDown(e),
          // ctrl_ArrowUp: e => this.moveUp(e),
          ArrowLeft: e => {
            if (this.focusElement) {
              const item = this.focusElement.item;
              if (this.focusElement.open) {
                this.focusElement.open = false;
              } else if (this.focusElement.parentElement) {
                this.setFocusElement(this.focusElement.parentElement);
              }
            }
          },
          // ArrowRight(e) {
          //   return;
          //   // //console.log('ArrowRight', self.focusElement);
          //   if (self.focusElement) {
          //     const item = self.focusElement.item;
          //     // //console.log('ArrowRight', elem.keydown, elem.keydown.ArrowDown);
          //     //console.log(e, e.target, elem, elem.open);
          //     if (elem.open) return elem.open = 1;//self.open(item);
          //     elem.keydown.ArrowDown(e);
          //     item.select();
          //   }
          // },
          //
          ArrowRight: e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.focusElement) {
              this.focusElement.open = true;
            }
            // child.elemTreeLi.elem.open = false;
          },
          ctrl_Enter: e => {
            //console.log('ctrl_Enter', this.focusElement);
            if (this.focusElement) {
              $()
              .copyFrom(this.focusElement.item.source || this.focusElement.item.class, this.focusElement.parentElement.item, this.focusElement.item.index)
              .then(item => setTimeout(()=>{
                this.setFocusElement(item.elemTreeLi.elem);
                item.edit();
              }));
            }
          },
          shift_alt_ArrowLeft: e => this.outdent(e),
          shift_alt_ArrowRight: e => this.ident(e),
          ctrl_ArrowLeft: e => this.outdent(e),
          ctrl_ArrowRight: e => this.ident(e),
          ctrl_Delete: e => {
            const nextElement = this.focusElement.nextElementSibling || this.focusElement.previousElementSibling || this.focusElement.parentElement;
            console.log('ctrl_Delete', nextElement, this.focusElement, this.focusElement.parentElement);
            this.focusElement.item.delete().then(item => setTimeout(() => this.setFocusElement(nextElement)));
          },
          Delete: e => {
            const nextElement = this.focusElement.nextElementSibling || this.focusElement.previousElementSibling || this.focusElement.parentElement;
            console.log('DELETE', nextElement);
            $.link({
              name: 'Master',
              item: this.focusElement.item,
              to: null,
              current: this.focusElement.parentElement.item,
              action: 'move',
            }).then(item => this.setFocusElement(nextElement))
          },
          ctrl_Backspace(e) {
            if (self.focusElement) {
              const nextElement = self.focusElement.nextElementSibling || self.focusElement.previousElementSibling || self.focusElement.parentElement.parentElement;
              self.focusElement.item.delete();
              self.setFocusElement(nextElement);
            }
          },
          async Enter(e) {
            // toeboegen sibling
            if (document.activeElement === document.body && self.focusElement) {
              const focusItem = self.focusElement.item;
              // indien listitem niet geselcteerd, dan selecteren
              if (!self.focusElement.hasAttribute('treeselect')) {
                return focusItem.select();
              }
              const schemaName = focusItem.schemaName;
              const parentItem = focusItem.master;
              const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
              const item = await parentItem.appendItem(focusItem, {
                schemaName: schemaName,
                Title: schemaName + schemaIndex,
              });
              if (focusItem.isClass) {
                param.srcID = param.masterID = master.id;
              }
              item.focus();
              item.edit();
            }
          },
          // async ctrl_Enter(e) {
          // 	// maak een kopie van het huidige item, idem aan class
          // 	if (document.activeElement === document.body && self.focusElement) {
          // 		const focusItem = self.focusElement.item;
          // 		const schemaName = focusItem.schemaName;
          // 		const parentItem = focusItem.master;
          // 		const schemaIndex = parentItem.children.filter(child => child.schemaName === schemaName).length;
          // 		const item = await parentItem.appendItem(focusItem, {
          // 			schemaName: schemaName,
          // 			Title: schemaName + schemaIndex,
          // 		});
          // 		const sourceID = focusItem.values.Source ? focusItem.values.Source.LinkID : focusItem.ID;
          // 		item.Source = { LinkID: sourceID };
          // 		item.focus();
          // 		item.edit();
          // 	}
          // },
          async Insert(e) {
            // toevoegen child
            if (document.activeElement === document.body && self.focusElement) {
              e.preventDefault();
              //console.debug('keys.tv.Insert', self.focusElement );
              const parentElement = self.focusElement;
              const parentItem = parentElement.item;
              const schemaName = parentItem.schemaName;
              const childItem = {
                schemaName: schemaName,
                Title: schemaName,
              };
              parentItem.appendItem(null, childItem);
            }
          },
          async ctrl_Insert(e) {
            // toevoegen child derived class
            if (document.activeElement === document.body && self.focusElement) {
              const parentItem = self.focusElement.item;
              const schemaName = parentItem.schemaName;
              const schemaIndex = parentItem.children ? parentItem.children.filter(child => child.schemaName === schemaName).length : 0;
              const item = await parentItem.appendItem(null, {
                schemaName: schemaName,
                Title: schemaName + schemaIndex,
              });
              item.Src = { LinkID: parentItem.ID };
              item.focus();
              item.edit();
            }
          },
          F2: e => {
            if (this.focusElement) {
              this.focusElement.firstChild.disabled = true;
              this.focusElement.item.edit();
            }
          }
        };
        // //console.log('DETAILS KEYDOWN', e.keyPressed, this.focusElement, keydown[e.keyPressed]);
        if (this.focusElement && keydown[e.keyPressed]) {
          e.stopPropagation();
          e.preventDefault();
          keydown[e.keyPressed](e);
        }
      })
      .on('change', e => {
        child.elemTreeLi
        .class('item', child.className)
        .hasChildren(1 || child.hasChildren)
        .name(child.name)
        .attr('inherited', child.isInherited ? 'ja' : 'nee')
        .elemTreeDiv.text('').append(
          $('i', 'open').on('click', function elemTreeDivClick (e) {
            // anders opend het item
            e.stopPropagation();
            child.elemTreeLi.emit('toggle');
            // console.warn('CHILD', child, child.elemTreeLi);
            // child.elemTreeLi.elem.open = !child.elemTreeLi.elem.open;
          }),
          $('i', 'state').css('background-color', child.stateColor),
          $('i').class('icn folder', child.className)
          // .src(child.data.src),
          .css('color', child.schemaColor),
          child.elemTreeTitle = $('span').class('title row aco')
          // .caption(child.header0)
          .attr('schemaPath', ((child.data||{}).schemaPath || '').split(':').slice(0,-1).join(' :'))
          .append(
            $('span').class('aco').ttext(child.header0),
            $('i').class('icn',child.type),
          )
          // .attr('flag', '')
          .on('dblclick', e => {
            e.stopPropagation();
            elem.setAttribute('sel', child.IsSelected ^= 1);
          }),
          // $('i').class('icn',child.type),
          // $('i').class('icn flag', child.EndDateTime && !child.FinishDateTime ? 'task' : ''),
        );
      })
      .append(
        (child.elemTreeDiv = child.elemTreeLi.elemTreeDiv = $('summary'))
        .class('row', child.reltype, child.srcID == child.masterID ? 'derived' : '')
        .attr('isClass', child.isClass)
        .draggable()
        .attr('groupname', child.groupname)
        .on('click', e => this.select(child, e))
        .on('click', e => document.body.hasAttribute('tv') ? document.body.setAttribute('tv', 0) : null)
        .on('dblclick1', child.toggle)
        .on('moveup', e => this.move(e, -1))
        .on('movedown', e => this.move(e, +1))
      )
      .emit('change')
    }},
    close:{ value: function close(item) {
      if (item.elemTreeLi && item.elemTreeLi.elemTreeDiv) {
        item.elemTreeLi.elemTreeDiv.attr('open', '0');
        this.openItemsSave();
      }
    }},
    data:{
      get() {
      // return this.items;
    },
      set(data) {
      // this.show(data);
    },
    },
    ident:{ value: async function ident(e) {
      e.preventDefault();
      this.focusElement.previousElementSibling.open = true;
      $.link({
        name: 'Master',
        item: this.focusElement.item,
        to: this.focusElement.previousElementSibling.item,
        // current: this.focusElement.parentElement.item,
        index: 9999999,
        action: 'move',
      }).then(item => item.elemTreeLi.elemTreeDiv.scrollIntoView());
    }},
    outdent:{ value: function outdent(e) {
      e.preventDefault();
      const index = [...this.focusElement.parentElement.parentElement.children].indexOf(this.focusElement.parentElement) - 1;
      $.link({
        name: 'Master',
        item: this.focusElement.item,
        to: this.focusElement.parentElement.parentElement.item,
        // current: this.focusElement.parentElement.item,
        index: index + 1,
        action: 'move',
      }).then(item => item.elemTreeLi.elemTreeDiv.scrollIntoView());
    }},
    openItemsSave:{ value: function openItemsSave() {
      localStorage.setItem(
        'openItems',
        [...this.elem.getElementsByTagName('details')]
        .filter(e => e.item && e.open)
        .map(e => e.item.tag).join()
      )
      // //console.log([...this.elem.getElementsByTagName('details')], localStorage.getItem('openItems'));
    }},
    on:{ value: function on(selector, context) {
      this[selector] = context;
    }},
    select:{ value: async function select(item, e) {
      e.preventDefault();
      e.stopPropagation();
      if (item.data.src) {
        $('list').load(item.data.src);
        return;
      }
      if (item.data.onclick) {
        item.data.onclick();
        return;
      }
      if (item.data.href) {
        document.location.href = '#/' + item.data.href;
        return;
      }
      this.setFocusElement(item.elemTreeLi.elem, e);
      // console.error(item);
      $().execQuery({
        l: urlToId(item.data['@id']),
        v: urlToId(item.data['@id']),
      });
      return;
      $('view').show(item);
      $.clipboard.setItem([item], 'treeselect', '');
      const children = await item.children || [];
      console.log('children', item.header0, children);
      $().list(children, item.header0);
    }},
    show:{ value: function show(data) {
      [...arguments].forEach(item => {
        if (typeof item === 'object') {
          // console.log(item);
          item = item instanceof Item ? item : Item.get(item);
          this.listElem.append(this.childnode(item));
          //
          //
          // // //console.log(data);
          // this.item.children.push(data);
          // this.open(this.item);
          // this.setFocusElement(data.elemTreeLi);
          // //console.log('treevie.show',this, data);
          // this.DIV = data;
          // const listItemElement = data.elemTreeLi = this.topElement;
          // listItemElement.item = data;
          // data.elemTreeLi.elemTreeUl = this.topElement.createElement('UL', 'col');
          // //console.log(;)
          // this.DIV.open();
          // }
        }
      });
      return this;
    }},
    toggle:{ value: function toggle() {
      //console.log($(document.body).attr('tv'));
      $(document.body).attr('tv', $(document.body).attr('tv') ^ 1, true);
    }},
  });

  // importScript(currentScript.attributes.src.value.replace('aim', 'om'));

  function childObject(object, schemaname) {
    // console.log(schemaname);
    if (object) {
      const obj = Object.fromEntries(Object.entries(object).filter(([name, obj]) => typeof obj !== 'object'));
      obj.children = Object
      .entries(object)
      .filter(([name, obj]) => typeof obj === 'object')
      .map(([name, obj]) => Item.get(Object.assign({
        schema: schemaname,
        name: name,
        title: name.replace(/^\d+[-| ]/,'')
      }, childObject(obj, schemaname))));
      return obj;
    }
  }
  $()
  .on('load', async function omLoad () {
    const aimConfig = $.config;
    aimConfig.scope = 'openid profile name email admin.write';

    // console.error(1111, aimConfig.scope, aimConfig);

    const aimRequest = {
      scopes: aimConfig.scope ? aimConfig.scope.split(' ') : [],
    };
    aimClient = new Aim.UserAgentApplication(aimConfig);

    // console.log(aimClient);

    // aimClient.storage.clear();

    const dmsOptions = aimConfig.client;
    const authProvider = {
      getAccessToken: async () => {
        let account = aimClient.storage.getItem('aimAccount');
        if (!account){
          throw new Error(
            'User account missing from session. Please sign out and sign in again.'
          );
        }
        try {
          // First, attempt to get the token silently
          const silentRequest = {
            scopes: aimRequest.scopes,
            account: aimClient.getAccountByUsername(account)
          };
          const silentResult = await aimClient.acquireTokenSilent(silentRequest);
          return silentResult.accessToken;
        } catch (silentError) {
          // If silent requests fails with InteractionRequiredAuthError,
          // attempt to get the token interactively
          if (silentError instanceof Aim.InteractionRequiredAuthError) {
            const interactiveResult = await aimClient.acquireTokenPopup(aimRequest);
            return interactiveResult.accessToken;
          } else {
            throw silentError;
          }
        }
      }
    };

    dmsClient = Aim.Client.initWithMiddleware({authProvider}, dmsOptions);
    await dmsClient.loadConfig();

    // return;
    // dmsClient.api('/Contact(265090)').get().then(body => {
    //   console.log(body);
    // }).catch(err => {
    //   console.error(err);
    // })
    // return;

    await $().translate();

    async function signIn() {
      //  Login
      try {
        // Use AIM to login
        console.log('OPTIONS', aimRequest);

        const authResult = await aimClient.loginPopup(aimRequest);
        console.log('id_token acquired at: ' + new Date().toString());
        // Save the account username, needed for token acquisition
        aimClient.storage.setItem('aimAccount', authResult.account.username);
        document.location.reload();
      } catch (error) {
        console.log(error);
      }
    }

    // const aimAccount = aimClient.storage.getItem('aimAccount');

    // $(document.documentElement).class('app');
    $(document.body).append(
      $.his.elem.navtop = $('header')
      .id('navtop')
      .class('row top bar noselect np')
      .append(
        $.his.elem.menu = $('a').class('abtn icn menu').on('click', e => {
          if ($.his.elem.menuList && $.his.elem.menuList.style()) {
            $.his.elem.menuList.style('');
          } else {
            if ($.his.elem.menuList) $.his.elem.menuList.style('display:none;');
            $(document.body).attr('tv', document.body.hasAttribute('tv') ? $(document.body).attr('tv')^1 : 0)
          }
        }),
        $('a').class('title').id('toptitle').on('click', e => $.start() ),
        $('form').class('search row aco')
        .on('submit', e => {
          const value = $.searchValue = e.target.search.value;
          var result = value
          ? [...$.props.values()]
          .filter(item => item instanceof Item)
          .unique()
          .filter(item => item.header0 && value.split(' ').every(value => [item.header0,item.name].join(' ').match(new RegExp(`\\b${value}\\b`, 'i'))))
          : [];
          $().list(result);
          return false;
        })
        .append(
          $('input').name('search').autocomplete('off').placeholder('zoeken'),
          $('button').class('abtn icn search fr').title('Zoeken'),
        ),
        $('a').class('abtn icn dark').dark(),
      ),
      $('section')//.class('row aco main section_main')
      .id('section_main').append(
        $('section').tree().id('tree').css('max-width', $().storage('tree.width') || '200px'),
        $('div').seperator(),
        $('section').id('list').list(),
        $('section').class('row aco doc').id('doc'),
        $('div').seperator('right'),
        $('section').id('view').class('col aco apv printcol').css('max-width', $().storage('view.width') || '600px'),
        $('section')//.class('col aco apv info')
        .id('preview'),
        $('section').class('prompt').id('prompt').tabindex(-1).append(
          $('button').class('abtn abs close').attr('open', '').tabindex(-1).on('click', e => $().prompt(''))
        ),
      ),
      $('footer').statusbar(),
    ).messagesPanel();
    // await $().translate();


    // console.log(aimClient.account, sessionStorage);


    if (aimConfig.info) {
      $('toptitle').text(document.title = aimConfig.info.title).title([aimConfig.info.description,aimConfig.info.version,aimConfig.info.lastModifiedDateTime].join(' '));
    }

    // console.warn(2222, aimConfig);

    // aimConfig.ref.home = 'https://github.com/schiphol-nl/schiphol-nl.github.io/wiki';
    // aimConfig.ref.home = 'https://github.com/aliconnect/sdk/wiki';
    // aimConfig.ref.home = aimConfig.ref && aimConfig.ref.home ? aimConfig.ref.home : 'https://aliconnect.nl/sdk/wiki';
    if (!document.location.search && aimConfig.ref && aimConfig.ref.home) {
      if (document.location.hostname.match(/localhost$/)) {
        // console.error(document.location.hostname, document.location.hostname.match(/localhost$/));
        aimConfig.ref.home = aimConfig.ref.home.replace(/https:\/\/github.com/, 'http://github.localhost');
      }

      window.history.replaceState('page', '', '?l=' + urlToId(aimConfig.ref.home));
    }

    var aimAccount = JSON.parse(aimClient.storage.getItem('aimAccount'));
    // var aimAccount = null;

    if (aimAccount) {
      $.his.elem.navtop.prompts(...$.const.prompt.menu.prompts).append(
        $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
      );
      // await dmsClient.api('/').get().then(body => $.extend(aimConfig, body));
      $().schemas(aimConfig.components.schemas)
      if (aimConfig.menu) {
        $().tree(...childObject(aimConfig.menu).children);
      }

      async function treeItem(url) {
        const item = await $(url).details()
        $().tree(item);
        return item;
      }


      // await dmsClient.api('/').get().then(e => console.log(999, e.body));
      // return;

      // console.log(1, $().schemas());

      const sub = aimAccount.sub;
      dmsClient.headers = {
        'OData-Version': '3.0',
        'Aim-Version': '1.0',
      };

      // console.log('Aangemeld', dmsClient.headers, aimAccount, sub);

      // dmsClient.api('/me').select('CompanyName,Surname').get().then(body => {
      //   console.log('MEEEE', body);
      // }).catch(err => console.error);

      // $.his.items.sub = await $(`https://dms.aliconnect.nl/Contact(${aimAccount.sub})`).details();
      $.his.items.sub = await dmsClient.api('/me').get();
      // $.his.items.aud = await dmsClient.api(`/Company(${aimClient.clientId})`).get();
      // return console.log('ME', $.his.items.sub, $.his.items.aud);
      //
      $().tree($.his.items.sub);


      // return;
      // await aimClient.api(`/`).query('request_type','visit').get().then(body => $.his.items = body);
      // $.his.elem.account.item($.user, 'accountElem');
      // $.user.emit('change');
      // if (aimConfig.aud) {
      //   $().tree($.his.items.aud = await $(`/Company(${aimConfig.aud})`).details());
      //   $.his.elem.menu.showMenuTop($({tag: `Company(${aimConfig.aud})`}));
      // }
      if ('Notification' in window) {
        var permission = Notification.permission;
        if (Notification.permission === 'default') {
          $.his.elem.navtop.append(
            $('a').class('abtn').text('Notifications').on('click', e => Notification.requestPermission())
          )
        }
      }
    } else {
      $.his.elem.navtop.append(
        // $('div').id('g_id_onload')
        // .attr('data-client_id', '916030731619-t989crc0f9ilh9kvoivapg7216gijtcb.apps.googleusercontent.com')
        // .attr('data-login_uri', 'https://login.aliconnect.nl/maxvankampen/login/callback.php')
        // .attr('data-auto_prompt', 'false'),
        // $('div').class('g_id_signin')
        // .attr('data-type', 'standard')
        // .attr('data-size', 'large')
        // .attr('data-theme', 'outline')
        // .attr('data-text', 'sign_in_with')
        // .attr('data-shape', 'rectangular')
        // .attr('data-logo_alignment', 'left'),
        //
        $('button').class('abtn login').text('Aanmelden').on('click', e => signIn()),
      );
      // <script src="https://accounts.google.com/gsi/client" async defer></script>
    }
  })


  // console.log(
  //   Object.getOwnPropertyDescriptors(Listview),
  //   Object.getOwnPropertyDescriptors(Listview.prototype),
  // );
  //
  //

  // .on('logout', function () {
  //     // document.location.href='/om/?prompt=logout';
  //   }),
  //   newlogin() {
  //     // document.location.reload();
  //   },
  //   init() {
  //     console.log('OM INIT');
  //     return;
  //     $().extend({
  //       menu: {
  //         account: {
  //           My_account_profile: { href: `#/Account(${$().auth.id ? $().auth.id.sub : null})` },
  //           My_contact_profile: { href: `#/Contact(${$().auth.id ? $().auth.id.sub : null})` },
  //           Logout: { href: '#?prompt=logout' },
  //           Print: { onclick() {
  //             $().Aliconnector.printurl('https://aliconnect.nl');
  //           } },
  //           Show: { onclick() {
  //             $().Aliconnector.show();
  //           } },
  //           Hide: { onclick() {
  //             $().Aliconnector.hide();
  //           } },
  //           filedownload: { onclick() {
  //             $().Aliconnector.filedownload('http://alicon.nl/shared/test/test.docx');
  //           } },
  //         },
  //         config: {
  //           Upload_datafile: { href: '#?prompt=upload' },
  //           // $().Upload ? { label: 'Upload datafile', href: '#/Upload/show()' } : null,
  //           // { label: 'Test', onclick: function (e) {
  //           // 	new $().HttpRequest($().config.$, {path:'/test/tester()'}, function (e){console.log(e.responseText);})
  //           // } },
  //           // { label: 'Test1', onclick: function (e) {
  //           // 	new $().HttpRequest($().config.$, {path:'/test1/tester()'}, function (e){console.log(e.responseText);})
  //           // } },
  //           // { label: 'Test2', onclick: function (e) {
  //           // 	new $().HttpRequest($().config.$, {path:'/test2/tester()'}, function (e){console.log(e.responseText);})
  //           // } },
  //           Importeer_geselecteerde_mail_uit_outlook : $().aliconnectorIsConnected ? { href: '#/outlook/import/mail()' } : null,
  //           Importeer_contacten_uit_outlook: $().aliconnectorIsConnected ? { href: '#/outlook/import/mail()' } : null,
  //           Create_user: { href: '#?prompt=createAccount' },
  //           // { label: 'Create_domain', href: '#?prompt=createDomain' },
  //           Configuration: 1 || $().Account.scope.split(' ').includes('admin:write') ? { href: '#?prompt=config_edit' } : null,
  //           Sitemap: 1 || $().Account.scope.split(' ').includes('admin:write') ? { href: '#?prompt=sitemap' } : null,
  //           Get_API_Key: { href: '#?prompt=getapikey' },
  //           Get_Aliconnector_Key: { href: '#?prompt=Get_Aliconnector_Key' },
  //         }
  //       },
  //     });
  //     // if (!$().auth.id) document.location.href='?prompt=logout';
  //     // new $().NavLeft();
  //   },
  //   click(e) {
  //     // if ($().get.prompt && !$('colpanel').contains(e.target)) {
  //     //   $().request('?prompt=clean');
  //     // }
  //   }
  // });

})();

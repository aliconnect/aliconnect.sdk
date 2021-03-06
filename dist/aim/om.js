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
            const focusElement = e && e.target && e.target.is && e.target.is.srcEvent ? e.target.is.srcEvent.path.find(el => el.item) : this.focusElement;
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
            console.log(e.target.parentElement);
      const itemElem = e.path.find(el => el.item);
      this.setFocusElement(itemElem);
      if (this.focusElement) {
        e.preventDefault();
        e.stopPropagation();
        const parent = this.focusElement.parentElement.item;
        const index = [...this.focusElement.parentElement.children].indexOf(this.focusElement) - 1;
                                                $.link({
          name: 'Master',
          item: this.focusElement.item,
          to: parent,
                    index: index + offset,
          action: 'move',
        })
        .then(item => {
          console.log('move done', item, item.elemTreeLi.elem);
          this.setFocusElement(item.elemTreeLi.elem);
        });
              }
    }},
    moveUp:{ value: function moveUp(e) {
      this.move(e, -1);
    }},
    moveDown:{ value: function moveDown(e) {
      this.move(e, 1);
    }},
    setFocusElement:{ value: function setFocusElement(newFocusElement, e) {
            const elem = this.elem;
      const list = [...elem.getElementsByClassName('item')].filter(elem => elem.item);
      if (e) {
        e.preventDefault();
      }
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
                        if (newFocusElement) {
              $(newFocusElement).emit('focusselect');
              if (newFocusElement.item) {
                $.clipboard.setItem([newFocusElement.item], 'checked', '');
              }
            }
                                  }
        }
        if (this.focusElement && this.focusElement.removeAttribute) {
          this.focusElement.removeAttribute('focus');
        }
        if (newFocusElement instanceof aim.Elem) {
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
            if (elem && elem.is.item()) {
        const item = elem.is.item();
        $('view').show(item);
                return;
        if (elem && elem.is.item() && elem !== this.selectElement) {
                    this.selectElement = elem;
          $('view').show(elem.is.item());
                  }
        return elem;
      }
          }},
    selectFocusElement:{ value: function selectFocusElement(newFocusElement) {
      if (newFocusElement) {
                const e = window.event;
        this.setFocusElement(newFocusElement, e);
        clearTimeout(this.arrowTimeout);
        this.arrowTimeout = setTimeout(() => this.setSelectElement(this.focusElement), e.type === 'keydown' ? 200 : 0);
                return;
              }
    }},
  });
  function Listview (selector) {
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
                                        shift_alt_ArrowDown: e => this.moveDown(e),
        shift_alt_ArrowUp: e => this.moveUp(e),
        ctrl_ArrowDown: e => this.moveDown(e),
        ctrl_ArrowUp: e => this.moveUp(e),
        ArrowRight: e => {
                  },
        ArrowLeft: e => {
                                                          },
      },
    });
      };
  Object.defineProperties(Listview.prototype = new TreeListview, {
    activeFilterAttributes:{ value: {}},
    calendar:{ value: function () {
      $('div').class('aco').parent(this.div.text(''))
      .calendar(this.itemsVisible)
    }},
    chart:{ value: function () {
      $('div').class('aco').parent(this.div.text('')).chart(this.itemsVisible)
                                                          }},
    clickfilter:{ value: function (e) {
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
      searchParams.set('f',btoa(JSON.stringify(activeFilterAttributes)));      window.history.pushState('page', 'PAGINA', '?' + searchParams.toString() );
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
    elementSelect:{ value: function (el) {
            if (this.elSelect) this.elSelect.removeAttribute('selected');
      if (!el) return;
      this.setFocusElement(el);
      (this.elSelect = el).setAttribute('selected', '');
    }},
    filtersOpen:{ value:{}, writable: true },
    filterAttributes:{ value:{}, writable: true },
    fill:{ value: function () {
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
    ganth:{ value: function () {
      $('div').class('aco').parent(this.div.text('')).ganth(this.itemsVisible)
    }},
    go:{ value: function () {
      return $.Go.create({ el: listItemElement, data: this.items });
    }},
    get:{ value:{}},
    getProperties:{ value: function () {
      const schemaNames = this.itemsVisible.map(item => item.schemaName).unique();
      const schemas = [...Object($().schemas()).entries()].filter(([schemaName, schema]) => schemaNames.includes(schemaName));
      const schemaKeys = schemas.map(([schemaName, schema]) => schemaName);
      let properties = [].concat(
        'Tagname',
        'LinkTagname',
        'header0',
        'header1',
        'header2',
                        ...schemas.map(([schemaName, schema]) => schemaName), ...schemas.filter(([key, schema]) => !['hidden'].includes(schema.format)).map(([key, schema]) => Object.keys(schema.properties)),
        'ID',
        'level',
      ).unique();
      properties = properties.filter(name => this.itemsVisible.some(item => item.data[name]));
      return properties;
    }},
    listnode:{ value: function (item) {
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
                                                                              )
            )
            .on('mouseenter', function (e) {
              const rect = this.getBoundingClientRect();
                                          li.elemStateUl.css('top', Math.min(rect.top, window.innerHeight-li.elemStateUl.elem.clientHeight-20)+'px').css('left', rect.left+'px');
            }),
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
                            .attr('hasattach', item.hasAttach)
              .attr('type', item.type)               .append(
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
                                  }},
    maps:{ value: async function () {
                        this.div.text('').append(
        this.mapElem = $('div').class('googlemap').css('width:100%;height:100%;'),
      );
      const maps = await $.his.maps();
      const mapOptions = {
        zoom: 10,
        center: { lat: 51, lng: 6 },        mapTypeId: maps.MapTypeId.ROADMAP,
                                                                                                                                                                                        styles: $().maps.styles,
      };
      const map = new maps.Map(this.mapElem.elem, mapOptions);
                                                                        var bounds = new maps.LatLngBounds();
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
                    icon: {
                                                                                                path: maps.SymbolPath.CIRCLE,
            fillColor: 'red',
            fillOpacity: .6,
            scale: 10,             strokeColor: 'white',
            strokeWeight: .5
          },
          icon: {
                                                            path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
            scale: (item.scale || 1)/2,
            fillColor: item.color || "blue",
            fillOpacity: 0.6,
            strokeWeight: 0,
            strokeColor: 'white',
            rotation: 0,
            anchor: new maps.Point(15, 30),
          },
                  });
                marker.addListener('click', e => $('view').show(item));
        bounds.extend(marker.getPosition());
      });
            map.fitBounds(bounds);
            if (maps.e) {
        maps.e.addListenerOnce(map, 'bounds_changed', function () { this.setZoom(Math.min(15, this.getZoom())); });
      }
          }},
    refilter:{ value: function () {
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
                                                                                colpage.item.model2d();
              }),
              $('li').class('abtn model3d').text('3D').on('click', e => {
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
                ['SPAN', '', field.cnt],              ]);
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
    rewrite:{ value: function (viewType) {
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
                                                                                                                                                                                                                                                              ));
      this.fill();
    }},
    select:{ value: function (item, e) {
                        this.setFocusElement(item.elemListLi.elem, e);
      $().execQuery({
        v: urlToId(item.data['@id']),
      });
                }},
    set:{ value: function (set) {
                                                      for (var name in set) if (this.get[name] != set[name]) break; else name = null;
      if (!name) return;
                        Object.assign(this.get, set);
                        this.schema = this.get.schema || ($.getItem(this.get.folder) ? $.getItem(this.get.folder).schema : null) || this.get.folder;
      this.childClasses = $.config.components.schemas[this.schema] && $.config.components.schemas[this.schema].childClasses ? $.config.components.schemas[this.schema].childClasses : [this.schema];
                  for (var name in this.get) if (!this.get[name]) delete this.get[name];
            if (this.get.folder && Number(this.get.folder) && $.getItem(this.get.folder)) {
        $.getItem(this.get.folder).focus();
        if ($.getItem(this.get.folder).children.length) {
          this.show($.getItem(this.get.folder).children);
          return
        }
      }
      this.show(this.data[this.get.Title] || []);
            if (!this.get.q) return;
            var get = this.get;
      this.loadget = {};
      "folder, filter, child, q, select".split(", ").forEach(function (name) { if (get[name]) this.loadget[name] = get[name]; });
      delete this.loadget.select;
      new $.HttpRequest($.config.$, 'GET', this.loadget, e => {
                this.show(e.body.value);
      }).send();
                            }},
    show:{ value: async function (items, path) {
      if (Array.isArray(this.items = (await items) || [])) {
        this.viewMap = new Map();
        this.title = path || '';
        this.tag = ((this.items.url||'').match(/\w+\(\d+\)/)||[''])[0];
        if (this.items.url) {
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
                                                        this.items = this.items.filter(Boolean).map(item => item instanceof Item ? item : Item.get(item));
                this.hasDateData = this.items.some(item => item.data.EndDateTime && item.data.StartDateTime);
                this.hasChartData = this.items.some(item => item.data.data && item.data.key);
        this.hasMapsData = this.items.some(item => item.data.Location);
        this.hasModelData = this.items.some(item => item.data.Title && item.data.linkto);
                this.items.forEach((row, i) => {
                                        row.createListRowElement = row.createListRowElement || Item.createListRowElement;
          if (row['@id'] && Item(row['@id'])) row = this.items[i] = Item(row['@id']);
          const properties = row.schema.properties || {};
          const filternames = Object.entries(properties).filter(([name,prop])=>prop.filter);
          row.filterfields = Object.fromEntries(row.filternames.filter(name => row[name]).map(name => [name,row[name]]));
                                                            row.filterfields.schemaName = row.schemaName;
          row.filterfields.hasAttach = row.hasAttach ? 'ja' : 'nee';
                    row.filterfields.state = row.state;
                                                                                                    $.config.components = $.config.components || {};
          $.config.components.schemas = $.config.components.schemas || {};
          var cfgclass = $.config.components.schemas[row.schema] || {};
          var filterfields = {};
          row.filtervalues = [];
          for (var attributeName in row.filterfields) {
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
    sortby:{ value: function (sortname) {
      this.sortdir = this.sortname == sortname ? -this.sortdir : 1;
      this.sortname = sortname;
      console.debug(sortname);
      this.btns.sort.className = this.sortdir == 1 ? '' : 'asc';
      this.items.sort(function (a, b) {
        return this.sortdir * String(a[this.sortname]).localeCompare(String(b[this.sortname]), {}, 'numeric');
      }.bind(this));
      refilter();
          }},
    sortlist:{ value: function (a, b) {
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
            if (a.lastvisitDT && !b.lastvisitDT) return -1;
      if (!a.lastvisitDT && b.lastvisitDT) return 1;
      if (a.lastvisitDT && b.lastvisitDT) {
        if (a.lastvisitDT.substr(0, 10) < b.lastvisitDT.substr(0, 10)) return -1;
        if (a.lastvisitDT.substr(0, 10) > b.lastvisitDT.substr(0, 10)) return 1;
      }
      if (a.accountprice && !b.accountprice) return -1;
      if (!a.accountprice && b.accountprice) return 1;
                                          if (a.EndDateTime && b.EndDateTime) {
        if (a.EndDateTime < b.EndDateTime) return -1;
        if (a.EndDateTime > b.EndDateTime) return 1;
      }
                  if (a.StartDateTime && b.StartDateTime) {
        if (a.StartDateTime < b.StartDateTime) return -1;
        if (a.StartDateTime > b.StartDateTime) return 1;
      }
                              if (a.searchname && b.searchname) {
        var awords = a.searchname.match(/\w+/g),
        bwords = b.searchname.match(/\w+/g),
        ia = 999,
        ib = 999,
        l = $.his.search.value.length;
        for (var i = 0, word; word = awords[i]; i++) {
                    if (word.indexOf($.his.search.value) != -1) ia = Math.min(ia, word.indexOf($.his.search.value) + word.length - l);
                            }
        for (var i = 0, word; word = bwords[i]; i++) {
                    if (word.indexOf($.his.search.value) != -1) ib = Math.min(ib, word.indexOf($.his.search.value) + word.length - l);
                                                          }
                                                if (ia < ib) return -1;
        if (ia > ib) return 1;
      }
      return 0;
    }},
    table:{ value: function () {
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
                        $.clipboard.setItem([item], 'checked', '');
      clearTimeout(this.arrowTimeout);
      this.arrowTimeout = setTimeout(() => this.select(item), e && e.type === 'keydown' ? 500 : 0);
      $().view(item);
            return;
      if (newFocusElement) {
                const e = window.event;
        this.setFocusElement(newFocusElement, e);
                return;
              }
    }},
  });
  function Treeview(selector) {
    this.construct(...arguments);
    selector.class('col aco atv noselect np')
    .contextmenu(this.menu)
    .append(
      $('nav', 'row top abs btnbar np').append(
        $('button').class('abtn r popout').on('click', e => {
          var url = document.location.origin;
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
                              $('section').tree().class('aco').style('max-width:auto;'),
                            $('footer').statusbar(),
            );
            (async function () {
              await $().translate();
              await $().getApi(document.location.origin+'/api/');
              await $().login();
              if (aim().menuChildren) {
                $().tree(...aim().menuChildren);
              }
                                          $().tree(aim.user.data);
            })()
          }
        }),
        $('button').class('abtn pin').on('click', e => {
          $(document.body).attr('tv', $(document.body).attr('tv') ? null : 0);
        }),
              ),
      om.navleft = this.listElem = $('div').id('om-navleft').class('col aco oa list'),
    );
    console.log(om.navleft);
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
              },
      focus(e) {
        self.setFocusElement(this.elemTreeLi);
        return;
                return;
                                if (self.focusElement && self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.removeAttribute('focus');
                  }
                                                                if (!e || e.type !== 'mousemove') {
          $.scrollIntoView(self.focusElement.elemTreeLi.elemTreeDiv.elem);
        }
        if (self.focusElement.elemTreeLi) {
          self.focusElement.elemTreeLi.setAttribute('focus', '');
                                                                                                                                                                                                                                                                                                                                                  }
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
                this.setSelect();
        $.attr(this, 'treeselect', '');
        document.location.href = `#/${this.tag}/children/id/${btoa(this['@id'])}?$select=${$.config.listAttributes}&$filter=FinishDateTime+IS+NULL`;
                              },
      close(e) {
        if (this.elemTreeLi.elemTreeDiv) {
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
                                                                                                                        selitems: function () {
                $.clipboard.items.forEach(function (item) {
          $.clipitems.push(item);
          e.elemTreeLi.setAttribute('checked', e.type);
        });
      },
      keydown: {
                                                                        ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),        shift_ArrowUp: e => this.setFocusElement(this.getPreviousElement(), e),        ArrowDown: e => this.setFocusElement(this.getNextElement(), e),        shift_ArrowDown: e => this.setFocusElement(this.getNextElement(), e),        shift_alt_ArrowDown: e => this.moveDown(e),
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
                    if (self.focusElement) {
            const item = self.focusElement.item;
                                    if (elem.open) return elem.open = 1;            elem.keydown.ArrowDown(e);
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
                    if (document.activeElement === document.body && self.focusElement) {
            const focusItem = self.focusElement.item;
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
                                                                                                                                                async Insert(e) {
                    if (document.activeElement === document.body && self.focusElement) {
            e.preventDefault();
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
      }
  Object.defineProperties(Treeview.prototype = new TreeListview, {
    childnode:{ value: function childnode(child) {
      return (child.elemTreeLi = $('details'))
      .open($.his.openItems.includes(child.tag))
      .item(child, 'treeview')
      .on('toggle', async e => {
                                                if (e.target.open) {          let children = await child.children || [];
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
                        const keydown = {
          Space: e => {
            if (this.focusElement) {
              this.focusElement.item.select();
            }
          },
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
                                                                                                                                            ArrowRight: e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.focusElement) {
              this.focusElement.open = true;
            }
                      },
          ctrl_Enter: e => {
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
                        if (document.activeElement === document.body && self.focusElement) {
              const focusItem = self.focusElement.item;
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
                                                                                                                                                                                    async Insert(e) {
                        if (document.activeElement === document.body && self.focusElement) {
              e.preventDefault();
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
                        e.stopPropagation();
            child.elemTreeLi.emit('toggle');
                                  }),
          $('i', 'state').css('background-color', child.stateColor),
          $('i').class('icn folder', child.className)
                    .css('color', child.schemaColor),
          child.elemTreeTitle = $('span').class('title row aco')
                    .attr('schemaPath', ((child.data||{}).schemaPath || '').split(':').slice(0,-1).join(' :'))
          .append(
            $('span').class('aco').ttext(child.header0),
            $('i').class('icn',child.type),
          )
                    .on('dblclick', e => {
            e.stopPropagation();
            elem.setAttribute('sel', child.IsSelected ^= 1);
          }),
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
          },
      set(data) {
          },
    },
    ident:{ value: async function ident(e) {
      e.preventDefault();
      this.focusElement.previousElementSibling.open = true;
      $.link({
        name: 'Master',
        item: this.focusElement.item,
        to: this.focusElement.previousElementSibling.item,
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
            $().execQuery({
        l: urlToId(item.data['@id']),
        v: urlToId(item.data['@id']+'/children?$filter=FinishDateTime eq NULL&$select='+aim.config.listAttributes),
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
                    item = item instanceof Item ? item : Item.get(item);
          this.listElem.append(this.childnode(item));
                                                                                                                                                    }
      });
      return this;
    }},
    toggle:{ value: function toggle() {
            $(document.body).attr('tv', $(document.body).attr('tv') ^ 1, true);
    }},
  });
  Object.defineProperties(aim.prototype, {
    tree: {value: function tree(selector) {
      return this.getObject(arguments.callee.name, Treeview, [...arguments]);
    }},
    list: {value: function (selector) {
      return this.getObject(arguments.callee.name, Listview, [...arguments]);
    }},
  });
  Object.assign(aim, {
    ObjectManager,
    Listview,
    Treeview,
  })
  function ObjectManager() {
    $().on('load', e => this.create());
  }
  Object.defineProperties(ObjectManager.prototype, {
    create: {value: function () {
      console.log('a', this);
      $(document.body).append(
        this.navtop = $.his.elem.navtop = $('header').id('om-nav-top').class('row top bar noselect np')
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
        $('section').id('om-main').append(
          this.tree = $('section').tree().id('tree').css('max-width', $().storage('tree.width') || '200px'),
          $('div').seperator(),
          this.list = $('section').id('list').list(),
          this.doc = $('section').class('row aco doc').id('doc'),
          $('div').seperator('right'),
          this.page = $('section').id('view').class('col aco apv printcol').css('max-width', $().storage('view.width') || '600px'),
          $('section').id('preview'),
          this.prompt = $('section').class('prompt').id('prompt').tabindex(-1).append(
            $('button').class('abtn abs close').attr('open', '').tabindex(-1).on('click', e => $().prompt(''))
          ),
        ),
        $('footer').statusbar(),
      ).messagesPanel();
    }},
    init: {enumerable: true, value: async function () {
      console.log();
      const name = document.currentScript.getAttribute('name') || 'om';
      const om = this[name] = $(name, new ObjectManager);
      const client_id = $.config.client_id;
      const aimConfig = {
        client_id: client_id,
        scope: 'openid profile name email admin.write',
      };
      aimClient = new aim.UserAgentApplication(aimConfig);
      const aimRequest = {
        scopes: aimConfig.scope.split(' '),
      };
      console.log('aimConfig', aimConfig);
            if (aimConfig.access_token) {
        aimClient.setAccessToken(aimConfig.access_token);
      }
      if (aimConfig.id_token) {
        aimClient.setIdToken(aimConfig.id_token);
      }
      let dmsConfig = {
        client_id: client_id,
        servers: [{url: 'https:      };
      const authProvider = {
        getAccessToken: async () => {
          let account = aimClient.storage.getItem('aimAccount');
          if (!account){
            throw new Error(
              'User account missing from session. Please sign out and sign in again.'
            );
          }
          try {
                        const silentRequest = {
              scopes: aimRequest.scopes,
              account: aimClient.getAccountByUsername(account)
            };
            const silentResult = await aimClient.acquireTokenSilent(silentRequest);
            return silentResult.accessToken;
          } catch (silentError) {
                                    if (silentError instanceof aim.InteractionRequiredAuthError) {
              const interactiveResult = await aimClient.acquireTokenPopup(aimRequest);
              return interactiveResult.accessToken;
            } else {
              throw silentError;
            }
          }
        }
      };
      const dmsClient = aim.Client.initWithMiddleware({authProvider}, dmsConfig);
      dmsConfig = await dmsClient.loadConfig();
      $().schemas(dmsConfig.components.schemas);
      console.log(dmsConfig);
      await $().translate();
      async function signIn() {
                try {
                    console.log('OPTIONS', aimRequest);
          const authResult = await aimClient.loginPopup(aimRequest);
          console.log('id_token acquired at: ' + new Date().toString());
                    aimClient.storage.setItem('aimAccount', authResult.account.username);
          document.location.reload();
        } catch (error) {
          console.log(error);
        }
      }
            $(document.body).om();
      if (aimConfig.info) {
        $('toptitle').text(document.title = aimConfig.info.title).title([aimConfig.info.description,aimConfig.info.version,aimConfig.info.lastModifiedDateTime].join(' '));
      }
                        if (!document.location.search && aimConfig.ref && aimConfig.ref.home) {
        if (document.location.hostname.match(/localhost$/)) {
                    aimConfig.ref.home = aimConfig.ref.home.replace(/https:\/\/github.com/, 'http:        }
        window.history.replaceState('page', '', '?l=' + urlToId(aimConfig.ref.home));
      }
      var aimAccount = JSON.parse(aimClient.storage.getItem('aimAccount'));
      if (aimAccount) {
        $.his.elem.navtop.prompts(...$.const.prompt.menu.prompts).append(
          $.his.elem.account = $('a').class('abtn account').caption('Account').href('#?prompt=account').draggable(),
        );
                if (aimConfig.menu) {
          $().tree(...childObject(aimConfig.menu).children);
        }
        async function treeItem(url) {
          const item = await $(url).details();
          $().tree(item);
          return item;
        }
        const sub = aimAccount.sub;
        dmsClient.headers = {
          'OData-Version': '3.0',
          'aim-Version': '1.0',
        };
        const user = $.his.items.sub = await dmsClient.api('/me').get();
        console.log('USER', user);
                                $().tree(user);
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
                                                                                                                                  $('button').class('abtn login').text('Aanmelden').on('click', e => signIn()),
        );
              }
    }},
  })
  function childObject(object, schemaname) {
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
})();
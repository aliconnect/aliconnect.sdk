Abis = Object.setPrototypeOf({
  async init() {
    const {num} = Format;
    const cssPrintUrl = 'https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css';
    function round(n,dec = 4) {
      dec = Math.pow(10,dec);
      return Math.round(n * dec) / dec;
    }
    const {Client,Prompt,Statusbar,config} = this;
    config.serviceRoot = config.serviceRoot || document.location.origin + '/v1';
    config.authRoot = config.authRoot || document.location.origin + '/oauth';
    var {clientId,serviceRoot,socketRoot,authRoot} = config;
    // console.debug({socketRoot})
    // console.debug(333, {clientId,serviceRoot,socketRoot,authRoot});
    const url = new URL(document.location);
    const {hostname} = url;
    const aliconnectConfig = await Aim.fetch(serviceRoot+'/config').query({hostname,clientId,client_id}).get();
    config(aliconnectConfig);
    var {authRoot,tutorial} = config;
    var {clientId,client_id,info,definitions,options,tags,scope} = config;

    scope = scope || 'openid profile name email medewerker admin';
    const authClient = Client.create({serviceRoot: authRoot,scope,client_id});
    const {getAccessToken,account,login} = authClient;
    const abisClient = Client.create({serviceRoot,client_id,getAccessToken,scope});
    var {serviceRoot} = config;
    const serviceClient = Client.create({serviceRoot,client_id,getAccessToken,scope});
    if (!socketRoot) {
      const url = new URL(document.location.origin);
      url.port = 444;
      socketRoot = url.origin;
    }
    // console.debug({socketRoot})
    const socketClient = Client.create({serviceRoot: socketRoot,getAccessToken});
    const {api} = abisClient;
    const {send} = socketClient;
    await socketClient.connect();
    if (url.searchParams.get('office')) {
      await Web.require('https://appsforoffice.microsoft.com/lib/1/hosted/office.js');
      try {
        Office.initialize = function (reason) {
          if (Office.context.requirements.isSetSupported('WordApi', 1.1)) {
            console.log('Office ok');
            Web.officeWord = true;
          } else {
            document.getElementById('aPage').innerText = 'This code requires Word 2016 or greater.';
          }
        };
      } catch (err) { }
    }
    // Popup.init();
    function signOut(){}
    Prompt.set({
      account: elem => elem.parent(elem.parentElement.text('')).append(
        $('nav').append(
          $('button').class('icn-back').on('click', e => elem.remove()),
          $('span'),
          // $('button').class('icn-next').on('click', e => Prompt.open('test2')),
        ),
        $('div').append(
          $('h1').text('Gebruiker'),
          $('div').append($('small').text(account.oid)),
          $('button').class('icn-login').text('Aanmelden').on('click', event => {
            login();
            /** @todo ophalen account informatie */
            // const user = await dmsClient
            // .api('/me')
            // // .select('id,displayName,mail,userPrincipalName,mailboxSettings')
            // .select('id,name,accountname')
            // .get();
            // console.log(user);
            // aimClient.store('aimUser', JSON.stringify(user));
            // $('.account span.user').text(user.name || user.accountname);

          }),
          $('button').class('icn-sign_out').text('Afmelden').on('click', signOut),
          // $('div').text('test1'),
        ),
      ),
    });
    // console.log(Object.assign({},config));
    Web.treeview = new Treeview;
    Web.listview = new Listview;

    function Table(options) { Object.assign(this,options) };
    Object.assign(Table, {
      clienttable(rows, cols, options = {}) {
        // console.log(cols);
        return $('table').style('width:100%;').append(
          $('thead').append(
            $('tr').append(
              Object.keys(cols).map(title => $('th').text(title))
            )
          ),
          $('tbody').append(
            rows.map(row => $('tr').style(options.style ? options.style(row) : null).append(
              Object.values(cols).map(fn => fn(row)),
              // cols.map(col => $('td').text((col.calc || String)(row[col.name])).style(col.style||'')),
            ))
          )
        );
      },
    });

    let focusElement;
    let selectElement;
    function select(el){
      console.log('select', el);
      if (selectElement) selectElement.removeAttribute('select');
      selectElement = el || selectElement;
      selectElement.setAttribute('select', '');
    }
    function summary(item){
      return $('summary').append(
        $('i'),
        $('a').text(item.headers[0]).on('click', async (event) => {
          focus(event.target.parentElement.parentElement);
          console.log(item.api('/children').get())
          const children = await api(`/client(${client_id})/item(${item.id})/children`).get();
          console.log(event,children);
          Web.listview.render(children.value);
        }),
      );
    }
    function childnode(item){
      // console.log(item);
      item = Item.get(item);
      // console.log(item);
      // child = Item.get(child);
      return $('details').attr('haschildren','').on('toggle', async (event) => {
        if (event.target.open) {
          const el = event.target;//event.target.querySelector('details');
          if (el.children.length === 1) {
            const children = await item.api('/children').get();
            // const children = await api(`/client(${client_id})/item(${item.id})/children`).get();
            // console.log(children);
            $(el).append(
              children.value.map(childnode),
            );
          }

        }
        // console.log(event, event.target.open);
      }).append(
        summary(item),
        // $('div'),
      );
    }
    function startTutorial(steps, nr = 1){
      if (nr > 5) nr = 1;
      const step = steps.shift();
      if (step) {
        const {name,skip,description,delay} = step;
        if (skip && document.querySelector(skip)) return startTutorial(steps, nr);
        // setTimeout(function showhint(){
          // const nr = Math.round((0.5+Math.random()*3));
          // console.log(nr);
          const hintElem = $('div').parent(document.body).class('tutorial_hint')
          .style(`--message-image: url(https://aliconnect.nl/assets/img/message-woman-left-${nr}.png);`
          )
          .text(description)
          .animate([
            {
              transform: 'scale(80%)',
              opacity: 0,
            },
            {
              transform: 'scale(100%)',
              opacity: 1,
            },
          ], {
            duration: 1000,
            easing: 'ease-in-out',
            fill: 'forwards',
          });
          if (name) {
            (function showname(){
              const elem = $(name);
              if (!elem) return setTimeout(() => showname(), 1000);
              // console.log(name, elem);
              const highlightElem = elem.highlight(step).on('click', event => {
                highlightElem.remove();
                hintElem.remove();
                elem.click();
                setTimeout(() => startTutorial(steps, nr + 1), delay || 1000);
              });
            })()
          } else {
            const close = () => {
              window.removeEventListener('click', close, true);
              hintElem.remove();
              setTimeout(() => startTutorial(steps, nr + 1), delay || 1000);
            }
            window.addEventListener('click', close, true);
          }
        // }, delay || 1000);
      } else {
        sessionStorage.setItem('tutorial', 1);
      }
    }

    function readBinary(file) {
      return new Promise((resolve,fail) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        // reader.onprogress = e => console.log(e);
        reader.onload = e => resolve(e.target.result);
      })
    }
    async function importFiles(files) {
      if (!Aim.config.import) return;
      const progress = Web.progress('Import');
      // const messageElem = $('span').parent('footer>.main');
      // const progressElem = document.querySelector('footer>progress');
      let allrows = [];
      files = Array.from(files);
      for (var file of files) {

        console.debug('import:', file.name);
        // $('span.main').text('import:', file.name);
        const importName = Object.keys(Aim.config.import).find(key => file.name.match(key));
        if (importName) {
          const fileConfig = Aim.config.import[importName];
          await require('lib/aim/js/xlsx.js');
          progress.text('Wachten op', file);
          const result = await readBinary(file);
          const workbook = XLSX.read(result, { type: 'binary' });
          for (let tab of fileConfig.tabs) {
            if (tab.disabled || !workbook.Sheets[tab.tabname]) continue;
            console.log(tab);
            const data = {
              rows: [],
            };
            const prefixArtcode = tab.artcode || '';
            tab.colRow = tab.colRow || 1;
            const sheet = workbook.Sheets[tab.tabname];
            const toprow = [];
            let [s,colEnd,rowEnd] = sheet['!ref'].match(/:([A-Z]+)(\d+)/);
            colEnd = XLSX.utils.decode_col(colEnd);
            function rowvalue(r,c) {
              var cell = sheet[XLSX.utils.encode_cell({c:c,r:r-1})];
              if (cell) {
                if (cell.l) {
                  return `(${cell.l.display})[${cell.l.Target}]`;
                }
                return String(cell.v).trim().replace(/  /g,' ');
              }
            }
            for (var c=0; c<=colEnd; c++) {
              toprow[c] = rowvalue(tab.colRow,c);
            }
            const rowStart = tab.colRow;
            const cols = tab.cols;
            for (var name in cols) {
              if (typeof cols[name] !== 'function' && String(cols[name]).match(/return /)) {
                cols[name] = new Function('row', cols[name]);
              }
            }
            for (var r = tab.colRow+1; r<=rowEnd; r++) {
              let row;
              for (var name in cols) {
                var value;
                if (typeof cols[name] === 'function') {
                  try {
                    value = cols[name](row) || '';
                  } catch(err) {

                  }
                } else if (String(cols[name]).match(/[A-Z]+/) && cols[name].length<=2 ) {
                  // console.log(name);
                  value = rowvalue(r, XLSX.utils.decode_col(cols[name]));
                } else if (Array.isArray(cols[name])) {
                  value = cols[name].map(c => rowvalue(r, XLSX.utils.decode_col(c))).join(' ');
                  // console.log(name, tab.cols[name]);
                } else if (toprow.includes(name)) {
                  value = rowvalue(r, toprow.indexOf(name));
                } else if (toprow.includes(cols[name])) {
                  value = rowvalue(r, toprow.indexOf(cols[name]));
                } else {
                  value = cols[name];
                }
                if (value !== undefined) {
                  (row = row || {})[name] = value;
                }
              }
              if (row) {
                // console.log(row);
                // return;
                row.importCode = file.name;
                data.rows.push(row);
                allrows.push([row, tab]);
              }
            };
          }
          // (document.querySelector('footer>progress')||{}).value -= 1;
        }
      }
      allrows = allrows.filter(entry => entry[0].leverancierId && entry[0].bestelCode);
      // return console.debug(allrows);
      var i = 0;
      var max = allrows.length;
      progress.max += max;
      const importDateTime = new Date().toISOString();
      console.debug('importDateTime', importDateTime);
      const title = document.title;
      for (var [row,tab] of allrows) {
        const infoTekst = [max + ':' + i, Math.round(i/max*100) + '%', tab.tabname, row.leverancierId, row.bestelCode].join(', ');
        progress.text(infoTekst);
        document.title = [title,row.leverancier,Math.round(i/max*100) + '%'].join(' ');
        try {
          // console.log(row);
          // await tab.callback(row);
          if (row.levKortingFaktor) row.levKorting = row.levKortingFaktor*100;
          row.importDateTime = importDateTime;
          await Aim.api(tab.url).body(row).post()
        } catch (err) {
          console.error(row);
        }
        progress.value += 1;
        i++;
      }
      // await dmsClient.api('/abis/artCleanUp').get();
      progress.max -= max;
      progress.value -= max;
      progress.done();
      document.title = title;
    }
    function headerTable(rows) {
      return $('table').style('border-style: hidden;').append(
        rows.map(row => $('tr').append(
          Object.entries(row).map(([name,attr]) => [
            $('th').text(name),
            $('td').style('white-space:nowrap;').text(attr.text).attr(attr),
          ]),
        ),
      ),
    )

    }
    function treeItem(item){
      const {name,enabled,hasChildren,id} = item;
      item = Item.get(item);
      const schemaName = 'item';
      const $path = serviceRoot + '/item';
      const $top = 100;
      const $select = 'name,hasChildren';
      const $filter = item.id ? `parentId EQ '${item.id}'` : 'parentId EQ NULL';
      const $order = 'itemId';
      function ontoggle(event){
        if (event.target.open && event.target.children.length === 1) {
          // console.log('OPEN', item.name);
          abisClient.api('/item')
          .query({$filter,$top,$order,$select})
          .get()
          .then(res => res.value)
          .then(items => {
            items = items.map(treeItem);
            const {el} = Web.treeview.append(items, event.target);

            console.log(name,items);
            // const {children} = elem;
            items.forEach(item => {
              const {id,summaryElem,detailsElem} = item;
              item = Item.get(item);
              Object.assign(item,{summaryElem,detailsElem});
              console.log(id,item);
              summaryElem
              .draggable(true)
              .on('dragstart', event => {
                console.debug(event.type, event);
                event.dataTransfer.setData('application/json', JSON.stringify({id,schemaName}));
                // event.preventDefault();
              })
              .on('dragover', event => {
                event.preventDefault();
                const {target,type,dataTransfer,ctrlKey,altKey,shiftKey} = event;
                dataTransfer.dropEffect = 'none';
                if (ctrlKey) {
                  // dataTransfer.dropEffect = 'copy';
                } else if (altKey) {
                  // dataTransfer.dropEffect = 'link';
                } else {
                  dataTransfer.dropEffect = 'move';
                }
                // else if (shiftKey) event.dataTransfer.dropEffect = 'move';
              })
              .on('dragend', event => {
                console.debug(event.type, event.target, event);
              })
              .on('drop', event => {
                const {type,target,dataTransfer,ctrlKey,altKey,shiftKey} = event;
                const {dropEffect} = dataTransfer;
                const json = dataTransfer.getData('application/json');
                // console.warn({json,type,target});
                if (json) {
                  const data = JSON.parse(json);
                  const dragItem = Item.get(data);
                  // console.log(dragItem.detailsElem);
                  if (ctrlKey) {
                    console.debug('COPY', dragItem.id, 'to', id);
                  } else if (altKey) {
                    console.debug('LINK', dragItem.id, 'to', id);
                  } else {
                    console.debug('MOVE', dragItem.id, 'to', id);
                    dragItem.parentId = id;
                    if (dragItem.detailsElem) {
                      detailsElem.append(dragItem.detailsElem);
                    }
                  };
                }
              });
            })
          });
        }
      }
      return {
        icn: 'folder',
        $filter,$top,$order,$path,
        name,enabled,hasChildren,id,ontoggle,
      }
    }
    async function orderElem(row) {
      console.log('orderPrint',row);
      const {
        purchaseOrderId,
        purchaseOrderCustomerId,
        purchaseOrderOrderDateTime,
        purchaseOrderScheduledDeliveryDateTime,
        purchaseOrderCustomerReference,

        customerCompanyName,
        // customerContactName,
        customerBusinessAddressStreet,
        customerBusinessAddressStreet2,
        customerBusinessAddressStreet3,
        customerBusinessAddressPostalCode,
        customerBusinessAddressCity,

        customerOtherAddressStreet,
        customerOtherAddressStreet2,
        customerOtherAddressStreet3,
        customerOtherAddressPostalCode,
        customerOtherAddressCity,
        remark,
      } = row;
      const {value} = await aim.api('/purchaseOrderLine').query({
        $top: 100,
        $select: 'orderQuantity,bruto,korting,pos,storageLocation,eenheid,artId,code,omschrijving,unNummer,unCategorie,extraTekst,extraTekstIntern,gewicht,totaal',
        $select: 'orderQuantity,bruto,korting',
        $filter: `SalesOrderId EQ ${purchaseOrderId}`
      }).get();
      value.forEach(row => {
        const {} = row;
        row.storageLocation = row.storageLocation || '';
        row.storageLocationString = row.storageLocation.split('.').filter(Boolean).join('.');
      })
      const purchaseOrderTotalVos = 0;
      const purchaseOrderTotalWeight = 0; // num(rows.map(row =>(row.aantal||0) * (row.gewicht||0)).reduce((tot,val)=>tot += val),1)
      const purchaseOrderOrderType = '';//bestelOptions[salesorder.volgNr] ? bestelOptions[salesorder.volgNr].title : 'Onbekend'
      const purchaseOrderTransportType = '';//transportOptions[salesorder.routeNr] ? transportOptions[salesorder.routeNr].title : 'Onbekend'
      console.log('orderPrint',value);
      const elem = $('div').append(
        $('link').rel('stylesheet').href(cssPrintUrl),
        $('table').style('width:100%;').append(
          $('tr').append(
            $('td').append(
              $('div').text('PAKBON voor intern gebruik').style('font-weight:bold;font-size:1.2em;'),
              $('div').class('bc').text(`*11${purchaseOrderId}*`).style('margin-bottom:10mm;height:10mm;'),
              $('table').style('margin-bottom:10mm;width:100%;').append(
                $('tr').append(
                  $('td').style('padding-left:10mm;').append(
                    $('div').text('Afleveradres:').style('font-weight:bold;'),
                    $('div').text(customerCompanyName),
                    // $('div').text(customerContactName),
                    $('div').text(customerBusinessAddressStreet, customerBusinessAddressStreet2, customerBusinessAddressStreet3),
                    $('div').text(customerBusinessAddressPostalCode, customerBusinessAddressCity),
                  ),
                  $('td').append(
                    $('div').text('Factuuradres:').style('font-weight:bold;'),
                    $('div').text(customerCompanyName),
                    $('div').text(customerOtherAddressStreet,customerOtherAddressStreet2,customerOtherAddressStreet3),
                    $('div').text(customerOtherAddressPostalCode,customerOtherAddressCity),
                  ),
                )
              ),
            ),
            $('td').style('width:50mm;').append(
              $('div').text(clientCompanyName).style('font-weight:bold;'),
              $('div').text(clientLetterHeader).style('word-wrap:pre;font-size:0.8em;'),
            ),
          )
        ),
        // value.some(row => row.err) ? $('div').text(`Er zijn critieke foutmeldingen. Bon afhandelen en leveren. Voor facturatie fouten oplossen.`).style('color:red; padding:2mm;border:solid 1px red;margin-top:2mm;') : null,
        remark ? $('div').text(remark).style('padding:2mm;border:solid 1px red;margin-top:2mm;') : null,
        $('table').class('grid summary').append(
          $('thead').append(
            $('tr').append(
              $('td').colspan(7).style('border:none;padding:0;').append(
                $('table').class('border summary').append(
                  $('tr').append(
                    $('th').text('Ordernummer'),
                    $('td').text(purchaseOrderId),
                    $('th').text('Klantnummer'),
                    $('td').text(purchaseOrderCustomerId),
                    $('th').text('VOS totaal'),
                    $('td').text(purchaseOrderTotalVos).style('width:100%;'),
                  ),
                  $('tr').append(
                    $('th').text('Orderdatum'),
                    $('td').text(new Date(purchaseOrderOrderDateTime).toLocaleDateString()),
                    $('th').text('Uw referentie'),
                    $('td').text(purchaseOrderCustomerReference),
                    $('th').text('Gewicht totaal'),
                    $('td').text(purchaseOrderTotalWeight),
                  ),
                  $('tr').append(
                    $('th').text('Verzenddatum'),
                    $('td').text(new Date(purchaseOrderScheduledDeliveryDateTime).toLocaleDateString()),
                    $('th').text('Bestelwijze'),
                    $('td').text(purchaseOrderOrderType),
                    $('th').text('Transport'),
                    $('td').text(purchaseOrderTransportType),
                  ),
                ),
              )
            ),
            $('tr').append(
              $('th').append(
                $('div').text('Vak'),
                $('div').text('Pos.'),
              ),
              $('th').style('text-align:right;').append(
                $('div').text('Aantal'),
                $('div').text('Eenheid'),
              ),
              $('th').append(
                $('div').text('Art.nr.'),
                $('div').text('Code'),
              ),
              $('th').style('width:100%;').append(
                $('div').text('Omschrijving'),
              ),
              $('th').style('text-align:right;').append(
                $('div').text('Gewicht'),
                $('div').text('Totaal'),
              ),
              $('th').style('text-align:right;').append(
                $('div').text('Bruto'),
                $('div').text('Kort.'),
              ),
              $('th').style('text-align:right;').append(
                $('div').text('Netto'),
                $('div').text('Totaal'),
              ),
            ),
          ),
          $('tbody').append(
            value
            .sort((a,b) => a.storageLocation.localeCompare(b.storageLocation))
            .filter(row => row.orderQuantity || row.bruto)
            .map(row => [
              $('tr').append(
                $('td').append(
                  $('div').text(row.storageLocationString),
                  $('div').text(Number(row.pos).pad(2)),
                ),
                $('td').style('text-align:right;').append(
                  $('div').text(row.aantal).style('font-weight:bold;'),
                  $('div').text(row.eenheid).style('font-weight:bold;'),
                ),
                $('td').append(
                  $('div').text(row.artId||''),
                  // $('div').text(row.artCode||''),
                  $('div').text(row.code||'').style('font-weight:bold;'),
                ),
                $('td').style('white-space:normal;').append(
                  String(row.omschrijving||'').replace(/\r|\n/g,''),
                  row.unNummer ? ', UN-'+[row.unNummer,row.unCategorie].join(':') : '',
                  $('div').text(row.extraTekst||'').style('font-weight:bold;'),
                  $('div').text(String(row.extraTekstIntern||'')).style('font-weight:bold;background:yellow;'),
                  !row.err ? null : row.err.map(err => $('div').text(err).style('color:red;')),
                  !row.warn ? null : row.warn.map(err => $('div').text(err).style('color:orange;')),
                ),
                $('td').style('text-align:right;').append(
                  $('div').text(num(row.gewicht)),
                  $('div').text(num(row.gewicht * row.aantal)),
                ),
                $('td').style('text-align:right;').append(
                  $('div').text(num(row.bruto)),
                  $('div').text(num(row.korting)),
                ),
                $('td').style('text-align:right;').append(
                  $('div').text(num(row.netto)),
                  $('div').text(num(row.totaal)),
                ),
              ),
            ]),
            $('tr').append(
              $('td'),
              $('td').text(num(value.filter(row => row.aantal).map(row => row.aantal).reduce((tot,val)=>tot += val, 0),1)).style('text-align:right;'),
              $('td'),
              $('td'),
              $('td'),
              $('td'),
              $('td').text(num(value.map(row => row.totaal||0).reduce((tot,val)=>tot += val, 0),2)).style('font-weight:bold;'),
            ),
            value.filter(row => row.unNummer).map(row => [row.unNummer,row.unCategorie].join(':')).unique().map(nrcat => $('tr').append(
              $('td'),
              $('td'),
              $('td'),
              $('td').text('UN-nummer:categorie', nrcat).style('text-align:right;'),
              $('td').text(num(
                value.filter(row => row => [row.unNummer,row.unCategorie].join(':') === nrcat)
                .map(row => row.aantal * row.gewicht).reduce((tot,val)=>tot += val, 0),
                2
              )).style('text-align:right;'),
              $('td'),
              $('td'),
            )),
          ),
        ),
      );
      return elem;
    }

    $(window).on('dragover', (event) => event.preventDefault())
    $(window).on('drop', async (event) => {
      const {dataTransfer} = event;
      const {types} = dataTransfer;
      const data = event.dataTransfer || event.clipboardData;
      // types.forEach(type => {
      //   const data = dataTransfer.getData(type);
      //   console.log(type, data);
      // });
      if (data.types.includes('Files')) {
        if (importFiles(data.files)) {
          event.preventDefault();
          event.stopPropagation();
        }
        // const config = await fetch('https://aliconnect.nl/yaml.php', {
        //   method: 'POST',
        //   body: await fetch('config/import.yaml').then(res => res.text()),
        // }).then(res => res.json());
        // console.log(1, config, files);
      }
      // if (types.includes('text/uri-list')) {
      //   const uri = dataTransfer.getData('text/uri-list');
      //   // const elem = $('img').src(uri)
      //   // var xhr = new XMLHttpRequest();
      //   // xhr.open('GET', uri);
      //   // xhr.responseType = 'blob';
      //   // xhr.onload = e => {
      //   //   var reader = new FileReader();
      //   //   reader.onload = e => {
      //   //     console.log(reader.result.replace('data:', '').replace(/^.+,/, ''));
      //   //   }
      //   //   reader.readAsDataURL(this.response);
      //   // };
      //   // xhr.send();
      //
      //
      //   // fetch(uri, {
      //   //   method: 'GET',
      //   //   // headers: headers,
      //   //   mode: 'no-cors',
      //   //   // credentials: 'include'
      //   // })
      //   // .then(res => res.blob())
      //   // .then(blob => {
      //   //   console.log(blob);
      //   //   // Read the Blob as DataURL using the FileReader API
      //   //   const reader = new FileReader();
      //   //   reader.onloadend = () => {
      //   //     console.log(reader.result);
      //   //     // Logs data:image/jpeg;base64,wL2dvYWwgbW9yZ...
      //   //
      //   //     // Convert to Base64 string
      //   //     const base64 = reader.result.replace('data:', '').replace(/^.+,/, '');
      //   //     console.log(base64);
      //   //     // Logs wL2dvYWwgbW9yZ...
      //   //   };
      //   //   reader.readAsDataURL(blob);
      //   // });
      //
      //
      //   const image = await dmsClient.api('/abis/saveimageuri').query({uri:uri, id:Aim.pageRow.prodId, filename:Aim.pageRow.prodCode || Aim.pageRow.prodId }).get();
      //   const result = await dmsClient.api('/abis/saleItem').query({
      //     id: Aim.pageRow.prodId
      //   }).post({
      //     iconUrl: image.src,
      //   });
      //   console.log(image,result,uri,Aim.pageRow);
      // }
    }, true);

    var app = parseInt(Web.getItem('app'));
    var dark = parseInt(Web.getItem('dark'));
    $(document.documentElement).class('app', app).class('dark', dark);
    $(document.body).class('col').attr('host', url.hostname.split('.').slice(-2, -1)[0]).append(
      $('nav').append(
        $('div').class('mw').append(
          $('button').class('icn-navigation').on('click', e => $(document.documentElement).class('app', Web.getItem('app',app^=1))),
          $('span').class('domainname').text(Format.displayName(info.title)).title(info.description),
          $('form').class('search row aco')
          .on('submit', (event) => {
            event.preventDefault();
            Web.search(event.target.search.value);
          })
          .append(
            $('input').class('search').name('search').autocomplete('off').placeholder('Typ hier om te zoeken').value(url.searchParams.get('$search')).on('focus', e => e.target.select()),
            $('button').class('icn-search fr').title('Zoeken'),
          ),
          $('span').class('pagemenu'),
          $('button').class('icn-local_language').on('click', (event) => event.elem = $('nav').parent(event.target).append(
            Object.entries(config.languages).map(([lang,language]) => $('button').text(language.iso, language.native).on('click', (event2) => {
              event2.stopPropagation();
              event.elem.remove();
              console.log(lang,language);
            }))
          )),
          $('button').class('icn-dark_theme').on('click', (event) => $(document.documentElement).class('dark', Web.getItem('dark',dark^=1))),
          $('button').class('icn-cart').append(
            $('nav').append(
              $('button').class('icn-shopping_bag').caption('Mandje').on('click', (event) => definitions.company.customer.bag()),
              $('button').class('icn-shopping_bag_tag').caption('Bestellijst').on('click', (event) => event.stopPropagation(definitions.company.customer.shoplist())),
              $('button').class('icn-tag').caption('Producten').on('click', async (event) => {
                Listview.list(abisClient.serviceRoot + '/saleItem', {
                  // $filter: `(customerId eq '${this.id}') or (supplierId eq '${this.supplierId}' and customerId eq null)`,
                  $filter: `(supplierId eq '${definitions.company.customer.supplierId}' and customerId eq null) or (customerId eq '${definitions.company.customer.id}')`,
                  $search: ``,
                  $top: 1000,
                });
              }),
              $('button').class('icn-shopping_bag_play').caption('Bestellen').on('click', (event) => event.stopPropagation(definitions.company.customer.createOrder())),
              $('button').class('icn-company').caption('Bedrijf').on('click', (event) => event.stopPropagation(definitions.company.customer.select())),
            )
          ),
          $('button').class('icn-chat_multiple').on('click', e => Prompt.open('chat')),
          !config.tasks ? null : $('button').class('icn-clipboard_task').on('click', e => Prompt.open('tasks')),
          !config.messages ? null : $('button').class('icn-chat').on('click', e => Prompt.open('messages')),
          $('button').class('icn-settings').on('click', e => Prompt.open('config')),
          $('button').class('icn-question').on('click', e => Prompt.open('help')),
          $('button').class('icn-person account').caption(account.id.name).on('click', e => Prompt.open('account')),
          // .append(
          //   $('div').append(
          //     $('div').class('accountName').text(account.id.name),
          //     $('div').class('companyName').on('click', event => event.stopPropagation(definitions.company.customer.select())),
          //   ),
          // ),
        )
      ),
      $('main').class('row').append(
        $('div').class('row mw').append(
          Web.treeview.create(),
          $('i').seperator('treeview'),
          Web.listview.create(),
          $('i').seperator('pages',-1),
          $('div').class('pages'),
        )
      ),
      $('footer').append($('div').class('mw')),
      $('footer').class('statusbar').append(
        $('span').class('pos'),
        $('span').class('main aco').append(
          $('span').html(`powered by <b><a href="https://alicon.aliconnect.nl">alicon</a></b>nect, one source, one truth`),
        ),
        $('span').class('aliconnector'),
        $('span').class('ws'),
        $('progress').max(0).value(0),
      ),
    ).on('scroll', e => sessionStorage.setItem('scrollY', window.scrollY));

    tags = new Map(config.tags ? config.tags.map(tag => [tag.name,tag]) : []);
    options = new Set(options);
    const relations = [];

    Web.extend({
      Item: {
        prototype:{
          get pageNav() { return [
            this.buttonRelations(),
          ]},
          buttonRelations() {
            return $('button').class('icn-eye').append($('nav').append(
              ...arguments,
              relations.filter(rel => rel.to === this.schemaName)
              .map(rel => $('button').class('icn').caption(rel.from, rel.key)
              .on('click', async (event) => Listview.list(`${serviceRoot}/${rel.from}`, {
                $filter:  `${rel.key} EQ ${this.id}`,
                // $orderby: 'GewijzigdOp DESC',
              }))),
              this.cols.filter(col => col.linkId)
              .map(col => $('button').class('icn').caption(col.linkSchemaName).on('click', (event) => Item.get({
                schemaName: col.linkSchemaName,
                id: this[col.name],
              }).get().then(item => item.select()))),
            ));
          }
        },
      },
    });
    config({
      definitions: {
        company: {
          prototype: {
            get pageNav() { return [
              this.buttonRelations(
                $('button').class('icn-tag').text('Producten gekocht').on('click', event => Listview.list(abisClient.serviceRoot + '/product', {
                  $top: '*',
                  $filter: `id in (
                    SELECT top 20 productId FROM (
                      SELECT productId, SUM(quant)AS quant
                      FROM api.purchaseOrderLine
                      WHERE datediff(day,orderDateTime,getdate())<365
                      AND customerId = '${this.id}'
                      GROUP BY productId
                    ) A ORDER BY quant DESC
                  )`,
                })),
              ),
              // this.buttonRelations(
              //   // $('button').class('icn-tag').caption('Bestellijst').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/saleItem', {
              //   //   $filter: `(customerId EQ '${this.id}') or (supplierId EQ '${this.supplierId}' and customerId EQ null)`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-tag').caption('Leverancier Artikelen').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/saleItem', {
              //   //   $filter: `supplierId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-contact_card').caption('Contacten').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/contact', {
              //   //   $filter: `companyId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-person').caption('Personen').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/person', {
              //   //   $filter: `companyId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-building').caption('Klanten').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/company', {
              //   //   $filter: `supplierId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-receipt_money').caption('Facturen').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/invoice', {
              //   //   $filter: `customerId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //   // $('button').class('icn-receipt_bag').caption('Orders').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/purchaseOrder', {
              //   //   $filter: `customerId EQ '${this.id}'`,
              //   //   $search: `*`,
              //   // })),
              //
              //   // $('button').class('icn-window').caption('Pop out').on('click', event => row.popout(5000,0)),
              //   // $('button').class('icn-dashboard').caption('Dashboard').on('click', e => Item.dashboard(row)),
              //   // $('button').class('icn-slide').caption('Slideshow').on('click', e => Item.slideshow(row)),
              //   // $('button').class('icn-model3d').caption('Model 3D').on('click', e => Item.model3d(row)),
              //   // $('button').class('icn-network').caption('Network').on('click', e => Item.network(row)),
              //   // $('button').disabled(!this.srcID).class('icn-showInherited').caption('Inherited').on('click', e => Item.showInherited(row)),
              //   // $('button').disabled(!this.srcID).class('icn-clone').caption('Clone').on('click', e => Item.clone(row)),
              //   // $('button').class('icn').caption('Api key').on('click', e => Item.apikey(row)),
              //   // $('button').class('icn-document').caption('Breakdown').on('click', e => Item.breakdown(row)),
              //   // $('button').class('icn-document').caption('Doc').on('click', e => Item.doc(row)),
              // ),
              $('button').class('icn-cart').append($('nav').append(
                $('button').class('icn-shopping_bag').caption('In Mandje').on('click', e => this.bag()),
                // $('button').class('icn-shopping_bag_play').caption('Winkelwagen').on('click', e => this.bag()),
                $('button').class('icn-shopping_bag_tag').caption('Bestellijst').on('click', e => this.shoplist()),
                $('button').class('icn-tag').caption('Producten').on('click', async (event) => {
                  await this.setCustomer();
                  Listview.list(abisClient.serviceRoot + '/saleItem', {
                    // $filter: `(customerId eq '${this.id}') or (supplierId eq '${this.supplierId}' and customerId eq null)`,
                    $filter: `(supplierId eq '${definitions.company.customer.supplierId}' and customerId eq null) or (customerId eq '${definitions.company.customer.id}')`,
                    $search: ``,
                    $top: 1000,
                  });
                }),
                $('button').class('icn-shopping_bag_play').caption('Bestellen').on('click', e => this.createOrder()),

                $('button').class('icn').caption('Selecteer als bedrijf').on('click', e => this.setCustomer()),

                // $('button').class('icn-shopping_bag_play').caption('Winkelwagen').on('click', e => this.bag()),
                // $('button').class('icn-bag').caption('Boodschappen tas').on('click', e => this.bag()),
                // $('button').class('icn-eye').caption('Klant als gebruiker activeren').on('click', e => this.activate()),
              )),
              $('button').class('icn-print').append($('nav').append(
                $('button').class('icn-document').caption('reportCompany').on('click', e => this.reportCompany()),
                $('button').class('icn-document').caption('Overzicht').on('click', e => this.totalReport()),
                $('button').class('icn-document').caption('Bestellijst').on('click', e => this.bestellijst()),
                $('button').class('icn-document').caption('Prijslijst').on('click', e => this.prijslijstPdf()),
                $('button').class('icn-document_xls').caption('Prijslijst').on('click', e => this.prijslijstXls()),
                $('button').class('icn-document').caption('Prijslijst').on('click', e => this.prijslijst()),
                $('button').class('icn-send').caption('Prijslijst').on('click', e => this.prijslijstSend()),
                $('button').class('icn-document').caption('Rapport').on('click', e => this.rapport()),
                $('button').class('icn-document').caption('VOS overzicht').title('Over afgelopen jaar').on('click', e => this.vosRapport()),
                $('button').class('icn-document').caption('Prijs verhoging').on('click', event => this.printPrijsVerhogingen()),
                $('button').class('icn-document').disabled(!Web.officeWord).caption('Word brief').on('click', e => {
                  console.log('Word brief');
                  Word.run(async (context) => {
                    var range = context.document.getSelection();
                    const content = await Aim.fetch('https://aliconnect.nl/docs/Explore-Legal-Contract-Voorbeeld.md').get();
                    // const elem = $('div').append(
                    //   $('b').text('HALLP'),
                    // )
                    range.insertHtml(content.render().replaceTags({customer:this.data}), Word.InsertLocation.end);
                    // elem.remove();
                    return context.sync().then(event => console.log('Word done'));
                  });
                }),
              )),
              $('button').class('icn-star').title('Favorites').on('click', e => Item.toggleFav(row)),
              $('button').class('icn-chat').title('Berichten').on('click', e => Item.showMessages(row)),
              $('button').class('icn-send').on('click', e => Item.send(row)).append($('nav').append(
                // $('button').class('icn-arrow_download').caption('Config data').on('click', e => Item.downloadConfigdata(row)),
              )),
              $('button').class('icn-arrow_download').append($('nav').append(
                $('button').class('icn-arrow_download').caption('Email list Customers').on('click', async (event) => {
                  var rows = await abisClient.api('/purchaseOrder').query({
                    $select: 'customer_emailAddress0',
                    $filter: `DATEDIFF(DAY,orderDateTime,GETDATE()) lt 365 and supplierId eq ${this.id}`,
                    $top: '*',
                  }).get().then(({value})=>value);
                  const addressList = rows.filter(row => row.customer_emailAddress0).map(row => row.customer_emailAddress0.trim()).unique().filter(Boolean).sort((a,b)=>a.localeCompare(b)).join(';\n');
                  navigator.clipboard.writeText(addressList);
                  // Alert the copied text
                  alert("Maillist copied to clipboard");
                  // console.log(addressList);
                }),
                $('button').class('icn-arrow_download').caption('Afas facturen').on('click', async (event) => {

                }),

                $('button').class('icn-arrow_download').caption('Config data').on('click', e => Item.downloadConfigdata(row)),
                $('button').class('icn-arrow_download').caption('Data v1').on('click', e => Item.downloadV1(row)),
              )),
              $('button').class('icn-edit').on('click', event => this.pageElem(true)).append($('nav').append(
                $('button').class('icn-share').caption('Share').on('click', e => {}),
                $('button').class('icn-read').caption('Read').on('click', e => {}),
                $('button').class('icn-public').caption('Public').on('click', e => {}),
                $('button').class('icn-private').caption('Private').on('click', e => {}),
                $('button').class('icn-upload mailimport').caption('Mailimport').on('click', e => {}),
                $('button').class('icn-clone').caption('Clone').on('click', e => {}),
                $('button').class('icn-delete').caption('Verwijderen').on('click', e => {}),
              )),
            ]},
            _printPrijsVerhogingen () {
              abisClient.api(`/saleItem`)
              .select('saleItemId,brand,code,description,listprice,lastSaleDateTime,lastPriceModifiedDateTime,purchaseItemListprice')
              .top('*').filter(`supplierId EQ '${this.id}'`)
              .get()
              .then(({value}) => {
                value.forEach(row => {
                  row.verhoging = (row.purchaseItemListprice / row.listprice * 100) - 100;
                  // console.log(row);
                });
                console.log(value);
                // return $('div').text('a').printpdf();
                $('div').append(
                  $('link').rel('stylesheet').href(cssPrintUrl),
                  $('h1').text('Prijsverhogingen'),
                  $('h2').text(this.companyName),
                  $('p').text(new Date().toLocaleString()),
                  $('table').class('grid').append(
                    $('thead').append(
                      $('tr').append(
                        $('th').text('Art.nr.'),
                        $('th').text('Omschrijving').style('width:100%;'),
                        $('th').text('Bruto'),
                        $('th').text('Bruto Nieuw'),
                        $('th').text('Verhoging'),
                      ),
                    ),
                    $('tbody').append(
                      value.map(row => $('tr').append(
                        $('td').class('n').text(row.saleItemId),
                        $('td').text((row.description||'').replace(/\r|\n/g,'')),
                        $('td').class('n').text(num(row.listprice)),
                        $('td').class('n').text(num(row.purchaseItemListprice)),
                        $('td').class('n').text(num(row.verhoging)).style(row.verhoging > 0 ? 'color:red' : 'color:green'),
                      ))
                    ),
                  )
                ).print();
              })
            },
            printPrijsVerhogingen () {
              abisClient.api(`/saleItem`)
              .select('description,productId,listprice,supplierCompanyName,customerCompanyName,discount')
              .top('*')
              .filter(`productId IN (SELECT productId FROM saleItem WHERE supplierId='${this.id}') AND DATEDIFF(day,lastSaleDateTime,getdate())<265`)
              .order(`description,listprice DESC,discount DESC,supplierCompanyName,customerCompanyName`)
              .get()
              .then(({value}) => value)
              .then(rows => {
                rows.forEach(row => {
                  row.verhoging = (row.purchaseItemListprice / row.listprice * 100) - 100;
                  // console.log(row);
                });
                // const products = rows.map(row => row.productId).unique();
                // return console.log(rows);
                // return $('div').text('a').printpdf();
                $('div').append(
                  $('link').rel('stylesheet').href(cssPrintUrl),
                  $('h1').text('Prijsverhogingen'),
                  $('h2').text(this.companyName),
                  $('p').text(new Date().toLocaleString()),
                  $('table').class('grid').append(
                    $('thead').append(
                      $('tr').append(
                        // $('th').text('Art.nr.'),
                        $('th').text('Omschrijving').style('width:100%;'),
                        $('th').text('Bruto'),
                        // $('th').text('Bruto Nieuw'),
                        $('th').text('Korting'),
                      ),
                    ),
                    $('tbody').append(
                      rows.map(row => row.productId).unique().map(productId => [$('tr').append(
                        $('td').text(rows.find(row => row.productId === productId).description).style('font-weight:bold;'),
                        $('td'),
                        $('td'),
                      )].concat(rows.filter(row => row.productId === productId).map(row => $('tr').append(
                        $('td').text(row.supplierCompanyName, row.customerCompanyName ? `aan: ${row.customerCompanyName}` : ''),
                        $('td').text(num(row.listprice,2)).style('text-align:right;'),
                        $('td').text(num(row.discount,1)).style('text-align:right;'),
                      )))),
                      // rows.map(row => $('tr').append(
                      //   $('td').class('n').text(row.saleItemId),
                      //   $('td').text((row.description||'').replace(/\r|\n/g,'')),
                      //   $('td').class('n').text(num(row.listprice)),
                      //   $('td').class('n').text(num(row.purchaseItemListprice)),
                      //   $('td').class('n').text(num(row.verhoging)).style(row.verhoging > 0 ? 'color:red' : 'color:green'),
                      // ))
                    ),
                  )
                ).print();
              })
            },
            async bestellijst() {
              // const [rows] = await dmsClient.api('/abis/klantartikelen').query({organisatieId: row.id}).get();
              const rows = await abisClient.api('/saleItem').query({
                $filter: `customerId EQ '${this.id}'`,
                $top: 5000,
                $orderby: 'description',
              }).get().then(({value})=>value);

              $('div').append(
                $('link').rel('stylesheet').href(cssPrintUrl),
                $('table').append(
                  $('thead').append(
                    $('tr').append(
                      $('td').colspan(6).style('height:20mm;').append(
                        $('table').append(
                          $('tr').append(
                            $('td').style(`width:50mm;height:15mm;background:url(https://proving-nl.aliconnect.nl/assets/img/logo-${this.companyName}.png) no-repeat;background-size:auto 15mm;`
                            ),
                            $('td').style(`padding-left:10px;`).append(
                              $('div').text(`${this.companyName} - BESTELLIJST ${new Date().toLocaleDateString()}`).style('font-weight:bold;'),
                              $('div').text(`Prijzen in EURO excl BTW`),
                            ),
                          )
                        )
                      )
                    ),
                    $('tr').class('grid').append(
                      $('th').text('Omschrijving').style('width:100%'),
                      $('th').text('Art.Nr.').style('text-align:right;'),
                      $('th').text('Aantal').style('text-align:right;'),
                    ),
                  ),
                  $('tbody').class('grid').append(
                    rows.map(row => $('tr').append(
                      $('td').append(
                        $('div').text(row.description),
                        $('div').text(`Art.code: ${row.code}, Eenheid: ${row.packUnit}`).style('font-family: consolas;font-size:0.8em;'),
                      ),
                      $('td').text(row.saleItemId).style('text-align:right;'),
                      $('td'),
                    ))
                  )
                )
              ).print();
            },
            async prijslijstPdf() {
              // const [rows] = await dmsClient.api('/abis/klantartikelen').query({organisatieId: row.id}).get();
              const rows = await abisClient.api('/saleItem').query({
                $filter: `customerId EQ '${this.id}'`,
                $top: 5000,
                $orderby: 'description',
              }).get().then(({value})=>value);

              $('div').append(
                $('link').rel('stylesheet').href(cssPrintUrl),
                $('table').append(
                  $('thead').append(
                    $('tr').append(
                      $('td').colspan(6).style('height:20mm;').append(
                        $('table').append(
                          $('tr').append(
                            $('td').style(`width:50mm;height:15mm;background:url(https://proving-nl.aliconnect.nl/assets/img/logo-${this.companyName}.png) no-repeat;background-size:auto 15mm;`
                            ),
                            $('td').style(`padding-left:10px;`).append(
                              $('div').text(`${this.companyName} - PRIJSLIJST ${new Date().toLocaleDateString()}`).style('font-weight:bold;'),
                              $('div').text(`Prijzen in EURO excl BTW`),
                            ),
                          )
                        )
                      )
                    ),
                    $('tr').class('grid').append(
                      $('th').text('Omschrijving').style('width:100%'),
                      $('th').text('Bruto').style('text-align:right;'),
                      $('th').text('Korting').style('text-align:right;'),
                    ),
                  ),
                  $('tbody').class('grid').append(
                    // ...rows.map(row => row.productGroep).unique().map(productGroep => [$('tr').append(
                    //   $('td').colspan(6).text(productGroep).style('font-weight:bold;font-size:1.1em;padding:5px 0;'),
                    // )].concat(
                    rows
                    // .filter(row => row.productGroep === productGroep)
                    .map(row => $('tr').append(
                      // $('td').append(row.saleItemId.pad(5)),
                      // $('td').text(row.merk),
                      // $('td').text(`${row.code} (${row.packUnit})`),//.style('font-family: consolas;'),
                      // $('td').text(row.levcode),
                      // $('td').text(row.code),
                      // $('td').text(row.merk),
                      // $('td').text(row.code),
                      // $('td').style('white-space:normal;').text(row.proptekst),

                      // $('td').align('right').text(row.kortingCode),
                      // $('td').align('right').text(row.inhoud),
                      // $('td').text(row.code),
                      // $('td').text(row.merk),
                      // $('td').text(row.packUnit),
                      $('td').append(
                        $('div').text(row.description),
                        $('div').text(`Art.nr.: ${row.saleItemId.pad(5)}, Art.code: ${row.code}, Eenheid: ${row.packUnit}`).style('font-family: consolas;font-size:0.8em;'),
                      ),
                      // $('td').text(row.merk+',',row.propTekst),
                      // $('td').align('right').text(row.inhoud,row.inhoudEenheid).style('white-space:nowrap;'),
                      // $('td').text(row.inhoudEenheid),



                      // $('td').align('right').text(row.verpaktPer),
                      // $('td').align('right').text(Aim.num(row.brutoNieuw)),
                      $('td').style('text-align:right;').text(num(row.listprice)),
                      $('td').style('text-align:right;').text(num(row.discount||0,1)),

                      // $('td').align('right').text(row.verhoging||''),
                      // $('td').align('right').text(`${Aim.num(row.korting,0)}%`),
                      // $('td').align('right').text(Aim.num(row.netto)),
                    ))
                    // )
                    // )
                  )
                )
              ).print();
            },
            async prijslijst(item) {
              // const [rows] = await Aim.api(item.uri + '/artikelen').get();
              const rows = await abisClient.api('/saleItem').query({
                // organisatieId: row.id,
                // $select: 'id AS klantArtId,artId AS id,titel,lower(eenheid) eenheid,merk,code,propTekst,netto,nettoNieuw,brutoNieuw,korting,productGroep,inhoud,inhoudEenheid,CONVERT(FLOAT,round(NettoNieuw/Netto*100-100,1)) AS verhoging',
                // $select: `productGroep,artId AS id,titel,brutoNieuw AS bruto,korting,nettoNieuw AS netto,CONVERT(FLOAT,round(NettoNieuw/Netto*100-100,1)) AS verhoging,netto AS oud,id as kid,artInkId`,
                $filter: `customerId EQ '${this.id}'`,
                // $filter: `organisatieid = ${row.id} AND netto>0 AND DATEDIFF(YEAR,lastModifiedDateTime,GETDATE())<2`,
                // $orderby: `productGroep,titel`,
              }).get().then(({value})=>value);
              rows.forEach(row => {
                row.id = $('a').href('#?id='+btoa('https://dms.aliconnect.nl/api/v1/saleItem?id='+row.id)).text(row.id.pad(5)).style('color:white;');
                ['netto','oud','bruto','korting','verhoging'].filter(n => n in row).forEach(n => row[n] = {t:'n',v:num(row[n])})
              });
              console.log(rows);
              $('.listview').text('').append(
                $('div').append(
                  $('div').append(
                    $('table').style('width:100%;').append(
                      $('thead').append(
                        $('tr').append(
                          Object.keys(rows[0]).map(k => $('td').text(k)),
                        )
                      ),
                      $('tbody').style('font-family:consolas;').append(
                        rows.map(row => $('tr').style(!row.artInkId ? 'color:red;' : '').append(
                          Object.values(row).map(v => $('td').append(v && v.t ? v.v : v).style(v && v.t === 'n' ? 'text-align:right;' : '')),
                        ))
                      )
                    )
                  )
                )
              )
            },
            async prijslijstXls() {
              const cols = [
                // { n: 'nr', v: 'ArtikelNr', wch: 10, f:{t:'s'} },
                // { n: 'bruto', v: 'Bruto', wch: 10, f:{t:'n', z:'.00'} },
                { n: 'description', v: 'Titel', wch: 80 },
                { n: 'listprice', v: 'Bruto', wch: 30, f: {t:'n', z:'.00'} },
                { n: 'discount', v: 'Korting', wch: 30, f: {t:'n', z:'.0'} },
                // { n: 'aantalStuks', v: 'Verpakt per', wch: 10, f: { t:'n' } },
                // { n: 'kortK', v: 'Korting', wch: 10, f:{t:'n' } },
                // { n: 'kortingCode', v: 'KortingCode', wch: 10, f:{t:'n' } },
                // { n: 'merk', v: 'Merk', wch: 10 },
                // { n: 'leverancier', v: 'Leverancier', wch: 10 },
                // { n: 'bestelCode', v: 'Bestelcode', wch: 10 },
                // { n: 'code', v: 'Code', wch: 10 },
                // { n: 'segment', v: 'Segment', wch: 12 },
                // { n: 'categorie', v: 'Categorie', wch: 12 },
                // { n: 'barcode', v: 'EAN', wch: 10, f: { t:'s' } },
                // { n: 'artCode', v: 'ArtikelCode', wch: 10 },
                // { n: 'klantNr', v: 'KlantNr', wch: 10, f:{t:'n'} },

                // { n: 'korting', v: 'Korting', wch: 10, f:{t:'n' } },
                // { n: 'netto', v: 'Netto', wch: 10, f:{t:'n', z:'.00'} },
                // { n: 'productCode', v: 'ProductCode', wch: 12 },
                // { n: 'netto', v: 'Netto', wch: 10, f:{t:'n', z:'.00'} },
                // { n: 'serie', v: 'Serie', wch: 10 },
                // { n: 'type', v: 'Type', wch: 10 },
                // { n: 'kleur', v: 'Kleur', wch: 10 },
                // { n: 'verhouding', v: 'Verhouding', wch: 10 },
                // { n: 'extra1', v: 'Extra1', wch: 16 },
                // { n: 'extra2', v: 'Extra2', wch: 16 },
                // { n: 'inhoud', v: 'Inh', wch: 10, f: { t:'n' } },
                // { n: 'inhoudEenheid', v: 'Eenh', wch: 10 },
                // { n: 'artGroep', v: 'Categorie', wch: 20 },
              ];
              function formatRow(row,col) {
                const options = Object.create(col.f||{});
                options.v = row[col.n]||'';
                options.s = {};
                if (!options.v) {
                  options.s.fill = {
                    fgColor: { rgb: "FF6666" },
                  };
                }
                //
                //   fill: {
                //   },
                //   font: {
                //     color: { rgb: "FF0000" },
                //     bold: true,
                //   },
                //   alignment: {
                //     horizontal: "center",
                //   },
                // }
                return options;
              }
              const rows = await abisClient.api('/saleItem').query({
                $select: cols.map(col => col.n).join(','),
                $filter: `customerId EQ '${this.id}'`,
              }).get()
              .then(({value})=>value)
              .then(rows => rows.map(row => cols.map(col => formatRow(row,col))));
              const title = 'Ja';
              const props = {
                Title: title,
                Subject: '',
                Author: '',
                // CreatedDate: new Date(),
              }
              const sheets = [{ rows, cols, name: 'Prijslijst' }];
              const {href} = await XLSBook.create({ props, sheets });
              return $('a').download(`${title}.xlsx`).rel('noopener').href(href).click().remove();
            },
            async vosRapport() {
              const rows = await abisClient.api('/purchaseOrderLine').query({
                // $filter: `customerId eq '${this.id}' and orderDateTime gt '01-01-${new Date().getFullYear()-1}' and orderDateTime lt '01-01-${new Date().getFullYear()}'`,
                $select: 'vos,sum(quant)quant,description',
                $filter: `vos ne null and lastModifiedDateTime gt '01-01-${new Date().getFullYear()-1}' and lastModifiedDateTime lt '01-01-${new Date().getFullYear()}' and customerId eq '${this.id}'`,
                $top: '*',
                $orderby: 'description',
              }).get().then(({value})=>value);
              return console.debug(rows);

              abisClient.api('/analyse/producten').query({
                response_type: 'vosOverzicht',
                customerId: this.companyId,
              }).get().then(([rows]) => {
                console.log(rows);
                $('div').append(
                  $('link').rel('stylesheet').href(cssPrintUrl),
                  $('div').text('VOS RAPPORT AFGELOPEN JAAR', this.companyName),
                  $('table').append(
                    $('thead').append(
                      $('tr').append(
                        ['Aantal','Titel','Vos','Totaal'].map(name => $('th').text(name))
                      ),
                    ),
                    $('tbody').append(
                      rows.map(row => $('tr').append(
                        ['aantal','titel','vos','vosTotaal'].map(name => $('td').text(row[name]))
                      ))
                    ),
                  ),
                ).print();
              })
            },
            async reportCompany() {
              const {id} = this;
              var data = await abisClient.api('/analyse').query({response_type:'reportCompany', id}).get();
              // return console.log(data);
              var [clients] = data;
              clients.forEach(row => {
                row.verschil = row.lastYear - row.beforeLastYear;
                row.groei = row.beforeLastYear ? (row.lastYear-row.beforeLastYear)/row.beforeLastYear*100 : 100;
                row.marge = row.lastYear - row.totInkNetto;
                row.winst = row.lastYear && row.marge ? row.marge / row.lastYear * 100 : 0;
              })
              console.log(clients);
              // clients = clients.filter(row => row.lastYear || row.beforeLastYear);
              const styleValCol = 'width:2cm;text-align:right;';
              const cols = {
                companyName: row => $('td').text(row.companyName),
                clientManager: row => $('td').text(row.clientManager),
                'Afgelopen periode': row => $('td').text(num(row.lastYear,0)).style(styleValCol),
                'Periode daarvoor': row => $('td').text(num(row.beforeLastYear,0)).style(styleValCol),
                // 'Verschil': row => $('td').text(val(row.verschil)).style(styleValCol+`color:${row.verschil<0 ? 'orange' : 'inherit'};`),
                'Groei': row => $('td').text(num(row.verschil,0)).style(styleValCol+`color:${row.groei<0 ? 'orange' : 'inherit'};`),
                '%': row => $('td').text(num(row.groei,0)).style(`text-align:right;`),

                'Marge': row => $('td').text(num(row.marge,0)).style(styleValCol+`color:${row.marge<0 ? 'orange' : 'inherit'};`),
                'Winst': row => $('td').text(num(row.winst,0)).style(`text-align:right;color:${
                  row.winst<15 ? 'red'
                  : row.winst<30 ? 'orange'
                  : row.winst>50 ? 'lightgreen'
                  : 'inherit'
                };`),

                // 'Inkoop': row => $('td').text(val(row.totInkoop)).style(styleValCol),
                // 'Marge': row => $('td').text(val(row.marge)).style(styleValCol),
                // 'Saldo': row => $('td').text(val(row.saldo)).style(styleValCol),
                'Dagen': row => $('td').text(num(row.dagen,0)).style(styleValCol+`color:${row.dagen>30 ? 'orange' : 'inherit'};`),
              };
              const clientManagers = clients.map(row => row.clientManager).unique().sort();
              const elem = $('div').parent(
                // $('link').rel('stylesheet').href(cssPrintUrl),
                $('div').parent(
                  Web.listview.elem.text('').append(
                    $('nav').append(
                      $('span'),
                      $('button').class('icn-print').on('click', e => elem.append(
                        $('link').rel('stylesheet').href(cssPrintUrl),
                      ).print()),
                    ),
                  )
                )
              );
              [
                [name, clients],
              ]
              .concat(clientManagers.map(cm => [cm, clients.filter(row => row.clientManager === cm)]))
              .forEach(([cm,clients])=>{
                const omzet1 = clients.map(row => Number(row.lastYear||0)).reduce((s,v) => s + v);
                const omzet2 = clients.map(row => Number(row.beforeLastYear||0)).reduce((s,v) => s + v);
                const saldo = clients.map(row => Number(row.saldo||0)).reduce((s,v) => s + v);
                const inkoop = clients.map(row => Number(row.totInkNetto||0)).reduce((s,v) => s + v);
                const marge = clients.map(row => Number(row.marge||0)).reduce((s,v) => s + v);
                elem.append(
                  $('h1').text('Analyse', name, 'Client Manager:', cm),
                  $('ul').append(
                    $('li').text( `Omzet afgelopen 365 dagen: ${num(omzet1)}`),
                    $('li').text( `Omzet jaar ervoor: ${num(omzet2)}`),
                    $('li').text( `Groei: ${num((omzet1-omzet2)/omzet2*100)}%`),
                    $('li').text( `Inkoop: ${num(inkoop)}`),
                    $('li').text( `Marge: ${num(marge)}`),
                    $('li').text( `Saldo: ${num(saldo)}`),
                  ),
                  $('details').open(true).append(
                    $('summary').text('Top Klanten omzet'),
                    Table.clienttable(clients.filter(row => row.dagen !== null).sort((a,b)=> b.lastYear - a.lastYear).slice(0,20), cols),
                  ),
                  $('details').open(true).append(
                    $('summary').text('Klanten top dalers'),
                    Table.clienttable(clients.sort((a,b)=> a.verschil - b.verschil).slice(0,30),  cols),
                  ),
                  $('details').open(true).append(
                    $('summary').text('Klanten top stijgers'),
                    Table.clienttable(clients.sort((a,b)=> b.verschil - a.verschil).slice(0,30),  cols),
                  ),
                  $('details').open(true).append(
                    $('summary').text('Klanten niet actief'),
                    Table.clienttable(clients.filter(row => row.dagen > 30).sort((a,b)=> a.dagen - b.dagen),  cols),
                  ),
                  //   {name: 'companyName'},
                  //   // {name: 'businessAddressCity'},
                  //   {name: 'lastYear', title: 'Afgelopen periode', calc: val, style: 'text-align:right;'},
                  //   {name: 'beforeLastYear', title: 'Periode daarvoor', calc: val, style: 'text-align:right;'},
                  //   {name: 'groei', calc: val, style: 'text-align:right;'},
                  //   {name: 'dagen'},
                  // ], {
                  //   style: row => `color:${row.groei<0 ? 'orange' : 'inherit'};`,
                  // }),
                  // klanten.map(row => $('details').append(
                  //   $('summary').text(row.companyName, row.dagen),
                  //   $('p').text(row.opmerking),
                  // ))

                )
              });
              // elem.print();
            },

            async bag() {
              await this.setCustomer();
              Listview.list(abisClient.serviceRoot + '/saleItem', {
                $filter: `customerId EQ '${this.id}' and quant NE 0`,
                $search: `*`,
                $top: 1000,
              });
            },
            async shoplist() {
              await this.setCustomer();
              Listview.list(abisClient.serviceRoot + '/saleItem', {
                // $filter: `(customerId eq '${this.id}') or (supplierId eq '${this.supplierId}' and customerId eq null)`,
                $filter: `customerId eq '${this.id}'`,
                $search: `*`,
                $top: 1000,
              });
            },
            async setCustomer() {
              if (definitions.company.customer !== this) {
                definitions.company.customer = this;
                sessionStorage.setItem('customerId', this.id);
                $('body>nav .icn-cart').caption(this.companyName || '');
                definitions.company.customer.items = await abisClient.api(`/saleItem`)
                .select('id,productId,discount')
                .filter(`customerId EQ '${this.id}'`)
                .top(1000)
                .get()
                .then(({value}) => value.map(Item.get));
                // console.log(1231, definitions.company.customer.items);
              }
            },
            async createOrder() {
              if (!definitions.company.customer.items) return alert ('Geen mandje');
              const items = definitions.company.customer.items.filter(item => item.quant);
              if (!items.length) return alert ('Mandje is leeg');
              // console.log(definitions.company.customer.items.length, definitions.company.customer.items.filter(item => item.quant));
              const purchaseOrder = await Item.get({
                schemaName: 'purchaseOrder',
                customerId: this.id,
                supplierId: this.supplierId,
              }).post();
              // console.log(8787687687,purchaseOrder);
              for (let item of items) {
                // console.log(purchaseOrder.id, item.saleItemId, item.quant, item);
                const purchaseOrderLine = await Item.get({
                  schemaName: 'purchaseOrderLine',
                  purchaseOrderId: purchaseOrder.id,
                  saleItemId: item.saleItemId,
                  quant: item.quant,
                }).post();
                // console.log(purchaseOrderLine);
                item.quant = null;
              }
              purchaseOrder.select();
              // console.log(purchaseOrder);
              // return;
              //
              //
              //
              // const [[row]] = await abisClient.api(`/createOrder`).post({
              //   customerId: this.id,
              // });
              // await Item.get(row).pageElem();
              // await Listview.list('https://abisingen.aliconnect.nl/v1/purchaseOrder', {
              //   $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && printDateTime EQ NULL',
              //   $order: 'purchaseorderId DESC',
              //   $search: '*',
              //   $top: 100,
              // });
              // Listview.list(abisingenClient.serviceRoot + '/customerItem', {
              //   $filter: `customerId EQ '${this.id}' && quant NE 0`,
              //   $search: `*`,
              //   $top: 999,
              // });
            },
            ondrop(event){
              const {dataTransfer,data,item} = event;
              if (item) {
                if (item.schemaName === 'person') {
                  Item.get({schemaName:'contact', companyId:this.id, personId:item.id}).post().then(item => item.select())
                } else if (item.schemaName === 'saleItem') {
                  item.supplierId = this.id;
                } else if (item.schemaName === 'company') {
                  item.supplierId = this.id;
                } else if ('companyId' in item) {
                  item.companyId = this.id;
                }
              }
            },
          },
        },
        person: {
          prototype:{
            // get pageNav() { return [
            //   $('button').class('icn-eye').append($('nav').append(
            //     $('button').class('icn-contact').caption('Contacten').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/contact', {
            //       $filter: `personId EQ '${this.id}'`,
            //       $search: `*`,
            //     })),
            //   )),
            //   $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            // ]},
          },
        },
        contact: {
          prototype:{
            // get pageNav() { return [
            //   $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            // ]},
          },
        },
        purchaseOrder: {
          prototype: {
            get pageNav() { return [
              this.buttonRelations(
                $('button').class('icn-table').caption('Bestelform').on('click', e => this.regels()),
              ),
              // $('button').class('icn-eye').append($('nav').append(
              //   $('button').class('icn-rows').caption('Regels').on('click', e => Listview.list('https://aliconnect.nl/v1/purchaseOrderLine', {
              //     $filter: `purchaseOrderId EQ '${this.id}'`,
              //     $top: 100,
              //   })),
              // )),
              $('button').class('icn-print').title('Leverbon').append(
                $('nav').append(
                  $('button').class('icn-receipt_bag').text('Pak bon').on('click', e => this.printPakbon()),
                  $('button').class('icn-receipt_bag').text('Lever bon').on('click', e => this.printLeverbon()),
                  $('button').class('icn-receipt_money').text('Contant bon').on('click', e => this.printPrijsbon()),
                  $('button').class('icn-receipt_money').text('Offerte').on('click', e => this.printOfferte()),
                  // $('button').class('icn-print').caption('Leverbon').title('Leverbon printen').on('click', async (event) => await (await leverbon(this.id)).printp()),
                )
              ),
              $('button').class('icn-send').title('Bevestiging').on('click', event => this.sendBevestiging()).append(
                $('nav').append(
                  $('button').class('icn-receipt_bag').caption('Bevestiging').on('click', event => this.sendBevestiging()),
                  $('button').class('icn-vehicle_truck_bag').caption('Verzonden').on('click', event => this.sendVerzonden()),
                )
              ),
              $('button').class('icn-arrow_download').on('click', event => this.pageElem(true)).append(
                $('nav').append(
                  $('button').class('icn-document_table_truck').caption('Visser').on('click', async e => {
                    function map(l,v,s=' ') {
                      return (String(s).repeat(l)+(v||'')).substr(-l);
                    }
                    const landcode = {
                      30: 'Griekenland',
                      31: 'Nederland',
                      32: 'Belgie',
                      33: 'Frankrijk',
                      34: 'Spanje',
                      39: 'Italie',
                      351: 'Portugal',
                      352: 'Luxemburg',
                      353: 'Ierland',
                      358: 'Finland',
                      43: 'Oostenrijk',
                      44: 'Engeland',
                      45: 'Denemarken',
                      46: 'Zweden',
                      49: 'Duitsland',
                    };
                    const zendingSoorten = {
                      1: 'Levering',
                      2: 'Afhaling',
                    };
                    const order = {
                      // kenmerk: '', // Kenmerk Nee 30A
                      losdatum: 'dd-mm-jjjj', // 83 92 Losdatum Ja 10A dd-mm-jjjj
                      soortZending: 0, // 107 114 Soort zending Ja 8N Zie tabel
                      afzenderNaam: '', // 115 144 Naam afzender Ja 30A
                      afzenderAdres: '', // 145 174 Adres afzender Ja 30A
                      afzenderHuisnummer: '', // 175 184 Huisnummer afzender Ja 10A
                      afzenderPostcode: '', // 185 191 Postcode afzender Ja 7A
                      afzenderPlaats: '', // 192 221 Plaats afzender Ja 30A
                      afzenderLandCode: 0, // 222 225 Landcode afzender Ja 4N Zie tabel
                      zendingId: '', // 226 255 Zending identificatie nummer (ZIN) Ja 30A
                      // laadOpmerking: '', // 256 375 Laadopmerking Nee 120A
                      // laadDatum: '', // 376 385 Laaddatum Nee 10A dd-mm-jjjj
                      // laadVan: '', // 386 390 Laadvan Nee 5A hh:mm
                      // laadTot: '', // 391 395 Laadtot Nee 5A hh:mm
                      // documentenBijgevoegd: 0, // 396 396 Originele documenten bijgevoegd Nee 1N 0 = Nee, 1 = Ja
                      // afzenderTav: '', // 397 426 Tav afzender Nee 30A

                      ontvangerNaam: '', // 3 32 Naam ontvanger Ja 30A
                      ontvangerAdres: '', // 33 62 Adres ontvanger Ja 30A
                      ontvangerHuisnummer: '', // 63 72 Huisnummer ontvanger Ja 10A
                      ontvangerPostcode: '', // 73 79 Postcode ontvanger Ja 7A
                      ontvangerPlaats: '', // 80 109 Plaats ontvanger Ja 30A
                      ontvangerLandCode: 0, // 110 113 Landcode ontvanger Ja 4N Zie tabel
                      totaalAantalColli: 0, // 114 117 Totaal aantal colli Ja 4N
                      totaalAantalPallets: 0, // 118 121 Totaal aantal pallets Ja 4N
                      totaalGewicht: 0, // 122 129 Totaal gewicht Ja 8N In hele Kg
                      // rembours: 0, // 130 137 Rembours Nee 8N In centen
                      // ontvangerTelefoon: '', // 198 227 Telefoonnummer ontvanger Nee 30A
                      // ontvangerEmail: '', // 228 287 Emailadres ontvanger Nee 60A
                      // losOpmerking: '', // 288 407 Losopmerking Nee 120A
                      // losVan: '', // 408 412 Losvan Nee 5A hh:mm
                      // losTot: '', // 413 417 Lostot Nee 5A hh:mm
                      // ontvangerTav: '', // 418 447 Tav ontvanger Nee 30A

                      details: [
                        {
                          aantalColli: 0, // 3 6 Aantal colli Ja 4N
                          gewichtColli: 0, // 7 14 Gewicht colli Ja 8N In hele Kg
                          // aantalPallets: 0, // 15 18 Aantal pallets Nee 4N
                          // gewichtPallets: 0, // 19 26 Gewicht pallets Nee 8N In hele Kg
                          verpakking: '', // 27 46 Verpakking Ja 20A
                          // volume: '', // 77 84 Volume Nee 8A Kubieke decimeter
                          // adrVervoersCategorie: '', // 85 94 ADR vervoerscategorie Nee 10A
                          // UnNummer: '', // 95 104 UN-nummer Nee 10A
                          // omschrijvingGoederen: '', // 105 164 Omschrijving goederen Nee 40A
                          // lengte: 0, // 225 232 Lengte Nee 8N Cm
                          // breedte: 0, // 233 240 Breedte Nee 8N Cm
                          // hoogte: 0, // 241 248 Hoogte Nee 8N Cm
                          // palletSoort: '', // 249 268 Palletsoort Nee 20A
                          // artikelNummer: '', // 269 288 Artikelnummer Nee 20A
                          // laadmeters: 0, // 289 296 Laadmeters Nee 8N X 100
                          // palletplaatsen: 0, // 297 304 Palletplaatsen Nee 8N X 100
                        },
                        {
                          aantalColli: 0, // 3 6 Aantal colli Ja 4N
                          gewichtColli: 0, // 7 14 Gewicht colli Ja 8N In hele Kg
                          verpakking: '', // 27 46 Verpakking Ja 20A
                        },
                        {
                          aantalColli: 0, // 3 6 Aantal colli Ja 4N
                          gewichtColli: 0, // 7 14 Gewicht colli Ja 8N In hele Kg
                          verpakking: '', // 27 46 Verpakking Ja 20A
                        },
                      ],
                      adr: [
                        {
                          unNr: 0, // 3 12 UN nummer Ja 10N
                          categorie: 0, // 13 22 Categorie Ja 10N
                          // stofnaam: '', // 23 102 Stofnaam Nee 80A
                          // stofnaam2: '', // 103 182 Stofnaam2 Nee 80A
                          etiket: '', // 183 192 Etiket Ja 10A
                          // factor: '', // 193 202 Factor Nee 10A
                          // klasse: '', // 203 217 Klasse Nee 15A
                          // milieugevaarlijk: 0, // 218 219 Milieugevaarlijk Nee 2N 0 = Nee, 1 = Ja
                          // tunnelcode: '', // 220 229 Tunnelcode Nee 10A
                          // verpakkingsgroep: '', // 230 234 Verpakkingsgroep Nee 5A
                          // afvalstof: 0, // 235 236 Afvalstof Nee 2N 0 = Nee, 1 = Ja
                          // gewicht: 0, // 237 246 Gewicht Nee 10N In hele Kg
                        },
                        {
                          unNr: 0, // 3 12 UN nummer Ja 10N
                          categorie: 0, // 13 22 Categorie Ja 10N
                          etiket: '', // 183 192 Etiket Ja 10A
                        },
                      ],
                    }
                    const data = [
                      [
                        map(2,10,0),
                        map(8,100396,0),
                        map(10,new Date().toISOString().substr(0,10)),
                        map(10,new Date().toISOString().substr(12,8)),
                        map(2,3,0),
                      ],
                      [
                        map(2,20,0), // RecordID // afzendergegevens
                        map(10,0,0), // VrachtbriefNummer, wordt niet gebruikt
                        map(30,order.kenmerk), // Kenmerk
                        map(10), // --- niet gebruikt --- Nee 10A
                        map(30), // 53 82 --- niet gebruikt --- Nee 30A
                        map(10,order.losdatum), // 83 92 Losdatum Ja 10A dd-mm-jjjj
                        map(10), // 93 102 --- niet gebruikt --- Nee 10A
                        map(4), // 103 106 --- niet gebruikt --- Nee 4A
                        map(8,order.soortZending,0), // 107 114 Soort zending Ja 8N Zie tabel
                        map(30,order.afzenderNaam), // 115 144 Naam afzender Ja 30A
                        map(30,order.afzenderAdres), // 145 174 Adres afzender Ja 30A
                        map(10,order.afzenderHuisnummer), // 175 184 Huisnummer afzender Ja 10A
                        map(7,order.afzenderPostcode), // 185 191 Postcode afzender Ja 7A
                        map(30,order.afzenderPlaats), // 192 221 Plaats afzender Ja 30A
                        map(4,order.afzenderLandCode,0), // 222 225 Landcode afzender Ja 4N Zie tabel
                        map(30,order.zendingId), // 226 255 Zending identificatie nummer (ZIN) Ja 30A
                        map(120,order.laadOpmerking), // 256 375 Laadopmerking Nee 120A
                        map(10,order.laadDatum), // 376 385 Laaddatum Nee 10A dd-mm-jjjj
                        map(5,order.laadVan), // 386 390 Laadvan Nee 5A hh:mm
                        map(5,order.laadTot), // 391 395 Laadtot Nee 5A hh:mm
                        map(1,0,0), // 396 396 Originele documenten bijgevoegd Nee 1N 0 = Nee, 1 = Ja
                        map(30,order.afzenderTav), // 397 426 Tav afzender Nee 30A
                      ],
                      [
                        map(2,30,0), // 1 2 Record ID Ja 2N 30 // ontvangergegevens
                        map(30,order.ontvangerNaam), // 3 32 Naam ontvanger Ja 30A
                        map(30,order.ontvangerAdres), // 33 62 Adres ontvanger Ja 30A
                        map(10,order.ontvangerHuisnummer), // 63 72 Huisnummer ontvanger Ja 10A
                        map(7,order.ontvangerPostcode), // 73 79 Postcode ontvanger Ja 7A
                        map(30,order.ontvangerPlaats), // 80 109 Plaats ontvanger Ja 30A
                        map(4,order.ontvangerLandCode,0), // 110 113 Landcode ontvanger Ja 4N Zie tabel
                        map(4,order.totaalAantalColli,0), // 114 117 Totaal aantal colli Ja 4N
                        map(4,order.totaalAantalPallets,0), // 118 121 Totaal aantal pallets Ja 4N
                        map(8,order.totaalGewicht,0), // 122 129 Totaal gewicht Ja 8N In hele Kg
                        map(8,order.rembours,0), // 130 137 Rembours Nee 8N In centen
                        map(60), // 138 197 --- niet gebruikt --- Nee 60A
                        map(30,order.ontvangerTelefoon), // 198 227 Telefoonnummer ontvanger Nee 30A
                        map(60,order.ontvangerEmail), // 228 287 Emailadres ontvanger Nee 60A
                        map(120,order.losOpmerking), // 288 407 Losopmerking Nee 120A
                        map(5,order.losVan), // 408 412 Losvan Nee 5A hh:mm
                        map(5,order.losTot), // 413 417 Lostot Nee 5A hh:mm
                        map(30,order.ontvangerTav), // 418 447 Tav ontvanger Nee 30A
                      ]
                    ].concat(
                      order.details.map(detail => [
                        map(2,50,0), // 1 2 Record ID Ja 2N 50 // detailgegevens
                        map(4,detail.aantalColli,0), // 3 6 Aantal colli Ja 4N
                        map(8,detail.gewichtColli,0), // 7 14 Gewicht colli Ja 8N In hele Kg
                        map(4,detail.aantalPallets,0), // 15 18 Aantal pallets Nee 4N
                        map(8,detail.gewichtPallets,0), // 19 26 Gewicht pallets Nee 8N In hele Kg
                        map(20,detail.verpakking), // 27 46 Verpakking Ja 20A
                        map(30), // 47 76 --- niet gebruikt --- Nee 30A
                        map(8,detail.volume), // 77 84 Volume Nee 8A Kubieke decimeter
                        map(10,detail.adrVervoersCategorie), // 85 94 ADR vervoerscategorie Nee 10A
                        map(10,detail.UnNummer), // 95 104 UN-nummer Nee 10A
                        map(40,detail.omschrijvingGoederen), // 105 164 Omschrijving goederen Nee 40A
                        map(80), // 165 224 --- niet gebruikt --- Nee 80A
                        map(8,detail.lengte,0), // 225 232 Lengte Nee 8N Cm
                        map(8,detail.breedte,0), // 233 240 Breedte Nee 8N Cm
                        map(8,detail.hoogte,0), // 241 248 Hoogte Nee 8N Cm
                        map(20,detail.palletSoort), // 249 268 Palletsoort Nee 20A
                        map(20,detail.artikelNummer), // 269 288 Artikelnummer Nee 20A
                        map(8,detail.laadmeters,0), // 289 296 Laadmeters Nee 8N X 100
                        map(8,detail.palletplaatsen,0), // 297 304 Palletplaatsen Nee 8N X 100
                      ]),
                      // [[
                      //   map(2,60,0), // 1 2 Record ID Ja 2N 60 // unieke nummers
                      //   map(40,order.barcode), // 3 42 Barcode Ja 40A
                      // ]],
                      order.adr.map(adr => [
                        map(2,70,0), // 1 2 Record ID Ja 2N 70 // ADR gegevens
                        map(10,adr.unNr,0), // 3 12 UN nummer Ja 10N
                        map(10,adr.categorie,0), // 13 22 Categorie Ja 10N
                        map(80,adr.stofnaam), // 23 102 Stofnaam Nee 80A
                        map(80,adr.stofnaam2), // 103 182 Stofnaam2 Nee 80A
                        map(10,adr.etiket), // 183 192 Etiket Ja 10A
                        map(10,adr.factor), // 193 202 Factor Nee 10A
                        map(15,adr.klasse), // 203 217 Klasse Nee 15A
                        map(2,adr.milieugevaarlijk,0), // 218 219 Milieugevaarlijk Nee 2N 0 = Nee, 1 = Ja
                        map(10,adr.tunnelcode), // 220 229 Tunnelcode Nee 10A
                        map(5,adr.verpakkingsgroep), // 230 234 Verpakkingsgroep Nee 5A
                        map(2,adr.afvalstof,0), // 235 236 Afvalstof Nee 2N 0 = Nee, 1 = Ja
                        map(10,adr.gewicht,0), // 237 246 Gewicht Nee 10N In hele Kg
                      ]),
                      [[
                        map(2,90,0),
                      ]],
                    ).map(r => r.join('')).join("\r\n");
                    // console.log(data);

                    const elem = $('a')
                    .text('visser')
                    .href('data:text/plain;charset=utf-8,' + encodeURIComponent(data))
                    .download('Visser.csv');
                    elem.elem.click();
                    elem.remove();
                  }),
                )
              ),
              $('button').class('icn-edit').on('click', event => this.pageElem(true)).append(
                $('nav').append([
                  {
                    disabled: this.pickedDateTime,
                    class: 'icn-shopping_bag_tag',
                    caption: 'Gepakt',
                    onclick: () => {
                      this.pickedDateTime = new Date().toLocaleDateString();
                      this.status = 2;
                    },
                  },
                  {
                    disabled: this.sendDateTime,
                    class: 'icn-vehicle_truck_bag',
                    caption: 'Verzonden',
                    onclick: () => {
                      this.sendDateTime = new Date().toLocaleDateString();
                      this.status = 3;
                    },
                  },
                  {
                    disabled: this.deliveredDateTime,
                    class: 'icn-vehicle_truck_bag',
                    caption: 'Geleverd',
                    onclick: () => {
                      this.deliveredDateTime = new Date().toLocaleDateString();
                      this.status = 4;
                    },
                  },
                  {
                    disabled: this.invoiceId,
                    class: 'icn-receipt_money',
                    caption: 'Factureren',
                    onclick: () => {
                      definitions.purchaseOrder.factureren([this]);
                      this.status = 5;
                    },
                  },
                  {
                    disabled: this.invoiceId,
                    class: 'icn-shopping_bag_pause',
                    caption: 'On hold',
                    onclick: () => {
                      this.onholdDateTime = new Date().toLocaleDateString();
                      this.status = 6;
                    },
                  },
                ].map(btn => $('button').disabled(btn.disabled).class(btn.class).caption(btn.caption).on('click', event => {
                  event.preventDefault();
                  event.stopPropagation();
                  this.onholdDateTime = null;
                  btn.onclick();
                  this.refresh();
                }))),
                  // .disabled(this.factuurId || !this.printDatumTijd || !this.gepaktDatumTijd || !this.verstuurdDatumTijd || !this.leverDatumTijd)
                  // .title('Bon Factureren').on('click', async e => await lijstFactureren([this])),
                  // (function() {
                  //   if (this.sendDateTime) return $('button').class('icn-next').caption('Factureren');
                  //   if (this.pickedDateTime) return $('button').class('icn-next').caption('Verzonden');
                  //   if (this.printDateTime) return $('button').class('icn-next').caption('Gepakt');
                  // // })(),
                  // $('button').disabled(this.pickedDateTime).class('icn-shopping_bag_tag').caption('Gepakt').on('click', (event) => {
                  //   event.preventDefault(event.stopPropagation());
                  //   event.stopPropagation();
                  //   this.pickedDateTime = new Date().toLocaleDateString();
                  //   this.status = 2;
                  // }),
                  // $('button').disabled(this.sendDateTime).class('icn-vehicle_truck_bag').caption('Verzonden').on('click', (event) => event.preventDefault(event.stopPropagation(this.sendDateTime = new Date().toLocaleDateString()))),
                  // $('button').disabled(this.invoiceId).class('icn-receipt_money').caption('Factureren').on('click', (event) => event.preventDefault(event.stopPropagation(definitions.purchaseOrder.factureren([this])))),
                  // // $('button').class('icn-receipt_money').caption('Factureren'),
                  // $('button').class('icn-shopping_bag_pause').caption('On hold'),
                // ),
              ),

              // !row.gepaktDatumTijd ? $('button').caption('Gepakt') : null,
              // row.gepaktDatumTijd && !row.verstuurdDatumTijd ? $('button').caption('Verzonden') : null,
              // row.gepaktDatumTijd && !row.leverDatumTijd ? $('button').caption('Verzonden') : null,
              // $('button').caption('Status').append(
              //   $('nav').append(
              //     $('button').caption('Gepakt'),
              //     $('button').caption('Verzonden'),
              //     $('button').caption('Geleverd'),
              //   )
              // )
              //

              // row.factuurId ? [
              //   // $('button').class('abtn invoice').title('Factuur printen').on('click', async e => (await getfactuur(row.factuurId)).printpdf()),
              //   $('button').class('abtn invoice').title('Factuur printen').on('click', e => toonFactuur({
              //     afzenderNaam: row.afzenderNaam,
              //     factuurNr: row.factuurNr,
              //     uid: row.factuurUId,
              //     jaar: row.jaar,
              //   })),
              //   // !row.clientOtherMailAddress ? null : $('button').class('icn-mail-send').title('Factuur verzenden').on('click', async e => await sendInvoice(await getfactuur(row.invoiceNr), factuurData)),
              // ] : [
              //   $('button').text('Factureren').on('click', async e => await lijstFactureren([row])),
              // ],
            ]},
            headerTable() {
              return headerTable([{
                'Ordernummer': {text: this.purchaseOrderId},
                'Klantnummer': {text: this.customer.companyId, style:'width:100%;'},
              }, {
                'Orderdatum': {text: new Date(this.orderDateTime).toLocaleDateString()},
                'Uw referentie': {text: this.customerReference},
              }, {
                'Bestelwijze': {text: this.properties.orderType.options[this.orderType||0].title},
                'Transport': {text: this.properties.transportType.options[this.transportType||0].title},
              }]);
            },
            async getAll() {
              const {customerId,supplierId} = this;
              this.customer = this.customer || await this.getCompany(customerId);
              this.supplier = this.supplier || await this.getCompany(supplierId);
              // const {customer,supplier} = this;
              // this.customer = await abisClient.api(`/company(${this.customerId})`).select([
              //   'id,companyId,companyName',
              //   'businessAddressStreet,businessAddressStreet2,businessAddressStreet3,businessAddressPostalCode,businessAddressCity,businessAddressCountry',
              //   'otherAddressStreet,otherAddressStreet2,otherAddressStreet3,otherAddressPostalCode,otherAddressCity,otherAddressCountry',
              //   'emailAddress0,emailAddress1,btwTarief'
              //   // 'supplierCode,keyword'
              // ].join(',')).get();
              // this.supplier = await abisClient.api(`/company(${this.supplierId})`).select([
              //   'id,companyId,companyName',
              //   'businessAddressStreet,businessAddressStreet2,businessAddressStreet3,businessAddressPostalCode,businessAddressCity,businessAddressCountry',
              //   'otherAddressStreet,otherAddressStreet2,otherAddressStreet3,otherAddressPostalCode,otherAddressCity,otherAddressCountry',
              //   'businessHomePage,businessEmailAdres,businessPhone,businessFax,businessMobilePhone',
              //   'logoUrl,organizationalIDNumber,btwNummer,bic,iban,supplierCode,keyword',
              // ].join(',')).get();
              // // this.supplier.stylesheet = `https://aliconnect.nl/sdk@0.0.10_/src/css/print.css`;
              // this.supplier.stylesheet = `https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css`;
              // // this.supplier.logo = `https://proving-nl.aliconnect.nl/assets/img/letter-header-${this.supplier.keyword}.png`;
              this.rows = await abisClient.api(`/purchaseOrderLine`)
              .select('lastModifiedDateTime,purchaseOrderId,storageLocation,quant,packUnit,saleItemNr,code,description,unNr,unCat,note,privateNote,weight,listprice,discount')
              .filter(`deletedDateTime EQ NULL && purchaseOrderId EQ '${this.id}'`)
              .get().then(({value}) => value);
              this.rows.forEach(row => {
                row.totWeight = row.weight * row.quant;
                row.price = round(row.listprice * (100-(row.discount||0)) / 100);
                row.tot = round(row.quant * row.price, 2);
              });
              this.totExcl = round(this.rows.map(row => row.tot).reduce((t,n) => t+n,0));
              return this;
            },
            async printPakbon() {
              this.printDateTime = new Date().toLocaleString();
              await this.getAll();
              const {supplier,customer,rows} = this;
              const elem = await this.letterElem({
                from: supplier,
                to: customer,
                name: 'PAK BON',
                qrcode: 'O'+this.purchaseOrderId.pad(8),
                barcode: this.purchaseOrderId.pad(8),
                // addressname: 'otherAddress'
              });
              elem.append(
                this.remark ? $('div').text(this.remark).style('padding:2mm;border:solid 1px red;margin-top:5mm;') : null,
                $('table').style('margin-top:5mm;').append(
                  $('thead').class('grid').append(
                    $('tr').append(
                      $('td').colspan(5).style('padding:0;').append(this.headerTable())
                    ),
                    $('tr').append(
                      $('th').class('nr').text('Aantal'),
                      $('th').style('width:100%;').text('Omschrijving'),
                      $('th').text('Vak'),
                      $('th').class('nr').text('Art.nr.'),
                      $('th').class('nr').text('Gew.'),
                    ),
                  ),
                  $('tbody').class('grid').append(
                    rows.map((row,i) => $('tr').append(
                      $('td').class('nr').text(row.quant),
                      $('td').style('white-space:normal;word-break:break-word;').append(
                        $('b').text([row.code, row.packUnit].join(', ')),
                        ', ' + (row.description||'').replace(/\r|\n/g,'') + ' ',
                        $('b').text(row.note),
                      ),
                      $('td').class('nr').text(row.storageLocation),
                      $('td').class('nr').text(row.saleItemNr ? row.saleItemNr : ''),
                      $('td').class('nr').text(row.totWeight),
                    )),
                    $('tr').append(
                      $('td'),
                      $('td'),
                      $('td'),
                      $('td'),
                      $('td').class('nr').text(num(rows.map(row => row.quant * row.weight).reduce((tot,val)=>tot+=val,0))),
                    ),
                  ),
                ),
              ).printpdf();
              // $('div').append(
              //   $('link').rel('stylesheet').href(`https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css`),
              //     $('table').append(
              //       $('tr').append(
              //         $('td').colspan(5).append(
              //           $('table').append(
              //             $('tr').append(
              //               $('td').style('width:100%;').append(
              //                 $('div').text('PAK BON').style('font-weight:bold;font-size:1.2em;'),
              //                 $('div').class('bc').text(`*${this.purchaseOrderId}*`),
              //                 await $('img').style('height:15mm;margin-left:10mm;').qrcode(`*${this.purchaseOrderId}*`),
              //                 $('div').style('margin-top:10mm;').text(customer.companyName),
              //                 $('div').text(customer.businessAddressStreet, customer.businessAddressStreet2, customer.businessAddressStreet3),
              //                 $('div').text(customer.businessAddressPostalCode, customer.businessAddressCity, customer.businessAddressState, customer.businessAddressCountry),
              //               ),
              //               $('td').style('white-space:nowrap;').append(
              //                 $('div').text(supplier.companyName).style('font-weight:bold;'),
              //                 $('div').style('font-size:0.9em;').append(
              //                   $('div').text(supplier.businessAddressStreet, supplier.businessAddressStreet2, supplier.businessAddressStreet3),
              //                   $('div').text(supplier.businessAddressPostalCode, supplier.businessAddressCity, supplier.businessAddressState, supplier.businessAddressCountry),
              //                   $('div').text(supplier.otherAddressStreet, supplier.otherAddressStreet2, supplier.otherAddressStreet3),
              //                   $('div').text(supplier.otherAddressPostalCode, supplier.otherAddressCity, supplier.otherAddressState, supplier.otherAddressCountry),
              //                   $('div').class('homepage').attr({after:supplier.businessHomePage}),
              //                   $('div').class('email').attr({after:supplier.businessEmailAdres}),
              //                   $('div').class('phone').attr({after:supplier.businessPhone}),
              //                   // $('div').class('fax').attr({after:supplier.businessFax}),
              //                   // $('div').class('mobile').attr({after:supplier.businessMobilePhone}),
              //                   $('div').class('kvk').attr({after:supplier.organizationalIDNumber}),
              //                   $('div').class('btw').attr({after:supplier.btwNummer}),
              //                   $('div').class('bic').attr({after:supplier.bic}),
              //                   $('div').class('iban').attr({after:supplier.iban}),
              //                 ),
              //               ),
              //             ),
              //           ),
              //         ),
              //       ),
              //     ),
              // ).printpdf()
            },
            async printLeverbon() {
              await this.getAll();
              const {supplier,customer,rows} = this;
              await this.letterElem({
                from: supplier,
                to: customer,
                name: 'LEVER BON',
                // addressname: 'otherAddress'
              }).then(elem => elem.append(
                this.remark ? $('div').text(this.remark).style('padding:2mm;border:solid 1px red;margin-top:2mm;') : null,
                $('table').class('grid').style('width:100%;').append(
                  $('thead').append(
                    $('tr').append(
                      $('td').colspan(3).style('padding:0;').append(this.headerTable())
                    ),
                    $('tr').append(
                      $('th').class('nr').text('Aantal'),
                      $('th').class('nr').text('Art.nr.'),
                      $('th').style('width:100%;').text('Omschrijving'),
                    ),
                  ),
                  $('tbody').append(
                    rows.map((row,i) => $('tr').append(
                      $('td').class('nr').text(row.quant),
                      $('td').class('nr').text(row.saleItemNr ? row.saleItemNr : ''),
                      $('td').style('white-space:normal;word-break:break-word;').append(
                        (row.description||'').replace(/\r|\n/g,'') + ' ',
                        $('b').text(row.note),
                      ),
                    )),
                  ),
                ),
              ).print());
            },
            async printPrijsbon() {
              await this.getAll();
              const {supplier,customer,rows} = this;
              await this.letterElem({
                from: supplier,
                to: customer,
                name: 'CONTANT BON',
                // addressname: 'otherAddress'
              }).then(elem => elem.append(
                this.remark ? $('div').text(this.remark).style('padding:2mm;border:solid 1px red;margin-top:2mm;') : null,
                $('table').class('grid').style('width:100%;').append(
                  $('thead').append(
                    $('tr').append(
                      $('td').colspan(6).style('padding:0;').append(this.headerTable())
                    ),
                    $('tr').append(
                      $('th').class('nr').text('Aantal'),
                      $('th').text('Art.nr.'),
                      $('th').style('width:100%;').text('Omschrijving'),
                      $('th').class('nr').text('Bruto'),
                      $('th').class('nr').text('Kort.'),
                      $('th').class('nr').text('Totaal'),
                    ),
                  ),
                  $('tbody').append(
                    rows.map((row,i) => $('tr').append(
                      $('td').class('nr').text(row.quant),
                      $('td').class('nr').text(row.saleItemNr ? row.saleItemNr : ''),
                      $('td').style('white-space:normal;word-break:break-word;').html([
                        (row.description||'').replace(/\r|\n/g,''),
                        row.note,
                      ].filter(Boolean).join(', ')),
                      $('td').class('nr').text(row.listprice ? num(row.listprice) : ''),
                      $('td').class('nr').text(row.discount ? row.discount : ''),
                      $('td').class('nr').text(num(row.tot || 0)),
                    )),
                  ),
                ),
                $('table').class('grid').style('position:absolute;left: 0;right: 0;bottom: 0;').append(
                  $('tr').append(
                    $('th').class('nr').text(`Totaal Excl.`).style('width:100%;'),
                    $('th').class('nr').text(`Btw ${this.customer.btwTarief}%`),
                    $('th').class('nr').text(`TE BETALEN`),
                  ),
                  $('tr').append(
                    $('td').class('nr').text(num(this.totExcl)),
                    $('td').class('nr').text(num(this.totBtw = this.totExcl * this.customer.btwTarief / 100)),
                    $('td').class('nr').append($('b').text(num(this.totIncl = this.totExcl + this.totBtw))),
                  ),
                ),
              ).printpdf())
            },
            async sendBevestiging() {
              await this.getAll();
              const {supplier,customer,rows} = this;
              const from = supplier.invoiceSenderMailAddress;
              var to = this.customer.emailAddress0;
              const content = `Geachte heer / mevrouw,

              Hierbij ontvangt U een orderbevestiging van ${this.supplier.companyName} voor ${this.customer.companyName} over geleverde goederen.

              Wij gaan zo snel mogelijk aan de slag.

              to ${to}

              Met vriendelijke groet,  \nAdministratie  \n${this.supplier.companyName}
              `;

              // console.log(content);
              const maildata = {
                from,
                to,
                // to: 'max.van.kampen@alicon.nl',
                // bcc: from,
                chapters: [{
                  title: `Orderbevestiging ${this.purchaseOrderId} van ${this.supplier.companyName} voor ${this.customer.companyName}`,
                  content: content.render(),
                }, {
                  title: `Artikel overzicht`,
                  content: $('table').class('grid').append(
                    $('thead').append(
                      $('tr').append(
                        $('th').class('nr').text('Aantal'),
                        $('th').class('nr').text('Art.nr.'),
                        $('th').style('width:100%;').text('Omschrijving'),
                      ),
                    ),
                    $('tbody').append(
                      rows.map((row,i) => $('tr').append(
                        $('td').class('nr').text(row.quant),
                        $('td').class('nr').text(row.saleItemId ? row.saleItemId : ''),
                        $('td').style('white-space:normal;word-break:break-word;').append(
                          row.description.replace(/\r|\n/g,'') + ' ',
                          $('b').text(row.note),
                        ),
                      )),
                    ),
                  ).outerHTML,
                }],
              };
              await abisClient.api('/me/mail/send').body(maildata).post().then(body => console.log(body));
            },
            async sendVerzonden() {
              await this.getAll();
              const {supplier,customer,rows} = this;
              const from = supplier.invoiceSenderMailAddress;
              var to = this.customer.emailAddress0;
              const content = `Geachte heer / mevrouw,

              Uw order van ${this.supplier.companyName} voor ${this.customer.companyName} is zojuist verzonden.

              Deze wordt zo snel mogelijk geleverd.

              Met vriendelijke groet,  \nAdministratie  \n${this.supplier.companyName}
              `;

              // console.log(content);
              const maildata = {
                from,
                to,
                // to: 'max.van.kampen@alicon.nl',
                // bcc: from,
                chapters: [{
                  title: `Orderbevestiging ${this.purchaseOrderId} van ${this.supplier.companyName} voor ${this.customer.companyName}`,
                  content: content.render(),
                }, {
                  title: `Artikel overzicht`,
                  content: $('table').class('grid').append(
                    $('thead').append(
                      $('tr').append(
                        $('th').class('nr').text('Aantal'),
                        $('th').class('nr').text('Art.nr.'),
                        $('th').style('width:100%;').text('Omschrijving'),
                      ),
                    ),
                    $('tbody').append(
                      rows.map((row,i) => $('tr').append(
                        $('td').class('nr').text(row.quant),
                        $('td').class('nr').text(row.saleItemId ? row.saleItemId : ''),
                        $('td').style('white-space:normal;word-break:break-word;').append(
                          row.description.replace(/\r|\n/g,'') + ' ',
                          $('b').text(row.note),
                        ),
                      )),
                    ),
                  ).outerHTML,
                }],
              };
              // return console.debug(maildata);
              await abisClient.api('/me/mail/send').body(maildata).post().then(body => console.log(body));
            },
          },
          async factureren(purchaseOrders){
            for (let customerId of purchaseOrders.map(po => po.customerId).unique()) {
              const customer = await Item.get({schemaName:'company', id:customerId}).api().select('companyName,supplierId').get().then(Item.get);
              const invoice = await Item.get({
                schemaName: 'invoice',
                customerId,
                supplierId: customer.supplierId,
              }).post();
              // console.log(1, invoice);
              for (let purchaseOrder of purchaseOrders.filter(po => po.customerId === customerId)) {
                await purchaseOrder.setAttribute('invoiceId', invoice.id);
                const rows = await abisClient.api(`/purchaseOrderLine`)
                .select('invoiceId').filter(`purchaseOrderId EQ '${purchaseOrder.id}'`).get().then(({value}) => value.map(Item.get));
                // console.log(rows);
                for (let row of rows) {
                  await row.setAttribute('invoiceId', invoice.id);
                }
              }
              // await invoice.api().get();
              // console.log(2324234, invoice);
              invoice.select();
              await invoice.send();
              // console.log(2);
            }
          },
        },
        invoice: {
          prototype: {
            get pageNav() { return [
              this.buttonRelations(),
              // $('button').class('icn-eye').append($('nav').append(
              //   $('button').class('icn-rows').caption('Orders').on('click', e => Listview.list('https://aliconnect.nl/v1/purchaseOrder', {
              //     $filter: `invoiceId EQ '${this.id}'`,
              //     $top: 100,
              //   })),
              //   $('button').class('icn-rows').caption('Regels').on('click', e => Listview.list('https://aliconnect.nl/v1/purchaseOrderLine', {
              //     $filter: `invoiceId EQ '${this.id}'`,
              //     $top: 100,
              //   })),
              // )),
              $('button').class('icn-print').title('Factuur printen').on('click', e => this.print()).append($('nav').append(
                // $('button').class('icn-document').text('Factuur').on('click', e => this.print()),
              )),
              $('button').class('icn-send').title('Factuur verzenden').on('click', e => this.send()).append($('nav').append(
                // $('button').class('icn-document').text('Factuur').on('click', e => this.send()),
              )),
              $('button').class('icn-edit').on('click', event => this.pageElem(true)).append($('nav').append(
                $('button').class('icn-document').text('Factuur').title('Factuur opnieuw opbouwen').on('click', event => event.stopPropagation(this.create())),
              )),
            ]},
            get invoiceElem() {
              const item = this;
              const {supplier,customer,orders,rows} = this;
              console.log(rows);
              const mailtext = '';
              const els = {};
              let totaal = 0;
              let betaald = 0;
              let pos;
              // const elem = $('div').append(
              //   $('link').rel('stylesheet').href(supplier.stylesheet),
              //   $('header').style('position: fixed;top: 0;left: 0;right: 0;bottom: -10mm;border: solid 1px black;'),
              //   $('table').style('width:100%;').append(
              //     $('thead').append(
              //       $('tr').append(
              //         $('td').style('border-left:solid 2px white;border-right:solid 2px white;border-top:solid 2px white;').colspan(6).append(
              //           $('img').style('width:100%;').src(supplier.logoUrl),
              //         )
              //       )
              //     ),
              //     $('tr').append(
              //       $('td').style('border-left:solid 2px white;border-right:solid 2px white;border-top:solid 2px white;').colspan(6).append(
              //         $('table').style('width:100%;margin-bottom:8mm;').append(
              //           $('tr').append(
              //             $('td').style('width:100%;').append(
              //               $('div').text('FACTUUR').style('font-weight:bold;font-size:1.2em;'),
              //               $('div').style('margin-top:10mm;').text(customer.companyName),
              //               $('div').text(customer.otherAddressStreet || customer.businessAddressStreet, customer.otherAddressStreet2 || customer.businessAddressStreet2, customer.otherAddressStreet3 || customer.businessAddressStreet3),
              //               $('div').text(customer.otherAddressPostalCode || customer.businessAddressPostalCode, customer.otherAddressCity || customer.businessAddressCity, customer.otherAddressCountry || customer.businessAddressCountry),
              //             ),
              //             $('td').style('white-space:nowrap;').append(
              //               $('div').text(supplier.companyName).style('font-weight:bold;'),
              //               $('div').style('font-size:0.9em;').append(
              //                 // $('p').append(
              //                   $('div').text(supplier.businessAddressStreet, supplier.businessAddressStreet2, supplier.businessAddressStreet3),
              //                   $('div').text(supplier.businessAddressPostalCode, supplier.businessAddressCity, supplier.businessAddressState, supplier.businessAddressCountry),
              //                 // ),
              //                 // $('p').append(
              //                   $('div').text(supplier.otherAddressStreet, supplier.otherAddressStreet2, supplier.otherAddressStreet3),
              //                   $('div').text(supplier.otherAddressPostalCode, supplier.otherAddressCity, supplier.otherAddressState, supplier.otherAddressCountry),
              //                 // ),
              //                 $('div').class('homepage').attr({after:supplier.businessHomePage}),
              //                 $('div').class('email').attr({after:supplier.businessEmailAdres}),
              //                 $('div').class('phone').attr({after:supplier.businessPhone}),
              //                 $('div').class('fax').attr({after:supplier.businessFax}),
              //                 $('div').class('mobile').attr({after:supplier.businessMobilePhone}),
              //                 $('div').class('kvk').attr({after:supplier.organizationalIDNumber}),
              //                 $('div').class('btw').attr({after:supplier.btwNummer}),
              //                 $('div').class('bic').attr({after:supplier.bic}),
              //                 $('div').class('iban').attr({after:supplier.iban}),
              //               ),
              //             ),
              //           ),
              //         ),
              //       ),
              //     ),
              //   ),
              // )
              const elem = [
                $('table').append(
                  $('thead').class('grid').append(
                    $('tr').append(
                      $('td').colspan(6).style('padding:0;').append(
                        $('table').style('border-style: hidden;').append(
                          $('tr').append(
                            $('th').text('Factuurnummer'),
                            $('td').text(item.invoiceNr),
                            $('th').text('Klantnummer'),
                            $('td').text(item.customerNr.pad(5)).style('width:100%;'),
                            // $('th').text('Totaal Excl.'),
                            // $('td').text(num(item.totExcl)).style('text-align:right;'),
                          ),
                          $('tr').append(
                            $('th').text('Factuurdatum'),
                            $('td').text(new Date(item.invoiceDateTime).toLocaleDateString()),
                            $('th').text('Debiteurnummer'),
                            $('td').text(item.debNummer),
                            // $('th').text(`Btw ${item.btwTarief}%`),
                            // $('td').text(num(item.totBtw = Math.round(item.totExcl * item.btwTarief)/100)).style('text-align:right;'),
                          ),
                          $('tr').append(
                            $('th').text('Vervaldatum'),
                            $('td').text(new Date(item.invoiceDateTime).addDays(30).toLocaleDateString()),
                            $('th').text('BTW nummer'),
                            $('td').text(item.btwNummer),
                            // $('th').text('TE BETALEN'),
                            // $('td').text(num(item.totIncl = item.totExcl + item.totBtw)).style('text-align:right;font-weight:bold;'),
                          ),
                        ),
                      )
                    ),
                    $('tr').append(
                      $('th').class('nr').text('Aantal'),
                      $('th').text('Art.nr.'),
                      $('th').style('width:100%;').text('Omschrijving'),
                      $('th').class('nr').text('Bruto'),
                      $('th').class('nr').text('Kort.'),
                      $('th').class('nr').text('Totaal'),
                    )
                  ),
                  $('tbody').class('grid').append(
                    ...orders.map((purchaseOrder,i) => [$('tr').append(
                      $('td').colspan(6).style('white-space:normal;word-break:break-word;font-style:italic;').text([
                        'Order: ' + purchaseOrder.purchaseOrderId,
                        'Datum: ' + new Date(purchaseOrder.orderDateTime).toLocaleDateString(),
                        purchaseOrder.customerReference ? 'Ref: ' + purchaseOrder.customerReference : null,
                        // new Date(purchaseOrder.sendDateTime).toLocaleDateString(),
                      ].filter(Boolean).join(', ')),
                    )].concat(
                      rows.filter(row => row.purchaseOrderId.toLowerCase() === purchaseOrder.id).map((row,i) => $('tr').append(
                        $('td').class('nr').text(row.quant),
                        $('td').class('nr').text(row.saleItemNr ? row.saleItemNr : ''),
                        $('td').style('white-space:normal;word-break:break-word;').html([
                          (row.description||'').replace(/\r|\n/g,''),
                          row.note,
                        ].filter(Boolean).join(', ')),
                        $('td').class('nr').text(row.listprice ? num(row.listprice) : ''),
                        $('td').class('nr').text(row.discount ? row.discount : ''),
                        $('td').class('nr').text(num(row.tot || 0)),
                      )),
                    )),
                  ),
                ),
                $('table').class('grid').style('position:absolute;left: 0;right: 0;bottom: 0;').append(
                  $('thead').append(
                    els.trh = $('tr').style('background:#ddd;'),
                  ),
                  $('tbody').append(
                    els.trb = $('tr'),
                  ),
                ),
              ];
              els.trh.append($('th'));
              els.trb.append($('td').style('width:100%;'));
              var {totExcl} = item;
              if (Number(item.payDiscount)) {
                const payDiscount = round(totExcl * item.payDiscount / 100, 2);
                els.trh.append($('th').class('nr').text(`Totaal`));
                els.trb.append($('td').class('nr').text(num(totExcl)));

                els.trh.append($('th').class('nr').text(`Korting Contant ${item.payDiscount}%`));
                els.trb.append($('td').class('nr').text(num(payDiscount)));
                totExcl -= payDiscount;
              }
              item.totBtw = round(totExcl * item.btwTarief / 100, 2);
              item.totIncl = totExcl + item.totBtw;
              els.trh.append($('th').class('nr').text(`Totaal Excl.`));
              els.trb.append($('td').class('nr').text(num(totExcl)));
              els.trh.append($('th').class('nr').text(`Btw ${item.btwTarief}%`));
              els.trb.append($('td').class('nr').text(num(item.totBtw)));
              els.trh.append($('th').class('nr').text(`TE BETALEN`));
              els.trb.append($('td').class('nr').append($('b').text(num(item.totIncl))));
              return elem;
            },
            async getAll() {
              const {customerId,supplierId} = this;
              this.customer = this.customer || await this.getCompany(customerId);
              this.supplier = this.supplier || await this.getCompany(supplierId);
              // const {customer,supplier} = this;
              // this.customer = this.customer || await abisClient.api(`/company(${this.customerId})`).select([
              //   'companyName,id',
              //   'businessAddressStreet,businessAddressStreet2,businessAddressStreet3,businessAddressPostalCode,businessAddressCity,businessAddressCountry',
              //   'otherAddressStreet,otherAddressStreet2,otherAddressStreet3,otherAddressPostalCode,otherAddressCity,otherAddressCountry',
              //   'emailAddress1'
              //   // 'supplierCode,keyword'
              // ].join(',')).get();
              // this.supplier = this.supplier || await abisClient.api(`/company(${this.supplierId})`).select([
              //   'companyName,id',
              //   'businessAddressStreet,businessAddressStreet2,businessAddressStreet3,businessAddressPostalCode,businessAddressCity,businessAddressCountry',
              //   'otherAddressStreet,otherAddressStreet2,otherAddressStreet3,otherAddressPostalCode,otherAddressCity,otherAddressCountry',
              //   'businessHomePage,businessEmailAdres,businessPhone,businessFax,businessMobilePhone',
              //   'logoUrl,organizationalIDNumber,btwNummer,bic,iban,supplierCode,keyword',
              //   'invoiceSenderMailAddress',
              // ].join(',')).get();
              // this.supplier.stylesheet = `https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css`;
              // this.supplier.logo = `https://proving-nl.aliconnect.nl/assets/img/letter-header-${this.supplier.keyword}.png`;
              var {value} = await abisClient.api(`/purchaseOrder`)
              .select('purchaseOrderId,createdDateTime,sendDateTime,orderDateTime,customerId,customerReference')
              .filter(`invoiceId EQ '${this.id}' && deletedDateTime EQ NULL`)
              .get();
              this.orders = value;
              this.rows = await abisClient.api(`/purchaseOrderLine`).top(9999)
              .select('lastModifiedDateTime,purchaseOrderId,loc,pos,quant,unit,saleItemId,saleItemNr,code,description,unNr,unCat,note,privateNote,weight,listprice,discount')
              .filter(`invoiceId EQ '${this.id}' && deletedDateTime EQ NULL`)
              .order('lastModifiedDateTime').get().then(({value}) => value.map(Item.get));
              this.rows.forEach(row => {
                row.totWeight = row.weight * row.quant;
                row.price = round(row.listprice * (100-(row.discount||0)) / 100);
                row.tot = round(row.quant * row.price, 2);
              });
              this.totExcl = round(this.rows.map(row => row.tot).reduce((t,n) => t+n,0));
              return this;
            },
            async create() {
              await this.getAll();
              let {supplier,customer} = this;
              return this.letterElem({
                from: supplier,
                to: customer,
                name: 'Factuur',
                addressname: 'otherAddress'
              }).then(elem => {
                elem.append(this.invoiceElem);
                this.bodyHtml = elem.innerHTML;
                elem.remove();
                return this.bodyHtml;
              });
            },
            async getBodyHtml() {
              if (!this.bodyHtml) {
                await this.create();
              }
              return this.bodyHtml;
            },
            async print() {
              await this.getBodyHtml();
              // console.log(this.bodyHtml);
              $('div').html(this.bodyHtml).printpdf();
            },
            async send() {
              await this.getAll();
              let {supplier,customer,rows,invoiceId,invoiceNr} = this;
              invoiceNr = invoiceId;
              var jaar = (new Date(this.invoiceDateTime)).getYear();
              const content = `Geachte heer / mevrouw,

              Hierbij ontvangt ${customer.companyName} een factuur aangaande de door ${supplier.companyName} geleverde goederen.

              Voor automatische verwerking van uw digitale facturen is uw factuur bijgevoegd als bijlage.
              Wij willen u erop attenderen dat digitale factuurbestanden gedurende zeven jaar bewaard dienen te worden.
              Meer informatie vindt u op [belastingdienst.nl](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/administratie_bewaren/administratie_bewaren).
              Het bewaren van (alleen) een afdruk van de digitaal ontvangen facturen op papier is niet voldoende,
              U dient uw digitale factuur ook digitaal te bewaren.

              Voor eventuele vragen over de factuur kunt u zich richten tot onze financiële administratie
              via e-mail: [administratie@${supplier.keyword}.nl](mailto:administratie@${supplier.keyword}.nl?SUBJECT=Vraag over factuur ${invoiceId}&BODY=Beste administratie,%0A%0ANamens ${customer.companyName} heb ik een vraag aangaande factuur ${invoiceNr}: ... ?%0A%0AMet vriendelijke groet,%0A${customer.companyName})
              of telefonisch: ${supplier.businessPhone}

              Indien U vragen heeft over de geleverde artikelen kunt u contact opnemen
              via e-mail: [verkoop@${supplier.keyword}.nl](mailto:verkoop@${supplier.keyword}.nl?SUBJECT=Inhoudelijke vragen over factuur ${invoiceNr}&BODY=Beste administratie,%0A%0ANamens ${customer.companyName} heb ik een vraag aangaande factuur ${invoiceNr}: ... ?%0A%0AMet vriendelijke groet,%0A${customer.companyName})

              Met vriendelijke groet,  \nAdministratie  \n${supplier.companyName}
              `;
              this.lastSendDateTime = new Date().toLocaleString();
              const maildata = {
                from: supplier.invoiceSenderMailAddress,
                to: customer.emailAddress1,
                // bcc: from,
                chapters: [{
                  title: `${supplier.companyName} factuur ${invoiceNr} voor ${customer.companyName}`,
                  content: content.render(),
                }],
                attachements: [{
                  name: `${supplier.companyName}-factuur-${invoiceNr}-${customer.companyName}`.toLowerCase().replace(/\.|\s/g,'_')+'.pdf',
                  content: await this.getBodyHtml(),
                }]
              };
              await abisClient.api('/me/mail/send').body(maildata).post().then(body => console.log(body));
            }
          },
          // async sendInvoice(factuurElem, factuur) {
          //   // const [clientInvoices,clientOrders,rows] = factuurData;
          //   // const [invoice] = clientInvoices;
          //   // const invoiceNr = invoice.nr;
          //   console.log(factuur);
          //   const from = `invoice@${factuur.afzenderNaam.toLowerCase()}.nl`;
          //   const maildata = {
          //     from: from,
          //     bcc: from,
          //     // to: 'max.van.kampen@alicon.nl',
          //     to: factuur.postadresMailadres,
          //     factuurId: factuur.id,
          //     chapters: [{
          //       title: `${factuur.afzenderNaam} factuur ${factuur.factuurNr} voor ${factuur.organisatieNaam}`,
          //       content: Aim.markdown().render(`
          //         Geachte heer / mevrouw,
          //
          //         Hierbij ontvangt ${factuur.organisatieNaam} een factuur aangaande de door ${factuur.afzenderOrganisatieNaam} geleverde goederen.
          //
          //         Voor automatische verwerking van uw digitale facturen is uw factuur bijgevoegd als bijlage.
          //         Wij willen u erop attenderen dat digitale factuurbestanden gedurende zeven jaar bewaard dienen te worden.
          //         Meer informatie vindt u op [belastingdienst.nl](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/administratie_bewaren/administratie_bewaren).
          //           Het bewaren van (alleen) een afdruk van de digitaal ontvangen facturen op papier is niet voldoende,
          //           U dient uw digitale factuur ook digitaal te bewaren.
          //
          //           Voor eventuele vragen over de factuur kunt u zich richten tot onze financiële administratie
          //           via e-mail: [administratie@${factuur.afzenderNaam}.nl](mailto:administratie@${factuur.afzenderNaam}.nl?SUBJECT=Vraag over factuur ${factuur.factuurNr}&BODY=Beste administratie,%0A%0ANamens ${factuur.organisatieNaam} heb ik een vraag aangaande factuur ${factuur.factuurNr}: ... ?%0A%0AMet vriendelijke groet,%0A${factuur.organisatieNaam})
          //           of telefonisch: ${factuur.afzenderTelefoon}
          //
          //           Indien U vragen heeft over de geleverde artikelen kunt u contact opnemen
          //           via e-mail: [verkoop@${factuur.afzenderNaam}.nl](mailto:verkoop@${factuur.afzenderNaam}.nl?SUBJECT=Inhoudelijke vragen over factuur ${factuur.factuurNr}&BODY=Beste administratie,%0A%0ANamens ${factuur.organisatieNaam} heb ik een vraag aangaande factuur ${factuur.factuurNr}: ... ?%0A%0AMet vriendelijke groet,%0A${factuur.organisatieNaam})
          //
          //           Met vriendelijke groet,  \nAdministratie  \n${factuur.afzenderOrganisatieNaam}
          //           `
          //         ),
          //         // content: Aim.markdown().render(`
          //         //   Geachte heer / mevrouw,
          //         //
          //         //   Tot onze spijt is op de laatste factuur een verkeerd factuur nummer afgedrukt.
          //         //   Het betreft de factuur met de vermelding Factuur nr. <b>${factuur.id}</b>. Dit is echter ons interne document nr.
          //         //   Hierbij ontvangt u nogmaals de factuur maar dan met het juiste factuur nr. <b>${factuur.factuurNr}</b>.
          //         //   Gelieve dit document in uw boekhouding te verwerken.
          //         //
          //         //   Wij willen u erop attenderen dat digitale factuurbestanden gedurende zeven jaar bewaard dienen te worden.
          //         //   Meer informatie vindt u op [belastingdienst.nl](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/administratie_bewaren/administratie_bewaren).
          //         //   Het bewaren van (alleen) een afdruk van de digitaal ontvangen facturen op papier is niet voldoende,
          //         //   U dient uw digitale factuur ook digitaal te bewaren.
          //         //
          //         //   Met vriendelijke groet,  \nAdministratie  \n${factuur.afzenderOrganisatieNaam}
          //         //   `
          //         // ),
          //       }],
          //       attachements: [{
          //         // name: `${factuur.afzenderNaam}-factuur-${factuur.factuurNr}-${factuur.organisatieNaam}.pdf`.toLowerCase(),
          //         filename: `/aliconnect/public/shared/${factuur.afzenderNaam}/facturen/${factuur.jaar}/${factuur.afzenderNaam}-factuur-${factuur.factuurNr}-${factuur.uid}.pdf`.toLowerCase(),
          //       }]
          //     };
          //     console.log(factuur);
          //     await dmsClient.api('/abis/factuurVerzenden').body(maildata).post().then(e => console.log(e));
          //     // elem.remove();
          //   },
        },
        // customerItem: {
        //   items: [],
        // },
        product: {
          prototype: {
            get pageNav() { return [
              this.buttonRelations(
                $('button').class('icn-tag').text('Klanten kochten ook').on('click', event => Listview.list(abisClient.serviceRoot + '/product', {
                  $top: '*',
                  $filter: `id in (
                    SELECT top 20 productId FROM (
                      SELECT productId, SUM(quant)AS quant
                      FROM api.purchaseOrderLine
                      WHERE datediff(day,orderDateTime,getdate())<365
                      AND productId IS NOT NULL
                      AND purchaseOrderId IN (
                        SELECT DISTINCT purchaseOrderId FROM api.purchaseOrderLine WHERE productId = '${this.id}' AND DATEDIFF(day,orderDateTime,GETDATE())<365
                      )
                      GROUP BY productId
                    ) A ORDER BY quant DESC
                  )`,
                })),
                $('button').class('icn-building').text('Klanten die dit kopen').on('click', event => Listview.list(abisClient.serviceRoot + '/company', {
                  $top: '*',
                  $filter: `id in (
                    SELECT DISTINCT customerId
                    FROM api.purchaseOrderLine
                    WHERE datediff(day,orderDateTime,getdate())<365
                    AND customerId IS NOT NULL
                    AND productId = '${this.id}'
                  )`,
                })),
                $('button').class('icn-building').text('Klanten die dit merk kopen').on('click', event => Listview.list(abisClient.serviceRoot + '/company', {
                  $top: '*',
                  $filter: `id in (
                    SELECT DISTINCT customerId
                    FROM api.purchaseOrderLine
                    WHERE datediff(day,orderDateTime,getdate())<365
                    AND customerId IS NOT NULL
                    AND productId IN (SELECT id FROM api.product WHERE brand = '${this.brand}')
                  )`,
                })),
              ),
              // this.buttonRelations(
              //   $('button').class('icn-tag').caption('Artikelen').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/saleItem', {
              //     $filter: `productId EQ '${this.id}'`,
              //     $search: `*`,
              //   })),
              // ),
                // $('button').class('icn-tag').caption('Locaties').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/saleItem', {
                //   $filter: `productId EQ '${this.id}'`,
                //   $search: `*`,
                // })),
              $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            ]},
            ondrop(event){
              const {dataTransfer,data,item} = event;
              if (item) {
                if (item.schemaName === 'saleItem') {
                  item.productId = this.id;
                }
                if (item.schemaName === 'storage') {
                  item.productId = this.id;
                }
              }
            },
          },
        },
        storage: {
          prototype: {
            get pageNav() { return [
              $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            ]},
            ondrop(event){
              const {dataTransfer,data,item} = event;
              if (item) {
                if (item.schemaName === 'product') {
                  this.productId = item.id;
                }
              }
            },
          },
        },

        saleItem: {
          prototype: {
            get pageNav() { return [
              this.buttonRelations(),
              // $('button').class('icn-eye').append($('nav').append(
              //   $('button').class('icn-tag').caption('Artikelen').on('click', async (event) => Listview.list(abisClient.serviceRoot + '/saleItem', {
              //     $filter: `deletedDateTime eq null and productId EQ '${this.productId}'`,
              //     $search: `*`,
              //   })),
              // )),
              $('button').class('icn-history').title('Verleden').on('click', e => {
                Web.list(serviceRoot + '/purchaseOrderLine', {
                  $filter: `artId EQ ${item.productId}`,
                  $search: `*`,
                  $top: 100,
                })
                // await abisingenClient.api(`/purchaseOrderLine`).filter(`artId EQ ${item.productId}`).get().then(({value}) => item.items = value);
              }),
              $('button').class('icn-print').on('click', event => $('div').append(
                $('h1').text('JA'),
              ).printpdf(event => console.log('klaar'))),
              $('button').class('icn-window').on('click', event => this.popout()),
              $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            ]},
            get quant() {
              // if (this.customerId) this.getAttribute()
              if (definitions.company.customer && definitions.company.customer.items) {
                // console.log(4, definitions.company.customer.items);
                var customerItem = definitions.company.customer.items.find(item => item.productId.toLowerCase() === this.id.toLowerCase());
                if (customerItem) return customerItem.quant;
              }
              // console.log(this.id, customerItem.saleItemId);
            },
            set quant(quant) {
              if (definitions.company.customer && definitions.company.customer.items) {
                // console.log(definitions.company.customer.items, definitions.company.customer.id);
                var customerItem = definitions.company.customer.items.find(item => item.productId.toLowerCase() === this.id.toLowerCase());
                if (!customerItem) {
                  customerItem = Item.get({
                    schemaName: 'saleItem',
                    customerId: definitions.company.customer.id,
                    supplierId: definitions.company.customer.supplierId,
                    productId: this.id,
                    quant,
                    discount:0,
                  });
                  definitions.company.customer.items.push(customerItem);
                  console.log('NEW', customerItem);
                  return customerItem.post().then(body => console.log(body));
                }
                customerItem.quant = quant;
                // console.log(customerItem);
                // var customerBagItem = Web.customerBagItems.find(item => item.saleItemId === this.id);
                // if (!customerBagItem) {
                //   customerBagItem = Item.get({schemaName:'purchaseOrderLine',customerId:definitions.company.customer.companyId,saleItemId:this.saleItemId,quant});
                //   definitions.company.customer.items.push(customerBagItem);
                //   console.log('NEW', customerBagItem);
                //   return customerBagItem.post().then(body => console.log(body));
                // }
                // customerBagItem.quant = quant;
                // console.log('set quant', quant, customerBagItem, Web.customerBagItems);
              }

            },
            get style() {
              if (definitions.company.customer) {
                if (this.supplierId && definitions.company.customer.supplierId !== this.supplierId) {
                  return 'border-left:solid 5px rgb(255,0,0);';
                  return 'background:red;';
                  return 'opacity:0.5;';
                  return 'display:none;';
                }
                if (this.customerId && this.customerId.toLowerCase() !== definitions.company.customer.id) {
                  return 'border-left:solid 5px rgb(235,0,0);';
                  return 'background:green;';
                  return 'opacity:0.4;';
                  return 'display:none;';
                }
                if (definitions.company.customer.items && definitions.company.customer.items.find(item => item.productId.toLowerCase() === this.id.toLowerCase())) {
                  return 'border-left:solid 5px rgb(215,0,0);';
                  return 'background:blue;';
                  return 'opacity:0.3;';
                  return 'display:none;';
                }
                if (this.customerId && this.customerId.toLowerCase() === definitions.company.customer.id) {
                  return 'border-left:solid 5px orange;';
                }
              }
            },
            // get disabled() {
            //   if (definitions.company.customer) {
            //   }
            // },
            // get discount() {
            //   if (definitions.company.customer.items) {
            //     var customerItem = definitions.company.customer.items.find(item => item.saleItemId.toLowerCase() === this.id.toLowerCase());
            //     if (customerItem) return customerItem.discount;
            //   }
            // },
            ondrop(event){
              const {dataTransfer,data,item} = event;
              if (item) {
                if (item.schemaName === 'saleItem' && item.productId && !this.productId) {
                  this.productId = item.productId;
                }
                if (item.schemaName === 'saleItem' && !item.productId && this.productId) {
                  item.productId = this.productId;
                }
                if (item.schemaName === 'product') {
                  this.productId = item.id;
                }
              }
            },
          },
          artrow(row, filter) {
            if (!row.title) return;
            filter['toepassing'] = { name: 'toepassing', title: 'Toepassing', values: {} };
            filter['productgroep'] = { name: 'productgroep', title: 'Productgroep', values: {} };
            filter['saleItem'] = { name: 'saleItem', title: 'Product', values: {} };
            filter['purchaseDiscount'] = { name: 'purchaseDiscount', title: 'Inkoopkorting', values: {} };

            const options = row.options = {};
            row.title = row.title.replace(/\r\n|™/g, '');

            const saleItem = productlist.find(p => row.title.match(p.exp) );
            if (saleItem) {
              row.title = row.title.replace(saleItem.exp, '');
              row.saleItem = saleItem.name;
              row.toepassing = saleItem.toepassing;
              row.productgroep = saleItem.productgroep || row.artGroup;
            }

            row.listPrice = Number(row.listPrice);
            row.purchaseDiscount = Number(row.purchaseDiscount);
            if (row.purchaseDiscount = Number(row.purchaseDiscount)) {
              row.purchasePrice = row.listPrice * (100 - row.purchaseDiscount) / 100;
            } else if (row.purchasePrice = Number(row.purchasePrice)) {
              row.purchaseDiscount = row.purchasePrice / row.listPrice * 100;
            }
            row.price = row.listPrice * (100 - row.discount) / 100;

            function match(name, exp, exp2) {
              const match = row.title.match(exp);
              if (match) {
                filter[name] = { name: name, title: name, values: {}};
                // cols.push({ name: name, title: name, })
                // console.log(name)
                // console.log(row.title)
                row.title = row.title.replace(exp,'').replace(/\s-|\(\)|-$/,'').replace(/\s\s/,' ').trim();
                options[name] = row[name] = match[1].replace(/,/g, '.').replace(/\.$/, '').replace(exp2, '').trim().toLowerCase().replace(/\w/, s => s.toUpperCase());
                // console.log(match)
              }
            }

            // console.log('START')
            match('Merk', /(3M)/);
            match('Merk', /(3M)/);
            match('Kleur', /\b(roos|oranje|orange|red oxyde|red|black|blue phtalo|green phtalo|bright red|chrome yellow|cold yellow|dark rose|extra fine aluminium|fine aluminium|donker antraciet|antraciet|donkergrijs|lichtgrijs|donker grijs|licht grijs|blauw|geel|groen|grijs|wit|geel|zwart|bruin|rood)\b/i);
            match('Inhoud', /([\d|\.|,]+\s*?(ml|ltr|l|gr\.|gr|kg\.|kg|paar|g)\b)/i);
            match('Maat', /(\b(mt\.:|mt:|maat:|maat)(\s+?)(\d+|[A-Z]+))/i, /mt\.:|mt:|maat:|maat|\s/);
            match('Spanning', /(\d+(V))\b/i);
            match('Vermogen', /(\d+(W))\b/i);
            match('Dichtheid', /(\d+\s*?(g\/m²))/i);
            match('Hittebestendig', /(\d+°)/);
            match('Schroefdraad', /(M\d+\s*?x[\d|,]+)/i);
            match('Dikte', /(\d+\s*?(µm|mµ|µ))/i);
            match('Diameter', /Ø((\s|)(\d[\d|\.|,]+)(\s|)(mm|))/i);
            match('Afmeting', /[^-]\b(\d+(\.\d+|,\d+|[\/|\d]+)(\s|)(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|µ|m|)(\s|)(x|)(\s|)([\d|\.|,|\/]+|)(\s|)(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|µ|m|)(\s|)(x|)(\s|)([\d|\.|,|\/]+|)(\s|)(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|µ|m)\b)/i);
            match('Gaten', /(\d+)\s*?(gaten\s\d+mm|gaten|gat|gaat)/i);
            match('Maat', /\b(M|L|S|XL|XXL|Large|Medium|Small|XLarge|XXLarge)\b/);
            match('Grofte', /(P\d+)/i);
            match('Grofte', /((grofte|korrel)\s*?\d+)/i, /grofte|korrel|\s/);
            match('RAL', /ral\s*?(\d+)/i);
            match('Aantal', /([\d|\.|,|x|\s]+?(st\.|st\b))/i);

            ['Aantal','Inhoud','Dikte','Diameter','Afmeting'].forEach(name => {
              if (row[name]) {
                options[name] = row[name] = row[name].toLowerCase().replace(/([\d|\.|\/]+)/, ' $1 ').replace(/x/, ' x ').replace(/\s\s/, ' ').replace(/µm|mµ|µ/, 'µm')
              }
            })

            // match('Afmeting', /(\d+?(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m|)?\s*x\s*M\d+)/i);
            // match('Afmeting', /((\d[\d|\.|,\/]*)?(mm|)?([\s|x]*|)?([\d|\.|,\/]+|)?(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m))/i);

            // match('Afmeting', /(([\d|\.|,|\/]+?)(\s*)?(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m|)(|)\s*?(x|-|\/)\s*|)?(([\d|\.|,]+?)\s*?(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m|)\s*?(x|-|\/)\s*|)?([\d|\.|,]+?)\s*?(mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m))/i);

            // match('Afmeting', /(([\d|\.|,|\/]+?)\s*?(?:x|mm\.|mm|cm|mtr\.|mtr|meter|µm|mµ|m))\b/i);
            // match('Afmeting', /([\d]+\sx\s[\d]+)/i);

            // match('maat', /(\b(M|L|S|XL|XXL|Large|Medium|Small|XLarge|XXLarge)\b\s*?[\d|-]+)/);


            // if (match = row.title.match(/([\d|\.|,]+\s*x\s*[\d|\.|,]+)/i)) {
            //   row.title = row.title.replace(match[0],'');
            //   row.afmeting = match[1].replace(/\s/g,'').replace(/x/g,' x ').replace(/(\d+)/g,'$1mm').replace(/,/g, '.');
            // }
            row.title = row.title
            .replace(/^\w/, s => s.toUpperCase())
            .replace(new RegExp(row.prodBrand, 'i'), '')
            .replace(/\sPU/, '-PU')
            .replace(/--/g, '-')
            .replace(/,/g, '')
            .replace(/  /g, ' ')

            // options.omschrijving = row.description;
            // options.leverancier = row.supplierName;
            // options.bestelcode = row.orderCode;
            // row.title = row.saleItem + Object.entries(options).map(entry => entry.join(':')).join(', ');
            row.title = [row.saleItem, row.title].concat(Object.values(row.options)).filter(Boolean).join(', ');
          },
          // artHeader(row) {
          //   const myart = clientart.find(a => a.artId === row.id);
          //   if (myart) {
          //     row.discount = myart.clientDiscount;
          //   }
          //   row.listPrice = Number(row.listPrice);
          //   row.purchaseDiscount = Number(row.purchaseDiscount);
          //   if (row.purchaseDiscount = Number(row.purchaseDiscount)) {
          //     row.purchasePrice = row.listPrice * (100 - row.purchaseDiscount) / 100;
          //   } else if (row.purchasePrice = Number(row.purchasePrice)) {
          //     row.purchaseDiscount = row.purchasePrice / row.listPrice * 100;
          //   }
          //   row.price = row.listPrice * (100 - row.discount) / 100;
          //   // console.log(row);
          //   const elem = $('div').class('price');
          //   if (row.discount) {
          //     elem.class('price discount', myart ? 'client' : '').append(
          //       $('span').attr('listprice', num(row.listPrice)),
          //       $('span').attr('discount', num(-row.discount,0)),
          //     );
          //   }
          //   elem.append(
          //     $('span').attr('price', num(row.price)),
          //     $('span').attr('fatprice', num(row.price * 1.21)),
          //     row.purchasePrice ? $('span').attr('purchaseprice', num(row.purchasePrice)) : null,
          //     row.purchaseDiscount ? $('span').attr('purchasediscount', num(row.purchaseDiscount)) : null,
          //
          //     $('span'),
          //     elem.input = $('input').type('number').step(1).min(0).value(row.quant).on('change', e => {
          //       row.quant = Number(e.target.value);
          //       console.log(row.quant);
          //     }).on('click', e => {
          //       e.stopPropagation();
          //     }),
          //   );
          //   return elem;
          // },
        },
        opdracht: {
          prototype: {
            get pageNav() {
              // console.log(this.docs);
              return [
                this.buttonRelations(),
                $('button').class('icn-print').append($('nav').append(
                  $('button').class('icn-document').text('Aanbieding').on('click', e => this.aanbieding().then(elem => elem.printpdf())),
                  $('button').class('icn-document').text('Factuur').on('click', e => this.factuur().then(elem => elem.printpdf())),
                  this.docs.map(doc => $('button').class('icn-document').text(doc.title).on('click', e => this.docElem(doc).then(elem => elem.printpdf()))),
                )),
                $('button').class('icn-send').append($('nav').append(
                  $('button').class('icn-document').text('Aanbieding').on('click', async (event) => this.mail({
                    from: this.contractor.operationalContact.email,
                    to: this.customer.operationalContact.email,
                    cc: 'administratie@alicon.nl',
                    chapters: [{
                      title: `Aanbieding ${this.contractor.companyName} ${this.customer.companyName} ${this.contract.title}`,
                      content: config.mailcontent.aanbieding.replace(/\n/g,'\n\n').replaceTags(this).render(),
                    }],
                    attachements: [
                      {
                        content: await this.aanbieding().then(elem => elem.outerHTML),
                        name: this.filename('aanbieding','pdf'),
                      },
                      {
                        content: await this.printDocContent('https://alicon.aliconnect.nl/docs/Explore-Legal-Opdracht-overeenkomst.md').then(elem => elem.class('legal').outerHTML),
                        name: this.filename('opdracht-overeenkomst','pdf'),
                      },
                      {
                        filename: '/aliconnect/public/alicon/alicon.github.io/docs/nederland-ict-voorwaarden.pdf',
                      },
                    ],
                  })),
                  $('button').class('icn-document').text('Factuur').on('click', async (event) => this.mail({
                    from: this.contractor.operationalContact.email,
                    to: this.customer.operationalContact.email,
                    cc: 'administratie@alicon.nl',
                    chapters: [{
                      title: `Factuur ${this.invoiceNr} ${this.contractor.companyName} ${this.customer.companyName} ${this.contract.title}`,
                      content: config.mailcontent.factuur.replace(/\n/g,'\n\n').replaceTags(this).render(),
                    }],
                    attachements: [
                      {
                        content: await this.factuur().then(elem => elem.outerHTML),
                        name: this.filename(`factuur-${this.invoiceNr}`,'pdf'),
                      },
                    ],
                  })),
                )),
                $('button').class('icn-edit').on('click', event => this.pageElem(true)),
              ]
            },
            get contractor() {
              return config.client;
            },
            get customer() {
              return this;
            },
            get contract() {
              return this;
            },
            get printDate() {
              return new Date().toLocaleDateString();
            },
            filename(name, ext) {
              return `${this.customer.companyName}-${this.title.replace(/\s/g,'-')}-${'P'+this.opdrachtId.pad(5)}-${name}.${ext}`.toLowerCase();
            },
            printDocContent(src){
              return Aim.fetch(src).get().then(content => $('div').html(content.replaceTags(this).render()).append(
                $('link').rel('stylesheet').href(cssPrintUrl),
              ));
            },
            mail(body){
              abisClient.api('/me/mail/send').body(body).post().then(body => console.log('mail verzonden'));
            },
            letterElem(name){
              const {customer,contractor} = this;
              return $('div').class('letter').append(
                $('link').rel('stylesheet').href(cssPrintUrl),
                $('table').style('width:100%;').append(
                  $('tr').append(
                    $('td').style('width:100%;').append(
                      $('img').src(contractor.letterLogo).style('height:10mm;margin-bottom:10mm;'),
                      $('div').style('height:30mm;').append(
                        $('div').text(customer.companyName),
                        $('div').text('T.a.v.', customer.operationalContact.name),
                        $('div').text(customer.businessAddress.street),
                        $('div').text(customer.businessAddress.postalCode, customer.businessAddress.city),
                        $('div').text(customer.businessAddress.country),
                        $('div').text('Per mail', customer.operationalContact.email),
                      ),
                      $('div').style('font-weight:bold;font-size:1.2em;line-height:10mm;').text(name)
                    ),
                    $('td').style('white-space:nowrap;padding:0;font-size:0.8em;').append(
                      $('div').style('font-weight:bold;').text(contractor.companyName),
                      $('p').html(`Bezoekadres:<br>${contractor.businessAddress.street}<br>${contractor.businessAddress.postalCode} ${contractor.businessAddress.city}`),
                      $('p').html(`Postadres:<br>${contractor.otherAddress.street}<br>${contractor.otherAddress.postalCode} ${contractor.otherAddress.city}`),
                      $('p').append(
                        $('div').text('Telefoon:', contractor.businessPhone),
                        $('div').text('Website:', contractor.businessHomePage),
                        $('div').text('KvK:', contractor.kvkNummer),
                        $('div').text('BTW:', contractor.btwNummer),
                        $('div').text('IBAN:', contractor.iban),
                      ),
                    ),
                  ),
                ),
              );
            },
            async aanbieding(){
              const {customer,contractor} = this;
              const elem = await this.letterElem({
                fromId: this.supplierId || this.contractorId,
                toId: this.customerId,
                name: 'Aanbieding',
              });
              return elem.append(
                $('table').class('grid').append(
                  $('tr').append(
                    $('th').text('Datum'), $('td').text(new Date(this.datum).toLocaleDateString()),
                    $('th').text('Onderwerp'), $('td').text(this.title),
                  ),
                  $('tr').append(
                    $('th').text('Opdrachtnummer'), $('td').text(this.opdrachtId),
                    $('th').text('Klantnummer'), $('td').text(this.klantNummer),
                  ),
                  $('tr').append(
                    $('th').text('Opdrachtdatum'), $('td').text(new Date(this.datum).toLocaleDateString()),
                    $('th').text('Klantreferentie'), $('td').text(this.klantReferentie),
                  ),
                ),
              ).html(await Aim.fetch('https://alicon.aliconnect.nl/docs/Letter-Aanbieding.md').get().then(content => content.replaceTags(this).render()));
            },
            async factuur(){
              excl = 0;
              return this.letterElem('Factuur').append(
                $('table').class('grid').append(
                  $('tr').append(
                    $('th').text('Factuurnummer'), $('td').text(this.invoiceNr),
                    $('th').text('Opdrachtnummer'), $('td').text('P'+this.opdrachtId.pad(5)),
                  ),
                  $('tr').append(
                    $('th').text('Factuurdatum'), $('td').text(new Date(this.invoiceDate).toLocaleDateString()),
                    $('th').text('Klantnummer'), $('td').text(this.klantNummer),
                  ),
                  $('tr').append(
                    // $('th').text('Opdrachtdatum'), $('td').text(new Date(this.datum).toLocaleDateString()),
                    $('th').text('Vervaldatum'), $('td').text(new Date(this.datum).addDays(this.betaalTermijn).toLocaleDateString()),
                    $('th').text('Klantreferentie'), $('td').text(this.klantReferentie),
                  ),
                ),
                $('table').class('grid').append(
                  $('thead').append(
                    $('tr').append(
                      $('th').text('Art.nr.'),
                      $('th').text('Omschrijving').style('width:100%;'),
                      $('th').text('Aantal').style('text-align:right;'),
                      $('th').text('Bruto').style('text-align:right;'),
                      $('th').text('Totaal').style('text-align:right;'),
                    ),
                  ),
                  $('tbody').append(
                    $('tr').append(
                      $('td').text('P'+this.opdrachtId.pad(5)),
                      $('td').text(this.title),
                      $('td').class('num').text(1),
                      $('td').class('num').text(num(this.bedragVergoeding)),
                      $('td').class('num').text(num(excl += this.bedragVergoeding)),
                    ),
                  ),
                  $('tfoot').append(
                    $('tr').append(
                      $('th').style('text-align:right;').colspan(4).text('Totaal'),
                      $('td').style('text-align:right;').text(num(this.excl = excl)),
                    ),
                    $('tr').append(
                      $('th').style('text-align:right;').colspan(4).text(`Btw ${this.btwProc = 21}%`),
                      $('td').style('text-align:right;').text(num(this.btwBedrag = this.excl * this.btwProc / 100)),
                    ),
                    $('tr').append(
                      $('th').style('text-align:right;').colspan(4).text('TE BETALEN'),
                      $('td').style('text-align:right;font-weight:bold;').text(num(this.incl = this.excl + this.btwBedrag)),
                    ),
                  ),
                ),
                $('p').html(`Betaling binnen <b>${this.betaalTermijn}</b> dagen op rekening <b>${this.contractor.iban}</b> ten name van <b>${this.contractor.companyName}</b><br>Gaarne bij betaling factuurnummer <b>${this.invoiceNr}</b> vermelden.`),
              );
            },
          },
        },
        system: {
          pageNav: row => [
            this.buttonRelations(
              $('button').class('icn-dashboard').on('click', e => Item.dashboard(row)),
            ),
          ]
        },
        item: {
          prototype: {
            get pageNav() { return [
              $('button').class('icn-edit').on('click', event => this.pageElem(true)),
            ]},
          },
        },
      },
    });
    const {menu} = config;
    // abisClient.api('/item').get().then(body => console.log(body))
    // console.log(menu);
    // return;
    const dashboard = {
      async _verkoop1() {
        console.log('DASHBOARD');
        var rows = await abisClient.api('/purchaseOrder').query({
          // $apply: `aggregate(Amount with average as AverageAmount,Amount with sum as SumAmount)`,
          // $apply: `aggregate(Amount with average as AverageAmount,Amount with sum as SumAmount)`,
          $apply: `aggregate(id with countdistinct as countDistinctId)`,
          $filter: `DATEDIFF(day,orderDateTime,getdate())<365`,

          // $select: `count(0) as cnt`,
          $top: 1,
        }).get().then(({value}) => value);
        // .then(([row]) => row);
        console.log(rows);
        // var row = await abisClient.api('/purchaseOrder').query({
        //   // $apply: `aggregate(Amount with average as AverageAmount,Amount with sum as SumAmount)`,
        //   // $apply: `aggregate(Amount with average as AverageAmount,Amount with sum as SumAmount)`,
        //   $apply: `aggregate(id with countdistinct as countDistinctId)`,
        //   $filter: `DATEDIFF(day,orderDateTime,getdate())<365*2 AND DATEDIFF(day,orderDateTime,getdate())>365`,
        //
        //   // $select: `count(0) as cnt`,
        //   $top: 1,
        // }).get().then(({value}) => value).then(([row]) => row);
        // console.log(row);
      },
      async dashboardVerkoopOrders() {
        console.log('DASHBOARD');
        var [rows,merken] = await abisClient.api('/analyse').query({response_type:'dashboardVerkoopOrders'}).get();
        console.log(rows,merken);
        const series = rows.map(row => row.name).unique().map(name => Object(
          { name, type: 'ColumnSeries', dataFields: { valueY: name, categoryX: 'category' }, stacked: true }
        ));
        const data1 = rows.map(row => String(row.category)).unique().map(category => Object({category}));
        const data2 = rows.map(row => String(row.category)).unique().map(category => Object({category}));
        rows.forEach(row => {
          data1.find(data => data.category == row.category)[row.name] = row.sum;
          data2.find(data => data.category == row.category)[row.name] = row.listprice;
        })
        $('.pages').clear();
        $('.listview').clear().append(
          $('div').class('dashboard').append(
            $('div').append(
              $('div').append(
                $('div').append(
                  $('div').text('Verkoop orders aantal'),
                  $('div').class('chart').chart({
                    type:'XYChart',
                    legend:{position:'bottom'},
                    yAxes:[{type:'ValueAxis'}],
                    xAxes:[{type:'CategoryAxis',dataFields:{category:'category'}}],
                    series,
                    data: data1,
                  }),
                ),
                $('div').append(
                  $('div').text('Verkoop orders omzet'),
                  $('div').class('chart').chart({
                    type:'XYChart',
                    legend:{position:'bottom'},
                    yAxes:[{type:'ValueAxis'}],
                    xAxes:[{type:'CategoryAxis',dataFields:{category:'category'}}],
                    series,
                    data: data2,
                  }),
                ),
                $('div').append(
                  $('div').text('Verkoop aantal'),
                  $('div').class('chart').chart({
                    type: 'PieChart',
                    series: [{type: 'PieSeries',dataFields:{category:'name',value:'value'}}],
                    data: rows.map(row => row.name).unique().map(name => Object({
                      name,
                      value: rows.filter(row => row.name === name).map(row => row.sum).reduce((sum, val) => sum + val, 0)
                    })),
                    legend: {},
                  }),
                ),
                $('div').append(
                  $('div').text('Verkoop omzet'),
                  $('div').class('chart').chart({
                    type: 'PieChart',
                    series: [{type: 'PieSeries',dataFields:{category:'name',value:'value'}}],
                    data: rows.map(row => row.name).unique().map(name => Object({
                      name,
                      value: rows.filter(row => row.name === name).map(row => row.listprice).reduce((sum, val) => sum + val, 0)
                    })),
                    legend: {},
                  }),
                ),
                $('div').append(
                  $('div').text('Merken'),
                  $('div').class('chart').chart({
                    type: 'PieChart',
                    series: [{type: 'PieSeries',dataFields:{category:'name',value:'value'}}],
                    data: merken.map(row => row.name).unique().map(name => Object({
                      name,
                      value: merken.filter(row => row.name === name).map(row => row.value).reduce((sum, val) => sum + val, 0)
                    })),
                    // legend:{position:'right'},
                  }),
                ),
                $('div').class('ghost'),
                $('div').class('ghost'),
                $('div').class('ghost'),
                $('div').class('ghost'),
                $('div').class('ghost'),
                $('div').class('ghost'),
              ),
            ),
          ),
        );
      },
    };
    Web.treeview.append([
      {
        name: 'Organisation',
        icn: 'organization',
        enabled: options.has('crm'),
        onclick: dashboard.dashboardVerkoopOrders,
        children: [
          {
            name: 'Bedrijven',
            icn: 'building_multiple',
            enabled: definitions.company,
            $path: serviceRoot + '/company',
            $search: '',
            $top: 100,
            children: [
              {
                name: 'Contacten',
                icn: 'contact_card',
                enabled: definitions.contact,
                $path: serviceRoot + '/contact',
                $search: '',
                $top: 100,
              },
              // {
              //   name: 'Klanten',
              //   icn: 'company',
              //   $path: serviceRoot + '/company',
              //   $filter: `typecode LIKE '%K%'`,
              //   $search: '',
              //   $top: 100,
              // },
              {
                name: 'Archief',
                icn: 'company',
                $path: serviceRoot + '/company',
                $filter: `typecode NOT LIKE '%K%'`,
                $search: '',
                $top: 100,
              },
            ],
          },
          {
            name: 'Personen',
            icn: 'people',
            enabled: definitions.person,
            $path: 'https://aliconnect.nl/v1/person',
            $search: '',
            $top: 100,
          },
        ],
      },
      {
        name: 'Producten',
        icn: 'tag',
        enabled: options.has('shop'),
        $path: 'https://aliconnect.nl/v1/product',
        $search: '',
        $filter: 'deletedDateTime eq null',
        $top: 1000,
        children: [
          {
            name: 'Artikelen',
            icn: 'tag_multiple',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $search: '',
            $filter: 'deletedDateTime eq null',
            $top: 1000,
          },
          {
            name: 'Opslag locaties',
            icn: 'storage',
            $path: 'https://aliconnect.nl/v1/storage',
            $search: '',
            // $filter: 'deletedDateTime eq null',
            $orderby: 'rij,stelling,schap,pos,description',
            $top: 1000,
            children: [
              {
                name: 'Voorraad lijst',
                icn: 'print',
                async onclick() {
                  console.debug('Voorraad lijst');
                  const rows = await abisClient.api(`/storage`).top(5000).select('rij,stelling,schap,pos,artNr,description,quant,packageQuant,listprice,lastSaleDateTime,brand,code,vos').order('rij,stelling,schap,pos,description').get().then(({value}) => value);
                  $('div').append(
                    $('link').rel('stylesheet').href(cssPrintUrl),
                    $('h1').text('Voorraad lijst'),
                    $('table').class('grid').append(
                      $('tr').append(
                        // $('td'),
                        // $('td'),
                        $('td').style('font-weight:bold;').text(`Totaal ${rows.map(row => row.quant || 0).reduce((a,b) => a+b, 0)} producten, totaal waarde ${num(rows.map(row => (row.quant || 0) * (row.packageQuant || 1) * (row.listprice || 0)).reduce((a,b) => a+b, 0))}`),
                        // $('td').style('text-align:right;').text(rows.map(row => row.quant || 0).reduce((a,b) => a+b, 0)),
                        $('td'),
                        // $('td').style('text-align:right;font-weight:bold;').text(),
                      ),
                      $('thead').append(
                        $('tr').append(
                          // $('th').text('Locatie'),
                          // $('th').style('text-align:right;').text('Art.nr.'),
                          $('th').style('width:100%;'),
                          $('th').style('text-align:right;').text('Aantal'),
                          // $('th').style('text-align:right;').text('Per'),
                          // $('th').style('text-align:right;').text('Bruto'),
                        ),
                      ),
                      $('tbody').append(
                        rows.map(row => $('tr').style('height:7mm;').append(
                          // $('td').style('text-align:right;').text(row.artNr),
                          $('td').html([
                            [row.rij,row.stelling,row.schap,row.pos].filter(Boolean).join('.'),
                            row.artNr ? [
                              row.brand,
                              `<b>${row.code}</b>`,
                              row.vos ? `VOS ${row.vos}/stuks` : '',
                              row.listprice ? `€ ${num(row.listprice)}/stuk` : '<span style="color:red;">PRIJS?</span>',
                              row.packageQuant ? `${row.packageQuant}/verpakking` : '',
                              row.lastSaleDateTime
                              ? `laatst verkocht ${new Date(row.lastSaleDateTime).getFullYear() + '-' + new Date(row.lastSaleDateTime).getMonth()}${
                                new Date() - new Date(row.lastSaleDateTime) > 180 * 24 * 3600 * 1000
                                ? ' <span style="color:red;">EOL?</span>'
                                : ''
                              }`
                              : '<span style="color:red;">GEEN VERKOOP DATUM</span>',
                              `[${row.artNr}]`,
                            ] : null,
                          ].flat().filter(Boolean).join(', ') + '<br>' + (row.description || '')),
                          $('td').style('text-align:right;').text(row.quant),
                          // $('td').style('text-align:right;').text(row.packageQuant),
                          // $('td').style('text-align:right;').text(num(row.listprice)),
                        )),
                      ),
                    ),
                  ).print()
                },
              },
            ],
          },
          // {
          //   name: 'Klant Producten',
          //   icn: 'customerItem',
          //   $path: 'https://aliconnect.nl/v1/customerItem',
          //   $search: '',
          //   $top: 100,
          // },
          {
            name: 'PPG Producten',
            $path: 'https://aliconnect.nl/v1/ppgItem',
            $search: '',
            $top: 1000,
          },
          {
            name: 'Verkoop zonder inkoop',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $filter: 'deletedDateTime IS NULL AND lastSaleDateTime IS NOT NULL AND productId IS NULL',
            $top: 1000,
          },
          {
            name: 'Voorraadart zonder begin voorraad',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $filter: 'deletedDateTime IS NULL AND storageLocation IS NOT NULL AND stockStart IS NULL',
            $top: 100,
          },
          {
            name: 'Voorraadart',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $filter: 'deletedDateTime IS NULL AND storageLocation IS NOT NULL',
            $top: 100,
          },
          {
            name: 'Verkocht geen voorraad locatie',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $filter: 'deletedDateTime IS NULL AND storageLocation IS NULL AND lastSaleDateTime IS NOT NULL',
            $top: 1000,
          },
          {
            name: 'Verkocht geen listprice',
            $path: 'https://aliconnect.nl/v1/saleItem',
            $filter: 'deletedDateTime IS NULL AND lastSaleDateTime IS NOT NULL AND listprice IS NULL',
            $order: 'description',
            $top: 1000,
          },
        ],
      },
      {
        name: 'Orders',
        icn: 'receipt_bag',
        enabled: options.has('shop'),
        $path: 'https://aliconnect.nl/v1/purchaseOrder',
        $filter: 'invoiceId EQ NULL',
        $order: 'purchaseOrderId DESC',
        $search: '*',
        $top: 100,
        children: [
          {
            name: 'Printen start pakken',
            icn: 'receipt_bag',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            // $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && printDateTime EQ NULL',
            $filter: 'deletedDateTime eq null && invoiceId EQ NULL && onholdDateTime EQ NULL && printDateTime EQ NULL',
            $order: 'purchaseOrderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'Pakken gereed melden',
            icn: 'shopping_bag_tag',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            // $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && printDateTime NE NULL && pickedDateTime EQ NULL',
            $filter: 'invoiceId EQ NULL && onholdDateTime EQ NULL && printDateTime NE NULL && pickedDateTime EQ NULL',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'verzendenVisser',
            icn: 'vehicle_truck_bag',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && pickedDateTime NE NULL && sendDateTime EQ NULL && transportType EQ 2',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'verzendenPost',
            icn: 'vehicle_truck_bag',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && pickedDateTime NE NULL && sendDateTime EQ NULL && transportType EQ 1',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'verzendenRoute',
            icn: 'vehicle_truck_bag',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && pickedDateTime NE NULL && sendDateTime EQ NULL && transportType EQ 3',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'routeAfgeleverd',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && sendDateTime NE NULL && deliveredDateTime EQ NULL && transportType EQ 3',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'geleverdFactureren',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime EQ NULL && deliveredDateTime NE NULL',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'onHoldOplossen',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 1 && invoiceId EQ NULL && onholdDateTime NE NULL',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'inMandje',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'isOrdered EQ 0 && invoiceId EQ NULL && onholdDateTime EQ NULL',
            $order: 'purchaseorderId DESC',
            $search: '*',
            $top: 100,
          },
          {
            name: 'ReadyMix',
            $path: 'https://aliconnect.nl/v1/purchaseOrderLine',
            $filter: `prodStockLocation EQ 'k-m' && sendDateTime EQ NULL && isQuote <> 1 && isOrder = 1`,
            $search: '*',
            $top: 100,
          },
          {
            name: 'Order regels',
            $path: 'https://aliconnect.nl/v1/purchaseOrderLine',
            $search: '',
            $top: 100,
          },
          {
            name: 'Archief',
            $path: 'https://aliconnect.nl/v1/purchaseOrder',
            $filter: 'invoiceId NE NULL',
            $search: '',
            $top: 100,
          },
        ],
      },
      {
        name: 'Facturen',
        icn: 'receipt_money',
        enabled: options.has('shop'),
        $path: serviceRoot + '/invoice',
        $search: '*',
        $filter: 'saldo NE 0 OR bookedDateTime EQ NULL',
        $top: 100,
        $order: 'invoiceId DESC',
        children: [
          {
            name: 'Archief',
            $path: 'https://aliconnect.nl/v1/invoice',
            $order: 'invoiceId DESC',
            // # $filter: `typecode NOT LIKE '%L%'`,
            $search: '',
            $top: 100,
          },
        ],
      },
      {
        name: 'Administratie',
        children: [
          {
            name: 'Afas',
            children: [
              {
                name: 'Export Facturen Airo',
                href: 'https://dms.aliconnect.nl/api/v1/abis/getAfasFactuurExport?bedrijf=airo',
              },
              {
                name: 'Export Facturen Proving',
                href: 'https://dms.aliconnect.nl/api/v1/abis/getAfasFactuurExport?bedrijf=proving',
              },
              {
                name: 'Import',
                onclick() {
                  $('input').type('file').multiple(false).accept('.xlsx').on('change', e => importFiles(e.target.files)).click().remove();
                },
              },
            ],
          },
        ],
      },
      {
        name: 'opdrachten',
        enabled: options.has('opdrachten'),
        $path: 'https://aliconnect.nl/v1/opdracht',
        $search: '*',
        $top: 100,
      },
    ]);
    Web.treeview.append(menu);
    Web.treeview.append([
      treeItem({
        enabled: options.has('item'),
        name: 'More',
        icn: 'folder',
        // disabled: !definitions.item,
        hasChildren: true,
      }),
    ]);
    // console.log(config.pages);
    if (config.pages) {
      if (config.pages.pagemenu) $('.pagemenu').load(config.pages.pagemenu);
      if (config.pages.footer) $('body>footer>div.mw').load(config.pages.footer);
      if (!url.searchParams.get('id') && !url.searchParams.get('l')) {
        if (document.location.pathname === '/' && !document.location.search) {
          var href = config.pages.home;
          if (href) {
            Web.listview.elem.loadPage(href);
            Statusbar.replaceState(href+'h');
          }
        }
      }
    }
    var id = sessionStorage.getItem('customerId');
    if (id) {
      await abisClient.api(`/company(${id})`).get().then(data => Item.get(data).setCustomer());
    }
    if (tutorial && sessionStorage.getItem('tutorial') < 1) {
      startTutorial(tutorial);
    }
    // Object.values(definitions).forEach(schema => schema.optionslist.forEach(item => Object.assign(schema.properties, item.properties)));
    Object.keys(definitions).forEach(schemaName => {

      const {cols} = Item.getSchema(schemaName);
      if (cols) {
        // const linkCols = this.cols.filter(col => col.linkId).map(col => col.linkSchemaName).unique();
        cols.filter(col => col.linkId).forEach(col => relations.push({
          from: schemaName,
          to: col.linkSchemaName,
          key: col.name,
          type: 'n:1',
        }));
      }
    });
    return Object.assign(this, {getAccessToken,authClient,abisClient,serviceClient,socketClient,tags,options,account,login,api});
  },
}, Web);

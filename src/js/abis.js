function signOut() {
  aimClient.logout().catch(console.error).then(e => {
    aimClient.storage.removeItem('aimAccount');
    document.location.reload();
  });
}

const apiUrl = 'https://aliconnect.nl';
const listPath = '/abis/data';
let access_token;

function listLink(title, request_type, filter){
  var schema = config.components.schemas[request_type];
  var href = `https://aliconnect.nl/abis/data?request_type=${request_type}&$select=${schema.select}&$filter=${filter}`;
  href = href.replace(/ /g,'+');
  // var href = $().url(href).query(options).toString();
  // console.log(href);
  href = aim.urlToId(href);
  // console.log(href);
  href = '#?l='+href;
  // console.log(href);
  return $('a').text(title).href(href);
}

function page(schemaname, id){
  schema = config.components.schemas[schemaname];
  console.log('page', schema, id);
  fetch(`https://aliconnect.nl/abis/data?request_type=${schemaname}&id=${id}`)
  .then(async res => {
    const data = await res.json();
    console.log(data);
    $('section.page').pageForm(schema, data);
  });

}

function pageLink(title, schema, id){
//   var schema = config.components.schemas[request_type];
//   var href = `https://aliconnect.nl/abis/data?request_type=${request_type}&$select=${schema.select}&$filter=${filter}`;
//   href = href.replace(/ /g,'+');
//   // var href = $().url(href).query(options).toString();
//   // console.log(href);
//   href = aim.urlToId(href);
//   // console.log(href);
//   href = '#?l='+href;
//   // console.log(href);
  return $('button').text(title).on('click', e => {
    page(schema, id);
  });
}

function link(title, href){
  // aim.idToUrl(url.searchParams.get('l'));
  return $('a').text(title).href(href)
}
function listRef(selector, par = ''){
  // console.log(oas);
  if (selector) {
    const schema = oas.components.schemas[selector];
    const select = Object.keys(schema.properties).join(',');
    const href = apiUrl+listPath+`?request_type=${selector}&select=${select}&order=${schema.order}`+par;
    // console.log(href);
    return `#?l=${aim.urlToId(href)}`;
  }
}

function orderChangeCell(col, row, isInput){
  if (isInput) {
    return $('input').text(col.title || col.name).on('change', e=>{
      fetch('https://aliconnect.nl/abis/data', {
        method: 'POST',
        body: JSON.stringify({
          request_type: 'order',
          id: row.id,
          name: col.name,
          value: e.target.value,
        }),
      }).then(async res => {
        console.log(await res.text());
      });
    })
  }
  return $('button').text(col.title || col.name).on('click', e=>{
    fetch('https://aliconnect.nl/abis/data', {
      method: 'POST',
      body: JSON.stringify({
        request_type: 'order',
        id: row.id,
        name: col.name,
        value: new Date.toISOString(),
      }),
    }).then(async res => {
      console.log(await res.text());
    });
  })
}

function listShow(body) {
  // console.log(body);
  const rows = body.rows;
  const context = new URL(body['@context']);
  const requestType = context.searchParams.get('request_type');
  const schema = config.components.schemas[requestType];
  const docUrl = new URL(document.location);
  const listUrl = new URL(aim.idToUrl(docUrl.searchParams.get('l')), document.location);
  const $select = listUrl.searchParams.get('$select');
  const select = $select ? $select.split(',') : Object.keys(rows[0]);
  // console.log(select);
  const cols = select.map(name => Object.assign({name: name}, schema && schema.properties && schema.properties[name] ? schema.properties[name] : {title: name}));
  $('article.pv').text('');
  aim.om.listview(cols, rows);
}


function Abis() {
  abis = this;
  $().on('load', async e => {
    const configYaml = await fetch('../config/config.yaml').then(res => res.text());
    // console.log(configYaml);
    config = await fetch('https://aliconnect.nl/yaml.php', {
      method: 'POST',
      body: configYaml,
    }).then(res => res.json());
    // console.log(config);
    // console.log('abis')
    const client_id = aim.config.client_id;
    const aimConfig = {
      client_id: client_id,
      scope: 'openid profile name email admin.write abisingen.write',
    };
    const aimClient = new aim.UserAgentApplication(aimConfig);
    const aimAccount = JSON.parse(aimClient.storage.getItem('aimAccount'));
    const aimRequest = {
      scopes: aimConfig.scope.split(' '),
    };
    await $().url(apiUrl + '/abis/signin').input(aimConfig).post().then(e => {
      aimClient.storage.setItem('accessToken', e.body.access_token);
    });

    // if (!aimAccount) {
    //   function signIn() {
    //     aimClient.loginPopup(aimRequest).catch(console.error).then(authResult => {
    //       aimClient.storage.setItem('aimAccount', authResult.account.username);
    //       document.location.reload();
    //     });
    //   }
    //   // const cookie = Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')));
    //   //
    //   // console.log(cookie);
    //   om.navtop.append(
    //     $('button').text('login').on('click', signIn),
    //   )
    // } else {
    const authProvider = {
      getAccessToken: async () => {
        return aimClient.storage.getItem('accessToken');
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
          if (silentError instanceof aim.InteractionRequiredAuthError) {
            const interactiveResult = await aimClient.acquireTokenPopup(aimRequest);
            return interactiveResult.accessToken;
          } else {
            throw silentError;
          }
        }
      }
    };
    let dmsConfig = {
      client_id: client_id,
      servers: [{url: 'https://aliconnect.nl'}],
    };
    const dmsClient = aim.Client.initWithMiddleware({authProvider}, dmsConfig);
    function createLijst(rows){
      const keys = Object.keys(rows[0]||{});
      $('lijst').text('').append(
        $('thead').append(
          $('tr').append(
            keys.map(key => $('th').text(key))
          ),
        ),
        $('tbody').append(
          rows.map(row => $('tr').append(
            keys.map(key => $('td').text(row[key] || ''))
          ))
        ),
      )
    }
    dmsConfig = await dmsClient.loadConfig();
    const url = new URL(document.location);
    const showlist = {
      async products(data) {
        // console.log(data);
        cols = [
          { name: 'productTitle', title: 'Titel'},
          { name: 'supplier', title: 'Leverancier'},
          { name: 'brand', title: 'brand'},
          { name: 'productGroup', title: 'productGroup'},
          { name: 'description', title: 'description'},
          { name: 'ordercode', title: 'ordercode'},
          { name: 'catalogPrice', title: 'catalogPrice'},
          { name: 'salesPrice', title: 'salesPrice'},
        ];
        $('section.page').text('');
        $('section.list').text('').append(
          $('table').class('products').append(
            $('thead').append(
              $('tr').append(
                cols.map(col => $('th').text(col.title || col.name))
              )
            ),
            $('tbody').append(
              data.map(row => $('tr').append(
                cols.map(col => $('td').text(row[col.name]))
              ))
            )
          )
        )
      },
      async client(data) {
        // console.log(data);
        cols = [
          { name: 'productTitle', title: 'Titel'},
          { name: 'supplier', title: 'Leverancier'},
          { name: 'brand', title: 'brand'},
          { name: 'productGroup', title: 'productGroup'},
          { name: 'description', title: 'description'},
          { name: 'ordercode', title: 'ordercode'},
          { name: 'catalogPrice', title: 'catalogPrice'},
          { name: 'salesPrice', title: 'salesPrice'},
        ];
        $('section.page').text('');
        $('section.list').text('').append(
          $('table').class('products').append(
            $('thead').append(
              $('tr').append(
                cols.map(col => $('th').text(col.title || col.name))
              )
            ),
            $('tbody').append(
              data.map(row => $('tr').append(
                cols.map(col => $('td').text(row[col.name]))
              ))
            )
          )
        )
      },
      async orderlist(rows) {
        console.warn(rows);
        access_token = await authProvider.getAccessToken();
        function orderCol(name){
          const fieldName = `order${name}Date`;
          return {
            name: fieldName,
            title: name,
            cell: row => row[fieldName]
            ? row[fieldName]//link(row[fieldName], apiUrl+listPath + `?request_type=${name}&order_uid=${row.orderUid}&access_token=${access_token}`, 'page')
            : $('button').text(name),
            // cell: row => console.log(fieldName, row[fieldName]),
          };
        }
        const cols = [
          { name: 'clientKeyName', title: 'Klant', cell: row => link(row.clientKeyName || '', '?request_type=klant_pakbonnen&klantId='+row.clientKeyName) },
          { name: 'orderNr', title: 'Order', cell: row => link(row.orderNr || '', apiUrl+listPath + `?request_type=order&order_uid=${row.orderUid}&access_token=${access_token}`, 'page') },
          { name: 'status', title: 'Status' },
          { name: 'orderDate', title: 'Besteld'},
          orderCol('Print'),
          orderCol('Pick'),
          orderCol('Send'),
          orderCol('Deliver'),
          orderCol('Done'),
          { name: 'invoiceNr', title: 'Factuur', cell: row => link(row.invoiceNr || '', apiUrl+listPath + `?request_type=invoice&invoice_uid=${row.invoiceUid}&access_token=${access_token}`, 'page') },
          { name: 'invoiceDate', title: 'Gefactureerd', cell: row => row.invoiceDate || $('button').text('factureren') },
          { name: 'invoiceSendDate', title: 'Verzonden', cell: row => row.invoiceSendDate || $('button').text('verzenden') },
          { name: 'invoiceBookDate', title: 'Geboekt', cell: row => row.invoiceBookDate || $('button').text('geboekt') },
          { name: 'invoicePayDate', title: 'Betaald', cell: row => row.invoicePayDate || $('button').text('betaald') },
          { name: 'payBank', title: 'Bank', cell: row => row.payBank || $('input').name('bank') },
          { name: 'payPin', title: 'Pin', cell: row => row.payPin || $('input').name('pin') },
          { name: 'payCash', title: 'Contant', cell: row => row.payCash || $('input').name('contant') },
        ];
        om.list(
          rows.map(row => {
            row.Klant = {
              value: row.Klant,
              href: '#test',
            }
            return row;
          }),
          cols,
        );
        // key === 'ClientKeyName' ? $('a').text(row[col.name] || '').href('?ClientUid='+row.ClientUid)
        // : key === 'OrderNr' ? $('a').target('page').text(row[key] || '').href(baseUrl + `request_type=order&order_uid=${row.OrderUid}&access_token=${access_token}`)
        // : key === 'InvoiceNr' ? $('a').target('page').text(row[key] || '').href(baseUrl + `request_type=invoice&invoice_uid=${row.InvoiceUid}&access_token=${access_token}`)
        // : key === 'InvoicePayDateTime' && !row.InvoicePayDateTime ? $('button').text('betaald').on('click', e => {
        //   dmsClient.api('/lijst')
        //   .query('request_type', 'pakbon_betaald')
        //   .query('pakbonId', row.pakbonId)
        //   .get().then(e => row.trElem.remove())
        // })
        // : key === 'InvoiceBookDateTime' && !row.InvoiceBookDateTime ? $('button').text('verwerkt').on('click', e => {
        //   dmsClient.api('/lijst')
        //   .query('request_type', 'pakbon_verwerkt')
        //   .query('pakbonId', row.pakbonId)
        //   .get().then(e => row.trElem.remove())
        // })
        // : $('span').text(row[key] || '')
        // console.log(om);
      },
    }
    function orders(request_type){
      dmsClient.api(listPath).query('request_type', request_type).get().then(body => orderlist(body.values));
    }
    function openstaand(){
      dmsClient.api(listPath).query('request_type', 'klanten_openstaand').get().then(body => {
        const rows = body.values;
        const keys = Object.keys(rows[0]||{});
        $('lijst').text('').append(
          $('thead').append($('tr').append(
            keys.map(key => $('th').text(key)),
            $('th').text('Herinnering')
          )),
          $('tbody').append(
            rows.map(row => $('tr').append(
              keys.map(key => $('td').class(key).append(
                key === 'klantId'
                ? $('a').text(row[key] || '').href('?request_type=klant_pakbonnen&klantId='+row[key])
                : $('span').text(row[key] || '')
              )),
              $('td').append(
                $('button').text('herinnering').on('click', e => {
                  dmsClient.api(listPath)
                  .query('request_type', 'klant_herinnering')
                  .query('klantId', row.klantId)
                  .get().then(e => {
                    console.log(e, row);
                  })
                })
              ),
            ))
          ),
        )
      })
    }
    // console.log(dmsConfig);
    abis[url.searchParams.get('request_type') || 'home']();

    $(window).on('popstate', e => {
      const search = document.location.hash.substr(1) || document.location.search;
      // console.log('aaaa', search);
      e.preventDefault();
      if (search) {
        const documentUrl = new URL(document.location);
        const url = new URL(search, document.location.origin);
        if (url.searchParams.has('l')) {
          const listRef = aim.idToUrl(url.searchParams.get('l'));
          // console.log(111, listRef);
          documentUrl.searchParams.set('l', url.searchParams.get('l'));
          documentUrl.hash = '';
          window.history.replaceState('', '', documentUrl.href);
          const listUrl = new URL(listRef, document.location);
          const requestType = listUrl.searchParams.get('request_type')
          // console.log(111, requestType, listRef);

          // const proc = url.searchParams.get(''));
          dmsClient.api(listRef)
          // .query('request_type', 'klant_pakbonnen')
          // .query('klantId', url.searchParams.get('klantId'))
          .get().then(body => listShow(body))
        }
      }
      // console.warn(e.target);
    })
    // $(window).on('hashchange', e => {
    //   e.preventDefault();
    // })
    // }


  })
}
Abis.prototype = {
  home(){
    $('body>nav').append(
      $('a').text('home').href(document.location.pathname),
      // $('a').text('home').href(document.location.pathname),
      // $('button').text('orders-geprint').on('click', e => orders('orders-geprint')),
      // $('button').text('openstaand').on('click', openstaand),
      // $('button').text('logout').on('click', signOut),
    );
    function treeItem(title, request_type, ref){
      return $('details').append(
        $('summary').append(
          $('div').text(title).on('click', e => {
            e.preventDefault();
            document.querySelector('section.atv>div').querySelectorAll('div').forEach(el => el.removeAttribute('select'));
            e.target.setAttribute('select', '');
            document.location.hash = listRef(request_type, ref);
          }),
        )
      )
    }
    aim.om.treeview(config.navleft);
  },
  async klant_pakbonnen(klantId) {
    dmsClient.api(listPath)
    .query('request_type', 'klant_pakbonnen')
    .query('klantId', url.searchParams.get('klantId'))
    .get().then(body => orderlist(body.values))
  },
  async orders() {
    dmsClient.api(listPath + document.location.search)
    // .query('request_type', 'klant_pakbonnen')
    // .query('klantId', url.searchParams.get('klantId'))
    .get().then(body => orderlist(body.values))
  },
}

new Abis;

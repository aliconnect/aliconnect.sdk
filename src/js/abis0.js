const orderFilters = [
  { title: 'In behandeling',  filter: 'invoiceNr lt 1 and status eq null and orderDone lt 1' },
  { title: 'Verwerkt',        filter: 'invoiceNr lt 1 and orderPrintDate eq null and orderDone eq 1' },
  { title: 'Geprint',         filter: 'orderPrintDate not null and orderPickDate eq null' },
  { title: 'Gepakt',          filter: 'orderPickDate not null and orderSendDate eq null' },
  { title: 'Verzonden',       filter: 'orderSendDate not null and orderDeliverDate eq null' },
  { title: 'Geleverd',        filter: 'orderDeliverDate not null and invoiceDate eq null' },
  { title: 'Gefactureerd',    filter: 'invoiceDate not null and invoiceBookDate eq null' },
  { title: 'Geboekt',         filter: 'invoiceBookDate not null and invoicePayDate eq null' },
];
function orderUrl(filter) {
  return '?request_type=orders&$top=1000&$filter=' + filter;
}
function signOut() {
  aimClient.logout().catch(console.error).then(e => {
    aimClient.storage.removeItem('aimAccount');
    document.location.reload();
  });
}

function Abis() {
  abis = this;
  $().on('load', async e => {
    console.log('abis')
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


    


    if (!aimAccount) {
      function signIn() {
        aimClient.loginPopup(aimRequest).catch(console.error).then(authResult => {
          aimClient.storage.setItem('aimAccount', authResult.account.username);
          document.location.reload();
        });
      }
      console.log('aiiii')

      // const cookie = Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')));
      //
      // console.log(cookie);
      om.navtop.append(
        $('button').text('login').on('click', signIn),
      )
    } else {
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
        servers: [{url: 'https://dms.aliconnect.nl'}],
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
      const baseUrl = `https://dms.aliconnect.nl/lijst?`;
      async function orderlist(rows) {
        // console.log(rows);
        const access_token = await authProvider.getAccessToken();
        const cols = [
          { name: 'clientKeyName', title: 'Klant', cell: row => $('a').text(row.clientKeyName || '').href('?request_type=klant_pakbonnen&klantId='+row.clientKeyName) },
          { name: 'orderNr', title: 'Order', cell: row => $('a').target('page').text(row.orderNr || '').href(baseUrl + `request_type=order&order_uid=${row.orderUid}&access_token=${access_token}`) },
          { name: 'invoiceNr', title: 'Factuur', cell: row => $('a').target('page').text(row.invoiceNr || '').href(baseUrl + `request_type=invoice&invoice_uid=${row.invoiceUid}&access_token=${access_token}`) },
          { name: 'status', title: 'Status' },

          { name: 'orderDate', title: 'Besteld'},
          { name: 'orderPrintDate', title: 'Geprint', cell: row => row.orderPrintDate || $('button').text('printen') },
          { name: 'orderPickDate', title: 'Gepakt', cell: row => row.orderPickDate || $('button').text('gepakt') },
          { name: 'orderSendDate', title: 'Verstuurd', cell: row => row.orderSendDate || $('button').text('verstuurd') },
          { name: 'orderDeliverDate', title: 'Geleverd', cell: row => row.orderDeliverDate || $('button').text('afgeleverd') },
          { name: 'orderDoneDate', title: 'Gereed'},
          { name: 'invoiceDate', title: 'Gefactureerd', cell: row => row.payCash || $('button').text('factureren') },
          { name: 'invoiceSendDate', title: 'Verzonden', cell: row => row.payCash || $('button').text('verzenden') },
          { name: 'invoicePayDate', title: 'Betaald', cell: row => row.invoicePayDate || $('button').text('betaald') },
          { name: 'invoiceBookDate', title: 'Geboekt', cell: row => row.payCash || $('button').text('geboekt') },
          { name: 'payCash', title: 'Contant', cell: row => row.payCash || $('input').name('contant') },
          { name: 'payPin', title: 'Pin', cell: row => row.payPin || $('input').name('pin') },
          { name: 'payBank', title: 'Bank', cell: row => row.payBank || $('input').name('bank') },
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
        return;


        console.log(access_token);
        // const baseUrl = `https://dms.aliconnect.nl/lijst?`;
        $('list').text('').append(
          $('frameset').attr('cols', '30%,70%').append(
            $('frame').name('list').src('index.html'),
            $('frame').name('page').src('index.html'),
          )
        );


        return;
        $('list').class('col').text('').append(
          $('nav').class('top').append(
            $('a').text('home').href(document.location.pathname),
            orderFilters.map(f => $('a').text(f.title).href(orderUrl(f.filter))),
            // $('button').text('orders-geprint').on('click', e => orders('orders-geprint')),
            // $('button').text('openstaand').on('click', openstaand),
            // $('button').text('logout').on('click', signOut),
          ),
          $('div').class('row').style('height:-webkit-calc(100% - 50px);').append(
            $('div').class('aco').style('overflow:auto;').append(
              $('table').append(
                $('thead').append($('tr').append(cols.map(col => $('th').text(col.title)))),
                $('tbody').append(
                  rows.map(row => row.trElem = $('tr').append(
                    cols.map(col => $('td').class(col.name).append(
                      col.cell ? col.cell(row) : $('span').text(row[col.name] || ''),
                    )),
                  ))
                ),
              ),
            ),
            $('iframe').name('page').style('width:600px;height:100ve;'),
          )
        )
        console.log(url.searchParams.get('klantId'));
      }
      function orders(request_type){
        dmsClient.api('/lijst').query('request_type', request_type).get().then(body => orderlist(body.values));
      }
      function openstaand(){
        dmsClient.api('/lijst').query('request_type', 'klanten_openstaand').get().then(body => {
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
                    dmsClient.api('/lijst')
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
      console.log(dmsConfig);
      abis[url.searchParams.get('request_type') || 'home']();

      $(window).on('popstate', e => {
        console.log('aaaa');
        e.preventDefault();
        if (document.location.hash.substr(1)) {
          const url = new URL(document.location.hash.substr(1), document.location.origin);
          if (url.searchParams.has('l')) {
            const listUrl = aim.idToUrl(url.searchParams.get('l'));
            console.log(listUrl);
            dmsClient.api(listUrl)
            // .query('request_type', 'klant_pakbonnen')
            // .query('klantId', url.searchParams.get('klantId'))
            .get().then(body => orderlist(body.values))

          }

        }
        // console.warn(e.target);
      })
      // $(window).on('hashchange', e => {
      //   e.preventDefault();
      // })
    }


  })
}
Abis.prototype = {
  home(){
    om.navtop.append(
      $('a').text('home').href(document.location.pathname),
      // $('a').text('home').href(document.location.pathname),
      // $('button').text('orders-geprint').on('click', e => orders('orders-geprint')),
      // $('button').text('openstaand').on('click', openstaand),
      $('button').text('logout').on('click', signOut),
    );
    om.navleft.append(
      $('ul').append(
        orderFilters.map(f => $('li').append (
          // $('a').text(f.title).href( orderUrl(f.filter) )),
          $('a').text(f.title).href( '#?l=' + aim.urlToId('/lijst'+orderUrl(f.filter)))),
        ),
      )
    )
    // om.list.append(
    //   $('div').text("JAAA"),
    // );

    // $("om-main").text('').append(
    //   $('h2').text('orders'),
    //   $('ul').append(
    //   ),
    // )
  },
  async klant_pakbonnen(klantId) {
    dmsClient.api('/lijst')
    .query('request_type', 'klant_pakbonnen')
    .query('klantId', url.searchParams.get('klantId'))
    .get().then(body => orderlist(body.values))
  },
  async orders() {
    dmsClient.api('/lijst' + document.location.search)
    // .query('request_type', 'klant_pakbonnen')
    // .query('klantId', url.searchParams.get('klantId'))
    .get().then(body => orderlist(body.values))
  },
  // construct: {
  //   description: 'jgsdjf gsdl;kf jgsldjfglk sjd;lfj',
  //   value: function(s) {
  //     console.error(111, s);
  //   }
  // }
}

new Abis;

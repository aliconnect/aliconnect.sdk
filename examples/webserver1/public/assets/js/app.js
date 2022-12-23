Web.init({
  // authRoot: 'https://oauth.aliconnect.nl/v1',
  // socketRoot: 'https://aliconnect.nl:444',
  serviceRoot: 'https://aliconnect.nl/v1',
  // cssPrintUrl: 'https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css',
}).on('loaded', async (Aim) => {
  // await Web.init();
  $(document.body).append(
    $('nav').append(
      $('button').text('Companyname bijwerken').on('click', event => companies[1].companyName = 'Company 1 '+new Date().toLocaleString()),
    ),
    $('ol'),
    $('div').id('verkeerslichten'),
  );

  window.sessionStorage.setItem('accessToken', new URL(document.location).searchParams.get('access_token'));
  const getAccessToken = () => window.sessionStorage.getItem('accessToken');
  const client_id = new URL(document.location).searchParams.get('client_id');
  const {Client,Item,config} = Aim;
  var {online,serviceRoot} = config;
  serviceRoot = online ? 'https://aliconnect.nl/v1' : document.location.origin;
  var serviceClient = Client.create({getAccessToken,serviceRoot});
  console.log(serviceRoot);
  config(await Aim.fetch(`${serviceRoot}/client(${client_id})/config`).get());
  config({
    definitions:{
      verkeerslicht: {
        prototype: {
          init() {
            $('div').id(this.elemId).parent('#verkeerslichten').append(
              $('div').id(this.elemId).class('verkeerslicht').attr('stand', this.stand||'').append(
                $('div').class('rood'),
                $('div').class('geel'),
                $('div').class('groen'),
              ),
              $('button').text('rood').on('click', event => this.handstand = 'rood'),
              $('button').text('groen').on('click', event => this.handstand = 'groen'),
              !online ? null : $('button').text('verwijderen').on('click', event => this.delete()),
            )
          },
        },
      },
      company: {
        prototype: {
          init() {
            $('li').parent('body>ol').id(this.elemId).class('company').text(this.companyId,this.id).attr('companyname', this.companyName||'').append(
              $('input').size(30).name('companyName').value(this.companyName||'').on('change', event => this.companyName = event.target.value),
              !online ? null : $('button').text('verwijderen').on('click', event => this.delete()),
            );
          },
        },
      },
    },
  });
  const {definitions} = config;
  if (online) {
    var socketClient = Client.create({getAccessToken,serviceRoot: 'wss://aliconnect.nl:444'});
    $('body>nav').append(
      $('button').text('Company toevoegen').on('click', event => serviceClient.api(`/company`).body({companyName: 'New Company'}).post().then(Item.get)),
      $('button').text('Verkeerslicht toevoegen').on('click', event => Item.create({schemaName:'verkeerslicht', stand: 'gedoofd'})),
    )
    await serviceClient.api(`/company`).order('companyId').get().then(({value}) => value.map(Item.get));
    await serviceClient.api(`/verkeerslicht`).order('verkeerslichtId').get().then(({value}) => value.map(Item.get));

  } else {
    var socketClient = Client.create({getAccessToken,serviceRoot: document.location.origin.replace(/^http/,'ws')});
    await serviceClient.api(`/items`).get().then(({value}) => value.map(Item.get));
  }
  var companies = Array.from(Item.items.values()).filter(item => item.schema === definitions.company);
  var verkeerslichten = Array.from(Item.items.values()).filter(item => item.schema === definitions.verkeerslicht);
  await socketClient.connect();
});

(async function () {
  var dmshost = 'https://dms.aliconnect.nl';
  var loginhost = 'https://login.aliconnect.nl';
  // var client_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
  // var client_id = 'c52aba40-11fe-4400-90b9-cee5bda2c5aa';

  const aimConfig = {
    client_id: 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a',
    client_id: 'c52aba40-11fe-4400-90b9-cee5bda2c5aa',
  }
  const aimClient = new Aim.UserAgentApplication(aimConfig);
  // aimClient.storage.clear();
  await aimClient.init();

  console.log(aimClient.storage);

  const aimRequest = {
    scopes: [
      'profile admin.write',
    ],
  };

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
  dmsOptions = {

  };

  const dmsClient = Aim.Client.initWithMiddleware({authProvider}, dmsOptions);

  // var aimAccount = aimClient.getAccount();

  // console.log(aimAccount, aimClient.account.accountIdentifier);
  // var account_id = aimClient.account.accountIdentifier;
  var account_id = 'ddf32b40-ddc7-43ab-a9fd-4a2fe54dc076';

  // ta.value = JSON.stringify({
  //   a:1
  // }, null, 2);

  const system_id = 3683132;
  const links = [
    // {url: $().url(dmshost+'/system/build/tree2to1').query({client_id:aimConfig.client_id,account_id:account_id,id:3683132})},
    {url: $().url(dmshost+'/build').query({
      client_id:aimConfig.client_id,
      account_id:account_id,
      id:system_id,
      response_type:'data_v1'
    })},
    {url: $().url(dmshost+'/build').query({
      // client_id:aimConfig.client_id,
      // account_id:account_id,
      id:system_id,
      response_type:'config_data'
    })},
    {url: $().url(dmshost+'/build').query({
      // client_id:aimConfig.client_id,
      // account_id:account_id,
      id:system_id,
      response_type:'xls_data'
    })},
    {url: $().url(dmshost+'/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'clone'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'data_node'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'doc'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'clone_data'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'link_data'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'tree'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'breakdown'})},
    // {url: $().url(dmshost+'/system/build').query({client_id:aimConfig.client_id,account_id:account_id,id:system_id,response_type:'tree'})},
    {url: $().url(loginhost+'/token').query({
      response_type: 'token',
      scope: 'admin.write',
      days: 30,
      client_id: aimConfig.client_id,
      account_id: account_id,
      sub: 265090,
    })},

    {target: '_self', url: $().url(loginhost+'/oauth').query({
      response_type: 'token',
      scope: aimRequest.scopes.join(' '),
      days: 30,
      redirect_uri: document.location.href,
      client_id: aimConfig.client_id,
    })},
    {target: '_self', url: $().url(loginhost+'/oauth').query({
      response_type: 'code',
      scope: aimRequest.scopes.join(' '),
      days: 30,
      redirect_uri: document.location.href,
      client_id: aimConfig.client_id,
    })},

    {url: $().url(loginhost+'/token')
    .headers('Authorization', 'Bearer ' + aimClient.storage['aim.access_token'])
    .query({
      response_type: 'id_token',
      client_id: aimConfig.client_id,
    })},

    {url: $().url(dmshost+'/').query({client_id:aimConfig.client_id})},
    {url: $().url(dmshost+'/').query({client_id:aimConfig.client_id,account_id:account_id})},
    {url: $().url(dmshost+'/').query({client_id:aimConfig.client_id,account_id:account_id, accept:'text/yaml'})},
    {url: $().url(dmshost+'/config').query({client_id:aimConfig.client_id})},
    {url: $().url(dmshost+'/config').query({client_id:aimConfig.client_id, accept:'text/yaml'})},
    {url: $().url(dmshost+'/config').query({client_id:aimConfig.client_id, accept:'text/javascript'})},
    {
      url: $().url(dmshost+'/me')
      .headers('OData-Version', '3.0').headers('Aim-Version', '1.0')
      .headers('Authorization', 'Bearer ' + aimClient.storage['aim.access_token'])
      // .query({
      //   $select: 'CompanyName,Surname',
      // })
    },
    {
      url: $().url(dmshost+`/Company(${aimClient.clientId})`)
      .headers('OData-Version', '3.0').headers('Aim-Version', '1.0')
      .headers('Authorization', 'Bearer ' + aimClient.storage['aim.access_token'])
      // .query({
      //   $select: '*',
      // })
    },
    {
      url: $().url(dmshost+'/Contact(265090)')
      .headers('OData-Version', '3.0').headers('Aim-Version', '1.0')
      .headers('Authorization', 'Bearer ' + aimClient.storage['aim.access_token'])
      .query({
        client_id:aimConfig.client_id,
        account_id:account_id
      })
    },
    {
      url: $().url(dmshost+'/Contact(265090)')
      .headers('OData-Version', '3.0')
      .headers('Authorization', 'Bearer ' + aimClient.storage['aim.access_token'])
      .query({
        client_id:aimConfig.client_id,
        account_id:account_id
      })
    },
    {url: $().url(loginhost+'/account').query({client_id: aimConfig.client_id,account_id: account_id})},
    // {url: $().url(loginhost+'/account/scope').query({client_id: client_id,account_id: account_id})},

    {url: $().url(dmshost+'/translate').query({lang:'nl'})},
    {url: $().url(dmshost+'/system/build/data').query({client_id:aimConfig.client_id,account_id:account_id,id:3683132})},
    // {url: $().url(dmshost+'/system/build/doc').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},
    // {url: $().url(dmshost+'/system/build/clone_data').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},
    // {url: $().url(dmshost+'/system/build/tree').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},
    // {url: $().url(dmshost+'/system/build/node_data').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},
    // {url: $().url(dmshost+'/system/build/link_data').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},
    // {url: $().url(dmshost+'/system/build/breakdown').query({client_id:aimConfig.client_id,account_id:account_id,id:3682790})},

  ];
  links.forEach(link => {
    const url = link.url.toString();
    const details = $('details').parent('url_list');
    const summary = $('summary').style('font-weight:bold;').parent(details)
    .text(url+' ')
    .append(
      $('a').target(link.target || 'dest').href(url).text('OPEN')
    );
    function add_status(e, color = '') {
      $(summary).append(
        $('span').style(`color:${color};`).text([
          ' :',
          e.target.status,
          e.target.statusText,
          e.target.responseText.length, 'bytes',
          new Date().valueOf() - e.target.startTime.valueOf(), 'ms',
        ].join(' '))
      );
    }
    // const req = link.url.get();
    link.url.get().then(e => {
      try {
        add_status(e);
        if (e.target.status === 200) {
          summary.style('');
          const contentType = e.target.getResponseHeader('Content-Type');
          if (contentType === 'application/json') {
            const body = JSON.parse(e.target.responseText);
            $('pre').parent(details).text( JSON.stringify(body,null,2) );
          } else if (e.target.responseText.match(/error/)) {
            add_status(e, 'red');
            details.append(
              $('div').text(e.target.responseText)
            ).elem.open = true;
          } else {
            $('pre').parent(details).text( e.target.responseText );
          }
        }
      } catch (err) {
        add_status(e, 'red');
        details.append(
          $('div').text(e.target.responseText)
        ).elem.open = true;
      }
    }).catch(e => {
      add_status(e, 'red');
      details.append(
        $('pre').text(typeof e.body === 'string' ? e.body : JSON.stringify(e.body, null, 2))
      ).elem.open = true;
      // console.log(link.url, err);
    });
  });
})()

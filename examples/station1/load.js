(async function(){
  const aim = require('@aliconnect/sdk');
  const {Server} = require('@aliconnect/sdk/src/js/aim/server');

  const server = Server.init({
    http:{
      port: 8080,
    },
  });
  return;

  const {fetch,config} = aim;
  const {client_id} = config;
  const yamlConfig = String(fs.readFileSync('./config/config.yaml'));
  console.debug(client_id,yamlConfig);
  const clientConfig = await fetch('https://aliconnect.nl/v1/config').body(yamlConfig).post();
  console.log(clientConfig);
  // fs.writeFile(`./config/client/${client_id}.json`, JSON.stringify(clientConfig,null,2), err => err ? console.error(err) : null);
})()

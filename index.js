aim = require('@aliconnect/sdk/src/js/aim');
config = {
  host:{
    port:8080,
  },
  paths: {
    '/docs/api/aim.md': {
      get: {
        operationId: 'distAim',
      }
    }
  },
};
server = new aim.Server(config);
server.distAim = function () {
  return new Promise(async (success, fail) => {
    aim = require('./src/js/aim.js');
    const dist = new aim.Dist();
    dist.src('./src/js/aim.js');
    dist.src('./src/js/aim/web.js');
    dist.src('./src/css/web.css');
    dist.src('./src/css/om.css');
    dist.src('./src/css/doc.css');
    await dist.doc('aim', aim).catch(console.error);
    require('./src/js/aim/web.js');
    await dist.doc('aim/web', aim).catch(console.error);
    fs.readFile('./docs/api/aim.md', (err, data) => {
      if (err) fail(err);
      success({
        code: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: String(data),
      });
    });
  });
}

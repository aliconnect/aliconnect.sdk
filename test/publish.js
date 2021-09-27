(async function () {
  aim = require('@aliconnect/sdk');
  aim.dist.src('./src/css/web.css');
  aim.dist.src('./src/css/om.css');
  aim.dist.src('./src/js/aim.js');
  aim.dist.src('./src/js/aim/web.js');
  await aim.dist.doc('aim', aim).catch(console.error);
  require('../src/js/aim/web.js');
  await aim.dist.doc('aim/web', aim).catch(console.error);
})()

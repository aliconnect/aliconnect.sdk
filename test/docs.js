(async function(){
  aim = require('../src/js/aim.js');
  const dist = new aim.Dist();
  dist.src('./src/js/aim.js');
  dist.src('./src/js/aim/web.js');
  dist.src('./src/css/web.css');
  dist.src('./src/css/om.css');
  dist.src('./src/css/doc.css');
  await dist.doc('aim', aim).catch(console.error);
  require('../src/js/aim/web.js');
  await dist.doc('aim/web', aim).catch(console.error);
})();

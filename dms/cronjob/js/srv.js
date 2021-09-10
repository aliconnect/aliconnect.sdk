// var version='v1';
var tasklist = [], tasks = {
  mailer: { src: 'https://aliconnect.nl/aim/v1/api/srv/mailertask.php' },
  dms_mailer: { src: 'https://dms.aliconnect.nl/send_mail' },
  archive: { src: 'https://aliconnect.nl/aim/v1/api/srv/archivemail.php' },
  checkbonnen: { src: 'https://aliconnect.nl/airo/v1/api/pakbon/?monitor' },
}
onload = function () {
  if (!tasklist.length) for (var name in tasks) tasklist.push(tasks[name]);
  iframe.onload=function(){setTimeout(onload, 2000);}
  const src = tasklist.shift().src;
  console.log('SRC', src);
  iframe.src=src;
}

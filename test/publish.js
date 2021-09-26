(async function(){
  console.log('PUBLISH');
  const fs = require('fs');
  function clean_code(content){
    return content
    .replace(/\\\*.*?\*\\/gs,'')
    .replace(/\/\/.*?\n/gs,'')
    .split(/\n/)
    .filter(l => l.trim())
    .join('\n')
  }
  function minimize_code(content) {
    return content.replace(/\n/g, '')
  }
  function toLink(s){
    return s.replace(/\(|\)|\[|\]|,|\./g,'').replace(/ /g,'-').toLowerCase();
  }
  const all = [];
  function doc(objectname, topobj) {
    return new Promise((success, fail) => {
      // this[objectname] = require(`../${objectname}/src/${objectname}.js`);
      // console.log(aim.om)
      let filename = `docs/api/${objectname}.md`;
      console.log('doc', objectname);
      fs.readFile(filename, (err, data) => {
        if (err) throw err;
        const content = String(data);
        const index = ['**Table of contents**'];
        function addIndex(level, title, link){
          index.push(s = '                        '.slice(0,(level-1)*4) + `- [${title}](#${toLink(`${link}`)})`)
          console.log(s);
        }
        const doc = [];
        var chapters = Object.fromEntries(content.split(/[#]+ /).map(c => [c.split(/\r|\n/)[0], c]));
        // console.log(chapters);
        (function docObj(name, obj, level) {
          // console.log(1, name, all.includes(obj));
          if (obj !== topobj && all.includes(obj)) return;
          all.push(obj);
          const h = '#########'.slice(0,level-1 );
          function chap(title) {
            doc.push(h + ` ${title}`);
            return chapters[title] ? chapters[title].split('<!-- body -->')[1] : '';
          }
          function getProperties(obj, name){
            const pd = Object.getOwnPropertyDescriptors(obj);
            const entries = Object.entries(pd).filter(([key,value]) => value.enumerable);
            if (entries.length) {
              entries.forEach(([propertyName, descriptor]) => {
                if (descriptor.get || descriptor.set) {
                  chap((name ? name + '.' : '') + propertyName);
                }
                if ('value' in descriptor) {
                  docObj((name ? name + '.' : '') + propertyName, descriptor.value, level + 1);
                }
              });
            }
          }
          if (typeof obj === 'function') {
            // getProperties(obj, name);
            var content = String(obj).replace(
              /\/\*.*?\*\//gs,''
            ).replace(
              /\/\/.*?(?=\n|$)/gs,''
            ).replace(/\r/,'').split(/\n/).filter(l => l.trim());
            // console.log(content);
            var header = content.shift();
            // console.log(header);
            var params = header.match(/\((.*)\)/)[1] || '';
            content.pop();
            var ident = content[0] && content[0][0] === ' ' ? content[0].match(/^ +/)[0].length : 0;
            content = content.map(s => s.slice(ident)).join('\n')
            var title = name.replace(/(.*?)\.prototype/, '$1()');
            if (Object.keys(obj).length) {
              addIndex(level, `${name}`, `${name}`);
              var body = chap(`${name}`);
              getProperties(obj, name);
            }

            if (obj.name.match(/^[A-Z]/)) {
              var body = chap(`${title}(${params})`);
              addIndex(level, `Class: ${title}()`, `${title}(${params})`);
              doc.push('type: constructor');
            } else {
              var body = chap(`${title}(${params})`);
              addIndex(level, `${title}()`, `${title}(${params})`);
              // doc.push('type: function');
            }
            if (body) {
              doc.push('<!-- body -->', body.trim());
            }
            if (obj.prototype) {
              getProperties(obj.prototype, obj.name.replace(/\w/, s => s.toLowerCase()));
            }
            // Object.getOwnPropertyDescriptors(obj).forEach(console.log);
            // Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(entry => docObj(name+'.'+entry[0], entry[1], level+1));
            // doc.push("```\n"+content+"\n```");
          } else if (Array.isArray(obj)) {
            addIndex(level, `Array: ${name}`, `${name}`);
            doc.push(h + ` ${name}`);
          } else if (typeof obj === 'object') {
            addIndex(level, `${name}`, `${name}`);
            var body = chap(`${name}`);
            getProperties(obj, name);
          } else {
            addIndex(level, `${name}`, `${name}`);
            doc.push(h + ` ${name}`);
            doc.push('type: ' + typeof obj);
            doc.push('value: ' + obj);
          }
        })(topobj.name, topobj, 1);
        fs.writeFile(filename, index.concat(doc).join('\n'), (err) => {
          fail(err);
          success();
        });
      });

    })
  }
  function dist_file(objectname) {
    let sourcename = `./src/${objectname}`;
    fs.readFile(sourcename, (err, data) => {
      if (err) throw err;
      // data = clean_code(String(data));
      fs.writeFile(sourcename = `./dist/${objectname}`, data = clean_code(String(data)), (err) => {
        if (err) throw err;
        fs.writeFile(sourcename.replace(/(\.\w+)$/,'.min$1'), minimize_code(data), (err) => {
          if (err) throw err;
          console.log(`saved ${objectname}`);
          // doc(objectname);
        });
      });
    });
  }

  aim = require('../src/aim.js');
  dist_file('aim.js');
  await doc('aim', aim).catch(console.error);
  // aim.sql.connect();

  dist_file('markdown.js');
  markdown = require('../src/markdown.js');
  await doc('markdown', markdown).catch(console.error);

  dist_file('aim/web.js');
  dist_file('aim/web.css');
  require('../src/aim/web.js');
  await doc('aim/web', aim).catch(console.error);

  dist_file('aim/om.js');
  dist_file('aim/om.css');
  require('../src/aim/om.js');
  await doc('aim/om', aim).catch(console.error);

  dist_file('aim/prompt.js');
  require('../src/aim/prompt.js');
  await doc('aim/prompt', aim).catch(console.error);

  return;






})()

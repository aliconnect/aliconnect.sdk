fs = require('fs');
const Dist = Object.create({
  compress(content){
		return content.replace(/\/\*[^\/]*\*\/|\t|\r\n/, '')
		content.replace(/((\'[^\']*\')(*SKIP)(*FAIL)|(        |       |      |     |    |   |  ))/, " ")
		//content.replace(/(("[^"]*"|\'[^\']*\')(*SKIP)(*FAIL)|(        |       |      |     |    |   |  ))/, " ")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(} | } | }))/, "}")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|({ | { | {))/, "{")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(= | = | =))/, "=")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(&& | && | &&))/, "&&")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(\|\| | \|\| | \|\|))/, "||")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(, | , | ,))/, ",")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(: | : | :))/, ":")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(; | ; | ;))/, ";")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(- | - | -))/, "-")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(< | < | <))/, "<")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(> | > | >))/, ">")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(\* | \* | \*))/, "*")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(\+ | \+ | \+))/, "+")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(\? | \? | \?))/, "?")
		content.replace(/((replace[^\)]*\))(*SKIP)(*FAIL)|(\/ | \/ | \/))/, "||")
	},
	compress_js(content){
		return content
    .replace(/\t/, '  ')
    .skipreplace(/\/\*\*.*?\*\//gs, /\/\*.*?\*\//gs, '')
		// content.replace(/(("[^"]*"|\'[^\']*\')(*SKIP)(*FAIL)|\/\/[\s\S]+?)\r\n/, "")
		// content = compress(content);
		// content.replace(/\) | \) | \)/, ")")
		// content.replace(/\( | \( | \(/, "(")
	},
	compress_css(content){
		return compress(content);
	},
  minimizeCode(content) {
    return content.replace(/\n|\r/g, '')
  },
  cleanCode(content){
    // return content;
    var c = content;
    var s = '';
    const m = ['(',')','{','}','[',']',',','=','!','"','`',"'",'&','?',':','>','<','%','+','-','|',' ',';','*','/','\\'];
    // for (var i=0;i<c.length;i++) {
    //   s+=c[i];
    // }
    // return s;

    for (var i=0;i<c.length;i++) {
      if (c[i] === '/' && c[i+1] === '/') {
        for (;i<c.length;i++) {
          if (c[i] === '\n') break;
        };
        continue;
      } else if (c[i] === '/' && c[i+1] === '*' && c[i+2] === '*') {
        for (;i<c.length;i++) {
          if (c[i] === '/' && c[i-1] === '*') break;
          s+=c[i];
        };
      } else if (c[i] === '/' && c[i+1] === '*') {
        for (;i<c.length;i++) {
          if (c[i] === '/' && c[i-1] === '*') break;
        };
        continue;
      } else {
        if (c[i] === '`' ) {
          s+=c[i++];
          for (;i<c.length;) {
            if (c[i] === '`') {
              if (c[i-1] !== "\\") break;
              // if (c[i-2] !== "/") break;
            }
            s+=c[i++];
          };
        } else if (c[i] === '"' ) {
          s+=c[i++];
          for (;i<c.length;) {
            if (c[i] === '"') {
              if (c[i-1] !== "\\") break;
              // if (c[i-2] !== "/") break;
            }
            s+=c[i++];
          };
        } else if (c[i] === "'" ) {
          s+=c[i++];
          for (;i<c.length;) {
            if (c[i] === "'") {
              if (c[i-1] !== "\\") break;
              // if (c[i-2] !== "/") break;
            }
            s+=c[i++];
          };
        } else if (c[i] === "/" ) {
          s+=c[i++];
          for (;i<c.length;i++) {
            if (c[i] === "\n") break;
            s+=c[i];
            if (c[i] === "/") {
              if (c[i-1] === "\\") continue;
              break;
            }
          };
          continue;
        } else if (c[i] === " " && (m.includes(c[i+1]) || m.includes(c[i-1]))) {
          continue;
        } else if (["\n","\r"].includes(c[i])) {
          continue;
        }
      }
      s+=c[i];
    }
    return s.replace(/\/\*\*.*?\*\//gs,'')+"\r\n";

    return s2;
    return content.skip(/(\/\*\*.*?\*\/)/gs, s => {
      return s.skip(/(\/\/.*?\n)/gs, s => {
        return s.skip(/('.*?'|".*?"|`.*?`)/gs, s => {
          return '';
          return s
          .replace(/(\/\*.*?\*\/)/gs, '')
          .replace(/(\/\/.*?)/g, '')
        })
      })
    });

    // .replace(/(\/\/.*?\n)/gs,'')
    return content;
    return this.compress_js(
      content
      .replace(/\/\/.*?\n/gs,'')
      .replace(/\\\*.*?\*\\/gs,'')
    )
    // .replace(new RegExp('\/\/.*?\n','gs'),'')
    // .split(/\n/)
    // .filter(l => l.trim())
    // .join('\n')
  },
  src(filename) {
    const source = process.cwd() + '/src/aim/' + filename;
    const dest = process.cwd() + '/dist/aim/' + filename;
    var content = fs.readFileSync(source);
    fs.writeFileSync(dest, content);
    var cleanCode = this.cleanCode(String(content));
    // return console.log(cleanCode);
    fs.writeFileSync(dest.replace(/\.(\w+$)/, '.min.$1'), cleanCode);
    return;
    var minimizeCode = this.minimizeCode(cleanCode);
    fs.writeFileSync(dest.replace(/\.(\w+$)/, '.min.$1'), minimizeCode);
    console.debug(`saved ${source} to ${dest}`);
  },


  distribute(options){
    return 1;
    this.all = [];
    function doc(objectname, topobj) {
      return new Promise((success, fail) => {
        // this[objectname] = require(`../${objectname}/src/${objectname}.js`);
        // console.debug(Aim.om)
        const all = this.all;
        let filename = `docs/api/${objectname}.md`;
        console.debug('doc', objectname);
        fs.readFile(filename, (err, data) => {
          if (err) throw err;
          const content = String(data);
          const index = ['**Table of contents**'];
          function addIndex(level, title, link){
            index.push(s = '                        '.slice(0,(level-1)*4) + `- [${title}](#${Format.asLink(`${link}`)})`)
            // console.debug(s);
          }
          const doc = [];
          var chapters = Object.fromEntries(content.split(/[#]+ /).map(c => [c.split(/\r|\n/)[0], c]));
          // console.debug(chapters);
          (function docObj(name, obj, level) {
            // console.debug(1, name, all.includes(obj));
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
              var content = String(obj)
              .replace(new RegExp('\/\*.*?\*\/','gs'),'')
              .replace(new RegExp('\/\/.*?(?=\n|$)','gs'),'')
              .replace(/\r/,'').split(/\n/).filter(l => l.trim());
              // console.debug(content);
              var header = content.shift();
              // console.debug(header);
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
              // Object.getOwnPropertyDescriptors(obj).forEach(console.debug);
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
  },
});
Dist.src('js/aim.js');
Dist.src('js/server.js');
Dist.src('js/control.js');
Dist.src('css/web.css');

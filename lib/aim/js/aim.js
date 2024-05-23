(function(global, factory) { typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Aim = factory()); }(this, function (exports) {
  Object.assign(String.prototype, {
    capitalize() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    code(type) {
      var s = this;
      const conv = {
        rep: (s,exp,cb1,cb2) => s.split(exp).map((s,i) => i % 2 ? cb1(s) : (cb2 ? cb2(s) : s)).join(''),
        hl: (s,name) => `<span class=hl-${name}>${s}</span>`,
        cmt: s => conv.hl(s,'cmt'),
        name: s => conv.hl(s,'name'),
        attr: s => conv.hl(s,'attr'),
        str: s => conv.hl(s,'str'),
        strings: (s,cb) => conv.rep(s,/(".*?"|'.*?')/g, conv.str, s=>conv.rep(s,/(`.*?`)/gs, conv.str, cb || conv.text)),
        fn: s => conv.hl(s,'fn'),
        res: s => conv.hl(s,'res'),
        text: s => s,
        html: s => conv.rep(s,/(&lt;\!--.*?--&gt;)/g, conv.cmt, s => {
          return conv.rep(s,/(&lt;.*?&gt;)/g, s => {
            return conv.rep(s,/(&lt;\/|&lt;)/, conv.text, s => {
              return conv.rep(s,/(^[\w-]+)/, conv.name, s => {
                return conv.rep(s,/(".*?")/, conv.str, s => {
                  return conv.rep(s,/('.*?')/, conv.str, s => {
                    return conv.rep(s,/([\w-]+)(?=&equals;)/g, conv.attr);
                  });
                });
              });
            });
          });
        }),
        md: s => conv.rep(s,/(#+.*?\n)/g, conv.name, conv.html),
        js: s => conv.rep(s,/([^:]\/\/.*?\n|\/\*.*?\*\/)/gs, conv.cmt, s => {
          return conv.strings(s,s => {
            return conv.rep(s,/([\w$]+)(?=\()/, conv.fn, s => s.replace(
              /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
              conv.res
            ).replace(
              /\b(Array|Date|eval|function|hasOwnProperty|Infinity|isFinite|isNaN|isPrototypeOf|length|Math|NaN|name|Number|Object|prototype|String|toString|undefined|valueOf)\b/g,
              '<span class=hl-methods>$1</span>'
            ).replace(
              /\b(alert|all|anchor|anchors|area|assign|blur|button|checkbox|clearInterval|clearTimeout|clientInformation|close|closed|confirm|constructor|crypto|decodeURI|decodeURIComponent|defaultStatus|document|element|elements|embed|embeds|encodeURI|encodeURIComponent|escape|event|fileUpload|focus|form|forms|frame|innerHeight|innerWidth|layer|layers|link|location|mimeTypes|navigate|navigator|frames|frameRate|hidden|history|image|images|offscreenBuffering|open|opener|option|outerHeight|outerWidth|packages|pageXOffset|pageYOffset|parent|parseFloat|parseInt|password|pkcs11|plugin|prompt|propertyIsEnum|radio|reset|screenX|screenY|scroll|secure|select|self|setInterval|setTimeout|status|submit|taint|text|textarea|top|unescape|untaint)\b/g,
              '<span class=hl-prop>$1</span>'
            ).replace(
              /\b(onblur|onclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onmouseover|onload|onmouseup|onmousedown|onsubmit)\b/g,
              '<span class=hl-events>$1</span>'
            )
            // .replace(/(\w+)(\s*\()/g, '<span class="hl-fn">$1</span>$2')
            .replace(/(\w+)(\s*:)/g, '<span class="hl-name">$1</span>$2')
            .replace(/\.(\w+)/g, '.<span class="hl-attr">$1</span>')
            .replace(/\b([A-Z]\w+)\./g, '<span class="hl-obj">$1</span>.')
            .replace(/\b(\w+)\./g, '<span class="hl-attr">$1</span>.')
            .replace(/\b(\d+)\b/g, '<span class="hl-nr">$1</span>')
            .replace(/\b([A-Z]\w+)/g, '<span class="hl-obj">$1</span>'));
          });
        }),
        javascript: s => conv.js(s),
        css: s => s.replace(/(.*?)(\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return codeString.replaceOutsideQuotes(
            codeString => codeString
            .replace(/\.(.*)\b/g, '.<span class="hl-obj">$1</span>')
          ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        }),
        json: s => {
          return s.replace(/"(.*?)":/g, '"<span class="hl-fn">$1</span>":')
          .replace(/(:\s*)"(.*?)"/g, '$1"<span class="hl-string">$2</span>"')
        },
        yaml: s => s.replace(/(.*?)(#.*?\n|$)/gs, (s,codeString,cmt) => {
          return codeString
          .replace(/^(?=\s*)(.+?):/gm, '<span class="hl-fn">$1</span>:')
          .replace(/: (.*?)$/gm, ': <span class="hl-string">$1</span>')
          + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        }),
        php: s => s.replace(/(.*?)(\/\/.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return codeString.replaceOutsideQuotes(codeString => codeString.replace(
            /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
            '<span class=hl-res>$1</span>'
          )) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        }),
        sql: s => s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return codeString.replaceOutsideQuotes(codeString => codeString.replace(
            /\b(ADD|ADD CONSTRAINT|ALTER|ALTER COLUMN|ALTER TABLE|ALL|AND|ANY|AS|ASC|BACKUP DATABASE|BETWEEN|CASE|CHECK|COLUMN|CONSTRAINT|CREATE|CREATE DATABASE|CREATE INDEX|CREATE OR REPLACE VIEW|CREATE TABLE|CREATE PROCEDURE|CREATE UNIQUE INDEX|CREATE VIEW|DATABASE|DEFAULT|DELETE|DESC|DISTINCT|DROP|DROP COLUMN|DROP CONSTRAINT|DROP DATABASE|DROP DEFAULT|DROP INDEX|DROP TABLE|DROP VIEW|EXEC|EXISTS|FOREIGN KEY|FROM|FULL OUTER JOIN|GROUP BY|HAVING|IN|INDEX|INNER JOIN|INSERT INTO|INSERT|IS NULL|IS NOT NULL|JOIN|LEFT JOIN|LIKE|LIMIT|NOT|NOT NULL|OR|ORDER BY|OUTER JOIN|PRIMARY KEY|PROCEDURE|RIGHT JOIN|ROWNUM|SELECT|SELECT DISTINCT|SELECT INTO|SELECT TOP|SET|TABLE|TOP|TRUNCATE TABLE|UNION|UNION ALL|UNIQUE|UPDATE|VALUES|VIEW|WHERE)\b/gi,
            '<span class=hl-res>$1</span>'
          )) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        }),
        st: s => s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
          return codeString.replaceOutsideQuotes(codeString => codeString.replace(
            /\b(PROGRAM|END_PROGRAM|VAR|END_VAR|IF|THEN|ELSEIF|ELSIF|ELSE|END_IF|CASE|OF|END_CASE|FOR|TO|BY|DO|END_FOR|REPEAT|UNTIL|END_REPEAT|WHILE|DO|END_WHILE|EXIT|RETURN|ADD|SQRT|SIN|COS|GT|MIN|MAX|AND|OR|BYTE|WORD|DWORD|LWORD|INTEGER|SINT|INT|DINT|LINT|USINT|UINT|UDINT|ULINT|REAL|REAL|LREAL|TIME|LTIME|DATE|LDATE|TIME_OF_DAY|TOD|LTIME_OF_DAY|LTOD|DATE_AND_TIME|DT|LDATE_AND_TIME|LDT|CHAR|WCHAR|STRING|WSTRING|STRING|ANY|ANY_DERIVED|ANY_ELEMENTARY|ANY_MAGNITUDE|ANY_NUM|ANY_REAL|ANY_INT|ANY_UNSIGNED|ANY_SIGNED|ANY_DURATION|ANY_BIT|ANY_CHARS|ANY_STRING|ANY_CHAR|ANY_DATE|DATE_AND_TIME|DATE_AND_TIME|DATE|TIME_OF_DAY|LTIME_OF_DAY)\b/g,
            '<span class=hl-res>$1</span>'
          )
          .replace(
            /\b(LEN|CONCAT|LEFT|RIGHT|MID|INSERT|DELETE|REPLACE|FIND|SEL|MAX|MIN|LIMIT|MUX|TP|TON|TOF|R_TRIG|F_TRIG|TRUNC|TRUNC_INT|ROL|ROR|SHL|SHR|CTU|CTD|CTUD|ABS|SQR|LN|LOG|EXP|SIN|COS|TAN|ASIN|ACOS|ATAN|EXPT|NOT|AND|XOR|OR|MOD|BOOL_TO_INT|WORD_TO_DINT|BYTE_TO_REAL|REAL_TO_LREAL|TIME_TO_DINT)\b/g,
            '<span class=hl-methods>$1</span>'
          )
          .replace(
            /(&lt;|&gt;|&lt;&equals;|&gt;&equals;|&lt;&gt;|:&equals;|&equals;)/g,
            '<b class=hl-string>$1</b>'
          )
          .replace(
            /\b(BOOL|TRUE|FALSE)\b/gi,
            '<span class=hl-prop>$1</span>'
          )) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
        }),
      };
      s = (s || '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/=/g, '&equals;')
      .replace(/\t/g, '  ')
      .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>');
      // .replace(/"/g, '&quot;')
      // .replace(/'/g, '&apos;')
      if (conv[type]) {
        s = conv[type](s);
        // s = conv[type](s.replace(/\n+$/,'')).split(/\n/).map(s => `<div>${s}</div>`).join('');
        // s = conv[type](s).split(/\n/).join('\r\n');
      }
      return s;
    },
    render(type) {
      var s = this;
      if (type) {
        return this.code(s, type);
      }
      const lines = [];
      s = s.replace(
        /<\!-- docIndex -->.*?<\!-- \/docIndex -->/s,
        p => `<!-- docIndex -->\n${
          s.match(/^(#+) (.*)/gm)
          .map(h => h.replace(
            /(#+) (.*)/,
            (s,p1,h) => p1.replace(/#/g, '    ') + `- [${h}](#${Format.asLink(h)})`
          ))
          .join("\n")
        }\n<!-- /docIndex -->`
      );
      var identArray = [];
      var lineIdent = 0;
      // function closetag(lineIdent){
      //   const tags = identArray.slice(lineIdent).reverse();
      //   identArray.length = lineIdent;
      //   return tags.filter(Boolean).map(t => `</${t}>`).join('');
      // }
      // function opentag(tag,lineIdent){
      //   return `<${identArray[lineIdent] = tag}>`;
      // }
      function settag(lineIdent,tag=''){
        var s = '';
        const tags = identArray.slice(lineIdent+1).reverse();
        identArray.length = lineIdent+1;
        s += tags.filter(Boolean).map(t => `</${t}>`).join('');

        if (identArray[lineIdent]!=tag) {
          if (identArray[lineIdent]) {
            s += `</${identArray[lineIdent]}>`;
          }
          if (tag) {
            s += `<${tag}>`;
          }
          identArray[lineIdent] = tag;
        }
        return s;
      }
      s = s
      .replace(/\r/g,'')
      .replace(/  \n/g, '<BR>')
      // .replace(/((\*|-|\d+\.)\s.*?)\n\n\S/sg, (s,s1) => `LIST${s1}/LIST`)
      .replace(/(.*?)([^\n]*?```(.*?)\n(.*?)```|$)/gs, (s,md,s2,type,codeLines) => {
        s = ('\n\n' + md + '\n\n')
        .replace(/(^|\n)\s*> (\[\!(\w+)\]\s|.*?)(.+?)(?=\n\n|$)/gs, (s,p1,p2,p3,p4) => `${p1}<BLOCKQUOTE${p3?` class="${p3.toLowerCase()}"`:``}>${(p4||'').replace(/(^|\s)> /gm, ' ')}</BLOCKQUOTE>`)
        // .replace(/(\n[^\n]+?)(\n\s*-+\s\|\s.*?\n)(.*?)(?=\n\n|$)/gs, (s,p1,p2,p3) => `<TABLE><THEAD><TR><TH>${p1.trim().replace(/\s\|\s/g, '</TH><TH>')}</TH></TR></THEAD><TBODY><TR><TD>${p3.trim().replace(/\s\|\s/g, '</TD><TD>').replace(/\n/g,'</TD></TR>\n<TR><TD>')}</TD></TR></TBODY></TABLE>`)
        .replace(/(\n[^\n]+?\s\|\s.*?\n)(-.*?\n)(.*?)(?=\n\n|$)/gs, (s,p1,p2,p3) => `<TABLE><THEAD><TR><TH>${p1.trim().replace(/\s\|\s/g, '</TH><TH>')}</TH></TR></THEAD><TBODY><TR><TD>${p3.trim().replace(/\s\|\s/g, '</TD><TD>').replace(/\n/g,'</TD></TR>\n<TR><TD>')}</TD></TR></TBODY></TABLE>`)
        .replace(/(\n[^\n]+\s\|\s.*?\n\n)/gs, (s,p1) => `\n<TABLE><TBODY><TR><TD>${p1.trim().replace(/\s\|\s/g, '</TD><TD>').replace(/\n/g,'</TD></TR>\n<TR><TD>')}</TD></TR></TBODY></TABLE>\n`)
        .trim()
        .split(/\n/).map((s,i,lines) => {
          var p = '';
          if (s) {
            // console.debug(2,lineIdent,s);
            const prevLineIdent = lineIdent;
            lineIdent = (s.match(/^ +/)||[''])[0].length;
            if (s.match(/^\s*(\*|-|\d+\.) /)) {
              const tag = s.match(/^\s*(\*|-) /) ? 'UL' : 'OL';
              p += settag(lineIdent,tag);
              p += settag(lineIdent+1);
              p += settag(lineIdent+1,'LI');
              s = s.replace(/^\s*(\*|-|\d+\.) /, '');
            } else if (s.match(/^#/)) {
              s = s.replace(/^(#+) (.*)/, (s,p1,p2) => settag(0) + `<A class='anchor' title="${p2}" name="${s = Format.asLink(p2)}"></A><H${p1.length} class="${s}"><A class="anchorref" href="#${s}"></A>${p2}</H${p1.length}>`)
            } else if (!lines[i-1]) {
              const last = identArray[identArray.length-1];
              // console.debug(3,lineIdent,last,identArray[lineIdent+1],lines[i-1],lines[i],identArray);
              if (!lineIdent) {
                p += settag(lineIdent) + settag(lineIdent,'P');
              } else if (last === 'LI') {
                p += '<br><br>';
                // if (last === 'P') p += settag(lineIdent+2);
                // p += settag(lineIdent+2,'P');
              // } else if (identArray[lineIdent+1] === 'LI') {
              //   // if (last === 'P') p += settag(lineIdent+2);
              //   // p += settag(lineIdent+2,'P');
              } else {
                if (last === 'P') p += settag(lineIdent);
                p += settag(lineIdent,'P');
              }
            }
          }
          // console.debug(s);
          s = p + s.trim();
          // s = p + s;

          return s.replace(/  \n/g, '<BR>')
          // .replace(/\*\*`(.*?)`\*\*/g, '<CODE class="button">$1</CODE>')
          .replace(/\*\*`(.*?)`\*\*/g, '<BUTTON>$1</BUTTON>')
          .replace(/: _(.*?)_/g, ': <SPAN class="highlight">$1</SPAN>')
          .replace(/\^\^(.*?)\^\^/gs, '<MARK>$1</MARK>')
          .replace(
            /(.*?)(`(.*?)`|$)/g,
            (s1,p1,s2,p2) => p1
            .replace(/\!\[\]\((.*?)\)/g, (s,p1,p2) => `<IMG src="${p1}" alt="${Format.displayName(p1.split('/').pop().split('.').shift())}">`)
            .replace(/\!\[([^\]]*?)\]\((.*?)\)/g, '<IMG src="$2" alt="$1">')
            .replace(/\[\]\((.*?)\)(?=\s|\.|\b|$)/g, (s,p1) => `<A href="${p1}">${p1.split('#').map(Format.displayName).join(' > ').replace(/\.md/g,' ')}</A>`)
            .replace(/\[([^\[]*?)\]\((.*?)\)(?=\s|\.|\b|$)/g, '<A href="$2">$1</A>')
            .replace(/(http[^"^<]*?)(?=\.$|\.\s|$|\s)/g, '<A href="$1">$1</A>')
            .replace(/:::(\w+)(.*?):::/gs, '<$1$2></$1>')

            // .replace(/(?![^<]*>)\*\*(.+?)\*\*/g, '<B>$1</B>')
            .replace(/\*\*(.+?)\*\*/g, '<B>$1</B>')
            .replace(/(?![^<]*>)__(.+?)__/g, '<B>$1</B>')
            .replace(/(?!<a[^>]*>)(?![^<]*>)_(.+?)_(?![^<]*<\/a>)/gi, '<I>$1</I>')
            .replace(/(?![^<]*>)\*(.+?)\*/g, '<I>$1</I>')

            // .replace(/\[ \]/g, '&#9744;')
            // .replace(/\[x\]/g, '&#9746;')
            .replace(/\[ \]/g, '<input type="checkbox" onclick="return false;">')
            .replace(/\[x\]/g, '<input type="checkbox" onclick="return false;" checked>')
            .replace(/\[v\]/g, '&#9745;')
            .replace(/~~(.*?)~~/g, '<DEL>$1</DEL>')
            .replace(/~(.*?)~/g, '<U>$1</U>')
            + (p2 ? `<CODE>${p2.code()}</CODE>` : '')
          )
        }).join('\n').split(/\n\n/).map((s,i,lines) => {
          return s;
          // return '<P>'+s+'</P>';
        }).join('\n');

        if (codeLines) {
          lineIdent = (codeLines.match(/^\s+/)||[''])[0].length;
          s += settag(lineIdent) + `<PRE><CODE language="${type = type.toLowerCase()}">${codeLines.code(type).replace(/\n/g,'<br>')}</CODE></PRE>`;
        }
        return s + settag(0);
      });
      this.s = s
      .replace(/<P>[\s|\n]*<\/P>/gs,'')
      .trim();
      // s.replaceTags = function(){
      //   return s = 'ja';
      // }
      // return s;
      return s;
    },
    replaceTags(context){
      return this.replace(/\$\$\{(.*?)\}/g, (s,p1) => {
        for (var obj = context, a = p1.split(/\./), i=0;a[i] && obj;i++) {
          obj = obj[a[i]];
        }
        return obj || '';
      }).replace(/\$\{(.*?)\}/g, (s,p1) => {
        for (var obj = context, a = p1.split(/\./), i=0;a[i] && obj;i++) {
          obj = obj[a[i]];
        }
        return obj ? `<span class="inp">${obj || ''}</span>` : `<span class="err">${s}</span>`;
      });
    },
    stripTags() {
      return this.replace(/(<([^>]+)>)/gi, "");
    },
    unident(identspaces = 0) {
      const ident = (this.match(/^ +/)||[''])[0].length;
      return this.split(/\n/).map(s => (identspaces ? ' '.repeat(identspaces) : '') + s.slice(ident)).join('\n');//.trim();
    },
    replaceOutsideQuotes(callback, pre = '<span class=hl-string>', post = '</span>') {
      // const a = codeString.split(/((?<![\\])['"`])((?:.(?!(?<![\\])\1))*.?)\1/);
      const a = this.split(/(['"`])\1/);
      return a.map((s,i) => i%3===0 ? (callback ? callback(s) : s) : i%3===2 ? `${a[i-1]}${pre}${s}${post}${a[i-1]}` : '').join('');
    },
    skipreplace(skipRegexp, regexp, callback){
      // console.debug(this.split(skipRegexp));
      return this.split(skipRegexp).map((s,i) => i % 2 ? s : s.replace(regexp, callback)).join('');
    },
    skip(skipRegexp, callback){
      // console.debug(this.split(skipRegexp));
      return this.split(skipRegexp).map((s,i) => i % 2 ? s : callback(s)).join('');
    },
    camelCase(){
      return this.replace(/_([a-z])/, (s,p1) => p1.toUpperCase() );
    },
    displayName(){
      return this.replace(/^\w/,v => v.toUpperCase())
      .replace(/([a-z])([A-Z|\d])/g, (v,p1,p2,p3) => p1+' '+p2.toLowerCase())
      .replace(/_|-/g, ' ');
    },
    upperCaseName(){
      return this.replace(/([a-z])([A-Z|\d])/g, (v,p1,p2,p3) => p1+'_'+p2).toUpperCase()
    },
  });
  Object.assign(Number.prototype, {
    formatMoney(c, d, t){
      var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? ', ' : d,
      t = t == undefined ? '.' : t,
      s = n < 0 ? '-' : '',
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
      j = (j = i.length) > 3 ? j % 3 : 0;
      return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
    },
    pad(size){
      var s = String(this);
      while (s.length < (size || 2)){
        s = '0' + s;
      }
      return s;
    },
  });
  Object.defineProperty(Array.prototype, 'unique', {
    value() {
      return this.filter((event,i,arr) => arr.indexOf(event) === i)
    },
  });
  Object.assign(Date.prototype, {
    addDays(days){
      this.setDate(this.getDate() + days);
      return this;
    },
    getWeek(){
      var d = new Date(+this);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
    },
    getWeekday(){
      return (this.getDay() + 6) % 7;
    },
    monthDays(){
      var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
      return d.getDate();
    },
    // toDateText(full){
    //   // return this.toDateString();
    //   let res = '';
    //   if (this){
    //     const now = new Date();
    //     let dagen = Math.ceil((this.getTime() - now.getTime()) / 24 / 60 / 60 / 1000);
    //     let dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saterday', 'Sunday'];
    //     let monthNames = ['Januari', 'Februari', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];
    //     const time = this.toLocaleTimeString();
    //     return [
    //       __(dagen===0 ? 'Today' : dagen === -1 ? 'Yesterday' : dayNames[this.getDay()-1]),
    //       this.getDate(),
    //       __(monthNames[this.getMonth()-1]),
    //       this.getFullYear(),
    //       time === '00:00:00' ? '' : time.substr(0,5),
    //       __('week'),
    //       this.getWeek(),
    //     ].filter(Boolean).join(' ');
    //     // res += '-'+this.toISOString();
    //     //var t = this.toLocaleTimeString().substr(0, 5);
    //     //if (t != '00:00') res += ' ' + t;
    //   }
    //   return res;
    // },
    // toDateTimeText(full){
    //   var res = this.toDateText();
    //   if (this.getHours() || this.getMinutes()) res += this.toLocaleTimeString().substr(0, 5);
    // },
    // toDateTimeStr(length){
    //   //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    //   var s = this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2);
    //   if (this.getHours() != 0 && this.getMinutes() != 0 && this.getSeconds() != 0)
    //   s += ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2); + '.' + this.getMilliseconds().pad(3);
    //   return s.substring(0, length);
    // },
    // toDateTimeStringT(){
    //   //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    //   return this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2) + 'T' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    // },
    // toDateTimeString(){
    //   //    return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getFullYear() + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    //   return this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate().pad(2) + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + '.' + this.getMilliseconds().pad(3);
    // },
    // toLocal(){
    //   this.setTime(this.getTime() - this.getTimezoneOffset() * 60 * 1000);
    //   return this;
    // },
    // toLocalDBString(){
    //   this.setTime(this.getTime() - this.getTimezoneOffset() * 60 * 1000);
    //   return this.toISOString().replace(/T|Z/g, ' ');
    // },
    // toShortStr(){
    //   return this.getDate().pad(2) + '-' + (this.getMonth() + 1).pad(2) + ' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2);
    // },
    // toWeekDay(){
    //   return this.getFullYear() + '-' + this.getWeek() + ' ' + day[this.getDay()];
    // },
    toDisplayString(long) {
      let string = '';
      const options = {};
      const now = new Date();
      if (this.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
        options.month = 'numeric';
        options.day = 'numeric';
      } else if (this.toLocaleDateString() === now.toLocaleDateString() && !this.getHours() && !this.getMinutes()) {
        return 'Vandaag';
      } else {
        // if (this.toLocaleDateString() === new Date().addDays(-1).toLocaleDateString()) {
        //   string = 'Gisteren ';
        // } else if (this.toLocaleDateString() === new Date().addDays(1).toLocaleDateString()) {
        //   string = 'Morgen ';
        // } else
        options.weekday = 'short';
        if (this.getWeek() !== now.getWeek()) {
          options.month = 'numeric';
          options.day = 'numeric';
        } else if (this.getHours() || this.getMinutes()) {
          options.hour = '2-digit';
          options.minute = '2-digit';
        }
      }
      if (long) {
        if (this.getHours() || this.getMinutes()) {
          options.hour = '2-digit';
          options.minute = '2-digit';
        }
      }
      return Object.values(options).length ? string + this.toLocaleString('nl-NL', options).capitalize() : string;
    },
    toDisplayDateTimeString(){
      return this.toLocaleString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    toDisplayDateString(){
      return this.toLocaleString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    toDisplayTimeString(){
      return this.toLocaleString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    toValueTimeString(){
      return this.toLocaleString('sv-SE', {hour: '2-digit',minute: '2-digit'})
    },
    toValueDateString(){
      return this.toLocaleString('sv-SE', {year: 'numeric',month: '2-digit',day: '2-digit'})
    },
    toValueDateTimeString(){
      return this.toLocaleString('sv-SE')
    },
  });
  Object.assign(JSON, {
    stringifyReplacer(data, a, space) {
      const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null){
            if (seen.has(value)){
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };
      return JSON.stringify(data, getCircularReplacer(), space);
    },
    parseDefault(context, defaultValue){
      try {
        return JSON.parse(context) || defaultValue;
      } catch (err) {
        return defaultValue;
      }
    }
  });
  Crypto = {
    base64_encode(obj){
      return this.btoajson(JSON.stringify(obj));
    },
    jwt_signature(base64_header, base64_payload, secret){
      var message = [base64_header, base64_payload].join('.');
      var signature = this.btoaToJson(CryptoJS.HmacSHA256(message, secret).toString(CryptoJS.enc.Base64));
      //var signature = this.btoaToJson(crypto.createHmac('sha256', secret).update(message).digest('base64'));//.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
      // console.debug("signature", base64_header, base64_payload, secret, signature);
      return signature;
    },
    jwt_encode(payload, secret){
      var base64_header = this.base64_encode({ typ: "JWT", alg: "sha256" });
      var base64_payload = this.base64_encode(payload);
      return [base64_header, base64_payload, this.jwt_signature(base64_header, base64_payload, secret)].join('.');
    },
    btoajson(s){
      return this.btoaToJson(btoa(s));
    },
    btoaToJson(s){
      return s.replace(
        /\+/g,
        '-'
      ).replace(
        /\=/g,
        ''
      ).replace(
        /\//g,
        "_"
      );
    },
    decodeId(id){
      if (!id) return {};
      var a = id.split('.');
      return JSON.parse(atob(a[1] || a[0]));
    },
  };
  Format = Object.create({
    minimist(args, opts){
      if (!opts) opts = {};
      var flags = { bools: {}, strings: {}, unknownFn: null };
      if (typeof opts['unknown'] === 'function'){
        flags.unknownFn = opts['unknown'];
      }
      if (typeof opts['boolean'] === 'boolean' && opts['boolean']){
        flags.allBools = true;
      } else {
        [].concat(opts['boolean']).filter(Boolean).forEach(function (key){
          flags.bools[key] = true;
        });
      }
      var aliases = {};
      Object.keys(opts.alias || {}).forEach(function (key){
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(function (x){
          aliases[x] = [key].concat(aliases[key].filter(function (y){
            return x !== y;
          }));
        });
      });
      [].concat(opts.string).filter(Boolean).forEach(function (key){
        flags.strings[key] = true;
        if (aliases[key]){
          flags.strings[aliases[key]] = true;
        }
      });
      var defaults = opts['default'] || {};
      // var argv = { _: [] };
      var argv = { };
      // var argv = {};//{ _: [] };
      Object.keys(flags.bools).forEach(function (key){
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
      });
      var notFlags = [];
      if (args.indexOf('--') !== -1){
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
      }
      function argDefined(key, arg){
        return (flags.allBools && /^--[^=]+Aim/.test(arg)) ||
        flags.strings[key] || flags.bools[key] || aliases[key];
      }
      function setArg(key, val, arg){
        if (arg && flags.unknownFn && !argDefined(key, arg)){
          if (flags.unknownFn(arg) === false) return;
        }
        var value = !flags.strings[key] && !isNaN(val)
        ? Number(val) : val
        ;
        setKey(argv, key.split('-'), value);
        (aliases[key] || []).forEach(function (x){
          setKey(argv, x.split('-'), value);
        });
      }
      function setKey(obj, keys, value){
        var o = obj;
        keys.slice(0, -1).forEach(function (key){
          if (o[key] === undefined) o[key] = {};
          o = o[key];
        });
        var key = keys[keys.length - 1];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean'){
          o[key] = value;
        }
        else if (Array.isArray(o[key])){ o[key].push(value); }
        else {
          o[key] = [o[key], value];
        }
      }
      function aliasIsBoolean(key){
        return aliases[key].some(function (x){
          return flags.bools[x];
        });
      }
      for (var i = 0; i < args.length; i++){
        var arg = args[i];
        if (/^--.+=/.test(arg)){
          // Using [\s\S] instead of . because js doesn't support the
          // 'dotall' regex modifier. See:
          // http://stackoverflow.com/a/1068308/13216
          var m = arg.match(/^--([^=]+)=([\s\S]*)Aim/);
          var key = m[1];
          var value = m[2];
          if (flags.bools[key]){
            value = value !== 'false';
          }
          setArg(key, value, arg);
        }
        else if (/^--no-.+/.test(arg)){
          var key = arg.match(/^--no-(.+)/)[1];
          setArg(key, false, arg);
        }
        else if (/^--.+/.test(arg)){
          var key = arg.match(/^--(.+)/)[1];
          var next = args[i + 1];
          if (next !== undefined && !/^-/.test(next)
          && !flags.bools[key]
          && !flags.allBools
          && (aliases[key] ? !aliasIsBoolean(key) : true)){
            setArg(key, next, arg);
            i++;
          }
          else if (/^(true|false)Aim/.test(next)){
            setArg(key, next === 'true', arg);
            i++;
          }
          else {
            setArg(key, flags.strings[key] ? '' : true, arg);
          }
        }
        else if (/^-[^-]+/.test(arg)){
          var letters = arg.slice(1, -1).split('');
          var broken = false;
          for (var j = 0; j < letters.length; j++){
            var next = arg.slice(j + 2);
            if (next === '-'){
              setArg(letters[j], next, arg);
              continue;
            }
            if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)){
              setArg(letters[j], next.split('=')[1], arg);
              broken = true;
              break;
            }
            if (/[A-Za-z]/.test(letters[j])
            && /-?\d+(\.\d*)?(event-?\d+)?Aim/.test(next)){
              setArg(letters[j], next, arg);
              broken = true;
              break;
            }
            if (letters[j + 1] && letters[j + 1].match(/\W/)){
              setArg(letters[j], arg.slice(j + 2), arg);
              broken = true;
              break;
            }
            else {
              setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
            }
          }
          var key = arg.slice(-1)[0];
          if (!broken && key !== '-'){
            if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1])
            && !flags.bools[key]
            && (aliases[key] ? !aliasIsBoolean(key) : true)){
              setArg(key, args[i + 1], arg);
              i++;
            }
            else if (args[i + 1] && /true|false/.test(args[i + 1])){
              setArg(key, args[i + 1] === 'true', arg);
              i++;
            }
            else {
              setArg(key, flags.strings[key] ? '' : true, arg);
            }
          }
        }
        else {
          if (!flags.unknownFn || flags.unknownFn(arg) !== false){
            // argv._.push(
            // 	flags.strings['_'] || isNaN(arg) ? arg : Number(arg)
            // );
          }
          if (opts.stopEarly){
            argv._.push.apply(argv._, args.slice(i + 1));
            break;
          }
        }
      }
      Object.keys(defaults).forEach(function (key){
        if (!hasKey(argv, key.split('.'))){
          setKey(argv, key.split('.'), defaults[key]);
          (aliases[key] || []).forEach(function (x){
            setKey(argv, x.split('.'), defaults[key]);
          });
        }
      });
      if (opts['--']){
        argv['--'] = new Array();
        notFlags.forEach(function (key){
          argv['--'].push(key);
        });
      }
      else {
        notFlags.forEach(function (key){
          argv._.push(key);
        });
      }
      return argv;
    },
    /** @deprecated Omzetten van string naar object*/
    createParam (param, splitter){
      var result = {};
      if (param) param.split(splitter || '&').forEach(function (val){
        var val = val.split('='), name = val.shift(), val = val.shift();
        result[name] = val ? decodeURIComponent(val) : val;
      });
      return result;
    },
    /** @deprecated dateText */
    asDateText(date){
      const dateTime = new Date(date);
      dateTime.setHours(0,0,0,0);
      const now = new Date();
      now.setHours(0,0,0,0);
      const days = Math.round((dateTime.valueOf() - now.valueOf())/1000/60/60/24);
      if (days<-730) return '2 years ago';
      if (days<-365) return '1 year ago';
      if (days<-60) return '2 months ago';
      if (days<-30) return '1 month ago';
      if (days<-14) return '2 weeks ago';
      if (days<-7) return '1 weeks ago';
      if (days<-2) return 'last week';
      if (days<-1) return 'yesterday';
      if (days<0) return 'today';
      if (days>730) return 'after 2 years';
      if (days>365) return 'after 1 year';
      if (days>60) return 'after 2 months';
      if (days>30) return 'after 1 month';
      if (days>14) return 'over 2 weeks';
      if (days>7) return 'next week';
      if (days>1) return 'day after tomorrow';
      if (days>0) return 'tomorrow';
    },
    /** @deprecated aDate */
    asDate(d) {
      if (!d) return new Date();
      var resdate = new Date(d);
      if (d.length === 10) resdate.setTime(resdate.getTime() + resdate.getTimezoneOffset() * 60 * 1000);
      return resdate;
    },
    num(value, dig = 2) {
      return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: dig, maximumFractionDigits: dig }).format(value);
    },
    displayName(s){
      return String(s||'')
      .replace(/^\w/,v => v.toUpperCase())
      .replace(/([a-z])([A-Z|\d])(\w|)/g, (v,p1,p2,p3) => p1+' '+(p3.match(/[A-Z]/) ? p2 : p2.toLowerCase())+p3)
      .replace(/_|-/g, ' ');
    },
    asLink(s){
      return s.replace(/\(|\)|\[|\]|,|\.|\=|\{|\}/g,'').replace(/ /g,'-').toLowerCase();
    },

    displayvalue (row,property) {
      const {format,type,name} = property;
      if (format === 'date') return new Date(row[name]).toLocaleDateString();
      if (type === 'blob') return 'IS BLOB';
      return row[name]||'';
    },
    nameToTitle(name){
      return isNaN(name) ? (name||'').replace(/^\w/, s => s.toUpperCase()).replace(/-|_/g, ' ').replace(/([a-z])([A-Z])/g, (s,p1,p2) => `${p1} ${p2.toLowerCase()}`) : String(Number(name)+1)
    },

  });
  const self = this;
  let aimClient;
  console.msg = console.msg || console.info;
  /** String to array buffer */
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
  };
  function on(type, context, useCapture) {
    const selector = this.el || this.selector || this;
    this.forEach(type, context, (type, context) => {
      if (selector.addEventListener){
        selector.addEventListener(type, context, useCapture);
      } else {
        // if (type === 'change') console.debug('on', type, context, selector);
        const eventListeners = selector.eventListeners = selector.eventListeners || new Map();
        if (!eventListeners.has(type)) eventListeners.set(type, []);
        const eventListener = eventListeners.get(type);
        if (!eventListener.includes(context)){
          eventListener.push(context);
        }
      }
    });
    return this;
  }
  async function emit() {
    const args = Array.from(arguments);
    const type = args.shift();
    const selector = this.el || this.selector || this;
    if (selector.addEventListener){
      let event;
      if (typeof (Event) === 'function'){
        event = new Event(type);
      } else {
        event = document.createEvent('Event');
        event.initEvent(selector, true, true);
      }
      if (typeof context === 'object'){
        delete context.path;
        Object.assign(event, context);
      }
      await selector.dispatchEvent(event);
    } else {
      if (selector.eventListeners && selector.eventListeners.has(type)){
        for (const eventListener of selector.eventListeners.get(type)){
          await eventListener(...args);
        }
      }
    }
    return this;
  }
  function forEach(selector, context, fn) {
    if (selector instanceof Object){
      Object.entries(selector).forEach(entry => fn.call(this, ...entry));
    } else {
      fn.call(this, selector, context)
    }
    return this;
  }
  function randompassword() {
    a = [];
    for (var i = 0; i < 20; i++){
      // a.push(String.fromCharCode(48 + Math.round(74 * Math.random())));
      a.push(String.fromCharCode(33 + Math.round((126-33) * Math.random())));
    }
    return a.join('');
  }
  function setUserstate(userstate) {
    clearTimeout(this.stateTimeout);
    const config = this.config;
    if (this.access && this.access.sub){
      if (userstate === 'available'){
        this.stateTimeout = setTimeout(() => Aim.setUserstate('inactive'), 5 * Aim.config.minMs);
      } else if (userstate === 'inactive'){
        this.stateTimeout = setTimeout(() => Aim.setUserstate('appear_away'), 5 * Aim.config.minMs);
      }
      if (this.userstate !== userstate){
        Aim.send({
          // to: { aud: Aim.auth.access.aud, sub: Aim.auth.access.sub },
          sub: this.access.sub,
          userstate: this.userstate = userstate,
        });
      }
    }
  }
  function error(error) {
    try { throw new Error(); }
    catch (event) {
      // return end(200, JSON.stringify(event.stack), { 'Content-Type': 'application/json' })
      if (typeof event.stack === 'string') {
        let isFirst = true;
        for (var line of event.stack.split('\n')) {
          const matches = line.match(/^\s+at\s+(.*)/);
          if (matches) {
            if (!isFirst) {
              initiator = matches[1];
              break;
            }
            isFirst = false;
          }
        }
      }
    }
    error.initiator = initiator.split('\\').pop().split('/').pop().split(':').slice(0, 2).join(':').replace('.js', '').padEnd(12, ' ');
    return {error};
  }
  function error(error) {
    try { throw new Error(); }
    catch (event) {
      console.error(event);
    }
    console.error(error);
  }
  /** plaats bericht op console of in de ui */
  function promiseMessage(context,style) {
    const statusbarMain = document.querySelector('.statusbar>.main');
    return statusElem = statusbarMain
    ? $('span').parent(statusbarMain).text(context).style(style).on('click', event => statusElem.remove())
    : {
      text(){
        if (context) console.debug(context);
      },
      remove(){},
      style(){},
    };
  }
  /** toont status in de console */
  function setState(systemName, state){
    console.debug(systemName, 'state', state);
  }

  Translate = Object.create({
    line() {
      const translate = Aim.his.translate || new Map();
      // return '';
      return [].concat(...arguments).map(text => {
        if (translate.has(text)) return translate.get(text);
        text = Format.displayName(text);
        return text && translate.has(text) ? translate.get(text) : (text || '');
      }).join(' ');
    },
    /** load translate librarie */
    init(lang) {
      lang = (lang || navigator.language || navigator.userLanguage).split(/-/)[0];
      return Aim.fetch(dmsUrl + 'translate').query('lang', lang)
      .get().then(body => Aim.his.translate = new Map(Object.entries(body)));
    },
  });
  __ = Translate.line;
  Item = function () {
    const {config} = Aim;
    const options = Object.assign({},...arguments);
    if (options.id && Item.items.has(options.id)) return Item.items.get(options.id).assign(options);
    var {schemaName,id,serviceRoot} = options;
    const href = options['@odata.id'];
    if (href) {
      const url = new URL(href);
      const match = url.pathname.split('/').pop().match(/(\w+?)\((.*?)\)$/);
      if (match) {
        var [s,schemaName,id] = match;
      }
      serviceRoot = url.origin;
    }
    serviceRoot = serviceRoot || Aim.config.serviceRoot;
    const schema = Item.getSchema(schemaName);
    if (schema) {
      Object.setPrototypeOf(this, schema.prototype);
    }
    if (serviceRoot) {
      const url = new URL(serviceRoot);
      this.client = Client.clients.find(client => client.origin === url.origin);
    }
    this.assign(options);
    Item.items.set(this.id, this);
    if (this.init) {
      this.init();
    }
  };
  Object.assign(Item, {
    prototype: {
      get ErrorList(){
        const {options} = this.properties.errorItems;
        const errorItems = options.map((error,i) => Object.setPrototypeOf(this.errorItems[i]||{}, error));
        return {
          setError: (name, value = 1) => {
            value = value ? 1 : 0;
            errorItems.filter(error => error.name === name).forEach(error => {
              // console.debug(name,value)
              if (error.value != value) {
                error.lastModifiedDateTime = new Date().toISOString();
                error.value = value;
              }
              if (value && !error.state) {
                error.state = true;
                error.createdDateTime = new Date().toISOString();
              }
            });
            this.errorItems = errorItems;
            this.errorValues = errorItems.map(error => error.value).reverse().reduce((a,v) => (a << 1) | v,0);
            this.errorStates = errorItems.map(error => error.state).reverse().reduce((a,v) => (a << 1) | v,0);
            // this.errorItems = errorItems.map(({value,state,lastModifiedDateTime,createdDateTime}, idx) => ({idx,value,state,lastModifiedDateTime,createdDateTime})).filter(error => error.state);
            // console.debug(errorItems);

            // console.debug(this.errorItems);
            // console.debug(this.errorValues,this.errorStates,this.errorList);
            // this.errorList.filter(error => error.name == name).forEach(error => error.state = error.value == value || value ? true : false);
            // this.errorStates = this.errorList.map(error => error.state).reverse().reduce((a,v) => (a << 1) | v,0);
          },
          getError: (name) => {
            return errorItems.find(error => [error.name,error.title].includes(name))||{};
          },
          getErrors: () => {
            return errorItems;
            // return Array.from((this.errorStates).toString(2)).reverse().map((v,i) => Number(v) ? options[i] : null).filter(Boolean);
          },
        };
      },
      schemas: {},
      get id() {
        return this.data.id || this.data.Id;
      },
      set id(value) {
        console.error(value)
        this.data = this.data || {};
        this.data.id = value;
      },
      get href () {
        return this.data['@odata.id'];
      },
      get uri () {
        console.warn('Depricated, use item.href');
        return this.href;
      },
      api(path = '') {
        console.debug(this.client, this);
        return this.client.api(`/${this.schemaName}(${this.id})${path}`);
      },
      // data: {},
      assign () {
        this.data = Object.assign(this.data||{}, ...arguments);
        if (this.id) {
          Item.items.set(this.id,this);
        }
        return this;
      },
      post (options) {
        // const {client_id} = this.data;
        return this.client.api(`/${this.schemaName}`)
        // await this.client.api(`/client(${client_id})/item`)
        .body(options || this.data)
        .post()
        .then(body => this.assign(body));
      },
      patch (content) {
        return this.api().patch(content).then(body => this.assign(body));
      },
      async delete (update = true) {
        const {id} = this;
        Item.items.delete(id);
        if (document) {
          document.querySelectorAll('#'+this.elemId).forEach(el => el.remove());
        }
        if (update) {
          // await this.api().delete();
          this.deletedDateTime = new Date().toValueDateTimeString();
          Aim.emit('delete', {id});
        }

        /** @todo delete item fr0m items */
        /** @todo remove all related elements from gui */

        // console.warn('remove', this);
        // if (this.parent){
        //   if (this.parent.items){
        //     this.parent.items.splice(this.parent.items.indexOf(this), 1);
        //     this.elemTreeLi.el.remove();
        //     if (this.parent) {
        //       this.parent.reindex();
        //     }
        //     // Aim.delay(this.parent.reindex);
        //   }
        // }
        // Object.entries(this).filter(elem => elem instanceof Element).forEach(elem => elem.remove());

      },
      async get (query = {}) {
        const {id} = this.data;
        query.$select = query.$select || Array.from(Object.keys(this.properties)).join(',');
        return this.api().query(query).get().then(body => this.assign(body));
      },

      property(name) {
        const property = this.properties[name];
        const {options} = property;
        const get = () => this.data[name];
        return Object.create(property, {
          value: { get },
          displayValue: { get: () => {
            const value = get();
            if (options) {
              const option = options.find((option,i) => (option.value || i) === value) || {};
              return option.caption || option.title || option.name || value;
            }
          }},
          setOption: { value: (selector) => {
            this[name] = options.findIndex((option,i) => [option.title,option.name,option.value,i].includes(selector));
          }},
          option: { get: () => {
            return options.find((option,i) => [option.title,option.name,option.value,i].includes(selector));
          }},
          isOption: { value: (selector) => {
            return this[name] == options.findIndex((option,i) => [option.title,option.name,option.value,i].includes(selector));
          }},
          checkState: { value: () => {
            const value = get();
            const {settings,waitfor} = options[value]||{};
            // Object.entries(settings||{}).forEach(([n,v]) => this[n] = Number(isNaN(v) ? this[v] : v));
            if (waitfor && Array.from(Object.entries(waitfor)).map(([n,v]) => this[n] == v).every(Boolean)) {
              this[name] = Number(value) < options.length - 1 ? Number(value) + 1 : 0;
            }
          }},
          post: { value: () => {

          }}
        });
      },
      getAttribute (name) {
        var value = this.data[name];
        // console.debug(this.properties, name, this.properties[name]);
        const {type,properties,options} = this.properties[name] || {};
        if (value && properties && type==='string' && typeof value === 'string') {
          try {
            value = JSON.parse(value);
            return Array.isArray(value) ? {} : value;
          } catch (err) {
            return {};
          }
        }
        return value;

        return Object.assign(String(value),{get displayvalue(){
          if (options) {
            const option = options.find((option,i) => (option.value || i) === value) || {};
            return option.caption || option.title || option.name || value;
          }

          return value;
        }});
      },
      setAttribute (name, value, update = true) {
        const target = this;
        const {id} = this;
        if (typeof name === 'object') {
          Object.entries(name).forEach(entry => target.setAttribute(...entry));
        } else if (target.data[name] !== value) {
          // console.debug('setAttribute',update,id,name,target.data[name],value);
          const {client} = this;
          if (update) {
            // console.debug('setAttribute2',update,id,name,target.data[name],value);
            /** @debug wel/niet await, nu verwijderd maar soms nodig await. Weet niet meer wanneer nodig. Geen await zodat waarde in applicatie direct is aangepast */
            // if (client) await this.patch({[name]: value});
            if (client) this.patch({[name]: value});
            update = !update || !client;
            Aim.emit('patch', {target,name,value,id,update});
          }
          // console.debug('setAttribute3',update,id,name,target.data[name],value);
          target.data[name] = value;
          if (document) {
            document.body.querySelectorAll(`#${this.elemId}[${name}]`).forEach((el) => el.setAttribute(name, value));
            document.body.querySelectorAll(`#${this.elemId} [name="${name}"]`).forEach((el) => {
              // console.debug(el);
              if (el.hasAttribute('value')) el.setAttribute('value', value);
              else if ('value' in el) el.value = value;
              else el.innerText = value;
            });
            // document.body.querySelectorAll(`#${this.elemId} span[name="${name}"]`).forEach((el) => el.innerText = value);
          }
        }
        return this;
      },
    },
    index: 0,
    items: new Map,
    create(options) {
      const {schemaName} = options;
      return Aim.api(Aim.config.serviceRoot + `/${schemaName}`).body(options).post().then(item => {
        item = Item.get(item);
        const {id} = item;
        Aim.emit('post', {id,schemaName});
        return item;
      }).catch(err => console.error(err));
    },
    get(options) {
      return new Item(options);
    },
    getSchema(schemaName) {
      schemaName = schemaName || 'Item';
      if (!Item.prototype.schemas[schemaName]) {
        const {config} = Aim;
        const {definitions} = config;
        if (definitions[schemaName]) {
          const schema = definitions[schemaName];
          schema.schemaName = schemaName;
          schema.prototype = schema.prototype || {};
          // console.debug(schemaName,schema);
          for (var p = schema.prototype; p; p = Object.getPrototypeOf(p)) {
            if (Object.getPrototypeOf(p) === Object.prototype) break;
          }
          Object.setPrototypeOf(p, schema);
          const prototype = Object.create(Item.prototype);
          Object.setPrototypeOf(schema, prototype);
          Object.defineProperties(prototype, Object.fromEntries(schema.cols.map(({name}) => [name, {
            enumerable: true,
            get: function () {
              return this.getAttribute(name);
            },
            set: function (value) {
              this.setAttribute(name,value);
            },
          }])));
          Item.prototype.schemas[schemaName] = schema;
        }
      }
      return Item.prototype.schemas[schemaName];// = this.schemas[schemaName] || Object.create(this);
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    async post() {

    },
    validSchemaName (schemaName) {
      if (!schemaName) throw 'invalid schemaname';
      // TODO: Location illegal schema name
      return String(schemaName)
      .replace(/^\d|\.|\s|-|\(|\)|,/g,'')
      .replace(/\bLocation\b/,'Loc')
    },
  });
  const Client = Object.create({
    clients: [],
    create(options) {
      let {client_id,serviceRoot,apiKey,getAccessToken,from,showPopup,redirect_uri,scope,refresh_token} = options;
      if (!serviceRoot) throw 'no serviceRoot';
      const url = new URL(serviceRoot);
      options.origin = url.origin;
      // options.hostname = url.hostname;
      // options.host = url.host;
      // if (apiKey) {
      //   async function getAccessToken(){
      //     return apiKey;
      //   }
      //   return Object.assign(this, { getAccessToken });
      // }
      function getToken(token){
        return token ? JSON.parse(atob(token.split('.')[1])) : {};
      }
      async function getTokenFromRefreshToken(refresh_token){

        const body = await api('/token').post({
          grant_type: 'refresh_token',
          refresh_token,
          redirect_uri,
          scope,
          client_id,
        });
        // console.debug(111, body);
        const {access_token} = body;
        // console.debug(123,getToken(access_token),getToken(id_token),getToken(refresh_token));
        // return;
        Aim.sessionStorage.setItem('Aim.access_token' + client_id, access_token||'');
        return access_token;
        // Aim.localStorage.setItem('Aim.id_token' + client_id, id_token||'');
        // Aim.localStorage.setItem('Aim.refresh_token' + client_id, refresh_token||'');
        // url.searchParams.delete('code');
        // url.searchParams.delete('state');
        // Aim.replaceState(url);



        // document.location.reload();
      }
      async function getTokenFromAuthCode(code){
        const grant_type = 'authorization_code';
        const body = await api('/token').post({grant_type,code,redirect_uri,scope,client_id});
        const {access_token,id_token,refresh_token} = body;
        account.id_token = id_token;
        account.access_token = access_token;
        account.refresh_token = refresh_token;
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        // console.debug(account, account.id.name);
        // document.querySelectorAll('.accountname').forEach(el => el.innerText = account.id.name)
        // Object.setPrototypeOf(Object.getPrototypeOf(account),id);
        // console.debug(getToken(id_token));
        // Object.setPrototypeOf(Object.getPrototypeOf(account),Object.create(getToken(id_token)));
        // console.debug(account);



        // Aim.replaceState(url);
        document.location.reload();
      }
      function Account() {
        // this.access = getToken(Aim.sessionStorage.getItem(`Aim.access_token.${client_id}`));
        // this.id = getToken(Aim.sessionStorage.getItem(`Aim.id_token.${client_id}`));
        // Object.setPrototypeOf(this, {
        //   get idToken() {
        //     return getToken(Aim.localStorage.getItem('Aim.id_token' + client_id));
        //   },
        //   get signedIn() {
        //     return Aim.localStorage.getItem('Aim.id_token' + client_id) ? true : false;
        //   },
        // })
      }
      Account.prototype = {
        get access_token() {
          return Aim.localStorage.getItem(`Aim.access_token.${this.client_id}`);
        },
        set access_token(value) {
          Aim.localStorage.setItem(`Aim.access_token.${this.client_id}`, value);
        },
        get id_token() {
          return Aim.localStorage.getItem(`Aim.id_token.${this.client_id}`);
        },
        set id_token(value) {
          Aim.localStorage.setItem(`Aim.id_token.${this.client_id}`, value);
        },
        get refresh_token() {
          return Aim.localStorage.getItem(`Aim.refresh_token.${this.client_id}`);
        },
        set refresh_token(value) {
          Aim.localStorage.setItem(`Aim.refresh_token.${this.client_id}`, JSON.stringify(value));
        },
        get access() {
          return getToken(this.access_token)||{};
        },
        get id() {
          return getToken(this.id_token)||{};
        },
        get scp() {
          const scp = this.access.scp || this.access.scope || '';
          return Array.isArray(scp) ? scp : scp.split(' ');
        },
      };
      const account = Aim.account = new Account;
      const idString = Aim.localStorage.getItem('Aim.id.' + client_id);
      // if (idString) {
      //   Object.setPrototypeOf(Object.getPrototypeOf(account),JSON.parse(idString));
      // }
      // ()Object.create({
      //   // get oid() {return this.idToken.oid },
      //   // get accountname() {return this.idToken.accountname || ''; },
      //   // get email() {return this.idToken.email; },
      //   // get phone_number() {return this.idToken.phone_number; },
      //   // get unique_name() {return this.idToken.unique_name || this.accountname; },
      //   // get prefered_username() {return this.idToken.prefered_username || this.accountname; },
      //   // get name() {return this.idToken.name || this.accountname.split('@').shift() ||''; },
      //   // get nickname() {return this.idToken.nickname; },
      //   // get given_name() {return this.idToken.given_name || this.name.split(/ /).shift(); },
      //   // get middle_name() {return this.idToken.middle_name; },
      //   // get family_name() {return this.idToken.family_name || this.name.split(/ /).pop(); },
      //   get signedIn() {return Aim.localStorage.getItem('Aim.id_token' + client_id) ? true : false},
      // });
      // let state = Math.ceil(Math.random() * 99999);
      // prompt: 'consent',
      // const authClient = Client.init({serviceRoot});
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (code && Aim.sessionStorage.getItem('Aim.state') == state) {
        getTokenFromAuthCode(code);
      }
      function login(){
        return new Promise((success,fail)=>{
          const state = Math.ceil(Math.random() * 99999);
          Aim.sessionStorage.setItem('Aim.state', state);
          console.debug(99999,serviceRoot,client_id);
          const loginUrl = Aim.fetch(serviceRoot).query({
            response_type: 'code',
            // redirect_uri,
            client_id,
            scope,
            state,
          }).href;
          // console.debug(showPopup);
          if (showPopup === false) {
            // window.localStorage.setItem('test1', 'ja');
            // console.debug(window.localStorage.getItem('test1'));
            // console.debug(Office)
            // Office.context.ui.displayDialogAsync(loginUrl,
            //   {height: 600, width: 600}, e => console.debug(e)
            // ); // THIS IS WHAT YOU NEED
            // alert(1);
            $(document.body).append(
              $('div').style('position:fixed;margin:auto;top:0;bottom:0;left:0;right:0;background:red;').append(
                $('div').text('LOGIN'),
                $('div').qr('test'),
              )
            )
            // document.location.href = loginUrl;
          } else {
            const popup = window.open(loginUrl, 'login', `scrollbars=no,resizable=yes,toolbar=no,width=500,height=600`);
            async function listener(event) {
              console.debug(event);
              const {data} = event;
              const {message_type,content,to,path} = data;
              // console.debug(message_type);
              switch(message_type){
                case 'LOGIN_ACK': {
                  const {code,state} = content;
                  await getTokenFromAuthCode(code);
                  success(account);
                }
              }
            };
            window.addEventListener('message', listener);
            const interval = setInterval(async function() {
              if (popup.closed) {
                window.removeEventListener('message', listener);
                clearInterval(interval);
              } else {
                popup.postMessage({message_type: 'LOGINPOPUP'}, new URL(loginUrl).origin);
              }
            }, 1000);
          }
        })
      }
      function logout(){
        window.sessionStorage.removeItem('access_token');
        document.location.reload();
      }
      function storeAccessToken(access_token) {
        // console.error(222, access_token);
        window.sessionStorage.setItem('Aim.access_token' + client_id, access_token);
        if (access_token) {
          const {exp,iat} = getToken(access_token);
          var expiresAfter = exp - Math.floor(Date.now() / 1000);
          expiresAfter -= 10;
          console.debug('expiresAfter', expiresAfter, 's');
          setTimeout(silentlogin, expiresAfter * 1000);
        }
      }
      function silentlogin(){
        const access_token = window.sessionStorage.getItem('Aim.access_token.' + client_id);
        return api('/oauth/silentlogin').post({access_token}).then(body => {
          const {access_token} = body;
          storeAccessToken(access_token);
        });
      }
      getAccessToken = getAccessToken || async function (){
        if (apiKey) return apiKey;
        const {access,access_token,refresh_token} = account;
        // console.error(access_token);
        const {exp,iat} = access;
        // console.debug(444,access_token,access);
        var expiresAfter = exp - Math.floor(Date.now() / 1000);
        expiresAfter -= 10;
        // console.debug('expiresAfter', expiresAfter, 's');
        if (expiresAfter < 0) {
          // const {refresh_token} = account;
          // return await getTokenFromRefreshToken(refresh_token);
        }
        // console.debug(12345, exp,iat);
        return access_token;
      };
      const authProvider = Object.create({
        /** @todo getAccessToken met silent login */
        getAccessToken: async () => {
          return aimClient.storage.getItem('accessToken');
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
      });
      // Object.assign(Aim,{
      //   login,
      //   logout,
      //   getAccessToken,
      // });
      // storeAccessToken(window.localStorage.getItem('Aim.access_token'+client_id));
      // return Object.create({
      //   getAccessToken,
      //   account,
      //   login,
      // });
      // const url = new URL(serviceRoot || document.location, document.location);
      // serviceRoot = url.origin + url.pathname;
      const messages = [];
      function setState(state) {
        if (document) {
          const el = document.querySelector('.statusbar>.ws');
          if (el) {
            el.setAttribute('state', state);
          }
        }
        // const stateElem = document.createElement('span', {class:'ws'});
        // document.body.append(stateElem);
        // stateElem.setAttribute('state', state);
        console.debug(state);
      }
      let webSocket;// = {};
      function connect() {
        return new Promise((success,fail)=>{
          // console.debug(url.origin)
          webSocket = new WebSocket(url.origin.replace(/^http/,'ws'));
          webSocket.addEventListener('error', err => {
            console.error(err.message);
            webSocket.close();
          });
          webSocket.addEventListener('close', event => {
            setTimeout(() => this.connect(), 3000);
            return Aim.setState('ws', 'closed');
          });
          webSocket.addEventListener('open', event => {
            setState('open');
            this.send('CONNECTION_OPEN');
          });
          webSocket.addEventListener('message', event => {
            let {target,data} = event;
            data = JSON.parse(data);
            const {message_type, content, to, headers} = data;
            // console.debug(message_type, content);
            switch (message_type) {
              case 'CONNECTION_OPEN': {
                const {sid} = content;
                webSocket.sid = sid;
                success();
                send('CONNECTION_SIGNIN');
                return setState('connected');
              }
              case 'CONNECTION_SIGNIN': {
                return setState('authorized');
              }
              case 'CONNECTION_CLOSE': {
                return console.debug(path,sid);
              }
              case '/login/qrcode': {
                return client.send('/login/qrcode/ack', {sid});
              }
              case '/login/qrcode/ack': {
                return client.send('/login/qrcode/start', {sid});
              }
              case '/login/qrcode/start': {
                return client.send('/login/qrcode/end', {sid});
              }
              case '/login/qrcode/end': {
                return;
              }
              case '/connector/init': {
                setState('init');
                return;
              }
              case '/connector/close': {
                setState('close');
                return;
              }
              default: {
                Aim.emit('message', {data,target});
                client.emit('message', {data,target});
              }
            }
          });
        });
      }
      function response(data) {
        webSocket.send(JSON.stringify(data));
      }
      async function send(message_type, content, to) {
        if (webSocket) {
          // console.warn('send', {message_type, content})
          if (message_type) {
            const data = {message_type, content, to};
            // Object.assign(options,{path});
            // const headers = {};
            if (getAccessToken) {
              const accessToken = await getAccessToken();
              if (accessToken) {
                const authorization = 'Bearer ' + (accessToken||'');
                data.headers = {authorization};
              }
            } else if (apiKey) {
              data.headers = {apiKey};
              // options.headers = Object.assign(headers, {apiKey});
            }
            // console.debug('send',data);
            messages.push(data);
          }
          if (webSocket && webSocket.readyState) {
            // console.debug(messages);
            messages.forEach(data => webSocket.send(JSON.stringifyReplacer(data)));
            messages.length = 0;
          }
        }
        // webSocket.send(JSON.stringify(data));
      }
      function fetch(path, body) {
        // console.debug(this,webSocket);
        path = (serviceRoot||'')+path;
        return new Promise((success,fail)=>{
          const mid = Aim.guid();
          const headers = {apiKey};
          console.debug({mid,headers});
          webSocket.addEventListener('message', function (event) {
            const data = JSON.parse(event.data);
            console.debug(2, data);
            if (data.mid === mid) {
              webSocket.removeEventListener('message', arguments.callee);
              success(data);
            }
          });
          webSocket.send(JSON.stringify({headers,path,body,mid}));
        })
      }
      function api(path = '/', options = {}) {
        const {sid} = this;
        // console.warn(serviceRoot,path);
        return Aim.fetch(serviceRoot + path, Object.assign(options,{serviceRoot,getAccessToken,headers:sid ? {sid} : {}}));
        //
        // const url = new URL(serviceRoot+path)
        // path = (path||'').replace(serviceRoot,'');
        // path = new URL(path, serviceRoot);
        // getAccessToken().then(t => console.debug(888, t));
        // console.debug(serviceRoot,path.pathname);
        // return Aim.fetch(serviceRoot, Object.assign(options,{serviceRoot,getAccessToken,headers:webSocket.sid?{sid:webSocket.sid}:{}})).path(path.pathname).query(path.search);
      }
      const client = new function Client(){};
      Aim.on('patch', ({id,name,value,update}) => send('PATCH', {id,name,value,update}));
      Aim.on('delete', ({id}) => send('DELETE', {id}));
      Aim.on('post', ({id,schemaName}) => send('POST', {id,schemaName}));
      Object.assign(client, options);
      Object.setPrototypeOf(client, {
        get webSocket() {return webSocket;},
        get sid() {if (webSocket) return webSocket.sid;},
        getAccessToken,
        connect,
        account,
        login,
        loginRedirect(){
          const state = Math.ceil(Math.random() * 99999);
          Aim.sessionStorage.setItem('Aim.state', state);
          console.debug(serviceRoot);
          const loginUrl = Aim.fetch(serviceRoot).query({
            response_type: 'code',
            // redirect_uri,
            client_id,
            scope,
            state,
          }).href;
          console.debug(loginUrl);
          $(document.body).append(
            $('div').style('position:fixed;margin:auto;top:0;bottom:0;left:0;right:0;background:red;').append(
              $('div').text('LOGIN'),
              $('form').append(
                $('input').name('accountname').value('max.van.kampen@alicon.nl'),
                $('input').name('password').type('password').value('Mjkmjkmjk0'),
                $('button').text('login'),
              ).on('submit', async (event) => {
                event.preventDefault();
                const {access_token} = await client.api('/token').query({
                  grant_type: 'word',
                  client_id,
                  scope,
                }).post(event.target);
                console.debug(access_token);
                account.access_token = access_token;
              }),
              $('div').qrcode('test'),
            )
          )
          // document.location.href = loginUrl;
        },
        connect,
        fetch,
        response,
        send,
        on,
        emit,
        forEach,
        client_id,
        serviceRoot,
        getAccessToken,
        api,
      });
      Client.clients.push(client);
      return client;
    },
  });
  const $ = Aim = function () {
    var [selector, context] = arguments;
    if (typeof selector === 'function'){
      return Aim().on('load', event => selector());
    }
    if (this.Elem) {
      if (selector instanceof Elem) return selector;
      if (selector instanceof Element) return new Elem(selector);
      if (typeof selector === 'string') return new Elem(Elem.tagnames.includes(selector) ? document.createElement(selector) : document.getElementById(selector) || document.querySelector(selector));
    }
    if (!(this instanceof Aim)) return new Aim(...arguments);
    if (selector){
      if (self.Item && selector instanceof self.Item){
        return selector;
      }
      this.selector = selector;
    }
    selector = selector || 'Aim';
    if (['string','number'].includes(typeof selector)){
      if (this.Elem) {
        return new Elem(Elem.tagnames.includes(selector) ? document.createElement(selector) : document.getElementById(selector) || document.querySelector(selector));
      }


      if (Aim.his && Aim.his.map && Aim.his.map.has(selector)){
        selector = Aim.his.map.get(selector);
        if (context) Aim(selector).extend(context);
        return selector;
      } else if (self.document) {
        selector = Aim.Elem ? new Aim.Elem(...arguments) : selector;
      }
    }
    if (self.Element && selector instanceof self.Element) {
      // if (Aim.his.map.has(selector.id)) {
      //   return Aim.his.map.get(selector.id);
      // }
      if (Aim.Elem) {
        return new Aim.Elem(selector);
      }
    }
    if (Aim.Elem && (selector instanceof Aim.Elem)) {
      // if (selector.el && selector.el.id) {
      //   Aim.his.map.set(selector.el.id, selector);
      // }
      return selector;
    }
    if (typeof selector === 'string'){
      if (selector.match(/\w+\(\d+\)/)){
        return Item.get(selector);
      } else {
        this.id(selector);
        if (context) {
          this.set(context);
          return context;
        }
      }
    // } else if (self.Item && selector instanceof Item) {
    //   return selector;
    } else if (typeof Window !== 'undefined' && selector instanceof Window) {
      return this;
    } else if (selector.ID || selector.LinkID || selector.tag) {
      // //console.debug(selector, selector.ID, selector.LinkID, selector.tag);
      return Item.get(selector);
    }
    this.extend(context);
    console.debug(this);
  };

  function config(options) {
    // if (options && options.definitions) {
    //   Object.entries(options.definitions).forEach(([schemaName, schema]) => {
    //     schema.schemaName = schemaName;
    //     schema.cols = Object.entries(schema.properties||{}).map(([name,prop]) => Object.assign({name: name}, prop));
    //   });
    // }
    // console.debug(4, options)
    Aim.extend(Aim.config, options);
    return this;
  }
  async function getToken(token){
    // const {token,client_secret} = options;
    var payload = {};
    try {
      if (!token) throw "token missing";
      /** @todo: Waar komen de quotes vandaan rond token, UITZOEKEN */
      token = token.replace(/^"|"$/g,'');
      const [type,payloadString,signature] = token.split('.');
      payload = payloadString ? JSON.parse(atob(payloadString)) : {};
      let {iss,sub,aud,azp,client_id,exp,nbf,iat,scope,scp,iot} = payload;
      azp = azp || client_id;
      if (exp) {
        var expiresAfter = exp - Math.floor(Date.now() / 1000);
        // console.debug(Math.floor(Date.now() / 1000));
        // console.debug(exp,expiresAfter);
        // DEBUG: expiresAfter staat UIT ivm debuggen
        if (0 && expiresAfter<0) throw "token expired";
      }
      if (!azp) throw "azp missing";
      const configPath = require('path').dirname(require.main.filename);
      const configFilename = configPath + `/config/.config.${azp}.json`;
      if (!fs.existsSync(configFilename)) throw "config missing " + azp;
      const config = JSON.parse(fs.readFileSync(configFilename));
      if (!config) throw "config empty " + azp;
      // console.debug(777,config);
      if (!config.secret) throw "config.secret missing "+azp;
      var {client_secret} = config.secret;
      // if (aud && aud !== client_id) {
      //   const [[device]] = await aimServer.query(`SELECT LOWER(secret_id) AS client_secret FROM aliconnect.dbo.iot WHERE id = '${aud}' AND client_id = '${client_id}'`);
      //   if (!device) throw "aud device missing";
      //   var {client_secret} = device;
      // // } else if (sub && sub !== client_id) {
      // //   const [[device]] = await aimServer.query(`SELECT LOWER(secret_id) AS client_secret FROM aliconnect.dbo.iot WHERE id = '${sub}' AND client_id = '${client_id}'`);
      // //   if (!device) {
      // //     return error({
      // //       code: "un_authorized",
      // //       message: "sub device missing",
      // //       target: "access_token",
      // //     });
      // //   }
      // //   var {client_secret} = device;
      // }
      if (!client_secret) throw "client_secret missing "+azp;

      const input = [type,payloadString].join('.');
      // console.debug(type,payloadString,input,client_secret);
      const signatureOk = Aim.Jwt.signature(input,client_secret);
      //  crypto.createHmac('sha256', client_secret).update(input).digest('base64').replace(
      //   /\+/g,
      //   '-'
      // ).replace(
      //   /\=/g,
      //   ''
      // ).replace(
      //   /\//g,
      //   "_"
      // );
      // console.debug({type,payloadString,azp,client_secret,signature,signatureOk});
      if (signature !== signatureOk) throw "Incorrect signature "+JSON.stringify({azp, client_secret, signature, signatureOk, payload}, null, 2);
    } catch (message) {
      return error({
        code: "un_authorized",
        message,
        payload,
        target: "access_token",
      });
    }
    return payload;
  }
  // console.debug(2);

  const {document} = this;
  var nomessage = false;
  function extend (parent, selector, context) {
    if (!selector) {
      selector = parent;
      parent = this;
    }
    // //console.debug(111, parent, selector);
    const objects = [];
    if (context) {
      Object.entries(context).forEach(entry => Object.defineProperty(parent, ...entry))
    }
    if (selector) {
      (function recurse(parent, selector, context){
        if (parent && selector && selector instanceof Object) {
          for (let [key, value] of Object.entries(selector)) {
            if (key === 'prototype') {
              parent.prototype = parent.prototype ? Object.setPrototypeOf(value, parent.prototype) : value;
              continue;
            } else if (typeof parent[key] === 'function' && !parent[key].prototype && typeof value !== 'function') {
              parent[key](value)
            } else if (typeof value === 'function' && !parent.hasOwnProperty(key)) {
              parent[key] = value;
            }
            if (typeof value !== 'object' || Array.isArray(value) || !(key in parent) || objects.includes(value)) {
              parent[key] = value;
            } else {
              objects.push(value);
              recurse(parent[key], selector[key]);
            }
          }
        }
      })(parent, selector, context);
    }
    return parent;
  };
  Object.assign(Aim, {
    prototype: {
      emit,
      on,
      forEach,

      _accessToken () {
        return this.set('access_token', ...arguments);
      },
      copyFrom (source, master, index) {
        return Aim.promise( 'copyFrom', resolve => {
          // return;
          const [s,schemaName,sourceId] = source.tag.match(/(\w+)\((\d+)\)/);
          console.warn(schemaName, source, master);
          const item = {
            // schema: source.schema,
            header0: source.header0,
            Src: {
              LinkID: sourceId,
            },
            Class: {
              LinkID: !source.Class || !source.Class.LinkID === 0 ? sourceId : source.Class.LinkID,
            },
          };
          if (master) {
            master.attr('HasChildren', 1, true);
            item.Master = {
              LinkID: master.data.ID,
              Data: index === undefined ? (master.items ? master.items.length : 0) : index,
            }
          }
          console.debug('COPY START', item);
          aimClient.api(`/${schemaName}`).body(item).post().then(item => {
            // console.debug('COPY DONE', event.target.responseText);
            item.details().then(async item => {
              console.debug('COPY START', item);
              await item.clone();
              if (master) {
                if (master.items) {
                  master.items.push(item);
                  // master.emit('change');
                  await master.reindex();
                  if (master.elemTreeLi.el.open) {
                    master.elemTreeLi.emit('toggle')
                  } else {
                    master.elemTreeLi.el.open = true;
                  }
                  // if (index !== undefined) {
                  //   console.debug('INDEX', index);
                  //   item.movetoidx(master,index);
                  // }
                }
              }
              console.debug('COPY END', item);
              // item.emit('change');
              resolve(item);
            })
          })
        });
      },
      clone (obj) {
        // console.error('clone', obj);
        return JSON.parse(JSON.stringify(obj));
      },
      connector () {
        Object.assign(this, {
          external(name, args, callback){
            let params = {to: { sid: Aim.Aliconnector.connector_id }, external: {} };
            // let args = [...arguments];
            params.external[name] = Array.isArray(args) ? args : (args ? [args] : []);
            Aim.Aliconnector.callback = callback;
            wsClient.send(JSON.stringify(params));
          },
          reply(par){
            if (Aim.Aliconnector.callback){
              Aim.Aliconnector.callback(par);
            }
            Aim.Aliconnector.callback = null;
            // console.debug('ALICONNECTOR REPLY', par);
          },
          printurl(url){
            this.external('printurl', url, par => {
              console.debug('PRINT REPLY', par);
            });
          },
          hide(){
            this.external('hide', null, par => {
              console.debug('HIDE REPLY', par);
            });
          },
          show(){
            this.external('show', null, par => {
              console.debug('SHOW REPLY', par);
            });
          },
          // writelnfile(){
          // 	this.external('show', null, par => {
          // 		console.debug('SHOW REPLY', par);
          // 	});
          // },
          // writefile(){
          // 	this.external('show', null, par => {
          // 		console.debug('SHOW REPLY', par);
          // 	});
          // },
          // readfile(){
          // 	this.external('show', null, par => {
          // 		console.debug('SHOW REPLY', par);
          // 	});
          // },
          // readfilearray(){
          // 	this.external('show', null, par => {
          // 		console.debug('SHOW REPLY', par);
          // 	});
          // },
          // EditFile(){
          // 	this.external('show', null, par => {
          // 		console.debug('SHOW REPLY', par);
          // 	});
          // },
          filedownload(par){
            // this.external('filedownload', "http://alicon.nl" + par, par => {
            //   console.debug('SHOW REPLY', par);
            // });
          },
          mailimport(){
            this.external('show', null, par => {
              console.debug('SHOW REPLY', par);
            });
          },
          contactimport(){
            this.external('show', null, par => {
              console.debug('SHOW REPLY', par);
            });
          },
          // opcSetVar(){},
          // opcSet(){},
          // opcConnect(){},
          // opcDisconnect(){},
          // geturl(){},
          // getHtml(){},
        });
      },
      create () {
        this.selector = this.selector.createElement(...arguments);
        return this;
      },
      clientGet () {
        return clients;
      },
      data (data) {
        Item.get(data);
        return this;
      },
      evalData (data) {
        // console.debug('evalData', data);
        // keys = ['components'];
        // const cfg = ['components'].map(key => data[key]);
        if (data instanceof Object){
          // const keys = ['components','info'].filter(key => key in data);
          // const config = keys.reduce((result, key) => ({ ...result, [key]: data[key] }), {});
          //
          // // console.debug(data,config);
          //
          // this.extend(config);
          // console.debug('evalDataevalDataevalDataevalData', data);
          if (Array.isArray(data.value)){
            data.value = data.value.map(data => Item.get(data));
          } else if (data['@id']){
            // data = Item.get(data);
          }
          // console.debug('A', data.body);
        }
        return data;
      },
      extend () {
        Aim.extend(this.el || this.selector || this, ...arguments);
        return this;
      },
      extendConfig (yaml) {
        return aimClient.api('/').query('extend', true).post({config: yaml});
      },
      eventHandle: null,
      get (selector, options) {
        this.props = this.props || new Map();
        if (!selector) return this.props;
        const name = selector.name || selector;
        if (!this.props.has(name)){
          options = typeof options === 'string' ? Aim(options) : options;
          // //console.debug(selector);
          // this.props.set(name, typeof selector === 'function' && selector.prototype ? new selector(options) : options);
        }
        return this.props.get(name)
        // let prop = (this.props = this.props || new Map()).get(name);
        // if (options){
        //   if (!prop){
        //     options = Array.isArray(options) ? options.shift() : options;
        //     options = typeof options === 'string' ? Aim(options) : options;
        //     options = typeof selector === 'function' ? new selector(options) : options;
        //     prop = this.props.set(name, options).get(name)
        //     prop.key = this.key;
        //   } else {
        //     Aim(prop).extend(options)
        //     if (prop.init){
        //       prop.init();
        //     }
        //   }
        // }
        // return prop
      },
      get message() {
        const [basePath, folder, sep, id] = this.getPath();
        // console.debug(basePath, folder, sep, id, this);
        return {
          method: this.req.method,
          url: [folder, this.url.searchParams.toString()].filter(Boolean).join(''),
          body: this.req.input,
          to: this.to,
        }
      },
      get elements() {
        if (isModule){
          return [];
        }
        return this.props && (this.props[0] instanceof Object)
        ? Object.values(this.props[0]).filter(value => value instanceof Element)
        : [];
      },

      getApi (url) {
        return Aim.promise(
          'getApi',
          resolve => this
          .url(url)
          .get()
          .then(event => {
            console.debug('GET', JSON.parse(event.target.responseText));
            Aim(this).extend(event.body);
            resolve(event);
          })
        )
      },
      getObject (name, constructor, args) {
        const props = this.props = this.props || new Map();
        if (!props.has(name)) {
          props.set(name, new constructor(...args))
        } else if (!args.length) {
          return props.get(name);
        } else {
          props.get(name).show(...args);
        }
        return this;
      },
      has (selector) {
        return this.props && this.props.has(selector);
      },
      id (selector) {
        this.key = selector; // deprecated
        this.set('id', selector);
        // Aim.his.map.set(selector, this);
        return this;
      },
      async login () {
        // const url = new URL(this.server.url, document.location);
        var url = new URL(this.server ? this.server.url : '/api', Aim.dmsOrigin);
        if (this.authProvider().access && this.authProvider().access.iss) {
          url.hostname = this.authProvider().access.iss;
        }
        // console.debug( url );
        // return;
        //
        // var url = new URL(this.server ? this.server.url : this.authProvider().access.iss, 'https://aliconnect.nl/api');
        //
        // console.debug( this.authProvider().access.iss, url );
        // return;
        clients.set(url.hostname, this);
        // return console.debug(this.ws());
        // clients.set()
        if (this.ws().url){
          await this.ws().connect()
        }
        if (this.authProvider()){
          await this.authProvider().login(...arguments);
          if (this.ws()){
            await this.ws().login(this.authProvider().getAccessToken())
          }
        }
        return this;
      },

      msa () {
        return Aim.msa = Aim.msa || new Msa(...arguments);
      },
      nav () {
        return nav;
      },
      noPost (fn) {
        Aim.his.noPost = true;
        fn();
        Aim.his.noPost = false;
      },
      onload (event) {
        // console.error(this, event.target);
        if (Aim.config.debug && event.target.status < 400 || isModule){
          console.debug (
            // event.target.sender,
            this.props('method').toUpperCase(),
            this.props('url').toString(),
            event.target.status,
            event.target.statusText,
            event.target.responseText.length, 'bytes',
            new Date().valueOf() - this.startTime.valueOf(), 'ms',
            // event.target.responseText,
            // event.body || this.responseText,
          );
        }
        // if (event.status >= 400) document.body.appendTag('DIV', {className:'errorMessage', innerHTML:this.responseText });
        // this.getHeader = this.getHeader || this.getResponseHeader;
        // var contentType = event.headers ? event.headers['content-type'] : this.getHeader('content-type');
        (event.body.responses || [event]).forEach((res, i) => {
          if (res && res.body){
            // res.body = Aim.evalData(res.body);
          }
          // console.debug('BODY', res.body);
        });
        // this.body = event.body;
        // this.resolve(this);
        this.resolve(event);
        // this.resolve({
        // 	body: event.body,
        // 	json(){
        // 		return event.body;
        // 	}
        // });
      },
      popupmenuitems (item) {
        return;
        var itemmenu = Aim.menuitems;
        if (item.attributes && item.attributes.state && item.attributes.state.options) {
          //item.attributes.state.options.onclick = function () {
          //	// //console.debug('SET STATE', this.item);
          //	this.item.set({ state: Aim.Object.findFieldValue(this.item.attributes.state.options, 'Title', this.menuitem.Title) });
          //};
          itemmenu.state.menu = item.attributes.state.options;
        }
        return itemmenu;
      },
      send (context) {
        // console.debug(context, this.ws());
        // this.ws().send(context);
        // if (Aim.ws){
        // 	Aim.ws.message(JSON.stringify(context));
        // }
      },
      _sendNotification () {
        const {serviceRoot} = Aim.config;
        const {origin} = new URL(serviceRoot);
        ws.send({
          to: this.item.users,
          Notification: {
            Title: this.put.Subject,
            options: {
              body: "Bericht geplaatst door " + this.get.from,
              url: origin+"/tms/app/om/#id=" + this.get.id,
              icon: origin+"favicon.ico",
              //image: "https://aliconnect.nl/sites/aliconnect/shared/611/2776611/8ACC0C4510E447A6A46496A44BAA2DA4/Naamloos300x225.jpg?2018-10-01T11:50:14.594Z",
              data: {
                href: '#?id=' + this.get.id
              },
            }
            //api: this.api, get: this.get, put: this.put
          }
        });
      },
      set (selector, context) {
        (this.props = this.props || new Map()).set(selector, context);
        return this;
      },
      setState (state) {
        Object.values(Aim.client).forEach(client => client.setUserstate(state));
      },
      state () {},
      status (selector, context){
        if (Aim.his.el.statusbar && Aim.his.el.statusbar[selector]){
          // console.warn(selector, Aim.his.el.statusbar, Aim.his.el.statusbar[selector]);
          Aim.his.el.statusbar[selector].attr('context', context);
        } else {
          // console.debug(selector, context);
        }
        return this;
      },
      userName () {
        return Aim.auth && Aim.auth.id ? Aim.auth.id.name : ''
      },
      ws (options) {
        // //console.debug('MAXXXX');
        return this.get(WebSocket, options ? Object.assign(options,{authProvider: options.authProvider || Aim.client.authProvider}) : null);
      },
      execQuery (selector, context, replace) {
        console.error('execQuery', selector, context, replace);
        const currentUrl = new URL(document.location.origin);
        var url = new URL(document.location);
        if (typeof selector === 'object') {
          Object.entries(selector).forEach(entry => url.searchParams.set(...entry));
        } else {
          url.searchParams.set(selector, context);
        }


        if (url_string(currentUrl.href) !== url_string(url.href)) {
          this.execUrl(url_string(url.href));
          // if (url.searchParams.get('l')) {
          //   url.searchParams.set('l', decodeURIComponent(url.searchParams.get('l')));
          //   //console.debug(url.searchParams.get('l'));
          //
          // }
          // var href = url.href;
          // //console.debug(href);
          if (replace) {
            // console.error('REPLACE');
            self.history.replaceState('page', '', url_string(url.href));
          } else {
            // console.error('PUSH');
            self.history.pushState('page', '', url_string(url.href));
          }
        }
        return this;
      },
      init (config) {
        console.debug(config);
      },
    },
    Client,
    Item,
    InteractionRequiredAuthError() { },
    get Jwt(){
      function btoaToJson(s){
        return s.replace(
          /\+/g,
          '-'
        ).replace(
          /\=/g,
          ''
        ).replace(
          /\//g,
          "_"
        );
      }
      function btoajson(s){
        return btoaToJson(btoa(s));
      }
      function base64encode(obj){
        return btoajson(JSON.stringify(obj));
      }
      function signature(input, secret){
        const crypto = require('crypto');
        // console.debug(input, secret);
        return crypto.createHmac('sha256', secret).update(input).digest('base64').replace(
          /\+/g,
          '-'
        ).replace(
          /\=/g,
          ''
        ).replace(
          /\//g,
          "_"
        );

        // var signature = btoaToJson(CryptoJS.HmacSHA256(message, secret).toString(CryptoJS.enc.Base64));
        // //var signature = this.btoaToJson(crypto.createHmac('sha256', secret).update(message).digest('base64'));//.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
        // // console.debug("signature", base64_header, base64_payload, secret, signature);
        // return signature;
      }
      function encode(payload, secret){
        var headerBase64 = base64encode({ typ: "JWT", alg: "sha256" });
        var payloadBase64 = base64encode(payload);
        const input = [headerBase64,payloadBase64].join('.');
        // const crypto = require('crypto');
        // const signature = crypto.createHmac('sha256', secret).update(input).digest('base64').replace(
        //   /\+/g,
        //   '-'
        // ).replace(
        //   /\=/g,
        //   ''
        // ).replace(
        //   /\//g,
        //   "_"
        // );
        return [input, signature(input, secret)].join('.');
      }
      function decodeId(id){
        if (!id) return {};
        var a = id.split('.');
        return JSON.parse(atob(a[1] || a[0]));
      }

      return {
        btoaToJson,
        signature,
        encode,
      }
    },

    api(url, options) {
      const {serviceRoot} = Aim.config;
      // const {origin} = new URL(serviceRoot);

      url = new URL(url);
      const {origin,href} = url;
      const {clients} = Client;
      const client = clients.find(client => client.origin === origin);
      // console.debug();
      return client ? client.api(href.replace(client.serviceRoot, ''), options) : Aim.fetch(href);
    },
    config,
    emit,
    error,
    _extend (selector, context) {
      for (let [key, value] of Object.entries(context)) {
        if (Array.isArray(value)) {
          selector[key] = value;
        } else if (typeof value === 'object') {
          selector[key] = extend(selector[key] || {}, value);
        } else {
          selector[key] = value;
        }
      }
      return selector;
    },
    extend,
    fetch (href, options = {}) {
      const {serviceRoot} = Aim.config;
      const {origin} = new URL(serviceRoot || href);
      // console.debug({serviceRoot,origin,href});
      options = Object.assign({method: 'get'}, options);
      const url = new URL(href||'', self.document ? self.document.location : origin);
      // console.debug(href,url.href);
      const {pathname} = url;
      const args = [];
      const path = [];
      let xhr;
      function Request(){}
      Request.prototype = {
        value: () => new Promise((resolve,fail) => {
          if (!xhr.responseText) return resolve();
          const contentType = xhr.getResponseHeader ? xhr.getResponseHeader("Content-Type") : 'application/json';
          if (!contentType.includes('json')) {
            return resolve(xhr.responseText);
          }
          try {
            const data = JSON.parse(xhr.responseText);
            const {serviceRoot} = options;
            // if (data.value) return resolve(data.value);
            // console.error(serviceRoot,options,data,xhr);
            if (data.redirect_uri) {
              const popup = window.open(data.redirect_uri, 'login', `scrollbars=no,resizable=yes,toolbar=no,width=500,height=600`);
            }
            if (data['@odata.context']) {
              // console.debug(data,xhr,url,url.pathname);
              // const url = new URL(responseURL);
              if (data.value) {
                data.value.forEach(data => data['@odata.id'] = data['@odata.id'] || `${url.origin}${url.pathname}(${data.id || data.Id})`);
              } else {
                // console.debug(data);
                data['@odata.id'] = data['@odata.id'] || `${url.origin}${url.pathname}`;
              }
            }
            resolve(data);
          } catch (err) {
            err.message = xhr.responseText;
            Aim.error(err);
            // console.error(err, url, xhr.responseText);
            fail(err);
          }
        }),
        json: () => new Promise((resolve,fail) => {
          // console.debug(xhr.responseText);
          if (!xhr.responseText) return resolve();
          try {
            const [s,preErr,json] = xhr.responseText.match(new RegExp('(.*?)([\{|\[].*)','s'),'');
            // console.debug(s,preErr,json);
            const data = JSON.parse(json);
            // if (data.error) {
            //   alert(typeof data.error.message === 'string' ? data.error.message : JSON.stringify(data.error.message,null,2));
            // }


            resolve(data);
          } catch (err) {
            // alert(xhr.responseText);
            console.error(xhr.responseText);
            fail(err);
          }
        }),
        text: () => new Promise(resolve => resolve(xhr.responseText)),
        get status(){ return xhr.status },
      };
      function query(selector, context) {
        if (typeof selector === 'object'){
          Object.entries(selector).forEach(entry => query(...entry));
        } else if (selector && arguments.length === 1){
          // console.debug(selector);
          new URLSearchParams(selector.replace(/^\?/,'')).forEach((value,key) => url.searchParams.set(key,value));
        } else if (context !== undefined) {
          url.searchParams.set(selector, context || '');
        }
        return promise;
      }
      function set(content){
        Object.assign(options,content);
        return promise;
      };
      function body(context, isFormData, data) {
        if (context) {
          // console.debug(context.constructor.name);
          switch(context.constructor.name) {
            case 'CustomEvent':
            case 'SubmitEvent': {
              context.preventDefault();
              options.body = new FormData(context.target);
              if (data) {
                Object.entries(data).forEach(([name,value])=>options.body.append(name, value !== null && typeof value === 'object' ? JSON.stringify(value) : value));
              }
              if (context.submitter) {
                options.body.append(context.submitter.name, context.submitter.value);
              };
              break;
            }
            case 'HTMLFormElement': {
              options.body = new FormData(context);
              break;
            }
            case 'Elem': {
              options.body = new FormData(context.el);
              break;
            }
            case 'File': {
              options.body = context;//new FormData(context);
              break;
            }
            case 'Object': {
              // console.debug(1111, context, isFormData, context.constructor.name, options);

              if (isFormData) {
                if (typeof FormData !== "undefined") {
                  options.body = new FormData();
                  Object.entries(context).forEach(entry => options.body.append(...entry));
                } else {
                  context = Object.fromEntries(Array.from(Object.entries(context)).map(([n,k])=>[n,typeof k === 'object' ? JSON.stringify(k): k]));
                  var searchParams = new URLSearchParams(context);
                  options.body = searchParams.toString();
                  // console.debug(searchParams.toString());
                  promise.headers('Content-Type', 'application/x-www-form-urlencoded');
                  promise.headers('Content-Length', Buffer.byteLength(options.body));
                  // console.debug(options);
                }
              } else {
                // console.debug(11112, context, isFormData, context.constructor.name, options);
                // promise.headers('Content-Type', 'application/json');
                // options.body = JSON.stringifyReplacer(context);
                options.body = JSON.stringifyReplacer(Object.assign({},context));
                // console.debug(options.body);
              }
              break;
            }
            case 'Array': {
              if (isFormData) {
                options.body = new FormData();
                Object.entries(context).forEach(entry => options.body.append(...entry));
              } else {
                promise.headers('Content-Type', 'application/json');
                options.body = JSON.stringifyReplacer(context);
              }
              break;
            }
            default: {
              // console.debug(context.match(/\n/));
              // options.body = !context.match(/\n/) && document.querySelector(context) ? new FormData(document.querySelector(context)) : context;
              options.body = context;
              break;
            }
          }
        }
        return promise;
      }
      const promise = new Promise((resolve, reject) => setTimeout(async () => {
        const startTime = new Date();
        if (options.authProvider) {
          const accessToken = await options.authProvider.getAccessToken();
          promise.headers('Authorization', 'Bearer ' + (accessToken||''));
        }
        if (options.getAccessToken) {
          // console.debug(options.authProvider.getAccessToken);
          const accessToken = await options.getAccessToken();
          // console.error(accessToken);
          promise.headers('Authorization', 'Bearer ' + (accessToken||''));
          // console.debug(accessToken);
        }
        const {authProvider,getAccessToken,method,withCredentials,body,headers} = options;
        const {origin,hostname,pathname,href} = url;
        if (typeof module === "undefined") {
          const statusMessage = promiseMessage(`Wachten op ${hostname+pathname}`);
          // const progressElement = document.querySelector('footer>progress');
          (document.querySelector('footer>progress')||{}).value += 1;
          try {
            xhr = new XMLHttpRequest();
            xhr.open(method, url.href);
            // xhr.open(method, 'https://aliconnect.nl/v1/?response_type=code&client_id=c9b05c80-4d2b-46c1-abfb-0464854dbd9a&scope=openid+profile+name+email&state=7488&prompt=login');
            xhr.withCredentials = withCredentials;
            Object.entries(headers||{}).forEach(entry => xhr.setRequestHeader(...entry));
            xhr.addEventListener('load', async event => {
              (document.querySelector('footer>progress')||{}).value -= 1;
              // console.debug(method, url.href, xhr.status);
              if (xhr.status < 400) {
                statusMessage.remove();
                resolve(new Request)
              } else {
                statusMessage.style('background-color:#721313;');
                const req = new Request;
                const body = await req.json();
                // console.debug(body);
                const {error} = body;
                error.href = href;
                // console.error(reject,error);
                reject(error);
              }
            });
            // console.debug(Array.from(body.values()));
            console.debug(options.method, url.href);
            xhr.send(body);
          } catch (err) {
            console.error(err);
            Aim.error(err);
          }
        } else {
          const href = url.toString();
          const protocol = href.split(':').shift();
          options.hostname = url.hostname;
          options.path = url.pathname + url.search;//Params ? '?' + url.searchParams.toString();
          if (options.body) {
            options.headers = options.headers || {};
            options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
            options.headers["Content-Length"] = Buffer.byteLength(options.body);
          }
          const HTTP = require(protocol);
          xhr = HTTP.request(options, event => {
            event
            .on('data', data => xhr.responseText += data)
            .on('end', () => {
              // const {res} = xhr;
              const {statusCode,statusMessage} = xhr.res;
              // console.debug(5555, statusCode);
              if (statusCode >= 400) {
                // console.debug(333, statusCode, xhr.responseText);
                var body = JSON.parse(xhr.responseText);
                reject(body);
                // reject({statusCode,statusMessage});
              }
              // console.debug({statusCode,statusMessage});
              resolve(new Request);
            });
          }).on('error', error => {
            reject(error);
          });
          xhr.responseText = '';
          if (options.body) {
            xhr.write(options.body);
          }
          xhr.end();
        }
      }));
      Object.assign(promise,{
        query,
        body,
        method: method => set({method}),
        serviceRoot: serviceRoot => set({serviceRoot}),
        authProvider: authProvider => set({authProvider}),
        getAccessToken: getAccessToken => set({getAccessToken}),
        withCredentials: () => set({withCredentials:true}),
        headers: (selector,context) => {
          if (typeof selector === 'object') {
            options.headers = Object.assign(options.headers||{},selector);
          } else {
            (options.headers = options.headers || {})[selector] = context;
          }
          return promise;
        },
        top: context => promise.query('$top', context),
        select: context => promise.query('$select', context),
        filter: context => promise.query('$filter', context),
        // where: context => promise.query('$filter', context),
        apply: context => promise.query('$apply', context),
        search: context => promise.query('$search', context),
        order: context => promise.query('$order', context),
        attr: (selector,context) => {
          selector = typeof selector === 'object' ? Object.entries(selector) : [[selector,context]];
          selector.forEach(([selector,context]) => args.push(`${selector}(${context})`));
          // console.debug(pathname,args,path,[pathname].concat(args,path));
          url.pathname = [pathname].concat(args,path).join('/').split('/').filter(Boolean).join('/');
          return promise;
        },
        path: selector => {
          // path.push(selector);
          url.pathname = (url.pathname + selector).replace('//','/');//[pathname].concat(args,path).join('/');//.join('/').split('/').filter(Boolean).join('/');
          return promise;
        },

        get: async content => await promise.method('get').query(content).then(res => res.value()),
        post: async (content,data) => await promise.method('post').body(content,true,data).then(res => res.value()),
        patch: async content => await promise.method('patch').body(content||{}).then(res => res.value()),
        put: async content => await promise.method('put').body(content||{}).then(res => res.value()),
        delete: async () => await promise.method('delete').then(res => res.value()),
        toString: () => url.href,
      });
      Object.defineProperties(promise,{
        href: { get: () => url.href },
      });
      // Object.entries(options).forEach(([key,value]) => promise[key](value));
      return promise;
    },
    forEach,
    getToken,
    his: new Map(),
    listSelect(schemaName){
      return Aim.config.definitions[schemaName].cols.filter(col => col.header || col.filter).map(col => col.name).join(',')
    },
    makeToken(options) {
      var {type,expiresAfter,payload,client_secret} = options;
      type = btoa(JSON.stringify(type||{})).replace('+','-').replace('=','').replace("/","_");
      if (expiresAfter) {
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = payload.iat + expiresAfter;
        // console.debug(Math.floor(Date.now() / 1000));

      }
      payload = btoa(JSON.stringify(payload)).replace('+','-').replace('=','').replace("/","_");
      const input = [type,payload].join('.');
      const signature = crypto.createHmac('sha256', client_secret).update(input).digest('base64').replace('+','-').replace('=','').replace("/","_");
      return [input,signature].join('.');
    },
    on,
    async onmessage({data,target}) {
      const {config} = Aim;
      const {definitions} = config;
      const {message_type, content, to, headers} = data;
      switch (message_type) {
        case 'PATCH': {
          const {id,name,value,update} = content;
          // console.debug('onmessage', id, Item.items.get(id));
          if (Item.items.has(id)) {
            Item.items.get(id).setAttribute(name,value,update);
            Item.items.get(id).emit('change', {name,value});
          }
          break;
        }
        case 'DELETE': {
          const {id} = content;
          if (Item.items.has(id)) {
            Item.items.get(id).delete(false);
          }
          break;
        }
        case 'POST': {
          const {id,schemaName} = content;
          if (!definitions || !definitions[schemaName]) return;
          const item = Item.get({id,schemaName});
          break;
        }
      }
    },
    localStorage: this.localStorage,
    _assign: options => Object.assign(Object.getPrototypeOf(Aim), options),
    paths: options => Object.assign(Aim.paths, options),
    sessionStorage: this.sessionStorage,
    setState,
    s2ab,
    promiseMessage,
    promise(selector, context) {
      const messageElem = Aim.his.el.statusbar ? Aim('span').parent(Aim.his.el.statusbar.main).text(selector) : null;
      if (Aim.LOGPROMISE) {
        console.debug(selector, 'start');
      }
      return new Promise( context ).then( result => {
        if (messageElem) {
          messageElem.remove();
        }
        if (Aim.LOGPROMISE) {
          console.debug(selector, 'end');
        }
        return result;
      }).catch( err => {
        if (messageElem) {
          messageElem.text(selector, err).css('color','red');
        }
        throw err;
      })
    },
    socketCall(options, value) {
      const socketBuffer = Aim.socketBuffer = Aim.socketBuffer || [];
      Aim.socketBusy = Aim.socketBusy || false;
      if (options) {
        return new Promise((succes,fail) => {
          socketBuffer.unshift([succes,fail,options,value]);
          Aim.socketCall();
        });
      } else if (!Aim.socketBusy) {
        const socketAction = socketBuffer.shift();
        if (socketAction) {
          this.socketBusy = true;
          const [succes,fail,options,value] = socketAction;
          var {name,fc,address,port,host,path,baudRate,parity,dataBits,stopBits,register,socketOptions} = options;
          const baudRates = [2400,4800,9600,19200,38400,57600,115200];
          baudRate = baudRates[baudRate]||baudRate;
          fc = fc || 3;
          if (register === undefined) {
            Aim.socketBusy = false;
            return fail('No register');
          }
          const jsmodbus = require('jsmodbus');
          if (path) {
            const {SerialPort} = require('serialport');
            const options = {path,baudRate,parity,dataBits,stopBits};
            const socket = new SerialPort(options);
            let errorMessage;
            let resultValue;
            const delayMs = 1;
            // socket.on('error', err => console.error(err));
            socket.on('close', () => {
              setTimeout(e => {
                Aim.socketCall(Aim.socketBusy = false);
                setTimeout(e => {
                  if (errorMessage) {
                    fail(errorMessage)
                  } else {
                    succes(resultValue)
                  }
                },delayMs);
              },delayMs);
            });
            // socket.on('close', () => Aim.socketCall(Aim.socketBusy = false));
            function endRead(res){
              const {valuesAsArray} = res.response.body;
              const [value] = valuesAsArray;
              resultValue = Number(value);
            }
            function endError(error){
              const {err} = error;
              if (err != 'crcMismatch') {
                errorMessage = Object.assign(error,{path,baudRate,parity,dataBits,stopBits,address,fc,register,value,rw: value === undefined ? 'read' : 'write'});
              }
            }
            function close() {
              socket.close();
            }
            const client = new jsmodbus.client.RTU(socket,address);
            // client.on('error', err => console.error(err));

            socket.on('open', e => {
              setTimeout(e => {
                // console.debug([address,fc,register]);
                switch (fc) {
                  case 1: {
                    return value === undefined
                    ? client.readCoils(register, 1).then(endRead).catch(endError).finally(close)
                    : client.writeSingleCoil(register, value ? true : false).then(succes).catch(endError).finally(close)
                  }
                  case 2: {
                    return client.readDiscreteInputs(register, 1).then(endRead).catch(endError).finally(close)
                  }
                  case 3: {
                    return value === undefined
                    ? client.readHoldingRegisters(register, 1).then(endRead).catch(endError).finally(close)
                    : client.writeSingleRegister(register, Number(value)).then(succes).catch(endError).finally(close)
                  }
                  case 4: {
                    return client.readInputRegisters(register, 1).then(endRead).catch(endError).finally(close)
                  }
                  case 5: {
                    return value === undefined
                    ? client.readCoils(register, 1).then(endRead).catch(endError).finally(close)
                    : client.writeSingleCoil(register, value ? true : false).then(succes).catch(endError).finally(close)
                  }
                  case 6: {
                    return client.readHoldingRegisters(register, 1).then(endRead).catch(endError).finally(close)
                  }
                  case 15: {
                    return client.readCoils(register, 8).then(endRead).catch(endError).finally(close)
                  }
                  default: {
                    return fail('Unknown Function code');
                  }
                }
              },delayMs);
            });
          } else if (host) {
            const net = require('net');
            const socket = new net.Socket();
            const client = new jsmodbus.client.TCP(socket, 1);
            socket.on('close', () => {
              Aim.socketCall(Aim.socketBusy = false);
            });
            socket.on('connect', async e => {
              function endRead(res){
                // console.debug('endRead')
                const {response} = res;
                const {body} = response;
                const {valuesAsArray} = body;
                const [value] = valuesAsArray;
                socket.end();
                succes(value);
              }
              function endWrite(res){
                // console.debug('endWrite')
                socket.end();
                succes();
              }
              function endError(err){
                // console.error('endError', err);
                socket.end();
                fail(Object.assign(err, {path,baudRate,parity,dataBits,stopBits,address,fc,register}));
              }
              // console.debug('modbus ip write',{fc,register,value});
              switch (fc) {
                case 1: { // Coils
                  if (value === undefined) {
                    await client.readCoils(register, 8).then(endRead, endError);
                  } else if (Array.isArray(value)) {
                    await client.writeMultipleCoils(register, value, 8).then(endWrite, endError);
                  } else {
                    await client.writeSingleCoil(register, Number(value)).then(endWrite, endError);
                  }
                  return;
                }
                case 2: { // Discrete inputs
                  return await client.readDiscreteInputs(register, 1).then(endRead, endError);
                }
                case 3: { // Multiple Holding Registers
                  if (value === undefined) {
                    await client.readHoldingRegisters(register, 1).then(endRead, endError);
                  } else if (Array.isArray(value)) {
                    await client.writeMultipleRegisters(register, value).then(endWrite, endError);
                  } else {
                    await client.writeSingleRegister(register, Number(value)).then(endWrite, endError);
                  }
                  return;
                }
                case 4: { // Input Registers
                  return await client.readInputRegisters(register, 1).then(endRead, endError)
                }
                case 5: { // Single coil
                  if (value === undefined) {
                    await client.readCoils(register, 8).then(endRead, endError);
                  } else if (Array.isArray(value)) {
                    await client.writeMultipleCoils(register, value, 8).then(endWrite, endError);
                  } else {
                    await client.writeSingleCoil(register, Number(value)).then(endWrite, endError);
                  }
                  return;
                }
                case 6: { // Single Holding Register
                  if (value === undefined) {
                    await client.readHoldingRegisters(register, 1).then(endRead, endError);
                  } else if (Array.isArray(value)) {
                    await client.writeMultipleRegisters(register, value).then(endWrite, endError);
                  } else {
                    await client.writeSingleRegister(register, Number(value)).then(endWrite, endError);
                  }
                  return;
                }
                case 15: { // Multiple Coils
                  return await client.readCoils(register, 8).then(endRead, endError);
                }
              }
            //
            //
            //
            //   // console.debug('connected');
            //   await client.readHoldingRegisters(register, 1).then(res => {
            //     const {response} = res;
            //     const {body} = response;
            //     const {valuesAsArray} = body;
            //     const [value] = valuesAsArray;
            //     // console.debug('readInputRegisters', value);
            //     socket.end();
            //     succes(value);
            //   }, err => {
            //     socket.end();
            //     fail(err)
            //   });
            });
            socket.on('error', err => console.debug(err));
            socket.connect({host,port});
          }
        }
      }
    },
    systemBuild(options={}) {
      const {items,definitions,itemId,path,apiKey} = config;
      // return console.debug(items);
      const {socketClient, webServer, storage} = options;
      // const {item, definitions, socketClient, webServer} = options;
      const globalProperties = [];
      const globalSystems = Aim.globalSystems = Aim.globalSystems || [];

      Object.values(definitions).forEach(schema => Object.setPrototypeOf(schema,Item.prototype));
      Object.values(definitions).forEach(schema => (schema.fbs||[]).forEach(item => schema.properties = Object.assign(schema.properties||{}, item.properties||{})));
      Object.values(definitions).forEach(schema => Object.entries(schema.properties||{}).forEach(([name,property]) => Object.assign(property,{name})));

      function build(item, parent) {
        item.data = item.data || {};
        // console.debug(item.data);
        globalSystems.push(item);
        globalSystems[item.type] = globalSystems[item.type] || [];
        item.globalSystemsTypeIndex = globalSystems[item.type].length;
        globalSystems[item.type].push(item);
        if (parent) {
          parent[item.type] = parent[item.type] || [];
          parent[item.type].push(item);
          // console.debug(parent);
        }
        // Object.setPrototypeOf(item, definitions[item.type]);
        (item.children || []).forEach(child => build(child,item));
      };
      items.forEach(item => build(item));
      items.forEach(item => Object.setPrototypeOf(item,definitions[item.type]));

      if (document) {
        console.debug({socketClient});
        globalSystems.forEach(item => {
          const {properties,id,data} = item;
          Object.assign(item,{
            getProperty(name) {
              return new Promise((succes,fail)=>{
                succes(data[name]);
              })
            },
          });
          Object.entries(properties).filter(([name,property]) => !item.hasOwnProperty(name)).forEach(([name,property]) => {
            property = Object.setPrototypeOf({id,name},property);
            globalProperties.push(property);
            const {readOnly,options,type} = property;
            let to;
            let prevValue = JSON.stringify(data[name]);
            Object.defineProperty(item, name, {
              get() {
                const value = name in data ? data[name] : property.defaultValue;
                return value;

                // var value = property.defaultValue;
                // try {
                //   if (name in data) {
                //     if (type === 'integer') value = Number(data[name]);
                //     if (type === 'array') value = JSON.parse(data[name]);
                //     if (type === 'object') value = JSON.parse(data[name]);
                //   }
                // } catch (err) {
                //
                // }
                // return value;

              },
              set(value) {
                if (type === 'integer') value = Number(value);
                if (type === 'boolean') value = Number(value) ? 1 : 0;
                const jsonValue = JSON.stringify(value);
                if (prevValue !== jsonValue) {
                  console.debug('set', id, name, value, prevValue, jsonValue);
                  prevValue = jsonValue;
                  data[name] = value;
                  clearTimeout(to);
                  if (socketClient && !nomessage) {
                    to = setTimeout(e => socketClient.send('CHANGE', {id,name,value}),300);
                  }
                  if (storage) storage.setItem(name,value);
                  document.querySelectorAll(`#item${id}`).forEach(el => {
                    if (el.hasAttribute(name)) el.setAttribute(name, value);
                    // $(el).attr(name,String(value) === "0" ? null : value);
                    el.querySelectorAll(`.${name}`).forEach(el => {
                      if (el.hasAttribute('value')) el.setAttribute('value',value);
                      el.elem.refresh();
                      // else if (el.tagName === 'SPAN') el.innerText = value;
                    });
                    el.querySelectorAll(`[name="${name}"]`).forEach(el => {
                      if (el.tagName === 'METER') {
                        el.value = value || 0;
                      } else if (el.tagName === 'PROGRESS') {
                        if (value) {
                          el.max = el.max == 1 ? value : el.max;
                          el.value = el.max - value;
                          el.setAttribute('perc', Math.round(el.value / el.max * 100))
                        } else {
                          el.max = 1;
                          el.value = 0;
                          el.removeAttribute('perc');
                        }
                      } else if (el.type === 'checkbox') {
                        el.checked = value;
                      } else {
                        $(el).value(el.value = value);
                      }
                    });
                  });
                  Aim.emit('postUpdate', {id,name,value});
                }
              },
            });
            if (storage) item[name] = storage.getItem(name);
          });
        })
      } else {
        const {Server,Control,Client,socketCall} = Aim;
        function getAccessToken() {
          return apiKey;
        }
        items.forEach((item,i) => {
          var {server,data,id,type,properties,http,host,port,baudRate,address} = item;
          if (http) {
            const webServer = Server.create({http});
            Aim.on('postUpdate', async (event) => {
              const {id,name,value} = event;
              webServer.clients.forEach(client => client.send(JSON.stringify({message_type:'CHANGE',content:{id,name,value}})));
            });
            console.log(`WebServer active on port ${http.port}`);
            if (port) {
              const net = require('net');
              const jsmodbus = require('jsmodbus');
              const netServer = new net.Server();
              const holding = Buffer.alloc(10000);
              server = new jsmodbus.server.TCP(netServer, {holding});
              netServer.listen(port);
              function postWrite(event){
                // console.debug(event);
                const {body} = event;
                if (body) {
                  var {fc,address,byteCount,numberOfBytes,quantity,value,valuesAsArray} = body;
                  if ([6,16].includes(fc)) fc=3;
                  else if ([5,15].includes(fc)) fc=1;
                  const values = valuesAsArray || [value];
                  values.forEach((value,i) => {
                    Object.values(item.properties)
                    .filter(property => property.fc === fc && property.register === address + i)
                    .forEach(property => item[property.name] = value)
                  })
                }
              }
              server.on('postWriteSingleCoil', postWrite);
              server.on('postWriteSingleRegister', postWrite);
              server.on('postWriteMultipleRegisters', postWrite);
              server.on('postWriteMultipleCoils', postWrite);
              console.log(`ModbusServer active on port ${port}`);
            }
            webServer.socketServer.clients.forEach(target => globalProperties.forEach(content => target.send(JSON.stringify({message_type:'CHANGE',content}))));
          }
          Object.assign(item, {
            // errors: [],
            // setWarning(name, value = true) {
            //   console.debug('Warning',name,value)
            //   this.warningList.filter(error => error.name == name).forEach(error => error.state = (error.value = value ? 1 : 0) || error.state);
            //   this.warningValues = this.warningList.map(error => error.value).reverse().reduce((a,v) => (a << 1) | v,0);
            //   this.warningStates = this.warningList.map(error => error.state).reverse().reduce((a,v) => (a << 1) | v,0);
            // },
            // setError(name, value = true) {
            //   console.debug('Error',name,value)
            //   this.errorList.filter(error => error.name == name).forEach(error => error.state = (error.value = value ? 1 : 0) || error.state);
            //   this.errorValues = this.errorList.map(error => error.value).reverse().reduce((a,v) => (a << 1) | v,0);
            //   this.errorStates = this.errorList.map(error => error.state).reverse().reduce((a,v) => (a << 1) | v,0);
            // },
            getProperty(name) {
              return new Promise(async (succes,fail)=>{
                const property = properties[name]||{};
                // console.debug(name, property);
                const {modbus} = property;
                if (modbus && Number(item[modbus.device+'Address'])) {
                  // console.debug(modbus.device);
                  Object.assign(modbus, config.socketOptions[modbus.device]);
                  modbus.path = path;//'COM'+item[modbus.device+'Path'];
                  modbus.baudRate = Number(item[modbus.device+'BaudRate']);
                  modbus.address = Number(item[modbus.device+'Address']);
                  // console.debug(modbus);
                  if (!modbus.address) fail('No address');
                  return await socketCall(modbus).then(value => succes(item[name] = value), fail);
                }
                succes(data[name]);
              })
            },
          })
          Object.values(properties).forEach(property => {
            if (property.type == 'boolean') property.fc = property.readOnly ? 2 : 1;
            else if (property.type == 'integer') property.fc = property.readOnly ? 4 : 3;
          })
          const propertiesArray = Array.from(Object.entries(properties));
          [1,2,3,4].forEach(fc => propertiesArray.filter(([name,property]) => property.fc == fc).forEach(([name,property],register) => Object.assign(property,{register})));

          propertiesArray.forEach(([name,property]) => {
            const {type,format,readOnly,modbus,fc,register,readInterval,options} = property;
            let toCheck;
            // const {modbus,readInterval} = property;
            // if (modbus) {
            //   const {fc,register} = modbus;
            //   if (readInterval) {
            //     (function read(){
            //       item.getProperty(name)
            //       .catch((err) => console.error(Object.assign(err,{property})))
            //       .finally(() => setTimeout(read, readInterval * 1000));
            //     })();
            //   }
            // }
            let prevValue = JSON.stringify(data[name]);
            Object.defineProperty(item, name, {
              get(){
                const value = name in data ? data[name] : property.defaultValue;
                // const value = property.defaultValue;
                return value;
              },
              set(value){
                if (type === 'integer') value = Number(value);
                if (type === 'boolean') value = Number(value) ? 1 : 0;
                const jsonValue = JSON.stringify(value);
                if (prevValue !== jsonValue) {
                  console.debug(name.padStart(40), jsonValue);
                  prevValue = jsonValue;
                  data[name] = value;
                  if (options) {
                    const {settings,waitfor} = options[Number(value)]||{};
                    Object.entries(settings||{}).forEach(([n,v]) => this[n] = Number(isNaN(v) ? this[v] : v));
                    // if (waitfor) {
                    //   const self = this;
                    //   (function check(){
                    //     clearTimeout(toCheck);
                    //     // console.log(4, value,self.waterLevelLowState, Object.entries(waitfor).map(([n,v]) => [self[n] == v]));
                    //     if (data[name] == value) {
                    //       if (Array.from(Object.entries(waitfor)).map(([n,v]) => self[n] == v).every(Boolean)) {
                    //         const newvalue = Number(value) < options.length - 1 ? Number(value) + 1 : 0;
                    //         // console.debug('CHECK UPDATE', value, 'to', newvalue);
                    //         self[name] = newvalue;
                    //       } else {
                    //         toCheck = setTimeout(check,500);
                    //       }
                    //     }
                    //   })()
                    // }
                  }
                  if (server && fc && register) {
                    if (fc === 1) server.coils.writeUInt16BE(Number(value), register * 2);
                    else if (fc === 2) server.discrete.writeUInt16BE(Number(value), register * 2);
                    else if (fc === 3) server.holding.writeUInt16BE(Number(value), register * 2);
                    else if (fc === 4) server.input.writeUInt16BE(Number(value), register * 2);
                  }
                  if (modbus && [1,5,15,3,6,16].includes(modbus.fc)) {
                    if (Number(item[modbus.device+'Address']) && item[modbus.device+'BaudRate']) {
                      Object.assign(modbus, config.socketOptions[modbus.device]);
                      modbus.path = path;
                      modbus.baudRate = Number(item[modbus.device+'BaudRate']);
                      modbus.address = Number(item[modbus.device+'Address']);
                      socketCall(modbus, Number(value)).catch(err => console.error(err));
                    } else if (host && port && register) {
                      socketCall({host,port,register,fc:modbus.fc}, Number(value)).catch(err => console.error(err));
                    }
                  }
                  if (socketClient && !nomessage) {
                    socketClient.send('CHANGE', {id,name,value});
                  }
                  Aim.emit('postUpdate', {id,name,value});
                }
              },
            });
          });
        });
        Aim.on('message', async (event) => {
          var {data,target,sid,remoteAddress} = event;
          var {message_type,content,to,headers,sub,aud} = data;
          // console.debug({message_type,content});
          switch (message_type) {
            case 'INIT': {
              const {items,definitions} = config;
              const content = {itemId,items,definitions};
              target.send(JSON.stringifyReplacer({message_type:'DATA',content}));
              return;
            }
            case 'REFRESH': {
              globalProperties.forEach(content => target.send(JSON.stringify({message_type:'CHANGE',content})));
              return;
            }
            case 'CHANGE': {
              const {id,name,value} = content;
              // console.debug('message CHANGE',{id,name,value,sid});
              nomessage = true;
              items.filter(item => item.id == id).forEach(item => item[name] = isNaN(value) ? value : Number(value));
              nomessage = false;
              return;
            }
          }
        });

        process.stdin.resume();
        const exitHandler = (options, exitCode) => {
          fs.writeFileSync(process.mainModule.path+'/config/system.json', JSON.stringifyReplacer({itemId,apiKey,items}));
          if (options.cleanup) console.debug('clean');
          if (exitCode || exitCode === 0) console.debug(exitCode);
          if (options.exit) process.exit();
        }
        // do something when app is closing
        process.on('exit', exitHandler.bind(null,{cleanup:true}));
        // catches ctrl+c event
        process.on('SIGINT', exitHandler.bind(null, {exit:true}));
        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
        process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
        // catches uncaught exceptions
        process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
        // process.stdin.resume();
        // process.on('exit', event => {
        //   console.debug(111);
        //   fs.writeFileSync(`./public/config/data.json`, JSON.stringify(globalSystems, null, 2));
        //   process.exit();
        // });
        return {globalSystems,globalProperties}
      }
      if (socketClient) {
        Aim.on('message', event => {
          var {data,target,sid,remoteAddress} = event;
          var {message_type,content,to,headers,sub,aud} = data;
          // console.debug({message_type,content});
          switch (message_type) {
            case 'CHANGE': {
              const {id,name,value} = content;
              // console.log('change1', id,name,value, items, items.filter(item => item.id == id))
              items.filter(item => item.id == id).forEach(item => item[name] = isNaN(value) ? value : Number(value));
              return;
            }
          }
        });
        socketClient.send('REFRESH');
      }
    },
  });
  Object.setPrototypeOf(Aim.config,{
    // listAttributes: 'header0,header1,header2,name,schemaPath,Master,Src,Class,Tagname,InheritedID,HasChildren,HasAttachements,State,Categories,CreatedDateTime,LastModifiedDateTime,LastVisitDateTime,StartDateTime,EndDateTime,FinishDateTime',
    trackLocalSessionTime: 5000, // timeout between tracking local cookie login session
    trackSessionTime: 30000, // timeout between tracking login session
    minMs: 60000,
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
      forceRefresh: false
    },
    // clients: [],
    languages: {
      ab:{iso:'Abkhazian', native:'аҧсуа бызшәа, аҧсшәа'},
      aa:{iso:'Afar', native:'Afaraf'},
      af:{iso:'Afrikaans', native:'Afrikaans'},
      ak:{iso:'Akan', native:'Akan'},
      sq:{iso:'Albanian', native:'Shqip'},
      am:{iso:'Amharic', native:'አማርኛ'},
      ar:{iso:'Arabic', native:'العربية'},
      an:{iso:'Aragonese', native:'aragonés'},
      hy:{iso:'Armenian', native:'Հայերեն'},
      as:{iso:'Assamese', native:'অসমীয়া'},
      av:{iso:'Avaric', native:'авар мацӀ, магӀарул мацӀ'},
      ae:{iso:'Avestan', native:'avesta'},
      ay:{iso:'Aymara', native:'aymar aru'},
      az:{iso:'Azerbaijani', native:'azərbaycan dili'},
      bm:{iso:'Bambara', native:'bamanankan'},
      ba:{iso:'Bashkir', native:'башҡорт теле'},
      eu:{iso:'Basque', native:'euskara, euskera'},
      be:{iso:'Belarusian', native:'беларуская мова'},
      bn:{iso:'Bengali', native:'বাংলা'},
      bh:{iso:'Bihari languages', native:'भोजपुरी'},
      bi:{iso:'Bislama', native:'Bislama'},
      bs:{iso:'Bosnian', native:'bosanski jezik'},
      br:{iso:'Breton', native:'brezhoneg'},
      bg:{iso:'Bulgarian', native:'български език'},
      my:{iso:'Burmese', native:'ဗမာစာ'},
      ca:{iso:'Catalan, Valencian', native:'català, valencià'},
      ch:{iso:'Chamorro', native:'Chamoru'},
      ce:{iso:'Chechen', native:'нохчийн мотт'},
      ny:{iso:'Chichewa, Chewa, Nyanja', native:'chiCheŵa, chinyanja'},
      zh:{iso:'Chinese', native:'中文 (Zhōngwén), 汉语, 漢語'},
      cv:{iso:'Chuvash', native:'чӑваш чӗлхи'},
      kw:{iso:'Cornish', native:'Kernewek'},
      co:{iso:'Corsican', native:'corsu, lingua corsa'},
      cr:{iso:'Cree', native:'ᓀᐦᐃᔭᐍᐏᐣ'},
      hr:{iso:'Croatian', native:'hrvatski jezik'},
      cs:{iso:'Czech', native:'čeventština, český jazyk'},
      da:{iso:'Danish', native:'dansk'},
      dv:{iso:'Divehi, Dhivehi, Maldivian', native:'ދިވެހި'},
      nl:{iso:'Dutch, Flemish', native:'Nederlands, Vlaams'},
      dz:{iso:'Dzongkha', native:'རྫོང་ཁ'},
      en:{iso:'English', native:'English'},
      eo:{iso:'Esperanto', native:'Esperanto'},
      et:{iso:'Estonian', native:'eesti, eesti keel'},
      ee:{iso:'Ewe', native:'Eʋegbe'},
      fo:{iso:'Faroese', native:'føroyskt'},
      fj:{iso:'Fijian', native:'vosa Vakaviti'},
      fi:{iso:'Finnish', native:'suomi, suomen kieli'},
      fr:{iso:'French', native:'français, langue française'},
      ff:{iso:'Fulah', native:'Fulfulde, Pulaar, Pular'},
      gl:{iso:'Galician', native:'Galego'},
      ka:{iso:'Georgian', native:'ქართული'},
      de:{iso:'German', native:'Deutsch'},
      el:{iso:'Greek, Modern (1453-)', native:'ελληνικά'},
      gn:{iso:'Guarani', native:'Avañevent\'ẽ'},
      gu:{iso:'Gujarati', native:'ગુજરાતી'},
      ht:{iso:'Haitian, Haitian Creole', native:'Kreyòl ayisyen'},
      ha:{iso:'Hausa', native:'(Hausa) هَوُسَ'},
      he:{iso:'Hebrew', native:'עברית'},
      hz:{iso:'Herero', native:'Otjiherero'},
      hi:{iso:'Hindi', native:'हिन्दी, हिंदी'},
      ho:{iso:'Hiri Motu', native:'Hiri Motu'},
      hu:{iso:'Hungarian', native:'magyar'},
      ia:{iso:'Interlingua (International Auxiliary Language Association)', native:'Interlingua'},
      id:{iso:'Indonesian', native:'Bahasa Indonesia'},
      ie:{iso:'Interlingue, Occidental', native:'(originally:) Occidental, (after WWII:) Interlingue'},
      ga:{iso:'Irish', native:'Gaeilge'},
      ig:{iso:'Igbo', native:'Asụsụ Igbo'},
      ik:{iso:'Inupiaq', native:'Iñupiaq, Iñupiatun'},
      io:{iso:'Ido', native:'Ido'},
      is:{iso:'Icelandic', native:'Íslenska'},
      it:{iso:'Italian', native:'Italiano'},
      iu:{iso:'Inuktitut', native:'ᐃᓄᒃᑎᑐᑦ'},
      ja:{iso:'Japanese', native:'日本語 (にほんご)'},
      jv:{iso:'Javanese', native:'ꦧꦱꦗꦮ, Basa Jawa'},
      kl:{iso:'Kalaallisut, Greenlandic', native:'kalaallisut, kalaallit oqaasii'},
      kn:{iso:'Kannada', native:'ಕನ್ನಡ'},
      kr:{iso:'Kanuri', native:'Kanuri'},
      ks:{iso:'Kashmiri', native:'कश्मीरी, كشميري‎'},
      kk:{iso:'Kazakh', native:'қазақ тілі'},
      km:{iso:'Central Khmer', native:'ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ'},
      ki:{iso:'Kikuyu, Gikuyu', native:'Gĩkũyũ'},
      rw:{iso:'Kinyarwanda', native:'Ikinyarwanda'},
      ky:{iso:'Kirghiz, Kyrgyz', native:'Кыргызча, Кыргыз тили'},
      kv:{iso:'Komi', native:'коми кыв'},
      kg:{iso:'Kongo', native:'Kikongo'},
      ko:{iso:'Korean', native:'한국어'},
      ku:{iso:'Kurdish', native:'Kurdî, کوردی‎'},
      kj:{iso:'Kuanyama, Kwanyama', native:'Kuanyama'},
      la:{iso:'Latin', native:'latine, lingua latina'},
      lb:{iso:'Luxembourgish, Letzeburgesch', native:'Lëtzebuergesch'},
      lg:{iso:'Ganda', native:'Luganda'},
      li:{iso:'Limburgan, Limburger, Limburgish', native:'Limburgs'},
      ln:{iso:'Lingala', native:'Lingála'},
      lo:{iso:'Lao', native:'ພາສາລາວ'},
      lt:{iso:'Lithuanian', native:'lietuvių kalba'},
      lu:{iso:'Luba-Katanga', native:'Kiluba'},
      lv:{iso:'Latvian', native:'latviešu valoda'},
      gv:{iso:'Manx', native:'Gaelg, Gailck'},
      mk:{iso:'Macedonian', native:'македонски јазик'},
      mg:{iso:'Malagasy', native:'fiteny malagasy'},
      ms:{iso:'Malay', native:'Bahasa Melayu, بهاس ملايو‎'},
      ml:{iso:'Malayalam', native:'മലയാളം'},
      mt:{iso:'Maltese', native:'Malti'},
      mi:{iso:'Maori', native:'te reo Māori'},
      mr:{iso:'Marathi', native:'मराठी'},
      mh:{iso:'Marshallese', native:'Kajin M̧ajeļ'},
      mn:{iso:'Mongolian', native:'Монгол хэл'},
      na:{iso:'Nauru', native:'Dorerin Naoero'},
      nv:{iso:'Navajo, Navaho', native:'Diné bizaad'},
      nd:{iso:'North Ndebele', native:'isiNdebele'},
      ne:{iso:'Nepali', native:'नेपाली'},
      ng:{iso:'Ndonga', native:'Owambo'},
      nb:{iso:'Norwegian Bokmål', native:'Norsk Bokmål'},
      nn:{iso:'Norwegian Nynorsk', native:'Norsk Nynorsk'},
      no:{iso:'Norwegian', native:'Norsk'},
      ii:{iso:'Sichuan Yi, Nuosu', native:'ꆈꌠ꒿ Nuosuhxop'},
      nr:{iso:'South Ndebele', native:'isiNdebele'},
      oc:{iso:'Occitan', native:'occitan, lenga d\'òc'},
      oj:{iso:'Ojibwa', native:'ᐊᓂᔑᓈᐯᒧᐎᓐ'},
      cu:{iso:'Church Slavic, Old Slavonic, Church Slavonic, Old Bulgarian, Old Church Slavonic', native:'ѩзыкъ словѣньскъ'},
      om:{iso:'Oromo', native:'Afaan Oromoo'},
      or:{iso:'Oriya', native:'ଓଡ଼ିଆ'},
      os:{iso:'Ossetian, Ossetic', native:'ирон æвзаг'},
      pa:{iso:'Punjabi, Panjabi', native:'ਪੰਜਾਬੀ, پنجابی‎'},
      pi:{iso:'Pali', native:'पालि, पाळि'},
      fa:{iso:'Persian', native:'فارسی'},
      pl:{iso:'Polish', native:'język polski, polszczyzna'},
      ps:{iso:'Pashto, Pushto', native:'پښتو'},
      pt:{iso:'Portuguese', native:'Português'},
      qu:{iso:'Quechua', native:'Runa Simi, Kichwa'},
      rm:{iso:'Romansh', native:'Rumantsch Grischun'},
      rn:{iso:'Rundi', native:'Ikirundi'},
      ro:{iso:'Romanian, Moldavian, Moldovan', native:'Română'},
      ru:{iso:'Russian', native:'русский'},
      sa:{iso:'Sanskrit', native:'संस्कृतम्'},
      sc:{iso:'Sardinian', native:'sardu'},
      sd:{iso:'Sindhi', native:'सिन्धी, سنڌي، سندھی‎'},
      se:{iso:'Northern Sami', native:'Davvisámegiella'},
      sm:{iso:'Samoan', native:'gagana fa\'a Samoa'},
      sg:{iso:'Sango', native:'yângâ tî sängö'},
      sr:{iso:'Serbian', native:'српски језик'},
      gd:{iso:'Gaelic, Scottish Gaelic', native:'Gàidhlig'},
      sn:{iso:'Shona', native:'chiShona'},
      si:{iso:'Sinhala, Sinhalese', native:'සිංහල'},
      sk:{iso:'Slovak', native:'Slovenčina, Slovenský Jazyk'},
      sl:{iso:'Slovenian', native:'Slovenski Jezik, Slovenščina'},
      so:{iso:'Somali', native:'Soomaaliga, af Soomaali'},
      st:{iso:'Southern Sotho', native:'Sesotho'},
      es:{iso:'Spanish, Castilian', native:'Español'},
      su:{iso:'Sundanese', native:'Basa Sunda'},
      sw:{iso:'Swahili', native:'Kiswahili'},
      ss:{iso:'Swati', native:'SiSwati'},
      sv:{iso:'Swedish', native:'Svenska'},
      ta:{iso:'Tamil', native:'தமிழ்'},
      te:{iso:'Telugu', native:'తెలుగు'},
      tg:{iso:'Tajik', native:'тоҷикӣ, toçikī, تاجیکی‎'},
      th:{iso:'Thai', native:'ไทย'},
      ti:{iso:'Tigrinya', native:'ትግርኛ'},
      bo:{iso:'Tibetan', native:'བོད་ཡིག'},
      tk:{iso:'Turkmen', native:'Türkmen, Түркмен'},
      tl:{iso:'Tagalog', native:'Wikang Tagalog'},
      tn:{iso:'Tswana', native:'Setswana'},
      to:{iso:'Tonga (Tonga Islands)', native:'Faka Tonga'},
      tr:{iso:'Turkish', native:'Türkçevent'},
      ts:{iso:'Tsonga', native:'Xitsonga'},
      tt:{iso:'Tatar', native:'татар теле, tatar tele'},
      tw:{iso:'Twi', native:'Twi'},
      ty:{iso:'Tahitian', native:'Reo Tahiti'},
      ug:{iso:'Uighur, Uyghur', native:'ئۇيغۇرچە‎, Uyghurche'},
      uk:{iso:'Ukrainian', native:'Українська'},
      ur:{iso:'Urdu', native:'اردو'},
      uz:{iso:'Uzbek', native:'Oʻzbek, Ўзбек, أۇزبېك‎'},
      ve:{iso:'Venda', native:'Tshivenḓa'},
      vi:{iso:'Vietnamese', native:'Tiếng Việt'},
      vo:{iso:'Volapük', native:'Volapük'},
      wa:{iso:'Walloon', native:'Walon'},
      cy:{iso:'Welsh', native:'Cymraeg'},
      wo:{iso:'Wolof', native:'Wollof'},
      fy:{iso:'Western Frisian', native:'Frysk'},
      xh:{iso:'Xhosa', native:'isiXhosa'},
      yi:{iso:'Yiddish', native:'ייִדיש'},
      yo:{iso:'Yoruba', native:'Yorùbá'},
      za:{iso:'Zhuang, Chuang', native:'Saɯ cueŋƅ, Saw cuengh'},
      zu:{iso:'Zulu', native:'isiZulu'},
    },
  });
  if (document) {
    this.$ = this.$$ = this.Aim = this.A = Aim;
    const {currentScript} = document;
    if (currentScript) {
      Array.from(currentScript.attributes).forEach(attribute => Aim.extend({config: Format.minimist(['--'+attribute.name.replace(/^--/, ''), attribute.value])}));
    }
    (new URLSearchParams(document.location.search)).forEach((value,key)=>Aim.extend({config: Format.minimist([key,value])}));
    return Aim;
  } else {
    const color = {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      steelblue: "\x1b[36m",
      white: "\x1b[37m",
      debug: "\x1b[33m",
      error: "\x1b[31m",
    };
    const bgColor = {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      steelblue: "\x1b[46m",
      white: "\x1b[47m",
      debug: "\x1b[40m",
      error: "\x1b[47m",
      error: "\x1b[40m",
    };
    const codeColor = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      dim: "\x1b[2m",
      underscore: "\x1b[4m",
      blink: "\x1b[5m",
      reverse: "\x1b[7m",
      hidden: "\x1b[8m",
    };
    ['debug','error'].forEach(name => {
      console[name] = function () {
        var args = [...arguments];
        args = args.filter(val => val != null);
        var initiator = 'unknown place';
        try { throw new Error(); }
        catch (event) {
          if (typeof event.stack === 'string') {
            let isFirst = true;
            for (var line of event.stack.split('\n')) {
              const matches = line.match(/^\s+at\s+(.*)/);
              if (matches) {
                if (!isFirst) {
                  initiator = matches[1];
                  break;
                }
                isFirst = false;
              }
            }
          }
        }
        initiator = initiator.split('\\').pop().split('/').pop().split(':').slice(0, 2).join(':').replace('.js', '').padEnd(16, ' ');
        process.stdout.write(bgColor[name] + color[name]);
        console.log.apply(console, [new Date().toISOString().substr(11,8), initiator, color.white, ...args]);
        process.stdout.write(codeColor.reset);
      };
    });
    this.WebSocket = this.WebSocket || require('ws');
    fs = require('fs');
    atob = require('atob');
    Object.assign(Aim, {fs,atob});
    // Aim.config(minimist(process.argv.slice(2)));
    config(Object.fromEntries(process.argv.slice(2).map(arg => arg.split('='))));

    // console.debug(config);

    const {client_id} = config;
    const clientConfigFileName = `./config/client/${client_id}.json`;
    if (fs.existsSync(clientConfigFileName)) {
      Aim.config(JSON.parse(fs.readFileSync(clientConfigFileName)));
    }
    const storageFileName = process.mainModule.path + '/storage.json';
    const localStorage = fs.existsSync(storageFileName) ? require(storageFileName) : {};
    const sessionStorage = {};

    const Server = {create(options) {
      const aimServer = {
        emit,forEach,on,
      };
      let {client_id,client_secret,http,sqlsrv} = options;
      if (sqlsrv) {
        const {port, server, userName, password, database} = sqlsrv;
        const requests = [];
        const {Connection,Request} = require('tedious');
        let sqlBusy;
        function query(sql){
          return new Promise((resolve, reject) => {
            const connection = new Connection({
              port,
              server,
              authentication: {
                type: 'default',
                options: {userName,password}
              },
              options: {
                database,
                encrypt: true,
                validateBulkLoadParameters: true,
                trustServerCertificate: true,
                cryptoCredentialsDetails: { minVersion: 'TLSv1' },
              },
            });
            connection.on('connect', err => {
              if (err) throw err;
              const recordsets = [];
              let rows = [];
              // return new mssql.Request().query(sql, (err, res) => {
              //   if (err) console.error(err);
              //   end(200, JSON.stringify(res.recordsets), { 'Content-Type': 'application/json' });
              // })
              const request = new Request(sql, (err, res) => {
                if (err) {
                  reject(err);
                }
                connection.close();
              });
              request.on('done', rowCount => console.debug('Done is called!'));
              request.on('error', err => console.debug('error!', err));
              request.on('doneInProc', (rowCount, more) => {
                recordsets.push(rows);
                rows = [];
              });
              request.on('requestCompleted', () => resolve(recordsets));
              request.on('row', columns => rows.push(Object.fromEntries(columns.map(col => [col.metadata.colName, col.value]))));
              connection.execSql(request);
            });
            connection.on('error', function(err) {
              console.debug(err);
            });
            connection.connect();
          });
        }
        Object.assign(aimServer, {query});
      }
      if (http) {
        const {ca,key,cert,port} = http;
        // crypto = require('crypto');
        url = require('url');
        let paths = [process.mainModule.path+'/public', process.mainModule.path];
        (function addpath(module) {
          if (module.parent) addpath(module.parent);
          paths.push(...module.paths);
        })(module);
        paths = paths.unique().filter(path => fs.existsSync(path));
        // YAML = require('yaml');
        const server = ca
        ? require('https').createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert), ca: ca ? fs.readFileSync(ca) : null }, processRequest)
        : require('http').createServer(processRequest);
        server.listen(port);
        const webSocketServer = aimServer.socketServer = new WebSocket.Server({server}).on('connection', connection);
        const {clients} = webSocketServer;
        function connection(webSocket, req) {
          function send(data){
            webSocket.send(JSON.stringify(data));
          }
          const remoteAddress = req.connection.remoteAddress.split(':').pop();
          const {Jwt} = Aim;
          const sid = webSocket.sid = Jwt.btoaToJson(req.headers['sec-websocket-key']);
          console.debug(sid, remoteAddress, 'CONNECTION');
          webSocket.on('close', connection => {
            console.debug(sid, remoteAddress, 'CLOSE');
            const message = JSON.stringify({ sid, path: 'CONNECTION_CLOSE' });
            Array.from(clients)
            .filter(client => client !== webSocket && client.aud === webSocket.aud)
            .forEach(client => client.send(message));
            if (webSocket.connector) {
              Array.from(clients)
              .filter(client => client.connectorClient && client.connectorClient.nonce === webSocket.connector.nonce)
              .forEach(client => client.send(JSON.stringify({path: '/aliconnector/connector/close'})));
            }
          });
          webSocket.addEventListener('message', async (event) => {
            try {
              let {data,target} = event;
              // aimServer.query(`INSERT INTO auth.dbo.log(data) VALUES('${data}')`);
              data = JSON.parse(data);
              return Aim.emit('message', {data,target,sid,remoteAddress});
              return;
              if (sid) {
                data.sid = webSocket.sid;
                console.debug(path, sid, data);
                data = JSON.stringify(data);
                Array.from(clients).filter(client => client.sid === sid).forEach(client => client.send(data));
                return;
              }
              switch (path) {
                default: {
                  // var match;
                  // if (match = path.match(/^\/(.+?)\((.+?)\)(.+?)/)) {
                  //   const [s,key,id] = match;
                  //   console.debug(333, key,id);
                  //   console.debug(Array.from(clients).map(client => client.access));
                  //   const to = Array.from(clients).filter(client => client.access && client.access[key] == id);
                  //   data = JSON.stringify(Object.assign(data,{sid:webSocket.sid}));
                  //   to.forEach(client => client.send(data));
                  //   // console.debug(key,id,to);
                  // }
                  // console.debug();
                  const stringData = JSON.stringify(data);
                  // console.debug(Array.from(clients).map(client => client.access));
                  if (headers) {
                    const access = getAccess(headers, true);
                    if (access && access.aud) {
                      Array.from(clients)
                      .filter(client => client.readyState === client.OPEN &&
                        client !== webSocket &&
                        client.access &&
                        client.access.id &&
                        client.access.id === access.aud
                        // || client.access.client_id == client.access.client_id
                      ).forEach(client => client.send(stringData));
                    }
                  }
                }
              }
              if (body) {
                const {notify,accept} = body;
                if (notify) {
                  //console.debug('NOTIFY', window.document.hasFocus());
                  if (!window.document.hasFocus()) {
                    if ("Notification" in window) {
                      if (Notification.permission === "granted") {
                        // var notification = new Notification(...Object.values(data.body.notify));
                        // notification.onclick = function(e) {
                        //   window.focus();
                        //   //console.debug('CLICKED', data.body.notify);
                        // }
                        new Aim().sw.showNotification(...Object.values(notify));
                        // `test modified SW`, {
                        //   body: `Bla Bla`,
                        //   icon: 'https://aliconnect.nl/favicon.ico',
                        //   image: 'https://aliconnect.nl/shared/265090/2020/07/09/5f0719fb8fa69.png',
                        //   data: {
                        //     url: document.location.href,
                        //   },
                        //   actions: [
                        //     {
                        //       action: 'new',
                        //       title: 'New',
                        //       // icon: 'https://aliconnect.nl/favicon.ico',
                        //     },
                        //     {
                        //       action: 'open',
                        //       title: 'Open',
                        //       // icon: 'https://aliconnect.nl/favicon.ico',
                        //     },
                        //     // {
                        //     //   action: 'gramophone-action',
                        //     //   title: 'gramophone',
                        //     //   icon: '/images/demos/action-3-128x128.png'
                        //     // },
                        //     // {
                        //     //   action: 'atom-action',
                        //     //   title: 'Atom',
                        //     //   icon: '/images/demos/action-4-128x128.png'
                        //     // }
                        //   ]
                        // });
                      }
                    }
                  }
                }
                if (accept) {
                  Aim().prompt('accept').accept_scope(accept.scopes, origin);
                }
              }
              switch (state) {
                case 'disconnect': {
                  //console.debug('disconnect', Aim().aliconnector_id, data.origin);
                  // return;
                  if (Aim().aliconnector_id === data.origin) {
                    Aim().status('aliconnector', 'offline');
                    Aim().aliconnector_id = null;
                  }
                }
              }
              if (data.id_token) {
                const id = JSON.parse(atob(data.id_token.split('.')[1]));
                if (getId(id.sub) !== getId(aimClient.sub)) {
                  return Aim().logout();
                }
              }
              if (data.origin === Aim().aliconnector_id) {
                if (data.param) {
                  if (data.param.filedownload) {
                    //console.debug('filedownload', data.param.filedownload);
                  }
                  if (data.param.fileupload) {
                    //console.debug('fileupload', data.param.fileupload);
                  }
                }
              }
              if (attr) {
                attr(...data.attr);
                const {id,name,state} = attr;
                const item = systems[id];
                if (item) {
                  const systemAttr = item.data[name];
                  // //console.debug(attr);
                  const oldValue = systemAttr.value;
                  if (systemAttr.state != state) {
                    setItemTypeValue(systemAttr.item, state, -1);
                    setItemTypeValue(systemAttr.item, systemAttr.state, 1);
                  }
                  Object.assign(systemAttr, attr);
                  if (systemAttr.attributeType) {
                    setItemTypeValue(item, systemAttr.attributeType, - Number(oldValue));
                    setItemTypeValue(item, systemAttr.attributeType, Number(systemAttr.value));
                  }
                  attributeRowUpdate(systemAttr);
                }
              }
              if (path.match('/aliconnector')) {
                if (target.connectorClient) {
                  return Array.from(clients)
                  .filter(client => client.connector && client.connector.nonce === target.connectorClient.nonce)
                  .forEach(client => client.send(data));
                }
                if (target.connector) {
                  return Array.from(clients)
                  .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
                  .forEach(client => client.send(data));
                }
                console.debug(path);
              }
              aimServer.emit('message', data);
            } catch (err) {
              console.error(err);
            }
          });
        };
        async function processRequest (req, res) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const responseText = Buffer.concat(buffers).toString();
          const {code,body} = res;
          const {headers} = req;
          const method = req.method.toLowerCase();
          const url = new URL(req.url, 'http://localhost');
          let {pathname,href,searchParams} = url;
          function end(statusCode, body, header) {
            res.writeHead(res.statusCode = statusCode, header);
            res.end(body);
          }
          if (pathname.match(/secret/)) {
            return end(401, `401 No authorize Aim{pathname}`, { 'Content-Type': 'text/html' } );
          }
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
          res.setHeader('Access-Control-Request-Method', '*');
          if (Aim.paths && Aim.paths[pathname] && Aim.paths[pathname][method]) {
            const {operation,opertaionId} = Aim.paths[pathname][method];
            if (operation) {
              return operation(end);
            } else if (Aim[operationId]) {
              (async function () {
                const res = await Aim[operationId]();
                // const body = JSON.stringify(res);
                // console.debug(res);
                // return end(200, 'AOK', {});
                return end(code,body,headers);
              })()
              return;
            }
          }
          // const config = {
          //   paths:{
          //     '/api/v1.0/process/exit': {
          //       get: {
          //         operationId: 'fasdfasdf',
          //         // operation(){
          //         //
          //         // }
          //       }
          //     }
          //   }
          // }
          // const config = YAML.parse(fs.readFileSync('./webroot/api/v1.0/aliconnect.yaml'));
          if (pathname.match(/client\((.*?)\)\/config/)) {
            const config = require(Aim.publicConfigJson);
            // config.items = Array.from(Item.items.values()).map(item => item.data);
            return end(200, JSON.stringify(config), { 'Content-Type': 'application/json' })
          }
          switch(pathname) {
            // case '/config': {
            //   switch(method) {
            //     case 'get': {
            //       http_response(200, 1);
            //     }
            //   }
            // }
            case '/items': {
              const value = Array.from(Item.items.values()).map(item => item.data);
              return end(200, JSON.stringify({value}), { 'Content-Type': 'application/json' })
            }

            case '/login': {
              return end(200, `<!DOCTYPE html><html><head>
                <script src="https://aliconnect.nl/sdk@0.0.10/src/js/Aim.js"></script>
                <script src="https://aliconnect.nl/sdk@0.0.10/src/js/web.js"></script>
                <title>Signin</title>
                </head><body><script>
                const client = Aim.Client.init({
                  serviceRoot: 'https://aliconnect.nl/v1',
                  scope: 'admin',
                });
                client.login();
                </script></body></html>
                `
              );
            }
            // case '/config/load': {
            //   const {authorization} = headers;
            //   const accessToken = authorization.split(' ').pop();
            //
            //   return end(200);
            // }
            case '/config': {
              return end(200, `
                <!DOCTYPE html>
                <html>
                <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <script src="https://aliconnect.nl/sdk@0.0.10/src/js/Aim.js"></script>
                <script src="https://aliconnect.nl/sdk@0.0.10/src/js/web.js"></script>
                <title>Config</title>
                </head>
                <body><script src="config.yaml"></script></body>
                </html>
                `
              );
            }
            case '/v1/config/save': {
              switch(method) {
                case 'post': {
                  const data = JSON.parse(responseText);
                  console.debug(data.items.filter(client => client.http));
                  data.items.filter(client => client.http).forEach(client => {
                    client.info = {
                      client_id: client.id,
                    }
                    fs.writeFileSync(`./config/client/${client.id}.json`, JSON.stringify(client, null, 2));
                  });
                  // data.clients.forEach(client => {
                  //   fs.writeFileSync(`./config/client/${client.client_id}.json`, JSON.stringify(client, null, 2));
                  // })
                  // console.debug('CONFIG SAVE', data);
                  return end(200);
                }
              }
            }
            case '/api/v1.0/process/exit': {
              switch(method) {
                case 'get': {
                  return process.exit(1);
                }
              }
            }
            case '/api/v1.0/oas': {
              switch(method) {
                case 'get': {
                  const contents = fs.readFileSync('./webroot/api/v1.0/aliconnect.yaml', 'utf8');
                  const config = YAML.parse(contents);
                  // console.debug(YAML.parse(contents));
                  return end(200, YAML.stringify(config), { 'Content-Type': 'text/yaml' });
                }
              }
            }
            case '/api/v1.0/test': {
              switch(method) {
                case 'get': {
                  return Aim.query('select top 50000 id from aim1.item.dt;select top 50000 id from aim1.item.dt;')
                  .then(recordsets => end(200, JSON.stringify(recordsets), { 'Content-Type': 'application/json' }));
                }
              }
              return end(200);
            }
            case '/api/v1.0/test/headers': {
              switch(method) {
                case 'get': {
                  const {sid} = headers;
                  const access = getAccess(headers);
                  const message = JSON.stringify({pathname});
                  Array.from(clients).filter(client => client.access && client.access.client_id === access.client_id && client.sid !== sid).forEach(client => client.send(message));
                  return end(200, JSON.stringify(access), { 'Content-Type': 'application/json' })
                }
              }
              return end(200);
            }
            case '/config.js': {
              return end(200, 'config='+JSON.stringify(config), { 'Content-Type': 'application/json' });
            }
            case '/sql.json': {
              const sql = `SELECT TOP 1000 * FROM attr WHERE Aim{searchParams.get('filter')}`;
              debug(sql);
              return new mssql.Request().query(sql, (err, res) => {
                if (err) console.error(err);
                end(200, JSON.stringify(res.recordsets), { 'Content-Type': 'application/json' });
              })
            }
          }
          const extensionHeaders = {
            json: {'Content-Type': 'application/json','OData-Version': '4.0'},
            js: {'Content-Type': 'text/javascript','Service-Worker-Allowed': '/'},
            md: {'Content-Type': 'text/md','Service-Worker-Allowed': '/'},
            css: {'Content-Type': 'text/css','Service-Worker-Allowed': '/'},
            html: {'Content-Type': 'text/html','Service-Worker-Allowed': '/'},
          };
          // pathname = pathname.replace(/\/blob\/main(.*?)\.md/, '$1');
          // pathname = pathname.replace(/^\/(.*?)\/.*?\.(.*?)\//, '/@$1/$2/');
          // console.debug(pathname, paths);
          // for (var fname of paths.map(path => path+pathname)) {
          //   if (fs.existsSync(fname) && fs.statSync(fname).isFile()) {
          //
          //   }
          // }
          var filenames = [
            process.cwd() + '/node_modules' + pathname,
            process.mainModule.path + '/node_modules' + pathname,
          ];
          var filename = filenames.find(filename => fs.existsSync(filename) && fs.statSync(filename).isFile());
          if (filename) {
            return end(200, fs.readFileSync(filename));
          }
          var fname = paths.map(path => path+pathname).find(fname => fs.existsSync(fname) && fs.statSync(fname).isFile())||paths.map(path => path+pathname+'index.html').find(fs.existsSync);
          if (!fname && paths.map(path => path+pathname+'.md').find(fs.existsSync)) {
            return fs.readFile(module.path+'/../../public/md.html', (err, data) => {
              data = String(data)
              .replace(/\@\d+\.\d+\.\d+/g, '')
              .replace(/=".*aliconnect.sdk/g, '="/@aliconnect/sdk')
              .replace(/="\/\/.*?\.github\.io\/(.*?)\./g, '="/@aim1/')
              end(200, data, headers.html);
            });
            // fname = paths.map(path => '/@aliconnect/sdk/public/md.html').find(fs.existsSync);
          }
          if (!fname) {
            fname = process.mainModule.path + '/public/404.html';
          }
          if (fname) {
            return fs.readFile(fname, (err, data) => {
              if (err) {
                return end(404, `404 Not Found 1 ${req.url}`, { 'Content-Type': 'text/html' });
              }
              var ext = fname.split('.').pop();
              if (fname.match(/\.html/)) {
                data = String(data)
                // .replace(/\@\d+\.\d+\.\d+/g, '')
                // .replace(/=".*?aliconnect.*?sdk.*?src/g, '="/@aliconnect/sdk/src')
                .replace(/="\/\/.*?\.github\.io\/(.*?)\./g, '="/@aim1/')
              }
              end(200, data, extensionHeaders[ext]);
            })
          }
          res.end();
        };
        Object.defineProperty(aimServer, 'clients', {
          get() {
            return Array.from(webSocketServer.clients);
          }
        })
        Aim.on('message', async (event) => {
          var {data,target,sid,remoteAddress} = event;
          var {message_type,content,to,headers,sub,aud} = data;
          // if (content)
          // console.debug(data);
          // console.debug({sid, remoteAddress, message_type});
          if (message_type) {
            switch(message_type) {
              case 'CONNECTION_OPEN': {
                return target.send(JSON.stringify({message_type,content:{sid}}));
              }
              case 'CONNECTION_SIGNIN': {
                const {authorization,apiKey} = headers||{};
                const token = authorization ? authorization.split(' ').pop() : apiKey;
                if (token) {
                  const {aud,sub} = await getToken(token).catch(console.error) || {};
                  if (aud && sub) {
                    Object.assign(target,{aud,sub});
                  }
                }
                return target.send(JSON.stringify({message_type}));
              }
              case 'OPTIONS': {
                target.options = content;
                break;
              }
              case '/item/modified': {
                console.debug(itemsModified);
                if (body && body.requests) {
                  Aim.saveRequests(body.requests);
                }
                if (Aim.ws) {
                  Aim.ws.send(event.data);
                }
                break;
              }
              case '/user/state/set': {
                console.debug('userstate', data);
                // console.debug(Item.items, Item.items.filter(item => item.ID == data.sub));
                Array.from(Item.items.values()).filter(item => item.ID == data.sub)
                .forEach(item => item.elements.forEach(element => element.hasAttribute('userstate') ? element.setAttribute('userstate', data.userstate) : null))

                const states = [
                  'unknown',
                  'offline',
                  'blocked',
                  'busy_inactive',
                  'inactive',
                  'appear_away',
                  'urgentonly',
                  'donotdisturb',
                  'busy',
                  'available',
                ];
                const userstate = states.indexOf(data.userstate);
                // var clients = Array.from(webSocketServer.clients).filter(ws => ws.access && ws.access.aud === wsc.access.aud);
                var subclients = clients.filter(ws => ws.access.sub === wsc.access.sub);
                const currentState = Math.max(...subclients.map(ws => ws.userstate || 0));
                wsc.userstate = userstate;
                // var sub = wsc.access.sub;
                const newState = Math.max(...subclients.map(ws => ws.userstate || 0));
                if (currentState !== newState) {
                  //console.debug('state set', data.userstate, currentState, newState, subclients.map(ws => ws.userstate));
                  data.userstate = states[newState];
                  const msg = JSON.stringify(data);
                  clients.forEach(ws => ws.send(msg));
                }
              }
              case '/aliconnector/client/init': {
                target.connectorClient = body;
                break;
                // return Array.from(Aim.webSocketServer.clients)
                // .filter(client => client.connector && client.connector.nonce === body.nonce)
                // .forEach(client => client.send(data));
              }
              case '/aliconnector/connector/init': {
                target.connector = body || target.connector;
                break;
                // return Array.from(Aim.webSocketServer.clients)
                // .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
                // .forEach(client => client.send(data));
              }
              case '/aliconnector/request': {
                console.debug(body);
                return;
              }
              // case 'TOKEN': {
              //   const access = await getToken(content);
              //   console.debug('TOKEN',access);
              //   return;
              // };
              // case '/chat/cam/avail': {
              //   Object.assign(webSocket, body);
              //   const {camId,wallId} = body;
              //   Array.from(clients)
              //   .filter(client => client.readyState && !client.camId && client.wallId === wallId)
              //   .forEach(client => client.send(e.data));
              //   return;
              // }
              // case '/chat/wall/avail': {
              //   Object.assign(webSocket, body);
              //   const {camId,wallId} = body;
              //   Array.from(clients)
              //   .filter(client => client.readyState && client.camId && client.wallId === wallId)
              //   .forEach(client => client.send(e.data));
              //   return;
              // }
              // case '/init': {
              //   console.debug(headers,body);
              //   break;
              // }
              // case '/aliconnector/connector/close': {
              //   return Array.from(Aim.webSocketServer.clients)
              //   .filter(client => client.connectorClient && client.connectorClient.nonce === target.connector.nonce)
              //   .forEach(client => client.send(data));
              // }
              default: {
                // Als de auth van sender gericht is aan deze server dan bericht uitvoeren
                // Controleer of deze server een authenticatie heeft
                if (module.exports.getAccessToken) {
                  var token = await module.exports.getAccessToken();
                  var access = await Aim.getToken(token) || {};
                  // Vergelijk server authenticatie met sender authenticatie
                  if ([access.sub, access.aud].includes(aud) || [access.sub, access.aud].includes(sub)) {
                    // Voer bericht uit
                    Aim.onmessage(event);
                  }
                }
              }
            }
            var {clients} = aimServer;
            // aimServer.emit('message', {data,target});
            // data.sid = target.sid;
            Object.assign(data,{from:target.from||target.sid,options:target.options});
            // delete data.headers;

            if (headers) {
              try {
                var {authorization,apiKey} = headers||{};
                var token = authorization ? authorization.split(' ').pop() : apiKey;
                if (token) {
                  var access = await getToken(token) || {};
                  var {sub,aud,error,azp} = access;
                  if (error) console.error(error);
                  else {
                    Object.assign(target,{aud,sub,azp});
                    if (aimServer.query) {
                      try {
                        aimServer.query(
                          `DECLARE @now AS DATETIME = GETDATE()
                          DECLARE @period AS INT = DATEPART(YEAR,@now)*100+DATEPART(MONTH,@now)
                          INSERT auth.dbo.client_request(period,requestDateTime,client_id,messageType,data,access) VALUES(@period,@now,${azp ? `'${azp}'` : 'NULL'},'${message_type||''}','${String(content||'').replace(/'/g,"''")}','${JSON.stringify(access).replace(/'/g,"''")}')
                          `
                        );
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }
                }
                var dataString = JSON.stringify(data);
                var {options,aud,sub} = target;
                var toClients = clients.filter(client => client !== target && client.readyState && client.sid);
                toClients = to
                ? toClients.filter(client => [client.sub, client.aud, client.from, client.sid].includes(to))
                : toClients.filter(client => [client.sub, client.aud].includes(aud) || [client.sub, client.aud].includes(sub));
                toClients.forEach(client => client.send(dataString));
              } catch(err) {
                console.error(err);
              }
            }
          }
        });
        Aim.on('patch', ({id,name,value}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'PATCH',content:{id,name,value}}))));
        Aim.on('delete', ({id}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'DELETE',content:{id}}))));
        Aim.on('post', ({id,schemaName}) => Array.from(webSocketServer.clients).forEach(client => client.send(JSON.stringify({message_type:'POST',content:{id,schemaName}}))));
        // Aim.on('change', attr => {
        //   const data = JSON.stringify({attr});
        //   Array.from(clients)
        //   .filter(client => client.readyState === client.OPEN)
        //   .forEach(client => client.send(data));
        // });
        console.debug(`http server online`, port);
      }
      return aimServer;
    }}
    const Control = {emit,forEach,on,create(options){
      const {server,systemTimeoutMs,connectTimeoutMs,pollIntervalMs,attributeTypes} = options;
      const control = this;
      Object.assign(this, {
        attrSet,
        attrSetValue,
        items: options.items,
      });
      // const events = require('events');
      const types = {
        D: { title: "Digital", bitLength: 1 },
        Bool: { title: "Boolean", bitLength: 1 },
        SByte: { title: "Signed Byte", bitLength: 8, signed: 1 },
        UByte: { title: "Unsigned Byte", bitLength: 8 },
        SInt: { title: "Signed Integer", bitLength: 16, signed: 1 },
        UInt: { title: "Unsigned Integer", bitLength: 16, dec:0 },
        SDInt: { title: "Signed Double Integer", bitLength: 32, signed: 1 },
        UDInt: { title: "Unsigned Double Integer", bitLength: 32 },
        Float: { title: "Float", bitLength: 32, signed: 1, exponent: 8, dec: 2 },
        Double: { title: "Double", bitLength: 64, signed: 1, exponent: 11, dec: 2 },
      };
      const timers = {};
      const items = [];
      var setItems = [];

      function debug(s){
        console.debug(s);
        fs.appendFile("logger.log", `${new Date().toISOString()}: ${s}\n`, err => console.debug);
      }
      function exit(s){
        debug(s);
        process.exit();

      }
      function bitTo (typename, s) {
        var s = s.match(/.{1,16}/g).reverse().join('');
        var type = types[typename], arr = s.replace(/ /g, '').split(''), sign = type.signed ? (Number(arr.shift()) ? -1 : 1) : 1;
        if (!type.exponent) return parseInt(arr.join(''), 2) * sign;
        var mantissa = 0, exponent = parseInt(exp = arr.splice(0, type.exponent).join(''), 2) - (Math.pow(2, type.exponent - 1) - 1);
        arr.unshift(1);
        arr.forEach(function (val, i) { if (Number(val)) mantissa += Math.pow(2, -i); });
        return sign * mantissa * Math.pow(2, exponent);
      };
      function getSqlParams (object) {
        var params = [];
        for (var property in object) {
          params.push('@' + property + "='" + String(object[property]).replace(/'/g, "''") + "'");
        }
        return params.join(',');
      };

      function attrSet(attribute, propertyName, value) {
        const {name,path} = attribute;
        if (attribute[propertyName] !== value) {
          attribute[propertyName] = value;
          console.debug([path,name,propertyName].filter(Boolean).join('.'), '=', value);
          control.emit('change', attribute);
        }
      }
      function attrSetValue(attribute, newvalue, path = []) {
        if (attribute) {
          let {maxEngValue,minEngValue,maxRawValue,minRawValue,low,high,eq,ne,hysteresis,name,value,id,parent,title,attributeType,children} = attribute || {};
          low = Number(low || 0);
          high = Number(high || 0);
          value = Number(value || 0);
          hysteresis = Number(hysteresis || 0);
          function has(name) {
            return (name in attribute) && attribute[name] !== null;
          }
          // Valideer waarde
          if (!isNaN(newvalue)) {
            newvalue = Number(newvalue || 0);
            // // Validate newvalue
            // let quality = "Valid";
            // if (has('min') && has('max') && (attribute.min > newvalue || attribute.max < newvalue)) {
            //   console.error('NotValid', id, attributeName, newvalue);
            //   return attrSet(attribute, 'quality', "NotValid");
            // }

            // Omrekenen raw newvalue naar newvalue
            if (has('maxEngValue') && has('minEngValue') && has('maxRawValue') && has('minRawValue')) {
              newvalue = Math.round(((Number(maxEngValue) - Number(minEngValue)) / (Number(maxRawValue) - Number(minRawValue)) * (newvalue - Number(minRawValue)) + Number(minEngValue)) * 100) / 100;
            }
            // Binnenkomende waarde bewaren voor enum text
            if (has('ne')) {
              attribute.displayValue = newvalue;
            }
            // Low high
            if (has('Low') && has('high') && high <= low) {
              if (newvalue >= high && newvalue <= low) {
                newvalue = 1;
              } else if (newvalue <= high || newvalue >= low) {
                newvalue = 0;
              }
            } else if (has('low')) {
              if (newvalue <= low) {
                newvalue = 1;
              } else if (newvalue >= low) {
                newvalue = 0;
              }
            } else if (has('high')) {
              if (newvalue >= high) {
                newvalue = 1;
              } else if (newvalue <= high) {
                newvalue = 0;
              }
            }
            if (has('eq')) {
              newvalue = newvalue == eq ? 1 : 0;
            }
            if (has('ne')) {
              newvalue = newvalue != ne ? 1 : 0;
            }
            // Hysteresis
            if (newvalue < value - hysteresis || newvalue > value + hysteresis || !('value' in attribute)) {
              if (id) {
                name = path.concat(name).join('.');
                // console.debug(attribute.id, attribute.parent, name, newvalue);
                attribute.modifiedDT = new Date().toISOString();
                attrSet(attribute, 'value', newvalue);
                if (server.query) {
                  server.query(`INSERT attr(id,name,value,parent,title,attributeType) VALUES('${[
                    id,
                    name,
                    value,
                    parent,
                    title,
                    attributeType,
                  ].join("','")}')`).catch(err => console.error('attrSetValue', err));
                }
                control.emit('changeValue', attribute);
              }
              (children||[]).forEach(child => attrSetValue(child, newvalue, path.concat(name)));
            }

            // // OnlineHours
            // if (attribute.Calc == 'OnlineHours') {
            //   //console.debug('OnlineHours event',item.title, item.Value);
            //   attribute.deltaTimeS = 3600;
            //   (attribute.OnlineHours = function () {
            //     clearTimeout(timers[attribute.id]);
            //     var master = items[this.masterID];
            //     var masterOn = Number(master.Value);
            //     //masterOn = 1; // MKA
            //     //console.debug('OnlineHours', masterOn, this.masterStart);
            //     if (this.masterStart) {
            //       attr(this.id, 'Value', Number(this.Value || 0) + ((new Date().valueOf() - this.masterStart.valueOf()) / 1000 / 3600), true);
            //     }
            //     this.masterStart = masterOn ? new Date() : null;
            //     if (masterOn) {
            //       timers[this.id] = setTimeout(this.OnlineHours.bind(this), this.deltaTimeS * 1000);
            //     }
            //   }).call(item);
            //   return;
            // }
          }
        }
      }
      function initControlEquipment(items) {
        function itemSetState(item, state){
          attrSet(item, 'state', state);
          (item.children||[]).filter(Boolean).forEach(child => itemSetState(child, state));
        }
        function initAttributes(item) {
          const attributes = [];
          let parent;
          let parentItem;
          (function addChildren(item) {
            if (item) {
              attributes.push(item);
              (item.children||[]).forEach(child => addChildren(child));
            }
          })(item, []);
          return attributes;
        }
        const modbusDevices = items.filter(item => item.device === 'MODBUS' && item.host);
        const snmpDevices = items.filter(item => item.device === 'SNMP' && item.host);
        // console.debug(modbusDevices);
        // console.debug(snmpDevices);
        if (modbusDevices) {
          const net = require('net');
          const jsmodbus = require('jsmodbus');
          modbusDevices.forEach((item,i) => {
            let {host,port,readAddress,children,pollInterval,state} = item;
            let readTimeout;
            let connectTimeout;
            const attributes = initAttributes(item);
            const socket = new net.Socket();
            const client = new jsmodbus.client.TCP(socket, i + 1);
            function setSate(state){
              attributes.forEach(attr => attrSet(attr, 'state', state));
            }
            function connect() {
              setSate('connecting');
              socket.connect({ host, port: port || 502 }); // port 502 default
            }
            socket.on('connect', async e => {
              setSate('connected');
              console.debug('MODBUS', host, 'CONNECTED');
              // console.debug(client);
              await client.writeSingleRegister(8010, 0).then((resp) => {
                console.debug('out',{resp});
                // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
              }).catch(err => {
                console.debug('out_err',{err});
              });

              setInterval(async e=>{
                await client.readInputRegisters(8000, 1).then(resp => {
                  console.debug('in',resp.response._body._valuesAsArray);
                  // console.debug(1,{resp, err});
                  // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
                }).catch(err => {
                  console.debug(2,{err});
                });


              },500)
              return;
              // await client.writeSingleCoil(0, true).then((resp) => {
              //   console.debug('out',{resp});
              //   // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
              // }).catch(err => {
              //   console.debug('out_err',{err});
              // });
              // return;
              //
              return;

              // setInterval(async e => {
              //   console.debug(0);
              //   await client.readInputRegisters(0, 1, resp => {
              //     console.debug(3,resp.response._body._valuesAsArray);
              //     // console.debug(1,{resp, err});
              //     // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
              //   }).catch(err => {
              //     console.debug(2,{err});
              //   });
              //   console.debug(3);
              //
              // }, 1000);
              // return;
              // // client.writeSingleRegister(8009, 0, function (resp, err) {
              // //   console.debug({resp, err});
              // //   // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
              // // }).catch(err => {
              // //   console.debug(err);
              // // });
              // return;
              //

              (async function readData() {
                let readAddress = item.readAddress || 0;
                for (let device of children) {
                  if (device) {
                    const {id,name,attributeType,children} = device;
                    readAddress = device.readAddress || readAddress;
                    device.type = device.type || 'UInt';
                    const bitPos = device.bitPos || 0;
                    const type = types[device.type];
                    const bitLength = type.bitLength;
                    var readLength = Math.ceil(bitLength/16);
                    readAddress=0;
                    readLength=1;
                    console.debug({readAddress, readLength});
                    await client.readInputRegisters(readAddress, readLength).then(resp => {
                      const byteArray = resp.response._body._valuesAsArray;
                      const bitString = byteArray.reverse().map(b => ('0000000000000000' + b.toString(2)).substr(-16)).join('');
                      const bitArray = bitString.split('').reverse();
                      const childBitString = bitString.substr(bitString.length - bitLength - bitPos, bitLength);
                      let readValue = bitTo(device.type, device.bitString = bitString.substr(bitString.length - bitLength - bitPos, bitLength));
                      if (id,name,attributeType) {
                        if (type.dec) readValue = Math.round ( readValue * 10**type.dec ) / 10**type.dec || 0;
                        attrSetValue(device, readValue);
                      }
                      (children||[]).filter(Boolean).forEach((child,i) => {
                        // console.debug('aaa', item.host, device.readAddress, device.readAddress, child.type, readValue, byteArray, readAddress, readLength);
                        switch(child.type) {
                          case 'UInt': return attrSetValue(child, readValue);
                          case 'Bool': return attrSetValue(child, bitArray[i]);
                        }
                      })
                    }, err => {
                      console.debug('modbus read error', host, err);
                      attributes.forEach(attr => attrSet(attr, 'state', 'error'));
                      clearTimeout(readTimeout);
                      clearTimeout(connectTimeout);
                      connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
                    })
                  }
                  readAddress++;
                }
                clearTimeout(readTimeout);
                readTimeout = setTimeout(readData, pollInterval || pollIntervalMs || 500);
              })();
            }).on('disconnect', e => {
              console.error('modbus disconnect', host);
              setSate('disconnect');
              clearTimeout(readTimeout);
              clearTimeout(connectTimeout);
              connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
            }).on('error', e => {
              console.error('modbus error', state, host);
              setSate('error');
              clearTimeout(readTimeout);
              clearTimeout(connectTimeout);
              connectTimeout = setTimeout(connect, connectTimeoutMs || 20000);
            });
            connect();
          });
        }
        if (snmpDevices) {
          const snmpNative = require('snmp-native');
          snmpDevices.forEach(item => {
            let {pollInterval,children,host,community} = item;
            let readTimeout;
            let connectTimeout;
            if (children) {
              children = children.filter(Boolean);
              const session = new snmpNative.Session({ host, community:community || 'public' });
              const oids = children.map(child => child.oid.split(".").map(Number));
              itemSetState(item, 'connecting');
              // console.debug(oids);
              (function read() {
                session.getAll({ oids }, (err, varbinds) => {
                  if (!varbinds.length) {
                    itemSetState(item, 'error');
                    clearTimeout(readTimeout);
                    clearTimeout(connectTimeout);
                    connectTimeout = setTimeout(() => {
                      itemSetState(item, 'connecting');
                      read();
                    }, 5000);
                  } else {
                    itemSetState(item, 'connected');
                    children.forEach((child,i) => attrSetValue(child, varbinds[i] && varbinds[i].value));
                    clearTimeout(readTimeout);
                    readTimeout = setTimeout(read, pollInterval || pollIntervalMs || 500);
                  }
                })
              })();
            }
          });
        }
      }

      if (server.query) {
        server.query(
          `IF OBJECT_ID('attr') IS NULL
          BEGIN
          CREATE TABLE [attr](
            [ts] [timestamp] NULL,
            [id] [bigint] NULL,
            [name] [varchar](50) NULL,
            [value] [varchar](max) NULL,
            [modifiedDateTime] [datetime] NULL,
            [parent] [varchar](500) NULL,
            [attributeType] [varchar](50) NULL,
            [title] [varchar](500) NULL
          ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
          END`
        );
      }
      systemAttributes = {
        MEMORY_USED_SPACE(item) {
          const osUtils = require('os-utils');
          (function memoryUsedSpace() {
            attrSetValue(item, Math.round(100 - osUtils.freememPercentage() * 100));
            setTimeout(memoryUsedSpace, systemTimeoutMs);
          })();
        },
        HDD_USED_SPACE(item) {
          const checkDiskSpace = require('check-disk-space').default;
          (function hddUsedSpace() {
            checkDiskSpace('C:/').then(diskSpace => attrSetValue(item, Math.round((diskSpace.size - diskSpace.free) / diskSpace.size * 100)));
            setTimeout(hddUsedSpace, systemTimeoutMs);
          })();
        },
        // TIME_SYNC(item) {
        //   const nodeCmd = require('node-cmd');
        //   (function timeSync() {
        //     nodeCmd.get('w32tm /query /status', (err, data, stderr) => {
        //       if (!err) {
        //         attrSet(item, 'state', 'connected');
        //         const [s,value] = data.match(/Leap Indicator: (\d)/) || [];
        //         return attrSetValue(item, value === '0' ? 0 : 1);
        //       } else {
        //         attrSet(item, 'state', 'disconnected');
        //         console.error(err);
        //       }
        //       attrSetValue(item, 1);
        //     });
        //     setTimeout(timeSync, systemTimeoutMs);
        //   })();
        // },
        // WATCHDOG_ACSM(item) {
        //   let acsmCount = 0;
        //   (function watchdogAcsm() {
        //     attrSetValue(item, acsmCount = acsmCount >= 100 ? 1 : acsmCount+1);
        //     setTimeout(watchdogAcsm, systemTimeoutMs);
        //   })();
        // },
      };
      (function addChildren(children,path=[]){
        Array.from(children).forEach(item => {
          if (item) {
            const {name,children,enumeration} = item;
            item.path = path.filter(Boolean).join('.');
            if (systemAttributes[name]) {
              systemAttributes[name](item);
            }
            if (enumeration) {
              item.enum = enumeration.replace(/, /g,',').split(',');
            }
            items.push(item);
            addChildren(children||[],path.concat(name));
          }
        });
      })(options.items);
      initControlEquipment(items);
      Aim.paths({
        '/api/config': {
          get: {
            operation: end => end(200, JSON.stringify({items: options.items,attributeTypes}), { 'Content-Type': 'application/json' }),
          },
        },
      });
      return control;
    }}
    async function init(publicConfig = {}) {
      console.debug(process.mainModule.path);
      // const serverConfigFilename = process.mainModule.path + `/config/.config.server.json`;
      const {serverConfigFilename} = publicConfig;
      if (serverConfigFilename) {
        Aim.mkdir(process.mainModule.path + '/config');
        Aim.mkdir(process.mainModule.path + '/public');
        function prompt(question){
          return new Promise ( (succes,fail) => {
            const readline = require('readline');
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            rl.question(question, function (value) {
              rl.close();
              succes(value);
            });
          });
        }
        if (!fs.existsSync(serverConfigFilename)) {
          const config = {
            info: {
              title: await prompt('Whats your title ? '),
              contact: {
                email: await prompt('Whats your email ? '),
              }
            },
            serviceRoot: await prompt('serviceRoot ? '),
          };

          //         rl.question('What is your email ? ', function (email) {
          //   // rl.question('Where do you live ? ', function (country) {
          //     // console.debug(`${name}, is a citizen of ${country}`);
          //   // });
          // });
          // rl.question('What is your name ? ', function (name) {
          //   // rl.question('Where do you live ? ', function (country) {
          //     // console.debug(`${name}, is a citizen of ${country}`);
          //   // });
          // });
          // rl.close();

          // rl.on('close', function () {
          //   console.debug('\nBYE BYE !!!');
          //   process.exit(0);
          // });
        }
        // Aim.mkdir(process.mainModule.path + '/config/client');
        // Aim.mkdir(process.mainModule.path + '/public/config');
        var {email,client_id} = config;
        config({client_id,info:{contact:{email}}});
        config(publicConfig);
        var {serviceRoot,client_id} = config;
        try {
          if (serviceRoot) {
            // var serverConfig = fs.existsSync(serverConfigFilename) ? require(serverConfigFilename) : {};
            // console.debug(222, serviceRoot);
            var clientYaml = '';
            clientYaml += this.readFile(process.mainModule.path + `/config/config.server.yaml`);
            clientYaml += this.readFile(process.mainModule.path + `/config/.config.server.yaml`);
            config({clientYaml});
            // var serverConfig = await Aim.fetch(serviceRoot + '/config').body({clientYaml}).post();
            // console.debug(config);
            // console.debug(1232);
            var serverConfig = await Aim.fetch(serviceRoot + '/config').body(config).post();
            // console.debug(1233);
            fs.writeFileSync(serverConfigFilename, JSON.stringify(serverConfig,null,2));
            if (client_id) {
              var clientYaml = '';
              clientYaml += this.readFile(process.mainModule.path + `/config/config.${client_id}.yaml`);
              clientYaml += this.readFile(process.mainModule.path + `/config/.config.${client_id}.yaml`);
              publicConfig = await Aim.fetch(serviceRoot + '/config').body({clientYaml}).post();
              fs.writeFileSync(this.publicConfigJson = process.mainModule.path + `/config/.config.${client_id}.json`, JSON.stringify(serverConfig,null,2));
            }
          }
          config(require(serverConfigFilename));
          if (client_id) {
            config(publicConfig = require(this.publicConfigJson = process.mainModule.path + `/config/.config.${client_id}.json`));
          }

          var {serviceRoot,client_id,offline} = Aim.config;


          // console.debug('config', Object(Aim.config));

          this.start();

        } catch(err) {
          // console.error(err.error.message);
          console.error(err);
        }

      } else {
        config(publicConfig);
        this.start();
      }
      return Aim;
    }
    return Object.assign(Aim, {
      Server,
      Control,
      readFile(filename, param = 'utf-8') {
        if (fs.existsSync(filename)) {
          return String(fs.readFileSync(filename, param));
        }
        return '';
      },
      configAddFile(filename){
        if (fs.existsSync(filename)) {
          Aim.config(require(filename));
        }
      },
      mkdir(dir) {
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
      },
      start(){
        const {config} = Aim;
        var {client_id,server} = config;
        if (server) {
          if (server.http) {
            Aim.mkdir(process.mainModule.path + '/public');
            var filename = process.mainModule.path + '/public/index.html';
            var filename404 = process.mainModule.path + '/public/404.html';
            if (!fs.existsSync(filename) && !fs.existsSync(filename404)) {
              fs.writeFileSync(filename,'Hello world');
            }
          }
          Aim.server = Aim.Server.create(server);
          const {items,attributeTypes,systemTimeoutMs,connectTimeoutMs,pollIntervalMs} = Aim.config;
          if (items) {
            items.forEach(Item.get);
            Aim.control = Aim.Control.create({server:Aim.server,items,attributeTypes,systemTimeoutMs,connectTimeoutMs,pollIntervalMs});
            Aim.on('message', event => {
              const {data,target} = event;
              let {message_type,content,to,from} = data;
              console.debug(333,{message_type,content,to,client_id,from});
              if (to === client_id) {
                switch(message_type){
                  case 'REQUEST_DATA':{
                    target.send(JSON.stringify({message_type:'DATA',content:{items,attributeTypes},to:from}));
                  }
                }
              }
            });

            process.stdin.resume();
            const exitHandler = (options, exitCode) => {
              const publicConfig = JSON.parse(fs.readFileSync(this.publicConfigJson));
              publicConfig.items = Array.from(Item.items.values()).map(item => item.data);
              // fs.writeFileSync(this.publicConfigJson,JSON.stringify(publicConfig,null,2));
              if (options.cleanup) console.debug('clean');
              if (exitCode || exitCode === 0) console.debug(exitCode);
              if (options.exit) process.exit();
            }
            // do something when app is closing
            process.on('exit', exitHandler.bind(null,{cleanup:true}));
            // catches ctrl+c event
            process.on('SIGINT', exitHandler.bind(null, {exit:true}));
            // catches "kill pid" (for example: nodemon restart)
            process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
            process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
            // catches uncaught exceptions
            process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
          }
        }
        process.title = config.name;
        return this;
      },
      init,
      localStorage: {
        setItem(selector, content){
          localStorage[selector] = content;
          console.debug('localStorage', selector, content, storageFileName);
          fs.writeFile(storageFileName, JSON.stringify(localStorage), err => err ? console.error(err) : null);
        },
        getItem(selector){
          return localStorage[selector];
        },
      },
      sessionStorage: {
        setItem(selector, content){
          sessionStorage[selector] = content;
        },
        getItem(selector){
          return sessionStorage[selector];
        },
      },
    });

  }
}));

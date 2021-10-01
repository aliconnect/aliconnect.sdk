(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self,
  global.markdownit = factory());
})(this, (function() {
  function MarkdownIt() {
    if (!(this instanceof MarkdownIt)) {
      return new MarkdownIt();
    }
  }
  Object.defineProperties(MarkdownIt.prototype, {
    isImg: { value: function (src) {
      return src.match(/jpg|png|bmp|jpeg|gif|bin/i)
    }},
    isImgSrc: { value: function (src) {
      if (src) for (var i = 0, ext; ext = ['.jpg', '.png', '.bmp', '.jpeg', '.gif', '.bin'][i]; i++) if (src.toLowerCase().indexOf(ext) != -1) return true;
      return false;
    }},
    render: { value: function render(s) {
      function code(s, type) {
        const highlight = {
          html(s) {
            return s.replace(/(.*?)(&lt;\!--.*?--&gt;|$)/gs, (s,codeString,cmt) => {
              return codeString
              .replace(/&lt;(.*?)&gt;/g, (s,p1) => `&lt;${
                replaceOutsideQuotes(
                  p1.replace(/(\w+)/,'<span class=hl-name>$1</span>')
                  , s => {
                    return s.replace(/ (\w+)(?![^<]*>|[^<>]*<\/)/g,' <span class=hl-attr>$1</span>')
                  }
                )
              }&gt;`) + (cmt ? `<span class=hl-comment>${cmt}</span>` : '')
            })
          },
          js(s) {
            // console.error(s);
            return s
            .replace(/(.*?)(\/\/.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
              return replaceOutsideQuotes(
                codeString, codeString => codeString.replace(
                  /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
                  '<span class=hl-res>$1</span>'
                )
                .replace(
                  /\b(Array|Date|eval|function|hasOwnProperty|Infinity|isFinite|isNaN|isPrototypeOf|length|Math|NaN|name|Number|Object|prototype|String|toString|undefined|valueOf)\b/g,
                  '<span class=hl-methods>$1</span>'
                )
                .replace(
                  /\b(alert|all|anchor|anchors|area|assign|blur|button|checkbox|clearInterval|clearTimeout|clientInformation|close|closed|confirm|constructor|crypto|decodeURI|decodeURIComponent|defaultStatus|document|element|elements|embed|embeds|encodeURI|encodeURIComponent|escape|e|fileUpload|focus|form|forms|frame|innerHeight|innerWidth|layer|layers|link|location|mimeTypes|navigate|navigator|frames|frameRate|hidden|history|image|images|offscreenBuffering|open|opener|option|outerHeight|outerWidth|packages|pageXOffset|pageYOffset|parent|parseFloat|parseInt|password|pkcs11|plugin|prompt|propertyIsEnum|radio|reset|screenX|screenY|scroll|secure|select|self|setInterval|setTimeout|status|submit|taint|text|textarea|top|unescape|untaint)\b/g,
                  '<span class=hl-prop>$1</span>'
                )
                .replace(
                  /\b(onblur|onclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onmouseover|onload|onmouseup|onmousedown|onsubmit)\b/g,
                  '<span class=hl-events>$1</span>'
                )
                .replace(/(\w+)(\s*\()/g, '<span class="hl-fn">$1</span>$2')
                .replace(/\.(\w+)/g, '.<span class="hl-attr">$1</span>')
                .replace(/\b([A-Z]\w+)\./g, '<span class="hl-obj">$1</span>.')
                .replace(/\b(\w+)\./g, '<span class="hl-attr">$1</span>.')
                .replace(/\b(\d+)\b/g, '<span class="hl-nr">$1</span>')
              ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
          javascript(s) {
            return this.js(s);
          },
          css(s) {
            return s.replace(/(.*?)(\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
              return replaceOutsideQuotes(
                codeString, codeString => codeString
                .replace(/\.(.*)\b/g, '.<span class="hl-obj">$1</span>')
              ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
          json(s) {
            return s
            .replace(/"(.*?)":/g, '"<span class="hl-fn">$1</span>":')
            .replace(/(:\s*)"(.*?)"/g, '$1"<span class="hl-string">$2</span>"')
          },
          yaml(s) {
            return s.replace(/(.*?)(#.*?\n|$)/gs, (s,codeString,cmt) => {
              return codeString
              .replace(/^(?=\s*)(.+?):/gm, '<span class="hl-fn">$1</span>:')
              .replace(/: (.*?)$/gm, ': <span class="hl-string">$1</span>')
              + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
          php(s) {
            return s.replace(/(.*?)(\/\/.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
              return replaceOutsideQuotes(
                codeString, codeString => codeString.replace(
                  /\b(class|abstract|arguments|await|boolean|break|byte|case|catch|char|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|abstract|boolean|byte|char|double|final|float|goto|int|long|native|short|synchronized|throws|transient|volatile)\b(?![^<]*>|[^<>]*<\/)/gi,
                  '<span class=hl-res>$1</span>'
                )
              ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
          sql(s) {
            return s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
              return replaceOutsideQuotes(
                codeString, codeString => codeString.replace(
                  /\b(ADD|ADD CONSTRAINT|ALTER|ALTER COLUMN|ALTER TABLE|ALL|AND|ANY|AS|ASC|BACKUP DATABASE|BETWEEN|CASE|CHECK|COLUMN|CONSTRAINT|CREATE|CREATE DATABASE|CREATE INDEX|CREATE OR REPLACE VIEW|CREATE TABLE|CREATE PROCEDURE|CREATE UNIQUE INDEX|CREATE VIEW|DATABASE|DEFAULT|DELETE|DESC|DISTINCT|DROP|DROP COLUMN|DROP CONSTRAINT|DROP DATABASE|DROP DEFAULT|DROP INDEX|DROP TABLE|DROP VIEW|EXEC|EXISTS|FOREIGN KEY|FROM|FULL OUTER JOIN|GROUP BY|HAVING|IN|INDEX|INNER JOIN|INSERT INTO|INSERT|IS NULL|IS NOT NULL|JOIN|LEFT JOIN|LIKE|LIMIT|NOT|NOT NULL|OR|ORDER BY|OUTER JOIN|PRIMARY KEY|PROCEDURE|RIGHT JOIN|ROWNUM|SELECT|SELECT DISTINCT|SELECT INTO|SELECT TOP|SET|TABLE|TOP|TRUNCATE TABLE|UNION|UNION ALL|UNIQUE|UPDATE|VALUES|VIEW|WHERE)\b/gi,
                  '<span class=hl-res>$1</span>'
                )
              ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
          st(s) {
            return s.replace(/(.*?)(--.*?\n|\/\*.*?\*\/|$)/gs, (s,codeString,cmt) => {
              return replaceOutsideQuotes(
                codeString, codeString => codeString.replace(
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
                )
              ) + (cmt ? `<span class=hl-cmt>${cmt}</span>` : '')
            })
          },
        }
        s = s || '';
        const ident = (s.match(/^ +/)||[''])[0].length;
        // console.log(s);
        s = s.split(/\n/).map(s => s.slice(ident)).join('\n').trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/=/g, '&equals;')
        .replace(/\t/g, '  ')
        .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>')
        // .replace(/"/g, '&quot;')
        // .replace(/'/g, '&apos;')
        if (highlight[type]) {
          return highlight[type](s);
        }
        return s;
      }


      let identList = [];
      let identOptions = null;
      let html = [];
      function istr(ident) {
        return '                '.slice(0,ident);
      }
      const lines = [];
      const arr = !s ? '' : s
      .replace(/\r/gs ,'')
      .split(/\n/);

      let tag = '';
      function setTag (p, par = '') {
        if (tag) {
          lines.push(`</${tag}>`);
        }
        if (p) {
          lines.push(`<${(p + ' ' + par).trim()}>`);
        }
        tag = p;
      }

      for (var i=0;i<arr.length;i++) {
        s = arr[i];
        if (s || i === arr.length - 1 ) {
          const lineIdent = (s.match(/^ +/)||[''])[0].length;
          const match = s.trim().match(/^(\*|-|\d+\.) /);
          (function unident() {
            identOptions = identList[0];
            if (identOptions) {
              if (lineIdent < identOptions.ident || (lineIdent === identOptions.ident && !match)) {
                setTag();
                lines.push(`</li></${identOptions.tag}>`);
                identList.shift();
                unident();
              } else if (identOptions.ident === lineIdent) {
                setTag();
                lines.push('</li>');
              }
            }
          })()

          if (s.match(/```/)) {
            setTag();
            var codeLines = [];
            for (i++; i<arr.length; i++) {
              if (arr[i].match(/```/)) {
                let type = '';
                // codeLines = code(codeLines.join('\n'));
                lines.push(
                  s.replace(/```/, '<pre><code>')
                  .replace(/<pre><code>(\w+)/, (s,p1) => `<div class="code-header row" language="${type = p1.toLowerCase()}"><span class="aco">${p1}</span></div><pre><code language="${p1.toLowerCase()}">`)
                  + code(codeLines.join('\n'), type)
                  + '</code></pre>'
                );
                break;
              }
              codeLines.push(arr[i]);
            }
            continue;
          }
          if (s.match(/.*? \| .*?/)) {
            setTag();
            lines.push(`<TABLE><THEAD><TR><TH>${s.replace(/ \| /g, '</TH><TH>')}</TR></TH></THEAD><TBODY>`);
            for (i = i+2; i<arr.length; i++) {
              if (arr[i].match(/.*? \| .*?/)) {
                lines.push(`<TR><TD>${s.replace(/ \| /g, '</TD><TD>')}</TR></TD>`);
              } else {
                break;
              }
            }
            lines.push('</TBODY></TABLE>');
            continue;
          }
          s = s
          .replace(/`(.+?)`/g, (s, p1) => `<CODE>${p1
            .replace(/~/gs, '&#126;')
            .replace(/\^/gs, '&#94;')
            .replace(/\*/gs, '&#42;')
            .replace(/_/gs, '&#95;')
            .replace(/</gs, '&lt;')
            .replace(/>/gs, '&gt;')
          }</CODE>`)
          .replace(/\*\*(.+?)\*\*/g, '<B>$1</B>')
          .replace(/\*(.*?)\*/g, '<I>$1</I>')
          .replace(/__(.*?)__/g, '<B>$1</B>')
          .replace(/_(.*?)_/g, '<I>$1</I>')
          .replace(/~~(.*?)~~/g, '<DEL>$1</DEL>')
          .replace(/~(.*?)~/g, '<U>$1</U>')
          .replace(/\^\^(.*?)\^\^/g, '<MARK>$1</MARK>')
          // .replace(/`(.+?)`/g, (s, p1) => `<CODE>${$.string.code(p1)}</CODE>`)
          .trim();
          if (match) {
            setTag();
            if (!identOptions || identOptions.ident < lineIdent) {
              identOptions = {ident: lineIdent, tag: s.trim().match(/^(\*|-) /) ? 'ul' : 'ol'};
              identList.unshift(identOptions);
              lines.push(`<${identOptions.tag}>`);
            }
            s = s.replace(/^\s*(\*|-|\d+\.) /, '<li>')
          } else if (s.match(/^#/)) {
            setTag();
            s = s
            .replace(/^# (.*?)$/gm, '<H1>$1</H1>')
            .replace(/^## (.*?)$/gm, '<H2>$1</H2>')
            .replace(/^### (.*?)$/gm, '<H3>$1</H3>')
            .replace(/^#### (.*?)$/gm, '<H4>$1</H4>')
            .replace(/^##### (.*?)$/gm, '<H5>$1</H5>')
            .replace(/^###### (.*?)$/gm, '<H6>$1</H6>')
            .replace(/^####### (.*?)$/gm, '<H7>$1</H7>')
          } else if (s.match(/^> /)) {
            if (tag !== 'BLOCKQUOTE') {
              s = s.replace(/^> (\[\!(\w+)\]|)/, (s, p1, type) => setTag('BLOCKQUOTE', type ? `class=${type.toLowerCase()}` : '') || '')
            }
            s = s.replace(/^> /,'')
          } else if (!arr[i-1]) {
            setTag('P');
          } else if (tag !== 'P') {
            setTag('P');
          }
          s = s
          .trim()
          .replace(/  $/gm, '<BR >')
          .replace(/\[ \]/, '&#9744;')
          .replace(/\[v\]/, '&#9745;')
          .replace(/\[x\]/, '&#9745;')
          .replace(/\!\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<IMG src="$2" alt="$1">')
          .replace(/\[(.*?)\]\((.*?)\)(?=(?:(?:[^`]*`){2})*[^`]*$)/g, '<A href="$2">$1</A>')
          .replace(/:::(\w+)(.*?):::/gs, '<PRE><$1$2></$1></PRE>')
        } else {
          setTag();
        }
        lines.push(s);
      }
      setTag();
      s = lines
      .join('\n')
      ;

      //.split(/\n\n/).map(s => s.trim()).map(s => s ? `<p>${s}</p>` : s).join('\n');
      // console.log(s);
      return s;
    }},
  });
  return MarkdownIt;
}));
console.error(window.markdownit());

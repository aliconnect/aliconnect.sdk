function Doc(){}
Doc.prototype = {
  extend(index){
    $.extend.call(this.index, index);
  },
  index: {},
  json(){
    function comp (a,b){
      return a[0].charCodeAt(0) > b[0].charCodeAt(0) ? 1 : (
        a[0].charCodeAt(0) < b[0].charCodeAt(0) ? -1 : a[0].localeCompare(b[0])
      );
    }
    const mydocs = {
      prototype: $.prototype
    };
    const doc = (function recursive (obj){
      const entries = [];
      Object.keys(obj).forEach(key => {
        // const val = {};
        let descriptor = Object.getOwnPropertyDescriptor(obj, key) || {};
        // descriptor.name = key;
        entries.push([key, descriptor]);
        if (descriptor.set){
          descriptor.set = String(descriptor.set);
        }
        if (descriptor.get){
          descriptor.get = String(descriptor.get);
        }
        if (String(descriptor.value) === '[object Object]'){
          // delete descriptor.value;
        }
        delete descriptor.value;
        if (['access_token','nonce','refresh_token','client_secret','api_key','api-key','x-api-key'].includes(key)){
          delete descriptor.value;
        }
        if (key.includes('token') || key.includes('secret') || key.includes('key')){
          delete descriptor.value;
        }
        delete descriptor.writable;
        delete descriptor.enumerable;
        delete descriptor.configurable;
        // descriptor = Object.assign(descriptor, {
        // 	name: key,
        // }, descriptor);
        // return;
        // let item = {
        // 	__descriptor: descriptor,
        // };
        // doc[key] = item;
        if (!descriptor.get){
          let type = descriptor.type = Array.isArray(obj[key]) ? 'array' : typeof obj[key];
          if (type === 'function'){
            descriptor.type = 'method';
            var code = String(obj[key]).replace(/\t/gs,'  ').replace(/\r/gs,'');
            var content = String(code).split(/\n/);
            content.shift();
            content.pop();
            var ident = content.filter(line => line.trim());
            if (ident.length){
              // console.debug(content, code);
              var ident = ident[0].search(/\S/);
              content = content.map(line => line.substr(ident));
              content = content.map(line => line.replace(/\/\/.*/,''));
              content = content.filter(line => line.trim());
              descriptor.code = content.join('\n');
            }
            // console.debug(code, content);
            if (obj[key].prototype){
              descriptor.type = 'constructor';
            }
            var value = arguments.callee(obj[key]);
            if (value){
              descriptor.value = value;
            }
            if (obj[key].prototype){
              descriptor.constructor = true;
              var value = arguments.callee(obj[key].prototype);
              if (value){
                descriptor.prototype = value;
              }
            }
            // if (obj[key].prototype instanceof Object){
            // }
            // doc[key] = Object.keys(item).sort().reduce((r, k) => (r[k] = item[k], r), {});
          } else {
            if (obj[key] instanceof Object){
              var value = arguments.callee(obj[key]);
              if (value){
                descriptor.value = value;
              }
            }
            // doc[key] = Object.keys(item).sort().reduce((r, k) => (r[k] = item[k], r), {});
          }
        }
      });
      // for (let key in obj){
      // 	let val;
      // 	if (typeof obj[key] === 'function'){
      // 		val = {
      // 			type: key[0] === key[0].toUpperCase() ? 'constructor' : 'method',
      // 		}
      // 		if (obj[key].prototype){
      // 			val.prototype = recursive(obj[key].prototype);
      // 		}
      // 		val.sub = recursive(obj[key]);
      // 	} else {
      // 		val = Object.getOwnPropertyDescriptor(obj, key);
      // 		if (val){
      // 			// val.type = String(val.value);
      // 			if (Array.isArray(val.value)){
      // 				val.type = 'array';
      // 			} else {
      // 				val.type = typeof val.value;
      // 				console.debug(val.value);
      // 				if (val.value){
      // 					val.value = recursive(val.value);
      // 				}
      // 				// if (String(val.value) === '[object Object]'){
      // 				// }
      // 			}
      // 		} else {
      // 			val = {
      // 				value: String(val),
      // 			}
      // 		}
      // 	}
      // 	entries.push([key,val]);
      // 	continue;
      // 	// let val = obj[key];
      // 	// if (typeof val === 'function'){
      // 	// 	val = {
      // 	// 		type: key[0] === key[0].toUpperCase() ? 'constructor' : 'method',
      // 	// 	}
      // 	// 	if (obj[key].prototype){
      // 	// 		// Object.assign(obj, sortObject(val.prototype));
      // 	// 		val.prototype = recursive(obj[key].prototype);
      // 	// 	}
      // 	// } else if (Array.isArray(val)){
      // 	// } else if (val !== null && typeof val === 'object'){
      // 	// 	if (!seen.includes(val)){
      // 	// 		seen.push(val);
      // 	// 		if (val.get){
      // 	// 			val = {
      // 	// 				type: 'getter',
      // 	// 				subitems: val,
      // 	// 			}
      // 	// 		}
      // 	// 	} else {
      // 	// 		val = {
      // 	//
      // 	// 		}
      // 	// 	}
      // 	// 	// val = {
      // 	// 	//
      // 	// 	// };
      // 	// 	recursive(val);
      // 	// } else {
      // 	// 	val = {
      // 	// 		type: typeof val,
      // 	// 		// value: val,
      // 	// 	}
      // 	// }
      // 	// entries.push([key,val]);
      // }
      return entries.length ? Object.fromEntries(entries.sort(comp)) : null;
    })(mydocs);
    return JSON.stringify(doc);
    function sortObject(obj){
      arr = [];
      for (const name in obj){
        arr.push([name,obj[name]]);
      }
      return Object.fromEntries(Object.entries(obj).sort(comp));
    }
    return JSON.stringify(sortObject(docs), (key,val) => {
      if (typeof val === 'function'){
        var obj = {
          type: key[0] === key[0].toUpperCase() ? 'constructor' : 'method',
          // code: String(val),
        };
        if (val.prototype && Object.values(val.prototype).length){
          // Object.assign(obj, sortObject(val.prototype));
          obj.prototype = sortObject(val.prototype);
        }
        // if (val.prototype){
        // 	obj.methods = {};
        // 	for (var name in val.prototype){
        // 		obj.methods[name] = {};
        // 	}
        // }
        return obj;
      } else if (val instanceof Object){
        return sortObject(val);
        // } else {
        // 	return {
        // 		value: val;
        // 	}
      }
      return val;
    });
    // console.debug(docs, JSON.stringify(docs, val => typeof val === 'function' ? String(val) : val));
    // return JSON.stringify(docs, val => typeof val === 'function' ? String(val) : val);
  }
};

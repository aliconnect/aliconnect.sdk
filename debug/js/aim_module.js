'use strict';
(function webpackUniversalModuleDefinition(root, factory) {
  const moduleName = "aim";
  if(typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory();
  } else if(typeof define === 'function' && define.amd) {
    define([], factory);
  } else if(typeof exports === 'object') {
    exports[moduleName] = factory();
  } else {
    root[moduleName] = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  return (
    function(modules) {
    }
  )
});

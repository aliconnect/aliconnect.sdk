/**
  Last modified 2021-09-21 07:21:11 
*/
(function(){const aim=require('./public/js/aim');const fs=require('fs');let paths=[];(function addpath(module){if(module.parent)addpath(module.parent);paths.push(...module.paths.map(path=>path.replace(/node_modules$/,'public')))})(module);paths=paths.unique().filter(path=>fs.existsSync(path));module.exports=aim})()
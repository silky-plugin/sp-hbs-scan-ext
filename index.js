'use strict'
const _glob = require("glob");

const generateScriptTag = function(src) {
  src = src.replace(/(coffee)$/, 'js');
  return "<script src='" + src + "'></script>";
};

const generateStyleTag = function(href) {
  href = href.replace(/(less)$/, 'css');
  return "<link href='" + href + "' rel='stylesheet' type='text/css'>";
};

const generateTags = function(filePaths, root) {
  var cssReg, i, jsReg, len, queue, uri;
  if (root == null) {
    root = '/';
  }
  cssReg = /(\.css|\.less)$/;
  jsReg = /(\.js|\.coffee)$/;
  if (root !== '' && !/\/$/.test(root)) {
    root = root + "/";
  }
  queue = [];
  for (i = 0, len = filePaths.length; i < len; i++) {
    uri = filePaths[i];
    if (jsReg.test(uri)) {
      queue.push(generateScriptTag("" + root + uri));
    }
    if (cssReg.test(uri)) {
      queue.push(generateStyleTag("" + root + uri));
    }
  }
  return queue.join('\n');
};


function isEmpty(str){
    if (str === null || str === void 0) {
        return true;
    }
    str = str.toString();
    str = str.replace(/\s/g, '');
    return !str.length;
}

function getMatchFilesQueue(wildcard, cwd){
    let filePathQueue = wildcard.split(',');
    let queue = [];

    for (let i = 0, len = filePathQueue.length; i < len; i++) {
        let filePath = filePathQueue[i];
        if (!isEmpty(filePath)) {
            queue = queue.concat(_glob.sync(filePath, {
                cwd: cwd
            }));
        }
    }
    return queue
}

exports.registerPluginExt = function(cli, options){
  cli.registerExt("hbs:scan", (Handlebars)=>{
     Handlebars.registerHelper('scan', function(moduleName) {
        return new Handlebars.SafeString(generateTags(getMatchFilesQueue(moduleName, cli.cwd()), '/'))
     })
  })
}
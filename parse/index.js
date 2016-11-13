'use strict';
const parser = require('nunjucks/src/parser');
const ast = require('../ast');

const parseString = (str, opts) => {
  if (opts && opts.trim === true) {
    str = str.trim();
  }
  var node = ast.normalize(parser.parse(str));
  if (opts && opts.verbose) {
    node = ast.walk(node, n => {
      n.parent = n.parent ? n.parent.type : null
    });
  } else if (opts && opts.clean === true) {
    node = ast.clean(node);
  }
  return node;
};

const parseBuffer = (buffer, opts) => {
  return parseString(buffer.toString(), opts);
};

const parseFile = (filename, opts, done) => {
  fs.readFile(filename, (error, buffer) => {
    return error
      ? done(error)
      : done(null, parseBuffer(buffer, opts));
  });
};

module.exports = {
  string: parseString,
  buffer: parseBuffer,
  file: parseFile,
};

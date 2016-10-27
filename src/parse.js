'use strict';
const parser = require('nunjucks/src/parser');
const ast = require('./ast');

const parseString = str => {
  return ast.normalize(parser.parse(str));
};

const parseBuffer = buffer => {
  return parseString(buffer.toString());
};

const parseFile = (filename, done) => {
  fs.readFile(filename, (error, buffer) => {
    return error
      ? done(error)
      : done(null, parseBuffer(buffer));
  });
};

module.exports = {
  string: parseString,
  buffer: parseBuffer,
  file: parseFile,
};

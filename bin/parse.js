#!/usr/bin/env node
'use strict';

const concat = require('concat-stream');
const parse = require('../src/parse');

var format = node => JSON.stringify(node, null, '  ');

const args = process.argv.slice(2);

if (args[0] === '--format') {
  format = require('../src/format')();
  args.shift();
}

if (args.length) {
  args.forEach(filename => {
    parse.file(filename, (error, node) => {
      console.log(filename, '=>\n', format(ast));
    });
  });
} else {
  process.stdin.pipe(concat(buffer => {
    const node = parse.buffer(buffer);
    console.log(format(node));
  }));
}

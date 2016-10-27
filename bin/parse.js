#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const options = yargs
  .argv;
const args = options._;

const concat = require('concat-stream');
const parse = require('../parse');

var format = node => JSON.stringify(node, null, '  ');

if (options.format) {
  format = options.format === true
    ? require('../format')()
    : require('../format/' + options.format);
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

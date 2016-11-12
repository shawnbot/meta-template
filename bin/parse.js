#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const options = yargs
  .argv;
const args = options._;

const ast = require('../ast');
const concat = require('concat-stream');
const format = require('../format');
const parse = require('../parse');

var fmt = node => JSON.stringify(node, null, '  ');

if (options.format) {
  fmt = options.format === true
    ? format.defaultFormat
    : format.get(options.format);
}

if (args.length) {
  args.forEach(filename => {
    parse.file(filename, (error, node) => {
      if (!options.format) {
        node = ast.normalize(node);
      }
      console.log(filename, '=>\n', fmt(node));
    });
  });
} else {
  process.stdin.pipe(concat(buffer => {
    const node = parse.buffer(buffer);
    console.log(fmt(node));
  }));
}

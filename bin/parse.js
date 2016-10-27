#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const options = yargs
  .argv;
const args = options._;

const concat = require('concat-stream');
const parse = require('../parse');
const format = require('../format');

var fmt = node => JSON.stringify(node, null, '  ');

if (options.format) {
  fmt = options.format === true
    ? format.defaultFormat
    : format.get(options.format);
}

if (args.length) {
  args.forEach(filename => {
    parse.file(filename, (error, node) => {
      console.log(filename, '=>\n', fmt(ast));
    });
  });
} else {
  process.stdin.pipe(concat(buffer => {
    const node = parse.buffer(buffer);
    console.log(fmt(node));
  }));
}

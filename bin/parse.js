#!/usr/bin/env node
'use strict';

const yargs = require('yargs')
  .usage('$0 [options] [template.njk]')
  .describe('format', 'Set the output format (default: output AST as JSON)')
  .alias('f', 'format')
  .describe('trim', 'Trim whitespace from input')
  .alias('t', 'trim')
  .describe('verbose', 'Output verbose debugging info to stderr')
  .alias('v', 'verbose')
  .describe('clean', 'Remove line and column numbers from AST output')
  .alias('c', 'clean')
  .alias('h', 'help');

const options = yargs.argv;

if (options.help) {
  yargs.showHelp();
  const formats = [
    'AST (Abstract Syntax Tree, JSON, default)',
    'nunjucks',
    'liquid',
    'jekyll',
    'jinja',
    'handlebars',
    'erb',
    'php',
  ];
  const sep = '\n  - ';
  process.stdout.write(
    'Available output formats are: ' + sep + formats.join(sep) + '\n'
  );
  return;
}

const args = options._;

const concat = require('concat-stream');
const ast = require('../ast');
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
    parse.file(filename, options, (error, node) => {
      // console.warn(filename);
      process.stdout.write(fmt(node));
    });
  });
} else {
  process.stdin.pipe(concat(buffer => {
    const node = parse.buffer(buffer, options);
    process.stdout.write(fmt(node));
  }));
}

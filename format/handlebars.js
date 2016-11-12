'use strict';
const abs = require('./abstract');
const invariant = require('invariant');
const formatFactory = require('./factory');

const If = function(node) {
  invariant(node.cond.type === 'Symbol' ||
            node.cond.type === 'LookupVal',
            'Encountered If with unexpected condition type: "' +
              node.cond.type + '" (expected Symbol or LookupVal)');

  this._context.unshift(node.cond);

  const parts = [
    this.C_OPEN,
    this.K_IF, this.WS,
    this.node(node.cond),
    this.C_CLOSE,
    this.node(node.body)
  ];

  this._context.shift();

  if (node.else_) {
    parts.push(
      this.C_OPEN,
      this.K_ELSE,
      this.C_CLOSE,
      this.node(node.else_)
    );
  }

  parts.push(
    this.C_OPEN,
    this.K_END_IF,
    this.C_CLOSE
  );
  
  return parts.join('');
};

const For = function(node) {

  this._context.unshift(node.name);

  const parts = [
    '{{#each ',
    this.node(node.arr),
    '}}',
    this.node(node.body)
  ];

  this._context.shift();

  parts.push('{{/each}}');

  return parts.join('');
};

const Symbol = abs.Symbol;

const LookupVal = function(node) {

  const stack = [node.val.value];
  var target = node.target;
  while (target.type === 'LookupVal') {
    stack.unshift(target.val.value);
    target = target.target;
  }
  stack.unshift(target.value);

  /**
   * FIXME: this loop is meant to "trim" leading symbols in a lookup
   * if the same symbols match the beginning of our context stack, as in:
   *
   * {% for y in x %}hi {{ y.z }}{% endfor %}
   *
   * should translate to:
   *
   * {{#each x}}hi {{z}}{{/each}}
   *
   * It doesn't do nearly the right thing... yet.
   */
  var i = 0;
  while (this._context[i] && stack[0] === this._context[i].value) {
    stack.shift();
    i++;
  }

  return stack.reduce((out, symbol) => {
    return out + this.accessor(symbol);
  }, stack.shift());
};

const quote = function(symbol) {
  // symbols are never quoted, even in accessor expressions
  return symbol;
};

const accessor = function(symbol) {
  // any valid JavaScript identifier just gets a leading ".";
  // otherwise, we "escape" the symbol with brackets
  return this.P_IDENTIFIER.test(symbol)
    ? '.' + symbol
    : '.[' + symbol + ']';
};

module.exports = formatFactory({
  WS:           '',

  // note that our control structure open and close delimiters
  // do *not* include the leading #, since some keyword equivalents
  // do not use it ("^" for else, etc.)
  C_OPEN:       '{{',
  C_CLOSE:      '}}',
  // for parity with other templating systems,
  // output should *not* be HTML-escaped (double curlies)
  O_OPEN:       '{{{',
  O_CLOSE:      '}}}',

  K_IF:         '#if ',
  K_ELSE:       '^',
  K_END_IF:     '/if',

  K_EACH:       '#each ',
  K_END_EACH:   '/each',

  If:           If,
  For:          For,

  // current symbol context
  _context:     [],

  // regex matching bare words (not requiring quotes)
  P_IDENTIFIER: /^[a-z]\w*$/i,

  quote:        quote,
  accessor:     accessor,

  LookupVal:    LookupVal,
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.Root,
  Symbol:       Symbol,
  TemplateData: abs.TemplateData,

});

'use strict';
const invariant = require('invariant');

const If = function(node) {
  invariant(this.K_IF, 'Encountered If without K_IF');
  invariant(this.K_END_IF, 'Encountered If without K_END_IF');

  const parts = [
    this.C_OPEN, this.WS,
    this.K_IF, this.WS,
    this.node(node.cond), this.WS,
    this.C_CLOSE,
    this.node(node.body)
  ];

  if (node.else_) {
    invariant(this.K_ELSE, 'Encountered If..Else without K_ELSE');
    // TODO: produce elseif expressions, rather than nested if/else
    parts.push(
      this.C_OPEN, this.WS,
      this.K_ELSE, this.WS,
      this.C_CLOSE,
      this.node(node.else_)
    );
  }
  return parts.concat([
    this.C_OPEN, this.WS,
    this.K_END_IF, this.WS,
    this.C_CLOSE
  ]).join('');
};

const For = function(node) {
  invariant(this.K_FOR, 'Encountered For..In without K_FOR');
  invariant(this.K_FOR_IN, 'Encountered For..In without K_FOR_IN');
  invariant(this.K_END_FOR, 'Encountered For..In without K_END_FOR');

  const parts = [
    this.C_OPEN, this.WS,
    this.K_FOR, this.WS,
    this.node(node.name), this.WS,
    this.K_FOR_IN, this.WS,
    this.node(node.arr), this.WS,
    this.C_CLOSE
  ];

  // TODO: node.else_

  return parts.concat([
    this.node(node.body),
    this.C_OPEN, this.WS,
    this.K_END_FOR, this.WS,
    this.C_CLOSE
  ]).join('');
};

const LookupVal = function(node) {
  invariant(typeof this.quote === 'function',
            'Encountered LookupVal without quote() method');
  invariant(typeof this.accessor === 'function',
            'Encountered LookupVal without accessor() method');

  const stack = [node.val.value];
  var target = node.target;
  while (target.type === 'LookupVal') {
    stack.unshift(target.val.value);
    target = target.target;
  }
  const str = this.VAR_PREFIX
    ? this.VAR_PREFIX + target.value
    : target.value;
  return stack.reduce((out, symbol) => {
    return out + this.accessor(symbol);
  }, str);
};

const Literal = function(node) {
  const value = node.value;

  if (this.literalAliases && value in this.literalAliases) {
    return this.literalAliases[value];
  } else if (Array.isArray(this.literals)) {
    if (this.literals.indexOf(value) === -1) {
      throw new Error('Unsupported literal: "' + value + '"');
    }
    return value;
  }

  return this.quote(value, true);
};

const Output = function(node) {
  return node.children.map(child => {
    var out = this.node(child, node);
    if (child.type === 'TemplateData') {
      return out;
    } else {
      return [
        this.O_OPEN, this.WS,
        out, this.WS,
        this.O_CLOSE
      ].join('');
    }
  }).join(this.WS || '');
};

const NodeList = function(node) {
  return node.children.map(child => this.node(child)).join('');
};

const Not = function(node) {
  return [
      this.K_NOT,
      this.WS,
      this.node(node.target)
  ].join('');
};

const TemplateData = function(node) {
  return node.value;
};

const Symbol = function(node) {
  return node.value;
};

const Block = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.K_BLOCK, this.WS,
    this.node(node.name), this.WS,
    this.C_CLOSE,
    this.node(node.body),
    this.C_OPEN, this.WS,
    this.K_END_BLOCK, this.WS,
    this.C_CLOSE,
  ].join('');
};

const Extends = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.K_EXTENDS, this.WS,
    this.node(node.template), this.WS,
    this.C_CLOSE
  ].join('');
};

const Include = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.K_INCLUDE, this.WS,
    this.node(node.template), this.WS,
    // TODO: support 'ignore missing'?
    this.C_CLOSE
  ].join('');
};

const Compare = function(node) {
  var type = node.ops[0].type;
  var alias = this.operatorAliases ? this.operatorAliases[type] : null;
  if (alias) {
    type = alias;
  }
  return [
    this.node(node.expr),
    type,
    this.node(node.ops[0].expr, node)
  ].join(' ');
};

const Operator = (symbol) => {
  return function(node) {
    return [
      this.node(node.left),
      symbol,
      this.node(node.right)
    ].join(this.WS);
  };
};

const Group = function(node) {
  return '(' + node.children
    .map(child => this.node(child))
    .join(this.WS) + ')';
};

const Capture = function(node) {
  invariant(Array.isArray(node.targets) || node.name,
            'Capture is missing a name or targets: ' + Object.keys(node));
  invariant(node.body && typeof node.body === 'object',
            'Capure.body is not an Object');
  const name = node.name || node.targets[0];
  return [
    this.C_OPEN, this.WS,
    this.K_CAPTURE, this.WS,
    this.node(name), this.WS,
    this.C_CLOSE,
    this.node(node.body),
    this.C_OPEN, this.WS,
    this.K_END_CAPTURE, this.WS,
    this.C_CLOSE
  ].join('');
};


const quote = function(symbol, force) {
  invariant(this.P_NUMERIC instanceof RegExp,
            'quote() requires P_NUMERIC regexp');
  invariant(this.P_WORD instanceof RegExp,
            'quote() requires P_WORD regexp');

  if (this.P_NUMERIC.test(symbol)) {
    return symbol;
  }
  return (!force && this.P_WORD.test(symbol))
    ? symbol
    : "'" + symbol.replace(/'/g, "\\'") + "'";
};

const accessor = function(symbol) {
  const str = this.quote(symbol)
  return /^[0-9'"]/.test(str)
    ? '[' + str + ']'
    : '.' + str;
};

module.exports = {
  // output open delimiter
  O_OPEN:       '{{',
  // output close delimiter
  O_CLOSE:      '}}',

  // control structure open
  C_OPEN:       '{% ',
  // control structure close
  C_CLOSE:      '%}',
  // whitespace around control structures
  C_WS:         ' ',

  // if keyword
  K_IF:         null,
  // else keyword
  K_ELSE:       null,
  // else if keyword
  K_ELSE_IF:    null,
  // end if
  K_END_IF:     null,
  // not operator
  K_NOT:        null,

  // for/foreach/each keyword
  K_FOR:        null,
  // for..in "in" keyword
  K_FOR_IN:     null,
  // end for/foreach/each
  K_END_FOR:    null,

  // regex matching numeric expressions
  P_NUMERIC:    /^\d+(\.\d+)?$/,
  // regex matching bare words (not requiring quotes)
  P_WORD:       /^[a-z]\w*$/i,

  // abstract word quoting helper
  quote:        quote,
  accessor:     accessor,

  Block:        Block,
  Capture:      Capture,
  Compare:      Compare,
  Extends:      Extends,
  For:          For,
  Group:        Group,
  If:           If,
  Include:      Include,
  Literal:      Literal,
  LookupVal:    LookupVal,
  NodeList:     NodeList,
  Not:          Not,
  Operator:     Operator,
  Output:       Output,
  Root:         NodeList,
  Symbol:       Symbol,
  TemplateData: TemplateData,
};

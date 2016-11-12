
const If = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    this.K_IF, this.WS,
    this.node(node.cond), this.WS,
    this.C_CLOSE,
    this.node(node.body)
  ];

  if (node.else_) {
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
  var target = node.target;
  var stack = [node.val.value];
  while (target.type === 'LookupVal') {
    stack.unshift(target.val.value);
    target = target.target;
  }
  return stack.reduce((str, symbol) => {
    var out = this.quote(symbol);
    return /^[0-9'"]/.test(out)
      ? str + '[' + out + ']'
      : str + '.' + out;
  }, target.value);
};

const Literal = function(node) {
  return this.quote(node.value, true);
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

const TemplateData = function(node) {
  return node.value;
};

const Symbol = function(node, parent) {
  return node.value;
};

const Compare = function(node) {
  return [
    this.node(node.expr),
    node.ops[0].type,
    this.node(node.ops[0].expr, node)
  ].join(' ');
};

const quote = function(symbol, force) {
  if (this.P_NUMERIC.test(symbol)) {
    return symbol;
  }
  return (!force && this.P_WORD.test(symbol))
    ? symbol
    : "'" + symbol.replace(/'/g, "\\'") + "'";
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

  Compare:      Compare,
  If:           If,

  For:          For,
  Literal:      Literal,
  LookupVal:    LookupVal,
  NodeList:     NodeList,
  Output:       Output,
  Root:         NodeList,
  Symbol:       Symbol,
  TemplateData: TemplateData
};

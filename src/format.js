'use strict';
const assert = require('assert');

const If = function(node) {
  const parts = [
    this.CTRL_START, ' if ', this.node(node.cond), ' ', this.CTRL_END,
    this.node(node.body)
  ];
  if (node.else_) {
    if (node.else_.cond) {
      parts.push(
        this.CTRL_START, ' elseif ',
        this.node(node.else_.cond), ' ', this.CTRL_END
      );
    } else {
      parts.push(this.CTRL_START, ' else ', this.CTRL_END);
    }
    parts.push(this.node(node.else_.body));
  }
  return parts.concat([
    this.CTRL_START, ' endif ', this.CTRL_END
  ]).join('');
};

const For = function(node) {
  const parts = [
    this.CTRL_START, ' for ', this.node(node.name),
    ' in ', this.node(node.arr), ' ', this.CTRL_END
  ];

  // TODO: node.else_

  return parts.concat([
    this.node(node.body),
    this.CTRL_START, ' endfor ', this.CTRL_END
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
    var out = this.node({type: 'Literal', value: symbol});
    return str + (/^\w/.test(out) ? '.' : '') + out;
  }, target.value);
};

const Literal = function(node) {
  return /^\w+$/.test(node.value)
    ? node.value
    : "['" + node.value + "']";
};

const Output = function(node) {
  return node.children.map(child => {
    var out = this.node(child, node);
    return child.type === 'TemplateData'
      ? out
      : [this.VAR_START, out, this.VAR_END].join(' ');
  }).join('');
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

const DEFAULT_FORMATTERS = {
  CTRL_START:   '{%',
  CTRL_END:     '%}',
  VAR_START:    '{{',
  VAR_END:      '}}',
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

const factory = (formatters) => {
  const formats = Object.assign({}, DEFAULT_FORMATTERS, formatters);

  const formatNode = function(node, parent) {
    var format = formats[node.type];
    switch (typeof format) {
      case 'function':
        return format.call(formats, node, parent);
    }
  };

  formats.node = formatNode;

  return formatNode;
};

module.exports = factory;

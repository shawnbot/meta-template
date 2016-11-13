'use strict';
const formatFactory = require('./factory');
const abs = require('./abstract');
const ast = require('../ast');

/**
 * The Liquid root node formatter offers some interop with the Nunjucks/Jinja
 * 'extends' and 'block' inheritance feature.
 */
const Root = function(node) {
  // 1. find the {% extends %} node if there is one
  const extendsNode = node.children.filter(child => {
    return child.type === 'Extends';
  })[0];

  // 2. find the {% block %} nodes
  const blocks = [];
  ast.walk(node, child => {
    if (child.type === 'Block') {
      // and prefix each one's symbol name with the necessary prefix
      child.name.value = this.BLOCK_VAR_PREFIX + child.name.value;
      blocks.push(child);
    }
  });

  if (extendsNode) {
    // 3a. if there is an extends node, then:

    // convert all the block nodes to capture nodes
    blocks.forEach(block => {
      block.type = 'Capture';
    });

    // remove the extends node from the root children list
    node.children.splice(node.children.indexOf(extendsNode), 1);

    // append an include to the end of the root node
    node.children.push({
      type: 'Include',
      template: extendsNode.template
    });
  } else {
    // 3b. if there is no extends node, then this is the "base"
    // template and we can replace each block with an if/else:
    //
    // {% if block_name %}
    //   {{ block_name }}
    // {% else %}
    //   default content
    // {% endif %}
    blocks.forEach(block => {
      block.type = 'If';
      block.cond = block.name;
      block.else_ = block.body;
      block.body = {
        type: 'Output',
        children: [
          {
            type: 'Symbol',
            value: block.name.value
          }
        ]
      };
    });
  }

  // render the root node as usual
  return abs.Root.call(this, node);
};

const Filter = function(node) {
  const args = node.args.children;
  const rest = args.length > 1
    ? ': ' + args.slice(1)
        .map(arg => this.node(arg))
        .join(', ')
    : '';
  return [
    this.node(args[0]), this.WS,
    this.FILTER_DELIM, this.WS,
    this.node(node.name),
    rest
  ].join('');
};

// unconverted block nodes are an error
const Block = function(node) {
  throw new Error('Encountered unconverted Block node in Liquid format');
};

// unconverted extends nodes are an error, too
const Extends = function(node) {
  throw new Error('Encountered unconverted Extends node in Liquid format');
};

const Include = function(node) {
  const params = (node.parameters || [])
    .map(param => {
      return [
        param.name.value,
        // XXX we may want to invariant() here to assert that
        // we're not outputting any expression that Liquid/Jekyll
        // can't handle
        this.node(param.value)
      ].join('=');
    })
    .join(this.WS);
  return [
    this.C_OPEN, this.WS,
    this.K_INCLUDE, this.WS,
    this.node(node.template), this.WS,
    params, params ? this.WS : '',
    this.C_CLOSE
  ].join('');
};

const Capture = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.K_CAPTURE, this.WS,
    this.node(node.name), this.WS,
    this.C_CLOSE,
    this.node(node.body),
    this.C_OPEN, this.WS,
    this.K_END_CAPTURE, this.WS,
    this.C_CLOSE
  ].join('');
};

const Operator = (filter) => {
  return function(node) {
    return this.Filter({
      name: {
        type: 'Symbol',
        value: filter
      },
      args: {
        children: [
          node.left,
          node.right
        ]
      }
    });
  };
};

module.exports = formatFactory({
  // whitespace
  WS:           ' ',

  // keywords
  K_ASSIGN:     'assign',
  K_IF:         'if',
  K_ELSE:       'else',
  K_ELSE_IF:    'elif',
  K_END_IF:     'endif',
  K_FOR:        'for',
  K_END_FOR:    'endfor',
  K_FOR_IN:     'in',
  K_INCLUDE:    'include',
  K_CAPTURE:    'capture',
  K_END_CAPTURE: 'endcapture',

  // control structure delimiters
  C_OPEN:       '{%',
  C_CLOSE:      '%}',
  // output delimiters
  O_OPEN:       '{{',
  O_CLOSE:      '}}',

  FILTER_DELIM: '|',

  BLOCK_VAR_PREFIX: 'block__',

  // quote patterns
  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  quote:        abs.quote,
  accessor:     abs.accessor,

  Add:          Operator('plus'),
  Block:        Block,
  Capture:      Capture,
  Compare:      abs.Compare,
  Div:          Operator('divided_by'),
  Extends:      Extends,
  Filter:       Filter,
  For:          abs.For,
  If:           abs.If,
  Include:      Include,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  Mul:          Operator('times'),
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         Root,
  Sub:          Operator('minus'),
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});

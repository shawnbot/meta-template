'use strict';
const abs = require('./abstract');
const ast = require('../ast');
const invariant = require('invariant');
const liquid = require('./liquid');

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

// unconverted block nodes are an error
const Block = function(node) {
  throw new Error('Encountered unconverted Block node in Liquid format');
};

// unconverted extends nodes are an error, too
const Extends = function(node) {
  throw new Error('Encountered unconverted Extends node in Liquid format');
};

const Capture = function(node) {
  invariant(node.name && typeof node.name === 'object',
            'capture.name is not an Object');
  invariant(node.body && typeof node.body === 'object',
            'capure.body is not an Object');
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

const Set = function(node) {
  const body = node.body;
  if (body) {
    return this.Capture({
      name: node.targets[0],
      body: body.body
    });
  } else {
    return this.Assign(node);
  }
};

const Assign = function(node) {
  invariant(Array.isArray(node.targets), 'assign.targets is not an Array');
  invariant(node.value && typeof node.value === 'object',
            'assign.value is not an Object');
  return [
    this.C_OPEN, this.WS,
    this.K_ASSIGN, this.WS,
    this.node(node.targets[0]), this.WS,
    '=', this.WS,
    this.node(node.value), this.WS,
    this.C_CLOSE
  ].join('');
};

module.exports = liquid.extend({
  Assign:       Assign,
  Block:        Block,
  Capture:      Capture,
  Extends:      Extends,
  Include:      Include,
  Set:          Set,
  Root:         Root,
});

'use strict';
const abs = require('./abstract');
const assign = require('object-assign');
const ast = require('../ast');
const invariant = require('invariant');
const liquid = require('./liquid');

/**
 * The Liquid root node formatter offers some interop with the
 * Nunjucks/Jinja 'extends' and 'block' inheritance feature.
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

module.exports = liquid.extend({
  // for Jekyll's extensions, see:
  // <http://jekyllrb.com/docs/templates/>
  builtinFilters: assign({}, liquid.builtinFilters, {
    'dump':       'jsonify',
    'int':        'to_integer',
    'wordcount':  'number_of_words',
  }),

  Include:      Include,
  Root:         Root,
});

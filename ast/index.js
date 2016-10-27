'use strict';
const nodes = require('nunjucks/src/nodes');

const NODE_KEYS = [
  'args',
  'arr',
  'body',
  'cond',
  'expr',
  'else_',
  'name',
  'target',
  'val',
];

const CHILD_KEYS = [
  'children',
  'ops',
];

const NODE_NAMES = Object.keys(nodes);

const getNodeType = (node) => {
  var type;
  return node.type || (NODE_NAMES.some((name) => {
    if (node.constructor === nodes[name]) {
      return type = name;
    }
  }), type);
};

const _normalize = (node) => {
  delete node.lineno;
  delete node.colno;
  delete node.parent;
  node.type = getNodeType(node);
  return node;
};

const normalize = (node) => {
  return walk(node, _normalize);
};

const walk = (node, func) => {
  if (func(node) !== false) {

    CHILD_KEYS
      .filter(key => Array.isArray(node[key]))
      .forEach(key => {
        node[key].forEach(child => walk(child, func));
      });

    NODE_KEYS
      .filter(key => node[key])
      .forEach(key => walk(node[key], func));
  }
  return node;
};

module.exports = {
  normalize: normalize,
  getNodeType: getNodeType,
  walk: walk
};

'use strict';
const nodes = require('nunjucks/src/nodes');

const NODE_KEYS = [
  'arr',
  'body',
  'cond',
  'else_',
  'name',
  'target',
  'val',
];

const NODE_NAMES = Object.keys(nodes);

const getNodeType = (node) => {
  var type;
  NODE_NAMES.some((name) => {
    if (node.constructor === nodes[name]) {
      return type = name;
    }
  });
  return type;
};

const _normalize = (node) => {
  delete node.lineno;
  delete node.colno;
  node.type = getNodeType(node);
  return node;
};

const normalize = (node) => {
  return walk(node, _normalize);
};

const walk = (node, func) => {
  if (func(node) !== false) {

    if (Array.isArray(node.children)) {
      node.children.forEach(child => walk(child, func));
    }

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

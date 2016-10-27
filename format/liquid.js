'use strict';
const nunjucks = require('./nunjucks');

const nodes = {
  Filter: function(node) {
    var args = node.args.children;
    return [
      this.node(args[0]),
      ' | ',
      this.node(node.name),
      args.length > 1
        ? ': ' + args.slice(1)
            .map(arg => this.node(arg))
            .join(', ')
        : ''
    ].join('');
  }
};

module.exports = function(overrides) {
  return nunjucks.extend(Object.assign(
    {},
    nodes,
    overrides
  ));
};

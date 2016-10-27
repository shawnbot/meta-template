'use strict';
const format = require('./');

module.exports = format({
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
});

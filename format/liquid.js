'use strict';
const nunjucks = require('./nunjucks');

module.exports = nunjucks.extend({
  // Nunjucks/Jinja: {{ foo | bar(baz, 1) }}
  // Liquid: {{ foo | bar: baz, 1 }}
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

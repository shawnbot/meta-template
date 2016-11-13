'use strict';
const assign = require('object-assign');

const factory = (formatters) => {
  const stack = [];
  const format = assign({
    _stack: stack
  }, formatters);

  const formatNode = function(node) {
    const fmt = format[node.type];
    switch (typeof fmt) {
      case 'function':
        node.parent = stack[stack.length - 1];
        stack.push(node);
        const result = fmt.call(format, node);
        stack.pop();
        return result;
      default:
        throw new Error('Unsupported node type found: "' + node.type + '"');
    }
  };

  format.node = formatNode;

  formatNode.extend = function(overrides) {
    return factory(assign(
      {},
      formatters,
      overrides
    ));
  };

  return formatNode;
};

module.exports = factory;

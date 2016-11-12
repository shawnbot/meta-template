'use strict';
const assign = require('object-assign');

const factory = (formatters) => {
  const formats = assign({}, formatters);

  const formatNode = function(node) {
    var format = formats[node.type];
    switch (typeof format) {
      case 'function':
        return format.call(formats, node);
      default:
        throw new Error('Unsupported node type found: "' + node.type + '"');
    }
  };

  formats.node = formatNode;

  formatNode.extend = function(overrides) {
    return factory(Object.assign(
      {},
      formatters,
      overrides
    ));
  };

  return formatNode;
};

module.exports = factory;

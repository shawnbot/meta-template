'use strict';

const factory = (formatters) => {
  const formats = Object.assign(
    {},
    formatters
  );

  const formatNode = function(node, parent) {
    var format = formats[node.type];
    switch (typeof format) {
      case 'function':
        // XXX set node.parent here?
        return format.call(formats, node, parent);
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

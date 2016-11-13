const assert = require('assert');
const parse = require('../parse');

assert.formatEquals = function(input, output, reason) {
  it('produces: ' + output, function() {
    const node = this.parse(input);
    assert.equal(output, this.format(node), reason);
  });
};

assert.formatsMatch = function(inputs) {
  inputs.forEach(input => {
    it(input, function() {
      const node = this.parse(input);
      assert.equal(input, this.format(node));
    });
  });
};

assert.formatThrows = function(input, reason) {
  it(input, function() {
    const node = this.parse(input);
    assert.throws(() => this.format(node), reason);
  });
};

module.exports = assert;

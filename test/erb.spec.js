'use strict';
const assert = require('./assert');
const parse = require('../parse');
const format = require('../format');

before(function() {
  const opts = {
    clean: true
  };
  this.parse = str => parse.string(str, opts);
  this.format = format.erb;
});


describe('default format (nunjucks -> erb)', function() {

  describe('formats output expressions', function() {
    assert.formatEquals(
      "foo {{ bar }} baz",
      "foo <%= bar %> baz"
    );

    assert.formatEquals(
      "foo {{ bar }} baz {{ qux[0] }}",
      "foo <%= bar %> baz <%= qux[0] %>"
    );
    assert.formatEquals(
      "foo {{ bar['baz qux'][1].x }}",
      "foo <%= bar['baz qux'][1].x %>"
    );
  });

  describe('formats filter tags', function() {
    assert.formatEquals(
      "foo {{ bar | qux }} baz",
      "foo <%= qux(bar) %> baz"
    );
    assert.formatEquals(
      "foo {{ bar | qux(1) }} baz",
      "foo <%= qux(bar, 1) %> baz"
    );
    assert.formatEquals(
      "foo {{ bar | qux(1, 'quux', bar.baz[0]) }} baz",
      "foo <%= qux(bar, 1, 'quux', bar.baz[0]) %> baz"
    );
  });

  describe('formats for..in loops', function() {
    assert.formatEquals(
      "{% for x in items %}la {{ x[0] }}{% endfor %}",
      "<% items.each do |x| %>la <%= x[0] %><% end %>"
    );
    assert.formatEquals(
      "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}",
      "<% items.x['foo bar'].qux.each do |x| %>la <%= x[0] %><% end %>"
    );
  });

  describe('formats if conditionals', function() {
    assert.formatEquals(
      "{% if z %}yes{% endif %}",
      "<% if z %>yes<% end %>"
    );
    assert.formatEquals(
      "{% if z == 'bar' %}yes{% endif %}",
      "<% if z == 'bar' %>yes<% end %>"
    );
    assert.formatEquals(
      "{% if z %}yes{% else %}no{% endif %}",
      "<% if z %>yes<% else %>no<% end %>"
    );

    // @TODO: add `elsif` support
    assert.formatEquals(
      "{% if z %}yes{% elseif y %}maybe{% else %}no{% endif %}",
      "<% if z %>yes<% else %><% if y %>maybe<% else %>no<% end %><% end %>"
    );
    assert.formatEquals(
      "{% if z %}yes{% else %}{% if y %}maybe{% else %}no{% endif %}{% endif %}",
      "<% if z %>yes<% else %><% if y %>maybe<% else %>no<% end %><% end %>"
    );

    assert.formatEquals(
      "{% if not foo %}yes{% endif %}",
      "<% if not foo %>yes<% end %>"
    );
  });

  describe('literals', function() {
    it('does not quote true, false, or null', function() {
      assert.formatEquals(
        "{{ true }}",
        "<%= true %>"
      );
      assert.formatEquals(
        "{{ false }}",
        "<%= false %>"
      );
      assert.formatEquals(
        "{{ null }}",
        "<%= null %>"
      );
    });
  });

  describe('operators', function() {
    describe('add', function() {
      assert.formatEquals(
        "{{ foo + bar }}",
        "<%= foo + bar %>"
      );
      assert.formatEquals(
        "{{ foo + 1 }}",
        "<%= foo + 1 %>"
      );
      assert.formatEquals(
        "{{ foo + 1 + bar }}",
        "<%= foo + 1 + bar %>"
      );
      assert.formatEquals(
        "{{ foo + 'bar' }}",
        "<%= foo + 'bar' %>"
      );
    });

    describe('subtract', function() {
      assert.formatEquals(
        "{{ foo - bar }}",
        "<%= foo - bar %>"
      );
      assert.formatEquals(
        "{{ foo - 1 }}",
        "<%= foo - 1 %>"
      );
    });

    describe('multiply', function() {
      assert.formatEquals(
        "{{ x * 2 }}",
        "<%= x * 2 %>"
      );
      assert.formatEquals(
        "{{ x * y * 2 }}",
        "<%= x * y * 2 %>"
      );
    });

    describe('divide', function() {
      assert.formatEquals(
        "{{ x / 2 }}",
        "<%= x / 2 %>"
      );
      assert.formatEquals(
        "{{ x / y }}",
        "<%= x / y %>"
      );
    });

    describe('mixed operators', function() {
      assert.formatEquals(
        "{{ foo + bar - 1 }}",
        "<%= foo + bar - 1 %>"
      );
      assert.formatEquals(
        "{{ foo / bar + 2 }}",
        "<%= foo / bar + 2 %>"
      );
      assert.formatEquals(
        "{{ foo / bar * 2 - 1 }}",
        "<%= foo / bar * 2 - 1 %>"
      );
    });

    describe('parenthesis grouping', function() {
      assert.formatEquals(
        "{{ foo + (bar + 1) }}",
        "<%= foo + (bar + 1) %>"
      );
      assert.formatEquals(
        "{{ foo / (bar + 1) }}",
        "<%= foo / (bar + 1) %>"
      );
    });
  });

  describe('set local variables', function() {
    assert.formatEquals(
      '{% set foo = 1 %}',
      '<% foo = 1 %>'
    );
    assert.formatEquals(
      '<% foo = x * 2 %>',
      '<% foo = x * 2 %>'
    );
  });

  describe('include nodes', function() {
    assert.formatEquals(
      "{% include 'foo' %}",
      "<%= render partial: 'foo' %>"
    );
    assert.formatEquals(
      "{% include foo.bar %}",
      "<%= render partial: foo.bar %>"
    );
    assert.formatEquals(
      "{% include foo + '.html' %}",
      "<%= render partial: foo + '.html' %>"
    );
  });

});

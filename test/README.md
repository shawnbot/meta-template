# Tests

This directory contains meta-template's unit tests, which include a YAML-based
spec format that makes it easier to write exhaustive tests for supported
template formatters (ERB, Liquid, et al).

## YAML tests

YAML formatter tests follow a schema that looks like this:

```yaml
name: your top-level suite name

tests:
  - <test>
  # or
  - <group>
```

where each `<test>` has a `name` property and one or more _test
types_ to execute, each specified as another property:

* `converts: map` runs a template conversion on each key of `map`
  using the current formatter, and asserts that the resulting string
  is equal to the value of that key. For instance:

  ```yaml
  converts:
    # assert that the left value converts to the right
    '{{ x | e }}': '{{{x}}}'
  ```

* `converts: list` works like the `map` form above, but assumes a
  list of objects with `from` and `to` keys. This is the equivalent
  of the above example:

  ```yaml
  converts:
    from: '{{ x | e }}'
    to:   '{{{x}}}'
  ```

* `preserves: string` asserts that a conversion of the provided
  `string` produces the same value.

* `invalid: string` asserts that attempting conversion of the
  provided template `string` throws an error (usually because the
  output format doesn't support a feature in the provided template).


and where each `<group>` can be a nested instance of the same
top-level test suite structure with `name` and `tests` properties.

**Protip:** any _test type_ can be specified either as a single
"spec" or as an array of specs. This makes less sense for the
`converts: map` form, but can make more complicated conversions more
easier to read and write:

```yaml
# before
converts:
  "{% for x in items %}la {{ x[0] }}{% endfor %}": "<% items.each do |x| %>la <%= x[0] %><% end %>"
  "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}": "<% items.x['foo bar'].qux.each do |x| %>la <%= x[0] %><% end %>"

# after
converts:
  - from: "{% for x in items %}la {{ x[0] }}{% endfor %}"
    to:   "<% items.each do |x| %>la <%= x[0] %><% end %>"
  - from: "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}"
    to:   "<% items.x['foo bar'].qux.each do |x| %>la <%= x[0] %><% end %>"
```

# meta-template
Maintaining templates can be a pain in the butt, especially if you need to
maintain templates for multiple engines or host languages. Meta-template aims
to solve the problem of multi-engine template maintenance by making it possible
to treat [Nunjucks] templates (which are _theoretically_ compatible with
[Jinja] out of the box, and _almost_ compatible with [Django] and [Liquid]) as
the source of truth and programmatically transform them into other formats,
such as [EJS], [ERB], and [Mustache].

## Roadmap
This project is in its infancy, but here is a very rough roadmap:

- [x] Adapt the Nunjucks parser to [parse templates] into an abstract syntax
  tree (AST)
- [x] Write a [basic formatter] that can transform AST nodes back into
  Nunjucks template strings
- [ ] Do some research on template engine popularity in order to prioritize
  target formats
- [ ] Determine the "lowest common denominator" set of template features to
  support in parsing so that we can warn when source templates use features
  that aren't available in the desired output format(s)
- [ ] Flesh out the conversion API in JavaScript
- [ ] Make a command line tool
- [ ] Write some API docs
- [ ] Profit?

[Nunjucks]: https://mozilla.github.io/nunjucks/
[Django]: https://docs.djangoproject.com/en/1.10/topics/templates/
[Jinja]: http://jinja.pocoo.org/
[EJS]: http://www.embeddedjs.com/
[ERB]: https://docs.puppet.com/puppet/latest/reference/lang_template_erb.html
[parse templates]: src/parse.js
[basic formatter]: src/format.js

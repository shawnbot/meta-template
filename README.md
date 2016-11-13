# meta-template
Maintaining templates can be a pain in the butt, especially if you need to
maintain templates for multiple engines or host languages. Meta-template aims
to solve the problem of multi-engine template maintenance by making it possible
to treat [Nunjucks] templates (which are _theoretically_ compatible with
[Jinja] out of the box, and _almost_ compatible with [Django], [Liquid], and
[Twig]) as the **source of truth** and programmatically transform them into other
formats (such as [ERB], [Handlebars], [Mustache]) and even other _languages_,
such as [JSX] or [PHP].

## Play with it!
Currently I'm experimenting with different output formats, starting with
[Liquid][] (most useful for us Jekyll users at 18F) and [PHP][] (which seemed
to me the most potentially difficult). You can test these out by cloning the
repo, running `npm install` to get the dependencies, then running the
[bin/parse.js](bin/parse.js) script:

```sh
# output the Nunjucks AST in JSON format
./bin/parse.js path/to/template.html
# or use stdin
echo 'foo {{ bar }} baz {% if x %}hi{% endif %}' | ./bin/parse.js
# reformat the AST as Nunjucks (this _should_ produce the same output)
echo 'foo {{ bar }} baz...' | ./bin/parse.js --format
# reformat as Liquid
echo 'foo {{ bar }} baz...' | ./bin/parse.js --format liquid
# reformat as PHP!
echo 'foo {{ bar }} baz...' | ./bin/parse.js --format php
```

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
[Handlebars]: http://handlebarsjs.com/
[ERB]: https://docs.puppet.com/puppet/latest/reference/lang_template_erb.html
[Liquid]: https://shopify.github.io/liquid/
[Mustache]: https://mustache.github.io/
[PHP]: http://php.net/
[JSX]: https://facebook.github.io/jsx/
[Twig]: http://twig.sensiolabs.org/
[parse templates]: parse/index.js
[basic formatter]: src/format.js

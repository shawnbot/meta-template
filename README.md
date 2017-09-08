# meta-template
Maintaining templates can be a pain in the butt, especially if you need to
maintain templates for multiple engines or host languages. Meta-template aims
to solve the problem of multi-engine template maintenance by making it possible
to treat [Nunjucks] templates (which are _theoretically_ compatible with
[Jinja] out of the box, and _almost_ compatible with [Django], [Liquid], and
[Twig]) as the **source of truth** and programmatically transform them into other
formats (such as [ERB], [Handlebars], [Mustache]) and even other _languages_,
such as [JSX] or [PHP].

## How it works
At a high level, there are three steps in the template conversion process:

1. Use [Nunjucks] to [parse] a template into an _abstract syntax tree_ (AST)

  ```js
  const mt = require('meta-template');
  const ast = mt.parse.string('{% if foo %}{{ foo }}{% else %}no foo!{% endif %}');
  ```
  
1. Make any necessary transformations to the AST to match the output format

  ```js
  mt.ast.walk(ast, node => {
    if (node.type === 'TemplateData') {
      // do something with node.value here to modify the output, e.g.
      node.value = '(' + node.value + ')';
    }
  });
  ```
  
1. Format the AST into a string with a function that declaratively handles
   different types of AST "node" (`If`, `Output`, etc.), and automatically
   throws errors for unsupported node types
   
  ```js
  const out = mt.format.php(ast);
  console.log(out);
  // produces:
  // '<?php if ($foo): ?><?= $foo ?><?php else: ?>(no foo!)<?php endif; ?>'
  ```
  
You can try it yourself by combining the above snippets into a [standalone script](https://gist.github.com/shawnbot/b92f28c5b84aaee2922f1d9d3e20a18c)
and run it through the `php` command with:

```sh
node njk2php.js | php
# (no foo!)
```

## The abstract syntax tree
The abstract syntax tree, or AST, is a tree structure of JavaScript objects that
describes the parsed template. Some common nodes in the tree are:

* `TemplateData` represents a raw string of template output
* `Output` represents template _data_ output, such as a variable
* `If` represents a conditional control structure with `cond` (condition),
  `body` (the output when `cond` succeeds), and optional `else_` child nodes
* `Symbol` represents a "simple" variable expression, e.g. `foo`
* `LookupVal` represents a nested variable expression, e.g. `foo.bar[0]`
* `Literal` represents literals like `true`, `false`, and `null` (which must
  be converted to their language-specific equivalents in Ruby and Python)
* `Include` the Nunjucks/Jinja/Liquid implementation of template partials

**TODO**: explain the [parse] and [AST](ast/index.js) bits.

## The format API
**TODO**: explain the [abstract](format/abstract.js) and concrete format APIs.

## Play with it!
Currently I'm experimenting with different output formats, starting with
[Liquid][] (most useful for us Jekyll users at 18F) and [PHP][] (which seemed
to me the most potentially difficult). You can test these out by cloning the
repo, running `npm install` to get the dependencies, then running the
[bin/parse.js](bin/parse.js) script:

```sh
# output the Nunjucks AST in JSON format
./bin/parse.js path/to/template.html

# do the same without line and col info (--clean), trim input (--trim)
./bin/parse.js --clean --trim path/to/template.html

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

- [x] Adapt the Nunjucks parser to [parse] templates into an abstract syntax
  tree (AST)
- [x] Write a [format] API that can transform AST nodes back into
  Nunjucks template strings
- [x] Flesh out the conversion API in JavaScript
- [ ] Do some research on template engine popularity in order to prioritize
  target formats
- [ ] Determine the "lowest common denominator" set of template features to
  support in parsing so that we can warn when source templates use features
  that aren't available in the desired output format(s)
- [x] Make a command line tool
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
[parse]: parse/index.js
[format]: format/index.js
[AST]: https://en.wikipedia.org/wiki/Abstract_syntax_tree

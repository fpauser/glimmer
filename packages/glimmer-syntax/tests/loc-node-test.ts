import { parse } from "glimmer-syntax";

QUnit.module("[glimmer-syntax] Parser - Location Info");

function locEqual(node, startLine, startColumn, endLine, endColumn, message) {

  let expected = {
    source: null,
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };

  deepEqual(node.loc, expected, message);
}

test("programs", function() {
  let ast = parse(`
  {{#if foo}}
    {{bar}}
       {{/if}}
    `);

  locEqual(ast, 1, 0, 5, 4, 'outer program');

  // startColumn should be 13 not 2.
  // This should be fixed upstream in Handlebars.
  locEqual(ast.body[1].program, 2, 2, 4, 7, 'nested program');
});

test("blocks", function() {
  let ast = parse(`
  {{#if foo}}
    {{#if bar}}
        test
        {{else}}
      test
  {{/if    }}
       {{/if
      }}
    `);

  locEqual(ast.body[1], 2, 2, 9, 8, 'outer block');
  locEqual(ast.body[1].program.body[0], 3, 4, 7, 13, 'nested block');
});

test("mustache", function() {
  let ast = parse(`
    {{foo}}
    {{#if foo}}
      bar: {{bar
        }}
    {{/if}}
  `);

  locEqual(ast.body[1], 2, 4, 2, 11, 'outer mustache');
  locEqual(ast.body[3].program.body[1], 4, 11, 5, 10, 'inner mustache');
});

test("element modifier", function() {
  let ast = parse(`
    <div {{bind-attr
      foo
      bar=wat}}></div>
  `);

  locEqual(ast.body[1].modifiers[0], 2, 9, 4, 15, 'element modifier');
});

test("html elements", function() {
  let ast = parse(`
    <section>
      <br>
      <div>
        <hr />
      </div>
    </section>
  `);

  let [,section] = ast.body;
  let [,br,,div] = section.children;
  let [,hr] = div.children;

  locEqual(section, 2, 4, 7, 14, 'section element');
  locEqual(br, 3, 6, 3, 10, 'br element');
  locEqual(div, 4, 6, 6, 12, 'div element');
  locEqual(hr, 5, 8, 5, 14, 'hr element');
});

test("html elements with nested blocks", function() {
  let ast = parse(`
    <div>
      {{#if isSingleError}}
        Single error here!
      {{else if errors}}
        Multiple errors here!
      {{else}}
        No errors found!
      {{/if}} <p>Hi there!</p>
    </div>
  `);

  let [,div] = ast.body;
  let [,ifBlock,,p] = div.children;
  let inverseBlock = ifBlock.inverse;
  let [nestedIfBlock] = inverseBlock.body;
  let nestedIfInverseBlock = nestedIfBlock.inverse;

  locEqual(div, 2, 4, 10, 10, 'div element');
  locEqual(ifBlock, 3, 6, 9, 13, 'outer if block');
  locEqual(inverseBlock, 5, 6, 9, 6, 'inverse block');
  locEqual(nestedIfBlock, 5, 6, 9, 6, 'nested if block');
  locEqual(nestedIfInverseBlock, 7, 6, 9, 6, 'nested inverse block');
  locEqual(p, 9, 14, 9, 30, 'p');
});

test("block + newline + element ", function() {
  var ast = parse(`
    {{#if stuff}}
    {{/if}}
    <p>Hi!</p>
  `);

  let [,ifBlock,,p] = ast.body;

  locEqual(ifBlock, 2, 4, 3, 11, 'if block');
  locEqual(p, 4, 4, 4, 14, 'p element');
});

test("mustache + newline + element ", function() {
  var ast = parse(`
    {{foo}}
    <p>Hi!</p>
  `);

  let [,fooMustache,,p] = ast.body;

  locEqual(fooMustache, 2, 4, 2, 11, 'if block');
  locEqual(p, 3, 4, 3, 14, 'p element');
});

test("blocks with nested html elements", function() {
  let ast = parse(`
    {{#foo-bar}}<div>Foo</div>{{/foo-bar}} <p>Hi!</p>
  `);

  let block = ast.body[1].program;
  let [div] = block.body;
  let p = ast.body[3];

  locEqual(p, 2, 43, 2, 53, 'p element');
  locEqual(div, 2, 16, 2, 30, 'div element');
});

test("html elements after mustache", function() {
  let ast = parse(`
    {{foo-bar}} <p>Hi!</p>
  `);

  let [,mustache,,p] = ast.body;

  locEqual(mustache, 2, 4, 2, 15, '{{foo-bar}}');
  locEqual(p, 2, 16, 2, 26, 'div element');
});

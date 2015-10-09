import { DOMHelper } from "htmlbars-runtime";
import {
  equalHTML,
  isCheckedInputHTML
} from "htmlbars-test-helpers";

let xhtmlNamespace = "http://www.w3.org/1999/xhtml",
    xlinkNamespace = "http://www.w3.org/1999/xlink",
    svgNamespace   = "http://www.w3.org/2000/svg";

let foreignNamespaces = ['foreignObject', 'desc', 'title'];

let dom, i, foreignNamespace;

// getAttributes may return null or "" for nonexistent attributes,
// depending on the browser.  So we find it out here and use it later.
let disabledAbsentValue = (function (){
  let div = document.createElement("input");
  return div.getAttribute("disabled");
})();

QUnit.module('DOM Helper', {
  beforeEach: function() {
    dom = new DOMHelper();
  },
  afterEach: function() {
    dom = null;
  }
});

test('#createElement', function(){
  let node = dom.createElement('div');
  equal(node.tagName, 'DIV');
  equalHTML(node, '<div></div>');
});

test('#childAtIndex', function() {
  let node = dom.createElement('div');

  let child1 = dom.createElement('p');
  let child2 = dom.createElement('img');

  strictEqual(dom.childAtIndex(node, 0), null);
  strictEqual(dom.childAtIndex(node, 1), null);
  strictEqual(dom.childAtIndex(node, 2), null);

  dom.appendChild(node, child1);
  strictEqual(dom.childAtIndex(node, 0).tagName, 'P');
  strictEqual(dom.childAtIndex(node, 1), null);
  strictEqual(dom.childAtIndex(node, 2), null);

  dom.insertBefore(node, child2, child1);
  strictEqual(dom.childAtIndex(node, 0).tagName, 'IMG');
  strictEqual(dom.childAtIndex(node, 1).tagName, 'P');
  strictEqual(dom.childAtIndex(node, 2), null);
});

test('#appendText adds text', function(){
  let node = dom.createElement('div');
  let text = dom.appendText(node, 'Howdy');
  ok(!!text, 'returns node');
  equalHTML(node, '<div>Howdy</div>');
});

test('#setAttribute', function(){
  let node = dom.createElement('div');
  dom.setAttribute(node, 'id', 'super-tag');
  equalHTML(node, '<div id="super-tag"></div>');
  dom.setAttribute(node, 'id', null);
  equalHTML(node, '<div id="null"></div>');

  node = dom.createElement('input');
  ok(node.getAttribute('disabled') === disabledAbsentValue, 'precond: disabled is absent');
  dom.setAttribute(node, 'disabled', true);
  ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled set to true is present');
  dom.setAttribute(node, 'disabled', false);
  ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled set to false is present');
});

test('#setAttributeNS', function(){
  let node = dom.createElement('svg');
  dom.setAttributeNS(node, xlinkNamespace, 'xlink:href', 'super-fun');
  // chrome adds (xmlns:xlink="http://www.w3.org/1999/xlink") property while others don't
  // thus equalHTML is not useful
  let el = document.createElement('div');
  el.appendChild(node);
  // phantomjs omits the prefix, thus we can't find xlink:
  ok(el.innerHTML.indexOf('href="super-fun"') > 0);
  dom.setAttributeNS(node, xlinkNamespace, 'href', null);

  ok(el.innerHTML.indexOf('href="null"') > 0);

});

test('#getElementById', function() {
  let parentNode = dom.createElement('div'),
      childNode = dom.createElement('div');
  dom.setAttribute(parentNode, 'id', 'parent');
  dom.setAttribute(childNode, 'id', 'child');
  dom.appendChild(parentNode, childNode);
  dom.document.body.appendChild(parentNode);
  equalHTML(dom.getElementById('child'), '<div id="child"></div>');
  dom.document.body.removeChild(parentNode);
});

test('#setPropertyStrict', function(){
  let node = dom.createElement('div');
  dom.setPropertyStrict(node, 'id', 'super-tag');
  equalHTML(node, '<div id="super-tag"></div>');

  node = dom.createElement('input');
  ok(node.getAttribute('disabled') === disabledAbsentValue, 'precond: disabled is absent');
  dom.setPropertyStrict(node, 'disabled', true);
  ok(node.getAttribute('disabled') !== disabledAbsentValue, 'disabled is present');
  dom.setPropertyStrict(node, 'disabled', false);
  ok(node.getAttribute('disabled') === disabledAbsentValue, 'disabled has been removed');
});

// IE dislikes undefined or null for value
test('#setPropertyStrict value', function(){
  let node = dom.createElement('input');
  dom.setPropertyStrict(node, 'value', undefined);
  equal(node.value, '', 'blank string is set for undefined');
  dom.setPropertyStrict(node, 'value', null);
  equal(node.value, '', 'blank string is set for undefined');
});

// IE dislikes undefined or null for type
test('#setPropertyStrict type', function(){
  let node = dom.createElement('input');
  dom.setPropertyStrict(node, 'type', undefined);
  equal(node.type, 'text', 'text default is set for undefined');
  dom.setPropertyStrict(node, 'type', null);
  equal(node.type, 'text', 'text default is set for undefined');
});

// setting undefined or null to src makes a network request
test('#setPropertyStrict src', function(){
  let node = dom.createElement('img');
  dom.setPropertyStrict(node, 'src', undefined);
  notEqual(node.src, undefined, 'blank string is set for undefined');
  dom.setPropertyStrict(node, 'src', null);
  notEqual(node.src, null, 'blank string is set for undefined');
});

test('#removeAttribute', function(){
  let node = dom.createElement('div');
  dom.setAttribute(node, 'id', 'super-tag');
  equalHTML(node, '<div id="super-tag"></div>', 'precond - attribute exists');

  dom.removeAttribute(node, 'id');
  equalHTML(node, '<div></div>', 'attribute was removed');
});

test('#removeAttribute of SVG', function(){
  dom.setNamespace(svgNamespace);
  let node = dom.createElement('svg');
  dom.setAttribute(node, 'viewBox', '0 0 100 100');
  equalHTML(node, '<svg viewBox="0 0 100 100"></svg>', 'precond - attribute exists');

  dom.removeAttribute(node, 'viewBox');
  equalHTML(node, '<svg></svg>', 'attribute was removed');
});

test('#setProperty', function(){
  let node = dom.createElement('div');
  dom.setProperty(node, 'id', 'super-tag');
  equalHTML(node, '<div id="super-tag"></div>');
  dom.setProperty(node, 'id', null);
  ok(node.getAttribute('id') !== 'super-tag', 'null property sets to the property');

  node = dom.createElement('div');
  dom.setProperty(node, 'data-fun', 'whoopie');
  equalHTML(node, '<div data-fun="whoopie"></div>');
  dom.setProperty(node, 'data-fun', null);
  equalHTML(node, '<div></div>', 'null attribute removes the attribute');

  node = dom.createElement('input');
  dom.setProperty(node, 'disabled', true);
  equal(node.disabled, true);
  dom.setProperty(node, 'disabled', false);
  equal(node.disabled, false);

  node = dom.createElement('div');
  dom.setProperty(node, 'style', 'color: red;');
  equalHTML(node, '<div style="color: red;"></div>');
});

test('#setProperty removes attr with undefined', function(){
  let node = dom.createElement('div');
  dom.setProperty(node, 'data-fun', 'whoopie');
  equalHTML(node, '<div data-fun="whoopie"></div>');
  dom.setProperty(node, 'data-fun', undefined);
  equalHTML(node, '<div></div>', 'undefined attribute removes the attribute');
});

test('#setProperty uses setAttribute for special non-compliant element props', function() {
  expect(6);

  let badPairs = [
    { tagName: 'button', key: 'type', value: 'submit', selfClosing: false },
    { tagName: 'input', key: 'type', value: 'x-not-supported', selfClosing: true }
  ];

  badPairs.forEach(function(pair) {
    let node = dom.createElement(pair.tagName);
    let setAttribute = node.setAttribute;

    node.setAttribute = function(attrName, value) {
      equal(attrName, pair.key, 'setAttribute called with correct attrName');
      equal(value, pair.value, 'setAttribute called with correct value');
      return setAttribute.call(this, attrName, value);
    };

    dom.setProperty(node, pair.key, pair.value);

    // e.g. <button type="submit"></button>
    let expected = '<' + pair.tagName + ' ' + pair.key + '="' + pair.value + '">';
    if (pair.selfClosing === false) {
      expected += '</' + pair.tagName + '>';
    }

    equalHTML(node, expected, 'output html is correct');
  });
});

test('#addClasses', function(){
  let node = dom.createElement('div');
  dom.addClasses(node, ['super-fun']);
  equal(node.className, 'super-fun');
  dom.addClasses(node, ['super-fun']);
  equal(node.className, 'super-fun');
  dom.addClasses(node, ['super-blast']);
  equal(node.className, 'super-fun super-blast');
  dom.addClasses(node, ['bacon', 'ham']);
  equal(node.className, 'super-fun super-blast bacon ham');
});

test('#removeClasses', function(){
  let node = dom.createElement('div');
  node.setAttribute('class', 'this-class that-class');
  dom.removeClasses(node, ['this-class']);
  equal(node.className, 'that-class');
  dom.removeClasses(node, ['this-class']);
  equal(node.className, 'that-class');
  dom.removeClasses(node, ['that-class']);
  equal(node.className, '');
  node.setAttribute('class', 'woop moop jeep');
  dom.removeClasses(node, ['moop', 'jeep']);
  equal(node.className, 'woop');
});

test('#createElement of tr with contextual table element', function(){
  let tableElement = document.createElement('table'),
      node = dom.createElement('tr', tableElement);
  equal(node.tagName, 'TR');
  equalHTML(node, '<tr></tr>');
});

test('#createMorph has optional contextualElement', function(){
  let parent = document.createElement('div'),
      fragment = document.createDocumentFragment(),
      start = document.createTextNode(''),
      end = document.createTextNode(''),
      morph, thrown;

  try {
    morph = dom.createMorph(fragment, start, end, fragment);
  } catch(e) {
    thrown = true;
  }
  ok(thrown, 'Exception thrown when a fragment is provided for contextualElement');

  morph = dom.createMorph(fragment, start, end, parent);
  equal(morph.contextualElement, parent, "morph's contextualElement is parent");

  morph = dom.createMorph(parent, start, end);
  equal(morph.contextualElement, parent, "morph's contextualElement is parent");
});

test('#appendMorph', function(){
  let element = document.createElement('div');

  dom.appendText(element, 'a');
  let morph = dom.appendMorph(element);
  dom.appendText(element, 'c');

  morph.setContent('b');

  equal(element.innerHTML, 'abc');
});

test('#insertMorphBefore', function(){
  let element = document.createElement('div');

  dom.appendText(element, 'a');
  let c = dom.appendText(element, 'c');
  let morph = dom.insertMorphBefore(element, c);

  morph.setContent('b');

  equal(element.innerHTML, 'abc');
});

test('#parseHTML combinations', function(){
  let parsingCombinations = [
    // omitted start tags
    //
    ['table', '<tr><td>Yo</td></tr>', 'TR'],
    ['table', '<tbody><tr></tr></tbody>', 'TBODY'],
    ['table', '<col></col>', 'COL'],
    // elements with broken innerHTML in IE9 and down
    ['select', '<option></option>', 'OPTION'],
    ['colgroup', '<col></col>', 'COL'],
    ['tbody', '<tr></tr>', 'TR'],
    ['tfoot', '<tr></tr>', 'TR'],
    ['thead', '<tr></tr>', 'TR'],
    ['tr', '<td></td>', 'TD'],
    ['div', '<script></script>', 'SCRIPT']
  ];

  let contextTag, content, expectedTagName, contextElement, nodes;
  for (let p=0;p<parsingCombinations.length;p++) {
    contextTag = parsingCombinations[p][0];
    content = parsingCombinations[p][1];
    expectedTagName = parsingCombinations[p][2];

    contextElement = document.createElement(contextTag);
    nodes = dom.parseHTML(content, contextElement).childNodes;
    equal(
      nodes[0].tagName, expectedTagName,
      '#parseHTML of '+content+' returns a '+expectedTagName+' inside a '+contextTag+' context' );
  }
});

test('#parseHTML of script then tr inside table context wraps the tr in a tbody', function(){
  let tableElement = document.createElement('table'),
      nodes = dom.parseHTML('<script></script><tr><td>Yo</td></tr>', tableElement).childNodes;
  // The HTML spec suggests the first item must be the child of
  // the omittable start tag. Here script is the first child, so no-go.
  equal(nodes.length, 2, 'Leading script tag corrupts');
  equal(nodes[0].tagName, 'SCRIPT');
  equal(nodes[1].tagName, 'TBODY');
});

test('#parseHTML of select allows the initial implicit option selection to remain', function(){
  let div = document.createElement('div');
  let select = dom.parseHTML('<select><option></option></select>', div).childNodes[0];

  ok(select.childNodes[0].selected, 'first element is selected');
});

test('#parseHTML of options removes an implicit selection', function(){
  let select = document.createElement('select');
  let options = dom.parseHTML(
    '<option value="1"></option><option value="2"></option>',
    select
  ).childNodes;

  ok(!options[0].selected, 'first element is not selected');
  ok(!options[1].selected, 'second element is not selected');
});

test('#parseHTML of options leaves an explicit first selection', function(){
  let select = document.createElement('select');
  let options = dom.parseHTML(
    '<option value="1" selected></option><option value="2"></option>',
    select
  ).childNodes;

  ok(options[0].selected, 'first element is selected');
  ok(!options[1].selected, 'second element is not selected');
});

test('#parseHTML of options leaves an explicit second selection', function(){
  let select = document.createElement('select');
  let options = dom.parseHTML(
    '<option value="1"></option><option value="2" selected="selected"></option>',
    select
  ).childNodes;

  ok(!options[0].selected, 'first element is not selected');
  ok(options[1].selected, 'second element is selected');
});

test('#parseHTML of script then tr inside tbody context', function(){
  let tbodyElement = document.createElement('tbody'),
      nodes = dom.parseHTML('<script></script><tr><td>Yo</td></tr>', tbodyElement).childNodes;
  equal(nodes.length, 2, 'Leading script tag corrupts');
  equal(nodes[0].tagName, 'SCRIPT');
  equal(nodes[1].tagName, 'TR');
});

test('#parseHTML with retains whitespace', function(){
  let div = document.createElement('div');
  let nodes = dom.parseHTML('leading<script id="first"></script> <script id="second"></script><div><script></script> <script></script>, indeed.</div>', div).childNodes;
  equal(nodes[0].data, 'leading');
  equal(nodes[1].tagName, 'SCRIPT');
  equal(nodes[2].data, ' ');
  equal(nodes[3].tagName, 'SCRIPT');
  equal(nodes[4].tagName, 'DIV');
  equal(nodes[4].childNodes[0].tagName, 'SCRIPT');
  equal(nodes[4].childNodes[1].data, ' ');
  equal(nodes[4].childNodes[2].tagName, 'SCRIPT');
  equal(nodes[4].childNodes[3].data, ', indeed.');
});

test('#parseHTML with retains whitespace of top element', function(){
  let div = document.createElement('div');
  let nodes = dom.parseHTML('<span>hello <script id="first"></script> yeah</span>', div).childNodes;
  equal(nodes[0].tagName, 'SPAN');
  equalHTML(nodes, '<span>hello <script id="first"></script> yeah</span>');
});

test('#parseHTML with retains whitespace after script', function(){
  let div = document.createElement('div');
  let nodes = dom.parseHTML('<span>hello</span><script id="first"></script><span><script></script> kwoop</span>', div).childNodes;
  equal(nodes[0].tagName, 'SPAN');
  equal(nodes[1].tagName, 'SCRIPT');
  equal(nodes[2].tagName, 'SPAN');
  equalHTML(nodes, '<span>hello</span><script id="first"></script><span><script></script> kwoop</span>');
});

test('#parseHTML of number', function(){
  let div = document.createElement('div');
  let nodes = dom.parseHTML(5, div).childNodes;
  equal(nodes[0].data, '5');
  equalHTML(nodes, '5');
});

test('#protocolForURL', function() {
  let protocol = dom.protocolForURL("http://www.emberjs.com");
  equal(protocol, "http:");

  // Inherit protocol from document if unparseable
  protocol = dom.protocolForURL("   javascript:lulzhacked()");
  /*jshint scripturl:true*/
  equal(protocol, "javascript:");
});

test('#cloneNode shallow', function(){
  let divElement = document.createElement('div');

  divElement.appendChild( document.createElement('span') );

  let node = dom.cloneNode(divElement, false);

  equal(node.tagName, 'DIV');
  equalHTML(node, '<div></div>');
});

test('#cloneNode deep', function(){
  let divElement = document.createElement('div');

  divElement.appendChild( document.createElement('span') );

  let node = dom.cloneNode(divElement, true);

  equal(node.tagName, 'DIV');
  equalHTML(node, '<div><span></span></div>');
});

test('dom node has empty text after cloning and ensuringBlankTextNode', function(){
  let div = document.createElement('div');

  div.appendChild( document.createTextNode('') );

  let clonedDiv = dom.cloneNode(div, true);

  equal(clonedDiv.nodeType, 1);
  equalHTML(clonedDiv, '<div></div>');
  // IE's native cloneNode drops blank string text
  // nodes. Assert repairClonedNode brings back the blank
  // text node.
  dom.repairClonedNode(clonedDiv, [0]);
  equal(clonedDiv.childNodes.length, 1);
  equal(clonedDiv.childNodes[0].nodeType, 3);
});

test('dom node has empty start text after cloning and ensuringBlankTextNode', function(){
  let div = document.createElement('div');

  div.appendChild( document.createTextNode('') );
  div.appendChild( document.createElement('span') );

  let clonedDiv = dom.cloneNode(div, true);

  equal(clonedDiv.nodeType, 1);
  equalHTML(clonedDiv, '<div><span></span></div>');
  // IE's native cloneNode drops blank string text
  // nodes. Assert denormalizeText brings back the blank
  // text node.
  dom.repairClonedNode(clonedDiv, [0]);
  equal(clonedDiv.childNodes.length, 2);
  equal(clonedDiv.childNodes[0].nodeType, 3);
});

test('dom node checked after cloning and ensuringChecked', function(){
  let input = document.createElement('input');

  input.setAttribute('checked', 'checked');
  ok(input.checked, 'input is checked');

  let clone = dom.cloneNode(input, false);

  // IE's native cloneNode copies checked attributes but
  // not the checked property of the DOM node.
  dom.repairClonedNode(clone, [], true);

  isCheckedInputHTML(clone, '<input checked="checked">');
  ok(clone.checked, 'clone is checked');
});

if ('namespaceURI' in document.createElement('div')) {

QUnit.module('DOM Helper namespaces', {
  beforeEach: function() {
    dom = new DOMHelper();
  },
  afterEach: function() {
    dom = null;
  }
});

test('#createElement div is xhtml', function(){
  let node = dom.createElement('div');
  equal(node.namespaceURI, xhtmlNamespace);
});

test('#createElement of svg with svg namespace', function(){
  dom.setNamespace(svgNamespace);
  let node = dom.createElement('svg');
  equal(node.tagName, 'svg');
  equal(node.namespaceURI, svgNamespace);
});

test('#createElement of path with detected svg contextual element', function(){
  dom.setNamespace(svgNamespace);
  let node = dom.createElement('path');
  equal(node.tagName, 'path');
  equal(node.namespaceURI, svgNamespace);
});

test('#createElement of path with svg contextual element', function(){
  let node = dom.createElement('path', document.createElementNS(svgNamespace, 'svg'));
  equal(node.tagName, 'path');
  equal(node.namespaceURI, svgNamespace);
});

test('#createElement of svg with div namespace', function(){
  let node = dom.createElement('svg', document.createElement('div'));
  equal(node.tagName, 'svg');
  equal(node.namespaceURI, svgNamespace);
});

test('#getElementById with different root node', function() {
  let doc = document.implementation.createDocument(xhtmlNamespace, 'html', null),
      body = document.createElementNS(xhtmlNamespace, 'body'),
      parentNode = dom.createElement('div'),
      childNode = dom.createElement('div');

  doc.documentElement.appendChild(body);
  dom.setAttribute(parentNode, 'id', 'parent');
  dom.setAttribute(childNode, 'id', 'child');
  dom.appendChild(parentNode, childNode);
  dom.appendChild(body, parentNode);
  equalHTML(dom.getElementById('child', doc), '<div id="child"></div>');
});

test('#setProperty with namespaced attributes', function() {
  let node;

  dom.setNamespace(svgNamespace);
  node = dom.createElement('svg');
  dom.setProperty(node, 'viewBox', '0 0 0 0');
  equalHTML(node, '<svg viewBox="0 0 0 0"></svg>');

  dom.setProperty(node, 'xlink:title', 'super-blast', xlinkNamespace);
  // chrome adds (xmlns:xlink="http://www.w3.org/1999/xlink") property while others don't
  // thus equalHTML is not useful
  let el = document.createElement('div');
  el.appendChild(node);
  // phantom js omits the prefix so we can't look for xlink:
  ok(el.innerHTML.indexOf('title="super-blast"') > 0);

  dom.setProperty(node, 'xlink:title', null, xlinkNamespace);
  equal(node.getAttribute('xlink:title'), null, 'ns attr is removed');
});

test("#setProperty removes namespaced attr with undefined", function() {
  let node;

  node = dom.createElement('svg');
  dom.setProperty(node, 'xlink:title', 'Great Title', xlinkNamespace);
  dom.setProperty(node, 'xlink:title', undefined, xlinkNamespace);
  equal(node.getAttribute('xlink:title'), undefined, 'ns attr is removed');
});

for (i=0;i<foreignNamespaces.length;i++) {
  foreignNamespace = foreignNamespaces[i];

  test('#createElement of div with '+foreignNamespace+' contextual element', function(){
    let node = dom.createElement('div', document.createElementNS(svgNamespace, foreignNamespace));
    equal(node.tagName, 'DIV');
    equal(node.namespaceURI, xhtmlNamespace);
  }); // jshint ignore:line

  test('#parseHTML of div with '+foreignNamespace, function(){
    dom.setNamespace(xhtmlNamespace);
    let foreignObject = document.createElementNS(svgNamespace, foreignNamespace),
        nodes = dom.parseHTML('<div></div>', foreignObject).childNodes;
    equal(nodes[0].tagName, 'DIV');
    equal(nodes[0].namespaceURI, xhtmlNamespace);
  }); // jshint ignore:line
}

test('#parseHTML of path with svg contextual element', function(){
  dom.setNamespace(svgNamespace);
  let svgElement = document.createElementNS(svgNamespace, 'svg'),
      nodes = dom.parseHTML('<path></path>', svgElement).childNodes;
  equal(nodes[0].tagName, 'path');
  equal(nodes[0].namespaceURI, svgNamespace);
});

test('#parseHTML of stop with linearGradient contextual element', function(){
  dom.setNamespace(svgNamespace);
  let svgElement = document.createElementNS(svgNamespace, 'linearGradient'),
      nodes = dom.parseHTML('<stop />', svgElement).childNodes;
  equal(nodes[0].tagName, 'stop');
  equal(nodes[0].namespaceURI, svgNamespace);
});

test('#addClasses on SVG', function(){
  let node = document.createElementNS(svgNamespace, 'svg');
  dom.addClasses(node, ['super-fun']);
  equal(node.getAttribute('class'), 'super-fun');
  dom.addClasses(node, ['super-fun']);
  equal(node.getAttribute('class'), 'super-fun');
  dom.addClasses(node, ['super-blast']);
  equal(node.getAttribute('class'), 'super-fun super-blast');
});

test('#removeClasses on SVG', function(){
  let node = document.createElementNS(svgNamespace, 'svg');
  node.setAttribute('class', 'this-class that-class');
  dom.removeClasses(node, ['this-class']);
  equal(node.getAttribute('class'), 'that-class');
  dom.removeClasses(node, ['this-class']);
  equal(node.getAttribute('class'), 'that-class');
  dom.removeClasses(node, ['that-class']);
  equal(node.getAttribute('class'), '');
});


}

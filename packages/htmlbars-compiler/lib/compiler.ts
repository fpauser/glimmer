import { preprocess } from "htmlbars-syntax";
import TemplateCompiler from "./template-compiler";
import { Template } from "htmlbars-runtime";

/*
 * Compile a string into a template spec string. The template spec is a string
 * representation of a template. Usually, you would use compileSpec for
 * pre-compilation of a template on the server.
 *
 * Example usage:
 *
 *     let templateSpec = compileSpec("Howdy {{name}}");
 *     // This next step is basically what plain compile does
 *     let template = new Function("return " + templateSpec)();
 *
 * @method compileSpec
 * @param {String} string An HTMLBars template string
 * @return {TemplateSpec} A template spec string
 */
export function compileSpec(string, options) {
  let ast = preprocess(string, options);
  let program = TemplateCompiler.compile(options, ast);
  return JSON.stringify(program);
}

/*
 * @method template
 * @param {TemplateSpec} templateSpec A precompiled template
 * @return {Template} A template spec string
 */
export function template(templateSpec) {
  return new Function("return " + templateSpec)();
}

/*
 * Compile a string into a template rendering function
 *
 * Example usage:
 *
 *     // Template is the hydration portion of the compiled template
 *     let template = compile("Howdy {{name}}");
 *
 *     // Template accepts three arguments:
 *     //
 *     //   1. A context object
 *     //   2. An env object
 *     //   3. A contextualElement (optional, document.body is the default)
 *     //
 *     // The env object *must* have at least these two properties:
 *     //
 *     //   1. `hooks` - Basic hooks for rendering a template
 *     //   2. `dom` - An instance of DOMHelper
 *     //
 *     import {hooks} from 'htmlbars-runtime';
 *     import {DOMHelper} from 'morph';
 *     let context = {name: 'whatever'},
 *         env = {hooks: hooks, dom: new DOMHelper()},
 *         contextualElement = document.body;
 *     let domFragment = template(context, env, contextualElement);
 *
 * @method compile
 * @param {String} string An HTMLBars template string
 * @param {Object} options A set of options to provide to the compiler
 * @return {Template} A function for rendering the template
 */
export function compile(string: string, options: Object={}) {
  let templateSpec = template(compileSpec(string, options));
  return Template.fromSpec(templateSpec);
}

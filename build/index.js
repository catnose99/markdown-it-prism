"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = markdownItPrism;

var _prismjs = _interopRequireDefault(require("prismjs"));

var _components = _interopRequireDefault(require("prismjs/components/"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const DEFAULTS = {
  plugins: [],
  init: () => {// do nothing by default
  },
  defaultLanguageForUnknown: undefined,
  defaultLanguageForUnspecified: undefined,
  defaultLanguage: undefined
};
/**
 * Loads the provided {@code lang} into prism.
 *
 * @param lang
 *        Code of the language to load.
 * @return The Prism language object for the provided {@code lang} code. {@code undefined} if the language is not known to Prism.
 */

function loadPrismLang(lang) {
  if (!lang) return undefined;
  let langObject = _prismjs.default.languages[lang];

  if (langObject === undefined) {
    (0, _components.default)([lang]);
    langObject = _prismjs.default.languages[lang];
  }

  return langObject;
}
/**
 * Loads the provided Prism plugin.a
 * @param name
 *        Name of the plugin to load
 * @throws {Error} If there is no plugin with the provided {@code name}
 */


function loadPrismPlugin(name) {
  try {
    require(`prismjs/plugins/${name}/prism-${name}`);
  } catch (e) {
    throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`);
  }
}
/**
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param options
 *        The options that were used to initialise the plugin.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return  The name of the language to use and the Prism language object for that language.
 */


function selectLanguage(options, lang) {
  let langToUse = lang;

  if (langToUse === "" && options.defaultLanguageForUnspecified !== undefined) {
    langToUse = options.defaultLanguageForUnspecified;
  }

  let prismLang = loadPrismLang(langToUse);

  if (prismLang === undefined && options.defaultLanguageForUnknown !== undefined) {
    langToUse = options.defaultLanguageForUnknown;
    prismLang = loadPrismLang(langToUse);
  }

  return [langToUse, prismLang];
}
/**
 * Highlights the provided text using Prism.
 *
 * @param markdownit
 *        The markdown-it instance
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param text
 *        The text to highlight.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return {@code text} wrapped in {@code &lt;pre&gt;} and {@code &lt;code&gt;}, both equipped with the appropriate class
 *  (markdown-it’s langPrefix + lang). If Prism knows {@code lang}, {@code text} will be highlighted by it.
 */


function highlight(markdownit, options, text, lang) {
  const _selectLanguage = selectLanguage(options, lang),
        _selectLanguage2 = _slicedToArray(_selectLanguage, 2),
        langToUse = _selectLanguage2[0],
        prismLang = _selectLanguage2[1];

  const code = prismLang ? _prismjs.default.highlight(text, prismLang, langToUse) : markdownit.utils.escapeHtml(text);
  const classAttribute = langToUse ? ` class="${markdownit.options.langPrefix}${markdownit.utils.escapeHtml(langToUse)}"` : "";
  return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`;
}
/**
 * Checks whether an option represents a valid Prism language
 *
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param optionName
 *        The key of the option inside {@code options} that shall be checked.
 * @throws {Error} If the option is not set to a valid Prism language.
 */


function checkLanguageOption(options, optionName) {
  const language = options[optionName];

  if (language !== undefined && loadPrismLang(language) === undefined) {
    throw new Error(`Bad option ${optionName}: There is no Prism language '${language}'.`);
  }
}
/**
 * Initialisation function of the plugin. This function is not called directly by clients, but is rather provided
 * to MarkdownIt’s {@link MarkdownIt.use} function.
 *
 * @param markdownit
 *        The markdown it instance the plugin is being registered to.
 * @param useroptions
 *        The options this plugin is being initialised with.
 */


function markdownItPrism(markdownit, useroptions) {
  const options = Object.assign({}, DEFAULTS, useroptions);
  checkLanguageOption(options, "defaultLanguage");
  checkLanguageOption(options, "defaultLanguageForUnknown");
  checkLanguageOption(options, "defaultLanguageForUnspecified");
  options.defaultLanguageForUnknown = options.defaultLanguageForUnknown || options.defaultLanguage;
  options.defaultLanguageForUnspecified = options.defaultLanguageForUnspecified || options.defaultLanguage;
  options.plugins.forEach(loadPrismPlugin);
  options.init(_prismjs.default); // register ourselves as highlighter

  markdownit.options.highlight = (...args) => highlight(markdownit, options, ...args);
}

module.exports = exports.default;
module.exports.default = exports.default;
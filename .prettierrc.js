// @see: https://www.prettier.cn

/** @type {import("prettier").Config} */
export default {
  // Specifies the maximum line break length
  printWidth: 130,
  // Tab width in either tab characters or spaces
  tabWidth: 2,
  // Use tabs for indentation (true: tabs, false: spaces)
  useTabs: false,
  // Use semicolons at the end of statements (true: yes, false: no)
  semi: true,
  // JS/TS strings: single quotes. Do not also enable ESLint `quotes` — prettier owns this.
  singleQuote: true,
  // Determine whether to use quotes around property names in object literals ("<as-needed|consistent|preserve>")
  quoteProps: 'as-needed',
  // JSX attributes: single quotes, same as JS/TS. JSON still uses double quotes (language requirement).
  jsxSingleQuote: true,
  // Print trailing commas in multiline objects and arrays ("<none|es5|all>")
  trailingComma: 'none',
  // Add spaces between braces in object literals and arrays "{ foo: bar }" (true: yes, false: no)
  bracketSpacing: true,
  // Put > of JSX elements at the end of the last line instead of on a new line (true: end of last line, false: on a new line)
  bracketSameLine: false,
  // Include parentheses around a sole arrow function parameter (avoid: omit parentheses, always: include parentheses)
  arrowParens: 'avoid',
  // Specify the parser to use, no need to include @prettier at the beginning of files
  requirePragma: false,
  // Insert a special @format marker at the top of the file to indicate that the file has been formatted with Prettier
  insertPragma: false,
  // Control how text is wrapped (preserve: no wrapping)
  proseWrap: 'preserve',
  // Define whether spaces in HTML are considered sensitive ("css": follow CSS display property default values, "strict": spaces are considered sensitive, "ignore": spaces are considered insensitive)
  htmlWhitespaceSensitivity: 'css',
  // Define the line ending to use for formatting ("<auto|lf|crlf|cr>")
  endOfLine: 'auto',
  // These two options can be used to format code starting and ending at given character offsets (rangeStart: start, rangeEnd: end)
  rangeStart: 0,
  rangeEnd: Infinity
};

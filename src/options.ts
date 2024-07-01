export const defaultOptions = {
  /**
   * Color of parameters (ANSI escape code)
   */
  colorParameter: undefined as undefined | string,
  /**
   * Color of query (ANSI escape code)
   */
  colorQuery: undefined as undefined | string,
  /**
   * Format SQL query,
   * colorQuery/colorParameter will be ignored.
   */
  format: false,
  /**
   * Characters used for indentation
   */
  indent: '    ',
  /**
   * Query language, default is Standard SQL
   */
  language: undefined as 'sql' | 'n1ql' | 'db2' | 'pl/sql' | undefined,

  /**
   * Formatter options
   * https://github.com/mtxr/vscode-sqltools/tree/master/packages/formatter#options
   */

  /**
   * How many line breaks between queries
   */
  linesBetweenQueries: 1 as number | 'preserve',

  /**
   * Boolean of custom log function,
   * if true `console.log` will be used,
   * if false noop - logs nothing.
   */
  logger: true as boolean | ((query: string) => unknown),
  /**
   * Show Query Duration, default is false
   */
  queryDuration: false as boolean,
  /**
   * How to change the case of reserved words
   */

  reservedWordCase: null as 'upper' | 'lower' | null,
  /**
   * Remove backticks.
   */
  unescape: true,
};

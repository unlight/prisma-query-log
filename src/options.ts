export const defaultOptions = {
    /**
     * Boolean of custom log function,
     * if true `console.log` will be used,
     * if false noop - logs nothing.
     */
    logger: true as boolean | ((query: string) => unknown),
    /**
     * Remove backticks.
     */
    unescape: true,
    /**
     * Color of query (ANSI escape code)
     */
    colorQuery: undefined as undefined | string,
    /**
     * Color of parameters (ANSI escape code)
     */
    colorParameter: undefined as undefined | string,
    /**
     * Format SQL query,
     * colorQuery/colorParameter will be ignored.
     */
    format: false,

    /**
     * Formatter options
     * https://github.com/mtxr/vscode-sqltools/tree/master/packages/formatter#options
     */

    /**
     * Query language, default is Standard SQL
     */
    language: undefined as 'sql' | 'n1ql' | 'db2' | 'pl/sql' | undefined,
    /**
     * Characters used for indentation
     */
    indent: '    ',
    /**
     * How to change the case of reserved words
     */
    // eslint-disable-next-line unicorn/no-null
    reservedWordCase: null as 'upper' | 'lower' | null,
    /**
     * How many line breaks between queries
     */
    linesBetweenQueries: 1 as number | 'preserve',
};

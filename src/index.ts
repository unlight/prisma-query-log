export type PrismaQueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};

const defaultOptions = {
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
     * Format SQL query.
     */
    format: false,
    /**
     * Poor Man's T-SQL Formatter options
     * https://github.com/TaoK/poor-mans-t-sql-formatter-npm-package#usage
     */
    formatterOptions: {
        maxLineWidth: 0 as number | undefined,
        indent: '    ' as string | undefined,
        expandCommaLists: false as boolean | undefined,
        expandInLists: false as boolean | undefined,
    },
};

type CreatePrismaQueryEventHandlerArgs = typeof defaultOptions;

let formatter: any;

export function createPrismaQueryEventHandler(
    args: Partial<CreatePrismaQueryEventHandlerArgs> = {},
): (event: PrismaQueryEvent) => void {
    const customFormatterOptions = args?.formatterOptions ?? {};
    const options = { ...defaultOptions, ...args };
    const logger = options.logger === true ? console.log : options.logger ?? false;
    if (!logger) {
        return Function.prototype as (event: PrismaQueryEvent) => void; // noop
    }
    const { unescape, colorQuery, format } = options;
    const formatterOptions = { ...options.formatterOptions, ...customFormatterOptions };
    const colorParameter = options.colorParameter ?? colorQuery;

    return function prismaQueryLog(event: PrismaQueryEvent) {
        const eventParams = event.params.replace(
            /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ UTC/g,
            date => `"${date}"`,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const params: any[] = JSON.parse(eventParams);
        let query = event.query;
        if (unescape) {
            query = unescapeQuery(query);
        }

        if (format) {
            if (!formatter) {
                formatter = require('poor-mans-t-sql-formatter');
                if (!formatterOptions.maxLineWidth) {
                    const termSize = require('term-size');
                    formatterOptions.maxLineWidth = termSize().columns - 12;
                }
            }
            query = '\n' + formatter.formatSql(query, formatterOptions).text.trim();
        }

        query = query.replace(/\?/g, () => {
            let parameter = JSON.stringify(params.shift());
            if (colorQuery && colorParameter) {
                parameter = colorParameter + parameter + '\u001B[0m' + colorQuery;
            }
            return parameter;
        });
        if (colorQuery && colorParameter) {
            query = colorQuery + query + '\u001B[0m';
        }

        logger(query);
    };
}

function unescapeQuery(query: string) {
    const regex = /`\w+`(\.`\w+`)?(\.`\w+`)?/g;
    const matchAllResult = query.matchAll(regex);
    const matches = Array.from(matchAllResult);
    for (let index = matches.length - 1; index >= 0; index--) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { 0: fullMatch, index: matchIndex } = matches[index]!;
        if (!matchIndex || !fullMatch) {
            continue;
        }
        const parts = fullMatch.split('`.`');
        let replacement = '';
        if (parts.length >= 2) {
            parts.shift();
            replacement = parts.join('.').slice(0, -1);
        } else {
            replacement = parts[0]!.slice(1, -1);
        }
        query =
            query.slice(0, matchIndex) +
            replacement +
            query.slice(matchIndex + fullMatch.length);
    }

    return query;
}

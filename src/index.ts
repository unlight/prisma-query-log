export type PrismaQueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};

const defaultFormatterOptions = {
    language: undefined as string | undefined,
    indent: '    ',
    reservedWordCase: null as 'upper' | 'lower' | null,
    linesBetweenQueries: 1 as number | 'preserve',
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
     * Format SQL query,
     * colorQuery/colorParameter will be ignored.
     */
    format: false,
    /**
     * Formatter options
     * https://github.com/mtxr/vscode-sqltools/tree/master/packages/formatter#options
     */
    formatterOptions: defaultFormatterOptions as Partial<
        typeof defaultFormatterOptions
    >,
};

type CreatePrismaQueryEventHandlerArgs = typeof defaultOptions;

let formatter: any;

export function createPrismaQueryEventHandler(
    args: Partial<CreatePrismaQueryEventHandlerArgs> = {},
): (event: PrismaQueryEvent) => void {
    const customFormatterOptions = args.formatterOptions ?? {};
    const options = { ...defaultOptions, ...args };
    const logger = options.logger === true ? console.log : options.logger ?? false;
    if (!logger) {
        return Function.prototype as (event: PrismaQueryEvent) => void; // noop
    }
    const { unescape, format } = options;
    const formatterOptions = { ...options.formatterOptions, ...customFormatterOptions };
    const colorQuery = format ? false : options.colorQuery;
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

        query = query.replace(/\?/g, () => {
            let parameter = JSON.stringify(params.shift());
            if (colorQuery && colorParameter) {
                parameter = colorParameter + parameter + '\u001B[0m' + colorQuery;
            }
            return parameter;
        });

        if (format) {
            if (!formatter) {
                formatter = require('@sqltools/formatter');
            }
            query = formatter.format(query, formatterOptions).trim();
        }

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

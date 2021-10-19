import { defaultOptions } from './options';

export type PrismaQueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};

type CreatePrismaQueryEventHandlerArgs = typeof defaultOptions;

let formatter: any;

export function createPrismaQueryEventHandler(
    args: Partial<CreatePrismaQueryEventHandlerArgs> = {},
): (event: PrismaQueryEvent) => void {
    const options = { ...defaultOptions, ...args };
    const logger = options.logger === true ? console.log : options.logger;
    if (typeof logger !== 'function') {
        return Function.prototype as (event: PrismaQueryEvent) => void; // noop
    }
    const { unescape, format } = options;
    const colorQuery = format ? false : options.colorQuery;
    const colorParameter = options.colorParameter ?? colorQuery;

    return function prismaQueryLog(event: PrismaQueryEvent) {
        const eventParams = event.params.replace(
            /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.?\d* UTC/g,
            date => `"${date}"`,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const params: any[] = JSON.parse(eventParams);
        let query = event.query;
        if (unescape) {
            query = unescapeQuery(query);
        }

        query = query.replace(/\?/g, (_, index, string: string) => {
            let parameter = JSON.stringify(params.shift());
            const previousChar = string.charAt(index - 1);
            if (colorQuery && colorParameter) {
                parameter = colorParameter + parameter + '\u001B[0m' + colorQuery;
            }

            return (previousChar === ',' ? ' ' : '') + parameter;
        });

        if (format) {
            if (!formatter) {
                formatter = require('@sqltools/formatter');
            }
            query = formatter.format(query, options).trim();
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

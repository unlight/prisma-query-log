export type PrismaQueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};

type CreatePrismaQueryEventHandlerArgs = {
    /**
     * Boolean of custom log function,
     * if true `console.log` will be used,
     * if false noop - logs nothing.
     * Default: true
     */
    logger?: boolean | ((query: string) => unknown);
    /**
     * Remove backticks.
     * Default: true
     */
    unescape?: boolean;
};

export function createPrismaQueryEventHandler(
    args: CreatePrismaQueryEventHandlerArgs = {},
): (event: PrismaQueryEvent) => void {
    const logger = args.logger === true ? console.log : args.logger ?? false;
    if (!logger) {
        return Function.prototype as (event: PrismaQueryEvent) => void; // noop
    }
    const unescape = args.unescape ?? true;

    return function prismaQueryLog(event: PrismaQueryEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const params: any[] = JSON.parse(event.params);
        let query = event.query;
        if (unescape) {
            query = unescapeQuery(query);
        }
        query = query.replace(/\?/g, () => {
            return `${JSON.stringify(params.shift())}`;
        });
        logger(`${query}`);
    };
}

function unescapeQuery(query: string) {
    const regex = /`\w+`\.`\w+`(\.`\w+`)?/g;
    const matchAllResult = query.matchAll(regex);
    const matches = Array.from(matchAllResult);
    for (let index = matches.length - 1; index >= 0; index--) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { 0: fullMatch, index: matchIndex } = matches[index]!;
        if (!matchIndex || !fullMatch) {
            continue;
        }
        const parts = fullMatch.split('`.`');
        if (parts.length >= 2) {
            parts.shift();
            const replacement = parts.join('.').slice(0, -1);
            query =
                query.slice(0, matchIndex) +
                replacement +
                query.slice(matchIndex + fullMatch.length);
        }
    }

    return query;
}

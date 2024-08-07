import { defaultOptions } from './options';

export type PrismaQueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

type CreatePrismaQueryEventHandlerArgs = typeof defaultOptions;

let formatter: { format: (query: string, options) => string };

export function createPrismaQueryEventHandler(
  args: Partial<CreatePrismaQueryEventHandlerArgs> = {},
): (event: PrismaQueryEvent) => void {
  const options = { ...defaultOptions, ...args };
  const logger = options.logger === true ? console.log : options.logger;
  if (typeof logger !== 'function') {
    return Function.prototype as (event: PrismaQueryEvent) => void; // noop
  }
  const { format, unescape } = options;
  const colorQuery = format ? false : options.colorQuery;
  const colorParameter = options.colorParameter ?? colorQuery;

  return function prismaQueryLog(event: PrismaQueryEvent) {
    let query = event.query;
    const parameters = parseParameters(event.params);
    if (unescape) {
      query = unescapeQuery(query);
    }

    if (parameters.length > 0) {
      query = query.replace(
        /(\?|\$\d+)/g,
        (match, p1, offset, string: string) => {
          let parameter = JSON.stringify(parameters.shift());
          const previousChar = string.charAt(offset - 1);
          if (colorQuery && colorParameter) {
            parameter = colorParameter + parameter + '\u001B[0m' + colorQuery;
          }

          return (previousChar === ',' ? ' ' : '') + parameter;
        },
      );
    }

    if (format) {
      if (!(formatter as typeof formatter | undefined)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseParameters(parameters: string): any[] {
  parameters = parameters.replace(
    /([^"])(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.?\d* UTC)([^"])/g,
    '$1"$2"$3',
  );

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(parameters);
  } catch {
    return [];
  }
}

function unescapeQuery(query: string) {
  const regex = /(?<quote>["`])\w+["`](\.["`]\w+["`])?(\.["`]\w+["`])?/g;
  const matchAllResult = query.matchAll(regex);
  const matches = Array.from(matchAllResult);
  for (let index = matches.length - 1; index >= 0; index--) {
    const {
      0: fullMatch,
      groups: { quote } = {},
      index: matchIndex,
    } = matches[index]!;
    if (!matchIndex || !fullMatch) {
      continue;
    }
    let replacement = fullMatch.replace(
      /["`]\w+["`]\.(["`]\w+["`](\.["`]\w+["`])?)/g,
      '$1',
    );
    if (quote === '`') {
      const parts = replacement.split('`.`');
      replacement = parts.join('.').slice(1, -1);
    }
    query =
      query.slice(0, matchIndex) +
      replacement +
      query.slice(matchIndex + fullMatch.length);
  }

  return query;
}

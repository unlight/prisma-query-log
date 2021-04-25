# prisma-query-log

Log prisma query event

Features:

-   Substitute parameters
-   Remove backticks and database prefix

## Install

```sh
npm install --save-dev prisma-query-log
```

## Usage

```typescript
import { createPrismaQueryEventHandler } from 'prisma-query-log';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: [
        {
            level: 'query',
            emit: 'event',
        },
    ],
});

const log = createPrismaQueryEventHandler();

prisma.$on('query', log);
```

## API

```ts
function createPrismaQueryEventHandler(
    options?: CreatePrismaQueryEventHandlerArgs,
): (event: PrismaQueryEvent) => void;

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
```

## Other projects

https://github.com/unlight/nestolog - Logger for NestJS, implements `LoggerService`

## Screenshots

#### Before

![](docs/before.png)

#### After

![](docs/after.png)

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
     * Format SQL query.
     */
    format: false,
    /**
     * Poor Man's T-SQL Formatter options
     * https://github.com/TaoK/poor-mans-t-sql-formatter-npm-package#usage
     */
    formatterOptions: {
        maxLineWidth: 80,
        indent: '    ',
        expandCommaLists: false,
        expandInLists: false,
    },
};
```

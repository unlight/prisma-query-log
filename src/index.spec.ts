import expect from 'expect';

import { createPrismaQueryEventHandler, PrismaQueryEvent } from '.';

const basePrismaQueryEvent: PrismaQueryEvent = {
    timestamp: new Date(),
    query: 'SELECT 1',
    params: '[]',
    duration: 0,
    target: 'quaint::connector::metrics',
};

it('smoke', () => {
    expect(typeof createPrismaQueryEventHandler).toEqual('function');
});

it('should return function', () => {
    const log = createPrismaQueryEventHandler();
    expect(typeof log).toEqual('function');
});

it('empty parameters', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        format: false,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: 'SELECT 1',
        params: '[]',
    };
    log(event);
    expect(query).toEqual('SELECT 1');
});

it('replace parameters', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        unescape: false,
        format: false,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: 'SELECT VERSION() LIMIT ? OFFSET ?',
        params: '[1,0]',
    };
    log(event);
    expect(query).toEqual('SELECT VERSION() LIMIT 1 OFFSET 0');
});

it('unescape fields', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        unescape: true,
        format: false,
    });
    const event = {
        ...basePrismaQueryEvent,
        query:
            'SELECT `data`.`Article`.`articleId` FROM `data`.`Article` WHERE `data`.`Article`.`articleId` = ?',
        params: '["1"]',
    };
    log(event);
    expect(query).toEqual(
        'SELECT Article.articleId FROM Article WHERE Article.articleId = "1"',
    );
});

it('colorize query', () => {
    let query = '';
    const colorQuery = '\u001B[96m';
    const colorParameter = '\u001B[90m';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        unescape: true,
        format: false,
        colorQuery,
        colorParameter,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: 'SELECT ?',
        params: '["A"]',
    };
    log(event);
    expect(query).toEqual(
        colorQuery +
            'SELECT ' +
            colorParameter +
            '"A"' +
            '\u001B[0m' +
            colorQuery +
            '\u001B[0m',
    );
});

it('parse date parameter', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        unescape: false,
        format: false,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: 'INSERT INTO Comment (commentId, createdAt) VALUES (?,?)',
        params: '["1",2020-12-25 19:35:06.803149100 UTC]',
    };
    log(event);
    expect(query).toEqual(
        'INSERT INTO Comment (commentId, createdAt) VALUES ("1","2020-12-25 19:35:06.803149100 UTC")',
    );
});

it('update single statement', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        unescape: true,
        format: false,
    });
    const event = {
        ...basePrismaQueryEvent,
        query:
            'UPDATE `data`.`Article` SET `updatedAt` = ?, `body` = ? WHERE `data`.`Article`.`articleId` IN (?)',
        params: '[2020-12-25 20:02:45.589918800 UTC,"body","1"]',
    };
    log(event);
    expect(query).toEqual(
        'UPDATE Article SET updatedAt = "2020-12-25 20:02:45.589918800 UTC", body = "body" WHERE Article.articleId IN ("1")',
    );
});

it('format sql defaults', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        format: true,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: 'SELECT EmployeeId, FirstName FROM Employees',
        params: '[]',
    };
    log(event);
    expect(query).toEqual(`\nSELECT EmployeeId, FirstName
FROM Employees`);
});

it('format join query', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        format: true,
    });
    const event = {
        ...basePrismaQueryEvent,
        query: `SELECT * FROM Someplace S FULL OUTER JOIN Elsewhere AS E WITH (HOLDLOCK, INDEX(IX_TEST)) ON 1=1 and X = ? and Y = ?`,
        params: '[1,"B"]',
    };
    log(event);
    expect(query).toEqual(`\nSELECT *
FROM Someplace S
FULL OUTER JOIN Elsewhere AS E WITH (HOLDLOCK, INDEX (IX_TEST)) ON 1 = 1
    AND X = 1
    AND Y = "B"`);
});

it('format with color', () => {
    let query = '';
    const log = createPrismaQueryEventHandler({
        logger: (q: string) => (query = q),
        format: true,
        colorQuery: '\u001B[96m',
        colorParameter: '\u001B[90m',
    });
    const event = {
        ...basePrismaQueryEvent,
        query: `SELECT * FROM Someplace S WHERE X = ?`,
        params: '[1]',
    };
    log(event);
    expect(query).toEqual(
        `\u001b[96m\nSELECT *\nFROM Someplace S\nWHERE X = \u001b[90m${1}\u001b[0m\u001b[96m\u001b[0m`,
    );
});

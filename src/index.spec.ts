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

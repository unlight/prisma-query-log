import expect from 'expect';

import { createPrismaQueryEventHandler, PrismaQueryEvent } from '.';

const basePrismaQueryEvent: PrismaQueryEvent = {
    timestamp: new Date(),
    query: 'select 1',
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

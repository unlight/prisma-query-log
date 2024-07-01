import stripAnsi from 'strip-ansi';
import { expect, it } from 'vitest';

import { createPrismaQueryEventHandler, PrismaQueryEvent } from '.';

const basePrismaQueryEvent: PrismaQueryEvent = {
  duration: 0,
  params: '[]',
  query: 'SELECT 1',
  target: 'quaint::connector::metrics',
  timestamp: new Date(),
};

it('smoke', () => {
  expect(typeof createPrismaQueryEventHandler).toEqual('function');
});

it('should return function', () => {
  const log = createPrismaQueryEventHandler();
  expect(typeof log).toEqual('function');
});

it('logger disabled noop', () => {
  const log = createPrismaQueryEventHandler({ logger: false });
  expect(typeof log).toBe('function');
  expect(log).toBe(Function.prototype);
  expect(() => log(basePrismaQueryEvent)).not.toThrow();
});

it('empty parameters', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[]',
    query: 'SELECT 1',
  };
  log(event);
  expect(query).toEqual('SELECT 1');
});

it('replace parameters default', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: false,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[1,0]',
    query: 'SELECT VERSION() LIMIT ? OFFSET ?',
  };
  log(event);
  expect(query).toEqual('SELECT VERSION() LIMIT 1 OFFSET 0');
});

it('replace parameters format', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: true,
    logger: (q: string) => (query = q),
    unescape: false,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[1,"A"]',
    query: 'SELECT ?, ?',
  };
  log(event);
  expect(query).toEqual(`SELECT 1,
    "A"`);
});

it('unescape fields', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["1"]',
    query:
      'SELECT `data`.`Article`.`articleId` FROM `data`.`Article` WHERE `data`.`Article`.`articleId` = ?',
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
    colorParameter,
    colorQuery,
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["A"]',
    query: 'SELECT ?',
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
    format: false,
    logger: (q: string) => (query = q),
    unescape: false,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["1",2020-12-25 19:35:06.803149100 UTC, 2021-10-01 00:00:00 UTC]',
    query:
      'INSERT INTO Comment (commentId, createdAt, updatedAt) VALUES (?,?,?)',
  };
  log(event);
  expect(query).toEqual(
    'INSERT INTO Comment (commentId, createdAt, updatedAt) VALUES ("1", "2020-12-25 19:35:06.803149100 UTC", "2021-10-01 00:00:00 UTC")',
  );
});

it('update single statement', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[2020-12-25 20:02:45.589918800 UTC,"body","1"]',
    query:
      'UPDATE `data`.`Article` SET `updatedAt` = ?, `body` = ? WHERE `data`.`Article`.`articleId` IN (?)',
  };
  log(event);
  expect(query).toEqual(
    'UPDATE Article SET updatedAt = "2020-12-25 20:02:45.589918800 UTC", body = "body" WHERE Article.articleId IN ("1")',
  );
});

it('format sql defaults', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: true,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[]',
    query: 'SELECT EmployeeId, FirstName FROM Employees',
  };
  log(event);
  expect(query).toEqual(`SELECT EmployeeId,\n    FirstName\nFROM Employees`);
});

it('format join query', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: true,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[1,"B"]',
    query: `SELECT * FROM Someplace S JOIN Elsewhere AS E WITH (HOLDLOCK) ON 1=1 and X = ? and Y = ?`,
  };
  log(event);
  expect(query).toEqual(
    `SELECT *\nFROM Someplace S\n    JOIN Elsewhere AS E WITH (HOLDLOCK) ON 1 = 1\n    and X = 1\n    and Y = "B"`,
  );
});

it('format with color', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    colorParameter: '\u001B[90m',
    colorQuery: '\u001B[96m',
    format: true,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[1]',
    query: `SELECT * FROM Someplace S WHERE X = ?`,
  };
  log(event);
  expect(query).toEqual(`SELECT *
FROM Someplace S
WHERE X = 1`);
});

it('long parameters', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: true,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params:
      '["cki4upcor0036jov4h6hab7qi", "cki4upcor0037jov4y4syn2bg", "cki4upcor0038jov46rrlfy2a", "cki4upcor0039jov49sm73sfa"]',
    query: `SELECT Tag.tagId FROM Tag WHERE Tag.tagId IN (?,?,?,?)`,
  };
  log(event);
  expect(query).toEqual(`SELECT Tag.tagId
FROM Tag
WHERE Tag.tagId IN (
        "cki4upcor0036jov4h6hab7qi",
        "cki4upcor0037jov4y4syn2bg",
        "cki4upcor0038jov46rrlfy2a",
        "cki4upcor0039jov49sm73sfa"
    )`);
});

it('comma between parameters without color', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["1", "2", "3"]',
    query: 'SELECT 1 WHERE `data`.`Article`.`articleId` IN (?,?,?)',
  };
  log(event);
  expect(query).toContain('articleId IN ("1", "2", "3")');
});

it('comma between parameters with color', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    colorParameter: '\u001B[90m',
    colorQuery: '\u001B[96m',
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["1", "2", "3"]',
    query: 'SELECT 1 WHERE `data`.`Article`.`articleId` IN (?,?,?)',
  };
  log(event);
  expect(stripAnsi(query)).toContain('articleId IN ("1", "2", "3")');
});

it('mysql select', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[true]',
    query:
      'SELECT `query_log_example_db`.`Post`.`id`, `query_log_example_db`.`Post`.`updatedAt` FROM `query_log_example_db`.`Post` WHERE `query_log_example_db`.`Post`.`published` = ?',
  };
  log(event);

  expect(query).toEqual(
    'SELECT Post.id, Post.updatedAt FROM Post WHERE Post.published = true',
  );
});

it('postgres select', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[true,0]',
    query:
      'SELECT "public"."Post"."id", "public"."Post"."createdAt" FROM "public"."Post" WHERE "public"."Post"."published" = $1 OFFSET $2',
  };
  log(event);

  expect(query).toEqual(
    'SELECT "Post"."id", "Post"."createdAt" FROM "Post" WHERE "Post"."published" = true OFFSET 0',
  );
});

it('postgres insert strings', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["alice@prisma.io","Alice"]',
    query:
      'INSERT INTO "public"."User" ("email","name") VALUES ($1,$2) RETURNING "public"."User"."id"',
  };
  log(event);

  expect(query).toEqual(
    'INSERT INTO "User" ("email","name") VALUES ("alice@prisma.io", "Alice") RETURNING "User"."id"',
  );
});

it('update postgres', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[true,2021-12-21 16:56:47.280795800 UTC,4]',
    query:
      'UPDATE "public"."Post" SET "published" = $1, "updatedAt" = $2 WHERE "public"."Post"."id" IN ($3)',
  };
  log(event);
  expect(query).toEqual(
    'UPDATE "Post" SET "published" = true, "updatedAt" = "2021-12-21 16:56:47.280795800 UTC" WHERE "Post"."id" IN (4)',
  );
});

it('backticked string with double quotes', () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '["she will give him ten days of "love," at...","wow "content","]',
    query:
      'INSERT INTO "public"."Post" ("title") VALUES ($1) RETURNING "public"."Post"."id"',
  };
  log(event);
  expect(query).toEqual(
    'INSERT INTO "Post" ("title") VALUES ($1) RETURNING "Post"."id"',
  );
});

it('postgres insert with date escaped', async () => {
  let query = '';
  const log = createPrismaQueryEventHandler({
    format: false,
    logger: (q: string) => (query = q),
    unescape: true,
  });
  const event = {
    ...basePrismaQueryEvent,
    params: '[1,"2024-07-01 17:06:41.583 UTC"]',
    query: `INSERT INTO "public"."Recipe" ("_id", "creationDate") VALUES ($1,$2) RETURNING "public"."Recipe"."_id", "public"."Recipe"."creationDate"`,
  };
  log(event);
  expect(query).not.toContain('$1');
  expect(query).not.toContain('$2');
  expect(query).toEqual(
    'INSERT INTO "Recipe" ("_id", "creationDate") VALUES (1, "2024-07-01 17:06:41.583 UTC") RETURNING "Recipe"."_id", "Recipe"."creationDate"',
  );
});

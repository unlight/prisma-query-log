/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://user:postgres@127.0.0.1:5432/query_log_example_db',
        // url: 'mysql://root:password@127.0.0.1:3306/query_log_example_db',
      },
    },
    errorFormat: 'colorless',
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  });
  prisma.$on('query', event => {
    console.log(event);
  });

  // Seed the database with users and posts
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: {
          content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
          published: true,
          title: 'Watch the talks from Prisma Day 2019',
        },
      },
    },
    include: {
      posts: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'bob@prisma.io',
      name: 'Bob',
      posts: {
        create: [
          {
            content: 'https://graphqlweekly.com/',
            published: true,
            title: 'Subscribe to GraphQL Weekly for community news',
          },
          {
            content: 'https://twitter.com/prisma/',
            published: false,
            title: 'Follow Prisma on Twitter',
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  });

  // Retrieve all published posts
  const allPosts = await prisma.post.findMany({
    where: { published: true },
  });

  // Create a new post (written by an already existing user with email alice@prisma.io)
  const newPost = await prisma.post.create({
    data: {
      author: {
        connect: {
          email: 'alice@prisma.io',
        },
      },
      content: 'http://slack.prisma.io',
      published: false,
      title: 'Join the Prisma Slack community',
    },
  });

  // Publish the new post
  const updatedPost = await prisma.post.update({
    data: {
      published: true,
    },
    where: {
      id: newPost.id,
    },
  });

  // Retrieve all posts by user with email alice@prisma.io
  const postsByUser = await prisma.user
    .findUnique({
      where: {
        email: 'alice@prisma.io',
      },
    })
    .posts();
}

main();

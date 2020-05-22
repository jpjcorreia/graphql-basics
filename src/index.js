import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

// Type definitions - app schema

const users = [
  {
    id: "1",
    name: "Joao",
    email: "joao.com",
  },
  {
    id: "2",
    name: "Maria",
    email: "maria.com",
  },
  {
    id: "3",
    name: "Ana",
    email: "ana.com",
  },
];

const posts = [
  {
    id: "10",
    title: "First Post",
    body: "Post 1",
    published: false,
    author: "1",
  },
  {
    id: "20",
    title: "Second Post",
    body: "Post 2",
    published: true,
    author: "2",
  },
  {
    id: "30",
    title: "Thrid Post",
    body: "Post 3",
    published: false,
    author: "2",
  },
];

const comments = [
  {
    id: "100",
    text: "Comment 1",
    author: "1",
    post: "30"
  },
  {
    id: "200",
    text: "Comment 2",
    author: "1",
    post: "10"
  },
  {
    id: "300",
    text: "Comment 3",
    author: "2",
    post: "20"
  },
  {
    id: "400",
    text: "Comment 4",
    author: "2",
    post: "10"
  },
];

const typeDefs = `
    type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    }

    type Mutation {
      createUser(name: String!, email: String!, age: Int): User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
      id: ID!
      text: String!
      author: User!
      post: Post!
    }
`;

// Resolvers

const resolvers = {
  Query: {
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }

      return posts.filter((post) => {
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());

        return isBodyMatch || isTitleMatch;
      });
    },
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    comments(parent, args, ctx, info) {
      return comments;
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => {
        return user.email === args.email;
      });
      
      if (emailTaken) {
        throw new Error("Email is already taken");
      }

      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
        age: args.age
      }

      users.push(user);

      return user;

    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return (user.id = parent.author);
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.post === parent.id;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return (user.id === parent.author);
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return (post.id === parent.post);
      });
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(() => {
  console.log("Server is up");
});

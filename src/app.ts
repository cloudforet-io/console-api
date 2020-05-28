import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressHealthCheck from 'express-healthcheck';
import httpContext from 'express-http-context';
import { authentication, corsOptions } from '@lib/authentication';
import { requestLogger, errorLogger} from '@lib/logger';
import { notFoundErrorHandler, defaultErrorHandler} from '@lib/error';
import { ApolloServer, gql } from 'apollo-server-express';


import indexRouter from 'routes';
const app = express();
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!'
    }
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground:true
});

server.applyMiddleware({ app });
console.log('path',server.graphqlPath);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(httpContext.middleware);
app.use(authentication());
app.use(requestLogger());

app.use('/check', expressHealthCheck());
app.use('/', indexRouter);
app.use(notFoundErrorHandler());

app.use(errorLogger());
app.use(defaultErrorHandler());


export default app;

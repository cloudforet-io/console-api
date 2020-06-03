import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import expressHealthCheck from 'express-healthcheck';
import httpContext from 'express-http-context';
import {authChecker, authentication, corsOptions, gqlAuthentication} from '@lib/authentication';
import { requestLogger, errorLogger} from '@lib/logger';
import { notFoundErrorHandler, defaultErrorHandler} from '@lib/error';
import { ApolloServer } from 'apollo-server-express';


import indexRouter from 'routes';
import {buildSchema } from 'type-graphql';
import resolvers from '@/graphql/resolvers'
import path from "path";

const  makeApp = async ()=>{

    const app = express();

    const schema = await buildSchema({
        // @ts-ignore
        resolvers,
        emitSchemaFile: true,
        authChecker,
    });
    const server = new ApolloServer({
        schema,
        playground:true,
        context: async ({ req }) => {
            const context = {
                req,
                ...await gqlAuthentication(req)
            };
            return context;
        },
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
    return app
}


export default makeApp();

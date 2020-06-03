import {Arg, ClassType, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root} from "type-graphql";
import {QueryInput} from "graphql/types/input";
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {Domain, DomainConnection} from "graphql/types";

export function ListQueryFactory<TItem>(TConnectionClass: ClassType<TItem>,service:string,version:string,resource:string,queryName:string='') {
    // `isAbstract` decorator option is mandatory to prevent registering in schema
    @Resolver({isAbstract:true})
    abstract class ListResolver {
        @Query(() => TConnectionClass,{name:queryName||`${resource}List`})
        async list(@Arg('query',{nullable:true})query:QueryInput) {
            let client = await grpcClient.get(service,version);
            let response = await client[resource].list({query});
            return plainToClass(TConnectionClass,response)
        }

    }
    return ListResolver;
}


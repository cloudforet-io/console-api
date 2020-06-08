import {Arg, ClassType, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root, Authorized} from "type-graphql";
import {QueryInput} from "graphql/types/input";
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {Domain, DomainConnection} from "graphql/types";
interface FactoryOptions {
    name?:string,
    auth?:boolean,
    roles?:string[]

}

const defaultOptions :FactoryOptions = {
    auth:true,
    roles:[]
}
export function ListQueryFactory<TItem>(TConnectionClass: ClassType<TItem>,service:string,version:string,resource:string,options:FactoryOptions=defaultOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Authorized(...options.roles||[])
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                let response = await client[resource].list({query});
                return plainToClass(TConnectionClass,response)
            }

        }
        klass = ListResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                let response = await client[resource].list({query});
                return plainToClass(TConnectionClass,response)
            }

        }
        klass = ListResolver
    }
    return klass;
}



export function GetQueryFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,idField:string,options:FactoryOptions=defaultOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Authorized(...options.roles||[])
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Arg('id',)_id:string) {
                let client = await grpcClient.get(service,version);
                let response = await client[resource].get({[idField]:_id});
                return plainToClass(TClass,response)
            }

        }
        klass = GetResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Arg('id',)_id:string) {
                let client = await grpcClient.get(service,version);
                let response = await client[resource].get({[idField]:_id});
                return plainToClass(TClass,response)
            }

        }
        klass = GetResolver
    }
    return klass;
}

import {
    Arg,
    ClassType,
    Field,
    FieldResolver,
    Int,
    ObjectType,
    Query,
    Resolver,
    Root,
    Authorized,
    Args,
    Ctx,
    Mutation
} from "type-graphql";
import {QueryInput} from "graphql/types/input";
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {Domain, DomainConnection, convertErrorMessage} from "graphql/types";
import {DomainIDArgs, getDomainId} from "graphql/resolvers/args";
import {error} from "winston";
interface FactoryOptions {
    name?:string,
}

interface FactoryAuthOption {
    auth?:boolean,
}

interface FactoryRolesOption {
    roles?:string[]
}



interface ListQueryFactoryOption extends FactoryAuthOption,FactoryRolesOption,FactoryOptions{

}

const defaultListQueryOptions :FactoryOptions&FactoryAuthOption&FactoryRolesOption = {
    auth:true,
    roles:[]
}

export function ListQueryFactory<TItem>(TConnectionClass: ClassType<TItem>,service:string,version:string,resource:string,options:ListQueryFactoryOption=defaultListQueryOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Authorized(...options.roles||[])
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                try {
                    const resp = await client[resource].list({query});
                    return plainToClass(TConnectionClass,resp)
                } catch (e) {
                    return plainToClass(TConnectionClass,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                try {
                    const resp = await client[resource].list({query});
                    return plainToClass(TConnectionClass,resp)
                } catch (e) {
                    return plainToClass(TConnectionClass,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    }
    return klass;
}


export function ListQueryByDomainFactory<TItem>(TConnectionClass: ClassType<TItem>,service:string,version:string,resource:string,options:ListQueryFactoryOption=defaultListQueryOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Authorized(...options.roles||[])
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Args(){domain_id}:DomainIDArgs,@Arg('query',{nullable:true})query:QueryInput,@Ctx() ctx: any) {
                const client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    const resp = await client[resource].list({query,domain_id:_domain_id});
                    return plainToClass(TConnectionClass,resp)
                } catch (e) {
                    return plainToClass(TConnectionClass,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Query(() => TConnectionClass,{name:options.name||`List${resource}`})
            async list(@Args(){domain_id}:DomainIDArgs,@Arg('query',{nullable:true})query:QueryInput,@Ctx() ctx: any) {
                const client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    const resp = await client[resource].list({query,domain_id:_domain_id});
                    return plainToClass(TConnectionClass,resp)
                } catch (e) {
                    return plainToClass(TConnectionClass,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    }
    return klass;
}

interface GetQueryFactoryOption extends FactoryAuthOption,FactoryRolesOption,FactoryOptions{

}

const defaultGetQueryOptions :FactoryOptions&FactoryAuthOption&FactoryRolesOption = {
    auth:true,
    roles:[]
}


export function GetQueryFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,idField:string,options:GetQueryFactoryOption=defaultGetQueryOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Authorized(...options.roles||[])
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Arg('id',)_id:string) {
                let client = await grpcClient.get(service,version);
                try{
                    let response = await client[resource].get({[idField]:_id});
                    return plainToClass(TClass,response)
                } catch (e) {
                    return plainToClass(TClass,convertErrorMessage(e))
                }
            }

        }
        klass = GetResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Arg('id',)_id:string) {
                let client = await grpcClient.get(service,version);
                try {
                    let response = await client[resource].get({[idField]: _id});
                    return plainToClass(TClass, response)
                } catch (e) {
                    return plainToClass(TClass,convertErrorMessage(e))
                }
            }

        }
        klass = GetResolver
    }
    return klass;
}

export function GetQueryByDomainFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,idField:string,options:GetQueryFactoryOption=defaultGetQueryOptions) {
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Authorized(...options.roles||[])
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Args(){domain_id}:DomainIDArgs,@Arg('id',)_id:string,@Ctx() ctx: any) {
                let client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    let response = await client[resource].get({[idField]: _id, domain_id: _domain_id});
                    return plainToClass(TClass, response)
                }  catch (e) {
                    return plainToClass(TClass,convertErrorMessage(e))
                }
            }

        }
        klass = GetResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class GetResolver {
            @Query(() => TClass,{name:options.name||`Get${resource}`})
            async get(@Args(){domain_id}:DomainIDArgs,@Arg('id',)_id:string,@Ctx() ctx: any) {
                let client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    let response = await client[resource].get({[idField]: _id, domain_id: _domain_id});
                    return plainToClass(TClass, response)
                }  catch (e) {
                    return plainToClass(TClass,convertErrorMessage(e))
                }
            }

        }
        klass = GetResolver
    }
    return klass;
}

interface MutationFactoryOption extends FactoryRolesOption,FactoryOptions{

}

const defaultMutationOptions :FactoryOptions&FactoryRolesOption = {
    roles:[]
}

export function DeleteMutationByDomainFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,idField:string,options:MutationFactoryOption=defaultMutationOptions) {
    @Resolver({isAbstract:true})
    abstract class DeleteResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => TClass,{name:options.name||`Delete${resource}`})
        async delete(@Args(){domain_id}:DomainIDArgs,@Arg('id',)_id:string,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            const _domain_id = getDomainId(ctx,domain_id)
            try{
                let response = await client[resource].delete({[idField]:_id,domain_id:_domain_id});
                return plainToClass(TClass,response)
            } catch (e) {
                const error = {code:e.error_code,message:e.details}
                return plainToClass(TClass,{error})
            }

        }

    }
    return DeleteResolver;
}


export function CreateMutationFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,TResultClass: ClassType<TItem>,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {
    @Resolver({isAbstract:true})
    abstract class CreateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => TResultClass,{name:options.name||`Create${resource}`})
        // @ts-ignore
        async create(@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            let result = {}
            try {
                result = await client[resource].create({...item});
                return plainToClass(TResultClass,{result})
            } catch (e) {
                const error = {code:e.error_code,message:e.details}
                return plainToClass(TResultClass,{error})
            }
        }

    }
    return CreateResolver;
}


export function CreateMutationByDomainFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,TResultClass: ClassType<TItem>,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {
    @Resolver({isAbstract:true})
    abstract class CreateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => TResultClass,{name:options.name||`Create${resource}`})
        // @ts-ignore
        async create(@Args(){domain_id}:DomainIDArgs,@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            const _domain_id = getDomainId(ctx,domain_id)
            let result = {}
            try {
                result =  await client[resource].create({domain_id:_domain_id,...item});
                return plainToClass(TResultClass,{result})
            } catch (e) {
                const error = {code:e.error_code,message:e.details}
                return plainToClass(TResultClass,{error})
            }
        }

    }
    return CreateResolver;
}

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
import {Domain, DomainConnection, convertErrorMessage, MutationResponse} from "graphql/types";
import {DomainIDArgs, getDomainId} from "graphql/resolvers/args";
import { makeMutationResult } from "@graphql/types/error";
import { makePaginatedResponse } from "@graphql/types/pagenation";
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

export function ListQueryFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,options:ListQueryFactoryOption=defaultListQueryOptions,resultTypeName:string='') {
    const pageNationResponse = makePaginatedResponse(TClass,resultTypeName||`${resource}PagenationResult`)
    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Authorized(...options.roles||[])
            @Query(() => pageNationResponse,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                try {
                    const resp = await client[resource].list({query});
                    return plainToClass(pageNationResponse,resp)
                } catch (e) {
                    return plainToClass(pageNationResponse,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Query(() => pageNationResponse,{name:options.name||`List${resource}`})
            async list(@Arg('query',{nullable:true})query:QueryInput) {
                let client = await grpcClient.get(service,version);
                try {
                    const resp = await client[resource].list({query});
                    return plainToClass(pageNationResponse,resp)
                } catch (e) {
                    return plainToClass(pageNationResponse,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    }
    return klass;
}


export function ListQueryByDomainFactory<TItem>(TClass: ClassType<TItem>,service:string,version:string,resource:string,options:ListQueryFactoryOption=defaultListQueryOptions) {
    const pageNationResponse = makePaginatedResponse(TClass,`${resource}ByDomainPagenationResult`)

    let klass = undefined
    const auth = typeof options.auth === 'boolean'? options.auth: true
    if (auth){
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Authorized(...options.roles||[])
            @Query(() => pageNationResponse,{name:options.name||`List${resource}`})
            async list(@Args(){domain_id}:DomainIDArgs,@Arg('query',{nullable:true})query:QueryInput,@Ctx() ctx: any) {
                const client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    const resp = await client[resource].list({query,domain_id:_domain_id});
                    return plainToClass(pageNationResponse,resp)
                } catch (e) {
                    return plainToClass(pageNationResponse,convertErrorMessage(e))
                }
            }
        }
        klass = ListResolver
    } else {
        @Resolver({isAbstract:true})
        abstract class ListResolver {
            @Query(() => pageNationResponse,{name:options.name||`List${resource}`})
            async list(@Args(){domain_id}:DomainIDArgs,@Arg('query',{nullable:true})query:QueryInput,@Ctx() ctx: any) {
                const client = await grpcClient.get(service,version);
                const _domain_id = getDomainId(ctx,domain_id)
                try {
                    const resp = await client[resource].list({query,domain_id:_domain_id});
                    return plainToClass(pageNationResponse,resp)
                } catch (e) {
                    return plainToClass(pageNationResponse,convertErrorMessage(e))
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


export function DeleteMutationFactory<TItem>(TClass: ClassType<TItem>,MutationResult,service:string,version:string,resource:string,idField:string,options:MutationFactoryOption=defaultMutationOptions) {

    @Resolver({isAbstract:true})
    abstract class DeleteResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Delete${resource}`})
        async delete(@Arg('id',)_id:string,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            try{
                let response = await client[resource].delete({[idField]:_id});
                return plainToClass(MutationResult,response)
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }

        }
    }
    return DeleteResolver;
}


export function DeleteMutationByDomainFactory<TItem>(TClass: ClassType<TItem>,MutationResult,service:string,version:string,resource:string,idField:string,options:MutationFactoryOption=defaultMutationOptions) {

    @Resolver({isAbstract:true})
    abstract class DeleteResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Delete${resource}`})
        async delete(@Args(){domain_id}:DomainIDArgs,@Arg('id',)_id:string,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            const _domain_id = getDomainId(ctx,domain_id)
            try{
                let response = await client[resource].delete({[idField]:_id,domain_id:_domain_id});
                return plainToClass(MutationResult,response)
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }

        }
    }
    return DeleteResolver;
}



export function CreateMutationFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,MutationResult,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {
    @Resolver({isAbstract:true})
    abstract class CreateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Create${resource}`})
        // @ts-ignore
        async create(@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            let result = {}
            try {
                result = await client[resource].create({...item});
                return plainToClass(MutationResult,{result})
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }
        }
    }
    return CreateResolver;
}


export function CreateMutationByDomainFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,MutationResult,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {

    @Resolver({isAbstract:true})
    abstract class CreateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Create${resource}`})
        // @ts-ignore
        async create(@Args(){domain_id}:DomainIDArgs,@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            const _domain_id = getDomainId(ctx,domain_id)
            let result = {}
            try {
                result =  await client[resource].create({domain_id:_domain_id,...item});
                return plainToClass(MutationResult,{result})
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }
        }

    }
    return CreateResolver;
}


export function UpdateMutationFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,MutationResult,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {

    @Resolver({isAbstract:true})
    abstract class UpdateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Update${resource}`})
        // @ts-ignore
        async update(@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            let result = {}
            try {
                result = await client[resource].create({...item});
                return plainToClass(MutationResult,{result})
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }
        }

    }
    return UpdateResolver;
}


export function UpdateMutationByDomainFactory<TItem,TInputItem>(TInputClass:ClassType<TInputItem>,TResultClass: ClassType<TItem>,service:string,version:string,resource:string,options:MutationFactoryOption=defaultMutationOptions) {
    const MutationResult = makeMutationResult(TResultClass,`Update${resource}Result`)

    @Resolver({isAbstract:true})
    abstract class UpdateResolver {
        @Authorized(...options.roles||[])
        @Mutation(() => MutationResult,{name:options.name||`Update${resource}`})
        // @ts-ignore
        async update(@Args(){domain_id}:DomainIDArgs,@Arg('item',)item:TInputClass,@Ctx() ctx: any) {
            let client = await grpcClient.get(service,version);
            const _domain_id = getDomainId(ctx,domain_id)
            let result = {}
            try {
                result =  await client[resource].update({domain_id:_domain_id,...item});
                return plainToClass(MutationResult,{result})
            } catch (e) {
                return plainToClass(MutationResult,convertErrorMessage(e))
            }
        }

    }
    return UpdateResolver;
}

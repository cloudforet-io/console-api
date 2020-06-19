import {
    FieldResolver,
    Query,
    Resolver,
    Root,
    Arg,
    Info,
} from 'type-graphql';
import {Domain, DomainConnection, DomainInput, DomainMutationResult} from '@graphql/types';
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {
    CreateMutationFactory,
    DeleteMutationByDomainFactory,
    GetQueryFactory,
    ListQueryFactory,
    UpdateMutationFactory,
    DeleteMutationFactory
} from './factory';
import {GraphQLResolveInfo} from "graphql";

const SERVICE = 'identity'
const VERSION = 'v1'
const getClient = async ()=>(await grpcClient.get(SERVICE,VERSION));

@Resolver(Domain)
class ListDomain extends ListQueryFactory(Domain,SERVICE,VERSION,'Domain'){
}


@Resolver(Domain)
class GetDomain extends GetQueryFactory(Domain,SERVICE,VERSION,'Domain','domain_id'){
}

@Resolver(Domain)
class OwnerOnly extends ListQueryFactory(DomainConnection,SERVICE,VERSION,'Domain',{name:'ownerDomains',roles: ['DOMAIN_OWNER'] },'ownerOnlyPagenationResult'){
}
// 위 코드는 아래와 동일
// @Resolver( Domain)
// class DomainResolver {
//     @Query(() => DomainConnection)
//     async domains(@Arg('query',{nullable:true})query:QueryInput) {
//         let identityV1 = await grpcClient.get('identity', 'v1');
//         let response = await identityV1.Domain.list({query});
//         return plainToClass(DomainConnection,response)
//     }
// }

@Resolver( Domain)
class DomainResolver {
    @FieldResolver()
    id(
        @Root() domain: Domain,
    ): string {
        return domain.domain_id
    }

    // 선택된거 기반으로 자동으로 only 적용하는 기능 테스트
    @Query(() => Domain)
    async getDomainByName(@Arg('name',)name:string, @Info() info: GraphQLResolveInfo) {
        const client = await getClient()
        console.log(info.fieldNodes[0].selectionSet.selections);
        // @ts-ignore
        let response = await client.Domain.list({name:name,query:{only:info.fieldNodes[0].selectionSet.selections.map(meta=>meta.name.value)}});
        console.log(response.results);
        return plainToClass(Domain,response.results[0])
    }
}

@Resolver(Domain)
class DeleteMutation extends DeleteMutationFactory(Domain,DomainMutationResult,SERVICE,VERSION,'Domain','domain_id'){
}

@Resolver(Domain)
class CreateMutation extends CreateMutationFactory(DomainInput,DomainMutationResult,SERVICE,VERSION,'Domain',){
}

@Resolver(Domain)
class UpdateMutation extends UpdateMutationFactory(DomainInput,DomainMutationResult,SERVICE,VERSION,'Domain',){
}

export default [DomainResolver,ListDomain,GetDomain,OwnerOnly,DeleteMutation,CreateMutation,UpdateMutation]

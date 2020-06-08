import {
    FieldResolver,
    Query,
    Resolver,
    Root,
    Arg,
} from 'type-graphql';
import {Domain, DomainConnection  } from '@graphql/types';
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {GetQueryFactory, ListQueryFactory} from './factory';

const SERVICE = 'identity'
const VERSION = 'v1'
const getClient = async ()=>(await grpcClient.get(SERVICE,VERSION));

@Resolver(Domain)
class ListDomain extends ListQueryFactory(DomainConnection,SERVICE,VERSION,'Domain'){
}


@Resolver(Domain)
class GetDomain extends GetQueryFactory(Domain,SERVICE,VERSION,'Domain','domain_id'){
}

@Resolver(Domain)
class OwnerOnly extends ListQueryFactory(DomainConnection,SERVICE,VERSION,'Domain',{name:'ownerDomains',roles: ['DOMAIN_OWNER'] }){
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

    @Query(() => Domain)
    async getDomainByName(@Arg('name',)name:string) {
        const client = await getClient()
        let response = await client.Domain.list({name:name});
        return plainToClass(Domain,response.results[0])
    }
}



export default [DomainResolver,ListDomain,GetDomain,OwnerOnly]

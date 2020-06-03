import {FieldResolver, Query, Resolver, Root, Ctx, Arg, ClassType, ObjectType, Field, Int} from 'type-graphql';
import {Domain, DomainConnection  } from '@graphql/types';
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import { RelayedQuery, RelayLimitOffset, RelayLimitOffsetArgs} from 'auto-relay'
import {QueryInput} from "graphql/types/input";
import { ListQueryFactory} from './factory';



@Resolver(Domain)
class DomainList extends ListQueryFactory(DomainConnection,'identity','v1','Domain'){
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

}

export default [DomainResolver,DomainList]

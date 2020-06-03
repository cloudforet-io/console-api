import {FieldResolver, Query, Resolver, Root, Ctx, Arg} from 'type-graphql';
import {Domain, DomainConnection  } from '@graphql/types';
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import { RelayedQuery, RelayLimitOffset, RelayLimitOffsetArgs} from 'auto-relay'
import {QueryInput} from "graphql/types/input";


@Resolver( Domain)
export class DomainResolver {
    @Query(() => DomainConnection)
    async domains(@Arg('query',{nullable:true})query:QueryInput) {
        let identityV1 = await grpcClient.get('identity', 'v1');
        let response = await identityV1.Domain.list({query});
        // console.log(response);
        // @ts-ignore
        return plainToClass(DomainConnection,response)
    }

    @RelayedQuery(() => Domain)
    async relayDomains(
        @RelayLimitOffset() {limit, offset}: RelayLimitOffsetArgs
    ): Promise<[number, Domain[]]>{
            let identityV1 = await grpcClient.get('identity', 'v1');
            let response = await identityV1.Domain.list({});
            return [response['total_count'], plainToClass(Domain, response['results']) as unknown as Domain[]]
    }

    @FieldResolver()
    id(
        @Root() domain: Domain,
    ): string {
        return domain.domain_id
    }

}


export default [DomainResolver]

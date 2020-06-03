import {FieldResolver, Query, Resolver, Root, Ctx} from 'type-graphql';
import {Domain  } from '@graphql/types';
import grpcClient from "lib/grpc-client";
import {plainToClass} from "class-transformer";
import {RelayedFieldResolver, RelayedQuery, RelayLimitOffset, RelayLimitOffsetArgs} from 'auto-relay'
import * as Relay from 'graphql-relay'

@Resolver( Domain)
export class DomainResolver {
    @Query(() => [Domain])
    async domains() {
        let identityV1 = await grpcClient.get('identity', 'v1');
        let response = await identityV1.Domain.list({});
        console.log(response);
        return plainToClass(Domain,response['results'])
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

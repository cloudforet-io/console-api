import grpcClient from '@lib/grpc-client';
import * as wellKnownType from '@lib/grpc-client/well-known-type';

const USER_ID = 'admin';
const PASSWORD = 'admin';

const initDomain = async (params) => {
    if (!params.domain) {
        throw new Error('Required Parameter. (key = domain)');
    }

    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Domain.list({ name:params.domain });
    let domain_id = null;

    if (response.total_count === 0) {
        let response = await identityV1.Domain.create({ name: params.domain });
        domain_id = response.domain_id;
    } else {
        domain_id = response.results[0].domain_id;
    }

    let apiKeyResponse = await identityV1.APIKey.create({ domain_id:domain_id, api_key_type:'USER' });
    let apiKetMeta = {token:apiKeyResponse.api_key};

    let userResponse = await identityV1.User.list({ user_id:USER_ID, _meta:apiKetMeta });

    if (userResponse.total_count === 0) {
        await identityV1.User.create({ user_id:USER_ID, password:PASSWORD, _meta:apiKetMeta });
    } else {
        await identityV1.User.update({ user_id:USER_ID, password:PASSWORD, _meta:apiKetMeta });
    }

    return {
        domain_name: params.domain,
        domain_id: domain_id,
        user_id: USER_ID,
        password: PASSWORD,
        api_key: apiKeyResponse.api_key
    };
};

export default initDomain;

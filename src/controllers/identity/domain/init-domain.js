import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';

const OWNER_ID = 'admin';
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

    let reqParams = {
        domain_id: domain_id,
        owner_id: OWNER_ID,
        password: PASSWORD
    };

    try {
        await identityV1.DomainOwner.get({ domain_id: domain_id, owner_id: OWNER_ID });
        await identityV1.DomainOwner.update(reqParams);
    } catch (e) {
        logger.debug(`Get Domain Owner Error: ${e.details || e.message}`);
        await identityV1.DomainOwner.create(reqParams);
    }

    return {
        domain_name: params.domain,
        domain_id: domain_id,
        owner_id: OWNER_ID,
        password: PASSWORD
    };
};

export default initDomain;

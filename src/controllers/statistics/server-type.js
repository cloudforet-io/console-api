import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const TYPE_MAP = {
    'BAREMETAL': 'Baremetal',
    'HYPERVISOR': 'Hypervisor',
    'VM': 'VM',
    'UNKNOWN': 'Unknown',
    'AWS': 'AWS',
    'AZURE': 'Azure',
    'GCP': 'GCP',
    'OPENSTACK': 'OpenStack',
    'VMWARE': 'VMWare',
    'KVM': 'KVM',
    'XENSERVER': 'XenServer',
    'LINUX': 'Linux',
    'WINDOWS': 'Windows'
};

const TYPE_INFO = {
    'server_type': {
        'key': 'server_type',
        'values': [
            'BAREMETAL',
            'HYPERVISOR',
            'VM',
            'UNKNOWN'
        ]
    },
    'vm_type': {
        'key': 'data.vm.platform_type',
        'values': [
            'AWS',
            'AZURE',
            'GCP',
            'OPENSTACK',
            'VMWARE'
        ]
    },
    'hypervisor_type': {
        'key': 'data.hypervisor.platform_type',
        'values': [
            'KVM',
            'VMWARE',
            'XENSERVER'
        ]
    },
    'os_type': {
        'key': 'os_type',
        'values': [
            'LINUX',
            'WINDOWS'
        ]
    }
}

const getServerType = async (params) => {
    if (!params.item_type) {
        throw new Error('Required parameter. (key = item_type)');
    } else {
        if (!(params.item_type in TYPE_INFO)) {
            throw new Error(`Parameter is invalid. (item_type = ${params.item_type})`);
        }
    }

    let itemTypeInfo = TYPE_INFO[params.item_type];

    let inventoryV1 = await grpcClient.get('inventory', 'v1');

    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true
        }
    };

    if (params.region_id) {
        reqParams.region_id = params.region_id;
    }

    if (params.zone_id) {
        reqParams.zone_id = params.zone_id;
    }

    if (params.pool_id) {
        reqParams.pool_id = params.pool_id;
    }

    if (params.project_id) {
        reqParams.project_id = params.project_id;
    }

    let defaultFilter = {
        k: 'server_type',
        v: 'DELETED',
        o: 'not'
    };

    let response = {};
    let promises = itemTypeInfo.values.map(async (type) => {
        reqParams.query.filter = [_.clone(defaultFilter, true), {
            k: itemTypeInfo.key,
            v: type,
            o: 'eq'
        }];

        let typeResponse = await inventoryV1.Server.list(reqParams);
        response[TYPE_MAP[type]] = typeResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

export default getServerType;

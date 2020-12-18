import faker from 'faker';
import { BaseFactory } from '@factories/index';

class ResourceGroupResourcesFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.resource_type = faker.random.arrayElement([
            'inventory.Server',
            'inventory.CloudService?provider=aws&cloud_service_group=RDS&cloud_service_type=Database',
            'inventory.CloudService?provider=aws&cloud_service_group=EC2&cloud_service_type=AutoScalingGroup'
        ]);
        this.filter =  [{
            k: 'tags.power_scheduler_managed',
            v: 'true',
            o: 'eq'
        }];
    }
}

export class ResourceGroupFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.resource_group_id = fields.domain_id || `rs-grp-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.resources = fields.resources || new ResourceGroupResourcesFactory();
        this.options = fields.options || {
            raw_filter: {
                'updated_at/>': ['2020-09-01'],
                'data.compute.instance_type/!=': ['r3.8xlarge'],
                'data.compute.instance_state/': ['running'],
                keywords: ['server-00']
            }
        };
        this.tags = fields.tags || [
            {
                'key': faker.random.word(),
                'value': faker.random.word()
            },
            {
                'key': faker.random.word(),
                'value': faker.random.word()
            }
        ];
        this.project_id = fields.project_id || `project-${faker.random.uuid().substr(0,8)}`;
        this.domain_id = fields.domain_id || `domain-${faker.random.uuid().substr(0,8)}`;
        this.created_at = {
            seconds: parseInt(faker.time.recent() / 1000)
        };
    }
}

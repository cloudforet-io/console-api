import faker from 'faker';
import { BaseFactory } from '@factories/index';

class ScheduleResourceGroupFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.resource_group_id = `rs-grp-${faker.random.uuid().substr(0,8)}`;
        this.priority = faker.random.number({ min: 1, max: 6 });
    }
}

export class ScheduleFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.schedule_id = fields.schedule_id || `schedule-${faker.random.uuid().substr(0,8)}`;
        this.name = fields.name || faker.random.word();
        this.state = fields.state || 'ENABLED';
        const resourceGroupCount = faker.random.number({min: 3, max: 7});
        this.resource_groups = ScheduleResourceGroupFactory.buildBatch(resourceGroupCount);
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
        this.created_by = faker.name.lastName();
        this.created_at = {
            seconds: parseInt(faker.time.recent() / 1000)
        };
    }
}

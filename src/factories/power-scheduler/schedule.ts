//@ts-nocheck
import faker from 'faker';
import { BaseFactory } from '@factories/index';

class ScheduleResourceGroupFactory extends BaseFactory {
    private resource_group_id: string;
    private priority: any;
    constructor() {
        super();
        this.resource_group_id = `rs-grp-${faker.random.uuid().substr(0,8)}`;
        this.priority = faker.random.number({ min: 1, max: 6 });
    }
}

export class ScheduleFactory extends BaseFactory {
    private schedule_id: string;
    private name: string;
    private state: string;
    private resource_groups: BaseFactory[];
    private tags: object[];
    private project_id: string;
    private domain_id: string;
    private created_at: { seconds: number };
    private created_by: string;

    constructor(fields: { state: string }) {
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
            seconds: parseInt(String(faker.time.recent() / 1000))
        };
    }
}

import faker from 'faker';
import { BaseFactory } from '@factories/index';

export class PhdSummaryFactory extends BaseFactory {
    constructor() {
        super();
        this.resource_id = `arn:aws:health:global::event/${faker.random.uuid()}`;
        this.event_type_code = faker.random.words(3);
        this.event_type_category = faker.random.arrayElement(['issue', 'scheduledChange']);
        this.region_code = faker.address.country();
        this.service = faker.random.word();
        this.affected_projects = [
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`
        ];
        this.last_updated_time = faker.date.between('2020-12-01', '2020-12-17');
    }
}

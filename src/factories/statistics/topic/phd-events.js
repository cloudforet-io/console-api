import faker from 'faker';
import { BaseFactory } from '@factories/index';

class PhdEventAffectedResourcesFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.awsAccountId = faker.random.uuid().substr(0,12);
        this.entityValue = faker.random.arrayElement(['AWS_ACCOUNT', `vpc-${faker.random.uuid().substr(0,8)}`]);
    }
}

export class PhdEventsFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.resource_id = `arn:aws:health:global::event/${faker.random.uuid()}`;
        this.event_type_code = faker.random.words(3);
        this.event_type_category = fields.event_type_category || faker.random.arrayElement(['issue', 'scheduledChange', 'accountNotification']);
        this.region_code = faker.address.country();
        this.service = faker.random.word();
        this.affected_resources = PhdEventAffectedResourcesFactory.buildBatch(faker.random.number(3));
        this.start_time = faker.date.between('2020-12-01', '2020-12-17');
        this.last_updated_time = faker.date.between('2020-12-01', '2020-12-17');
        this.project_id = fields.project_id || `project-${faker.random.uuid().substr(0,8)}`;
    }
}

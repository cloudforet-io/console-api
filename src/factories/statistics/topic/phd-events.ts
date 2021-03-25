//@ts-nocheck
import faker from 'faker';
import { BaseFactory } from '@factories/index';

const REGION_CODE = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-northeast-3'
];

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
        this.event_title = faker.random.words(3);
        this.event_type_category = fields.event_type_category || faker.random.arrayElement(['issue', 'scheduledChange', 'accountNotification']);
        this.region_code = faker.random.arrayElement(REGION_CODE);
        this.service = faker.random.word();
        this.affected_resources = PhdEventAffectedResourcesFactory.buildBatch(faker.random.number(3));
        this.start_time = faker.date.between('2020-12-01', '2020-12-17');
        this.last_update_time = faker.date.between('2020-12-01', '2020-12-17');
        this.project_id = fields.project_id || `project-${faker.random.uuid().substr(0,8)}`;
    }
}

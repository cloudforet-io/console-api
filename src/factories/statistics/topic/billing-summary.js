import faker from 'faker';
import { BaseFactory } from '@factories/index';
import moment from 'moment';

const REGION_CODE = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-northeast-3'
];

export class BillingSummaryFactory extends BaseFactory {
    constructor(fields = {}) {
        super();

        this.cost = faker.random.number({ min: 1000, max: 5000 });
        this.date = fields.date || moment().format('YYYY-MM');
        this.currency = 'USD';

        if (fields.aggregation === 'RESOURCE_TYPE') {
            this.provider = faker.random.arrayElement(['aws', 'google_cloud', 'azure']);
            this.cloud_service_group = faker.random.word();
        } else if (fields.aggregation === 'REGION_CODE') {
            this.region_code = faker.random.arrayElement(REGION_CODE);
        }
    }
}

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

class DailyBillingDataFactory extends BaseFactory {
    constructor(fields = {}) {
        super();
        this.cost = faker.random.number({ min: 1000, max: 5000 });
        if (fields.granularity === 'DAILY') {
            this.date = moment().add('days', fields.idx-14).format('YYYY-MM-DD');
        } else {
            this.date = moment().add('months', -fields.idx-6).format('YYYY-MM');
        }
        this.currency = 'USD';
    }
}

export class DailyBillingSummaryFactory extends BaseFactory {
    constructor(fields = {}) {
        super();

        if (fields.aggregation === 'RESOURCE_TYPE') {
            this.provider = faker.random.arrayElement(['aws', 'google_cloud', 'azure']);
            this.cloud_service_group = faker.random.word();
        } else if (fields.aggregation === 'REGION_CODE') {
            this.region_code = faker.random.arrayElement(REGION_CODE);
        }

        if (fields.granularity === 'DAILY') {
            this.billing_data = DailyBillingDataFactory.buildBatch(14, fields);
        } else {
            this.billing_data = DailyBillingDataFactory.buildBatch(6, fields);
        }

    }
}

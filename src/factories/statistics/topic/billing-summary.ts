import faker from 'faker';
import { BaseFactory } from '@factories';
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

class BillingDataFactory extends BaseFactory {
    private cost: any;
    private date: string;
    private currency: string;
    constructor(fields = {
        granularity: undefined
    }) {
        super();
        this.cost = faker.random.number({ min: 1000, max: 5000 });
        if (fields.granularity === 'DAILY') {
            this.date = moment().add('days', fields['idx-14']).format('YYYY-MM-DD');
        } else {
            this.date = moment().add('months', -fields['idx-6']).format('YYYY-MM');
        }
        this.currency = 'USD';
    }
}

export class BillingSummaryFactory extends BaseFactory {
    private provider: any;
    private service_code: any;
    private cloud_service_group: any;
    private region_code: any;
    private billing_data: any;
    constructor(fields = {
        aggregation: undefined,
        granularity: undefined
    }) {
        super();

        if (fields.aggregation === 'inventory.CloudServiceType') {
            this.provider = faker.random.arrayElement(['aws', 'google_cloud', 'azure']);
            this.service_code = faker.random.word();
            this.cloud_service_group = faker.random.word();
        } else if (fields.aggregation === 'invetory.Region') {
            this.provider = faker.random.arrayElement(['aws', 'google_cloud', 'azure']);
            this.region_code = faker.random.arrayElement(REGION_CODE);
        }

        if (fields.granularity === 'DAILY') {
            this.billing_data = BillingDataFactory.buildBatch(14, fields);
        } else {
            this.billing_data = BillingDataFactory.buildBatch(6, fields);
        }

    }
}

import faker from 'faker';
import { BaseFactory } from '@factories';

const REGION_CODE = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-northeast-3'
];

export class PhdSummaryFactory extends BaseFactory {
    private resource_id: string;
    private event_title: any;
    private event_type_category: any;
    private region_code: any;
    private service: any;
    private affected_projects: string[];
    private last_update_time: any;

    constructor() {
        super();
        this.resource_id = `arn:aws:health:global::event/${faker.random.uuid()}`;
        this.event_title = faker.random.words(3);
        this.event_type_category = faker.random.arrayElement(['issue', 'scheduledChange']);
        this.region_code = faker.random.arrayElement(REGION_CODE);
        this.service = faker.random.word();
        this.affected_projects = [
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`,
            `project-${faker.random.uuid().substr(0,8)}`
        ];
        this.last_update_time = faker.date.between('2020-12-01', '2020-12-17');
    }
}

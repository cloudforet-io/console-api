export class BaseFactory {
    static buildBatch(count = 0, fields: any = {
        idx: 0
    }): any|void {
        return [...Array(count).keys()].map((idx) => {
            fields.idx = idx;
            return new this(fields);
        });
    }

    // eslint-disable-next-line no-unused-vars
    constructor(fields?) {}
}

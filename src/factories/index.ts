export class BaseFactory {
    static buildBatch(count, fields={}) {
        return [...Array(count).keys()].map((idx) => {
            fields.idx = idx;
            return new this(fields);
        });
    }
}

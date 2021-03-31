export class BaseFactory {
    static buildBatch(count, fields={
        idx: 0
    }) {
        return [...Array(count).keys()].map((idx) => {
            fields.idx = idx;
            // @ts-ignore
            return new this(fields);
        });
    }
}

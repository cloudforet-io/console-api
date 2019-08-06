import _ from 'lodash';

const toString = Object.prototype.toString;

const typeOf = (value) => {
    return toString.call(value);
};

const wrap = (kind, value) => {
    return { kind, [kind]: value };
};

const encoders = {
    [typeOf({})]: v => wrap('structValue', encodeStruct(v)),
    [typeOf([])]: v => wrap('listValue', encodeListValue(v)),
    [typeOf(0)]: v => wrap('numberValue', v),
    [typeOf('')]: v => wrap('stringValue', v),
    [typeOf(true)]: v => wrap('boolValue', v),
    [typeOf(null)]: () => wrap('nullValue', 0)
};

const encodeStruct = (json) => {
    let fields = [];
    Object.keys(json).map((key) => {
        if (json[key]) {
            fields.push({
                key: key,
                value: encodeValue(json[key])
            });
        }
    });
    return { fields };
};

const encodeValue = (value) => {
    const type = typeOf(value);
    const encoder = encoders[type];
    if (typeof encoder !== 'function') {
        throw new TypeError(`Unable to infer type for "${value}".`);
    }
    return encoder(value);
};

const encodeListValue = (values) => {
    return {
        values: values.map(encodeValue)
    };
};

const decodeStruct = (value) => {
    if (value.fields) {
        let json = {};
        Object.keys(value.fields).map((key) => {
            let field = value.fields[key];
            json[field.key] = decodeValue(field.value);
        });
        return json;

    } else {
        return value;
    }
};

const decodeValue = (value) => {
    if (value.listValue) {
        return decodeListValue(value.listValue);
    } else if (value.structValue) {
        return decodeStruct(value.structValue);
    } else if (typeof value.nullValue !== 'undefined') {
        return null;
    } else if (value.kind) {
        return value[value.kind];
    } else {
        return value;
    }
};

const decodeListValue = (value) => {
    return value.values.map(decodeValue);
};

const convertMessage = (data, keys, func) => {
    if (Array.isArray(data)) {
        _.map(data, (value) => {
            keys.map((key) => {
                _.set(value, key, func(_.get(value, key)));
            });

        });
    } else {
        keys.map((key) => {
            _.set(data, key, func(_.get(data, key)));
        });
    }
};

const struct = {
    encode(data, key) {
        convertMessage(data, key, encodeStruct);
    },
    decode(data, key) {
        convertMessage(data, key, decodeStruct);
    }
};

const value = {
    encode(data, key) {
        convertMessage(data, key, encodeValue);
    },
    decode(data, key) {
        convertMessage(data, key, decodeValue);
    }
};

const list = {
    encode(data, key) {
        convertMessage(data, key, encodeListValue);
    },
    decode(data, key) {
        convertMessage(data, key, decodeListValue);
    }
};

export {
    struct,
    value,
    list
};

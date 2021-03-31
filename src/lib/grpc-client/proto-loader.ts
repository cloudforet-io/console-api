const _ = require('lodash');

function joinName(baseName, name) {
    if (baseName === '') {
        return name;
    }
    else {
        return baseName + '.' + name;
    }
}
function getAllServices(obj, parentName) {
    const objName = joinName(parentName, obj.name);
    if (obj.hasOwnProperty('methods')) {
        return [[objName, obj]];
    }
    else {
        return obj.nestedArray.map(function (child) {
            if (child.hasOwnProperty('nested')) {
                return getAllServices(child, objName);
            }
            else {
                return [];
            }
        }).reduce(function (accumulator, currentValue) { return accumulator.concat(currentValue); }, []);
    }
}
function createDeserializer(cls, options) {
    return function deserialize(argBuf) {
        return cls.toObject(cls.decode(argBuf), options);
    };
}
function createSerializer(cls) {
    return function serialize(arg) {
        const message = cls.fromObject(arg);
        return cls.encode(message).finish();
    };
}
function createMethodDefinition(method, serviceName, options) {
    return {
        path: '/' + serviceName + '/' + method.name,
        requestStream: !!method.requestStream,
        responseStream: !!method.responseStream,
        requestSerialize: createSerializer(method.resolvedRequestType),
        requestDeserialize: createDeserializer(method.resolvedRequestType, options),
        responseSerialize: createSerializer(method.resolvedResponseType),
        responseDeserialize: createDeserializer(method.resolvedResponseType, options),
    // TODO(murgatroid99): Find a better way to handle this
        originalName: _.camelCase(method.name)
    };
}
function createServiceDefinition(service, name, options) {
    const def = {};
    for (let _i = 0, _a = service.methodsArray; _i < _a.length; _i++) {
        const method = _a[_i];
        def[method.name] = createMethodDefinition(method, name, options);
    }
    return def;
}
function createPackageDefinition(root, options) {
    const def = {};
    for (let _i = 0, _a = getAllServices(root, ''); _i < _a.length; _i++) {
        const _b = _a[_i], name = _b[0], service = _b[1];
        def[name] = createServiceDefinition(service, name, options);
    }
    return def;
}

exports.createPackageDefinition = createPackageDefinition;

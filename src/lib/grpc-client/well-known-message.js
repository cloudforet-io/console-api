require('google-protobuf/google/protobuf/struct_pb');

const deserialize = (message) => {
    Object.keys(message).map((key) => {
        if (typeof message[key] === 'object') {
            let message_type = message[key].$type;
            if (message_type && message_type.name === 'Struct') {
                message[key] = {aa:'bb'};
            }
            else
            {
                message[key] = deserialize(message[key]);
            }

        }
    });
    return message;
};

const serialize = () => {

};

export { deserialize, serialize };
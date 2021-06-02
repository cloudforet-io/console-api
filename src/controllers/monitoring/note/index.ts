import grpcClient from '@lib/grpc-client';

const createNote = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.create(params);

    return response;
};

const updateNote = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.update(params);

    return response;
};

const deleteNote = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.delete(params);

    return response;
};

const getNote = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.get(params);

    return response;
};

const listNotes = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.list(params);

    return response;
};

const statNotes = async (params) => {
    const monitoringV1 = await grpcClient.get('monitoring', 'v1');
    const response = await monitoringV1.Note.stat(params);

    return response;
};

export {
    createNote,
    updateNote,
    deleteNote,
    getNote,
    listNotes,
    statNotes
};

import grpcClient from '@lib/grpc-client';


const listNotes = async (params) => {
    const alertManagerV1 = await grpcClient.get('alert_manager', 'v1');
    return await alertManagerV1.Note.list(params);
};

export {
    listNotes
};

import grpcClient from '@lib/grpc-client';

const addFile = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.add(params);

    return response;
};

const updateFile = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.update(params);

    return response;
};

const deleteFile = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.delete(params);

    return response;
};

const getDownloadUrl = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.get_download_url(params);

    return response;
};

const getFile = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.get(params);

    return response;
};

const listFiles = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.list(params);

    return response;
};


const statFiles = async (params) => {
    const fileManagerV1 = await grpcClient.get('file_manager', 'v1');
    const response = await fileManagerV1.File.stat(params);

    return response;
};


export {
    addFile,
    updateFile,
    deleteFile,
    getDownloadUrl,
    getFile,
    listFiles,
    statFiles
};

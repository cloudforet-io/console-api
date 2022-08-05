import grpcClient from '@lib/grpc-client';

const createPost = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.create(params);

    return response;
};

const updatePost = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.update(params);

    return response;
};

const sendNotification = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.send_notification(params);

    return response;
};

const deletePost = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.delete(params);

    return response;
};

const getPost = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.get(params);

    return response;
};

const listPosts = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.list(params);

    return response;
};

const statPosts = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Post.stat(params);

    return response;
};

export {
    createPost,
    updatePost,
    sendNotification,
    deletePost,
    getPost,
    listPosts,
    statPosts
};

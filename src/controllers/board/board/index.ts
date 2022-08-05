import grpcClient from '@lib/grpc-client';

const createBoard = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.create(params);

    return response;
};

const updateBoard = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.update(params);

    return response;
};

const setBoardCategories = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.set_categories(params);

    return response;
};

const deleteBoard = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.delete(params);

    return response;
};

const getBoard = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.get(params);

    return response;
};

const listBoards = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.list(params);

    return response;
};

const statBoards = async (params) => {
    const boardV1 = await grpcClient.get('board', 'v1');
    const response = await boardV1.Board.stat(params);

    return response;
};

export {
    createBoard,
    updateBoard,
    setBoardCategories,
    deleteBoard,
    getBoard,
    listBoards,
    statBoards
};

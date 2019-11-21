module.exports = {
    resolve: {
        alias: {
            '@controllers': path.resolve(__dirname, './src/controllers/'),
            '@lib': path.resolve(__dirname, './src/lib/'),
            '@test': path.resolve(__dirname, './test/'),
            '@config': path.resolve(__dirname, './config/'),
        }
    }
};

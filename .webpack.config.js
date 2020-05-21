var TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
    resolve: {
        plugins: [
            new TsConfigPathsPlugin()
        ],
        alias: {
            '@': path.resolve(__dirname, './src/'),
            '@controllers': path.resolve(__dirname, './src/controllers/'),
            '@lib': path.resolve(__dirname, './src/lib/'),
            '@test': path.resolve(__dirname, './test/'),
            '@config': path.resolve(__dirname, './config/'),
        }
    }
};

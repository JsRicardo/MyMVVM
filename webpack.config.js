const path = require('path')
const HTMLP = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'), // 配置打包文件
        filename: 'script/bundle.js'
    },
    plugins: [
        new HTMLP({
            template: './public/index.html' // 配置模板文件
        }),
        new CleanWebpackPlugin() // 打包之前先清理dist目录
    ],
    module: {
        rules: [{
            test: /(\.jsx|\.js)$/,
            use: {
                loader: "babel-loader",
            },
            exclude: path.resolve(__dirname, "node_modules"),
            include: path.resolve(__dirname, "src")
        }]
    },
    resolve: {
        extensions: ['.js']
    }
}
const path = require('path')
const HTMLP = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve('./dist'), // 配置打包文件
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
            test: /.ts$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}
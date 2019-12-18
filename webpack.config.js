const path = require('path')
const HTMLP = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: './src',
    output: {
        path: path.resolve(__dirname, './dist'), // 配置打包文件
        filename: 'rue.js'
    },
    devtool: 'eval‐source‐map',
    plugins: [
        new HTMLP({
            template: './public/index.html', // 配置模板文件
            filename: 'index.html',
            inject: true,
            minify: {
                removeComments: false,
                collapseWhitespace: false,
                removeAttributeQuotes: false
            }
        }),
        // new UglifyJsPlugin({
        //     uglifyOptions: {},
        //     sourceMap: true,
        //     parallel: true
        // }),
        new CleanWebpackPlugin() // 打包之前先清理dist目录
    ],
    module: {
        rules: [{
            test: /\.js$/,
            // use: ['babel-loader', 'eslint-loader'],
            loader: 'babel-loader',
            include: [path.resolve(__dirname, 'src')], // 指定检查的目录
        }]
    },
    resolve: {
        extensions: ['.js']
    }
}
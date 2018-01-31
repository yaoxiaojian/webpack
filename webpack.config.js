const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

module.exports = (env) => {
    if (!env) {
        env = {}
    }

    const plugins = [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            title: "Development",
            template: "./app/views/index.html",
        }),
        new UglifyJsPlugin({
            sourceMap: true,
        }),
    ]

    if (env.production) {
        plugins.push(
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: "production",
                },
            }),
            new ExtractTextPlugin("style.css")
        )
    }

    return {
        entry: {
            app: "./app/js/main.js",
        },
        devtool: "source-map",
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 9000,
        },
        module: {
            loaders: [{
                test: /\.html$/,
                loader: "html-loader",
            }, {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: env.production ? {
                        css: ExtractTextPlugin.extract({
                            use: "css-loader?minimize!px2rem-loader?remUnit=40&remPrecision=8",
                            fallback: "vue-style-loader", // <- 这是vue-loader的依赖，所以如果使用npm3，则不需要显式安装
                        }),
                        scss: ExtractTextPlugin.extract({
                            use: "css-loader?minimize!px2rem-loader?remUnit=40&remPrecision=8!sass-loader",
                            fallback: "vue-style-loader", // <- 这是vue-loader的依赖，所以如果使用npm3，则不需要显式安装
                        }),
                    } : {
                        css: "vue-style-loader!css-loader!px2rem-loader?remUnit=40&remPrecision=8",
                        scss: "vue-style-loader!css-loader!px2rem-loader?remUnit=40&remPrecision=8!sass-loader",
                    },
                    cssModules: {
                        localIdentName: "[path][name]---[local]---[hash:base64:5]",
                        camelCase: true,
                    },
                },
            }, {
                test: /\.scss$/,
                loader: "style-loader!css-loader!sass-loader",
            }],
        },
        resolve: {
            extensions: [".js", ".json", ".vue"],
            alias: {
                vue$: "vue/dist/vue.esm.js", // 用 webpack 1 时需用 'vue/dist/vue.common.js'
            },
        },
        plugins,
        output: {
            filename: "[name].min.js",
            path: path.resolve(__dirname, "dist"),
        },
    }
}

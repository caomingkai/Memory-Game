const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                     loader: "babel-loader",
                     options: {
                         presets: [ 'es2015', 'react', 'stage-2' ],
                         plugins: [["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]]
                     }
                 }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        })
    ]


};

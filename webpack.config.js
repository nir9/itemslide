const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
    mode: "development",
    entry: "./src/itemslide.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "itemslide.min.js"
    },
    plugins: [
        new webpack.BannerPlugin(
            fs.readFileSync("license.txt", "utf8")
        )
    ]
};

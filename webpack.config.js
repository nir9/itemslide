const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: "./src/itemslide.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "itemslide.min.js"
    },
    plugins: [
        new webpack.BannerPlugin(
            "/* ItemSlide.js - Licensed under the MIT license - itemslide.org/license.html */"
        )
    ]
};

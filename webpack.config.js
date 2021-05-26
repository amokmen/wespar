const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // development
  mode: "production",
  entry: "./frontend_src/main.js",
  output: {
    path: path.resolve(__dirname, "frontend_static_files"),
    filename: "main_build.js",
  },
  optimization: {
    // false
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // get rid of creation file LICENSE.txt
        extractComments: false,
      }),
    ],
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: { hot: true },
};

const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const PnpWebpackPlugin = require("pnp-webpack-plugin");
const { WebpackPnpExternals } = require("webpack-pnp-externals");

module.exports = {
  target: "node",
  externals: [nodeExternals(), WebpackPnpExternals()],
  externalsPresets: {
    node: true,
  },
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
  },
  plugins: [
    new webpack.WatchIgnorePlugin({
      paths: [/\/dist\//],
    }),
  ],
};

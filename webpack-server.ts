//

import * as glob from "glob";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import * as externals from "webpack-node-externals";


let config = {
  entry: ["./server/index.ts"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js"
  },
  devtool: "source-map",
  target: "node",
  externals: [externals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader"
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {modules: {localIdentName: "[name]_[local]_[hash:base64:5]"}, url: false}
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.yml$/,
        use: [
          {
            loader: "json-loader"
          },
          {
            loader: "yaml-flat-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".scss", ".yml"],
    alias: {
      "/client": path.resolve(__dirname, "client"),
      "/server": path.resolve(__dirname, "server")
    }
  },
  optimization: {
    minimize: false
  },
  cache: true
};

let staticConfig = {
  entry: glob.sync("./client/public/static/*"),
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "static",
            name: "[name].[ext]"
          }
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".scss", ".html"],
    alias: {
      "/client": path.resolve(__dirname, "client"),
      "/server": path.resolve(__dirname, "server")
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/style.css",
      ignoreOrder: true
    })
  ]
};

export default [config, staticConfig];
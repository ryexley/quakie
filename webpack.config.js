import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const indexFileOptions = {
  title: "Quakie: Raggeds Wilderness Weather History Statistics",
  template: "./src/index.html",
  filename: "./ui/index.html",
  inject: false
};

const config = {
  entry: [
    "babel-polyfill",
    "./src/js/main"
  ],
  output: {
    filename: "./ui/js/quakie.js"
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin( { compress: { warnings: false } } ),
    new HtmlWebpackPlugin( indexFileOptions )
  ],
  resolve: ["", ".js", ".jsx", ".json"],
  devtool: "source-map",
  module: {
    loaders: [
      { test: /\.(json)$/, loader: "json-loader" },
      {
        test: /\.(js|jsx)$/,
        include: path.resolve( __dirname, "./src" ),
        loader: "babel",
        query: {
          presets: [ "es2015", "react" ],
          plugins: [ "transform-runtime", "add-module-exports" ]
        }
      }
    ]
  }
};

webpack( config, ( err, stats ) => {
  if( err ) {
    console.error( "Webpack error\n", err );
  }

  console.log( stats.toString( {
    colors: true,
    hash: false,
    version: true,
    timings: true,
    chunks: true,
    chunkModules: false,
    cached: true,
    cachedAssets: true
  } ) );
} );

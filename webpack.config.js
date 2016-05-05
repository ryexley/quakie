import path from "path";
import webpack from "webpack";

const config = {
  entry: [
    "babel-polyfill",
    "./src/js/main"
  ],
  output: {
    filename: "./ui/js/quakie.js"
  },
  devtool: "source-map",
  module: {
    loaders: [
      {
        test: "/\.(js|jsx)$/",
        include: "./src",
        loader: "babel",
        query: {
          presets: [ "es2015", "react" ],
          plugins: [ "add-module-exports" ]
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

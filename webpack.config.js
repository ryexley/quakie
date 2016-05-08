var path = require( "path" );
var webpack = require( "webpack" );

// const config = {
module.exports = {
  entry: [
    "babel-polyfill",
    "./src/js/main"
  ],
  output: {
    filename: "./server/public/js/quakie.js"
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin( { compress: { warnings: false } } ),
  ],
  resolve: ["", ".js", ".jsx", ".json"],
  devtool: "source-map",
  module: {
    loaders: [
      { test: /\.(json)$/, loader: "json" },
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve( __dirname, "./src" ),
          path.resolve( __dirname, "./config" )
        ],
        loader: "babel",
        query: {
          presets: [ "es2015", "react" ],
          plugins: [ "transform-runtime", "add-module-exports" ]
        }
      }
    ]
  }
};

// webpack( config, ( err, stats ) => {
//   if( err ) {
//     console.error( "Webpack error\n", err );
//   }

//   console.log( stats.toString( {
//     colors: true,
//     hash: false,
//     version: true,
//     timings: true,
//     chunks: true,
//     chunkModules: false,
//     cached: true,
//     cachedAssets: true
//   } ) );
// } );

var path = require( "path" );
var webpack = require( "webpack" );
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var CopyPlugin = require( "copy-webpack-plugin" );
var autoprefixer = require( "autoprefixer" );
var imports = require( "postcss-easy-import" );
var nested = require( "postcss-nested" );
var variables = require( "postcss-simple-vars" );
var mixins = require( "postcss-mixins" );
var cssLoaders = "css?modules&importLoaders=1&localIdentName=[name]--[local]--[hash:base64:7]!postcss";

module.exports = {
  entry: [
    "babel-polyfill",
    "./src/js/main"
  ],
  output: {
    filename: "./server/public/js/quakie.js"
  },
  plugins: [
    new CopyPlugin( [ {
      from: path.resolve( __dirname, "src/i18n/locales" ),
      to: path.resolve( __dirname, "server/public/locales" ),
      force: true
    } ] ),
    new ExtractTextPlugin( "./server/public/css/style.css" ),
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
      },
      {
        test: /\.(css)$/,
        include: path.resolve( __dirname, "./src" ),
        loader: ExtractTextPlugin.extract( "style", cssLoaders )
      }
    ]
  },
  postcss: function() {
    return [
      autoprefixer( { browsers: [ "last 2 version" ] } ),
      imports( { path: path.join( __dirname, "./src" ), glob: true } ),
      mixins,
      nested,
      variables()
    ];
  },
  stats: {
    children: false,
    modules: false
  }
};

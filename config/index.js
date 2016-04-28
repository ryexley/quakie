const _ = require( "lodash" );
const path = require( "path" );

const defaults = require( path.resolve( __dirname, "./config.defaults.json" ) );
const local = require( path.resolve( __dirname, "../config.json" ) );

const config = _.merge( defaults, local );

module.exports = config;

const path = require( "path" );
const debug = require( "debug")( "quakie" );
const express = require( "express" );
const bodyParser = require( "body-parser" );
const cookieParser = require( "cookie-parser" );
const errorHandler = require( "errorhandler" );
const favicon = require( "serve-favicon" );
const logger = require( "morgan" );
const routes = require( "./routes" );

const app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( cookieParser() );

app.use( express.static( path.resolve( __dirname, "./public") ) );
app.use( favicon( path.resolve( __dirname, "./public/favicon.ico" ) ) );
app.use( errorHandler() );

require( "lodash-express" )( app, "html" );
app.set( "views", path.resolve( __dirname, "./views" ) );
app.set( "view engine", "html" );

app.use( logger( "dev" ) );

app.use( "/", routes );

module.exports = app;

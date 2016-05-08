const config = require( "../../config/" );
const massive = require( "massive" );
var debug = require( "debug")( "quakie:router" );
var express = require( "express" );

var router = express.Router();

router.use( ( req, res, next ) => {
  const db = massive.connectSync( {
    connectionString: config.db.getConnectionString()
  } );

  req.app.set( "db", db );
  next();
} );

router.get( "/", ( req, res, next ) => {
  res.render( "index", { title: "Quakie: Raggeds Wilderness Weather History Statistics" } );
} );

router.get( "/api/weather-data", ( req, res, next ) => {
  const db = req.app.get( "db" );
  db.raggeds_weather_history.find( {}, ( err, results ) => {
    res.json( results );
  } );
} );

module.exports = router;

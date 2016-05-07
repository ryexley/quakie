import messenger from "../composers/messenger";
import when from "when";

export default ( config ) => {

  class Database {
    constructor( config ) {}

    getWeatherHistoryData() {
      console.log( "fetching weather history data..." );
    }
  };

  Database = messenger( { target: Database } );

  return new Database( config );

};

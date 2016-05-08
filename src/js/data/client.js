import got from "got";
import messenger from "../composers/messenger";

export default ( config ) => {
  class DataClient {
    constructor( config ) {
      this.api = config;
      this.setupSubscriptions();
    }

    setupSubscriptions() {
      this.subscribe( { topic: "weather-data.requested", handler: this.getAllWeatherData } );
    }

    getAllWeatherData() {
      console.log( "Fetching all weather history data" );
    }
  }

  DataClient = messenger( { target: DataClient } );

  return new DataClient( config );
};

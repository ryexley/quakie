import axios from "axios";
import when from "when";
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
      axios.get( `${ this.api.root }/weather-data` )
        .then( response => {
          this.publish( {
            topic: "weather-data.fetched",
            data: response.data
          } );
        } )
        .catch( err => {
          throw new Error( "Error fetching weather history data", err );
        } );
    }
  }

  DataClient = messenger( { target: DataClient } );

  return new DataClient( config );
};

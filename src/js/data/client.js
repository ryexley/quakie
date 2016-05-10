import { extend } from "lodash";
import axios from "axios";
import when from "when";
import messenger from "../mixins/messenger";

function DataClient( config ) {
  this.api = config;
  this.setupSubscriptions();
};

extend( DataClient.prototype, {
  setupSubscriptions() {
    this.subscribe( { topic: "weather-data.requested", handler: this.getAllWeatherData } );
  },

  getAllWeatherData() {
    axios.get( `${ this.api.root }/weather-data` )
      .then( response => {
        this.publish( {
          topic: "weather-data.fetched",
          data: response.data
        } );
      } )
      .catch( err => {
        console.log( "Error fetching weather history data", err );
        throw new Error( "Error fetching weather history data", err );
      } );
  }
}, messenger );

export default DataClient;

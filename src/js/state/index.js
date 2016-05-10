import { extend, zipObject } from "lodash";
import when from "when";
import messenger from "../mixins/messenger";
import parsers from "./parsers";

function AppState() {
  this.state = {};
  this.setupSubscriptions();
}

extend( AppState.prototype, {
  setupSubscriptions() {
    this.subscribe( { topic: "weather-data.fetched", handler: this.onDataFetched } );
  },

  onDataFetched( data, env ) {
    when.all( [
      parsers.transformRawWeatherHistoryData( data ),
      parsers.parseAnnualAveragesData( data )
    ] ).then( results => {
      this.state = zipObject( [
        "weatherHistoryData",
        "annualAveragesData"
      ], results );
      this.publish( { topic: "state.changed", data: this.state } );
    } ).catch( err => {
      throw err;
    } );
  }
}, messenger );

export default AppState;

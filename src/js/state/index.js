import { extend } from "lodash";
import messenger from "../mixins/messenger";
import transforms from "./transforms";

function AppState() {
  this.state = {};
  this.setupSubscriptions();
}

extend( AppState.prototype, {
  setupSubscriptions() {
    this.subscribe( { topic: "weather-data.fetched", handler: this.onDataFetched } );
  },

  onDataFetched( data, env ) {
    transforms.transformWeatherHistoryData( data ).then( results => {
      this.state.weatherHistoryData = results;
      this.publish( { topic: "state.changed", data: this.state } );
    } );
  }
}, messenger );

export default AppState;

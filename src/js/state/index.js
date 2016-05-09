import messenger from "../composers/messenger";
import transforms from "./transforms";

export default () => {
  class AppState {
    constructor() {
      this.state = {};
      this.setupSubscriptions();
    }

    setupSubscriptions() {
      this.subscribe( { topic: "weather-data.fetched", handler: this.onDataFetched } );
    }

    onDataFetched( data, env ) {
      transforms.transformWeatherHistoryData( data ).then( results => {
        this.state.weatherHistoryData = results;
        this.publish( { topic: "state.changed", data: this.state } );
      } );
    }
  };

  AppState = messenger( { target: AppState } );

  return new AppState();
};

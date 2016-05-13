import { extend, zipObject } from "lodash";
import when from "when";
import messenger from "../mixins/messenger";
import parsers from "./parsers";

function AppState( options ) {
  this.i18n = options.i18n;
  this.state = {};
  this.setupSubscriptions();
}

extend( AppState.prototype, {

  setupSubscriptions() {
    this.subscribe( { topic: "weather-data.fetched", handler: this.onDataFetched } );
    this.subscribe( { topic: "selected-year.changed", handler: this.onSelectedYearChanged } );
  },

  onDataFetched( data, env ) {
    when.all( [
      parsers.transformRawWeatherHistoryData( data ),
      parsers.parseAnnualAveragesData( data, this.i18n.data.annualAveragesChart ),
      parsers.parseAnnualWeatherSelectorData( data, this.i18n.data.annualWeatherSelectorChart )
    ] ).then( results => {
      this.state = zipObject( [
        "weatherHistoryData",
        "annualAveragesData",
        "annualWeatherSelectorChartData"
      ], results );

      this.stateChanged();
    } ).catch( err => {
      throw err;
    } );
  },

  onSelectedYearChanged( data, env ) {
    const annualWeatherSelectorChartData = this.state.annualWeatherSelectorChartData;
    const newState = extend( {}, this.state, {
      annualWeatherSelectorChartData: {
        annualWeatherData: annualWeatherSelectorChartData.annualWeatherData,
        years: annualWeatherSelectorChartData.years,
        selectedYear: data,
        selectedYearData: annualWeatherSelectorChartData.annualWeatherData[ data ]
      }
    } );

    this.state = newState;
    this.stateChanged();
  },

  stateChanged() {
    this.publish( { topic: "state.changed", data: this.state } );
  }

}, messenger );

export default AppState;

import { extend } from "lodash";
import messenger from "../mixins/messenger";

function Actions() {};

extend( Actions.prototype, {
  requestWeatherData() {
    this.publish( { topic: "weather-data.requested" } );
  },

  selectYear( year ) {
    this.publish( { topic: "selected-year.changed", data: year } );
  }
}, messenger );

export default Actions;

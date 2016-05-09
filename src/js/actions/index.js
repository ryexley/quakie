import { extend } from "lodash";
import messenger from "../mixins/messenger";

function Actions() {};

extend( Actions.prototype, {
  requestWeatherData() {
    this.publish( { topic: "weather-data.requested" } );
  }
}, messenger );

export default Actions;

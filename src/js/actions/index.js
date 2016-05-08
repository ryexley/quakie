import messenger from "../composers/messenger";

export default () => {

  class Actions {
    constructor() {}

    requestWeatherData() {
      this.publish( { topic: "weather-data.requested" } );
    }
  };

  Actions = messenger( { target: Actions } );

  return new Actions();

};

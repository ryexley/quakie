import messenger from "../composers/messenger";

export default () => {

  class Actions {
    constructor() {}

    requestWeatherData() {
      console.log( "I need some weather data" );
    }
  };

  Actions = messenger( { target: Actions } );

  return new Actions();

};

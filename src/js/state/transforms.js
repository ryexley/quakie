import when from "when";

export default {
  transformWeatherHistoryData( data ) {
    return when.promise( ( resolve, reject ) => {
      const results = data.map( item => {
        return {
          date: item.weather_data.history.date,
          observations: item.weather_data.history.observations,
          summary: item.weather_data.history.dailysummary[ 0 ]
        }
      } );

      resolve( results );
    } );
  }
};

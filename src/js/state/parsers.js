import when from "when";
import math from "mathjs";

export default {
  transformRawWeatherHistoryData( data ) {
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
  },

  parseAnnualAveragesData( data ) {
    let averages = {};
    let labels = [];
    let means = [];
    let lows = [];
    let highs = [];

    return when.promise( ( resolve, reject ) => {
      data.forEach( item => {
        const history = item.weather_data.history;
        const year = history.date.year;
        const summary = history.dailysummary[ 0 ];

        if( !averages[ year ] ) {
          averages[ year ] = {
            means: [],
            lows: [],
            highs: []
          };
        }

        averages[ year ].means.push( summary.meantempi );
        averages[ year ].lows.push( summary.mintempi );
        averages[ year ].highs.push( summary.maxtempi );
      } );

      Object.keys( averages ).forEach( year => {
        labels.push( year );
        means.push( Math.round( math.mean( averages[ year ].means ) ) );
        lows.push( Math.round( math.mean( averages[ year ].lows ) ) );
        highs.push( Math.round( math.mean( averages[ year ].highs ) ) );
      } );

      const averagesData = {
        labels,
        datasets: [ {
          label: "Annual Average",
          data: means
        }, {
          label: "Average High",
          data: highs
        }, {
          label: "Average Low",
          data: lows
        } ]
      };

      resolve( averagesData );
    } );
  }
};

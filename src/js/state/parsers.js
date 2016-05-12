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

  parseAnnualAveragesData( data, localizationData ) {
    let averages = {};
    let labels = [];
    let means = [];
    let lows = [];
    let highs = [];
    let winds = [];

    return when.promise( ( resolve, reject ) => {
      data.forEach( item => {
        const history = item.weather_data.history;
        const year = history.date.year;
        const summary = history.dailysummary[ 0 ];

        if( !averages[ year ] ) {
          averages[ year ] = {
            means: [],
            lows: [],
            highs: [],
            winds: []
          };
        }

        averages[ year ].means.push( summary.meantempi );
        averages[ year ].lows.push( summary.mintempi );
        averages[ year ].highs.push( summary.maxtempi );
        averages[ year ].winds.push( summary.meanwindspdi );
      } );

      Object.keys( averages ).forEach( year => {
        labels.push( year );
        means.push( Math.round( math.mean( averages[ year ].means ) ) );
        lows.push( Math.round( math.mean( averages[ year ].lows ) ) );
        highs.push( Math.round( math.mean( averages[ year ].highs ) ) );
        winds.push( Math.round( math.mean( averages[ year ].winds ) ) );
      } );

      const averagesData = {
        labels,
        datasets: [ {
          label: localizationData.legend.averageWindSpeedLabel,
          data: winds
        }, {
          label: localizationData.legend.overallAverageLabel,
          data: means
        }, {
          label: localizationData.legend.averageHighLabel,
          data: highs
        }, {
          label: localizationData.legend.averageLowLabel,
          data: lows
        } ]
      };

      resolve( averagesData );
    } );
  }
};

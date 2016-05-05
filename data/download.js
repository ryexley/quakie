const _ = require( "lodash" );
const config = require( "../config/" );
const got = require( "got" );
const pfs = require( "promised-io/fs" );
const massive = require( "massive" );
const moment = require( "moment" );
const when = require( "when" );
const sequence = require( "when/sequence" );
const pipeline = require( "when/pipeline" );
const logUpdate = require( "log-update" );
const ora = require( "ora" );

const years = 30;
const months = [ "10", "11" ];
const days = [ "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "01", "02", "03", "04", "05" ];
const runLimit = 17;
const dailyApiCallLimit = 500;
const today = moment().format( "YYYYMMDD" );

let db = {};
let startTime = {};
let apiCalls = {};
let runIndex = 0;
let totalDatesToFetch = 0;
let totalDatesAlreadyFetched = 0;

function url( dateString ) {
  return `http://api.wunderground.com/api/${ config.weatherUndergroundApiKey }/history_${ dateString }/q/CO/somerset.json`;
}

function timeFormat( diff ) {
  const LN1000 = Math.log( 1000 );
  const UNIT_LABELS = [ " ns", " μs", " ms" ];
  let minutes, seconds;

  if ( diff[ 0 ] ) {
    let s = diff[ 0 ] + diff[ 1 ] / 1e9;
    let seconds = ( Math.round( s * 100 ) / 100 );

    if( seconds >= 60 ) {
      minutes = Math.round( seconds / 60 );
      seconds = Math.round( ( ( seconds % 60 ) * 100 ) / 100 );
      return `${ minutes }m ${ seconds }s`;
    }

    return `${ seconds }s`;
  } else {
    let magnitude = Math.floor( Math.log( diff[ 1 ] ) / LN1000 );
    return Math.round( diff[ 1 ] / Math.pow( 1000, magnitude ) ) + UNIT_LABELS[ magnitude ];
  }
}

function saveData( data ) {
  const fileContents = _.extend( {}, { apiCalls: apiCalls }, historyData );

  return pfs.writeFile( `${ __dirname }/weather-data.json`, JSON.stringify( fileContents, null, 2 ), "utf-8" ).then( () => {
    console.log( "Data successfully written to file weather-data.json" );
  } );
}

function getFetchedDates( datesToFetch ) {
  return when.promise( ( resolve, reject ) => {
    db.raggeds_weather_history.find( {}, { columns: [ "date" ] }, ( err, results ) => {
      if( err ) {
        return reject( err );
      }

      let fetchedDates = _.map( results, result => {
        let date = moment( result.date );
        const utcOffset = date.utcOffset();
        date = date.subtract( utcOffset, "minutes" );
        return date.format( "YYYYMMDD" );
      } );

      resolve( { datesToFetch, fetchedDates } );
    } )
  } );
}

function getApiThrottlingData() {
  return when.promise( ( resolve, reject ) => {
    db.weather_underground_api_throttling.find( ( err, apiThrottlingData ) => {
      if( err ) {
        reject( err );
      }

      const apiThrottlingDataForToday = _.find( apiThrottlingData, { date: today } );

      if( !apiThrottlingDataForToday ) {
        updateApiCalls( { date: today, api_call_count: 0 } )
          .then( result => {
            resolve( ( apiThrottlingData || [] ).concat( [ result ] ) );
          } )
          .catch( err => {
            reject( new Error( "Failed to update API throttling data", err ) );
          } );
      } else {
        resolve( apiThrottlingData );
      }
    } );
  } );
}

function updateApiCalls( apiThrottlingData ) {
  return when.promise( ( resolve, reject ) => {
    db.weather_underground_api_throttling.save( apiThrottlingData, ( err, result ) => {
      if( err ) {
        reject( err );
      }

      resolve( result );
    } );
  } );
}

function saveWeatherData( date, weatherData ) {
  return when.promise( ( resolve, reject ) => {
    db.raggeds_weather_history.save( {
      date: date,
      year: weatherData.year,
      month: weatherData.month,
      day: weatherData.day,
      weather_data: weatherData
    }, ( err, result ) => {
      if( err ) {
        reject( err );
      }

      resolve( result );
    } );
  } );
}

function fetchDataFor( { year, month, day }, apiThrottlingData ) {
  const key = `${ year }${ month }${ day }`;
  let success = false;
  console.log( `Fetching data for ${ key }...` );

  return when.promise( ( resolve, reject ) => {
    setTimeout( () => {
      got( url( key ) )
        .then( response => {
          const weatherData = {
            year,
            month,
            day,
            date: { year, month, day },
            data: response.body
          };

          saveWeatherData( key, weatherData ).then( result => {
            console.log( `✓ Weather history data successfully fetched and saved for ${ key } (new record id: ${ result.id })\n` );
            success = true;
          } )
          .catch( err => {
            console.log( `Error saving weather data for ${ key }:\n${ err }` );
            reject( err );
          } )
          .finally( () => {
            apiThrottlingData.api_call_count = ( apiThrottlingData.api_call_count + 1 );
            updateApiCalls( apiThrottlingData ).then( () => {
              if( success ) {
                resolve( key );
              }
            } );
          } );
        } )
        .catch( err => {
          historyData.dates[ key ] = {
            message: `Error fetching data for ${ key }`,
            error: err
          }
        } );
    }, 7000 );
  } );
}

function fetchData( { datesToFetch, fetchedDates } ) {
  let datesToFetchForThisRun = [];
  const dateKeys = Object.keys( datesToFetch );

  totalDatesToFetch = dateKeys.length;
  totalDatesAlreadyFetched = fetchedDates.length;

  getApiThrottlingData()
    .then( apiThrottlingData => {
      const apiThrottlingDataForToday = _.find( apiThrottlingData, { date: today } );

      if( apiThrottlingDataForToday && apiThrottlingDataForToday.api_call_count >= dailyApiCallLimit ) {
        console.log( "Daily API call limit reached, aborting. Please try again tomorrow" );
        process.exit();
      }

      if( dateKeys.length ) {
        dateKeys.forEach( key => {
          const date = datesToFetch[ key ];

          if( !_.includes( fetchedDates, key ) ) {
            if( runIndex < runLimit ) {
              datesToFetchForThisRun.push( fetchDataFor.bind( null, date.parts, apiThrottlingDataForToday ) );
              runIndex = ( runIndex + 1 );
              totalDatesAlreadyFetched = ( totalDatesAlreadyFetched + 1 );
            }
          }
        } );

        console.log( `Fetching data for ${ datesToFetchForThisRun.length } of ${ totalDatesToFetch } total dates (throttled run limit)...\n` );

        sequence( datesToFetchForThisRun ).then( results => {
          endRun( results );
        } );
      } else {
        console.log( "All configured data has been fetched and saved...congratulations, now do something with it." );
        process.exit();
      }
    } );
}

function endRun( data ) {
  const runTimeDiff = process.hrtime( startTime );
  const time = timeFormat( runTimeDiff );
  const header = "\n==========================================================\n";
  const footer = "\n==========================================================\n";
  const runMessage = `Run complete. Weather data fetched for ${ data.length } dates in ${ time }\n`;
  const summaryMessage = `${ ( totalDatesToFetch - totalDatesAlreadyFetched ) } of ${ totalDatesToFetch } remain to be fetched`;

  console.log( `${ header }${ runMessage }${ summaryMessage }${ footer }` );
  process.exit();
}

function calculateDatesToFetch() {
  return when.promise( ( resolve, reject ) => {
    const currentYear = new Date().getFullYear();
    let datesToFetch = {};
    let startYear = ( currentYear - ( years + 1 ) );
    let year = startYear;
    let octoberDay, novemberDay;

    while( startYear < currentYear ) {
      year = startYear;

      months.forEach( month => {
        days.forEach( day => {
          octoberDay = ( month === "10" && parseInt( day, 10 ) > 5 );
          novemberDay = ( month === "11" && parseInt( day, 10 ) < 20 );

          if( octoberDay || novemberDay ) {
            const key = `${ year }${ month }${ day }`;
            datesToFetch[ key ] = {
              parts: { year, month, day }
            };
          }
        } );
      } );

      startYear = ( startYear + 1 );
    }

    resolve( datesToFetch );
  } );
}

function downloadData() {
  startTime = process.hrtime();

  db = massive.connectSync( {
    connectionString: config.db.getConnectionString()
  } );

  pipeline( [ calculateDatesToFetch, getFetchedDates ] ).then( fetchData );
}

downloadData();

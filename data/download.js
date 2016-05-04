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
const runLimit = 2; // 17;
const dailyApiCallLimit = 500;
const today = moment().format( "YYYYMMDD" );

let db = {};
let startTime = {};
let apiCalls = {};
let runIndex = 0;

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

      console.log( "fetchedDates results", results );

      let fetchedDates = _.map( results, result => {
        let date = moment( result.date );
        const utcOffset = date.utcOffset();
        date = date.subtract( utcOffset, "minutes" );
        return date.format( "YYYYMMDD" );
      } );

      return resolve( { datesToFetch, fetchedDates } );
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
        // console.log( "found nothing for today...creating a new record..." );
        updateApiCalls( { date: today, api_call_count: 0 } )
          .then( result => {
            // console.log( "Updated api throttling data", "result:", result );
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
  console.log( "updateApiCalls", "apiThrottlingData:", apiThrottlingData );
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

  return when.promise( ( resolve, reject ) => {
    setTimeout( () => {
      console.log( `Fetching data for ${ key }` );

      resolve( key );

      got( url( key ) )
        .then( response => {
          const weatherData = {
            date: { year, month, day },
            data: response.body
          };

          saveWeatherData( key, weatherData ).then( result => {
            console.log( `Weather history data successfully fetched and saved for ${ key } (new record id: ${ result.id })` );
            resolve( );
          } )
          .catch( err => {
            console.log( `Error saving weather data for ${ key }:\n${ err }` );
            process.exit();
          } )
          .finally( () => {
            apiThrottlingData.api_call_count = ( apiThrottlingData.api_call_count + 1 );
            // just need to update this value, no need to do anything with the result
            // but we have to handle the promise returned
            updateApiCalls( apiThrottlingData ).then( _.identity );
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

  getApiThrottlingData().then( apiThrottlingData => {
    console.log( "apiThrottlingData:", apiThrottlingData );
    const apiThrottlingDataForToday = _.find( apiThrottlingData, { date: today } );
    console.log( "apiThrottlingDataForToday", apiThrottlingDataForToday );

    if( apiThrottlingDataForToday && apiThrottlingDataForToday.api_call_count >= dailyApiCallLimit ) {
      console.log( "Daily API call limit reached, aborting. Please try again tomorrow" );
      process.exit();
    }

    dateKeys.forEach( key => {
      const date = datesToFetch[ key ];

      if( _.includes( fetchedDates, key ) ) {
        console.log( `Data already fetched for ${ key }, skipping` );
      } else {
        if( runIndex < runLimit ) {
          datesToFetchForThisRun.push( fetchDataFor.bind( null, date.parts, apiThrottlingDataForToday ) );
          runIndex = ( runIndex + 1 );
        }
      }
    } );

    console.log( `Fetching data for ${ datesToFetchForThisRun.length } dates (throttled run limit count)...` );

    return sequence( datesToFetchForThisRun );
  } );
}

function runLimitHit( data ) {
  const datesThatRemainToBeFetched = _.filter( historyData.dates, date => {
    return _.isEmpty( date.data );
  } ).length;
  console.log( `Run limit hit for this session. ${ datesThatRemainToBeFetched } remain to be fetched.` );
  saveData( data ).then( () => {
    const diff = process.hrtime( startTime )
    const time = timeFormat( diff );
    console.log( "Process completed in ", time );
  } ).then( () => {
    process.exit();
  } );
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

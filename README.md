Quakie: Historical Weather Data for the Raggeds Wilderness Area in Colorado
===========================================================================

This is a personal project that serves multiple purposes:

* Downloads and saves historical weather data from [the Weather Underground API](wunderground.com/weather/api/) and persists it to a Postgres database
* Aggregates and displays charts of the downloaded data
* Afforded me an opportunity to play around with some technology I wanted some more experience with

## Up and running

#### Dependencies

You will need to have [node.js](https://nodejs.org/en/) installed, and have a [postgres](http://www.postgresql.org/) database available. That should be it, if you have those, you should be able to clone this repository and get up-and-running with it.

#### Making it happen

* Clone the repository locally
* Run `npm install`
* **To download the data**, you will need to register an account with Weather Underground, and get an API key. Once you have that key, create a `config.json` file in the root of the project. You can use `./config/config.defaults.json` as a template. Insert your API key into that file, as well as your database connection details. Once that is in place and updated, you should be able to run `node data/download.js` to start downloading and saving the historical weather data. Weather Underground's API has restrictions on the number of requests that can be made to the API per minute and per day, so this download script will throttle the amount of data it will download each time it is run. It will need to be run several times to get all of the configured historical data downloaded.
* **To build the UI**, run `npm start build`. This will put the JS bundle needed to run the UI in the appropriate places for the app to run.
* **To start the server**, run `npm start server`. This should spin up a local express.js web server running the app on port 7000. Open your browser to [http://localhost:7000](http://localhost:7000).
* **To edit the UI**, you can run `npm start build.watch` and the UI assets will be re-bundled/generated anytime a change is made to files in the `/src` directory.

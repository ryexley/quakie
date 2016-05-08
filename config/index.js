const _ = require( "lodash" );
const path = require( "path" );

const defaults = require( "./config.defaults.json" );
const local = require( "../config.json" );

const config = _.merge( defaults, local, {
  db: {
    getConnectionString() {
      return `postgres://${ this.username }:${ this.password }@${ this.host }/${ this.database }`;
    }
  }
} );

module.exports = config;

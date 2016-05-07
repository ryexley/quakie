import React from "react";
import ReactDOM from "react-dom";
import dbFactory from "./data/db";
import App from "./app";

const db = dbFactory( {} ); // TODO: pass config with database connection data

ReactDOM.render( <App />, document.getElementById( "root" ) );

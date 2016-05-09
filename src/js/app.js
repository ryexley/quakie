import { extend } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import messenger from "./mixins/messenger";

class App extends React.Component {
  constructor() {
    super();
    this.actions = new Actions();
  }

  componentWillMount() {
    this.startWiretap( {} );
  }

  componentDidMount() {
    this.actions.requestWeatherData();
  }

  render() {

    return (
      <section>
        Is this thing on?
      </section>
    );
  }
};

App.propTypes = {};

App.defaultProps = {};

extend( App.prototype, messenger );

export default App;

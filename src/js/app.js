import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";

class App extends React.Component {
  constructor() {
    super();
    this.actions = new Actions();
  }

  render() {
    this.actions.requestWeatherData();

    return (
      <section>
        Is this thing on?
      </section>
    );
  }
};

App.propTypes = {};

App.defaultProps = {};

export default App;

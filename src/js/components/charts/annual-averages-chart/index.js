import { merge, clone } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import LineChart from "../line-chart";
import styles from "./style.css";

class AnnualAveragesChart extends React.Component {
  render() {
    const data = this.props.data;

    // apply some styling to the datasets
    // TODO: try to figure out why this works...it *works*, but I don't really understand how or why
    merge( clone( data.datasets ), [ {
        pointBackgroundColor: "rgba( 165, 165, 165, 1 )",
        borderColor: "rgba( 165, 165, 165, 1 )", // average
        backgroundColor: "rgba( 165, 165, 165, 0.5 )",
        borderWidth: 1
      }, {
        pointBackgroundColor: "rgba( 255, 0, 0, 1 )",
        borderColor: "rgba( 255, 0, 0, 1 )", // highs
        backgroundColor: "rgba( 255, 0, 0, 0.1 )",
        borderWidth: 1
      }, {
        pointBackgroundColor: "rgba( 0, 105, 205, 1 )",
        borderColor: "rgba( 0, 105, 205, 1 )", // lows
        backgroundColor: "rgba( 0, 105, 205, 0.1 )",
        borderWidth: 1
      } ] );

    const chartOptions = {
      attributes: {
        width: "500"
      },
      chartData: data
    };

    return (
      <div className={ styles.annualAveragesChart }>
        <LineChart { ...chartOptions } />
      </div>
    );
  }
};

AnnualAveragesChart.propTypes = {};

AnnualAveragesChart.defaultProps = {};

export default AnnualAveragesChart;

import { merge, clone } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import LineChart from "../line-chart";
import styles from "./style.css";

class AnnualAveragesChart extends React.Component {
  render() {
    const data = this.props.data;
    const localizationData = this.props.i18n.data.annualAveragesChart;

    // apply some styling to the datasets
    // TODO: try to figure out why this works...it *works*, but I don't really understand how or why
    merge( clone( data.datasets ), [ {
       // average
        pointBackgroundColor: "rgba( 165, 165, 165, 1 )",
        borderColor: "rgba( 165, 165, 165, 1 )",
        backgroundColor: "rgba( 255, 255, 255, 0.9 )",
        fill: false,
        borderWidth: 1
      }, {
        // highs
        pointBackgroundColor: "rgba( 255, 0, 0, 1 )",
        borderColor: "rgba( 255, 0, 0, 1 )",
        backgroundColor: "rgba( 255, 0, 0, 0.1 )",
        fill: false,
        borderWidth: 1
      }, {
        // lows
        pointBackgroundColor: "rgba( 0, 105, 205, 1 )",
        borderColor: "rgba( 0, 105, 205, 1 )",
        backgroundColor: "rgba( 0, 105, 205, 0.1 )",
        fill: false,
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
        <div className={ styles.description }>{ localizationData.description }</div>
      </div>
    );
  }
};

AnnualAveragesChart.propTypes = {};

AnnualAveragesChart.defaultProps = {};

export default AnnualAveragesChart;

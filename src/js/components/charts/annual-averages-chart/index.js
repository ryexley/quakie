import React from "react";
import ReactDOM from "react-dom";
import LineChart from "../line-chart";
import styles from "./style.css";

class AnnualAveragesChart extends React.Component {
  render() {
    return (
      <div className={ styles.annualAveragesChart }>
        TODO: render an annual averages chart
        <LineChart />
      </div>
    );
  }
};

AnnualAveragesChart.propTypes = {};

AnnualAveragesChart.defaultProps = {};

export default AnnualAveragesChart;

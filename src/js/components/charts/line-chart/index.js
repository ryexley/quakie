import React from "react";
import ReactDOM from "react-dom";
import Chart from "chart.js";
import styles from "./style.css";

class LineChart extends React.Component {
  renderChart() {
    const componentEl = ReactDOM.findDOMNode( this.lineChart );
    new Chart( componentEl, {
      type: "line",
      data: this.props.chartData
    } );
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  render() {
    return (
      <canvas { ...this.props.attributes } className={ styles.lineChart } ref={ lc => this.lineChart = lc }>
      </canvas>
    );
  }
};

LineChart.propTypes = {};

LineChart.defaultProps = {};

export default LineChart;

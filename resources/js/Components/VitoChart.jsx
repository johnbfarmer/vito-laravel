import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const VitoChart = (props) => {

    console.log(props)
    let chartType = props.chart_type || 'none'
    let metrics = props.metrics ? props.metrics.split(',') : ['distance_run']
    const getSeries = (metric) => {
        let data = []
        props.data.forEach(d => {
            data.push(parseFloat(d[metric]) || 0)
        })
        return {
            name: metric,
            type: chartType,
            data: data.reverse()
        }
    }

    const getLabels = () => {
        let labels = []
        props.data.forEach(d => {
            labels.push(d['date'])
        })

        return labels.reverse()
    }

    let series = []
    metrics.forEach(m => {
        series.push(getSeries(m))
    })

    const options = {
        title: {
            text: props.title || metrics.join(', ')
        },
        series: series,
        xAxis: {
            categories: getLabels()
        }
    }

    return (
        <div>
            {
                chartType !== 'none' &&
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options}
                />
            }
        </div>
    )
}

export default VitoChart;

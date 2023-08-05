import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const yAxesList = {
    ttl: { units: 'number'},
    ttl_lg: { units: 'number'},
    ttl_sm: { units: 'number'},
    km: { units: 'km'},
    mins: { units: 'minutes'},
    stepsPerKm: { units: 'step-km'},
    pct: { units: 'percent'},
    weight: { units: 'kg'},
    mi: { units: 'miles'},
}
const yAxesByMetric = {
    score: 'ttl',
    distance_run: 'km',
    distance: 'km',
    abdominals: 'ttl',
    sleep: 'mins',
    steps: 'ttl_lg',
    stepsPerKm: 'stepsPerKm',
    za: 'pct',
    weight: 'weight',
    floors: 'ttl',
    floors_run: 'ttl',
    very_active_minutes: 'ttl',
    distance_biked: 'mi',
    swim: 'ttl_sm',
}

const VitoChart = (props) => {
    let chartType = props.chart_type || 'none'
    let metrics = props.metrics ? props.metrics.split(',') : ['distance_run']
    let yAxes = []
    let yAxesMap = []

    const getSeries = (metric) => {
        let data = []
        props.data.forEach(d => {
            let pt = parseFloat(d[metric])
            if (pt) {
                data.push([Date.parse(d['date']), pt])
            }
        })
        let yAxis = yAxesByMetric[metric]
        let yAxIdx = yAxesMap.indexOf(yAxis)
        if (yAxIdx < 0) {
            let opts = { title:{ text: yAxesList[yAxis].units } }
            if (yAxes.length % 2) {
                opts.opposite = true
            }
            yAxes.push(opts)
            yAxesMap.push(yAxis)
            yAxIdx = yAxes.length - 1
        }

        return {
            name: metric,
            type: chartType,
            data: data.reverse(),
            yAxis: yAxIdx
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
            type: 'datetime',
            ordinal: true,
            labels: {
                formatter: function() {
                return Highcharts.dateFormat('%b %e, %Y', this.value);
                }
            },
        },
        yAxis: yAxes
    }

    const getYAxes = () => {
        return yAxes
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

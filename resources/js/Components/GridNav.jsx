import React from 'react';
import { Link } from '@inertiajs/react';
import { format, subDays, subWeeks, subMonths, subYears, lastDayOfMonth, addHours, startOfMonth, lastDayOfYear, startOfYear, lastDayOfWeek, startOfWeek, getDaysInMonth } from 'date-fns';

const GridNav = (props) => {
    let aggly
    const prevView = props.previousView, prevViewData = props.previousViewData, nextViewData = props.nextViewData
    if ('chart_type' in props) {
        prevViewData.chart_type = props.chart_type
        nextViewData.chart_type = props.chart_type
    }
    if ('metrics' in props) {
        prevViewData.metrics = props.metrics
        nextViewData.metrics = props.metrics
    }
    switch (props.agg) {
        case 'd':
            aggly = 'daily'
            break
        case 'w':
            aggly = 'weekly'
            break
        case 'y':
            aggly = 'yearly'
            break
        default:
            aggly = 'monthly'
    }

    return (
        <div className="w-full flex justify-center space-x-8">
            <div className=''><Link href={ route('vital-stats.' + prevView, prevViewData) }>&lt;</Link></div>
            <div className=''>Vito Stats { aggly } { props.startOfDateRange } - { props.endOfDateRange }</div>
            <div className=''><Link href={ route('vital-stats.' + prevView, nextViewData) }>&gt;</Link></div>
        </div>
    );
};

export default GridNav;

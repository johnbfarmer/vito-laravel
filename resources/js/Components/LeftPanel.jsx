import React from 'react';
import NavLinkVertical from '@/Components/NavLinkVertical';
import NavLink from '@/Components/NavLink';
import { BarChartFill, GraphUp, FileMinus } from 'react-bootstrap-icons';

const LeftPanel = (props) => {
    const path = window.location.pathname
    const search = window.location.search.substring(1)
    let parts = search.split('&')
    let personIdIdx = 0, chartTypeIdx = 0, agg = '', chartType = null, metrics = null
    parts.forEach((p, idx) => {
        if (p.search('person_id=') >= 0) {
            personIdIdx = idx
        }
        if (p.search('agg=') >= 0) {
            agg = p.substring(4)
        }
        if (p.search('chart_type=') >= 0) {
            chartTypeIdx = idx
            chartType = p.substring(11)
        }
        if (p.search('metrics=') >= 0) {
            metrics = decodeURIComponent(p.substring(8))
        }
    })
    const getUrl = (id, chartType = null) => {
        parts[personIdIdx] = 'person_id=' + id
        if (chartType) {
            parts[chartTypeIdx] = 'chart_type=' + chartType
        }
        return path + '?' + parts.join('&')
    }
    let personId = parts[personIdIdx].substring(1+parts[personIdIdx].search('='))
    return (
        <div className="flex flex-col">
            <NavLinkVertical href={route('vital-stats.index', { agg: 'm', person_id: props.person_id, chart_type: chartType, metrics: metrics })} active={route().current('vital-stats.index') && agg === 'm'}>
                12 month view
            </NavLinkVertical>
            <NavLinkVertical href={route('vital-stats.this-month', { person_id: props.person_id, chart_type: chartType, metrics: metrics })} active={ agg === 'd' || route().current('vital-stats.this-month') }>
                this month
            </NavLinkVertical>
            <NavLinkVertical href={route('vital-stats.this-week', { person_id: props.person_id, chart_type: chartType, metrics: metrics })} active={ agg === 'd' || route().current('vital-stats.this-week') }>
                this week
            </NavLinkVertical>
            <NavLinkVertical href={route('vital-stats.weeks', { person_id: props.person_id, chart_type: chartType, metrics: metrics })} active={route().current('vital-stats.weeks')}>
                last few weeks
            </NavLinkVertical>
            <NavLinkVertical href={route('vital-stats.index', { agg: 'y', u: 3, person_id: props.person_id, chart_type: chartType, metrics: metrics })} active={ agg === 'y' }>
                last few years
            </NavLinkVertical>
            <NavLinkVertical href={route('vital-stats.edit', { vital_stat: 0, person_id: props.person_id })} active={route().current('vital-stats.edit')}>
                new record
            </NavLinkVertical>
            <div className='flex pt-5'>
                <NavLink href={ getUrl(props.person_id, 'none') } active={ 'none' == chartType }>
                    <FileMinus />
                </NavLink>
                <NavLink href={ getUrl(props.person_id, 'column') } active={ 'column' == chartType }>
                    <BarChartFill />
                </NavLink>
                <NavLink href={ getUrl(props.person_id, 'line') } active={ 'line' == chartType }>
                    <GraphUp />
                </NavLink>
            </div>
            {
                props.people.map(p => {
                    return (
                        <NavLinkVertical key={ p.id } href={ getUrl(p.id) } active={ p.id == personId }>
                            { p.name.toLowerCase() }
                        </NavLinkVertical>
                    )
                })
            }
        </div>
    );
};

export default LeftPanel;

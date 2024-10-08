import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, Link, Head } from '@inertiajs/react';
import { format, parseISO, isLeapYear } from 'date-fns';
import GridNav from '@/Components/GridNav';
import VitoChart from '@/Components/VitoChart';
import { parseQuery } from '@/Helpers/OmniHelper';
import { ChevronCompactDown, ChevronCompactUp, Download, Pencil } from 'react-bootstrap-icons';

const Index = ({auth, reqData, reqTotal, reqAvgs, agg, people, personId, reqDateInfo}) => {
    const queryString = parseQuery(window.location.search)
    if (!('metrics' in queryString)) {
        queryString.metrics = 'distance_run'
    }
    const [data, setData] = useState(reqData)
    const [total, setTotal] = useState(reqTotal)
    const [avgs, setAvgs] = useState(reqAvgs)
    const [dateInfo, setDateInfo] = useState(reqDateInfo)
    const [qs, setQs] = useState(queryString)
    const [altDown, setAltDown] = useState(false)
    const [metaDown, setMetaDown] = useState(false)

    const handleKeyDown = (e) => {
        if (e.altKey) {
            setAltDown(true)
        }
        if (e.key === "Meta") {
            setMetaDown(true)
        }
    }

    const handleKeyUp = (e) => {
        if (e.key === "Alt") {
            setAltDown(false)
        }
        if (e.key === "Meta") {
            setMetaDown(false)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, false);
        document.addEventListener("keyup", handleKeyUp, false);
    }, [qs])

    const dateDisplay = (rec) => {
        let args = { ...qs }
        switch (agg) {
            case 'd':
                return (
                    <Link href={route('vital-stats.edit', rec.record_id ) + getFilterQueryString(args)} preserveState className='px-1'>
                        { rec.date }
                    </Link>
                )
            case 'w':
                args.agg =  'd'
                args.dt =  format(new Date(rec.date.substring(2+rec.date.search('- '))), 'yyyy-MM-dd')
                args.u =  7
                return (
                    <Link href={route('vital-stats.index', args)} >
                        { rec.date }
                    </Link>
                )
            case 'y':
                args.agg =  'd'
                args.dt =  format(new Date('Dec 31, ' + rec.date), 'yyyy-MM-dd')
                args.u =  isLeapYear(new Date('Dec 31, ' + rec.date)) ? 366 : 365
                return (
                    <Link href={route('vital-stats.index', args)} >
                        { rec.date }
                    </Link>
                )
            default:
                args.agg =  'd'
                args.yearMonth = rec.id.substring(3)
                return (
                    <Link href={route('vital-stats.month', args)} >
                        { rec.date }
                    </Link>
                )
        }
    }

    const title = 'VITO'

    const getFilterQueryString = (qs) => {
        let newQs = ''
        let filterQsObj = qs
        for (let j in filterQsObj) {
            newQs = newQs + j + '=' + filterQsObj[j] + '&'
        }
        return newQs.length ? '?' + newQs.substring(0,newQs.length-1) : ''
    }

    const modifyUrlByFilter = (qs) => {
        let initialUrl = window.location.pathname
        let url = initialUrl + getFilterQueryString(qs)
        history.pushState(null, '', url)
        // console.log(url)
        router.visit(url, { preserveScroll: true })
    }

    const expand = (e) => {
        if (!('u' in qs)) {
            qs.u = data.length
        }
        qs.u = 1*qs.u + Math.min(12, qs.u)
        modifyUrlByFilter(qs)

        return pullData(qs)
    }

    const shrink = (e) => {
        if (!('u' in qs)) {
            qs.u = data.length
        }
        qs.u = 1*qs.u - Math.min(12, Math.floor(qs.u/2))
        modifyUrlByFilter(qs)

        return pullData(qs)
    }

    const pullData = (payload) => {
        payload.agg = agg
        fetch(route('vital-stats.pull', payload))
        .then(res => res.json())
        .then(
            (results) => {
                setData(results.reqData)
                setTotal(results.reqTotal)
                setAvgs(results.reqAvgs)
                setDateInfo(results.reqDateInfo)
            },
            (error) => {
                console.log('error',error)
            }
        )
    }

    const refreshDay = (dt) => {
        fetch(route('vital-stats.fetch', { person_id: 1, dt: dt }))
        .then(res => res.json())
        .then(
            (results) => {
                let params = parseQuery(window.location.search)
                pullData(params)
            },
            (error) => {
                console.log('error',error)
            }
        )
    }

    const chartMetric = (m) => {
        let tmp = { ...qs }
        if (altDown && tmp.metrics.length) {
            let metricsArr = tmp.metrics.split(',')
            if (metricsArr.indexOf(m) < 0) {
                metricsArr.push(m)
            } else {
                let pos = metricsArr.indexOf(m);
                metricsArr.splice(pos, 1);
            }
            m = metricsArr.join(',')
        }
        tmp.metrics = m
        if (tmp.metrics.length) {
            if (!('chart_type' in tmp) || tmp.chart_type === 'none') {
                tmp.chart_type = 'line'
            }
        } else {
            delete tmp.metrics
            delete tmp.chart_type
        }
        // TBI if MetaDown add the other type of chart, ie if currently col, add line usw
        setQs(tmp)
        modifyUrlByFilter(tmp)
    }

    return (
        <AuthenticatedLayout auth={ auth } user={ auth.user } header={ title } people={ people } person_id={ personId }>
            <Head title={ title }/>
            <div className='co-span-9'>
                <GridNav { ...qs } { ...dateInfo } />
                <VitoChart { ...qs } data={ data } />
                <table className='table-auto border-collapse border border-slate-400 shadow-lg w-full'>
                    <thead>
                        <tr>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300' >date</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('score') } >score</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('distance_run') } >km run</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('distance') } >dist</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('abdominals') } >abs</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('sleep') } >sleep</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('steps') } >steps</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('stepsPerKm') } >steps/km</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('za') } >za</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('weight') } >wt</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('floors') } >floors</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('floors_run') } >floors_run</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('very_active_minutes') } >vam</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('heart_rate') } >heart</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('distance_biked') } >mi biked</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('swim') } >swim</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300 cursor-pointer' onClick={ () => chartMetric('bp') } >bp</th>
                            <th className='border border-slate-300 px-3 py-4 bg-slate-300' >actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { data.map((r,idx) => {
                            let cls = idx % 2 ? 'bg-slate-200' : 'bg-grey-50';
                            let za = agg === 'd' ? (r.za == 1 ? 'Y' : '') : Math.round(1000 * r.za)/10
                            return (
                                <tr key={ `${r.id}` } className={ cls }>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ dateDisplay(r) }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.score }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.distance_run > 0 ? r.distance_run : '' }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.distance }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.abdominals > 0 ? r.abdominals : '' }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.sleep }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.steps }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.stepsPerKm }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ za }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.weight }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.floors }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.floors_run }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.very_active_minutes }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.heart_rate }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.distance_biked }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.swim }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-right'>{ r.bp }</td>
                                    <td className='border border-slate-300 px-3 py-1 text-center'>
                                        <div className='flex justify-center'>
                                        {
                                            agg === 'd' &&
                                            <div className='cursor-pointer mx-4' onClick={ () => refreshDay(r.id) } >
                                                <Download />
                                            </div>
                                        }
                                        {
                                            agg === 'd' &&
                                            <Link href={route('vital-stats.edit', r.record_id )} className='mx-4'>
                                                <Pencil />
                                            </Link>
                                        }
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}

                        <tr className=''>
                            <td className='border border-slate-300 px-3 py-1 text-right'>TOTALS</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.score }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.distance_run > 0 ? total.distance_run : '' }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.distance }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.abdominals > 0 ? total.abdominals : '' }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.sleep }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.steps }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.stepsPerKm }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ Math.round(1000 * total.za)/10 }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.weight }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.floors }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.floors_run }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.very_active_minutes }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.heart_rate }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.distance_biked }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.swim }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.bp }</td>
                            <td className='border border-slate-300 px-3 py-1'></td>
                        </tr>

                        <tr className=''>
                            <td className='border border-slate-300 px-3 py-1 text-right'>AVGS</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.score }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.distance_run > 0 ? avgs.distance_run : '' }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.distance }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.abdominals > 0 ? avgs.abdominals : '' }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.sleep }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.steps }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.stepsPerKm }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ Math.round(1000 * total.za)/10 }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.weight }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.floors }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.floors_run }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.very_active_minutes }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.heart_rate }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.distance_biked }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ avgs.swim }</td>
                            <td className='border border-slate-300 px-3 py-1 text-right'>{ total.bp }</td>
                            <td className='border border-slate-300 px-3 py-1'></td>
                        </tr>
                    </tbody>
                </table>
                <div className='w-full flex justify-center space-x-8'>
                    <ChevronCompactDown 
                        className='cursor-pointer'
                        style={{transform: 'scale(3)'}}
                        onClick={ expand }
                    />
                    <ChevronCompactUp
                        className='cursor-pointer '
                        style={{transform: 'scale(3)'}}
                        onClick={ shrink }
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Index;

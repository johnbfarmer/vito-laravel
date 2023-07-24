import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { format, parseISO } from 'date-fns';

const Edit = ({ auth, vs, people, person_id }) => {
    let id = 'id' in vs ? vs.id : 0
    const { data, setData, patch, processing, reset, errors } = useForm({
        id: id,
        person_id: id ? vs.person_id : person_id,
        date: id ? vs.date : format(new Date(), 'yyyy-MM-dd'),
        abdominals: id ? vs.abdominals : 0,
        comments: id ? vs.comments : '',
        bp: id && vs.systolic ? vs.systolic + '/' + vs.diastolic : '',
        diastolic: id ? vs.diastolic : '',
        distance_biked: id ? vs.distance_biked : 0,
        distance_run: id ? vs.distance_run : 0,
        distance: id ? vs.distance : 0,
        fairly_active_minutes: id ? vs.fairly_active_minutes : 0,
        floors_run: id ? vs.floors_run : 0,
        floors: id ? vs.floors : 0,
        height: id ? vs.height : '',
        lightly_active_minutes: id ? vs.lightly_active_minutes : 0,
        sedentary_minutes: id ? vs.sedentary_minutes : 0,
        sleep: id ? vs.sleep : '',
        steps: id ? vs.steps : 0,
        swim: id ? vs.swim : 0,
        systolic: id ? vs.systolic : '',
        very_active_minutes: id ? vs.very_active_minutes : 0,
        weight: id ? vs.weight : '',
        za: id && vs.za,
    });

    const submit = (e) => {
        e.preventDefault();
        console.log(data)
        patch(route('vital-stats.update', { vital_stat: data.id, person_id: person_id }));
    }

    let title = 'title goes here'

    return (
        <AuthenticatedLayout auth={ auth } user={ auth.user } header={ title } people={ people } person_id={ person_id }>
            <Head title={ title } />
                <div className='grid grid-flow-row-dense grid-cols-8 grid-rows-1 shrink grow basis-auto'>
                    <div className='col-span-4 bg-white p-10 border border-black rounded-xl shadow-2xl'>
                        <form onSubmit={ submit }>
                            <InputLabel>Date:</InputLabel>
                            <input
                                type='text'
                                value = { data.date }
                                onChange={e => setData('date', e.target.value)}
                                className='w-full p-2'
                                autoFocus
                            />
                            <InputError message={ errors.date } className='mt-2' />
                            <InputLabel>Km Run:</InputLabel>
                            <input
                                type='text'
                                value = { data.distance_run }
                                onChange={e => setData('distance_run', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.distance_run } className='mt-2' />
                            <InputLabel>Distance:</InputLabel>
                            <input
                                type='text'
                                value = { data.distance }
                                onChange={e => setData('distance', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.distance } className='mt-2' />
                            <InputLabel>ZA:</InputLabel>
                            <Checkbox
                                name = 'za'
                                checked = { data.za }
                                onChange={e => setData('za', !data.za)}
                                className='p-2'
                            />
                            <InputError message={ errors.za } className='mt-2' />
                            <InputLabel>Abs:</InputLabel>
                            <input
                                type='text'
                                value = { data.abdominals }
                                onChange={e => setData('abdominals', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.abdominals } className='mt-2' />
                            <InputLabel>Weight:</InputLabel>
                            <input
                                type='text'
                                value = { data.weight || '' }
                                onChange={e => setData('weight', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.weight } className='mt-2' />
                            <InputLabel>Swim:</InputLabel>
                            <input
                                type='text'
                                value = { data.swim || '' }
                                onChange={e => setData('swim', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.swim } className='mt-2' />
                            <InputLabel>BP:</InputLabel>
                            <input
                                type='text'
                                value = { data.bp || '' }
                                onChange={e => {
                                    let bp = e.target.value, syst = '', dias = '';
                                    if (bp.includes('/')) {
                                        let bpArr = bp.split('/');
                                        syst = parseInt(bpArr[0]) ;
                                        dias = parseInt(bpArr[1]);
                                        console.log(bpArr, syst, dias);
                                    }
                                    setData(data => ({...data, 'systolic': syst, 'diastolic': dias, 'bp': bp}));
                                }}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.bp } className='mt-2' />
                            <InputLabel>Miles Biked:</InputLabel>
                            <input
                                type='text'
                                value = { data.distance_biked || '' }
                                onChange={e => setData('distance_biked', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.distance_biked } className='mt-2' />
                            <InputLabel>Floors Run:</InputLabel>
                            <input
                                type='text'
                                value = { data.floors_run || '' }
                                onChange={e => setData('floors_run', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.floors_run } className='mt-2' />
                            <InputLabel>Sleep:</InputLabel>
                            <input
                                type='text'
                                value = { data.sleep || '' }
                                onChange={e => setData('sleep', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.sleep } className='mt-2' />
                            <InputLabel>Comments:</InputLabel>
                            <input
                                type='text'
                                value = { data.comments || '' }
                                onChange={e => setData('comments', e.target.value)}
                                className='w-full p-2'
                            />
                            <InputError message={ errors.comments } className='mt-2' />
                            <div className='m-2'>
                                <PrimaryButton>
                                    Save
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
};

export default Edit;

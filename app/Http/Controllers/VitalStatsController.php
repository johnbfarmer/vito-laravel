<?php

namespace App\Http\Controllers;

use App\Models\VitalStats;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Helpers\OmniHelper;
use App\Vito\FitbitFetch;

class VitalStatsController extends Controller
{
    public function index(Request $request)
    {
        $qs = $request->all();
        $personId = $qs['person_id'] ?? 1;
        $agg = $qs['agg'] ?? 'm';
        if ($agg === 'd') {
            $nu = $qs['u'] ?? date('d');
        } else {
            $nu = $qs['u'] ?? 12;
        }
        $ed = $qs['dt'] ?? date('Y-m-d');
        $data = $this->assembleVitalStatsData($personId, $agg, $ed, $nu);

        return Inertia::render('VitalStats/Index', $data);
    }

    public function indexAjax(Request $request)
    {
        $qs = $request->all();
        $personId = $qs['person_id'] ?? 1;
        $agg = $qs['agg'] ?? 'm';
        if ($agg === 'd') {
            $nu = $qs['u'] ?? date('d');
        } else {
            $nu = $qs['u'] ?? 12;
        }
        $ed = $qs['dt'] ?? date('Y-m-d');
        $data = $this->assembleVitalStatsData($personId, $agg, $ed, $nu);

        return $data;
    }

    public function thisMonth(Request $request)
    {
        return $this->month($request, date('Ym'));
    }

    public function month(Request $request, $yearMonth)
    {
        $qs = $request->all();
        $personId = $qs['person_id'] ?? 1;
        $ed = date('Y-m-t', strtotime(substr($yearMonth,0,4).'-'.substr($yearMonth,4,2).'-01'));
        $agg = 'd';
        $nu = date('t', strtotime($ed));
        $data = $this->assembleVitalStatsData($personId, $agg, $ed, $nu);
        $data['reqDateInfo']['previousView'] = 'month';
        $data['reqDateInfo']['previousViewData'] = ['person_id' => $personId, 'yearMonth' => date('Ym', strtotime($data['reqDateInfo']['previousEndDate']))];
        $data['reqDateInfo']['nextViewData'] = ['person_id' => $personId, 'yearMonth' => date('Ym', strtotime($data['reqDateInfo']['nextEndDate']))];
        
        return Inertia::render('VitalStats/Index', $data);
    }

    public function weeks(Request $request)
    {
        $qs = $request->all();
        $personId = $qs['person_id'] ?? 1;
        $ed = $qs['dt'] ?? date('Y-m-d');
        $agg = 'w';
        $nu = $qs['u'] ?? 10;
        $data = $this->assembleVitalStatsData($personId, $agg, $ed, $nu);
        // $data['dateInfo']['previousView'] = 'month';
        // $data['dateInfo']['previousViewData'] = ['person_id' => $personId, 'yearMonth' => date('Ym', strtotime($data['dateInfo']['previousEndDate']))];
        
        return Inertia::render('VitalStats/Index', $data);
    }

    protected function assembleVitalStatsData($personId, $agg, $ed, $nu)
    {
        $dateInfo = OmniHelper::getDateInfo($ed, $agg, $nu, $personId);
        // OmniHelper::log($dateInfo);
        $sd = $dateInfo['startOfDateRange'];
        return [
            'reqData' => VitalStats::userData($personId, $sd, $ed, $agg),
            'reqTotal' => VitalStats::userData($personId, $sd, $ed, $agg, true),
            'reqAvgs' => VitalStats::userDataAvgs($personId, $sd, $ed, $agg),
            'agg' => $agg,
            'people' => Person::where('active', 1)->get(),
            'personId' => $personId,
            'reqDateInfo' => $dateInfo,
        ];
    }

    public function fetch(Request $request)
    {
        $qs = $request->all();
        FitbitFetch::autoExecute(['date' => $qs['dt'], 'userId' => $qs['person_id']]);
        return redirect(route('vital-stats.index', [ "person_id" => $qs['person_id'], "agg" => 'd' ]));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(VitalStats $vitalStats)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, $id)
    {
        $vs = VitalStats::find($id);
        $qs = $request->all();
        $person_id = $vs->person_id ?? $qs['person_id'];
        if (empty($vs)) {
            $vs = new VitalStats;
        }

        $data = [
            'vs' => $vs,
            'people' => Person::where('active', 1)->get(),
            'person_id' => $person_id,
        ];

        return Inertia::render('VitalStats/Edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $qs = $request->all();
        OmniHelper::log($qs['systolic']);
        OmniHelper::log($qs['diastolic']);
        if (!$id) {
            $vs = new VitalStats;
            $vs->person_id = $qs['person_id'];
            $vs->date = $qs['date'];
            $vs->abdominals = $qs['abdominals'];
            $vs->comments = $qs['comments'];
            $vs->diastolic = $qs['diastolic'];
            $vs->distance_biked = $qs['distance_biked'];
            $vs->distance_run = $qs['distance_run'];
            $vs->distance = $qs['distance'];
            $vs->fairly_active_minutes = $qs['fairly_active_minutes'];
            $vs->floors_run = $qs['floors_run'];
            $vs->floors = $qs['floors'];
            $vs->height = $qs['height'];
            $vs->lightly_active_minutes = $qs['lightly_active_minutes'];
            $vs->sedentary_minutes = $qs['sedentary_minutes'];
            $vs->sleep = $qs['sleep'];
            $vs->steps = $qs['steps'];
            $vs->systolic = $qs['systolic'];
            $vs->swim = $qs['swim'];
            $vs->very_active_minutes = $qs['very_active_minutes'];
            $vs->weight = $qs['weight'];
            $vs->za = $qs['za'];
            $vs->save();
        } else {
            $vs = VitalStats::find($id);
            $validated = $request->validate([
                'person_id' => 'required|integer',
                'date' => 'required|date',
                'abdominals' => 'nullable|decimal:0,1',
                'comments' => 'nullable|string',
                'diastolic' => 'nullable|integer',
                'distance_biked' => 'nullable|decimal:0,0,1',
                'distance_run' => 'decimal:0,1',
                'distance' => 'decimal:0,2',
                'fairly_active_minutes' => 'integer',
                'floors_run' => 'integer',
                'floors' => 'integer',
                'height' => 'nullable|decimal:0,1',
                'lightly_active_minutes' => 'integer',
                'sedentary_minutes' => 'integer',
                'sleep' => 'nullable|decimal:0,1',
                'steps' => 'integer',
                'swim' => 'integer',
                'systolic' => 'nullable|integer',
                'very_active_minutes' => 'integer',
                'weight' => 'nullable|decimal:0,1',
                'za' => 'nullable|bool',
            ]);
            $vs->update($validated);
        }

        return redirect(route('vital-stats.index', [ "person_id" => $qs['person_id'], "agg" => 'd' ]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VitalStats $vitalStats)
    {
        //
    }
}

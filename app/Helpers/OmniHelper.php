<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class OmniHelper
{
    public static function getWeekStart($endDate, $numberOfWeeks)
    {
        $w = date('w', strtotime($endDate));
        $sow = strtotime("$endDate - $w days");
        $sd = date('Y-m-d', $sow);
        return date('Y-m-d', strtotime("$sd - ".($numberOfWeeks - 1)." weeks + 1 day"));
    }
    public static function getWeekEnd($startDate, $numberOfWeeks)
    {
        $sd = self::getWeekStart($startDate, $numberOfWeeks);
        return date('Y-m-d', strtotime("$sd + ".($numberOfWeeks - 1)." weeks + 6 day"));
    }

    public static function getStartOfDateRange($endDate, $agg, $numberOfUnits)
    {
        switch($agg) {
            case 'd':
                return date('Y-m-d', strtotime("$endDate - ".($numberOfUnits - 1) . " days"));
            case 'w':
                return self::getWeekStart($endDate, $numberOfUnits);
            case 'y':
                return date('Y-01-01', strtotime("$endDate - ".($numberOfUnits - 1) . " years"));
            default:
                return date('Y-m-01', strtotime("$endDate - ".($numberOfUnits - 1) . " months"));

        }
    }

    public static function getEndOfDateRange($startDate, $agg, $numberOfUnits)
    {
        switch($agg) {
            case 'd':
                return date('Y-m-d', strtotime("$startDate + ".($numberOfUnits - 1) . " days"));
            case 'w':
                return self::getWeekEnd($startDate, $numberOfUnits);
            case 'y':
                return date('Y-01-01', strtotime("$startDate + ".($numberOfUnits - 1) . " years"));
            default:
                return date('Y-m-t', strtotime("$startDate + ".($numberOfUnits - 1) . " months"));

        }
    }

    public static function getDateInfo($endDate, $agg, $numberOfUnits, $personId)
    {
        $startOfDateRange = self::getStartOfDateRange($endDate, $agg, $numberOfUnits);
        self::log($startOfDateRange);
        self::log($endDate);
        self::log($agg);
        $previousEndDate = date('Y-m-d', strtotime($startOfDateRange . ' - 1 day'));
        $nextStartDate = date('Y-m-d', strtotime($endDate . ' + 1 day'));
        $previousStartDate = self::getStartOfDateRange($previousEndDate, $agg, $numberOfUnits);
        $nextEndDate = self::getEndOfDateRange($nextStartDate, $agg, $numberOfUnits);
        self::log($nextEndDate);
        $previousNumberOfUnits = date_diff(date_create($previousEndDate), date_create($previousStartDate))->format('%a');

        return [
            'startOfDateRange' => $startOfDateRange,
            'endOfDateRange' => $endDate,
            'previousEndDate' => $previousEndDate,
            'previousStartDate' => $previousStartDate,
            'nextEndDate' => $nextEndDate,
            'nextStartDate' => $nextStartDate,
            'previousNumberOfUnits' => $previousNumberOfUnits,
            'previousView' => 'index',
            'previousViewData' =>  [
                'person_id' => $personId,
                'agg' => $agg, 
                'u' => $numberOfUnits, 
                'dt' => $previousEndDate
            ],
            'nextViewData' =>  [
                'person_id' => $personId,
                'agg' => $agg, 
                'u' => $numberOfUnits, 
                'dt' => $nextEndDate
            ],
        ];
    }

    public static function log($msg)
    {
        if (is_array($msg)) {
            $msg = json_encode($msg);
        }

        Log::debug($msg);
    }
}

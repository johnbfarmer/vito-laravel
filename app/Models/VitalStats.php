<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\OmniHelper;

class VitalStats extends Model
{
    use HasFactory;
    protected $fillable = [
        'abdominals',
        'comments',
        'date',
        'diastolic',
        'distance_biked',
        'distance_run',
        'distance',
        'fairly_active_minutes',
        'floors_run',
        'floors',
        'height',
        'lightly_active_minutes',
        'person_id',
        'score',
        'sedentary_minutes',
        'sleep',
        'steps',
        'swim',
        'systolic',
        'very_active_minutes',
        'weight',
        'za',
    ];

    public static function userData($id, $sd, $ed, $agg, $total = false, $returnSqlString = false)
    {
        list($dtPart, $idPart) = self::getSummaryQueryPartsByAgg($agg);
        $sql = '
            SELECT ROUND(SUM(`distance_run`), 1) AS distance_run,
            ROUND(SUM(`distance`), 1) AS distance,
            ROUND(AVG(`sleep`), 2) AS sleep,
            ROUND(SUM(`steps`)) AS steps,
            IFNULL(ROUND(AVG(`steps`)/AVG(`distance`), 1), 0) AS stepsPerKm,
            ROUND(AVG(`za`),3) AS za,
            ROUND(AVG(`weight`),1) AS weight,
            ROUND(SUM(`floors`)) AS floors,
            ROUND(SUM(`floors_run`)) AS floors_run,
            ROUND(SUM(`very_active_minutes`)) AS very_active_minutes,
            ROUND(SUM(`distance_biked`)) AS distance_biked,
            ROUND(SUM(`swim`)) AS swim,
            CONCAT(ROUND(AVG(`systolic`)),"/",ROUND(AVG(`diastolic`))) AS bp,
            ROUND(SUM(`abdominals`)) AS abdominals,
            ROUND(AVG(`score`)) AS `score`';
        if (!$total) {
            $sql .= ',
            ' . $dtPart . ' AS `date`,
            ' . $idPart . ' AS `id`,
            MIN(v.id) AS `record_id`';
        }
        $sql .= '
            FROM vital_stats v
            INNER JOIN people p ON v.person_id = p.id
            WHERE p.id = ?
            AND `date` BETWEEN ? and ?';
        if (!$total) {
            $sql .= '
            GROUP BY `id`
            ORDER BY `id` DESC';
        }
        OmniHelper::log($sql);
        if ($returnSqlString) {
            return $sql;
        }

        return $total ? DB::select($sql, [$id, $sd, $ed])[0] : DB::select($sql, [$id, $sd, $ed]);
    }

    public static function userDataAvgs($id, $sd, $ed, $agg)
    {
        $innerQuery = self::userData($id, $sd, $ed, $agg, false, true);
        $sql = '
            SELECT ROUND(AVG(`distance_run`), 1) AS distance_run,
            ROUND(AVG(`distance`), 1) AS distance,
            ROUND(AVG(`steps`)) AS steps,
            ROUND(AVG(`floors`)) AS floors,
            ROUND(AVG(`floors_run`)) AS floors_run,
            ROUND(AVG(`very_active_minutes`)) AS very_active_minutes,
            ROUND(AVG(`distance_biked`)) AS distance_biked,
            ROUND(AVG(`swim`)) AS swim,
            ROUND(AVG(`abdominals`)) AS abdominals
            FROM (
            ' . $innerQuery . '
            ) TMP';

            return  DB::select($sql, [$id, $sd, $ed])[0];
    }

    protected static function getSummaryQueryPartsByAgg($agg)
    {
        switch($agg) {
            case 'd':
                return ['DATE_FORMAT(MIN(v.date), "%a, %b %e")', 'v.date'];
            case 'w':
                // return ['YEARWEEK(MIN(v.date), 3)', 'CONCAT("yw_", YEARWEEK(v.date, 3))'];
                return ['CONCAT(DATE_FORMAT(MIN(v.date), "%b %e"), " - ", DATE_FORMAT(MAX(v.date), "%b %e, %Y"))', 'CONCAT("yw_", YEARWEEK(v.date, 3))'];
            case 'y':
                return ['YEAR(v.date)', 'YEAR(v.date)'];
            default:
                return ['DATE_FORMAT(MIN(v.date), "%b, %Y")', 'CONCAT("ym_", YEAR(v.date), LPAD(MONTH(v.date),2,0))'];
        }
    }
}

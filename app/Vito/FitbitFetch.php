<?php

namespace App\Vito;

use App\Models\Person;
use App\Models\VitalStats;
use App\Helpers\OmniHelper;
use Illuminate\Support\Facades\DB;

class FitbitFetch // extends BaseProcess
{
    protected
        $personId = 1, // tbi get from command params
        $date = '2023-05-21',
        $token,
        $parameters,
        $data;

    public function __construct($parameters)
    {
        $this->parameters = $parameters;
        // $this->config = $parameters['config'];
        // $this->api = $parameters['api'];
        // $this->connection = !empty($parameters['connection']) ? $parameters['connection'] : null;
        // $this->output = !empty($parameters['output']) ? $parameters['output'] : null;
        // $this->logger = $parameters['logger'];
        $this->baseDir = __DIR__ . '/../..';
        OmniHelper::log($this->parameters);
        $this->dataDir = $this->baseDir . '/data';
        // $this->dimension_table = $this->api === 'volumes' ? 'country_keyword' : 'country_topic';
    }


    public function execute()
    {
        // $date = $this->parameters['date'];
        $this->date = $this->parameters['date'];
        $personId = $this->parameters['userId'];
        $this->person = Person::find($personId);
        // $days = $this->parameters['days'];
        // $this->storeOnly = $this->parameters['update-db'] == 0;
        // $this->personId = $this->parameters['personId'];
        // while (--$days >= 0) {
            $this->token = $this->getToken();
            OmniHelper::log($this->token);
            try {
            //     $this->output->writeln('fetching data...');
                $this->data = $this->getData($this->date);
            } catch(\Exception $e) {
                $this->token = $this->getNewToken();
                if (empty($this->token)) {
                    throw new \Exception('refresh token failed. visit dev.fitbit.com');
                }
                $this->data = $this->getData($this->date);
            }

            // if (!$this->storeOnly) {
                $this->insertData($this->date);
            // }
            // $date = date('Y-m-d', strtotime($date . ' - 1 days'));
        // }
    }

    protected function saveData($data, $date)
    {
        $file = 'data' . DIRECTORY_SEPARATOR . str_replace('-', '', $date);
        try {
            file_put_contents($file, json_encode($data));
        } catch(\Exception $e) {
            throw new \Exception('failed to write to ' . $file);
        }
    }

    protected function insertData($date)
    {
        if (empty($this->data)) {
            return;
        }

        $this->performDataInsert($date);
    }

    protected function performDataInsert($date)
    {
        $vs = VitalStats::where([['person_id', '=', $this->person->id], ['date', '=', $this->date]])->first();
        if (!$vs) {
            $vs = new VitalStats;
            $vs->person_id = $this->person->id;
            $vs->date = $this->date;
            $vs->save();
        }
        $vs->steps = $this->data['steps'];
        $vs->distance = $this->data['distance'];
        $vs->floors = $this->data['floors'];
        $vs->very_active_minutes = $this->data['veryActiveMinutes'];
        $vs->fairly_active_minutes = $this->data['fairlyActiveMinutes'];
        $vs->lightly_active_minutes = $this->data['lightlyActiveMinutes'];
        $vs->sedentary_minutes = $this->data['sedentaryMinutes'];
        $vs->sleep = $this->data['sleep'];
        $vs->save();
        DB::update('UPDATE vital_stats SET score = 10 * distance_run + 5 * abdominals + 5 * swim + 8 * distance_biked + 1 * very_active_minutes + 0.4 * fairly_active_minutes + 0.2 * lightly_active_minutes + 1 * (floors + floors_run) + 5 * distance
            WHERE person_id = ? AND `date` = ?', [ $this->person->id, $this->date]);
    }

    protected function getData($date)
    {
        $data = $this->getActivitiesData($date);
        $data['sleep'] = $this->getSleepData($date);
        return $data;
    }

    protected function getActivitiesData($date)
    {
        $result = $this->curl('activities', $date);
        $activities = $result;
        OmniHelper::log($activities);
        if (empty($activities['summary'])) {
            throw new \Exception('Summary is empty.');
        }
        // $this->saveData($activities, $date);

        $distance = 0;
        foreach ($activities['summary']['distances'] as $d) {
            if ($d['activity'] === 'total') {
                $distance = $d['distance'];
            }
        }
        return [
            'steps' => $activities['summary']['steps'],
            'floors' => $activities['summary']['floors'],
            'veryActiveMinutes' => $activities['summary']['veryActiveMinutes'],
            'fairlyActiveMinutes' => $activities['summary']['fairlyActiveMinutes'],
            'lightlyActiveMinutes' => $activities['summary']['lightlyActiveMinutes'],
            'sedentaryMinutes' => $activities['summary']['sedentaryMinutes'],
            'distance' => $distance,
        ];
    }

    protected function getSleepData($date)
    {
        $result = $this->curl('sleep', $date);
        $sleep = $result;
        // $this->saveData($activities, $date); // tbi
        $totalMinutesAsleep = $sleep['summary']['totalMinutesAsleep'];
        return $totalMinutesAsleep > 90 ? $totalMinutesAsleep : null;
    }

    protected function curl($type, $date)
    {
        // type is activities or sleep
        $ch = curl_init();
        $headers = [
            'Authorization: Bearer ' . $this->token,
        ];
        $uri = 'https://api.fitbit.com/1/user/-/' . $type . '/date/' . $date . '.json';
        curl_setopt($ch, CURLOPT_URL, $uri);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $resultString = curl_exec($ch);
        $result = json_decode($resultString, true);
        $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close ($ch);
        if (isset($result['success']) && $result['success'] == false) {
            throw new \Exception('getting new token');
        }

        return $result;
    }

    protected function getToken()
    {
        // $sql = 'SELECT access_token from people where id = ' . $this->personId;
        // $person = Person::find(1);

        // $result = $this->fetch($sql);
        return $this->person->access_token;
    }

    protected function updateTokens($tokens)
    {
        // $sql = 'UPDATE people SET access_token = "' . $tokens['access_token'] . '", refresh_token = "' . $tokens['refresh_token'] . '" where id = ' . $this->personId;

        // $result = $this->exec($sql);
        // $this->output->writeln('tokens updated');
        // $person = Person::find(1);
        $this->person->access_token = $tokens['access_token'];
        $this->person->refresh_token = $tokens['refresh_token'];
        $this->person->save();
    }

    protected function getNewToken()
    {
        // $sql = 'SELECT refresh_token from people where id = ' . $this->personId;

        // $result = $this->fetch($sql);
        // $refreshToken = $result['refresh_token'];
        OmniHelper::log($this->person->refresh_token);
        $ch = curl_init();
        $query = http_build_query([
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->person->refresh_token,
        ]);
        $headers = [
            'Authorization: Basic MjJDVlMzOmU0NjNmYWM2ZTdhYTIxZjc1ZjdjM2M2NDkzZWZlMWRl',
            'Content-Type: application/x-www-form-urlencoded',
        ];
        $uri = 'https://api.fitbit.com/oauth2/token';
        curl_setopt($ch, CURLOPT_URL, $uri);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $resultString = curl_exec($ch);
        $result = json_decode($resultString, true);
        $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close ($ch);

        $accessToken = !empty($result['access_token']) ? $result['access_token'] : null;

        if (!empty($accessToken)) {
            $this->updateTokens($result);
        }

        return $accessToken;
    }

    public static function autoExecute($parameters)
    {
        $class = get_called_class();
        $me = new $class($parameters);
        $me->execute();
        return $me;
    }
}

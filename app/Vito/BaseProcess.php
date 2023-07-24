<?php

namespace AppBundle\Vito;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class BaseProcess
{
    protected
        $parameters,
        $config,
        $connection,
        $output,
        $api = '',
        $dimension_table = '',
        $errors = [],
        $logger,
        $base_dir = '',
        $data_dir = '';

    public function __construct($parameters)
    {
        $this->parameters = $parameters;
        // $this->config = $parameters['config'];
        // $this->api = $parameters['api'];
        $this->connection = !empty($parameters['connection']) ? $parameters['connection'] : null;
        $this->output = !empty($parameters['output']) ? $parameters['output'] : null;
        // $this->logger = $parameters['logger'];
        // $this->base_dir = __DIR__ . '/../..';
        // $this->data_dir = $this->base_dir . '/data';
        // $this->dimension_table = $this->api === 'volumes' ? 'country_keyword' : 'country_topic';
    }

    protected function execute()
    {

    }

    protected function exec($sql, $log = false)
    {
        if ($log) {
            $this->log($sql);
        }
        $connection = $this->connection;
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        return $stmt;
    }

    protected function fetch($sql, $log = false)
    {
        return $this->fetchAll($sql, false, $log);
    }

    protected function fetchAll($sql, $all = true, $log = false)
    {
        $stmt = $this->exec($sql, $log);
        $records = $all ? $stmt->fetchAll() : $stmt->fetch();

        return $records;
    }

    protected function quote($str)
    {
        return $this->connection->quote($str);
    }

    protected function log($msg, $std_out = false, $level = 'info')
    {
        if (empty($this->logger)) {
            return;
        }

        if (is_array($msg)) {
            $msg = json_encode($msg);
        }

        if ($level == 'info') {
            $this->logger->info($msg);
        } else {
            $this->logger->error($msg);
        }

        if ($std_out) {
            print $msg . "\n";
        }
    }

    protected function logError($msg)
    {
        $this->log($msg, true, 'error');
    }

    public function logErrors()
    {
        if (empty($this->errors)) {
            return;
        }
        foreach ($this->errors as $error) {
            $this->logError($error);
        }
    }

    public function hasErrors()
    {
        if (empty($this->errors)) {
            return false;
        }

        return true;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public static function autoExecute($parameters)
    {
        $class = get_called_class();
        $me = new $class($parameters);
        $me->execute();
        return $me;
    }
}

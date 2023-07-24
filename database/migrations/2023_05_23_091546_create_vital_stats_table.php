<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vital_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('person_id')->unsigned()->default(0);
            $table->float('distance', 5, 2)->unsigned()->default(0);
            $table->float('distance_run', 5, 1)->unsigned()->default(0);
            $table->float('distance_biked', 5, 2)->unsigned()->default(0);
            $table->integer('steps')->nullable()->unsigned()->default(0);
            $table->integer('sleep')->nullable()->unsigned()->default(0);
            $table->float('weight', 5, 1)->nullable()->unsigned()->default(0);
            $table->float('height', 5, 1)->unsigned()->default(0);
            $table->float('abdominals', 5, 1)->unsigned()->default(0);
            $table->integer('systolic')->unsigned()->default(0);
            $table->integer('diastolic')->unsigned()->default(0);
            $table->tinyInteger('za')->unsigned()->default(0);
            $table->mediumInteger('swim')->unsigned()->default(0);
            $table->mediumInteger('floors')->unsigned()->default(0);
            $table->mediumInteger('floors_run')->unsigned()->default(0);
            $table->mediumInteger('very_active_minutes')->unsigned()->default(0);
            $table->mediumInteger('fairly_active_minutes')->unsigned()->default(0);
            $table->mediumInteger('lightly_active_minutes')->unsigned()->default(0);
            $table->mediumInteger('sedentary_minutes')->unsigned()->default(0);
            $table->float('score', 6, 2)->unsigned()->default(0);
            $table->text('comments');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vital_stats');
    }
};

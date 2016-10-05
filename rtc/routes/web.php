<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

Route::get('/', 'AboutController@index');
Route::get('/about', 'AboutController@index');
Route::get('/keys', 'KeysController@index');
Route::get('/cast', 'CastController@index');
Route::get('/catch', 'CatchController@index');

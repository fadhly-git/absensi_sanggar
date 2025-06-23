@extends('errors::minimal')

@section('title', __('Forbidden'))
@section('text', 'Forbidden')
@section('code-one', '4')
@section('code-two', '0')
@section('code-three', '3')

@section('message', __($exception->getMessage() ?: 'we are sorry, but the page you requested is forbidden'))

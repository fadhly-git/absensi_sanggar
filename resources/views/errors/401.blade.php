@extends('errors::minimal')

@section('title', __('Unauthorized'))
@section('text', 'Unauthorized')
@section('code-one', '4')
@section('code-two', '0')
@section('code-three', '1')

@section('message', __('we are sorry, but the page you requested requires authentication'))

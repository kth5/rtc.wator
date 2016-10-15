@extends('app')
@section('content')
<div class="container bg-warning container-connection">
  <div class="row">
    <div id="device-camera" class="col-md-6"></div>
    <div id="device-audio" class="col-md-6"></div>
  </div>
  <div class="row">
    <button type="button" class="btn btn-success btn-lg btn-block" id="btn-standby">Standby for remote devices.</button>
  </div>
</div>
<div class="container bg-warning container-info">
  <div class="row">
  </div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  PeerRSA.gatherDevice(function(device){
    console.log(device);
    var inner = '<label class="radio-inline"><input type="radio" name="';
    inner += device.deviceId;
    inner += '">';
    inner += device.label;
    inner += '</label>';
    if(device.kind === 'videoinput') {
      $("#device-camera").append(inner);
    }
    if(device.kind === 'audioinput') {
      $("#device-audio").append(inner);
    }
  })
  var peer;
  $('#btn-standby').click(function() {
    peer = new PeerRSA.B();
    peer.standby({video:true,audio:true});
  });
});
</script>
@endsection

@extends('app')
@section('content')
<div class="container bg-warning container-connection">
  <div class="row">
    <div id="device-camera" class="col-md-6 bg-success"></div>
    <div id="device-mic" class="col-md-6 bg-info"></div>
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
  var firstCamera = true;
  var firstMic = true;
  PeerRSA.gatherDevice(function(device){
    console.log(device);
    var inner = '<label class="radio-inline"><input type="radio" '
    if(firstCamera) {
      inner += 'checked="true"';
    }
    if(firstMic) {
      inner += 'checked="true"';
    }
    if(device.kind === 'videoinput') {
      inner += 'name="device-camera"';
    }
    if(device.kind === 'audioinput') {
      inner += 'name="device-mic"';
    }
    inner += 'value="';
    inner += device.deviceId;
    inner += '">';
    inner += device.label;
    inner += '</label><br>';
    
    if(device.kind === 'videoinput') {
      $("#device-camera").append(inner);
      firstCamera = false;
    }
    if(device.kind === 'audioinput') {
      $("#device-mic").append(inner);
      firstMic = false;
    }
  })
  var peer;
  $('#btn-standby').click(function() {
    peer = new PeerRSA.B();
    var video = $('#device-camera').val();
    console.log(video);
    peer.standby({video:true,audio:true});
  });
});
</script>
@endsection

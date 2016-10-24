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
    <pre id="diagnis" class="bg-success"></pre>
  </div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  var firstCamera = true;
  var firstMic = true;
  PeerRSA.gatherDevice(function(device){
    //console.log(device);
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
    var media = {};
    var video = $('input[name=device-camera]:checked').val();
    //console.log(video);
    if(video) {
      media.video = {}
      media.video.deviceId = video;
    }
    var audio = $('input[name=device-mic]:checked').val();
    //console.log(audio);
    if(audio) {
      media.audio = {}
      media.audio.deviceId = audio;
    }
    peer.standby(media);
    peer.onNotice = function(msg) {
      var msg = JSON.stringify(msg);
      $('#diagnis').append(msg).show();
    }
  });
});
</script>
@endsection

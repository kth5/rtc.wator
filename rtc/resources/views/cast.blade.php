@extends('app')
@section('content')
<div class="container bg-warning container-connection">
  <div class="row">
    <div class="col-md-6"></div>
    <div class="col-md-6"></div>
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
  })
  var peer;
  $('#btn-standby').click(function() {
    peer = new PeerRSA.B();
    peer.standby({video:true,audio:true});
  });
});
</script>
@endsection

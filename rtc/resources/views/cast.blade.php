@extends('app')
@section('content')
<div class="container bg-warning container-connection">
<div class="row">
<button type="button" class="btn btn-info btn-lg btn-block" id="btn-standby">Standby for remote devices.</button>
</div>
</div>
<div class="container bg-warning container-info">
<div class="row">
</div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  var peer;
  $('#btn-standby').click(function() {
    peer = new PeerRSA.B();
    peer.standby({video:true,audio:true});
  });
});
</script>
@endsection

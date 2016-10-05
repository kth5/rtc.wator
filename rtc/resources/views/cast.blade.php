@extends('app')
@section('content')
<div class="container bg-warning container-connection">
<div class="row">
<button type="button" class="btn btn-info btn-lg btn-block" id="btn-standby">Standby for remote devices.</button>
</div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  var peer = new PeerRSA.B();
  $('#btn-standby').click(function(){
    peer.standby();
  });
});
</script>
@endsection

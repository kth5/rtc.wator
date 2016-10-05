@extends('app')
@section('content')
<div class="container bg-warning container-connection">
<div class="row">
<button type="button" class="btn btn-info btn-lg btn-block" id="btn-wait">Start standby for remote devices.</button>
</div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  var peerB = new PeerRSA.B();
  $('#btn-wait').click(function(){
    peerB.wait();
  });
});
</script>
@endsection

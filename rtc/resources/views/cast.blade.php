@extends('app')
@section('content')
<div class="container bg-warning container-mime-key">
<div class="row">
<button type="button" class="btn btn-info btn-xs btn-block" id="btn-wait">Wait</button>
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

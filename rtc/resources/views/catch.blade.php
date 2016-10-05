@extends('app')
@section('content')
<div class="container bg-warning container-connection">
<div class="row">
  <button type="button" class="btn btn-info btn-lg btn-block" id="btn-connect">Connect</button>
</div>
</div>
<script type="text/javascript">
$(document).ready(function() {
  var peerA = new PeerRSA.A();
    $('#btn-connect').click(function(){
      peerA.connect({B:{video:true,audio:true}});
    });
});
</script>
@endsection

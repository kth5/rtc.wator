@extends('app')
@section('content')
<div class="container bg-warning container-connection">
<div class="row">
  <button type="button" class="btn btn-info btn-lg btn-block" id="btn-connect">Connect</button>
</div>
</div>
<div class="container bg-info container-video">
<div class="row">
   <video id="remoteVideo" width="640" height="480" autoplay></video>
</div>
</div>

<script type="text/javascript">
$(document).ready(function() {
  var peerA = new PeerRSA.A();
    $('#btn-connect').click(function(){
      peerA.connect({B:{video:true,audio:true}});
    });
    peerA.onaddstream = function(src) {
      $('#remoteVideo').attr('src', src);
    };
});
</script>
@endsection

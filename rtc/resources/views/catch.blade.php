@extends('app')
@section('content')
<div class="container bg-warning container-connection">
  <div class="row">
    <button type="button" class="btn btn-success btn-lg btn-block" id="btn-connect">Connect</button>
  </div>
</div>
<div class="container bg-info container-video">
  <div class="ctext-center">
    <video id="remoteVideo" width="640" height="480" autoplay></video>
  </div>
</div>
<div class="container bg-warning container-info">
  <div class="row">
    <pre id="diagnis" class="bg-success"></pre>
  </div>
</div>

<script type="text/javascript">
$(document).ready(function() {
  var peer = new PeerRSA.A();
    $('#btn-connect').click(function(){
      peer.connect({B:{video:true,audio:true}});
    });
    peer.onaddstream = function(src) {
      console.log(src);
      $('#remoteVideo').attr('src', src);
    };
    peer.onNotice = function(msg) {
      var msg = JSON.stringify(msg) + '\r\n';
      $('#diagnis').append(msg).show();
    }
});
</script>
@endsection

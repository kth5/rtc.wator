@extends('app')
@section('content')
<div class="container">
<div class="row">
  <p>Key of my self</p>
  <div class="col-sm-9">
    <div class="row">
		<button type="button" class="btn btn-danger btn-xs pull-right'">recreate</button>
		<button type="button" class="btn btn-info btn-xs btn-clipboard" data-clipboard-target="#text-public-key">Copy</button>
        <pre id="text-public-key"></pre>
    </div>
  </div>
</div>
<div class="row">
<p>Key to connect to others</p>
</div>
</div>
<script type="text/javascript">
	new Clipboard('.btn-clipboard');
	var peerA = new PeerRSA.A();
	$(document).ready(function(){
		$('#btn-create-key').click(function(){
			PeerRSA.Key.A.createKey( function(msg) {
				console.log(msg);
				var pubKeyStr = PeerRSA.Key.A.readKeyStr();
				$('#text-public-key').text(pubKeyStr);
			});
		});
		var pubKeyStr = PeerRSA.Key.A.readKeyStr();
		$('#text-public-key').text(pubKeyStr);
	});
</script>
@endsection


@extends('app')
@section('content')
<div class="container-fluid">
<div class="row">
  <p>Key of my self</p>
  <div class="col-sm-9">
	<p>
		<button type="button" class="btn btn-danger btn-lg" id="btn-create-key">Create Key</button>
	</p>
    <div class="row">
		<button type="button" class="btn btn-info btn-xs">Copy</button>
        <pre id="text-public-key"></pre>
    </div>
  </div>
</div>
<div class="row">
<p>Key to connect to others</p>
</div>
</div>
<script type="text/javascript">
	var peerA = new PeerRSA.A();
	$(document).ready(function(){
		$('#btn-create-key').click(function(){
			peerA.createKey();
			var pubKeyStr = peerA.readKeyStr();
			$('#text-public-key').text(pubKeyStr);
		});
		var pubKeyStr = peerA.readKeyStr();
		$('#text-public-key').text(pubKeyStr);
	});
</script>
@endsection


@extends('app')
@section('content')

<div class="container bg-warning container-mime-key">
  <div class="row">
    <h1>Key of this device</h1>
    <div class="col-sm-9">
      <div class="row">
        <button type="button" class="btn btn-danger btn-sm" id="btn-create-key">recreate</button>
        <button type="button" class="btn btn-info btn-sm  pull-right btn-clipboard" data-clipboard-target="#text-this-device-key">Copy</button>
        <pre id="text-this-device-key" class="text-danger" rows="20"></pre>
        <h5 class="text-info">Please send this public key to your another device,by e-mail,sns or etc.</h5>
      </div>
    </div>
  </div>
</div>

<div class="container bg-info container-your-key">
  <div class="row">
    <h2>Add Key of remote device</h2>
    <div class="form-group">
      <button type="button" class="btn btn-success btn-sm" id="btn-add-key">+</button>
      <label for="inputlg">Paste public key of remote device.</label>
      <textarea class="form-control" id="text-remote-device-key" rows="6"></textarea>
    </div>
  </div>
</div>

<div class="container bg-succuss container-pair-keys">
  <div class="row">
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody id="key-table-body"></tbody>
    </table>
  </div>
</div>


<script type="text/javascript">
  new Clipboard('.btn-clipboard');
</script>
<script type="text/javascript">
  $(document).ready(function() {
    PeerRSA.debug = true;
    PeerRSA.Key.A.onLoadCheckSuccess = function() {
      updatePublicKey();
    }
    function updatePublicKey() {
      var pubKeyStr = PeerRSA.Key.A.readKeyStr();
      $('#text-this-device-key').text(pubKeyStr);
    }
    updatePublicKey();
    
    $('#btn-create-key').click(function(){
      $('#text-this-device-key').text('...');
      PeerRSA.Key.A.createKey( function(msg) {
        //console.log(msg);
        updatePublicKey();
      });
    });
  });
</script>
<script type="text/javascript">
  $(document).ready(function(){
  $('#btn-add-key').click(function(){
    var key = $('#text-remote-device-key').val();
    //console.log(key);
    PeerRSA.Key.B.addKey(key);
  });
});
</script>

<script type="text/javascript">
$(document).ready(function(){
  var pairs = PeerRSA.Key.B.getPairDevices();
  for(var i = 0 ;i < pairs.length;i++) {
    console.log(pairs[i]);
  }
});
</script>


@endsection


@extends('app')
@section('content')
<style type="text/css">
<!--
  .col-md-6 {
    padding-right: 15px !important;
    padding-left: 15px !important;
  }
-->
</style>
<div class="container bg-warning container-mime-key">
  <div class="row">
    <div class="col-md-6" style="padding-right:15px">
      <div class="row">
        <h4>Public RSA Key belong to this device</h4>
        <button type="button" class="btn btn-danger btn-sm" id="btn-create-key">recreate</button>
        <button type="button" class="btn btn-info btn-sm  pull-right btn-clipboard" data-clipboard-target="#text-this-device-key">Copy</button>
        <pre id="text-this-device-key" class="text-danger small" rows="20"></pre>
        <h5 class="text-info">Please send this public key to your another device,by e-mail,sns or etc.</h5>
      </div>
    </div>
    <div class="col-md-6" style="padding-left:15px">
      <div class="row">
        <h4>Add RSA Public Key from remote device</h4>
        <div class="form-group">
          <button type="button" class="btn btn-success btn-sm" id="btn-add-key">+</button>
          <label for="inputlg">Paste public key of remote device.</label>
          <textarea class="form-control input-sm" id="text-remote-device-key" rows="14"></textarea>
        </div>
      </div>
    </div>
  </div>
</div>


<div class="container bg-success container-pair-keys">
  <div class="row">
    <h4>Remote devices:</h4>
    <table class="table table-striped table-bordered">
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
    function updateKeysView() {
      var pairs = PeerRSA.Key.B.getPairDevices();
      $('#key-table-body').empty();
      for(var i = 0 ;i < pairs.length;i++) {
        console.log(pairs[i]);
        var row = '<tr>';
        row += '<td>';
        row += '<button type="button" class="btn btn-danger btn-sm remove-key-btn" ';
        row += 'value="';
        row += pairs[i];
        row += '" ';
        row += '>-</button>';
        row += '</td>';
        row += '<td>' + pairs[i] + '</td>';
        row += '</tr>';
        console.log(row);
        $('#key-table-body').append(row);
      }
    }
    $('#key-table-body').on('click','.remove-key-btn',function(){
      var token = $(this).val();
      console.log(token);
      PeerRSA.Key.B.removeDevice(token);
      updateKeysView();
    });
    $('#btn-add-key').click(function(){
      var key = $('#text-remote-device-key').val();
      //console.log(key);
      PeerRSA.Key.B.addKey(key);
      updateKeysView();
    });
    updateKeysView();
  });
</script>

@endsection


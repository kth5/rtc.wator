<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Wator Vapor</title>
    <meta name="viewport" content="width=device-width,initial-scale=0.4, maximum-scale=0.4,minimum-scale=0.4, user-scalable=no">
    <link href="//fonts.googleapis.com/css?family=Lato:100" rel="stylesheet" type="text/css">
    <link href="//www.watorvapor.com/rtc/css/app.css" rel="stylesheet" type="text/css">
    <link href="//www.watorvapor.com/rtc/css/navbar.css" rel="stylesheet" type="text/css">
    <link href="//www.watorvapor.com/rtc/css/content.css" rel="stylesheet" type="text/css">
    <!-- jquery -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <!-- Optional theme -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
    <!-- Latest compiled and minified JavaScript -->
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>


    <script src="/js/ga.js" type="text/javascript"></script>
    <script src="/js/clipboard.min.js" type="text/javascript"></script>
    <script src="/bower_components/promiz/promiz.js"></script>
    <script src="/bower_components/webcrypto-shim/webcrypto-shim.js"></script>
    <script src="/bower_components/webrtc-adapter/release/adapter.js"></script>
    <script src="/bower_components/kjur-jsrsasign/jsrsasign-latest-all-min.js"></script>
    <script src="/rtc/js/app.js" type="text/javascript"></script>
    <script src="/rtc/js/peer.rsa.stub.js" type="text/javascript"></script>
    <script src="/rtc/js/peer.rsa.js" type="text/javascript"></script>
  </head>
  <body>
    @include('navbar')
    @yield('content')
    <!--div class="container">
      <pre id="debug-out-area"></pre>
    </div-->
 </body>
</html>

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
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.js"></script>

    <!-- Bootstrap -->
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

    <!-- Optional theme -->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">

    <!-- Latest compiled and minified JavaScript -->
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>


    <script src="//www.watorvapor.com/js/clipboard.min.js" type="text/javascript"></script>
    <script src="//www.watorvapor.com/rtc/js/app.js" type="text/javascript"></script>
    <script src="//www.watorvapor.com/account/js/jsrsasign-all-min.js" type="text/javascript"></script>
    <script src="//www.watorvapor.com/rtc/js/peer.rsa.stub.js" type="text/javascript"></script>
    <script src="//www.watorvapor.com/rtc/js/peer.rsa.js" type="text/javascript"></script>
    
    <script type="text/javascript">
      /*
      google analytics
      */
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-47276237-1', 'watorvapor.com');
      ga('send', 'pageview');
    </script>
  </head>
  <body>
    @include('navbar')
    @yield('content')
  </body>
</html>

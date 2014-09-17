<!DOCTYPE html>
<html>
<head>
    <title>SmartClock</title>
    <link href="css/weather-icons.css" rel="stylesheet" type="text/css">
    <script type="text/javascript">
        var gitHash = '<?php echo trim(`git rev-parse HEAD`) ?>'
    </script>
    <meta name="google">
    <meta content="text/html; charset=utf-8" http-equiv="Content-type">
    <link rel="stylesheet" type="text/css" href="css/mobile.css">
    <link href="css/main.css" rel="stylesheet" type="text/css">
    <meta name="viewport" content="width=960">
</head>

<body>
    <div class="top left">
        <div class="date small dimmed">
        </div>


        <div class="time">
        </div>


        <div class="calendar xxsmall">
        </div>
    </div>


    <div class="top right">
        <div class="windsun small dimmed">
        </div>


        <div class="temp">
        </div>


        <div class="forecast small dimmed">
        </div>
    </div>


    <div class="center-ver center-hor">
        <div class="dishwasher light">
            Vaatwasser is klaar!
        </div>
    </div>

    <!-- this is shown only on mobile -->
    <div class="mobile-only center-ver center-hor">
    	<!-- toggle news -->
    	<button id="toggle-news"></button>
	    <p>City:</p>
	    <p><input type="text" name="city" id="input-city"> <button id="set-city">Change city</button></p>
    </div>

    <div class="bottom center-hor">
        <div id="news-box" class="news medium">
        </div>
    </div>

    <script src="js/jquery.js"></script>
    <script src="js/jquery.feedToJSON.js"></script>
    <script src="js/ical_parser.js"></script>
    <script src="js/moment-with-langs.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/main.js?nocache=%3C?php%20echo%20md5(microtime());%20?%3E"></script>
    <script src="js/socket.io-1.0.0.js"></script>
    <script type="text/javascript" src="js/mobile.js"></script>
</body>
</html>
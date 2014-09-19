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
    <link href="css/main.css" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="css/mobile.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

</head>

<body>
    <div id="datetime" class="top left">
        <div class="date small dimmed">
        </div>

        <div class="time">
        </div>

        <div class="calendar xxsmall">
        </div>
    </div>

    <div id="weather" class="top right">
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
    <div class="clear"></div>
    <div class="mobile-only">
        <div id="city-wrapper">
            <p><input type="text" name="city" id="input-city" disabled="disabled"><button id="set-city" disabled="disabled">Change</button></p>
        </div>
        <div class="clear"></div>
        <p id="newsOn-label">News Feed</p>
        <div id="switch-wrapper">
            <div class="switch">
                <input type="checkbox" name="switch" class="switch-checkbox" id="newsOn" checked disabled="disabled" />
                <label class="switch-label" for="newsOn">
                    <span class="switch-inner"></span>
                    <span class="switch-switch"></span>
                </label>
            </div>
        </div>
    </div>

    <div class="bottom center-hor">
        <div
        <div id="news-box" class="news medium">
        </div>
    </div>

    <script src="js/jquery.js"></script>
    <script src="js/jquery.feedToJSON.js"></script>
    <script src="js/ical_parser.js"></script>
    <script src="js/moment-with-langs.min.js"></script>
    <script src="js/main.js?nocache=%3C?php%20echo%20md5(microtime());%20?%3E"></script>
    <script src="js/socket.io-1.0.0.js"></script>
</body>
</html>
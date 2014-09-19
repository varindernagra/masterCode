jQuery.fn.updateWithText = function(text, speed) {
    var dummy = $('<div/>').html(text);
    if ($(this).html() != dummy.html()) {
        $(this).fadeOut(speed / 2, function() {
            $(this).html(text);
            $(this).fadeIn(speed / 2, function() {
                //done
            });
        });
    }
}
jQuery.fn.outerHTML = function(s) {
    return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
};

function roundVal(temp) {
    return Math.round(temp * 10) / 10;
}

function kmh2beaufort(kmh) {
    var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
    for (var beaufort in speeds) {
        var speed = speeds[beaufort];
        if (speed > kmh) {
            return beaufort;
        }
    }
    return 12;
}
jQuery(document).ready(function($) {
    var isMobile = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints >
        0));
    // reading configuration
    var feed, weatherParams, lang, newsOn;
    $.ajax({
        dataType: "json",
        url: "/config.json",
        async: false
    }).done(function(data) {
        feed = data["feed"];
        weatherParams = data["weatherParams"];
        lang = data["lang"];
        newsOn = data["newsOn"];
    });
    var news = [];
    var newsIndex = 0;
    var eventList = [];
    //var lastCompliment;
    //var compliment;
    moment.lang(lang);
    (function checkVersion() {
        $.getJSON('githash.php', {}, function(json, textStatus) {
            if (json) {
                if (json.gitHash != gitHash) {
                    window.location.reload();
                    window.location.href = window.location.href;
                }
            }
        });
        setTimeout(function() {
            checkVersion();
        }, 30000);
    })();
    if (!isMobile) {
        (function updateTime() {
            var now = moment();
            var date = now.format('LLLL').split(' ', 4);
            date = date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3];
            $('.date').html(date);
            $('.time').html(now.format('HH') + ':' + now.format('mm') + '<span class="sec">' + now.format(
                'ss') + '</span>');
            setTimeout(function() {
                updateTime();
            }, 1000);
        })();
    }
    (function updateCalendarData() {
        new ical_parser("calendar.php", function(cal) {
            events = cal.getEvents();
            eventList = [];
            for (var i in events) {
                var e = events[i];
                for (var key in e) {
                    var value = e[key];
                    var seperator = key.search(';');
                    if (seperator >= 0) {
                        var mainKey = key.substring(0, seperator);
                        var subKey = key.substring(seperator + 1);
                        var dt;
                        if (subKey == 'VALUE=DATE') {
                            //date
                            dt = new Date(value.substring(0, 4), value.substring(4, 6) - 1, value.substring(
                                6, 8));
                        } else {
                            //time
                            dt = new Date(value.substring(0, 4), value.substring(4, 6) - 1, value.substring(
                                    6, 8), value.substring(9, 11), value.substring(11, 13),
                                value.substring(13, 15));
                        }
                        if (mainKey == 'DTSTART') e.startDate = dt;
                        if (mainKey == 'DTEND') e.endDate = dt;
                    }
                }
                if (e.startDate === undefined) {
                    //some old events in Gmail Calendar is "start_date"
                    //FIXME: problems with Gmail's TimeZone
                    var days = moment(e.DTSTART).diff(moment(), 'days');
                    var seconds = moment(e.DTSTART).diff(moment(), 'seconds');
                    var startDate = moment(e.DTSTART);
                } else {
                    var days = moment(e.startDate).diff(moment(), 'days');
                    var seconds = moment(e.startDate).diff(moment(), 'seconds');
                    var startDate = moment(e.startDate);
                }
                //only add fututre events, days doesn't work, we need to check seconds
                if (seconds >= 0) {
                    if (seconds <= 60 * 60 * 5 || seconds >= 60 * 60 * 24 * 2) {
                        var time_string = moment(startDate).fromNow();
                    } else {
                        var time_string = moment(startDate).calendar()
                    }
                    eventList.push({
                        'description': e.SUMMARY,
                        'seconds': seconds,
                        'days': time_string
                    });
                }
            }
            eventList.sort(function(a, b) {
                return a.seconds - b.seconds
            });
            setTimeout(function() {
                updateCalendarData();
            }, 60000);
        });
    })();
    (function updateCalendar() {
        table = $('<table/>').addClass('xsmall').addClass('calendar-table');
        opacity = 1;
        for (var i in eventList) {
            var e = eventList[i];
            var row = $('<tr/>').css('opacity', opacity);
            row.append($('<td/>').html(e.description).addClass('description'));
            row.append($('<td/>').html(e.days).addClass('days dimmed'));
            table.append(row);
            opacity -= 1 / eventList.length;
        }
        $('.calendar').updateWithText(table, 1000);
        setTimeout(function() {
            updateCalendar();
        }, 1000);
    })();
    /*
    (function updateCompliment()
    {
        //see compliments.js
        while (compliment == lastCompliment) {
            compliment = Math.floor(Math.random()*compliments.length);
        }

        $('.compliment').updateWithText(compliments[compliment], 4000);

        lastCompliment = compliment;

        setTimeout(function() {
            updateCompliment(true);
        }, 30000);

    })();
    */
    /*
    // TODO: comment out this block on your machine, I can test it as I don't have
    // the script you're running on your rpi and it throws 404s

    //connect do Xbee monitor
    var socket = io.connect('http://rpi-alarm.local:8082');
    socket.on('dishwasher', function (dishwasherReady) {
        if (dishwasherReady) {
            $('.dishwasher').fadeIn(2000);
            $('.lower-third').fadeOut(2000);
        } else {
            $('.dishwasher').fadeOut(2000);
            $('.lower-third').fadeIn(2000);
        }
    });
    */

    function updateCurrentWeather() {
        var iconTable = {
            '01d': 'wi-day-sunny',
            '02d': 'wi-day-cloudy',
            '03d': 'wi-cloudy',
            '04d': 'wi-cloudy-windy',
            '09d': 'wi-showers',
            '10d': 'wi-rain',
            '11d': 'wi-thunderstorm',
            '13d': 'wi-snow',
            '50d': 'wi-fog',
            '01n': 'wi-night-clear',
            '02n': 'wi-night-cloudy',
            '03n': 'wi-night-cloudy',
            '04n': 'wi-night-cloudy',
            '09n': 'wi-night-showers',
            '10n': 'wi-night-rain',
            '11n': 'wi-night-thunderstorm',
            '13n': 'wi-night-snow',
            '50n': 'wi-night-alt-cloudy-windy'
        }

        $.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(json,
            textStatus) {

            var temp = roundVal(json.main.temp);
            var temp_min = roundVal(json.main.temp_min);
            var temp_max = roundVal(json.main.temp_max);
            var wind = roundVal(json.wind.speed);
            var iconClass = iconTable[json.weather[0].icon];
            var icon = $('<span/>').addClass('icon').addClass('dimmed').addClass('wi').addClass(
                iconClass);
            $('.temp').updateWithText(icon.outerHTML() + temp + '&deg;', 1000);
            // var forecast = 'Min: '+temp_min+'&deg;, Max: '+temp_max+'&deg;';
            // $('.forecast').updateWithText(forecast, 1000);
            var now = new Date();
            var sunrise = new Date(json.sys.sunrise * 1000).toTimeString().substring(0, 5);
            var sunset = new Date(json.sys.sunset * 1000).toTimeString().substring(0, 5);
            var windString = '<span class="wi wi-strong-wind xdimmed"></span> ' + kmh2beaufort(wind);
            var sunString = '<span class="wi wi-sunrise xdimmed"></span> ' + sunrise;
            if (json.sys.sunrise * 1000 < now && json.sys.sunset * 1000 > now) {
                sunString = '<span class="wi wi-sunset xdimmed"></span> ' + sunset;
            }

            $('.windsun').updateWithText(windString + ' ' + sunString, 1000);
        });
    }

    function updateWeatherForecast() {
            var iconTable = {
                '01d': 'wi-day-sunny',
                '02d': 'wi-day-cloudy',
                '03d': 'wi-cloudy',
                '04d': 'wi-cloudy-windy',
                '09d': 'wi-showers',
                '10d': 'wi-rain',
                '11d': 'wi-thunderstorm',
                '13d': 'wi-snow',
                '50d': 'wi-fog',
                '01n': 'wi-night-clear',
                '02n': 'wi-night-cloudy',
                '03n': 'wi-night-cloudy',
                '04n': 'wi-night-cloudy',
                '09n': 'wi-night-showers',
                '10n': 'wi-night-rain',
                '11n': 'wi-night-thunderstorm',
                '13n': 'wi-night-snow',
                '50n': 'wi-night-alt-cloudy-windy'
            }

            $.getJSON('http://api.openweathermap.org/data/2.5/forecast', weatherParams, function(json,
                textStatus) {
                var forecastData = {};
                for (var i in json.list) {
                    var forecast = json.list[i];
                    var dateKey = forecast.dt_txt.substring(0, 10);
                    if (forecastData[dateKey] === undefined) {
                        forecastData[dateKey] = {
                            'timestamp': forecast.dt * 1000,
                            'icon': forecast.weather[0].icon,
                            'temp_min': forecast.main.temp,
                            'temp_max': forecast.main.temp
                        };
                    } else {
                        forecastData[dateKey]['icon'] = forecast.weather[0].icon;
                        forecastData[dateKey]['temp_min'] = (forecast.main.temp < forecastData[dateKey]
                            ['temp_min']) ? forecast.main.temp : forecastData[dateKey]['temp_min'];
                        forecastData[dateKey]['temp_max'] = (forecast.main.temp > forecastData[dateKey]
                            ['temp_max']) ? forecast.main.temp : forecastData[dateKey]['temp_max'];
                    }
                }

                var forecastTable = $('<table />').addClass('forecast-table');
                var opacity = 1;
                for (var i in forecastData) {
                    var forecast = forecastData[i];
                    var iconClass = iconTable[forecast.icon];
                    var dt = new Date(forecast.timestamp);
                    var row = $('<tr />').css('opacity', opacity);
                    row.append($('<td/>').addClass('day').html(moment.weekdaysShort(dt.getDay())));
                    row.append($('<td/>').addClass('icon-small').addClass(iconClass));
                    row.append($('<td/>').addClass('temp-max').html(roundVal(forecast.temp_max)));
                    row.append($('<td/>').addClass('temp-min').html(roundVal(forecast.temp_min)));
                    forecastTable.append(row);
                    opacity -= 0.155;
                }
                $('.forecast').updateWithText(forecastTable, 1000);
            });
        }
        // News fetching functions

    function fetchNews() {
        $.feedToJson({
            feed: feed,
            success: function(data) {
                news = [];
                for (var i in data.item) {
                    var item = data.item[i];
                    news.push(item.title);
                }
            }
        });
    }

    function showNews() {
            var newsItem = news[newsIndex];
            $('.news').updateWithText(newsItem, 2000);
            newsIndex--;
            if (newsIndex < 0) {
                newsIndex = news.length - 1;
            }
        }
    // constants
    const UPDATE_WEATHER_TIMEOUT = 60000;
    const UPDATE_WEATHER_FORECAST_TIMEOUT = 60000;
    const UPDATE_FETCH_NEWS_TIMEOUT = 60000;
    const UPDATE_SHOW_NEWS_TIMEOUT = 5000;

    // Update current weather and forecast start immediately
    updateCurrentWeather();
    updateWeatherForecast();
    var loopWeather = setInterval(updateCurrentWeather, UPDATE_WEATHER_TIMEOUT);
    var loopForecast = setInterval(updateWeatherForecast, UPDATE_WEATHER_FORECAST_TIMEOUT);
    var loopFetchNews;
    var loopShowNews;

    // News show according configuration
    if (newsOn) {
        fetchNews();
        showNews();
        loopFetchNews = setInterval(fetchNews, UPDATE_FETCH_NEWS_TIMEOUT);
        loopShowNews = setInterval(showNews, UPDATE_SHOW_NEWS_TIMEOUT);
    }

    if (isMobile) {
        $(".mobile-only").css("visibility", "visible");
        $(".mobile-only").css("display", "block");
        // Setting input values from config
        // News
        $('#newsOn').prop("checked", newsOn);
        // City
        $('#input-city').val(weatherParams["q"]);
    }

    setTimeout(function() {
        var socket = io("ws://" + location.host + ":8321");
        socket.on('connect', function() {
            // Websocket server connected
            if (isMobile) {
                // Enabling input fields
                $('#input-city').prop('disabled', false);
                $('#set-city').prop('disabled', false);
                $('#newsOn').prop('disabled', false);
                // Binding buttons
                $('#newsOn').click(function(data) {
                    socket.emit('set-news', !newsOn);
                });
                $('#set-city').click(function(data) {
                    if ($('#input-city').val() !== "" && $('#input-city').val() !=
                        weatherParams["q"]) {
                        socket.emit('set-city', $('#input-city').val());
                    }
                });
                // Special binding to return an alert if requested city doesnt exist
                socket.on('city-error', function(data) {
                    alert(data);
                });
            }
        });

        socket.on('set-news', function(data) {
            newsOn = data;
            if (isMobile) {
                $('#newsOn').prop('checked', newsOn);
            }

            // We recieved the value from the server.
            // By the time we recieve this information, the config file has already
            // changed
            // We have to run the loop, but first make sure it get canceled
            if (loopShowNews !== null) {
                clearInterval(loopShowNews);
            }

            if (loopFetchNews !== null) {
                clearInterval(loopFetchNews);
            }

            // Force currently displayed news -- if any -- to disappear
            $('.news').updateWithText('', 0);
            if (data === true) {
                // Running the actual loops
                fetchNews();
                showNews();
                loopFetchNews = setInterval(fetchNews, UPDATE_FETCH_NEWS_TIMEOUT);
                loopShowNews = setInterval(showNews, UPDATE_SHOW_NEWS_TIMEOUT);
            }
        });

        // New city
        socket.on('set-city', function(data) {
            weatherParams["q"] = data;

            // Stopping loops
            if (loopWeather !== null) {
                clearInterval(loopWeather);
            }

            if (loopForecast !== null) {
                clearInterval(loopForecast);
            }

            updateCurrentWeather();
            updateWeatherForecast();
            loopWeather = setInterval(updateCurrentWeather, UPDATE_WEATHER_TIMEOUT);
            loopForecast = setInterval(updateWeatherForecast,
                UPDATE_WEATHER_FORECAST_TIMEOUT);

            // update mobile
            if (isMobile) {
                $('#input-city').val(weatherParams["q"]);
            }
        });

        socket.on('disconnect', function() {
            // Connection lost, disabling input on mobile
            if (isMobile) {
                // Enabling input fields
                $('#input-city').prop('disabled', true);
                $('#set-city').prop('disabled', true);
                $('#newsOn').prop('disabled', true);
            }
        });
    }, 3000);
});
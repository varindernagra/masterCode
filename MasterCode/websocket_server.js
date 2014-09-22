var io = require('socket.io')();

var request = require('request');

function getDefaultConfig() {
    var weatherParams = {
        "q": "Fremont, US",
        "units": "imperial",
        "lang": "en"
    };

    var config = {
        "weatherParams": weatherParams,
        "feed": "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "newsOn": true
    };
    return config;
}

var fs = require('fs');
var file = __dirname + '/config.json';

var connections = [];
var config;

try {
    // Reading configuration
    config = JSON.parse(fs.readFileSync(file));
} catch (e) {
    // Something went wrong (config missing or corrupted), writing a default config
    config = getDefaultConfig();
    fs.writeFileSync(file, JSON.stringify(config, null, 4));
}

io.listen(8321);

io.on('connection', function (socket){
    connections.push(socket);

    // Set news
    socket.on('set-news', function (data) {
        config["newsOn"] = data;
        fs.writeFileSync(file, JSON.stringify(config, null, 4));
        // Sending back the information to everyone
        for (var i = 0; i < connections.length; i++) {
            connections[i].emit('set-news', data);
        }
    });

    socket.on('set-city', function (data) {
        // We talk to the openweather api to check if the city exists
        // if the city exists, then send the information to desktop and mobiel
        // if the city DO NOT exist, send the information to mobile
        // and the mobile will show an alert

        // Checking if city exists
        request("http://api.openweathermap.org/data/2.5/weather?q=" + data, function(error, resp, body) {
            var jsonBody = JSON.parse(body);
            if (jsonBody["cod"] == "404") {
                // Whoops, city not found, informing the mobile...
                socket.emit('city-error', jsonBody["message"]);
            } else {
                // City found, sending back information to clients
                for (var i = 0; i < connections.length; i++) {
                    connections[i].emit('set-city', data);
                }

                // Updating configuration
                config["weatherParams"]["q"] = data;
                fs.writeFileSync(file, JSON.stringify(config, null, 4));
            }
        });

    });

    socket.on('disconnect', function() {
        connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('error', function(data) {
        connections.splice(connections.indexOf(socket), 1);
    });

});


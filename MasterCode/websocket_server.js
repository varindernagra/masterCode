var fs = require('fs');
var file = __dirname + '/current.config.json';

var connections = [];
config = JSON.parse(fs.readFileSync(file));

var io = require('socket.io')();
io.on('connection', function (socket){
    connections.push(socket);
    socket.on('get', function (data) {
        config = JSON.parse(fs.readFileSync(file));
        socket.emit(data, config[data]);
    });

    // Handling set actions
    socket.on('set', function (data) {
        var args = JSON.parse(data);
        var k = Object.keys(args)[0];
        var v = args[k];

        // Sending back the information to everyone
        for (var i = 0; i < connections.length; i++) {
            connections[i].emit(k, v);
        }

        // Check integrity of config file
        config = JSON.parse(fs.readFileSync(file));

        if (config["city"] == null && config["news"] == null) {
            // COnfig is broken or missing, create a default one
            config = null;
            config["city"] = "Fremont, US";
            config["news"] = true;
            // Writing the default config
            fs.writeFileSync(file, JSON.stringify(config));
        }

        // Save the updated config
        config[k] = v;
        fs.writeFileSync(file, JSON.stringify(config));

        });
});

io.listen(3000);

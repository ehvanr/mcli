var fs = require('fs');
var appRoot = require('app-root-path');

var configFile = appRoot + "/config.json";
function load(){
    var data = fs.readFileSync(configFile);

    try{
        settings = JSON.parse(data);
        return settings;
    }catch(err){
        console.log('There has been an error parsing your JSON.')
        console.log(err);
    }
}

function save(settings){
    var data = JSON.stringify(settings, null, 4);

    fs.writeFile(configFile, data, function(err){
        if(err){
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        return 1;
    });
}

module.exports.settings = load();
module.exports.save = save;

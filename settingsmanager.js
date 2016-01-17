var fs = require('fs');
var appRoot = require('app-root-path');

var configFile = appRoot + "/config.json";

var defaultConfiguration = {
    "supported_applications": [
        "couchpotato",
        "sabnzbd",
        "nzbget",
        "plexpy",
        "plexrequests",
        "plex",
        "sonarr"
    ],
    "installed_applications": [],
    "app_settings": {
        "global": {
            "all_downloads": "",
            "incomplete_downloads": "",
            "movie_downloads": "",
            "tv_downloads": "",
            "movie_library": "",
            "tv_library": ""
        },
        "couchpotato": {
            "app_data": "/opt/mcli/app-data/couchpotato",
            "uid": "",
            "gid": "",
            "http_port": "5050"
        },
        "sabnzbd": {
            "app_data": "/opt/mcli/app-data/sabnzbd",
            "uid": "",
            "gid": "",
            "http_port": "8080",
            "https_port": "9090"
        },
        "nzbget": {
            "app_data": "/opt/mcli/app-data/nzbget",
            "uid": "",
            "gid": "",
            "http_port": "6789"
        },
        "plexpy": {
            "app_data": "/opt/mcli/app-data/plexpy",
            "uid": "",
            "gid": "",
            "http_port": "8181",
            "logs": "/opt/mcli/app-data/plexpy/logs"
        },
        "plexrequests": {
            "app_data": "/opt/mcli/app-data/plexrequests",
            "http_port": "3000"
        },
        "sonarr": {
            "app_data": "/opt/mcli/app-data/sonarr",
            "uid": "",
            "gid": "",
            "http_port": "8989"
        },
        "plex": {
            "transcode_folder": "/opt/mcli/app-data/plex/transcode",
            "app_data": "/opt/mcli/app-data/plex",
            "uid": "",
            "gid": "",
            "channel": "latest"
        }
    }
};

function load(){
    var data = fs.readFileSync(configFile);

    try{
        settings = JSON.parse(data);
        return settings;
    }catch(err){
        console.log('There has been an error parsing the configuration file.')
        process.exit(1);
    }
}

function save(settings){
    var data = JSON.stringify(settings, null, 4);

    try{
        fs.writeFileSync(configFile, data);
    }catch(e){
        console.log('There has been an error saving your configuration data.');
        return;
    }

    return 1;
}

function restoreConfiguration(){
    save(defaultConfiguration);
}

function getDefaultAppConfiguration(application){
    return defaultConfiguration.app_settings[application];
}

module.exports.settings = load();
module.exports.save = save;
module.exports.restoreConfiguration = restoreConfiguration;
module.exports.getDefaultAppConfiguration = getDefaultAppConfiguration;

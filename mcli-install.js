#!/usr/bin/env node

var program = require("commander");
var async = require("async");
var exec = require("child_process").exec;
var SettingsManager = require("./settingsmanager.js");
var settings = SettingsManager.settings;

program
    .option("<application>", "The application you wish to install")
    .action(function(application){

        // Verify that we're root.  Quit if we're not. Technically user only has to be a part of the docker group. 
        if(process.getuid() != 0){
            console.log("You need to be root to perform this command.");
            process.exit(1);
        }

        application = application.toLowerCase();

        // Checks whether the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            if(settings.installed_applications.indexOf(application) === -1){
                // Do a switch on the application for the appropriate install sequence
                switch(application){
                    case "plexrequests": installPlexRequests(); break;
                    case "couchpotato": installCouchPotato(); break;
                    case "sabnzbd": installSABnzbd(); break;
                    case "nzbget": installNZBGet(); break;
                    case "plexpy": installPlexPy(); break;
                    case "sonarr": installSonarr(); break;
                    case "plex": installPlex(); break;
                }
            }else{
                console.log("Application already installed");
            }
        }else{
            console.log("No such application");
        }
    })
    .parse(process.argv);

function setSELinuxContext(app_data){
    // SELinux changes
    //  ON SELINUX SYSTEMS, YOU HAVE TO APPLY THIS CONTEXT TO APP FOLDERS:
    // chcon -Rt svirt_sandbox_file_t /opt/mcli/app-data/couchpotato/

    var chCon = 'chcon -Rt svirt_sandbox_file_t "' + app_data + '"';

    async.series([
        async.apply(exec, chCon),
    ], 
    function(err, results){
        if(err){
            // Honestly dont care what happens here - will fail on non SELinux machines, weve already verified we're root.
            // I suppose log to log file?
        }
    });
}

function installCouchPotato(){
    var app_data = settings.app_settings.couchpotato.app_data;
    var movie_downloads = settings.app_settings.global.movie_downloads;
    var movie_library = settings.app_settings.global.movie_library;
    var http_port = settings.app_settings.couchpotato.http_port;

    async.series([
        function(callback){console.log("Installing couchpotato...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group couchpotato || groupadd couchpotato'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd couchpotato || useradd -g couchpotato couchpotato'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R couchpotato:couchpotato "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/couchpotato'),
        async.apply(exec, 'getent passwd couchpotato')
    ], 
    function(err, results){
        if(err){
            console.log(err);
        }else{
            setSELinuxContext(app_data);

            // Remove function results
            results = results.filter(function(i){ return i != undefined }); 

            var uid = results[5][0].split(":")[2];
            var gid = results[5][0].split(":")[3];

            var docker_create_cmd = 'docker create' +
                ' -v /etc/localtime:/etc/localtime:ro' +
                ' -v "' + app_data + '":/config' +
                ' -v "' + movie_downloads + '":/downloads' +
                ' -v "' + movie_library + '":/movies' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -p ' + http_port + ':' + http_port +
                ' --name "mcli_couchpotato"' +
                ' linuxserver/couchpotato';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.couchpotato.uid = uid;
                    settings.app_settings.couchpotato.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("couchpotato");
                }
            });
        }
    });
}

function installSABnzbd(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create sabnzbd user -> Store UID in config
    //  - create sabnzbd group -> Store GID in config
    //  - create /opt/mcli/app-data/sabnzbd/
    //  - docker pull linuxserver/sabnzbd -> Store container id
    //
    // VARS:
    //  ALL_DOWNLOADS
    //  INCOMPLETE_DOWNLOADS = ALL_DOWNLOADS/incomplete
    //  SABNZBD_APP_DATA
    //  SABNZBD_UID
    //  SABNZBD_GID
    //  SABNZBD_HTTP_PORT
    //  SABNZBD_HTTPS_PORT
    //
    // docker create \
    //      --name=sabnzbd \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -v <path to downloads>:/downloads \
    //      -v <path to incomplete downloads>:/incomplete-downloads \
    //      -e PGID=<gid> -e PUID=<uid> \
    //      -p 8080:8080 \
    //      -p 9090:9090 \
    //      linuxserver/sabnzbd
    //
    addInstalledApplication("sabnzbd");
}

function installNZBGet(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create nzbget user -> Store UID in config
    //  - create nzbget group -> Store GID in config
    //  - create /opt/mcli/app-data/nzbget/
    //  - docker pull linuxserver/nzbget -> Store container id
    //
    // VARS:
    //  ALL_DOWNLOADS
    //  NZBGET_APP_DATA
    //  NZBGET_UID
    //  NZBGET_GID
    //  NZBGET_HTTP_PORT
    //
    // docker create \
    //      --name nzbget \
    //      -p 6789:6789 \
    //      -e PUID=<UID> -e PGID=<GID> \
    //      -v </path/to/appdata>:/config \
    //      -v <path/to/downloads>:/downloads \
    //      linuxserver/nzbget

    addInstalledApplication("nzbget");
}

function installPlexPy(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plexpy user -> Store UID in config
    //  - create plexpy  group -> Store GID in config
    //  - create /opt/mcli/app-data/plexpy/
    //  - docker pull linuxserver/plexpy -> Store container id
    //
    // VARS:
    //  PLEXPY_LOGS
    //  PLEXPY_APP_DATA
    //  PLEXPY_UID
    //  PLEXPY_GID
    //  PLEXPY_HTTP_PORT
    //
    // docker create \ 
    //      --name=plexpy \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -v <path to plexlogs>:/logs:ro \
    //      -e PGID=<gid> -e PUID=<uid>  \
    //      -p 8181:8181 \
    //      linuxserver/plexpy

    addInstalledApplication("plexpy");
}

function installPlexRequests(){
    //
    // NOTE: THIS DOES NOT HAVE GID / UID
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plexrequests user -> Store UID in config
    //  - create plexrequests  group -> Store GID in config
    //  - create /opt/mcli/app-data/plexrequests/
    //  - docker pull linuxserver/plexpy -> Store container id
    //
    // VARS:
    //  PLEXREQUESTS_APP_DATA
    //  PLEXREQUESTS_HTTP_PORT
    //
    // docker create \
    //      --name=plexrequests \
    //      -v /etc/localtime:/etc/localtime:ro \
    //      -v <path to data>:/config \
    //      -e BRANCH="master" \
    //      -p 3000:3000 \
    //      aptalca/docker-plexrequests
    //

    addInstalledApplication("plexrequests");
}

function installSonarr(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create sonarr user -> Store UID in config
    //  - create sonarr group -> Store GID in config
    //  - create /opt/mcli/app-data/sonarr/
    //  - docker pull linuxserver/sonarr -> Store container id
    //
    // VARS:
    //  TV_LIBRARY
    //  TV_DOWNLOADS
    //  SONARR_APP_DATA
    //  SONARR_UID
    //  SONARR_GID
    //  SONARR_HTTP_PORT
    //
    // docker create \
    //     --name sonarr \
    //     -p 8989:8989 \
    //     -e PUID=<UID> -e PGID=<GID> \
    //     -v /dev/rtc:/dev/rtc:ro \
    //     -v </path/to/appdata>:/config \
    //     -v <path/to/tvseries>:/tv \
    //     -v <path/to/downloadclient-downloads>:/downloads \
    //     linuxserver/sonarr

    addInstalledApplication("sonarr");
}

function installPlex(){
    //
    // COMMANDS (VERIFY ALL BEFORE ATTEMPTING):
    //  - create plex user -> Store UID in config
    //  - create plex  group -> Store GID in config
    //  - create /opt/mcli/app-data/plex/
    //  - docker pull linuxserver/plex -> Store container id
    //
    // VARS:
    //  TV_LIBRARY
    //  MOVIE_LIBRARY
    //  TRANSCODE_FOLDER
    //  PLEX_APP_DATA
    //  PLEX_UID
    //  PLEX_GID
    //  PLEX_CHANNEL (plexpass or latest)
    //
    // docker create \
    //      --name=plex \ 
    //      --net=host \
    //      -e VERSION="plexpass" \
    //      -e PUID=<UID> -e PGID=<GID> \
    //      -v </path/to/transcode>:/transcode \
    //      -v </path/to/library>:/config \
    //      -v <path/to/tvseries>:/data/tvshows \
    //      -v </path/to/movies>:/data/movies \
    //      linuxserver/plex
    //

    addInstalledApplication("plex");
}

function installGlances(){
    // BACK BURNER
    addInstalledApplication("glances");
}

function addInstalledApplication(application){
    settings.installed_applications.push(application);
    SettingsManager.save(settings);
}

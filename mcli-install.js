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

        // Verifies that the application we're referencing is supported
        if(settings.supported_applications.indexOf(application) > -1){
            // Verifies that the application we're referencing isn't installed
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
    var app_data = settings.app_settings.sabnzbd.app_data;
    var all_downloads = settings.app_settings.global.all_downloads;
    var incomplete_downloads = settings.app_settings.global.incomplete_downloads;
    var http_port = settings.app_settings.sabnzbd.http_port;
    var https_port = settings.app_settings.sabnzbd.https_port;

    async.series([
        function(callback){console.log("Installing sabnzbd...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group sabnzbd || groupadd sabnzbd'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd sabnzbd || useradd -g sabnzbd sabnzbd'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R sabnzbd:sabnzbd "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/sabnzbd'),
        async.apply(exec, 'getent passwd sabnzbd')
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
                ' -v "' + all_downloads + '":/downloads' +
                ' -v "' + incomplete_downloads + '":/incomplete-downloads' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -p ' + http_port + ':' + http_port +
                ' -p ' + https_port + ':' + https_port +
                ' --name "mcli_sabnzbd"' +
                ' linuxserver/sabnzbd';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.sabnzbd.uid = uid;
                    settings.app_settings.sabnzbd.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("sabnzbd");
                }
            });
        }
    });
}

function installNZBGet(){
    var app_data = settings.app_settings.nzbget.app_data;
    var all_downloads = settings.app_settings.global.all_downloads;
    var http_port = settings.app_settings.nzbget.http_port;

    async.series([
        function(callback){console.log("Installing nzbget...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group nzbget || groupadd nzbget'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd nzbget || useradd -g nzbget nzbget'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R nzbget:nzbget "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/nzbget'),
        async.apply(exec, 'getent passwd nzbget')
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
                ' -v "' + app_data + '":/config' +
                ' -v "' + all_downloads + '":/downloads' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -p ' + http_port + ':' + http_port +
                ' --name "mcli_nzbget"' +
                ' linuxserver/nzbget';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.nzbget.uid = uid;
                    settings.app_settings.nzbget.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("nzbget");
                }
            });
        }
    });
}

function installPlexPy(){
    var app_data = settings.app_settings.plexpy.app_data;
    var app_logs = settings.app_settings.plexpy.logs;
    var all_downloads = settings.app_settings.global.all_downloads;
    var http_port = settings.app_settings.plexpy.http_port;

    async.series([
        function(callback){console.log("Installing plexpy...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group plexpy || groupadd plexpy'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd plexpy || useradd -g plexpy plexpy'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R plexpy:plexpy "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/plexpy'),
        async.apply(exec, 'getent passwd plexpy')
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
                ' -v "' + app_logs + '":/logs' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -p ' + http_port + ':' + http_port +
                ' --name "mcli_plexpy"' +
                ' linuxserver/plexpy';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.plexpy.uid = uid;
                    settings.app_settings.plexpy.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("plexpy");
                }
            });
        }
    });
}

function installPlexRequests(){
    //
    // NOTE: THIS DOES NOT HAVE GID / UID
    //          - CREATE OWN DOCKER WITH GID / UID IMPLEMENTATION? (And not make it a 900MB docker file...)
    //          - Implementation of the above will allow us to generalize the first async.series commands
    //

    var app_data = settings.app_settings.plexrequests.app_data;
    var all_downloads = settings.app_settings.global.all_downloads;
    var http_port = settings.app_settings.plexrequests.http_port;

    async.series([
        function(callback){console.log("Installing plexpy...\n\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/plexpy')
    ], 
    function(err, results){
        if(err){
            console.log(err);
        }else{
            setSELinuxContext(app_data);

            var docker_create_cmd = 'docker create' +
                ' -v /etc/localtime:/etc/localtime:ro' +
                ' -v "' + app_data + '":/config' +
                ' -e BRANCH="master"' + 
                ' -p ' + http_port + ':3000' +
                ' --name "mcli_plexrequests"' +
                ' aptalca/docker-plexrequests';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    addInstalledApplication("plexrequests");
                }
            });
        }
    });
}

function installSonarr(){
    var app_data = settings.app_settings.sonarr.app_data;
    var tv_downloads = settings.app_settings.global.tv_downloads;
    var tv_library = settings.app_settings.global.tv_library;
    var http_port = settings.app_settings.sonarr.http_port;

    async.series([
        function(callback){console.log("Installing sonarr...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group sonarr || groupadd sonarr'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd sonarr || useradd -g sonarr sonarr'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R sonarr:sonarr "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/sonarr'),
        async.apply(exec, 'getent passwd sonarr')
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
                ' -v /dev/rtc:/dev/rtc:ro' +
                ' -v "' + app_data + '":/config' +
                ' -v "' + tv_library + '":/tv' +
                ' -v "' + tv_downloads + '":/downloads' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -p ' + http_port + ':8989' +
                ' --name "mcli_sonarr"' +
                ' linuxserver/sonarr';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.sonarr.uid = uid;
                    settings.app_settings.sonarr.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("sonarr");
                }
            });
        }
    });
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

    var app_data = settings.app_settings.plex.app_data;
    var transcode_folder = settings.app_settings.plex.transcode_folder;
    var channel = settings.app_settings.plex.channel;
    var http_port = settings.app_settings.plex.http_port;

    var tv_library = settings.app_settings.global.tv_library;
    var movie_library = settings.app_settings.global.movie_library;

    async.series([
        function(callback){console.log("Installing plex...\n\tVerifying group existance..."); callback();},
        async.apply(exec, 'getent group plex || groupadd plex'),
        function(callback){console.log("\tVerifying user existance..."); callback();},
        async.apply(exec, 'getent passwd plex || useradd -g plex plex'),
        function(callback){console.log("\tVerifying app directory existance..."); callback();},
        async.apply(exec, 'mkdir -p "' + app_data + '"'),
        function(callback){console.log("\tVerifying permissions..."); callback();},
        async.apply(exec, 'chown -R plex:plex "' + app_data + '"'),
        function(callback){console.log("\tVerifying docker image existance..."); callback();},
        async.apply(exec, 'docker pull linuxserver/plex'),
        async.apply(exec, 'getent passwd plex')
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
                ' -v "' + app_data + '":/config' +
                ' -v "' + tv_library + '":/data/tvshows' +
                ' -v "' + movie_library + '":/data/movies' +
                ' -v "' + transcode_folder + '":/transcode' +
                ' -e PGID=' + gid + ' -e PUID=' + uid +
                ' -e VERSION="' + channel + '"' +
                ' --net=host' +
                ' --name "mcli_plex"' +
                ' linuxserver/plex';

            async.series([
                async.apply(exec, docker_create_cmd),
            ], 
            function(err, results){
                if(err){
                    console.log(err);
                    process.exit(1);
                }else{
                    // Store UID and GID in config file
                    settings.app_settings.plex.uid = uid;
                    settings.app_settings.plex.gid = gid;
                    SettingsManager.save(settings);

                    addInstalledApplication("plex");
                }
            });
        }
    });
}

function installGlances(){
    // BACK BURNER
    addInstalledApplication("glances");
}

function addInstalledApplication(application){
    settings.installed_applications.push(application);
    SettingsManager.save(settings);
}

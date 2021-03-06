/**
 * @fileoverview: The webapp daemon control script invoked by
 * the Apache Commons Daemon jsvc tool.
 */

var Parser = require('ringo/args').Parser;
var Server = require('ringo/httpserver').Server;
var {resolveId} = require('ringo/fileutils');
var system = require('system');
var log = require('ringo/logging').getLogger(module.id);

var options,
    server,
    parser;

module.shared = true;

export('parseOptions', 'init', 'start', 'stop', 'destroy', 'getServer');

function parseOptions(arguments, defaults) {
    // parse command line options
    parser = new Parser();
    parser.addOption("a", "app", "APP", "The exported property name of the JSGI app (default: 'app')");
    parser.addOption("c", "config", "MODULE", "The module containing the JSGI app (default: 'config')");
    parser.addOption("j", "jetty-config", "PATH", "The jetty xml configuration file (default. 'config/jetty.xml')");
    parser.addOption("H", "host", "ADDRESS", "The IP address to bind to (default: 0.0.0.0)");
    parser.addOption("m", "mountpoint", "PATH", "The URI path where to mount the application (default: /)");
    parser.addOption("p", "port", "PORT", "The TCP port to listen on (default: 80)");
    parser.addOption("s", "static-dir", "DIR", "A directory with static resources to serve");
    parser.addOption("S", "static-mountpoint", "PATH", "The URI path where ot mount the static resources");
    // parser.addOption("v", "virtual-host", "VHOST", "The virtual host name (default: undefined)");
    parser.addOption("h", "help", null, "Print help message to stdout");
    options = parser.parse(arguments, defaults);
    return options;
}

function init() {
    log.info("init");
    if (!options) {
        parseOptions(system.args.slice(1), {
            app: "app",
            config: "config",
            port: 80
        });
    }
    if (options.help) {
        print("Available options:");
        print(parser.help());
    }

    var config = require(options.config || "config");

    // check for jar files to add to classpath
    if (Array.isArray(config.jars)) {
        config.jars.forEach(function(p) {
            log.info("Adding to classpath: " + p);
            addToClasspath(p);
        });
    }
    // pick up extra http-config from config module
    if (config.httpConfig) {
        options = Object.merge(options, config.httpConfig);
    }
    server = new Server(options);
}

function start() {
    log.info("start");
    var config = require(options.config || "config");

    // check for additional static mounts
    if (Array.isArray(config.static)) {
        config.static.forEach(function(spec) {
            var dir = resolveId(options.config, spec[1]);
            server.addStaticResources(spec[0], null, dir);
        });
    }
    server.start();
    // check extensions
    if (Array.isArray(config.extensions)) {
        config.extensions.forEach(function startExtension(ext) {
            try {
                log.debug("Starting extension", ext);
                var module = ext;
                if (typeof ext == "string") {
                    module = require(resolveId(options.config, ext));
                }
                if (typeof module.serverStarted == "function") {
                    module.serverStarted(server);
                }
            } catch (e) {
                log.error("Error starting extension {}:", ext, e);
            }
        });
    }
}

function stop() {
    log.info("stop");
    server.stop();
    // stop extensions
    if (Array.isArray(config.extensions)) {
        config.extensions.forEach(function stopExtension(ext) {
            try {
                log.debug("Stopping extension", ext);
                var module = ext;
                if (typeof ext == "string") {
                    module = require(resolveId(options.config, ext));
                }
                if (typeof module.serverStopped == "function") {
                    module.serverStopped(server);
                }
            } catch (e) {
                log.error("Error stopping extension {}:", ext, e);
            }
        });
    }
}

function destroy() {
    log.info("destroy");
    server.destroy();
    server = null;
}

function getServer() {
    return server;
}
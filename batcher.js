#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var System = require('systemjs');
require('./config');

// Help
if (process.argv.length < 4) {
    console.log('usage: batcher <action> <query>');
    process.exit(1);
}

var command = process.argv[2];
var query = process.argv[3];
var data = parseData(process.argv[4]);

function parseData(data) {
    // FIXME: not particularly typesafe.
    try {
        return JSON.parse(data)
    } catch(e) {
        return undefined;
    }
}

System.import('./core').then(function(core) {
    core.execute(query, command, data).then(function() {
        process.exit(0);
    }).catch(function(error) {
        console.error(error.stack);
        process.exit(1);
    });
});

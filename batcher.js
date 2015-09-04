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
var searchParams = argToObj(process.argv[4]);
var data = argToObj(process.argv[5]);

function argToObj(s) {
    if (s) {
        try { return JSON.parse(s); }
        catch(e) { throw "Invalid JSON argument"; }
    }
}

System.import('./core').then(function(core) {
    core.execute(command, query, searchParams, data).then(function() {
        process.exit(0);
    }).catch(function(error) {
        console.error(error.stack);
        process.exit(1);
    });
}).catch(function(e) { throw e; });

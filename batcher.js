#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var System = require('systemjs');
require('./config');

// Help
if (process.argv.length < 3) {
    const exampleQ = 'by:"Felix Clay"';
    const exampleParams = JSON.stringify({ free: false });
    const exampleData = JSON.stringify({
        category: 'comissioned-photographer',
        photographer: 'Felix Clay',
        publication: 'The Guardian'
    });

    console.log('usage:');
    console.log('batcher reindex|print <query>')
    console.log('batcher patchMetadata|editUsageRights <query> <jsonParameters> <jsonData>')
    console.log("e.g: ./batcher.js editUsageRights '" + [exampleQ, exampleParams, exampleData].join("' '") + "'");
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
}).catch(function(e) { setTimeout(function(){ throw e; }, 0); });

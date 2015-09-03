#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var System = require('systemjs');
require('./config');

// Help
if (process.argv.length < 3) {
    console.log('usage: mapper <map>');
    process.exit(1);
}

const mapping = process.argv[2];

System.import('./core').then(function(core) {
    core.mapping(mapping).then(function() {
        process.exit(0);
    }).catch(function(error) {
        console.error(error.stack);
        process.exit(1);
    });
}).catch(function(e) { console.log(e) });

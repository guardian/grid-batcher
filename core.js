import {Client} from 'theseus';
import {Http} from 'any-http-request';

import {search} from './api';
import * as commands from './commands';
import * as mappings from './mappings';

export function run(processor, query, params, data) {

    function process(results) {
        return Promise.resolve(processor(results, data)).
            then(() => results.getLink('next').catch(() => undefined)).
            then(nextLink => {
                if (nextLink) {
                    // Recurse with the next page
                    return results.follow('next').get().then(process);
                }
                // Else noop, terminate the recursive chain
            });
    }

    return search(query, params).then(process);
}


export function execute(commandName, query, searchParams, data) {
    const command = commands[commandName];
    if (! command) {
        return Promise.reject(new Error('Invalid command: ' + commandName));
    }

    return run(command, query, searchParams, data);
}

export function mapping(mappingName) {
    const mapping = mappings[mappingName];
    const query = mapping.query;
    const processor = mapping.processor;

    // only non-picdar images, that aren't free in the new cost model
    const searchParams = { free: true, costModelDiff: true, missingIdentifier: 'picdarUrn' };

    if (! mapping) {
        return Promise.reject(new Error('Invalid mapping: ' + commandName));
    }

    return run(processor, query, searchParams);
}

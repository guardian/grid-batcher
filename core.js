import {Client} from 'theseus';
import {Http} from 'any-http-request';

import {search} from './api';
import * as commands from './commands';
import * as presets from './command-presets';

function run(processor, query, params, data) {
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


export function execute(name, query, searchParams, data) {
    const command = commands[name];

    const preset = presets[name] || {};
    const q       = query || preset.query;
    const params  = searchParams || preset.params;

    if (! command) {
        return Promise.reject(new Error('Invalid command: ' + commandName));
    }

    return run(command, q, params, data);
}

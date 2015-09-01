import {Client} from 'theseus';
import {Http} from 'any-http-request';

import {search} from './api';
import * as commands from './commands';

function run(query, processor, data) {

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
    
    return search(query).then(process);
}


export function execute(query, commandName, data) {
    const command = commands[commandName];
    if (! command) {
        return Promise.reject(new Error('Invalid command: ' + commandName));
    }

    return run(query, commands[commandName], data);
}

import {Client} from 'theseus';
import {Http} from 'any-http-request';

import {search} from './api';
import * as commands from './commands';

function run({ processor, query, params }) {
    function process(results) {
        return Promise.resolve(processor(results)).
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


export function execute(name, query, params, data) {
    const command = commands[name];

    if (! command) {
        return Promise.reject(new Error('Invalid command: ' + commandName));
    }

    return run(command(query, params, data));
}

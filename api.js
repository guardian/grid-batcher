import {Client} from 'theseus';
import {Http} from 'any-http-request';

import {loadConfig} from './configuration';

import path from 'path';
import fs   from 'fs';
import yaml from 'js-yaml';

const configuration = loadConfig('grid-batcher', 'config.yml');

const client = new Client({
    promise: Promise,
    http: new Http({
        withCredentials: true,
        headers: {
            'X-Gu-Media-Key': configuration.api_key
        }
    })
});

export function search(query) {
    const root = client.resource(configuration.api_uri);
    return root.follow('search', {
        length: configuration.api_page_size,
        q: query
    }).get();
}

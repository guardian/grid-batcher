import {Client} from 'theseus';
import {Http} from 'any-http-request';

export const configuration = {
    api_key: '',
    api_uri: '',
    api_page_size: 10
};

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

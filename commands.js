import {cleanSource, cleanTheseusBug} from './cleaners';
import {Agency} from './usage-rights';
import {notPicdarDiffParams} from './params';

function command(query, params, processor) {
    return {query, params, processor};
}

// userCommand just uses the query, params & data from user input
function userCommand(com) {
    return (query, params, data) => command(query, params, com);
}

// use user query & params and apply data
const noQueryError = new Error('Do NOT add data to everything. Please supply a query.');
const noDataError  = new Error('No data. Please give us some data.');
function dataCommand(com) {
    return (query, params, data) => {
        if (!query) { throw noQueryError; }
        if (!data)  { throw noDataError; }

        return command(query, params, com(data));
    }
}

function mapAll(mapperFunc) {
    return results => {
        console.log(`Total results: ${results.total}`);
        const mapped = results.data.map(mapperFunc);
        return Promise.all(mapped);
    };
}

// The commandments
export const print = userCommand(mapAll(image => {
    console.log(JSON.stringify(image.data));
}));

export const reindex = userCommand(mapAll(image => {
    return image.perform('reindex').then(() => {
        console.log(`Reindexed ${image.data.id}`);
    }).catch(error => {
        console.error(`Failed to reindex ${image.data.id}: ${error.message}`);
    });
}));

export const patchMetadata = dataCommand(data => mapAll(image => {
    const metadataResource = image.data.userMetadata.data.metadata;
    const patchedData = Object.assign({}, metadataResource.data, data);
    delete patchedData.keywords;

    return metadataResource.put({data: patchedData}).then(() => {
        console.log(`Patched metadata on ${image.data.id} with:`);
        console.log(patchedData);
    }).catch(error => {
        console.error(`Failed to patch metadata on ${image.data.id}: ${error.message}`);
    });
}));

export const editUsageRights = dataCommand(data => mapAll(image => {
    const resource = image.data.userMetadata.data.usageRights;

    return resource.put({data}).then(() => {
        console.log(`Edited usage rights on ${image.data.id} with:`);
        console.log(data);
    }).catch(error => {
        console.error(`Failed to patch metadata on ${image.data.id}: ${error.message}`);
    });
}));

// TODO: select/map data
// TODO: delete (scary?)


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

// these commands ignore the user input completely
function presetCommand(query, params, com) {
    return (_, __, ___) => command(query, params, com);
}

// use user query & params and apply data
const noQueryError = new Error('Do NOT add data to everything. Please supply a query.');
const noDataError  = new Error('No data. Please give us some data.');
function dataCommand(com) {
    return (query, params, data) => {
        if (!query) { throw noQueryError; }
        if (!data)  { throw noDataError }

        return command(query, params, com(data));
    }
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

export const gettyImagesUsageRights = presetCommand(
    'credit:"Getty Images"',
    notPicdarDiffParams,
    mapWithUserMetadata(image => {
        const source = cleanSource(image.data.metadata.source);
        const usageRights = Agency("Getty Images", source);

        return image.data.userMetadata.data.usageRights.put({ data: usageRights }).then(() => {
            console.log(`Set usage rights on ${image.data.id} with: Agency("Getty Images", ${source})`);
            console.log(usageRights);
        });
    })
);

export const fairfaxUsageRights = presetCommand(
    'credit:"Fairfax Media via Getty Images"',
    notPicdarDiffParams,
    mapWithUserMetadata(image => {
        const usageRights = Agency("Getty Images", "Fairfax");

        return image.data.userMetadata.data.usageRights.put({ data: usageRights }).then(() => {
            console.log(`Set usage rights on ${image.data.id} with: Agency("Getty Images", "Fairfax")`);
        });
    })
);

export const reutersUsageRights = presetCommand(
    'credit:"REUTERS"',
    notPicdarDiffParams,
    mapWithUserMetadata(image => {
        const usageRights = Agency("Reuters");

        return image.data.userMetadata.data.usageRights.put({ data: usageRights }).then(() => {
            console.log(`Set usage rights on ${image.data.id} with: Agency("Reuters")`);
        });
    })
);

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)


function mapAll(mapperFunc) {
    return results => {
        console.log(`Total results: ${results.total}`);
        const mapped = results.data.map(mapperFunc);
        return Promise.all(mapped);
    };
}

function mapWithUserMetadata(mapperFunc) {
    return results => {
        console.log(`Total results: ${results.total}`);
        const mapped = results.data.map(image => {
            const usageRightsOverrides = cleanTheseusBug(image.data.userMetadata.data.usageRights.data);
            const metadataOverrides = cleanTheseusBug(image.data.userMetadata.data.metadata.data)
            // we are only looking to run this function on images that have metadata overrides
            // and no usageRights already set
            if (metadataOverrides && !usageRightsOverrides) {
                return mapperFunc(image);
            }

            return Promise.resolve();
        });
        return Promise.all(mapped);
    };
}

import {cleanSource, cleanTheseusBug} from './cleaners';
import {Agency} from './usage-rights';

export const print = mapAll(image => {
    console.log(JSON.stringify(image.data));
});

export const reindex = mapAll(image => {
    return image.perform('reindex').then(() => {
        console.log(`Reindexed ${image.data.id}`);
    }).catch(error => {
        console.error(`Failed to reindex ${image.data.id}: ${error.message}`);
    });
});

export const patchMetadata = mapAll((image, data) => {
    const metadataResource = image.data.userMetadata.data.metadata;
    const patchedData = Object.assign({}, metadataResource.data, data);
    delete patchedData.keywords;

    return metadataResource.put({data: patchedData}).then(() => {
        console.log(`Patched metadata on ${image.data.id} with:`);
        console.log(patchedData);
    }).catch(error => {
        console.error(`Failed to patch metadata on ${image.data.id}: ${error.message}`);
    });
});

export const gettyImagesUsageRights =
    mapAllUsageRightsWithMetadataOverrides(image => {

        const usageRights = Agency("Getty Images", cleanSource(image.data.metadata.source));

        console.log(`Setting usage rights on ${image.data.id} with:`);
        console.log(usageRights);
        return image.data.userMetadata.data.usageRights.put({ data: usageRights });
    });

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)


function mapAll(mapperFunc) {
    return (results, data) => {
        console.log(`Total results: ${results.total}`);
        const mapped = results.data.map(image => mapperFunc(image, data));
        return Promise.all(mapped);
    };
}

function mapAllUsageRightsWithMetadataOverrides(mapperFunc) {
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

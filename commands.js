function mapAll(mapperFunc) {
    return (results, data) => {
        const mapped = results.data.map(image => mapperFunc(image, data));
        return Promise.all(mapped);
    };
}

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

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)

function mapAll(mapperFunc) {
    return results => {
        const mapped = results.data.map(image => {
            console.log(JSON.stringify(image.data));
        });
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

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)

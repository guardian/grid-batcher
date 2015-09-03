export const queries = new Map();

const Agency = (supplier, suppliersCollection) => cleanUndefineds({
    category: 'agency',
    supplier,
    suppliersCollection
});

queries.set('gettyImagesUsageRights', 'credit:"Getty Images"');
export const gettyImagesUsageRights = mapAllUsageRightsWithMetadataOverrides(image => {

    const usageRights = Agency("Getty Images", cleanSource(image.data.metadata.source));

    console.log(`Setting usage rights on ${image.data.id} with:`);
    console.log(usageRights);
    //return image.data.userMetadata.data.usageRights.post(usagerights);

});

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

function cleanSource(s) {
    // who knows why these are here
    if (s) {
        return s.replace(/\u0000/g, '').replace(/�/g, '');
    }
}

function cleanUndefineds(o) {
    return Object.keys(o).reduce((clean, key) => {
        if (o[key]) {
            clean[key] = o[key];
        }
        return clean;
    }, {});
}

function cleanTheseusBug(o) {
    const keys = Object.keys(o);
    if (keys.length === 1  && keys[0] === 'uri') { return; }
    else { return o; }
}

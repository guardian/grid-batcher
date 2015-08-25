
export function print(image) {
    console.log(JSON.stringify(image.data));
}

export function reindex(image) {
    return image.perform('reindex').catch(error => {
        console.error(`Failed to reindex ${image.data.id}: ${error.message}`);
    });
}

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)

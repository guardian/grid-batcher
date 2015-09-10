export function cleanSource(s) {
    // who knows why these are here
    if (s) {
        return s.replace(/\u0000/g, '').replace(/�/g, '');
    }
}

export function cleanUndefinedKeys(o) {
    return Object.keys(o).reduce((clean, key) => {
        if (o[key]) {
            clean[key] = o[key];
        }
        return clean;
    }, {});
}

// Theseus returns an object with the uri as a property when the `data` object should be missing.
// See: https://github.com/argo-rest/theseus/issues/21
export function cleanTheseusBug(o) {
    if (o) {
        const keys = Object.keys(o);
        if (keys.length === 1  && keys[0] === 'uri') { return; }
        else { return o; }
    }
}

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

export function cleanTheseusBug(o) {
    const keys = Object.keys(o);
    if (keys.length === 1  && keys[0] === 'uri') { return; }
    else { return o; }
}

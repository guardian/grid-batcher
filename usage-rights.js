import {cleanUndefinedKeys} from './cleaners';

export const Agency = (supplier, suppliersCollection) => cleanUndefinedKeys({
    category: 'agency',
    supplier,
    suppliersCollection
});

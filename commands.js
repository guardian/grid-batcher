import {cleanSource, cleanTheseusBug} from './cleaners';
import {Agency} from './usage-rights';

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

// TODO: We could probably batch these up
// Credit => Agency
export const creditToUsageRightsAap =
    creditAgencyMapCommand('AAP', 'AAP');

export const creditToUsageRightsActionImages =
    creditAgencyMapCommand('Action Images', 'Action Images');

export const creditToUsageRightsAlamyImages =
    creditAgencyMapCommand('Alamy', 'Alamy');

export const creditToUsageRightsBarcroft =
    creditAgencyMapCommand('Barcroft Media', 'Barcroft Media');

export const creditToUsageRightsAp =
    creditAgencyMapCommand('AP', 'AP');

export const creditToUsageRightsAssPress =
    creditAgencyMapCommand('Associated Press', 'AP');

export const creditToUsageRightsCorbis =
    creditAgencyMapCommand('Corbis', 'Corbis');

export const creditToUsageRightsEpa =
    creditAgencyMapCommand('EPA', 'EPA');

export const creditToUsageRightsFairfax =
    creditAgencyMapCommand('Fairfax Media via Getty Images', 'Getty Images', 'Fairfax');

export const creditToUsageRightspa =
    creditAgencyMapCommand('PA', 'PA');

export const creditToUsageRightspaArchive =
    creditAgencyMapCommand('PA Archive/Press Association Images', 'PA');

export const creditToUsageRightsReuters =
    creditAgencyMapCommand('Reuters', 'Reuters');

export const creditToUsageRightsReutersUpper =
    creditAgencyMapCommand('REUTERS', 'Reuters');

export const creditToUsageRightsRex =
    creditAgencyMapCommand('Rex Features', 'Rex Features');

// Getty Images
export const creditToUsageRightsImages =
    creditAgencyMapCommand('Getty Images', 'Getty Images');

export const creditToUsageRightsAfp =
    creditAgencyMapCommand('AFP', 'Getty Images', 'AFP');

export const creditToUsageRightsAfpGetty =
    creditAgencyMapCommand('AFP/Getty Images', 'Getty Images', 'AFP');

export const creditToUsageRightsBfiGetty =
    creditAgencyMapCommand('BFI', 'Getty Images', 'BFI');

export const creditToUsageRightsFilmMagic =
    creditAgencyMapCommand('FilmMagic', 'Getty Images', 'FilmMagic');

export const creditToUsageRightsgettyWireImage =
    creditAgencyMapCommand('WireImage', 'Getty Images', 'WireImage');


// Copyright => Agency
export const copyrightToUsageRightsReuters =
    copyrightAgencyMapCommand('REUTERS', 'Reuters');

export const copyrightToUsageRightsRonaldGrantArchive =
    copyrightAgencyMapCommand('THE RONALD GRANT ARCHIVE', 'Ronald Grant Archive');

export const copyrightToUsageRightsRonaldGrant =
    copyrightAgencyMapCommand('RONALD GRANT', 'Reuters');

export const copyrightToUsageRightsPa =
    copyrightAgencyMapCommand('PA Archive/Press Association Images', 'PA');

export const copyrightToUsageRightsGettyAfp =
    copyrightAgencyMapCommand('AFP', 'Getty Images', 'AFP');

export const copyrightToUsageRightsGettyFilmMagic =
    copyrightAgencyMapCommand('FilmMagic', 'Getty Images', 'FilmMagic');

export const copyrightToUsageRightsGettyBfi =
    copyrightAgencyMapCommand('BFI', 'Getty Images', 'BFI');

export const copyrightToUsageRightsGettyWireImage =
    copyrightAgencyMapCommand('WireImage', 'Getty Images', 'WireImage');

export const copyrightToUsageRightsGettyHulton =
    copyrightAgencyMapCommand('Hulton Getty', 'Getty Images', 'Hulton');


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

// This is used to set the usage rights on images that have had their credit set in the Grid
// making them free to use - only run on non-picdar images.
function creditAgencyMapCommand(credit, supplier, suppliersCollection/*Option*/) {
    return presetCommand(
        `credit:"${credit}"`,
        {free: true, costModelDiff: true, missingIdentifier: 'picdarUrn'},
        mapWithUserMetadata(supplier, suppliersCollection)
    );
}

// This is used to set the usage rights on images that have had their copyright set in the Picdar to
// making them free to use. Only run on Picdar images.
function copyrightAgencyMapCommand(copyright, supplier, suppliersCollection/*Option*/) {
    return presetCommand(
        `copyright:"${copyright}"`,
        {free: true, costModelDiff: true, hasIdentifier: 'picdarUrn'},
        mapWithUserMetadata(supplier, suppliersCollection)
    );
}

function mapWithUserMetadata(supplier, suppliersCollection/*Option*/) {
    return (image) => {
        const source = suppliersCollection || cleanSource(image.data.metadata.source);
        // I'd prefer not to use ternaries but intellij borks.
        const usageRights = (supplier === 'Getty Images') ?
            Agency('Getty Images', source) :
            Agency(supplier);

        return image.data.userMetadata.data.usageRights.put({ data: usageRights }).then(() => {
            console.log(`Set usage rights on ${image.data.id} with: Agency('${supplier}')`);
        });
    }
}

// TODO: set metadata or rights
// TODO: select/map data
// TODO: delete (scary?)


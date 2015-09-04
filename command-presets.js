const notPicdarFromDiffParams = {free: true, costModelDiff: true, missingIdentifier: 'picdarUrn'};

export const gettyImagesUsageRights = preset('credit:"Getty Images"', notPicdarFromDiffParams);

export const fairfaxUsageRights = preset('credit:"Fairfax Media via Getty Images"', notPicdarFromDiffParams);

export const reutersUsageRights = preset('credit:"REUTERS"', notPicdarFromDiffParams);

function preset(query, params = {}) {
    return {query, params};
}

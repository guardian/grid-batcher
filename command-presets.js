const notPicdarFromDiffParams = {free: true, costModelDiff: true, missingIdentifier: 'picdarUrn'};

export const gettyImagesUsageRights = preset('credit:"Getty Images"', notPicdarFromDiffParams);

function preset(query, params = {}) {
    return {query, params};
}

/* eslint-disable guard-for-in */

const {
    getPuppets,
    writeResultsToFile,
    performanceInformations,
    defaultParams,
    mergeObjects,
    launchPuppetsGroup,
    launchPuppet,
} = require('./helpers');

/**
 * @namespace logObject
 * @property {object} performanceResults object to gather performance informations
 * @property {object} testsResults object to assign results
 *      if params.additionalParams.checkPerformance is true
 */
const logObject = {
    performanceResults: {},
    testsResults: {},
};

/**
 * @name launch
 * @description main function launching puppet tasks with general performance tests
 * @param {object} [params=defaultParams] parameters for function
 */
const launch = (params = defaultParams) => {
    const concatenatedParams = mergeObjects(defaultParams, params);
    const actualPath = process.env.INIT_CWD;
    const puppets = getPuppets(
        concatenatedParams.path.pattern,
        concatenatedParams.additionalParams.fastGlobParams,
    );

    console.info('\n======[ THE PUPPET THEATER STARTS! ]======\n\n\n');
    if (puppets.length) {
        puppets.forEach((puppet) => launchPuppetsGroup(
            puppet,
            logObject.testsResults,
            logObject.performanceResults,
            concatenatedParams,
        ));

        console.info('\n\n\n======[ THE PUPPET THEATER IS ENDING! ]======\n');

        if (concatenatedParams.additionalParams.checkPerformance) {
            performanceInformations(concatenatedParams, logObject);
        }

        writeResultsToFile(logObject.resultsFile, `${actualPath}/${concatenatedParams.path.results}`);
    }
};

/**
 * Exports all public functions
 * @module puppetTheater/public
 */
module.exports = {
    launch,
    launchPuppet,
    launchPuppetsGroup,
};

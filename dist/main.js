/* eslint-disable guard-for-in */
const path = require('path');
const {
    getPuppets,
    writeResultsToFile,
    performanceInformations,
    defaultParams,
    mergeObjects,
    launchPuppetsGroup,
    launchPuppet,
    validateParams,
    validateFail,
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

    if (validateParams(concatenatedParams, 'defaultParams')) validateFail();

    const executeDirPath = path.normalize(path.dirname(require.main.filename));
    const puppets = getPuppets(
        concatenatedParams.path.pattern,
        concatenatedParams.additionalParams.fastGlobParams,
        executeDirPath,
    );

    console.info('\n======[ THE PUPPET THEATER STARTS! ]======\n\n\n');
    if (puppets.length) {
        puppets.forEach((puppet) => launchPuppetsGroup(
            puppet,
            concatenatedParams,
            logObject.testsResults,
            logObject.performanceResults,
        ));

        console.info('\n\n\n======[ THE PUPPET THEATER IS ENDING! ]======\n');

        if (concatenatedParams.additionalParams.checkPerformance) {
            performanceInformations(concatenatedParams, logObject);
        }

        if (concatenatedParams.additionalParams.writeResultsToFile) {
            writeResultsToFile(logObject.performanceResults, `${executeDirPath}/${concatenatedParams.path.results}`);
        }
    }

    if (
        concatenatedParams.additionalParams.callback
        && concatenatedParams.additionalParams.callback instanceof Function
    ) {
        concatenatedParams.additionalParams.callback();
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

const {
    writeFileSync,
} = require('fs');
const fg = require('fast-glob');
const {
    execSync,
} = require('child_process');
require('colors');

/**
 * @namespace defaultParams
 * @property {object} path paths objects
 * @property {[]string} path.pattern pattern for puppet files location
 * @property {string} path.results path to result file
 * @property {number} attempts number of attempts
 * @property {object} additionalParams additional params objects
 * @property {boolean} additionalParams.checkPerformance should the launcher perform tests?
 * @property {[]string} additionalParams.pattern pattern for
 * @property {object} additionalParams.fastGlobParams additional options for fast-glob npm package
 */
const defaultParams = {
    path: {
        pattern: ['./*.puppet.js'],
        results: './results.json',
    },
    attempts: 1,
    additionalParams: {
        checkPerformance: false,
        silent: false,
        fastGlobParams: {
            dot: true,
        },
    },
};

/**
 * @name getPuppets
 * @description gets puppeteer files (*.puppet.js) from specified path
 * @param {string} [path=*.puppet.js] Pattern for name of puppet files
 * @param {string} params Params for fast-glob npm package
 * @returns {string[]} Array with names of puppet files
 */
const getPuppets = (pattern = defaultParams.path.pattern, params) => {
    const puppets = fg.sync(pattern, params);
    if (!puppets.length) {
        console.warn('\n\n\n======[ NO PUPPETEER FILES! ]======'.yellow);
        console.info('Check path or pattern.'.blue);
        console.info(`Pattern used: ${pattern}`.blue);
        console.info('Launcher terminated.'.blue);
    }

    return puppets;
};

/**
 * @name writeResultsToFile
 * @description synchronously writes performance tests data to a file,
 *     replacing the file if it already exists
 * @param {object} data performance tests data
 * @param {string} path path to result file
 */
const writeResultsToFile = (data, path) => writeFileSync(path, JSON.stringify(data, null, 4));

/**
 * @name performanceInformations
 * @description writes summary informations about performance of tasks
 * @param {object} performanceParams parameters as e.g number of attempts
 * @param {object} logObject object with performance data
 * @returns {string} summary performance informations
 */
const performanceInformations = (performanceParams, logObject) => {
    const tasks = Object.keys(logObject.performanceResults);
    let information = '\nDuration of tasks:\n'.yellow;

    tasks.forEach((task) => {
        information += `\n${task}`.blue;
        information += `\ntotal execution time: ${logObject.performanceResults[task]}ms`;
        information += `\naverage task time: ${logObject.performanceResults[task] / performanceParams.attempts}ms\n---------------`;
    });

    console.info(information);

    return information;
};

/**
 * @name isObject
 * @description check if specified entity is object
 * @param {*} item some entity to test is it object or not
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * @name mergeObjects
 * @description function deeply merges two objects into new one.
 * @param {object} baseObj base object
 * @param {object} newObj object overriding source object
 * @returns {object} new object with reassigned properties
 */
function mergeObjects(baseObj, newObj) {
    const output = { ...baseObj };
    if (isObject(baseObj) && isObject(newObj)) {
        Object.keys(newObj).forEach((key) => {
            if (isObject(newObj[key])) {
                if (!(key in baseObj)) {
                    Object.assign(output, { [key]: newObj[key] });
                } else {
                    output[key] = mergeObjects(baseObj[key], newObj[key]);
                }
            } else {
                Object.assign(output, { [key]: newObj[key] });
            }
        });
    }
    return output;
}

/**
 * @name assignResults
 * @description assigning perfomance test results to results object
 * @param {object} testResult performance test result
 * @param {object} resultsObj object to assign results
 * @returns {object} returns modified object
 */
const assignResults = (testResult, resultsObj) => {
    const key = Object.keys(testResult)[0];

    if (resultsObj[key]) {
        Object.assign(resultsObj[key], testResult[key]);
    } else {
        Object.assign(resultsObj, testResult);
    }

    return resultsObj;
};

/**
 * @name gatherPuppetResults
 * @description gathers performance results of each attempt
 * @param {string} puppetExec output of executed puppeteer file
 * @param {object} resultsObj  object to assign results
 * @param {number} index attempt number
 * @returns {object} returns modified object
 */
const gatherPuppetResults = (puppetExec, resultsObj, index, puppetPath) => {
    let puppet = puppetPath;
    let result = '';
    const resultsFile = {};

    if (puppetExec.match(/^puppetPerformance/)) {
        const execResult = puppetExec
            .replace('puppetPerformance: ', '')
            .replace('\n', '');

        [puppet, result] = execResult.split(': ');
        if (puppet === 'puppetPerformance:') puppet = puppetPath;
    } else {
        result = 'PERFORMANCE TESTS FAILED';
    }

    if (!resultsFile[puppet]) resultsFile[puppet] = {};
    resultsFile[puppet][index] = result;

    return assignResults(resultsFile, resultsObj);
};

/**
 * @name launchPuppet
 * @description launch single puppet file
 * @param {string} puppet name of puppeteer file (with .js extension)
 * @param {number} [index=0] attempt number
 * @param {object} [testsResults={}] object to assign results
 *      if params.additionalParams.checkPerformance is true
 * @param {object} [params=defaultParams] parameters for function
 */
const launchPuppet = (
    puppet,
    index = 0,
    testsResults = {},
    params = defaultParams,
) => {
    const concatenatedParams = mergeObjects(defaultParams, params);
    let results = {};

    if (!concatenatedParams.additionalParams.silent) console.info(`attempt #${index + 1}`);

    const puppetExec = execSync(`node ./${puppet}`);

    if (concatenatedParams.additionalParams.checkPerformance) {
        results = gatherPuppetResults(puppetExec.toString(), testsResults, index, puppet);
    }

    return results;
};

/**
 * @name launchPuppetsGroup
 * @description launch puppet file many times, number depends on params.attempts
 * @param {string} puppet name of puppeteer file (with .js extension)
 * @param {object} [resultsObj={}] object to assign results
 *      if params.additionalParams.checkPerformance is true
 * @param {object} [performanceObj={}] object to assign results of general performance
 * @param {object} [params=defaultParams] parameters for function
 * @returns {object} general perfomance results
 */
const launchPuppetsGroup = (
    puppet,
    resultsObj = {},
    performanceObj = {},
    params = defaultParams,
) => {
    const concatenatedParams = mergeObjects(defaultParams, params);
    const generalPerformanceResults = {};

    if (!concatenatedParams.additionalParams.silent) console.info(`\n======\n${puppet} started`);

    const timeStart = new Date().getTime();

    for (let i = 0; i < params.attempts; i += 1) {
        launchPuppet(puppet, i, resultsObj, concatenatedParams);
    }

    const timeEnd = new Date().getTime();
    const performanceTime = timeEnd - timeStart;
    generalPerformanceResults[puppet] = performanceTime;

    if (!concatenatedParams.additionalParams.silent) console.info(`${puppet} ended\n======`);

    return assignResults(generalPerformanceResults, performanceObj);
};

/**
 * Exports helper functions and default data
 * @module puppetTheater/helpers
 */
module.exports = {
    defaultParams,
    getPuppets,
    writeResultsToFile,
    performanceInformations,
    mergeObjects,
    launchPuppet,
    launchPuppetsGroup,
};

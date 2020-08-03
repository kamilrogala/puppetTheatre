const {
    writeFileSync,
} = require('fs');
const path = require('path');
const { exit } = require('process');
const fg = require('fast-glob');
const {
    execSync,
} = require('child_process');
require('colors');

/**
 * @namespace defaultParams
 * @property {object} path paths objects
 * @property {(string[]|string)} path.pattern pattern for puppet files location
 * @property {string} path.results path to result file
 * @property {number} attempts number of attempts
 * @property {object} additionalParams additional params objects
 * @property {boolean} additionalParams.checkPerformance should the launcher perform tests?
 * @property {boolean} additionalParams.silent gives informations about current attempt number
 *      and start/end of script
 * @property {object} additionalParams.fastGlobParams additional options for fast-glob npm package
 */
const defaultParams = {
    path: {
        pattern: ['./*.puppet.js'],
        results: './results.json',
    },
    attempts: 3,
    additionalParams: {
        checkPerformance: true,
        silent: false,
        writeResultsToFile: true,
        callback: null,
        fastGlobParams: {
            extglob: true,
        },
    },
};

/**
 * @name validateFail
 * @description Function displays the errors and exits the process
 */
const validateFail = () => {
    console.error('\nParams are invalid!'.red);
    console.error('Process terminated.'.bgRed.white);
    console.error('\n\n\n');
    exit(1);
};

/**
 * @name validateParams
 * @description validate parameters for functions
 * @param {[]} elementsToCheck array of objects to test
 *      each object should have form like this:
 * ```js
 * {
 *      toCheck: elementToCheck,
 *      type: 'object',
 * }
 * ```
 * @returns {boolean} returns true if something is wrong
 */
// eslint-disable-next-line arrow-body-style
const validateSequence = (elementsToCheck) => {
    // eslint-disable-next-line no-use-before-define
    return elementsToCheck.some((element) => validateParams(
        element.toCheck,
        element.type,
    ));
};

/**
 * @name validateParams
 * @description validate parameters for functions
 * @param {*} elementToCheck variable, object, array or other type to check
 * @param {string} requiredType what type of data should it be
 * @returns {boolean} returns true if something is wrong
 */
const validateParams = (elementToCheck, requiredType) => {
    let result = true;
    let paramToValidate = elementToCheck;

    switch (requiredType) {
    case 'defaultParams':
        paramToValidate = [
            {
                toCheck: elementToCheck.path,
                type: 'object',
            },
            {
                toCheck: elementToCheck.path.pattern,
                type: 'string|StringArray',
            },
            {
                toCheck: elementToCheck.path.results,
                type: 'string',
            },
            {
                toCheck: elementToCheck.attempts,
                type: 'number',
            },
            {
                toCheck: elementToCheck.additionalParams,
                type: 'object',
            },
            {
                toCheck: elementToCheck.additionalParams.checkPerformance,
                type: 'boolean',
            },
            {
                toCheck: elementToCheck.additionalParams.silent,
                type: 'boolean',
            },
            {
                toCheck: elementToCheck.additionalParams.writeResultsToFile,
                type: 'boolean',
            },
            {
                toCheck: elementToCheck.additionalParams.callback,
                type: 'function',
            },
            {
                toCheck: elementToCheck.additionalParams.fastGlobParams,
                type: 'object',
            },
        ];

        result = validateSequence(paramToValidate);

        break;
    case 'function':
        if (paramToValidate === null) {
            result = false;
        } else {
            result = !(paramToValidate instanceof Function);
        }
        break;
    case 'string|StringArray':
        result = (typeof paramToValidate).toLowerCase() !== requiredType.toLowerCase();
        if (result) {
            result = !(Array.isArray(paramToValidate));
            if (!result) {
                result = (typeof paramToValidate[0]).toLowerCase() !== 'string';
            }
        }
        break;
    default:
        if (paramToValidate.toString().toLowerCase() === 'infinity') {
            result = true;
            break;
        }

        result = (typeof paramToValidate).toLowerCase() !== requiredType.toLowerCase();
        break;
    }

    return result;
};

/**
 * @name getPuppets
 * @description gets puppeteer files (*.puppet.js) from specified path
 * @param {string} [pattern=*.puppet.js] Pattern for name of puppet files
 * @param {string} params Params for fast-glob npm package
 * @param {string} executeDir execute directory path
 * @returns {string[]} Array with names of puppet files
 */
const getPuppets = (pattern = defaultParams.path.pattern, params, executeDir = null) => {
    let patternToSearch = pattern;
    if (executeDir) patternToSearch = patternToSearch.map((el) => `${executeDir}/${el}`.replace(/\\/g, '/'));

    const puppets = fg.sync(patternToSearch, params);
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
// eslint-disable-next-line max-len
const writeResultsToFile = (data, filePath) => writeFileSync(filePath, JSON.stringify(data, null, 4));

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
 * @param {string} puppetPath absolute path to puppet
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
    resultsFile[puppet][index] = `${result}ms`;

    return assignResults(resultsFile, resultsObj);
};

/**
 * @name launchPuppet
 * @description launch single puppet file
 * @param {string} puppet name of puppeteer file (with .js extension)
 * @param {object} [params=defaultParams] parameters for function
 * @param {object} [testsResults={}] object to assign results
 *      if params.additionalParams.checkPerformance is true
 * @param {number} [index=0] attempt number
 */
const launchPuppet = (
    puppet,
    params = defaultParams,
    testsResults = {},
    index = 0,
) => {
    const concatenatedParams = mergeObjects(defaultParams, params);

    const paramToValidate = [
        {
            toCheck: puppet,
            type: 'string',
        },
        {
            toCheck: concatenatedParams,
            type: 'defaultParams',
        },
        {
            toCheck: testsResults,
            type: 'object',
        },
        {
            toCheck: index,
            type: 'number',
        },
    ];

    if (validateSequence(paramToValidate)) validateFail();

    let results = {};

    if (!concatenatedParams.additionalParams.silent) console.info(`attempt #${index + 1}`);

    const executeDirPath = path.normalize(path.dirname(require.main.filename));

    const puppetExec = execSync(`node ${puppet}`, {
        cwd: executeDirPath,
    });

    if (concatenatedParams.additionalParams.checkPerformance) {
        results = gatherPuppetResults(puppetExec.toString(), testsResults, index, puppet);
    }

    if (
        concatenatedParams.additionalParams.callback
        && concatenatedParams.additionalParams.callback instanceof Function
    ) {
        concatenatedParams.additionalParams.callback();
    }

    return results;
};

/**
 * @name launchPuppetsGroup
 * @description launch puppet file many times, number depends on params.attempts
 * @param {string} puppet name of puppeteer file (with .js extension)
 * @param {object} [params=defaultParams] parameters for function
 * @param {object} [resultsObj={}] object to assign results
 *      if params.additionalParams.checkPerformance is true
 * @param {object} [performanceObj={}] object to assign results of general performance
 * @returns {object} general perfomance results
 */
const launchPuppetsGroup = (
    puppet,
    params = defaultParams,
    resultsObj = {},
    performanceObj = {},
) => {
    const concatenatedParams = mergeObjects(defaultParams, params);

    const paramToValidate = [
        {
            toCheck: puppet,
            type: 'string',
        },
        {
            toCheck: concatenatedParams,
            type: 'defaultParams',
        },
        {
            toCheck: resultsObj,
            type: 'object',
        },
        {
            toCheck: performanceObj,
            type: 'object',
        },
    ];

    if (validateSequence(paramToValidate)) validateFail();

    const generalPerformanceResults = {};

    if (!concatenatedParams.additionalParams.silent) console.info(`\n======\n${puppet} started`);

    const timeStart = new Date().getTime();

    for (let i = 0; i < params.attempts; i += 1) {
        launchPuppet(puppet, concatenatedParams, resultsObj, i);
    }

    const timeEnd = new Date().getTime();
    const performanceTime = timeEnd - timeStart;
    generalPerformanceResults[puppet] = performanceTime;

    if (!concatenatedParams.additionalParams.silent) console.info(`${puppet} ended\n======`);

    if (
        concatenatedParams.additionalParams.callback
        && concatenatedParams.additionalParams.callback instanceof Function
    ) {
        concatenatedParams.additionalParams.callback();
    }

    return assignResults(generalPerformanceResults, performanceObj);
};

/**
 * Exports helper functions and default data
 * @module puppetTheater/helpers
 */
module.exports = {
    defaultParams,
    validateParams,
    validateSequence,
    validateFail,
    getPuppets,
    writeResultsToFile,
    performanceInformations,
    mergeObjects,
    launchPuppet,
    launchPuppetsGroup,
};

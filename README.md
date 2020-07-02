
# puppetTheatre
## Introduction
puppetTheatre is library for automation your [Puppeteer](https://github.com/puppeteer/puppeteer) tasks. You can launch single or multiple tasks. You can make so many attempts as you need and gather informations about performance of started tasks.

## Getting started
### Install
to be done
### First steps
You must import library to your file and then you can use function you need, like this:
```js
const pT = require('../dist/main');
pT.launchPuppet('./tasks/puppeteerTask.js');
```
If you want you can also import just one specified function and use it:
```js
const { launchPuppet } = require('../dist/main');
launchPuppet('./tasks/puppeteerTask.js');
```
You can also rename imported function:
```js
const { launchPuppet: letsReachForTheStars } = require('../dist/main');
letsReachForTheStars('./tasks/puppeteerTask.js');
```
*this code will be changed later!*
### Public functions
You have 3 public functions which you can use:

- launch(params?: object) => void
- launchPuppet(puppet: string, params?: object, testsResults?: object, index?: number) => void|object
- launchPuppetsGroup: (puppet: string, params?: object, resultsObj?: object, performanceObj?: object) => object

#### launch
This function launches many groups of puppets.
```js
launch();
```
You can pass as argument your parameters object- in other case script will use defaults:
```js
launch(params);
```
#### launchPuppet
This function launches single puppet. As argument you must type just path to your puppet:
```js
launchPuppet('./tasks/puppeteerTask.js');
```
If you params object contains additionalParams.checkPerformance set as true this function returns object with performance data.  To do this just use this example:
```js
launchPuppet('./tasks/puppeteerTask.js', myParams, {}, 0);
```
Last argument is just used when additionalParams.silent is set to false, and it's just used to write information about attempts (it's used in *launch* and *launchPuppetGoup* functions), so to be honest- it's unnecessary in this case.
#### launchPuppetsGroup
to be done
### Parameters
##### Defaults
```js
{
  path: {
    pattern: ['./*.puppet.js'],
    results:  './results.json',
  },
  attempts:  3,
  additionalParams: {
    checkPerformance:  true,
    silent:  false,
    fastGlobParams: {
      extglob:  true,
    },
  },
};
```
##### Overriding defaults
You can override any of default param:
```js
const  params = {
  path: {
    pattern: ['./tasks/**/*.test.js'],
  },
  attempts:  5,
  additionalParams: {
    checkPerformance:  false,
    fastGlobParams: {
      braceExpansion:  false
    }
  }
};
/* 
output:
{
  path: {
    pattern: ['./tasks/**/*.test.js'],
    results:  './results.json',
  },
  attempts:  5,
  additionalParams: {
    checkPerformance:  false,
    silent:  false,
    fastGlobParams: {
      extglob:  true,
      braceExpansion:  false
    },
  },
};
*/
```
##### Parameters usage in functions
to be done


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

```js
launch(params?: object) => void
```
```js
launchPuppet(puppet: string, params?: object, testsResults?: object, index?: number) => void|object
```
```js
launchPuppetsGroup(puppet: string, params?: object, resultsObj?: object, performanceObj?: object) => object
```

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
If you params object contains additionalParams.checkPerformance set as true this function returns object with performance data. To do this just use this example:
```js
launchPuppet('./tasks/puppeteerTask.js', myParams);
```
Remember that if you want gather performance information you must type *console.time* in your puppeteer scripts like this:
```js
console.time('puppetPerformance: yourLabel');
// some code here
console.timeEnd('puppetPerformance: yourLabel');
```
#### launchPuppetsGroup
This function launches single puppet in loop, so many times as you want- by default is 3 times (parameter name is *attempts*). As argument you must type just path to your puppet:
```js
launchPuppet('./tasks/puppeteerTask.js');
```
You can parameterize with object passed as second value.
```js
launchPuppet('./tasks/puppeteerTask.js', myParams);
```
If you params object contains additionalParams.checkPerformance set as true this function returns object with performance data.
Remember that if you want gather performance information you must type *console.time* in your puppeteer scripts like this:
```js
console.time('puppetPerformance: yourLabel');
// some code here
console.timeEnd('puppetPerformance: yourLabel');
```
This function returns object with all performance data- name of task and duration of executing puppet script.
### Parameters
##### Defaults
```js
{
  path: {
    pattern: ['./*.puppet.js'],
    results:  './results.json'
  },
  attempts:  3,
  additionalParams: {
    checkPerformance:  true,
    silent:  false,
    fastGlobParams: {
      extglob:  true
    }
  },
  callback: null
}
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
    results:  './results.json'
  },
  attempts:  5,
  additionalParams: {
    checkPerformance:  false,
    silent:  false,
    fastGlobParams: {
      extglob:  true,
      braceExpansion:  false
    }
  },
  callback: null
}
*/
```
##### Parameters usage in functions
**path.pattern**
Array of string with path to your puppeteer scripts.
You can use paths like:
```js
[
  './tasks/task1.puppet.js',
  './tasks/task2.puppet.js',
  './tasks/task3.js',
  './tasks/test/test2/task-test.js',
  './tasks/test/test2/task-test-asd.js',
  './other-tasks/task0.js'
  './other-tasks/task1.js'
]
```
but you can also use more dynamic paths like this:
```js
[
  './tasks/*.puppet.js',
  './tasks/task3.js',
  './tasks/test/**/*.js',
  './other-tasks/task[01].js'
]
```
for more info check [fast-glob repository](https://github.com/mrmlnc/fast-glob#basic-syntax).
Used in:
- *launch*
- *launchPuppetsGroup*

**path.results**
path to export result of the tasks.
Used in:
- *launch*

**attempts**
Each puppeteer script can be run multiple times in a loop. Use this parameter to run scripts as many times as you need!
Used in:
- *launch*
- *launchPuppetsGroup*

**additionalParams.checkPerformance**
Switch to true to gather performance results of each attempt
Used in:
- *launch*
- *launchPuppet*
- *launchPuppetsGroup*

**additionalParams.silent**
Gives informations about current attempt number, and start/end of script
Used in:
- *launch*
- *launchPuppet*
- *launchPuppetsGroup*

**additionalParams.fastGlobParams.extglob**
 Additional options for fast-glob npm package
 For more info check [fast-glob options](https://github.com/mrmlnc/fast-glob#options-3).
 Used in:
- *launch*
- *launchPuppetsGroup*

**additionalParams.callback**
You can pass here yor function- it will be run just before end of specified puppetTheatre task
Used in:
- *launch*
- *launchPuppet*
- *launchPuppetsGroup*

## Contributing
PR, criticism, comments and advice are welcome!
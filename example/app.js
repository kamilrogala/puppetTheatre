const {
    launch,
    // launchPuppet,
    // launchPuppetsGroup,
} = require('../dist/main');

const params = {
    path: {
        pattern: ['./tasks/**/*.puppet.js', './tasks/**/*.test.js'],
    },
};

launch(params);

// single file launch
// launchPuppet('./tasks/normal.test.js');

// single file launch- multiple times
// launchPuppetsGroup('./tasks/normal.puppet.js', {
//     attempts: 3,
// });

const {
    launch
} = require('../dist/main');

const params = {
    path: {
        pattern: ['./tasks/**/*.puppet.js', './tasks/**/*.test.js'],
    },
};

launch(params);

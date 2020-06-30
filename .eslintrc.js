module.exports = {
    "env": {
        "browser": false,
        "node": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "linebreak-style": [0, "error", "windows"],
        "indent": ["error", 4],
        "no-console": "off",
        "strict": 0,
        "no-restricted-syntax": [
            "error",
            {
                "selector": "CallExpression[callee.object.name='console'][callee.property.name!=/^(time|timeEnd|warn|error|info)$/]",
                "message": "Unexpected property on console object was called"
            }
        ]
    },
    "extends": "airbnb-base"
};
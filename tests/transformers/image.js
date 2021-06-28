const path = require('path');
// https://github.com/facebook/jest/issues/2663
module.exports = {
    process(_src, filename, _config, _options) {
        return `module.exports = ${ JSON.stringify(path.basename(filename)) };`;
    },
};

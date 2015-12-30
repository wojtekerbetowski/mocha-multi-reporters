var _ = {
    // object
    get: require('lodash/object/get'),
    // string
    camelCase: require('lodash/string/camelCase')
};
var debug = require('debug')('mocha:reporters:MultiReporters');
var fs = require('fs');
var mocha = require('mocha');
var objectAssignDeep = require('object-assign-deep');
var path = require('path');

function MultiReporters(runner, options) {
    options = this.getOptions(options);

    _.get(options, 'reporterEnabled', 'tap').split(',').map(
        function processReporterEnabled(name, index) {
            debug(name, index);
            var reporterOptions = this.getReporterOptions(options, name);

            //
            // Mocha Reporters
            // https://github.com/mochajs/mocha/blob/master/lib/reporters/index.js
            //
            var Reporter = _.get(mocha, ['reporters', name], null);
            if (Reporter !== null) {
                // console.log('[DEBUG]', name);

                new Reporter(
                    runner,
                    {
                        reporterOptions: reporterOptions
                    }
                );

                // runner.on('pass', function() {
                //     console.log('[DEBUG]', name, 'pass');
                // });
                // runner.on('fail', function() {
                //     console.log('[DEBUG]', name, 'fail');
                // });
                // runner.on('end', function() {
                //     console.log('[DEBUG]', name, 'end');
                // });
            }

        }.bind(this)
    );

    // var passes = 0;
    // var failures = 0;
    //
    // runner.on('pass', function (test) {
    //     passes++;
    //     console.log('pass: %s', test.fullTitle());
    // });
    //
    // runner.on('fail', function (test, err) {
    //     failures++;
    //     console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
    // });
    //
    // runner.on('end', function () {
    //     console.log('end: %d/%d', passes, passes + failures);
    //     console.log('DONE');
    //     process.exit(failures);
    // });
}

MultiReporters.CONFIG_FILE = '../config.json';

MultiReporters.prototype.getOptions = function (options) {
    debug('options', options);
    var resultantOptions = objectAssignDeep({}, this.getDefaultOptions(), this.getCustomOptions(options));
    debug('options file (resultant)', resultantOptions);
    return resultantOptions;
};

MultiReporters.prototype.getCustomOptions = function (options) {
    var customOptionsFile = _.get(options, 'reporterOptions.configFile');
    debug('options file (custom)', customOptionsFile);

    var customOptions;
    if (customOptionsFile) {
        customOptionsFile = path.resolve(customOptionsFile);
        debug('options file (custom)', customOptionsFile);

        customOptions = fs.readFileSync(customOptionsFile).toString();
        debug('options (custom)', customOptions);

        try {
            customOptions = JSON.parse(customOptions);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    return customOptions;
};

MultiReporters.prototype.getDefaultOptions = function () {
    var defaultOptionsFile = require.resolve(MultiReporters.CONFIG_FILE);
    debug('options file (default)', defaultOptionsFile);

    var defaultOptions = fs.readFileSync(defaultOptionsFile).toString();
    debug('options (default)', defaultOptions);

    try {
        defaultOptions = JSON.parse(defaultOptions);
    }
    catch (e) {
        console.error(e);
        throw e;
    }

    return defaultOptions;
};

MultiReporters.prototype.getReporterOptions = function (options, name) {
    var _name = name;
    var commonReporterOptions = _.get(options, 'reporterOptions', {});
    debug('reporter options (common)', _name, commonReporterOptions);

    name = [_.camelCase(name), 'ReporterOptions'].join('');
    var customReporterOptions = _.get(options, [name], {});
    debug('reporter options (custom)', _name, customReporterOptions);

    var resultantReporterOptions = objectAssignDeep({}, commonReporterOptions, customReporterOptions);
    debug('reporter options (resultant)', _name, resultantReporterOptions);

    return resultantReporterOptions;
};

module.exports = MultiReporters;
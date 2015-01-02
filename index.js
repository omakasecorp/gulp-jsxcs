'use strict';

var Checker = require('jscs');
var gutil = require('gulp-util');
var loadConfigFile = require('jscs/lib/cli-config');
var through = require('through2');

module.exports = function (options) {

    var out = [];
    var checker = new Checker();

    checker.registerDefaultRules();

    var config = typeof options === 'object' ? options : loadConfigFile.load(options);
    if (!config.esprima) {
        config.esprima = 'esprima-fb';
    }
    checker.configure(config);

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-jsxcs', 'Streaming not supported'));
            return;
        }

        var isExcluded = checker.getConfiguration
                ? checker.getConfiguration().isFileExcluded(file.path)
                : checker._isExcluded(file.path);

        if (isExcluded) {
            cb(null, file);
            return;
        }

        try {
            var errors = checker.checkString(file.contents.toString(), file.relative);
            errors.getErrorList().forEach(function (err) {
                out.push(errors.explainError(err, true));
            });
        } catch (err) {
            out.push(err.message.replace('null:', file.relative + ':'));
        }

        cb(null, file);
    }, function (cb) {
        if (out.length > 0) {
            this.emit('error', new gutil.PluginError('gulp-jsxcs', out.join('\n\n'), {
                showStack: false
            }));
        }

        cb();
    });
};

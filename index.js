'use strict';

var Checker = require('jscs');
var gutil = require('gulp-util');
var loadConfigFile = require('jscs/lib/cli-config');
var react = require('react-tools');
var reactDomPragma = require('react-dom-pragma');
var through = require('through2');

module.exports = function (options) {

    var out = [];
    var checker = new Checker();

    checker.registerDefaultRules();

    if (typeof options === 'object') {
        checker.configure(options);
    } else {
        checker.configure(loadConfigFile.load(options));
    }

    checker.checkString = function(str, filename) {
        if ((filename || '').match(/\.jsx$/)) {
            str = reactDomPragma(str);
            filename = filename.replace(/\.jsx$/, '.js');
        }

        var strLines = str.split(/\r\n|\r|\n/);
        var transformedStrLines = react.transform(str, {stripTypes: true}).split(/\r\n|\r|\n/);
        var transformedStr = transformedStrLines.join('\n');

        var errors = Checker.prototype.checkString.call(
            this, transformedStr, filename);

        if (strLines.length === transformedStrLines.length) {
            errors.filter(function(err) {
                return transformedStrLines[err.line - 1] === strLines[err.line - 1];
            });
        }

        return errors;
    };

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
            var errorList = errors.getErrorList();

            file.jsxcs = errorList.length
                ? {success: false, errorCount: errorList.length, errors: errorList}
                : {success: true, errorCount: 0, errors: []};

            errorList.forEach(function (err) {
                out.push(errors.explainError(err, true));
            });

        } catch (err) {
            file.jsxcs = {success: true, errorCount: 1, errors: new Error(err.message)};

            var msg;
            if (/null\s*:/.test(err.message)) {
                msg = err.stack.replace(/null\s*:/, file.relative + ':');
            } else if (/Error:/.test(err.message)) {
                msg = err.stack.replace(/Error:\s*/, 'Error: ' + file.relative + ': ');
            } else {
                msg = file.relative + ': ' + err.stack;
            }

            out.push(msg);
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

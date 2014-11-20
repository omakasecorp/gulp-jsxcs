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
            filename = filename.replace(/\.jsx$/, '.js')
        }

        var strLines = str.split(/\r\n|\r|\n/);
        var transformedStrLines = react.transform(str, {stripTypes: true}).split(/\r\n|\r|\n/);

        if (strLines.length === transformedStrLines.length) {
            var numLines = transformedStrLines.length;
            var disabled = false;
            for (var i = 0; i < numLines; i++) {
                if (transformedStrLines[i] !== strLines[i]) {
                    if (!disabled) {
                        transformedStrLines[i] = transformedStrLines[i]
                            + ' // jscs:disable';
                        disabled = true;
                    }
                } else if (disabled) {
                    transformedStrLines[i] = transformedStrLines[i]
                        + ' // jscs:enable';
                    disabled = false;
                }
            }
        }

        var transformedStr = transformedStrLines.join('\n');

        var errors = Checker.prototype.checkString.call(
            this, transformedStr, filename);

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

        if (checker._isExcluded(file.path)) {
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

'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var jsxcs = require('./');

describe('gulp-jsxcs test suite:', function() {
    this.timeout(5000);

    it('check JS files', function (cb) {
        var stream = jsxcs();
        var success = false;

        stream.on('data', function() {});

        stream.on('end', function() {
            if (!success) {
                assert(false, 'Failed to raise expected style errors');
            }
            cb();
        });

        stream.on('error', function (err) {
            if (/Illegal space before/.test(err)
                && /Multiple var declaration/.test(err)
                && /Invalid quote mark found/.test(err)) {
                success = true;
            }
        });

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture.js',
            contents: new Buffer('var x = 1,y = 2;')
        }));

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture2.js',
            contents: new Buffer('var x = { a: 1 };')
        }));

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture3.js',
            contents: new Buffer('var x = "foo";')
        }));

        stream.end();
    });

    it('check JS files using a preset', function (cb) {
        var stream = jsxcs({preset: 'google'});
        var success = false;

        stream.on('data', function() {});

        stream.on('end', function() {
            if (!success) {
                assert(false, 'Failed to raise expected style errors');
            }
            cb();
        });

        stream.on('error', function (err) {
            if (/Missing line feed at file end/.test(err)) {
                success = true;
            }
        });

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture.js',
            contents: new Buffer('var x = 1,y = 2;')
        }));

        stream.end();
    });

    it('check JS files with JSX pragma and ignore transformed blocks', function (cb) {
        var stream = jsxcs({preset: 'google'});
        var success = false;

        stream.on('data', function() {});

        stream.on('end', function() {
            if (!success) {
                assert(false, 'Failed to raise expected style errors');
            }
            cb();
        });

        stream.on('error', function (err) {
            if (/Invalid quote mark found/.test(err)) {
                console.error(err);
                assert(false, 'Identified error in JSX block');
            } else if (/Illegal space before/.test(err)
                && /Multiple var declaration/.test(err)) {
                success = true;
            }
        });

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture.js',
            contents: new Buffer('/** @jsx React.DOM */\n'
                                 + 'var x = 1,y = 2;\n'
                                 + 'var elem = (\n'
                                 + '    <div className="test">\n'
                                 + '      test\n'
                                 + '    </div>\n'
                                 + ' );\n'
                                 + 'var x = { a: 1 };')
        }));

        stream.end();
    });

    it('check JSX files without JSX pragma and ignore transformed blocks', function (cb) {
        var stream = jsxcs();
        var success = false;

        stream.on('data', function() {});

        stream.on('end', function() {
            if (!success) {
                assert(false, 'Failed to raise expected style errors');
            }
            cb();
        });

        stream.on('error', function (err) {
            if (/Invalid quote mark found/.test(err)) {
                console.error(err);
                assert(false, 'Identified error in JSX block');
            } else if (/Illegal space before/.test(err)
                && /Multiple var declaration/.test(err)) {
                success = true;
            }
        });

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/fixture.jsx',
            contents: new Buffer('var x = 1,y = 2;\n'
                                 + 'var elem = (\n'
                                 + '    <div className="test">\n'
                                 + '      test\n'
                                 + '    </div>\n'
                                 + ' );\n'
                                 + 'var x = { a: 1 };')
        }));

        stream.end();
    });

    it('check valid JS files', function (cb) {
        var stream = jsxcs();

        stream.on('data', function () {});

        stream.on('error', function (err) {
            assert(false);
        });

        stream.on('end', cb);

        stream.write(new gutil.File({
            path: __dirname + '/fixture.js',
            contents: new Buffer('var x = 1; var y = 2;')
        }));

        stream.end();
    });

    it('check and respect "excludeFiles" from config', function (cb) {
        var stream = jsxcs();

        stream.on('data', function () {});

        stream.on('error', function (err) {
            assert(!err, err);
        });

        stream.on('end', cb);

        stream.write(new gutil.File({
            base: __dirname,
            path: __dirname + '/excluded.js',
            contents: new Buffer('var x = { a: 1 };')
        }));

        stream.end();
    });

    it('check valid JS files with flow types', function (cb) {
        var stream = jsxcs();

        stream.on('data', function () {});

        stream.on('error', function (err) {
            assert(false);
        });

        stream.on('end', cb);

        stream.write(new gutil.File({
            path: __dirname + '/fixture.js',
            contents: new Buffer('function foo(x: string): string {\n    return x;\n}')
        }));

        stream.end();
    });

    it('check valid file with JSX in last line', function(cb) {
        var stream = jsxcs({requireLineFeedAtFileEnd: true});

        stream.on('data', function () {});

        stream.on('error', function (err) {
            assert(false);
        });

        stream.on('end', cb);

        stream.write(new gutil.File({
            path: __dirname + '/fixture.js',
            contents: new Buffer('/** @jsx React.DOM */\n'
                                 + 'var x = (<div />);\n')
        }));

        stream.end();
    });

    it('check valid file with requireCapitalizedComments', function(cb) {
        var stream = jsxcs({requireCapitalizedComments: true});

        stream.on('data', function () {});

        stream.on('error', function (err) {
            assert(false);
        });

        stream.on('end', cb);

        stream.write(new gutil.File({
            path: __dirname + '/fixture.js',
            contents: new Buffer('/** @jsx React.DOM */\n'
                                 + 'var x = (<div />);\n'
                                 + '\n'
                                 + 'var y  = 2;\n'
                                 + '\n'
                                 + 'var z = (<div />);\n')
        }));

        stream.end();
    });


});

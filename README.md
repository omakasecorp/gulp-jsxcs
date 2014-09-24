# [gulp](http://gulpjs.com)-jsxcs [![Build Status](https://travis-ci.org/agschwender/gulp-jsxcs.svg?branch=master)](https://travis-ci.org/agschwender/gulp-jsxcs)

Check JSX code style with [JSCS](https://github.com/jscs-dev/node-jscs).


## Install

```sh
$ npm install --save-dev gulp-jsxcs
```


## Usage

To perform JSX code style checks using the default JSCS configuration
path at `./.jscsrc`, run the following.

```js
var gulp = require('gulp'),
    jsxcs = require('gulp-jsxcs');

gulp.task('default', function () {
     return gulp.src('src/app.js')
         .pipe(jsxcs());
});
```

You may also explicitly define the JSCS configuration file.

```js
var gulp = require('gulp'),
    jsxcs = require('gulp-jsxcs');

gulp.task('default', function () {
    return gulp.src('src/app.js')
        .pipe(jsxcs('./my-jscs-config.json'));
});
```

If you do not wish to rely on a configuration file, you may pass the
JSCS options directly.

```js
var gulp = require('gulp'),
    jsxcs = require('gulp-jsxcs');

gulp.task('default', function () {
    return gulp.src('src/app.js')
        .pipe(jsxcs({
            disallowTrailingComma: true,
            validateQuoteMarks: {
                escape: true,
                mark: '\''
            }
        }));
});
```

## JSCS Options

See the [JSCS options](https://github.com/jscs-dev/node-jscs#options) for details on the options available for checking.


## License

MIT © [Adam Gschwender](http://gschwa.com)

## Acknowlegements

This module is little more than a merge of
[gulp-jscs](https://github.com/jscs-dev/gulp-jscs),
[gulp-react](https://github.com/sindresorhus/gulp-react) and
[jsxcs](https://github.com/orktes/node-jsxcs). So a thank you to the
contributors of those projects.

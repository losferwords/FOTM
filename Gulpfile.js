var gulp = require('gulp');
var mainBowerFiles = require('gulp-main-bower-files');
var uglify = require('gulp-uglify');
var environments = require('gulp-environments');
var cleanCSS = require('gulp-clean-css');
var svgSprite = require('gulp-svg-sprite');
var $ = require('gulp-load-plugins')({ pattern: ['gulp-*'] });

var dest = 'public';
var development = environments.development;
var production = environments.production;

gulp.task('3rdparty-js-pack', function () {
    var filter = $.filter(['**/*.js'], {restore:true});
    gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(filter)
        .pipe($.concat('3rdParty.js'))
        .pipe(uglify())
        .pipe(filter.restore)
        .pipe(gulp.dest(dest+"/build"));
});

gulp.task('app-js-pack', function () {
    return gulp.src([dest + '/js/**/*.js'])
        .pipe($.ngAnnotate()).on('error', _swallowError)
        .pipe($.concat('app.js'))
        .pipe(production(uglify()))
        .pipe(gulp.dest(dest+"/build"));
});

gulp.task('app-css-pack', function ()
{
    return gulp.src([dest + '/css/whirly.css', dest+'/css/app.css', dest+'/css/MD.css', dest+'/css/SM.css', dest+'/css/XS.css'])
        .pipe($.concat('all.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest(dest+"/css"));
});

gulp.task('svg-pack', function () {
    return gulp.src(dest+'/images/icons/**/*.svg')
        .pipe(svgSprite({
            shape : {
                dimension       : {
                    maxWidth    : 128,
                    maxHeight   : 128
                }
            },
            mode: {
                view : {
                    bust: false,
                    sprite: 'sprites.svg',
                    layout: "diagonal"
                }
            }
        }))
        .pipe(gulp.dest(dest+"/images/assets/svg"));
});

//gulp.task('svg-symbols-pack', function () {
//    return gulp.src(dest+'/images/icons/**/*.svg')
//        .pipe(svgSprite({
//            preview: false
//        }))
//        .pipe(gulp.dest(dest+"/images/assets/svg"));
//});

gulp.task('default', ['3rdparty-js-pack', 'app-js-pack', 'app-css-pack', 'svg-pack']);

/**
 * Swallows stream error and ends stream
 */
function _swallowError(err) {
    console.error(err);
    this.emit('end');
}



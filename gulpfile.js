var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var sassPaths = [
  'node_modules/foundation-sites/scss',
];

gulp.task('sass', function() {
  return gulp.src('source/stylesheets/site.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('.tmp/build/stylesheets'));
});

gulp.task('default', ['sass'], function() {
  gulp.watch(['source/stylesheets/**/*.scss'], ['sass']);
});

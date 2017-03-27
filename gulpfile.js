var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    fonts = require('postcss-font-magician'),
    cssnano = require('cssnano'),
    autoprefixer = require('autoprefixer'),

    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp'),
    media = require('gulp-group-css-media-queries'),
    sassUnicode = require('gulp-sass-unicode'),
    notify = require("gulp-notify");

// Скрипты проекта
gulp.task('scripts', function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/jquery-migrate/jquery-migrate.min.js',
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
        'app/libs/wow/dist/wow.min.js',
        'app/libs/parallax.js/parallax.js',
        'app/libs/equalheights/equalheights.js',
        'app/js/common.js' // Всегда в конце
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

gulp.task('postcss', function () {
    const processor = ([
        autoprefixer({browsers: ['last 7 version']}),
        cssnano(),
        fonts()
    ]);
    return gulp.src('app/sass/**/*.sass')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: bourbon.includePaths
        }).on("error", notify.onError()))
        .pipe(sassUnicode())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(media())
        .pipe(postcss(processor))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('watch', ['postcss', 'scripts', 'browser-sync'], function () {
    gulp.watch('app/sass/**/*.sass', ['postcss']);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['scripts']);
    gulp.watch('app/*.html', browserSync.reload({stream: true}));
});


gulp.task('imagemin', function () {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'postcss', 'scripts'], function () {

    var buildFiles = gulp.src([
        'app/*.html',
        'app/.htaccess',
        'app/mail.php'
    ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
        'app/css/main.min.css'
    ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
        'app/js/scripts.min.js'
    ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
        'app/fonts/**/*']
    ).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function () {

    var conn = ftp.create({
        host: '194.58.102.22',
        user: 'igor_verst',
        password: '3ekSVQPA',
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
        'dist/.htaccess'
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('./zoryka'));

});

gulp.task('removedist', function () {
    return del.sync('dist');
});
gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('default', ['watch']);
/*Подключаем установленные пакеты из папки node_modules*/

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    minify = require('gulp-minify'),
    imagemin = require('gulp-imagemin'),
    bourbon = require('bourbon').includePaths,
	gulpCopy = require('gulp-copy'),
	runSequence = require('run-sequence').use(gulp);

/*Создаем задачу на компиляцию sass стилей в css*/

gulp.task('sass', function () {
    return gulp.src('app/sass/**/*.sass')
        .pipe(plumber())
        .pipe(sass({includePaths: bourbon}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

/*Создаем задачу на минификацию js скриптов*/

gulp.task('jsmin', function () {
    return gulp.src('app/js/sources/**/*.js')
        .pipe(plumber())
        .pipe(minify())
        .pipe(gulp.dest('prod/app/js'));
});

/*Создаем задачу на минификацию изображений*/

gulp.task('imagemin', function () {
    return gulp.src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest('prod/app/images'));
});

/*Создаем задачу на минификацию css*/

gulp.task('cssmin', function () {
    return gulp.src('app/css/**/*.css')
        .pipe(plumber())
        .pipe(cleancss())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest('prod/app/css'));
});

/*Создаем задачу на живую перезагрузку браузера.
Замените:
          server: {
	          baseDir: "./"
          }     
На:
          proxy: "ваш локальный домен например (site.local)"
		  
Для отслеживания на PHP сервере*/

gulp.task('liveReload', function () {
    browserSync({
		server: {
			baseDir: "app"
		},
		open: true,
		notify: false
    });
});

/*Создаем задачу на копирование файлов для продакшена*/

gulp.task('copy',  function () {
    return gulp.src(['app/*/**', 'app/*.html', 'app/*.php'])
        .pipe(gulpCopy('prod/'));
});

/*Создаем задачу на запуск и отслеживание задач (
sass компиляция + перезагрузка, 
отслежвание изменений в JS скрипте + перезагрузка, 
отслеживание изменений в php скриптах + перезагрузка,
отслеживание изменений в html скриптах + перезагрузка,
)*/

gulp.task('watch', ['liveReload', 'sass'], function () {
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch('app/js/**/*.js', browserSync.reload);
    gulp.watch('app/**/*.php', browserSync.reload);
    gulp.watch('app/**/*.html', browserSync.reload);
});


/*Задача для продакшена + последовательный запуск задач*/

gulp.task('production',  function () {
	runSequence('copy', 'jsmin', 'cssmin', 'imagemin');
});

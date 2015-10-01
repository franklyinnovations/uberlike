var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    gulpMocha = require('gulp-mocha'),
    env = require('gulp-env'),
    supertest = require('supertest');


gulp.task('default', function(){
    nodemon({
        script: './bin/www', // 'app.js',
        ext: 'js',
        env: {
            PORT:3000
        },
        ignore: ['./node_modules/**']
    })
    .on('restart', function(){
        console.log('Restarting');
    });
});

gulp.task('test', function(){
    env({vars: {ENV:'Test'}});
    gulp.src('Test/*.js', {read: false})
        .pipe(gulpMocha({reporter: 'nyan'}))
});
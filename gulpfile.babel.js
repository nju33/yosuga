import gulp from 'gulp';
import nullpo from 'nullpo';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import shell from 'gulp-shell';
import gif from 'gulp-if';
import PrettyError from 'pretty-error';
import beeper from 'beeper';

const dev = process.env.NODE_ENV === 'dev';
const prod = process.env.NODE_ENV === 'prod';
const babelConf = {
  presets: nullpo([['env', {targets: {node: 8}}], prod ? 'babili' : null]),
  plugins: [
    'transform-decorators-legacy',
    'transform-object-rest-spread',
    'transform-class-properties',
    'add-module-exports',
  ],
};

gulp.task('lib', () => {
  return gulp
    .src('lib/index.js')
    .pipe(gif(dev, shell(['yarn run flow check'])))
    .on('end', () => {
      gulp
        .src('lib/*.js')
        .pipe(plumber({errorHandler: onError}))
        .pipe(babel(babelConf))
        .pipe(gulp.dest('dist'))
        .on('end', () => {
          gulp
            .src('lib/index.js')
            .pipe(
              gif(dev, shell(['node -r babel-register example/example.js'])),
            )
            .on('error', onError);
        });
    })
    .on('error', onError);
});

gulp.task('watch', ['lib'], () => {
  gulp.watch('+(lib|example)/*.js', ['lib']);
  gulp.watch('example/styles/**/*.+(css|less|scss|styl)', ['lib']);
});

const pe = new PrettyError();
function onError(err) {
  console.log(pe.render(err));
  beeper(2);
}

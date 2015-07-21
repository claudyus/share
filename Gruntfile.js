module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    copy: {
      bootstrap: {
        expand: true,
        cwd: 'bower_components/bootstrap/dist/fonts/',
        src: '**',
        dest: 'public/fonts'
      },
      dropzone: {
        expand: true,
        cwd: 'bower_components/dropzone/downloads/images/',
        src: '**',
        dest: 'public/images'
      }
    },
    cssmin: {
      css: {
        files: {
          'public/share.css': [
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/dropzone/downloads/css/dropzone.css',
            'bower_components/github-fork-ribbon-css/gh-fork-ribbon.css',
            'assets/share.css'
          ]
        }
      }
    },
    uglify: {
      external: {
        files: {
          'public/share.js': [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jquery-template/jquery-loadTemplate/jquery.loadTemplate-1.4.4.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/dropzone/downloads/dropzone.js',
            'bower_components/SlidesJS/source/jquery.slides.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('default', ['copy', 'cssmin', 'uglify']);
};

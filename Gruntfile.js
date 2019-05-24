module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    copy: {
      bootstrap: {
        expand: true,
        cwd: 'node_modules/bootstrap/dist/fonts/',
        src: '**',
        dest: 'public/fonts'
      },
      dropzone: {
        expand: true,
        cwd: 'node_modules/dropzone/downloads/images/',
        src: '**',
        dest: 'public/images'
      }
    },
    cssmin: {
      css: {
        files: {
          'public/share.css': [
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'node_modules/dropzone/dist/dropzone.css',
//            'node_modules/fork-ribbon/fork-ribbon.css',
            'assets/share.css'
          ]
        }
      }
    },
    uglify: {
      external: {
        files: {
          'public/share.js': [
            'node_modules/bootstrap/dist/bootstrap.js',
            'node_modules/jquery/dist/jquery.js',
            'node_modules/dropzone/dist/dropzone.js',
            'node_modules/jquery-template/jquery-loadTemplate/jquery.loadTemplate-1.4.4.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('default', ['copy', 'cssmin', 'uglify']);
};

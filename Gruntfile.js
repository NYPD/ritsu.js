module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    banner: '/* ritsu.js v<%= pkg.version %> \n' +
      ' * Created <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' * Licensed under the <%= pkg.license %> license\n' +
      ' * Source code can be found here: <%= pkg.repository.url %> \n' +
      ' */\n',

    /* grunt stamp ************************************************************/
    stamp: {
      options: {
        banner: '<%= banner %>'
      },
      yourTarget: {
        files: {
          src: 'dist/**'
        }
      }
    },

    /* css minify Task ********************************************************/
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/min/ritsu.min.css': ['dist/ritsu.css']
        }
      }
    },

    /* Uglify Task *************************************************************/
    uglify: {
      options: {
        preserveComments: false
      },
      base: {
        files: {
          'dist/min/ritsu.min.js': ['dist/ritsu.js']
        }
      }
    },

    /* Concat Task **************************************************************/
    concat: {
      base: {
        src: ['src/rules.js', 'src/core.js'],
        dest: 'dist/ritsu.js'
      }
    },

    /* Copy Task **************************************************************/
    copy: {
      main: {
        files: [{
          src: 'src/validation-styles.css',
          dest: 'dist/ritsu.css'
        }]
      },
    },

    /* Watch Task **************************************************************/
    watch: {
      configFiles: {
        files: ['Gruntfile.js'],
        tasks: ['concat', 'uglify', 'copy', 'cssmin', 'stamp']
      },
      css: {
        files: ['src/*.css'],
        tasks: ['cssmin', 'copy', 'stamp']
      },
      scripts: {
        files: ['src/*.js'],
        tasks: ['concat', 'uglify', 'copy', 'stamp']
      }
    }
  });

  // Load dem plugins
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-stamp');

  //Register dem tasks
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['copy', 'concat', 'uglify', 'cssmin', 'stamp']);
};

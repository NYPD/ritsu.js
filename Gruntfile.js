module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    banner: '/* ritsu.js v<%= pkg.version %> \n' +
            ' * Created <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * Licensed under the <%= pkg.license %> license\n' +
            ' * Source code can be found here: <%= pkg.repository.url %> \n' +
            ' */\n',
    jqueryCheck: 'if (typeof jQuery === \'undefined\' && typeof $ === \'undefined\') {\n' +
                 '  throw new Error(\'ritsu.js requires jQuery or a jQuery-compatible API\');\n' +
                 '}\n',
    ritsuHeader: 'var ritsu = (function() {',
    ritsuFooter: 'var r = rules(); return core(r, validation(r));\n' +
                 '})();',
    /* grunt stamp ************************************************************/
    stamp: {
      js: {
        options: {
          banner: '<%= banner %>\n<%= ritsuHeader %>',
          footer: '<%= ritsuFooter %>'
        },
        files: {
          src: ['dist/**/*.js']
        }
      },
      css: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          src: ['dist/**/*.css']
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
      options: {
        // Custom function to remove all module.exports
        process: function (src) {
          return src.replace(/^(module\.exports).*/gm, '')
                    .replace(/^(.*mocha_).*/gm, '')
                    .replace(/\$\{version\}*/, grunt.file.readJSON('package.json').version);
        }
      },
      dist: {
        src: ['src/rules.js', 'src/validation.js', 'src/core.js'],
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
  grunt.registerTask('build', ['copy', 'concat:dist', 'uglify', 'cssmin', 'stamp:js', 'stamp:css']);
};

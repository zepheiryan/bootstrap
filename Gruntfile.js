var fs = require('fs');

module.exports = function(grunt) {

  grunt.initConfig({
    ngversion: '1.1.5',
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    project: 'bootstrap',
    templateRoot: 'template',
    meta: {
      banner: '(function() {',
      module: templateReader('build/module.js'),
      bundle: templateReader('build/bundle.js'),
      footer: '}());'
    },
    getModules: getModules, 

    watch: {
      html: {
        files: ['src/**/*.html'],
        tasks: ['tml2js', 'karma:watch:run']
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['karma:watch:run']
      }
    },

    concat: {
      js: {
        options: {
          banner: '<%= meta.banner + meta.module() %>',
          footer: '<%= meta.footer %>'
        },
        src: ['src/*/*.js', 'src/*/<%= framework %>/*.js', '!src/**/*.spec.js'],
        dest: '<%=dist%>/<%= project %>-<%= framework %>-<%= pkg.version %>.js'
      },
      bundle: {
        options: {
          banner: '<%= meta.banner + meta.bundle() %>',
          footer: '<%= meta.footer %>'
        },
        src: ['<%= concat.js.dest %>', '<%= html2js.dist.dest %>'],
        dest: '<%=dist%>/<%= project %>-<%= framework %>-<%= pkg.version%>-bundle.js'
      }
    },

    html2js: {
      dist: {
        options: {
          module: '<%= project %>.<%= framework %>-templates',
          base: 'src',
          rename: html2jsTemplateRename,
        },
        src: ['src/*/*.html', 'src/*/<%= framework %>/*.html'],
        dest: '<%= dist %>/<%= project %>-<%= framework %>-<%= pkg.version %>-html.js'
      }
    },

    copy: {
    },

    uglify: {
    },

    jshint: {
      files: ['Gruntfile.js','src/**/*.js'],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {
          angular: true
        }
      }
    },

    karma: {
      options: {
        configFile: 'config/karma.conf.js'
      },
      watch: {
        background: true
      },
      continuous: {
        singleRun: true
      },
      travis: {
        reporters: ['dots'] //dots look better on travis
      }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },

    ngdocs: {
      options: {
        dest: 'dist/docs',
        scripts: [
          'angular.js',
          '<%= concat.dist.dest %>',
        ],
        styles: [
          'docs/css/style.css'
        ],
        navTemplate: [
          'docs/nav.html'
        ],
        title: '<%= pkg.name %>',
        html5Mode: false
      },
      api: {
        src: ['src/**/*.js', 'src/**/*.ngdoc'],
        title: 'API Documentation'
      }
    }
  });

  grunt.registerTask('build', function(framework) {
    grunt.config('framework', framework);
    grunt.task.run([ 'html2js', 'concat' ]);
  });

  grunt.registerTask('dev', ['html2js', 'karma:watch', 'watch']);

  function html2jsTemplateRename(path) {
    //eg tabs/bootstrap/tabset.html is spit out as template/tabs/tabset.html
    return grunt.config('templateRoot') + '/' + 
      path.replace('/' + grunt.config('framework'), '');
  }

  function templateReader(path) { 
    return function() {
      return grunt.template.process(grunt.file.read(path));
    };
  }

  function getModules() {
    return grunt.file.expand({cwd: 'src'}, '*').map(function(folderName) {
      return '"' + grunt.config('project') + '.' + folderName + '"';
    });
  }

  fs.readdirSync('./node_modules').forEach(function(file) {
    if (file.match(/^grunt-/)) { grunt.loadNpmTasks(file); }
  });
};



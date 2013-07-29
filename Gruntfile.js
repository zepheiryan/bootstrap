var fs = require('fs');

module.exports = function(grunt) {

  grunt.initConfig({
    ngversion: '1.1.5',
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    project: 'bootstrap',
    templateRoot: 'template',
    frameworks: ['bootstrap', 'foundation'],
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
        tasks: ['html2js', 'karma:watch:run']
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
          rename: html2jsTemplateRename
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
        configFile: 'config/karma.conf.js',
        files: [
          'config/vendor/jquery.js',
          'config/vendor/angular.js',
          'config/vendor/angular-mocks.js',
          'config/vendor/test-helpers.js',
           'src/*/*.js', 
           'src/*/<%= framework %>/*.js',
           '<%= html2js.dist.dest %>'
        ]
      },
      watch: {
        background: true
      },
      continuous: {
        browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],
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
          '<%= concat.dist.dest %>'
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

  grunt.registerTask('default', function() {
    grunt.task.run('test:bootstrap');
    grunt.config('frameworks').forEach(function(framework) {
      grunt.task.run(['build:'+framework]);
    });
  });
  grunt.registerTask('build', frameworkTask(['jshint', 'html2js', 'concat']));
  grunt.registerTask('test', frameworkTask(['html2js', 'karma:continuous']));
  grunt.registerTask('dev', frameworkTask(['html2js', 'karma:watch', 'watch']));

  //Creates a task which takes an argument and sets the framework (if not set yet).
  //Defaults framework to bootstrap.
  //This guarantees there will always be a framework set.
  function frameworkTask(tasksToRun) {
    return function(framework) {
      if (!grunt.config('framework')) {
        grunt.config('framework', framework || 'bootstrap');
        grunt.log.ok('Using framework "' + grunt.config('framework') + '"');
      }
      grunt.task.run(tasksToRun);
    };
  }

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



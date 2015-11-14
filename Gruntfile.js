module.exports = function(grunt) {
    grunt.initConfig({

        // Options:
        // https://github.com/gruntjs/grunt-contrib-less
        less: {
            development: {
                options: {
                    paths: ["less"],
                    sourceMap: true,
                    sourceMapFilename: "css/quasar.css.map",
                    sourceMapBasepath: "css",
                    sourceMapRootpath: "..",
                    sourceMapURL: "quasar.css.map"
                },
                files: {
                    "css/quasar.css": "_less/quasar.less"
                },
            },
            production: {
                options: {
                  paths: ["css"],
                  cleancss: true,
                  // NO KNEELING TOWARDS REDMOND
                  ieCompat: false
                },
                files: {
                    "css/quasar.min.css": "_less/quasar.less"
                }
            }
        },
        watch: {
            files: "./_less/*",
            tasks: ["less"]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('production', ['less:production']);
};
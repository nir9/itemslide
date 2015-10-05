module.exports = function (grunt) {

    grunt.initConfig({
        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '/* ItemSlide.js - Licensed under the MIT license */',
                    linebreak: true
                },
                files: {
                    src: ['dist/itemslide.min.js']
                }
            }
        },
        uglify: {
            regular: {
                files: {
                    'dist/itemslide.min.js': ['dist/itemslide.js']
                }
            }
        },
        browserify: {
            regular: {
                src: ['src/itemslide.js'],
                dest: 'dist/itemslide.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/*.js',
                tasks: ['browserify']
                    //tasks: ['browserify', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-banner');


    grunt.registerTask('default', ['browserify', 'uglify', 'usebanner']); // Build
    grunt.registerTask('test', ['browserify']);

};

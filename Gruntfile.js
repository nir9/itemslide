module.exports = function (grunt) {

    grunt.initConfig({
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
                tasks: ['browserify', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['browserify', 'uglify']);
    grunt.registerTask('test', ['browserify']);

};

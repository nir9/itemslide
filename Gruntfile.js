module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            regular: {
                files: {
                    'dist/itemslide.min.js': ['src/itemslide.js', 'src/slideout.js']
                }
            },
            vanilla: {
                files: {
                    'dist/itemslide.vanilla.min.js': ['src/vanilla.js', 'src/itemslide.js', 'src/slideout.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

};

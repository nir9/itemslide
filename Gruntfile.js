module.exports = function (grunt) {
    var banner = '(function( window ) {\n',
        footer = '\n})( window );';

    grunt.initConfig({
        concat: {
            options: {
                separator: ';',
                banner: banner,
                footer: footer
            },
            regular: {
                src: [
                    'src/requestAnimationFrame.js',
                    'src/itemslide.js',
                    'src/slideout.js'
                ],
                dest: 'dist/itemslide.min.js'
            },
            vanilla: {
                src: [
                    'src/requestAnimationFrame.js',
                    'src/vanilla.js',
                    'src/itemslide.js',
                    'src/slideout.js'
                ],
                dest: 'dist/itemslide.vanilla.min.js'
            }
        },
        uglify: {
            regular: {
                files: {
                    'dist/itemslide.min.js': ['dist/itemslide.min.js']
                }
            },
            vanilla: {
                files: {
                    'dist/itemslide.vanilla.min.js': ['dist/itemslide.vanilla.min.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['concat']);
    grunt.registerTask('default', ['concat', 'uglify']);
};

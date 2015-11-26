module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nggettext_extract: {
            pot: {
                files: {
                    'po/translations.pot': [
                        'template/partials/*.ejs',
                        'template/partials/toolbars/*.ejs',
                        'public/js/controllers/*.js',
                        'public/js/factories/*.js',
                        'public/js/services/*.js'
                    ]
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    'public/js/translations.js': ['po/*.po']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-gettext');

    // Default task(s).
    grunt.registerTask('default', ['nggettext_extract','nggettext_compile']);

};
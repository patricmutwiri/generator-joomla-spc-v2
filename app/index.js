/*
    generator-joomla-spc

    index.coffee
 */

(function() {
    var Generator, config, exec, fs, path, rimraf, semver, util, yeoman;

    Generator = function(args, options) {
        
        yeoman.generators.Base.apply(this, arguments);
        this.generator = Object.create(null);
        this.sourceRoot(path.join(__dirname, 'templates'));
        this.on('end', function() {
            this.installDependencies({
                skipInstall: options['skip-install']
            });
        });
    };

    'use strict';

    util = require('util');

    path = require('path');

    fs = require('fs');
    mkdirp = require('mkdirp');

    yeoman = require('yeoman-generator');
    yosay = require('yosay');
    chalk = require('chalk');

    rimraf = require('rimraf');

    exec = require('child_process').exec;

    semver = require('semver');

    config = require('../config.js');

    module.exports = Generator;

    util.inherits(Generator, yeoman.generators.NamedBase);

    Generator.prototype.startGenerator = function() {

        //  // initializing: {

        //    // Welcome
        //welcome: function () {
        this.log(yosay(chalk.white('Welcome to the SPC Joomla Extension generator!')));
        //}
    };

    Generator.prototype.askForType = function() {
        // Ask for extension type
        // askForType: function () {
        var done = this.async();
        this.prompt({
            type: 'list',
            name: 'type',
            message: 'What type of extension do you want to create?',
            choices: [{
                name: 'Component',
                value: 'ext-com'
            }, {
                name: 'Plug-in',
                value: 'ext-plg'
            }, {
                name: 'Template Front End',
                value: 'ext-tpl'
            }, {
                name: 'Template Admin',
                value: 'ext-tpladmin'
            }, {
                name: 'Module',
                value: 'ext-mod'
            }]
        }, function(typeAnswer) {
            this.generator.type = typeAnswer.type;
            console.log("type = ", this.generator.type)
            done();
        }.bind(this));
    };

    Generator.prototype.getConfig = function() {
        var cb, self;
        cb = this.async();
        self = this;
        self.configExists = false;
        config.getConfig(function(err, data) {
            if (!err) {
                self.configExists = true;
            }
            self.defaultAuthorName = data.authorName;
            self.defaultAuthorURL = data.authorURL;
            self.defaultAuthorEmail = data.authorEmail;
            self.latestVersion = data.latestVersion;
            cb();
        });
    };

    Generator.prototype.askFor = function() {
        var cb, prompts, self;
        cb = this.async();
        self = this;
        // console.log(this.yeoman)
        prompts = [{
            name: 'description',
            message: 'Describe your component',
            'default': 'A sample description'
        }, {
            name: 'componentName',
            message: 'What\'s the component\'s name?',
            'default': 'default-value'
        }, {
            name: 'authorName',
            message: 'What\'s your name?',
            'default': self.defaultAuthorName
        }, {
            name: 'authorEmail',
            message: 'What\'s your e-mail?',
            'default': self.defaultAuthorEmail
        }, {
            name: 'authorURL',
            message: 'What\'s your website?',
            'default': self.defaultAuthorURL
        }, {
            name: 'versionno',
            message: 'What\'s the version number?',
            'default': '1.0.0'
        }, {
            name: 'license',
            message: 'What\'s the copyright license?',
            'default': 'MIT'
        }, {
            type: 'confirm',
            name: 'requireManageRights',
            message: 'Does your component require admin manage rights to access it?'
        }, {
            type: 'confirm',
            name: 'legacyJoomla',
            message: 'Support Joomla 2.5x with compatibility layer?'
        }];
        this.prompt(prompts, (function(props) {
            var values;
            values = void 0;
            this.description = props.description;
            this.componentName = props.componentName;
            this.authorName = props.authorName;
            this.authorEmail = props.authorEmail;
            this.authorURL = props.authorURL;
            this.versionno = props.versionno;
            this.license = props.license;
            this.requireManageRights = props.requireManageRights;
            this.legacyJoomla = props.legacyJoomla;
            this.currentDate = this._getCurrentDate();
            this.currentYear = this._getCurrentYear();
            if (!self.configExists) {
                values = {
                    authorName: self.authorName,
                    authorURL: self.authorURL,
                    authorEmail: self.authorEmail,
                    versionno: self.versionno
                };
                return config.createConfig(values, cb);
            } else {
                return cb();
            }
        }).bind(this));
    };

    // Generator.prototype.extCom  = function () {
    //   var done = this.async();
    //   if (this.generator.type !== 'ext-com') {
    //     console.log("type = ", this.generator.type)
    //     done();
    //     return;
    //   }
    // };

    /*
     *
     *  Write files
     *
     */
    Generator.prototype.writing = function() {
        // var this.dest.root = this.destionationroot();
        // var appdir = this.dest.root + '/app';
        this._common();
        this._projectfiles();
        this._createConfigFiles();

        this.sourceRoot(path.join(__dirname, './templates/' + this.generator.type));

        switch (this.generator.type) {
            case 'ext-com':
                this._writingCom();

                break;
            case 'ext-plg':
                this._writingPlg();
                break;          
            case 'ext-tpl':
                this._writingTpl();
                break;
            case 'ext-tpladmin':
                this._writingTpladmin();
                break;
            case 'ext-mod':
                this._writingMod();
                break;
            default:
                //unknown project type
                break;
        }

    };

    // files for extension type Com
    Generator.prototype._writingCom = function() {
    var done = this.async();
        console.log("_writingCom function");
        // this.mkdir('src');
        this._createLegacyFallbackFiles();
        this._createEmptyMVCFolders();
        
        //this.template('_package.json', 'package.json');
        this.template('_component-name.xml', 'app/' + this._.slugify(this.componentName) + '.xml');
        
        this.template('_component-name.php', 'app/' + this._.slugify(this.componentName) + '.php');
        this.template('_router.php', 'app/' + 'router.php');
        this.template('sql/_install.mysql.utf8.sql', 'app/' + 'sql/install.mysql.utf8.sql');
        this.template('sql/_uninstall.mysql.utf8.sql', 'app/' + 'sql/uninstall.mysql.utf8.sql');
        this.template('_install-uninstall.php', 'app/' + 'install-uninstall.php');
        this.template('languages/en-GB/_en-GB.com_component-name.ini', 'app/' + 'languages/en-GB/en-GB.com_' + this._.slugify(this.componentName) + '.ini');
        this.template('languages/en-GB/_en-GB.com_component-name.ini', 'app/' + 'languages/en-GB/en-GB.com_' + this._.slugify(this.componentName) + '.sys.ini');
        //this._install();
        done();
    return;

    };

    // files for extension type Plg
    Generator.prototype._writingPlg = function() {
      var done = this.async();

        console.log("_writingPlg function");

        done();
    return;

    };

    // files for extension type Tpl
    Generator.prototype._writingTpl = function() {
      var done = this.async();

         console.log("_writingTpl function");

        done();
    return;
    };


    // files for extension type Tpladmin
    Generator.prototype._writingTpladmin = function() {
      var done = this.async();

         console.log("_writingTpladmin function");

        done();
    return;
    };
        // files for extension type Mod
    Generator.prototype._writingMod = function() {
        var done = this.async();

        console.log("_writingMod function");

        done();
    return;
    };

    // Generator.prototype.extCom = function() {
    //     var done = this.async();
    //     if (this.generator.type !== 'ext-com') {
    //         console.log("type = ", this.generator.type)
    //         done();
    //         return;
    //     }
    // };

    Generator.prototype._common = function() {
        this.template('_package.json', 'package.json');
        this.copy('_Gruntfile.js', 'Gruntfile.js');
        this.copy('../USAGE', 'USAGE');
        this.template('_bower.json', 'bower.json');
        return this.copy('_gitignore', '.gitignore');

};
   // Generator.prototype.app = function() {
        // this.mkdir('app');
        // this.mkdir('app/templates');
        // this.mkdir('app/admin');
        // this.mkdir('app/site');
        // this.mkdir('src');
        // this.template('_package.json', 'package.json');
        // this.copy('_Gruntfile.js', 'Gruntfile.js');
        // this.copy('../USAGE', 'USAGE');
        // this.template('_bower.json', 'bower.json');
        // return this.copy('_gitignore', '.gitignore');
   // };

    Generator.prototype._getCurrentDate = function() {
        var dd, mm, today, yyyy;
        dd = void 0;
        mm = void 0;
        today = void 0;
        yyyy = void 0;
        today = new Date;
        dd = today.getDate();
        mm = this._getCurrentMonthName();
        yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return today = dd + '-' + mm + '-' + yyyy;
    };

    Generator.prototype._getCurrentMonthName = function() {
        var d, month, n;
        d = void 0;
        month = void 0;
        n = void 0;
        d = new Date;
        month = new Array;
        month[0] = 'January';
        month[1] = 'February';
        month[2] = 'March';
        month[3] = 'April';
        month[4] = 'May';
        month[5] = 'June';
        month[6] = 'July';
        month[7] = 'August';
        month[8] = 'September';
        month[9] = 'October';
        month[10] = 'November';
        month[11] = 'December';
        return n = month[d.getMonth()];
    };

    Generator.prototype._getCurrentYear = function() {
        var today, year, yyyy;
        today = void 0;
        year = void 0;
        yyyy = void 0;
        today = new Date;
        yyyy = today.getFullYear();
        return year = yyyy;
    };

    Generator.prototype._projectfiles = function() {
        this.copy('editorconfig', '.editorconfig');
        return this.copy('jshintrc', '.jshintrc');
    };

    Generator.prototype._createConfigFiles = function() {
        //this.template('_component-name.xml', 'app/' + this._.slugify(this.componentName) + '.xml');
        this.template('_config.xml', 'app/' + 'config.xml');
        return this.template('_access.xml', 'app/' + 'access.xml');
    };


    /*
      Create legacy files for fallback to Joomla 2.5x
   */

    Generator.prototype._createLegacyFallbackFiles = function() {
        if (this.legacyJoomla === true) {
            return this.template('_legacy.php', 'app/' + 'legacy.php');
        }
    };

    Generator.prototype._createPHPFiles = function() {
        this.template('_component-name.php', 'app/' + this._.slugify(this.componentName) + '.php');
        return this.template('_router.php', 'app/' + 'router.php');
    };

    Generator.prototype._createDatabaseFiles = function() {
        this.template('sql/_install.mysql.utf8.sql', 'app/' + 'sql/install.mysql.utf8.sql');
        this.template('sql/_uninstall.mysql.utf8.sql', 'app/' + 'sql/uninstall.mysql.utf8.sql');
        return this.template('_install-uninstall.php', 'app/' + 'install-uninstall.php');
    };

    Generator.prototype._createLanguageFiles = function() {
        this.template('languages/en-GB/_en-GB.com_component-name.ini', 'app/' + 'languages/en-GB/en-GB.com_' + this._.slugify(this.componentName) + '.ini');
        return this.template('languages/en-GB/_en-GB.com_component-name.ini', 'app/' + 'languages/en-GB/en-GB.com_' + this._.slugify(this.componentName) + '.sys.ini');
    };

    Generator.prototype._createEmptyMVCFolders = function() {
        var emptyMVCFolders, folderName, i, len;
        emptyMVCFolders = void 0;
        folderName = void 0;
        i = void 0;
        len = void 0;
        emptyMVCFolders = ['app/' + 'controllers', 'app/' + 'helpers', 'app/' + 'models', 'app/' + 'sql', 'app/' + 'tables', 'app/' + 'views'];
        i = 0;
        len = emptyMVCFolders.length;
        while (i < len) {
            folderName = emptyMVCFolders[i];
            this.template('_index.html', folderName + '/index.html');
            i++;
        }
        this.template('_index.html', 'app/' + 'index.html');
        this.template('_index.html', 'app/' + 'languages/index.html');
        return this.template('_index.html', 'app/' + 'languages/en-GB/index.html');
    };

      // Installation
  // Generator.prototype.install = function () {
  //   // process.chdir(this.generator.name);

  //   if (this.generator.installDependencies) {
  //     this.installDependencies({
  //       npm: true,
  //       bower: false
  //     });
  //   }
  //   // process.run(grunt);
  // };

    Generator.prototype.endGenerator = function() {
      this.log('');
    //if (this.generator.isCustomization) {
      this.log('Your extension ' + this.componentName + ' has been created!');
      this.log('');
      this.log('Go here to download and install bitnami joomla for your system https://bitnami.com/stack/joomla');
     this.log('');
     // this.log('To start using it with Visual Studio Code copy it into the .vscode/extensions folder and restart Code.');
    // } else {
    //   this.log('Your extension ' + this.generator.name + ' has been created!');
    //   this.log('');
    //     this.log.writeln('');
    //     this.log.writeln('Looks like we\'re done!');
    //     this.log.writeln('');
    };

}).call(this);
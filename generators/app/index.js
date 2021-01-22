const Generator = require('yeoman-generator');

function convertToPackageName(name) {
  let n = name.toLowerCase();
  n = n.replace(/\s+/g, '-');
  return n;
}

const devDeps = [
  'typescript',
  'core-js',
  'webpack',
  'webpack-cli',
  'webpack-dev-server',
  'mini-css-extract-plugin',
  'cross-env',
  'dotenv',
  'ts-node',
  'ts-loader',
  'babel-loader',
  'eslint',
  'html-loader',
  'postcss',
  'css-loader',
  'style-loader',
  'postcss-loader',
  'postcss-preset-env',
  'file-loader',
  'html-webpack-plugin@5.0.0-alpha.6',
  'clean-webpack-plugin',
  'css-minimizer-webpack-plugin',
  'terser-webpack-plugin',
  '@types/terser-webpack-plugin',
  '@babel/core',
  '@babel/preset-env',
  '@babel/plugin-transform-runtime',
  '@types/mini-css-extract-plugin',
  '@types/css-minimizer-webpack-plugin',
  '@types/webpack',
  '@types/webpack-dev-server',
  '@types/postcss-preset-env',
  '@types/node',
];

const sassDevDeps = ['sass', 'sass-loader'];

const reactDeps = ['react', 'react-dom', '@types/react', '@types/react-dom', '@babel/preset-react'];

function deps(iconLib, styleFramework, uiFramework) {
  let res = [...devDeps];
  const addBootstrap = styleFramework === 'bootstrap';
  const addTailwind = styleFramework === 'tailwindcss';

  if (addTailwind === true) {
    res = [...res, 'tailwindcss@latest'];
  } else if (addBootstrap === true) {
    res = [...res, ...sassDevDeps, 'bootstrap@next'];
  } else {
    res = [...res, ...sassDevDeps];
  }

  if (iconLib === 'fontAwesome') {
    res = [...res, '@fortawesome/fontawesome-free'];
  } else if (iconLib === 'bootstrap') {
    res = [...res, 'bootstrap-icons'];
  }

  if (uiFramework === 'react') {
    res = [...res, ...reactDeps];
  }

  return res;
}

module.exports = class extends Generator {
  async prompting() {
    this.appSettings = await this.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Application name',
        default: this.appname,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Application description',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Application author',
      },
      {
        type: 'list',
        name: 'uiFramework',
        message: 'Integrate a framework for UI scripting?',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'React',
            value: 'react',
          },
        ],
        default: 'none',
      },
      {
        type: 'list',
        name: 'styleFramework',
        message: 'Integrate framework for styles?',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Bootstrap SCSS',
            value: 'bootstrap',
          },
          {
            name: 'Tailwind CSS',
            value: 'tailwindcss',
          },
        ],
        default: 'none',
      },
      {
        type: 'list',
        name: 'iconLib',
        message: 'Select icon font library to install',
        choices: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Bootstrap icons',
            value: 'bootstrap',
          },
          {
            name: 'FontAwesome (free)',
            value: 'fontAwesome',
          },
        ],
        default: 'none',
      },
      {
        type: 'confirm',
        name: 'initializeGit',
        message: 'Initialize git repository?',
      },
    ]);
  }

  writeFiles() {
    this.fs.copyTpl(this.templatePath('package.json.ejs'), this.destinationPath('package.json'), {
      name: convertToPackageName(this.appSettings.appName),
      author: this.appSettings.author,
      description: this.appSettings.description,
    });

    if (this.appSettings.uiFramework === 'react') {
      this.fs.copyTpl(this.templatePath('react-app.tsx.ejs'), this.destinationPath('src/app.tsx'), {});
    }

    this.fs.copy(this.templatePath('.browserslistrc'), this.destinationPath('.browserslistrc'));
    this.fs.copy(this.templatePath('.eslint*'), this.destinationPath());
    this.fs.copy(this.templatePath('.prettierrc.json'), this.destinationPath('.prettierrc.json'));

    this.fs.copyTpl(this.templatePath('babel.config.js.ejs'), this.destinationPath('babel.config.js'), {
      uiFramework: this.appSettings.uiFramework,
    });

    this.fs.copyTpl(this.templatePath('tsconfig.json.ejs'), this.destinationPath('tsconfig.json'), {
      uiFramework: this.appSettings.uiFramework,
    });

    this.fs.copyTpl(this.templatePath('index.ts.ejs'), this.destinationPath('src/index.ts'), {
      styleFramework: this.appSettings.styleFramework,
      uiFramework: this.appSettings.uiFramework,
    });

    this.fs.copyTpl(
      this.templatePath('webpack-config/webpack.config.ts.ejs'),
      this.destinationPath('webpack-config/webpack.config.ts'),
      {
        styleFramework: this.appSettings.styleFramework,
      }
    );

    if (this.appSettings.styleFramework === 'tailwindcss') {
      this.fs.copy(this.templatePath('tailwind.config.js'), this.destinationPath('tailwind.config.js'));
    }

    if (this.appSettings.styleFramework !== 'tailwindcss') {
      this.fs.copyTpl(
        this.templatePath('styles/variables.scss.ejs'),
        this.destinationPath('src/styles/variables.scss'),
        {
          styleFramework: this.appSettings.styleFramework,
        }
      );

      this.fs.copyTpl(this.templatePath('styles/style.scss.ejs'), this.destinationPath('src/styles/style.scss'), {
        iconLib: this.appSettings.iconLib,
        styleFramework: this.appSettings.styleFramework,
      });
    } else {
      this.fs.copyTpl(this.templatePath('styles/tailwindcss.style.css'), this.destinationPath('src/styles/style.css'), {
        iconLib: this.appSettings.iconLib,
      });
    }

    this.fs.copyTpl(this.templatePath('index.html'), this.destinationPath('src/index.html'), {
      appName: this.appSettings.appName,
      uiFramework: this.appSettings.uiFramework,
    });
  }

  gitInit() {
    if (this.appSettings.initializeGit) {
      this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
      this.spawnCommandSync('git', ['init']);
    }
  }

  installDependencies() {
    this.npmInstall(deps(this.appSettings.iconLib, this.appSettings.styleFramework, this.appSettings.uiFramework), {
      'save-dev': true,
    });
  }
};

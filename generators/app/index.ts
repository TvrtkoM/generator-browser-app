import Handlebars from 'handlebars';
import handlebarsHelpers from 'handlebars-helpers';

const handlebars = Handlebars.create();

handlebarsHelpers({ handlebars });

import Generator from 'yeoman-generator';
import { DepsOptions, GenOptions } from './types';

function convertToPackageName(name: string) {
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
  'css-loader',
  'style-loader',
  'file-loader',
  'html-webpack-plugin',
  'clean-webpack-plugin',
  'css-minimizer-webpack-plugin',
  'terser-webpack-plugin',
  '@types/terser-webpack-plugin',
  '@babel/core',
  '@babel/preset-env',
  '@babel/plugin-transform-runtime',
  '@babel/plugin-transform-modules-commonjs',
  '@types/mini-css-extract-plugin',
  '@types/css-minimizer-webpack-plugin',
  '@types/webpack',
  '@types/webpack-dev-server',
  '@types/node',
];

const sassDevDeps = ['sass', 'sass-loader'];
const tailwindcssDeps = [
  'tailwindcss@latest',
  'postcss',
  'postcss-loader',
  'postcss-preset-env',
  '@types/postcss-preset-env',
];
const reactDeps = ['react', 'react-dom', '@types/react', '@types/react-dom', '@babel/preset-react'];

function deps({ iconLib, styleFramework, uiFramework }: DepsOptions) {
  let res = [...devDeps];
  const addBootstrap = styleFramework === 'bootstrap';
  const addTailwind = styleFramework === 'tailwindcss';

  if (addTailwind) {
    res = [...res, ...tailwindcssDeps];
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

class WebAppGenerator extends Generator {
  appSettings!: GenOptions;

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
    this.appSettings.appName = convertToPackageName(this.appSettings.appName);
    
    this._copyHandlebarsTpl('package.json.hbs', 'package.json', this.appSettings);

    this.fs.copy(this.templatePath('.browserslistrc'), this.destinationPath('.browserslistrc'));
    this.fs.copy(this.templatePath('.eslint*'), this.destinationPath());
    this.fs.copy(this.templatePath('.prettierrc.json'), this.destinationPath('.prettierrc.json'));

    this._copyHandlebarsTpl('babel.config.js.hbs', 'babel.config.js', this.appSettings);
    this._copyHandlebarsTpl('tsconfig.json.hbs', 'tsconfig.json', this.appSettings);

    if (this.appSettings.uiFramework === 'react') {
      this.fs.copy(this.templatePath('react-app.tsx'), this.destinationPath('src/app.tsx'));
    }

    this._copyHandlebarsTpl('index.ts.hbs', 'src/index.ts', this.appSettings);

    this._copyHandlebarsTpl(
      'webpack-config/webpack.config.ts.hbs',
      'webpack-config/webpack.config.ts',
      this.appSettings
    );

    if (this.appSettings.styleFramework === 'tailwindcss') {
      this.fs.copy(this.templatePath('tailwind.config.js'), this.destinationPath('tailwind.config.js'));
      this._copyHandlebarsTpl('styles/tailwindcss.style.css.hbs', 'src/styles/style.css', this.appSettings)
    } else {
      this._copyHandlebarsTpl('styles/variables.scss.hbs', 'src/styles/variables.scss', this.appSettings);
      this._copyHandlebarsTpl('styles/style.scss.hbs', 'src/styles/style.scss', this.appSettings);
    }

    this._copyHandlebarsTpl('index.html.hbs', 'src/index.html', this.appSettings);
  }

  gitInit() {
    if (this.appSettings.initializeGit) {
      this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
      this.spawnCommandSync('git', ['init']);
    }
  }

  installDependencies() {
    const { iconLib, styleFramework, uiFramework } = this.appSettings;
    this.npmInstall(
      deps({
        iconLib,
        styleFramework,
        uiFramework,
      }),
      {
        'save-dev': true,
      }
    );
  }

  private _copyHandlebarsTpl(tplPath: string, destPath: string, ctx: {[key: string]: any}) {
    const tString = this.fs.read(this.templatePath(tplPath));
    const template = handlebars.compile(tString);
    this.fs.write(this.destinationPath(destPath), template(ctx));
  }
};

export default WebAppGenerator;

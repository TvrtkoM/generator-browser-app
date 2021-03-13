type IconLib = 'fontAwesome' | 'bootstrap' | 'none';
type StyleFramework = 'bootstrap' | 'tailwindcss' | 'none';
type UiFramework = 'react' | 'none';

/**
 * Interface for dependecies configuration
 */
export interface DepsOptions {
  /**
   * Icon library to use
   */
  iconLib: IconLib;

  /**
   * styling framework to use
   * Bootstrap assumes SCSS and tailwind PostCSS preporcessor
   * If no option is selected - project will be generated with boilerplate for SCSS
   */
  styleFramework: StyleFramework

  /**
   * Framework or library for UI development. Currently only react
   */
  uiFramework: UiFramework;
}

export interface GenOptions {
  author: string;
  description: string;
  appName: string;
  uiFramework: UiFramework;
  styleFramework: StyleFramework;
  iconLib: IconLib;
  initializeGit: boolean;
}

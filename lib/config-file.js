/**
 * @fileoverview Helper to locate and load configuration files.
 * @author Alexander Bell-Towne
 *
 * Concept taken from ESLint.
 */

const fs = require('fs');
const path = require('path');
const stripComments = require('strip-json-comments');
const merge = require('deepmerge');
const importFresh = require('import-fresh');

const DEFAULT_CONFIG = require('./default-config.json');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

const CONFIG_FILES = [
  '.clean-env.js',
  '.clean-env.yaml',
  '.clean-env.yml',
  '.clean-env.json',
  'package.json',
];

/**
 * Convenience wrapper for synchronously reading file contents.
 * @param {string} filePath The filename to read.
 * @returns {string} The file contents, with the BOM removed.
 * @private
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\ufeff/u, '');
}

/**
 * Loads a YAML configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
function loadYAMLConfigFile(filePath) {
  // debug(`Loading YAML config file: ${filePath}`);

  // lazy load YAML to improve performance when not used
  const yaml = require('js-yaml');

  try {
    // empty YAML file can be null, so always use
    return yaml.safeLoad(readFile(filePath)) || {};
  } catch (e) {
    // debug(`Error reading YAML file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a JSON configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
function loadJSONConfigFile(filePath) {
  // debug(`Loading JSON config file: ${filePath}`);

  try {
    return JSON.parse(stripComments(readFile(filePath)));
  } catch (e) {
    // debug(`Error reading JSON file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    e.messageTemplate = 'failed-to-read-json';
    e.messageData = {
      path: filePath,
      message: e.message,
    };
    throw e;
  }
}

/**
 * Loads a JavaScript configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
function loadJSConfigFile(filePath) {
  // debug(`Loading JS config file: ${filePath}`);
  try {
    return importFresh(filePath);
  } catch (e) {
    // debug(`Error reading JavaScript file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a configuration from a package.json file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
function loadPackageJSONConfigFile(filePath) {
  // debug(`Loading package.json config file: ${filePath}`);
  try {
    return loadJSONConfigFile(filePath)['clean-env'] || null;
  } catch (e) {
    // debug(`Error reading package.json file: ${filePath}`);
    e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
    throw e;
  }
}

/**
 * Loads a configuration file regardless of the source. Inspects the file path
 * to determine the correctly way to load the config file.
 * @param {Object} file The path to the configuration.
 * @returns {Object} The configuration information.
 * @private
 */
function loadConfigFile(filePath) {
  let config;

  switch (path.extname(filePath)) {
    case '.js':
      config = loadJSConfigFile(filePath);
      break;

    case '.json':
      if (path.basename(filePath) === 'package.json') {
        config = loadPackageJSONConfigFile(filePath);
        if (config === null) {
          return null;
        }
      } else {
        config = loadJSONConfigFile(filePath);
      }
      break;

    case '.yaml':
    case '.yml':
      config = loadYAMLConfigFile(filePath);
      break;
    default:
      config = {};
  }

  return config;
}

/**
 * Checks whether the given filename points to a file
 * @param {string} filename A path to a file
 * @returns {boolean} `true` if a file exists at the given location
 */
function isExistingFile(filename) {
  try {
    return fs.statSync(filename).isFile();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

/**
 * Retrieves the configuration filename for a given directory. It loops over all
 * of the valid configuration filenames in order to find the first one that exists.
 * @param {string} directory The directory to check for a config file.
 * @returns {?string} The filename of the configuration file for the directory
 *      or null if there is no configuration file in the directory.
 */
function getFilenameForDirectory(directory) {
  return CONFIG_FILES.map(filename => path.join(directory, filename)).find(isExistingFile) || null;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Get the Config for the given directory.
   *
   * @param {string} directory The directory to check for a config file.
   */
  getConfig(directory) {
    const configFile = getFilenameForDirectory(directory);

    if (configFile != null) {
      const loadedConfig = loadConfigFile(configFile);
      if (loadedConfig != null) {
        return merge(DEFAULT_CONFIG, loadedConfig);
      }
    }

    return DEFAULT_CONFIG;
  },
};

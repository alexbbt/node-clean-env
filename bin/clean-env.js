#!/usr/bin/env node
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

const configFile = require('../lib/config-file');

// The root where the script was run.
const rootDir = process.cwd();

// The config (project config merged with default).
const config = configFile.getConfig(rootDir);

if (config.dotenv) {
  // Load the env values from the file.
  dotenv.config({
    path: path.resolve(rootDir, config.dotenv),
  });
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

const missingRequired = config.required
  .filter(key => process.env[key] == null)
  .map(key => ({
    name: key,
  }));


const foundExcluded = config.excluded
  .filter(key => process.env[key] != null)
  .map(key => ({
    name: key,
    value: process.env[key],
  }));

let safe = true;

if (missingRequired.length > 0) {
  safe = false;
  console.log();
  console.log(config.translations.missingRequired);
  console.table(missingRequired);
}

if (foundExcluded.length > 0) {
  safe = false;
  console.log();
  console.log(config.translations.foundExcluded);
  console.table(foundExcluded);
}

if (!safe) {
  (async function check() {
    console.log();
    console.log(config.translations.errorStatement);
    // Trailing space for input.
    const answer = await askQuestion(`${config.translations.errorQuestion} `);
    if (answer === config.translations.yes) {
      process.exit(0);
    }
    process.exit(1);
  }());
}

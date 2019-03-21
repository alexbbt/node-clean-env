# clean-env

[![NPM](https://nodei.co/npm/clean-env.png?compact=true)](https://nodei.co/npm/clean-env/)

Ensure the correct env variables are being used for production builds

## Installation

``` bash
npm install clean-env --save-dev
```

## Usage

### Config

Create a JavaScript, JSON or YAML file, or skip the config an embed in the `package.json` file under the key `clean-env`.

If you make a file, it must be one of the following names and stored in the root of the project folder:

- `.clean-env.js`
- `.clean-env.json`
- `.clean-env.yaml`
- `.clean-env.yml`

Then add any key to over write these defaults:

``` JSON
{
    "required": [],
    "excluded": [],
    "dotenv": ".env",
}
```

### dotenv

If you need to privide an alternative path to your `.env` file, then over write the `dotenv` key in the config with the correct name, relative to the root of the project.

``` JS
{
    dotenv: './config/.env'
}
```

If you would like to not load the `.env` file before checking the ENV for variables, then change the `dotenv` key to `false`.

``` YAML
dotenv: false
```

### Translations

If you require a translated version of this script or would like to change the wording of any of the error messages, then add a `translations` key to the config and over write any of these defaults:

``` YML
translations:
    missingRequired: "Clean ENV did not find the following required ENV variables."
    foundExcluded: "Clean ENV has found the following excluded ENV variables in the ENV."
    errorStatement: "Your ENV is not in a clean state."
    errorQuestion: "Are you sure you want to continue with the build? (y)"
    yes: "y"
```

## Contributing

1. Fork it on Github [https://github.com/alexbbt/node-clean-env](https://github.com/alexbbt/node-clean-env)
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request against the development branch :D

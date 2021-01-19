# d2l-cpd

[![Release Badge](https://github.com/Brightspace/continuous-professional-development/workflows/release/badge.svg)](https://github.com/Brightspace/continuous-professional-development/actions?query=workflow%3Arelease)

Continuous Professional Development FRA and BSI Customization

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies.

If you don't have it already, install the [Polymer CLI](https://www.polymer-project.org/3.0/docs/tools/polymer-cli) globally:

```shell
npm install -g polymer-cli
```

[ci-url]: https://travis-ci.com/BrightspaceUI/cpd
[ci-image]: https://travis-ci.com/BrightspaceUI/cpd.svg?branch=master

### Running the demos

To start a [local web server](https://www.polymer-project.org/3.0/docs/tools/polymer-cli-commands#serve) that hosts the demo page and tests:

```shell
polymer serve
```

To run the FRA in your local LMS instance:

```shell
npm run watch
```

### Testing

To lint:

```shell
npm run lint
```

To run local unit tests:

```shell
npm run test:local
```

To run a subset of local unit tests, modify your local [index.html](https://github.com/BrightspaceUI/cpd/blob/master/test/index.html), or start the dev server and navigate to the desired test page.



To run linting and unit tests:

```shell
npm test
```

## Versioning, Releasing & Deploying

All version changes should obey [semantic versioning](https://semver.org/) rules.

Include either `[increment major]`, `[increment minor]` or `[increment patch]` in your merge commit message to automatically increment the `package.json` version, create a tag, and trigger a deployment to NPM.

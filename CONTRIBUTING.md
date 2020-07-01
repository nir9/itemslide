### Issues

Please provide jsFiddle examples as well when reporting bugs.

### Pull requests

1. Please make your changes to the plugin code in the `/src` files, and not in the `/dist` files.
2. To test your code use `/testing/index.html`.
3. Keep your pull request simple and avoid doing any unintended changes.
4. Don't commit any changes to `/dist/itemslide.min.js`

This project is built using Browserify so if you want to contribute make sure you have a basic understanding of it.

#### Building

Before starting make sure you have Node.js installed on your system.

First install the devDependencies by typing-

```bash
npm install
```

You can use watch so that itemslide will be built as you make changes to the `/src` files:

```bash
npm run-script watch
```

Or manually build the project using:

```bash
npm run-script testing-build
```

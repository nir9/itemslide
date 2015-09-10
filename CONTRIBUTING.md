### Pull requests

1. Please do the changes to the plugin code in the `/src` files, and not in the `/dist` files.
2. To test your code use `/tests/index.html`.
3. Keep your pull request simple and avoid doing any unintended changes.
4. Don't change `/dist/itemslide.min.js`, only run grunt `watch` or `test`.


This project is built using Browserify so if you want to contribute make sure you have a basic understanding of it.

#### Building using Grunt

Before starting make sure you have Node.js and grunt-cli installed on your system.

First install the devDependencies (so you can use Grunt) by typing-

```bash
npm install
```

You can use watch so that grunt will build as you do changes to the `/src` files:

```bash
grunt watch
```


Or manually build the project using:

```bash
grunt test
```
#### All contributions are welcome with the following guidelines:

1. Please do the changes to the plugin code in the /src files, and not in the /dist files.
2. To test your code use /tests.



#### Building using Grunt

You can build the src files into dist files using Grunt-

Before starting make sure you have Node.js and grunt-cli installed on your system.

First install the devDependencies (so you can use Grunt) by typing-

```bash
npm install
```

Afterwards you can build the project just by typing

```bash
grunt uglify
```
# [CommonJS vs. ES Modules: Modules and Imports in NodeJS](https://reflectoring.io/nodejs-modules-imports/)

Since the very beginning of NodeJS, the CommonJS module system is the default module system within the ecosystem. 
However, recently a new module system was added to NodeJS - ES modules.


## CommonJS: The Default NodeJS Module System

- In NodeJS each .js file is handled as a separate CommonJS module. 
- Variables, functions, classes, etc. are not accessible to other files by default.
- You need to explicitly tell the module system which parts of your code should be exported.
- This is done via the module.exports object or the exports shortcut, which are both available in every CommonJS module. 
- Whenever you want to import code into a file, you use the require() function.


#### Importing Core NodeJS Modules
```js
// Without writing or installing any module, you can just start by importing any of NodeJS’s built-in modules:

const http = require("http");

const server = http.createServer(function (_req, res) {
  res.writeHead(200);
  res.end("Hello, World!");
});
server.listen(8080);
```

#### Importing NPM Dependencies

```js
// The same way, we can import and use modules from NPM packages (i.e. from the node_modules folder)
const chalk = require("chalk"); // don't forget to run npm install

console.log(chalk.blue("Hello world printed in blue"));
```


#### Exporting and Importing Your Own Code
```js
// logger.js
const chalk = require("chalk");

exports.logInfo = function (message) { // adding to the existing exports object, which makes them accessible to other modules.
    console.log(chalk.blue(message));
};

exports.logError = function logError(message) { // adding to the existing exports object, which makes them accessible to other modules.
    console.log(chalk.red(message));
};

exports.defaultMessage = "Hello World"; // exports can have various types

```

- require() now receives a relative file path and returns whatever was put into the exports object.
```js
// index.js

const logger = require("./logger");

logger.logInfo(`${logger.defaultMessage} printed in blue`);
logger.logError("some error message printed in red");
```

#### Using module.exports Instead of exports
- The exports object is read-only, which means it will always remain the same object instance and cannot be overwritten.
- However, it is only a shortcut to the exports property of the module object. 


- instead of assigning functions directly to an object, we first declare everything and then create our own object, which is assigned to module.exports.
```js
// logger.js
const chalk = require("chalk");

function info(message) {
  console.log(chalk.blue(message));
}

function error(message) {
  console.log(chalk.red(message));
}

const defaultMessage = "Hello World";

module.exports = {
  logInfo: info,
  logError: error,
  defaultMessage,
};

```


#### Where Do module.exports and require() Come From?
> At first glance it may seem like module.exports, exports and require are global, actually they are not. 
> CommonJS wraps your code in a function like this:

```js
(function(exports, require, module, __filename, __dirname) {
    // your code lives here
});
// This way, those keywords are always module specific.
```


#### Importing Only Specific Properties
```js
// index.js
const { logError } = require("./logger");

logError("some error message printed in red");
// This basically says “give me the property logError of the logger object and assign it a local constant with the same name”
```


#### Exporting Not Only Objects
- We can assign any type to module.export. For example, we can rewrite our logger to be a class.
```js
// logger.js
const chalk = require("chalk");

class Logger {
  static defaultMessage = "Hello World";

  static info(message) {
    console.log(chalk.blue(message));
  }

  static error(message) {
    console.log(chalk.red(message));
  }
}

module.exports = Logger;

// - As we changed the function names a bit, we need to modify our index file
// index.js
const Logger = require("./logger");

Logger.info(`${logger.defaultMessage} printed in blue`);
Logger.error("some error message printed in red");

```


## ES Modules: The ECMAScript Standard
So, why would we need another option for imports?
CommonJS was initially chosen to be the default module system for NodeJS. 
At this time there was no such thing as a built-in module system in JavaScript.

Since the 2015 edition of the underlying ECMAScript standard (ES2015) we actually have a 
standardized module system in the language itself, which is simply called ES Modules.


#### Export with ES Modules

To preserve comparability, we stay with our logging example. 
We need to rewrite our Logger class to .mjs filetype
```js
// logger.mjs
import chalk from "chalk";

export class Logger {
  static defaultMessage = "Hello World";

  static info(message) {
    console.log(chalk.blue(message));
  }

  static error(message) {
    console.log(chalk.red(message));
  }
}
```

#### Import with ES Modules
We need to change our index file as well:

```js
// index.mjs
import { Logger } from "./logger.mjs";

Logger.info(`${Logger.defaultMessage} printed in blue`);
Logger.error("some error message printed in red");

```

#### Exports vs. Default Exports

```js
// If we put the default keyword behind any export, we basically say “treat this as the thing every module gets, if it doesn’t ask for something specific”
export default class Logger {...}

// and then import works like this:
import Logger from "./logger.mjs";
```

#### Named Imports

```js

// Now we export two declarations from our file: defaultMessage and Logger, none of them is a default export. 

// logger.mjs
import chalk from "chalk";

export const defaultMessage = "Hello World";

export class Logger {
  static info(message) {
    console.log(chalk.blue(message));
  }

  static error(message) {
    console.log(chalk.red(message));
  }
}


// We can simply say “give me everything the module exports and give it the namespace xyz”.

// index.mjs
import * as LoggerModule from "./logger.mjs"

LoggerModule.Logger.info(`${LoggerModule.defaultMessage} printed in blue`);
LoggerModule.Logger.error("some error message printed in red");

```
>  Often we see this syntax as a **fallback solution for imports from non ES Modules** files.


#### Named Default Imports
```js
// The default import we used above actually is also a named import:
import Logger from "./logger.mjs";

// Under the hood, this is a shortcut for:
import { default as Logger } from "./logger.mjs";
```



### Importing CommonJS Modules from ES Modules
NodeJS allows us to import CommonJS modules from ES Modules.

```js
// index.mjs
import Logger from "./logger.js";

Logger.info(`${Logger.defaultMessage} printed in blue`);
Logger.error("some error message printed in red");

// In this case, module.exports is simply treated as the default export which you might import as such.
```


## Differences Between CommonJS and ES Modules

### File Extensions
- all of our ES modules imports we explicitly added the file extension to all file imports. 
  This is mandatory for ES Modules (as opposed to e.g. CommonJS, Webpack or TypeScript).
- Files with the .js extension will be treated as CommonJS modules
- Files with the .mjs extension are treated as ES Modules.
- You can configure your NodeJS project to use ES Modules as the default module system.  
  [NodeJS documentation on file extensions](https://nodejs.org/api/packages.html#packagejson-and-file-extensions)


### Dynamic vs. Static
The two module systems do not only have a different syntax. They also differ in the way how imports and exports are treated.

**CommonJS** 
- imports are dynamically resolved at runtime. The require() function is simply run at the time our code executes. 
- As a consequence, you can call it everywhere in your code.

**ES Modules** 
- imports are static, which means they are executed at parse time. This is why imports are “hoisted”. 
- They are implicitly moved to the top of the file. 
- Therefore, we cannot use the import syntax we have seen above just in the middle of your code. 
- The upside of this is that errors can be caught upfront and developer tools can better support us with writing valid code.


### When to Use Which?
- If you are starting a new project, use ES Modules. It has been standardized for many years now. 
  NodeJS has stable support for it since version 14, which was released in April 2020.

- If you are maintaining an existing NodeJS project which uses CommonJS.  
  - You can continue using it as CommonJS is still the default module system of NodeJS.
  - Or you might migrate to the ES Modules syntax while using CommonJS under the hood

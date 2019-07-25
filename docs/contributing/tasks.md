# NPM and Gulp tasks

This document describes the NPM scripts that run the application, and the gulp tasks they trigger to build files, update the package, copy assets and watch for changes.

To run the application without any tasks being triggered, see [Express app only](#express-app-only).

## NPM script aliases

NPM scripts are defined in `package.json`. These trigger a number of gulp tasks.

**`npm run start` will trigger `gulp dev` that:**
- cleans the `public` folder
- compiles component nunjucks files to `public`
- copies icons to `public`
- compile sass files, add vendor prefixes and copy to `public`
- starts up the Express server and app
- starts up `gulp watch` task to watch for changes

**`npm run test` will do the following:**
- compile components to HTML
- run JS tests
- run CSS lint checker
- run accessibility tests on HTML files
- run tests on the review application

**`npm run heroku` runs on Heroku build/PR and it:**
- compiles components' HTML
- compiles CSS & JS
- starts up Express

**`npm run build:package` will do the following:**
- compile component nunjucks to HTML
- copy template, macro and component.njk files for each component
- copy Sass files, add vendor prefixes and replace path to be node_modules consumption compliant
- runs `npm run test:build:package` (which will test the output is correct)

**`npm run build:dist` will do the following:**
- copy JS
- copy icons
- copy SASS and add vendor prefixes
- compile component nujucks files to HTML
- take version from 'all/package.json' and append it to compiled & minified JS and CSS files
- runs `npm run test:dist:package` (which will test the output is correct)

## Gulp tasks

Gulp tasks are defined in `gulpfile.js` and .`/tasks/gulp/` folder.

**`gulp default` or just `gulp`**

This task will:
- list out all available tasks

**`gulp test`**

This task will:
- Run scss:lint

**`gulp watch`**

This task will:
- watch for changes in .js, .scss and .njk files and run below tasks.

**`gulp styles`**

This task will:
 - run sass lint task (`gulp scss:lint`)
 - sass compilation (`gulp scss:compile`) to a destination folder that can be specified via a --destination flag

**`gulp scripts`**

 This task will:
 - concatenate and uglify javascript (`gulp js:compile`) to a destination folder that can be specified via a --destination flag

**`gulp compile:components`**

  This task will:
  - compile all `src/components/componentName/componentName.njk` files to HTML files

**`gulp lint`**

  Is an umbrella task that will run:
  - `gulp scss:lint`

## Express app only

To simply run the Express app without gulp tasks being triggered, simply run `node app/start.js`.

# citation-grabber

Automatically download your bookmarked citations from Google Scholar in BibTex format.

## Prerequisites

[Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/package/install) is installed.

## Installation

* Download or clone this repo
* navigate to its folder in a terminal
* run:

  ```shell
  npm install
  ```

## Configuration

Duplicate the file [config.js.sample](https://github.com/dmstern/citation-grabber/blob/master/config.js.sample), remove the `.sample` suffix and configure the parameters for your needs.

## Usage

### In a terminal

```shell
npm start
```

### In TexStudio

* Create a new macro ("macros" > "edit macros...")
* Click on "Add"
* Name it
* At "Type" select "Script"
* Latex Content: Fill in this script:

  **_Windows:_**

  ```js
  %SCRIPT
  system("npm.cmd start", workingDirectory="[path-to-citation-grabber]")
  ```

  _(Example:)_

  ```js
  %SCRIPT
  system("npm.cmd start", workingDirectory="C:/Users/morge/projects/citation-grabber/")
  ```

  **_Linux:_**

  ```js
  %SCRIPT
  system("npm start", workingDirectory="/home/dmstern/projects/citation-grabber")
  ```

Now you can pull the your newest Google Scholar catations right from TeXStudio by pressing Shift+F[NumberOfMacro].

## Troubleshooting

* Sometimes you have to run the script several times until it works.
* If you want to see, what citation-grabber is actually doing, run

  ```shell
  npm run start:dev
  ```

If this does not solve the problem, please file a bug at [GitHub issues](https://github.com/dmstern/citation-grabber/issues?q=is%3Aopen).

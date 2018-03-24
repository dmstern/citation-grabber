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

## Usage

* Duplicate the file [cred.js.sample](cred.js.sample), remove the `.sample` suffix and fill in your Google login credentials.

  _Don't worry about privacy if you want to contribute to this project: the `cred.js` file is in `.gitignore`. ;)_

* Then run

  ```shell
  npm start
  ```

## Configuration

See [config.js](config.js).

## Known Issues

see [issues](https://github.com/dmstern/citation-grabber/issues?q=is%3Aopen).

#!/usr/bin/env node
/* eslint-disable no-sync */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable callback-return */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DEST_DIR = path.join(__dirname, '../dist');
const DEST_ZIP_DIR = path.join(__dirname, '../dist-zip');

const extractExtensionData = () => {
  const extPackageJson = require('../package.json');

  return {
    name: extPackageJson.name,
    version: extPackageJson.version,
  };
};

const makeDestZipDirIfNotExists = () => {
  if(!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR);
  }
};

function zipFolder(srcFolder, zipFilePath, callback) {
  const output = fs.createWriteStream(zipFilePath);
  const zipArchive = archiver('zip');

  output.on('close', function() {
    callback();
  });

  zipArchive.on('warning', function(err) {
    throw err;
  });
  zipArchive.on('error', function(err) {
    throw err;
  });

  zipArchive.pipe(output);

  zipArchive.directory(srcFolder, false);

  zipArchive.finalize();
}


const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${ zipFilename }...`);

  return new Promise((resolve, reject) => {
    zipFolder(src, path.join(dist, zipFilename), err => {
      if(err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
};

const main = () => {
  const zipName = process.argv[2];
  const { name, version } = extractExtensionData();
  const zipFilename = zipName ? `${ zipName }.zip` : `${ name }-v${ version }.zip`;

  makeDestZipDirIfNotExists();

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    // eslint-disable-next-line promise/prefer-await-to-then
    .then(() => console.info('OK'))
    .catch(console.err);
};

main();

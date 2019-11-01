#!/usr/bin/env node
/* eslint-disable promise/prefer-await-to-callbacks */

const path = require('path');
const fs = require('fs');

const manifestPath = path.join(__dirname, '../src/manifest.json');

// example "version": "3.4.11"
const versionRegex = /"version"\: "(\d+\.\d+\.\d+)"/;

const toBump = process.argv[2];

const bump = num => {
  let x = Number(num);

  return ++x;
};

const updateVersion = file => {
  console.info(`updating '${ toBump }' in '${ file }'.`);

  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if(err) {
        reject(err);
        return;
      }

      if(!versionRegex.test(data)) {
        reject(`No version found in ${ file }.`);
        return;
      }

      const match = versionRegex.exec(data);
      const version = match[1];
      const split = version.split('.');

      let major = split[0];

      let minor = split[1];

      let patch = split[2];

      switch(toBump) {
        case 'major':
          major = bump(major);
          minor = 0;
          patch = 0;
          break;

        case 'minor':
          minor = bump(minor);
          patch = 0;
          break;

        case 'patch':
          patch = bump(patch);
          break;

        default:
          throw new Error('wrong argument');
      }

      data = data.replace(versionRegex, `"version": "${ major }.${ minor }.${ patch }"`);

      fs.writeFile(file, data, err2 => {
        if(err2) {
          reject(err2);
          return;
        }

        resolve();
      });
    });
  });
};

const main = () => {
  updateVersion(manifestPath);
};

main();

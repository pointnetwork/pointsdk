#!/usr/bin/env node

// - Leverages `npm version` script which creates a new tag
// - Updates package.json, adding this new version
// - And changes the version in .env file
// - Pushes the tag to the repository
// A new docker image will be built with Github Actions after that

// todo: Currently, the image rebuilding action is triggered on *any* tag being pushed from any branch

const version = process.argv[2];

if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
        `Unsupported version format: "${version}". ` +
            `Please provide a unique sequence of major, minor and build version identifiers.`
    );
}

const manifestFile = 'manifest.json';
const manifestFilePath = require('path').resolve(__dirname, '..', 'src', manifestFile);
const {execSync} = require('child_process');

try {
    execSync(`sed -i '' 's/"version":.*$/"version": "${version}",/' ${manifestFilePath}`).toString();

    if (execSync('git diff --name-only').toString().includes(manifestFile)) {
        execSync(`git add ${manifestFilePath} && git commit -m 'Update manifest version'`).toString();
    }
    execSync(`npm version ${version}`).toString();
    execSync(`git push && git push origin v${version}`).toString();
    console.info(`Successfully pushed new addon version "v${version}".`);
} catch (e) {
    console.error(
        (e.stderr && e.stderr.toString()) || (e.stdout && e.stdout.toString()) || e.toString()
    );
    throw e;
}

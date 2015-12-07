#! /usr/bin/env node

'use strict';

if (process.argv.length < 3) {
    console.log("Usage: j <File.java> <args...>")
    return 0;
}

const filename = process.argv[2];
const shortname = filename.split('.')[0];
let cp;

const exec = require('child_process').execSync;
const fs = require('fs');
const crypto = require('crypto');
const sha1 = crypto.createHash('sha1');

const hotbrewDir = getUserHome() + '/.hotbrew';
if (!fs.existsSync(hotbrewDir)) {
    fs.mkdirSync(hotbrewDir);
}

const caches = hotbrewDir + '/caches/'; 
if (!fs.existsSync(caches)) {
    fs.mkdirSync(caches);
}

const file = fs.readFileSync(filename, "utf8");

sha1.update(file);
const cacheDir = caches + sha1.digest('hex') + '/';
console.log("** Script cache dir is " + cacheDir);
if (fs.existsSync(cacheDir)) {
    console.log("** Skipping dependency resolving");
    cp = buildCp();
    if (!fs.existsSync(cacheDir + shortname + '.class'))
        compile();
} else {
    fs.mkdirSync(cacheDir);
    resolveDeps();
    cp = buildCp();
    compile();
}

const out = run(process.argv.slice(3));
console.log(out.toString('utf8'));

function buildCp() {
    let cp = cacheDir;
    let path = cacheDir + 'cp.txt';
    if (fs.existsSync(path))
        cp += ':' + fs.readFileSync(path, 'utf8');
    return cp;
}

function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE;
}

function compile() {
    let cmd = 'javac ' + filename + ' -d ' + cacheDir + ' -cp "' + cp + '"';
    exec(cmd);
}

function run(args) {
    let cmd = 'java  -cp "' + cp + '" ' + shortname + ' ' + args.join(' ');
    return exec(cmd);
}

function createPom(deps) {
    let dependencies = deps.map(i =>
    `
    <dependency>
        <groupId>${i['groupId']}</groupId>
        <artifactId>${i['artifactId']}</artifactId>
        <version>${i['version']}</version>
    </dependency>`)
    .join('');

    return `
<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                      http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
   <groupId>hotbrew</groupId>
  <artifactId>a-script</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>
  <dependencies>
    ${dependencies}
  </dependencies>
</project>
    `;
}

function parseDeps() {
    console.log('** Searching for dependencies...');
    const re = /(?:\/\*\*\*)([\s\S]*)(?:\*\/)/m;
    const m = file.match(re);
    if (m) {
        const deps = eval(m[1]).map(i => {
            const parts = i.split(':');
            return {
                'groupId': parts[0],
                'artifactId': parts[1],
                'version': parts[2]
            }
        });
        console.log('** ' + deps.length + ' dependencies found');
        return deps;
    }
    console.log('** No dependencies found.');
}

function resolveDeps() {
    const deps = parseDeps();
    if (!deps) return;

    const pom = createPom(deps);
    fs.writeFileSync(cacheDir + 'pom.xml', pom);
    console.log('** Resolving dependencies...');
    exec('cd ' + cacheDir + '&& mvn dependency:build-classpath -Dmdep.outputFile="' + cacheDir + 'cp.txt"');
    console.log('** Done.');
}

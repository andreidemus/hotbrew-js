#! /usr/bin/env node

'use strict';

if (process.argv.length < 3) {
	console.log("Usage: j <File.java> <args...>")
	return 0;
}

const filename = process.argv[2];

const exec = require('child_process').execSync;
const fs = require('fs');

function compile(filename, cp) {
	let cmd = 'javac ' + filename + ' -cp "./:' + cp + '"';
	exec(cmd);
}

function run(filename, args, cp) {
	const shortname = filename.split('.')[0];
	let cmd = 'java  -cp "./:' + cp + '" ' + shortname + ' ' + args.join(' ');
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

function parseDeps(filename) {
	console.log('** Searching for dependencies...');
	const re = /(?:\/\*\*\*)([\s\S]*)(?:\*\/)/m;
	const file = fs.readFileSync(filename, "utf8");
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

function resolveDeps(filename) {
	const deps = parseDeps(filename);
	if (!deps) return;

	const pom = createPom(deps);
	fs.writeFileSync('pom.xml', pom);
	console.log('** Resolving dependencies...');
	exec('mvn dependency:build-classpath -Dmdep.outputFile="cp.txt"');
	console.log('** Done.');
}

resolveDeps(filename);
const cp = fs.readFileSync('cp.txt', 'utf8');
compile(filename, cp);
const out = run(filename, process.argv.slice(3), cp);
console.log(out.toString('utf8'));

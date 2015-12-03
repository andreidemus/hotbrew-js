#! /usr/bin/env node

'use strict';

if (process.argv.length < 3) {
	console.log("Usage: j <File.java> <args...>")
	return 0;
}

const repo = 'http://repo.maven.apache.org/maven2/';

const filename = process.argv[2];

const exec = require('child_process').execSync;
const fs = require('fs');

function compile(filename) {
	exec('javac ' + filename);
}

function run(filename, args) {
	const shortname = filename.split('.')[0];
	const cmd = 'java ' + shortname + ' ' + args.join(' ');
	return exec(cmd);
}

function resolveDeps(filename) {
	const re = /(?:\/\*\*\*)([\s\S]*)(?:\*\/)/m;
	const file = fs.readFileSync(filename, "utf8");
	const m = file.match(re);
	if (m != null) {
		const deps = eval(m[1]);
		deps.forEach(d => {
			let path = repo + pathFromDep(d);
			console.log(path);
			//todo
		});		
	}
}

function pathFromDep(str) {
	const parts = str.split(':');
	const group = parts[0];
	const name = parts[1];
	const ver = parts[2];

	const path = group.split('.').join('/');
	return path + '/' + name + '/' + ver + '/' + name + '-' + ver + '.jar';
}


resolveDeps(filename);
compile(filename);
const out = run(filename, process.argv.slice(3));
console.log(out.toString('utf8'));

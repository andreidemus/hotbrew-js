#! /usr/bin/env python3

import sys
import subprocess
import re

def compile(filename):
	file = open(filename)
	code = file.read()
	file.close()
	m = re.search('(?<=\/\*\*\*).*(?=\*\/)', code, re.DOTALL)
	if m:
		deps = eval(m.group(0))
		print(deps)

	subprocess.call(["javac", filename])
	return;

def run(filename, args):
	simplename = filename.split('.')[0]
	args.insert(0, simplename)
	args.insert(0, "java")
	subprocess.call(args)
	return;

if __name__ == "__main__":
	if len(sys.argv) < 2:
		print("Usage: j <File.java>")
	else:
		filename = sys.argv[1]
		compile(filename)
		run(filename, sys.argv[2:])

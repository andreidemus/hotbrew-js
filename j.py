#! /usr/bin/env python

import sys
import subprocess

if __name__ == "__main__":
	if len(sys.argv) < 2:
		print("Usage: j <File.java>")
	else:
		filename = sys.argv[1]
		subprocess.call(["javac", filename])
		args = sys.argv[2:]
		simplename = filename.split('.')[0]
		args.insert(0, simplename)
		args.insert(0, "java")
		subprocess.call(args)

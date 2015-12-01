#!/bin/bash

if [ $1 ]; then
	filename=$1
	#compile
	javac $filename

	#drop extension
	filename="${filename%.*}"

	#drop filename from args
	args=($@)
	args=("${args[@]:1}")

	#run
	java $filename ${args[@]}
else	
	echo "Usage: j <Filename.java>"
fi
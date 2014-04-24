#!/bin/sh

NODE_VERSION="0.10.25"
BUILD_DIR=`pwd`

#detect plateform
platform='unknown'
unamestr=`uname`
if test "$unamestr" = 'Linux' ; then
   platform='linux'
elif test "$unamestr" = 'Darwin' ; then
   platform='darwin'
elif test "$unamestr" = 'SunOS' ; then
   platform='sunos'
fi

#detect machine type
MACHINE_TYPE=`uname -m`
if test ${MACHINE_TYPE} = 'x86_64' ; then
  NODE_ARCHI="x64"
else
  NODE_ARCHI="x86"
fi


NODE_FOLDER="node-v${NODE_VERSION}-${platform}-${NODE_ARCHI}"
NODE_ARCHIVE="${NODE_FOLDER}.tar.gz"
NODE_URL="http://nodejs.org/dist/v${NODE_VERSION}/${NODE_ARCHIVE}"


if [ ! -f "${NODE_ARCHIVE}" ]; then
	echo 'downloading nodejs'
	rm -rf "${NODE_FOLDER}"
	wget $NODE_URL || exit 1
	tar zxf "${NODE_ARCHIVE}"
	mv "${NODE_FOLDER}" nodejs
fi
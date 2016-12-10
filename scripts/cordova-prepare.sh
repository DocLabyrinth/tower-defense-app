#!/bin/bash -xe

BASEDIR=$(dirname "$0")
CORDOVA_BASE="$BASEDIR/../TowerDefenseGame/www/"

npm run build

mkdir -p "$CORDOVA_BASE/static"
mkdir -p "$CORDOVA_BASE/images"

cp index.html "$CORDOVA_BASE/"
cp -r dist/* "$CORDOVA_BASE/static"
cp -r images/* "$CORDOVA_BASE/images"

#!/bin/bash
setversion=$1
# set the version

# Get the current version
currentversion=$(cat ./displayhtmlreport/task.json | grep "Patch" | tr -dc '0-9')
echo "Current version: $currentversion"
# Bump the version
newversion=$(($setversion))
echo "Bumped version: $newversion"

# Patch versions
#   MACOS `sed` has a different a parameter it requires a `""`
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Patching ./displayhtmlreport/task.json"
    sed -i "" "s/\"Patch\":.*/\"Patch\": $newversion/g" "./displayhtmlreport/task.json"

    echo "Patching ./vss-extension.json"
    sed -i "" "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./vss-extension.json"

    echo "Patching package.json"
    sed -i "" "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./package.json"
    sed -i "" "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./displayhtmlreport/package.json"
else
    echo "Patching ./displayhtmlreport/task.json"
    sed -i "s/\"Patch\":.*/\"Patch\": $newversion/g" "./displayhtmlreport/task.json"

    echo "Patching ./vss-extension.json"
    sed -i "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./vss-extension.json"

    echo "Patching package.json"
    sed -i "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./package.json"
    sed -i "s/\"version\":.*/\"version\": \"1.2.$newversion\",/g" "./displayhtmlreport/package.json"
fi

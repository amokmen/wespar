#!/bin/bash

# Workaround for buggy behavior
# Change '### [' to '## ['

# DIR="/home/amok/wesnoth_chat_parser"
DIR="./"

echo "Start changing ### to ##"
sed -r -e 's/^#{1,3} \[/## [/' -i $DIR/CHANGELOG.md

echo "Change \n### --> ###"
sed -z -r 's/\n#{3}/###/' -i $DIR/CHANGELOG.md

exit 0

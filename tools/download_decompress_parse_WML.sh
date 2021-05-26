#!/bin/bash

# Script for fast testing: download server replay, decompress, parse
# Show file sizes for each stage

FILENAMECOMPRESSED="2p__Weldyn_Channel_Turn_14_155976.bz2"
FILENAMEDECOMPRESSED="2p__Weldyn_Channel_Turn_14_155976"

# http://replay.wesnoth.org/1.14/2021/03/22/2p__Weldyn_Channel_Turn_14_(155976).bz2
# http://replays.wesnoth.org/1.14/2021/04/25/2p__Caves_of_the_Basilisk_Turn_8_(25945).bz2
URL="http://replay.wesnoth.org/1.14/2021/03/22/2p__Weldyn_Channel_Turn_14_(155976).bz2"
PARSER="/mnt/c/Users/amok/wesnoth_replay_chat_parcer/temp/wesnoth/data/tools/wesnoth/wmlparser3.py"
ARGS="--to-json -i ./$FILENAMEDECOMPRESSED"

# Download compressed server replay at current directory
wget -q -O $FILENAMECOMPRESSED $URL
echo "$FILENAMECOMPRESSED size: $(ls -l $FILENAMECOMPRESSED | awk '{print $5}') bytes"

# Decompress, with auto removing compressed file
bzip2 -d $FILENAMECOMPRESSED
echo "$FILENAMEDECOMPRESSED size: $(ls -l $FILENAMEDECOMPRESSED | awk '{print $5}') bytes"

# Run python3 parser with arguments and output result to .json file
$PARSER $ARGS > ./$FILENAMEDECOMPRESSED.json
echo "$FILENAMEDECOMPRESSED.json size: $(ls -l $FILENAMEDECOMPRESSED.json | awk '{print $5}') bytes"

exit 0

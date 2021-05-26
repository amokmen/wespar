#!/bin/bash

APP_URL="https://wespar.herokuapp.com"
ENDPOINT="/url"

curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"urlFileForParsing":"https://replays.wesnoth.org/1.14/2021/03/22/2p__Weldyn_Channel_Turn_14_(155976).bz2"}' \
     $APP_URL$ENDPOINT

exit 0

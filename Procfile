web: PORT=$PORT node ./index.js | npx pino-syslog --tz $TIMEZONE --appname wespar | npx pino-socket --address $RSYSLOG_SERVER_IP --port 4514 --mode udp

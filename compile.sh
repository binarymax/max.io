#!/bin/bash
wintersmith build --output compiled
git add compiled/**/*
git add --a
suffix=$(date +%s)
commitname=static$suffix
git commit -m $commitname
git push origin master
ssh -i ~/aws/RSVP.pem ubuntu@maxirwin.com "./gitblog.sh"

#!/bin/bash
wintersmith build --output compiled
git add contents/**/*
git add compiled/**/*
suffix=$(date +%s)
commitname=static$suffix
git commit -m $commitname
git push origin master
ssh ubuntu@max.io "./gitblog.sh"

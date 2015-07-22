#!/bin/bash
wintersmith build --output compiled
git add compiled/**/*
git add --a
suffix=$(date +%s)
commitname=static$suffix
git commit -m $commitname
git push origin master
ssh ubuntu@max.io "./gitblog.sh"

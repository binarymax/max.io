#!/bin/bash
wintersmith build
mv build compiled
git add compiled
suffix=$(date +%s)
commitname=static$suffix
git commit -m $commitname
git push origin master
ssh ubuntu@max.io "./gitblog.sh"

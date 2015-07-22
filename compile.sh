#!/bin/bash
find . -name \*~ | xargs rm -rf
wintersmith build
mv build compiled
git add compiled
suffix=$(date +%s)
commitname=static$suffix
git commit -m '$commitname'
ssh ubuntu@max.io "./gitblog.sh"

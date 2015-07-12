#!/bin/bash
find . -name \*~ | xargs rm -rf
wintersmith build
mv build compiled
suffix=$(date +%s)
filename=blog$suffix.tar.gz
tar -zcf --exclude="*.gif" ./.releases/$filename compiled
scp ./.releases/$filename ubuntu@max.io:/home/ubuntu/
ssh ubuntu@max.io "./blog.sh '$filename'"

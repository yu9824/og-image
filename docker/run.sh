#!/bin/bash

# config
source $(dirname $0)/_config.sh

# run container
docker container run -it --rm \
    -p 3000:3000 \
    --mount type=bind,source="$SCRIPT_DIR",dst=/home/"$USER_NAME"/"$DIR_NAME" \
    --name $DIR_NAME yu9824/$DIR_NAME:latest /bin/bash
#!/bin/bash

# config
source $(dirname $0)/_config.sh

# build image
docker image build \
    --build-arg dir_name=$DIR_NAME \
    --build-arg user_name=$USER_NAME \
    -t yu9824/$DIR_NAME:latest $SCRIPT_DIR/docker
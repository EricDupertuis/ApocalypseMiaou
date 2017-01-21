#!/usr/bin/env fish

set RAW assets/raw
set PROD assets/prod

mkdir -p $RAW $PROD

# Background image

cp $RAW/background.jpg $PROD/background.jpg

convert $RAW/characters/lion.png -resize 75x50 $PROD/characters/lion.png

convert $RAW/enemies/helicopter.png -resize 200x150 $PROD/enemies/helicopter.png

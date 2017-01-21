#!/usr/bin/env fish

set RAW assets/raw
set PROD assets/prod

mkdir -p $RAW $PROD

# Background image

cp $RAW/background.jpg $PROD/background.jpg

convert $RAW/characters/lion.png -resize 150x100 $PROD/characters/lion.png

convert $RAW/enemies/helicopter.png -resize 200x150 $PROD/enemies/helicopter.png

convert $RAW/effects/explosion.png -resize 2048x1024 $PROD/effects/explosion.png

convert $RAW/effects/fireball.png -resize 163x98 $PROD/effects/fireball.png

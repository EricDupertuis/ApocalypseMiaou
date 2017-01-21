#!/usr/bin/env fish

set RAW assets/raw
set PROD assets/prod

mkdir -p $RAW $PROD

convert $RAW/characters/lion.png -resize 694x200 -gravity West -background none -extent 695x200  $PROD/characters/lion.png
convert $RAW/characters/tiger.png -resize 694x200 -gravity West -background none -extent 695x200  $PROD/characters/tiger.png

convert $PROD/characters/lion.png $PROD/characters/tiger.png -append $PROD/characters/combined.png

convert $RAW/enemies/helicopter.png -resize 200x150 $PROD/enemies/helicopter.png
convert $RAW/enemies/meteor.png -resize 288x150 -gravity East -background none -extent 288x150 $PROD/enemies/meteor.png
convert $RAW/enemies/bucheron.png -resize 600x200 $PROD/enemies/bucheron.png

convert $RAW/effects/explosion.png -resize 2048x1024 $PROD/effects/explosion.png
convert $RAW/effects/fireball.png -resize 159x32 -gravity East -background none -extent 159x32 $PROD/effects/fireball.png
convert $RAW/effects/missile.png -resize 257x36 $PROD/effects/missile.png

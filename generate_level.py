#!/usr/bin/env python3
"""
Generate a level background.
"""

import argparse
import yaml
import os.path
from PIL import Image


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("level", help="Level description in yaml.", type=argparse.FileType())
    parser.add_argument("output", help="Output image")

    return parser.parse_args()

def cumulative_size(images):
    widths, heights = zip(*(i.size for i in images))
    total_width = sum(widths)
    max_height = max(heights)

    return total_width, max_height

def main():
    args = parse_args()
    level = yaml.load(args.level)

    foregrounds = [Image.open(os.path.join(level['base_folder'], s['fg'])).convert('RGBA')
                   for s in level['tiles']]
    backgrounds = [Image.open(os.path.join(level['base_folder'], s['bg'])).convert('RGBA')
                   for s in level['tiles']]


    if cumulative_size(backgrounds) != cumulative_size(foregrounds):
        print("ERROR: backgrounds and foregrounds must be same size..")
        return

    output = Image.new('RGBA', cumulative_size(backgrounds))

    x_offset = 0
    for fg, bg in zip(foregrounds, backgrounds):
      output.paste(bg, (x_offset, 0), mask=bg)
      output.paste(fg, (x_offset, 0), mask=fg)
      x_offset += bg.size[0]

    output.save(args.output)

if __name__ == '__main__':
    main()

from PIL import Image
import os

input_path = r"e:\Tejas\Mini-Projects 1\smart-crop-aid\assets\images\app_icon.webp"
output_path = r"e:\Tejas\Mini-Projects 1\smart-crop-aid\assets\images\app_icon.png"

try:
    if os.path.exists(input_path):
        img = Image.open(input_path)
        img.save(output_path, "PNG")
        print(f"Successfully converted {input_path} to {output_path}")
    else:
        print(f"File not found: {input_path}")
except Exception as e:
    print(f"Error converting: {e}")

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    # Create image with green background
    img = Image.new('RGB', (size, size), color='#10b981')
    draw = ImageDraw.Draw(img)
    
    # Draw T letter
    try:
        font = ImageFont.truetype("arial.ttf", int(size * 0.5))
    except:
        font = ImageFont.load_default()
    
    # Get text bounding box
    text = "T"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate position to center text
    x = (size - text_width) / 2
    y = (size - text_height) / 2
    
    # Draw text in dark color
    draw.text((x, y), text, fill='#0a0a0f', font=font)
    
    # Save image
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Create icons
os.chdir('frontend/public')
create_icon(192, 'icon-192x192.png')
create_icon(512, 'icon-512x512.png')
print("Icons created successfully!")

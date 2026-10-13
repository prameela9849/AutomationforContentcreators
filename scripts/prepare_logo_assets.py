from PIL import Image
import os

src_path = r"C:\Users\std kotireddy\.gemini\antigravity-ide\brain\0dc94c32-72b3-452c-841e-53dd884e5424\.user_uploaded\media_1791908847414.jpg"
out_dir = r"c:\Users\std kotireddy\OneDrive\Desktop\AutomationforContentCreators\public"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(src_path)

# 1. Full original logo as PNG
orig_png_path = os.path.join(out_dir, "creatorflow-logo.png")
img.save(orig_png_path, format="PNG", optimize=True)
print("Saved full logo:", orig_png_path, os.path.getsize(orig_png_path))

# 2. Balanced cropped full logo (removes excessive empty ivory margin while keeping all elements intact)
crop_full = (60, 170, 964, 795)
cropped_logo = img.crop(crop_full)
cropped_logo_path = os.path.join(out_dir, "creatorflow-logo-clean.png")
cropped_logo.save(cropped_logo_path, format="PNG", optimize=True)
print("Saved cropped full logo:", cropped_logo_path, os.path.getsize(cropped_logo_path))

# 3. Square Icon (the green C symbol with sparkles and speed lines)
# Centered around (512, 381), square crop of 440x440
crop_icon_box = (292, 161, 732, 601)
icon_img = img.crop(crop_icon_box)
icon_path = os.path.join(out_dir, "creatorflow-icon.png")
icon_512 = icon_img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(icon_path, format="PNG", optimize=True)
print("Saved square icon:", icon_path, os.path.getsize(icon_path))

# 4. Favicon ICO (16x16, 32x32, 48x48)
favicon_path = os.path.join(out_dir, "favicon.ico")
icon_img.save(favicon_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Saved favicon.ico:", favicon_path, os.path.getsize(favicon_path))

# 5. Apple Touch Icon (180x180)
apple_path = os.path.join(out_dir, "apple-touch-icon.png")
apple_img = icon_img.resize((180, 180), Image.Resampling.LANCZOS)
apple_img.save(apple_path, format="PNG", optimize=True)
print("Saved apple-touch-icon:", apple_path, os.path.getsize(apple_path))

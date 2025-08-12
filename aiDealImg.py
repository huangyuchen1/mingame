from rembg import remove
from PIL import Image
import os

# 输入文件路径
input_path = "img/enemy-2.png"
output_path = "img-py/enemy-2.png"

# 读取图片
img = Image.open(input_path)

# AI 自动抠图（去掉背景）
result = remove(img)

# 保存为透明 PNG
result.save(output_path)

print(f"已保存去背景图片: {os.path.abspath(output_path)}")

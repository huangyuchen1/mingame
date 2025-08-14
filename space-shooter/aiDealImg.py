from rembg import remove
from PIL import Image
import os

# 输入文件路径
input_path = "space-shooter/img/powerup.png"
output_path = "space-shooter/img-py/powerup.png"

# 读取图片
img = Image.open(input_path)

# AI 自动抠图（去掉背景）
result = remove(img)

# 保存为透明 PNG
result.save(output_path)

print(f"已保存去背景图片: {os.path.abspath(output_path)}")


from PIL import Image
import os

def process_image(image_path, grid_size=3):
    # 步骤1：切割网格
    img = Image.open(image_path)
    width, height = img.size
    grid_width = width // grid_size
    grid_height = height // grid_size
    
    for i in range(grid_size):
        for j in range(grid_size):
            left = j * grid_width
            upper = i * grid_height
            grid = img.crop((left, upper, left + grid_width, upper + grid_height))
            
            # 步骤2：去除黑色背景
            grid = grid.convert("RGBA")
            data = grid.getdata()
            new_data = []
            for pixel in data:
                if pixel[0] < 50 and pixel[1] < 50 and pixel[2] < 50:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(pixel)
            grid.putdata(new_data)
            
            # 保存结果
            grid.save(f"grid_{i}_{j}.png")

# 调用
process_image("space-shooter/img/powerup.png")
# generate_video.py
import sys
import os
import tensorflow as tf
import numpy as np
from PIL import Image
import cv2
import shutil

def load_image(image_path):
    image = Image.open(image_path)
    image = image.convert('RGB')
    image = np.array(image)
    image = tf.convert_to_tensor(image, dtype=tf.float32) / 255.0
    return image

def save_image(image, output_path):
    image = image.numpy()
    image = (image * 255.0).astype(np.uint8)
    image = Image.fromarray(image)
    image.save(output_path)

def interpolate_images(img1, img2, alpha):
    return (1 - alpha) * img1 + alpha * img2

def generate_video(image1_path, image2_path, output_video_path):
    img1 = load_image(image1_path)
    img2 = load_image(image2_path)

    if img1.shape != img2.shape:
        raise ValueError("Image dimensions do not match")

    os.makedirs('frames', exist_ok=True)

    for i in range(150):
        alpha = i / 149.0
        interpolated_image = interpolate_images(img1, img2, alpha)
        output_path = f'frames/interpolated_image_{i:03d}.png'
        save_image(interpolated_image, output_path)

    frame_files = [f'frames/interpolated_image_{i:03d}.png' for i in range(150)]
    frame = cv2.imread(frame_files[0])
    height, width, layers = frame.shape
    video = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'XVID'), 30, (width, height))

    for file in frame_files:
        video.write(cv2.imread(file))

    video.release()
    shutil.rmtree('frames')

if __name__ == "__main__":
    image1_path = sys.argv[1]
    image2_path = sys.argv[2]
    output_video_path = sys.argv[3]
    generate_video(image1_path, image2_path, output_video_path)

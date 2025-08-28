import os
import numpy as np
import cv2
import base64
from ultralytics import YOLO
from loguru import logger
from fastapi import FastAPI, Request
from pydantic import BaseModel

ROOT_DIR = os.path.join(os.getcwd(), "inference-service")
MODELS_DIR = os.path.join(ROOT_DIR, "models")

app = FastAPI(title="Inference Service", version="1.0")

# Load model
try:
    logger.info("Model Loading...")
    model = YOLO(os.path.join(MODELS_DIR, "yolo11n.onnx"))
    logger.info("Model Loaded Successfully!")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")

class ImageRequest(BaseModel):
    Image: str

@app.post("/infer")
async def detect(req: ImageRequest):
    base64img = req.Image.split(",")[1]
    image_bytes = base64.b64decode(base64img)
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    results = model.predict(source=image, conf=0.5)
    predictions = results[0].boxes.data.cpu().numpy()
    detections = []

    for pred in predictions:
        bbox = [int(i) for i in pred[:4]]
        res_dict = {
            "boundingBox": bbox,
            "confidence": round(float(pred[4]), 2),
            "classId": int(pred[5]),
            "className": model.names[int(pred[5])]
        }
        detections.append(res_dict)

    return {"predictions": detections}

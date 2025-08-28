import numpy as np
import cv2
import base64
import random
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Visualization Service", version="1.0")

class ResponseData(BaseModel):
    Image: str
    Predictions: list

@app.post("/visualize")
async def visualize(response: ResponseData):
    base64img = response.Image.split(",")[1]
    predictions = response.Predictions

    image_bytes = base64.b64decode(base64img)
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    # Resize to standard size
    target_size = (640, 480)
    orig_h, orig_w = image.shape[:2]
    image = cv2.resize(image, target_size)

    scale_x = target_size[0] / orig_w
    scale_y = target_size[1] / orig_h

    class_colors = {}
    for det in predictions:
        x1, y1, x2, y2 = det["boundingBox"]

        x1, x2 = int(x1 * scale_x), int(x2 * scale_x)
        y1, y2 = int(y1 * scale_y), int(y2 * scale_y)

        class_id = det["classId"]
        label = f"{det['className']} {det['confidence']:.2f}"

        if class_id not in class_colors:
            class_colors[class_id] = tuple(random.choices(range(256), k=3))

        color = class_colors[class_id]
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)

        # Put label text
        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, color, 2, cv2.LINE_AA)

    _, buffer = cv2.imencode('.png', image)
    processed_base64 = base64.b64encode(buffer).decode('utf-8')

    return {"processedImage": processed_base64}

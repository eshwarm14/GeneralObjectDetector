import base64
import numpy as np
import cv2
import requests
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from loguru import logger


app = FastAPI(title="Entrypoint Service", version="1.0")
app.mount("/entrypoint-service/static", StaticFiles(directory="entrypoint-service/static"), name="static")
templates = Jinja2Templates(directory="entrypoint-service/templates")


@app.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload(Image: UploadFile = File(...)):
    try:
        image_bytes = np.frombuffer(await Image.read(), np.uint8)
        image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
        image = cv2.resize(image, (480, 320))
        _, buffer = cv2.imencode(".png", image)
        base64img = base64.b64encode(buffer).decode("utf-8")
        logger.success("Image File Uploaded Successfully!")
        return {"Status": "Success",
                "Message": "File uploaded successfully!",
                "Image": f"data:image/png;base64,{base64img}"}
    except Exception as e:
        logger.error(f"Error: Failed To Upload Image. {str(e)}")
        return JSONResponse(status_code=400,
                            content={"Status": "Failed",
                                     "Message": "Failed To Upload Image",
                                     "Image": ""})

@app.post("/process")
async def process(data: dict):
    image_data = data["Image"]
    logger.info("Processing Image...")

    inference_resp = requests.post("http://inference-service:8002/infer",
                                   json={"Image": image_data})
    predictions = inference_resp.json()["predictions"]

    viz_response = requests.post("http://visualization-service:8003/visualize",
                                 json={"Image": image_data, "Predictions": predictions})
    processed_image = viz_response.json()["processedImage"]

    logger.success("Image Processing Completed Successfully.")
    return {"ProcessedImage": f"data:image/png;base64,{processed_image}",
            "Predictions": predictions}

# 🖼️ General Object Detector (Micro-Service FastAPI App)

This project is a **containerized object detection application** built with **FastAPI** and orchestrated using **Docker Compose**.  
It allows users to upload an image, runs inference through a detection model, and returns the processed image with predictions overlaid.


## 🚀 Features
- **Entrypoint Service**
  - Provides a simple UI for uploading images.
  - Handles API requests for upload and processing.
  - Orchestrates calls to inference and visualization services.
- **Inference Service**
  - Performs object detection on the uploaded image using Yolo11n (ONNX, CPU-only).
  - Returns detection results (bounding boxes, labels, scores).
- **Visualization Service**
  - Overlays predictions on the image.
  - Returns a processed image (base64 encoded) for display on the UI.
- **FastAPI** backend with asynchronous endpoints.
- **Docker Compose** setup for easy deployment of all services.


## 🛠️ Tech Stack
- [FastAPI](https://fastapi.tiangolo.com/) – Web framework
- [Uvicorn](https://www.uvicorn.org/) – ASGI server
- [OpenCV](https://opencv.org/) – Image processing
- [NumPy](https://numpy.org/) – Array/matrix operations
- [Loguru](https://github.com/Delgan/loguru) – Structured logging
- [Docker Compose](https://docs.docker.com/compose/) – Multi-service orchestration
- [Ultralytics](https://docs.ultralytics.com/) - Yolo11 Object Detection


## 📂 Project Structure

```text
object_detector
├── docker-compose.yml
├── Dockerfile
├── entrypoint-service
│   ├── app.py
│   ├── static
│   │   ├── script.js
│   │   └── style.css
│   └── templates
│       └── index.html
├── inference-service
│   ├── infer.py
│   └── models
│       ├── yolo11n.onnx
│       └── yolo11n.pt
├── README.md
├── requirements.txt
└── visualization-service
    └── plot.py

```


## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/object-detector.git
cd object-detector
```

### 2. Build and run services

```bash
docker compose up
```

This will:

- Build the shared image: `object_detector:v1`
- Start 3 services:
  - **Entrypoint Service** → [http://localhost:8001](http://localhost:8001)
  - **Inference Service** → [http://localhost:8002](http://localhost:8002)
  - **Visualization Service** → [http://localhost:8003](http://localhost:8003)

### 3. Access the UI
**Open in browser** → [http://localhost:8001](http://localhost:8001)

- Upload an image → the system will:
    - Send it to the inference service for object detection.
    - Send predictions + image to the visualization service.
    - Display the processed image + detection results on the UI.

---

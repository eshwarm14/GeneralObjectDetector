class ImageProcessor {
  constructor() {
    this.initializeElements()
    this.bindEvents()
    this.currentImageData = null
  }

  initializeElements() {
    this.uploadArea = document.getElementById("uploadArea")
    this.initialImageInput = document.getElementById("initialImageInput")
    this.imageInput = document.getElementById("imageInput")
    this.uploadSection = document.getElementById("uploadSection")
    this.processingSection = document.getElementById("processingSection")
    this.headerUpload = document.getElementById("headerUpload")
    this.compactUploadBtn = document.getElementById("compactUploadBtn")
    this.originalImage = document.getElementById("originalImage")
    this.processBtn = document.getElementById("processBtn")
    this.resultsSide = document.getElementById("resultsSide")
    this.processedSide = document.getElementById("processedSide")
    this.processedImage = document.getElementById("processedImage")
    this.predictionsJson = document.getElementById("predictionsJson")
  }

  bindEvents() {
    this.uploadArea.addEventListener("click", () => this.initialImageInput.click())
    this.uploadArea.addEventListener("dragover", this.handleDragOver.bind(this))
    this.uploadArea.addEventListener("dragleave", this.handleDragLeave.bind(this))
    this.uploadArea.addEventListener("drop", this.handleDrop.bind(this))
    this.initialImageInput.addEventListener("change", this.handleFileSelect.bind(this))
    this.imageInput.addEventListener("change", this.handleFileSelect.bind(this))
    this.compactUploadBtn.addEventListener("click", () => this.imageInput.click())
    this.processBtn.addEventListener("click", this.processImage.bind(this))
  }

  handleDragOver(e) {
    e.preventDefault()
    this.uploadArea.classList.add("dragover")
  }

  handleDragLeave(e) {
    e.preventDefault()
    this.uploadArea.classList.remove("dragover")
  }

  handleDrop(e) {
    e.preventDefault()
    this.uploadArea.classList.remove("dragover")
    const files = e.dataTransfer.files
    if (files.length > 0) this.handleFile(files[0])
  }

  handleFileSelect(e) {
    const file = e.target.files[0]
    if (file) this.handleFile(file)
  }

  async handleFile(file) {
    if (!file.type.startsWith("image/")) {
      this.showMessage("Please select a valid image file.", "error")
      return
    }
    try {
      this.showMessage("Uploading image...", "info")
      const formData = new FormData()
      formData.append("Image", file)

      const response = await fetch("/upload", { method: "POST", body: formData })
      const result = await response.json()

      if (result.Status === "Success") {
        this.currentImageData = result.Image
        this.displayOriginalImage(result.Image)
        this.showMessage("Image uploaded successfully!", "success")
      } else {
        this.showMessage(result.Message || "Upload failed", "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      this.showMessage("Upload failed. Please try again.", "error")
    }
  }

  displayOriginalImage(imageData) {
    this.currentImageData = imageData
    this.originalImage.src = imageData

    this.uploadSection.style.display = "none"
    this.processingSection.style.display = "block"
    this.headerUpload.style.display = "block"

    const grid = document.querySelector(".processing-grid")
    grid.classList.remove("processed")

    this.resultsSide.style.display = "none"
    this.processedSide.style.display = "none"
  }

  async processImage() {
    if (!this.currentImageData) {
      this.showMessage("Please upload an image first.", "error")
      return
    }
    try {
      this.setProcessingState(true)
      this.showMessage("Processing image...", "info")

      const response = await fetch("/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Image: this.currentImageData }),
      })

      const result = await response.json()
      if (response.ok) {
        this.displayResults(result.ProcessedImage, result.Predictions)
        this.showMessage("Image processed successfully!", "success")
      } else {
        this.showMessage("Processing failed. Please try again.", "error")
      }
    } catch (error) {
      console.error("Processing error:", error)
      this.showMessage("Processing failed. Please try again.", "error")
    } finally {
      this.setProcessingState(false)
    }
  }

  displayResults(processedImageData, predictions) {
    this.processedImage.src = processedImageData
    this.predictionsJson.textContent = JSON.stringify(predictions, null, 2)

    const grid = document.querySelector(".processing-grid")
    grid.classList.add("processed")

    this.processedSide.style.display = "flex"
    this.resultsSide.style.display = "flex"
  }

  setProcessingState(isProcessing) {
    const btnText = this.processBtn.querySelector(".btn-text")
    const spinner = this.processBtn.querySelector(".spinner")
    if (isProcessing) {
      this.processBtn.disabled = true
      btnText.textContent = "Processing..."
      spinner.style.display = "block"
    } else {
      this.processBtn.disabled = false
      btnText.textContent = "Process Image"
      spinner.style.display = "none"
    }
  }

  showMessage(message, type) {
    document.querySelectorAll(".status-message").forEach(msg => msg.remove())
    const messageDiv = document.createElement("div")
    messageDiv.className = `status-message status-${type}`
    messageDiv.textContent = message
    const header = document.querySelector(".header")
    header.insertAdjacentElement("afterend", messageDiv)
    setTimeout(() => { messageDiv.remove() }, 5000)
  }
}

document.addEventListener("DOMContentLoaded", () => new ImageProcessor())

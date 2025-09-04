import os
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io

# Load the trained model
try:
    model = tf.keras.models.load_model("potato_defect_cnn.h5")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

app = FastAPI()

# Configure CORS to allow requests from your Next.js frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002", # Add your Next.js app port here
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the prediction classes based on your model's output
CLASS_NAMES = ["Defective", "Not Defective", "Healthy"]

# A simple health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if not model:
        return {"error": "Model not loaded"}, 500

    # Read the image file as bytes
    image_bytes = await file.read()
    
    try:
        # Decode the image and resize it to the expected size (128x128)
        # and ensure it has 3 color channels (RGB)
        image = tf.image.decode_image(image_bytes, channels=3)
        image = tf.image.resize(image, (128, 128))
        
        # Add a batch dimension to the image, so it has shape (1, 128, 128, 3)
        img_array = tf.expand_dims(image, 0)
        
        # Make the prediction
        predictions = model.predict(img_array)
        
        # Get the predicted class and confidence
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_index]
        confidence = float(np.max(predictions[0]))
        
        # Convert probabilities to a list for JSON serialization
        probabilities = predictions[0].tolist()

        return {
            "label": predicted_class,
            "confidence": confidence,
            "probs": probabilities
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {"error": str(e)}, 500

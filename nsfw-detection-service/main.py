from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import torch
import timm
import io
import requests
from urllib.request import urlopen

app = FastAPI(title="NSFW Detection Service")

MODEL_NAME = "hf_hub:Marqo/nsfw-image-detection-384"

print("Đang tải model...")
model = timm.create_model(MODEL_NAME, pretrained=True)
model = model.eval()
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=False)
class_names = model.pretrained_cfg["label_names"]
print("Model đã sẵn sàng!")

class ImageUrlRequest(BaseModel):
    image_url: str

@app.post("/predict")
async def predict_nsfw(request: ImageUrlRequest):
    try:
        response = requests.get(request.image_url, timeout=10)
        img = Image.open(io.BytesIO(response.content)).convert('RGB')
        
        with torch.no_grad():
            input_tensor = transforms(img).unsqueeze(0)
            output = model(input_tensor).softmax(dim=-1)

            probs = output[0].tolist()
            predicted_idx = output[0].argmax().item()

            results = {class_names[i]: probs[i] for i in range(len(class_names))}
            
        return {
            "prediction": class_names[predicted_idx],
            "confidence": probs[predicted_idx],
            "details": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý ảnh: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
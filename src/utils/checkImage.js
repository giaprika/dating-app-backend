import axios from "axios";

async function checkImageSafety(imageUrl) {
  try {
    const response = await axios.post(
      "http://localhost:8008/predict",
      {
        image_url: imageUrl,
      },
      {
        timeout: 5000,
      },
    );

    const { prediction, confidence } = response.data;
    console.log("prediction:", prediction);
    console.log("confidence:", confidence);
    if (prediction?.toUpperCase() === "NSFW" && confidence > 0.8) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Image safety check error:", error.message);
    return false;
  }
}

export { checkImageSafety };

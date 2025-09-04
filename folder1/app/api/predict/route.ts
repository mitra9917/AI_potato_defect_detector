// export const runtime = "nodejs";  // 👈 force Node runtime

// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     // Get the form data from the request
//     const formData = await request.formData()
//     const image = formData.get("image") as File

//     if (!image) {
//       return NextResponse.json({ error: "No image file provided" }, { status: 400 })
//     }

//     // Validate file type
//     if (!image.type.startsWith("image/")) {
//       return NextResponse.json({ error: "File must be an image" }, { status: 400 })
//     }

//     // Mock prediction logic - in a real app, this would call your ML model
//     const mockDefects = ["Hollow Heart", "Black Spot", "Common Scab", "Greening", "Healthy"]

//     const randomDefect = mockDefects[Math.floor(Math.random() * mockDefects.length)]
//     const randomConfidence = 0.75 + Math.random() * 0.24 // Between 0.75 and 0.99

//     // Simulate processing time
//     await new Promise((resolve) => setTimeout(resolve, 1000))

//     return NextResponse.json({
//       class: randomDefect,
//       confidence: Number.parseFloat(randomConfidence.toFixed(2)),
//     })
//   } catch (error) {
//     console.error("Error processing image:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// import { NextResponse } from "next/server"

// // handle POST /api/predict
// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData()
//     const file = formData.get("image") as File

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
//     }

//     // 🔥 Do your ML model call here instead of dummy
//     const fakePrediction = {
//       class: "Healthy",
//       confidence: 0.92,
//     }

//     return NextResponse.json(fakePrediction)
//   } catch (err) {
//     console.error("Prediction error:", err)
//     return NextResponse.json({ error: "Failed to process" }, { status: 500 })
//   }
// }

// // (Optional) handle GET /api/predict if you want
// export async function GET() {
//   return NextResponse.json({ message: "Predict API is alive" })
// }
// `next/server` is imported to use `NextResponse` for API route responses.
// import { NextResponse } from "next/server";

// Define the URLs for the ML model API using environment variables.
// This is a crucial security and maintenance improvement, as it prevents
// hardcoding sensitive URLs and makes it easier to switch between
// development, staging, and production environments.
// const ML_API_URL = process.env.ML_API_URL;

// --- POST Route Handler ---
// This function handles the image upload and forwards it to the ML model.
// export async function POST(req: Request) {
//   try {
//     // Check if the ML API URL is configured.
//     if (!ML_API_URL) {
//       console.error("ML_API_URL is not defined in environment variables");
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     const formData = await req.formData();
//     const file = formData.get("image") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

    // Forward the file to the Python ML API.
    // const pythonFormData = new FormData();
    // pythonFormData.append("file", file);

    // const response = await fetch(ML_API_URL, {
    //   method: "POST",
    //   body: pythonFormData,
    // });

    // if (!response.ok) {
    //   const errorText = await response.text();
    //   console.error(`ML server responded with an error: ${errorText}`);
    //   throw new Error(`ML server error: ${response.status} ${response.statusText}`);
    // }

    // const result = await response.json();

    // The frontend (`page.tsx`) expects a specific JSON structure.
    // This part of the code is now more flexible. It assumes the new model
    // will return fields like `label` and `confidence`. If your new model
    // uses different field names (e.g., `class_name` or `score`), you will
    // need to adjust this part of the code accordingly.
//     return NextResponse.json({
//       class: result.label || "Unknown",
//       confidence: result.confidence || 0.0,
//       probabilities: result.probs || {},
//     });
//   } catch (err) {
//     console.error("Prediction error:", err);
//     return NextResponse.json(
//       { error: "Failed to process image", details: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }

// --- GET Route Handler (Health Check) ---
// This function provides a health check endpoint for your API.
// It checks if the ML model server is responsive.
// export async function GET() {
//   const ML_HEALTH_CHECK_URL = ML_API_URL ? `${ML_API_URL}/health` : null;

//   try {
//     if (!ML_HEALTH_CHECK_URL) {
//       return NextResponse.json({
//         message: "Predict API is alive",
//         ml_server_connected: false,
//         error: "ML_API_URL is not configured"
//       });
//     }

//     const response = await fetch(ML_HEALTH_CHECK_URL);
//     const health = await response.json();

//     return NextResponse.json({
//       message: "Predict API is alive",
//       ml_server_status: health.status,
//       ml_server_connected: response.ok,
//     });
//   } catch (error) {
//     return NextResponse.json({
//       message: "Predict API is alive",
//       ml_server_connected: false,
//       ml_server_status: "unavailable",
//     });
//   }
// }

import { NextResponse } from "next/server";

// This is the URL of your FastAPI server
const ML_API_URL = "http://127.0.0.1:8101/predict";
const HEALTH_CHECK_URL = "http://127.0.0.1:8101/health";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Forward the file to the Python ML API
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const response = await fetch(ML_API_URL, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ML server error: ${error}`);
    }

    const result = await response.json();
    
    // Return the result from the ML API to the frontend
    return NextResponse.json({
      class: result.label,
      confidence: result.confidence,
      probabilities: result.probs
    });

  } catch (err) {
    console.error("Prediction error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}

// Optional: Health check endpoint
export async function GET() {
  try {
    const response = await fetch(HEALTH_CHECK_URL);
    const health = await response.json();
    return NextResponse.json({
      message: "Predict API is alive",
      ml_server_status: health.status,
      ml_server_connected: response.ok
    });
  } catch (error) {
    return NextResponse.json({
      message: "Predict API is alive, but ML server is unreachable",
      ml_server_status: "unreachable",
      ml_server_connected: false
    });
  }
}

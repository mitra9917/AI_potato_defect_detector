"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon } from "lucide-react"
import { db } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"

// ...rest of your existing code...

interface PredictionResult {
  class: string
  confidence: number
}

function generateUniqueId() {
  return "submission-" + Math.random().toString(36).slice(2) + Date.now()
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setPrediction(null)
      setIsSaved(false)
    }
  }

const handleUpload = async () => {
  console.log("clicked");
  
  if (!selectedFile) {
    console.log("goon");
    
    return
  }
  setIsLoading(true)
  try {
    const formData = new FormData()
    formData.append("image", selectedFile)
    console.log("SelectedFile:", selectedFile);
  for (const [key, value] of formData.entries()) {
    console.log("FormData Entry:", key, value);
  }

    

    // Use relative path for API endpoint
    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const result: PredictionResult = await response.json()
    setPrediction(result)
  } catch (error) {
    console.error("Error uploading image:", error)
  } finally {
    setIsLoading(false)
  }
}

  const handleSave = async () => {
    if (!prediction) return
    setIsSaved(false)
    const uniqueId = generateUniqueId()
    try {
      await setDoc(
        doc(db, "form-submission", uniqueId),
        {
          class: prediction.class,
          confidence: prediction.confidence,
          timestamp: new Date().toISOString(),
        }
      )
      setIsSaved(true)
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Potato Defect Detector</h1>
          <p className="text-muted-foreground">Upload an image to detect potato defects using AI</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Upload Image
            </CardTitle>
            <CardDescription>Select a potato image to analyze for defects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Choose Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Selected potato"
                    className="max-w-full h-auto max-h-64 mx-auto rounded-md"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!selectedFile || isLoading} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </CardContent>
        </Card>

        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Detected Defect:</span>
                  <span className="text-lg font-bold text-primary">{prediction.class}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Confidence:</span>
                  <span className="text-lg font-bold text-green-600">{(prediction.confidence * 100).toFixed(1)}%</span>
                </div>
                <Button onClick={handleSave} className="w-full mt-4" disabled={isSaved}>
                  {isSaved ? "Saved!" : "Save Result to Firestore"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
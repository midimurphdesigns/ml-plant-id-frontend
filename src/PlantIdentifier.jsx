import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "./PlantIdentifier.css";

const classNames = ["Daisy", "Dandelion", "Rose", "Sunflower", "Tulip"];

function PlantIdentifier() {
    const [model, setModel] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            setIsLoading(true);
            try {
                const loadedModel = await tf.loadLayersModel(
                    "/tfjs_model/model.json"
                );
                setModel(loadedModel);
            } catch (error) {
                setError("Failed to load the model. Please try again later.");
                console.error("Failed to load the model:", error);
            }
            setIsLoading(false);
        };
        loadModel();
    }, []);

    const handleImageUpload = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setImageURL(url);
            setPrediction(null);
            setError(null);
        }
    };

    const classifyImage = async () => {
        if (!model || !imageURL) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const img = document.getElementById("uploaded-image");
            const tensor = tf.browser
                .fromPixels(img)
                .resizeNearestNeighbor([150, 150])
                .toFloat()
                .expandDims();

            const predictions = await model.predict(tensor).data();
            const topPrediction = Array.from(predictions)
                .map((p, i) => ({
                    probability: p,
                    className: classNames[i],
                }))
                .sort((a, b) => b.probability - a.probability)[0];

            setPrediction(topPrediction);
        } catch (error) {
            setError(
                "An error occurred while classifying the image. Please try again."
            );
            console.error("Classification error:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="plant-identifier">
            <header
                className="hero"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/hero-background.jpg)`,
                }}
            >
                <div className="hero-content">
                    {/* <img
                        src="/logo.png"
                        alt="Plant Identifier Logo"
                        className="logo"
                    /> */}
                    <h1>Plant Species Identifier</h1>
                </div>
            </header>
            <main>
                <div className="upload-section">
                    <label htmlFor="file-upload" className="custom-file-upload">
                        Choose an image
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                {imageURL && (
                    <div className="image-preview">
                        <img
                            id="uploaded-image"
                            src={imageURL}
                            alt="Uploaded"
                            crossOrigin="anonymous"
                        />
                        <button
                            onClick={classifyImage}
                            className="submit-button"
                        >
                            Identify Plant
                        </button>
                    </div>
                )}
                {isLoading && <div className="loading">Processing...</div>}
                {error && <div className="error-message">{error}</div>}
                {prediction && (
                    <div className="prediction">
                        <h2>Prediction</h2>
                        <p className="prediction-result">
                            {prediction.className}
                            <span className="prediction-probability">
                                {(prediction.probability * 100).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PlantIdentifier;

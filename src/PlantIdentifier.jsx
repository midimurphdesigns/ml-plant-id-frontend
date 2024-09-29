// src/PlantIdentifier.js
import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

const classNames = ["Daisy", "Dandelion", "Rose", "Sunflower", "Tulip"];

function PlantIdentifier() {
    const [model, setModel] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        const loadModel = async () => {
            const loadedModel = await tf.loadLayersModel("../public/model/model.json");
            setModel(loadedModel);
        };
        loadModel();
    }, []);

    const handleImageUpload = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            const url = URL.createObjectURL(files[0]);
            setImageURL(url);
            setPrediction(null);
        }
    };

    const classifyImage = async () => {
        if (!model || !imageURL) return;

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
    };

    return (
        <div>
            <h1>Plant Species Identifier</h1>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageURL && (
                <div>
                    <img
                        id="uploaded-image"
                        src={imageURL}
                        alt="Uploaded"
                        crossOrigin="anonymous"
                        onLoad={classifyImage}
                    />
                </div>
            )}
            {prediction && (
                <div>
                    <h2>Prediction</h2>
                    <p>{`${prediction.className}: ${(
                        prediction.probability * 100
                    ).toFixed(2)}%`}</p>
                </div>
            )}
        </div>
    );
}

export default PlantIdentifier;

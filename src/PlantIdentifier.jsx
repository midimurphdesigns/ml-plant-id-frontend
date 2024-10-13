// src/App.js
import React, { useState } from "react";
import axios from "axios";

function App() {
    const [image, setImage] = useState(null);
    const [species, setSpecies] = useState("");

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/predict",
                formData,
                {
                    // Do not set Content-Type here
                    // headers: { 'Content-Type': 'multipart/form-data' } // Remove this line
                }
            );
            setSpecies(response.data.species);
        } catch (error) {
            console.error("Error predicting species:", error);
            alert(
                "An error occurred while predicting the species. Please try again."
            );
        }
    };

    return (
        <div>
            <h1>Plant Species Identifier</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleImageChange} />
                <button type="submit">Identify</button>
            </form>
            {species && <p>Identified Species: {species}</p>}
        </div>
    );
}

export default App;

const speechInput = document.getElementById('speech');
const speakButton = document.getElementById('speak');
const jsonOutput = document.getElementById('json-output');

// --- BACKEND API ENDPOINT ---
const API_ENDPOINT = 'https://custom-built-speech-synthesis-engin.vercel.app/api/generateProsody'; 

speakButton.addEventListener('click', () => {
    const text = speechInput.value.trim();
    if (text) {
        getProsodyAndSpeak(text);
    }
});

// --- MAIN ASYNC FUNCTION ---
async function getProsodyAndSpeak(text) {
    // Show a loading state to the user
    jsonOutput.textContent = 'Analyzing text and generating speech...';
    speakButton.disabled = true;

    try {
        // --- Calling secure backend function ---
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const prosodyArray = await response.json();

        // --- Display the JSON response for debugging ---
        jsonOutput.textContent = JSON.stringify(prosodyArray, null, 2);

        // --- Speak the segments sequentially ---
        speakSegments(prosodyArray);

    } catch (error) {
        console.error('Error:', error);
        jsonOutput.textContent = `Error: ${error.message}`;
    } finally {
        // Re-enable the button after everything is done
        speakButton.disabled = false;
    }
}

// --- FUNCTION TO HANDLE THE SPEECH SYNTHESIS ---
function speakSegments(segments) {
    // Clear any speech that might be queued
    speechSynthesis.cancel();

    if (!Array.isArray(segments)) {
        console.error("Invalid response format. Expected an array.");
        jsonOutput.textContent += "\n\nError: Invalid data format from API.";
        return;
    }

    // Loop through the array and queue up each segment
    segments.forEach(item => {
        const utterance = new SpeechSynthesisUtterance(item.segment);
        
        // Assign the parameters from the AI's response
        utterance.pitch = item.params.pitch;
        utterance.rate = item.params.rate;
        utterance.volume = item.params.volume;
        
        speechSynthesis.speak(utterance);
    });
}
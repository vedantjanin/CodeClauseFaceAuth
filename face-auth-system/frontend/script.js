const video = document.getElementById('video');

// Load face-api.js models (CDN or local)
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models')
]).then(startVideo).catch(err => {
  console.error("Model loading failed:", err);
});

// Start webcam stream
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Failed to access webcam:", err);
      alert("Please allow webcam access.");
    });
}

// Face registration (store user face descriptor)
async function registerFace() {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("No face detected. Please make sure your face is clearly visible.");
    return;
  }

  const descriptor = Array.from(detection.descriptor);

  const user = {
    name: "Test User",
    email: "test@example.com",
    faceData: JSON.stringify(descriptor)
  };

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await res.json();
    alert(data.message);
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Error during registration.");
  }
}

// Face login (match current face with stored descriptor)
async function loginFace() {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("No face detected. Please try again.");
    return;
  }

  const descriptor = Array.from(detection.descriptor);

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceData: JSON.stringify(descriptor) })
    });

    const data = await res.json();
    alert(data.message);
  } catch (error) {
    console.error("Login failed:", error);
    alert("Error during login.");
  }
}

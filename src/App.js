import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import PhoneInput, {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import validator from "validator";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import Intro from "./assets/toddler_box.png";
import Photo1 from "./assets/Photo1.jpeg";
import Photo2 from "./assets/Photo2.JPG";
import Photo3 from "./assets/Photo3.JPG";
import Photo4 from "./assets/Photo4.jpeg";
import Photo5 from "./assets/Photo5.jpg";
import Photo6 from "./assets/Photo6.png";
import CustomizableImage from "./CustomizableImg";
import { FiUpload, FiVideo, FiCamera, FiStar } from 'react-icons/fi';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        solveRiddlePrompt: "Can you solve the riddle?",
        riddle: `"I'm a pack of fun, now wrapping, just cards in a stack, Each one's a
      gem, knowledge that won't lack. Flip me around, see what's in store,
      A gift for your brain, a learning encore, Give it a whirl, I'm the
      flashiest thing in your study world! What am I?"`,
        buttonPlaceholder: "Enter your answer",
        buttonText: "Submit",
      },
    },
    es: {
      translation: {
        solveRiddlePrompt: "¿Puedes resolver el acertijo?",
        riddle: `"Soy un paquete de diversión, ahora envuelto, solo cartas en una pila, Cada una es una joya, conocimiento que no faltará. Dame la vuelta, mira lo que hay en la tienda,
      Un regalo para tu cerebro, un bis de aprendizaje. Dale una vuelta, soy el
      ¡Lo más llamativo de tu mundo de estudio! ¿Qué soy yo?"`,
        buttonPlaceholder: "Introduce tu respuesta",
        buttonText: "Entregar",
      },
    },
    // Add more languages here
  },
  lng: "en", // Default language
  fallbackLng: "en", // Use English if the language can't be detected
  interpolation: { escapeValue: false },
});

// Your form component
function Form() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [asin, setAsin] = useState();
  const [formData, setFormData] = useState({
    orderId: "",
    fullName: "",
    email: "",
    set: "",
    country: { name: "United States", id: 233 },
    rating: 0,
    review: "",
    streetAddress: "",
    city: "",
    state: { name: "", id: null },
    zipCode: "",
    phoneNumber: "",
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [errors, setErrors] = useState({});
  const [reviewType, setReviewType] = useState("amazon");
  const [screenshot, setScreenshot] = useState(null);
  const [selectedGift, setSelectedGift] = useState("");
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [amazonScreenshot, setAmazonScreenshot] = useState(null);

  const giftOptions = [
    { value: "Noun Set", label: "Noun Set" },
    { value: "Sould Delight Set", label: "Sould Delight Set" },
    {
      value: "Toddlers Learn & Play Set",
      label: "Toddlers Learn & Play Set",
    },
  ];

  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [videoChunks, setVideoChunks] = useState([]);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function fetchLocationAndSetLanguage() {
      try {
        const response = await axios.get(
          "https://studykey-third-server.vercel.app/api/location"
        );
        const geo = response.data;
        const language = getLanguageFromCountryCode(geo.country); // Implement this function
        setLanguage(language);
        i18n.changeLanguage(language);
      } catch (error) {
        console.error("Failed to fetch location or set language:", error);
      }
    }
    fetchLocationAndSetLanguage();
  }, []);

  // useEffect(() => {
  //   if (asin) {
  //     async function fetchReviews() {
  //       try {
  //         const response = await axios.get(
  //           `http:product-reviews`,
  //           {
  //             params: {
  //               asin: asin,
  //             },
  //           }
  //         );
  //         console.log(response.data);
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //     fetchReviews();
  //   }
  // }, [asin]);

  // Add this validation
  const validateReviewStep = () => {
    const newErrors = {};

    if (!reviewType) {
      newErrors.reviewType = "Please select a review type";
    }

    if (reviewType === "amazon" && !screenshot) {
      newErrors.screenshot = "Please upload your Amazon review screenshot";
    }

    if (reviewType === "video" && !screenshot) {
      newErrors.screenshot = "Please upload your video testimonial";
    }

    if (!selectedGift) {
      newErrors.gift = "Please select your gift";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function getLanguageFromCountryCode(countryCode) {
    // Map country codes to languages
    const countryToLanguage = {
      US: "en",
      ES: "es",
      // Add more countries here
    };
    return countryToLanguage[countryCode] || "en"; // Default to English
  }

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
    setLanguage(event.target.value);
  };

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const Modal = ({ isOpen, onClose, iframeSrc }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 w-11/12 max-w-2xl relative">
          <button
            className="absolute top-2 right-2 text-xl"
            onClick={onClose}
          >
            &times;
          </button>
          <iframe
            src={iframeSrc}
            title="Boast Form"
            frameBorder="0"
            className="w-full h-96"
            allow="microphone; camera; display-capture; encrypted-media"
            allowusermedia
          ></iframe>
        </div>
      </div>
    );
  };

  const checkAnswer = () => {
    if (answer.toLowerCase() === "flashcards") {
      setIsCorrect(true);
      setShowFireworks(true);
      setTimeout(() => {
        setShowFireworks(false);
      }, 5000); // Fireworks will disappear after 5 seconds
      setShowReward(true);
    } else if (attempts > 1) {
      setAttempts(attempts - 1);
    } else {
      alert("The correct answer is: flashcards");
      setAttempts(0);
    }
  };

  const claimReward = () => {
    setShowFeedbackForm(true);
  };

  // Add this debounce function at the top level
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Helper function to normalize strings for comparison
  const normalizeString = (str) => {
    return str.toLowerCase().replace(/\s+/g, "").trim();
  };

  // Updated ZIP code validation function with better error handling
  const validateZipCode = async (zipCode, state, city) => {
    try {
      const response = await axios
        .get(`https://api.zippopotam.us/us/${zipCode}`)
        .catch((error) => {
          if (error.response?.status === 404) {
            return { status: 404 };
          }
          throw error;
        });

      // Handle 404 response
      if (response.status === 404) {
        return `Invalid ZIP code for ${city}, ${state}`;
      }

      const zipData = response.data;
      if (!zipData || !zipData.places || zipData.places.length === 0) {
        return "Unable to verify this ZIP code";
      }

      const places = zipData.places;

      // Check if the entered ZIP code matches the selected city and state
      const matchingPlace = places.find((place) => {
        const placeName = normalizeString(place["place name"]);
        const placeState = normalizeString(place.state);
        const selectedCity = normalizeString(city);
        const selectedState = normalizeString(state);

        return placeName === selectedCity && placeState === selectedState;
      });

      if (!matchingPlace) {
        return `This ZIP code doesn't match with ${city}, ${state}`;
      }

      return null;
    } catch (error) {
      console.error("ZIP code validation error:", error);
      if (error.response?.status === 429) {
        return "Too many requests. Please try again later.";
      }
      return "Unable to verify ZIP code at this time";
    }
  };

  // Updated ZIP code change handler with better error handling
  const handleZipCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);

    // First update the form data with the new ZIP code
    setFormData((prev) => ({
      ...prev,
      zipCode: value,
    }));

    // Clear previous error when typing
    if (value.length < 5) {
      setErrors((prev) => ({
        ...prev,
        zipCode: null,
      }));
      return;
    }

    // Validate prerequisites
    if (!formData.city || !formData.state.name) {
      setErrors((prev) => ({
        ...prev,
        zipCode: "Please select city and state first",
      }));
      return;
    }

    // Only validate complete ZIP codes
    if (value.length === 5) {
      setLoading(true);
      try {
        const zipError = await validateZipCode(
          value,
          formData.state.name,
          formData.city
        );
        setErrors((prev) => ({
          ...prev,
          zipCode: zipError,
        }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          zipCode: "Error validating ZIP code",
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  // Updated form validation to handle ZIP code errors
  const validateForm = () => {
    const newErrors = {};

    // Step 1 validations
    if (step === 0) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validator.isEmail(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.orderId.trim()) {
        newErrors.orderId = "Order ID is required";
      }
    }

    // Step 2 validations
    if (step === 2) {
      if (!reviewType) {
        newErrors.reviewType = "Please select a review type";
      }
      if (!selectedGift) {
        newErrors.gift = "Please select your gift";
      }
      if (reviewType === "amazon" && !screenshot) {
        newErrors.screenshot = "Please upload your Amazon review screenshot";
      }
      if (reviewType === "video" && (!recordedVideo)) {
        newErrors.screenshot = "Please upload your video testimonial";
      }
     
    }

    // Step 3 validations
    if (step === 3) {
      if (!formData.streetAddress.trim()) {
        newErrors.streetAddress = "Street address is required";
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state.name) {
        newErrors.state = "State is required";
      }
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = "ZIP code is required";
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!isPossiblePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a retry mechanism for failed API calls
  const retryZipCodeValidation = async (
    zipCode,
    state,
    city,
    retries = 3
  ) => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await validateZipCode(zipCode, state, city);
        return result;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  };

  // Add order ID validation function
  const validateOrderId = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://studykey-third-server.vercel.app/validate-order-id",
        {
          orderId: orderId,
        }
      );

      if (response.data.valid) {
        return null;
      } else {
        return "Invalid Order ID. Please check and try again.";
      }
    } catch (error) {
      console.error("Order validation error:", error);
      return error.response?.data?.message || "Error validating Order ID";
    } finally {
      setLoading(false);
    }
  };

  // Update handleNextStep for step 0
  const handleNextStep = async (e) => {
    e.preventDefault();

    // Special handling for step 0
    if (step === 0) {
      const newErrors = {};

      // Basic field validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validator.isEmail(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.orderId.trim()) {
        newErrors.orderId = "Order ID is required";
      }

      // If there are basic validation errors, show them first
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fill in all required fields correctly");
        return;
      }

      // Validate Order ID
      try {
        setLoading(true);
        const orderError = await validateOrderId(formData.orderId);

        if (orderError) {
          setErrors((prev) => ({
            ...prev,
            orderId: orderError,
          }));
          toast.error(orderError);
          return;
        }

        // If everything is valid, proceed to next step
        setStep(step + 1);
        setCompletedSteps([...completedSteps, step]);
      } catch (error) {
        toast.error("Error validating order. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle other steps normally
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setStep(step + 1);
    setCompletedSteps([...completedSteps, step]);
  };

  const handleInputChange = (eventOrName, value) => {
    if (typeof eventOrName === "string") {
      // Handle onChange from react-country-state-city components
      setFormData({
        ...formData,
        [eventOrName]: value,
      });
      setErrors({
        ...errors,
        [eventOrName]: "",
      });
    } else {
      // Handle onChange from standard input elements
      const { name, value } = eventOrName.target;
      setFormData({
        ...formData,
        [name]: value,
      });
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const formDataToSubmit = new FormData();

      // Add all form data
      Object.keys(formData).forEach((key) => {
        if (key === "state" || key === "country") {
          formDataToSubmit.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      // Add review type and metadata
      formDataToSubmit.append("reviewType", reviewType);
      formDataToSubmit.append("selectedGift", selectedGift);
      formDataToSubmit.append("rating", rating);
      formDataToSubmit.append("review", description);

      // Handle video upload - convert Blob URL to File object if it's a recorded video
      if (recordedVideo) {
        try {
          const response = await fetch(recordedVideo);
          const videoBlob = await response.blob();
          const videoFile = new File([videoBlob], 'recorded-video.webm', { type: 'video/webm' });
          formDataToSubmit.append("media", videoFile);
        } catch (error) {
          console.error("Error processing recorded video:", error);
          toast.error("Error processing video");
          return;
        }
      }
      
      // Handle uploaded video file
      if (uploadedVideo) {
        formDataToSubmit.append("media", uploadedVideo);
      }

      // Handle Amazon review screenshot
      if (amazonScreenshot) {
        formDataToSubmit.append("media", amazonScreenshot);
      }

      const response = await axios.post(
        "https://studykey-third-server.vercel.app/submit-review",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        setStep(4);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while submitting the form"
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Add this component for upload progress
const UploadProgress = ({ progress }) => {
  if (!progress) return null;
  
  return (
    <div className="w-full mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-1">Uploading: {progress}%</p>
    </div>
  );
};

  // Add this component for star rating
  const StarRating = ({ rating, onRatingChange }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <FiStar
            className={`w-8 h-8 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );


  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file);
      setRecordedVideo(null);
      setScreenshot(file);
    } else {
      toast.error('Please upload a valid video file');
    }
  };
  
  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAmazonScreenshot(file);
      setScreenshot(file);
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const mimeType = 'video/webm; codecs="opus,vp8"';

  const startRecording = async () => {
    setRecordingStatus("recording");
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
  
    let localVideoChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };
  
    setVideoChunks(localVideoChunks);
  };
  
  const stopRecording = () => {
    setPermission(false);
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
  
    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
      setScreenshot(null); // Clear any existing screenshot
      setAmazonScreenshot(null); // Clear any Amazon screenshot
    };
  };
  
  useEffect(() => {
    if (!stream) return;
    return () => {
      stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const getCameraPermission = async () => {
    setRecordedVideo(null);
    if ("MediaRecorder" in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true,
        };
        const audioConstraints = { audio: true };
  
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
  
        setPermission(true);
  
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
  
        setStream(videoStream);
        liveVideoFeed.current.srcObject = videoStream;
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      toast.error("The MediaRecorder API is not supported in your browser.");
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            <div className="order-2 lg:order-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="space-y-8 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                    CLAIM YOUR <span className="text-blue-500">REWARD</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Thank you for choosing our educational products! Share
                    your experience and select an exclusive reward.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    How It Works
                  </h2>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 font-semibold">
                        1
                      </span>
                      <span className="text-gray-600">
                        Fill out the form with your details
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 font-semibold">
                        2
                      </span>
                      <span className="text-gray-600">
                        Share your experience with a review
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 font-semibold">
                        3
                      </span>
                      <span className="text-gray-600">
                        Choose your exclusive reward
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-600 transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Start Now
                  </button>
                  <button
                    onClick={() => (window.location.href = "/faq")} // Add your FAQ route
                    className="flex-1 px-8 py-4 border-2 border-blue-500 text-blue-500 text-lg font-semibold rounded-lg hover:bg-blue-50 transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="sticky top-8">
                <div className="relative h-[450px] md:h-[600px] lg:h-[700px] w-full">
                  <CustomizableImage
                    src={Photo4}
                    alt="Learning journey 4"
                    initialX={-10}
                    initialY={-3}
                    initialRotation={-12}
                    width="55%"
                    minWidth="320px"
                    aspectRatio="4/3"
                    zIndex={10}
                  />
                  <CustomizableImage
                    src={Photo5}
                    alt="Learning journey 5"
                    initialX={35}
                    initialY={5}
                    initialRotation={8}
                    width="60%"
                    minWidth="340px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                  <CustomizableImage
                    src={Photo6}
                    alt="Learning journey 6"
                    initialX={8}
                    initialY={40}
                    initialRotation={-5}
                    width="65%"
                    minWidth="360px"
                    aspectRatio="4/3"
                    zIndex={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            <div className="order-2 lg:order-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="space-y-8 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                    START YOUR <span className="text-blue-500">REWARD</span>{" "}
                    JOURNEY
                  </h1>
                  <p className="text-xl text-gray-600">
                    Complete your information below to begin claiming your
                    special gift.
                  </p>
                </div>

                <form className="space-y-6 w-full">
                  <div>
                    <label className="block text-xl font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-400 ${
                        errors.fullName ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-yellow-400">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xl font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-400 ${
                        errors.email ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-2 text-yellow-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xl font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleInputChange}
                        className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg ${
                          errors.orderId ? "border-2 border-yellow-400" : ""
                        }`}
                        placeholder="Enter your Amazon order number"
                        disabled={loading}
                      />
                      {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.orderId && (
                      <p className="mt-2 text-yellow-400 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.orderId}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className={`w-full md:w-auto px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg 
                    ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600 transform transition-all hover:scale-105"
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Validating...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="sticky top-8">
                <div className="relative h-[450px] md:h-[600px] lg:h-[700px] w-full">
                  <CustomizableImage
                    src={Photo1}
                    alt="Learning journey 1"
                    initialX={-10}
                    initialY={15}
                    initialRotation={-12}
                    width="58%"
                    minWidth="320px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                  <CustomizableImage
                    src={Photo2}
                    alt="Learning journey 2"
                    initialX={35}
                    initialY={10}
                    initialRotation={8}
                    width="60%"
                    minWidth="340px"
                    aspectRatio="4/3"
                    zIndex={10}
                  />
                  <CustomizableImage
                    src={Photo3}
                    alt="Learning journey 3"
                    initialX={15}
                    initialY={55}
                    initialRotation={-5}
                    width="65%"
                    minWidth="360px"
                    aspectRatio="4/3"
                    zIndex={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          <div className="order-2 lg:order-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            <div className="space-y-8 w-full">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                  CHOOSE YOUR <span className="text-blue-500">REWARD</span>
                </h1>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      Select Your Gift
                    </h3>
                    <select
                      value={selectedGift}
                      onChange={(e) => setSelectedGift(e.target.value)}
                      className={`w-full p-4 bg-blue-500 text-white rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-400 ${
                        errors.gift ? "border-2 border-yellow-400" : ""
                      }`}
                    >
                      <option value="">Choose your reward</option>
                      {giftOptions.map((gift) => (
                        <option key={gift.value} value={gift.value}>
                          {gift.label}
                        </option>
                      ))}
                    </select>
                    {errors.gift && (
                      <p className="mt-2 text-yellow-400">{errors.gift}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      How Would You Like to Share?
                      <span className="text-sm text-gray-500">
                        Make sure to take a screenshot of your review
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setReviewType("amazon");
                          window.open(
                            `https://www.amazon.com/review/create-review/?ie=UTF8&channel=glance-detail&asin=${asin}`,
                            "_blank"
                          );
                          setRecordedVideo(null);
                          setUploadedVideo(null);
                        }}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          reviewType === "amazon"
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-blue-500 text-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        <h4 className="text-xl font-semibold mb-2">
                          Amazon Review
                        </h4>
                        <p
                          className={
                            reviewType === "amazon"
                              ? "text-white"
                              : "text-gray-600"
                          }
                        >
                          Write a review on Amazon
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setReviewType("video");
                          setScreenshot(null);
                          setAmazonScreenshot(null);
                        }}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          reviewType === "video"
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-blue-500 text-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        <h4 className="text-xl font-semibold mb-2">
                          Video Review
                        </h4>
                        <p
                          className={
                            reviewType === "video"
                              ? "text-white"
                              : "text-gray-600"
                          }
                        >
                          Share a video testimonial
                        </p>
                      </button>
                    </div>

                    {reviewType === "video" && (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Record Video</h4>
            <div className="video-controls flex flex-wrap gap-3">
              {!permission ? (
                <button
                  onClick={getCameraPermission}
                  type="button"
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <FiVideo className="mr-2" />
                  Allow Camera
                </button>
              ) : null}
              {permission && recordingStatus === "inactive" ? (
                <button
                  onClick={startRecording}
                  type="button"
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <FiCamera className="mr-2" />
                  Start Recording
                </button>
              ) : null}
              {recordingStatus === "recording" ? (
                <button
                  onClick={stopRecording}
                  type="button"
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  <FiVideo className="mr-2" />
                  Stop Recording
                </button>
              ) : null}
            </div>
            
            <div className="video-preview mt-4">
              {!recordedVideo ? (
                <video
                  ref={liveVideoFeed}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video bg-black rounded-lg"
                ></video>
              ) : (
                <video
                  src={recordedVideo}
                  controls
                  className="w-full aspect-video bg-black rounded-lg"
                ></video>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-800">Upload Video</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FiUpload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600">Click to upload video</span>
              </label>
              {uploadedVideo && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {uploadedVideo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h4 className="text-xl font-semibold text-gray-800">Your Feedback</h4>
          <div className="space-y-4">
            <StarRating rating={rating} onRatingChange={setRating} />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share your experience with our product..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
    )}
                  </div>

                  {reviewType === "amazon" && (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-800">
            Upload Amazon Review Screenshot
          </h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
              id="screenshot-upload"
            />
            <label
              htmlFor="screenshot-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <FiUpload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600">Click to upload screenshot</span>
            </label>
            {amazonScreenshot && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(amazonScreenshot)}
                  alt="Review screenshot"
                  className="max-h-48 mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )}

                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => {
                        setReviewType(null);
                        setScreenshot(null);
                        setStep(step - 1);
                      }}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transform transition-all hover:scale-105"
                    >
                      {loading ? "Processing..." : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="sticky top-8">
              <div className="relative h-[450px] md:h-[600px] lg:h-[700px] w-full">
                <CustomizableImage
                  src={Photo2}
                  alt="Learning journey 1"
                  initialX={-10}
                  initialY={-3}
                  initialRotation={-12}
                  width="60%"
                  minWidth="320px"
                  aspectRatio="4/3"
                  zIndex={10}
                />
                <CustomizableImage
                  src={Photo1}
                  alt="Learning journey 2"
                  initialX={35}
                  initialY={1}
                  initialRotation={8}
                  width="60%"
                  minWidth="340px"
                  aspectRatio="4/3"
                  zIndex={30}
                />
                <CustomizableImage
                  src={Photo3}
                  alt="Learning journey 3"
                  initialX={15}
                  initialY={40}
                  initialRotation={-5}
                  width="65%"
                  minWidth="360px"
                  aspectRatio="4/3"
                  zIndex={20}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } else if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            <div className="order-2 lg:order-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="space-y-8 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                    SHIPPING <span className="text-blue-500">DETAILS</span>
                  </h1>

                  <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleInputChange}
                          className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg ${
                            errors.streetAddress
                              ? "border-2 border-yellow-400"
                              : ""
                          }`}
                          placeholder="Enter your street address"
                        />
                        {errors.streetAddress && (
                          <p className="mt-2 text-yellow-400">
                            {errors.streetAddress}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg ${
                            errors.city ? "border-2 border-yellow-400" : ""
                          }`}
                          placeholder="Enter city"
                          readOnly={loading}
                        />
                        {errors.city && (
                          <p className="mt-2 text-yellow-400">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <StateSelect
                          countryid={formData.country.id}
                          value={formData.state}
                          onChange={(value) =>
                            handleInputChange("state", value)
                          }
                          disabled={loading}
                          placeHolder="Select State"
                          className="w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.state && (
                          <p className="mt-2 text-yellow-400">
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-xl font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleZipCodeChange}
                            className={`w-full p-4 bg-blue-500 text-white placeholder-white/70 rounded-lg ${
                              errors.zipCode
                                ? "border-2 border-yellow-400"
                                : ""
                            }`}
                            placeholder="Enter ZIP code"
                            maxLength="5"
                            disabled={
                              !formData.city ||
                              !formData.state.name ||
                              loading
                            }
                          />
                          {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        {errors.zipCode && (
                          <p className="mt-2 text-yellow-400 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.zipCode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <PhoneInput
                          international={false}
                          defaultCountry="US"
                          value={formData.phoneNumber}
                          onChange={(value) =>
                            handleInputChange("phoneNumber", value)
                          }
                          className={`w-full p-4 bg-blue-500 text-white rounded-lg ${
                            errors.phoneNumber
                              ? "border-2 border-yellow-400"
                              : ""
                          }`}
                        />
                        {errors.phoneNumber && (
                          <p className="mt-2 text-yellow-400">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewType(null);
                          setScreenshot(null);
                          setStep(step - 1);
                        }}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transform transition-all hover:scale-105"
                      >
                        {loading ? "Processing..." : "Submit"}
                      </button>
                      {loading && <UploadProgress progress={uploadProgress} />}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="sticky top-8">
                <div className="relative h-[450px] md:h-[600px] lg:h-[700px] w-full">
                  <CustomizableImage
                    src={Photo4}
                    alt="Learning journey 1"
                    initialX={-5}
                    initialY={0}
                    initialRotation={-12}
                    width="55%"
                    minWidth="320px"
                    aspectRatio="4/3"
                    zIndex={10}
                  />
                  <CustomizableImage
                    src={Photo5}
                    alt="Learning journey 2"
                    initialX={35}
                    initialY={15}
                    initialRotation={8}
                    width="60%"
                    minWidth="340px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                  <CustomizableImage
                    src={Photo6}
                    alt="Learning journey 3"
                    initialX={-13}
                    initialY={40}
                    initialRotation={-5}
                    width="65%"
                    minWidth="360px"
                    aspectRatio="4/3"
                    zIndex={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            <div className="order-2 lg:order-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="space-y-8 w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                    THANK <span className="text-blue-500">YOU!</span>
                  </h1>
                  <div className="space-y-6">
                    <p className="text-xl text-gray-700">
                      We've received your submission and appreciate your
                      feedback!
                    </p>
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        What's Next?
                      </h3>
                      <ul className="space-y-4 text-gray-600">
                        <li className="flex items-start">
                          <svg
                            className="w-6 h-6 text-blue-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Our team will verify your submission within 2-3
                          business days
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="w-6 h-6 text-blue-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          You'll receive a confirmation email once approved
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="w-6 h-6 text-blue-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          Your gift will be shipped to the provided address
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="sticky top-8">
                <div className="relative h-[450px] md:h-[600px] lg:h-[700px] w-full">
                  <CustomizableImage
                    src={Photo2}
                    alt="Learning journey 1"
                    initialX={3}
                    initialY={-2}
                    initialRotation={-12}
                    width="58%"
                    minWidth="320px"
                    aspectRatio="4/3"
                    zIndex={10}
                  />
                  <CustomizableImage
                    src={Photo1}
                    alt="Learning journey 2"
                    initialX={35}
                    initialY={10}
                    initialRotation={8}
                    width="60%"
                    minWidth="340px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                  <CustomizableImage
                    src={Photo3}
                    alt="Learning journey 3"
                    initialX={0}
                    initialY={40}
                    initialRotation={-5}
                    width="65%"
                    minWidth="360px"
                    aspectRatio="4/3"
                    zIndex={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Form;

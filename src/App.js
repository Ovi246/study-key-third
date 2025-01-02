import { useCallback, useEffect, useState } from "react";
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
import CustomizableImage from "./CustomizableImg";

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

  useEffect(() => {
    async function fetchLocationAndSetLanguage() {
      try {
        const response = await axios.get("http://localhost:5000/api/location");
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
  //           `http://localhost:5000/product-reviews`,
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

  // ZIP code validation function using API
  const validateZipCode = async (zipCode, state, city) => {
    try {
      const response = await axios.get(
        `https://api.zippopotam.us/us/${zipCode}`
      );

      const zipData = response.data;

      // Check if ZIP matches state and city
      const matchesState = zipData.places.some(
        (place) => place.state.toLowerCase() === state.toLowerCase()
      );

      const matchesCity = zipData.places.some(
        (place) => place["place name"].toLowerCase() === city.toLowerCase()
      );

      if (!matchesState) {
        return `This ZIP code is not in ${state}`;
      }
      if (!matchesCity) {
        return `This ZIP code is not in ${city}`;
      }

      return null; // Return null if validation passes
    } catch (error) {
      if (error.response?.status === 404) {
        return "Invalid ZIP code";
      }
      return "Error validating ZIP code";
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Name is required";
      }
      // Email validation
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validator.isEmail(formData.email)) {
        newErrors.email = "Invalid email";
      }

      if (!formData.set) {
        newErrors.set = "Please select a Study Key set";
      }
      if (!formData.orderId) {
        newErrors.orderId = "Order ID is required";
      }
    }

    if (step === 2) {
      // Phone validation
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (
        !isPossiblePhoneNumber(formData.phoneNumber) ||
        !isValidPhoneNumber(formData.phoneNumber)
      ) {
        newErrors.phoneNumber = "Please enter a valid US phone number";
      }

      if (!formData.streetAddress)
        newErrors.streetAddress = "Street address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state?.name) newErrors.state = "State is required";
    }

    // ZIP code validation
    if (!formData.zipCode) {
      newErrors.zipCode = "ZIP code is required";
    } else if (formData.city && formData.state?.name) {
      const zipError = await validateZipCode(
        formData.zipCode,
        formData.state.name,
        formData.city
      );
      if (zipError) {
        newErrors.zipCode = zipError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ZIP code change handler
  const handleZipCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    handleInputChange("zipCode", value);

    // Only validate when ZIP code is complete
    if (value.length === 5 && formData.city && formData.state?.name) {
      const zipError = await validateZipCode(
        value,
        formData.state.name,
        formData.city
      );
      setErrors((prev) => ({
        ...prev,
        zipCode: zipError,
      }));
    }
  };

  const handleNextStep = async (event) => {
    event.preventDefault();

    if (step > 1) {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);
    if (step === 1) {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.post(
          "http://localhost:5000/validate-order-id",
          { orderId: formData.orderId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setAsin(response.data.asins[0]);
      } catch (error) {
        console.log(error?.response.status);
        if (error?.response.status === 400) {
          toast.error(
            "Order ID does not match. Please make sure to put the correct Amazon order number."
          );
        } else {
          toast.error("Internal server error! Please try again later!");
        }
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      setStep(step + 1);
      setCompletedSteps([...completedSteps, step]);
      setLoading(false);
    }, 1000); // simulate loading time
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
    if (step === 2) {
      try {
        // Wait for validateForm to complete since it's async now
        const isValid = await validateForm();

        if (!isValid) {
          toast.error("Please fill in all required fields");
          return;
        }

        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/submit-review",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          toast.success("Form submitted successfully!");
          setTimeout(() => {
            setStep(step + 1);
            setCompletedSteps([...completedSteps, step]);
            setLoading(false);
          }, 1000); // simulate loading time
        }
      } catch (error) {
        if (error.response.data.errorCode === "DUPLICATE_CLAIM") {
          toast.error("This order is already claimed a gift!");
          setTimeout(() => {
            setLoading(false);
          }, 500); // simulate loading time
        }
      }
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
        <div className="w-full mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 ">
            {/* Form Section */}
            <div className="order-1 self-center ">
              <form className="space-y-6 max-w-[800px]">
                <div>
                  <label htmlFor="name" className="block text-2xl mb-2">
                    NAME
                  </label>
                  <div className="w-full">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                        errors.fullName ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="FullName"
                      required
                    />
                    {errors.fullName && (
                      <p className="text-yellow-400 mt-1">{errors.fullName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-2xl mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.email ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="Email"
                    required
                  />
                  {errors.email && (
                    <p className="text-yellow-400 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="orderId" className="block text-2xl mb-2">
                    ORDER NUMBER
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.orderId ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="amazon order id"
                    required
                  />
                  {errors.orderId && (
                    <p className="text-yellow-400 mt-1">{errors.orderId}</p>
                  )}
                </div>
                <button
                  onClick={handleNextStep}
                  className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
                >
                  {loading ? "Loading..." : "Next"}
                </button>
              </form>
            </div>

            {/* Images Section */}
            <div className="order-1 lg:order-2 w-full">
              <div className="sticky top-8">
                <div className="relative h-[400px] md:h-[500px] lg:h-screen overflow-visible w-full mx-auto lg:mr-28">
                  <CustomizableImage
                    src={Photo2}
                    alt="Learning journey 1"
                    initialX={5}
                    initialY={-4}
                    initialRotation={3}
                    width="50%"
                    minWidth="400px"
                    aspectRatio="3/4"
                    zIndex={20}
                  />

                  {/* Middle Image */}
                  <CustomizableImage
                    src={Photo1}
                    alt="Learning journey 2"
                    initialX={40}
                    initialY={0}
                    initialRotation={20}
                    width="55%"
                    minWidth="400px"
                    aspectRatio="3/4"
                    zIndex={10}
                  />

                  {/* Bottom Image (Landscape) */}
                  <CustomizableImage
                    src={Photo3}
                    alt="Learning journey 3"
                    initialX={4}
                    initialY={50}
                    initialRotation={0}
                    width="65%"
                    minWidth="400px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
        <div className="w-full mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 ">
            {/* Form Section */}
            <div className="order-1 flex flex-col   md:text-start justify-center mb-5 md:gap-12">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 tracking-wide mb-6">
                YOUR LEARNING JOURNEY, REWARDED
              </h1>

              <form className="space-y-6 " onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-lg mb-2">
                      Country
                    </label>
                    <CountrySelect
                      id="country"
                      name="country"
                      value="United States"
                      onChange={(selectedOption) =>
                        handleInputChange("country", {
                          name: "United States",
                          id: 233,
                        })
                      }
                      disabled={true}
                      defaultValue={{ name: "United States", id: 233 }}
                      required
                      placeHolder="Select Country"
                      className={{
                        control: (state) =>
                          `!bg-red-500 !border-0 !min-h-[48px] !rounded ${
                            errors.country ? "!border-2 !border-yellow-400" : ""
                          }`,
                        singleValue: () => "!text-white",
                        placeholder: () => "!text-white/70",
                        input: () => "!text-white",
                        menu: () => "!bg-red-500 !mt-1",
                        option: () =>
                          "!text-white !bg-red-500 hover:!bg-red-600",
                        container: () => "!text-white",
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "0.5rem",
                          backgroundColor: "rgb(239 68 68)",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: errors.country
                              ? "#FBBF24"
                              : "transparent",
                          },
                        }),
                        indicatorSeparator: () => ({
                          display: "none",
                        }),
                        dropdownIndicator: (base) => ({
                          ...base,
                          color: "white",
                          "&:hover": {
                            color: "white",
                          },
                        }),
                      }}
                    />

                    {errors.country && (
                      <p className="text-yellow-400 mt-1">{errors.country}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="streetAddress"
                      className="block text-lg mb-2"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        handleInputChange(e.target.name, e.target.value)
                      }
                      className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                        errors.streetAddress ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="Street address"
                      required
                    />
                    {errors.streetAddress && (
                      <p className="text-yellow-400 mt-1">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-lg mb-2">
                      State/Province
                    </label>
                    <StateSelect
                      id="state"
                      name="state"
                      countryid={233}
                      value={formData.state.name}
                      onChange={(selectedOption) =>
                        handleInputChange("state", {
                          name: selectedOption.name,
                          id: selectedOption.id,
                        })
                      }
                      className={`w-full p-3 bg-red-500 text-white rounded ${
                        errors.state ? "border-2 border-yellow-400" : ""
                      }`}
                      required
                      placeHolder="Select State"
                    />
                    {errors.state && (
                      <p className="text-yellow-400 mt-1">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-lg mb-2">
                      City
                    </label>
                    <CitySelect
                      id="city"
                      name="city"
                      countryid={233}
                      stateid={formData.state?.id}
                      value={formData.city}
                      onChange={(selectedOption) =>
                        handleInputChange("city", selectedOption.name)
                      }
                      className={`w-full p-3 bg-red-500 text-white rounded ${
                        errors.city ? "border-2 border-yellow-400" : ""
                      }`}
                      required
                      placeHolder="Select City"
                    />
                    {errors.city && (
                      <p className="text-yellow-400 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-lg mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      maxLength="5"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                        errors.zipCode ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="ZIP code"
                      required
                    />
                    {errors.zipCode && (
                      <p className="text-yellow-400 mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-lg mb-2">
                      Phone Number
                    </label>
                    <PhoneInput
                      international={false}
                      defaultCountry="US"
                      countrySelectProps={{ disabled: true }}
                      value={formData.phoneNumber}
                      onChange={(value) => {
                        handleInputChange("phoneNumber", value);

                        if (value) {
                          const isValid =
                            isPossiblePhoneNumber(value) &&
                            isValidPhoneNumber(value);
                          setErrors((prev) => ({
                            ...prev,
                            phoneNumber: isValid
                              ? null
                              : "Please enter a valid US phone number",
                          }));
                        }
                      }}
                      className={`w-full  bg-red-500 text-white rounded ${
                        errors.phoneNumber ? "border-2 border-yellow-400" : ""
                      }`}
                      placeholder="(XXX) XXX-XXXX"
                      numberInputProps={{
                        className: "phone-input-field",
                        pattern: "[0-9()\\-. ]+", // Fixed pattern with escaped hyphen
                      }}
                      required
                    />

                    {errors.phoneNumber && (
                      <p className="text-yellow-400 mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>

            {/* Images Section */}
            <div className="order-1 lg:order-2 w-full">
              <div className="sticky top-8">
                <div className="relative h-[400px] md:h-[500px] lg:h-screen overflow-visible w-full mx-auto lg:mr-28">
                  <CustomizableImage
                    src={Photo2}
                    alt="Learning journey 1"
                    initialX={5}
                    initialY={-4}
                    initialRotation={3}
                    width="50%"
                    minWidth="400px"
                    aspectRatio="3/4"
                    zIndex={20}
                  />

                  {/* Middle Image */}
                  <CustomizableImage
                    src={Photo1}
                    alt="Learning journey 2"
                    initialX={40}
                    initialY={0}
                    initialRotation={20}
                    width="55%"
                    minWidth="400px"
                    aspectRatio="3/4"
                    zIndex={10}
                  />

                  {/* Bottom Image (Landscape) */}
                  <CustomizableImage
                    src={Photo3}
                    alt="Learning journey 3"
                    initialX={4}
                    initialY={50}
                    initialRotation={0}
                    width="65%"
                    minWidth="400px"
                    aspectRatio="4/3"
                    zIndex={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      // <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      //   <div className="max-w-6xl w-full flex flex-col md:flex-row items-center md:items-start">
      //     <div className="md:w-2/3 space-y-6 text-center md:text-left">
      //       <h1 className="text-4xl font-bold">
      //         Thank you, {formData.name}!
      //       </h1>
      //       <p className="text-xl">
      //         I'm so excited for you to use it! I'll personally make sure
      //         everything goes smoothly.
      //       </p>
      //       <p className="text-lg">
      //         It's a beautiful day! Please let me know how I did with your
      //         current set. Your honest feedback helps me create better
      //         learning tools for learners like you.
      //       </p>
      //       <p className="text-lg">
      //         I'd love to hear your ideas and thoughts.
      //       </p>
      //       <button
      //         onClick={() =>
      //           window.open(
      //             `https://www.amazon.com/review/create-review/?ie=UTF8&channel=glance-detail&asin=${asin}`,
      //             "_blank"
      //           )
      //         }
      //         className="block w-full bg-red-500 text-white text-center py-3 rounded-lg text-xl font-semibold hover:bg-red-600 transition duration-300"
      //       >
      //         Share my feedback
      //       </button>
      //       <p className="text-gray-600">This will NOT affect your gift.</p>
      //     </div>
      //     <div className="md:w-1/3 relative h-64 md:h-auto">
      //       <div className="absolute top-0 right-0 w-48 h-48 transform rotate-12">
      //         {/* <img
      //           src={Photo5}
      //           width={250}
      //           height={300}
      //           alt="I understand"
      //           layout="fill"
      //           objectFit="contain"
      //           className="rounded-lg shadow-md"
      //         />
      //       </div>
      //       <div className="absolute top-16 right-16 w-48 h-48 transform -rotate-6">
      //         <img
      //           src={Photo6}
      //           alt="I understand"
      //           width={250}
      //           height={300}
      //           layout="fill"
      //           objectFit="contain"
      //         /> */}
      //       </div>
      //     </div>
      //   </div>
      // </div>

      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={Intro}
            alt="Study Key Flashcards Bundle"
            className="w-full h-full object-cover scale-75 translate-x-24 translate-y-24 transform origin-center 
                sm:scale-75 sm:translate-x-16 sm:translate-y-16
                md:scale-75 md:translate-x-24 md:translate-y-24
                lg:scale-75 lg:translate-x-24 lg:translate-y-24"
          />
        </div>
        <div
          className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16 
            max-w-[90%] sm:max-w-[80%] md:max-w-xl lg:max-w-4xl 
            rounded-br-3xl"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 leading-tight">
            WE'RE SO GRATEFUL TO HAVE YOU AS PART OF OUR COMMUNITY!
          </h1>
          <button
            onClick={claimReward}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold 
              py-2 px-4 sm:py-2.5 sm:px-5 md:py-3 md:px-6 
              text-base sm:text-lg md:text-lg lg:text-lg 
              rounded-md shadow-lg transform transition hover:scale-105"
          >
            SEND ME MY FREE GIFT!
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
      <div className="max-w-fit w-full mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 ">
          {/* Form Section */}
          <div className="order-1 flex flex-col items-center text-center md:text-start md:items-start justify-center md:gap-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 tracking-wide mb-6">
              YOUR LEARNING JOURNEY, REWARDED
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 leading-relaxed mb-8">
              THANK YOU FOR YOUR DEDICATION TO GROWTH AND LEARNING. YOUR
              KINDNESS AND TRUST INSPIRE US, AND WE'RE EXCITED TO RETURN THE
              FAVOR BY OFFERING YOU A FREE PRODUCT OF YOUR CHOICE. LET'S
              CONTINUE THIS JOURNEY TOGETHER.
            </p>
            <button
              onClick={handleNextStep}
              className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300 mb-5"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </div>

          {/* Images Section */}
          <div className="order-1 lg:order-2 w-full">
            <div className="sticky top-8">
              <div className="relative h-[400px] md:h-[500px] lg:h-screen overflow-visible w-full mx-auto lg:mr-28">
                <CustomizableImage
                  src={Photo2}
                  alt="Learning journey 1"
                  initialX={5}
                  initialY={-4}
                  initialRotation={3}
                  width="50%"
                  minWidth="400px"
                  aspectRatio="3/4"
                  zIndex={20}
                />

                {/* Middle Image */}
                <CustomizableImage
                  src={Photo1}
                  alt="Learning journey 2"
                  initialX={40}
                  initialY={0}
                  initialRotation={20}
                  width="55%"
                  minWidth="400px"
                  aspectRatio="3/4"
                  zIndex={10}
                />

                {/* Bottom Image (Landscape) */}
                <CustomizableImage
                  src={Photo3}
                  alt="Learning journey 3"
                  initialX={4}
                  initialY={50}
                  initialRotation={0}
                  width="65%"
                  minWidth="400px"
                  aspectRatio="4/3"
                  zIndex={30}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;

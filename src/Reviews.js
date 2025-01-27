import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { motion } from "framer-motion";

// Dummy reviews data
const dummyReviews = [
  {
    id: 1,
    fullName: "Sarah Johnson",
    country: "United States",
    rating: 5,
    review: "This educational product exceeded my expectations! The content is well-structured and easy to follow. I've seen significant improvement in my understanding of the subject matter.",
    media: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846",
    mediaType: "image"
  },
  {
    id: 2,
    fullName: "Marco Rossi",
    country: "Italy",
    rating: 4,
    review: "Great learning experience! The interactive elements really helped me grasp complex concepts. Would definitely recommend to others.",
    media: null
  },
  {
    id: 3,
    fullName: "Emma Thompson",
    country: "United Kingdom",
    rating: 5,
    review: "Absolutely brilliant! The course material is comprehensive and the support is outstanding. I'm already seeing results in my daily work.",
    media: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    mediaType: "image"
  },
  {
    id: 4,
    fullName: "John Smith",
    country: "Canada",
    rating: 5,
    review: "The quality of education provided is top-notch. I particularly enjoyed the practical examples and real-world applications.",
    media: null
  },
  {
    id: 5,
    fullName: "Maria Garcia",
    country: "Spain",
    rating: 4,
    review: "Very well organized content with excellent teaching methodology. The visual aids and practice exercises were particularly helpful.",
    media: null
  },
  {
    id: 6,
    fullName: "David Chen",
    country: "Singapore",
    rating: 5,
    review: "Outstanding educational material! The step-by-step approach made learning complex topics much easier. Highly recommended!",
    media: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    mediaType: "image"
  }
];

function Reviews() {
  const ReviewCard = ({ review }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{review.fullName}</h3>
          <p className="text-gray-600">{review.country}</p>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => (
            <FiStar
              key={index}
              className={`w-5 h-5 ${
                index < review.rating 
                  ? "text-yellow-400 fill-current" 
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed">{review.review}</p>
      {review.media && (
        <div className="mt-4">
          <img
            src={review.media}
            alt="Review"
            className="rounded-lg w-full h-48 object-cover"
          />
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Customer <span className="text-blue-500">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers are saying about their learning journey with our educational products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reviews; 
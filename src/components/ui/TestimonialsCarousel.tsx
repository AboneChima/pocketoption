'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Professional Trader",
    content: "PocketOption has transformed my trading experience. The platform is intuitive, fast, and reliable. I've been using it for over a year and couldn't be happier with the results.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Investment Analyst",
    content: "The analytical tools and real-time data on PocketOption are exceptional. It's helped me make more informed trading decisions and improve my overall performance.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
    date: "2024-01-10"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Day Trader",
    content: "What I love most about PocketOption is the user-friendly interface and the variety of assets available. The customer support is also top-notch.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
    date: "2024-01-08"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Financial Advisor",
    content: "I recommend PocketOption to all my clients. The platform's security features and transparent pricing make it a trustworthy choice for trading.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
    date: "2024-01-05"
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Crypto Enthusiast",
    content: "The cryptocurrency trading options on PocketOption are fantastic. The execution speed is impressive and the fees are very competitive.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
    date: "2024-01-03"
  }
];

const TestimonialsCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
      {/* Main Testimonial Card */}
      <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 rounded-xl p-8 border border-blue-400/20 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-4">
            {renderStars(testimonials[currentSlide].rating)}
          </div>

          {/* Testimonial Content */}
          <blockquote className="text-lg text-gray-100 mb-6 leading-relaxed max-w-3xl">
            "{testimonials[currentSlide].content}"
          </blockquote>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {testimonials[currentSlide].name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="font-semibold text-white text-lg">
                {testimonials[currentSlide].name}
              </div>
              <div className="text-blue-200 text-sm">
                {testimonials[currentSlide].role}
              </div>
              <div className="text-gray-400 text-xs">
                {new Date(testimonials[currentSlide].date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white transition-all duration-300 hover:scale-110"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white transition-all duration-300 hover:scale-110"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Simple Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-blue-400 w-6'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
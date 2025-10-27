"use client"
import React from 'react'
import { 
  X, 
  Play, 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  Award,
  CheckCircle,
  Globe,
  Smartphone,
  Trophy,
  FileText,
  Video,
  Download,
  Infinity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface CoursePreviewModalProps {
  course: {
    id: string
    title: string
    instructor: string
    thumbnail: string
    rating: number
    studentsCount: number
    duration: string
    lessonsCount: number
    level: string
    category: string
    tags: string[]
    description: string
    price: number
    enrolled?: boolean
  }
  isOpen: boolean
  onClose: () => void
  onEnroll?: () => void
}

export default function CoursePreviewModal({ course, isOpen, onClose, onEnroll }: CoursePreviewModalProps) {
  if (!isOpen) return null

  // Mock data for course details (in production, fetch from API)
  const courseDetails = {
    whatYouWillLearn: [
      'Master the fundamentals and advanced concepts',
      'Build real-world projects from scratch',
      'Understand best practices and industry standards',
      'Get hands-on experience with practical exercises'
    ],
    requirements: [
      'Basic computer skills',
      'Internet connection',
      'Willingness to learn'
    ],
    curriculum: [
      {
        title: 'Introduction',
        lessons: 5,
        duration: '45 min',
        items: [
          { title: 'Welcome to the course', duration: '5 min', preview: true },
          { title: 'Course overview', duration: '10 min', preview: true },
          { title: 'Setting up your environment', duration: '15 min', preview: false },
          { title: 'First steps', duration: '10 min', preview: false },
          { title: 'Resources and materials', duration: '5 min', preview: false }
        ]
      },
      {
        title: 'Core Concepts',
        lessons: 8,
        duration: '2h 15min',
        items: [
          { title: 'Understanding the basics', duration: '20 min', preview: false },
          { title: 'Deep dive into fundamentals', duration: '25 min', preview: false }
        ]
      },
      {
        title: 'Advanced Topics',
        lessons: 12,
        duration: '3h 30min',
        items: [
          { title: 'Advanced techniques', duration: '30 min', preview: false },
          { title: 'Real-world applications', duration: '35 min', preview: false }
        ]
      }
    ],
    instructor: {
      name: course.instructor,
      title: 'Expert Instructor',
      rating: 4.7,
      students: 50000,
      courses: 15,
      bio: 'Passionate educator with years of industry experience. Dedicated to helping students achieve their learning goals.'
    },
    features: [
      { icon: Video, text: `${course.lessonsCount} on-demand video lectures` },
      { icon: FileText, text: 'Downloadable resources' },
      { icon: Infinity, text: 'Full lifetime access' },
      { icon: Smartphone, text: 'Access on mobile and desktop' },
      { icon: Award, text: 'Certificate of completion' },
      { icon: Download, text: 'Downloadable materials' }
    ]
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Hero Section */}
          <div className="relative h-80 bg-gradient-to-r from-gray-900 to-gray-800">
            {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
              <div className="relative w-full h-full">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover opacity-40"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white opacity-30" />
              </div>
            )}
            
            {/* Course Info Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#ed874a] text-white text-xs px-3 py-1 rounded-full font-medium">
                      {course.category.toUpperCase()}
                    </span>
                    <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {course.level}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                  
                  <p className="text-gray-200 text-lg mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-6 text-white mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1 fill-yellow-400" />
                      <span className="font-bold mr-1">{course.rating}</span>
                      <span className="text-gray-300">({course.studentsCount.toLocaleString()} ratings)</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-1" />
                      <span>{course.studentsCount.toLocaleString()} students</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-200">
                    <span>Created by</span>
                    <span className="text-[#ed874a] font-medium underline cursor-pointer hover:text-[#d76f32]">
                      {courseDetails.instructor.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courseDetails.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course content</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{courseDetails.curriculum.length} sections</span>
                  <span>•</span>
                  <span>{course.lessonsCount} lectures</span>
                  <span>•</span>
                  <span>{course.duration} total length</span>
                </div>
                
                <div className="space-y-2">
                  {courseDetails.curriculum.map((section, index) => (
                    <details key={index} className="border border-gray-200 rounded-lg">
                      <summary className="cursor-pointer p-4 hover:bg-gray-50 font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{section.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {section.lessons} lectures • {section.duration}
                        </span>
                      </summary>
                      <div className="border-t border-gray-200">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{item.title}</span>
                              {item.preview && (
                                <span className="text-xs text-[#ed874a] font-medium">Preview</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{item.duration}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {courseDetails.requirements.map((req, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="mr-2">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>

              {/* Instructor */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ed874a] to-[#d76f32] flex items-center justify-center text-white text-3xl font-bold">
                    {courseDetails.instructor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{courseDetails.instructor.name}</h3>
                    <p className="text-gray-600 mb-3">{courseDetails.instructor.title}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                        <span>{courseDetails.instructor.rating} Instructor Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{courseDetails.instructor.students.toLocaleString()} Students</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        <span>{courseDetails.instructor.courses} Courses</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{courseDetails.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Price Card */}
                <div className="border border-gray-200 rounded-lg p-6 shadow-lg">
                  <div className="text-center mb-6">
                    {course.price > 0 ? (
                      <>
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                          ${course.price}
                        </div>
                        <div className="text-sm text-gray-500 line-through">$99.99</div>
                        <div className="text-sm text-red-600 font-medium">70% off</div>
                      </>
                    ) : (
                      <div className="text-4xl font-bold text-green-600 mb-1">Free</div>
                    )}
                  </div>

                  {course.enrolled ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 mb-3"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Go to Course
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="w-full bg-[#ed874a] hover:bg-[#d76f32] mb-3"
                        size="lg"
                        onClick={onEnroll}
                      >
                        {course.price > 0 ? 'Buy Now' : 'Enroll for Free'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full mb-3"
                        size="lg"
                      >
                        Add to Cart
                      </Button>
                    </>
                  )}

                  <div className="text-center text-sm text-gray-600 mb-4">
                    30-Day Money-Back Guarantee
                  </div>

                  {/* This course includes */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-bold text-gray-900 mb-3">This course includes:</h3>
                    <div className="space-y-3">
                      {courseDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <feature.icon className="w-4 h-4 mr-3 text-gray-500" />
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <button className="text-sm text-gray-600 hover:text-[#ed874a] font-medium">
                        Share
                      </button>
                      <button className="text-sm text-gray-600 hover:text-[#ed874a] font-medium">
                        Gift this course
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{course.studentsCount.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Students Enrolled</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{course.rating}</div>
                      <div className="text-xs text-gray-600">Course Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

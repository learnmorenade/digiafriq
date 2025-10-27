"use client"
import Squares from "../components/Squares"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Monitor, Globe, Smartphone, Star, CheckCircle, ArrowRight, Users, Award, MapPin, Clock, BookOpen, Zap, Shield, Target, ChevronDown, HelpCircle } from "lucide-react"

const courses = [
  { title: "Digital Marketing Mastery", description: "SEO, social media, content strategy", icon: TrendingUp, duration: "8 weeks", level: "Beginner–Advanced", image: "/courses/digital-marketing.jpg" },
  { title: "Web Development Bootcamp", description: "HTML, CSS, JavaScript, React", icon: Monitor, duration: "12 weeks", level: "Beginner", image: "/courses/web-development.jpg" },
  { title: "Data Analytics & Viz", description: "Excel, Python, dashboards", icon: Globe, duration: "10 weeks", level: "Intermediate", image: "/courses/data-analytics.jpg" },
  { title: "Mobile App Development", description: "iOS and Android apps", icon: Smartphone, duration: "14 weeks", level: "Advanced", image: "/courses/mobile-development.jpg" },
]

const testimonials = [
  { name: "Kwame Asante", role: "Digital Marketer", content: "DigiAfriq transformed my career. The courses are practical and the support is amazing.", rating: 5, location: "Accra" },
  { name: "Fatima Ibrahim", role: "Web Developer", content: "I built my first professional website in 6 weeks. Now I'm freelancing full-time!", rating: 5, location: "Lagos" },
  { name: "David Mwangi", role: "Affiliate Marketer", content: "I earned over $2000 in commissions while still learning. Best investment I ever made.", rating: 5, location: "Nairobi" },
]

const steps = [
  { number: "01", title: "Join DigiAfriq", description: "Pay 100 cedis annually for full access" },
  { number: "02", title: "Learn Digital Skills", description: "Start any course at your own pace" },
  { number: "03", title: "Earn as Affiliate", description: "Keep 100% commission on each sale" },
]

const features = [
  { icon: BookOpen, title: "Unlimited Course Access", description: "Access all courses with one annual subscription of 100 cedis" },
  { icon: Clock, title: "Learn at Your Pace", description: "Self-paced learning that fits your schedule and lifestyle" },
  { icon: Users, title: "Community Support", description: "Join thousands of learners across Africa" },
  { icon: Award, title: "Practical Skills", description: "Hands-on projects that build real-world expertise" },
  { icon: Zap, title: "Earn While Learning", description: "Optional affiliate program to monetize your journey" },
  { icon: Shield, title: "Lifetime Updates", description: "Course content updated regularly with industry trends" },
]

const stats = [
  { number: "15,000+", label: "Active Learners", icon: Users },
  { number: "50+", label: "Skills & Courses", icon: BookOpen },
  { number: "20", label: "African Countries", icon: MapPin },
  { number: "95%", label: "Success Rate", icon: Target },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden h-auto sm:h-[90vh] flex items-center justify-center py-16 sm:py-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#e5e7eb"
          hoverFillColor="#ed874a"
          className="z-0"
        />

        {/* Hero Content */}
        <div className="mx-auto max-w-3xl px-6 text-center relative z-10">
          <p className="uppercase text-sm font-semibold tracking-wide text-[#ed874a] mb-2 sm:mb-3">
            Build Skills. Apply Knowledge. Grow Your Potential.
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-snug text-gray-900 mb-2 sm:mb-4">
            The best way to learn <br className="hidden sm:block" /> digital skills and grow
          </h1>
          <p className="text-lg text-gray-600 mb-4 sm:mb-6">
            DigiAfriq helps you master in-demand digital skills, build confidence in applying them, and, through our affiliate program, explore ways to earn from your knowledge
          </p>
          <Button
            size="lg"
            className="bg-[#ed874a] text-white hover:bg-[#d76f32] px-6 py-3 rounded-md font-semibold"
            asChild
          >
            <Link href="/signup">Join DigiAfriq Today</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-gray-600">
              Unlock Your Earning Potential Today
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Stats Column */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="border-l-4 border-[#ed874a] pl-6"
              >
                <div className="text-4xl font-bold text-[#ed874a] mb-2">15,000+</div>
                <div className="text-lg text-gray-700 font-medium">Active Learners</div>
                <div className="w-24 h-1 bg-gray-200 mt-2"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="border-l-4 border-[#ed874a] pl-6"
              >
                <div className="text-4xl font-bold text-[#ed874a] mb-2">50+</div>
                <div className="text-lg text-gray-700 font-medium">High Quality Courses</div>
                <div className="w-24 h-1 bg-gray-200 mt-2"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border-l-4 border-[#ed874a] pl-6"
              >
                <div className="text-4xl font-bold text-[#ed874a] mb-2">20+</div>
                <div className="text-lg text-gray-700 font-medium">African Countries</div>
                <div className="w-24 h-1 bg-gray-200 mt-2"></div>
              </motion.div>
            </div>

            {/* World Map Column */}
<div className="relative">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="relative"
  >
    {/* World Map Image */}
    <img 
      src="/world-map-with-pins.png" 
      alt="DigiAfriq Global Reach - World Map with Location Pins"
      className="w-full max-w-6xl h-auto mx-auto scale-110" 
    />
  </motion.div>
</div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Why Choose DigiAfriq?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re more than just a learning platform. We&apos;re your partner in digital transformation across Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-[#ed874a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-[#ed874a]" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Master In-Demand Skills
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive library of practical courses designed for the African digital economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md overflow-hidden">
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <course.icon className="w-5 h-5 text-[#ed874a]" />
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-gray-600 mb-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </span>
                      <span className="bg-[#ed874a]/10 text-[#ed874a] px-2 py-1 rounded-full text-xs">
                        {course.level}
                      </span>
                    </div>
                    
                    {/* View Details Button */}
                    <Button 
                      className="w-full bg-[#ed874a] hover:bg-[#d76f32] text-white font-medium"
                      asChild
                    >
                      <Link href={`/courses/${course.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              className="bg-[#ed874a] text-white hover:bg-[#d76f32] px-8 py-3"
              asChild
            >
              <Link href="/courses">
                Explore All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Quality education shouldn&apos;t break the bank. Get unlimited access to everything.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Main Access Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="relative border-2 border-[#ed874a] shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#ed874a] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-bold">Full Access Plan</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-[#ed874a]">100</span>
                    <span className="text-xl text-gray-600 ml-1">cedis</span>
                    <div className="text-sm text-gray-500 mt-1">per year</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited access to all courses",
                      "New courses added monthly",
                      "Community support access",
                      "Mobile app access",
                      "Certificate of completion",
                      "Lifetime course updates"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#ed874a] hover:bg-[#d76f32] text-white font-semibold py-3" asChild>
                    <Link href="/signup">Get Started Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Affiliate Opportunity Section */}
      <section className="py-20 bg-gradient-to-r from-[#ed874a]/5 to-[#d76f32]/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Our Affiliate Program
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join our affiliate program and turn your learning journey into a profitable venture. Help others discover DigiAfriq while earning generous commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Benefits */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ed874a] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">100₵</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn 100 Cedis Per Sale</h3>
                    <p className="text-gray-600">Keep 100%  of your commissions with no hidden fees or deductions for the first year. Every successful learner puts 100 cedis directly in your pocket.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ed874a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sales Targets</h3>
                    <p className="text-gray-600">Work at your own pace with no pressure. Whether you share the opportunity with 1 person or 100, you earn the same generous commission rate.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ed874a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Support</h3>
                    <p className="text-gray-600">Get access to professional marketing materials, social media content, and proven strategies to maximize your success.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ed874a] rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
                    <p className="text-gray-600">Monitor your referrals, track your earnings, and get paid promptly with our transparent affiliate dashboard.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:pl-8"
            >
              <Card className="border-2 border-[#ed874a]/20 shadow-xl bg-white">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#ed874a] to-[#d76f32] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">Start Earning Today</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Join thousands of successful affiliates across Africa who are earning while helping others learn digital skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-[#ed874a]/10 rounded-lg p-6 mb-6">
                    <div className="text-3xl font-bold text-[#ed874a] mb-2">Potential Monthly Earnings</div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>5 sales/month:</span>
                        <span className="font-semibold">500 cedis</span>
                      </div>
                      <div className="flex justify-between">
                        <span>10 sales/month:</span>
                        <span className="font-semibold">1000 cedis</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>20 sales/month:</span>
                        <span className="font-bold text-[#ed874a]">2,000 cedis</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full bg-[#ed874a] hover:bg-[#d76f32] text-white font-semibold py-3 mb-4"
                    asChild
                  >
                    <Link href="/affiliate">
                      Join Affiliate Program
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500">
                    One-time setup fee applies. Start earning immediately after approval.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Success Stories from Africa
            </h2>
            <p className="text-lg text-gray-600">
              Real results from real people across the continent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {testimonial.location}
                      </div>
                    </div>
                    <CardDescription className="text-gray-700 text-base italic leading-relaxed mb-4">
                      &ldquo;{testimonial.content}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#ed874a]/10 rounded-full flex items-center justify-center mr-3">
                        <span className="font-semibold text-[#ed874a]">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              See some of the questions people are asking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-[#ed874a]/10 to-[#d76f32]/10 rounded-full flex items-center justify-center">
                  <div className="w-60 h-60 bg-[#ed874a] rounded-full flex items-center justify-center relative overflow-hidden">
                    <span className="text-white text-8xl font-bold">?</span>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-8 right-8 w-8 h-8 bg-[#ed874a]/20 rounded-lg rotate-12"></div>
                <div className="absolute bottom-12 left-4 w-6 h-6 bg-[#d76f32]/30 rounded-full"></div>
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-[#ed874a]/40 rounded-full"></div>
              </div>
            </motion.div>

            {/* Right Column - FAQ Items */}
            <div className="space-y-4">
              {[
                {
                  question: "What is DigiAfriq all about?",
                  answer: "DigiAfriq is Africa's leading digital skills platform that offers comprehensive courses in digital marketing, web development, data analytics, and mobile app development. We provide practical, hands-on training designed specifically for the African market, with an optional affiliate program that lets you earn while you learn."
                },
                {
                  question: "How am I sure that the courses on DigiAfriq will deliver?",
                  answer: "Our courses are designed by industry experts with real-world experience. We offer practical projects, lifetime updates, community support, and a 100% satisfaction guarantee. Plus, with over 15,000 active learners and a 95% success rate, our track record speaks for itself."
                },
                {
                  question: "How is commission shared in the affiliate program?",
                  answer: "As an affiliate, you keep 100% of your commissions with no hidden fees or deductions for the first year. You earn 100 cedis for every successful referral. We provide real-time tracking, marketing materials, and dedicated support to help you succeed."
                },
                {
                  question: "Can I access courses on mobile devices?",
                  answer: "Yes! All our courses are fully optimized for mobile devices. You can learn on-the-go using your smartphone or tablet, with offline download options available for uninterrupted learning even without internet connection."
                },
                {
                  question: "What support do I get as a learner?",
                  answer: "You get access to our vibrant community of learners, direct support from instructors, regular live Q&A sessions, and lifetime updates to course content. Our support team is available to help you succeed throughout your learning journey."
                },
                {
                  question: "How quickly can I start earning as an affiliate?",
                  answer: "Once approved (usually within 24-48 hours), you can start earning immediately. We provide you with marketing materials, your unique referral links, and access to our affiliate dashboard to track your progress and earnings in real-time."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <details className="group bg-gray-50 rounded-lg border border-gray-200 hover:border-[#ed874a]/30 transition-colors">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#ed874a] transition-colors">
                        {faq.question}
                      </h3>
                      <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-[#ed874a] transition-all duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-6">Still have questions? We&apos;re here to help!</p>
            <Button
              size="lg"
              variant="outline"
              className="border-[#ed874a] text-[#ed874a] hover:bg-[#ed874a] hover:text-white px-8 py-3"
              asChild
            >
              <Link href="/contact">
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Latest Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-lg text-gray-600">
              Stay updated with the latest insights, tips, and success stories from the digital world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                date: "16 Sep 2025",
                title: "Make money as International Students",
                excerpt: "Studying abroad is exciting—but it can also be expensive. Between tuition, accommodation, food, and...",
                image: "/blog/international-students.jpg",
                slug: "make-money-as-international-students"
              },
              {
                date: "16 Jun 2025",
                title: "The UMM Super Win Challenge is HERE! 🎯 💖",
                excerpt: "Are you ready to turn your hustle into massive wins? 💰 This is your chance to show up, sell hard,...",
                image: "/blog/umm-super-win-challenge.jpg",
                slug: "umm-super-win-challenge"
              },
              {
                date: "12 Dec 2024",
                title: "Introducing the BIG FISH CHALLENGE: Your Path to...",
                excerpt: "Big Fish Challenge: Transform Your Success Story body { font-family: Ari...",
                image: "/blog/big-fish-challenge.jpg",
                slug: "big-fish-challenge"
              }
            ].map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md overflow-hidden bg-white">
                  {/* Blog Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <div className="flex items-center text-sm text-[#ed874a] font-medium">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.date}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#ed874a] transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      className="text-[#ed874a] hover:text-[#d76f32] hover:bg-[#ed874a]/5 p-0 h-auto font-medium"
                      asChild
                    >
                      <Link href={`/blog/${post.slug}`} className="flex items-center">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Blogs CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              className="bg-[#ed874a] hover:bg-[#d76f32] text-white px-8 py-3"
              asChild
            >
              <Link href="/blog">
                View All Blog Posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
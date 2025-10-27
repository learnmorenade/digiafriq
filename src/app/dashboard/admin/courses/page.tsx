"use client"
import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  DollarSign,
  Users,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminDashboardLayout from '@/components/dashboard/AdminDashboardLayout'
import { supabase } from '@/lib/supabase/client'

interface Module {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: Lesson[]
}

interface Lesson {
  id?: string
  title: string
  description: string
  type: string
  content_url: string
  video_url: string
  instructor_notes: string
  duration: string
  order_index: number
}

interface Course {
  id?: string
  title: string
  description: string
  price: number
  instructor: string
  thumbnail_url: string | null
  status: string  // UI state: 'draft' or 'published'
  is_published?: boolean  // Database field
  category: string
  level: string
  duration: string
  enrollment_limit?: number
  prerequisites?: string
  certificate_info?: string
  license_info?: string
  tags: string[]
  is_featured?: boolean
  created_at?: string
  modules: Module[]
}

const CoursesManagement = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, statusFilter, categoryFilter, courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Map is_published to status for UI
      const mappedData = (data || []).map((course: any) => ({
        ...course,
        status: course.is_published ? 'published' : 'draft'
      }))
      
      setCourses(mappedData)
    } catch (error: any) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    setFilteredCourses(filtered)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const { error } = await (supabase as any)
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error
      
      setCourses(courses.filter(c => c.id !== courseId))
      alert('Course deleted successfully')
    } catch (error: any) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    const isPublished = newStatus === 'published'

    try {
      const { error } = await (supabase as any)
        .from('courses')
        .update({ is_published: isPublished })
        .eq('id', courseId)

      if (error) throw error
      
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: newStatus, is_published: isPublished } : c))
      alert(`Course ${isPublished ? 'published' : 'unpublished'} successfully`)
    } catch (error: any) {
      console.error('Error updating course status:', error)
      alert('Failed to update course status')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'archived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-100 text-blue-700'
      case 'Intermediate': return 'bg-purple-100 text-purple-700'
      case 'Advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const openCreate = () => {
    setEditingCourse(null)
    setForm({
      title: '',
      description: '',
      price: 0,
      instructor: '',
      category: 'marketing',
      level: 'Beginner',
      thumbnail_url: null,
      status: 'draft',
      duration: '',
      tags: [],
      modules: []
    })
    setShowAddModal(true)
  }

  const openEdit = async (course: Course) => {
    setEditingCourse(course)
    setLoading(true)
    
    try {
      // Fetch modules with lessons for this course
      const { data: modules, error: modulesError } = await (supabase as any)
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', course.id)
        .order('order_index', { ascending: true })

      if (modulesError) {
        console.error('Error loading modules:', modulesError)
        throw modulesError
      }

      // Transform the data to match the form structure
      const formattedModules = (modules || []).map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order_index: mod.order_index,
        lessons: (mod.course_lessons || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            content_url: lesson.content_url,
            video_url: lesson.video_url,
            instructor_notes: lesson.instructor_notes,
            duration: lesson.duration,
            order_index: lesson.order_index
          }))
      }))

      console.log('✅ Loaded modules for editing:', formattedModules)

      // Map is_published to status for form
      setForm({ 
        ...course,
        status: course.is_published ? 'published' : 'draft',
        modules: formattedModules
      })
      setShowAddModal(true)
    } catch (err: any) {
      console.error('❌ Error loading course for edit:', err)
      setError(`Failed to load course: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const closeForm = () => {
    setShowAddModal(false)
    setForm(null)
    setEditingCourse(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    setError(null)
    
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        instructor: form.instructor || 'Admin',
        category: form.category || 'marketing',
        level: form.level || 'Beginner',
        thumbnail_url: form.thumbnail_url,
        is_published: form.status === 'published',
        duration: form.duration || '',
        enrollment_limit: form.enrollment_limit,
        prerequisites: form.prerequisites,
        certificate_info: form.certificate_info,
        license_info: form.license_info,
        tags: form.tags || [],
        is_featured: form.is_featured || false
      }

      let courseId = form.id
      let result

      if (editingCourse) {
        result = await (supabase as any)
          .from('courses')
          .update(payload)
          .eq('id', editingCourse.id)
          .select('*')
          .single()
        courseId = editingCourse.id
      } else {
        result = await (supabase as any)
          .from('courses')
          .insert(payload)
          .select('*')
          .single()
        courseId = result.data?.id
      }

      if (result.error) throw result.error

      // Save modules and lessons
      if (courseId && form.modules) {
        // Delete existing modules
        await (supabase as any).from('course_modules').delete().eq('course_id', courseId)
        
        for (const [i, mod] of form.modules.entries()) {
          const { data: moduleData } = await (supabase as any)
            .from('course_modules')
            .insert({
              course_id: courseId,
              title: mod.title,
              description: mod.description,
              order_index: i
            })
            .select('*')
            .single()

          if (moduleData && mod.lessons) {
            await (supabase as any).from('course_lessons').delete().eq('module_id', moduleData.id)
            
            for (const [j, lesson] of mod.lessons.entries()) {
              await (supabase as any)
                .from('course_lessons')
                .insert({
                  module_id: moduleData.id,
                  title: lesson.title,
                  description: lesson.description,
                  type: lesson.type,
                  content_url: lesson.content_url,
                  video_url: lesson.video_url,
                  instructor_notes: lesson.instructor_notes,
                  duration: lesson.duration,
                  order_index: j
                })
            }
          }
        }
      }

      closeForm()
      fetchCourses()
      alert('Course saved successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save course')
      console.error('Error saving course:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminDashboardLayout title="Course Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'draft').length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${courses.reduce((sum, c) => sum + (c.price || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="business">Business</option>
            </select>
            <Button 
              className="bg-[#ed874a] hover:bg-[#d76f32]"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-lg mb-2 text-gray-900">No courses found</p>
            <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <BookOpen className="w-16 h-16 text-gray-400" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(course.status)}`}>
                    {course.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="text-sm font-medium text-gray-900">{course.instructor || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-lg font-bold text-[#ed874a]">${course.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => course.id && handleToggleStatus(course.id, course.status)}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded" 
                    title="Edit"
                    onClick={() => openEdit(course)}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded" title="View">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setDeleteCourseId(course.id!)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && form && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Digital Marketing Masterclass"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the course..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="99.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <Input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    placeholder="Instructor name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                  >
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (optional)
                </label>
                <Input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g., 8 weeks, 40 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL (optional)
                </label>
                <Input
                  type="url"
                  value={form.thumbnail_url || ''}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Modules & Lessons */}
              <div className="border-t pt-4">
                <label className="block font-bold text-lg mb-3">📦 Modules & Lessons</label>
                {(form.modules || []).map((mod, mi) => (
                  <div key={mi} className="border rounded-lg p-4 mb-3 bg-gray-50">
                    <div className="flex gap-2 mb-3">
                      <Input
                        className="flex-1"
                        placeholder="Module Title"
                        value={mod.title}
                        onChange={(e) => setForm({
                          ...form,
                          modules: form.modules.map((m, i) => i === mi ? { ...m, title: e.target.value } : m)
                        })}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setForm({
                          ...form,
                          modules: form.modules.filter((_, i) => i !== mi)
                        })}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      className="mb-3"
                      placeholder="Module Description"
                      value={mod.description}
                      onChange={(e) => setForm({
                        ...form,
                        modules: form.modules.map((m, i) => i === mi ? { ...m, description: e.target.value } : m)
                      })}
                    />
                    
                    {/* Lessons */}
                    <div className="ml-4 space-y-3">
                      <label className="block font-semibold text-sm mb-2">Lessons</label>
                      {(mod.lessons || []).map((les, li) => (
                        <div key={li} className="bg-white p-3 rounded border space-y-2">
                          <div className="flex gap-2">
                            <Input
                              className="flex-1"
                              placeholder="Lesson Title"
                              value={les.title}
                              onChange={(e) => setForm({
                                ...form,
                                modules: form.modules.map((m, i) => i === mi ? {
                                  ...m,
                                  lessons: m.lessons.map((l, j) => j === li ? { ...l, title: e.target.value } : l)
                                } : m)
                              })}
                            />
                            <select
                              value={les.type}
                              onChange={(e) => setForm({
                                ...form,
                                modules: form.modules.map((m, i) => i === mi ? {
                                  ...m,
                                  lessons: m.lessons.map((l, j) => j === li ? { ...l, type: e.target.value } : l)
                                } : m)
                              })}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Type</option>
                              <option value="video">Video</option>
                              <option value="text">Text</option>
                              <option value="file">File</option>
                            </select>
                            <Input
                              className="w-32"
                              placeholder="Duration"
                              value={les.duration}
                              onChange={(e) => setForm({
                                ...form,
                                modules: form.modules.map((m, i) => i === mi ? {
                                  ...m,
                                  lessons: m.lessons.map((l, j) => j === li ? { ...l, duration: e.target.value } : l)
                                } : m)
                              })}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setForm({
                                ...form,
                                modules: form.modules.map((m, i) => i === mi ? {
                                  ...m,
                                  lessons: m.lessons.filter((_, j) => j !== li)
                                } : m)
                              })}
                              className="text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <Input
                            placeholder="🎥 Video URL (e.g., YouTube, Vimeo link)"
                            value={les.video_url}
                            onChange={(e) => setForm({
                              ...form,
                              modules: form.modules.map((m, i) => i === mi ? {
                                ...m,
                                lessons: m.lessons.map((l, j) => j === li ? { ...l, video_url: e.target.value } : l)
                              } : m)
                            })}
                          />
                          
                          <textarea
                            placeholder="📝 Instructor Notes (optional)"
                            value={les.instructor_notes}
                            onChange={(e) => setForm({
                              ...form,
                              modules: form.modules.map((m, i) => i === mi ? {
                                ...m,
                                lessons: m.lessons.map((l, j) => j === li ? { ...l, instructor_notes: e.target.value } : l)
                              } : m)
                            })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setForm({
                          ...form,
                          modules: form.modules.map((m, i) => i === mi ? {
                            ...m,
                            lessons: [...(m.lessons || []), {
                              title: '',
                              description: '',
                              type: 'video',
                              content_url: '',
                              video_url: '',
                              instructor_notes: '',
                              duration: '',
                              order_index: (m.lessons?.length || 0)
                            }]
                          } : m)
                        })}
                        className="w-full"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Lesson
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({
                    ...form,
                    modules: [...(form.modules || []), {
                      title: '',
                      description: '',
                      order_index: (form.modules?.length || 0),
                      lessons: []
                    }]
                  })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Module
                </Button>
              </div>

              {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#ed874a] hover:bg-[#d76f32]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Course</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteCourseId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleDeleteCourse(deleteCourseId)
                  setDeleteCourseId(null)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  )
}

export default CoursesManagement

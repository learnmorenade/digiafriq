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
  Video,
  FileText,
  Headphones,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminDashboardLayout from '@/components/dashboard/AdminDashboardLayout'
import { supabase } from '@/lib/supabase/client'

interface Tutorial {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'webinar'
  duration: string
  category: string
  difficulty: string
  views: number
  rating: number
  is_featured: boolean
  is_published: boolean
  created_at: string
}

const TutorialsManagement = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'article' | 'webinar',
    duration: '',
    category: 'getting-started',
    difficulty: 'Beginner',
    content_url: '',
    is_published: false,
    is_featured: false
  })

  useEffect(() => {
    fetchTutorials()
  }, [])

  useEffect(() => {
    filterTutorials()
  }, [searchTerm, typeFilter, categoryFilter, tutorials])

  const fetchTutorials = async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTutorials(data || [])
    } catch (error: any) {
      console.error('Error fetching tutorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTutorials = () => {
    let filtered = tutorials

    if (searchTerm) {
      filtered = filtered.filter(tutorial => 
        tutorial.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.type === typeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tutorial => tutorial.category === categoryFilter)
    }

    setFilteredTutorials(filtered)
  }

  const handleDeleteTutorial = async (tutorialId: string) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return

    try {
      const { error } = await (supabase as any)
        .from('tutorials')
        .delete()
        .eq('id', tutorialId)

      if (error) throw error
      
      setTutorials(tutorials.filter(t => t.id !== tutorialId))
      alert('Tutorial deleted successfully')
    } catch (error: any) {
      console.error('Error deleting tutorial:', error)
      alert('Failed to delete tutorial')
    }
  }

  const handleTogglePublish = async (tutorialId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('tutorials')
        .update({ is_published: !currentStatus })
        .eq('id', tutorialId)

      if (error) throw error
      
      setTutorials(tutorials.map(t => t.id === tutorialId ? { ...t, is_published: !currentStatus } : t))
      alert(`Tutorial ${!currentStatus ? 'published' : 'unpublished'} successfully`)
    } catch (error: any) {
      console.error('Error updating tutorial:', error)
      alert('Failed to update tutorial')
    }
  }

  const handleToggleFeatured = async (tutorialId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('tutorials')
        .update({ is_featured: !currentStatus })
        .eq('id', tutorialId)

      if (error) throw error
      
      setTutorials(tutorials.map(t => t.id === tutorialId ? { ...t, is_featured: !currentStatus } : t))
      alert(`Tutorial ${!currentStatus ? 'featured' : 'unfeatured'} successfully`)
    } catch (error: any) {
      console.error('Error updating tutorial:', error)
      alert('Failed to update tutorial')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'article': return <FileText className="w-4 h-4" />
      case 'webinar': return <Headphones className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'Advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleAddTutorial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTutorial.title || !newTutorial.description || !newTutorial.duration) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const { data, error } = await (supabase as any)
        .from('tutorials')
        .insert([{
          title: newTutorial.title,
          description: newTutorial.description,
          type: newTutorial.type,
          duration: newTutorial.duration,
          category: newTutorial.category,
          difficulty: newTutorial.difficulty,
          content_url: newTutorial.content_url || null,
          is_published: newTutorial.is_published,
          is_featured: newTutorial.is_featured,
          views: 0,
          rating: 0
        }])
        .select()
        .single()

      if (error) throw error
      
      setTutorials([data, ...tutorials])
      setShowAddModal(false)
      setNewTutorial({
        title: '',
        description: '',
        type: 'video',
        duration: '',
        category: 'getting-started',
        difficulty: 'Beginner',
        content_url: '',
        is_published: false,
        is_featured: false
      })
      alert('Tutorial created successfully!')
    } catch (error: any) {
      console.error('Error creating tutorial:', error)
      alert('Failed to create tutorial: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminDashboardLayout title="Tutorials Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tutorials</p>
                <p className="text-2xl font-bold text-gray-900">{tutorials.length}</p>
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
                  {tutorials.filter(t => t.is_published).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutorials.filter(t => t.is_featured).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutorials.reduce((sum, t) => sum + t.views, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
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
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="webinar">Webinar</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="getting-started">Getting Started</option>
              <option value="marketing">Marketing</option>
              <option value="social-media">Social Media</option>
              <option value="advanced">Advanced</option>
            </select>
            <Button 
              className="bg-[#ed874a] hover:bg-[#d76f32]"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tutorial
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutorials Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Tutorials ({filteredTutorials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ed874a]" />
              <span className="ml-3 text-gray-600">Loading tutorials...</span>
            </div>
          ) : filteredTutorials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No tutorials found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Views</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutorials.map((tutorial) => (
                    <tr key={tutorial.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {tutorial.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className="font-medium text-gray-900">{tutorial.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tutorial.type)}
                          <span className="text-sm text-gray-600">{tutorial.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{tutorial.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{tutorial.duration}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{tutorial.views}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">{tutorial.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tutorial.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tutorial.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTogglePublish(tutorial.id, tutorial.is_published)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title={tutorial.is_published ? 'Unpublish' : 'Publish'}
                          >
                            <Eye className={`w-4 h-4 ${tutorial.is_published ? 'text-green-600' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(tutorial.id, tutorial.is_featured)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title={tutorial.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            <Star className={`w-4 h-4 ${tutorial.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTutorial(tutorial.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Tutorial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Add New Tutorial</h2>
            </div>
            
            <form onSubmit={handleAddTutorial} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutorial Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newTutorial.title}
                  onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                  placeholder="e.g., Getting Started with Digital Marketing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTutorial.description}
                  onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                  placeholder="Brief description of the tutorial..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTutorial.type}
                    onChange={(e) => setNewTutorial({ ...newTutorial, type: e.target.value as 'video' | 'article' | 'webinar' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                  >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newTutorial.duration}
                    onChange={(e) => setNewTutorial({ ...newTutorial, duration: e.target.value })}
                    placeholder="e.g., 15 min"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTutorial.category}
                    onChange={(e) => setNewTutorial({ ...newTutorial, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed874a]"
                  >
                    <option value="getting-started">Getting Started</option>
                    <option value="marketing">Marketing</option>
                    <option value="social-media">Social Media</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newTutorial.difficulty}
                    onChange={(e) => setNewTutorial({ ...newTutorial, difficulty: e.target.value })}
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
                  Content URL (optional)
                </label>
                <Input
                  type="url"
                  value={newTutorial.content_url}
                  onChange={(e) => setNewTutorial({ ...newTutorial, content_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTutorial.is_published}
                    onChange={(e) => setNewTutorial({ ...newTutorial, is_published: e.target.checked })}
                    className="w-4 h-4 text-[#ed874a] rounded focus:ring-[#ed874a]"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTutorial.is_featured}
                    onChange={(e) => setNewTutorial({ ...newTutorial, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#ed874a] rounded focus:ring-[#ed874a]"
                  />
                  <span className="text-sm text-gray-700">Feature this tutorial</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#ed874a] hover:bg-[#d76f32]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tutorial
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewTutorial({
                      title: '',
                      description: '',
                      type: 'video',
                      duration: '',
                      category: 'getting-started',
                      difficulty: 'Beginner',
                      content_url: '',
                      is_published: false,
                      is_featured: false
                    })
                  }}
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
    </AdminDashboardLayout>
  )
}

export default TutorialsManagement

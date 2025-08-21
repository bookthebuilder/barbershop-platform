// === FILE: src/app/provider/settings/page.tsx ===
'use client'

import { useState } from 'react'
import { ProviderLayout } from '@/components/provider/provider-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Scissors,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  Settings,
  Save,
  Copy,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Users,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface Service {
  id: number
  name: string
  description: string
  categoryId: number
  category: string
  duration: number // in minutes
  price: number
  depositRequired: boolean
  depositAmount?: number
  isActive: boolean
  isPopular: boolean
  bufferTime: number // minutes after service
  maxAdvanceBooking: number // days
  cancellationPolicy: string
  requiresConsultation: boolean
  skillLevel: 'basic' | 'intermediate' | 'advanced'
  createdAt: string
  updatedAt: string
}

interface ServiceCategory {
  id: number
  name: string
  description: string
  isActive: boolean
  sortOrder: number
}

// Mock data - replace with database calls
const mockCategories: ServiceCategory[] = [
  { id: 1, name: 'Hair Services', description: 'All hair cutting and styling services', isActive: true, sortOrder: 1 },
  { id: 2, name: 'Beard Services', description: 'Beard trimming and grooming', isActive: true, sortOrder: 2 },
  { id: 3, name: 'Combo Services', description: 'Hair and beard combinations', isActive: true, sortOrder: 3 },
  { id: 4, name: 'Premium Services', description: 'Luxury and specialized treatments', isActive: true, sortOrder: 4 }
]

const mockServices: Service[] = [
  {
    id: 1,
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clipper work. Includes wash and basic styling.',
    categoryId: 1,
    category: 'Hair Services',
    duration: 30,
    price: 40,
    depositRequired: false,
    isActive: true,
    isPopular: true,
    bufferTime: 10,
    maxAdvanceBooking: 30,
    cancellationPolicy: '24 hours notice required',
    requiresConsultation: false,
    skillLevel: 'basic',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-08-15T14:30:00Z'
  },
  {
    id: 2,
    name: 'Precision Fade',
    description: 'Professional fade cut with precise blending. Multiple fade styles available.',
    categoryId: 1,
    category: 'Hair Services',
    duration: 45,
    price: 55,
    depositRequired: true,
    depositAmount: 20,
    isActive: true,
    isPopular: true,
    bufferTime: 15,
    maxAdvanceBooking: 21,
    cancellationPolicy: '24 hours notice required',
    requiresConsultation: false,
    skillLevel: 'intermediate',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-08-10T09:15:00Z'
  },
  {
    id: 3,
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping with hot towel treatment.',
    categoryId: 2,
    category: 'Beard Services',
    duration: 20,
    price: 25,
    depositRequired: false,
    isActive: true,
    isPopular: false,
    bufferTime: 5,
    maxAdvanceBooking: 14,
    cancellationPolicy: '2 hours notice required',
    requiresConsultation: false,
    skillLevel: 'basic',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-20T11:45:00Z'
  },
  {
    id: 4,
    name: 'The Full Service',
    description: 'Complete grooming experience: haircut, beard trim, hot towel, and styling.',
    categoryId: 3,
    category: 'Combo Services',
    duration: 75,
    price: 95,
    depositRequired: true,
    depositAmount: 30,
    isActive: true,
    isPopular: true,
    bufferTime: 15,
    maxAdvanceBooking: 45,
    cancellationPolicy: '48 hours notice required',
    requiresConsultation: true,
    skillLevel: 'advanced',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-08-18T16:20:00Z'
  },
  {
    id: 5,
    name: 'Wedding Party Package',
    description: 'Premium grooming for special occasions. Includes consultation and premium products.',
    categoryId: 4,
    category: 'Premium Services',
    duration: 90,
    price: 150,
    depositRequired: true,
    depositAmount: 50,
    isActive: true,
    isPopular: false,
    bufferTime: 30,
    maxAdvanceBooking: 90,
    cancellationPolicy: '7 days notice required',
    requiresConsultation: true,
    skillLevel: 'advanced',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-08-05T13:10:00Z'
  }
]

export default function ServiceManagementPage() {
  const [services, setServices] = useState(mockServices)
  const [categories, setCategories] = useState(mockCategories)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  
  // Dialog states
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  
  // Form states
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: '',
    description: '',
    categoryId: 1,
    duration: 30,
    price: 0,
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    isPopular: false,
    bufferTime: 10,
    maxAdvanceBooking: 30,
    cancellationPolicy: '24 hours notice required',
    requiresConsultation: false,
    skillLevel: 'basic'
  })
  
  const [categoryForm, setCategoryForm] = useState<Partial<ServiceCategory>>({
    name: '',
    description: '',
    isActive: true,
    sortOrder: categories.length + 1
  })

  const handleAddService = () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      toast.error('Please fill in all required fields')
      return
    }

    const category = categories.find(c => c.id === serviceForm.categoryId)
    
    const newService: Service = {
      id: Date.now(),
      ...serviceForm as Service,
      category: category?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setServices(prev => [...prev, newService])
    setServiceForm({
      name: '',
      description: '',
      categoryId: 1,
      duration: 30,
      price: 0,
      depositRequired: false,
      depositAmount: 0,
      isActive: true,
      isPopular: false,
      bufferTime: 10,
      maxAdvanceBooking: 30,
      cancellationPolicy: '24 hours notice required',
      requiresConsultation: false,
      skillLevel: 'basic'
    })
    setIsAddServiceOpen(false)
    toast.success('Service added successfully')
  }

  const handleEditService = () => {
    if (!selectedService || !serviceForm.name) return

    const category = categories.find(c => c.id === serviceForm.categoryId)
    
    setServices(prev => prev.map(service => 
      service.id === selectedService.id 
        ? { 
            ...service, 
            ...serviceForm,
            category: category?.name || service.category,
            updatedAt: new Date().toISOString() 
          }
        : service
    ))
    setIsEditServiceOpen(false)
    setSelectedService(null)
    toast.success('Service updated successfully')
  }

  const duplicateService = (service: Service) => {
    const newService: Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setServices(prev => [...prev, newService])
    toast.success('Service duplicated successfully')
  }

  const toggleServiceActive = (id: number) => {
    setServices(prev => prev.map(service => 
      service.id === id 
        ? { ...service, isActive: !service.isActive, updatedAt: new Date().toISOString() }
        : service
    ))
    toast.success('Service status updated')
  }

  const deleteService = (id: number) => {
    setServices(prev => prev.filter(service => service.id !== id))
    toast.success('Service deleted')
  }

  const handleAddCategory = () => {
    if (!categoryForm.name) {
      toast.error('Please enter a category name')
      return
    }

    const newCategory: ServiceCategory = {
      id: Date.now(),
      ...categoryForm as ServiceCategory
    }

    setCategories(prev => [...prev, newCategory])
    setCategoryForm({
      name: '',
      description: '',
      isActive: true,
      sortOrder: categories.length + 2
    })
    setIsAddCategoryOpen(false)
    toast.success('Category added successfully')
  }

  const getServiceStats = () => {
    const activeServices = services.filter(s => s.isActive).length
    const avgPrice = services.length > 0 ? services.reduce((sum, s) => sum + s.price, 0) / services.length : 0
    const popularServices = services.filter(s => s.isPopular).length
    const avgDuration = services.length > 0 ? services.reduce((sum, s) => sum + s.duration, 0) / services.length : 0

    return { activeServices, avgPrice, popularServices, avgDuration }
  }

  const stats = getServiceStats()

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Service Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your services, pricing, and categories
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Tag className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Service Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your services
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-name" className="text-right">Name *</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      placeholder="e.g., Hair Services"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category-description" className="text-right">Description</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      placeholder="Brief description of this category"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>
                    Create a new service for your customers to book
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service-name" className="text-right">Name *</Label>
                    <Input
                      id="service-name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      placeholder="e.g., Classic Haircut"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service-description" className="text-right">Description</Label>
                    <Textarea
                      id="service-description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3"
                      placeholder="Detailed description of the service"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service-category" className="text-right">Category *</Label>
                    <Select
                      value={serviceForm.categoryId?.toString()}
                      onValueChange={(value) => setServiceForm(prev => ({ ...prev, categoryId: parseInt(value) }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.isActive).map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service-duration" className="text-right">Duration *</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Input
                        id="service-duration"
                        type="number"
                        min="5"
                        max="300"
                        step="5"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">minutes</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="service-price" className="text-right">Price *</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        id="service-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Deposit Required</Label>
                    <div className="col-span-3 flex items-center space-x-4">
                      <Switch
                        checked={serviceForm.depositRequired}
                        onCheckedChange={(checked) => setServiceForm(prev => ({ 
                          ...prev, 
                          depositRequired: checked,
                          depositAmount: checked ? prev.depositAmount : 0
                        }))}
                      />
                      {serviceForm.depositRequired && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={serviceForm.depositAmount}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                            className="w-24"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buffer-time" className="text-right">Buffer Time</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Input
                        id="buffer-time"
                        type="number"
                        min="0"
                        max="60"
                        step="5"
                        value={serviceForm.bufferTime}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">minutes after service</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="skill-level" className="text-right">Skill Level</Label>
                    <Select
                      value={serviceForm.skillLevel}
                      onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => 
                        setServiceForm(prev => ({ ...prev, skillLevel: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Options</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={serviceForm.isPopular}
                          onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, isPopular: checked }))}
                        />
                        <Label className="text-sm">Mark as popular service</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={serviceForm.requiresConsultation}
                          onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, requiresConsultation: checked }))}
                        />
                        <Label className="text-sm">Requires consultation</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddService}>Add Service</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeServices}</div>
              <p className="text-xs text-muted-foreground">
                out of {services.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.avgPrice.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                across all services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Popular Services</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.popularServices}</div>
              <p className="text-xs text-muted-foreground">
                featured services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">
                minutes per service
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services by Category */}
        <Tabs defaultValue={categories[0]?.id.toString()} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {categories.filter(c => c.isActive).map((category) => (
              <TabsTrigger key={category.id} value={category.id.toString()}>
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {services.filter(s => s.categoryId === category.id).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.filter(c => c.isActive).map((category) => (
            <TabsContent key={category.id} value={category.id.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Scissors className="mr-2 h-5 w-5" />
                      {category.name}
                    </div>
                    <Badge variant="outline">
                      {services.filter(s => s.categoryId === category.id).length} services
                    </Badge>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {services.filter(s => s.categoryId === category.id).length === 0 ? (
                    <div className="text-center py-12">
                      <Scissors className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a service to this category.
                      </p>
                      <div className="mt-6">
                        <Button onClick={() => {
                          setServiceForm(prev => ({ ...prev, categoryId: category.id }))
                          setIsAddServiceOpen(true)
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Service
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {services
                        .filter(s => s.categoryId === category.id)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((service) => (
                          <div key={service.id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {service.name}
                                  </h4>
                                  {service.isPopular && (
                                    <Badge variant="default">
                                      <Star className="mr-1 h-3 w-3" />
                                      Popular
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={service.isActive ? "default" : "secondary"}
                                    className={service.isActive ? "bg-green-100 text-green-800" : ""}
                                  >
                                    {service.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Badge variant="outline">
                                    {service.skillLevel}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>{service.duration} min</span>
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>${service.price}</span>
                                    {service.depositRequired && (
                                      <span className="ml-1 text-xs text-gray-500">
                                        (${service.depositAmount} deposit)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>{service.bufferTime}m buffer</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4 text-gray-400" />
                                    <span>{service.maxAdvanceBooking}d advance</span>
                                  </div>
                                </div>

                                {service.requiresConsultation && (
                                  <div className="mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      Requires consultation
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleServiceActive(service.id)}
                                >
                                  {service.isActive ? (
                                    <>
                                      <EyeOff className="mr-1 h-3 w-3" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-1 h-3 w-3" />
                                      Show
                                    </>
                                  )}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => duplicateService(service)}
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedService(service)
                                    setServiceForm(service)
                                    setIsEditServiceOpen(true)
                                  }}
                                >
                                  <Edit className="mr-1 h-3 w-3" />
                                  Edit
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{service.name}"? This action cannot be undone and will affect any existing bookings.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteService(service.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Service Dialog */}
        <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service details and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service-name" className="text-right">Name *</Label>
                <Input
                  id="edit-service-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-service-description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service-category" className="text-right">Category</Label>
                <Select
                  value={serviceForm.categoryId?.toString()}
                  onValueChange={(value) => setServiceForm(prev => ({ ...prev, categoryId: parseInt(value) }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service-duration" className="text-right">Duration</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    id="edit-service-duration"
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-service-price" className="text-right">Price</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    id="edit-service-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Deposit Required</Label>
                <div className="col-span-3 flex items-center space-x-4">
                  <Switch
                    checked={serviceForm.depositRequired}
                    onCheckedChange={(checked) => setServiceForm(prev => ({ 
                      ...prev, 
                      depositRequired: checked,
                      depositAmount: checked ? prev.depositAmount : 0
                    }))}
                  />
                  {serviceForm.depositRequired && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceForm.depositAmount}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-buffer-time" className="text-right">Buffer Time</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    id="edit-buffer-time"
                    type="number"
                    min="0"
                    max="60"
                    step="5"
                    value={serviceForm.bufferTime}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-advance-booking" className="text-right">Max Advance Booking</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    id="edit-advance-booking"
                    type="number"
                    min="1"
                    max="365"
                    value={serviceForm.maxAdvanceBooking}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) || 1 }))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cancellation-policy" className="text-right">Cancellation Policy</Label>
                <Select
                  value={serviceForm.cancellationPolicy}
                  onValueChange={(value) => setServiceForm(prev => ({ ...prev, cancellationPolicy: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 hours notice required">2 hours notice required</SelectItem>
                    <SelectItem value="24 hours notice required">24 hours notice required</SelectItem>
                    <SelectItem value="48 hours notice required">48 hours notice required</SelectItem>
                    <SelectItem value="7 days notice required">7 days notice required</SelectItem>
                    <SelectItem value="No cancellations allowed">No cancellations allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-skill-level" className="text-right">Skill Level</Label>
                <Select
                  value={serviceForm.skillLevel}
                  onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => 
                    setServiceForm(prev => ({ ...prev, skillLevel: value }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status & Options</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={serviceForm.isActive}
                      onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label className="text-sm">Service is active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={serviceForm.isPopular}
                      onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, isPopular: checked }))}
                    />
                    <Label className="text-sm">Mark as popular service</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={serviceForm.requiresConsultation}
                      onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, requiresConsultation: checked }))}
                    />
                    <Label className="text-sm">Requires consultation</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditServiceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditService}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProviderLayout>
  )
}

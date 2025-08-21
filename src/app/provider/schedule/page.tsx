// === FILE: src/app/provider/schedule/page.tsx ===
'use client'

import { useState } from 'react'
import { ProviderLayout } from '@/components/provider/provider-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Coffee, 
  Save,
  Copy,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface DaySchedule {
  isOpen: boolean
  start: string
  end: string
  breakStart: string
  breakEnd: string
  bufferTime: number // minutes between appointments
}

interface TimeOff {
  id: number
  date: string
  reason: string
  type: 'full-day' | 'partial'
  start?: string
  end?: string
  status: 'active' | 'past'
}

interface ScheduleOverride {
  id: number
  date: string
  reason: string
  schedule: DaySchedule
}

// Mock data - replace with database calls
const initialWeeklySchedule: Record<string, DaySchedule> = {
  monday: { isOpen: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 15 },
  tuesday: { isOpen: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 15 },
  wednesday: { isOpen: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 15 },
  thursday: { isOpen: true, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 15 },
  friday: { isOpen: true, start: '09:00', end: '20:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 15 },
  saturday: { isOpen: true, start: '08:00', end: '16:00', breakStart: '', breakEnd: '', bufferTime: 10 },
  sunday: { isOpen: false, start: '', end: '', breakStart: '', breakEnd: '', bufferTime: 15 }
}

const mockTimeOff: TimeOff[] = [
  { id: 1, date: '2024-08-25', reason: 'Vacation', type: 'full-day', status: 'active' },
  { id: 2, date: '2024-08-30', reason: 'Doctor Appointment', type: 'partial', start: '14:00', end: '16:00', status: 'active' },
  { id: 3, date: '2024-08-15', reason: 'Sick Day', type: 'full-day', status: 'past' }
]

const mockOverrides: ScheduleOverride[] = [
  {
    id: 1,
    date: '2024-08-28',
    reason: 'Extended hours for wedding party',
    schedule: { isOpen: true, start: '07:00', end: '22:00', breakStart: '12:00', breakEnd: '13:00', bufferTime: 10 }
  }
]

const daysOfWeek = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
]

export default function ProviderSchedulePage() {
  const [schedule, setSchedule] = useState(initialWeeklySchedule)
  const [timeOff, setTimeOff] = useState(mockTimeOff)
  const [overrides, setOverrides] = useState(mockOverrides)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Dialog states
  const [isAddingTimeOff, setIsAddingTimeOff] = useState(false)
  const [isAddingOverride, setIsAddingOverride] = useState(false)
  
  // Form states
  const [newTimeOff, setNewTimeOff] = useState({
    date: '',
    reason: '',
    type: 'full-day' as 'full-day' | 'partial',
    start: '',
    end: ''
  })
  
  const [newOverride, setNewOverride] = useState({
    date: '',
    reason: '',
    schedule: { ...initialWeeklySchedule.monday }
  })

  const updateDaySchedule = (day: string, field: string, value: string | boolean | number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const copyDaySchedule = (fromDay: string, toDay: string) => {
    setSchedule(prev => ({
      ...prev,
      [toDay]: { ...prev[fromDay] }
    }))
    setHasUnsavedChanges(true)
    toast.success(`Copied ${fromDay} schedule to ${toDay}`)
  }

  const handleAddTimeOff = () => {
    if (!newTimeOff.date || !newTimeOff.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    if (newTimeOff.type === 'partial' && (!newTimeOff.start || !newTimeOff.end)) {
      toast.error('Please specify start and end times for partial day off')
      return
    }

    const timeOffEntry: TimeOff = {
      id: Date.now(),
      ...newTimeOff,
      status: new Date(newTimeOff.date) >= new Date() ? 'active' : 'past'
    }

    setTimeOff(prev => [...prev, timeOffEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewTimeOff({ date: '', reason: '', type: 'full-day', start: '', end: '' })
    setIsAddingTimeOff(false)
    toast.success('Time off added successfully')
  }

  const handleAddOverride = () => {
    if (!newOverride.date || !newOverride.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const overrideEntry: ScheduleOverride = {
      id: Date.now(),
      ...newOverride
    }

    setOverrides(prev => [...prev, overrideEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewOverride({
      date: '',
      reason: '',
      schedule: { ...initialWeeklySchedule.monday }
    })
    setIsAddingOverride(false)
    toast.success('Schedule override added successfully')
  }

  const deleteTimeOff = (id: number) => {
    setTimeOff(prev => prev.filter(item => item.id !== id))
    toast.success('Time off deleted')
  }

  const deleteOverride = (id: number) => {
    setOverrides(prev => prev.filter(item => item.id !== id))
    toast.success('Schedule override deleted')
  }

  const saveSchedule = () => {
    // Here you would save to database
    setHasUnsavedChanges(false)
    toast.success('Schedule saved successfully!')
  }

  const resetSchedule = () => {
    setSchedule(initialWeeklySchedule)
    setHasUnsavedChanges(false)
    toast.success('Schedule reset to defaults')
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Schedule Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your working hours, breaks, and availability
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="animate-pulse">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={resetSchedule}>
              Reset
            </Button>
            <Button onClick={saveSchedule} disabled={!hasUnsavedChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Set your regular working hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {daysOfWeek.map(({ key, label, short }) => {
              const daySchedule = schedule[key]
              return (
                <div key={key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-20">
                        <Label className="text-sm font-medium">{label}</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={daySchedule.isOpen}
                          onCheckedChange={(checked) => updateDaySchedule(key, 'isOpen', checked)}
                        />
                        <Label className="text-sm">Open</Label>
                      </div>
                    </div>

                    {/* Copy menu */}
                    <Select onValueChange={(targetDay) => copyDaySchedule(key, targetDay)}>
                      <SelectTrigger className="w-40">
                        <Copy className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Copy to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek
                          .filter(day => day.key !== key)
                          .map((day) => (
                            <SelectItem key={day.key} value={day.key}>
                              {day.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {daySchedule.isOpen && (
                    <div className="ml-24 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border bg-gray-50 p-4">
                      {/* Working Hours */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Working Hours</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={daySchedule.start}
                            onChange={(e) => updateDaySchedule(key, 'start', e.target.value)}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="time"
                            value={daySchedule.end}
                            onChange={(e) => updateDaySchedule(key, 'end', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Break Time */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <Coffee className="mr-1 h-4 w-4" />
                          Break Time
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            placeholder="Start"
                            value={daySchedule.breakStart}
                            onChange={(e) => updateDaySchedule(key, 'breakStart', e.target.value)}
                            className="w-full"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <Input
                            type="time"
                            placeholder="End"
                            value={daySchedule.breakEnd}
                            onChange={(e) => updateDaySchedule(key, 'breakEnd', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Buffer Time */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Buffer Time</Label>
                        <Select
                          value={daySchedule.bufferTime.toString()}
                          onValueChange={(value) => updateDaySchedule(key, 'bufferTime', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No buffer</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Time Off & Schedule Overrides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Off */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Time Off
                </div>
                <Dialog open={isAddingTimeOff} onOpenChange={setIsAddingTimeOff}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Time Off
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Time Off</DialogTitle>
                      <DialogDescription>
                        Block time in your schedule for vacation, appointments, or other reasons.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newTimeOff.date}
                          onChange={(e) => setNewTimeOff(prev => ({ ...prev, date: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">Reason</Label>
                        <Input
                          id="reason"
                          value={newTimeOff.reason}
                          onChange={(e) => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Vacation, appointment, etc."
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select
                          value={newTimeOff.type}
                          onValueChange={(value: 'full-day' | 'partial') => setNewTimeOff(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-day">Full Day</SelectItem>
                            <SelectItem value="partial">Partial Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newTimeOff.type === 'partial' && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-time" className="text-right">Start Time</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newTimeOff.start}
                              onChange={(e) => setNewTimeOff(prev => ({ ...prev, start: e.target.value }))}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-time" className="text-right">End Time</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newTimeOff.end}
                              onChange={(e) => setNewTimeOff(prev => ({ ...prev, end: e.target.value }))}
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingTimeOff(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTimeOff}>Add Time Off</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage vacation days, appointments, and schedule exceptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeOff.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No time off scheduled</p>
              ) : (
                <div className="space-y-3">
                  {timeOff.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={item.status === 'active' ? 'default' : 'secondary'}
                            className={item.type === 'full-day' ? '' : 'bg-blue-100 text-blue-800'}
                          >
                            {item.type === 'full-day' ? 'Full Day' : 'Partial'}
                          </Badge>
                          <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                          {item.status === 'past' && (
                            <Badge variant="outline" className="text-xs">Past</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                        {item.type === 'partial' && (
                          <p className="text-sm text-gray-500">
                            {item.start} - {item.end}
                          </p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Time Off</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this time off entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTimeOff(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Overrides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  Schedule Overrides
                </div>
                <Dialog open={isAddingOverride} onOpenChange={setIsAddingOverride}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Override
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Schedule Override</DialogTitle>
                      <DialogDescription>
                        Set special hours for a specific date (e.g., extended hours, early close).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="override-date" className="text-right">Date</Label>
                        <Input
                          id="override-date"
                          type="date"
                          value={newOverride.date}
                          onChange={(e) => setNewOverride(prev => ({ ...prev, date: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="override-reason" className="text-right">Reason</Label>
                        <Textarea
                          id="override-reason"
                          value={newOverride.reason}
                          onChange={(e) => setNewOverride(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Extended hours for wedding party, early close for event, etc."
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="space-y-4 border-t pt-4">
                        <Label className="text-sm font-medium">Special Hours</Label>
                        
                        <div className="flex items-center space-x-4">
                          <Switch
                            checked={newOverride.schedule.isOpen}
                            onCheckedChange={(checked) => 
                              setNewOverride(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule, isOpen: checked }
                              }))
                            }
                          />
                          <Label className="text-sm">Open on this date</Label>
                        </div>

                        {newOverride.schedule.isOpen && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Working Hours</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={newOverride.schedule.start}
                                  onChange={(e) => 
                                    setNewOverride(prev => ({
                                      ...prev,
                                      schedule: { ...prev.schedule, start: e.target.value }
                                    }))
                                  }
                                />
                                <span className="text-sm text-gray-500">to</span>
                                <Input
                                  type="time"
                                  value={newOverride.schedule.end}
                                  onChange={(e) => 
                                    setNewOverride(prev => ({
                                      ...prev,
                                      schedule: { ...prev.schedule, end: e.target.value }
                                    }))
                                  }
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm">Break Time (Optional)</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  placeholder="Start"
                                  value={newOverride.schedule.breakStart}
                                  onChange={(e) => 
                                    setNewOverride(prev => ({
                                      ...prev,
                                      schedule: { ...prev.schedule, breakStart: e.target.value }
                                    }))
                                  }
                                />
                                <span className="text-sm text-gray-500">to</span>
                                <Input
                                  type="time"
                                  placeholder="End"
                                  value={newOverride.schedule.breakEnd}
                                  onChange={(e) => 
                                    setNewOverride(prev => ({
                                      ...prev,
                                      schedule: { ...prev.schedule, breakEnd: e.target.value }
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingOverride(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddOverride}>Add Override</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Special hours for specific dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overrides.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No schedule overrides</p>
              ) : (
                <div className="space-y-3">
                  {overrides.map((override) => (
                    <div key={override.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Override</Badge>
                            <span className="font-medium">{new Date(override.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{override.reason}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            {override.schedule.isOpen ? (
                              <div className="flex items-center space-x-4">
                                <span>Hours: {override.schedule.start} - {override.schedule.end}</span>
                                {override.schedule.breakStart && override.schedule.breakEnd && (
                                  <span>Break: {override.schedule.breakStart} - {override.schedule.breakEnd}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-red-600">Closed</span>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Schedule Override</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this schedule override? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOverride(override.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  )
}

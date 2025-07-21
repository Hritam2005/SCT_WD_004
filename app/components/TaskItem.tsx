"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Edit2, Trash2, Save, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, TaskPriority } from "../types/task"

interface TaskItemProps {
  task: Task
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export default function TaskItem({ task, onUpdate, onDelete, onToggleStatus }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
  })

  const handleSave = () => {
    onUpdate(task.id, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
    })
    setIsEditing(false)
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === "pending"
  const isDueSoon =
    task.dueDate &&
    new Date(task.dueDate) > new Date() &&
    new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 &&
    task.status === "pending"

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 ${
        task.status === "completed" ? "opacity-75" : ""
      } ${isOverdue ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20" : ""} ${
        isDueSoon ? "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20" : ""
      }`}
    >
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <Input
              value={editData.title}
              onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
              className="font-medium"
            />
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={editData.priority}
                onValueChange={(value: TaskPriority) => setEditData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="datetime-local"
                value={editData.dueDate}
                onChange={(e) => setEditData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={() => onToggleStatus(task.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3
                    className={`font-medium text-lg ${
                      task.status === "completed"
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    {isOverdue && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                    {isDueSoon && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Due Soon
                      </Badge>
                    )}
                  </div>
                </div>
                {task.description && (
                  <p
                    className={`text-gray-600 dark:text-gray-300 mb-3 ${task.status === "completed" ? "line-through" : ""}`}
                  >
                    {task.description}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(task.dueDate), "MMM dd, yyyy 'at' HH:mm")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onDelete(task.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

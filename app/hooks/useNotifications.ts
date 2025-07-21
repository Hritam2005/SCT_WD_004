"use client"

import { useState, useEffect, useCallback } from "react"
import type { Task } from "../types/task"

export function useNotifications(tasks: Task[]) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check current notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }

    // Load notification preference from localStorage
    const savedPreference = localStorage.getItem("notifications-enabled")
    if (savedPreference === "true" && Notification.permission === "granted") {
      setNotificationsEnabled(true)
    }
  }, [])

  useEffect(() => {
    if (!notificationsEnabled) return

    const checkDueTasks = () => {
      const now = new Date()
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

      tasks.forEach((task) => {
        if (task.status === "completed" || !task.dueDate) return

        const dueDate = new Date(task.dueDate)
        const timeUntilDue = dueDate.getTime() - now.getTime()

        // Notify for overdue tasks (check every 5 minutes to avoid spam)
        if (dueDate < now && timeUntilDue > -5 * 60 * 1000) {
          showNotification("⚠️ Overdue Task", `"${task.title}" was due ${getTimeAgo(dueDate)}`, "high")
        }
        // Notify 15 minutes before due
        else if (dueDate > now && dueDate <= in15Minutes) {
          showNotification(
            "⏰ Task Due Soon",
            `"${task.title}" is due in ${Math.ceil(timeUntilDue / (1000 * 60))} minutes`,
            task.priority,
          )
        }
        // Notify 1 hour before due (for high priority tasks)
        else if (task.priority === "high" && dueDate > now && dueDate <= in1Hour) {
          showNotification(
            "🔴 High Priority Task",
            `"${task.title}" is due in ${Math.ceil(timeUntilDue / (1000 * 60 * 60))} hour(s)`,
            "high",
          )
        }
      })
    }

    // Check immediately and then every minute
    checkDueTasks()
    const interval = setInterval(checkDueTasks, 60000)

    return () => clearInterval(interval)
  }, [tasks, notificationsEnabled])

  const showNotification = (title: string, body: string, priority: string) => {
    if (!notificationsEnabled || Notification.permission !== "granted") return

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `task-${Date.now()}`, // Prevent duplicate notifications
      requireInteraction: priority === "high",
      silent: false,
    })

    // Auto-close notification after 5 seconds (except high priority)
    if (priority !== "high") {
      setTimeout(() => notification.close(), 5000)
    }

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute(s) ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour(s) ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} day(s) ago`
    }
  }

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    setPermission(permission)
    return permission === "granted"
  }, [])

  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const granted = await requestPermission()
      if (granted) {
        setNotificationsEnabled(true)
        localStorage.setItem("notifications-enabled", "true")

        // Show a test notification
        showNotification("🔔 Notifications Enabled", "You'll now receive reminders for your tasks!", "medium")
      }
    } else {
      setNotificationsEnabled(false)
      localStorage.setItem("notifications-enabled", "false")
    }
  }, [notificationsEnabled, requestPermission])

  return {
    notificationsEnabled,
    permission,
    toggleNotifications,
    requestPermission,
  }
}

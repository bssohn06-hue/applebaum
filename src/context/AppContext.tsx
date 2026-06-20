import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Semester, Subject, Schedule, TodoItem, Grade } from '../types'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

interface AppContextType {
  // State
  selectedSemesterId: string | null
  semesters: Semester[]
  subjects: Subject[]
  schedules: Schedule[]
  todos: TodoItem[]
  grades: Grade[]

  // Semester functions
  setSemesters: (semesters: Semester[]) => void
  setSelectedSemesterId: (id: string | null) => void
  addSemester: (semesterData: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteSemester: (semesterId: string) => Promise<void>
  fetchSemesters: () => Promise<void>

  // Subject functions
  setSubjects: (subjects: Subject[]) => void
  addSubject: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSubject: (subjectId: string, subjectData: Partial<Subject>) => Promise<void>
  deleteSubject: (subjectId: string) => Promise<void>
  fetchSubjects: (semesterId: string) => Promise<void>

  // Schedule functions
  setSchedules: (schedules: Schedule[]) => void
  addSchedule: (scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSchedule: (scheduleId: string, scheduleData: Partial<Schedule>) => Promise<void>
  deleteSchedule: (scheduleId: string) => Promise<void>
  fetchSchedules: (semesterId: string) => Promise<void>

  // TodoItem functions
  setTodos: (todos: TodoItem[]) => void
  addTodo: (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTodo: (todoId: string, todoData: Partial<TodoItem>) => Promise<void>
  deleteTodo: (todoId: string) => Promise<void>
  fetchTodos: (semesterId: string, date: string) => Promise<void>

  // Grade functions
  setGrades: (grades: Grade[]) => void
  addGrade: (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGrade: (gradeId: string, gradeData: Partial<Grade>) => Promise<void>
  fetchGrades: (semesterId: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  // Semester functions
  const fetchSemesters = useCallback(async () => {
    try {
      const q = query(collection(db, 'semesters'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Semester[]
      setSemesters(data)
    } catch (error) {
      console.error('Error fetching semesters:', error)
    }
  }, [])

  const addSemester = useCallback(
    async (semesterData: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        // Check for duplicates
        const q = query(
          collection(db, 'semesters'),
          where('year', '==', semesterData.year),
          where('grade', '==', semesterData.grade),
          where('term', '==', semesterData.term)
        )
        const snapshot = await getDocs(q)

        if (snapshot.size > 0) {
          alert('같은 학기가 이미 존재합니다.')
          return
        }

        const docRef = await addDoc(collection(db, 'semesters'), {
          ...semesterData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setSemesters((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...semesterData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ])
      } catch (error) {
        console.error('Error adding semester:', error)
        throw error
      }
    },
    []
  )

  const deleteSemester = useCallback(async (semesterId: string) => {
    try {
      // Delete related subjects
      const subjectsQuery = query(
        collection(db, 'subjects'),
        where('semesterId', '==', semesterId)
      )
      const subjectsSnapshot = await getDocs(subjectsQuery)
      for (const doc of subjectsSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Delete related schedules
      const schedulesQuery = query(
        collection(db, 'schedules'),
        where('semesterId', '==', semesterId)
      )
      const schedulesSnapshot = await getDocs(schedulesQuery)
      for (const doc of schedulesSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Delete related todos
      const todosQuery = query(
        collection(db, 'todos'),
        where('semesterId', '==', semesterId)
      )
      const todosSnapshot = await getDocs(todosQuery)
      for (const doc of todosSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Delete related grades
      const gradesQuery = query(
        collection(db, 'grades'),
        where('semesterId', '==', semesterId)
      )
      const gradesSnapshot = await getDocs(gradesQuery)
      for (const doc of gradesSnapshot.docs) {
        await deleteDoc(doc.ref)
      }

      // Delete semester
      await deleteDoc(doc(db, 'semesters', semesterId))

      setSemesters((prev) => prev.filter((s) => s.id !== semesterId))

      if (selectedSemesterId === semesterId) {
        setSelectedSemesterId(null)
      }
    } catch (error) {
      console.error('Error deleting semester:', error)
      throw error
    }
  }, [selectedSemesterId])

  // Subject functions
  const fetchSubjects = useCallback(async (semesterId: string) => {
    try {
      const q = query(
        collection(db, 'subjects'),
        where('semesterId', '==', semesterId)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subject[]
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }, [])

  const addSubject = useCallback(
    async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'subjects'), {
          ...subjectData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setSubjects((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...subjectData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ])
      } catch (error) {
        console.error('Error adding subject:', error)
        throw error
      }
    },
    []
  )

  const updateSubject = useCallback(async (subjectId: string, subjectData: Partial<Subject>) => {
    try {
      await updateDoc(doc(db, 'subjects', subjectId), {
        ...subjectData,
        updatedAt: Timestamp.now(),
      })

      setSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId
            ? {
                ...s,
                ...subjectData,
                updatedAt: Date.now(),
              }
            : s
        )
      )
    } catch (error) {
      console.error('Error updating subject:', error)
      throw error
    }
  }, [])

  const deleteSubject = useCallback(async (subjectId: string) => {
    try {
      // Delete subject references in todos
      const todosQuery = query(
        collection(db, 'todos'),
        where('subjectId', '==', subjectId)
      )
      const todosSnapshot = await getDocs(todosQuery)
      for (const todoDoc of todosSnapshot.docs) {
        await updateDoc(todoDoc.ref, { subjectId: null })
      }

      // Delete grades
      const gradesQuery = query(
        collection(db, 'grades'),
        where('subjectId', '==', subjectId)
      )
      const gradesSnapshot = await getDocs(gradesQuery)
      for (const gradeDoc of gradesSnapshot.docs) {
        await deleteDoc(gradeDoc.ref)
      }

      // Delete subject
      await deleteDoc(doc(db, 'subjects', subjectId))

      setSubjects((prev) => prev.filter((s) => s.id !== subjectId))
    } catch (error) {
      console.error('Error deleting subject:', error)
      throw error
    }
  }, [])

  // Schedule functions
  const fetchSchedules = useCallback(async (semesterId: string) => {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('semesterId', '==', semesterId)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Schedule[]
      setSchedules(data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    }
  }, [])

  const addSchedule = useCallback(
    async (scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'schedules'), {
          ...scheduleData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setSchedules((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...scheduleData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ])
      } catch (error) {
        console.error('Error adding schedule:', error)
        throw error
      }
    },
    []
  )

  const updateSchedule = useCallback(
    async (scheduleId: string, scheduleData: Partial<Schedule>) => {
      try {
        await updateDoc(doc(db, 'schedules', scheduleId), {
          ...scheduleData,
          updatedAt: Timestamp.now(),
        })

        setSchedules((prev) =>
          prev.map((s) =>
            s.id === scheduleId
              ? {
                  ...s,
                  ...scheduleData,
                  updatedAt: Date.now(),
                }
              : s
          )
        )
      } catch (error) {
        console.error('Error updating schedule:', error)
        throw error
      }
    },
    []
  )

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    try {
      // Delete schedule references in todos
      const todosQuery = query(
        collection(db, 'todos'),
        where('scheduleId', '==', scheduleId)
      )
      const todosSnapshot = await getDocs(todosQuery)
      for (const todoDoc of todosSnapshot.docs) {
        await updateDoc(todoDoc.ref, { scheduleId: null })
      }

      // Delete schedule
      await deleteDoc(doc(db, 'schedules', scheduleId))

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw error
    }
  }, [])

  // TodoItem functions
  const fetchTodos = useCallback(async (semesterId: string, date: string) => {
    try {
      const q = query(
        collection(db, 'todos'),
        where('semesterId', '==', semesterId),
        where('date', '==', date)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TodoItem[]
      setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }, [])

  const addTodo = useCallback(
    async (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'todos'), {
          ...todoData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setTodos((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...todoData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ])
      } catch (error) {
        console.error('Error adding todo:', error)
        throw error
      }
    },
    []
  )

  const updateTodo = useCallback(async (todoId: string, todoData: Partial<TodoItem>) => {
    try {
      await updateDoc(doc(db, 'todos', todoId), {
        ...todoData,
        updatedAt: Timestamp.now(),
      })

      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId
            ? {
                ...t,
                ...todoData,
                updatedAt: Date.now(),
              }
            : t
        )
      )
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  }, [])

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId))
      setTodos((prev) => prev.filter((t) => t.id !== todoId))
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  }, [])

  // Grade functions
  const fetchGrades = useCallback(async (semesterId: string) => {
    try {
      const q = query(
        collection(db, 'grades'),
        where('semesterId', '==', semesterId)
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Grade[]
      setGrades(data)
    } catch (error) {
      console.error('Error fetching grades:', error)
    }
  }, [])

  const addGrade = useCallback(
    async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'grades'), {
          ...gradeData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setGrades((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...gradeData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ])
      } catch (error) {
        console.error('Error adding grade:', error)
        throw error
      }
    },
    []
  )

  const updateGrade = useCallback(async (gradeId: string, gradeData: Partial<Grade>) => {
    try {
      await updateDoc(doc(db, 'grades', gradeId), {
        ...gradeData,
        updatedAt: Timestamp.now(),
      })

      setGrades((prev) =>
        prev.map((g) =>
          g.id === gradeId
            ? {
                ...g,
                ...gradeData,
                updatedAt: Date.now(),
              }
            : g
        )
      )
    } catch (error) {
      console.error('Error updating grade:', error)
      throw error
    }
  }, [])

  // Fetch initial data on mount
  useEffect(() => {
    fetchSemesters()
  }, [fetchSemesters])

  // Fetch subjects and schedules when selected semester changes
  useEffect(() => {
    if (selectedSemesterId) {
      fetchSubjects(selectedSemesterId)
      fetchSchedules(selectedSemesterId)
      fetchGrades(selectedSemesterId)
    }
  }, [selectedSemesterId, fetchSubjects, fetchSchedules, fetchGrades])

  const value: AppContextType = {
    selectedSemesterId,
    semesters,
    subjects,
    schedules,
    todos,
    grades,
    setSemesters,
    setSelectedSemesterId,
    addSemester,
    deleteSemester,
    fetchSemesters,
    setSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedules,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    fetchTodos,
    setGrades,
    addGrade,
    updateGrade,
    fetchGrades,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

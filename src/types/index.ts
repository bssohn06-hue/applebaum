// 학기 타입
export interface Semester {
  id: string
  year: number // 2025, 2026 등
  grade: number // 1, 2, 3, 4
  term: 'spring' | 'fall' | 'summer' | 'winter' // 1학기, 2학기, 여름계절학기, 겨울계절학기
  name: string // 자동 생성: "2025년 2학년 2학기"
  createdAt: number
  updatedAt: number
}

// 과목 타입
export interface Subject {
  id: string
  semesterId: string
  name: string
  credits: number // 0.5, 1, 2, 3
  day: string // '월' | '화' | '수' | '목' | '금' | '토' | '일'
  startTime: string // "09:00"
  endTime: string // "10:30"
  memo: string
  createdAt: number
  updatedAt: number
}

// 일정 타입
export interface Schedule {
  id: string
  semesterId: string
  name: string
  type: 'study' | 'part-time' | 'exercise' | 'academy' | 'other'
  day: string // '월' | '화' | '수' | '목' | '금' | '토' | '일'
  startTime: string // "09:00"
  endTime: string // "10:30"
  memo: string
  createdAt: number
  updatedAt: number
}

// 체크리스트 항목 타입
export interface TodoItem {
  id: string
  semesterId: string
  date: string // "2024-12-20"
  content: string
  subjectId?: string // 관련 과목 (선택사항)
  scheduleId?: string // 관련 일정 (선택사항)
  completed: boolean
  createdAt: number
  updatedAt: number
}

// 성적 타입
export interface Grade {
  id: string
  semesterId: string
  subjectId: string
  grade: 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F' | null
  createdAt: number
  updatedAt: number
}

// 학기 성적 통계
export interface SemesterGradeStats {
  semesterId: string
  average: number
  totalCredits: number
  gradeCount: number
}

// 전체 GPA 통계
export interface OverallGradeStats {
  overallGPA: number
  semesterStats: SemesterGradeStats[]
}

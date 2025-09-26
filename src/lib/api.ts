const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${API_BASE}/auth/signup`,
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  REFRESH: `${API_BASE}/auth/refresh`,
  VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
  RESEND_VERIFICATION: `${API_BASE}/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
  PROFILE: `${API_BASE}/auth/profile`,

  // OAuth
  GOOGLE_AUTH: `${API_BASE}/auth/google`,
  GOOGLE_CALLBACK: `${API_BASE}/auth/google/callback`,

  // User
  UPDATE_USER: `${API_BASE}/auth/user/update`,
  DELETE_USER: `${API_BASE}/auth/user/delete`,

  // Chat
  CHAT: `${API_BASE}/chat/users`,
  CHAT_MESSAGES: `${API_BASE}/chat/messages`,
  CHAT_UPLOAD: `${API_BASE}/chat/upload`,
  DELETE_MESSAGE: (id: string) => `${API_BASE}/chat/messages/${id}`,
  // Admin
  GET_ALL_USERS: `${API_BASE}/admin/users`,
  GET_ALL_LESSON_PLANS: `${API_BASE}/admin/lesson-plans`,
  GET_ALL_ATTENDANCES: `${API_BASE}/admin/attendances`,

  // Department
  DEPARTMENT_LESSON_PLANS: `${API_BASE}/department/lesson-plans`,
  DEPARTMENT_ACCEPT_LESSON_PLAN: (id: string) =>
    `${API_BASE}/department/lesson-plans/${id}/accept`,
  DEPARTMENT_REJECT_LESSON_PLAN: (id: string) =>
    `${API_BASE}/department/lesson-plans/${id}/reject`,

  // Teacher
  CREATE_LESSON_PLAN: `${API_BASE}/teacher/lesson-plans`,
  UPDATE_LESSON_PLAN: (id: string) => `${API_BASE}/teacher/lesson-plans/${id}`,
  UPLOAD_LESSON_PLAN: `${API_BASE}/teacher/lesson-plans/upload`,
  GENERATE_AI_LESSON_PLAN: `${API_BASE}/teacher/lesson-plans/generate-ai`,
  GET_TEACHER_LESSON_PLAN_BY_ID: (id: string) =>
    `${API_BASE}/teacher/lesson-plans/${id}`,

  // Homework Helper
  HOMEWORK_CHAT: `${API_BASE}/homework/chat`,
}

export const OAUTH_GOOGLE_START = (): string => {
  return API_ENDPOINTS.GOOGLE_AUTH
}

export const API_BASE_URL = API_BASE

// Department API functions
export const getDepartmentLessonPlans = async (
  token: string,
  subject: string
) => {
  const url = new URL(API_ENDPOINTS.DEPARTMENT_LESSON_PLANS)
  url.searchParams.append('subject', subject)
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Failed to fetch lesson plans')
  }
  return response.json()
}

// Get teacher lesson plan by ID
export const getTeacherLessonPlanById = async (token: string, id: string) => {
  const response = await fetch(
    API_ENDPOINTS.GET_TEACHER_LESSON_PLAN_BY_ID(id),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!response.ok) {
    throw new Error('Failed to fetch lesson plan')
  }
  return response.json()
}

export const acceptLessonPlan = async (id: string, token: string) => {
  const response = await fetch(
    API_ENDPOINTS.DEPARTMENT_ACCEPT_LESSON_PLAN(id),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  )
  if (!response.ok) {
    throw new Error('Failed to accept lesson plan')
  }
  return response.json()
}

export const rejectLessonPlan = async (id: string, token: string) => {
  const response = await fetch(
    API_ENDPOINTS.DEPARTMENT_REJECT_LESSON_PLAN(id),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  )
  if (!response.ok) {
    throw new Error('Failed to reject lesson plan')
  }
  return response.json()
}

// Create lesson plan - manual or AI
export const createLessonPlan = async (
  token: string,
  lessonPlan: {
    title: string
    description: string
    subject: string
    grade: string
    type: 'manual' | 'ai'
  }
) => {
  const response = await fetch(API_ENDPOINTS.CREATE_LESSON_PLAN, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lessonPlan),
  })
  if (!response.ok) {
    throw new Error('Failed to create lesson plan')
  }
  return response.json()
}

// Upload lesson plan file
export const uploadLessonPlanFile = async (
  token: string,
  file: File,
  grade: string,
  topic: string,
  subject: string
) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('grade', grade)
  formData.append('topic', topic)
  formData.append('subject', subject)

  const response = await fetch(API_ENDPOINTS.UPLOAD_LESSON_PLAN, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  if (!response.ok) {
    throw new Error('Failed to upload lesson plan file')
  }
  return response.json()
}

// Generate AI lesson plan
export const generateAILessonPlan = async (
  token: string,
  grade: string,
  topic: string,
  subject: string
) => {
  const response = await fetch(API_ENDPOINTS.GENERATE_AI_LESSON_PLAN, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grade, topic, subject }),
  })
  if (!response.ok) {
    let errorMessage = 'Failed to generate AI lesson plan'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
      // If parsing fails, use default message
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

// Update lesson plan
export const updateLessonPlan = async (
  token: string,
  id: string,
  lessonPlan: {
    title: string
    description: string
    subject: string
    grade: string
    type: 'manual' | 'ai'
  }
) => {
  const response = await fetch(API_ENDPOINTS.UPDATE_LESSON_PLAN(id), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lessonPlan),
  })
  if (!response.ok) {
    throw new Error('Failed to update lesson plan')
  }
  return response.json()
}

// Homework Helper API functions
export const sendHomeworkChat = async (token: string, question: string) => {
  const response = await fetch(API_ENDPOINTS.HOMEWORK_CHAT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to get homework help'
    try {
      const errorData = await response.json()
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch (e) {
      // If parsing fails, use default message
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

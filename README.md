# 🏫 My School App - Frontend

Welcome to the **frontend of My School App**, a modern, interactive, and anime-inspired school management system built with **React** and **TypeScript**.  

This frontend is fully responsive, themeable, and works seamlessly with the backend API to provide students, parents, teachers, and admins with a smooth and engaging experience.

---

## 🌟 Features

- **Role-Based Dashboard**
  - Parents, Students, Teachers, Admins all see personalized dashboards.
- **AI Assistant**
  - Integrated AI for Parents and Students to help answer school-related questions.
- **Chat System**
  - Real-time messaging with chat selection, deletion, and proper user authorization.
- **Lesson Planner**
  - Teachers can plan lessons, edit, and manage schedules easily.
- **Custom Themes**
  - Dark mode, anime-inspired themes, and dynamic color schemes.
- **Secure Authentication**
  - Google OAuth login and JWT-based session management.
- **Responsive Design**
  - Fully mobile and desktop compatible with smooth animations and glassmorphism-style cards.

---

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS  
- **State Management:** React `useState` & custom hooks  
- **Routing:** React Router DOM  
- **API Communication:** Axios, REST API calls to backend  
- **Authentication:** Google OAuth, JWT  
- **Styling:** Glassmorphism cards, anime-inspired themes  
- **Deployment:** Netlify (Frontend) / Render (Backend)

---

## ⚡ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone (https://github.com/MPKDev-Codebeat13/MPK-School-App-Frontend/)
   cd MPK-School-App-Frontend

    Install dependencies

npm install

Create a .env file in the root directory:

VITE_API_URL=your_url
VITE_GOOGLE_CLIENT_ID=your_google_client_id

Run locally

    npm run dev

📦 Folder Structure

src/
├── components/      # Reusable UI components
├── pages/           # Different pages by role
├── context/         # Auth and theme context
├── hooks/           # Custom React hooks
├── assets/          # Images, icons, themes
├── App.tsx
├── main.tsx
└── styles/

🧑‍💻 Usage

    Parents can use the AI Assistant to get instant answers.

    Teachers can create, edit, and manage lessons.

    Students can view lessons, track progress, and chat with classmates.

    All users experience dynamic themes and responsive UI.

🎨 Themes

Choose from a variety of themes in the Settings page. Themes are applied globally across the dashboard for an immersive anime-inspired experience.
🔒 Security Notes

    No sensitive data is stored in localStorage for safety.

    All API requests are authenticated via JWT.

🌐 Deployment

    Frontend hosted on Netlify

    Backend hosted on Render

    Live app link: [Your Live App URL]

🙌 Author

MPK – Coding prodigy, anime enthusiast, and full-stack wizard.
GitHub: https://github.com/MPKDev-Codebeat13/
💌 Feedback

Feel free to open issues, suggest features, or just drop a ⭐ if you love the project!

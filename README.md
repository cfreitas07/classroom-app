# 🎓 Aki - Attendance App

**Aki** is a simple, mobile-friendly web application built to help instructors manage classroom attendance with ease and privacy.

Students submit attendance anonymously, and instructors have a clear dashboard to track sessions, generate attendance codes, and export records.

---

## 🚀 Features

- Instructor authentication (signup/login)
- Create classrooms with custom schedules and class size
- Generate time-limited attendance codes at the start of each session
- Students can mark attendance anonymously using the provided codes
- Attendance records organized by date
- Export attendance as CSV
- Fully responsive and mobile-ready

---

## 🔧 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.  
You may also see any lint errors in the console.

---

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

---

## 🧪 `npm test`

Launches the test runner in interactive watch mode.  
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

---

## 📖 How It Works

### 👨‍🏫 For Instructors:
1. Go to the app and select **"I'm an Instructor"**
2. Create an account or log in
3. Create a class with:
   - Class name
   - Schedule (e.g., Mon/Wed 10am)
   - Max class size
4. Before each class session, click **"Start Attendance"** to generate a temporary attendance code (valid for 10 minutes)
5. Share the code with your students
6. View or download attendance reports in CSV format

---

### 👩‍🎓 For Students:
1. Go to the app and select **"I'm a Student"**
2. Enter:
   - The **Class Code** (shared by the instructor)
   - Your **Student Code** (anonymous identifier)
   - The **Attendance Code** generated during class
3. That’s it — you’re marked as present anonymously!

---

## 🛠 Tech Stack

- **React** (frontend)
- **Firebase Auth** (authentication)
- **Firestore** (real-time database)
- **Firebase Hosting** (deployment)
- **Tailwind CSS** (styling)

---

## 📦 Deployment

To deploy using Firebase Hosting:

```bash
npm run build
firebase deploy

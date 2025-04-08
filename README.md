# Presenzo - Smart Classroom Attendance System
Presenzo is a modern, user-friendly attendance management system designed for educational institutions. It provides a seamless way for instructors to track student attendance using unique codes and QR technology.

## 🌟 Features

### For Instructors
- **Class Management**
  - Create and manage multiple classes
  - Set custom class schedules
  - Define maximum class size
  - Configure student identification methods
  - Set customizable attendance code expiration time

- **Attendance Tracking**
  - Generate unique attendance codes
  - Real-time countdown timer for active codes
  - View detailed attendance records
  - Export attendance data to CSV
  - Filter attendance records by date and student code

- **Student Identification Options**
  - Full name
  - Custom nicknames
  - Custom identification methods (e.g., student ID, class number)

### For Students
- Simple check-in process
- QR code scanning for quick access
- Multiple identification methods
- Real-time attendance confirmation

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Firebase account

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/presenzo.git
```

2. Install dependencies
```bash
cd presenzo
npm install
```

3. Set up Firebase
- Create a new Firebase project
- Add your Firebase configuration to the project
- Enable Authentication and Firestore

4. Start the development server
```bash
npm start
```

## Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Email/Password authentication
3. Set up Firestore database
4. Add your Firebase configuration to `src/firebase.js`

### Environment Variables
Create a `.env` file in the root directory with:
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

## 🌐 Multi-language Support
Presenzo supports multiple languages:
- English
- Portuguese
- Spanish

## 📱 Technologies Used
- React.js
- Firebase (Authentication & Firestore)
- QR Code Generation
- CSV Export
- Responsive Design

## 📊 Data Management
- Secure student data storage
- Real-time attendance tracking
- Exportable attendance records
- Customizable data retention

## 🔒 Security Features
- Secure authentication
- Encrypted data transmission
- Role-based access control
- Session management

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.

## Contact
Claudio de Freitas
www.claudiocsdefreitas.com

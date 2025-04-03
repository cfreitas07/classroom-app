import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import logo from '../images/logo transparent.png';
import { QRCodeSVG } from 'qrcode.react';

function Instructor() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState(null);
  const [className, setClassName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [attendanceRecordsByClass, setAttendanceRecordsByClass] = useState({});
  const [expiredCodes, setExpiredCodes] = useState({});
  const [timers, setTimers] = useState({});  // stores remaining seconds per class
  const [showLargeCodes, setShowLargeCodes] = useState({}); // tracks which class's codes are shown in large format
  const navigate = useNavigate();

  // Array of border colors for class cards
  const borderColors = [
    '#3f51b5', // Indigo
    '#f57c00', // Orange
    '#2e7d32', // Green
    '#c2185b', // Pink
    '#1976d2', // Blue
    '#f44336', // Red
    '#9c27b0', // Purple
    '#ff9800', // Amber
    '#009688', // Teal
    '#795548'  // Brown
  ];

  // Array of weekdays for selection
  const weekDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  // Array of time slots
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6; // Start from 6 AM
    const minute = (i % 2) * 30; // 0 or 30 minutes
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Function to get border color for a class
  const getBorderColor = (index) => {
    return borderColors[index % borderColors.length];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchClasses(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  function generateCode(length = 6) {
    if (length === 5) { // For attendance code
      return Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * 9) + 1
      ).join('');
    }
    // For enrollment code (4 digits between 1-9)
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 9) + 1
    ).join('');
  }

  const handleCreateClass = async () => {
    if (!userId) {
      setMessage("You're not logged in.");
      return;
    }

    // Validate inputs
    if (!className.trim()) {
      setMessage("❌ Please enter a class name");
      return;
    }
    if (!schedule.trim()) {
      setMessage("❌ Please enter a schedule");
      return;
    }
    if (!maxStudents) {
      setMessage("❌ Please enter the maximum number of students");
      return;
    }
    const maxStudentsNum = Number(maxStudents);
    if (isNaN(maxStudentsNum) || maxStudentsNum < 1) {
      setMessage("❌ Please enter a valid number of students (minimum 1)");
      return;
    }

    const code = generateCode();

    try {
      await addDoc(collection(db, 'classes'), {
        className: className.trim(),
        schedule: schedule.trim(),
        maxStudents: maxStudentsNum,
        enrollmentCode: code,
        instructorId: userId,
      });

      setMessage(`✅ Class created! Code: ${code}`);
      // Clear all input fields
      setClassName('');
      setSchedule('');
      setMaxStudents('');
      fetchClasses(userId);
    } catch (error) {
      setMessage(`❌ Error creating class: ${error.message}`);
    }
  };

  const fetchAttendanceForClass = async (classId, forDownload = false) => {
    try {
      // If clicking the same class that's already expanded, just collapse it
      if (expandedClassId === classId && !forDownload) {
        setExpandedClassId(null);
        return;
      }

      const q = query(
        collection(db, 'attendanceRecords'),
        where('classId', '==', classId)
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map((doc) => doc.data());
  
      if (forDownload) {
        downloadAsCSV(records);
      } else {
        setAttendanceRecordsByClass((prev) => ({
          ...prev,
          [classId]: records,
        }));
        setExpandedClassId(classId);
      }
    } catch (error) {
      setMessage(`❌ Error fetching attendance: ${error.message}`);
    }
  };
  

  const downloadAsCSV = (records) => {
    if (!records.length) {
      alert("No attendance records found.");
      return;
    }
  
    const studentMap = new Map();
    const allDatesSet = new Set();
  
    records.forEach((record) => {
      const dateObj = new Date(record.timestamp);
      const date = dateObj.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      allDatesSet.add(date);
  
      if (!studentMap.has(record.studentCode)) {
        studentMap.set(record.studentCode, {});
      }
  
      studentMap.get(record.studentCode)[date] = time;
    });
  
    const allDates = Array.from(allDatesSet).sort(); // Sorted list of dates
    const header = ['Student Code', ...allDates];
  
    const rows = Array.from(studentMap.entries()).map(([studentCode, dates]) => {
      return [studentCode, ...allDates.map(date => dates[date] || '')];
    });
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(','))
      .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance_by_date.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  
  
  

  const handleStartAttendance = async (classId) => {
    // Generate a random 3-digit code
    const newCode = Math.floor(100 + Math.random() * 900).toString();
    
    const expirationTime = Date.now() + (3 * 60 * 1000);
    
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        attendanceCode: newCode,
        attendanceCodeGeneratedAt: Date.now(),
        attendanceCodeExpiresAt: expirationTime
      });
  
      // Show code and reset expiration
      setExpiredCodes((prev) => ({ ...prev, [classId]: false }));
      setTimers((prev) => ({ ...prev, [classId]: 180 })); // 3 minutes in seconds
      setShowLargeCodes((prev) => ({ ...prev, [classId]: true })); // Show the modal automatically
  
      // Clear any existing interval for this class
      if (window.attendanceIntervals && window.attendanceIntervals[classId]) {
        clearInterval(window.attendanceIntervals[classId]);
      }
  
      // Initialize the intervals object if it doesn't exist
      if (!window.attendanceIntervals) {
        window.attendanceIntervals = {};
      }
  
      // Countdown timer
      window.attendanceIntervals[classId] = setInterval(() => {
        setTimers((prev) => {
          const newTime = prev[classId] - 1;
          if (newTime <= 0) {
            clearInterval(window.attendanceIntervals[classId]);
            setExpiredCodes((prevExpired) => ({ ...prevExpired, [classId]: true }));
            return { ...prev, [classId]: 0 };
          }
          return { ...prev, [classId]: newTime };
        });
      }, 1000); // Run every 1000ms (1 second)
  
      setMessage(`✅ Attendance code "${newCode}" generated for class.`);
      fetchClasses(userId);
    } catch (error) {
      setMessage(`❌ Failed to generate code: ${error.message}`);
    }
  };
  
  

  const fetchClasses = async (instructorId) => {
    if (!instructorId) return;

    try {
      const q = query(collection(db, 'classes'), where('instructorId', '==', instructorId));
      const snapshot = await getDocs(q);
      const classList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    } catch (error) {
      setMessage(`❌ Error fetching classes: ${error.message}`);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) return 'Password must be at least 6 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Please log in instead.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed': return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password': return 'Please choose a stronger password.';
      case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found': return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      default: return error.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    console.log('Submit button clicked'); // Debug log

    try {
      console.log('Setting persistence...'); // Debug log
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        console.log('Attempting login...'); // Debug log
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user); // Debug log
        setMessage('✅ Successfully logged in!');
      } else {
        console.log('Attempting signup...'); // Debug log
        const passwordError = validatePassword(password);
        if (passwordError) {
          setMessage(`❌ ${passwordError}`);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Signup successful:', userCredential.user); // Debug log
        setMessage('✅ Account created and logged in!');
      }
    } catch (error) {
      console.error('Auth error:', error); // Debug log
      setMessage(`❌ ${getErrorMessage(error)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage('✅ Successfully logged out!');
      // Clear any local state
      setUserId(null);
      setClasses([]);
      setAttendanceRecordsByClass({});
      setExpiredCodes({});
      setTimers({});
      setShowLargeCodes({});
      // Navigate to home page
      navigate('/');
    } catch (error) {
      setMessage(`❌ Error logging out: ${error.message}`);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'classes', classId));
      setMessage('✅ Class deleted successfully');
      fetchClasses(userId);
    } catch (error) {
      setMessage(`❌ Error deleting class: ${error.message}`);
    }
  };

  // Function to handle schedule creation
  const handleScheduleChange = () => {
    if (selectedDays.length === 0 || !selectedTime) {
      setMessage('❌ Please select at least one day and time');
      return;
    }

    const daysText = selectedDays.map(day => day.label).join('/');
    const scheduleText = `${daysText} ${selectedTime}`;
    setSchedule(scheduleText);
  };

  if (userId) {
    return (
      <div style={{ 
        maxWidth: 800, 
        margin: '40px auto', 
        padding: '0 20px', 
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img 
              src={logo} 
              alt="Presenzo Logo" 
              style={{ 
                height: 'clamp(40px, 10vw, 60px)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                height: 'auto'
              }} 
              onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            />
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              transition: 'background-color 0.2s ease',
              ':hover': {
                backgroundColor: '#475569'
              }
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#475569'}
            onMouseOut={e => e.target.style.backgroundColor = '#64748b'}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1.5rem' }}>Create a New Class</h3>
          <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '8px'
            }}>
              <span style={{ 
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#1e293b',
                whiteSpace: 'nowrap'
              }}>
                Class Name:
              </span>
              <input 
                type="text" 
                placeholder="e.g., Introduction to Programming" 
                value={className} 
                onChange={(e) => setClassName(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: 'clamp(8px, 2vw, 12px)', 
                  boxSizing: 'border-box',
                  textAlign: 'left',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                }} 
              />
            </div>
            
            <div style={{ 
              margin: '15px 0',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <div style={{ 
                marginBottom: '10px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#1e293b'
              }}>
                Select Class Schedule
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                marginBottom: '15px'
              }}>
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => {
                      setSelectedDays(prev => {
                        const isSelected = prev.some(d => d.id === day.id);
                        if (isSelected) {
                          return prev.filter(d => d.id !== day.id);
                        } else {
                          return [...prev, day];
                        }
                      });
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: selectedDays.some(d => d.id === day.id) ? '#3f51b5' : '#e2e8f0',
                      color: selectedDays.some(d => d.id === day.id) ? 'white' : '#1e293b',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => {
                      if (!selectedDays.some(d => d.id === day.id)) {
                        e.target.style.backgroundColor = '#cbd5e1';
                      }
                    }}
                    onMouseOut={e => {
                      if (!selectedDays.some(d => d.id === day.id)) {
                        e.target.style.backgroundColor = '#e2e8f0';
                      }
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              <div style={{ 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  color: '#1e293b'
                }}>
                  Time:
                </span>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleScheduleChange}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  width: '100%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#303f9f'}
                onMouseOut={e => e.target.style.backgroundColor = '#3f51b5'}
              >
                Set Schedule
              </button>

              {schedule && (
                <div style={{ 
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#1e293b'
                }}>
                  Current schedule: {schedule}
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '8px'
            }}>
              <span style={{ 
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#1e293b',
                whiteSpace: 'nowrap'
              }}>
                Class Size:
              </span>
              <input 
                type="number" 
                placeholder="e.g., 30" 
                value={maxStudents} 
                onChange={(e) => setMaxStudents(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: 'clamp(8px, 2vw, 12px)', 
                  boxSizing: 'border-box',
                  textAlign: 'left',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                }} 
              />
            </div>
            {message && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '12px', 
                backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
                borderRadius: '6px',
                color: message.includes('✅') ? '#059669' : '#dc2626',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {message}
              </div>
            )}
            <button 
              onClick={handleCreateClass} 
              style={{ 
                padding: 'clamp(8px, 2vw, 12px)', 
                width: '100%', 
                backgroundColor: '#3f51b5', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                marginTop: 10, 
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#303f9f'}
              onMouseOut={e => e.target.style.backgroundColor = '#3f51b5'}
            >
              Create Class
            </button>
          </div>
        </div>

        {classes.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1.5rem' }}>Your Classes:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {classes.map((cls, index) => (
                <li key={cls.id} style={{ 
                  marginBottom: 20, 
                  textAlign: 'center',
                  padding: 'clamp(15px, 3vw, 20px)',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: `3px solid ${getBorderColor(index)}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  }
                }}>
                  <strong style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>{cls.className}</strong> – 
                  <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}> {cls.schedule}</span><br />
                  <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Class Size: {cls.maxStudents}</span><br />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    marginTop: '5px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
                      Enrollment Code: <code style={{ 
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                      }}>{cls.enrollmentCode}</code>
                    </span>
                    <button
                      onClick={() => setShowLargeCodes(prev => ({
                        ...prev,
                        [cls.id]: !prev[cls.id]
                      }))}
                      title="Click to show codes in large format"
                      style={{
                        padding: 'clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 12px)',
                        backgroundColor: showLargeCodes[cls.id] ? '#94a3b8' : '#cbd5e1',
                        color: '#1e293b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        ':hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: '#94a3b8'
                        }
                      }}
                      onMouseOver={e => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.backgroundColor = '#94a3b8';
                      }}
                      onMouseOut={e => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = showLargeCodes[cls.id] ? '#94a3b8' : '#cbd5e1';
                      }}
                    >
                      {showLargeCodes[cls.id] ? 'Hide Codes' : 'Show Codes'}
                    </button>
                  </div>

                  {showLargeCodes[cls.id] && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1000,
                      padding: '20px'
                    }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: 'clamp(20px, 5vw, 40px)',
                        borderRadius: '12px',
                        maxWidth: '90%',
                        width: '400px',
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        <button
                          onClick={() => setShowLargeCodes(prev => ({
                            ...prev,
                            [cls.id]: false
                          }))}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '6px',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={e => e.target.style.backgroundColor = '#f0f0f0'}
                          onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                        >
                          ×
                        </button>
                        <h2 style={{ 
                          marginBottom: '25px', 
                          color: '#1e293b',
                          fontSize: 'clamp(1.5rem, 4vw, 2rem)'
                        }}>
                          {cls.className}
                        </h2>
                        
                        <div style={{ marginBottom: '30px' }}>
                          <div style={{ 
                            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', 
                            color: '#64748b', 
                            marginBottom: '12px' 
                          }}>
                            Enrollment Code
                          </div>
                          <div style={{
                            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                            fontWeight: 'bold',
                            color: '#3f51b5',
                            letterSpacing: '4px',
                            padding: 'clamp(10px, 2vw, 15px)',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}>
                            {cls.enrollmentCode}
                          </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                          <div style={{ 
                            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', 
                            color: '#64748b', 
                            marginBottom: '12px' 
                          }}>
                            Attendance Code
                          </div>
                          <div style={{
                            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                            fontWeight: 'bold',
                            color: '#f57c00',
                            letterSpacing: '8px',
                            padding: 'clamp(15px, 3vw, 20px)',
                            backgroundColor: '#fff3e0',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}>
                            {cls.attendanceCode || '---'}
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '15px'
                          }}>
                            <QRCodeSVG
                              value="https://presenzo.com/student"
                              size={120}
                              level="H"
                              includeMargin={true}
                              style={{
                                backgroundColor: 'white',
                                padding: '8px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          </div>
                          <div style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            color: '#64748b',
                            marginTop: '10px',
                            textAlign: 'center'
                          }}>
                            Scan QR code to go to presenzo.com/student
                          </div>
                          <div style={{
                            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                            color: '#f57c00',
                            fontWeight: 'bold',
                            marginTop: '15px'
                          }}>
                            Time Remaining: {Math.floor(timers[cls.id] / 60)}:{(timers[cls.id] % 60).toString().padStart(2, '0')}
                          </div>
                        </div>

                        <div style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginTop: '20px'
                        }}>
                          <div style={{
                            width: `${(timers[cls.id] / 180) * 100}%`,
                            height: '100%',
                            backgroundColor: '#f57c00',
                            transition: 'width 1s linear'
                          }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '10px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleStartAttendance(cls.id)}
                      style={{
                        padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                        backgroundColor: '#f57c00',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        minWidth: '110px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                      }}
                    >
                      Start Attendance
                    </button>

                    <button
                      onClick={() => fetchAttendanceForClass(cls.id)}
                      style={{
                        padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                        backgroundColor: expandedClassId === cls.id ? '#01579b' : '#0288d1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        minWidth: '110px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                      }}
                    >
                      {expandedClassId === cls.id ? 'Hide Attendance' : 'View Attendance'}
                    </button>

                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      style={{
                        padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        minWidth: '110px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#b91c1c'}
                      onMouseOut={e => e.target.style.backgroundColor = '#dc2626'}
                    >
                      Delete Class
                    </button>
                  </div>

                  {expandedClassId === cls.id && attendanceRecordsByClass[cls.id] && (
                    <div style={{ 
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}>
                        <h4 style={{ 
                          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                          color: '#1e293b',
                          margin: 0
                        }}>
                          Attendance Records
                        </h4>
                        <button
                          onClick={() => fetchAttendanceForClass(cls.id, true)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3f51b5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          📥 Download CSV
                        </button>
                      </div>
                      
                      <div style={{ 
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: 'white'
                      }}>
                        <table style={{ 
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                        }}>
                          <thead>
                            <tr style={{ 
                              backgroundColor: '#f1f5f9',
                              borderBottom: '2px solid #e2e8f0'
                            }}>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Student Code</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecordsByClass[cls.id]
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .map((record, index) => {
                                const date = new Date(record.timestamp);
                                return (
                                  <tr key={index} style={{ 
                                    borderBottom: '1px solid #e2e8f0',
                                    ':hover': {
                                      backgroundColor: '#f8fafc'
                                    }
                                  }}>
                                    <td style={{ padding: '10px' }}>{record.studentCode}</td>
                                    <td style={{ padding: '10px' }}>{date.toLocaleDateString()}</td>
                                    <td style={{ padding: '10px' }}>{date.toLocaleTimeString()}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img 
          src={logo} 
          alt="Presenzo Logo" 
          style={{ 
            height: '60px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            marginBottom: '2rem'
          }} 
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        />
      </Link>

      <div style={{ 
        marginTop: 40,
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem',
          color: '#1e293b',
          marginBottom: '1.5rem',
          fontWeight: '600'
        }}>
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              margin: '8px 0',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1rem',
              transition: 'border-color 0.2s ease'
            }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              margin: '8px 0',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1rem',
              transition: 'border-color 0.2s ease'
            }}
          />
          {!isLogin && (
            <div style={{ 
              fontSize: '0.85rem',
              color: '#64748b',
              marginTop: '8px',
              textAlign: 'left',
              padding: '0 4px'
            }}>
              Password must contain:
              <ul style={{ 
                margin: '4px 0 0 20px',
                padding: 0,
                textAlign: 'left'
              }}>
                <li>At least 6 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>
          )}
        </div>

        {isLogin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Remember me
            </label>
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          style={{ 
            padding: '12px', 
            width: '100%', 
            backgroundColor: isLogin ? '#3f51b5' : '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            marginTop: '10px', 
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={e => e.target.style.backgroundColor = isLogin ? '#303f9f' : '#059669'}
          onMouseOut={e => e.target.style.backgroundColor = isLogin ? '#3f51b5' : '#10b981'}
        >
          {isLogin ? 'Login' : 'Create Account'}
        </button>

        {message && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '12px', 
            backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
            borderRadius: '6px',
            color: message.includes('✅') ? '#059669' : '#dc2626',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        <p style={{ 
          color: '#64748b',
          marginBottom: '0.5rem'
        }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'transparent', 
            color: '#3f51b5', 
            border: '2px solid #3f51b5', 
            borderRadius: '6px', 
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.target.style.backgroundColor = '#3f51b5';
            e.target.style.color = 'white';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#3f51b5';
          }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default Instructor;
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
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

function Instructor() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState(null);
  const [className, setClassName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxStudents, setMaxStudents] = useState(30);
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [attendanceRecordsByClass, setAttendanceRecordsByClass] = useState({});
  const [expiredCodes, setExpiredCodes] = useState({});
  const [timers, setTimers] = useState({});  // stores remaining seconds per class
  const [showLargeCodes, setShowLargeCodes] = useState({}); // tracks which class's codes are shown in large format

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
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  const handleCreateClass = async () => {
    if (!userId) {
      setMessage("You're not logged in.");
      return;
    }

    const code = generateCode();

    try {
      await addDoc(collection(db, 'classes'), {
        className,
        schedule,
        maxStudents: Number(maxStudents),
        enrollmentCode: code,
        instructorId: userId,
      });

      setMessage(`✅ Class created! Code: ${code}`);
      setClassName('');
      setSchedule('');
      setMaxStudents(30);
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
    const code = generateCode(5);
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        attendanceCode: code,
        attendanceCodeGeneratedAt: Date.now(),
      });
  
      // Show code and reset expiration
      setExpiredCodes((prev) => ({ ...prev, [classId]: false }));
      setTimers((prev) => ({ ...prev, [classId]: 600 })); // 10 minutes
  
      // Countdown timer
      const interval = setInterval(() => {
        setTimers((prev) => {
          const newTime = (prev[classId] || 0) - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            setExpiredCodes((prevExpired) => ({ ...prevExpired, [classId]: true }));
            return { ...prev, [classId]: 0 };
          }
          return { ...prev, [classId]: newTime };
        });
      }, 1000);
  
      setMessage(`✅ Attendance code "${code}" generated for class.`);
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

  if (userId) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ 
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            textAlign: 'center',
            marginBottom: '2rem',
            ':hover': {
              transform: 'scale(1.05)'
            }
          }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
            🎓 Aki
          </h1>
        </Link>

        <div style={{ marginTop: 40, textAlign: 'left' }}>
          <h3>Create a New Class</h3>
          <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }} />
          <input type="text" placeholder="Schedule (e.g., Mon/Wed 10am)" value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }} />
          <input type="number" placeholder="Max Students" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }} />
          <button onClick={handleCreateClass} style={{ padding: 10, width: '100%', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', marginTop: 10, cursor: 'pointer' }}>Create Class</button>
        </div>

        {classes.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h3>Your Classes:</h3>
            <ul>
              {classes.map((cls) => (
                <li key={cls.id} style={{ marginBottom: 20 }}>
                  <strong>{cls.className}</strong> – {cls.schedule}<br />
                  Max Students: {cls.maxStudents}<br />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <span>Enrollment Code: <code>{cls.enrollmentCode}</code></span>
                    <button
                      onClick={() => setShowLargeCodes(prev => ({
                        ...prev,
                        [cls.id]: !prev[cls.id]
                      }))}
                      title="Click to show codes in large format"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: showLargeCodes[cls.id] ? '#94a3b8' : '#cbd5e1',
                        color: '#1e293b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1.2em',
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
                      🔍
                    </button>
                  </div>
                  {cls.attendanceCode && !expiredCodes[cls.id] && (
                    <div style={{ color: '#c62828', fontWeight: 'bold', marginTop: 8 }}>
                      Active Attendance Code: <code>{cls.attendanceCode}</code>
                      <span style={{ marginLeft: 12 }}>
                        ⏳ {Math.floor((timers[cls.id] || 0) / 60)
                          .toString()
                          .padStart(2, '0')}:
                        {(timers[cls.id] % 60 || 0).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* Large Codes Modal */}
                  {showLargeCodes[cls.id] && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1000,
                      padding: '20px'
                    }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        maxWidth: '90%',
                        width: '600px',
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
                            top: '10px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                          }}
                        >
                          ×
                        </button>
                        <h2 style={{ marginBottom: '30px', color: '#333' }}>{cls.className}</h2>
                        
                        <div style={{ marginBottom: '40px' }}>
                          <div style={{ fontSize: '1.2em', color: '#666', marginBottom: '10px' }}>Enrollment Code</div>
                          <div style={{
                            fontSize: '3.5em',
                            fontWeight: 'bold',
                            color: '#3f51b5',
                            letterSpacing: '4px',
                            padding: '20px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '8px',
                            marginBottom: '20px'
                          }}>
                            {cls.enrollmentCode}
                          </div>
                        </div>

                        {cls.attendanceCode && !expiredCodes[cls.id] && (
                          <div>
                            <div style={{ fontSize: '1.2em', color: '#666', marginBottom: '10px' }}>Active Attendance Code</div>
                            <div style={{
                              fontSize: '3.5em',
                              fontWeight: 'bold',
                              color: '#c62828',
                              letterSpacing: '4px',
                              padding: '20px',
                              backgroundColor: '#ffebee',
                              borderRadius: '8px'
                            }}>
                              {cls.attendanceCode}
                            </div>
                            <div style={{
                              fontSize: '1.2em',
                              color: '#c62828',
                              marginTop: '15px'
                            }}>
                              ⏳ {Math.floor((timers[cls.id] || 0) / 60).toString().padStart(2, '0')}:
                              {(timers[cls.id] % 60 || 0).toString().padStart(2, '0')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleStartAttendance(cls.id)}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#f57c00',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px',
                    }}
                  >
                    Start Attendance
                  </button>

                  <button
                    onClick={() => fetchAttendanceForClass(cls.id)}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: expandedClassId === cls.id ? '#01579b' : '#0288d1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    {expandedClassId === cls.id ? 'Hide Attendance' : 'View Attendance'}
                  </button>

                  <button
                    onClick={() => fetchAttendanceForClass(cls.id, true)}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#00796b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Download CSV
                  </button>

                  <button
                    onClick={async () => {
                      const confirmDelete = window.confirm(`Are you sure you want to delete "${cls.className}"?`);
                      if (!confirmDelete) return;

                      try {
                        await deleteDoc(doc(db, 'classes', cls.id));
                        setMessage('✅ Class deleted.');
                        fetchClasses(userId); // Refresh class list
                      } catch (error) {
                        setMessage(`❌ Error deleting class: ${error.message}`);
                      }
                    }}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#c62828',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Class
                  </button>

                  {/* Display attendance records when class is expanded */}
                  {expandedClassId === cls.id && attendanceRecordsByClass[cls.id] && (
                    <div style={{ 
                      marginTop: 15, 
                      padding: 15, 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h4 style={{ marginTop: 0, marginBottom: 10 }}>Attendance Records</h4>
                      {attendanceRecordsByClass[cls.id].length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No attendance records found.</p>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            backgroundColor: 'white'
                          }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Student Code</th>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceRecordsByClass[cls.id].map((record, index) => {
                                const date = new Date(record.timestamp);
                                return (
                                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{record.studentCode}</td>
                                    <td style={{ padding: '8px' }}>{date.toLocaleDateString()}</td>
                                    <td style={{ padding: '8px' }}>{date.toLocaleTimeString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
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
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          textAlign: 'center',
          marginBottom: '2rem',
          ':hover': {
            transform: 'scale(1.05)'
          }
        }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
          🎓 Aki
        </h1>
      </Link>

      <div style={{ marginTop: 40, textAlign: 'left' }}>
        <h3>{isLogin ? 'Login' : 'Sign Up'}</h3>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8, margin: '8px 0' }} />
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
        </div>
        <button 
          onClick={handleSubmit} 
          style={{ 
            padding: 10, 
            width: '100%', 
            backgroundColor: '#3f51b5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            marginTop: 10, 
            cursor: 'pointer' 
          }}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        {message && (
          <div style={{ 
            marginTop: 10, 
            padding: 10, 
            backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            borderRadius: '4px',
            color: message.includes('✅') ? '#2e7d32' : '#c62828'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <h3>{isLogin ? "Don't have an account?" : "Already have an account?"}</h3>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            padding: 10, 
            width: '100%', 
            backgroundColor: '#3f51b5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            marginTop: 10, 
            cursor: 'pointer' 
          }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default Instructor;
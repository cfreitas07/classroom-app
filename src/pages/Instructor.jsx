import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
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

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('✅ Successfully logged in!');
      } else {
        const passwordError = validatePassword(password);
        if (passwordError) {
          setMessage(`❌ ${passwordError}`);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('✅ Account created and logged in!');
      }
    } catch (error) {
      setMessage(`❌ ${getErrorMessage(error)}`);
    }
  };

  if (userId) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <h2>Welcome, Instructor!</h2>

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
                  Enrollment Code: <code>{cls.enrollmentCode}</code><br />
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
                      backgroundColor: '#0288d1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    View Attendance
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
                        setMessage(`❌ Failed to delete: ${error.message}`);
                      }
                    }}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '10px',
                    }}
                  >
                    Delete Class
                  </button>


                                {expandedClassId === cls.id && attendanceRecordsByClass[cls.id] && (
                <div style={{ marginTop: 15, background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                  <h4>Attendance Records:</h4>
                  {attendanceRecordsByClass[cls.id].length === 0 ? (
                    <p>No records yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Student Code</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Date</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecordsByClass[cls.id].map((record, i) => {
                          const dateObj = new Date(record.timestamp);
                          const date = dateObj.toLocaleDateString();
                          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <tr key={i}>
                              <td style={{ padding: '4px 8px' }}>{record.studentCode}</td>
                              <td style={{ padding: '4px 8px' }}>{date}</td>
                              <td style={{ padding: '4px 8px' }}>{time}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}


                </li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <p style={{ marginTop: 20, padding: '10px', backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee', borderRadius: '4px', color: message.includes('✅') ? '#2e7d32' : '#c62828' }}>{message}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
      <h2>{isLogin ? 'Instructor Login' : 'Instructor Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, margin: '10px 0' }} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, margin: '10px 0' }} />
        {!isLogin && (
          <div style={{ textAlign: 'left', fontSize: '0.8em', color: '#666', margin: '5px 0' }}>
            Password must contain:
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>At least 6 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>
        )}
        <div style={{ textAlign: 'left', margin: '10px 0' }}>
          <label>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ marginRight: '5px' }} />
            Remember me
          </label>
        </div>
        <button type="submit" style={{ padding: 10, width: '100%', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: 20 }}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', color: '#2196F3', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </p>
      {message && (
        <p style={{ marginTop: 20, padding: '10px', backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee', borderRadius: '4px', color: message.includes('✅') ? '#2e7d32' : '#c62828' }}>{message}</p>
      )}
    </div>
  );
}

export default Instructor;

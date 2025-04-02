import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import logo from '../images/logo transparent.png';

function Student() {
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [classId, setClassId] = useState(null);
  const [classData, setClassData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Check for recent submission on component mount
  useEffect(() => {
    const lastSubmission = localStorage.getItem('lastAttendanceSubmission');
    if (lastSubmission) {
      const submissionTime = parseInt(lastSubmission);
      const now = Date.now();
      const timeDiff = now - submissionTime;
      
      if (timeDiff < 180000) { // 3 minutes in milliseconds
        const remainingTime = Math.ceil((180000 - timeDiff) / 1000);
        setStatusMessage(`❌ Please wait ${remainingTime} seconds before submitting again.`);
      }
    }
  }, []);

  // Step 1: Join a class by code
  const handleJoinClass = async () => {
    setStatusMessage('');
    
    // Check for recent submission
    const lastSubmission = localStorage.getItem('lastAttendanceSubmission');
    if (lastSubmission) {
      const submissionTime = parseInt(lastSubmission);
      const now = Date.now();
      const timeDiff = now - submissionTime;
      
      if (timeDiff < 180000) { // 3 minutes in milliseconds
        const remainingTime = Math.ceil((180000 - timeDiff) / 1000);
        setStatusMessage(`❌ Please wait ${remainingTime} seconds before submitting again.`);
        return;
      }
    }

    const q = query(collection(db, 'classes'), where('enrollmentCode', '==', enrollmentCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setStatusMessage('❌ Class not found. Check the enrollment code.');
      return;
    }

    const classDoc = querySnapshot.docs[0];
    setClassId(classDoc.id);
    setClassData(classDoc.data());
    setStatusMessage('✅ Class found. Now enter your student code and today\'s attendance code.');
  };

  // Step 2: Submit attendance
  const handleSubmitAttendance = async () => {
    setStatusMessage('');

    // Check for recent submission
    const lastSubmission = localStorage.getItem('lastAttendanceSubmission');
    if (lastSubmission) {
      const submissionTime = parseInt(lastSubmission);
      const now = Date.now();
      const timeDiff = now - submissionTime;
      
      if (timeDiff < 180000) { // 3 minutes in milliseconds
        const remainingTime = Math.ceil((180000 - timeDiff) / 1000);
        setStatusMessage(`❌ Please wait ${remainingTime} seconds before submitting again.`);
        return;
      }
    }

    if (!classId || !classData) {
      setStatusMessage('❌ Please join a class first.');
      return;
    }

    if (!studentCode.trim()) {
      setStatusMessage('❌ Please enter your student code');
      return;
    }

    // Check if attendance code is expired (15 minutes)
    const generatedTime = classData.attendanceCodeGeneratedAt;
    const now = Date.now();
    const timeDiff = now - generatedTime;

    if (classData.attendanceCode !== attendanceCode) {
      setStatusMessage('❌ Invalid attendance code.');
      return;
    }

    if (timeDiff > 15 * 60 * 1000) {
      setStatusMessage('❌ Attendance code has expired.');
      return;
    }

    try {
      await addDoc(collection(db, 'attendanceRecords'), {
        classId,
        studentCode,
        timestamp: Date.now(),
      });

      // Save submission time to localStorage
      localStorage.setItem('lastAttendanceSubmission', Date.now().toString());

      setShowSuccessModal(true);
      setCountdown(5);
      
      // Redirect to home page after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      setStatusMessage(`❌ Error: ${error.message}`);
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showSuccessModal, countdown]);

  const buttonStyle = {
    padding: '10px 20px',
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      {showSuccessModal && (
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
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '90%',
            width: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              color: '#4CAF50',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '2rem',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              Attendance Submitted!
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              marginBottom: '10px'
            }}>
              Redirecting to home page in {countdown} seconds...
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e2e8f0',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(countdown / 5) * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 1s linear'
              }} />
            </div>
          </div>
        </div>
      )}

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

      <h2>Student Check-In</h2>

      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Class Enrollment Code"
        value={enrollmentCode}
        onChange={(e) => setEnrollmentCode(e.target.value.replace(/[^0-9]/g, '').toUpperCase())}
        style={{ width: '100%', padding: 10, margin: '10px 0' }}
      />
      <button 
        onClick={handleJoinClass} 
        style={buttonStyle}
        onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
      >
        Join Class
      </button>

      {classData && (
        <>
          <input
            type="text"
            placeholder="Your Student Code *"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            style={{ 
              width: '100%', 
              padding: 10, 
              margin: '10px 0',
              borderColor: !studentCode.trim() ? '#ffcdd2' : '#e2e8f0',
              borderWidth: '1px',
              borderStyle: 'solid',
              outline: 'none'
            }}
            required
          />
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{3}"
            maxLength="3"
            placeholder="Attendance Code (3 digits)"
            value={attendanceCode}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
              setAttendanceCode(value);
            }}
            style={{ width: '100%', padding: 10, margin: '10px 0' }}
          />
          <button 
            onClick={handleSubmitAttendance} 
            style={buttonStyle}
            onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Submit Attendance
          </button>
        </>
      )}

      {statusMessage && !showSuccessModal && (
        <p style={{ 
          marginTop: 20, 
          padding: '10px',
          backgroundColor: statusMessage.includes('✅') ? '#e8f5e9' : '#ffebee',
          borderRadius: '4px',
          color: statusMessage.includes('✅') ? '#2e7d32' : '#c62828'
        }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default Student;

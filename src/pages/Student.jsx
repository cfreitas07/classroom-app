import { useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';

function Student() {
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [classId, setClassId] = useState(null);
  const [classData, setClassData] = useState(null);

  // Step 1: Join a class by code
  const handleJoinClass = async () => {
    setStatusMessage('');
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

    if (!classId || !classData) {
      setStatusMessage('❌ Please join a class first.');
      return;
    }

    // OPTIONAL: Check if attendance code is expired (15 minutes)
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

      setStatusMessage('✅ Attendance recorded successfully!');
    } catch (error) {
      setStatusMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
      <h2>Student Check-In</h2>

      <input
        type="text"
        placeholder="Class Enrollment Code"
        value={enrollmentCode}
        onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
        style={{ width: '100%', padding: 10, margin: '10px 0' }}
      />
      <button onClick={handleJoinClass} style={{ padding: 10, width: '100%' }}>
        Join Class
      </button>

      {classData && (
        <>
          <input
            type="text"
            placeholder="Your Student Code"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            style={{ width: '100%', padding: 10, margin: '10px 0' }}
          />
          <input
            type="text"
            placeholder="Attendance Code"
            value={attendanceCode}
            onChange={(e) => setAttendanceCode(e.target.value)}
            style={{ width: '100%', padding: 10, margin: '10px 0' }}
          />
          <button onClick={handleSubmitAttendance} style={{ padding: 10, width: '100%' }}>
            Submit Attendance
          </button>
        </>
      )}

      {statusMessage && (
        <p style={{ marginTop: 20 }}>{statusMessage}</p>
      )}
    </div>
  );
}

export default Student;

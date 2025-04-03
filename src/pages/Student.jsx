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
import { FaGlobe } from 'react-icons/fa';
import logo from '../images/logo transparent.png';

function Student() {
  const [language, setLanguage] = useState('en');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [classId, setClassId] = useState(null);
  const [classData, setClassData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showAttendanceInfo, setShowAttendanceInfo] = useState(false);
  const navigate = useNavigate();

  const translations = {
    en: {
      title: 'Student Check-In',
      step1: 'Step 1: Enter Class Enrollment Code',
      step2: 'Step 2: Enter Your Details',
      enrollmentPlaceholder: 'Enter the code provided by your instructor',
      joinClass: 'Join Class',
      studentIdentifier: '👤 Student Identifier',
      privacyNotice: '⚠️ Privacy Notice',
      privacyText: 'Please contact your instructor to confirm what identifier you should use. For privacy reasons, do not enter your full name. Your instructor will provide guidance on how to identify yourself in the system.',
      studentPlaceholder: 'Enter your student identifier',
      attendanceCode: '🔢 Attendance Code',
      attendancePlaceholder: 'Enter the 3-digit code from the screen',
      submitAttendance: 'Submit Attendance',
      successTitle: 'Attendance Submitted!',
      redirecting: 'Redirecting to home page in',
      seconds: 'seconds...',
      errors: {
        wait: 'Please wait',
        seconds: 'seconds before submitting again.',
        classNotFound: 'Class not found. Check the enrollment code.',
        classFound: 'Class found. Now enter your student code and today\'s attendance code.',
        joinFirst: 'Please join a class first.',
        enterCode: 'Please enter your student code',
        invalidCode: 'Invalid attendance code.',
        expiredCode: 'Attendance code has expired.',
        error: 'Error:'
      }
    },
    pt: {
      title: 'Registro de Presença',
      step1: 'Passo 1: Digite o Código de Matrícula',
      step2: 'Passo 2: Digite Seus Detalhes',
      enrollmentPlaceholder: 'Digite o código fornecido pelo seu instrutor',
      joinClass: 'Entrar na Turma',
      studentIdentifier: '👤 Identificador do Estudante',
      privacyNotice: '⚠️ Aviso de Privacidade',
      privacyText: 'Entre em contato com seu instrutor para confirmar qual identificador você deve usar. Por questões de privacidade, não digite seu nome completo. Seu instrutor fornecerá orientações sobre como se identificar no sistema.',
      studentPlaceholder: 'Digite seu identificador',
      attendanceCode: '🔢 Código de Presença',
      attendancePlaceholder: 'Digite o código de 3 dígitos da tela',
      submitAttendance: 'Enviar Presença',
      successTitle: 'Presença Registrada!',
      redirecting: 'Redirecionando para a página inicial em',
      seconds: 'segundos...',
      errors: {
        wait: 'Por favor, aguarde',
        seconds: 'segundos antes de enviar novamente.',
        classNotFound: 'Turma não encontrada. Verifique o código de matrícula.',
        classFound: 'Turma encontrada. Agora digite seu código de estudante e o código de presença de hoje.',
        joinFirst: 'Por favor, entre em uma turma primeiro.',
        enterCode: 'Por favor, digite seu código de estudante',
        invalidCode: 'Código de presença inválido.',
        expiredCode: 'Código de presença expirado.',
        error: 'Erro:'
      }
    },
    es: {
      title: 'Registro de Asistencia',
      step1: 'Paso 1: Ingrese el Código de Matrícula',
      step2: 'Paso 2: Ingrese Sus Detalles',
      enrollmentPlaceholder: 'Ingrese el código proporcionado por su instructor',
      joinClass: 'Unirse a la Clase',
      studentIdentifier: '👤 Identificador del Estudiante',
      privacyNotice: '⚠️ Aviso de Privacidad',
      privacyText: 'Contacte a su instructor para confirmar qué identificador debe usar. Por razones de privacidad, no ingrese su nombre completo. Su instructor le proporcionará orientación sobre cómo identificarse en el sistema.',
      studentPlaceholder: 'Ingrese su identificador',
      attendanceCode: '🔢 Código de Asistencia',
      attendancePlaceholder: 'Ingrese el código de 3 dígitos de la pantalla',
      submitAttendance: 'Enviar Asistencia',
      successTitle: '¡Asistencia Registrada!',
      redirecting: 'Redirigiendo a la página principal en',
      seconds: 'segundos...',
      errors: {
        wait: 'Por favor, espere',
        seconds: 'segundos antes de enviar nuevamente.',
        classNotFound: 'Clase no encontrada. Verifique el código de matrícula.',
        classFound: 'Clase encontrada. Ahora ingrese su código de estudiante y el código de asistencia de hoy.',
        joinFirst: 'Por favor, únase a una clase primero.',
        enterCode: 'Por favor, ingrese su código de estudiante',
        invalidCode: 'Código de asistencia inválido.',
        expiredCode: 'Código de asistencia expirado.',
        error: 'Error:'
      }
    }
  };

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
    <div style={{ 
      maxWidth: 400, 
      margin: '40px auto', 
      padding: '0 20px', 
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box'
    }}>
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
            padding: 'clamp(20px, 5vw, 40px)',
            borderRadius: '12px',
            maxWidth: '90%',
            width: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              color: '#4CAF50',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              {translations[language].successTitle}
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              color: '#64748b',
              marginBottom: '10px'
            }}>
              {translations[language].redirecting} {countdown} {translations[language].seconds}
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
            height: 'clamp(40px, 10vw, 60px)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            marginBottom: '0.5rem',
            maxWidth: '100%',
            height: 'auto'
          }} 
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        />
      </Link>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0.25rem',
        backgroundColor: 'white',
        padding: '0.25rem',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <FaGlobe size={14} style={{ color: '#4a5568', marginRight: '0.5rem' }} />
        {['en', 'pt', 'es'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            style={{
              padding: '0.25rem 0.75rem',
              border: 'none',
              background: language === lang ? '#3b82f6' : 'transparent',
              color: language === lang ? 'white' : '#4a5568',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem'
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem' }}>{translations[language].title}</h2>

      <div style={{ 
        marginBottom: '1rem',
        textAlign: 'left',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        color: '#1e293b',
        fontWeight: '500'
      }}>
        {translations[language].step1}
      </div>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={translations[language].enrollmentPlaceholder}
        value={enrollmentCode}
        onChange={(e) => setEnrollmentCode(e.target.value.replace(/[^0-9]/g, '').toUpperCase())}
        style={{ 
          width: '100%', 
          padding: 'clamp(8px, 2vw, 12px)', 
          margin: '10px 0',
          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
          boxSizing: 'border-box',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          transition: 'border-color 0.2s ease'
        }}
      />
      <button 
        onClick={handleJoinClass} 
        style={{
          ...buttonStyle,
          padding: 'clamp(8px, 2vw, 12px)',
          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
          marginTop: '1rem'
        }}
        onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
      >
        {translations[language].joinClass}
      </button>

      {classData && (
        <>
          <div style={{ 
            marginTop: '2rem',
            marginBottom: '1rem',
            textAlign: 'left',
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            color: '#1e293b',
            fontWeight: '500'
          }}>
            {translations[language].step2}
          </div>

          {/* Student Identifier Section */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              color: '#1e293b',
              fontWeight: '500',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {translations[language].studentIdentifier}
            </div>
            <div style={{
              marginBottom: '1rem',
              padding: '12px',
              backgroundColor: '#fff3e0',
              borderRadius: '6px',
              border: '1px solid #ffb74d',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#e65100',
                fontWeight: '500',
                marginBottom: showPrivacyNotice ? '8px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setShowPrivacyNotice(!showPrivacyNotice)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {translations[language].privacyNotice}
                </div>
                <div style={{ 
                  transform: showPrivacyNotice ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '1.2rem'
                }}>
                  ▼
                </div>
              </div>
              <div style={{ 
                fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                color: '#1e293b',
                lineHeight: '1.4',
                maxHeight: showPrivacyNotice ? '200px' : '0',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                opacity: showPrivacyNotice ? '1' : '0'
              }}>
                {translations[language].privacyText}
              </div>
            </div>
            <input
              type="text"
              placeholder={translations[language].studentPlaceholder}
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 'clamp(8px, 2vw, 12px)', 
                margin: '10px 0',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                borderColor: !studentCode.trim() ? '#ffcdd2' : '#e2e8f0',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              required
            />
          </div>

          {/* Attendance Code Section */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              color: '#1e293b',
              fontWeight: '500',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {translations[language].attendanceCode}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{3}"
              maxLength="3"
              placeholder={translations[language].attendancePlaceholder}
              value={attendanceCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                setAttendanceCode(value);
              }}
              style={{ 
                width: '100%', 
                padding: 'clamp(8px, 2vw, 12px)', 
                margin: '10px 0',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          <button 
            onClick={handleSubmitAttendance} 
            style={{
              ...buttonStyle,
              padding: 'clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              marginTop: '1rem'
            }}
            onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            {translations[language].submitAttendance}
          </button>
        </>
      )}

      {statusMessage && !showSuccessModal && (
        <p style={{ 
          marginTop: 20, 
          padding: 'clamp(8px, 2vw, 12px)',
          backgroundColor: statusMessage.includes('✅') ? '#e8f5e9' : '#ffebee',
          borderRadius: '4px',
          color: statusMessage.includes('✅') ? '#2e7d32' : '#c62828',
          fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)'
        }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default Student;

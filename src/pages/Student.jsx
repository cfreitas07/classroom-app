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
import { FaGlobe, FaUserGraduate, FaCode, FaQuestionCircle, FaSearch } from 'react-icons/fa';
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEnrollmentTooltip, setShowEnrollmentTooltip] = useState(false);
  const [showAttendanceTooltip, setShowAttendanceTooltip] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
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
      },
      backToHome: "Back to Home",
      enterCode: "Enter Class Code",
      studentName: "Student Identifier",
      studentNameTooltip: "Enter how you want to be identified in class. Examples:\n• First name + Last initial (e.g., John D.)\n• First name + Last name\n• Student ID number\n• Any identifier that helps your instructor recognize you",
      submit: "Submit",
      success: "Check-in Successful!",
      error: "Error",
      invalidCode: "Invalid code. Please try again.",
      alreadyCheckedIn: "You have already checked in for this class.",
      classNotFound: "Class not found. Please verify the code.",
      expiredCode: "This code has expired. Please contact your instructor.",
      enterValidCode: "Please enter a valid code",
      enterName: "Please enter your identifier",
      processing: "Processing...",
      checkInHistory: "Check-in History",
      noHistory: "No check-in history available",
      classCode: "Class Code",
      checkInTime: "Check-in Time",
      status: "Status",
      enrollmentTooltip: "This is your class's permanent enrollment code. It will ALWAYS be the same for this specific class section. Use this code to join the class for the first time.",
      attendanceCodeTooltip: "This is a unique 3-digit code generated at the start of each class. It is only valid for 3 minutes. Your instructor will display this code at the beginning of class."
    },
    pt: {
      title: 'Registro de Presença',
      step1: 'Passo 1: Digite o Código da Turma',
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
      },
      backToHome: "Voltar para Home",
      enterCode: "Digite o Código da Aula",
      studentName: "Identificador do Estudante",
      studentNameTooltip: "Digite como você quer ser identificado na aula. Exemplos:\n• Primeiro nome + Inicial do sobrenome (ex: João S.)\n• Primeiro nome + Sobrenome\n• Número de matrícula\n• Qualquer identificador que ajude seu instrutor a reconhecê-lo",
      submit: "Enviar",
      success: "Check-in Realizado com Sucesso!",
      error: "Erro",
      invalidCode: "Código inválido. Por favor, tente novamente.",
      alreadyCheckedIn: "Você já realizou check-in para esta aula.",
      classNotFound: "Aula não encontrada. Por favor, verifique o código.",
      expiredCode: "Este código expirou. Por favor, contate seu instrutor.",
      enterValidCode: "Por favor, digite um código válido",
      enterName: "Por favor, digite seu identificador",
      processing: "Processando...",
      checkInHistory: "Histórico de Check-in",
      noHistory: "Nenhum histórico de check-in disponível",
      classCode: "Código da Aula",
      checkInTime: "Horário do Check-in",
      status: "Status",
      enrollmentTooltip: "Este é o código permanente da sua turma. Ele SEMPRE será o mesmo para esta seção específica da turma. Use este código para entrar na turma pela primeira vez.",
      attendanceCodeTooltip: "Este é um código único de 3 dígitos gerado no início de cada aula. É válido apenas por 3 minutos. Seu instrutor exibirá este código no início da aula."
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
      },
      backToHome: "Volver al Inicio",
      enterCode: "Ingrese el Código de la Clase",
      studentName: "Identificador del Estudiante",
      studentNameTooltip: "Ingrese cómo quiere ser identificado en la clase. Ejemplos:\n• Nombre + Inicial del apellido (ej: Juan P.)\n• Nombre + Apellido\n• Número de estudiante\n• Cualquier identificador que ayude a su instructor a reconocerlo",
      submit: "Enviar",
      success: "¡Registro Exitoso!",
      error: "Error",
      invalidCode: "Código inválido. Por favor, intente nuevamente.",
      alreadyCheckedIn: "Ya se ha registrado para esta clase.",
      classNotFound: "Clase no encontrada. Por favor, verifique el código.",
      expiredCode: "Este código ha expirado. Por favor, contacte a su instructor.",
      enterValidCode: "Por favor, ingrese un código válido",
      enterName: "Por favor, ingrese su identificador",
      processing: "Procesando...",
      checkInHistory: "Historial de Registro",
      noHistory: "No hay historial de registro disponible",
      classCode: "Código de la Clase",
      checkInTime: "Hora de Registro",
      status: "Estado",
      enrollmentTooltip: "Este es el código permanente de matrícula de su clase. SIEMPRE será el mismo para esta sección específica de la clase. Use este código para unirse a la clase por primera vez.",
      attendanceCodeTooltip: "Este es un código único de 3 dígitos generado al inicio de cada clase. Es válido solo por 3 minutos. Su instructor mostrará este código al inicio de la clase."
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

  // Function to fetch autocomplete suggestions
  const fetchAutocompleteSuggestions = async (inputText) => {
    if (!classId || !inputText || inputText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'attendanceRecords'),
        where('classId', '==', classId)
      );
      const querySnapshot = await getDocs(q);
      
      const uniqueNames = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentCode) {
          uniqueNames.add(data.studentCode);
        }
      });

      // Filter and sort matches
      const matches = Array.from(uniqueNames)
        .filter(name => name.toLowerCase().includes(inputText.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 5); // Limit to 5 suggestions

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle student code input changes
  const handleStudentCodeChange = async (e) => {
    const value = e.target.value;
    setStudentCode(value);
    fetchAutocompleteSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setStudentCode(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  // Add to translations
  const searchTranslations = {
    en: {
      searchForName: "Search for Name",
      searchPlaceholder: "Type to search for your name",
      noResults: "No matching names found",
      selectName: "Select",
      close: "Close",
      searching: "Searching...",
      noDataAvailable: "No previous attendance data available"
    },
    pt: {
      searchForName: "Buscar Nome",
      searchPlaceholder: "Digite para buscar seu nome",
      noResults: "Nenhum nome encontrado",
      selectName: "Selecionar",
      close: "Fechar",
      searching: "Buscando...",
      noDataAvailable: "Não há dados de presença anteriores disponíveis"
    },
    es: {
      searchForName: "Buscar Nombre",
      searchPlaceholder: "Escriba para buscar su nombre",
      noResults: "No se encontraron nombres",
      selectName: "Seleccionar",
      close: "Cerrar",
      searching: "Buscando...",
      noDataAvailable: "No hay datos de asistencia previos disponibles"
    }
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
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {translations[language].step1}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span 
            style={{ 
              cursor: 'help',
              color: '#718096'
            }}
            onMouseEnter={() => setShowEnrollmentTooltip(true)}
            onMouseLeave={() => setShowEnrollmentTooltip(false)}
          >
            <FaQuestionCircle size={14} />
          </span>
          {showEnrollmentTooltip && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              width: '300px',
              zIndex: 1000,
              border: '1px solid #e2e8f0',
              fontSize: '0.9rem',
              color: '#4a5568',
              whiteSpace: 'pre-line',
              marginBottom: '8px'
            }}>
              {translations[language].enrollmentTooltip}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0'
              }} />
            </div>
          )}
        </div>
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
              gap: '8px',
              position: 'relative'
            }}>
              {translations[language].studentName}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span 
                  style={{ 
                    cursor: 'help',
                    color: '#718096'
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <FaQuestionCircle size={14} />
                </span>
                {showTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    width: '300px',
                    zIndex: 1000,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#4a5568',
                    whiteSpace: 'pre-line',
                    marginBottom: '8px'
                  }}>
                    {classData.studentIdentificationType === 'fullName' && "Enter your full name (e.g., 'John Smith'). Example: When checking in, type your full name exactly as shown: 'John Smith', 'Maria Garcia', 'David Johnson'."}
                    {classData.studentIdentificationType === 'nickname' && "Enter the nickname assigned by your instructor (e.g., 'OhmsLaw' for John Smith)."}
                    {classData.studentIdentificationType === 'other' && classData.customIdentificationDescription}
                    <div style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '12px',
                      height: '12px',
                      backgroundColor: 'white',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0'
                    }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: showSuggestions ? '200px' : '15px'
              }}>
                <input
                  type="text"
                  value={studentCode}
                  onChange={handleStudentCodeChange}
                  placeholder={translations[language].studentPlaceholder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: showSuggestions ? '4px 4px 0 0' : '4px',
                    fontSize: '1rem'
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #e2e8f0' : 'none',
                          transition: 'background-color 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseOut={e => e.target.style.backgroundColor = 'white'}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span 
                  style={{ 
                    cursor: 'help',
                    color: '#718096'
                  }}
                  onMouseEnter={() => setShowAttendanceTooltip(true)}
                  onMouseLeave={() => setShowAttendanceTooltip(false)}
                >
                  <FaQuestionCircle size={14} />
                </span>
                {showAttendanceTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    width: '300px',
                    zIndex: 1000,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#4a5568',
                    whiteSpace: 'pre-line',
                    marginBottom: '8px'
                  }}>
                    {translations[language].attendanceCodeTooltip}
                    <div style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '12px',
                      height: '12px',
                      backgroundColor: 'white',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0'
                    }} />
                  </div>
                )}
              </div>
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

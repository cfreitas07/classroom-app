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
  getDoc,
  Timestamp
} from 'firebase/firestore';
import logo from '../images/logo transparent.png';
import { QRCodeSVG } from 'qrcode.react';
import { FaGlobe, FaQuestionCircle } from 'react-icons/fa';

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
  const [language, setLanguage] = useState('en');
  const [classCode, setClassCode] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [studentCodeFilter, setStudentCodeFilter] = useState('');
  const [studentIdentificationType, setStudentIdentificationType] = useState('nickname');
  const [customIdentificationDescription, setCustomIdentificationDescription] = useState('');
  const navigate = useNavigate();

  // Array of border colors for class cards
  const borderColors = [
    '#3b82f6', // Blue
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
    if (studentIdentificationType === 'other' && !customIdentificationDescription.trim()) {
      setMessage("❌ Please describe how students should identify themselves");
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
        studentIdentificationType,
        customIdentificationDescription: studentIdentificationType === 'other' ? customIdentificationDescription.trim() : '',
      });

      setMessage(`✅ Class created! Code: ${code}`);
      // Clear all input fields
      setClassName('');
      setSchedule('');
      setMaxStudents('');
      setStudentIdentificationType('nickname');
      setCustomIdentificationDescription('');
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

  const filterAttendanceRecords = (records) => {
    if (!records) return [];
    
    return records.filter(record => {
      const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
      const matchesDate = (!startDate || recordDate >= startDate) && 
                         (!endDate || recordDate <= endDate);
      const matchesStudentCode = !studentCodeFilter || 
                               record.studentCode.toLowerCase().includes(studentCodeFilter.toLowerCase());
      
      return matchesDate && matchesStudentCode;
    });
  };

  const translations = {
    en: {
      title: 'Instructor Dashboard',
      step1: 'Step 1: Create a New Class',
      step2: 'Step 2: Generate Attendance Code',
      classCodeLabel: 'Class Code',
      classCodePlaceholder: 'This code will be permanent for this class section',
      createClass: 'Create Class',
      attendanceCodeLabel: 'Attendance Code',
      attendanceCodePlaceholder: 'A unique 3-digit code that expires in 3 minutes',
      generateCode: 'Generate Code',
      successTitle: 'Class Created!',
      redirecting: 'Redirecting to class page in',
      seconds: 'seconds...',
      className: 'Class Name',
      classNamePlaceholder: 'e.g., Introduction to Programming',
      selectSchedule: 'Select Class Schedule',
      time: 'Time',
      selectTime: 'Select time',
      setSchedule: 'Set Schedule',
      currentSchedule: 'Current schedule',
      classSize: 'Class Size',
      classSizePlaceholder: 'e.g., 30',
      yourClasses: 'Your Classes',
      enrollmentCode: 'Enrollment Code',
      showCodes: 'Show Codes',
      hideCodes: 'Hide Codes',
      startAttendance: 'Start Attendance',
      viewAttendance: 'View Attendance',
      hideAttendance: 'Hide Attendance',
      deleteClass: 'Delete Class',
      attendanceRecords: 'Attendance Records',
      downloadCSV: 'Download CSV',
      studentCode: 'Student Code',
      date: 'Date',
      time: 'Time',
      scanQR: 'Scan QR code to go to presenzo.com/student',
      timeRemaining: 'Time Remaining:',
      welcomeBack: 'Welcome Back!',
      createAccount: 'Create Your Account',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Login',
      signUp: 'Sign Up',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      passwordRequirements: 'Password must contain:',
      atLeast6: 'At least 6 characters',
      oneUppercase: 'One uppercase letter',
      oneLowercase: 'One lowercase letter',
      oneNumber: 'One number',
      errors: {
        wait: 'Please wait',
        seconds: 'seconds before creating another class.',
        classCreated: 'Class created successfully!',
        invalidCode: 'Please enter a valid 3-digit code.',
        error: 'Error:',
        notLoggedIn: "You're not logged in.",
        enterClassName: "❌ Please enter a class name",
        enterSchedule: "❌ Please enter a schedule",
        enterMaxStudents: "❌ Please enter the maximum number of students",
        invalidMaxStudents: "❌ Please enter a valid number of students (minimum 1)",
        selectDayTime: '❌ Please select at least one day and time',
        deleteConfirm: 'Are you sure you want to delete this class? This action cannot be undone.',
        noRecords: "No attendance records found."
      },
      logout: 'LOGOUT',
      weekdays: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      startDate: 'Start Date',
      endDate: 'End Date',
      searchStudentCode: 'Search Student Code',
      clearFilters: 'Clear Filters',
      studentIdentification: 'How Students Will Identify Themselves',
      studentIdentificationDescription: 'Choose how students will write their names when checking in to your class',
      studentIdentificationTooltip: 'This setting determines how students will identify themselves when checking in. Choose carefully as this cannot be changed after creating the class.',
      identificationOptions: {
        fullName: {
          label: 'First and Last Name',
          tooltip: 'Students will enter their full name (e.g., "John Smith"). Not recommended due to privacy concerns. Example: When checking in, students will type their full name exactly as shown: "John Smith", "Maria Garcia", "David Johnson".',
          warning: '⚠️ Privacy Warning: Using full names may expose student identities.'
        },
        nickname: {
          label: 'Student Nickname',
          tooltip: 'You will assign nicknames to students. For example, in an engineering class, you might use physics equations (e.g., "OhmsLaw" for John Smith, "Bernoulli" for Maria Garcia, "Fourier" for David Johnson). Students will use exactly these nicknames when checking in.',
          warning: 'You will need to provide nicknames to students before they can check in.'
        },
        other: {
          label: 'Custom Identification',
          tooltip: 'Define your own identification method (e.g., "Student ID", "Class Number", etc.). Example: You might use "ID123" (Student ID), "C2023" (Class Number), or "S1" (Seat Number). Students will use exactly what you specify here when checking in.',
          warning: 'Please provide clear instructions for students.'
        }
      },
      customIdentificationPlaceholder: 'Describe how students should identify themselves (e.g., "Student ID", "Class Number", etc.)'
    },
    pt: {
      title: 'Painel do Instrutor',
      step1: 'Passo 1: Criar Nova Turma',
      step2: 'Passo 2: Gerar Código de Presença',
      classCodeLabel: 'Código da Turma',
      classCodePlaceholder: 'Este código será permanente para esta seção da turma',
      createClass: 'Criar Turma',
      attendanceCodeLabel: 'Código de Presença',
      attendanceCodePlaceholder: 'Um código único de 3 dígitos que expira em 3 minutos',
      generateCode: 'Gerar Código',
      successTitle: 'Turma Criada!',
      redirecting: 'Redirecionando para a página da turma em',
      seconds: 'segundos...',
      className: 'Nome da Turma',
      classNamePlaceholder: 'ex., Introdução à Programação',
      selectSchedule: 'Selecionar Horário da Turma',
      time: 'Horário',
      selectTime: 'Selecionar horário',
      setSchedule: 'Definir Horário',
      currentSchedule: 'Horário atual',
      classSize: 'Tamanho da Turma',
      classSizePlaceholder: 'ex., 30',
      yourClasses: 'Suas Turmas',
      enrollmentCode: 'Código de Matrícula',
      showCodes: 'Mostrar Códigos',
      hideCodes: 'Ocultar Códigos',
      startAttendance: 'Iniciar Presença',
      viewAttendance: 'Ver Presença',
      hideAttendance: 'Ocultar Presença',
      deleteClass: 'Excluir Turma',
      attendanceRecords: 'Registros de Presença',
      downloadCSV: 'Baixar CSV',
      studentCode: 'Código do Estudante',
      date: 'Data',
      time: 'Horário',
      scanQR: 'Escaneie o código QR para acessar presenzo.com/student',
      timeRemaining: 'Tempo Restante:',
      welcomeBack: 'Bem-vindo de Volta!',
      createAccount: 'Criar Sua Conta',
      email: 'E-mail',
      password: 'Senha',
      rememberMe: 'Lembrar-me',
      login: 'Entrar',
      signUp: 'Cadastrar',
      dontHaveAccount: "Não tem uma conta?",
      alreadyHaveAccount: "Já tem uma conta?",
      passwordRequirements: 'A senha deve conter:',
      atLeast6: 'Pelo menos 6 caracteres',
      oneUppercase: 'Uma letra maiúscula',
      oneLowercase: 'Uma letra minúscula',
      oneNumber: 'Um número',
      errors: {
        wait: 'Por favor, aguarde',
        seconds: 'segundos antes de criar outra turma.',
        classCreated: 'Turma criada com sucesso!',
        invalidCode: 'Por favor, digite um código válido de 3 dígitos.',
        error: 'Erro:',
        notLoggedIn: "Você não está logado.",
        enterClassName: "❌ Por favor, digite um nome para a turma",
        enterSchedule: "❌ Por favor, digite um horário",
        enterMaxStudents: "❌ Por favor, digite o número máximo de alunos",
        invalidMaxStudents: "❌ Por favor, digite um número válido de alunos (mínimo 1)",
        selectDayTime: '❌ Por favor, selecione pelo menos um dia e horário',
        deleteConfirm: 'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.',
        noRecords: "Nenhum registro de presença encontrado."
      },
      logout: 'SAIR',
      weekdays: {
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado',
        sunday: 'Domingo'
      },
      startDate: 'Data Inicial',
      endDate: 'Data Final',
      searchStudentCode: 'Buscar Código do Aluno',
      clearFilters: 'Limpar Filtros',
      studentIdentification: 'Como os Alunos se Identificarão',
      studentIdentificationDescription: 'Escolha como os alunos escreverão seus nomes ao fazer check-in na sua turma',
      studentIdentificationTooltip: 'Esta configuração determina como os alunos se identificarão ao fazer check-in. Escolha com cuidado, pois isso não pode ser alterado após a criação da turma.',
      identificationOptions: {
        fullName: {
          label: 'Nome Completo',
          tooltip: 'Os alunos inserirão seu nome completo (ex: "João Silva"). Não recomendado devido a preocupações com privacidade. Exemplo: Ao fazer check-in, os alunos digitarão seu nome completo exatamente como mostrado: "João Silva", "Maria Santos", "Pedro Oliveira".',
          warning: '⚠️ Aviso de Privacidade: Usar nomes completos pode expor a identidade dos alunos.'
        },
        nickname: {
          label: 'Apelido do Aluno',
          tooltip: 'Você atribuirá apelidos aos alunos. Por exemplo, em uma aula de engenharia, você pode usar equações da física (ex: "LeiOhm" para João Silva, "Bernoulli" para Maria Santos, "Fourier" para Pedro Oliveira). Os alunos usarão exatamente esses apelidos ao fazer check-in.',
          warning: 'Você precisará fornecer apelidos aos alunos antes que eles possam fazer check-in.'
        },
        other: {
          label: 'Identificação Personalizada',
          tooltip: 'Defina seu próprio método de identificação (ex: "ID do Aluno", "Número da Turma", etc.). Exemplo: Você pode usar "ID123" (ID do Aluno), "T2023" (Número da Turma), ou "C1" (Número da Cadeira). Os alunos usarão exatamente o que você especificar aqui ao fazer check-in.',
          warning: 'Por favor, forneça instruções claras para os alunos.'
        }
      },
      customIdentificationPlaceholder: 'Descreva como os alunos devem se identificar (ex: "ID do Aluno", "Número da Turma", etc.)'
    },
    es: {
      title: 'Panel del Instructor',
      step1: 'Paso 1: Crear Nueva Clase',
      step2: 'Paso 2: Generar Código de Asistencia',
      classCodeLabel: 'Código de Clase',
      classCodePlaceholder: 'Este código será permanente para esta sección de la clase',
      createClass: 'Crear Clase',
      attendanceCodeLabel: 'Código de Asistencia',
      attendanceCodePlaceholder: 'Un código único de 3 dígitos que expira en 3 minutos',
      generateCode: 'Generar Código',
      successTitle: '¡Clase Creada!',
      redirecting: 'Redirigiendo a la página de la clase en',
      seconds: 'segundos...',
      className: 'Nombre de la Clase',
      classNamePlaceholder: 'ej., Introducción a la Programación',
      selectSchedule: 'Seleccionar Horario de la Clase',
      time: 'Horario',
      selectTime: 'Seleccionar horario',
      setSchedule: 'Establecer Horario',
      currentSchedule: 'Horario actual',
      classSize: 'Tamaño de la Clase',
      classSizePlaceholder: 'ej., 30',
      yourClasses: 'Tus Clases',
      enrollmentCode: 'Código de Matrícula',
      showCodes: 'Mostrar Códigos',
      hideCodes: 'Ocultar Códigos',
      startAttendance: 'Iniciar Asistencia',
      viewAttendance: 'Ver Asistencia',
      hideAttendance: 'Ocultar Asistencia',
      deleteClass: 'Eliminar Clase',
      attendanceRecords: 'Registros de Asistencia',
      downloadCSV: 'Descargar CSV',
      studentCode: 'Código del Estudiante',
      date: 'Fecha',
      time: 'Hora',
      scanQR: 'Escanee el código QR para ir a presenzo.com/student',
      timeRemaining: 'Tiempo Restante:',
      welcomeBack: '¡Bienvenido de Nuevo!',
      createAccount: 'Crear Tu Cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      rememberMe: 'Recordarme',
      login: 'Iniciar Sesión',
      signUp: 'Registrarse',
      dontHaveAccount: "¿No tienes una cuenta?",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      passwordRequirements: 'La contraseña debe contener:',
      atLeast6: 'Al menos 6 caracteres',
      oneUppercase: 'Una letra mayúscula',
      oneLowercase: 'Una letra minúscula',
      oneNumber: 'Un número',
      errors: {
        wait: 'Por favor, espere',
        seconds: 'segundos antes de crear otra clase.',
        classCreated: '¡Clase creada exitosamente!',
        invalidCode: 'Por favor, ingrese un código válido de 3 dígitos.',
        error: 'Error:',
        notLoggedIn: "No has iniciado sesión.",
        enterClassName: "❌ Por favor, ingrese un nombre para la clase",
        enterSchedule: "❌ Por favor, ingrese un horario",
        enterMaxStudents: "❌ Por favor, ingrese el número máximo de estudiantes",
        invalidMaxStudents: "❌ Por favor, ingrese un número válido de estudiantes (mínimo 1)",
        selectDayTime: '❌ Por favor, seleccione al menos un día y horario',
        deleteConfirm: '¿Está seguro que desea eliminar esta clase? Esta acción no se puede deshacer.',
        noRecords: "No se encontraron registros de asistencia."
      },
      logout: 'CERRAR SESIÓN',
      weekdays: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo'
      },
      startDate: 'Fecha Inicial',
      endDate: 'Fecha Final',
      searchStudentCode: 'Buscar Código del Estudiante',
      clearFilters: 'Limpiar Filtros',
      studentIdentification: 'Cómo se Identificarán los Estudiantes',
      studentIdentificationDescription: 'Elija cómo los estudiantes escribirán sus nombres al registrarse en su clase',
      studentIdentificationTooltip: 'Esta configuración determina cómo los estudiantes se identificarán al registrarse. Elija cuidadosamente, ya que esto no se puede cambiar después de crear la clase.',
      identificationOptions: {
        fullName: {
          label: 'Nombre Completo',
          tooltip: 'Los estudiantes ingresarán su nombre completo (ej: "Juan Pérez"). No recomendado debido a preocupaciones de privacidad. Ejemplo: Al registrarse, los estudiantes escribirán su nombre completo exactamente como se muestra: "Juan Pérez", "María García", "David López".',
          warning: '⚠️ Advertencia de Privacidad: Usar nombres completos puede exponer la identidad de los estudiantes.'
        },
        nickname: {
          label: 'Apodo del Estudiante',
          tooltip: 'Usted asignará apodos a los estudiantes. Por ejemplo, en una clase de ingeniería, puede usar ecuaciones de física (ej: "LeyOhm" para Juan Pérez, "Bernoulli" para María García, "Fourier" para David López). Los estudiantes usarán exactamente estos apodos al registrarse.',
          warning: 'Necesitará proporcionar apodos a los estudiantes antes de que puedan registrarse.'
        },
        other: {
          label: 'Identificación Personalizada',
          tooltip: 'Defina su propio método de identificación (ej: "ID del Estudiante", "Número de Clase", etc.). Ejemplo: Puede usar "ID123" (ID del Estudiante), "C2023" (Número de Clase), o "A1" (Número de Asiento). Los estudiantes usarán exactamente lo que usted especifique aquí al registrarse.',
          warning: 'Por favor, proporcione instrucciones claras para los estudiantes.'
        }
      },
      customIdentificationPlaceholder: 'Describa cómo los estudiantes deben identificarse (ej: "ID del Estudiante", "Número de Clase", etc.)'
    }
  };

  const handleTooltipMouseEnter = (e) => {
    const tooltip = e.currentTarget.querySelector('div');
    tooltip.style.display = 'block';
  };

  const handleTooltipMouseLeave = (e) => {
    const tooltip = e.currentTarget.querySelector('div');
    tooltip.style.display = 'none';
  };

  if (userId) {
    return (
      <div style={{ 
        maxWidth: 800, 
        margin: '40px auto', 
        padding: '0 20px', 
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        background: 'linear-gradient(to bottom right, #e0f2fe, #dbeafe)',
        minHeight: '100vh'
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
                height: '60px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                marginBottom: '2rem'
              }} 
              onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            />
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'background-color 0.2s ease',
              ':hover': {
                backgroundColor: '#2563eb'
              }
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
          >
            {translations[language].logout}
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.25rem',
          backgroundColor: 'white',
          padding: '0.25rem',
          borderRadius: '6px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
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

        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1.5rem' }}>{translations[language].title}</h3>
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
                {translations[language].className}:
              </span>
              <input 
                type="text" 
                placeholder={translations[language].classNamePlaceholder} 
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
                {translations[language].selectSchedule}
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
                      backgroundColor: selectedDays.some(d => d.id === day.id) ? '#3b82f6' : '#e2e8f0',
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
                  {translations[language].time}:
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
                  <option value="">{translations[language].selectTime}</option>
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
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  width: '100%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
              >
                {translations[language].setSchedule}
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
                  {translations[language].currentSchedule}: {schedule}
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
                {translations[language].classSize}:
              </span>
              <input 
                type="number" 
                placeholder={translations[language].classSizePlaceholder} 
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

            <div style={{ 
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  color: '#1e293b',
                  fontWeight: '600'
                }}>
                  {translations[language].studentIdentification}
                </span>
                <div style={{ 
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'help'
                }}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}>
                  <FaQuestionCircle 
                    size={16} 
                    color="#64748b"
                    title={translations[language].studentIdentificationTooltip}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '300px',
                    display: 'none',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {translations[language].studentIdentificationTooltip}
                  </div>
                </div>
              </div>
              <div style={{ 
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#4b5563',
                marginBottom: '15px',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }}>
                {translations[language].studentIdentificationDescription}
              </div>

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {Object.entries(translations[language].identificationOptions).map(([key, option]) => (
                  <label key={key} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="studentIdentification"
                      value={key}
                      checked={studentIdentificationType === key}
                      onChange={(e) => setStudentIdentificationType(e.target.value)}
                      style={{ marginTop: '4px' }}
                    />
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          color: '#1e293b'
                        }}>
                          {option.label}
                        </span>
                        <div style={{ 
                          position: 'relative',
                          display: 'inline-block',
                          cursor: 'help'
                        }}
                        onMouseEnter={handleTooltipMouseEnter}
                        onMouseLeave={handleTooltipMouseLeave}>
                          <FaQuestionCircle 
                            size={14} 
                            color="#64748b"
                            title={option.tooltip}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#1e293b',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            width: '300px',
                            display: 'none',
                            zIndex: 1000,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {option.tooltip}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        color: '#ef4444',
                        marginLeft: '24px'
                      }}>
                        {option.warning}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {studentIdentificationType === 'other' && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    value={customIdentificationDescription}
                    onChange={(e) => setCustomIdentificationDescription(e.target.value)}
                    placeholder={translations[language].customIdentificationPlaceholder}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                    }}
                  />
                </div>
              )}
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
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                marginTop: 10, 
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
            >
              {translations[language].createClass}
            </button>
          </div>
        </div>

        {classes.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1.5rem' }}>{translations[language].yourClasses}:</h3>
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
                      {translations[language].enrollmentCode}: <code style={{ 
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
                      title={translations[language].showCodes}
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
                      {showLargeCodes[cls.id] ? translations[language].hideCodes : translations[language].showCodes}
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
                            {translations[language].enrollmentCode}
                          </div>
                          <div style={{
                            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                            fontWeight: 'bold',
                            color: '#3b82f6',
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
                            {translations[language].attendanceCode}
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
                            {translations[language].scanQR}
                          </div>
                          <div style={{
                            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                            color: '#f57c00',
                            fontWeight: 'bold',
                            marginTop: '15px'
                          }}>
                            {translations[language].timeRemaining}: {Math.floor(timers[cls.id] / 60)}:{(timers[cls.id] % 60).toString().padStart(2, '0')}
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
                      {translations[language].startAttendance}
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
                      {expandedClassId === cls.id ? translations[language].hideAttendance : translations[language].viewAttendance}
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
                      {translations[language].deleteClass}
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
                        marginBottom: '15px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <h4 style={{ 
                          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                          color: '#1e293b',
                          margin: 0
                        }}>
                          {translations[language].attendanceRecords}
                        </h4>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                            }}
                            placeholder={translations[language].startDate}
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                            }}
                            placeholder={translations[language].endDate}
                          />
                          <input
                            type="text"
                            value={studentCodeFilter}
                            onChange={(e) => setStudentCodeFilter(e.target.value)}
                            placeholder={translations[language].searchStudentCode}
                            style={{
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                            }}
                          />
                          <button
                            onClick={() => {
                              setStartDate('');
                              setEndDate('');
                              setStudentCodeFilter('');
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#e2e8f0',
                              color: '#1e293b',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.target.style.backgroundColor = '#cbd5e1'}
                            onMouseOut={e => e.target.style.backgroundColor = '#e2e8f0'}
                          >
                            {translations[language].clearFilters}
                          </button>
                          <button
                            onClick={() => fetchAttendanceForClass(cls.id, true)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
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
                            {translations[language].downloadCSV}
                          </button>
                        </div>
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
                              <th style={{ padding: '10px', textAlign: 'left' }}>{translations[language].studentCode}</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>{translations[language].date}</th>
                              <th style={{ padding: '10px', textAlign: 'left' }}>{translations[language].time}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterAttendanceRecords(attendanceRecordsByClass[cls.id])
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
    <div style={{ 
      maxWidth: 400, 
      margin: '40px auto', 
      padding: '0 20px', 
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box',
      background: 'linear-gradient(to bottom right, #e0f2fe, #dbeafe)',
      minHeight: '100vh'
    }}>
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
          {translations[language].welcomeBack}
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="email" 
            placeholder={translations[language].email} 
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
            placeholder={translations[language].password} 
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
              {translations[language].passwordRequirements}:
              <ul style={{ 
                margin: '4px 0 0 20px',
                padding: 0,
                textAlign: 'left'
              }}>
                <li>{translations[language].atLeast6}</li>
                <li>{translations[language].oneUppercase}</li>
                <li>{translations[language].oneLowercase}</li>
                <li>{translations[language].oneNumber}</li>
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
              {translations[language].rememberMe}
            </label>
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          style={{ 
            padding: '12px', 
            width: '100%', 
            backgroundColor: isLogin ? '#3b82f6' : '#10b981', 
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
          onMouseOver={e => e.target.style.backgroundColor = isLogin ? '#2563eb' : '#059669'}
          onMouseOut={e => e.target.style.backgroundColor = isLogin ? '#3b82f6' : '#10b981'}
        >
          {translations[language].login}
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
          {translations[language].dontHaveAccount}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'transparent', 
            color: '#3b82f6', 
            border: '2px solid #3b82f6', 
            borderRadius: '6px', 
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.color = 'white';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#3b82f6';
          }}
        >
          {translations[language].signUp}
        </button>
      </div>
    </div>
  );
}

export default Instructor;
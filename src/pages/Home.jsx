import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaCode, FaGlobe, FaCopyright, FaUsers, FaClipboardCheck, FaFileCsv, FaHistory, FaShieldAlt, FaFileContract, FaFacebook, FaLinkedin, FaWhatsapp, FaLink, FaInstagram, FaReddit, FaExclamationCircle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import styles from './Home.module.css';
import logo from '../images/logo transparent.png';

function Home() {
  const [language, setLanguage] = useState('en');
  const [showCopied, setShowCopied] = useState(false);

  const translations = {
    en: {
      mainText: 'Streamline attendance tracking and reporting',
      title: 'How it Works',
      instructor: "I'm an Instructor",
      student: "I'm a Student",
      shareTitle: 'Share with Friends',
      shareText: 'Hey! Check out this cool app I found - Presenzo! It\'s a super simple way to take attendance in class. No more paper lists or complicated systems. Just generate a code at the start of class and students check in with their phones. Perfect for teachers!',
      copied: 'Link copied!',
      feedback: 'Feedback & Bug Reports',
      translate: 'Translate site to:',
      steps: [
        {
          title: 'Create Class',
          description: 'Set up all your classes in minutes'
        },
        {
          title: 'Share Code',
          description: 'Students scan unique codes for each class'
        },
        {
          title: 'Download Reports',
          description: 'Get attendance records anytime'
        }
      ]
    },
    pt: {
      mainText: 'Simplifique o controle de presença e relatórios',
      title: 'Como Funciona',
      instructor: 'Sou um Instrutor',
      student: 'Sou um Estudante',
      shareTitle: 'Compartilhe com Amigos',
      shareText: 'Oi! Olha só esse app legal que encontrei - Presenzo! É uma maneira super simples de fazer chamada em aula. Chega de listas de papel ou sistemas complicados. É só gerar um código no início da aula e os alunos fazem check-in pelo celular. Perfeito para professores!',
      copied: 'Link copiado!',
      feedback: 'Feedback e Relatórios de Bugs',
      translate: 'Traduzir site para:',
      steps: [
        {
          title: 'Criar Turma',
          description: 'Configure todas as suas turmas em minutos'
        },
        {
          title: 'Compartilhar Código',
          description: 'Alunos escaneiam códigos únicos para cada aula'
        },
        {
          title: 'Baixar Relatórios',
          description: 'Obtenha registros de presença a qualquer momento'
        }
      ]
    },
    es: {
      mainText: 'Simplifique el seguimiento y los informes de asistencia',
      title: 'Cómo Funciona',
      instructor: 'Soy un Instructor',
      student: 'Soy un Estudiante',
      shareTitle: 'Compartir con Amigos',
      shareText: '¡Hola! Mira esta app genial que encontré - ¡Presenzo! Es una forma súper sencilla de tomar asistencia en clase. Se acabaron las listas de papel o sistemas complicados. Solo generas un código al inicio de la clase y los estudiantes se registran con sus celulares. ¡Perfecto para profesores!',
      copied: '¡Enlace copiado!',
      feedback: 'Comentarios y Reportes de Errores',
      translate: 'Traducir sitio a:',
      steps: [
        {
          title: 'Crear Clase',
          description: 'Configure todas sus clases en minutos'
        },
        {
          title: 'Compartir Código',
          description: 'Estudiantes escanean códigos únicos para cada clase'
        },
        {
          title: 'Descargar Informes',
          description: 'Obtenga registros de asistencia en cualquier momento'
        }
      ]
    }
  };

  return (
    <div className={styles.container} style={{ paddingTop: '1rem' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img 
          src={logo} 
          alt="Presenzo Logo" 
          style={{ 
            height: 'clamp(58.5px, 14.625vw, 87.75px)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            marginBottom: '0.5rem',
            maxWidth: '100%'
          }} 
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        />
      </Link>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0.5rem',
        backgroundColor: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        maxWidth: 'fit-content',
        margin: '0 auto 1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#4a5568',
          fontSize: '0.9rem'
        }}>
          <FaGlobe size={16} style={{ color: '#3b82f6' }} />
          <span>{translations[language].translate}</span>
        </div>
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          borderLeft: '1px solid #e2e8f0',
          paddingLeft: '0.5rem'
        }}>
          {['en', 'pt', 'es'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '0.25rem 0.75rem',
                border: 'none',
                background: language === lang ? '#3b82f6' : '#f3f4f6',
                color: language === lang ? 'white' : '#4a5568',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: language === lang ? '600' : '400'
              }}
              onMouseOver={e => {
                if (language !== lang) {
                  e.target.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseOut={e => {
                if (language !== lang) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
            </button>
          ))}
        </div>
      </div>

      <p style={{ 
        fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', 
        textAlign: 'center', 
        color: '#4a5568',
        maxWidth: '800px',
        margin: '0 auto 2rem'
      }}>
        {translations[language].mainText}
      </p>

      <div className={styles.buttonContainer}>
        <Link to="/instructor" className={styles.card}>
          <FaChalkboardTeacher size={36} style={{ marginBottom: '0.5rem' }} />
          {translations[language].instructor}
        </Link>
        <Link to="/student" className={styles.card}>
          <FaUserGraduate size={36} style={{ marginBottom: '0.5rem' }} />
          {translations[language].student}
        </Link>
      </div>

      {/* How it Works Section */}
      <div className={styles.howItWorksSection} style={{ 
        maxWidth: '700px', 
        margin: '0.225rem auto',
        padding: '1.5rem',
        backgroundColor: '#d5e0f2',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            color: '#1e40af', 
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            margin: 0
          }}>
            {translations[language].title}
          </h2>
        </div>

        <div className={styles.gridContainer} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          {translations[language].steps.map((step, index) => (
            <div key={index} className={styles.stepCard} style={{
              textAlign: 'center',
              padding: '1.25rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              position: 'relative'
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#3b82f6',
                color: 'white',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                {index === 0 && <FaUsers size={28} style={{ color: '#3b82f6', marginBottom: '0.75rem' }} />}
                {index === 1 && <FaClipboardCheck size={28} style={{ color: '#3b82f6', marginBottom: '0.75rem' }} />}
                {index === 2 && <FaFileCsv size={28} style={{ color: '#3b82f6', marginBottom: '0.75rem' }} />}
              </div>
              <h3 style={{ 
                color: '#1e293b', 
                marginBottom: '0.25rem', 
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: '600'
              }}>
                {step.title}
              </h3>
              <p style={{ 
                color: '#64748b', 
                fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                lineHeight: '1.4'
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Share Section */}
      <div style={{ 
        maxWidth: '700px', 
        margin: '0.5rem auto',
        padding: '0.5rem',
        backgroundColor: 'white',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: '#4a5568',
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>{translations[language].shareTitle}</span>
          <a
            href="mailto:cfreitas@pfw.edu?subject=Presenzo Feedback"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#dc2626',
              textDecoration: 'none',
              fontSize: '0.8rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fee2e2',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#fecaca';
              e.target.style.color = '#b91c1c';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.color = '#dc2626';
            }}
          >
            <FaExclamationCircle size={12} />
            {translations[language].feedback}
          </a>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(translations[language].shareText)}&url=${encodeURIComponent('https://presenzo.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#000000',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#1a1a1a';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#000000';
            }}
            title="Share on X"
          >
            <FaXTwitter size={14} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://presenzo.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#4267B2',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#365899';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#4267B2';
            }}
            title="Share on Facebook"
          >
            <FaFacebook size={14} />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://presenzo.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#0077b5',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#006399';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#0077b5';
            }}
            title="Share on LinkedIn"
          >
            <FaLinkedin size={14} />
          </a>
          <a
            href={`https://www.instagram.com/share?url=${encodeURIComponent('https://presenzo.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#E4405F',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#d6324c';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#E4405F';
            }}
            title="Share on Instagram"
          >
            <FaInstagram size={14} />
          </a>
          <a
            href={`https://reddit.com/submit?url=${encodeURIComponent('https://presenzo.com')}&title=${encodeURIComponent(translations[language].shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#FF4500',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#e63e00';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#FF4500';
            }}
            title="Share on Reddit"
          >
            <FaReddit size={14} />
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(translations[language].shareText + ' https://presenzo.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.35rem',
              backgroundColor: '#25D366',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#22c55e';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#25D366';
            }}
            title="Share on WhatsApp"
          >
            <FaWhatsapp size={14} />
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://presenzo.com');
              setShowCopied(true);
              setTimeout(() => setShowCopied(false), 2000);
            }}
            style={{
              padding: '0.35rem',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              position: 'relative',
              width: '24px',
              height: '24px'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#2d3748';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#4a5568';
            }}
            title="Copy Link"
          >
            <FaLink size={14} />
            {showCopied && (
              <span style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#2d3748',
                color: 'white',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap'
              }}>
                {translations[language].copied}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className={styles.footer} style={{ 
        marginTop: '1rem', 
        padding: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        color: '#718096',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(224, 242, 254, 0.5))',
        borderRadius: '0 0 12px 12px',
        width: '100%',
        maxWidth: '800px',
        margin: '1rem auto 0'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.25rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaCode style={{ color: '#4a5568' }} />
            Created by <a 
              href="https://www.claudiocsdefreitas.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#4a5568', 
                textDecoration: 'none', 
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={e => e.target.style.color = '#2b6cb0'}
              onMouseOut={e => e.target.style.color = '#4a5568'}
            >
              Claudio de Freitas
            </a>
          </div>

          <Link 
            to="/version-history" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#4a5568',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={e => e.target.style.color = '#3b82f6'}
            onMouseOut={e => e.target.style.color = '#4a5568'}
          >
            <FaShieldAlt />
            Privacy & Terms
          </Link>

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            <FaCopyright /> 2025 Presenzo. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

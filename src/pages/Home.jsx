import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaCode, FaGlobe, FaCopyright, FaUsers, FaClipboardCheck, FaFileCsv } from 'react-icons/fa';
import styles from './Home.module.css';
import logo from '../images/logo transparent.png';

function Home() {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      title: 'How it Works',
      steps: [
        {
          title: 'Create Class',
          description: 'Set up your classroom with name, schedule, and size'
        },
        {
          title: 'Share Code',
          description: 'Generate and share attendance code at the start of each class'
        },
        {
          title: 'Download Reports',
          description: 'Get attendance records in CSV format anytime'
        }
      ]
    },
    pt: {
      title: 'Como Funciona',
      steps: [
        {
          title: 'Criar Turma',
          description: 'Configure sua sala com nome, horário e tamanho'
        },
        {
          title: 'Compartilhar Código',
          description: 'Gere e compartilhe o código de presença no início de cada aula'
        },
        {
          title: 'Baixar Relatórios',
          description: 'Obtenha registros de presença em formato CSV a qualquer momento'
        }
      ]
    },
    es: {
      title: 'Cómo Funciona',
      steps: [
        {
          title: 'Crear Clase',
          description: 'Configure su aula con nombre, horario y tamaño'
        },
        {
          title: 'Compartir Código',
          description: 'Genere y comparta el código de asistencia al inicio de cada clase'
        },
        {
          title: 'Descargar Informes',
          description: 'Obtenga registros de asistencia en formato CSV en cualquier momento'
        }
      ]
    }
  };

  return (
    <div className={styles.container}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img 
          src={logo} 
          alt="Presenzo Logo" 
          style={{ 
            height: '120px',
            maxHeight: '120px',
            width: 'auto',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            maxWidth: '100%'
          }} 
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        />
      </Link>
      <p style={{ color: '#4a5568', marginBottom: '2rem', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>Manage classroom attendance easily and securely</p>
      
      <div className={styles.buttonContainer}>
        <Link to="/instructor" className={styles.card}>
          <FaChalkboardTeacher size={36} style={{ marginBottom: '0.5rem' }} />
          I'm an Instructor
        </Link>
        <Link to="/student" className={styles.card}>
          <FaUserGraduate size={36} style={{ marginBottom: '0.5rem' }} />
          I'm a Student
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
          <div style={{ 
            display: 'flex', 
            gap: '0.25rem',
            backgroundColor: 'white',
            padding: '0.25rem',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            alignItems: 'center'
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
      
      <div className={styles.footer} style={{ 
        marginTop: '1rem', 
        padding: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        color: '#718096',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(237, 242, 247, 0.5))',
        borderRadius: '0 0 12px 12px',
        width: '100%',
        maxWidth: '800px',
        margin: '1rem auto 0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <FaCode style={{ color: '#4a5568' }} />
          <p style={{ margin: 0 }}>
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
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          color: '#a0aec0',
          fontSize: '0.8rem'
        }}>
          <FaCopyright />
          <Link 
            to="/version-history" 
            style={{ 
              color: '#a0aec0',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={e => e.target.style.color = '#4a5568'}
            onMouseOut={e => e.target.style.color = '#a0aec0'}
          >
            <span>2025 v1.0.0</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

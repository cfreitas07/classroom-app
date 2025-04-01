import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaCode, FaGlobe, FaCopyright } from 'react-icons/fa';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.container}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className={styles.title} style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          ':hover': {
            transform: 'scale(1.05)'
          }
        }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
          🎓 Aki
        </h1>
      </Link>
      <p style={{ color: '#4a5568', marginBottom: '2rem' }}>Manage attendance easily and securely</p>
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
      
      <div style={{ 
        marginTop: '4rem', 
        padding: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(237, 242, 247, 0.5))',
        borderRadius: '0 0 12px 12px'
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
                transition: 'color 0.3s ease',
                ':hover': {
                  color: '#2b6cb0'
                }
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
          marginBottom: '0.5rem'
        }}>
          <FaGlobe style={{ color: '#4a5568' }} />
          <a 
            href="https://www.claudiocsdefreitas.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#718096', 
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              ':hover': {
                color: '#4a5568'
              }
            }}
            onMouseOver={e => e.target.style.color = '#4a5568'}
            onMouseOut={e => e.target.style.color = '#718096'}
          >
            www.claudiocsdefreitas.com
          </a>
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
          <span>2025</span>
        </div>
      </div>
    </div>
  );
}

export default Home;

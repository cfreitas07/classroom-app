import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaCode, FaGlobe, FaCopyright, FaUserPlus, FaUsers, FaClipboardCheck, FaFileCsv, FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import styles from './Home.module.css';

function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

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
      <p style={{ color: '#4a5568', marginBottom: '2rem' }}>Manage classroom attendance easily and securely</p>
      
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
      <div style={{ 
        maxWidth: '800px', 
        margin: '3rem auto',
        padding: '2rem',
        backgroundColor: '#d5e0f2',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#1e293b',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={e => e.target.style.color = '#3b82f6'}
          onMouseOut={e => e.target.style.color = '#1e293b'}
        >
          How It Works
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {isExpanded && (
          <>
            {/* Instructor Section */}
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              marginTop: '1.5rem'
            }}>
              <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>For Instructors</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Step 1 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaUserPlus size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>1. Create Account</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign up as an instructor to get started</p>
                </div>

                {/* Step 2 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaUsers size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>2. Create Class</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Set class name, meeting times, and class size</p>
                </div>

                {/* Step 3 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaClipboardCheck size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>3. Start Attendance</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Generate and share attendance code at the start of each class</p>
                </div>

                {/* Step 4 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaFileCsv size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>4. Download Records</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Get attendance reports in CSV format anytime</p>
                </div>
              </div>
            </div>

            {/* Student Section */}
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              marginTop: '1.5rem'
            }}>
              <h3 style={{ color: '#166534', marginBottom: '1rem' }}>For Students</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Step 1 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaUserGraduate size={32} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>1. Get Enrollment Code</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Obtain the classroom enrollment code from your instructor</p>
                </div>

                {/* Step 2 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaClipboardCheck size={32} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>2. Enter Details</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Input your student ID and the attendance code</p>
                </div>

                {/* Step 3 */}
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                  <FaCheck size={32} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
                  <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>3. Confirm Attendance</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit to confirm your attendance</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div style={{ 
        marginTop: '4rem', 
        padding: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        color: '#718096',
        fontSize: '0.9rem',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, rgba(237, 242, 247, 0.5))',
        borderRadius: '0 0 12px 12px',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
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

import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCode, FaGlobe, FaCopyright } from 'react-icons/fa';
import logo from '../images/logo transparent.png';

function VersionHistory() {
  const versions = [
    {
      version: '1.0.0',
      date: '2025-04-02',
      changes: [
        'Initial release with core features',
        'Classroom creation and management',
        'Attendance code generation and validation',
        'Student attendance submission',
        'CSV export functionality',
        'Mobile-responsive design',
        'Cache-busting implementation'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        <img 
          src={logo} 
          alt="Presenzo Logo" 
          style={{ 
            height: '60px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }} 
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'} 
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        />
      </Link>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#4a5568',
          textDecoration: 'none',
          fontSize: '1.1rem'
        }}>
          <FaArrowLeft /> Back to Home
        </Link>
      </div>

      <h1 style={{ 
        color: '#2d3748', 
        marginBottom: '2rem',
        fontSize: '2.5rem'
      }}>Version History</h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {versions.map((v, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <FaCode style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
              <h2 style={{ 
                color: '#2d3748',
                margin: 0,
                fontSize: '1.8rem'
              }}>v{v.version}</h2>
              <span style={{ 
                color: '#718096',
                fontSize: '1rem'
              }}>{v.date}</span>
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {v.changes.map((change, i) => (
                <li key={i} style={{
                  color: '#4a5568',
                  marginBottom: '0.5rem',
                  paddingLeft: '1.5rem',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: '#3b82f6'
                  }}>•</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <a 
            href="https://www.claudiocsdefreitas.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#718096', 
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={e => e.target.style.color = '#4a5568'}
            onMouseOut={e => e.target.style.color = '#718096'}
          >
            <FaGlobe style={{ color: '#4a5568' }} />
            www.presenzo.com
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
          <span>2025 v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

export default VersionHistory; 
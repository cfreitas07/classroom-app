import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaGlobe, FaArrowLeft, FaShieldAlt, FaFileContract } from 'react-icons/fa';
import logo from '../images/logo transparent.png';

function VersionHistory() {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      title: "Privacy & Terms of Use",
      backToHome: "Back to Home",
      sections: [
        {
          title: "Privacy Policy",
          content: [
            "We collect and process the following information from instructors:",
            "• Name and email address",
            "• This information is stored securely using Firebase authentication and database",
            "",
            "Firebase Security & Privacy Features:",
            "• Data Protection: Firebase is certified under major privacy standards including ISO 27001, ISO 27017, ISO 27018, and SOC 1/2/3",
            "• GDPR & CCPA Compliance: Firebase helps us comply with international privacy regulations",
            "• Data Encryption: All data is encrypted in transit using HTTPS and at rest",
            "• Access Control: Strict access controls and 2-factor authentication for data access",
            "• Data Processing: Firebase processes data in secure Google Cloud locations",
            "",
            "Our Commitment to Your Privacy:",
            "• We never sell your information or share it with third parties for marketing purposes",
            "• We only share your information if required by law",
            "• We implement reasonable security measures to protect your data",
            "• We will notify you of any changes to this privacy policy",
            "",
            "FERPA Compliance:",
            "• We recommend instructors use student IDs or assigned numbers instead of full names",
            "• Consider using pseudonyms or initials for student identification",
            "• Avoid storing sensitive student information in attendance records",
            "• Regularly review and clean up attendance data"
          ]
        },
        {
          title: "Terms of Use",
          content: [
            "Age Requirement:",
            "• Users must be 18 years or older to create an account",
            "• We will delete information from users under 18 years of age",
            "• By using this service, you confirm you are at least 18 years old",
            "",
            "Account Responsibilities:",
            "• You are responsible for maintaining the security of your account",
            "• You must provide accurate information when creating an account",
            "• You agree to use the service in compliance with all applicable laws",
            "• We reserve the right to terminate accounts that violate these terms"
          ]
        }
      ]
    },
    pt: {
      title: "Privacidade e Termos de Uso",
      backToHome: "Voltar para Home",
      sections: [
        {
          title: "Política de Privacidade",
          content: [
            "Coletamos e processamos as seguintes informações dos instrutores:",
            "• Nome e endereço de e-mail",
            "• Essas informações são armazenadas com segurança usando autenticação e banco de dados do Firebase",
            "",
            "Recursos de Segurança e Privacidade do Firebase:",
            "• Proteção de Dados: O Firebase é certificado sob os principais padrões de privacidade, incluindo ISO 27001, ISO 27017, ISO 27018 e SOC 1/2/3",
            "• Conformidade com GDPR e CCPA: O Firebase nos ajuda a cumprir as regulamentações internacionais de privacidade",
            "• Criptografia de Dados: Todos os dados são criptografados em trânsito usando HTTPS e em repouso",
            "• Controle de Acesso: Controles de acesso rigorosos e autenticação de 2 fatores para acesso a dados",
            "• Processamento de Dados: O Firebase processa dados em locais seguros do Google Cloud",
            "",
            "Nosso Compromisso com Sua Privacidade:",
            "• Nunca vendemos suas informações ou as compartilhamos com terceiros para fins de marketing",
            "• Compartilhamos suas informações apenas se exigido por lei",
            "• Implementamos medidas de segurança razoáveis para proteger seus dados",
            "• Notificaremos você sobre quaisquer alterações nesta política de privacidade",
            "",
            "Conformidade com FERPA:",
            "• Recomendamos que os instrutores usem IDs de estudante ou números atribuídos em vez de nomes completos",
            "• Considere usar pseudônimos ou iniciais para identificação dos estudantes",
            "• Evite armazenar informações sensíveis dos estudantes nos registros de presença",
            "• Revise e limpe regularmente os dados de presença"
          ]
        },
        {
          title: "Termos de Uso",
          content: [
            "Requisito de Idade:",
            "• Os usuários devem ter 18 anos ou mais para criar uma conta",
            "• Excluiremos informações de usuários menores de 18 anos",
            "• Ao usar este serviço, você confirma que tem pelo menos 18 anos",
            "",
            "Responsabilidades da Conta:",
            "• Você é responsável por manter a segurança de sua conta",
            "• Você deve fornecer informações precisas ao criar uma conta",
            "• Você concorda em usar o serviço em conformidade com todas as leis aplicáveis",
            "• Reservamos o direito de encerrar contas que violem estes termos"
          ]
        }
      ]
    },
    es: {
      title: "Privacidad y Términos de Uso",
      backToHome: "Volver al Inicio",
      sections: [
        {
          title: "Política de Privacidad",
          content: [
            "Recopilamos y procesamos la siguiente información de los instructores:",
            "• Nombre y dirección de correo electrónico",
            "• Esta información se almacena de forma segura utilizando autenticación y base de datos de Firebase",
            "",
            "Características de Seguridad y Privacidad de Firebase:",
            "• Protección de Datos: Firebase está certificado bajo los principales estándares de privacidad, incluyendo ISO 27001, ISO 27017, ISO 27018 y SOC 1/2/3",
            "• Cumplimiento con GDPR y CCPA: Firebase nos ayuda a cumplir con las regulaciones internacionales de privacidad",
            "• Encriptación de Datos: Todos los datos están encriptados en tránsito usando HTTPS y en reposo",
            "• Control de Acceso: Controles de acceso estrictos y autenticación de 2 factores para acceso a datos",
            "• Procesamiento de Datos: Firebase procesa datos en ubicaciones seguras de Google Cloud",
            "",
            "Nuestro Compromiso con su Privacidad:",
            "• Nunca vendemos su información ni la compartimos con terceros para fines de marketing",
            "• Solo compartimos su información si es requerido por ley",
            "• Implementamos medidas de seguridad razonables para proteger sus datos",
            "• Le notificaremos sobre cualquier cambio en esta política de privacidad",
            "",
            "Cumplimiento con FERPA:",
            "• Recomendamos que los instructores usen IDs de estudiante o números asignados en lugar de nombres completos",
            "• Considere usar seudónimos o iniciales para la identificación de estudiantes",
            "• Evite almacenar información sensible de estudiantes en los registros de asistencia",
            "• Revise y limpie regularmente los datos de asistencia"
          ]
        },
        {
          title: "Términos de Uso",
          content: [
            "Requisito de Edad:",
            "• Los usuarios deben tener 18 años o más para crear una cuenta",
            "• Eliminaremos la información de usuarios menores de 18 años",
            "• Al usar este servicio, confirma que tiene al menos 18 años",
            "",
            "Responsabilidades de la Cuenta:",
            "• Usted es responsable de mantener la seguridad de su cuenta",
            "• Debe proporcionar información precisa al crear una cuenta",
            "• Acepta usar el servicio de conformidad con todas las leyes aplicables",
            "• Nos reservamos el derecho de terminar cuentas que violen estos términos"
          ]
        }
      ]
    }
  };

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

      <div style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'left'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <FaShieldAlt size={24} style={{ color: '#3b82f6' }} />
          <h1 style={{ 
            margin: 0,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: '#1e293b'
          }}>
            {translations[language].title}
          </h1>
        </div>

        <p style={{ 
          color: '#64748b',
          fontSize: '0.9rem',
          marginBottom: '2rem'
        }}>
          {translations[language].lastUpdated}
        </p>

        {translations[language].sections.map((section, index) => (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ 
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {section.title}
              </span>
            </div>
            <ul style={{ 
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {section.content.map((content, contentIndex) => (
                <li key={contentIndex} style={{ 
                  color: '#4a5568',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  lineHeight: '1.6',
                  marginBottom: '0.5rem',
                  paddingLeft: '1.5rem',
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute',
                    left: 0,
                    color: '#3b82f6'
                  }}>
                    •
                  </span>
                  {content}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
            marginTop: '1rem'
          }}
          onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
        >
          <FaArrowLeft />
          {translations[language].backToHome}
        </Link>
      </div>
    </div>
  );
}

export default VersionHistory; 
import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎓 Classroom App</h1>
      <p style={{ color: '#4a5568', marginBottom: '2rem' }}>Manage attendance easily and securely</p>
      <div className={styles.buttonContainer}>
        <Link to="/instructor" className={styles.card}>
          <FaChalkboardTeacher size={36} style={{ marginBottom: '0.5rem' }} />
          I’m an Instructor
        </Link>
        <Link to="/student" className={styles.card}>
          <FaUserGraduate size={36} style={{ marginBottom: '0.5rem' }} />
          I’m a Student
        </Link>
      </div>
    </div>
  );
}

export default Home;

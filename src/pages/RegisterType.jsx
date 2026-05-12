import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, ChevronRight, Disc } from 'lucide-react';

const RegisterType = () => {
  const options = [
    {
      title: "Event Organizer",
      desc: "I want to host events, sell tickets, and manage attendees.",
      icon: Calendar,
      path: "/signup/owner",
      color: "#FFB173"
    },
    {
      title: "Service Vendor",
      desc: "I'm a photographer, DJ, or caterer looking to provide services.",
      icon: Briefcase,
      path: "/signup/vendor",
      color: "#73B5FF"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Disc size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
        <h1 style={styles.title}>Join the Ecosystem</h1>
        <p style={styles.subtitle}>Choose how you want to interact with NEOEVENT</p>

        <div style={styles.grid}>
          {options.map((opt) => (
            <Link key={opt.title} to={opt.path} style={styles.card} className="glass-hover">
              <div style={{ ...styles.iconBox, backgroundColor: opt.color + '22', color: opt.color }}>
                <opt.icon size={32} />
              </div>
              <div style={styles.cardText}>
                <h3 style={styles.cardTitle}>{opt.title}</h3>
                <p style={styles.cardDesc}>{opt.desc}</p>
              </div>
              <ChevronRight size={24} color="#ccc" />
            </Link>
          ))}
        </div>
        
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' },
  content: { textAlign: 'center', maxWidth: '800px', width: '100%', padding: '20px' },
  title: { fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' },
  subtitle: { color: '#64748b', marginBottom: '40px' },
  grid: { display: 'flex', gap: '20px', flexDirection: 'column' },
  card: { 
    display: 'flex', alignItems: 'center', padding: '30px', background: 'white', 
    borderRadius: '24px', textDecoration: 'none', color: 'inherit', textAlign: 'left',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'transform 0.2s'
  },
  iconBox: { width: '70px', height: '70px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' },
  cardDesc: { color: '#64748b', fontSize: '0.95rem' },
  footer: { marginTop: '30px', fontSize: '0.9rem' }
};

export default RegisterType;

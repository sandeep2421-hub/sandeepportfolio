import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, projectsRes, skillsRes] = await Promise.all([
        fetch('/api/public'),
        fetch('/api/public/projects'),
        fetch('/api/public/skills')
      ]);

      const profileData = await profileRes.json();
      const projectsData = await projectsRes.json();
      const skillsData = await skillsRes.json();

      if (profileData.success) setProfile(profileData.profile);
      if (projectsData.success) setProjects(projectsData.projects);
      if (skillsData.success) setSkills(skillsData.skills);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <ThemeToggle />
      <button 
        className="admin-access-btn" 
        onClick={() => navigate('/admin/login')}
        title="Admin Access"
      >
        sanjai
      </button>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          {profile?.profile_image_url && (
            <img 
              src={profile.profile_image_url} 
              alt={profile.name} 
              className="profile-image"
            />
          )}
          <h1 className="hero-name">{profile?.name || 'Your Name'}</h1>
          <p className="hero-role">{profile?.role || 'Your Role'}</p>
          <p className="hero-identity">{profile?.professional_identity}</p>
        </div>
      </section>

      {/* About Section */}
      {profile?.bio && (
        <section className="about">
          <div className="container">
            <h2 className="section-title">About</h2>
            <p className="about-text">{profile.bio}</p>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="skills">
          <div className="container">
            <h2 className="section-title">Skills</h2>
            <div className="skills-grid">
              {skills.map(skill => (
                <div key={skill.id} className="skill-item">
                  <span className="skill-name">{skill.name}</span>
                  {skill.category && (
                    <span className="skill-category">{skill.category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="projects">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          {projects.length === 0 ? (
            <p className="no-projects">No projects yet.</p>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.short_description}</p>
                  
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="tech-stack">
                      {project.tech_stack.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="project-links">
                    <Link to={`/project/${project.id}`} className="btn-secondary">
                      View Details
                    </Link>
                    {project.github_link && (
                      <a 
                        href={project.github_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-outline"
                      >
                        GitHub
                      </a>
                    )}
                    {project.live_link && (
                      <a 
                        href={project.live_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="container">
          <h2 className="section-title">Contact</h2>
          <div className="contact-links">
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="contact-link">
                ðŸ“§ Email
              </a>
            )}
            {profile?.github_url && (
              <a 
                href={profile.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                ðŸ”— GitHub
              </a>
            )}
            {profile?.linkedin_url && (
              <a 
                href={profile.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                ðŸ’¼ LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {profile?.name || 'Portfolio'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

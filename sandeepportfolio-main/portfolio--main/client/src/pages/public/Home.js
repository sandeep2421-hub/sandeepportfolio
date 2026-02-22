import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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
// Fallback demo data if database is not available
      setProfile({
        name: 'KOTA.SANDEEP KUMAR',
        role: 'Full Stack Developer',
        professional_identity: 'Software Engineer',
        bio: 'Passionate about creating amazing web experiences. This is demo content - configure your database to add real content.',
        email: 'your.email@example.com',
        github_url: 'https://github.com',
        linkedin_url: 'https://linkedin.com',
        profile_image_url: 'https://via.placeholder.com/400x400?text=Your+Photo',
        resume_url: 'https://example.com/resume.pdf'
      });
      setProjects([
        {
          id: 1,
          title: 'Demo Project 1',
          description: 'This is a demo project. Set up your database to add real projects.',
          tech_stack: 'React, Node.js, MongoDB',
          category: 'Web Development',
          image_url: 'https://via.placeholder.com/400x300?text=Project+1'
        },
        {
          id: 2,
          title: 'Demo Project 2',
          description: 'Another demo project. Login to admin panel to add your actual projects.',
          tech_stack: 'Vue.js, Express, MySQL',
          category: 'Full Stack',
          image_url: 'https://via.placeholder.com/400x300?text=Project+2'
        }
      ]);
      setSkills([
        { id: 1, name: 'JavaScript', proficiency: 90 },
        { id: 2, name: 'React', proficiency: 85 },
        { id: 3, name: 'Node.js', proficiency: 80 },
        { id: 4, name: 'MySQL', proficiency: 75 }
      ]);
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create mailto link with form data
    const mailtoLink = `mailto:sandeepkumar2006@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleResumeDownload = async (e) => {
    e.preventDefault();
    if (!profile?.resume_url) return;

    try {
      const response = await fetch(profile.resume_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name || 'Resume'}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      // Fallback: open in new tab
      window.open(profile.resume_url, '_blank');
    }
  };

  // Get unique categories from projects
  const categories = ['All Projects', ...new Set(projects.map(p => p.category).filter(Boolean))];

  // Filter projects by category
  const filteredProjects = selectedCategory === 'All Projects' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">Portfolio</div>
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#home" onClick={() => scrollToSection('home')} className="nav-link">Home</a>
            </li>
            <li className="nav-item">
              <a href="#about" onClick={() => scrollToSection('about')} className="nav-link">About</a>
            </li>
            <li className="nav-item">
              <a href="#skills" onClick={() => scrollToSection('skills')} className="nav-link">Skills</a>
            </li>
            <li className="nav-item">
              <a href="#projects" onClick={() => scrollToSection('projects')} className="nav-link">Projects</a>
            </li>
            <li className="nav-item">
              <a href="#contact" onClick={() => scrollToSection('contact')} className="nav-link">Contact</a>
            </li>
            {profile?.resume_url && (
              <li className="nav-item">
                <a href={profile.resume_url} onClick={handleResumeDownload} className="nav-link resume-link">Resume</a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <button 
        className="admin-access-btn" 
        onClick={() => navigate('/admin/login')}
        title="Admin Access"
      >
        S
      </button>

      <section id="home" className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h3 className="hero-greeting">Hello, It's Me</h3>
            <h1 className="hero-name">{profile?.name || 'Your Name'}</h1>
            <h2 className="hero-role">
              And I'm a <span className="typing-text">{profile?.role || 'Developer'}</span>
            </h2>
            <p className="hero-description">{profile?.professional_identity || 'Passionate about creating amazing digital experiences'}</p>
            
            <div className="social-links">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-github"></i>
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="social-icon">
                  <i className="fas fa-envelope"></i>
                </a>
              )}
            </div>
            
            <button onClick={() => scrollToSection('about')} className="hero-btn">More About Me</button>
          </div>
          
          <div className="hero-image">
            {profile?.profile_image_url && (
              <div className="image-wrapper">
                <img 
                  src={profile.profile_image_url} 
                  alt={profile.name} 
                  className="profile-image"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {profile?.bio && (
        <section id="about" className="about">
          <div className="container">
            <h2 className="section-title">About Me</h2>
            <p className="about-text">{profile.bio}</p>
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section id="skills" className="skills">
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

      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <p className="section-subtitle">Explore my recent work in AI, Cloud, and Mobile Development</p>
          
          {/* Category Filter Buttons */}
          <div className="project-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <p className="no-projects">No projects yet.</p>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map(project => (
                <div key={project.id} className="project-card">
                  {project.image_url && (
                    <div className="project-image">
                      <img src={project.image_url} alt={project.title} />
                    </div>
                  )}
                  <div className="project-content">
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
                          Visit Live Site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-container">
          <div className="contact-left">
            <h2 className="contact-heading">
              <span className="contact-word-1">Get In Touch </span> <span className="contact-word-2"></span>
            </h2>
            <h3 className="contact-subtitle">Let's Work Together</h3>
            <p className="contact-description">
              I'd love to hear from you! Whether you have a question, want to discuss a 
              potential project, or just want to say hello, feel free to reach out using the contact 
              form provided or via the email address provided. I strive to respond to all inquiries 
              promptly.
            </p>
            
            <div className="contact-info">
              <a href="mailto:kotasandeepkumar2006@gmail.com" className="contact-info-item">
                <i className="fas fa-envelope"></i>
                <span>kotasandeepkumar2006@gmail.com</span>
              </a>
              <a href="tel:+916281754652" className="contact-info-item">
                <i className="fas fa-phone"></i>
                <span>+91 6281754652</span>
              </a>
            </div>

            <div className="contact-social">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="contact-social-icon">
                  <i className="fab fa-github"></i>
                </a>
              )}
              {profile?.email && (
                <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer" className="contact-social-icon">
                  <i className="fas fa-envelope"></i>
                </a>
              )}
              <a href="https://www.instagram.com/sandeepkumar_2421" target="_blank" rel="noopener noreferrer" className="contact-social-icon">
                <i className="fab fa-instagram"></i>
              </a>
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="contact-social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
            </div>
          </div>

          <div className="contact-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Enter Your Name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="contact-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleFormChange}
                required
                className="contact-input"
              />
              <input
                type="text"
                name="subject"
                placeholder="Enter Your Subject"
                value={formData.subject}
                onChange={handleFormChange}
                required
                className="contact-input"
              />
              <textarea
                name="message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleFormChange}
                required
                className="contact-textarea"
                rows="6"
              ></textarea>
              <button type="submit" className="contact-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {profile?.name || 'Portfolio'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

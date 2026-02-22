import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { admin, logout, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [profileForm, setProfileForm] = useState({});
  const [projectForm, setProjectForm] = useState({});
  const [skillForm, setSkillForm] = useState({});
  const [editingProject, setEditingProject] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [techStackInput, setTechStackInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (profileData.success) {
        setProfileForm(profileData.profile);
      }
      if (projectsData.success) setProjects(projectsData.projects);
      if (skillsData.success) setSkills(skillsData.skills);
    } catch (error) {
      showMessage('error', 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Handle image upload
  const handleImageUpload = async (file, formType) => {
    if (!file) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Use the URL directly (Cloudinary returns complete URLs)
        const imageUrl = data.url;
        
        if (formType === 'profile') {
          setProfileForm({...profileForm, profile_image_url: imageUrl});
        } else if (formType === 'project') {
          setProjectForm({...projectForm, image_url: imageUrl});
        }
        
        showMessage('success', 'Image uploaded successfully');
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (file) => {
    if (!file) return;
    
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/admin/upload-resume', {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Use the URL directly (Cloudinary returns complete URLs)
        setProfileForm({...profileForm, resume_url: data.url});
        showMessage('success', 'Resume uploaded successfully');
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error uploading resume');
    } finally {
      setUploadingResume(false);
    }
  };

  // ==================== PROFILE ====================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Helper function to ensure URLs have https://
    const ensureHttps = (url) => {
      if (!url) return url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `https://${url.replace(/^(www\.)/, '')}`;
    };

    // Prepare profile data with properly formatted URLs
    const updatedProfile = {
      ...profileForm,
      github_url: ensureHttps(profileForm.github_url),
      linkedin_url: ensureHttps(profileForm.linkedin_url),
      twitter_url: ensureHttps(profileForm.twitter_url)
    };

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(updatedProfile)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Profile updated successfully');
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error updating profile');
    }
  };

  // ==================== PROJECTS ====================
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    
    const techStack = projectForm.tech_stack || [];
    const projectData = { ...projectForm, tech_stack: techStack };

    try {
      const url = editingProject 
        ? `/api/admin/projects/${editingProject.id}`
        : '/api/admin/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', editingProject ? 'Project updated' : 'Project created');
        setProjectForm({});
        setEditingProject(null);
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error saving project');
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({...project});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Project deleted');
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error deleting project');
    }
  };

  const handleAddTech = () => {
    if (techStackInput.trim()) {
      const currentTech = projectForm.tech_stack || [];
      setProjectForm({
        ...projectForm,
        tech_stack: [...currentTech, techStackInput.trim()]
      });
      setTechStackInput('');
    }
  };

  const handleRemoveTech = (index) => {
    const newTech = [...(projectForm.tech_stack || [])];
    newTech.splice(index, 1);
    setProjectForm({ ...projectForm, tech_stack: newTech });
  };

  // ==================== SKILLS ====================
  const handleSkillSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingSkill 
        ? `/api/admin/skills/${editingSkill.id}`
        : '/api/admin/skills';
      
      const method = editingSkill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(skillForm)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', editingSkill ? 'Skill updated' : 'Skill added');
        setSkillForm({});
        setEditingSkill(null);
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error saving skill');
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setSkillForm({...skill});
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`/api/admin/skills/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Skill deleted');
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Error deleting skill');
    }
  };

  if (loading) {
    return <div className="loading-container"><p>Loading...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <ThemeToggle />

      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <span>Welcome, {admin?.username}</span>
            <button onClick={() => navigate('/')} className="btn-view-site">
              View Site
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'profile' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'projects' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={activeTab === 'skills' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <input
                      type="text"
                      value={profileForm.role || ''}
                      onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Professional Identity</label>
                  <input
                    type="text"
                    value={profileForm.professional_identity || ''}
                    onChange={(e) => setProfileForm({...profileForm, professional_identity: e.target.value})}
                    placeholder="e.g., Building scalable web applications"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    rows="5"
                    value={profileForm.bio || ''}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    placeholder="Tell visitors about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label>Profile Image</label>
                  <div className="image-upload-group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                      disabled={uploadingImage}
                    />
                    <span className="upload-hint">Or enter URL:</span>
                    <input
                      type="url"
                      value={profileForm.profile_image_url || ''}
                      onChange={(e) => setProfileForm({...profileForm, profile_image_url: e.target.value})}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  </div>
                  {uploadingImage && <p className="uploading-text">Uploading...</p>}
                  {profileForm.profile_image_url && (
                    <img 
                      src={profileForm.profile_image_url} 
                      alt="Preview" 
                      className="image-preview"
                    />
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input
                      type="text"
                      value={profileForm.github_url || ''}
                      onChange={(e) => setProfileForm({...profileForm, github_url: e.target.value})}
                      placeholder="https://github.com/yourusername or github.com/yourusername"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="text"
                    value={profileForm.linkedin_url || ''}
                    onChange={(e) => setProfileForm({...profileForm, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/username or www.linkedin.com/in/username"
                  />
                </div>

                <div className="form-group">
                  <label>Twitter URL</label>
                  <input
                    type="text"
                    value={profileForm.twitter_url || ''}
                    onChange={(e) => setProfileForm({...profileForm, twitter_url: e.target.value})}
                    placeholder="https://twitter.com/yourusername or twitter.com/yourusername"
                  />
                </div>

                <div className="form-group">
                  <label>Resume (PDF)</label>
                  <div className="resume-upload-group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleResumeUpload(e.target.files[0])}
                      disabled={uploadingResume}
                    />
                    <span className="upload-hint">Or enter URL:</span>
                    <input
                      type="url"
                      value={profileForm.resume_url || ''}
                      onChange={(e) => setProfileForm({...profileForm, resume_url: e.target.value})}
                      placeholder="https://example.com/your-resume.pdf"
                    />
                  </div>
                  {uploadingResume && <p className="uploading-text">Uploading resume...</p>}
                  {profileForm.resume_url && (
                    <div className="resume-preview">
                      <a href={profileForm.resume_url} target="_blank" rel="noopener noreferrer">
                        View Current Resume
                      </a>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary-admin">
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="projects-section">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <form onSubmit={handleProjectSubmit} className="admin-form">
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={projectForm.title || ''}
                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Short Description *</label>
                  <textarea
                    rows="2"
                    value={projectForm.short_description || ''}
                    onChange={(e) => setProjectForm({...projectForm, short_description: e.target.value})}
                    required
                    placeholder="Brief one-liner about the project"
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea
                    rows="5"
                    value={projectForm.detailed_description || ''}
                    onChange={(e) => setProjectForm({...projectForm, detailed_description: e.target.value})}
                    placeholder="Full project description..."
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={projectForm.category || ''}
                    onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}
                    required
                    placeholder="e.g., AI/ML, Mobile, Cloud, Web"
                  />
                  <small style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Category will appear as a filter button</small>
                </div>

                <div className="form-group">
                  <label>Project Image</label>
                  <div className="image-upload-group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'project')}
                      disabled={uploadingImage}
                    />
                    <span className="upload-hint">Or enter URL:</span>
                    <input
                      type="url"
                      value={projectForm.image_url || ''}
                      onChange={(e) => setProjectForm({...projectForm, image_url: e.target.value})}
                      placeholder="https://example.com/project-image.jpg"
                    />
                  </div>
                  {uploadingImage && <p className="uploading-text">Uploading...</p>}
                  {projectForm.image_url && (
                    <img 
                      src={projectForm.image_url} 
                      alt="Project Preview" 
                      className="image-preview"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Tech Stack</label>
                  <div className="tech-input-wrapper">
                    <input
                      type="text"
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      placeholder="Enter technology and click Add"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTech}
                      className="btn-add-tech"
                    >
                      Add
                    </button>
                  </div>
                  <div className="tech-tags">
                    {(projectForm.tech_stack || []).map((tech, index) => (
                      <span key={index} className="tech-tag-edit">
                        {tech}
                        <button 
                          type="button"
                          onClick={() => handleRemoveTech(index)}
                          className="remove-tech"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>GitHub Link</label>
                    <input
                      type="url"
                      value={projectForm.github_link || ''}
                      onChange={(e) => setProjectForm({...projectForm, github_link: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Live Demo Link</label>
                    <input
                      type="url"
                      value={projectForm.live_link || ''}
                      onChange={(e) => setProjectForm({...projectForm, live_link: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Video Demo URL (YouTube/Vimeo embed)</label>
                  <input
                    type="url"
                    value={projectForm.video_url || ''}
                    onChange={(e) => setProjectForm({...projectForm, video_url: e.target.value})}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={projectForm.display_order || 0}
                    onChange={(e) => setProjectForm({...projectForm, display_order: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary-admin">
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  {editingProject && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingProject(null);
                        setProjectForm({});
                      }}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <hr className="divider" />

              <h2>Existing Projects</h2>
              <div className="items-list">
                {projects.length === 0 ? (
                  <p className="no-items">No projects yet.</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="item-card">
                      <div className="item-info">
                        <h3>{project.title}</h3>
                        <p>{project.short_description}</p>
                        {project.tech_stack && (
                          <div className="tech-tags-small">
                            {project.tech_stack.map((tech, i) => (
                              <span key={i}>{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="item-actions">
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="skills-section">
              <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
              <form onSubmit={handleSkillSubmit} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      value={skillForm.name || ''}
                      onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={skillForm.category || ''}
                      onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                      placeholder="e.g., Frontend, Backend, Tools"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Proficiency Level (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skillForm.proficiency_level || 0}
                      onChange={(e) => setSkillForm({...skillForm, proficiency_level: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={skillForm.display_order || 0}
                      onChange={(e) => setSkillForm({...skillForm, display_order: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary-admin">
                    {editingSkill ? 'Update Skill' : 'Add Skill'}
                  </button>
                  {editingSkill && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingSkill(null);
                        setSkillForm({});
                      }}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <hr className="divider" />

              <h2>Existing Skills</h2>
              <div className="items-list">
                {skills.length === 0 ? (
                  <p className="no-items">No skills yet.</p>
                ) : (
                  skills.map(skill => (
                    <div key={skill.id} className="item-card">
                      <div className="item-info">
                        <h3>{skill.name}</h3>
                        {skill.category && <p>Category: {skill.category}</p>}
                      </div>
                      <div className="item-actions">
                        <button 
                          onClick={() => handleEditSkill(skill)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

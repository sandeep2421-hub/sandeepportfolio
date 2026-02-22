import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/public/projects/${id}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.project);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/');
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

  if (!project) {
    return null;
  }

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Convert standard YouTube URL to embed
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Return original URL for other video platforms
    return url;
  };

  return (
    <div className="project-detail">
      <ThemeToggle />

      <div className="container">
        <Link to="/" className="back-button">← Back to Home</Link>

        <div className="project-detail-content">
          <h1 className="project-detail-title">{project.title}</h1>
          
          <p className="project-detail-short">{project.short_description}</p>

          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="tech-stack-detail">
              <h3>Technologies Used</h3>
              <div className="tech-list">
                {project.tech_stack.map((tech, index) => (
                  <span key={index} className="tech-tag-detail">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {project.detailed_description && (
            <div className="detailed-description">
              <h3>About This Project</h3>
              <p>{project.detailed_description}</p>
            </div>
          )}

          {project.video_url && (
            <div className="video-container">
              <h3>Demo Video</h3>
              <div className="video-wrapper">
                <iframe
                  src={getEmbedUrl(project.video_url)}
                  title={`${project.title} Demo`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="project-detail-links">
            {project.github_link && (
              <a 
                href={project.github_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline-large"
              >
                View on GitHub
              </a>
            )}
            {project.live_link && (
              <a 
                href={project.live_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary-large"
              >
                Visit Live Site
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

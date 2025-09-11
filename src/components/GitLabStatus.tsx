import React, { useState, useEffect } from 'react';
import gitlabService, { GitLabPipeline, GitLabProject } from '../services/gitlabService';
import '../styles/GitLabStatus.css';

interface GitLabStatusProps {
  data: {
    pipelines: GitLabPipeline[];
    projects: GitLabProject[];
    loading: boolean;
    error: string | null;
  };
  onDataChange: (data: any) => void;
}

function GitLabStatus({ data, onDataChange }: GitLabStatusProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [pipelineDetails, setPipelineDetails] = useState<{ [key: number]: any[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        onDataChange({ ...data, loading: true, error: null });
        
        const projects = await gitlabService.getProjects();
        onDataChange({ ...data, projects, loading: false });
        
        if (projects.length > 0) {
          const firstProject = projects[0];
          setSelectedProject(firstProject.id.toString());
          const pipelines = await gitlabService.getPipelines(firstProject.id.toString());
          onDataChange({ ...data, projects, pipelines, loading: false });
        }
      } catch (error) {
        onDataChange({ 
          ...data, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch GitLab data'
        });
      }
    };

    fetchData();
  }, []);

  const handleProjectChange = async (projectId: string) => {
    if (!projectId) return;
    
    setSelectedProject(projectId);
    try {
      onDataChange({ ...data, loading: true, error: null });
      const pipelines = await gitlabService.getPipelines(projectId);
      onDataChange({ ...data, pipelines, loading: false });
    } catch (error) {
      onDataChange({ 
        ...data, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch pipelines'
      });
    }
  };

  const fetchPipelineJobs = async (pipelineId: number) => {
    if (pipelineDetails[pipelineId]) return;
    
    try {
      const jobs = await gitlabService.getPipelineJobs(selectedProject, pipelineId);
      setPipelineDetails(prev => ({ ...prev, [pipelineId]: jobs }));
    } catch (error) {
      console.error('Error fetching pipeline jobs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      case 'pending': return '⏳';
      case 'canceled': return '⏹️';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success': return 'status-success';
      case 'failed': return 'status-failed';
      case 'running': return 'status-running';
      case 'pending': return 'status-pending';
      case 'canceled': return 'status-canceled';
      case 'skipped': return 'status-skipped';
      default: return 'status-unknown';
    }
  };

  if (data.loading) {
    return (
      <div className="gitlab-status loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading GitLab data...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="gitlab-status error">
        <div className="error-icon">⚠️</div>
        <p>Error: {data.error}</p>
        <small>Check your GitLab API token configuration</small>
      </div>
    );
  }

  return (
    <div className="gitlab-status">
      <div className="project-selector">
        <label htmlFor="project-select">Project:</label>
        <select 
          id="project-select"
          value={selectedProject} 
          onChange={(e) => handleProjectChange(e.target.value)}
          className="project-dropdown"
        >
          <option value="">Select a project</option>
          {data.projects.map(project => (
            <option key={project.id} value={project.id.toString()}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pipelines-list">
        <h3>Recent Pipelines</h3>
        {data.pipelines.length === 0 ? (
          <p className="no-data">No pipelines found</p>
        ) : (
          <div className="pipelines">
            {data.pipelines.map(pipeline => (
              <div key={pipeline.id} className="pipeline-item">
                <div className="pipeline-header">
                  <span className={`status ${getStatusClass(pipeline.status)}`}>
                    {getStatusIcon(pipeline.status)} {pipeline.status}
                  </span>
                  <a 
                    href={pipeline.web_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pipeline-link"
                  >
                    #{pipeline.id}
                  </a>
                </div>
                
                <div className="pipeline-info">
                  <div className="pipeline-ref">
                    <strong>Branch:</strong> {pipeline.ref}
                  </div>
                  <div className="pipeline-commit">
                    <strong>Commit:</strong> {pipeline.commit.title}
                  </div>
                  <div className="pipeline-author">
                    <strong>Author:</strong> {pipeline.commit.author_name}
                  </div>
                  <div className="pipeline-dates">
                    <span>Created: {new Date(pipeline.created_at).toLocaleString()}</span>
                    {pipeline.finished_at && (
                      <span>Finished: {new Date(pipeline.finished_at).toLocaleString()}</span>
                    )}
                  </div>
                  {pipeline.duration && (
                    <div className="pipeline-duration">
                      <strong>Duration:</strong> {Math.round(pipeline.duration / 60)}m {pipeline.duration % 60}s
                    </div>
                  )}
                </div>

                <button 
                  className="jobs-toggle"
                  onClick={() => fetchPipelineJobs(pipeline.id)}
                >
                  {pipelineDetails[pipeline.id] ? 'Hide Jobs' : 'Show Jobs'}
                </button>

                {pipelineDetails[pipeline.id] && (
                  <div className="pipeline-jobs">
                    <h4>Jobs</h4>
                    {pipelineDetails[pipeline.id].map(job => (
                      <div key={job.id} className={`job-item ${getStatusClass(job.status)}`}>
                        <span className="job-status">
                          {getStatusIcon(job.status)} {job.name}
                        </span>
                        <span className="job-stage">{job.stage}</span>
                        {job.duration && (
                          <span className="job-duration">
                            {Math.round(job.duration / 60)}m {job.duration % 60}s
                          </span>
                        )}
                        <a 
                          href={job.web_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="job-link"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GitLabStatus;

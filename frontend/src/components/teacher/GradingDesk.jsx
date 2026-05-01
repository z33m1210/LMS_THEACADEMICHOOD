import React, { useState } from 'react';
import { 
  FileText, 
  Folder, 
  File, 
  Download, 
  X, 
  Send, 
  Award,
  Archive
} from 'lucide-react';
import MascotChamp from '../MascotChamp';
import './GradingDesk.scss';

const GradingDesk = ({ submission, onGrade, onCancel, submitting }) => {
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');

  const handlePost = () => {
    if (!grade || !comment) {
      alert("Academic Requirement: Please enter both a Final Score and Teacher Feedback before posting.");
      return;
    }
    onGrade(grade, comment);
  };

  if (!submission) {
    return (
      <div className="zero-inbox-container">
        <div className="celebration-champ">
          <div className="speech-bubble">
            Inbox Cleared! You're a grading machine today. 🚀 Time for a coffee break?
          </div>
          <MascotChamp size={200} />
          <div className="coffee-cup">☕</div>
        </div>
        <button className="btn-squishy review-btn">
          Review Graded History
        </button>
      </div>
    );
  }

  const fileName = submission.filePath.split(/[\\/]/).pop();
  const isArchive = fileName.endsWith('.zip') || fileName.endsWith('.rar');

  // Mock file tree for archives
  const mockFileTree = [
    { name: 'src', type: 'folder', children: [
      { name: 'main.js', type: 'file' },
      { name: 'styles.css', type: 'file' }
    ]},
    { name: 'index.html', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  return (
    <div className="grading-modal-overlay">
      <div className="grading-desk-container">
        <div className="desk-main">
          {/* Left Pane: Preview / File Tree */}
          <div className="desk-left-pane">
            <div className="pane-header">
              <div className="title">
                {isArchive ? <Archive size={20} /> : <FileText size={20} />}
                <span>{fileName}</span>
              </div>
              <button className="btn-icon-text">
                <Download size={18} /> Download All
              </button>
            </div>

            <div className="preview-content">
              {isArchive ? (
                <div className="virtual-file-tree">
                  {mockFileTree.map((item, idx) => (
                    <FileTreeNode key={idx} node={item} depth={0} />
                  ))}
                </div>
              ) : (
                <div className="file-preview-iframe">
                  <iframe 
                    src={`http://localhost:5000/${submission?.filePath}`} 
                    title="File Preview"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', borderRadius: '15px' }}
                  ></iframe>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Grading Form */}
          <div className="desk-right-pane">
            <div className="grading-header">
              <div className="student-info">
                <h2>{submission?.student?.name || 'Unknown Student'}</h2>
                <p>{submission?.assignment?.title || 'Unknown Assignment'}</p>
              </div>
              <button className="close-btn" onClick={onCancel}><X /></button>
            </div>

            <div className="grading-body">
              <div className="form-section">
                <label>Final Score (0-100)</label>
                <div className="grade-input-wrapper">
                  <input 
                    type="number" 
                    value={grade} 
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <Award className="input-icon" />
                </div>
              </div>

              <div className="form-section">
                <label>Constructive Feedback</label>
                <textarea 
                  rows="10" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell the student what they did well and where they can improve..."
                ></textarea>
              </div>
            </div>

            <div className="grading-footer">
              <button className="btn-cancel" onClick={onCancel}>Discard</button>
              <button 
                className="btn-squishy btn-submit" 
                onClick={handlePost}
                disabled={submitting}
              >
                {submitting ? 'Posting...' : <><Send size={18} /> Post Grade</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileTreeNode = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="tree-node" style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="node-content" onClick={() => node.type === 'folder' && setIsOpen(!isOpen)}>
        {node.type === 'folder' ? (
          <Folder size={16} fill={isOpen ? 'var(--primary)' : 'none'} stroke={isOpen ? 'var(--primary)' : 'currentColor'} />
        ) : (
          <File size={16} />
        )}
        <span>{node.name}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div className="node-children">
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GradingDesk;

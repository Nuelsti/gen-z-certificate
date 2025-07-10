import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Search, CheckCircle, Shield, Calendar, User, Mail, Award } from 'lucide-react';
import Sign from '../../assets/3db30e82addcda37bf7c3466afc83d83eccfae45.png'
import FooterLogo from '../../assets/7ed6ee29b1e3735f42a89a18b94bde9290d1d430.png'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import WaterMark from '../../assets/GZ logo 00.png';
import './style.css';

// Format date to readable string
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Generate unique ID for certificates
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Local storage helpers
const STORAGE_KEY = 'certificates';

const saveCertificates = (certificates) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
};

const loadCertificates = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getCertificatesByEmail = (email) => {
  const certificates = loadCertificates();
  return certificates.filter(cert => cert.email.toLowerCase() === email.toLowerCase());
};

const getCertificateById = (id) => {
  const certificates = loadCertificates();
  return certificates.find(cert => cert.id === id);
};

export default function CertificateGenerator() {
  const [certificateData, setCertificateData] = useState({
    recipientName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
    instructorName: '',
    organization: '',
    email: ''
  });
  
  const [generatedCertificates, setGeneratedCertificates] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const certificateRef = useRef(null);

  // Check URL for verification on component mount
  useEffect(() => {
    const path = window.location.pathname;
    const verifyMatch = path.match(/\/verify\/(.+)/);
    if (verifyMatch) {
      const certId = verifyMatch[1];
      handleVerification(certId);
    }
  }, []);

  // Handle certificate verification
  const handleVerification = (certId) => {
    try {
      const certificate = getCertificateById(certId);
      if (certificate && !certificate.isRevoked) {
        setCurrentCertificate(certificate);
        setShowVerification(true);
        setShowPreview(false);
        setError('');
      } else {
        setError("This certificate has been revoked or is invalid");
        setShowVerification(false);
      }
    } catch (err) {
      setError('Failed to verify certificate: ' + err.message);
      setShowVerification(false);
    }
  };

  // Load certificates by email
  const loadCertificatesByEmail = (email) => {
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const certificates = getCertificatesByEmail(email);
      setGeneratedCertificates(certificates);
      
      if (certificates.length === 0) {
        setError('No certificates found for this email address');
      }
    } catch (err) {
      setError('Failed to load certificates: ' + err.message);
      setGeneratedCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData({
      ...certificateData,
      [name]: value
    });
  };

  // Generate certificate
  const generateCertificate = (e) => {
    if (e) e.preventDefault();
    
    if (!certificateData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    // if (!certificateData.recipientName.trim()) {
    //   setError('Recipient name is required');
    //   return;
    // }
    
    if (!certificateData.courseName.trim()) {
      setError('Course/Achievement name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const newCertificate = {
        ...certificateData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        isRevoked: false
      };
      
      // Save to local storage
      const allCertificates = loadCertificates();
      allCertificates.push(newCertificate);
      saveCertificates(allCertificates);
      
      setGeneratedCertificates([...generatedCertificates, newCertificate]);
      setCurrentCertificate(newCertificate);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to create certificate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download certificate as image
  // const downloadCertificate = () => {
    // Create a canvas element to render the certificate
    // const certificateElement = certificateRef.current;
    
    // if (!certificateElement) {
      // setError('Certificate element not found');
      // return;
    // }
    
    // For now, show an alert. In a real implementation, you would use html2canvas
    // alert("To implement actual download, you would need to install html2canvas library and use it to convert the certificate to an image");
  // };
  // const downloadCertificate = () => {
  // const downloadCertificate = async () => {
     const downloadAsImage = async () => {
    setLoading(true);
    
    try {
      const certificate = certificateRef.current;
      const canvas = await html2canvas(certificate, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: certificate.offsetWidth,
        height: certificate.offsetHeight
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate_${currentCertificate.recipientName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    setLoading(true);
    
    try {
      const certificate = certificateRef.current;
      const canvas = await html2canvas(certificate, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        width: certificate.offsetWidth,
        height: certificate.offsetHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const scale = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      const scaledWidth = (imgWidth * 0.264583) * scale;
      const scaledHeight = (imgHeight * 0.264583) * scale;
      
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      const fileName = `certificate_${currentCertificate.recipientName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Generate verification URL
  const getVerificationUrl = (id) => {
    return `${window.location.origin}/verify/${id}`;
  };

  // View a previously generated certificate
  const viewCertificate = (certificate) => {
    try {
      // Check if certificate exists and is valid
      const storedCertificate = getCertificateById(certificate.id);
      if (storedCertificate && !storedCertificate.isRevoked) {
        setCurrentCertificate(storedCertificate);
        setShowPreview(true);
        setError('');
      } else {
        setError("This certificate has been revoked or is invalid");
      }
    } catch (err) {
      setError('Failed to verify certificate: ' + err.message);
    }
  };

  // Reset form to create new certificate
  const createNew = () => {
    setShowPreview(false);
    setShowVerification(false);
    setCurrentCertificate(null);
    setError('');
    // Update URL to home
    window.history.pushState({}, '', '/');
    setCertificateData({
      recipientName: '',
      courseName: '',
      issueDate: new Date().toISOString().split('T')[0],
      instructorName: '',
      organization: '',
      email: ''
    });
  };

  // Go back to main page from verification
  // const goBackToMain = () => {
  //   setShowVerification(false);
  //   setShowPreview(false);
  //   setCurrentCertificate(null);
  //   setError('');
  //   window.history.pushState({}, '', '/');
  // };

  // Manual verification by ID
  const verifyById = () => {
    if (!verificationId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }
    handleVerification(verificationId);
  };

  // Clear all certificates (for testing)
  const clearAllCertificates = () => {
    if (window.confirm('Are you sure you want to delete all certificates? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setGeneratedCertificates([]);
      setError('');
    }
  };

  return (
    <div className="app-container">

    
      <div className="main-content">
        {/* Verification Page */}
        {showVerification ? (
          <div className="verification-page">
            <div className="verification-header">
              <div className="verification-icon">
                <CheckCircle className="check-icon" />
              </div>
              <h1 className="verification-title">Certificate Verified!</h1>
              <div className="verified-by">
                <Shield className="shield-icon" />
                Verified by Gen-Z Accountants
              </div>
            </div>

            <div className="certificate-details">
              <h2 className="details-title">Certificate Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <User className="detail-icon" />
                  <div>
                    <p className="detail-label">Recipient</p>
                    <p className="detail-value">{currentCertificate.recipientName}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Award className="detail-icon" />
                  <div>
                    <p className="detail-label">Achievement</p>
                    <p className="detail-value">Volunteering Certificate of Participation</p>
                    {certificateData.courseName && (
                      <p className="detail-value">{currentCertificate.courseName}</p>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar className="detail-icon" />
                  <div>
                    <p className="detail-label">Issue Date</p>
                    <p className="detail-value">{formatDate(currentCertificate.issueDate)}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Mail className="detail-icon" />
                  <div>
                    <p className="detail-label">Recipient Email</p>
                    <p className="detail-value">{currentCertificate.email}</p>
                  </div>
                </div>
              </div>
              
              {currentCertificate.instructorName && (
                <div className="instructor-info">
                  <p className="detail-label">Issued by</p>
                  <p className="detail-value">GENERATION-Z YOUTH CAREER DEVELOPMENT FOUNDATION</p>
                  {/* {currentCertificate.organization && (
                    <p className="organization-name">{currentCertificate.organization}</p>
                  )} */}
                </div>
              )}
            </div>

            <div className="verification-badge">
              <p className="badge-text">✓ This certificate is authentic and has been verified</p>
              <p className="badge-id">Certificate ID: {currentCertificate.id}</p>
            </div>

            {/* <div className="verification-actions">
              <button onClick={goBackToMain} className="btn btn-primary">
                Back to Main Page
              </button>
              <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
                View Certificate
              </button>
            </div> */}
          </div>
        ) : (
          <>
            <header className="header">
              <h1 className="main-title">Certificate Generator</h1>
              <p className="subtitle">Create and manage certificates locally</p>
            </header>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Loading...</div>}

            {!showPreview ? (
              <div className="form-container">
                <div className="verification-section">
                  <h3 className="section-title">Verify Certificate</h3>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Enter certificate ID to verify"
                      value={verificationId}
                      onChange={(e) => setVerificationId(e.target.value)}
                      className="input-field"
                    />
                    <button onClick={verifyById} className="btn btn-verify">
                      <Shield size={16} /> Verify
                    </button>
                  </div>
                </div>

                <div className="search-section">
                  <h3 className="section-title">Search Certificates</h3>
                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="Search certificates by email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="input-field"
                    />
                    <button onClick={() => loadCertificatesByEmail(searchEmail)} className="btn btn-search">
                      <Search size={16} /> Search
                    </button>
                  </div>
                </div>

                <div className="create-section">
                  <h3 className="section-title">Create New Certificate</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">Recipient Name *</label>
                      <input
                        type="text"
                        name="recipientName"
                        value={certificateData.recipientName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Recipient Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={certificateData.email}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Course/Achievement Name *</label>
                      <input
                        type="text"
                        name="courseName"
                        value={certificateData.courseName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">Issue Date</label>
                      <input
                        type="date"
                        name="issueDate"
                        value={certificateData.issueDate}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>

                    {/* <div className="form-field">
                      <label className="field-label">Instructor/Issuer Name</label>
                      <input
                        type="text"
                        name="instructorName"
                        value={certificateData.instructorName}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div> */}

                    {/* <div className="form-field">
                      <label className="field-label">Organization</label>
                      <input
                        type="text"
                        name="organization"
                        value={certificateData.organization}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div> */}
                  </div>

                  <div className="form-actions">
                    <button onClick={generateCertificate} className="btn btn-generate" disabled={loading}>
                      Generate Certificate
                    </button>
                    <button onClick={clearAllCertificates} className="btn btn-danger">
                      Clear All Certificates
                    </button>
                  </div>
                </div>

                {generatedCertificates.length > 0 && (
                  <div className="certificates-list">
                    <h3 className="section-title">Available Certificates</h3>
                    <div className="certificates-grid">
                      {generatedCertificates.map((cert) => (
                        <div key={cert.id} onClick={() => viewCertificate(cert)} className="certificate-item">
                          <div className="certificate-info">
                            <div className="certificate-name">{cert.recipientName} - {cert.courseName}</div>
                            <div className="certificate-meta">
                              Issued: {formatDate(cert.issueDate)} | ID: {cert.id}
                            </div>
                          </div>
                          {cert.isRevoked && <span className="revoked-badge">Revoked</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-container">
                <div ref={certificateRef} className="certificate">
                    <img src={WaterMark} alt="Watermark" className="watermark" />
                  <div className="certificate-header">
                    {/* <h2 className="organization-name">
                      {currentCertificate.organization || 'Professional Development Institute'}
                    </h2> */}
                    <div className="certificate-type">GENERATION-Z YOUTH CAREER DEVELOPMENT FOUNDATION</div>
                   
                  </div>
                  
                  <div className="certificate-body">
                    {/* <p className="certificate-intro">This is to certify that</p> */}
                    <h2 className="recipient-name">{currentCertificate.recipientName}</h2>
                     <div className="certificate-divider"></div>
                    <p className="achievement-intro">Volunteering Certificate of Participation in</p>
                    <h3 className="course-name">{currentCertificate.courseName}</h3>
                    <p className="issue-date">
                       <img src={Sign} alt="Signature" className="signature-image" />
                      <div className="signature-line"></div>
                       <p className="instructor-title">CHAIRMAN/TRUSTEES</p>
                    </p>
                    
                    <div className="certificate-footer">                      
                      <div className="qr-section">
                        <div className="qr-code">
                          <QRCodeSVG 
                            value={getVerificationUrl(currentCertificate.id)}
                            size={80}
                            level="H"
                          />
                        </div>
                        <p className="qr-text">Scan to verify</p>
                        <p className="qr-id">ID: {currentCertificate.id}</p>
                      </div>
                      <div className="footer-logo">
                        <img src={FooterLogo} alt="Gen-Z Accountants Logo" className="footer-logo-image" />
                      </div>

                      {/* footer-tex */}
                      <div className="footer-text" style={{ color: '#333' }}>
                        <p>{formatDate(currentCertificate.issueDate)}</p>
                        <div className="signature-line"></div>
                         <p className="instructor-title">DATE</p>
                        {/* <p className="footer-note">This certificate is valid and has been verified by Gen-Z Accountants</p> */}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="preview-actions">
                  <button onClick={downloadAsPDF} className="btn btn-download" disabled={loading}>
                    <Download size={16} /> Download Certificate as pdf
                  </button>
                  <button onClick={downloadAsImage} className="btn btn-download" disabled={loading}>
                    <Download size={16} /> Download Certificate as image
                  </button>
                  <button onClick={createNew} className="btn btn-secondary" disabled={loading}>
                    Create New Certificate
                  </button>
                </div>
                {loading && (
                  <div className="mt-4 text-gray-600 italic">
                    Generating download...
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
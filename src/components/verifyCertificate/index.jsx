// VerifyCertificate.js
import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import './style.css';

const API_URL = 'http://localhost:5000/api';

function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract certificate ID from URL if present
  React.useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'verify') {
      const id = pathParts[2];
      setCertificateId(id);
      if (id) {
        verifyCertificate(id);
      }
    }
  }, []);

  const verifyCertificate = async (id) => {
    const idToVerify = id || certificateId;
    if (!idToVerify.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await axios.get(`${API_URL}/certificates/verify/${idToVerify}`);
      setVerificationResult(response.data);
    } catch (err) {
      setError('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <h1>Certificate Verification</h1>
      
      <div className="verify-form">
        <div className="verify-input-group">
          <input
            type="text"
            placeholder="Enter certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
          />
          <button 
            onClick={() => verifyCertificate()} 
            disabled={loading}
          >
            Verify
          </button>
        </div>
        
        {error && <div className="verify-error">{error}</div>}
        {loading && <div className="verify-loading">Verifying certificate...</div>}
        
        {verificationResult && (
          <div className={`verify-result ${verificationResult.valid ? 'valid' : 'invalid'}`}>
            {verificationResult.valid ? (
              <div className="valid-certificate">
                <div className="result-header">
                  <CheckCircle size={24} />
                  <h2>Certificate is Valid</h2>
                </div>
                
                <div className="certificate-details">
                  <h3>Certificate Details</h3>
                  <div className="detail-row">
                    <span>Recipient:</span>
                    <span>{verificationResult.certificate.recipientName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Course:</span>
                    <span>{verificationResult.certificate.courseName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Issue Date:</span>
                    <span>{new Date(verificationResult.certificate.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Instructor:</span>
                    <span>{verificationResult.certificate.instructorName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Organization:</span>
                    <span>{verificationResult.certificate.organization}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="invalid-certificate">
                <div className="result-header">
                  <XCircle size={24} />
                  <h2>Certificate is Invalid</h2>
                </div>
                <p>{verificationResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificate;
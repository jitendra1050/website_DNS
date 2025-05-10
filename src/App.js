import React, { useState } from 'react';
import './App.css';
import { FaGlobe } from 'react-icons/fa';

function App() {
  const [domain, setDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDnsRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=ANY`);
      const data = await response.json();
      if (data.Status === 0) {
        setDnsRecords(data.Answer || []);
      } else {
        setError('Failed to fetch DNS records.');
      }
    } catch (err) {
      setError('An error occurred while fetching DNS records.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDomain(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain) {
      fetchDnsRecords();
    } else {
      setError('Please enter a valid domain name.');
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-brand">DNS Lookup</div>
        <ul className="navbar-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
      <header className="App-header">
        <h1>DNS Lookup Tool</h1>
        <p>DNS (Domain Name System) is the phonebook of the internet, translating domain names to IP addresses. The `nslookup` tool is used to query DNS records and troubleshoot DNS issues.</p>
      </header>
      <div className="hero">
        <h2>Your DNS Records, Simplified</h2>
        <p>Quickly fetch and view DNS records for any domain with ease.</p>
        <button className="cta-button">Get Started</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={domain}
          onChange={handleInputChange}
          placeholder="Enter domain name"
        />
        <button type="submit">Fetch DNS Records</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <DnsRecordsTable records={dnsRecords} />
    </div>
  );
}

function DnsRecordsTable({ records }) {
  if (records.length === 0) return <p>No records found.</p>;

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.type]) {
      acc[record.type] = [];
    }
    acc[record.type].push(record);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedRecords).map((type) => (
        <div key={type} className="record-group">
          <h2>{type} Records</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>TTL (Time to Live)</th>
                <th>Data/Content</th>
              </tr>
            </thead>
            <tbody>
              {groupedRecords[type].map((record, index) => (
                <tr key={index}>
                  <td><FaGlobe /> {record.type}</td>
                  <td>{record.name}</td>
                  <td>{record.TTL}</td>
                  <td>{record.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default App;

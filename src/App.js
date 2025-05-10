import React, { useState } from 'react';
import './App.css';
import { FaGlobe } from 'react-icons/fa';

const DNS_RECORD_TYPES = {
  'A': 'IPv4 Address Record - Maps a domain name to an IPv4 address',
  'AAAA': 'IPv6 Address Record - Maps a domain name to an IPv6 address',
  'MX': 'Mail Exchange Record - Specifies mail servers responsible for receiving email',
  'CNAME': 'Canonical Name Record - Creates an alias from one domain to another',
  'TXT': 'Text Record - Holds text information, often used for verification',
  'NS': 'Name Server Record - Delegates a domain to specific DNS servers',
  'SOA': 'Start of Authority - Contains administrative information about the zone',
  'PTR': 'Pointer Record - Maps an IP address to a domain name (reverse DNS)',
  'SRV': 'Service Record - Specifies location of servers for specific services',
  'CAA': 'Certificate Authority Authorization - Specifies which CAs can issue certificates'
};

const DNS_TYPE_MAP = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA'
};

function formatDnsData(record) {
  switch(record.type) {
    case 'MX':
      const [priority, server] = record.data.split(' ');
      return `Priority: ${priority}, Server: ${server}`;
    case 'SOA':
      const [primary, responsible, serial, refresh, retry, expire, minimum] = record.data.split(' ');
      return `Primary NS: ${primary}\nAdmin: ${responsible}\nSerial: ${serial}\nRefresh: ${refresh}s\nRetry: ${retry}s\nExpire: ${expire}s\nMinimum TTL: ${minimum}s`;
    case 'TXT':
      return record.data.replace(/"/g, '');
    default:
      return record.data;
  }
}

function formatTTL(ttl) {
  const days = Math.floor(ttl / 86400);
  const hours = Math.floor((ttl % 86400) / 3600);
  const minutes = Math.floor((ttl % 3600) / 60);
  const seconds = ttl % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function App() {
  const [domain, setDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const fetchDnsRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=ANY`);
      const data = await response.json();
      setApiResponse(data);
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
      
      {apiResponse && (
        <div className="api-response">
          <h3>API Response</h3>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function DnsRecordsTable({ records }) {
  if (records.length === 0) return <p>No records found.</p>;

  const groupedRecords = records.reduce((acc, record) => {
    const recordType = DNS_TYPE_MAP[record.type] || record.type.toString();
    if (!acc[recordType]) {
      acc[recordType] = [];
    }
    acc[recordType].push({...record, type: recordType});
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedRecords).map((type) => (
        <div key={type} className="record-group">
          <h2>{type} Records</h2>
          <p className="record-description">{DNS_RECORD_TYPES[type] || `${type} Record`}</p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>TTL</th>
                <th>Data/Content</th>
              </tr>
            </thead>
            <tbody>
              {groupedRecords[type].map((record, index) => (
                <tr key={index}>
                  <td><FaGlobe /> {record.type}</td>
                  <td>{record.name}</td>
                  <td title={`${record.TTL} seconds`}>{formatTTL(record.TTL)}</td>
                  <td className="data-cell">{formatDnsData(record)}</td>
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import './UserManagement.scss';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>User Management</h1>
            <p style={{ margin: '5px 0 0', color: 'rgba(44, 62, 80, 0.6)', fontWeight: 600 }}>Manage students, teachers, and administrators.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn-squishy" onClick={() => window.location.href='http://localhost:5000/api/users/export'} style={{ background: 'var(--navy)' }}>
              Export CSV
            </button>
            <button className="btn-squishy">
              Add New User
            </button>
          </div>
        </div>

        <div className="user-management-controls">
          <input 
            type="text" 
            className="search-input"
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
            <MascotChamp size={100} className="loading-spin" />
            <p style={{ marginTop: '20px', fontWeight: 700, color: 'var(--navy)' }}>Fetching user records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
            <MascotChamp size={120} />
            <h3 style={{ marginTop: '20px' }}>No users found</h3>
            <p style={{ color: 'rgba(44, 62, 80, 0.6)' }}>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="glass-card-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{user.studentId || user.id}</td>
                    <td style={{ fontWeight: 700 }}>{user.name}</td>
                    <td style={{ color: 'rgba(44, 62, 80, 0.7)' }}>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.phoneNumber || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-link edit">Edit</button>
                      <button className="action-link delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;

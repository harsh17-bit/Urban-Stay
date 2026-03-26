/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiHeart,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiHome,
  FiEye,
  FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/authcontext.jsx';
import { inquiryService, alertService } from '../services/dataservice';
import { getImageUrl } from '../utils/imageUtils';
import PropertyCard from '../components/propertycard';
import PaymentToast from '../components/PaymentToast.jsx';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  // Derive favorites directly from user object — updates instantly when toggleFavorite runs
  const favorites = user?.favorites || [];
  const [inquiries, setInquiries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    role: user?.role || 'user',
  });
  const [wishlistToast, setWishlistToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  async function fetchData() {
    try {
      const [inquiriesRes, alertsRes] = await Promise.all([
        inquiryService.getSent(),
        alertService.getAll(),
      ]);
      setInquiries(inquiriesRes.inquiries || []);
      setAlerts(alertsRes.alerts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const showWishlistToast = (type, message) => {
    setWishlistToast({ show: false, type, message: '' });
    setTimeout(() => {
      setWishlistToast({ show: true, type, message });
    }, 0);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const stats = [
    {
      icon: FiHeart,
      label: 'Saved Properties',
      value: favorites.length,
      color: '#ef4444',
    },
    {
      icon: FiMessageSquare,
      label: 'Inquiries Sent',
      value: inquiries.length,
      color: '#3b82f6',
    },
    {
      icon: FiBell,
      label: 'Active Alerts',
      value: alerts.filter((a) => a.isActive).length,
      color: '#f59e0b',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'favorites', label: 'Favorites', icon: FiHeart },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: FiMessageSquare,
      badge: inquiries.filter((i) => i.status === 'responded').length || null,
    },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ];

  return (
    <div className="dashboard-page">
      <PaymentToast
        show={wishlistToast.show}
        type={wishlistToast.type}
        message={wishlistToast.message}
        duration={2500}
        onClose={() => setWishlistToast((prev) => ({ ...prev, show: false }))}
      />
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            {user?.isVerified && (
              <span className="profile-verified-badge">
                <FiCheckCircle /> Verified Profile
              </span>
            )}
            <span className="user-badge">{user?.role}</span>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="nav-badge">{tab.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard-content">
              <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="subtitle">
                Here's what's happening with your property search
              </p>

              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Recent Inquiries</h2>
                  <button onClick={() => setActiveTab('inquiries')}>
                    View All
                  </button>
                </div>
                {inquiries.length > 0 ? (
                  <div className="inquiry-list">
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry._id} className="inquiry-card">
                        <div className="inquiry-property">
                          <img
                            src={getImageUrl(
                              inquiry.property?.images?.[0]?.url
                            )}
                            alt=""
                          />
                          <div>
                            <h4>{inquiry.property?.title}</h4>
                            <p>
                              <FiMapPin /> {inquiry.property?.location?.city}
                            </p>
                          </div>
                        </div>
                        <div className="inquiry-meta">
                          <span className={`status-badge ${inquiry.status}`}>
                            {inquiry.status}
                          </span>
                          {inquiry.status === 'responded' && (
                            <span className="new-reply-chip">New Reply</span>
                          )}
                          <span className="inquiry-date">
                            <FiCalendar />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiMessageSquare />
                    <p>No inquiries yet. Start exploring properties!</p>
                    <Link to="/properties" className="btn-primary">
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="dashboard-content">
              <h1>Saved Properties</h1>
              <p className="subtitle">Properties you've added to favorites</p>

              {favorites.length > 0 ? (
                <div className="properties-grid">
                  {favorites.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      onWishlistToast={showWishlistToast}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state large">
                  <FiHeart />
                  <h3>No saved properties</h3>
                  <p>Click the heart icon on any property to save it here</p>
                  <Link to="/properties" className="btn-primary">
                    Explore Properties
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <div className="dashboard-content">
              <h1>My Inquiries</h1>
              <p className="subtitle">Track all your property inquiries</p>

              {inquiries.length > 0 ? (
                <div className="inquiry-list full">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry._id} className="inquiry-card detailed">
                      <div className="inquiry-property">
                        <img
                          src={getImageUrl(inquiry.property?.images?.[0]?.url)}
                          alt=""
                        />
                        <div>
                          <h4>{inquiry.property?.title}</h4>
                          <p>
                            <FiMapPin /> {inquiry.property?.location?.city}
                          </p>
                          <p className="inquiry-message">{inquiry.message}</p>
                        </div>
                      </div>
                      <div className="inquiry-details">
                        <span className={`status-badge ${inquiry.status}`}>
                          {inquiry.status}
                        </span>
                        {inquiry.status === 'responded' &&
                          !inquiry.replyRead && (
                            <span className="new-reply-chip">New Reply</span>
                          )}
                        <div className="inquiry-responses">
                          {inquiry.responses?.length > 0 && (
                            <span>{inquiry.responses.length} response(s)</span>
                          )}
                        </div>
                        <span className="inquiry-date">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                        <Link
                          to={`/inquiry/${inquiry._id}`}
                          className="btn-outline"
                        >
                          <FiEye /> View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state large">
                  <FiMessageSquare />
                  <h3>No inquiries yet</h3>
                  <p>Contact property owners to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="dashboard-content">
              <div className="section-header">
                <div>
                  <h1>Profile Settings</h1>
                  <p className="subtitle">Manage your account information</p>
                </div>
                <button
                  className={`btn-outline ${editMode ? 'cancel' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    'Cancel'
                  ) : (
                    <>
                      <FiEdit2 /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="profile-section">
                  <div className="profile-avatar-section">
                    <div className="large-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    {editMode && (
                      <button type="button" className="btn-outline small">
                        Change Photo
                      </button>
                    )}
                  </div>

                  <div className="profile-fields">
                    <div className="form-group">
                      <label>
                        <FiUser /> Full Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p>{user?.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        <FiMail /> Email
                      </label>
                      <p>{user?.email}</p>
                    </div>

                    <div className="form-group">
                      <label>
                        <FiPhone /> Phone
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p>{user?.phone || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>
                        <FiHome /> You want to
                      </label>
                      {editMode ? (
                        <select
                          value={profileData.role}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="user">Buy / Rent Property</option>
                          <option value="seller">Sell / List Property</option>
                        </select>
                      ) : (
                        <p>
                          {(user?.role === 'seller') | 'buyer'
                            ? 'Sell / List Property'
                            : 'Buy / Rent Property'}
                        </p>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label>Bio</label>
                      {editMode ? (
                        <textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p>{user?.bio || 'No bio added'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {editMode && (
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                )}
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;

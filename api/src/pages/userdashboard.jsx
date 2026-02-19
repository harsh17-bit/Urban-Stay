/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiUser, FiHeart, FiMessageSquare, FiBell, FiSettings, FiEdit2,
    FiMapPin, FiPhone, FiMail, FiCalendar, FiHome, FiEye, FiTrash2
} from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";
import { inquiryService, alertService } from "../services/dataservice";
import { getImageUrl } from "../utils/imageUtils";
import PropertyCard from "../components/propertycard";
import "./Dashboard.css";

const UserDashboard = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [favorites, setFavorites] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        role: user?.role || "user",
    });

   
    async function fetchData() {
        try {
            const [inquiriesRes, alertsRes] = await Promise.all([
                inquiryService.getSent(),
                alertService.getAll(),
            ]);
            setInquiries(inquiriesRes.inquiries || []);
            setAlerts(alertsRes.alerts || []);
            setFavorites(user?.favorites || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // useEffect(() => {
    //     fetchData();
    // }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData);
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const stats = [
        { icon: FiHeart, label: "Saved Properties", value: favorites.length, color: "#ef4444" },
        { icon: FiMessageSquare, label: "Inquiries Sent", value: inquiries.length, color: "#3b82f6" },
        { icon: FiBell, label: "Active Alerts", value: alerts.filter(a => a.isActive).length, color: "#f59e0b" },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: FiHome },
        { id: "favorites", label: "Favorites", icon: FiHeart },
        { id: "inquiries", label: "Inquiries", icon: FiMessageSquare },
        { id: "alerts", label: "Alerts", icon: FiBell },
        { id: "profile", label: "Profile", icon: FiUser },
    ];

    return (
        <div className="dashboard-page">
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
                        <span className="user-badge">{user?.role}</span>
                    </div>

                    <nav className="sidebar-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    
                </aside>

                {/* Main Content */}
                <main className="dashboard-main">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="dashboard-content">
                            <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
                            <p className="subtitle">Here's what's happening with your property search</p>

                            <div className="stats-grid">
                                {stats.map((stat, index) => (
                                    <div key={index} className="stat-card">
                                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                                            <stat.icon />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-value">{stat.value}</span>
                                            <span className="stat-label">{stat.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="dashboard-section">
                                <div className="section-header">
                                    <h2>Recent Inquiries</h2>
                                    <button onClick={() => setActiveTab("inquiries")}>View All</button>
                                </div>
                                {inquiries.length > 0 ? (
                                    <div className="inquiry-list">
                                        {inquiries.slice(0, 3).map((inquiry) => (
                                            <div key={inquiry._id} className="inquiry-card">
                                                <div className="inquiry-property">
                                                    <img src={getImageUrl(inquiry.property?.images?.[0]?.url)} alt="" />
                                                    <div>
                                                        <h4>{inquiry.property?.title}</h4>
                                                        <p><FiMapPin /> {inquiry.property?.location?.city}</p>
                                                    </div>
                                                </div>
                                                <div className="inquiry-meta">
                                                    <span className={`status-badge ${inquiry.status}`}>{inquiry.status}</span>
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
                                        <Link to="/properties" className="btn-primary">Browse Properties</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Favorites Tab */}
                    {activeTab === "favorites" && (
                        <div className="dashboard-content">
                            <h1>Saved Properties</h1>
                            <p className="subtitle">Properties you've added to favorites</p>

                            {favorites.length > 0 ? (
                                <div className="properties-grid">
                                    {favorites.map((property) => (
                                        <PropertyCard key={property._id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state large">
                                    <FiHeart />
                                    <h3>No saved properties</h3>
                                    <p>Click the heart icon on any property to save it here</p>
                                    <Link to="/properties" className="btn-primary">Explore Properties</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inquiries Tab */}
                    {activeTab === "inquiries" && (
                        <div className="dashboard-content">
                            <h1>My Inquiries</h1>
                            <p className="subtitle">Track all your property inquiries</p>

                            {inquiries.length > 0 ? (
                                <div className="inquiry-list full">
                                    {inquiries.map((inquiry) => (
                                        <div key={inquiry._id} className="inquiry-card detailed">
                                            <div className="inquiry-property">
                                                <img src={getImageUrl(inquiry.property?.images?.[0]?.url)} alt="" />
                                                <div>
                                                    <h4>{inquiry.property?.title}</h4>
                                                    <p><FiMapPin /> {inquiry.property?.location?.city}</p>
                                                    <p className="inquiry-message">{inquiry.message}</p>
                                                </div>
                                            </div>
                                            <div className="inquiry-details">
                                                <span className={`status-badge ${inquiry.status}`}>{inquiry.status}</span>
                                                <div className="inquiry-responses">
                                                    {inquiry.responses?.length > 0 && (
                                                        <span>{inquiry.responses.length} response(s)</span>
                                                    )}
                                                </div>
                                                <span className="inquiry-date">
                                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                                </span>
                                                <Link to={`/inquiry/${inquiry._id}`} className="btn-outline">
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

                    {/* Alerts Tab */}
                    {activeTab === "alerts" && (
                        <div className="dashboard-content">
                            <h1>Property Alerts</h1>
                            <p className="subtitle">Get notified when new properties match your criteria</p>

                            <button className="btn-primary add-alert-btn">
                                <FiBell /> Create New Alert
                            </button>

                            {alerts.length > 0 ? (
                                <div className="alerts-list">
                                    {alerts.map((alert) => (
                                        <div key={alert._id} className={`alert-card ${!alert.isActive ? "inactive" : ""}`}>
                                            <div className="alert-info">
                                                <h4>{alert.name}</h4>
                                                <div className="alert-criteria">
                                                    {alert.criteria?.cities?.length > 0 && (
                                                        <span><FiMapPin /> {alert.criteria.cities.join(", ")}</span>
                                                    )}
                                                    {alert.criteria?.listingType && (
                                                        <span>For {alert.criteria.listingType}</span>
                                                    )}
                                                    {alert.criteria?.propertyTypes?.length > 0 && (
                                                        <span>{alert.criteria.propertyTypes.join(", ")}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="alert-actions">
                                                <span className={`frequency-badge ${alert.frequency}`}>
                                                    {alert.frequency}
                                                </span>
                                                <button className="btn-icon" title="Edit">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="btn-icon delete" title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiBell />
                                    <p>Set up alerts to never miss your dream property</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <div className="dashboard-content">
                            <div className="section-header">
                                <div>
                                    <h1>Profile Settings</h1>
                                    <p className="subtitle">Manage your account information</p>
                                </div>
                                <button
                                    className={`btn-outline ${editMode ? "cancel" : ""}`}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? "Cancel" : <><FiEdit2 /> Edit Profile</>}
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
                                            <label><FiUser /> Full Name</label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                />
                                            ) : (
                                                <p>{user?.name}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label><FiMail /> Email</label>
                                            <p>{user?.email}</p>
                                        </div>

                                        <div className="form-group">
                                            <label><FiPhone /> Phone</label>
                                            {editMode ? (
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                />
                                            ) : (
                                                <p>{user?.phone || "Not provided"}</p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label><FiHome /> You want to</label>
                                            {editMode ? (
                                                <select
                                                    value={profileData.role}
                                                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                                                >
                                                    <option value="user">Buy / Rent Property</option>
                                                    <option value="seller">Sell / List Property</option>
                                                </select>
                                            ) : (
                                                <p>
                                                    {user?.role === "seller"
                                                        ? "Sell / List Property"
                                                        : "Buy / Rent Property"}
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Bio</label>
                                            {editMode ? (
                                                <textarea
                                                    value={profileData.bio}
                                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                    rows={3}
                                                    placeholder="Tell us about yourself..."
                                                />
                                            ) : (
                                                <p>{user?.bio || "No bio added"}</p>
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

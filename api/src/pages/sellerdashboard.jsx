import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiHome, FiPlus, FiMessageSquare, FiBarChart2, FiSettings,
    FiEdit2, FiTrash2, FiEye, FiTrendingUp, FiUsers, FiDollarSign, FiCheck, FiX, FiStar,
    FiMail, FiPhone, FiUser, FiFileText, FiDownload
} from "react-icons/fi";
import FeaturedUpgradeModal from "../components/FeaturedUpgradeModal.jsx";
import { useAuth } from "../context/authcontext.jsx";
import { propertyService } from "../services/propertyservice";
import { inquiryService, paymentService } from "../services/dataservice";
import { getImageUrl } from "../utils/imageUtils";
import "./Dashboard.css";

const SellerDashboard = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [properties, setProperties] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [, setStats] = useState(null);
    const [, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [inquiryError, setInquiryError] = useState(null);
    
    const [featuredProperty, setFeaturedProperty] = useState(null);
    const [payments, setPayments] = useState([]);
    const [invoiceItem, setInvoiceItem] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        role: user?.role || "user",
    });
    useEffect(() => {
        fetchData();
    }, []);
const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData);
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };
    const handleFeatureSuccess = (updatedProp) => {
        setProperties((prev) =>
            prev.map((p) => (p._id === updatedProp._id ? { ...p, ...updatedProp } : p))
        );
    };

    // Returns true only if the property is currently featured AND the period has not expired
    const isFeaturedActive = (property) =>
        property.isFeatured &&
        property.featuredUntil &&
        new Date(property.featuredUntil) > new Date();

    const featuredLabel = (property) =>
        isFeaturedActive(property)
            ? `Featured until ${new Date(property.featuredUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
            : "Feature this listing — ₹499 / 30 days";

    const fetchData = async () => {
        setLoading(true);
        setInquiryError(null);
        try {
            const propertiesRes = await propertyService.getMyProperties();
            setProperties(propertiesRes.properties || []);
            setStats(propertiesRes.stats || []);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
        try {
            const inquiriesRes = await inquiryService.getReceived();
            setInquiries(inquiriesRes.inquiries || []);
        } catch (error) {
            console.error("Error fetching inquiries:", error?.response?.data || error.message);
            setInquiryError(error?.response?.data?.message || "Failed to load inquiries. Please try again.");
        }
        try {
            const paymentsRes = await paymentService.getMy();
            setPayments(paymentsRes.payments || []);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
        setLoading(false);
    };

    const handleDeleteProperty = async (id) => {
        if (window.confirm("Are you sure you want to delete this property?")) {
            try {
                await propertyService.deleteProperty(id);
                setProperties(properties.filter(p => p._id !== id));
            } catch (error) {
                console.error("Error deleting property:", error);
            }
        }
    };
    const handleStatusChange = async (id, newStatus) => {
        try {
            await propertyService.updateProperty(id, { status: newStatus });
            setProperties(properties.map(p => p._id === id ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleOpenReply = (inquiry) => {
        setRespondingTo(inquiry);
        setReplyMessage("");
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setActionLoading(true);
        try {
            await inquiryService.respond(respondingTo._id, replyMessage);

            // Update local state
            setInquiries(inquiries.map(iq =>
                iq._id === respondingTo._id
                    ? { ...iq, status: "responded" }
                    : iq
            ));

            // Close modal and show success (using simple alert for now as requested)
            setRespondingTo(null);
            alert("Response sent successfully!");
        } catch (error) {
            console.error("Error sending reply:", error);
            alert("Failed to send response. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalInquiries = inquiries.length;
    const activeListings = properties.filter(p => p.status === "available").length;

    const tabs = [
        { id: "overview",   label: "Overview",      icon: FiBarChart2 },
        { id: "properties", label: "My Properties",  icon: FiHome },
        { id: "inquiries",  label: "Inquiries",      icon: FiMessageSquare },
        { id: "analytics",  label: "Analytics",      icon: FiTrendingUp },
        { id: "payments",   label: "Payments",       icon: FiDollarSign },
        { id: "profile",    label: "Profile",        icon: FiUser },
    ];

    return (
        <div className="dashboard-page seller-dashboard">
            <div className="dashboard-container">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <div className="sidebar-header">
                        <div className="user-avatar seller">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                        </div>
                        <h3>{user?.name}</h3>
                        <p>{user?.companyName || "Property Seller"}</p>
                        <span className="user-badge seller">Seller</span>
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
                            <h1>Seller Dashboard</h1>
                            <p className="subtitle">Manage your properties and track performance</p>

                            <div className="stats-grid seller-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                       <svg width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="a"><path d="m148.09 165H651.9v470H148.09z"/></clipPath></defs><g clipPath="url(#a)"><path d="m400.85 165.06L651.9 429.69h-79.727L551.818 562c-5.0898 39.016-25.445 72.941-59.371 72.941h-184.9c-32.23.0-54.281-33.926-59.371-72.941l-20.355-132.31h-79.727l252.75-264.63zm0 54.281-166.24 173.03h25.445l25.445 164.54c0 8.4805 8.4805 40.711 22.051 40.711h184.9c13.57.0 22.051-32.23 23.75-40.711l23.75-164.54h25.445l-164.54-173.03z" fillRule="evenodd"/></g><path d="m506.02 200.68h50.891v110.26l-50.891-50.891z" fillRule="evenodd"/></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{properties.length}</span>
                                        <span className="stat-label">Total Properties</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" >
                                        <svg width="800" height="800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.38 12l2.41 2.42 4.83-4.84004" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.75 2.44995c.69-.59 1.82-.59 2.52.0l1.58 1.36C15.15 4.06995 15.71 4.27995 16.11 4.27995h1.7c1.06.0 1.93.869999999999999 1.93 1.93v1.7C19.74 8.29995 19.95 8.86995 20.21 9.16995l1.36 1.57995c.59.69.59 1.82.0 2.52l-1.36 1.58C19.95 15.1499 19.74 15.7099 19.74 16.1099v1.7c0 1.06-.869999999999997 1.93-1.93 1.93h-1.7C15.72 19.7399 15.15 19.9499 14.85 20.2099l-1.58 1.36c-.69.59-1.82.59-2.52.0l-1.58-1.36C8.87 19.9499 8.31 19.7399 7.91 19.7399H6.18C5.12 19.7399 4.25 18.8699 4.25 17.8099v-1.71C4.25 15.7099 4.04 15.1499 3.79 14.8499l-1.35-1.59c-.58-.69-.58-1.81.0-2.5L3.79 9.16995C4.04 8.86995 4.25 8.30995 4.25 7.91995v-1.72c0-1.06.87-1.93 1.93-1.93H7.91C8.3 4.26995 8.87 4.05995 9.17 3.79995l1.58-1.35z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{activeListings}</span>
                                        <span className="stat-label">Active Listings</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" >
                                        <svg width="800" height="800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.864 7.37071c.7698 1.47399 1.1598 3.11669 1.1349 4.77939C13.9739 13.8128 13.5347 15.4431 12.721 16.8933L4 12l8.864-4.62929z" fill="#2A4157" fillOpacity=".24"/><path d="M14.5 5.5c-2.7811 3.70812-9.85912 6.1272-10.87726 6.4605C3.57878 11.9748 3.57584 12.0335 3.61809 12.0523 4.61914 12.4983 11.7146 15.7146 14.5 18.5" stroke="#222" strokeLinecap="round"/><path fillRule="evenodd" clipRule="evenodd" d="M13.5498 9.03334C13.862 10.0385 14.0148 11.0902 13.9989 12.1501 13.9845 13.1091 13.8323 14.0572 13.5499 14.9663 12.1066 14.7491 11 13.5037 11 11.9998s1.1065-2.74926 2.5498-2.96646z" fill="#222"/><path d="M16.5 12h4" stroke="#2A4157" strokeOpacity=".24" strokeLinecap="round"/><path d="M16.5 9.5l4-1.5" stroke="#2A4157" strokeOpacity=".24" strokeLinecap="round"/><path d="M16.5 14.5l4 1.5" stroke="#2A4157" strokeOpacity=".24" strokeLinecap="round"/></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{totalViews}</span>
                                        <span className="stat-label">Total Views</span>s
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"   >
                                        <svg fill="#000" width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m187.45 228.7c-5.1914.48828-9.1523 4.8594-9.1289 10.078v231.75c-.039063 2.6992 1.0039 5.2969 2.8984 7.2188 1.8945 1.9219 4.4805 3 7.1758 3 2.6992.0 5.2812-1.0781 7.1758-3s2.9375-4.5195 2.9023-7.2188v-221.68h413.12c2.6992.039062 5.2969-1.0078 7.2188-2.8984 1.9219-1.8945 3-4.4805 3-7.1758.0-2.6992-1.0781-5.2852-3-7.1758-1.9219-1.8945-4.5195-2.9414-7.2188-2.9023h-423.2c-.31641-.015625-.62891-.015625-.94531.0zm423.04 40.148c-5.1914.57031-9.0859 5.0117-8.9727 10.234v221.68h-292.21c-2.0898.007812-4.125.66797-5.8242 1.8867l-54.633 39.047v-30.859c0-5.5625-4.5117-10.074-10.074-10.074h-50.383c-2.6953-.039063-5.2969 1.0039-7.2188 2.8984-1.918 1.8945-3 4.4805-3 7.1758.0 2.6992 1.082 5.2812 3 7.1758 1.9219 1.8945 4.5234 2.9375 7.2188 2.9023h40.305v40.305c.015625 3.7578 2.1211 7.1992 5.4648 8.9219s7.3672 1.4375 10.438-.73438l67.855-48.492h299.14c5.5664.0 10.078-4.5117 10.078-10.078v-231.75c.042969-2.7305-1.0234-5.3555-2.9531-7.2852-1.9258-1.9297-4.5547-2.9922-7.2812-2.9492-.31641-.015624-.62891-.015624-.94531.0zm-336.45 60.613c-24.922.0-45.344 20.422-45.344 45.344s20.422 45.344 45.344 45.344 45.344-20.422 45.344-45.344-20.422-45.344-45.344-45.344zm125.95.0c-24.926.0-45.344 20.422-45.344 45.344s20.418 45.344 45.344 45.344c24.922.0 45.34-20.422 45.34-45.344s-20.418-45.344-45.34-45.344zm125.95.0c-24.922.0-45.34 20.422-45.34 45.344s20.418 45.344 45.34 45.344c24.926.0 45.344-20.422 45.344-45.344s-20.418-45.344-45.344-45.344zm-254.42 20.152c.85156-.085938 1.6406.0 2.5195.0 14.031.0 25.191 11.16 25.191 25.191s-11.16 25.191-25.191 25.191-25.191-11.16-25.191-25.191c0-13.156 9.8789-23.906 22.672-25.191zm125.95.0c.85156-.085938 1.6406.0 2.5195.0 14.031.0 25.188 11.16 25.188 25.191s-11.156 25.191-25.188 25.191-25.191-11.16-25.191-25.191c0-13.156 9.875-23.906 22.672-25.191zm125.95.0c.85156-.085938 1.6406.0 2.5156.0 14.035.0 25.191 11.16 25.191 25.191s-11.156 25.191-25.191 25.191c-14.031.0-25.188-11.16-25.188-25.191.0-13.156 9.875-23.906 22.672-25.191z"/></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{totalInquiries}</span>
                                        <span className="stat-label">Inquiries</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Inquiries */}
                            <div className="dashboard-section">
                                <div className="section-header">
                                    <h2>New Inquiries</h2>
                                    <button onClick={() => setActiveTab("inquiries")}>View All</button>
                                </div>
                                {inquiries.filter(i => i.status !== 'responded').length > 0 ? (
                                    <div className="inquiry-list">
                                        {inquiries.filter(i => i.status !== 'responded').slice(0, 5).map((inquiry) => (
                                            <div key={inquiry._id} className="inquiry-card">
                                                <div className="inquiry-property">
                                                    <img src={getImageUrl(inquiry.property?.images?.[0]?.url)} alt="" />
                                                    <div>
                                                        <h4>{inquiry.property?.title}</h4>
                                                        <p>From: {inquiry.sender?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="inquiry-meta">
                                                    <span className={`status-badge ${inquiry.status}`}>{inquiry.status}</span>
                                                    <button
                                                        className="btn-outline small"
                                                        onClick={() => handleOpenReply(inquiry)}
                                                    >
                                                        Respond
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FiMessageSquare />
                                        {inquiryError
                                            ? <><p style={{color:'#dc2626'}}>{inquiryError}</p><button className="btn-outline small" onClick={fetchData}>Retry</button></>
                                            : <p>All caught up! No pending inquiries.</p>
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Recent Properties */}
                            <div className="dashboard-section">
                                <div className="section-header">
                                    <h2>Your Properties</h2>
                                    <button onClick={() => setActiveTab("properties")}>View All</button>
                                </div>
                                {properties.length > 0 ? (
                                    <div className="property-table-wrapper">
                                        <table className="property-table">
                                            <thead>
                                                <tr>
                                                    <th>Property</th>
                                                    <th>Status</th>
                                                    <th>Views</th>
                                                    <th>Price</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {properties.slice(0, 5).map((property) => (
                                                    <tr key={property._id}>
                                                        <td>
                                                            <div className="property-cell">
                                                                <img src={getImageUrl(property.images?.[0]?.url)} alt="" />
                                                                <span>{property.title}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className={`status-select ${property.status}`}
                                                                value={property.status}
                                                                onChange={(e) => handleStatusChange(property._id, e.target.value)}
                                                            >
                                                                <option value="available">Available</option>
                                                                <option value="sold">Sold</option>
                                                                <option value="rented">Rented</option>
                                                            </select>
                                                        </td>
                                                        <td>{property.views || 0}</td>
                                                        <td>₹{property.price?.toLocaleString()}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button className="btn-icon" onClick={() => navigate(`/property/${property._id}`)}>
                                                                    <FiEye />
                                                                </button>
                                                                <button className="btn-icon" onClick={() => navigate(`/edit-property/${property._id}`)}>
                                                                    <FiEdit2 />
                                                                </button>
                                                                <button
                                                                    className={`btn-icon feature${isFeaturedActive(property) ? " featured" : ""}`}
                                                                    onClick={() => !isFeaturedActive(property) && setFeaturedProperty(property)}
                                                                    disabled={isFeaturedActive(property)}
                                                                    title={featuredLabel(property)}
                                                                >
                                                                    <FiStar />
                                                                </button>
                                                                <button className="btn-icon delete" onClick={() => handleDeleteProperty(property._id)}>
                                                                    <FiTrash2 />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FiHome />
                                        <p>No properties listed yet</p>
                                        <button className="btn-primary" onClick={() => navigate("/post-property")}>
                                            <FiPlus /> Add Your First Property
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Properties Tab */}
                    {activeTab === "properties" && (
                        <div className="dashboard-content">
                            <div className="section-header">
                                <div>
                                    <h1>My Properties</h1>
                                    <p className="subtitle">Manage all your property listings</p>
                                </div>
                                <button  onClick={() => navigate("/post-property")}>
                                    <FiPlus /> Add Property
                                </button>
                            </div>

                            {properties.length > 0 ? (
                                <div className="property-table-wrapper full">
                                    <table className="property-table">
                                        <thead>
                                            <tr>
                                                <th>Property</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Views</th>
                                                <th>Inquiries</th>
                                                <th>Price</th>
                                                <th>Featured</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {properties.map((property) => (
                                                <tr key={property._id}>
                                                    <td>
                                                        <div className="property-cell">
                                                            <img src={getImageUrl(property.images?.[0]?.url)} alt="" />
                                                            <div>
                                                                <span className="property-title">{property.title}</span>
                                                                <small>{property.location?.city}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="capitalize">{property.listingType}</td>
                                                    <td>
                                                        <select
                                                            className={`status-select ${property.status}`}
                                                            value={property.status}
                                                            onChange={(e) => handleStatusChange(property._id, e.target.value)}
                                                        >
                                                            <option value="available">Available</option>
                                                            <option value="sold">Sold</option>
                                                            <option value="rented">Rented</option>
                                                        </select>
                                                    </td>
                                                    <td>{property.views || 0}</td>
                                                    <td>{property.inquiries || 0}</td>
                                                    <td>₹{property.price?.toLocaleString()}</td>
                                                    <td>
                                                        {isFeaturedActive(property) ? (
                                                            <div className="featured-status-cell">
                                                                <FiStar className="featured-star-active" />
                                                                <span className="featured-until-text">
                                                                    Until {new Date(property.featuredUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                                </span>
                                                            </div>
                                                        ) : property.isFeatured && property.featuredUntil ? (
                                                            <span className="featured-expired-text">Expired</span>
                                                        ) : (
                                                            <span className="text-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(property.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn-icon" onClick={() => navigate(`/property/${property._id}`)}>
                                                                <FiEye />
                                                            </button>
                                                            <button className="btn-icon" onClick={() => navigate(`/edit-property/${property._id}`)}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                className={`btn-icon feature${isFeaturedActive(property) ? " featured" : ""}`}
                                                                onClick={() => !isFeaturedActive(property) && setFeaturedProperty(property)}
                                                                disabled={isFeaturedActive(property)}
                                                                title={featuredLabel(property)}
                                                            >
                                                                <FiStar />
                                                            </button>
                                                            <button className="btn-icon delete" onClick={() => handleDeleteProperty(property._id)}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state large">
                                    <FiHome />
                                    <h3>No properties yet</h3>
                                    <p>Start by adding your first property listing</p>
                                    <button className="btn-primary" onClick={() => navigate("/post-property")}>
                                        <FiPlus /> Add Property
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inquiries Tab */}
                    {activeTab === "inquiries" && (
                        <div className="dashboard-content">
                            <h1>Property Inquiries</h1>
                            <p className="subtitle">Respond to buyer inquiries</p>

                            {inquiryError ? (
                                <div className="empty-state large">
                                    <FiMessageSquare />
                                    <h3>Could not load inquiries</h3>
                                    <p style={{color:'#dc2626'}}>{inquiryError}</p>
                                    <button className="btn-primary" onClick={fetchData}>Retry</button>
                                </div>
                            ) : inquiries.length > 0 ? (
                                <div className="inquiry-list full">
                                    {inquiries.map((inquiry) => (
                                        <div key={inquiry._id} className="inquiry-card detailed">
                                            <div className="inquiry-property">
                                                <img src={getImageUrl(inquiry.property?.images?.[0]?.url)} alt="" />
                                                <div>
                                                    <h4>{inquiry.property?.title}</h4>
                                                    <p className="sender-info">
                                                        <strong>{inquiry.sender?.name}</strong> • {inquiry.sender?.email}
                                                    </p>
                                                    <p className="inquiry-message">{inquiry.message}</p>
                                                </div>
                                            </div>
                                            <div className="inquiry-details">
                                                <span className={`status-badge ${inquiry.status}`}>{inquiry.status}</span>
                                                <span className="inquiry-date">
                                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                                </span>
                                                {inquiry.status !== 'responded' ? (
                                                    <button
                                                        className="btn-primary small"
                                                        onClick={() => handleOpenReply(inquiry)}
                                                    >
                                                        Respond
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Replied</span>
                                                )}
                                                <Link to={`/inquiry/${inquiry._id}`} className="btn-outline small">
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
                                    <p>When buyers contact you, their inquiries will appear here</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="dashboard-content">
                            <h1>Analytics & Insights</h1>
                            <p className="subtitle">Track your property performance</p>

                            <div className="analytics-grid">
                                <div className="analytics-card">
                                    <h3>Performance Overview</h3>
                                    <div className="analytics-chart placeholder">
                                        <FiBarChart2 />
                                        <p>Coming soon: Detailed analytics charts</p>
                                    </div>
                                </div>

                                <div className="analytics-card">
                                    <h3>Top Performing Properties</h3>
                                    {properties.sort((a, b) => b.views - a.views).slice(0, 3).map((property, index) => (
                                        <div key={property._id} className="performance-item">
                                            <span className="rank">#{index + 1}</span>
                                            <div className="performance-info">
                                                <span>{property.title}</span>
                                                <small>{property.views} views • {property.inquiries || 0} inquiries</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Payments Tab */}
                    {activeTab === "payments" && (
                        <div className="dashboard-content">
                            <div className="section-header">
                                <div>
                                    <h1>Payments</h1>
                                    <p className="subtitle">All payments made for featured listings</p>
                                </div>
                            </div>

                            {payments.length > 0 ? (
                                <div className="property-table-wrapper full">
                                    <table className="property-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Property</th>
                                                <th>Plan</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((p) => (
                                                <tr key={p._id}>
                                                    <td><small className="text-muted">{p.transactionId}</small></td>
                                                    <td>{p.property?.title || "—"}</td>
                                                    <td>{p.plan}</td>
                                                    <td>₹{p.amount}</td>
                                                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                                                    <td>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                                                    <td>
                                                        <button className="btn-outline small" onClick={() => setInvoiceItem(p)}>
                                                            <FiFileText /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state large">
                                    <FiDollarSign />
                                    <h3>No payments yet</h3>
                                    <p>Feature a property to see your payment history here</p>
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
                                                    {user?.role === "seller" | "buyer"
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

            {/* Invoice Modal */}
            {invoiceItem && (
                <div className="modal-overlay" onClick={() => setInvoiceItem(null)}>
                    <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FiFileText /> Invoice</h3>
                            <button className="btn-icon" onClick={() => setInvoiceItem(null)}><FiX /></button>
                        </div>
                        <div className="invoice-body">
                            <div className="invoice-brand">
                                <h2>UrbanStay</h2>
                                <span className={`status-badge ${invoiceItem.status}`}>{invoiceItem.status}</span>
                            </div>
                            <hr />
                            <div className="invoice-row">
                                <span>Invoice No.</span>
                                <strong>{invoiceItem.transactionId}</strong>
                            </div>
                            <div className="invoice-row">
                                <span>Date</span>
                                <strong>{new Date(invoiceItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
                            </div>
                            <div className="invoice-row">
                                <span>Billed To</span>
                                <strong>{user?.name}</strong>
                            </div>
                            <div className="invoice-row">
                                <span>Property</span>
                                <strong>{invoiceItem.property?.title || "—"}</strong>
                            </div>
                            <div className="invoice-row">
                                <span>Plan</span>
                                <strong>{invoiceItem.plan}</strong>
                            </div>
                            <div className="invoice-row">
                                <span>Featured Until</span>
                                <strong>{new Date(invoiceItem.featuredUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
                            </div>
                            <hr />
                            <div className="invoice-row invoice-total">
                                <span>Total Paid</span>
                                <strong>₹{invoiceItem.amount} {invoiceItem.currency}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {respondingTo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Respond to Inquiry</h3>
                            <button className="btn-icon" onClick={() => setRespondingTo(null)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="inquiry-summary">
                                <p><strong>Property:</strong> {respondingTo.property?.title}</p>
                                <p><strong>From:</strong> {respondingTo.sender?.name}</p>
                                <p><strong>Message:</strong> "{respondingTo.message}"</p>
                            </div>
                            <form onSubmit={handleSendReply}>
                                <div className="form-group">
                                    <label>Your Reply</label>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your response here..."
                                        rows="4"
                                        required
                                        className="form-input"
                                    ></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-outline" onClick={() => setRespondingTo(null)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                                        {actionLoading ? "Sending..." : "Send Reply"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Property Modal */}
            {featuredProperty && (
                <FeaturedUpgradeModal
                    property={featuredProperty}
                    onClose={() => setFeaturedProperty(null)}
                    onSuccess={(updatedProp) => {
                        handleFeatureSuccess(updatedProp);
                        setFeaturedProperty(null);
                    }}
                />
            )}
        </div>
    );
};

export default SellerDashboard;

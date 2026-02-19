import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiHome, FiUsers, FiStar, FiSettings, FiTrendingUp, FiCheck, FiX,
    FiEye, FiEdit2, FiTrash2, FiSearch, FiFilter, FiShield, FiAward,
    FiPhone, FiMail, FiMapPin, FiBriefcase, FiCalendar, FiUser
} from "react-icons/fi";
import { useAuth } from "../context/authcontext.jsx";
import { propertyService } from "../services/propertyservice";
import { reviewService } from "../services/dataservice";
import api from "../services/api";
import "./Dashboard.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === "overview") {
                const statsRes = await propertyService.getAdminStats();
                setStats(statsRes.stats);
                setProperties(statsRes.recentProperties || []);
            }
            if (activeTab === "properties") {
                const propertiesRes = await propertyService.getProperties({
                    limit: 100,
                    sort: "newest",
                });
                setProperties(propertiesRes.properties || []);
            }
            if (activeTab === "users") {
                const usersRes = await api.get("/auth/users");
                setUsers(usersRes.data.users || []);
            }
            if (activeTab === "reviews") {
                const reviewsRes = await reviewService.getPending();
                setPendingReviews(reviewsRes.reviews || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleVerifyProperty = async (id) => {
        try {
            await propertyService.verifyProperty(id);
            await fetchData();
        } catch (error) {
            console.error("Error verifying property:", error);
        }
    };

    const handleFeatureProperty = async (id) => {
        try {
            await propertyService.featureProperty(id, 30);
            await fetchData();
        } catch (error) {
            console.error("Error featuring property:", error);
        }
    };

    const handleModerateReview = async (id, status) => {
        try {
                await reviewService.moderate(id, status);
            setPendingReviews(pendingReviews.filter(r => r._id !== id));
        } catch (error) {
            console.error("Error moderating review:", error);
        }
    };

    const handleUpdateUserRole = async (userId, role) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role });
            setUsers(users.map(u => u._id === userId ? { ...u, role } : u));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/auth/users/${userToDelete._id}`);
            setUsers(users.filter(u => u._id !== userToDelete._id));
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            alert('User deleted successfully!');
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.response?.data?.message || 'Error deleting user');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const tabs = [
        { id: "overview", label: "Overview", icon: FiTrendingUp },
        { id: "properties", label: "Properties", icon: FiHome },
        { id: "users", label: "Users", icon: FiUsers },
        { id: "reviews", label: "Reviews", icon: FiStar },
    ];

    return (
        <div className="dashboard-page admin-dashboard">
            <div className="dashboard-container">
                {/* Sidebar */}
                <aside className="dashboard-sidebar admin">
                    <div className="sidebar-header">
                        <div className="user-avatar admin">
                            <FiShield />
                        </div>
                        <h3>{user?.name}</h3>
                        <p>Administrator</p>
                        <span className="user-badge admin">Admin</span>
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
                            <h1>Admin Dashboard</h1>
                            <p className="subtitle">Platform overview and statistics</p>

                            {stats && (
                                <>
                                    <div className="stats-grid admin-stats">
                                        <div className="stat-card gradient-black">
                                            <div className="stat-icon" style={{ backgroundColor: "#d1fae5", color: "#059669"}}>
                                            <svg fill="#000" width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m4e2 565.31c3.3008.007812 6.4688-1.293 8.8164-3.6133l60.512-60.07v-.003906c9.4648-9.0391 15.422-21.141 16.816-34.152 1.3984-13.016-1.8594-26.102-9.1875-36.945-8.5547-11.895-21.535-19.84-36.02-22.043-14.48-2.1992-29.238 1.5273-40.938 10.344-11.695-8.8164-26.453-12.547-40.934-10.348-14.477 2.1953-27.461 10.133-36.016 22.023-7.3359 10.844-10.594 23.934-9.1953 36.949 1.3945 13.016 7.3555 25.117 16.82 34.156l60.504 60.07.003906.003906c2.3398 2.332 5.5117 3.6367 8.8164 3.6289zm-64.207-125.57c6.5898-9.2695 16.957-15.129 28.293-15.996 1.0547-.085938 2.1016-.13281 3.1484-.13281v-.003907c10.207-.019531 20.008 4.0039 27.254 11.195l5.5117 5.5117 5.5117-5.5117h-.003907c8.0547-7.9648 19.191-12.004 30.477-11.051 11.285.94922 21.59 6.7969 28.195 15.996 5.1406 7.793 7.3594 17.156 6.2656 26.43-1.0977 9.2734-5.4336 17.863-12.25 24.25l-58.195 57.82-58.254-57.82c-6.8164-6.3867-11.152-14.98-12.242-24.258-1.0898-9.2773 1.1406-18.641 6.2891-26.43z"/><path d="m633.8 387.73-228.29-221.68c-3.0508-2.9609-7.9023-2.9609-10.957.0l-228.29 221.68c-1.6445 1.5977-2.5117 3.8359-2.375 6.125.14062 2.2891 1.2734 4.4062 3.1016 5.793l39.656 30.262c3.0234 2.3008 7.2578 2.1133 10.07-.44141l183.29-166.52 183.28 166.49c2.8125 2.5547 7.0469 2.7422 10.07.4375l39.699-30.23v.003906c1.8242-1.3867 2.957-3.5039 3.0938-5.793.13672-2.293-.73047-4.5273-2.3789-6.125zm-44.766 25.648-183.74-166.89c-3-2.7227-7.5781-2.7227-10.582.0l-183.74 166.89-27.215-20.723 216.25-209.98 216.24 209.98z"/><path d="m573.18 447.23c-4.3477.0-7.8711 3.5234-7.8711 7.8711v165.31h-330.62v-165.31c0-4.3477-3.5273-7.8711-7.875-7.8711s-7.8711 3.5234-7.8711 7.8711v173.19c0 2.0859.82812 4.0898 2.3047 5.5664 1.4766 1.4727 3.4805 2.3047 5.5664 2.3047h346.37c2.0859.0 4.0898-.83203 5.5664-2.3047 1.4766-1.4766 2.3047-3.4805 2.3047-5.5664v-173.19c0-2.0859-.82813-4.0898-2.3047-5.5664-1.4766-1.4766-3.4805-2.3047-5.5664-2.3047z"/><path d="m242.56 289.79c2.0859.0 4.0898-.82812 5.5664-2.3047s2.3047-3.4766 2.3047-5.5664v-78.719h39.359v15.742c0 4.3477 3.5273 7.8711 7.875 7.8711s7.8711-3.5234 7.8711-7.8711v-23.617c0-2.0859-.83203-4.0898-2.3047-5.5664-1.4766-1.4727-3.4805-2.3047-5.5664-2.3047h-55.105c-4.3477.0-7.8711 3.5234-7.8711 7.8711v86.594c0 2.0898.82812 4.0898 2.3047 5.5664 1.4766 1.4766 3.4766 2.3047 5.5664 2.3047z"/></g></svg>
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{stats.totalProperties}</span>
                                                <span className="stat-label">Total Properties</span>
                                            </div>
                                        </div>
                                        <div className="stat-card gradient-black">
                                            <div className="stat-icon">
                                                <svg fill="#000" width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m360.98 242.79c-1.9258.0-3.832-.56641-5.4648-1.6562-2.3594-1.5742-3.9258-4.0938-4.293-6.9062-.28516-2.1758-.42969-4.3359-.42969-6.4258.0-27.129 22.07-49.199 49.199-49.199s49.199 22.07 49.199 49.199c0 2.082-.14453 4.2422-.42969 6.4219-.36719 2.8125-1.9297 5.332-4.293 6.9102-2.3594 1.5781-5.2852 2.0586-8.0273 1.3203-23.695-6.3828-49.211-6.3828-72.91.0-.83594.22656-1.6953.33594-2.5508.33594zm39.016-44.508c-13.77.0-25.367 9.4766-28.613 22.25 18.836-3.418 38.395-3.418 57.23.0-3.2539-12.773-14.848-22.25-28.617-22.25z"/><path d="m4e2 621.4c-32.555.0-59.039-26.484-59.039-59.039.0-5.4336 4.4062-9.8398 9.8398-9.8398h98.398c5.4336.0 9.8398 4.4062 9.8398 9.8398.0 32.555-26.484 59.039-59.039 59.039zm-38.117-49.199c4.3789 16.957 19.809 29.52 38.113 29.52 18.305.0 33.734-12.562 38.117-29.52z"/><path d="m527.66 572.2H272.34c-32.125.0-58.262-26.137-58.262-58.266.0-13.121 4.2578-25.508 12.316-35.828 12.379-15.855 19.199-35.422 19.199-55.09.0-5.8047-.58984-11.629-1.75-17.312-1.3398-6.5508-2.2852-12.637-2.8203-18.086-.53125-5.4102 3.4258-10.223 8.8359-10.754 5.4102-.53125 10.223 3.4258 10.754 8.8359.46875 4.7734 1.3125 10.176 2.5156 16.062 1.4258 6.9766 2.1484 14.125 2.1484 21.25.0 24.035-8.2969 47.902-23.367 67.199-5.332 6.8281-8.1484 15.031-8.1484 23.719.0 21.273 17.309 38.582 38.582 38.582h255.32c6.9258.0 13.715-1.8555 19.633-5.3594 4.6797-2.7695 10.711-1.2266 13.48 3.4492 2.7695 4.6758 1.2227 10.711-3.4492 13.48-8.957 5.3125-19.215 8.1172-29.668 8.1172zm48.418-47.402c-.070313.0-.14062.0-.20703-.003906-5.4336-.11328-9.7461-4.6094-9.6367-10.039.007813-.26172.007813-.51953.007813-.78125.0-5.4336 4.4062-9.8398 9.8398-9.8398s9.8398 4.4062 9.8398 9.8398c0 .39844-.003906.79297-.011719 1.1875-.10938 5.3633-4.4922 9.6367-9.832 9.6367zm-10.223-30.797c-2.9258.0-5.8242-1.3008-7.7617-3.7852-15.066-19.297-23.367-43.164-23.367-67.199.0-7.1211.72266-14.273 2.1484-21.25 1.9609-9.5977 2.957-17.773 2.957-24.297.0-63.109-42.512-118.63-103.38-135.02-23.695-6.3828-49.211-6.3828-72.91.0-31.938 8.6016-59.918 28.422-78.785 55.809-3.082 4.4727-9.2109 5.6055-13.684 2.5195-4.4766-3.082-5.6055-9.2109-2.5195-13.684 21.516-31.23 53.434-53.832 89.875-63.645 27.035-7.2812 56.109-7.2812 83.145.0 69.441 18.699 117.94 82.039 117.94 154.03.0 7.8438-1.1289 17.344-3.3516 28.234-1.1602 5.6836-1.75 11.512-1.75 17.312.0 19.668 6.8164 39.23 19.199 55.086 3.3438 4.2852 2.582 10.469-1.7031 13.812-1.8008 1.4023-3.9336 2.082-6.0547 2.082zm-310.25-146.2c-.85937.0-1.7305-.11328-2.5977-.35156-5.2422-1.4336-8.332-6.8438-6.8984-12.086l.28125-1.0078c1.4648-5.2344 6.8984-8.2891 12.129-6.8203 5.2344 1.4648 8.2891 6.8945 6.8203 12.129l-.24609.88672c-1.1953 4.375-5.1602 7.25-9.4883 7.25z"/></g></svg>
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{stats.activeProperties}</span>
                                                <span className="stat-label">Active Listings</span>
                                            </div>
                                        </div>
                                        <div className="stat-card gradient-black">
                                            <div className="stat-icon">
                                               <svg width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="a"><path d="m172 148.09h454V651.9H172z"/></clipPath></defs><path d="m293.96 248.36c-1.7578.0-3.4453.69531-4.6875 1.9414-1.2422 1.2422-1.9414 2.9297-1.9414 4.6875v58.75c0 3.6602 2.9688 6.6289 6.6289 6.6289 3.6602.0 6.6289-2.9688 6.6289-6.6289v-58.75c0-1.7578-.69531-3.4453-1.9414-4.6875-1.2422-1.2461-2.9297-1.9414-4.6875-1.9414z"/><path d="m320.47 249.74c-1.7578-.003906-3.4453.69531-4.6875 1.9414-1.2422 1.2422-1.9414 2.9297-1.9414 4.6875v31.883c0 3.6602 2.9688 6.6289 6.6289 6.6289 3.6641.0 6.6289-2.9688 6.6289-6.6289v-31.883c.003907-1.7578-.69531-3.4453-1.9375-4.6875-1.2461-1.2461-2.9336-1.9453-4.6914-1.9414z"/><path d="m346.99 256.14c-1.7617.0-3.4453.69531-4.6914 1.9414-1.2422 1.2422-1.9414 2.9297-1.9414 4.6875v50.969c0 3.6602 2.9688 6.6289 6.6328 6.6289 3.6602.0 6.6289-2.9688 6.6289-6.6289v-50.969c0-1.7578-.69922-3.4453-1.9414-4.6875-1.2461-1.2461-2.9297-1.9414-4.6875-1.9414z"/><g clip-path="url(#a)"><path d="m625.41 485.2c-.61328-2.1562-2.2773-3.8555-4.4219-4.5195l-1.1445-.34766c-17.859-4.8125-35.023-11.898-51.078-21.086-1.6875-58.391-9.2148-117.87-19.246-151.95-.55469-2.293-1.3359-4.5234-2.3281-6.6641-7.3828-16.93-34.301-61.926-124.74-114.13-72.621-41.965-106.28-42.02-121.73-34.672-.058594.027344-.12109.019531-.17578.050781l-39.25 19.633c-.046875.023437-.070313.0625-.11328.085937-4.5625 2.0977-8.2227 5.7578-10.316 10.324-8.207 18.441-14.832 54.73-18.027 98.211-12.152-4.5781-25.312-5.8125-38.105-3.5781-4.7578.73438-9.5742.96875-14.379.69922l-.79687-.070312c-2.5898-.23438-5.0742 1.0703-6.3594 3.332-1.2812 2.2617-1.1211 5.0664.41016 7.168l34.223 47.09c-11.016 19.223-10.504 48.586 2.7852 77.074l7.5586 17.371c.83594 1.9297 2.5469 3.3516 4.6016 3.8164 1.0195.24219 2.082.23047 3.0938-.03125 7.6836-.87891 15.445-.77344 23.102.3125 34.289 99.199 105.53 190.32 126.8 216.17 1.2617 1.5312 3.1406 2.4141 5.1211 2.4141.12891.0.26562-.003906.40234-.011719 32.539-1.7109 64.043-12.02 91.301-29.867 28.035-9.1602 52.609-26.652 70.438-50.145l17.922-12.375c17.281 10.25 35.906 18.051 55.336 23.168l.79297.24609c.63281.19922 1.293.30078 1.957.30078 2.3711.0 4.5586-1.2656 5.7422-3.3203 1.1836-2.0508 1.1797-4.582-.007813-6.6328l-28.809-49.734 28.066-32.164c1.4766-1.6875 1.9961-4.0117 1.3828-6.168zm-89.887 7.4453-4.7891-11.016-.007813-.32812 22.168-9.7227.67969 41.645v.074219l.56641 34.82-9.5547 6.5898c3.2031-21.129.046874-42.73-9.0625-62.062zm19.875-36.645-25.141 11.027c-2.3477-54.582-9.6523-109.13-18.977-140.91l-.12891-.46875 26.098-13.047c9.2188 32.691 16.336 89.09 18.148 143.39zm-139.58-258.01c78.867 45.52 107.16 85.117 116.43 102.29l-26.371 13.184c-10.688-20.215-40.672-61.145-121.68-107.87-35.715-20.633-64.891-32.953-87.527-36.953l8.5586-4.2812 1.1406-.53906c8.3125-3.9453 35.586-8.5352 109.45 34.168zm-152.75-10.902c.96094-1.6172 2.3945-2.8984 4.1133-3.6641l1.9102-.94531c10.652-4.332 38.918-5.5859 108.48 34.602 89.477 51.602 113.87 95.66 119.21 107.93.67969 1.4883 1.25 3.0234 1.7109 4.5898 9.4258 32.137 16.703 88.055 18.734 143.45-4.0547 2.2344-8.5586 3.5391-13.18 3.8242-1.9727-62.766-10.484-116.96-18.297-143.51-.023438-.10156-.0625-.20703-.09375-.30859-.070313-.29297-.16016-.58203-.26562-.86328-3.0977-8.0586-23.152-50.953-114.45-103.66-49.934-28.789-76.191-34.832-89.422-34.832-.57031.0-1.1211.019531-2.2539.066406-2.8281.0-5.3438 1.7969-6.2656 4.4727-6.9336 20.168-14.223 65.332-15.523 122.25-4.793-.79688-9.1953-1.2812-13.188-1.543.19531-9.4531.54297-18.996 1.1484-28.535l.003906-.023438v-.023437c2.7578-45.453 9.4766-84.934 17.633-103.27zm83.938 151.86c-1.7578.0-3.4414.69531-4.6875 1.9414-1.2422 1.2422-1.9414 2.9297-1.9414 4.6875v11.273c-4.4844-3.2031-8.9062-6.1289-13.258-8.8359v-27.891c0-3.6641-2.9648-6.6289-6.6289-6.6289-3.6602.0-6.6289 2.9648-6.6289 6.6289v20.238c-13.66-7.3984-28.16-13.125-43.188-17.062 1.0234-52.641 7.1836-94.883 13.43-116.23 9.7148.73828 33.324 5.9219 80.207 32.953 85.926 49.605 105.54 89.355 108.43 96.27l.019531.12891c.097656.73438.32812 1.4492.67969 2.1055 7.4141 26.082 15.367 77.727 17.316 137.78-20.211-3.3398-51.848-18.648-95.184-68.527-12.754-14.801-26.789-28.457-41.934-40.801v-21.398c0-1.7578-.69922-3.4453-1.9414-4.6875-1.2461-1.2461-2.9297-1.9414-4.6914-1.9414zm-155.17-48.723c1.4961-.15234 2.9766-.32031 4.4414-.49609 12.066-2.2383 24.531-.70312 35.695 4.3984-.46875 8.2812-.78125 16.551-.94922 24.758-3.5742.082032-7.1172.71094-10.504 1.8711l-.046875-.066406c-1.4414 1.0039-2.8164 2.0977-4.1172 3.2773zm36.574 129.31-5.707-13.125c-13.977-29.965-12.105-61.375 4.1758-73.973 9.5664-1.1602 80.461-5.9961 158.69 84.039 72.078 82.957 116.47 77.629 133.13 70.727l4.6484 10.684c14.285 33.586 12.293 65-4.7461 74.703-.25391.15234-.59375.39062-.82812.56641-.40625.29688-40.547 29.047-122.2-64.938-39.273-45.199-77.371-68.031-108.05-79.203-.34766-.16406-.71094-.29688-1.0859-.39844-10.328-3.75-21.008-6.4688-31.875-8.1094-.125-.015625-.24609-.042968-.375-.050781-5.707-.84375-11.465-1.293-17.234-1.3359-2.8516-.011719-5.6992.125-8.5391.41406zm232.57 161.24c-18.551 16-41.344 26.281-65.617 29.594-39.648-49.922-72.738-104.71-98.465-163.04 34.207 16.559 64.449 40.297 88.664 69.59 29.914 34.422 55.051 53.641 75.418 63.855zm-196.93-144.78c5.3242 1.2383 10.582 2.7461 15.754 4.5117 22.258 56.957 61.289 122.75 107.54 181.11 1.2578 1.5859 3.1719 2.5117 5.1953 2.5117.3125.0.62109-.019531.92578-.066406 23.848-3.3711 56.703-12.699 80.746-37.625 4.6602 1.6641 9.457 2.918 14.332 3.7539-6.5977 7.6836-14.156 14.492-22.48 20.266-.22656.12891-.44531.26953-.65234.41797-24.367 16.059-52.465 25.547-81.578 27.555-22.621-27.805-86.492-111.17-119.79-202.44zm318.79 82.402c-1.8672 2.1328-2.168 5.2227-.74219 7.6758l22.82 39.395c-13.035-4.6367-25.598-10.496-37.527-17.496l-1.2266-75.09c13.086 7.1445 26.805 13.059 40.984 17.66z"/></g></svg>
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{stats.verifiedProperties}</span>
                                                <span className="stat-label">Verified</span>
                                            </div>
                                        </div>
                                        <div className="stat-card gradient-black">
                                            <div className="stat-icon">
                                                <svg fill="#000" width="800" height="800" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><g><path d="m503.25 343.43h-50.402v-44.32c0-24.457-19.898-44.355-44.355-44.355-8.6484.0-15.684 7.0312-15.684 15.68v47.691c0 25.656-19.719 46.77-44.797 49.031-2.4297-11.332-12.504-19.859-24.547-19.859h-19.344c-13.852.0-25.121 11.273-25.121 25.125v110.7c0 13.852 11.273 25.125 25.121 25.125h19.344c8.2383.0 15.5-4.043 20.082-10.188 4.5859 6.1484 11.848 10.188 20.09 10.188h104.31c25.484.0 47.227-17.359 52.871-42.215l17.777-78.336c2.4492-10.809-.11328-21.977-7.0312-30.641-6.9102-8.6562-17.234-13.625-28.316-13.625zM323.46 498.17h-19.344c-8.2969.0-15.047-6.75-15.047-15.047v-110.7c0-8.2969 6.75-15.047 15.047-15.047h19.344c8.2969.0 15.047 6.75 15.047 15.047v110.7c0 8.2969-6.75 15.047-15.047 15.047zm205.3-112.7-17.777 78.336c-4.5898 20.234-22.289 34.367-43.039 34.367l-104.32-.003906c-8.3008.0-15.051-6.75-15.051-15.047l.003907-105.92c30.363-2.5703 54.297-28.062 54.297-59.082v-47.691c0-3.0898 2.5156-5.6055 5.6094-5.6055 18.902.0 34.277 15.379 34.277 34.281v49.359c0 2.7812 2.2539 5.0391 5.0391 5.0391h55.438c8 0 15.453 3.5859 20.449 9.8398 4.9922 6.2578 6.8398 14.316 5.0703 22.125z"/><path d="m313.79 465.34c-7.1484.0-12.965 5.8164-12.965 12.965.0 7.1484 5.8164 12.965 12.965 12.965 7.1484.0 12.965-5.8164 12.965-12.965.0-7.1484-5.8164-12.965-12.965-12.965zm0 15.855c-1.5938.0-2.8867-1.2969-2.8867-2.8867.0-1.5938 1.293-2.8906 2.8867-2.8906s2.8867 1.2969 2.8867 2.8906c.003907 1.5898-1.293 2.8867-2.8867 2.8867z"/><path d="m618.19 354.69c5.7109-7.8828 7.2578-17.711 4.25-26.969-3.0078-9.2578-10.043-16.301-19.293-19.324l-39.375-12.859c-8.2539-2.6953-13.809-10.34-13.82-19.02l-.0625-41.426c-.015625-9.7344-4.543-18.598-12.418-24.32-7.875-5.7227-17.711-7.2812-26.961-4.2891l-39.418 12.738c-8.25 2.6797-17.234-.24609-22.355-7.2617l-24.402-33.477c-5.7344-7.8672-14.605-12.375-24.336-12.375s-18.602 4.5078-24.336 12.375l-24.406 33.477c-5.1133 7.0117-14.09 9.9258-22.352 7.2617l-39.418-12.738c-9.2539-2.9922-19.09-1.4336-26.961 4.2891-7.875 5.7227-12.402 14.586-12.418 24.32l-.0625 41.422c-.011719 8.6797-5.5664 16.324-13.82 19.02l-39.375 12.859c-9.25 3.0234-16.285 10.066-19.293 19.324-3.0078 9.2578-1.4609 19.086 4.25 26.969l24.297 33.551c5.0938 7.0312 5.0938 16.48.003906 23.512l-24.301 33.551c-5.7109 7.8828-7.2578 17.711-4.25 26.969 3.0078 9.2578 10.043 16.301 19.293 19.324l39.375 12.859c8.2539 2.6953 13.809 10.34 13.82 19.02l.0625 41.426c.015625 9.7344 4.543 18.598 12.418 24.32 7.8711 5.7188 17.707 7.2773 26.961 4.2891l39.418-12.738c8.2656-2.6719 17.238.25 22.355 7.2617l24.402 33.477c5.7305 7.8672 14.602 12.375 24.336 12.375 9.7305.0 18.602-4.5078 24.336-12.375l24.406-33.477c5.1133-7.0156 14.09-9.9297 22.352-7.2617l39.418 12.738c9.25 2.9883 19.086 1.4258 26.961-4.2891 7.875-5.7227 12.402-14.586 12.418-24.32l.0625-41.422c.011719-8.6797 5.5664-16.324 13.82-19.02l39.375-12.859c9.25-3.0234 16.285-10.066 19.293-19.324 3.0078-9.2578 1.4609-19.086-4.25-26.969l-24.297-33.551c-5.0938-7.0312-5.0938-16.48-.003906-23.512zm-32.457 62.973 24.301 33.551c3.7969 5.2461 4.8281 11.785 2.8242 17.945-2.0039 6.1641-6.6797 10.848-12.836 12.859l-39.375 12.859c-12.402 4.0508-20.746 15.539-20.766 28.586l-.0625 41.418c-.011718 6.4805-3.0273 12.379-8.2656 16.188-5.2383 3.8047-11.789 4.8398-17.938 2.8555l-39.418-12.738c-12.414-4.0156-25.914.375-33.594 10.918l-24.402 33.477c-3.8242 5.2305-9.7305 8.2305-16.203 8.2305-6.4766.0-12.379-3-16.195-8.2344l-24.398-33.477c-5.7852-7.9375-14.867-12.387-24.305-12.387-3.0938.0-6.2305.48047-9.293 1.4727l-39.418 12.738c-6.1562 1.9883-12.703.94922-17.938-2.8555-5.2383-3.8086-8.2539-9.707-8.2656-16.184l-.0625-41.422c-.019531-13.047-8.3633-24.535-20.766-28.586l-39.375-12.859c-6.1641-2.0117-10.844-6.6992-12.844-12.859-2.0039-6.1602-.97266-12.699 2.8242-17.945l24.305-33.551c7.6445-10.566 7.6445-24.766-.003906-35.332l-24.301-33.551c-3.8008-5.2422-4.8281-11.785-2.8242-17.945 2.0039-6.1641 6.6797-10.848 12.836-12.859l39.375-12.859c12.402-4.0508 20.746-15.539 20.766-28.586l.0625-41.418c.011718-6.4805 3.0273-12.379 8.2656-16.188 5.2344-3.8047 11.785-4.8516 17.938-2.8555l39.418 12.738c12.41 4.0078 25.914-.375 33.594-10.918l24.402-33.477c3.8242-5.2266 9.7266-8.2305 16.203-8.2305s12.379 3 16.195 8.2344l24.398 33.477c7.6836 10.543 21.188 14.926 33.598 10.918l39.418-12.738c6.1484-1.9961 12.699-.94922 17.938 2.8555 5.2383 3.8086 8.2539 9.707 8.2656 16.184l.0625 41.422c.019531 13.047 8.3633 24.535 20.766 28.586l39.375 12.859c6.1562 2.0117 10.832 6.6953 12.836 12.859 2.0039 6.1602.97266 12.699-2.8242 17.945l-24.305 33.551c-7.6406 10.562-7.6406 24.762.011719 35.328z"/></g></svg>
                                            </div>
                                            <div className="stat-info">
                                                <span className="stat-value">{pendingReviews.length}</span>
                                                <span className="stat-label">Pending Reviews</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="dashboard-section">
                                <div className="section-header">
                                    <h2>Recent Properties</h2>
                                    <button onClick={() => setActiveTab("properties")}>View All</button>
                                </div>
                                <div className="property-table-wrapper">
                                    <table className="property-table">
                                        <thead>
                                            <tr>
                                                <th>Property</th>
                                                <th>Owner</th>
                                                <th>Status</th>
                                                <th>Verified</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {properties.map((property) => (
                                                <tr key={property._id}>
                                                    <td>
                                                        <div className="property-cell">
                                                            <span>{property.title}</span>
                                                        </div>
                                                    </td>
                                                    <td>{property.owner?.name}</td>
                                                    <td>
                                                        <span className={`status-badge ${property.status}`}>{property.status}</span>
                                                    </td>
                                                    <td>
                                                        {property.isVerified ? (
                                                            <span className="verified-badge"><FiCheck /> Verified</span>
                                                        ) : (
                                                            <span className="unverified-badge">Pending</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {!property.isVerified && (
                                                                <button className="btn-icon success" onClick={() => handleVerifyProperty(property._id)}>
                                                                    <FiShield />
                                                                </button>
                                                            )}
                                                            {!property.isFeatured && (
                                                                <button className="btn-icon star" onClick={() => handleFeatureProperty(property._id)}>
                                                                    <FiAward />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="dashboard-content">
                            <h1>User Management</h1>
                            <p className="subtitle">Manage platform users and roles</p>

                            <div className="filter-bar">
                                <div className="search-box">
                                    <FiSearch />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">Users</option>
                                    <option value="seller">Sellers</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>

                            <div className="property-table-wrapper full">
                                <table className="property-table users-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Contact</th>
                                            <th>Address</th>
                                            <th>Role</th>
                                            <th>Professional Details</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar-small">
                                                            {u.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="user-name">{u.name}</span>
                                                            {u.gender && <span className="user-gender">{u.gender}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <div className="contact-item">
                                                            <FiMail size={14} />
                                                            <span>{u.email}</span>
                                                        </div>
                                                        {u.phone && (
                                                            <div className="contact-item">
                                                                <FiPhone size={14} />
                                                                <span>{u.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {u.address?.city || u.address?.state ? (
                                                        <div className="address-info">
                                                            <FiMapPin size={14} />
                                                            <span>
                                                                {u.address?.city}
                                                                {u.address?.city && u.address?.state ? ", " : ""}
                                                                {u.address?.state}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                        className={`role-select ${u.role}`}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="seller">Seller</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {u.role === "seller" ? (
                                                        <div className="professional-info">
                                                            {u.companyName && (
                                                                <div className="info-item">
                                                                    <FiBriefcase size={14} />
                                                                    <span>{u.companyName}</span>
                                                                </div>
                                                            )}
                                                            {u.reraNumber && (
                                                                <div className="info-item">
                                                                    <FiAward size={14} />
                                                                    <span>{u.reraNumber}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="date-text">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setShowUserDetailModal(true);
                                                            }}
                                                            title="View Details"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                        <button 
                                                            className="btn-icon delete" 
                                                            onClick={() => confirmDeleteUser(u)}
                                                            title="Delete User"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Properties Tab */}
                    {activeTab === "properties" && (
                        <div className="dashboard-content">
                            <h1>Property Management</h1>
                            <p className="subtitle">View and manage all property listings</p>

                            {properties.length > 0 ? (
                                <div className="property-table-wrapper full">
                                    <table className="property-table">
                                        <thead>
                                            <tr>
                                                <th>Property</th>
                                                <th>Owner</th>
                                                <th>Type</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Verified</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {properties.map((property) => (
                                                <tr key={property._id}>
                                                    <td>
                                                        <div className="property-cell">
                                                            <span>{property.title}</span>
                                                        </div>
                                                    </td>
                                                    <td>{property.owner?.name || "-"}</td>
                                                    <td>
                                                        {property.propertyType}
                                                        {property.listingType ? ` (${property.listingType})` : ""}
                                                    </td>
                                                    <td>
                                                        {property.location?.city || "-"}
                                                        {property.location?.state ? `, ${property.location.state}` : ""}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${property.status || "pending"}`}>
                                                            {property.status || "pending"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {property.isVerified ? (
                                                            <span className="verified-badge"><FiCheck /> Verified</span>
                                                        ) : (
                                                            <span className="unverified-badge">Pending</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {!property.isVerified && (
                                                                <button className="btn-icon success" onClick={() => handleVerifyProperty(property._id)}>
                                                                    <FiShield />
                                                                </button>
                                                            )}
                                                            {!property.isFeatured && (
                                                                <button className="btn-icon star" onClick={() => handleFeatureProperty(property._id)}>
                                                                    <FiAward />
                                                                </button>
                                                            )}
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
                                    <h3>No properties found</h3>
                                    <p>There are no property listings available yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div className="dashboard-content">
                            <h1>Review Moderation</h1>
                            <p className="subtitle">Approve or reject user reviews</p>

                            {pendingReviews.length > 0 ? (
                                <div className="review-moderation-list">
                                    {pendingReviews.map((review) => (
                                        <div key={review._id} className="review-card">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <div className="user-avatar-small">
                                                        {review.user?.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4>{review.user?.name}</h4>
                                                        <p>{review.user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="review-rating">
                                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                            <div className="review-property">
                                                <span>Property: {review.property?.title}</span>
                                            </div>
                                            <p className="review-content">{review.comment}</p>
                                            <div className="moderation-actions">
                                                <button
                                                    className="btn-approve"
                                                    onClick={() => handleModerateReview(review._id, "approved")}
                                                >
                                                    <FiCheck /> Approve
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => handleModerateReview(review._id, "rejected")}
                                                >
                                                    <FiX /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state large">
                                    <FiStar />
                                    <h3>No pending reviews</h3>
                                    <p>All reviews have been moderated</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* User Detail Modal */}
                {showUserDetailModal && selectedUser && (
                    <div className="modal-overlay" onClick={() => setShowUserDetailModal(false)}>
                        <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>User Details</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowUserDetailModal(false)}
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Personal Information */}
                                <div className="detail-section">
                                    <h3>Personal Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>
                                                <FiUser /> Full Name
                                            </label>
                                            <p>{selectedUser.name}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>
                                                <FiCalendar /> Date of Birth
                                            </label>
                                            <p>
                                                {selectedUser.dateOfBirth
                                                    ? new Date(selectedUser.dateOfBirth).toLocaleDateString()
                                                    : "Not provided"}
                                            </p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Gender</label>
                                            <p>{selectedUser.gender ? selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1) : "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="detail-section">
                                    <h3>Contact Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>
                                                <FiMail /> Email
                                            </label>
                                            <p>{selectedUser.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>
                                                <FiPhone /> Phone
                                            </label>
                                            <p>{selectedUser.phone || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                {(selectedUser.address?.street ||
                                    selectedUser.address?.city ||
                                    selectedUser.address?.state ||
                                    selectedUser.address?.zipCode) && (
                                    <div className="detail-section">
                                        <h3>Address</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>
                                                    <FiMapPin /> Street
                                                </label>
                                                <p>{selectedUser.address?.street || "-"}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>City</label>
                                                <p>{selectedUser.address?.city || "-"}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>State</label>
                                                <p>{selectedUser.address?.state || "-"}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>Zip Code</label>
                                                <p>{selectedUser.address?.zipCode || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Professional Information */}
                                {selectedUser.role === "seller" && (
                                    <div className="detail-section">
                                        <h3>Professional Information</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>
                                                    <FiBriefcase /> Company Name
                                                </label>
                                                <p>{selectedUser.companyName || "Not provided"}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>
                                                    <FiAward /> RERA Number
                                                </label>
                                                <p>{selectedUser.reraNumber || "Not provided"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bio */}
                                {selectedUser.bio && (
                                    <div className="detail-section">
                                        <h3>Bio</h3>
                                        <p className="bio-text">{selectedUser.bio}</p>
                                    </div>
                                )}

                                {/* Account Information */}
                                <div className="detail-section">
                                    <h3>Account Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Role</label>
                                            <p className={`role-badge ${selectedUser.role}`}>{selectedUser.role.toUpperCase()}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>
                                                <FiCalendar /> Joined
                                            </label>
                                            <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Verified</label>
                                            <p>{selectedUser.isVerified ? <FiCheck className="text-success" /> : "Not Verified"}</p>
                                        </div>
                                        {selectedUser.lastLogin && (
                                            <div className="detail-item">
                                                <label>Last Login</label>
                                                <p>{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowUserDetailModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && userToDelete && (
                    <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
                        <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header delete-header">
                                <FiTrash2 className="delete-icon" />
                                <h3>Delete User</h3>
                            </div>
                            <div className="modal-body">
                                <p className="warning-text">
                                    Are you sure you want to delete this user? This action cannot be undone.
                                </p>
                                <div className="user-info-box">
                                    <div className="user-avatar-small">
                                        {userToDelete.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>{userToDelete.name}</strong>
                                        <p>{userToDelete.email}</p>
                                        <span className={`role-badge ${userToDelete.role}`}>
                                            {userToDelete.role.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-danger" 
                                    onClick={handleDeleteUser}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

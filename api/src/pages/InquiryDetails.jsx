import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiClock, FiPhone,
  FiMail, FiMessageSquare, FiCheckCircle, FiHome, FiUser,
} from "react-icons/fi";
import { inquiryService } from "../services/dataservice";
import { getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../context/authcontext.jsx";
import "./InquiryDetails.css";

const STATUS_COLORS = {
  pending: "#f59e0b",
  responded: "#3b82f6",
  scheduled: "#8b5cf6",
  completed: "#10b981",
  cancelled: "#ef4444",
};

const InquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, ] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const data = await inquiryService.getOne(id);
        setInquiry(data.inquiry);
      } catch (err) {
        err.consolelog("Failed to load inquiry.");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiry();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const data = await inquiryService.respond(id, replyText.trim());
      setInquiry(data.inquiry);
      setReplyText("");
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="inquiry-details-page">
        <div className="inquiry-loading">
          <div className="loading-spinner" />
          <p>Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="inquiry-details-page">
        <div className="inquiry-error">
          <FiMessageSquare />
          <h2>{error || "Inquiry not found"}</h2>
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const property = inquiry.property;
  const sender = inquiry.sender;
  const receiver = inquiry.receiver;
  const isSender = user?._id === sender?._id || user?.id === sender?._id;
  const statusColor = STATUS_COLORS[inquiry.status] || "#64748b";

  return (
    <div className="inquiry-details-page">
      <div className="inquiry-details-container">
        {/* Back Button */}
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="inquiry-details-header">
          <div className="inquiry-details-title">
            <h1>Inquiry Details</h1>
            <span
              className="inquiry-status-badge"
              style={{ backgroundColor: statusColor + "20", color: statusColor, borderColor: statusColor + "40" }}
            >
              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
            </span>
          </div>
          <p className="inquiry-created-at">
            <FiCalendar />
            Submitted on {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="inquiry-details-body">
          {/* Left Column */}
          <div className="inquiry-details-left">

            {/* Property Card */}
            <div className="id-card">
              <h2 className="id-card-title"><FiHome /> Property</h2>
              {property ? (
                <Link to={`/property/${property._id}`} className="id-property-link">
                  <img
                    src={getImageUrl(property.images?.[0]?.url || property.images?.[0])}
                    alt={property.title}
                    className="id-property-img"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400";
                    }}
                  />
                  <div className="id-property-info">
                    <h3>{property.title}</h3>
                    <p><FiMapPin /> {property.location?.city}{property.location?.state ? `, ${property.location.state}` : ""}</p>
                    {property.price && (
                      <p className="id-property-price">
                        ₹{property.price >= 10000000
                          ? `${(property.price / 10000000).toFixed(2)} Cr`
                          : property.price >= 100000
                          ? `${(property.price / 100000).toFixed(2)} Lac`
                          : property.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <p className="id-no-data">Property details unavailable</p>
              )}
            </div>

            {/* Inquiry Details */}
            <div className="id-card">
              <h2 className="id-card-title"><FiMessageSquare /> Your Message</h2>
              <div className="id-inquiry-type">
                <span>Type:</span>
                <span className="id-type-badge">{inquiry.inquiryType?.replace("-", " ")}</span>
              </div>
              <p className="id-message-text">{inquiry.message}</p>

              {/* Contact info */}
              <div className="id-contact-row">
                {inquiry.phone && (
                  <span><FiPhone /> {inquiry.phone}</span>
                )}
                {inquiry.email && (
                  <span><FiMail /> {inquiry.email}</span>
                )}
              </div>

              {/* Visit schedule */}
              {inquiry.preferredVisitDate && (
                <div className="id-visit-schedule">
                  <h4>Preferred Visit</h4>
                  <div className="id-visit-row">
                    <span><FiCalendar /> {new Date(inquiry.preferredVisitDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    {inquiry.preferredVisitTime && (
                      <span><FiClock /> {inquiry.preferredVisitTime}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* People */}
            <div className="id-card">
              <h2 className="id-card-title"><FiUser /> Parties</h2>
              <div className="id-parties">
                <div className="id-party">
                  <div className="id-avatar">{sender?.name?.charAt(0)?.toUpperCase()}</div>
                  <div>
                    <p className="id-party-name">{sender?.name} {isSender && <span className="id-you-tag">You</span>}</p>
                    <p className="id-party-role">Inquiry Sender</p>
                  </div>
                </div>
                <div className="id-party">
                  <div className="id-avatar id-avatar-owner">{receiver?.name?.charAt(0)?.toUpperCase()}</div>
                  <div>
                    <p className="id-party-name">{receiver?.name} {!isSender && <span className="id-you-tag">You</span>}</p>
                    <p className="id-party-role">Property Owner</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column — Responses */}
          <div className="inquiry-details-right">
            <div className="id-card id-responses-card">
              <h2 className="id-card-title"><FiMessageSquare /> Conversation</h2>

              <div className="id-conversation">
                {/* Original message bubble */}
                <div className="id-bubble id-bubble-sent">
                  <div className="id-bubble-meta">
                    <span>{sender?.name}</span>
                    <span>{new Date(inquiry.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p>{inquiry.message}</p>
                </div>

                {/* Responses */}
                {inquiry.responses?.length > 0 ? (
                  inquiry.responses.map((res, i) => {
                    const isOwn =
                      user?._id === res.responder?._id ||
                      user?.id === res.responder?._id;
                    return (
                      <div key={i} className={`id-bubble ${isOwn ? "id-bubble-sent" : "id-bubble-received"}`}>
                        <div className="id-bubble-meta">
                          <span>{res.responder?.name || "User"}</span>
                          <span>{new Date(res.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <p>{res.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="id-no-responses">
                    <p>No replies yet. The owner will respond soon.</p>
                  </div>
                )}

                {inquiry.status === "completed" && (
                  <div className="id-status-marker">
                    <FiCheckCircle /> Inquiry marked as completed
                  </div>
                )}
              </div>

              {/* Reply box — only if inquiry is still active */}
              {inquiry.status !== "cancelled" && inquiry.status !== "completed" && (
                <form className="id-reply-form" onSubmit={handleReply}>
                  <textarea
                    className="id-reply-input"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    required
                  />
                  {replySuccess && (
                    <p className="id-reply-success"><FiCheckCircle /> Reply sent!</p>
                  )}
                  <button type="submit" className="id-reply-btn" disabled={sending}>
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetails;

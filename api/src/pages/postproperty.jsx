import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiHome, FiMapPin, FiDollarSign, FiImage, FiCheck, FiPlus, FiX, FiUpload
} from "react-icons/fi";
import { propertyService } from "../services/propertyservice";
import { useAuth } from "../context/authcontext.jsx";
import "./PostProperty.css";

const PostProperty = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        // Basic Info
        title: "",
        description: "",
        listingType: "buy",
        propertyType: "apartment",

        // Location
        location: {
            address: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
        },

        // Specifications
        specifications: {
            bedrooms: "",
            bathrooms: "",
            carpetArea: "",
            builtUpArea: "",
            floorNumber: "",
            totalFloors: "",
            balconies: "",
            furnishing: "",
            facing: "",
            ageOfProperty: "",
            possessionStatus: "ready-to-move",
        },

        // Pricing
        price: "",
        priceBreakdown: {
            maintenanceCharges: "",
            negotiable: false,
        },

        // Amenities
        amenities: [],

        // Highlights
        highlights: [],

        // Images (URLs for now, will add file upload later)
        images: [],
    });

    const propertyTypes = [
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "Independent House" },
        { value: "villa", label: "Villa" },
        { value: "plot", label: "Plot/Land" },
        { value: "commercial", label: "Commercial" },
        { value: "office", label: "Office Space" },
        { value: "shop", label: "Shop/Showroom" },
    ];

    const amenitiesList = [
        "parking", "lift", "power-backup", "gated-security", "swimming-pool",
        "gym", "clubhouse", "garden", "playground", "intercom",
        "fire-safety", "water-supply", "gas-pipeline", "air-conditioning",
        "internet", "cctv", "pet-friendly", "visitor-parking", "rainwater-harvesting",
        "solar-panels", "waste-disposal", "maintenance-staff", "shopping-center", "hospital-nearby"
    ];

    const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
        "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Noida", "Gurgaon"
    ];

    const states = [
        "Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal",
        "Uttar Pradesh", "Gujarat", "Rajasthan", "Haryana"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: type === "checkbox" ? checked : value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value,
            });
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleAmenityToggle = (amenity) => {
        const current = formData.amenities;
        if (current.includes(amenity)) {
            setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
        } else {
            setFormData({ ...formData, amenities: [...current, amenity] });
        }
    };

    const handleHighlightAdd = () => {
        const highlight = document.getElementById("highlight-input").value.trim();
        if (highlight && formData.highlights.length < 6) {
            setFormData({ ...formData, highlights: [...formData.highlights, highlight] });
            document.getElementById("highlight-input").value = "";
        }
    };

    const handleHighlightRemove = (index) => {
        setFormData({
            ...formData,
            highlights: formData.highlights.filter((_, i) => i !== index),
        });
    };

    const handleImageAdd = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxImages = 10;
        
        if (formData.images.length >= maxImages) {
            setErrors({ ...errors, imageFile: `Maximum ${maxImages} images allowed` });
            return;
        }
        
        Array.from(files).forEach((file) => {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                setErrors({ ...errors, imageFile: "Only JPG, PNG, WebP, and GIF files are allowed" });
                return;
            }
            
            // Validate file size
            if (file.size > maxSize) {
                setErrors({ ...errors, imageFile: "Each image must be less than 5MB" });
                return;
            }
            
            // Check total images don't exceed limit
            if (formData.images.length >= maxImages) {
                setErrors({ ...errors, imageFile: `Maximum ${maxImages} images allowed` });
                return;
            }
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({
                    ...formData,
                    images: [...formData.images, { 
                        file,
                        url: event.target.result, // Data URL for preview
                        caption: "", 
                        isPrimary: formData.images.length === 0 
                    }]
                });
            };
            reader.readAsDataURL(file);
        });
        
        // Reset input
        e.target.value = '';
        setErrors({ ...errors, imageFile: "" });
    };

    const handleImageRemove = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index),
        });
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = "Title is required";
            if (!formData.description.trim()) newErrors.description = "Description is required";
        }

        if (step === 2) {
            if (!formData.location.address.trim()) newErrors["location.address"] = "Address is required";
            if (!formData.location.city) newErrors["location.city"] = "City is required";
            if (!formData.location.state) newErrors["location.state"] = "State is required";
            if (!formData.location.pincode.trim()) newErrors["location.pincode"] = "Pincode is required";
        }

        if (step === 3) {
            if (formData.propertyType !== "plot" && !formData.specifications.bedrooms) {
                newErrors["specifications.bedrooms"] = "Bedrooms required";
            }
            if (!formData.specifications.carpetArea) {
                newErrors["specifications.carpetArea"] = "Area is required";
            }
        }

        if (step === 4) {
            if (!formData.price) newErrors.price = "Price is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setLoading(true);
        try {
            // Clean up specifications - remove empty strings for optional enum fields
            const cleanedSpecifications = {
                bedrooms: Number(formData.specifications.bedrooms) || 0,
                bathrooms: Number(formData.specifications.bathrooms) || 0,
                carpetArea: Number(formData.specifications.carpetArea) || 0,
                balconies: Number(formData.specifications.balconies) || 0,
                ageOfProperty: Number(formData.specifications.ageOfProperty) || 0,
            };

            // Only add these if they have values
            if (formData.specifications.builtUpArea) {
                cleanedSpecifications.builtUpArea = Number(formData.specifications.builtUpArea);
            }
            if (formData.specifications.floorNumber) {
                cleanedSpecifications.floorNumber = Number(formData.specifications.floorNumber);
            }
            if (formData.specifications.totalFloors) {
                cleanedSpecifications.totalFloors = Number(formData.specifications.totalFloors);
            }
            if (formData.specifications.furnishing) {
                cleanedSpecifications.furnishing = formData.specifications.furnishing;
            }
            if (formData.specifications.facing) {
                cleanedSpecifications.facing = formData.specifications.facing;
            }
            if (formData.specifications.possessionStatus) {
                cleanedSpecifications.possessionStatus = formData.specifications.possessionStatus;
            }

            // Check if any images have file objects
            const hasFileUploads = formData.images.some(img => img.file instanceof File);

            if (hasFileUploads) {
                // Use FormData for file uploads
                const formDataObj = new FormData();
                
                // Add basic fields
                formDataObj.append('title', formData.title);
                formDataObj.append('description', formData.description);
                formDataObj.append('listingType', formData.listingType);
                formDataObj.append('propertyType', formData.propertyType);
                formDataObj.append('price', Number(formData.price));
                formDataObj.append('owner', user._id);
                
                // Add location
                formDataObj.append('location', JSON.stringify(formData.location));
                
                // Add specifications
                formDataObj.append('specifications', JSON.stringify(cleanedSpecifications));
                
                // Add amenities
                formDataObj.append('amenities', JSON.stringify(formData.amenities));
                
                // Add highlights
                formDataObj.append('highlights', JSON.stringify(formData.highlights));
                
                // Add price breakdown
                formDataObj.append('priceBreakdown', JSON.stringify({
                    maintenanceCharges: Number(formData.priceBreakdown.maintenanceCharges) || 0,
                }));
                
                // Add image files
                formData.images.forEach((img) => {
                    if (img.file instanceof File) {
                        formDataObj.append('images', img.file);
                    }
                });
                
                // Add metadata for primary image
                const primaryIndex = formData.images.findIndex(img => img.isPrimary);
                formDataObj.append('primaryImageIndex', primaryIndex >= 0 ? primaryIndex : 0);
                
                console.log("Submitting property with file uploads");
                
                // Make direct API call with FormData
                const api = (await import('../services/api')).default;
                await api.post('/properties', formDataObj, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Original JSON submission (no file uploads)
                const propertyData = {
                    title: formData.title,
                    description: formData.description,
                    listingType: formData.listingType,
                    propertyType: formData.propertyType,
                    price: Number(formData.price),
                    location: formData.location,
                    specifications: cleanedSpecifications,
                    amenities: formData.amenities,
                    highlights: formData.highlights,
                    images: formData.images.length > 0 ? formData.images : [{ url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E", isPrimary: true }],
                    priceBreakdown: {
                        maintenanceCharges: Number(formData.priceBreakdown.maintenanceCharges) || 0,
                    },
                    owner: user._id,
                };

                console.log("Submitting property data:", propertyData);

                await propertyService.createProperty(propertyData);
            }

            navigate("/seller/dashboard");
        } catch (error) {
            console.error("Error creating property:", error);
            console.error("Error response:", error.response?.data);
            
            // Display detailed error message
            const errorMessage = error.response?.data?.details || 
                                error.response?.data?.message || 
                                "Failed to create property. Please check all required fields.";
            
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, label: "Basic Info", icon: FiHome },
        { number: 2, label: "Location", icon: FiMapPin },
        { number: 3, label: "Details", icon: FiHome },
        { number: 4, label: "Pricing", icon: FiDollarSign },
        { number: 5, label: "Amenities", icon: FiCheck },
    ];

    return (
        <div className="post-property-page">
            <div className="post-property-container">
                {/* Progress Steps */}
                <div className="progress-steps">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`step ${currentStep >= step.number ? "active" : ""} ${currentStep > step.number ? "completed" : ""}`}
                        >
                            <div className="step-icon">
                                {currentStep > step.number ? <FiCheck /> : <step.icon />}
                            </div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="form-content">
                    {errors.submit && (
                        <div className="error-banner">{errors.submit}</div>
                    )}

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="form-step">
                                
                            <h2>Basic Information</h2>
                            <p className="step-description">Tell us about your property</p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Property Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., 3 BHK Apartment in Sector 62"
                                        className={errors.title ? "error" : ""}
                                    />
                                    {errors.title && <span className="error-text">{errors.title}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Listing Type *</label>
                                    <div className="radio-group">
                                        <label className={`radio-option ${formData.listingType === "buy" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="listingType"
                                                value="buy"
                                                checked={formData.listingType === "buy"}
                                                onChange={handleChange}
                                            />
                                            <span>Sell</span>
                                        </label>
                                        <label className={`radio-option ${formData.listingType === "rent" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="listingType"
                                                value="rent"
                                                checked={formData.listingType === "rent"}
                                                onChange={handleChange}
                                            />
                                            <span>Rent</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Property Type *</label>
                                    <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                                        {propertyTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your property in detail..."
                                        rows={5}
                                        className={errors.description ? "error" : ""}
                                    />
                                    {errors.description && <span className="error-text">{errors.description}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2>Property Location</h2>
                            <p className="step-description">Where is your property located?</p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Address *</label>
                                    <input
                                        type="text"
                                        name="location.address"
                                        value={formData.location.address}
                                        onChange={handleChange}
                                        placeholder="Building name, Street name"
                                        className={errors["location.address"] ? "error" : ""}
                                    />
                                    {errors["location.address"] && <span className="error-text">{errors["location.address"]}</span>}
                                </div>

                                <div className="form-group">
                                    <label>City *</label>
                                    <select
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleChange}
                                        className={errors["location.city"] ? "error" : ""}
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    {errors["location.city"] && <span className="error-text">{errors["location.city"]}</span>}
                                </div>

                                <div className="form-group">
                                    <label>State *</label>
                                    <select
                                        name="location.state"
                                        value={formData.location.state}
                                        onChange={handleChange}
                                        className={errors["location.state"] ? "error" : ""}
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {errors["location.state"] && <span className="error-text">{errors["location.state"]}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        name="location.pincode"
                                        value={formData.location.pincode}
                                        onChange={handleChange}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                        className={errors["location.pincode"] ? "error" : ""}
                                    />
                                    {errors["location.pincode"] && <span className="error-text">{errors["location.pincode"]}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Landmark</label>
                                    <input
                                        type="text"
                                        name="location.landmark"
                                        value={formData.location.landmark}
                                        onChange={handleChange}
                                        placeholder="Near metro station, hospital, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Specifications */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2>Property Details</h2>
                            <p className="step-description">Provide specifications about your property</p>

                            <div className="form-grid">
                                {formData.propertyType !== "plot" && (
                                    <>
                                        <div className="form-group">
                                            <label>Bedrooms *</label>
                                            <select
                                                name="specifications.bedrooms"
                                                value={formData.specifications.bedrooms}
                                                onChange={handleChange}
                                                className={errors["specifications.bedrooms"] ? "error" : ""}
                                            >
                                                <option value="">Select</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                    <option key={n} value={n}>{n} BHK</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Bathrooms</label>
                                            <select
                                                name="specifications.bathrooms"
                                                value={formData.specifications.bathrooms}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                {[1, 2, 3, 4, 5, 6].map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Balconies</label>
                                            <select
                                                name="specifications.balconies"
                                                value={formData.specifications.balconies}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                {[0, 1, 2, 3, 4, 5].map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Carpet Area (sq.ft) *</label>
                                    <input
                                        type="number"
                                        name="specifications.carpetArea"
                                        value={formData.specifications.carpetArea}
                                        onChange={handleChange}
                                        placeholder="e.g., 1200"
                                        className={errors["specifications.carpetArea"] ? "error" : ""}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Built-up Area (sq.ft)</label>
                                    <input
                                        type="number"
                                        name="specifications.builtUpArea"
                                        value={formData.specifications.builtUpArea}
                                        onChange={handleChange}
                                        placeholder="e.g., 1500"
                                    />
                                </div>

                                {formData.propertyType !== "plot" && (
                                    <>
                                        <div className="form-group">
                                            <label>Floor Number</label>
                                            <input
                                                type="number"
                                                name="specifications.floorNumber"
                                                value={formData.specifications.floorNumber}
                                                onChange={handleChange}
                                                placeholder="e.g., 5"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Total Floors</label>
                                            <input
                                                type="number"
                                                name="specifications.totalFloors"
                                                value={formData.specifications.totalFloors}
                                                onChange={handleChange}
                                                placeholder="e.g., 12"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Furnishing</label>
                                            <select
                                                name="specifications.furnishing"
                                                value={formData.specifications.furnishing}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="unfurnished">Unfurnished</option>
                                                <option value="semi-furnished">Semi-Furnished</option>
                                                <option value="fully-furnished">Fully Furnished</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Facing</label>
                                            <select
                                                name="specifications.facing"
                                                value={formData.specifications.facing}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="north">North</option>
                                                <option value="south">South</option>
                                                <option value="east">East</option>
                                                <option value="west">West</option>
                                                <option value="north-east">North-East</option>
                                                <option value="north-west">North-West</option>
                                                <option value="south-east">South-East</option>
                                                <option value="south-west">South-West</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Age of Property (years)</label>
                                    <input
                                        type="number"
                                        name="specifications.ageOfProperty"
                                        value={formData.specifications.ageOfProperty}
                                        onChange={handleChange}
                                        placeholder="e.g., 2"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Possession Status</label>
                                    <select
                                        name="specifications.possessionStatus"
                                        value={formData.specifications.possessionStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="ready">Ready to Move</option>
                                        <option value="under-construction">Under Construction</option>
                                        <option value="new-launch">New Launch</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Parking Slots</label>
                                    <input
                                        type="number"
                                        name="specifications.parkingSlots"
                                        value={formData.specifications.parkingSlots}
                                        onChange={handleChange}
                                        placeholder="e.g., 1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Pricing */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <h2>Pricing Details</h2>
                            <p className="step-description">Set the price for your property</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder={formData.listingType === "rent" ? "Monthly rent" : "Property price"}
                                        className={errors.price ? "error" : ""}
                                    />
                                    {errors.price && <span className="error-text">{errors.price}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Maintenance Charges (₹/month)</label>
                                    <input
                                        type="number"
                                        name="priceBreakdown.maintenanceCharges"
                                        value={formData.priceBreakdown.maintenanceCharges}
                                        onChange={handleChange}
                                        placeholder="e.g., 5000"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="priceBreakdown.negotiable"
                                            checked={formData.priceBreakdown.negotiable}
                                            onChange={handleChange}
                                        />
                                        <span>Price is negotiable</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Amenities & Highlights */}
                    {currentStep === 5 && (
                        <div className="form-step">
                            <h2>Media, Amenities & Highlights</h2>
                            <p className="step-description">Add photos and features to make your property stand out</p>

                            <div className="section">
                                <h3>Property Images</h3>
                                <p className="section-note">Upload photos (JPG, PNG, WebP) - Max 10 images, 5MB each</p>
                                <div className="highlights-input">
                                    <input
                                        type="file"
                                        id="image-file-input"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleImageAdd}
                                        disabled={formData.images.length >= 10}
                                        style={{ display: 'block', marginBottom: '12px' }}
                                    />
                                </div>
                                {errors.imageFile && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{errors.imageFile}</p>}
                                
                                {formData.images.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #d1d5db', marginTop: '16px' }}>
                                        <FiImage style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '12px' }} />
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No images added yet</p>
                                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Add at least one image to showcase your property</p>
                                    </div>
                                ) : (
                                    <div className="image-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="image-preview-card" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', background: '#f3f4f6' }}>
                                                {img.isPrimary && (
                                                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#f97316', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                        Main Photo
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => handleImageRemove(index)} 
                                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#ef4444'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                                                >
                                                    <FiX size={16} />
                                                </button>
                                                <img 
                                                    src={img.url} 
                                                    alt={`Property ${index + 1}`}
                                                    style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '150px', background: '#fee2e2', color: '#991b1b', flexDirection: 'column', gap: '8px' }}>
                                                    <FiImage size={24} />
                                                    <span style={{ fontSize: '0.75rem', textAlign: 'center', padding: '0 8px' }}>Failed to load</span>
                                                </div>
                                                <div style={{ padding: '8px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>Image {index + 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '12px' }}>
                                    💡 Tip: Use high-quality images from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" style={{ color: '#06d6a0' }}>Unsplash</a> or upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" style={{ color: '#06d6a0' }}>Imgur</a>
                                </p>
                            </div>

                            <div className="section">
                                <h3>Amenities</h3>
                                <div className="amenities-grid">
                                    {amenitiesList.map((amenity) => (
                                        <label
                                            key={amenity}
                                            className={`amenity-option ${formData.amenities.includes(amenity) ? "selected" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.amenities.includes(amenity)}
                                                onChange={() => handleAmenityToggle(amenity)}
                                            />
                                            <span>{amenity.replace(/-/g, " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="section">
                                <h3>Property Highlights</h3>
                                <p className="section-note">Add up to 6 key highlights about your property</p>
                                <div className="highlights-input">
                                    <input
                                        type="text"
                                        id="highlight-input"
                                        placeholder="e.g., Corner flat with extra ventilation"
                                        maxLength={100}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleHighlightAdd}
                                        disabled={formData.highlights.length >= 6}
                                    >
                                        <FiPlus /> Add
                                    </button>
                                </div>
                                <div className="highlights-list">
                                    {formData.highlights.map((highlight, index) => (
                                        <span key={index} className="highlight-tag">
                                            {highlight}
                                            <button onClick={() => handleHighlightRemove(index)}>
                                                <FiX />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button type="button" className="btn-outline" onClick={handlePrev}>
                                Previous
                            </button>
                        )}
                        {currentStep < 5 ? (
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Publishing..." : "Publish Property"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostProperty;

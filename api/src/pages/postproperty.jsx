import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiImage,
  FiCheck,
  FiPlus,
  FiX,
  FiUpload,
} from 'react-icons/fi';
import { propertyService } from '../services/propertyservice';
import { useAuth } from '../context/authcontext.jsx';
import './PostProperty.css';
const PostProperty = () => {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const isEditMode = Boolean(propertyId);
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    listingType: 'buy',
    propertyType: 'apartment',

    // Location
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    },

    // Specifications
    specifications: {
      bedrooms: '',
      bathrooms: '',
      carpetArea: '',
      builtUpArea: '',
      floorNumber: '',
      totalFloors: '',
      balconies: '',
      furnishing: '',
      facing: '',
      ageOfProperty: '',
      possessionStatus: 'ready-to-move',
    },

    // Pricing
    price: '',
    priceBreakdown: {
      maintenanceCharges: '',
      negotiable: false,
    },

    // Amenities
    amenities: [],

    // Highlights
    highlights: [],

    // Images (URLs for now, will add file upload later)
    images: [],
  });

  // Ensure all inputs are controlled by setting initial defaults
  useEffect(() => {
    // Provide fallback values to ensure inputs never transition from uncontrolled to controlled
    setFormData((prev) => ({
      ...prev,
      location: {
        address: prev.location.address ?? '',
        city: prev.location.city ?? '',
        state: prev.location.state ?? '',
        pincode: prev.location.pincode ?? '',
        landmark: prev.location.landmark ?? '',
      },
      specifications: {
        bedrooms: prev.specifications.bedrooms ?? '',
        bathrooms: prev.specifications.bathrooms ?? '',
        carpetArea: prev.specifications.carpetArea ?? '',
        builtUpArea: prev.specifications.builtUpArea ?? '',
        floorNumber: prev.specifications.floorNumber ?? '',
        totalFloors: prev.specifications.totalFloors ?? '',
        balconies: prev.specifications.balconies ?? '',
        furnishing: prev.specifications.furnishing ?? '',
        facing: prev.specifications.facing ?? '',
        ageOfProperty: prev.specifications.ageOfProperty ?? '',
        possessionStatus:
          prev.specifications.possessionStatus ?? 'ready-to-move',
      },
      priceBreakdown: {
        maintenanceCharges: prev.priceBreakdown.maintenanceCharges ?? '',
        negotiable: prev.priceBreakdown.negotiable ?? false,
      },
    }));
  }, []);

  // Pre-fill form when editing an existing property
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const data = await propertyService.getProperty(propertyId);
        const p = data.property || data;
        setFormData((prevState) => ({
          ...prevState,
          title: p.title ?? '',
          description: p.description ?? '',
          listingType: p.listingType ?? 'buy',
          propertyType: p.propertyType ?? 'apartment',
          location: {
            address: p.location?.address ?? '',
            city: p.location?.city ?? '',
            state: p.location?.state ?? '',
            pincode: p.location?.pincode ?? '',
            landmark: p.location?.landmark ?? '',
          },
          specifications: {
            bedrooms: p.specifications?.bedrooms ?? '',
            bathrooms: p.specifications?.bathrooms ?? '',
            carpetArea: p.specifications?.carpetArea ?? '',
            builtUpArea: p.specifications?.builtUpArea ?? '',
            floorNumber: p.specifications?.floorNumber ?? '',
            totalFloors: p.specifications?.totalFloors ?? '',
            balconies: p.specifications?.balconies ?? '',
            furnishing: p.specifications?.furnishing ?? '',
            facing: p.specifications?.facing ?? '',
            ageOfProperty: p.specifications?.ageOfProperty ?? '',
            possessionStatus:
              p.specifications?.possessionStatus ?? 'ready-to-move',
          },
          price: p.price ?? '',
          priceBreakdown: {
            maintenanceCharges: p.priceBreakdown?.maintenanceCharges ?? '',
            negotiable: p.priceBreakdown?.negotiable ?? false,
          },
          amenities: p.amenities ?? [],
          highlights: p.highlights ?? [],
          // Map server images to the local format (no file object — these are existing)
          images: (p.images || []).map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary || false,
            file: null,
          })),
        }));
      } catch {
        setErrors({
          submit: 'Failed to load property data. Please try again.',
        });
      } finally {
        setLoadingProperty(false);
      }
    })();
  }, [isEditMode, propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'Independent House' },
    { value: 'villa', label: 'Villa' },
    { value: 'plot', label: 'Plot/Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office Space' },
    { value: 'shop', label: 'Shop/Showroom' },
  ];

  const amenitiesList = [
    'parking',
    'lift',
    'power-backup',
    'gated-security',
    'swimming-pool',
    'gym',
    'clubhouse',
    'garden',
    'playground',
    'intercom',
    'fire-safety',
    'water-supply',
    'gas-pipeline',
    'air-conditioning',
    'internet',
    'cctv',
    'pet-friendly',
    'visitor-parking',
    'rainwater-harvesting',
    'solar-panels',
    'waste-disposal',
    'maintenance-staff',
    'shopping-center',
    'hospital-nearby',
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Noida',
    'Gurgaon',
  ];

  const states = [
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Telangana',
    'Tamil Nadu',
    'West Bengal',
    'Uttar Pradesh',
    'Gujarat',
    'Rajasthan',
    'Haryana',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
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
      setFormData({
        ...formData,
        amenities: current.filter((a) => a !== amenity),
      });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const handleHighlightAdd = () => {
    const highlight = document.getElementById('highlight-input').value.trim();
    if (highlight && formData.highlights.length < 6) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, highlight],
      });
      document.getElementById('highlight-input').value = '';
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;
    const maxImages = 6 - formData.images.length;

    if (formData.images.length >= maxImages) {
      setErrors({
        ...errors,
        imageFile: `Maximum ${maxImages} images allowed`,
      });
      return;
    }

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          imageFile: 'Only JPG,PNG,WebP files are allowed',
        });
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setErrors({ ...errors, imageFile: 'Each image must be less than 2MB' });
        return;
      }

      // Check total images don't exceed limit
      if (formData.images.length >= maxImages) {
        setErrors({
          ...errors,
          imageFile: `Maximum ${maxImages} images allowed`,
        });
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          images: [
            ...formData.images,
            {
              file,
              url: event.target.result, // Data URL for preview
              caption: '',
              isPrimary: formData.images.length === 0,
            },
          ],
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
    setErrors({ ...errors, imageFile: '' });
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
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim())
        newErrors.description = 'Description is required';
    }

    if (step === 2) {
      if (!formData.location.address.trim())
        newErrors['location.address'] = 'Address is required';
      if (!formData.location.city)
        newErrors['location.city'] = 'City is required';
      if (!formData.location.state)
        newErrors['location.state'] = 'State is required';
      if (!formData.location.pincode.trim())
        newErrors['location.pincode'] = 'Pincode is required';
    }

    if (step === 3) {
      if (
        formData.propertyType !== 'plot' &&
        !formData.specifications.bedrooms
      ) {
        newErrors['specifications.bedrooms'] = 'Bedrooms required';
      }
      if (!formData.specifications.carpetArea) {
        newErrors['specifications.carpetArea'] = 'Area is required';
      }
    }

    if (step === 4) {
      if (!formData.price) newErrors.price = 'Price is required';
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
    if (!validateStep(2)) return;

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
        cleanedSpecifications.builtUpArea = Number(
          formData.specifications.builtUpArea
        );
      }
      if (formData.specifications.floorNumber) {
        cleanedSpecifications.floorNumber = Number(
          formData.specifications.floorNumber
        );
      }
      if (formData.specifications.totalFloors) {
        cleanedSpecifications.totalFloors = Number(
          formData.specifications.totalFloors
        );
      }
      if (formData.specifications.furnishing) {
        cleanedSpecifications.furnishing = formData.specifications.furnishing;
      }
      if (formData.specifications.facing) {
        cleanedSpecifications.facing = formData.specifications.facing;
      }
      if (formData.specifications.possessionStatus) {
        cleanedSpecifications.possessionStatus =
          formData.specifications.possessionStatus;
      }

      // Check if any images have new file objects
      const hasNewFiles = formData.images.some(
        (img) => img.file instanceof File
      );

      // Existing images (loaded from server, no File object)
      const existingImages = formData.images
        .filter((img) => !(img.file instanceof File))
        .map(({ url, isPrimary }) => ({ url, isPrimary }));

      if (hasNewFiles || isEditMode) {
        // Use FormData so we can send new files + preserve existing images
        const formDataObj = new FormData();

        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description);
        formDataObj.append('listingType', formData.listingType);
        formDataObj.append('propertyType', formData.propertyType);
        formDataObj.append('price', Number(formData.price));
        if (!isEditMode) formDataObj.append('owner', user._id);

        formDataObj.append('location', JSON.stringify(formData.location));
        formDataObj.append(
          'specifications',
          JSON.stringify(cleanedSpecifications)
        );
        formDataObj.append('amenities', JSON.stringify(formData.amenities));
        formDataObj.append('highlights', JSON.stringify(formData.highlights));
        formDataObj.append(
          'priceBreakdown',
          JSON.stringify({
            maintenanceCharges:
              Number(formData.priceBreakdown.maintenanceCharges) || 0,
          })
        );

        // Send existing image URLs so server can preserve them
        formDataObj.append('existingImages', JSON.stringify(existingImages));

        // Append any new file uploads
        formData.images.forEach((img) => {
          if (img.file instanceof File) {
            formDataObj.append('images', img.file);
          }
        });

        const primaryIndex = formData.images.findIndex((img) => img.isPrimary);
        formDataObj.append(
          'primaryImageIndex',
          primaryIndex >= 0 ? primaryIndex : 0
        );

        const api = (await import('../services/api')).default;
        if (isEditMode) {
          await api.put(`/properties/${propertyId}`, formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/properties', formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
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
          images:
            formData.images.length > 0
              ? formData.images.map(({ url, isPrimary }) => ({
                  url,
                  isPrimary,
                }))
              : [
                  {
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
                    isPrimary: true,
                  },
                ],
          priceBreakdown: {
            maintenanceCharges:
              Number(formData.priceBreakdown.maintenanceCharges) || 0,
          },
          ...(!isEditMode && { owner: user._id }),
        };

        if (isEditMode) {
          await propertyService.updateProperty(propertyId, propertyData);
        } else {
          await propertyService.createProperty(propertyData);
        }
      }

      navigate('/seller/dashboard');
    } catch (error) {
      console.error(
        isEditMode ? 'Error updating property:' : 'Error creating property:',
        error
      );
      console.error('Error response:', error.response?.data);

      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        (isEditMode
          ? 'Failed to update property.'
          : 'Failed to create property. Please check all required fields.');

      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Basic Info', sub: 'Type & description', icon: FiHome },
    { number: 2, label: 'Location', sub: 'Address & city', icon: FiMapPin },
    { number: 3, label: 'Details', sub: 'Size & specs', icon: FiHome },
    { number: 4, label: 'Pricing', sub: 'Price & payment', icon: FiDollarSign },
    { number: 5, label: 'Media', sub: 'Photos & amenities', icon: FiImage },
  ];

  const stepSpec = (field, min, max) => ({
    dec: () =>
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: Math.max(min, Number(prev.specifications[field] || min) - 1),
        },
      })),
    inc: () =>
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: Math.min(max, Number(prev.specifications[field] || min) + 1),
        },
      })),
    val:
      formData.specifications[field] === ''
        ? min
        : Number(formData.specifications[field]),
  });
  const beds = stepSpec('bedrooms', 1, 10);
  const baths = stepSpec('bathrooms', 1, 6);
  const balcs = stepSpec('balconies', 0, 5);

  if (loadingProperty) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading property…</p>
      </div>
    );
  }

  return (
    <div className="pp-root">
      {/* ── Sidebar ── */}
      <aside className="pp-aside">
        <div className="pp-brand">
          <span className="pp-brand-dot" />
          <span className="pp-brand-name">UrbanStay</span>
        </div>
        <p className="pp-brand-sub">
          {isEditMode ? 'Edit your property' : 'List your property'}
        </p>

        <nav className="pp-step-rail">
          {steps.map((s) => (
            <div
              key={s.number}
              className={`pp-step-item${currentStep === s.number ? ' s-active' : ''}${currentStep > s.number ? ' s-completed' : ''}`}
            >
              <div className="pp-step-circle">
                {currentStep > s.number ? <FiCheck size={14} /> : s.number}
              </div>
              <div className="pp-step-meta">
                <span className="pp-step-name">{s.label}</span>
                <span className="pp-step-sub">{s.sub}</span>
              </div>
            </div>
          ))}
        </nav>

        <div className="pp-aside-footer">
          <p>Need help?</p>
          <a href="mailto:support@urbanstay.in">support@urbanstay.com</a>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="pp-main">
        <div className="pp-main-inner">
          {errors.submit && (
            <div className="pp-error-banner">
              <FiX size={16} /> {errors.submit}
            </div>
          )}

          {/* ── Step 1 ── */}
          {currentStep === 1 && (
            <>
              <div className="pp-step-header">
                <span className="pp-step-counter">Step 1 / 5</span>
                <h1>Basic Information</h1>
                <p>
                  Tell us about your property — what it is and how you want to
                  list it.
                </p>
              </div>

              {/* Listing type tiles */}
              <div className="pp-field pp-full">
                <span className="pp-label">Listing Type</span>
                <div className="pp-type-tiles">
                  <button
                    type="button"
                    className={`pp-type-tile${formData.listingType === 'buy' ? ' pp-tile-active' : ''}`}
                    onClick={() =>
                      setFormData({ ...formData, listingType: 'buy' })
                    }
                  >
                    <FiHome size={22} />
                    <strong>Sell</strong>
                    <span>One-time ownership transfer</span>
                  </button>
                  <button
                    type="button"
                    className={`pp-type-tile${formData.listingType === 'rent' ? ' pp-tile-active' : ''}`}
                    onClick={() =>
                      setFormData({ ...formData, listingType: 'rent' })
                    }
                  >
                    <FiMapPin size={22} />
                    <strong>Rent</strong>
                    <span>Monthly rental income</span>
                  </button>
                </div>
              </div>

              <div className="pp-section-divider" />

              {/* Property type pills */}
              <div className="pp-field pp-full">
                <span className="pp-label">Property Type</span>
                <div className="pp-proptype-row">
                  {propertyTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`pp-proptype-pill${formData.propertyType === t.value ? ' pp-pill-active' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, propertyType: t.value })
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pp-section-divider" />

              {/* Title + Description */}
              <div className="pp-grid">
                <div
                  className={`pp-field pp-full${errors.title ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label" htmlFor="pp-title">
                    Property Title <span>*</span>
                  </label>
                  <input
                    id="pp-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., 3 BHK Apartment in Sector 62"
                  />
                  {errors.title && (
                    <span className="pp-err-msg">{errors.title}</span>
                  )}
                </div>

                <div
                  className={`pp-field pp-full${errors.description ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label" htmlFor="pp-desc">
                    Description <span>*</span>
                  </label>
                  <textarea
                    id="pp-desc"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property — layout, surroundings, unique features…"
                    rows={5}
                  />
                  {errors.description && (
                    <span className="pp-err-msg">{errors.description}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {currentStep === 2 && (
            <>
              <div className="pp-step-header">
                <span className="pp-step-counter">Step 2 / 5</span>
                <h1>Property Location</h1>
                <p>
                  Where is your property? Accurate location helps buyers find
                  you faster.
                </p>
              </div>

              <div className="pp-grid">
                <div
                  className={`pp-field pp-full${errors['location.address'] ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    Street Address <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder="Building name, street, area"
                  />
                  {errors['location.address'] && (
                    <span className="pp-err-msg">
                      {errors['location.address']}
                    </span>
                  )}
                </div>

                <div
                  className={`pp-field${errors['location.city'] ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    City <span>*</span>
                  </label>
                  <select
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                  >
                    <option value="">Select city</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors['location.city'] && (
                    <span className="pp-err-msg">
                      {errors['location.city']}
                    </span>
                  )}
                </div>

                <div
                  className={`pp-field${errors['location.state'] ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    State <span>*</span>
                  </label>
                  <select
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                  >
                    <option value="">Select state</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors['location.state'] && (
                    <span className="pp-err-msg">
                      {errors['location.state']}
                    </span>
                  )}
                </div>

                <div
                  className={`pp-field${errors['location.pincode'] ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    Pincode <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors['location.pincode'] && (
                    <span className="pp-err-msg">
                      {errors['location.pincode']}
                    </span>
                  )}
                </div>

                <div className="pp-field">
                  <label className="pp-label">Landmark</label>
                  <input
                    type="text"
                    name="location.landmark"
                    value={formData.location.landmark}
                    onChange={handleChange}
                    placeholder="Near metro, hospital, school…"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {currentStep === 3 && (
            <>
              <div className="pp-step-header">
                <span className="pp-step-counter">Step 3 / 5</span>
                <h1>Property Details</h1>
                <p>
                  Size, floors, furnishing — the specifics that matter to
                  buyers.
                </p>
              </div>

              <div className="pp-grid">
                {formData.propertyType !== 'plot' && (
                  <>
                    <div
                      className={`pp-field${errors['specifications.bedrooms'] ? ' pp-field-err' : ''}`}
                    >
                      <span className="pp-label">
                        Bedrooms <span>*</span>
                      </span>
                      <div className="pp-stepper">
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={beds.dec}
                        >
                          −
                        </button>
                        <span>{beds.val} BHK</span>
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={beds.inc}
                        >
                          +
                        </button>
                      </div>
                      {errors['specifications.bedrooms'] && (
                        <span className="pp-err-msg">
                          {errors['specifications.bedrooms']}
                        </span>
                      )}
                    </div>

                    <div className="pp-field">
                      <span className="pp-label">Bathrooms</span>
                      <div className="pp-stepper">
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={baths.dec}
                        >
                          −
                        </button>
                        <span>{baths.val}</span>
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={baths.inc}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="pp-field">
                      <span className="pp-label">Balconies</span>
                      <div className="pp-stepper">
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={balcs.dec}
                        >
                          −
                        </button>
                        <span>{balcs.val}</span>
                        <button
                          type="button"
                          className="pp-stepper-btn"
                          onClick={balcs.inc}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div
                  className={`pp-field${errors['specifications.carpetArea'] ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    Carpet Area (sq.ft) <span>*</span>
                  </label>
                  <input
                    type="number"
                    name="specifications.carpetArea"
                    value={formData.specifications.carpetArea}
                    onChange={handleChange}
                    placeholder="e.g. 1200"
                  />
                  {errors['specifications.carpetArea'] && (
                    <span className="pp-err-msg">
                      {errors['specifications.carpetArea']}
                    </span>
                  )}
                </div>

                <div className="pp-field">
                  <label className="pp-label">Built-up Area (sq.ft)</label>
                  <input
                    type="number"
                    name="specifications.builtUpArea"
                    value={formData.specifications.builtUpArea}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                  />
                </div>

                {formData.propertyType !== 'plot' && (
                  <>
                    <div className="pp-field">
                      <label className="pp-label">Floor Number</label>
                      <input
                        type="number"
                        name="specifications.floorNumber"
                        value={formData.specifications.floorNumber}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                      />
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Total Floors</label>
                      <input
                        type="number"
                        name="specifications.totalFloors"
                        value={formData.specifications.totalFloors}
                        onChange={handleChange}
                        placeholder="e.g. 12"
                      />
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Furnishing</label>
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

                    <div className="pp-field">
                      <label className="pp-label">Facing</label>
                      <select
                        name="specifications.facing"
                        value={formData.specifications.facing}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        {[
                          'north',
                          'south',
                          'east',
                          'west',
                          'north-east',
                          'north-west',
                          'south-east',
                          'south-west',
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d
                              .replace(/-/g, '-')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="pp-field">
                  <label className="pp-label">Age of Property (yrs)</label>
                  <input
                    type="number"
                    name="specifications.ageOfProperty"
                    value={formData.specifications.ageOfProperty}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">Possession Status</label>
                  <select
                    name="specifications.possessionStatus"
                    value={formData.specifications.possessionStatus}
                    onChange={handleChange}
                  >
                    <option value="ready">Ready to Move</option>
                    <option value="under-construction">
                      Under Construction
                    </option>
                    <option value="new-launch">New Launch</option>
                  </select>
                </div>

                <div className="pp-field">
                  <label className="pp-label">Parking Slots</label>
                  <input
                    type="number"
                    name="specifications.parkingSlots"
                    value={formData.specifications.parkingSlots}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 4 ── */}
          {currentStep === 4 && (
            <>
              <div className="pp-step-header">
                <span className="pp-step-counter">Step 4 / 5</span>
                <h1>Pricing Details</h1>
                <p>
                  Set your asking price. You can always update it later from
                  your dashboard.
                </p>
              </div>
              <div className="pp-grid">
                <div
                  className={`pp-field pp-full${errors.price ? ' pp-field-err' : ''}`}
                >
                  <label className="pp-label">
                    {formData.listingType === 'rent'
                      ? 'Monthly Rent (₹)'
                      : 'Asking Price (₹)'}{' '}
                    <span>*</span>
                  </label>
                  <div className="pp-price-row">
                    <span className="pp-currency">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder={
                        formData.listingType === 'rent' ? '25000' : '8500000'
                      }
                    />
                  </div>
                  {formData.price && !errors.price && (
                    <span className="pp-price-hint">
                      ≈ ₹
                      {Number(formData.price) >= 10000000
                        ? (Number(formData.price) / 10000000).toFixed(2) + ' Cr'
                        : Number(formData.price) >= 100000
                          ? (Number(formData.price) / 100000).toFixed(2) + ' L'
                          : Number(formData.price).toLocaleString('en-IN')}
                    </span>
                  )}
                  {errors.price && (
                    <span className="pp-err-msg">{errors.price}</span>
                  )}
                </div>

                <div className="pp-field">
                  <label className="pp-label">Maintenance (₹/month)</label>
                  <input
                    type="number"
                    name="priceBreakdown.maintenanceCharges"
                    value={formData.priceBreakdown.maintenanceCharges}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="pp-field pp-full">
                  <div
                    className={`pp-toggle-row${formData.priceBreakdown.negotiable ? ' pp-toggle-on' : ''}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        priceBreakdown: {
                          ...formData.priceBreakdown,
                          negotiable: !formData.priceBreakdown.negotiable,
                        },
                      })
                    }
                  >
                    <div>
                      <p className="pp-toggle-label">Price is negotiable</p>
                      <p className="pp-toggle-sub">
                        Buyers will see a "negotiable" badge on your listing
                      </p>
                    </div>
                    <div
                      className={`pp-toggle-switch${formData.priceBreakdown.negotiable ? ' pp-toggle-on' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Step 5 ── */}
          {currentStep === 5 && (
            <>
              <div className="pp-step-header">
                <span className="pp-step-counter">Step 5 / 5</span>
                <h1>Media, Amenities &amp; Highlights</h1>
                <p>
                  Great photos and clear features dramatically improve enquiry
                  rates.
                </p>
              </div>

              {/* Upload zone */}
              <div className="pp-field pp-full">
                <span className="pp-label">Property Photos</span>
                <label
                  className={`pp-upload-zone${formData.images.length >= 10 ? ' pp-upload-disabled' : ''}`}
                  htmlFor="pp-img-input"
                >
                  <strong>Click to upload</strong>
                  <span>JPG, PNG, WebP · max 5 MB each · up to 10 photos</span>
                  <input
                    id="pp-img-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageAdd}
                    disabled={formData.images.length >= 10}
                    style={{ display: 'none' }}
                  />
                </label>
                {errors.imageFile && (
                  <span className="pp-err-msg">{errors.imageFile}</span>
                )}
              </div>

              {formData.images.length > 0 && (
                <div className="pp-img-grid">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="pp-img-card">
                      {img.isPrimary && (
                        <span className="pp-img-primary-badge">Main</span>
                      )}
                      <button
                        className="pp-img-remove"
                        onClick={() => handleImageRemove(idx)}
                        type="button"
                      >
                        <FiX size={14} />
                      </button>
                      <img src={img.url} alt={`property-${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}

              <div className="pp-section-divider" />

              {/* Amenities chips */}
              <div className="pp-field pp-full">
                <span className="pp-label">Amenities</span>
                <div className="pp-chips-grid">
                  {amenitiesList.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`pp-chip${formData.amenities.includes(a) ? ' pp-chip-on' : ''}`}
                      onClick={() => handleAmenityToggle(a)}
                    >
                      {formData.amenities.includes(a) && <FiCheck size={12} />}
                      {a.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pp-section-divider" />

              {/* Highlights */}
              <div className="pp-field pp-full">
                <span className="pp-label">
                  Key Highlights <small>(up to 6)</small>
                </span>
                <div className="pp-highlight-row">
                  <input
                    type="text"
                    id="highlight-input"
                    placeholder="e.g., Corner flat with extra ventilation"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    className="pp-highlight-add-btn"
                    onClick={handleHighlightAdd}
                    disabled={formData.highlights.length >= 6}
                  >
                    <FiPlus size={16} /> Add
                  </button>
                </div>
                {formData.highlights.length > 0 && (
                  <div className="pp-tags">
                    {formData.highlights.map((h, i) => (
                      <span key={i} className="pp-tag">
                        {h}
                        <button
                          type="button"
                          className="pp-tag-remove"
                          onClick={() => handleHighlightRemove(i)}
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Sticky nav bar ── */}
        <div className="pp-nav-bar">
          <span className="pp-nav-progress">
            Step <strong>{currentStep}</strong> of 5
          </span>
          <div className="pp-nav-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="pp-btn-back"
                onClick={handlePrev}
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                type="button"
                className="pp-btn-next"
                onClick={handleNext}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="pp-btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? 'Saving…'
                    : 'Publishing…'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Publish Property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProperty;

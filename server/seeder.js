const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Property = require("./models/property");
const Inquiry = require("./models/inquiry");
const Review = require("./models/review");
const Project = require("./models/project");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Inquiry.deleteMany({});
    await Review.deleteMany({});
    await Project.deleteMany({});
    console.log("Data cleared");

    // Create Users
    let users = [];
    try {
      const password = await bcrypt.hash("password123", 10);
      users = await User.insertMany([
        {
          name: "Admin User",
          email: "admin@example.com",
          password: password,
          role: "admin",
          phone: "9876543210",
        },
        {
          name: "John Seller",
          email: "seller@example.com",
          password: password,
          role: "seller",
          phone: "9876543211",
          companyName: "Premium Estates",
        },
        {
          name: "Jane Buyer",
          email: "buyer@example.com",
          password: password,
          role: "user",
          phone: "9876543212",
        },
      ]);
      console.log("Users created");
    } catch (err) {
      console.error("Error creating users:", err.message);
      process.exit(1);
    }

    const sellerId = users[1]._id;
    const buyerId = users[2]._id;

    // Create Properties - Insert one by one to debug
    const propertiesData = [
      {
        title: "Luxury 3 BHK Apartment in Bandra West",
        description:
          "Experience premium living in this spacious 3 BHK apartment with sea view. Features modern amenities, Italian marble flooring, and 24/7 security.",
        listingType: "buy",
        propertyType: "apartment",
        price: 45000000,
        location: {
          address: "12, Ocean View, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          landmark: "Near Bandstand",
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 3,
          balconies: 2,
          carpetArea: 1800,
          builtUpArea: 2200,
          floorNumber: 15,
          totalFloors: 25,
          furnishing: "semi-furnished",
          facing: "west",
          ageOfProperty: 2,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gym",
          "swimming-pool",
          "clubhouse",
          "gated-security",
          "parking",
          "lift",
          "power-backup",
        ],
        highlights: ["Sea View", "Italian Marble", "High Floor"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        isFeatured: true,
        status: "available",
      },
      {
        title: "Modern Villa in Whitefield",
        description:
          "Beautiful independent villa with private garden and terrace. Located in a gated community with top-class amenities.",
        listingType: "buy",
        propertyType: "villa",
        price: 32000000,
        location: {
          address: "45, Palm Meadows, Whitefield",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560066",
          landmark: "Near Forum Mall",
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 4,
          balconies: 3,
          carpetArea: 2800,
          builtUpArea: 3200,
          floorNumber: 0,
          totalFloors: 2,
          furnishing: "unfurnished",
          facing: "east",
          ageOfProperty: 0,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "garden",
          "clubhouse",
          "swimming-pool",
          "gym",
          "gated-security",
          "playground",
        ],
        highlights: ["Private Garden", "Terrace", "Gated Community"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "Furnished Office Space in Cyber City",
        description:
          "Ready-to-move commercial office space. Ideal for startups and IT companies. Walking distance from metro station.",
        listingType: "rent",
        propertyType: "office",
        price: 85000,
        location: {
          address: "Tower B, Cyber Hub, DLF Phase 2",
          city: "Gurgaon",
          state: "Haryana",
          pincode: "122002",
          landmark: "Cyber City Metro",
        },
        specifications: {
          carpetArea: 1200,
          builtUpArea: 1500,
          floorNumber: 8,
          totalFloors: 12,
          furnishing: "fully-furnished",
          facing: "north",
          ageOfProperty: 5,
          parkingSlots: 4,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "air-conditioning",
          "power-backup",
          "gated-security",
          "cctv",
          "internet",
        ],
        highlights: ["Near Metro", "Fully Furnished", "Cafeteria"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "2 BHK Apartment in Indiranagar",
        description:
          "Cozy 2 BHK apartment in the heart of the city. Close to parks, restaurants, and metro station. Perfect for small families.",
        listingType: "rent",
        propertyType: "apartment",
        price: 35000,
        location: {
          address: "88, 12th Main, Indiranagar",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560038",
          landmark: "Near Metro Station",
        },
        specifications: {
          bedrooms: 2,
          bathrooms: 2,
          balconies: 1,
          carpetArea: 1000,
          builtUpArea: 1200,
          floorNumber: 2,
          totalFloors: 4,
          furnishing: "semi-furnished",
          facing: "north",
          ageOfProperty: 8,
          parkingSlots: 1,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gated-security",
          "parking",
          "water-supply",
          "power-backup",
          "lift",
        ],
        highlights: ["Central Location", "Park Nearby"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
      {
        title: "Spacious 4 BHK Flat in Greater Kailash",
        description:
          "Premium builder floor in GK-1. High-end interiors, modular kitchen, and exclusive terrace rights.",
        listingType: "buy",
        propertyType: "apartment",
        price: 65000000,
        location: {
          address: "B-Block, Greater Kailash 1",
          city: "Delhi",
          state: "Delhi",
          pincode: "110048",
          landmark: "M-Block Market",
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 4,
          balconies: 3,
          carpetArea: 2400,
          builtUpArea: 2700,
          floorNumber: 2,
          totalFloors: 4,
          furnishing: "fully-furnished",
          facing: "north-east",
          ageOfProperty: 1,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: ["lift", "parking", "gated-security", "gas-pipeline"],
        highlights: ["Modular Kitchen", "Terrace Rights", "Park View"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        isFeatured: true,
        status: "available",
      },
      {
        title: "Compact 1 BHK in Hinjewadi",
        description:
          "Ideal for IT professionals. Walking distance from IT park. Gated society with all basic amenities.",
        listingType: "rent",
        propertyType: "apartment",
        price: 18000,
        location: {
          address: "Blue Ridge, Hinjewadi Phase 1",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411057",
          landmark: "Near Wipro Circle",
        },
        specifications: {
          bedrooms: 1,
          bathrooms: 1,
          balconies: 1,
          carpetArea: 550,
          builtUpArea: 650,
          floorNumber: 7,
          totalFloors: 22,
          furnishing: "unfurnished",
          facing: "east",
          ageOfProperty: 4,
          parkingSlots: 1,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "lift",
          "power-backup",
          "gated-security",
          "garden",
          "shopping-center",
        ],
        highlights: ["Near IT Park", "Grocery Shop Inside"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1595246140625-573b715d11fc?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
      {
        title: "Luxury 5 BHK Villa in Bangalore",
        description:
          "Ultra-luxury villa with premium finishes, smart home automation, private pool and tennis court. Located in an exclusive gated community.",
        listingType: "buy",
        propertyType: "villa",
        price: 85000000,
        location: {
          address: "Prestige Oaks, Sarjapur Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560103",
          landmark: "Near Sarjapur",
        },
        specifications: {
          bedrooms: 5,
          bathrooms: 5,
          balconies: 4,
          carpetArea: 4000,
          builtUpArea: 4800,
          floorNumber: 0,
          totalFloors: 3,
          furnishing: "fully-furnished",
          facing: "south",
          ageOfProperty: 0,
          parkingSlots: 3,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "swimming-pool",
          "gym",
          "clubhouse",
          "gated-security",
          "garden",
          "playground",
          "power-backup",
        ],
        highlights: ["Smart Home", "Private Pool", "Tennis Court"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        isFeatured: true,
        status: "available",
      },
      {
        title: "Commercial Plot in Sector 7, Noida",
        description:
          "Ideal commercial plot for retail/office development. Located on main road with excellent connectivity. High visibility location.",
        listingType: "buy",
        propertyType: "plot",
        price: 25000000,
        location: {
          address: "Plot No. 456, Sector 7",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301",
          landmark: "Main Road, Near Metro",
        },
        specifications: {
          plotArea: 2000,
          floorNumber: 0,
          totalFloors: 0,
          facing: "north",
          ageOfProperty: 0,
          parkingSlots: 0,
          possessionStatus: "ready-to-move",
        },
        amenities: ["parking", "water-supply", "power-backup"],
        highlights: ["High Visibility", "Main Road", "Near Metro"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "Spacious 3 BHK Duplex in Pune",
        description:
          "Beautiful duplex villa with excellent natural light, private terrace, and modern amenities. Perfect for family living.",
        listingType: "rent",
        propertyType: "house",
        price: 45000,
        location: {
          address: "29, Fortune Gardens, Kothrud",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411038",
          landmark: "Near Karve Road",
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 3,
          balconies: 2,
          carpetArea: 1600,
          builtUpArea: 1900,
          floorNumber: 1,
          totalFloors: 2,
          furnishing: "semi-furnished",
          facing: "east",
          ageOfProperty: 3,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gated-security",
          "parking",
          "garden",
          "water-supply",
          "power-backup",
        ],
        highlights: ["Natural Light", "Private Terrace", "Garden"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
      {
        title: "Retail Shop in Prime Market Area",
        description:
          "Ready-to-use retail shop in high-traffic commercial area. Perfect for retail business, salon, or food outlet.",
        listingType: "rent",
        propertyType: "shop",
        price: 35000,
        location: {
          address: "A-42, Main Bazaar, RK Puram",
          city: "Delhi",
          state: "Delhi",
          pincode: "110022",
          landmark: "RK Puram Market",
        },
        specifications: {
          carpetArea: 300,
          builtUpArea: 350,
          floorNumber: 0,
          totalFloors: 1,
          furnishing: "unfurnished",
          facing: "north",
          ageOfProperty: 2,
          parkingSlots: 1,
          possessionStatus: "ready-to-move",
        },
        amenities: ["parking", "water-supply", "power-backup"],
        highlights: ["High Traffic Area", "Prime Location", "Ready to Use"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1572536147248-ac59a8abf312?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "Industrial Warehouse in Mundka",
        description:
          "Large industrial warehouse with high ceiling and clear span. Suitable for manufacturing and storage. Loading dock available.",
        listingType: "rent",
        propertyType: "warehouse",
        price: 120000,
        location: {
          address: "Warehouse Complex, Industrial Estate, Mundka",
          city: "Delhi",
          state: "Delhi",
          pincode: "110041",
          landmark: "Industrial Area",
        },
        specifications: {
          carpetArea: 5000,
          builtUpArea: 5500,
          floorNumber: 0,
          totalFloors: 1,
          furnishing: "unfurnished",
          facing: "north",
          ageOfProperty: 5,
          parkingSlots: 4,
          possessionStatus: "ready-to-move",
        },
        amenities: ["parking", "water-supply", "power-backup", "lift"],
        highlights: ["High Ceiling", "Clear Span", "Spacious"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "Premium Agricultural Farmhouse in Alibaug",
        description:
          "Spacious farmhouse with organic farming setup, guest house, and scenic countryside views. Weekend retreat perfect for nature lovers.",
        listingType: "buy",
        propertyType: "farmhouse",
        price: 15000000,
        location: {
          address: "Green Valley Estate, Alibaug",
          city: "Alibaug",
          state: "Maharashtra",
          pincode: "402201",
          landmark: "Near Alibaug Town",
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 2,
          balconies: 2,
          carpetArea: 1400,
          builtUpArea: 1800,
          plotArea: 5000,
          floorNumber: 0,
          totalFloors: 1,
          furnishing: "semi-furnished",
          facing: "south",
          ageOfProperty: 3,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "garden",
          "playground",
          "gated-security",
          "parking",
          "water-supply",
        ],
        highlights: ["Organic Farm", "Guest House", "Scenic Views"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1575887917426-86bc06c6d464?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1574834292200-e6de6f6e83ae?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        isFeatured: true,
        status: "available",
      },
      {
        title: "2 BHK Flat in Koramangala",
        description:
          "Modern apartment in the heart of Koramangala, a vibrant neighborhood. Walking distance to restaurants, cafes, and shopping centers.",
        listingType: "rent",
        propertyType: "apartment",
        price: 40000,
        location: {
          address: "Plot 12, 5th Main Road, Koramangala",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560034",
          landmark: "Near Koramangala Junction",
        },
        specifications: {
          bedrooms: 2,
          bathrooms: 2,
          balconies: 1,
          carpetArea: 950,
          builtUpArea: 1150,
          floorNumber: 4,
          totalFloors: 8,
          furnishing: "fully-furnished",
          facing: "north",
          ageOfProperty: 2,
          parkingSlots: 1,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gym",
          "parking",
          "gated-security",
          "power-backup",
          "water-supply",
        ],
        highlights: [
          "Vibrant Neighborhood",
          "Fully Furnished",
          "Walk to Cafes",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
      {
        title: "Luxury Penthouse in South Delhi",
        description:
          "Exclusive penthouse with private rooftop garden and panoramic views. Located in a prestigious gated community.",
        listingType: "buy",
        propertyType: "apartment",
        price: 75000000,
        location: {
          address: "Defence Colony, New Delhi",
          city: "Delhi",
          state: "Delhi",
          pincode: "110024",
          landmark: "Defence Colony Main Road",
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 4,
          balconies: 3,
          carpetArea: 2600,
          builtUpArea: 3000,
          floorNumber: 12,
          totalFloors: 12,
          furnishing: "fully-furnished",
          facing: "south",
          ageOfProperty: 1,
          parkingSlots: 3,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gym",
          "swimming-pool",
          "parking",
          "gated-security",
          "cctv",
          "power-backup",
        ],
        highlights: ["Penthouse", "Rooftop Garden", "Panoramic Views"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        isFeatured: true,
        status: "available",
      },
      {
        title: "1 BHK Studio in Baner, Pune",
        description:
          "Cozy studio apartment perfect for working professionals and students. Modern facilities and great connectivity.",
        listingType: "rent",
        propertyType: "apartment",
        price: 15000,
        location: {
          address: "Pinnacle Plaza, Baner Road",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411045",
          landmark: "Near Baner Railway Station",
        },
        specifications: {
          bedrooms: 1,
          bathrooms: 1,
          balconies: 1,
          carpetArea: 450,
          builtUpArea: 550,
          floorNumber: 5,
          totalFloors: 15,
          furnishing: "semi-furnished",
          facing: "south",
          ageOfProperty: 1,
          parkingSlots: 0,
          possessionStatus: "ready-to-move",
        },
        amenities: ["lift", "power-backup", "gated-security", "water-supply"],
        highlights: ["Affordable", "Modern", "Professional Community"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1595246140625-573b715d11fc?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
      {
        title: "Showroom in Hi-Tech City",
        description:
          "Prime showroom space with high visibility and excellent foot traffic. Perfect for premium brands and retail outlets.",
        listingType: "rent",
        propertyType: "shop",
        price: 150000,
        location: {
          address: "Survey 123, Hi-Tech City Road",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500081",
          landmark: "Hi-Tech City",
        },
        specifications: {
          carpetArea: 1500,
          builtUpArea: 1800,
          floorNumber: 0,
          totalFloors: 2,
          furnishing: "unfurnished",
          facing: "north",
          ageOfProperty: 2,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "parking",
          "water-supply",
          "power-backup",
          "air-conditioning",
        ],
        highlights: ["Hi-Tech City", "High Visibility", "Premium Location"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1572536147248-ac59a8abf312?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        isVerified: true,
        status: "available",
      },
      {
        title: "3 BHK Townhouse in Thane",
        description:
          "Modern townhouse with private garden and terrace. Located near schools, hospitals, and shopping malls.",
        listingType: "rent",
        propertyType: "house",
        price: 50000,
        location: {
          address: "Shastri Nagar, Thane East",
          city: "Thane",
          state: "Maharashtra",
          pincode: "400603",
          landmark: "Near HDFC Bank",
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 3,
          balconies: 2,
          carpetArea: 1800,
          builtUpArea: 2100,
          floorNumber: 0,
          totalFloors: 3,
          furnishing: "semi-furnished",
          facing: "west",
          ageOfProperty: 4,
          parkingSlots: 2,
          possessionStatus: "ready-to-move",
        },
        amenities: [
          "gated-security",
          "parking",
          "garden",
          "water-supply",
          "power-backup",
        ],
        highlights: ["Near Schools", "Spacious Garden", "Family Friendly"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80",
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
          },
        ],
        owner: sellerId,
        status: "available",
      },
    ];

    const properties = [];
    for (const propData of propertiesData) {
      try {
        const prop = await Property.create(propData);
        properties.push(prop);
        console.log(`Created property: ${prop.title}`);
      } catch (err) {
        console.error(
          `Failed to create property ${propData.title}:`,
          err.message,
        );
      }
    }

    console.log("Properties created count:", properties.length);

    if (properties.length > 0) {
      // Create Reviews
      try {
        await Review.insertMany([
          {
            property: properties[0]._id,
            user: buyerId,
            rating: 5,
            title: "Amazing view!",
            comment:
              "The sea view from the balcony is breathtaking. The apartment is well-maintained and the society is very peaceful.",
          },
          {
            property: properties[1] ? properties[1]._id : properties[0]._id,
            user: buyerId,
            rating: 4,
            title: "Great community",
            comment:
              "Loved the villa and the community amenities. Security is top-notch. A bit far from the city center though.",
          },
          {
            property: properties[2] ? properties[2]._id : properties[0]._id,
            user: buyerId,
            rating: 5,
            title: "Perfect office space",
            comment:
              "Excellent connectivity, professional environment, and great amenities. Highly recommend for startups!",
          },
          {
            property: properties[3] ? properties[3]._id : properties[0]._id,
            user: buyerId,
            rating: 4,
            title: "Cozy apartment",
            comment:
              "Great location near metro station. Very convenient for daily commute. Maintenance is good.",
          },
          {
            property: properties[4] ? properties[4]._id : properties[0]._id,
            user: buyerId,
            rating: 5,
            title: "Premium living",
            comment:
              "Spectacular builder floor in a prime location. Modern interiors and amazing views. Worth every penny!",
          },
          {
            property: properties[6] ? properties[6]._id : properties[0]._id,
            user: buyerId,
            rating: 4,
            title: "Vibrant neighborhood",
            comment:
              "Perfect location for young professionals. Lots of cafes and restaurants nearby. Great apartment!",
          },
          {
            property: properties[8] ? properties[8]._id : properties[0]._id,
            user: buyerId,
            rating: 5,
            title: "Perfect for families",
            comment:
              "Spacious townhouse with beautiful garden. Safe and secure community. Kids love the area.",
          },
          {
            property: properties[9] ? properties[9]._id : properties[0]._id,
            user: buyerId,
            rating: 4,
            title: "Studio worth it",
            comment:
              "Compact but well-designed studio. Perfect for professionals. Value for money!",
          },
        ]);
        console.log("Reviews created");
      } catch (err) {
        console.error("Error creating reviews:", err.message);
      }

      // Create Inquiries
      try {
        await Inquiry.insertMany([
          {
            property: properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message:
              "Hi, I am interested in this property. Is the price negotiable?",
            phone: "9876543212",
            status: "pending",
          },
          {
            property: properties[2] ? properties[2]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message: "Can we schedule a site visit for this weekend?",
            phone: "9876543212",
            status: "responded",
          },
          {
            property: properties[1] ? properties[1]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message: "What is the exact possession date for this villa?",
            phone: "9876543212",
            status: "pending",
          },
          {
            property: properties[4] ? properties[4]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message:
              "Is home loan available for this property? Interested in buying.",
            phone: "9876543212",
            status: "responded",
          },
          {
            property: properties[3] ? properties[3]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message: "Can you provide more details about the lease terms?",
            phone: "9876543212",
            status: "pending",
          },
          {
            property: properties[6] ? properties[6]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message: "Interested in this property. When can I visit?",
            phone: "9876543212",
            status: "responded",
          },
          {
            property: properties[7] ? properties[7]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message:
              "Is the property furnished or semi-furnished? Can it be modified?",
            phone: "9876543212",
            status: "pending",
          },
          {
            property: properties[8] ? properties[8]._id : properties[0]._id,
            sender: buyerId,
            receiver: sellerId,
            message: "What are the maintenance charges? Any hidden costs?",
            phone: "9876543212",
            status: "responded",
          },
        ]);
        console.log("Inquiries created");
      } catch (err) {
        console.error("Error creating inquiries:", err.message);
      }

      // Create Projects
      try {
        const projectsData = [
          {
            title: "Emerald Gardens",
            description:
              "A premium residential project featuring lush green surroundings and world-class amenities.",
            developer: sellerId,
            location: {
              address: "Sector 45",
              city: "Gurgaon",
              state: "Haryana",
              pincode: "122003",
              landmark: "Near HUDA City Centre",
            },
            configuration: {
              bhkTypes: ["2 BHK", "3 BHK", "4 BHK"],
              priceRange: { min: 12000000, max: 25000000 },
              areaRange: { min: 1200, max: 2400 },
            },
            amenities: [
              "gym",
              "swimming-pool",
              "clubhouse",
              "gated-security",
              "garden",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
                caption: "Project Overview",
              },
            ],
            status: "under-construction",
            reraId: "RERA12345678",
            isVerified: true,
            isFeatured: true,
          },
          {
            title: "Skyline Towers",
            description:
              "Ultra-luxury apartments with panoramic city views and modern sky lounges.",
            developer: sellerId,
            location: {
              address: "Worli Sea Face",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400018",
              landmark: "Opposite Sea Link",
            },
            configuration: {
              bhkTypes: ["4 BHK", "5 BHK"],
              priceRange: { min: 80000000, max: 150000000 },
              areaRange: { min: 3500, max: 5000 },
            },
            amenities: [
              "swimming-pool",
              "gym",
              "power-backup",
              "gated-security",
              "cctv",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
                caption: "Skyline View",
              },
            ],
            status: "ready-to-move",
            reraId: "RERA98765432",
            isVerified: true,
            isFeatured: true,
          },
          {
            title: "Green Valley Residency",
            description:
              "Eco-friendly residential project with landscaped gardens and sustainable living features.",
            developer: sellerId,
            location: {
              address: "Electronic City Phase 2",
              city: "Bangalore",
              state: "Karnataka",
              pincode: "560100",
              landmark: "Near Wipro Campus",
            },
            configuration: {
              bhkTypes: ["1 BHK", "2 BHK", "3 BHK"],
              priceRange: { min: 4500000, max: 12000000 },
              areaRange: { min: 550, max: 1800 },
            },
            amenities: [
              "garden",
              "gym",
              "swimming-pool",
              "clubhouse",
              "parking",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
                caption: "Green Surroundings",
              },
            ],
            status: "ready-to-move",
            reraId: "RERA55443322",
            isVerified: true,
            isFeatured: false,
          },
          {
            title: "Azure Towers Mumbai",
            description:
              "Commercial and residential mixed-use development in prime location with retail space and office complexes.",
            developer: sellerId,
            location: {
              address: "Bandra Kurla Complex",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400051",
              landmark: "Financial Hub",
            },
            configuration: {
              bhkTypes: ["Office", "Retail"],
              priceRange: { min: 25000000, max: 100000000 },
              areaRange: { min: 1000, max: 5000 },
            },
            amenities: [
              "parking",
              "lift",
              "cctv",
              "power-backup",
              "air-conditioning",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
                caption: "Commercial Complex",
              },
            ],
            status: "under-construction",
            reraId: "RERA11223344",
            isVerified: true,
            isFeatured: true,
          },
          {
            title: "The Park View Villas",
            description:
              "Luxury villa community with private landscaping, gated entrances, and exclusive resident amenities.",
            developer: sellerId,
            location: {
              address: "DLF Phase 5",
              city: "Gurgaon",
              state: "Haryana",
              pincode: "122009",
              landmark: "Near Golf Course Road",
            },
            configuration: {
              bhkTypes: ["3 BHK", "4 BHK", "5 BHK"],
              priceRange: { min: 35000000, max: 75000000 },
              areaRange: { min: 2500, max: 4500 },
            },
            amenities: [
              "swimming-pool",
              "clubhouse",
              "garden",
              "gated-security",
              "playground",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80",
                caption: "Villa Complex",
              },
            ],
            status: "ready-to-move",
            reraId: "RERA77889900",
            isVerified: true,
            isFeatured: true,
          },
          {
            title: "Tech Park Hyderabad",
            description:
              "State-of-the-art commercial office spaces designed for IT and tech companies with world-class infrastructure.",
            developer: sellerId,
            location: {
              address: "HITEC City",
              city: "Hyderabad",
              state: "Telangana",
              pincode: "500081",
              landmark: "Hi-Tech City",
            },
            configuration: {
              bhkTypes: ["Office", "Commercial"],
              priceRange: { min: 15000000, max: 50000000 },
              areaRange: { min: 500, max: 3000 },
            },
            amenities: [
              "air-conditioning",
              "power-backup",
              "cctv",
              "parking",
              "lift",
            ],
            images: [
              {
                url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
                caption: "Modern Office Space",
              },
            ],
            status: "ready-to-move",
            reraId: "RERA33445566",
            isVerified: true,
            isFeatured: false,
          },
        ];

        for (const projData of projectsData) {
          await Project.create(projData);
          console.log(`Created project: ${projData.title}`);
        }
        console.log("Projects seeded successfully");
      } catch (err) {
        console.error("Error seeding projects:", err.message);
      }
    }

    console.log("Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();

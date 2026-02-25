import mongoose from 'mongoose';

// MongoDB Connection String from .env
const MONGO_URI = 'mongodb+srv://divyanshchauhan520:Divyansh026@cluster0.nunvpfz.mongodb.net/?appName=Cluster0';

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  photo: { type: String },
  provider: { type: String, default: 'google' },
  is_rider: { type: Boolean, default: true },
  is_passenger: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Ride Schema
const locationSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
}, { _id: false });

const rideSchema = new mongoose.Schema({
  rider_id: { type: String, required: true },
  rider_name: { type: String, required: true },
  origin: { type: locationSchema, required: true },
  destination: { type: locationSchema, required: true },
  departure_time: { type: Date, required: true },
  available_seats: { type: Number, required: true },
  price_per_seat: { type: Number, required: true },
  description: { type: String, default: '' },
  route_info: {
    distance: Number,
    duration: Number,
  },
  status: { type: String, default: 'active' },
  other_riders: [{ type: String }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
const Ride = mongoose.model('Ride', rideSchema);

// Test Data
const testUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    photo: 'https://example.com/photos/john.jpg',
    provider: 'google',
    is_rider: true,
    is_passenger: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    photo: 'https://example.com/photos/jane.jpg',
    provider: 'google',
    is_rider: true,
    is_passenger: true,
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    photo: 'https://example.com/photos/alex.jpg',
    provider: 'google',
    is_rider: true,
    is_passenger: true,
  },
];

const testRides = [
  {
    rider_id: 'user_001',
    rider_name: 'John Doe',
    origin: { name: 'Connaught Place, New Delhi', lat: 28.6328, lng: 77.2197 },
    destination: { name: 'Sector 18, Noida', lat: 28.5708, lng: 77.3532 },
    departure_time: new Date('2026-02-24T09:00:00Z'),
    available_seats: 3,
    price_per_seat: 150,
    description: 'Daily commute to Noida. Comfortable ride, music allowed.',
    route_info: { distance: 15000, duration: 2400 },
    status: 'active',
  },
  {
    rider_id: 'user_002',
    rider_name: 'Jane Smith',
    origin: { name: 'Cyber Hub, Gurgaon', lat: 28.4942, lng: 77.0852 },
    destination: { name: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
    departure_time: new Date('2026-02-25T14:00:00Z'),
    available_seats: 2,
    price_per_seat: 200,
    description: 'Going to meet friends. Anyone welcome!',
    route_info: { distance: 32000, duration: 3600 },
    status: 'active',
  },
  {
    rider_id: 'user_003',
    rider_name: 'Alex Johnson',
    origin: { name: 'Bandra West, Mumbai', lat: 19.0544, lng: 72.8406 },
    destination: { name: 'Andheri East, Mumbai', lat: 19.1167, lng: 72.8678 },
    departure_time: new Date('2026-02-26T08:30:00Z'),
    available_seats: 4,
    price_per_seat: 80,
    description: 'Early morning ride to office. AC available.',
    route_info: { distance: 8000, duration: 1200 },
    status: 'active',
  },
  {
    rider_id: 'user_001',
    rider_name: 'John Doe',
    origin: { name: 'Rajiv Chowk, New Delhi', lat: 28.6328, lng: 77.2197 },
    destination: { name: 'Huda City Centre, Gurgaon', lat: 28.4595, lng: 77.0266 },
    departure_time: new Date('2026-02-27T18:00:00Z'),
    available_seats: 2,
    price_per_seat: 250,
    description: 'Evening ride to Gurgaon. Quick commute.',
    route_info: { distance: 28000, duration: 3000 },
    status: 'active',
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Ride.deleteMany({});

    // Insert test users
    console.log('Inserting test users...');
    const users = await User.insertMany(testUsers);
    console.log(`✅ Created ${users.length} test users`);

    // Update rides with actual user IDs
    const userIds = users.map(u => u._id.toString());
    testRides[0].rider_id = userIds[0];
    testRides[1].rider_id = userIds[1];
    testRides[2].rider_id = userIds[2];
    testRides[3].rider_id = userIds[0];

    // Insert test rides
    console.log('Inserting test rides...');
    const rides = await Ride.insertMany(testRides);
    console.log(`✅ Created ${rides.length} test rides`);

    // Display summary
    console.log('\n📊 Database Summary:');
    console.log('-------------------');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Rides: ${await Ride.countDocuments()}`);
    
    console.log('\n👥 Test Users:');
    for (const user of users) {
      console.log(`  - ${user.name} (${user.email})`);
    }

    console.log('\n🚗 Test Rides:');
    const allRides = await Ride.find();
    for (const ride of allRides) {
      console.log(`  - ${ride.origin.name} → ${ride.destination.name} by ${ride.rider_name}`);
    }

    console.log('\n✅ Test data seeded successfully!');
    console.log('You can now check MongoDB Atlas to see the data.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seedDatabase();

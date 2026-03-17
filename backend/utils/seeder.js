const User = require('../models/User');
const PoliceStation = require('../models/PoliceStation');

const hyderabadStations = [
  { name: 'Jubilee Hills Police Station', stationCode: 'JH001', address: 'Road No. 36, Jubilee Hills', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-27897475', email: 'jh.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4050, 17.4311] }, inCharge: 'Inspector K. Ramesh', totalOfficers: 45 },
  { name: 'Banjara Hills Police Station', stationCode: 'BH002', address: 'Road No. 12, Banjara Hills', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-23552033', email: 'bh.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4482, 17.4156] }, inCharge: 'Inspector S. Priya', totalOfficers: 38 },
  { name: 'Madhapur Police Station', stationCode: 'MP003', address: 'HiTec City Road, Madhapur', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-23114444', email: 'mp.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.3779, 17.4486] }, inCharge: 'Inspector R. Kumar', totalOfficers: 52 },
  { name: 'Uppal Police Station', stationCode: 'UP004', address: 'Uppal Ring Road, Uppal', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-27204001', email: 'up.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.5596, 17.4050] }, inCharge: 'Inspector M. Naidu', totalOfficers: 41 },
  { name: 'Secunderabad Police Station', stationCode: 'SC005', address: 'MG Road, Secunderabad', city: 'Secunderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-27804111', email: 'sc.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4983, 17.4399] }, inCharge: 'Inspector T. Reddy', totalOfficers: 60 },
  { name: 'LB Nagar Police Station', stationCode: 'LB006', address: 'LB Nagar Circle', city: 'Hyderabad', district: 'Rangareddy', state: 'Telangana', phone: '040-24010505', email: 'lb.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.5553, 17.3527] }, inCharge: 'Inspector A. Sharma', totalOfficers: 35 },
  { name: 'Abids Police Station', stationCode: 'AB007', address: 'Abids Circle, Abids', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-23238900', email: 'ab.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4744, 17.3847] }, inCharge: 'Inspector V. Rao', totalOfficers: 48 },
  { name: 'Begumpet Police Station', stationCode: 'BG008', address: 'Begumpet Main Road', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-27764222', email: 'bg.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4687, 17.4435] }, inCharge: 'Inspector P. Singh', totalOfficers: 43 },
  { name: 'Kukatpally Police Station', stationCode: 'KP009', address: 'KPHB Colony, Kukatpally', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-23055555', email: 'kp.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4093, 17.4849] }, inCharge: 'Inspector N. Verma', totalOfficers: 39 },
  { name: 'Charminar Police Station', stationCode: 'CM010', address: 'Charminar Road, Old City', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '040-24520001', email: 'cm.ps@tspolice.gov.in', location: { type: 'Point', coordinates: [78.4740, 17.3616] }, inCharge: 'Inspector H. Khan', totalOfficers: 55 },
];

const seeder = async () => {
  try {
    const stationCount = await PoliceStation.countDocuments();
    if (stationCount === 0) {
      await PoliceStation.insertMany(hyderabadStations);
      console.log('✅ Police stations seeded');
    }

    const adminExists = await User.findOne({ email: 'admin@police.gov.in' });
    if (!adminExists) {
      await User.create({ name: 'System Administrator', email: 'admin@police.gov.in', password: 'Admin@123', phone: '9000000001', role: 'admin' });
      console.log('✅ Admin seeded: admin@police.gov.in / Admin@123');
    }

    // Seed multiple officers per station for testing assignment
    const stations = await PoliceStation.find();
    const jhStation = stations.find(s => s.stationCode === 'JH001');
    const bhStation = stations.find(s => s.stationCode === 'BH002');
    const mpStation = stations.find(s => s.stationCode === 'MP003');

    const officerSeeds = [
      { name: 'Inspector Ramesh Kumar', email: 'officer@jh.police.gov.in', password: 'Officer@123', phone: '9000000002', role: 'police', badgeNumber: 'TS/HYD/001', rank: 'Inspector', specialization: 'Cybercrime', assignedStation: jhStation?._id, isAvailable: true },
      { name: 'Sub-Inspector Priya Reddy', email: 'si.priya@jh.police.gov.in', password: 'Officer@123', phone: '9000000003', role: 'police', badgeNumber: 'TS/HYD/002', rank: 'Sub-Inspector', specialization: 'Theft & Robbery', assignedStation: jhStation?._id, isAvailable: true },
      { name: 'Constable Arjun Sharma', email: 'pc.arjun@jh.police.gov.in', password: 'Officer@123', phone: '9000000004', role: 'police', badgeNumber: 'TS/HYD/003', rank: 'Head Constable', specialization: 'General', assignedStation: jhStation?._id, isAvailable: false },
      { name: 'Inspector Sanjay Naidu', email: 'officer@bh.police.gov.in', password: 'Officer@123', phone: '9000000005', role: 'police', badgeNumber: 'TS/HYD/004', rank: 'Inspector', specialization: 'Fraud & Financial', assignedStation: bhStation?._id, isAvailable: true },
      { name: 'Sub-Inspector Kavitha Rao', email: 'si.kavitha@bh.police.gov.in', password: 'Officer@123', phone: '9000000006', role: 'police', badgeNumber: 'TS/HYD/005', rank: 'Sub-Inspector', specialization: 'Domestic Violence', assignedStation: bhStation?._id, isAvailable: true },
      { name: 'Inspector Vijay Kumar', email: 'officer@mp.police.gov.in', password: 'Officer@123', phone: '9000000007', role: 'police', badgeNumber: 'TS/HYD/006', rank: 'Inspector', specialization: 'Cybercrime', assignedStation: mpStation?._id, isAvailable: true },
    ];

    for (const o of officerSeeds) {
      if (o.assignedStation) {
        const exists = await User.findOne({ email: o.email });
        if (!exists) {
          await User.create(o);
          console.log(`✅ Officer seeded: ${o.email}`);
        }
      }
    }

    const citizenExists = await User.findOne({ email: 'citizen@example.com' });
    if (!citizenExists) {
      await User.create({ name: 'Rahul Sharma', email: 'citizen@example.com', password: 'Citizen@123', phone: '9000000010', role: 'citizen', address: '123, Jubilee Hills, Hyderabad' });
      console.log('✅ Citizen seeded: citizen@example.com / Citizen@123');
    }
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};

module.exports = seeder;

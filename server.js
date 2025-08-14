const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const hospitals = [
    { id: 1, name: 'Apollo Hospital, Greams Road', location: 'Chennai' },
    { id: 2, name: 'Fortis Malar Hospital, Adyar', location: 'Chennai' },
];

let users = [
    { id: 1, username: 'admin', password: 'password123', role: 'admin', name: 'Hospital Admin' },
    { id: 2, username: 'dr.house', password: 'password123', role: 'doctor', name: 'Dr. Gregory House' },
    { id: 3, username: 'dr.grey', password: 'password123', role: 'doctor', name: 'Dr. Meredith Grey' },
    { id: 4, username: 'john.doe', password: 'password123', role: 'patient', name: 'John Doe' },
    { id: 5, username: 'dr.strange', password: 'password123', role: 'doctor', name: 'Dr. Stephen Strange' },
];
let doctors = [
    { id: 2, name: 'Dr. Gregory House', specialty: 'Diagnostics', hospitalId: 1, timings: '10:00 AM - 1:00 PM' },
    { id: 3, name: 'Dr. Meredith Grey', specialty: 'General Surgery', hospitalId: 1, timings: '2:00 PM - 5:00 PM' },
    { id: 5, name: 'Dr. Stephen Strange', specialty: 'Neurosurgery', hospitalId: 2, timings: '9:00 AM - 12:00 PM' },
];
let appointments = [];
let nextUserId = 6;
let nextAppointmentId = 101;

app.get('/api/hospitals', (req, res) => {
    res.json(hospitals);
});

app.get('/api/doctors', (req, res) => {
    const hospitalId = parseInt(req.query.hospitalId, 10);
    if (!hospitalId) {
        return res.status(400).json({ message: 'Hospital ID is required.' });
    }
    const hospitalDoctors = doctors.filter(d => d.hospitalId === hospitalId);
    res.json(hospitalDoctors);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ message: 'Login successful!', user: { id: user.id, name: user.name, role: user.role } });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

app.post('/api/register', (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists.' });
    }
    const newUser = { id: nextUserId++, name, username, password, role: 'patient' };
    users.push(newUser);
    res.status(201).json({ message: 'Registration successful!', user: { id: newUser.id, name: newUser.name, role: newUser.role } });
});

app.post('/api/book', (req, res) => {
    const { doctorId, patientId, patientName, hospitalId, timings } = req.body;
    const doctor = doctors.find(d => d.id === doctorId);
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!doctor || !hospital) {
        return res.status(404).json({ message: 'Doctor or Hospital not found.' });
    }
    const newAppointment = { 
        id: nextAppointmentId++, 
        hospitalId,
        hospitalName: hospital.name,
        doctorId, 
        doctorName: doctor.name,
        patientId, 
        patientName, 
        timings,
        date: new Date().toLocaleDateString() 
    };
    appointments.push(newAppointment);
    res.status(201).json({ message: `Appointment confirmed with ${doctor.name} at ${hospital.name} for ${timings}!` });
});

app.get('/api/doctor/appointments', (req, res) => {
    const doctorId = parseInt(req.query.doctorId, 10);
    const doctorAppointments = appointments.filter(a => a.doctorId === doctorId);
    res.json(doctorAppointments);
});

app.get('/api/admin/all-appointments', (req, res) => {
    res.json(appointments);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running! Open http://localhost:${PORT}`);
});
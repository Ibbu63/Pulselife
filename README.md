🩸 PulseLife – Blood Bank Management & Emergency Rescue Network

Every Drop Counts. Every Life Matters.

PulseLife is a full-stack MERN application designed to simplify blood donation management and connect donors, blood banks, and hospitals through a centralized platform. It helps manage blood inventory, coordinate emergency blood requests, recommend compatible donors, and improve communication between healthcare organizations and donors.

🚀 Features

- Role-Based Authentication: Separate access and dashboards for Donors, Blood Banks, Hospitals, and Administrators.
- Donor Management: Donor registration, profile management, blood group information, and donation tracking.
- Blood Inventory Management: Monitor blood availability, manage inventory, and track blood units.
- Emergency Blood Requests: Submit and manage blood requests based on blood group and urgency.
- Smart Donor Recommendation: Identify compatible donors using blood group compatibility.
- Blood Shortage Prediction: Identify low-stock blood groups and generate inventory-based recommendations.
- AI Assistant: Interactive chatbot providing information about blood donation and emergency requests.
- QR Code Verification: QR code-based digital verification functionality.
- Real-Time Communication: Socket.IO integration for real-time communication.
- Analytics Dashboard: Visualize system statistics and reports.
- Responsive Interface: User-friendly dashboards for different user roles.

🛠️ Tech Stack

Category| Technologies
Frontend| React.js, JavaScript, HTML5, CSS3
Build Tool| Vite
Backend| Node.js, Express.js
Database| MongoDB, Mongoose
Authentication| JWT, bcryptjs
Real-Time Communication| Socket.IO
Data Visualization| Chart.js, React Chart.js 2
QR Code| qrcode.react
Excel Operations| XLSX
Other Tools| Git, GitHub, Postman, VS Code

📂 Project Structure

PulseLife/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatbotModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Icons.jsx
│   │   │   ├── MapVisualizer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── QRCodeModal.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BloodBankDashboard.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── FindBloodPage.jsx
│   │   │   ├── HospitalDashboard.jsx
│   │   │   ├── LoginRegisterPage.jsx
│   │   │   └── PublicHome.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── memoryStore.js
│   ├── seed.js
│   ├── server.js
│   ├── test-db.js
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md

⚙️ Installation & Setup

Prerequisites

- Node.js
- npm
- MongoDB Atlas account (recommended for persistent database storage)
- Git

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/PulseLife.git

cd PulseLife

2. Install Dependencies

Install the root dependencies:

npm install

Install frontend and backend dependencies:

npm run install-all

3. Configure Environment Variables

Create a ".env" file inside the "server" directory.

PORT=5000
MONGO_URI=your_mongodb_connection_string

Replace the MongoDB URI with your MongoDB Atlas connection string.

Important: Never upload your ".env" file or database credentials to GitHub.

4. Run the Application

From the root project directory:

npm start

This starts the frontend and backend concurrently.

5. Access the Application

Service| URL
Frontend| http://localhost:3002
Backend| http://localhost:5000
API Health Check| http://localhost:5000/api/health

🗄️ Database Configuration

PulseLife uses MongoDB with Mongoose for database management.

- MongoDB Atlas can be configured for persistent cloud database storage.
- The application includes an in-memory fallback for demo execution when MongoDB is unavailable.
- Initial sample data is automatically seeded when a connected MongoDB database is empty.

Note: In-memory data is temporary and will not persist after the server restarts.

🔑 Demo Credentials

The project includes sample accounts created through the database seeding process.

Role| Email| Password
Admin| admin@pulselife.com| admin123
Blood Bank| cbc@pulselife.com| password123
Hospital| rghospital@pulselife.com| password123
Donor| john.doe@gmail.com| password123

These credentials are intended for demonstration purposes only.

🔗 API Endpoints

Module| Endpoint
Authentication| "/api/auth"
Inventory| "/api/inventory"
Donations| "/api/donations"
Blood Requests| "/api/requests"
Blood Banks| "/api/blood-banks"
Hospitals| "/api/hospitals"
Notifications| "/api/notifications"
Appointments| "/api/appointments"
Admin| "/api/admin"
AI Services| "/api/ai"
Reports| "/api/reports"

🔐 Security

- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected API routes.
- Role-based access control.
- Environment variables for sensitive configuration.

🔮 Future Enhancements

- GPS-based nearby donor discovery.
- SMS and WhatsApp emergency notifications.
- Advanced blood demand forecasting.
- Dedicated Android and iOS applications.
- Enhanced analytics and reporting.
- Improved donor verification and eligibility tracking.

👨‍💻 Developer

Mohammed Ibrahim

Computer Science and Engineering Student

- GitHub: "Your GitHub Profile" (https://github.com/YOUR_USERNAME)

---

If you find this project useful or interesting, consider giving the repository a ⭐!

PulseLife – Saving Lives, One Donation at a Time. 🩸

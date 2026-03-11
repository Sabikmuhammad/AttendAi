// Example registration payloads for testing

// Student Registration
const studentRegistration = {
  name: "John Doe",
  email: "john.doe@example.com",
  password: "SecurePass123",
  role: "student",
  studentId: "STU2024001",
  department: "Computer Science",
  section: "A"
};

// Faculty Registration
const facultyRegistration = {
  name: "Dr. Jane Smith",
  email: "jane.smith@example.com",
  password: "SecurePass123",
  role: "faculty",
  facultyId: "FAC2024001",
  department: "Computer Science"
};

// Test registration endpoint
async function testRegistration(payload) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  console.log('Response:', data);
  return data;
}

// Usage:
// testRegistration(studentRegistration);
// testRegistration(facultyRegistration);

module.exports = { studentRegistration, facultyRegistration, testRegistration };

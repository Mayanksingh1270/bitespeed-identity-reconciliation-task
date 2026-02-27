# BiteSpeed Identity Reconciliation Service

A RESTful backend service that resolves and manages customer identities using email and phone number matching.

---

## Overview

This service accepts contact details (email and/or phone number) and:

- Creates a new primary contact if no match exists  
- Links related contacts automatically  
- Maintains primary–secondary relationships  
- Returns consolidated contact information  

It ensures consistent identity resolution across multiple requests.

---

## Tech Stack

- Node.js  
- Express.js  
- MySQL  

---

## Setup Instructions

### 1. Prerequisites

Make sure you have:

- Node.js (v14 or higher)  
- MySQL installed and running  

---

### 2. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bitespeed
PORT=3000
```

---

### 5. Database Setup

Run the following SQL query in MySQL:

```sql
CREATE TABLE IF NOT EXISTS Contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NULL,
  phoneNumber VARCHAR(50) NULL,
  linkedId INT NULL,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL,
  rootId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_phoneNumber (phoneNumber),
  INDEX idx_rootId (rootId)
);
```

---

### 6. Start the Server

```bash
npm start
```

The server will run at:

```
http://localhost:3000
```

---

## API Endpoints

### POST /identify

Content-Type: application/json

#### Request Body

```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

At least one field (email or phoneNumber) must be provided.

#### Response Example

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

---

### GET /

Health check endpoint.

Response:

```
BiteSpeed Service Running
```

---

## License

ISC License

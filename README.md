# BiteSpeed Identity Service

A REST API service for identity resolution and contact management.



## Features

- Identity resolution for contacts
- Support for email and phone number identification
- Automatic linking of related contacts
- RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Installation

1. Clone the repository:
```
bash
git clone <repository-url>
```

2. Install dependencies:
```
bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bitespeed
PORT=3000
```

4. Set up the database:
Run the following SQL to create the necessary table:
```
sql
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

5. Start the server:
```
bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Identify Contact

**Endpoint:** `/identify`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```
json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

At least one of `email` or `phoneNumber` is required.

**Response:**
```
json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

### Health Check

**Endpoint:** `/`

**Method:** `GET`

**Response:**
```
BiteSpeed Service Running
```



## License

ISC
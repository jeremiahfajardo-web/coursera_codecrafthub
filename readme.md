CodeCraftHub — Personal learning goal tracker API
A lightweight REST API built with Node.js and Express to track courses you want to learn. Data is stored in a simple JSON file (courses.json) to keep things beginner-friendly and filesystem-based (no database).

Project overview
Tech: Node.js with Express
Data storage: JSON file (courses.json) in the project root
API style: RESTful CRUD operations for courses
No authentication or user accounts
Auto-incrementing course IDs (starting at 1)
Automatic creation of courses.json if it doesn't exist
Port: 5000
Features
Create, read, update, and delete courses (CRUD)
Each course includes:
id (auto-generated, starting from 1)
name (required)
description (required)
target_date (required, format YYYY-MM-DD)
status (required; one of: "Not Started", "In Progress", "Completed")
created_at (auto-generated timestamp)
Basic validation and helpful error messages
JSON file-based storage (suitable for learning REST API basics)
Prerequisites
Node.js (version 14+ recommended)
npm (comes with Node.js)
Verify installation:

node -v
npm -v
Installation
Clone or download the project repository.
Open a terminal in the project root.
Install dependencies:
npm install
Start the server:
npm start
This runs: node app.js
The API will be available at:
http://localhost:5000/api/
Note: The app will automatically create a courses.json file in the project root if it doesn't exist.

Run the application
Start server:
npm start
If you prefer running directly with Node:
node app.js
The server will listen on port 5000.

API endpoint documentation
Base URL: http://localhost:5000/api

Note: The recommended endpoint for getting a single course uses /api/courses/:id. You can call it with a numeric ID (e.g., 1). Trailing slashes are typically tolerated by Express but stick to the canonical forms below.

Create a new course
POST /api/courses
Required JSON body: { "name": "Course Name", "description": "Course description", "target_date": "YYYY-MM-DD", "status": "Not Started" | "In Progress" | "Completed" }
Successful response (201): { "id": 1, "name": "...", "description": "...", "target_date": "YYYY-MM-DD", "status": "...", "created_at": "2026-03-12T12:34:56.789Z" }
Error example (missing fields):
400 with body: { "error": "Missing required fields: ..." }
Get all courses
GET /api/courses
Successful response (200): an array of course objects
Example:

Request: curl -s http://localhost:5000/api/courses
Response: [ { "id": 1, "name": "Intro to JavaScript", "description": "Learn JS basics", "target_date": "2026-04-30", "status": "Not Started", "created_at": "2026-03-12T12:34:56.789Z" }, ... ]
Get a specific course
GET /api/courses/:id
Example:
Request: curl -s http://localhost:5000/api/courses/1
Response (200) example: { "id": 1, "name": "Intro to JavaScript", "description": "Learn JS basics", "target_date": "2026-04-30", "status": "Not Started", "created_at": "2026-03-12T12:34:56.789Z" }
If not found:
404 with body: { "error": "Course not found" }
Update a course
PUT /api/courses/:id
Required JSON body (all fields must be provided): { "name": "Course Name", "description": "Course description", "target_date": "YYYY-MM-DD", "status": "Not Started" | "In Progress" | "Completed" }
Successful response (200) returns the updated course
Errors:
400 for missing/invalid fields
404 if course not found
500 for file write errors
Delete a course
DELETE /api/courses/:id
Successful response (204 No Content) with no body
Errors:
404 if course not found
500 for file write errors
Status values allowed

Not Started
In Progress
Completed
Date format

target_date must be a string in YYYY-MM-DD format, e.g., "2026-04-30"
Data model and storage
File: courses.json (in project root)
Each course object contains:
id: integer (auto-increment starting from 1)
name: string
description: string
target_date: string (YYYY-MM-DD)
status: string (Not Started | In Progress | Completed)
created_at: string (ISO timestamp)
Notes

The app uses a simple JSON file for storage to keep things beginner-friendly.
The id is computed by taking the max existing id and adding 1 (starts at 1 when file is empty).
The file is automatically created if it doesn’t exist when the server starts or when the first request is made.
Example requests (curl)
Create a course curl -X POST http://localhost:5000/api/courses
-H "Content-Type: application/json"
-d '{"name":"Intro to JavaScript","description":"Learn JS basics","target_date":"2026-04-30","status":"Not Started"}'

Get all courses curl http://localhost:5000/api/courses

Get a course by id curl http://localhost:5000/api/courses/1

Update a course curl -X PUT http://localhost:5000/api/courses/1
-H "Content-Type: application/json"
-d '{"name":"Intro to JavaScript","description":"Updated description","target_date":"2026-05-15","status":"In Progress"}'

Delete a course curl -X DELETE http://localhost:5000/api/courses/1

Troubleshooting
Server won’t start or port already in use

Ensure no other process is using port 5000.
Change port in app.js if needed or kill conflicting process.
File read/write errors

Ensure the application has permission to read/write in the project directory.
The app will create courses.json automatically if it doesn’t exist.
Invalid input errors

Missing required fields for POST will return a 400 with a descriptive error.
target_date must be YYYY-MM-DD (e.g., 2026-04-30).
status must be one of: Not Started, In Progress, Completed.
Course not found

Check the id you’re using; IDs start at 1 and auto-increment.
Unexpected server errors

Look at the console output for stack traces.
Ensure the code in app.js and dependencies are intact.
If you’d like, I can add more endpoints (e.g., filtering, sorting, or pagination), or include a simple README badge for status checks.
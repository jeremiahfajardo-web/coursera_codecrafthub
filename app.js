// app.js
// Simple beginner-friendly REST API for CodeCraftHub
// - Node.js with Express
// - All data stored in a JSON file: courses.json (auto-created if missing)
// - CRUD endpoints for courses
// - Each course: id (auto-increment starting at 1), name, description,
//   target_date (YYYY-MM-DD), status (Not Started | In Progress | Completed), created_at

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Create the Express app
const app = express();

// Port to run the server on (as requested)
const PORT = 5000;

// Path to the JSON data file (courses.json in the project root)
const DATA_FILE = path.resolve(__dirname, 'courses.json');

// Allowed status values
const ALLOWED_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Ensure the data file exists.
 * If it doesn't exist yet, create it with an empty array [].
 * This satisfies requirement: "Make sure the app creates courses.json automatically if it doesn't exist"
 */
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // File does not exist - create with an empty array
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log(`Created new data file at ${DATA_FILE}`);
  }
}

/**
 * Read all courses from the JSON file
 * Returns an array of course objects
 */
async function readCourses() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const courses = JSON.parse(data);
    // Basic guard: ensure we have an array
    if (!Array.isArray(courses)) return [];
    return courses;
  } catch (err) {
    // If parsing fails or any IO error occurs, report a server error later
    throw new Error('Failed to read courses data');
  }
}

/**
 * Write the entire courses array back to the JSON file
 * @param {Array} courses
 */
async function writeCourses(courses) {
  await ensureDataFile();
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
  } catch (err) {
    throw new Error('Failed to write courses data');
  }
}

/**
 * Validate input for a course
 * If requireAll is true, all fields are required (used for POST)
 * If false, fields may be optional (used for PUT with partial updates)
 * Returns null if valid, or an error message string if invalid
 */
function validateCourseInput({ name, description, target_date, status }, requireAll = true) {
  // Missing required fields (for create)
  if (requireAll) {
    if (!name || !description || !target_date || !status) {
      return 'Missing required fields: name, description, target_date, and status are required';
    }
  }

  // Type checks (basic)
  if (name !== undefined && typeof name !== 'string') return 'Invalid name';
  if (description !== undefined && typeof description !== 'string') return 'Invalid description';

  // target_date must be in YYYY-MM-DD format
  if (target_date !== undefined) {
    if (typeof target_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(target_date)) {
      return 'Invalid target_date. Expected format: YYYY-MM-DD';
    }
  }

  // status must be one of the allowed values
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`;
  }

  return null;
}

/**
 * Initialize the server
 * - Ensure the data file exists
 */
async function initialize() {
  try {
    await ensureDataFile();
  } catch (err) {
    console.error('Failed to initialize data storage:', err.message);
  }
}
initialize();

// ------------------------
// Routes (CRUD)
// ------------------------

// POST /api/courses
// Add a new course
app.post('/api/courses', async (req, res) => {
  const { name, description, target_date, status } = req.body;

  // Validate required fields
  const error = validateCourseInput({ name, description, target_date, status }, true);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const courses = await readCourses();

    // Auto-increment id starting from 1
    const nextId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;

    const newCourse = {
      id: nextId,
      name: name.trim(),
      description: description.trim(),
      target_date,
      status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    await writeCourses(courses);

    res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error creating course:', err.message);
    res.status(500).json({ error: 'File read/write error while creating course' });
  }
});

// GET /api/courses
// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await readCourses();
    res.json(courses);
  } catch (err) {
    console.error('Error reading courses:', err.message);
    res.status(500).json({ error: 'File read error while fetching courses' });
  }
});

// GET /api/courses/stats
// Returns basic statistics about courses: total count and counts by status
app.get('/api/courses/stats', async (req, res) => {
  try {
    const courses = await readCourses();

    // Total number of courses
    const total = courses.length;

    // Initialize counts for each allowed status with 0
    const byStatus = ALLOWED_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    // Tally counts by status
    for (const course of courses) {
      if (course && typeof course.status === 'string' && byStatus.hasOwnProperty(course.status)) {
        byStatus[course.status] += 1;
      } else {
        // If a course has an unknown or missing status, you can ignore or handle separately
        // For now, we'll ignore it in the stats
      }
    }

    res.json({ total, byStatus });
  } catch (err) {
    console.error('Error computing course statistics:', err.message);
    res.status(500).json({ error: 'Failed to compute course statistics' });
  }
});

// GET /api/courses/:id
// Get a specific course by id
app.get('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid course id' });
  }

  try {
    const courses = await readCourses();
    const course = courses.find(c => c.id === id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err.message);
    res.status(500).json({ error: 'File read error while fetching course' });
  }
});


// PUT /api/courses/:id
// Update a course (partial update supported)
// Only provided fields will be updated
app.put('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid course id' });
  }

  const { name, description, target_date, status } = req.body;

  // Validate provided fields (partial updates allowed)
  const error = validateCourseInput({ name, description, target_date, status }, false);
  if (error) return res.status(400).json({ error });

  // Build updates: only provided fields
  const updates = {};
  if (name !== undefined) updates.name = typeof name === 'string' ? name.trim() : name;
  if (description !== undefined) updates.description = typeof description === 'string' ? description.trim() : description;
  if (target_date !== undefined) updates.target_date = target_date;
  if (status !== undefined) updates.status = status;

  // If nothing to update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  try {
    const courses = await readCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = courses[idx];
    const updatedCourse = {
      ...existing,
      ...updates,
      // Important: keep original created_at
      created_at: existing.created_at
    };

    courses[idx] = updatedCourse;
    await writeCourses(courses);

    res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating course:', err.message);
    res.status(500).json({ error: 'File write error while updating course' });
  }
});

// DELETE /api/courses/:id
// Delete a course
app.delete('/api/courses/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid course id' });
  }

  try {
    const courses = await readCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Remove the course
    courses.splice(idx, 1);
    await writeCourses(courses);

    // Per HTTP spec, 204 No Content on successful delete
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting course:', err.message);
    res.status(500).json({ error: 'File write error while deleting course' });
  }
});

// Optional: catch-all for unknown routes to help beginners
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found. Use /api/courses with the proper HTTP methods.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on http://localhost:${PORT}`);
});

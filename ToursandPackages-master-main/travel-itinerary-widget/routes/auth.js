import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Store users.csv in the root folder of ToursandPackages-master-main
const CSV_PATH = path.resolve(__dirname, '../../users.csv');

// Helper to escape values for CSV
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

// Helper to read users from CSV
async function readUsers() {
  if (!fs.existsSync(CSV_PATH)) {
    return [];
  }
  try {
    const data = await fs.promises.readFile(CSV_PATH, 'utf-8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return []; // header only

    // Extract headers
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      // Simple CSV parser supporting double quotes
      const row = [];
      let inQuotes = false;
      let currentVal = '';
      const line = lines[i];

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.replace(/^"|"$/g, '').trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.replace(/^"|"$/g, '').trim());

      if (row.length >= 3) {
        users.push({
          username: row[0],
          email: row[1],
          password: row[2],
          registeredAt: row[3] || ''
        });
      }
    }
    return users;
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}

// Helper to write a user to CSV
async function appendUser(user) {
  const fileExists = fs.existsSync(CSV_PATH);
  const header = 'Username,Email,Password,RegisteredAt\n';
  const row = `${escapeCSV(user.username)},${escapeCSV(user.email)},${escapeCSV(user.password)},${escapeCSV(user.registeredAt)}\n`;

  try {
    if (!fileExists) {
      await fs.promises.writeFile(CSV_PATH, header + row, 'utf-8');
    } else {
      await fs.promises.appendFile(CSV_PATH, row, 'utf-8');
    }
  } catch (error) {
    console.error('Error writing CSV:', error);
    throw new Error('Failed to save user credentials to Excel sheet');
  }
}

// Signup route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = await readUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      return res.status(409).json({ error: 'Email address already registered' });
    }

    const newUser = {
      username,
      email,
      password, // In production, hash this. But for CSV demo it stores directly.
      registeredAt: new Date().toISOString()
    };

    await appendUser(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Data recorded in Excel sheet.',
      user: { username, email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

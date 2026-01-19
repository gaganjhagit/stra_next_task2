import db from "../../../../lib/db.js";
import { hashPassword, getCurrentUser } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get FormData with CSV file
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as text
    const text = await file.text();
    const lines = text.trim().split('\n');

    if (lines.length < 2) {
      return Response.json(
        { error: 'CSV file must contain headers and at least one data row' },
        { status: 400 }
      );
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const passwordIdx = headers.indexOf('password');
    const roleIdx = headers.indexOf('role');

    if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1 || roleIdx === -1) {
      return Response.json(
        { error: 'CSV must contain columns: name, email, password, role' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const failed = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        const values = line.split(',').map(v => v.trim());
        const name = values[nameIdx];
        const email = values[emailIdx];
        const password = values[passwordIdx];
        const role = values[roleIdx]?.toLowerCase();

        // Validate data
        if (!name || !email || !password || !role) {
          failed.push({
            row: i,
            email: email || 'N/A',
            reason: 'Missing required fields'
          });
          failedCount++;
          continue;
        }

        if (!['student', 'teacher', 'admin'].includes(role)) {
          failed.push({
            row: i,
            email,
            reason: 'Invalid role. Must be: student, teacher, or admin'
          });
          failedCount++;
          continue;
        }

        // Check if email already exists
        const [existing] = await db.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );

        if (existing && existing.length > 0) {
          failed.push({
            row: i,
            email,
            reason: 'Email already exists'
          });
          failedCount++;
          continue;
        }

        // Hash password and insert
        const hashedPassword = await hashPassword(password);
        
        await db.execute(
          'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [name, email, hashedPassword, role]
        );

        successCount++;
      } catch (err) {
        console.error(`Error processing row ${i}:`, err);
        failed.push({
          row: i,
          email: 'Unknown',
          reason: err.message
        });
        failedCount++;
      }
    }

    return Response.json({
      successCount,
      failedCount,
      failed: failed.length > 0 ? failed : undefined
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return Response.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}

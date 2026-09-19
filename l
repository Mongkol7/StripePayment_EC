<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frontend</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #f0f6ff;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
    }
    h1 { margin: 0 0 10px; font-size: 32px; font-weight: 700; }
    p { margin: 0 0 24px; color: #555; font-size: 16px; }
    .btn-group { display: flex; gap: 12px; }
    .btn {
      background-color: #007bff;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #0056b3; }
  </style>
</head>
<body>
  <h1>Frontend - Port 6101</h1>
  <p>You are currently on the Frontend.</p>

  <div class="btn-group">
    <a href="/frontend.html" class="btn">Frontend</a>
    <a href="/api.html" class="btn">API</a>
    <a href="/admin.html" class="btn">Admin Dashboard</a>
  </div>
</body>
</html>
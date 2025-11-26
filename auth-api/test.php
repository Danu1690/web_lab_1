<?php
// Простой тестовый файл без лишних заголовков
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Простая проверка - всегда возвращаем успех
echo json_encode([
    "status" => "success",
    "message" => "✅ Server is working perfectly!",
    "timestamp" => date('Y-m-d H:i:s'),
    "cors" => "CORS headers are set correctly"
]);
?>
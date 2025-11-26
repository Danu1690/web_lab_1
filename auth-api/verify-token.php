<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $headers = getallheaders();
    $token = null;
    
    // Получаем токен из заголовка Authorization
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        echo json_encode(["valid" => false, "message" => "Token required"]);
        exit;
    }
    
    // В реальном приложении здесь была бы проверка JWT токена
    // Для демонстрации просто проверяем, что токен существует
    $database = new Database();
    $db = $database->getConnection();
    
    // Здесь можно добавить проверку токена в базе данных
    // Пока просто возвращаем, что токен валиден
    echo json_encode([
        "valid" => true,
        "message" => "Token is valid"
    ]);
    
} else {
    echo json_encode(["valid" => false, "message" => "Invalid request method"]);
}
?>
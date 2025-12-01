<?php
// Минимальные заголовки
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Только POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST allowed");
    }

    // Получаем данные
    $input = json_decode(file_get_contents('php://input'));
    
    if (!$input || !isset($input->login) || !isset($input->password)) {
        throw new Exception("Need login and password");
    }

    // Простое подключение к БД
    $pdo = new PDO("mysql:host=localhost;dbname=auth_system", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Один запрос к БД
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE login = ?");
    $stmt->execute([$input->login]);
    $user = $stmt->fetch();

    if (!$user) {
        throw new Exception("User not found");
    }

    if (!password_verify($input->password, $user['password'])) {
        throw new Exception("Wrong password");
    }

    // Простой ответ
    echo json_encode([
        "success" => true,
        "message" => "OK",
        "access_token" => "temp_token_" . $user['id'], // временно без JWT
        "user" => ["id" => $user['id'], "login" => $input->login]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
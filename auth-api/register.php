<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Получаем JSON данные
        $json = file_get_contents('php://input');
        $data = json_decode($json);
        
        if (!$data) {
            throw new Exception("Invalid JSON data");
        }
        
        if (!isset($data->username) || !isset($data->email) || !isset($data->password)) {
            throw new Exception("All fields are required");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Проверка существования пользователя
        $checkQuery = "SELECT id FROM users WHERE email = ? OR username = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$data->email, $data->username]);
        
        if ($checkStmt->rowCount() > 0) {
            throw new Exception("User with this email or username already exists");
        }

        // Создание пользователя
        $query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        
        if ($stmt->execute([$data->username, $data->email, $hashedPassword])) {
            $userId = $db->lastInsertId();
            
            // Получаем данные пользователя
            $userQuery = "SELECT id, username, email, created_at FROM users WHERE id = ?";
            $userStmt = $db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "success" => true, 
                "message" => "User registered successfully",
                "token" => generateToken($userId),
                "user" => $user
            ]);
        } else {
            throw new Exception("Registration failed");
        }
    } else {
        throw new Exception("Invalid request method");
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
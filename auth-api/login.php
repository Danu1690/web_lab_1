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
        
        if (!isset($data->email) || !isset($data->password)) {
            throw new Exception("Email and password are required");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Поиск пользователя
        $query = "SELECT id, username, email, password, created_at FROM users WHERE email = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->email]);
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->password, $user['password'])) {
                // Убираем пароль из ответа
                unset($user['password']);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Login successful",
                    "token" => generateToken($user['id']),
                    "user" => $user
                ]);
            } else {
                throw new Exception("Invalid password");
            }
        } else {
            throw new Exception("User not found");
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
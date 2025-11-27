<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json);
        
        if (!$data) {
            throw new Exception("Invalid JSON data");
        }
        
        if (!isset($data->login) || !isset($data->password)) {
            throw new Exception("Login and password are required");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Поиск пользователя по логину
        $query = "SELECT id, first_name, last_name, email, login, password, age_group, gender, theme, created_at FROM users WHERE login = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->login]);
        
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
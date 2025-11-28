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
                
                // Генерируем токены
                $accessToken = generateJWT(['user_id' => $user['id']], JWT_ACCESS_SECRET, 900); // 15 минут
                $refreshToken = generateRefreshToken();
                
                // Сохраняем refresh токен в базу (30 дней)
                $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
                $refreshQuery = "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
                $refreshStmt = $db->prepare($refreshQuery);
                $refreshStmt->execute([$user['id'], $refreshToken, $expiresAt]);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Login successful",
                    "access_token" => $accessToken,
                    "refresh_token" => $refreshToken,
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
    http_response_code(401);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
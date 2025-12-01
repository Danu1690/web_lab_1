<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json);
        
        if (!$data) {
            throw new Exception("Invalid JSON data");
        }
        
        // Проверка обязательных полей
        $required_fields = ['first_name', 'last_name', 'email', 'login', 'password', 'age_group', 'gender'];
        foreach ($required_fields as $field) {
            if (!isset($data->$field) || empty(trim($data->$field))) {
                throw new Exception("Field {$field} is required");
            }
        }
        
        if (!isset($data->agreed_to_terms) || !$data->agreed_to_terms) {
            throw new Exception("You must agree to the terms");
        }

        // Валидация данных
        if (!preg_match('/^[A-Za-zА-Яа-яЁё\s-]{2,15}$/u', $data->first_name)) {
            throw new Exception("Invalid first name format");
        }
        
        if (!preg_match('/^[A-Za-zА-Яа-яЁё\s-]{2,15}$/u', $data->last_name)) {
            throw new Exception("Invalid last name format");
        }
        
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        if (strlen($data->login) < 6) {
            throw new Exception("Login must be at least 6 characters");
        }
        
        if (strlen($data->password) < 8) {
            throw new Exception("Password must be at least 8 characters");
        }

        // Проверка капчи
        if (!isset($data->captcha_answer) || !isset($data->captcha_correct_answer)) {
            throw new Exception("Captcha verification failed");
        }

        if (intval($data->captcha_answer) !== intval($data->captcha_correct_answer)) {
            throw new Exception("Invalid captcha answer");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Проверка существования пользователя
        $checkQuery = "SELECT id FROM users WHERE email = ? OR login = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$data->email, $data->login]);
        
        if ($checkStmt->rowCount() > 0) {
            throw new Exception("User with this email or login already exists");
        }

        // Создание пользователя
        $query = "INSERT INTO users (first_name, last_name, email, login, password, age_group, gender, agreed_to_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        
        if ($stmt->execute([
            $data->first_name,
            $data->last_name,
            $data->email,
            $data->login,
            $hashedPassword,
            $data->age_group,
            $data->gender,
            $data->agreed_to_terms ? 1 : 0
        ])) {
            $userId = $db->lastInsertId();
            
            // Получаем данные пользователя
            $userQuery = "SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at FROM users WHERE id = ?";
            $userStmt = $db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            // Генерируем Access Token (15 минут)
            $accessToken = generateJWT(['user_id' => $userId], JWT_ACCESS_SECRET, 900);
            
            // Генерируем Refresh Token
            $refreshToken = generateRefreshToken();
            
            // Сохраняем Refresh Token в БД (30 дней)
            $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
            $refreshQuery = "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
            $refreshStmt = $db->prepare($refreshQuery);
            $refreshStmt->execute([$userId, $refreshToken, $expiresAt]);
            
            // Устанавливаем httpOnly cookie с Refresh Token
            setcookie('refresh_token', $refreshToken, [
                'expires' => time() + (30 * 24 * 60 * 60),
                'path' => '/',
                'domain' => 'localhost',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            // Отправляем ТОЛЬКО Access Token клиенту
            echo json_encode([
                "success" => true, 
                "message" => "User registered successfully",
                "access_token" => $accessToken,
                "user" => $user
            ]);
        } else {
            throw new Exception("Registration failed");
        }
    } else {
        throw new Exception("Invalid request method");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>
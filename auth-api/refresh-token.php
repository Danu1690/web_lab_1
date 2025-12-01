<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Refresh token ТОЛЬКО из httpOnly cookie
        $refreshToken = $_COOKIE['refresh_token'] ?? null;
        
        if (!$refreshToken) {
            throw new Exception("Refresh token not found");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Проверяем refresh token в БД
        $query = "SELECT rt.user_id, u.first_name, u.last_name, u.email, u.login, u.age_group, u.gender, u.theme 
                 FROM refresh_tokens rt 
                 JOIN users u ON rt.user_id = u.id 
                 WHERE rt.token = ? AND rt.expires_at > NOW()";
        $stmt = $db->prepare($query);
        $stmt->execute([$refreshToken]);
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Генерируем новые токены
            $newAccessToken = generateJWT(['user_id' => $user['user_id']], JWT_ACCESS_SECRET, 900); // 15 минут
            $newRefreshToken = generateRefreshToken();
            
            // Обновляем в БД
            $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
            $updateQuery = "UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE token = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$newRefreshToken, $expiresAt, $refreshToken]);
            
            // Устанавливаем новый refresh token в cookie
            setcookie('refresh_token', $newRefreshToken, [
                'expires' => time() + (30 * 24 * 60 * 60),
                'path' => '/',
                'domain' => 'localhost',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            echo json_encode([
                "success" => true,
                "access_token" => $newAccessToken,
                "user" => $user
            ]);
        } else {
            throw new Exception("Invalid or expired refresh token");
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
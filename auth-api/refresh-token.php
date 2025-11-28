<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json);
        
        if (!$data || !isset($data->refresh_token)) {
            throw new Exception("Refresh token is required");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Проверяем refresh токен в базе
        $query = "SELECT rt.user_id, u.first_name, u.last_name, u.email, u.login, u.age_group, u.gender, u.theme 
                 FROM refresh_tokens rt 
                 JOIN users u ON rt.user_id = u.id 
                 WHERE rt.token = ? AND rt.expires_at > NOW()";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->refresh_token]);
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Генерируем новые токены
            $accessToken = generateJWT(['user_id' => $user['user_id']], JWT_ACCESS_SECRET, 900); // 15 минут
            $newRefreshToken = generateRefreshToken();
            
            // Обновляем refresh токен в базе
            $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
            $updateQuery = "UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE token = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$newRefreshToken, $expiresAt, $data->refresh_token]);
            
            echo json_encode([
                "success" => true,
                "message" => "Tokens refreshed successfully",
                "access_token" => $accessToken,
                "refresh_token" => $newRefreshToken,
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
<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $token = getBearerToken();
        
        if (!$token) {
            throw new Exception("Access token required");
        }
        
        $payload = validateJWT($token, JWT_ACCESS_SECRET);
        
        if (!$payload) {
            throw new Exception("Invalid or expired token");
        }
        
        $userId = $payload['user_id'];
        $json = file_get_contents('php://input');
        $data = json_decode($json);
        
        if (!$data || !isset($data->theme)) {
            throw new Exception("Theme is required");
        }

        if (!in_array($data->theme, ['light', 'dark'])) {
            throw new Exception("Invalid theme value");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Обновляем тему пользователя в БД
        $query = "UPDATE users SET theme = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        
        if ($stmt->execute([$data->theme, $userId])) {
            echo json_encode([
                "success" => true,
                "message" => "Theme updated successfully"
            ]);
        } else {
            throw new Exception("Failed to update theme");
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
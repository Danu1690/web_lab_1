<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        $token = getBearerToken();
        
        if (!$token) {
            throw new Exception("Access token required");
        }
        
        $payload = validateJWT($token, JWT_ACCESS_SECRET);
        
        if (!$payload) {
            throw new Exception("Invalid or expired token");
        }

        $database = new Database();
        $db = $database->getConnection();

        // Получаем список всех пользователей (без паролей)
        $query = "SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "users" => $users,
            "total" => count($users)
        ]);
        
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
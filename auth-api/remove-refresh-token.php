<?php
include 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Удаляем refresh token из базы данных
        if (isset($_COOKIE['refresh_token'])) {
            $database = new Database();
            $db = $database->getConnection();

            $query = "DELETE FROM refresh_tokens WHERE token = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_COOKIE['refresh_token']]);
        }

        // Удаляем cookie
        setcookie('refresh_token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        echo json_encode([
            "success" => true,
            "message" => "Refresh token removed successfully"
        ]);
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
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

        // Удаляем refresh токен из базы
        $query = "DELETE FROM refresh_tokens WHERE token = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->refresh_token]);
        
        echo json_encode([
            "success" => true,
            "message" => "Logged out successfully"
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
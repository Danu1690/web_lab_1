<?php
include 'config.php';

function authenticate() {
    $token = getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Access token required"]);
        exit;
    }
    
    $payload = validateJWT($token, JWT_ACCESS_SECRET);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid or expired access token"]);
        exit;
    }
    
    return $payload;
}
?>
<?php
include 'config.php';

class SessionManager {
    private $db;
    
    public function __construct($database) {
        $this->db = $database->getConnection();
    }
    
    public function createSession($userId, $refreshToken) {
        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));
        
        $query = "INSERT INTO user_sessions (session_id, user_id, refresh_token, expires_at, created_at) 
                 VALUES (?, ?, ?, ?, NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$sessionId, $userId, $refreshToken, $expiresAt]);
        
        // Устанавливаем сессионный идентификатор в куки
        setcookie('session_id', $sessionId, [
            'expires' => time() + (30 * 24 * 60 * 60),
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        return $sessionId;
    }
    
    public function getRefreshTokenBySession($sessionId) {
        $query = "SELECT refresh_token, user_id FROM user_sessions 
                 WHERE session_id = ? AND expires_at > NOW()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$sessionId]);
        
        if ($stmt->rowCount() == 1) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return null;
    }
    
    public function deleteSession($sessionId) {
        $query = "DELETE FROM user_sessions WHERE session_id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$sessionId]);
    }
}
?>
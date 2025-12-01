<?php
// Устанавливаем CORS заголовки ДО любого вывода
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true"); // ✅ ВАЖНО!
    header("Content-Type: application/json; charset=UTF-8");
}

// Обрабатываем preflight запросы OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


class Database {
    private $host = "localhost";
    private $db_name = "auth_system";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            error_log("Database connection failed: " . $exception->getMessage());
            echo json_encode([
                "success" => false, 
                "message" => "Database connection error"
            ]);
            exit;
        }
        return $this->conn;
    }
}

// JWT секретные ключи
define('JWT_ACCESS_SECRET', 'd7742782257a9bb69e2429960a7c1c4e');
define('JWT_REFRESH_SECRET', 'df77e00cbb584a2357bdaba0970a038f');

// Генерация JWT токена
function generateJWT($payload, $secret, $expiresIn = 3600) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expiresIn;
    $payload['iat'] = time();
    
    $base64Header = base64_encode($header);
    $base64Payload = base64_encode(json_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = base64_encode($signature);
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// Валидация JWT токена
function validateJWT($token, $secret) {
    try {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $signature = base64_decode($base64Signature);
        $expectedSignature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        $payload = json_decode(base64_decode($base64Payload), true);
        
        // Проверяем expiration time
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    } catch (Exception $e) {
        return false;
    }
}

// Генерация случайного refresh токена
function generateRefreshToken() {
    return bin2hex(random_bytes(32));
}

// Получение токена из заголовка
function getBearerToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?>
<?php

$request = $_SERVER["REQUEST_URI"]; // Variavel para a rota
$method = $_SERVER['REQUEST_METHOD']; // Method para os tipos de req

switch (true) {

    case $request === "/login" && $method === "POST": // Rota de Login
        echo json_encode(["route" => "/login"]);
        break;

    case $request === "/register" && $method === "POST": // Registro
        echo json_encode(["route" => "/register"]);
        break;

    case $request === "/notes" && $method === "GET":
        echo json_encode(["route" => "List Notes"]);
        break;

    case $request === "/notes" && $method === "POST":
        echo json_encode(["route" => "Create Note"]);
        break;

    
    case preg_match('/^\/notes\/\d+$/', $request) && $method === "GET":
        echo json_encode(["route" => "Get Note"]);
        break;


    case $request === "/uploadNote" && $method === "POST":
        echo json_encode(["route" => "Upload Note"]);
        break;


default:
    http_response_code(404);
    echo json_encode(['error' => 'Hey, Não existe essa rota kkk']);
        break;
}
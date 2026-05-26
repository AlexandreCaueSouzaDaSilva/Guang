@echo off
echo Iniciando back-end...
start cmd /k "cd artifacts\api-server && pnpm run build && pnpm run start"

echo Iniciando front-end...
start cmd /k "cd artifacts\guang-app && set PORT=5173 && set BASE_PATH=/ && pnpm dev"

echo Abrindo navegador...
timeout /t 5
start http://localhost:5173
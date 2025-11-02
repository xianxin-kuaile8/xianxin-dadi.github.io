@echo off
cls
echo ==========================================
echo 数据管理器初始化测试 - 本地服务器启动脚本
echo ==========================================
echo.
echo 正在尝试启动Python HTTP服务器...
python -m http.server 8080

if %errorlevel% neq 0 (
    echo.
    echo 警告: Python服务器启动失败！
    echo 尝试使用PowerShell启动服务器...
    echo.
    echo 请在PowerShell中运行以下命令:
    echo cd "%cd%" ; Start-Process powershell -ArgumentList "-Command {cd '%cd%'; python -m http.server 8080}"
    echo.
    echo 或者直接双击index.html文件在浏览器中打开
    echo.
    pause
)

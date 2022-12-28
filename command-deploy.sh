systemctl stop  webpad.service &&
dotnet publish -c Development --self-contained --runtime linux-x64 --framework netcoreapp6.0 -o bin-linux-2.2 &&
systemctl start  webpad.service

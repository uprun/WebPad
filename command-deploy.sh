systemctl stop  kestrel-asp.service &&
dotnet publish -c Development --self-contained --runtime linux-x64 --framework netcoreapp3.1 -o bin-linux-2.2 &&
systemctl start  kestrel-asp.service
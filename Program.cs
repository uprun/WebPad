using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConnectedNotes
{
    public class Program
    {
        public static string GetLocalIPAddress()
        {
            String strHostName = string.Empty;
            // Getting Ip address of local machine...
            // First get the host name of local machine.
            strHostName = Dns.GetHostName();
            Console.WriteLine("Local Machine's Host Name: " + strHostName);
            // Then using host name, get the IP address list..
            IPHostEntry ipEntry = Dns.GetHostEntry(strHostName);
            IPAddress[] addr = ipEntry.AddressList;

            string result = "";

            for (int i = 0; i < addr.Length; i++)
            {
                IPAddress iPAddress = addr[i];
                if(iPAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    result = iPAddress.ToString();
                }
                
                Console.WriteLine($"IP Address {i}: {iPAddress.ToString()} {iPAddress.AddressFamily} ");
            }
            return result;
        }
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .AddCommandLine(args)
                .Build();
            var result = WebHost.CreateDefaultBuilder(args)
                .UseConfiguration(configuration)
                .UseStartup<Startup>();
            
            var local_ip = GetLocalIPAddress();
            if (local_ip != "")
            {
                result = result.UseUrls($"https://{local_ip}:5002", $"http://{local_ip}:5003", "https://localhost:5001", "http://localhost:5000");
            }
            
            return result.Build();


        }
    }
}

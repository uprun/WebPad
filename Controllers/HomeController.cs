using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ConnectedNotes.Models;
using Newtonsoft.Json;

namespace ConnectedNotes.Controllers
{
    [RequestSizeLimit(100_000)]// explicit restriction to 100 kilobytes
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            Console.WriteLine($"main ip: {HttpContext.Connection.RemoteIpAddress.ToString()}");
            foreach(var header in Request.Headers)
            {
                if(header.Key == "User-Agent")
                {
                    Console.WriteLine($"main User-Agent: {header}");
                }
                
            }
            Console.WriteLine("===============================================");
            return View();
        }

        public IActionResult About()
        {
            Console.WriteLine($"About ip: {HttpContext.Connection.RemoteIpAddress.ToString()}");
            foreach(var header in Request.Headers)
            {
                if(header.Key == "User-Agent")
                {
                    Console.WriteLine($"About User-Agent: {header}");
                }
                
            }
            Console.WriteLine("===============================================");
            return View();
        }

        private static Dictionary<string, string> synchronization = new Dictionary<string, string>();

        private static Dictionary<string, List<string> > messageBox = new Dictionary<string, List<string> > ();

        private string GenerateToken()
        {
            char[] toSelect = new[] {'a', 'b', 'c', 'd', 'k', 'h', 'y', 'z', 'x', 's', 'f', 't'};
            var rnd = new Random();
            int firstPart = rnd.Next(100);
            int secondIndex = rnd.Next(toSelect.Length);
            int secondIndex_2 = rnd.Next(toSelect.Length);
            int thirdPart = rnd.Next(100);
            int fourthIndex = rnd.Next(toSelect.Length);
            int fourthIndex_2 = rnd.Next(toSelect.Length);
            return $"{firstPart}{toSelect[secondIndex]}{toSelect[secondIndex_2]}{thirdPart}{toSelect[fourthIndex]}{toSelect[fourthIndex_2]}";
        }

        [Throttle(Name = nameof(GetOneTimeSynchronizationToken), Seconds = 10)]
        public JsonResult GetOneTimeSynchronizationToken(string publicKey)
        {
            string token;
            lock(synchronization)
            {
                token = GenerateToken();
                for(int k = 0; k < 10; k++)
                {
                    if(synchronization.ContainsKey(token))
                    {
                        token = GenerateToken();
                    }
                    else
                    {
                        break;
                    }
                }
                if(synchronization.ContainsKey(token))
                {
                    throw new Exception("Failed to obtain link token");
                }
                synchronization.Add(token, publicKey);
            }

            return new JsonResult(token);
            
        }
        

        public JsonResult SendMessages(Message[] messages)
        {
            if(messages.Length > 10)
            {
                Request.HttpContext.Response.StatusCode = (int) System.Net.HttpStatusCode.Conflict;
                return new JsonResult(false);
            }
            int sum = messages.Sum(x => x.Receiver.Length + x.Text.Length);
            if(sum > 4000)
            {
                Request.HttpContext.Response.StatusCode = (int) System.Net.HttpStatusCode.Conflict;
                return new JsonResult(false);
            }
            

            foreach(var m in messages)
            {
                lock(messageBox)
                {
                    if(messageBox.ContainsKey(m.Receiver))
                    {
                        var mailBoxOfReceiver = messageBox[m.Receiver];
                        
                        mailBoxOfReceiver.Add(m.Text);

                    }
                    else
                    {
                        messageBox.Add(m.Receiver, new List<string>() { m.Text });
                    }
                }
            }

            return new JsonResult(true);
            
        }

        public JsonResult ReceiveMessages(string publicKey)
        { // potential place for abuse, because anyone who nows my public key can receive messages for me, but on the other hand they are encrypted
            var result = new List<string>();
        
            lock(messageBox)
            {
                if(messageBox.ContainsKey(publicKey))
                {
                    var mailBoxOfReceiver = messageBox[publicKey];
                    result.AddRange(mailBoxOfReceiver.Take(5));
                    messageBox[publicKey] = mailBoxOfReceiver.Skip(5).ToList();

                }
            }
           

            return new JsonResult(result);
            
        }
        
        [Throttle(Name = nameof(GetSyncPublicKey), Seconds = 5)]
        public JsonResult GetSyncPublicKey(string token)
        {
            string publicKey;
            lock(synchronization)
            {
                if(synchronization.ContainsKey(token))
                {
                    publicKey = synchronization[token];
                    synchronization.Remove(token);
                }
                else
                {
                    throw new Exception("Syncronization token not found");
                }
            }
            return new JsonResult(publicKey);

        }

    
    }
}

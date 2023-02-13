using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace WebPad.Controllers
{
    [RequestSizeLimit(100_000)]// explicit restriction to 100 kilobytes
    public class HomeController : Controller
    {
        

        public IActionResult ideas(string source)
        {
            lock(pageLocker)
            {
                homePageCounter++;
                Console.WriteLine($"#{homePageCounter} open of \"{nameof(ideas)}\" page");
            }
            
            return View();
        }

        public async Task GenerateBundle()
        {
            Console.WriteLine(nameof(GenerateBundle));
            string v = Path.Combine(Directory.GetCurrentDirectory(), "Views", "Home", "ideas.cshtml");
            string output_path = Path.Combine(Directory.GetCurrentDirectory(), "Views", "Home", "bundle_ideas.cshtml");
            using (StreamReader str_r = new StreamReader(v))
            using (StreamWriter str_w = new StreamWriter(output_path))
            {
                while(str_r.EndOfStream == false)
                {
                    var line = await str_r.ReadLineAsync();
                    var trimmed = line.Trim();
                    if(trimmed.StartsWith("<script language=\"JavaScript\"") && trimmed.Contains("src=\""))
                    {
                        Console.WriteLine("Replaced by content of the file");

                    }
                    else
                    {
                        Console.WriteLine(line);
                    }
                    
                } 
            }
        }

        

        private static Dictionary<string, string> synchronization = new Dictionary<string, string>();

        private static Dictionary<(string Receiver, string Sender), List<string> > messageBox = new Dictionary<(string Receiver, string Sender), List<string> > ();

        private static object pageLocker = new object();

        private static int homePageCounter = 0;

        

    
    }
}

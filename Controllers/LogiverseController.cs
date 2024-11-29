using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using System.Threading;

namespace WebPad.Controllers
{
    
    [RequestSizeLimit(100_000)]// explicit restriction to 100 kilobytes
    public class HomeController : Controller
    {
        
        public IActionResult ideas(string source)
        {
            Interlocked.Increment(ref homePageCounter);
            Console.WriteLine($"#{homePageCounter} open of \"{nameof(ideas)}\" page");
            
            Response.Redirect("bundle_ideas.html");
            
            return View();
        }

        private static int homePageCounter = 0;

        

    
    }
}

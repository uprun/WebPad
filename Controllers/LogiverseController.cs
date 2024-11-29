using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using System.Threading;

namespace WebPad.Controllers
{
    
    [RequestSizeLimit(4_000)]// explicit restriction to 4 kilobytes
    public class LogiverseController : Controller
    {

        public IActionResult ideas(string source)
        {
            Interlocked.Increment(ref homePageCounter);
            Console.WriteLine($"#{homePageCounter} open of \"{nameof(ideas)}\" page");
            
            Response.Redirect("bundle_ideas.html");
            
            return View();
        }
        [HttpGet]
        public JsonResult GetUsers()
        {
            return new JsonResult("hello GetUsers");
        }

        [HttpPost]
        public JsonResult CreateUser([FromBody]string user, [FromBody] string password)
        {
            return new JsonResult("hello CreateUser");
        }
    
    }
}

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
        [HttpGet]
        public JsonResult GetUsers()
        {
            return new JsonResult("hello GetUsers");
        }
    
    }
}

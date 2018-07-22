using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ConnectedNotes.Models;

namespace ConnectedNotes.Controllers
{
    public class HomeController : Controller
    {

        List<Note> notes = new List<Note>();
        public IActionResult Index()
        {
            return View();
        }

        public JsonResult RetrieveAllNotes()
        {
            return new JsonResult(notes);
        }
    }
}

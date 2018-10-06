using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ConnectedNotes.Models;
using Newtonsoft.Json;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;

namespace ConnectedNotes.Controllers
{
    public class HomeController : Controller
    {

        string notesName = "notes";
        public IActionResult Index()
        {
            return View();
        }

        private NotesRepo retrieveNotesRepo()
        {
            byte[] value; 
            var retrieved = HttpContext.Session.TryGetValue(notesName, out value);
            BinaryFormatter formatter = new BinaryFormatter();
            
            if(retrieved && value != null)
            {
                var ms = new MemoryStream(value);
                var repo = formatter.Deserialize(ms) as NotesRepo;
                return repo;
            } 
            return  new NotesRepo(); 
        }

        private void saveRepo(NotesRepo repo)
        {
            long notesTextLength = repo.Notes.Sum(x => x.Text?.Length ?? 0);
            long connectionsTextLength = repo.Connections.Sum(x => x.Label?.Length ?? 0);
            long totalSum = notesTextLength + connectionsTextLength;
            if(totalSum < 0 || totalSum > 200_000) 
            {
                throw new Exception("Free characters limit");
            }
            if(repo.Notes.Count > 10_000)
            {
                throw new Exception("Notes count limit");
            }
            if(repo.Connections.Count > 20_000)
            {
                throw new Exception("Connections count limit");
            }
            BinaryFormatter formatter = new BinaryFormatter();
            MemoryStream ms = new MemoryStream();
            formatter.Serialize(ms, repo);
            HttpContext.Session.Set(notesName, ms.ToArray());
            ms.Close();
        }

        [Throttle(Name = nameof(RetrieveAllNotes), Seconds = 5)]
        public JsonResult RetrieveAllNotes()
        {
            var repo = retrieveNotesRepo();
            return new JsonResult(repo);
        }

        //generate key-pair
        // store private-part in local-web-storage or in file
        // on login download from web-server changes prepared for you with someone public key to which you trust

    
    }
}

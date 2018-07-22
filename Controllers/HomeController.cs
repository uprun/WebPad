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

        private List<Note> retrieveNotes()
        {
            byte[] value; 
            var retrieved = HttpContext.Session.TryGetValue(notesName, out value);
            BinaryFormatter formatter = new BinaryFormatter();
            
            if(retrieved && value != null)
            {
                var ms = new MemoryStream(value);
                return formatter.Deserialize(ms) as List<Note>;
            } 
            return  new List<Note>(); 
        }

        private void saveNotes(List<Note> notes)
        {
            BinaryFormatter formatter = new BinaryFormatter();
            MemoryStream ms = new MemoryStream();
            try
            {
                formatter.Serialize(ms, notes);
            }
            catch(Exception e)
            {

            }
            
            
            HttpContext.Session.Set(notesName, ms.ToArray());
            ms.Close();
        }

        public JsonResult RetrieveAllNotes()
        {
            List<Note> notes = retrieveNotes();
            notes.Add(
                new Note
                {
                    Text = "Hello world"
                }
            );
            saveNotes(notes);
            return new JsonResult(notes);
        }
    }
}

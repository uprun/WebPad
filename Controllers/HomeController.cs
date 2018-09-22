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

        [Throttle(Name = nameof(CreateNote), Seconds = 1)]
        public JsonResult CreateNote(string text)
        {
            var repo = retrieveNotesRepo();
            List<Note> notes = repo.Notes;
            var count = repo.FreeIndex;
            var date = DateTime.Now;
            var toAdd = new Note
                {
                    Id = count,
                    Text = (text ?? "").Trim(),
                    CreatedOn = date,
                    UpdatedOn = date
                };
            notes.Add(
                toAdd
            );
            repo.FreeIndex++;
            saveRepo(repo);
            return new JsonResult(toAdd);
        }

        [Throttle(Name = nameof(ConnectedNotes), Seconds = 1)]
        public JsonResult ConnectNotes(Note from, Note to, string label)
        {
            var repo = retrieveNotesRepo();
            List<Note> notes = repo.Notes;
            var foundTo = notes.FirstOrDefault(x => x.Id == to.Id);
            if(foundTo != null)
            {
                var foundFrom = notes.FirstOrDefault(x => x.Id == from.Id);
                
                if(foundFrom != null)
                {
                    var toAdd = new Connection 
                        {
                            Source = from,
                            Destination = to,
                            Label = label,
                            Id = repo.FreeIndex++
                        };

                    repo.Connections.Add(toAdd);
                    saveRepo(repo);
                    return new JsonResult(toAdd);
                }
            }
            throw new Exception("Not found prerequisites.");
        }

        [Throttle(Name = nameof(UpdateNote), Seconds = 1)]
        public JsonResult UpdateNote(Note note)
        {
            var repo = retrieveNotesRepo();
            List<Note> notes = repo.Notes;
            var foundNote = notes.FirstOrDefault(x => x.Id == note.Id);
            foundNote.Text = note.Text;
            saveRepo(repo);
            return new JsonResult(foundNote);
        }

        [Throttle(Name = nameof(UpdateConnection), Seconds = 1)]
        public JsonResult UpdateConnection(Connection connection)
        {
            var repo = retrieveNotesRepo();
            var found = repo.Connections.FirstOrDefault(c => c.Id == connection.Id);
            found.Label = connection.Label;
            saveRepo(repo);
            return new JsonResult(found);
        }

        [Throttle(Name = nameof(RemoveNote), Seconds = 1)]
        public JsonResult RemoveNote(Note note)
        {
            var repo = retrieveNotesRepo();
            var found = repo.Notes.FirstOrDefault(n => n.Id == note.Id);
            if(found != null)
            {
                repo.Notes = repo.Notes.Where(n => n.Id != note.Id).ToList();
                repo.Connections = repo.Connections.Where(c => !(c.Source.Id == note.Id || c.Destination.Id == note.Id)).ToList();
            }
            saveRepo(repo);
            return new JsonResult(true);
        }

        [Throttle(Name = nameof(RemoveConnection), Seconds = 1)]
        public JsonResult RemoveConnection(long id)
        {
            var repo = retrieveNotesRepo();
            var found = repo.Connections.FirstOrDefault(c => c.Id == id);
            if(found != null)
            {
                repo.Connections = repo.Connections.Where(c => c.Id != id).ToList();
            }
            saveRepo(repo);
            return new JsonResult(true);
        }
    }
}

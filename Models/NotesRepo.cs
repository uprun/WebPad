using System;
using System.Collections.Generic;

namespace ConnectedNotes.Models
{
    [Serializable]
    public class NotesRepo
    {
        public List<Note> Notes {get; set;}

        public List<Connection> Connections {get; set;}

        public long FreeIndex {get; set;}

        public NotesRepo()
        {
            FreeIndex = 0;
            Notes = new List<Note>();
            Connections = new List<Connection>();
        }
    }
}
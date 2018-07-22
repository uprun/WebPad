using System;
using System.Collections.Generic;

namespace ConnectedNotes.Models
{
    [Serializable]
    public class Note
    {
        public long Id {get ;set;}
        public string Text {get ; set;}

        public List<Note> ConnectedWith {get; set;}

        public DateTime CreatedOn {get; set;}

        public DateTime UpdatedOn {get; set;}

    }
}
using System;

namespace ConnectedNotes.Models
{
    [Serializable]
    public class Connection
    {
        public long Id {get; set;}
        public string Label {get; set;}
        public Note Source {get; set;}
        public Note Destination {get; set;}
    }
}
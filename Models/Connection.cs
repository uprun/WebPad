using System;

namespace ConnectedNotes.Models
{
    [Serializable]
    public class Connection
    {
        public string Id {get; set;}
        public string Label {get; set;}
        public string SourceId {get; set;}
        public string DestinationId {get; set;}
    }
}
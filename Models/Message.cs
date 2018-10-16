using System;

namespace ConnectedNotes.Models
{
    [Serializable]
    public class Message
    {
        public string Receiver {get; set;}

        public string Text {get; set;}
        
    }
}
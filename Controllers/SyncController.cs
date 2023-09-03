using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System.Net;
using System.Net.Sockets;

namespace WebPad.Controllers
{
    [RequestSizeLimit(5_000)]// explicit restriction to 5 kilobytes
    public class SyncController : Controller
    {
        private List<string> messages = new List<string>();
        private HashSet<string> messages_availability = new HashSet<string>();

        private void read_messages_from_file()
        {
            var path_to_src_file = Path.Combine(Directory.GetCurrentDirectory(), "local-notes-sync.txt");

            using (var extra_readed = new StreamReader(path_to_src_file, 
                new FileStreamOptions(){
                    Mode = FileMode.OpenOrCreate
                }))
            {
                while(extra_readed.EndOfStream == false)
                {
                    var line = extra_readed.ReadLine();
                    messages.Add(line);
                    messages_availability.Add(line);
                }
            }
        }

        [HttpPost]
        public void AddMessage(string message)
        {
            if(messages.Count == 0)
            {
                read_messages_from_file();
            }

            if(messages_availability.Contains(message))
            {
                return;
            }

            messages.Add(message);
            messages_availability.Add(message);
            write_to_file(message);
        }

        [HttpGet]
        public bool Are_there_new_messages(int read_messages_count)
        {
            return (messages.Count > read_messages_count);
        }

        [HttpGet]
        public string Read_message(int index_of_message)
        {
            return messages[index_of_message];
        }

        private void write_to_file(string message)
        {
            var path_to_src_file = Path.Combine(Directory.GetCurrentDirectory(), "local-notes-sync.txt");

            using (var writer = new StreamWriter(path_to_src_file, 
                new FileStreamOptions(){
                    Mode = FileMode.Append
                }))
            {
                writer.WriteLine(message);
            }
        }
    }
}

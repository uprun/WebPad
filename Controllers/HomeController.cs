using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace WebPad.Controllers
{
    [RequestSizeLimit(100_000)]// explicit restriction to 100 kilobytes
    public class HomeController : Controller
    {
        

        public IActionResult ideas(string source)
        {
            lock(pageLocker)
            {
                homePageCounter++;
                Console.WriteLine($"#{homePageCounter} open of \"{nameof(ideas)}\" page");
            }
            Response.Redirect("bundle_ideas.html");
            
            return View();
        }

        public async Task GenerateBundle()
        {
            Console.WriteLine(nameof(GenerateBundle));
            string v = Path.Combine(Directory.GetCurrentDirectory(), "Views", "Home", "ideas.cshtml");
            string output_path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "bundle_ideas.html");
            using (StreamReader input_source = new StreamReader(v))
            using (StreamWriter output_writer = new StreamWriter(output_path))
            {
                while(input_source.EndOfStream == false)
                {
                    var line = await input_source.ReadLineAsync();
                    var trimmed = line.Trim();
                    if(trimmed.StartsWith("<script ") && trimmed.Contains("src=\"") && (trimmed.Contains("lisperanto-skip-bundle=\"true\"") == false))
                    {
                        var splitted = trimmed.Split(new []{" ", "</script>", ">" , "<script"}, StringSplitOptions.RemoveEmptyEntries);
                        string src_from_script = splitted.First(a => a.StartsWith("src="));
                        var actual_path = src_from_script.Substring("src=\"".Length, src_from_script.Length - "src=\"\"".Length);
                        
                        output_writer.WriteLine("<script>");
                        var path_to_src_file = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", actual_path);
                        Console.WriteLine($"Processing \"{path_to_src_file}\"");
                        output_writer.WriteLine($"// Begin of \"{actual_path}\"");
                        using(var extra_readed = new StreamReader(path_to_src_file))
                        {
                            var all_content = extra_readed.ReadToEnd();
                            output_writer.Write(all_content);

                        }
                        output_writer.WriteLine("");
                        output_writer.WriteLine($"// End of \"{actual_path}\"");
                        output_writer.WriteLine("</script>");

                    }
                    else
                    {
                        //Console.WriteLine(line);
                        output_writer.WriteLine(line);
                    }
                    
                } 
            }
        }

        

        private static Dictionary<string, string> synchronization = new Dictionary<string, string>();

        private static Dictionary<(string Receiver, string Sender), List<string> > messageBox = new Dictionary<(string Receiver, string Sender), List<string> > ();

        private static object pageLocker = new object();

        private static int homePageCounter = 0;

        

    
    }
}


using System;
using System.Collections.Generic;
using System.Linq;

using System.IO;
using System.Threading.Tasks;
using System.Threading;

namespace WebPad;
public class Bundle_Watcher
{
    FileSystemWatcher watcher = null;

    
    public void Start()
    {
        if (watcher != null) return;
        GenerateBundle().Wait();
        var path = Directory.GetCurrentDirectory();
        Console.WriteLine($"watching {path}");
        watcher = new FileSystemWatcher(path);

        watcher.NotifyFilter = NotifyFilters.Attributes
                                | NotifyFilters.CreationTime
                                | NotifyFilters.DirectoryName
                                | NotifyFilters.FileName
                                | NotifyFilters.LastAccess
                                | NotifyFilters.LastWrite
                                | NotifyFilters.Security
                                | NotifyFilters.Size;

        watcher.Changed += OnChanged;
        watcher.Created += OnChanged;
        watcher.Deleted += OnChanged;
        watcher.Renamed += OnChanged;
        

        watcher.Filter = "*.*";
        watcher.IncludeSubdirectories = true;
        watcher.EnableRaisingEvents = true;

    }

    private void OnChanged(object sender, FileSystemEventArgs e)
    {
        Console.WriteLine(e.FullPath);
        if (e.FullPath.EndsWith( "bundle_ideas.html")) return;
        if (e.FullPath.EndsWith("bundle-backend-worker.js")) return;
        Console.Write($"changes detected as of time: {DateTime.Now:HH-mm}");
        Console.Write(" <^_^> ");
        GenerateBundle().Wait();
    }

    
    public async Task GenerateBundle()
    {
        Console.WriteLine(nameof(GenerateBundle));
        string input_path = Path.Combine(Directory.GetCurrentDirectory(), "Views", "Home", "ideas.html");
        string output_path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "bundle_ideas.html");
        await helper_generate_bundle(input_path, output_path);
        
        await GenerateBundle_worker();
    }

    private async Task GenerateBundle_worker()
    {
        Console.WriteLine(nameof(GenerateBundle_worker));
        string input_path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "worker-scripts", "backend-worker.js");
        string output_path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "worker-scripts", "bundle-backend-worker.js");
        await helper_generate_bundle(input_path, output_path);
    }

    private static async Task helper_generate_bundle(string input_path, string output_path)
    {
        using (StreamReader input_source = new StreamReader(input_path))
        using (StreamWriter output_writer = new StreamWriter(output_path))
        {
            while (input_source.EndOfStream == false)
            {
                var line = await input_source.ReadLineAsync();

                var trimmed = line.Trim();
                
                if (trimmed.StartsWith("<lisperanto-just-paste "))
                {
                    embed_just_paste(line, output_writer);
                }
                else
                {
                    output_writer.WriteLine(line);
                }
            }
        }
    }



    private static void embed_just_paste( string trimmed, StreamWriter output_writer)
    {
        var splitted = trimmed.Split(new[] { " ", "</lisperanto-just-paste>", "/>", ">", "<lisperanto-just-paste " }, StringSplitOptions.RemoveEmptyEntries);
        string src_from_script = splitted.First(a => a.StartsWith("src="));
        var actual_path = src_from_script.Substring("src=\"".Length, src_from_script.Length - "src=\"\"".Length);

        var path_to_src_file = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", actual_path);
        
        using (var extra_reader = new StreamReader(path_to_src_file))
        {
            while (extra_reader.EndOfStream == false)
            {
                var line = extra_reader.ReadLine();

                var trimmed_extra = line.Trim();

                if (trimmed_extra.StartsWith("<lisperanto-just-paste ") && trimmed.Contains("src=\""))
                {
                    embed_just_paste(trimmed_extra, output_writer);
                    continue;
                }

                output_writer.WriteLine(line);

            }

        }

    }
}

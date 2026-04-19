using System;
using System.Linq;
using System.Reflection;
using Axure.Document;

class ListTypes
{
    static void Main(){
        var asm = typeof(RPDocument).Assembly;
        var ts = asm.GetTypes().OrderBy(t=>t.FullName).ToList();
        foreach(var t in ts){
            var n=t.FullName;
            if(n.Contains("RP") && (n.Contains("Widget") || n.Contains("Page") || n.Contains("Interaction") || n.Contains("Event") || n.Contains("Package") || n.Contains("Text"))){
                Console.WriteLine("TYPE|"+n);
            }
        }
    }
}

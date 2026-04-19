using System;
using System.Reflection;
class R
{
    static void Main(string[] args){
        var asm = Assembly.LoadFrom(args[0]);
        foreach(var t in asm.GetTypes()){
            var n=t.FullName;
            if(n.IndexOf("RPPackageInfo", StringComparison.OrdinalIgnoreCase)>=0 || n.IndexOf("RPWidget", StringComparison.OrdinalIgnoreCase)>=0 || n.IndexOf("RPPage", StringComparison.OrdinalIgnoreCase)>=0 || n.IndexOf("RPInteraction", StringComparison.OrdinalIgnoreCase)>=0 || n.IndexOf("RPEvent", StringComparison.OrdinalIgnoreCase)>=0 || n.IndexOf("Text", StringComparison.OrdinalIgnoreCase)>=0){
                Console.WriteLine("TYPE|"+n);
                foreach(var p in t.GetProperties(BindingFlags.Public|BindingFlags.Instance)) Console.WriteLine("P|"+p.PropertyType.FullName+"|"+p.Name);
            }
        }
    }
}

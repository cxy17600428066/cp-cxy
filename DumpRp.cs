using System;
using System.Collections.Generic;
using System.IO;
using Axure.Document;

class DumpRp
{
    static List<RPPackageHandle> GetHandles(RPTreeMap tm){
        var list = new List<RPPackageHandle>();
        foreach(var n in tm.RootNodes) Walk(n,list);
        return list;
    }

    static void Walk(RPTreeMapNode node, List<RPPackageHandle> list){
        if(node.NodeType == RPTreeMapNodeType.PackageHandle) list.Add((RPPackageHandle)node.NodeValue);
        foreach(var c in node.ChildNodes) Walk(c,list);
    }

    static void Main(string[] args)
    {
        if(args.Length < 2){
            Console.WriteLine("Usage: DumpRp <input.rp> <output.txt>");
            return;
        }
        string input = args[0];
        string output = args[1];

        var doc = RPDocument.Load(input);
        using(var sw = new StreamWriter(output, false, System.Text.Encoding.UTF8)){
            sw.WriteLine("[SITEMAP]");
            foreach(var h in GetHandles(doc.Sitemap)){
                var pi = doc.GetPackageInfo(h);
                sw.WriteLine("PAGE|" + pi.PackageName + "|" + pi.PackageType);
                var page = doc.LoadPackage(h) as RPPage;
                if(page == null) continue;
                sw.WriteLine("PAGE_INTERACTION|" + page.HasInteraction);
                if(page.HasInteraction){
                    foreach(var ev in page.Interaction.Events){
                        sw.WriteLine("EVENT|" + ev.EventType + "|" + (ev.EventDescription ?? ""));
                    }
                }
                var diagram = page.Diagram;
                sw.WriteLine("WIDGET_COUNT|" + diagram.Widgets.Count);
                foreach(var w in diagram.Widgets){
                    DumpWidget(sw,w,0);
                }
            }
            sw.WriteLine("[MASTERMAP]");
            foreach(var h in GetHandles(doc.Mastermap)){
                var pi = doc.GetPackageInfo(h);
                sw.WriteLine("MASTER|" + pi.PackageName + "|" + pi.PackageType);
            }
        }
    }

    static void DumpWidget(StreamWriter sw, RPWidget w, int depth){
        string pad = new string(' ', depth*2);
        string text = "";
        var tw = w as RPTextWidget;
        if(tw != null) text = (tw.Text ?? "").Replace("\r"," ").Replace("\n"," ");
        sw.WriteLine(pad + "W|" + w.GetType().Name + "|" + w.Name + "|" + text + "|" + w.Rectangle.X + "," + w.Rectangle.Y + "," + w.Rectangle.Width + "," + w.Rectangle.Height);
        if(w.HasInteraction){
            foreach(var ev in w.Interaction.Events){
                sw.WriteLine(pad + "E|" + ev.EventType + "|" + (ev.EventDescription ?? ""));
            }
        }
        if(w.HasChildren){
            foreach(var c in w.Widgets){
                DumpWidget(sw,c,depth+1);
            }
        }
    }
}

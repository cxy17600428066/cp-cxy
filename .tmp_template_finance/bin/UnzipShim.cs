using System;
using System.IO;
using System.IO.Compression;
class UnzipShim {
  static int Main(string[] a) {
    if (a.Length < 2) return 2;
    using (var z = ZipFile.OpenRead(a[1])) {
      if (a[0] == "-Z1") {
        foreach (var e in z.Entries) Console.WriteLine(e.FullName);
        return 0;
      }
      if (a[0] == "-p" && a.Length >= 3) {
        var e = z.GetEntry(a[2]);
        if (e == null) return 1;
        using (var input = e.Open()) input.CopyTo(Console.OpenStandardOutput());
        return 0;
      }
    }
    return 2;
  }
}

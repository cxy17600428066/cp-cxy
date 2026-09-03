import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "E:\\cxy\\2026年度卓希线下经营管理报表Q1-大客中心7.20.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheets = await wb.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 });
console.log("SHEETS");
console.log(sheets.ndjson);
const target = wb.worksheets.getItem("事业部利润表");
const used = target.getUsedRange();
console.log("USED", used?.address ?? "none");
const data = await wb.inspect({
  kind: "table",
  sheetId: "事业部利润表",
  range: used?.address ?? "A1:Z100",
  include: "values,formulas",
  tableMaxRows: 150,
  tableMaxCols: 40,
  tableMaxCellChars: 120,
  maxChars: 50000,
});
console.log("DATA");
console.log(data.ndjson);

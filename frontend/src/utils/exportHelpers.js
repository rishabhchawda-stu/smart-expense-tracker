import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./formatCurrency";

export const exportToCSV = (data, columns, filename) => {

  const headers = columns.map((col) => col.label).join(",");

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = item[col.key];

        
        if (col.key === "date") {
          value = formatDate(value);
        } else if (col.key === "amount") {
          value = value; 
        }

        const stringValue = String(value ?? "");
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


export const exportToPDF = (title, data, columns, summary, filename) => {
  
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100); 
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 27);

  let startY = 35;

  if (summary) {
    doc.setFontSize(11);
    doc.setTextColor(0);

    Object.entries(summary).forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, startY + index * 7);

      doc.setFont("helvetica", "normal");
      doc.text(String(value), 60, startY + index * 7);
    });

    startY += Object.keys(summary).length * 7 + 8;
  }

  const tableHeaders = columns.map((col) => col.label);

  const tableRows = data.map((item) =>
    columns.map((col) => {
      let value = item[col.key];

      if (col.key === "date") {
        return formatDate(value);
      }
      if (col.key === "amount") {
        return formatCurrency(value);
      }
      return value || "—";
    })
  );

  autoTable(doc, {
    startY,
    head: [tableHeaders],
    body: tableRows,
    theme: "striped", 
    headStyles: {
      fillColor: [79, 70, 229], 
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  
  doc.save(`${filename}.pdf`);
};
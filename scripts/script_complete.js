// Function to export all tables across different sections as JSON
function exportTablesToJson() {
    // Define column names for each type of table
    const impuestoColumns = ["lim_inf", "lim_sup", "cantidad1", "cantidad2"];
    const subsidioColumns = ["lim_inf", "lim_sup", "cantidad1"];

    // Gather data for each frequency section with metadata
    const jsonData = [
        {
            id: document.getElementById("semanalImpuestoId").value || "1",
            nombre: document.getElementById("semanalImpuestoName").value || "SEMANAL 2023 PUBLICADA 27 semanal",
            tipo: "sem",
            referencia: "Internet",
            impuesto: getTableData("semanalImpuestoTable", impuestoColumns, document.getElementById("semanalImpuestoId").value || "1"),
            subsidio: getTableData("semanalSubsidioTable", subsidioColumns, document.getElementById("semanalImpuestoId").value || "1")
        },
        {
            id: document.getElementById("quincenalImpuestoId").value || "2",
            nombre: document.getElementById("quincenalImpuestoName").value || "QUINCENAL 2023 PUBLICADA quincenal",
            tipo: "qui",
            referencia: "Internet",
            impuesto: getTableData("quincenalImpuestoTable", impuestoColumns, document.getElementById("quincenalImpuestoId").value || "2"),
            subsidio: getTableData("quincenalSubsidioTable", subsidioColumns, document.getElementById("quincenalImpuestoId").value || "2")
        },
        {
            id: document.getElementById("mensualImpuestoId").value || "3",
            nombre: document.getElementById("mensualImpuestoName").value || "MENSUAL 2023 PUBLICADA 27 mensual",
            tipo: "mes",
            referencia: "Internet",
            impuesto: getTableData("mensualImpuestoTable", impuestoColumns, document.getElementById("mensualImpuestoId").value || "3"),
            subsidio: getTableData("mensualSubsidioTable", subsidioColumns, document.getElementById("mensualImpuestoId").value || "3")
        },
        {
            id: document.getElementById("anualImpuestoId").value || "4",
            nombre: document.getElementById("anualImpuestoName").value || "ANUAL 2023 PUBLICADA 27 anual",
            tipo: "anu",
            referencia: "Internet",
            impuesto: getTableData("anualImpuestoTable", impuestoColumns, document.getElementById("anualImpuestoId").value || "4")
            // No "subsidio" for the "anual" section
        }
    ];

    // Convert JSON data to a string and create a downloadable file
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "allTablesData.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Function to gather data from a table and set null for empty values
function getTableData(tableId, columnNames, parentId) {
    const table = document.getElementById(tableId);
    const rows = table.rows;
    const data = [];
    
    for (let i = 1; i < rows.length; i++) {
        const rowData = {
            id: String(i),  // Row ID, can also use a counter if needed
            padre_id: parentId, // Set padre_id based on the provided parentId parameter
            lim_inf: null,
            lim_sup: null,
            cantidad1: null,
            cantidad2: null,
            cantidad3: null
        };
        
        const cells = rows[i].cells;
        columnNames.forEach((colName, index) => {
            const input = cells[index].querySelector("input");
            rowData[colName] = input && input.value.trim() === "" ? null : input.value;
        });

        data.push(rowData);
    }

    return data;
}

// Function to add a row with autofill behavior
function addRow(tableId) {
    const table = document.getElementById(tableId);
    const newRow = table.insertRow();
    const columns = table.rows[0].cells.length;

    for (let i = 0; i < columns; i++) {
        const cell = newRow.insertCell();
        cell.innerHTML = '<input type="number">';
    }

    const rowCount = table.rows.length;
    if (rowCount > 2) { // Ensure there's at least one data row before the new one
        const lastRow = table.rows[rowCount - 2];
        let lastValue, newInput;

        if (tableId.includes("Impuesto")) {
            const lastLimSupInput = lastRow.cells[1].querySelector("input");
            lastValue = parseFloat(lastLimSupInput.value);
            newInput = newRow.cells[0].querySelector("input"); // "limite inferior" of the new row
        } else if (tableId.includes("Subsidio")) {
            const lastIngresosHastaInput = lastRow.cells[1].querySelector("input");
            lastValue = parseFloat(lastIngresosHastaInput.value);
            newInput = newRow.cells[0].querySelector("input"); // "para ingresos desde" of the new row
        }

        if (!isNaN(lastValue) && newInput) {
            newInput.value = (lastValue + 0.01).toFixed(2);
            newInput.readOnly = true;
        }
    }

    if (tableId.includes("Impuesto")) {
        newRow.cells[1].querySelector("input").oninput = function() {
            updateNextRowValue(tableId, this, 0);
        };
    } else if (tableId.includes("Subsidio")) {
        newRow.cells[1].querySelector("input").oninput = function() {
            updateNextRowValue(tableId, this, 0);
        };
    }
}

// Function to remove the last row in a table
function removeRow(tableId) {
    const table = document.getElementById(tableId);
    const rowCount = table.rows.length;
    if (rowCount > 1) {
        table.deleteRow(rowCount - 1);
    }
}

// Function to update the next row's input value
function updateNextRowValue(tableId, currentInput, targetColumnIndex) {
    const currentRow = currentInput.closest("tr");
    const nextRow = currentRow.nextElementSibling;

    if (nextRow) {
        const currentValue = parseFloat(currentInput.value);
        if (!isNaN(currentValue)) {
            let nextInput;
            
            if (tableId.includes("Impuesto")) {
                nextInput = nextRow.cells[0].querySelector("input"); // Always target index 0 for impuesto
            } else if (tableId.includes("Subsidio")) {
                nextInput = nextRow.cells[targetColumnIndex].querySelector("input");
            }

            if (nextInput) {
                nextInput.value = (currentValue + 0.01).toFixed(2);
                nextInput.readOnly = true;
            }
        }
    }
}
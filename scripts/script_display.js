let fileData = null;

// Expected structure for validation
const requiredSections = [
    { type: "sem", name: "Semanal" },
    { type: "qui", name: "Quincenal" },
    { type: "mes", name: "Mensual" },
    { type: "anu", name: "Anual" }
];

const impuestoColumns = ["lim_inf", "lim_sup", "cantidad1", "cantidad2"];
const subsidioColumns = ["lim_inf", "lim_sup", "cantidad1"];

// Function to handle file selection and read file content
document.getElementById('fileInput').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                fileData = JSON.parse(e.target.result);
                alert("File loaded successfully! Click 'Visualize Tables' to display data.");
            } catch (error) {
                alert("Error parsing JSON file. Please check the file format.");
            }
        };
        reader.readAsText(file);
    }
});

// Function to validate JSON structure
function validateJsonStructure(data) {
    const missingSections = [];

    requiredSections.forEach(sectionInfo => {
        const section = data.find(item => item.tipo === sectionInfo.type);
        
        if (!section) {
            missingSections.push(`Missing section: ${sectionInfo.name}`);
            return;
        }

        // Validate Impuesto table structure
        if (section.impuesto && section.impuesto.length > 0) {
            const impuestoKeys = Object.keys(section.impuesto[0]);
            if (!impuestoColumns.every(col => impuestoKeys.includes(col))) {
                missingSections.push(`Incorrect structure in Impuesto table for ${sectionInfo.name}`);
            }
        } else {
            missingSections.push(`Missing Impuesto table in ${sectionInfo.name}`);
        }

        // Validate Subsidio table structure (except for Anual, which doesn’t have subsidio)
        if (sectionInfo.type !== "anu" && section.subsidio && section.subsidio.length > 0) {
            const subsidioKeys = Object.keys(section.subsidio[0]);
            if (!subsidioColumns.every(col => subsidioKeys.includes(col))) {
                missingSections.push(`Incorrect structure in Subsidio table for ${sectionInfo.name}`);
            }
        } else if (sectionInfo.type !== "anu") {
            missingSections.push(`Missing Subsidio table in ${sectionInfo.name}`);
        }
    });

    return missingSections;
}

// Function to create an HTML table from provided columns and data
function createTable(columns, data) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Create table headers
    columns.forEach(column => {
        const header = document.createElement('th');
        header.textContent = column;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    // Populate rows
    data.forEach(row => {
        const rowElement = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = row[column.toLowerCase()];
            rowElement.appendChild(cell);
        });
        table.appendChild(rowElement);
    });

    return table;
}

// Function to display the tables
function displayTables(data) {
    const container = document.getElementById('table-container');
    container.innerHTML = ''; // Clear previous tables

    // Iterate over each section to generate tables
    data.forEach(section => {
        if (section.impuesto) {
            const impuestoTitle = document.createElement('h2');
            impuestoTitle.textContent = `Impuesto Table - ${section.nombre}`;
            container.appendChild(impuestoTitle);

            const impuestoColumns = ["Límite inferior", "Límite superior", "Cuota Fija", "Porcentaje excedente"];
            const impuestoData = section.impuesto.map(item => ({
                "límite inferior": item.lim_inf,
                "límite superior": item.lim_sup,
                "cuota fija": item.cantidad1,
                "porcentaje excedente": item.cantidad2
            }));
            container.appendChild(createTable(impuestoColumns, impuestoData));
        }

        if (section.subsidio) {
            const subsidioTitle = document.createElement('h2');
            subsidioTitle.textContent = `Subsidio Table - ${section.nombre}`;
            container.appendChild(subsidioTitle);

            const subsidioColumns = ["Para Ingresos Desde", "Para Ingresos Hasta", "Subsidio al empleo"];
            const subsidioData = section.subsidio.map(item => ({
                "para ingresos desde": item.lim_inf,
                "para ingresos hasta": item.lim_sup,
                "subsidio al empleo": item.cantidad1
            }));
            container.appendChild(createTable(subsidioColumns, subsidioData));
        }
    });
}

// Function to visualize data by validating and then displaying tables
function visualizeData() {
    if (fileData) {
        const validationErrors = validateJsonStructure(fileData);
        
        if (validationErrors.length > 0) {
            alert("The JSON file has issues:\n" + validationErrors.join("\n"));
        } else {
            displayTables(fileData);
        }
    } else {
        alert("Please select a valid JSON file first.");
    }
}

// Event listener for the visualize button
document.getElementById('visualizeButton').addEventListener('click', visualizeData);w
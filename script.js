document.addEventListener('DOMContentLoaded', function () {
    fetch('logs.json')
        .then(response => response.json())
        .then(data => {
            // Giả sử logs đã nằm trong data.value
            if (Array.isArray(data.value)) {
                paginatedLogs = data.value;
                renderTable();
                populateFilters();
            } else {
                console.warn('No array found in data. Skipping rendering.');
            }
        })
        .catch(error => {
            console.error('Error loading logs:', error);
        });
});

let currentPage = 1;
const rowsPerPage = 50;
let paginatedLogs = [];
let filteredLogs = [];

function renderTable() {
    const tableContainer = document.getElementById('output');
    tableContainer.innerHTML = '';  // Xóa nội dung cũ

    if ((filteredLogs.length === 0 && paginatedLogs.length === 0) || (filteredLogs.length === 0 && paginatedLogs.length > 0 && currentPage === 1)) {
        tableContainer.innerHTML = '<p>No logs match the selected filters.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('log-table');

    const headers = [
        'User Display Name', 
        'User Principal Name', 
        'App ID', 
        'App Display Name', 
        'Operating System', 
        'Browser', 
        'Compliant', 
        'Managed'
    ];
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const logsToDisplay = filteredLogs.length > 0 ? filteredLogs.slice(start, end) : paginatedLogs.slice(start, end);

    logsToDisplay.forEach(log => {
        const {
            userDisplayName,
            userPrincipalName,
            appId,
            appDisplayName,
            deviceDetail: { operatingSystem, browser, isCompliant, isManaged }
        } = log;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userDisplayName || 'N/A'}</td>
            <td>${userPrincipalName || 'N/A'}</td>
            <td>${appId || 'N/A'}</td>
            <td>${appDisplayName || 'N/A'}</td>
            <td>${operatingSystem || 'N/A'}</td>
            <td>${browser || 'N/A'}</td>
            <td>${isCompliant ? 'Yes' : 'No'}</td>
            <td>${isManaged ? 'Yes' : 'No'}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    createPaginationButtons();
}

function createPaginationButtons() {
    const totalPages = Math.ceil((filteredLogs.length > 0 ? filteredLogs : paginatedLogs).length / rowsPerPage);
    const container = document.getElementById('output');

    const paginationDiv = document.createElement('div');
    paginationDiv.classList.add('pagination');

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        paginationDiv.appendChild(button);
    }
    container.appendChild(paginationDiv);
}

function populateFilters() {
    const filterContainer = document.getElementById('filters');
    filterContainer.innerHTML = `
        <select id="osFilter">
            <option value="">All Operating Systems</option>
            ${[...new Set(paginatedLogs.map(log => log.deviceDetail.operatingSystem))].map(os => `<option value="${os}">${os}</option>`).join('')}
        </select>
        <select id="compliantFilter">
            <option value="">All Compliance</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
        </select>
        <select id="managedFilter">
            <option value="">All Managed</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
        </select>
        <button onclick="applyFilters()">Apply Filters</button>
    `;
}

function applyFilters() {
    const osFilter = document.getElementById('osFilter').value;
    const compliantFilter = document.getElementById('compliantFilter').value;
    const managedFilter = document.getElementById('managedFilter').value;

    filteredLogs = paginatedLogs.filter(log => {
        const { operatingSystem, isCompliant, isManaged } = log.deviceDetail;
        return (!osFilter || operatingSystem === osFilter) &&
               (!compliantFilter || (compliantFilter === 'true' ? isCompliant : !isCompliant)) &&
               (!managedFilter || (managedFilter === 'true' ? isManaged : !isManaged));
    });

    currentPage = 1;
    renderTable();
}

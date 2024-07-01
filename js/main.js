$(document).ready(function() {

    $('.select2').select2();

    $.ajax({
        url: 'data.csv',
        dataType: 'text',
    }).done(function(data) {
        console.log("CSV data loaded: ", data);
        let parsedData = parseCSV(data);
        console.log("Parsed Data: ", parsedData);
        initializeFieldSelect(parsedData);
        initializeDataTable(parsedData);
    });

    $('#add-filter-button').on('click', function() {
        let filterGroupHtml = `
            <div class="filter-group">
                <select class="field-select select2">
                    <option value="" disabled selected>Select Field</option>
                </select>
                <select class="operator-select select2">
                    <option value="greater">Greater than</option>
                    <option value="less">Less than</option>
                </select>
                <input type="number" class="value-input" placeholder="Enter value">
                <button class="remove-filter-button">Remove</button>
            </div>`;
        $('#filter-container').append(filterGroupHtml);
        $('.select2').select2(); // Reinitialize Select2 for new elements
        populateFieldSelect($('.field-select').last());
    });


    $('#filter-container').on('click', '.remove-filter-button', function() {
        $(this).closest('.filter-group').remove();
    });

    $('#apply-filters-button').on('click', function() {
        applyFilters();
    });

    function populateFieldSelect(selectElement) {
        let allowedFields = ['revenue', 'gp', 'fcf', 'capex'];
        allowedFields.forEach(field => {
            $(selectElement).append(new Option(field.toUpperCase(), field));
        });
    }

    function parseCSV(data) {
        let lines = data.split('\n');
        let result = [];
        let headers = lines[0].split(',').map(header => header.trim());

        for (let i = 1; i < lines.length; i++) {
            let currentLine = lines[i].split(',');

            if (currentLine.length !== headers.length) {
                continue;
            }

            let obj = {};
            for (let j = 0; j < headers.length; j++) {
                let value = currentLine[j];
                obj[headers[j]] = isNaN(value) || value.trim() === "" ? value.trim() : parseFloat(value);
            }
            result.push(obj);
        }
        return result;
    }

    function initializeFieldSelect(data) {
        let allowedFields = ['revenue', 'gp', 'fcf', 'capex'];
        allowedFields.forEach(field => {
            $('.field-select').append(new Option(field.toUpperCase(), field));
        });
    }

    function initializeDataTable(data) {
        console.log("Initializing DataTable with data: ", data); 
        let table = $('#data-table').DataTable({
            data: data,
            columns: [
                { data: 'company' },
                { data: 'ticker' },
                { data: 'Sector' },
                { data: 'Industry' },
                { data: 'revenue' },
                { data: 'gp' },
                { data: 'fcf' },
                { data: 'capex' }
            ]
        });

        $('#data-table').data('tableInstance', table);
    }

    function applyFilters() {
        let table = $('#data-table').data('tableInstance');
        let filters = [];

        $('.filter-group').each(function() {
            let field = $(this).find('.field-select').val();
            let operator = $(this).find('.operator-select').val();
            let value = $(this).find('.value-input').val();

            if (field && operator && value) {
                filters.push({ field, operator, value: parseFloat(value) });
            }
        });

        let filteredData = table
            .rows()
            .data()
            .toArray()
            .filter(row => {
                return filters.every(filter => {
                    if (filter.operator === 'greater') {
                        return row[filter.field] > filter.value;
                    } else {
                        return row[filter.field] < filter.value;
                    }
                });
            });

        table.clear();
        table.rows.add(filteredData);
        table.draw();
    }
});

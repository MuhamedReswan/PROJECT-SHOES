

function downloadPdf() {
            window.print();
        }


        function downloadExcel() {
            // Clone the table to avoid modifying the original
            var table = document.getElementById('sales-table').cloneNode(true);
    
            // Remove the image column from the cloned table
            for (var i = 0; i < table.rows.length; i++) {
                table.rows[i].deleteCell(2); // Assuming the image column is the 3rd column (index 2)
            }
    
            // Convert the table to a worksheet
            var worksheet = XLSX.utils.table_to_sheet(table);
    
            // Define the column widths
            var colWidths = [
                { wpx: 70 }, // No
                { wpx: 70 }, // Order ID
                { wpx: 70 }, // Name
                { wpx: 70 }, // Price & Quantity
                { wpx: 70 }, // Total
                { wpx: 70 }, // Date
                { wpx: 70 }, // Payment Method
                { wpx: 70 } // Status
            ];
    
            // Apply the column widths to the worksheet
            worksheet['!cols'] = colWidths;
    
            // Create a new Workbook and append the worksheet
            var workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
    
            // Convert the workbook to a binary string
            var wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    
            // Function to convert a string to an ArrayBuffer
            function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
    
            // Create a Blob from the binary string
            var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    
            // Create a link element
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
    
            // Generate the file name
            var siteName = "MyWebsite"; // Replace with your site name
            var date = new Date();
            var timestamp = date.getFullYear() +
                            ('0' + (date.getMonth() + 1)).slice(-2) +
                            ('0' + date.getDate()).slice(-2) + '_' +
                            ('0' + date.getHours()).slice(-2) +
                            ('0' + date.getMinutes()).slice(-2) +
                            ('0' + date.getSeconds()).slice(-2);
            var fileName = siteName + '_' + timestamp + '.xlsx';
    
            // Set the file name for the download
            link.download = fileName;
    
            // Append the link to the document body and trigger the click event
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }


        let orderStatusFilter = document.getElementById('orderStatusFilter');

        orderStatusFilter.addEventListener('change',(event)=>{
            let date = event.target.value;
            window.location.href=`/admin/sales-report?date=${date}`
        })

// // const { json } = require("express");


// ==========================================================

// Wrap everything in an IIFE to avoid global scope pollution
(function ($) {
    "use strict";
    
    let chart1, chart2; // Declare chart variables in a wider scope

    // Function to initialize or update the first chart (myChart)
    function initializeOrUpdateChart1(days, dayRevenue, dayUser) {

        console.log("days, dayRevenue, dayUser",days,
             dayRevenue, 
             dayUser)//-------------------------

        let ctx = document.getElementById('myChart').getContext('2d');
        
        // If chart already exists, destroy it
        if (chart1) {
            chart1.destroy();
        }

        // Create new chart
        chart1 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'User',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    data: dayUser
                },
                {
                    label: 'Revenue per day',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    data: dayRevenue
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }

    // Function to initialize or update the second chart (myChart2)
    function initializeOrUpdateChart2(labels, amount, count, monthlyUsers) {
        let ctx = document.getElementById("myChart2").getContext('2d');
        
        // If chart already exists, destroy it
        if (chart2) {
            chart2.destroy();
        }

        // Create new chart
        chart2 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Sales",
                        backgroundColor: "#5897fb",
                        barThickness: 10,
                        data: amount
                    }, 
                    {
                        label: "Product Count",
                        backgroundColor: "#7bcf86",
                        barThickness: 10,
                        data: count
                    },
                    {
                        label: "Users",
                        backgroundColor: "#ff9076",
                        barThickness: 10,
                        data: monthlyUsers
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Function to fetch new data and update charts
    function updateChartsWithNewData(monthYear) {
        console.log("updateChartsWithNewData ",monthYear)//-----------------
        $.ajax({
            url: '/admin/dashboard/filter-chart',  // Adjust this URL as needed
            method: 'POST',
            data: { monthYear: monthYear },
            success: function(response) {
                if (response.filter) {
console.log("response.filter from custon js",response)//---------------------
console.log("response.days custon js",response.daysArr)//---------------------
console.log("response.dayRevenuefrom custon js",response.revenuePerDay)//---------------------

                    initializeOrUpdateChart1(response.daysArr, response.revenuePerDay, response.usersPerDay);
                    // initializeOrUpdateChart2(response.labels, response.amount, response.count, response.monthlyUsers);
                }
            },
            error: function(error) {
                console.error('Error fetching new data:', error);
            }
        });
    }


function orderedProductsStatus(data){
    const ctx = document.getElementById('orderStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pending', 'Return Requested', 'Returned', 'Placed', 'Cancelled', 'Delivered'],
            datasets: [{
                // data: [30, 15, 10, 25, 5, 15], // Example data, replace with actual values
                data: data, // Example data, replace with actual values
                backgroundColor: [
                    'rgba(255, 206, 86, 0.8)',  // yellow
                    'rgba(75, 192, 192, 0.8)',  // green
                    'rgba(153, 102, 255, 0.8)', // purple
                    'rgba(255, 159, 64, 0.8)',  // orange
                    'rgba(255, 99, 132, 0.8)',  // red
                    'rgba(54, 162, 235, 0.8)'   // blue
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        // options: {
        //     responsive: true,
        //     plugins: {
        //         legend: {
        //             position: 'top',
        //         },
        //         title: {
        //             display: true,
        //             text: 'Ordered  Product Status '
        //         }
        //     }
        // }
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                // title: {
                //     display: true,
                //     text: 'Ordered Product Status'
                // }
            }
        }
    });
}



    // Initial chart setup
    $(document).ready(function() {
        let dayRevenueChart = document.getElementById('myChart');
        let days = JSON.parse(dayRevenueChart.getAttribute('data-days'));
        let dayRevenue = JSON.parse(dayRevenueChart.getAttribute('data-dayRevenue'));
        let dayUser = JSON.parse(dayRevenueChart.getAttribute('data-dayUser'));

        initializeOrUpdateChart1(days, dayRevenue, dayUser);

        let updatedMonthlyDetails = document.getElementById('myChart2');
        let monthlyData = JSON.parse(updatedMonthlyDetails.getAttribute('data-monthlyDetails'));
        let monthlyUsers = JSON.parse(updatedMonthlyDetails.getAttribute('data-monthlyUsers'));

        let amount = monthlyData.map(obj => obj.total);
        let count = monthlyData.map(obj => obj.count);
        let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        initializeOrUpdateChart2(labels, amount, count, monthlyUsers);

        let orderPirChart = document.getElementById('orderStatusChart')
        let orderdata = JSON.parse(orderPirChart.getAttribute('data-products-status'))
        console.log("orderdata",orderdata)//----------------

 orderedProductsStatus(orderdata)

        

        // Set up event listener for month change
        $('input[type="month"]').on('change', function() {
            updateChartsWithNewData(this.value);
        });
    });

    // Make updateChartsWithNewData available globally
    window.updateChartsWithNewData = updateChartsWithNewData;

})(jQuery);






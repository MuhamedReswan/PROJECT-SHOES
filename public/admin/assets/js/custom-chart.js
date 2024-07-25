// const { json } = require("express");

(function ($) {
    "use strict";
     
    let ctx = document.getElementById('myChart').getContext('2d');
    let updatedMonthlyDetails = document.getElementById('myChart2');
    let monthlyData = JSON.parse(updatedMonthlyDetails.getAttribute('data-monthlyDetails'));
    let monthlyUsers = JSON.parse(updatedMonthlyDetails.getAttribute('data-monthlyUsers'));
    // let updatedMonthlyDetails = document.getElementById('myChart').getAttribute('data-monthlyDetails');
    // let monthlyData= JSON.parse(updatedMonthlyDetails);

let amount=[];
let count=[];


for (let obj of monthlyData){
amount.push(obj.total)
count.push(obj.count)
}



let dayRevenueChart = document.getElementById('myChart');
let days=JSON.parse(dayRevenueChart.getAttribute('data-days'));
let dayRevenue=dayRevenueChart.getAttribute('data-dayRevenue');
let dayuser=dayRevenueChart.getAttribute('data-dayUser');

console.log("days",days)//-------------------------
console.log("dayRevenue",dayRevenue)//-------------------------
console.log("dayuser",dayuser)//-------------------------


    /*Sale statistics Chart*/
    if ($('#myChart').length) {
   




        console.log("chart from monthlyUsers",monthlyUsers)//------------------------------
        console.log("chart from Amount",amount)//------------------------------
        console.log("chart from count",count)//------------------------------
        console.log("chart from",updatedMonthlyDetails)//------------------------------
        console.log("chart from pARSER",monthlyData)//------------------------------
        let chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',
            
            // The data for our dataset
            data: {
                // labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: days,
                datasets: [{
                        label: 'User',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: dayuser
                    },
                    {
                        label: 'Revenue per day',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(4, 209, 130, 0.2)',
                        borderColor: 'rgba(84, 160, 220)',
                        data:dayRevenue
                    },
                    // {
                    //     label: 'Users',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    //     borderColor: 'rgb(380, 200, 230)',
                    //     data: monthlyUsers
                    // }

                ]
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
    } //End if

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        let ctx = document.getElementById("myChart2");
        let myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            // labels: ["900", "1200", "1400", "1600"],
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: "Sales",
                    backgroundColor: "#5897fb",
                    barThickness:5,
                    data: amount
                }, 
                {
                    label: "Amount",
                    backgroundColor: "#7bcf86",
                    barThickness:5,
                    data: count
                },
                {
                    label: "Users",
                    backgroundColor: "#ff9076",
                    barThickness:5,
                    data: monthlyUsers
                },
                // {
                //     label: "Africa",
                //     backgroundColor: "#d595e5",
                //     barThickness:10,
                //     data: [123,345,122,302]
                // },
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
        }
        // let myChart = new Chart(ctx, {
        //     type: 'bar',
        //     data: {
        //     labels: ["900", "1200", "1400", "1600"],
        //     datasets: [
        //         {
        //             label: "US",
        //             backgroundColor: "#5897fb",
        //             barThickness:10,
        //             data: [233,321,783,900]
        //         }, 
        //         {
        //             label: "Europe",
        //             backgroundColor: "#7bcf86",
        //             barThickness:10,
        //             data: [408,547,675,734]
        //         },
        //         {
        //             label: "Asian",
        //             backgroundColor: "#ff9076",
        //             barThickness:10,
        //             data: [208,447,575,634]
        //         },
        //         {
        //             label: "Africa",
        //             backgroundColor: "#d595e5",
        //             barThickness:10,
        //             data: [123,345,122,302]
        //         },
        //     ]
        //     },
        //     options: {
        //         plugins: {
        //             legend: {
        //                 labels: {
        //                 usePointStyle: true,
        //                 },
        //             }
        //         },
        //         scales: {
        //             y: {
        //                 beginAtZero: true
        //             }
        //         }
        //     }
        // }
    );
    } //end if
    
})(jQuery);
async function updateTotalOrder(){
    const totalOrderFromDate = document.getElementById('totalOrderFromDate').value
    const totalOrderToDate = document.getElementById('totalOrderToDate').value
    console.log(totalOrderFromDate,totalOrderToDate);

    if(totalOrderFromDate !== '' && totalOrderToDate !== ''){
        fetch( `/admin/dash-totalOrders?totalOrderFromDate=${totalOrderFromDate}&totalOrderToDate=${totalOrderToDate}`)
        .then(response => response.json())
        .then(data => {
            const totalOrders = data.totalOrders;
            document.getElementById("totalOrders").textContent = `${totalOrders}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


async function updateTotalRevenue(){
    const totalRevenueFromDate = document.getElementById('totalRevenueFromDate').value
    const totalRevenueToDate = document.getElementById('totalRevenueToDate').value
    console.log(totalRevenueFromDate,totalRevenueToDate);

    if(totalRevenueFromDate !== '' && totalRevenueToDate !== ''){
        fetch( `/admin/dash-totalRevenue?totalRevenueFromDate=${totalRevenueFromDate}&totalRevenueToDate=${totalRevenueToDate}`)
        .then(response => response.json())
        .then(data => {
            const totalRevenue = data.totalRevenue;
            document.getElementById("totalRevenue").textContent = `₹${totalRevenue}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


async function updateProfit(){
    const profitFromDate = document.getElementById('profitFromDate').value
    const profitToDate = document.getElementById('profitToDate').value
    console.log(profitFromDate,profitToDate);

    if(profitFromDate !== '' && profitToDate !== ''){
        fetch( `/admin/dash-profit?profitFromDate=${profitFromDate}&profitToDate=${profitToDate}`)
        .then(response => response.json())
        .then(data => {
            const profit = data.profit;
            document.getElementById("profit").textContent = `₹${profit}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}
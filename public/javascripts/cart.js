const subTotalField = document.getElementById('subTotal')
const discountField = document.getElementById('discount')
const delivaryChargeField = document.getElementById('delivaryCharge')
const totalField = document.getElementById('total')

function plusupdateTotal(th,inputId, pricePerItem, productId, userId, index) {
    th.parentNode.querySelector('input[type=number]').stepUp()
    updateCartPrices(th,inputId, pricePerItem, productId);
    const input = document.getElementById(inputId).value;
    const quantity = parseInt(input);
    // console.log(userId,index);
    updateCartQuantity(userId,index,quantity);
}

function minusupdateTotal(th,inputId, pricePerItem, productId, userId, index) {
    th.parentNode.querySelector('input[type=number]').stepDown()
    updateCartPrices(th,inputId, pricePerItem, productId);
    const input = document.getElementById(inputId).value;
    const quantity = parseInt(input);
    updateCartQuantity(userId,index,quantity);
}

function updateCartPrices(th,inputId, pricePerItem, productId){
    let subTotalText = subTotalField.textContent;
    let subTotal = parseFloat(subTotalText.replace('₹', ''));
    console.log(subTotal);

    let discountText = discountField.textContent;
    console.log(discountText);
    const discount = parseFloat(discountText.replace('-₹', ''));
    console.log(discount);

    let totalText = totalField.textContent;
    let grandTotal = parseFloat(totalText.replace('₹', ''))

    const procutPriceText = document.getElementById(`totalprice_${productId}`).textContent
    const procutPrice = parseFloat(procutPriceText.replace('₹', ''));
    console.log(procutPrice);

    subTotal = subTotal - procutPrice;
    console.log(subTotal);

    
    const input = document.getElementById(inputId).value;
    // console.log(input,pricePerItem);
    const quantity = parseInt(input);

    const total = (quantity * pricePerItem).toFixed(2);
    document.getElementById(`totalprice_${productId}`).textContent = `₹${total}`;

    let totalNum = parseFloat(total)
    console.log(typeof(subTotal),typeof(totalNum));

    subTotal = subTotal + totalNum;
    console.log(subTotal);
    subTotalField.textContent = `₹${subTotal}.00`;



    grandTotal = (subTotal + 40 - discount).toFixed(2);
    totalField.textContent = `₹${grandTotal}`
}

async function updateCart(userId,index){
    try {
        const response = await fetch(`/cart-remove-product?userId=${userId}&index=${index}`);
    } catch (error) {
        console.log(error);
    }
  }

async function updateCartQuantity(userId,index,quantity){
    try {
        const response = await fetch(`/cart-update-product-quantity?userId=${userId}&index=${index}&quantity=${quantity}`);
    } catch (error) {
        console.log(error);
    }
}


function copy(couponCode) {
    navigator.clipboard.writeText(couponCode);

    const copyButton = document.getElementById("copyButton"+couponCode);
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 5000);

}


async function couponApply(){
    const couponCode = document.getElementById('couponInput').value
    const subTotal = document.getElementById('subTotal').innerText
    const couponError = document.getElementById('couponError');
    const discount = document.getElementById('discount')
    const total = document.getElementById('total')

    console.log(couponCode,subTotal);
    const response = await fetch(`/check-coupoon?couponCode=${couponCode}&subTotal=${subTotal}`);
    const data = await response.json();

    console.log(data.amount)

    if(!data.exists){
        if(data.error){
            couponError.textContent = data.error;
        } else {
            couponError.textContent = 'Invalid coupon code'
        }
    } else {
        couponError.textContent = ''
        const subTotalWithoutSymbol = subTotal.replace("₹", "");
        const subTotalNum = parseFloat(subTotalWithoutSymbol);
        const totalAmount = subTotalNum+40-data.amount
        discount.textContent = '-₹'+data.amount+'.00'

        total.textContent = '₹'+totalAmount+'.00'
    }


}

function checkout(){

    fetch(`/checkout?co=${couponCode}&subTotal=${subTotal}`)
}
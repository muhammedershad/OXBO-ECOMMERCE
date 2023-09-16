function update(couponId){
    // console.log('clicked');
    fetch(`/admin/coupon/${couponId}`,{
        method:"PATCH",
    }).then(()=>{
        window.location.reload()
    })
} 
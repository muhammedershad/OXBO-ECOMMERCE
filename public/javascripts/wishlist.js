async function removeFromCart(productId, index){
    console.log('hiii');
    console.log(productId);
    const response = await fetch(`/removeFromWishlist/${productId}/${index}`,{
        method : 'DELETE',
    })
    if(response.ok){
        Swal.fire({
            text: 'Product removed from the wishlist',
            target: '#custom-target',
            customClass: {
                container: 'position-absolute'
            },
            toast: true,
            position: 'bottom-right',
            timer: 2000, 
            showConfirmButton: false 
        });
    }
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}
async function addToWishlist(productId) {
    try {
      const response = await fetch(`/addToWishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify({ productId: productId }), // Convert the data to JSON format
      });
  
      if (response.ok) {
        Swal.fire({
          text: 'Product added to the wishlist',
          target: '#custom-target',
          customClass: {
            container: 'position-absolute'
          },
          toast: true,
          position: 'top-right',
          timer: 2000, // Close the toast after 2 seconds
          showConfirmButton: false // Hide the "OK" button
        });
        const data = await response.json();
        const productToast = document.getElementById('product-toast');
        const bootstrapToast = new bootstrap.Toast(productToast);
        bootstrapToast.show();
        console.log(data.message); // Display the response message
        console.log('Product added to wishlist successfully.');
      } else {
        console.error('Failed to add product to wishlist.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
    console.log('hii');
}



async function addToCart(productId){
    console.log('hiii');
    const sizeRadios = document.querySelectorAll('.size-radio');
    const sizeError = document.getElementById('sizeError');
  
    event.preventDefault(); // Prevent the default form submission
        let sizeSelected = false;
        let size = ''
        sizeRadios.forEach(radio => {
            if (radio.checked) {
                sizeSelected = true;
                size = radio.value
            }
        });

        if (!sizeSelected) {
            sizeError.textContent = 'Please select a size';
        } else {
            // If size is selected, submit the form
            // document.getElementById('product-form').submit();
            const response = await fetch(`/addToCart?productId=${productId}&size=${size}`, {
            method: 'POST',
            body: JSON.stringify({ size })
            });

            if (response.ok) {
            const responseData = await response.json();

            if (responseData.success) {
                Swal.fire({
                text: 'Product added to the cart',
                target: '#custom-target',
                customClass: {
                    container: 'position-absolute'
                },
                toast: true,
                position: 'top-right',
                timer: 2000, // Close the toast after 2 seconds
                showConfirmButton: false // Hide the "OK" button
                });
            } else {
                // Handle the case where success is not true in the response, if needed.
                console.log('Product not added to the cart');
            }
            } else {
            // Handle the case where the fetch request itself was not successful, if needed.
            console.error('Failed to add product to the cart');
            }
        }
}

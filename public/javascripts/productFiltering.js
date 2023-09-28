// Category items
// const categoryItems = document.querySelectorAll('.list-group-item');
// categoryItems.forEach(item => {
//     item.addEventListener('click', () => {
//         const selectedCategory = item.innerText;
//         filterProductsByCategory(selectedCategory);
//     });
// });

// // Size checkboxes
// const sizeCheckboxes = document.querySelectorAll('.form-check-input');
// sizeCheckboxes.forEach(checkbox => {
//     checkbox.addEventListener('change', () => {
//         filterProductsBySize();
//     });
// });


// function filterProductsByCategory(selectedCategory) {
//     const products = document.querySelectorAll('.card');

//     products.forEach(product => {
//         const productCategory = product.getAttribute('data-category');

//         if (selectedCategory === 'All' || productCategory === selectedCategory) {
//             product.style.display = 'block';
//         } else {
//             product.style.display = 'none';
//         }
//     });
// }

// function filterProductsBySize() {
//     const products = document.querySelectorAll('.card');

//     products.forEach(product => {
//         const productSizes = product.getAttribute('data-sizes').split(',');
//         console.log(productSizes);
//         const selectedSizes = Array.from(sizeCheckboxes)
//             .filter(checkbox => checkbox.checked)
//             .map(checkbox => checkbox.getAttribute('id'));

//         if (selectedSizes.length === 0 || selectedSizes.some(size => productSizes.includes(size))) {
//             product.style.display = 'block';
//         } else {
//             product.style.display = 'none';
//         }
//     });
// }



// const sortSelect = document.querySelector('.form-select');
// sortSelect.addEventListener('change', () => {
//     const sortBy = sortSelect.value;
//     sortProducts(sortBy);
// });

// function sortProducts(sortBy) {
//     const productContainer = document.querySelector('.products');
//     const products = Array.from(productContainer.querySelectorAll('.card'));

//     products.sort((a, b) => {
//         const aValue = a.querySelector('h6').innerText;
//         const bValue = b.querySelector('h6').innerText;
        
//         if (sortBy === 'price') {
//             return parseFloat(aValue.slice(4)) - parseFloat(bValue.slice(4));
//         } else if (sortBy === 'name') {
//             return aValue.localeCompare(bValue);
//         }
//     });

//     products.forEach(product => productContainer.appendChild(product));
// }

function filterByCategory(category){
    console.log(category);
    const gender = document.getElementById('genderInput').value
    const encodedSearch = document.getElementById('encodedSearchInput').value
    const min = document.getElementById('minInput').value
    const max = document.getElementById('maxInput').value
    console.log(min,max);
    const encodedCategory = encodeURIComponent(category);
    
    window.location.href = `/products?encodedCategory=${encodedCategory}&gender=${gender}&min=${min}&max=${max}&encodedSearch=${encodedSearch}`
}


function filterByPrice(min,max){
    console.log(typeof(min),typeof(max));

    const category = document.getElementById('categoryInput').value
    const gender = document.getElementById('genderInput').value
    const encodedSearch = document.getElementById('encodedSearchInput').value
    const encodedCategory = encodeURIComponent(category);

    window.location.href = `/products?encodedCategory=${encodedCategory}&gender=${gender}&encodedSearch=${encodedSearch}&min=${min}&max=${max}`
}



// function sortByPrice(number,category){
//     console.log(category);
//     console.log(number);
//     window.location.href = `/products?category=${category}&number=${number}`
// }


document.getElementById('sortSelect').addEventListener('change', function () {
    console.log('hiii');
    const category = document.getElementById('categoryInput').value
    const gender = document.getElementById('genderInput').value
    const encodedSearch = document.getElementById('encodedSearchInput').value
    const encodedCategory = encodeURIComponent(category);
    const min = document.getElementById('minInput').value
    const max = document.getElementById('maxInput').value
    console.log(category);
    const selectedValue = this.value;
    let number = 1; // Default value for ascending order
    if (selectedValue === 'name') {
        number = -1; // Change to -1 for descending order
    }
    // Assuming you have the 'category' variable defined elsewhere
    window.location.href = `/products?encodedCategory=${encodedCategory}&number=${number}&gender=${gender}&encodedSearch=${encodedSearch}&min=${min}&max=${max}`;
});
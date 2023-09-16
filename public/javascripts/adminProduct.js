
document.addEventListener('DOMContentLoaded', function () {
    const maleRadio = document.getElementById('maleRadio');
    const femaleRadio = document.getElementById('femaleRadio');
    const categorySelect = document.getElementById('categorySelect');
    const subcategorySelect = document.getElementById('subcategorySelect');

    // Event listener for gender radio buttons
    maleRadio.addEventListener('change', fetchCategories);
    femaleRadio.addEventListener('change', fetchCategories);

    // Event listener for category select
    categorySelect.addEventListener('change', fetchSubcategories);

    // Function to fetch categories based on gender
    // Function to fetch categories based on gender
    function fetchCategories() {
        const gender = document.querySelector('input[name="gender"]:checked').value;
    
        fetch(`/admin/productCategories?gender=${gender}`)
            .then(response => response.json())
            .then(data => {
                const categorySelect = document.getElementById('categorySelect');
                categorySelect.innerHTML = ''; // Clear existing options
    
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    // option.value = category._id; // Assuming each category has an _id field
                    // option.data = category._id;
                    option.value = category._id; // Assuming each category has an _id field
                    option.textContent = category.category; // Adjust property name based on your schema
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }


    // Function to fetch subcategories based on selected category
    function fetchSubcategories() {
        const categoryId = document.getElementById('categorySelect').value;
    
        fetch(`/admin/productSubcategories?categoryId=${categoryId}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                const subcategorySelect = document.getElementById('subcategorySelect');
                subcategorySelect.innerHTML = ''; // Clear existing checkboxes
    
                data.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    
                    // option.value = subcategory._id; // Assuming each category has an _id field
                    option.value = subcategory.subcategory; // Assuming each category has an _id field
                    option.textContent = subcategory.subcategory; // Adjust property name based on your schema
                    subcategorySelect.appendChild(option);
                });

            })
            .catch(error => {
                console.error('Error fetching subcategories:', error);
            });
    }

    // Initialize category dropdown when the page loads
    fetchCategories();
});


function forCategory(gender,productId){
    fetch(`/admin/productCategories?gender=${gender}`)
            .then(response => response.json())
            .then(data => {
                const categorySelect = document.getElementById('categorySelect'+productId);
                categorySelect.innerHTML = ''; // Clear existing options
    
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    // option.value = category._id; // Assuming each category has an _id field
                    // option.data = category._id;
                    option.value = category._id; // Assuming each category has an _id field
                    option.textContent = category.category; // Adjust property name based on your schema
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });

}


function forSubCategory(categoryId,productId){
    const categoryId = document.getElementById('categorySelect'+productId).value;
    
        fetch(`/admin/productSubcategories?categoryId=${categoryId}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                const subcategorySelect = document.getElementById('subcategorySelect'+productId);
                subcategorySelect.innerHTML = ''; // Clear existing checkboxes
    
                data.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    
                    // option.value = subcategory._id; // Assuming each category has an _id field
                    option.value = subcategory.subcategory; // Assuming each category has an _id field
                    option.textContent = subcategory.subcategory; // Adjust property name based on your schema
                    subcategorySelect.appendChild(option);
                });

            })
            .catch(error => {
                console.error('Error fetching subcategories:', error);
            });
}


function update(productId){
    console.log('clicked');
    fetch(`/admin/listproduct/${productId}`,{
        method:"PATCH",
    }).then(()=>{
        window.location.reload()
    })
}
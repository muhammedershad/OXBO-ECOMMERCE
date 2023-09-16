function update(categoryId){
    console.log('clicked');
    fetch(`/admin/list/${categoryId}`,{
        method:"PATCH",
    }).then(()=>{
        window.location.reload()
    })
} 


function updateSubcategory(categoryId,subcategory){
    console.log('clicked');
    fetch(`/admin/listsubcategory/${categoryId}/${subcategory}`,{
        method:"PATCH",
    }).then(()=>{
        window.location.reload()
    })
} 


const categoryField = document.getElementById('category');
const categoryError = document.getElementById('categoryError');

categoryField.addEventListener('blur',async () => {
    const category = categoryField.value.trim();
    console.log(category);

    if(category === ''){
        return
    }

    try {
        const response = await fetch(`/admin/check-category?oneCategory=${category}`);
        const data = await response.json();
        console.log(data);

        if (data.exists) {
            categoryError.textContent = 'Category already exists';
            categoryField.classList.add('is-invalid');
        } else {
            categoryError.textContent = '';
            categoryField.classList.remove('is-invalid');
        }
    } catch (error) {
        console.error('Error checking category:', error);
    }
})
function update(elementId){
    fetch(`/admin/block/${elementId}`,{
        method:"PATCH",
    }).then(()=>{
        window.location.reload()
    })
} 
async function deleteBanner(bannerId) {
    console.log(bannerId);
    try {
        await fetch(`/admin/banner/${bannerId}`, {
            method: "DELETE",
        });
        window.location.reload();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function listBanner(bannerId) {
    console.log(bannerId);
    try {

        fetch(`/admin/banner/${bannerId}`,{
            method:"PATCH",
        })
        window.location.reload();

    } catch (error) {
        console.error('An error occurred:', error);
    }
}
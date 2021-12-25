const setAlert: (msg: string) => void = (msg) => {
    const alertBox = document.getElementById('alertBox')
    alertBox!.style.display = 'block'
    alertBox!.innerText = msg

    new Promise(resolve => setTimeout(resolve, 1500))
        .then(() => {
            alertBox!.style.display = 'none'
        })

}

export { setAlert }
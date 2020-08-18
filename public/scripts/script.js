let box1 = document.getElementById('logInForm'), box2 = document.getElementById('signUpForm'),
        box3 = document.getElementById('postCreation'),
        box4 = document.getElementById('postChange');
    window.onclick = function (event) {
        if (event.target === box1) {
            box1.style.display = 'none';
        } else if (event.target === box2) {
            box2.style.display = 'none';
        } else if (event.target === box3) {
            box3.style.display = 'none';
        } else if (event.target === box4) {
            box4.style.display = 'none';
        }
    }

    
    const dropdownAreas = document.querySelectorAll('.dropdownArea')

    dropdownAreas.forEach(a => {
        a.onmouseleave = () => {
            a.classList.toggle('hidden')
            document.getElementById(a.id.replace('dropdownArea', '')).classList.toggle('hidden')
            document.getElementById(a.id.replace('dropdownArea', '') + 'Btn').blur()
        }
    })
    const showDropdown = id => {
        document.getElementById(id).classList.toggle('hidden')
        document.getElementById('dropdownArea' + id).classList.toggle('hidden')
    }

    const popUpContainer = document.getElementById('popUpContainer');
    const popups = document.querySelectorAll('.popup')
    popups.forEach(p => p.onclick = event => event.stopPropagation())

    const showPopup = (id) => {
        document.getElementById(id).classList.remove('hidden');
        popUpContainer.classList.remove('hidden');
    }
    const hidePopups = () => {
        popups.forEach(p => p.classList.add('hidden'))
        popUpContainer.classList.add('hidden');
    }
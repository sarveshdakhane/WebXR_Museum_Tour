    
        // Toggle side menu open/close
        document.getElementById('menuIcon').addEventListener('click', function() {
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu.style.left === '0px') {
                sideMenu.style.left = '-250px';
            } else {
                sideMenu.style.left = '0px';
            }
        });



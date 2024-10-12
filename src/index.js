    
        // Toggle side menu open/close
        document.getElementById('menuIcon').addEventListener('click', function() {
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu.style.left === '0px') {
                sideMenu.style.left = '-250px';
            } else {
                sideMenu.style.left = '0px';
            }
        });

        document.addEventListener('touchmove', function(event) {
            if (event.scale !== undefined && event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
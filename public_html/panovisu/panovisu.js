/**
 * @name panoVisu
 * 
 * @version 1.0
 * @author LANG Laurent
 */


/**
 * teste si appareil tactile
 * 
 * @returns {window|String}
 */
function estTactile() {
    return !!('ontouchstart' in window);
}


function panovisu(num_pano) {
    var camera, scene, renderer;
    
    function spot() {
        this.id = 0;
        this.image = "";
        this.texte = "";
    }

    var timer,
            numHotspot = 0,
            mouseMove,
            isReloaded = false,
            hotSpot = new Array(),
            mode = 1,
            longitude = 0,
            latitude = 0,
            fenPanoramique,
            version = "0.15",
            texture_placeholder,
            isUserInteracting = false,
            onPointerDownPointerX = 0,
            onPointerDownPointerY = 0,
            onPointerDownLon = 0,
            onPointerDownLat = 0,
            phi = 0,
            theta = 0,
            fov = 75,
            dx = 0,
            dy = 0,
            deltaX = 0,
            deltaY = 0,
            $_GET = [],
            target = new THREE.Vector3(),
            bPleinEcran = false,
            largeur,
            hauteur,
            xmlFile,
            fenetreX,
            fenetreY,
            panovisu,
            fenetreUniteX,
            fenetreUniteY,
            marginPanoLeft,
            nbPanoCharges = 0;
    /**
     * Variables par défaut pour l'affichage du panoramique
     * 
     * @type String|@exp;_L1@pro;panoImage|@exp;XMLPano@call;attr
     */
    var panoImage = "faces",
            panoTitre = "",
            panoType = "cube",
            affInfo = "oui",
            bAfficheInfo = true,
            bAfficheAide = false,
            afficheTitre = "oui",
            zooms = "oui",
            outils = "oui",
            deplacements = "oui",
            fs = "oui",
            autoR = "oui",
            souris = "oui",
            boutons = "oui",
            autoRotation = "non",
            positionX = "center",
            positionY = "bottom",
            dX = "0",
            dY = "10",
            mesh,
            container,
            pano,
            pano1;

    /**
     * Evènements souris / Touche sur écran
     * 
     */


    $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", function() {
        bPleinEcran = !bPleinEcran;
    });

    $(document).on("click", "#container-" + num_pano, function(evenement) {
        if (mouseMove === false) {
            var mouse = new THREE.Vector2();
            var projector = new THREE.Projector();
            var raycaster = new THREE.Raycaster();
            var position = $(this).offset();
            var X = evenement.pageX - parseInt(position.left);
            var Y = evenement.pageY - parseInt(position.top);
            mouse.x = (X / $(this).width()) * 2 - 1;
            mouse.y = -(Y / $(this).height()) * 2 + 1;
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);
            //alert(projector.x + "," + projector.y + "," + projector.z);
            raycaster.set(camera.position, vector.sub(camera.position).normalize());

            var intersects = raycaster.intersectObjects(scene.children);
            //alert(intersects.length);
            if (intersects.length > 0) {
                var intersect = intersects[ 0 ];
                var object = intersect.object;
                var positions = object.geometry.attributes.position.array;
                for (var i = 0; i < hotSpot.length; i++)
                {
                    //alert(object.id + "=>" + hotSpot[i]);
                    if (object.id === hotSpot[i].id) {
                        panoImage = hotSpot[i].image;
                        pano1.fadeOut(1000, function() {
                            isReloaded = true;
                            initPanoCube();
                            //alert("Vous venez de cliquer sur le hotspot qui a l'id n°" + object.id);
                        });
                    }
                }

            }
        }
        else {
            mouseMove = false;
        }
    });

    $(document).on("mousedown", "#container-" + num_pano, function(evenement) {

        evenement.preventDefault();
        if (bAfficheInfo)
        {
            $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                $(this).css({display: "none"});
                bAfficheInfo = false;
            });

        }
        onPointerDownPointerX = evenement.clientX;
        onPointerDownPointerY = evenement.clientY;
        isUserInteracting = true;        
        if (mode === 1) {
            deltaX = 0;
            deltaY = 0;
            clearInterval(timer);
            timer = setInterval(function() {
                deplaceMode2();
            }, 10);
        }
        else
        {
            onPointerDownLon = longitude;
            onPointerDownLat = latitude;
            pano.addClass('curseurCroix');
        }



    });
    $(document).on("mousemove", "#container-" + num_pano, function(evenement) {

        if (isUserInteracting === true) {
            mouseMove = true;
            if (mode === 1) {
                deltaX = -(onPointerDownPointerX - evenement.clientX) * 0.01;
                deltaY = (onPointerDownPointerY - evenement.clientY) * 0.01;
            }
            else {
                longitude = (onPointerDownPointerX - evenement.clientX) * 0.1 + onPointerDownLon;
                latitude = (evenement.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
                affiche();
            }
        }
        else {
            var mouse = new THREE.Vector2();
            var projector = new THREE.Projector();
            var raycaster = new THREE.Raycaster();
            var position = $(this).offset();
            var X = evenement.pageX - parseInt(position.left);
            var Y = evenement.pageY - parseInt(position.top);
            mouse.x = (X / $(this).width()) * 2 - 1;
            mouse.y = -(Y / $(this).height()) * 2 + 1;
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);
            //alert(projector.x + "," + projector.y + "," + projector.z);

            raycaster.set(camera.position, vector.sub(camera.position).normalize());

            var intersects = raycaster.intersectObjects(scene.children);
            //alert(intersects.length);
            if (intersects.length > 0) {
                pano.css({cursor: "pointer"});
            }
            else {
                pano.css({cursor: "auto"});
            }

        }

    });
    $(document).on("mouseup mouseleave", "#container-" + num_pano, function(evenement) {
        clearInterval(timer);
        pano.removeClass('curseurCroix');
        isUserInteracting = false;
    });
    /**
     * Gestion de la molette de la souris
     * 
     */
    $(document).on("mousewheel", "#container-" + num_pano,
            function(evenement, delta) {
                if (bAfficheInfo)
                {
                    $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                        $(this).css({display: "none"});
                        bAfficheInfo = false;
                    });

                }
                evenement.preventDefault();
                fov -= delta;
                zoom();
            });
    /**
     * Changement de la taille de l'écran
     * 
     */
    $(window).resize(function() {
        changeTaille();
    });
    /**
     * Gestion du clavier
     */
    $(document).keydown(
            function(evenement) {
                if (bPleinEcran) {
                    if (bAfficheInfo)
                    {
                        $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                            $(this).css({display: "none"});
                            bAfficheInfo = false;
                        });

                    }
                    evenement.preventDefault();
                    var touche = evenement.which;
                    switch (touche)
                    {
                        case 37:
                            longitude -= 0.5;
                            break;
                        case 38:
                            latitude += 0.5;
                            break;
                        case 39:
                            longitude += 0.5;
                            break;
                        case 40:
                            latitude -= 0.5;
                            break;
                        case 16:
                            fov += 1;
                            break;
                        case 17:
                            fov -= 1;
                            break;
                    }
                    zoom();
                }
            });
    /**
     * 
     * @param {type} id
     * @returns {undefined}
     */
    function dXdY(id) {
        dx = 0;
        dy = 0;
        id1 = id.split("-");
        id = id1[0];
        switch (id)
        {
            case "xmoins" :
                dx -= 1;
                break;
            case "xplus" :
                dx += 1;
                break;
            case "ymoins" :
                dy -= 1;
                break;
            case "yplus" :
                dy += 1;
                break;
        }

    }
    /**
     * Gestion du click prolongé
     * 
     */
    $(document).on("mousedown", "#xmoins-" + num_pano + ",#xplus-" + num_pano + ",#ymoins-" + num_pano + ",#yplus-" + num_pano,
            function(evenement) {
                if (bAfficheInfo)
                {
                    $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                        $(this).css({display: "none"});
                        bAfficheInfo = false;
                    });

                }
                dXdY($(this).attr('id'));
                clearInterval(timer);
                timer = setInterval(function() {
                    longitude += dx;
                    latitude += dy;
                    affiche();
                }, 100);
                evenement.preventDefault();
            });
    $(document).on("mouseup mouseleave", "#xmoins-" + num_pano + ",#xplus-" + num_pano + ",#ymoins-" + num_pano + ",#yplus-" + num_pano, function(evenement) {
        clearInterval(timer);
        evenement.preventDefault();
    });
    /**
     * Gestion des clicks souris
     * 
     */
    $(document).on("click", "#xmoins-" + num_pano + ",#xplus-" + num_pano + ",#ymoins-" + num_pano + ",#yplus-" + num_pano,
            function(evenement) {
                if (bAfficheInfo)
                {
                    $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                        $(this).css({display: "none"});
                        bAfficheInfo = false;
                    });

                }
                dXdY($(this).attr('class'));
                longitude += dx;
                latitude += dy;
                affiche();
                evenement.preventDefault();
            });
    $(document).on("click", "#zoomPlus-" + num_pano, function() {
        if (bAfficheInfo)
        {
            $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                $(this).css({display: "none"});
                bAfficheInfo = false;
            });

        }
        fov -= 1;
        zoom();
    });
    $(document).on("click", "#zoomMoins-" + num_pano, function() {
        if (bAfficheInfo)
        {
            $("#infoPanovisu-" + num_pano).fadeOut(2000, function() {
                $(this).css({display: "none"});
                bAfficheInfo = false;
            });

        }
        fov += 1;
        zoom();
    });
    $(document).on("click", "#souris-" + num_pano, function() {
        mode = 1 - mode;
    });
    $(document).on("click", "#pleinEcran-" + num_pano, function() {
        pleinEcran();
    });
    $(document).on("click", "#auto-" + num_pano, function() {
        if (autoRotation === "oui")
        {
            autoRotation = "non";
            stoppeAutoRotation();
        }
        else
        {
            autoRotation = "oui";
            demarreAutoRotation();
        }
    });
    $(document).on("click", ".binfo", function() {
        if (bAfficheInfo)
        {
            $("#infoPanovisu-" + num_pano).fadeOut(1000, function() {
                $("#infoPanovisu-" + num_pano).css({display: "none"});
                bAfficheInfo = false;
            });

        }
        else {
            if (bAfficheAide) {
                $("#aidePanovisu-" + num_pano).fadeOut(1000, function() {
                    bAfficheAide = false;
                });
                $("#infoPanovisu-" + num_pano).fadeIn(1000, function() {
                    bAfficheInfo = true;
                });
            } else {
                $("#infoPanovisu-" + num_pano).fadeIn(1000, function() {
                    bAfficheInfo = true;
                });

            }

        }
    });
    $(document).on("click", ".aide", function() {
        if (bAfficheAide)
        {
            $("#aidePanovisu-" + num_pano).fadeOut(1000, function() {
                $("#aidePanovisu-" + num_pano).css({display: "none"});
                bAfficheAide = false;
            });
        } else {
            if (bAfficheInfo) {
                $("#infoPanovisu-" + num_pano).fadeOut(1000, function() {
                    bAfficheInfo = false;
                });
                $("#aidePanovisu-" + num_pano).fadeIn(1000, function() {
                    bAfficheAide = true;
                });
            } else {
                $("#aidePanovisu-" + num_pano).fadeIn(1000, function() {
                    bAfficheAide = true;
                });
            }

        }
    });

    $(document).on("click", ".infoPanovisu", function() {
        $(this).fadeOut(2000, function() {
            $(this).css({display: "none"});
            bAfficheInfo = false;
        });
    });
    $(document).on("click", ".aidePanovisu", function() {
        $(this).fadeOut(2000, function() {
            $(this).css({display: "none"});
            bAfficheAide = false;
        });
    });

    $(document).on("click", ".infoPanovisu a", function() {
        event.stopPropagation();
    });

    /**
     * 
     * @returns {undefined}
     */
    function deplaceMode2() {
        longitude += deltaX;
        latitude += deltaY;
        affiche();
    }
    /**
     * 
     * @returns {undefined}
     */

    function affiche() {
        if (latitude > 89.99)
            latitude = 89.99;
        if (latitude < -90)
            latitude = -90;
        phi = THREE.Math.degToRad(90 - latitude);
        theta = THREE.Math.degToRad(longitude);
        target.x = 500 * Math.sin(phi) * Math.cos(theta);
        target.y = 500 * Math.cos(phi);
        target.z = 500 * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(target);
        renderer.render(scene, camera);
    }

    //this.affiche=affiche();

    /**
     * 
     * @returns {undefined}
     */
    function zoom() {
        if (fov > 125) {
            fov = 125;
        }
        if (fov < 15) {
            fov = 15;
        }
        camera.fov = fov;
        camera.updateProjectionMatrix();
        affiche();
    }
    /**
     * 
     * @param {type} larg1
     * @param {type} haut1
     * @returns {undefined}
     */
    function afficheBarre(larg1, haut1) {
        if (pano.width() < 400 || pano.height() < 200)
        {
            $("#barre-" + num_pano + " button").css({height: "15px", width: "15px", borderRadius: "0px"});
            $("#barre-" + num_pano + " button img").css({height: "10px", width: "10px", paddingBottom: "2px", marginLeft: "-2px"});
            $("#barre-" + num_pano).css({height: "15px"});
        }
        else
        {
            $("#barre-" + num_pano + " button").css({height: "30px", width: "30px", borderRadius: "3px"});
            $("#barre-" + num_pano + " button img").css({height: "20px", width: "20px", paddingBottom: "0px", marginLeft: "0px"});
            $("#barre-" + num_pano).css({height: "30px"});
        }
        setTimeout(function() {
            w1 = $("#barre-" + num_pano).width();
            h1 = $("#barre-" + num_pano).height();
            dX1 = parseInt(dX);
            dY1 = parseInt(dY);
            switch (positionX) {
                case "left" :
                    $("#barre-" + num_pano).css({left: dX1 + "px"});
                    break;
                case "center" :
                    posX = (larg1 - w1) / 2 + dX1;
                    $("#barre-" + num_pano).css({left: posX + "px"});
                    break;
                case "right" :
                    $("#barre-" + num_pano).css({right: dX1 + "px"});
                    break;
            }
            switch (positionY) {
                case "top" :
                    posY = -(haut1 - dY1);
                    $("#barre-" + num_pano).css({top: posY + "px"});
                    break;
                case "center" :
                    posY = -(haut1 + h1) / 2 - dY1;
                    $("#barre-" + num_pano).css({top: posY + "px"});
                    break;
                case "bottom" :
                    posY = -(h1 + dY1);
                    $("#barre-" + num_pano).css({top: posY + "px"});
                    break;
            }
        }, 200);
    }

    function passeEnPleinEcran(divObj) {
        if (divObj.requestFullscreen) {
            divObj.requestFullscreen();
        }
        else if (divObj.msRequestFullscreen) {
            divObj.msRequestFullscreen();
        }
        else if (divObj.mozRequestFullScreen) {
            divObj.mozRequestFullScreen();
        }
        else if (divObj.webkitRequestFullscreen) {
            divObj.webkitRequestFullscreen();
        }
        inFullScreen = true;
        return;
    }

    //  reset full screen across several browsers
    function sortPleinEcran() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        inFullScreen = false;
        return;

    }

    /**
     * 
     * @returns {undefined}
     */

    function pleinEcran() {
        element = document.getElementById("panovisu-" + num_pano);
        if (bPleinEcran) {
            sortPleinEcran();
        }
        else {
            passeEnPleinEcran(element);
        }
        camera.aspect = pano.width() / pano.height();
        camera.updateProjectionMatrix();
        renderer.setSize(pano.width(), pano.height());
        affiche();
        setTimeout(function() {
            afficheInfo();
            afficheBarre(pano.width(), pano.height());
        }, 200);
    }


    function afficheInfo() {
        posGauche = (pano.width() - $("#infoPanovisu-" + num_pano).width()) / 2;
        posHaut = (pano.height() - $("#infoPanovisu-" + num_pano).height()) / 2;
        $("#infoPanovisu-" + num_pano).css({top: posHaut + "px", left: posGauche + "px"});
        if (bAfficheInfo)
        {
            $("#infoPanovisu-" + num_pano).css({display: "block"});
        }
    }

    function afficheAide() {
        posGauche = (pano.width() - $("#aidePanovisu-" + num_pano).width()) / 2;
        posHaut = (pano.height() - $("#aidePanovisu-" + num_pano).height()) / 2;
        $("#aidePanovisu-" + num_pano).css({top: posHaut + "px", left: posGauche + "px"});
        if (bAfficheAide)
        {
            $("#aidePanovisu-" + num_pano).css({display: "block"});
        }
    }

    function afficheErreur() {
        panoInfo = "<b>Panovisu version " +
                version +
                "</b><br><span style='color : red; font-weight : bold;'>Désolé votre navigateur ne supporte pas Webgl & Canvas</span><br>\n\
                Veuillez opter pour un navigateur plus récent<br>\n\
                Internet Explorer 10+ / Firefox / Chrome / Opéra / Safari<br><br>\n\
                &copy; Laurent LANG (2014)";
        $("#infoPanovisu-" + num_pano).css({width: "450px", height: "150px"});
        posGauche = (pano.width() - $("#infoPanovisu-" + num_pano).width()) / 2;
        posHaut = (pano.height() - $("#infoPanovisu-" + num_pano).height()) / 2;
        $("#infoPanovisu-" + num_pano).css({top: posHaut + "px", left: posGauche + "px"});
        $("#infoPanovisu-" + num_pano).html(panoInfo);
    }

    /**
     * 
     * @param {type} fenetre
     * @returns {undefined}
     */    function init(fenetre) {
        $("#info-" + num_pano).html(panoTitre);
        if (boutons === "oui")
            $("#boutons-" + num_pano).show();
        if (deplacements === "oui")
            $("#deplacement-" + num_pano).css({display: "inline-block"});
        if (zooms === "oui")
            $("#zoom-" + num_pano).css({display: "inline-block"});
        if (outils === "oui")
            $("#outils-" + num_pano).css({display: "inline-block"});
        if (fs === "oui")
            $("#pleinEcran-" + num_pano).show();
        if (autoR === "oui")
            $("#auto-" + num_pano).show();
        if (souris === "oui")
            $("#souris-" + num_pano).show();
        if (afficheTitre === "oui")
            $("#info-" + num_pano).fadeIn(2500);
        if (fenetreUniteX === "%") {
            largeur = Math.round(fenetreX * $("#" + fenPanoramique).parent().width());
        }
        else {
            largeur = fenetreX;
        }
        if (fenetreUniteY === "%") {
            hauteur = Math.round(fenetreY * $("#" + fenPanoramique).parent().height());
        }
        else {
            hauteur = fenetreY;
        }
        largeur += "px";
        hauteur += "px";
        $("#" + fenetre).width(largeur);
        $("#" + fenetre).height(hauteur);
        pano.width(largeur);
        pano.height(hauteur);
        afficheBarre(pano.width(), pano.height());
        afficheInfo();
        afficheAide();
    }
    /**
     * Initialisation du panoramique / équilatéral
     * 
     * @returns {undefined}
     */
    function initPanoSphere() {
        camera = new THREE.PerspectiveCamera(fov, pano.width() / pano.height(), 1, 1100);
        scene = new THREE.Scene();
        var loader = new THREE.TextureLoader();
        loader.load(panoImage + ".jpg", function(texture) {
            var geometry = new THREE.SphereGeometry(200, 50, 50);
            var material = new THREE.MeshBasicMaterial({map: texture, overdraw: true});
            mesh = new THREE.Mesh(geometry, material);
            mesh.scale.x = -1;
            scene.add(mesh);
            if (!isReloaded)
            {
                if (supportWebgl())
                {
                    renderer = new THREE.WebGLRenderer();
                }
                else {
                    if (supportCanvas()) {
                        renderer = new THREE.CanvasRenderer();
                    }
                    else {
                        afficheErreur();
                    }
                }
            }
            renderer.setSize(pano.width(), pano.height());
            container.append(renderer.domElement);
            affiche();
            pano1.fadeIn(2000, function() {
                afficheBarre(pano.width(), pano.height());
            });
            if (autoRotation === "oui")
                demarreAutoRotation();
        });
    }
    /**
     * 
     * @param {type} path
     * @returns {THREE.MeshBasicMaterial}
     */
    function loadTexture(path) {
        var texture = new THREE.Texture(texture_placeholder);
        var material = new THREE.MeshBasicMaterial({map: texture, overdraw: true});
        var image = new Image();
        image.onload = function() {
            texture.image = this;
            texture.needsUpdate = true;
            nbPanoCharges += 1;
            if (nbPanoCharges < 6)
                $("#panovisuCharge-" + num_pano).html(nbPanoCharges + "/6");
            else
            {
                $("#panovisuCharge-" + num_pano).html("&nbsp;");
                afficheBarre(pano.width(), pano.height());
            }
            affiche();
        };
        image.src = path;
        return material;
    }

    /**
     * Initialisation du panoramique / faces de cube
     * 
     * @returns {undefined}
     */
    function initPanoCube() {

        $("#panovisuCharge-" + num_pano).html("0/6");
        camera = new THREE.PerspectiveCamera(fov, pano.width() / pano.height(), 1, 1100);
        scene = new THREE.Scene();
        if (!isReloaded)
        {
            texture_placeholder = document.createElement('canvas');
            texture_placeholder.width = 128;
            texture_placeholder.height = 128;
            var context = texture_placeholder.getContext('2d');
            context.fillStyle = 'rgb( 128, 128, 128 )';
            context.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);
            if (supportWebgl())
            {
                renderer = new THREE.WebGLRenderer();
            }
            else {
                if (supportCanvas()) {
                    renderer = new THREE.CanvasRenderer();
                }
                else {
                    afficheErreur();
                }
            }
        }
        var materials = [
            loadTexture(panoImage + '_r.jpg'), // droite   x+
            loadTexture(panoImage + '_l.jpg'), // gauche   x-
            loadTexture(panoImage + '_u.jpg'), // dessus   y+
            loadTexture(panoImage + '_d.jpg'), // dessous  y-
            loadTexture(panoImage + '_f.jpg'), // devant   z+
            loadTexture(panoImage + '_b.jpg')  // derriere z-
        ];
        mesh = new THREE.Mesh(new THREE.CubeGeometry(300, 300, 300, 10, 10, 10), new THREE.MeshFaceMaterial(materials));
        mesh.scale.x = -1;
        scene.add(mesh);

        //alert("ici");

        renderer.setSize(pano.width(), pano.height());
        container.append(renderer.domElement);
        setTimeout(function() {
            creeHotspot(180, 0, "./panos/faces", "Panovisu - Images de test");
            creeHotspot(90, -10, "./panos/piscine", "La Piscine - Roubaix");
            affiche();
            pano1.fadeIn(2000);
            if (autoRotation === "oui")
                demarreAutoRotation();
        }, 1000);
    }

    /**
     * 
     * @returns {undefined}
     */
    function changeTaille() {

        if (!bPleinEcran) {


            if (fenetreUniteX === "%") {
                largeur = Math.round(fenetreX * $("#" + fenPanoramique).parent().width());
            }
            else {
                largeur = fenetreX;
            }
            if (fenetreUniteY === "%") {
                hauteur = Math.round(fenetreY * $("#" + fenPanoramique).parent().height());
            }
            else {
                hauteur = fenetreY;
            }

            $("#" + fenPanoramique).css({
                width: largeur + "px",
                height: hauteur + "px"
            });
            pano.css({
                width: largeur + "px",
                height: hauteur + "px"
            });
        }
        camera.aspect = pano.width() / pano.height();
        camera.updateProjectionMatrix();
        renderer.setSize(pano.width(), pano.height());
        affiche();
        setTimeout(function() {
            afficheInfo();
            afficheAide();
            afficheBarre(pano.width(), pano.height());
        }, 200);
    }


    /**
     * 
     * @returns {undefined}
     */
    function demarreAutoRotation() {

        id = requestAnimationFrame(demarreAutoRotation);
        if (isUserInteracting === false) {

            longitude += 0.25;
        }

        latitude = Math.max(-85, Math.min(85, latitude));
        affiche();
    }
    /**
     * 
     * @returns {undefined}
     */
    function stoppeAutoRotation() {

        cancelAnimationFrame(id);
    }
    /**
     * 
     * @returns {undefined}
     */
    function creeBarreNavigation() {
        $("<button>", {type: "button", id: "xmoins-" + num_pano, class: "xmoins", title: "déplacement à gauche"}).appendTo("#deplacement-" + num_pano);
        $("<img>", {src: "panovisu/images/gauche.png", alt: ""}).appendTo("#xmoins-" + num_pano);
        $("<button>", {type: "button", id: "ymoins-" + num_pano, class: "ymoins", title: "déplacement vers le haut"}).appendTo("#deplacement-" + num_pano);
        $("<img>", {src: "panovisu/images/haut.png", alt: ""}).appendTo("#ymoins-" + num_pano);
        $("<button>", {type: "button", id: "yplus-" + num_pano, class: "yplus", title: "déplacement vers le bas"}).appendTo("#deplacement-" + num_pano);
        $("<img>", {src: "panovisu/images/bas.png", alt: ""}).appendTo("#yplus-" + num_pano);
        $("<button>", {type: "button", id: "xplus-" + num_pano, class: "xplus", title: "déplacement à droite"}).appendTo("#deplacement-" + num_pano);
        $("<img>", {src: "panovisu/images/droite.png", alt: ""}).appendTo("#xplus-" + num_pano);
        $("<button>", {type: "button", id: "zoomPlus-" + num_pano, class: "zoomPlus", title: "zoom +"}).appendTo("#zoom-" + num_pano);
        $("<img>", {src: "panovisu/images/zoomin.png", alt: ""}).appendTo("#zoomPlus-" + num_pano);
        $("<button>", {type: "button", id: "zoomMoins-" + num_pano, class: "zoomMoins", title: "zoom -"}).appendTo("#zoom-" + num_pano);
        $("<img>", {src: "panovisu/images/zoomout.png", alt: ""}).appendTo("#zoomMoins-" + num_pano);
        $("<button>", {type: "button", id: "pleinEcran-" + num_pano, class: "pleinEcran", title: "plein ecran"}).appendTo("#outils-" + num_pano);
        $("<img>", {src: "panovisu/images/fs.png", alt: ""}).appendTo("#pleinEcran-" + num_pano);
        $("<button>", {type: "button", id: "souris-" + num_pano, class: "souris", title: "change le mode de déplacement de la souris"}).appendTo("#outils-" + num_pano);
        $("<img>", {src: "panovisu/images/souris.png", alt: ""}).appendTo("#souris-" + num_pano);
        $("<button>", {type: "button", id: "auto-" + num_pano, class: "auto", title: "autorotation (M/A)"}).appendTo("#outils-" + num_pano);
        $("<img>", {src: "panovisu/images/rotation.png", alt: ""}).appendTo("#auto-" + num_pano);
        $("<button>", {type: "button", id: "binfo-" + num_pano, class: "binfo", title: "A propos ..."}).appendTo("#outils-" + num_pano);
        $("<img>", {src: "panovisu/images/info.png", alt: ""}).appendTo("#binfo-" + num_pano);
        $("<button>", {type: "button", id: "aide-" + num_pano, class: "aide", title: "Aide"}).appendTo("#outils-" + num_pano);
        $("<img>", {src: "panovisu/images/aide.png", alt: ""}).appendTo("#aide-" + num_pano);

    }
    /**
     * 
     * @param {type} fenetrePanoramique
     * @returns {undefined}
     */    function creeInfo(fenetrePanoramique) {
        $("<div>", {id: "infoPanovisu-" + num_pano, class: "infoPanovisu"}).appendTo("#" + fenetrePanoramique);
        panoInfo = "<b>Panovisu version " +
                version +
                "</b><br><br>Un visualiseur 100% HTML5 - 100% libre<br>" +
                "Utilise la bibliothèque <a href='http://threejs.org/' target='_blank' title='voir la page de three.js'>Three.js</a>" +
                "<br><br>&copy; Laurent LANG (2014)<br><div id='panovisuCharge-" + num_pano + "'>&nbsp;</div>cliquez pour fermer la fenêtre";
        $("#infoPanovisu-" + num_pano).css({width: "450px", height: "150px"});
        $("#infoPanovisu-" + num_pano).html(panoInfo);
    }
    /**
     * 
     * @param {type} fenetrePanoramique
     * @returns {undefined}
     */
    function creeAide(fenetrePanoramique) {
        $("<div>", {id: "aidePanovisu-" + num_pano, class: "aidePanovisu"}).appendTo("#" + fenetrePanoramique);
        panoInfo = "<span style='font-weight:bolder;font-size:1.2em;font-variant: small-caps;'>Aide à la Navigation</span><br><br><div style='width:100px;height:90px;padding-left:5px;display:inline-block;'><img style='width:90px' src='panovisu/images/aide_souris.png'/></div>" +
                "<div style='width : 270px;display:inline-block;vertical-align:top; text-align: justify;'>Pour vous déplacer dans la vue cliquez avec le bouton gauche de la souris " +
                "sur le panoramique puis déplacez la souris en maintenant le bouton de la souris enfoncé<br><br>Vous pouvez également utiliser le menu pour vous déplacer</div>" +
                "<div><br><br>cliquez pour fermer la fenêtre</div>";
        $("#aidePanovisu-" + num_pano).css({width: "400px", height: "220px"});
        $("#aidePanovisu-" + num_pano).html(panoInfo);
    }
    function creeHotspot(long, lat, imgPano, texte) {
        var image = THREE.ImageUtils.loadTexture("panovisu/images/sprite2.png");
        var matSprite = new THREE.SpriteMaterial({map: image, color: 0xffffff, fog: true});
        var sprite = new THREE.Sprite(matSprite);
        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(long);
        var vect = new THREE.Vector3();
        vect.setX(Math.sin(phi) * Math.cos(theta));
        vect.setY(Math.cos(phi));
        vect.setZ(Math.sin(phi) * Math.sin(theta));
        hotSpot[numHotspot] = new spot();
        hotSpot[numHotspot].id = sprite.id;
        hotSpot[numHotspot].image = imgPano;
        hotSpot[numHotspot].texte = texte;
        numHotspot += 1;

        radius = 10;
        sprite.position.set(vect.x, vect.y, vect.z);
        sprite.position.normalize();
        sprite.position.multiplyScalar(radius);
        scene.add(sprite);
        affiche();
    }
    /**
     * Création du contexte de fenetre
     * 
     * @param {type} fenetre
     * @returns {undefined}
     */
    function creeContexte(fenetre) {
        /**
         * Création de la barre de titreF
         */
        var fenetrePanoramique = "panovisu-" + num_pano;
        $("<div>", {id: fenetrePanoramique, class: "panovisu", style: "width : 100%;height : 100%;position: relative;"}).appendTo("#" + fenetre);
        $("<div>", {id: "info-" + num_pano, class: "info"}).appendTo("#" + fenetrePanoramique);
        /**
         * création du conteneur du panoramique
         */
        $("<div>", {id: "pano1-" + num_pano, class: "pano1"}).appendTo("#" + fenetrePanoramique);
        $("<div>", {id: "container-" + num_pano, class: "container"}).appendTo("#pano1-" + num_pano);
        /**
         * Création de la barre de boutons
         * et des trois éléments de barre 
         *              - déplacement, 
         *              - zoom 
         *              - outils (plein écran, mode souris et autorotation)
         */
        $("<div>", {id: "boutons-" + num_pano, class: "boutons"}).appendTo("#" + fenetrePanoramique);
        $("<div>", {id: "barre-" + num_pano, class: "barre"}).appendTo("#boutons-" + num_pano);
        $("<div>", {id: "deplacement-" + num_pano, class: "deplacement"}).appendTo("#barre-" + num_pano);
        $("<div>", {id: "zoom-" + num_pano, class: "zoom"}).appendTo("#barre-" + num_pano);
        $("<div>", {id: "outils-" + num_pano, class: "outils"}).appendTo("#barre-" + num_pano);
        /**
         * On rajoute enfin les boutons & les fenêtre d'information.
         */
        creeBarreNavigation();
        creeInfo(fenetrePanoramique);
        creeAide(fenetrePanoramique);
        /**
         * Création des racourcis vers les différentes fenêtres
         */
        container = $("#container-" + num_pano);
        pano = $("#" + fenetrePanoramique);
        pano1 = $("#pano1-" + num_pano);
    }



    /**
     * intégration du panoramique 
     * 
     * @param {type} contexte
     * @returns {undefined}
     */
    this.initialisePano = function(contexte)
    {
        var defaut = {
            xml: 'xml/panovisu.xml',
            fenX: "75%",
            fenY: "80%",
            panoramique: "panovisu"
        };
        contexte = $.extend(defaut, contexte);
        fenPanoramique = contexte.panoramique;
        var fenetre = fenPanoramique;
        $(fenetre).css({overflow: "hidden"});
        creeContexte(fenetre);
        xmlFile = contexte.xml;
        if (contexte.fenX.match("[px]", "g"))
        {
            fenetreUniteX = "px";
            fenetreX = parseInt(contexte.fenX);
        }
        else
        {
            fenetreUniteX = "%";
            fenetreX = parseInt(contexte.fenX) / 100.0;
        }
        if (contexte.fenY.match("[px]", "g"))
        {
            fenetreUniteY = "px";
            fenetreY = parseInt(contexte.fenY);
        }
        else
        {
            fenetreUniteY = "%";
            fenetreY = parseInt(contexte.fenY) / 100.0;
        }
        /**
         * passe en mode souris alternatif si appareil mobile
         */
        if (estTactile())
            mode = 0;

        /**
         * lecture du fichier XML
         */
        $.get(xmlFile,
                function(d) {
                    /**
                     * Définition du panoramique à afficher 
                     */
                    var XMLPano = $(d).find('pano');
                    panoImage = XMLPano.attr('image') || panoImage;
                    panoTitre = XMLPano.attr('titre') || panoTitre;
                    panoType = XMLPano.attr('type') || panoType;
                    autoRotation = XMLPano.attr('rotation') || autoRotation;
                    longitude = XMLPano.attr('regardX') || longitude;
                    latitude = XMLPano.attr('regardY') || latitude;
                    fov = XMLPano.attr('champVision') || fov;
                    afficheTitre = XMLPano.attr('afficheTitre') || afficheTitre;
                    affInfo = XMLPano.attr('afficheInfo') || affInfo;
                    if (affInfo === "oui") {
                        bAfficheInfo = true;
                    } else {
                        bAfficheInfo = false;
                    }
                    /**
                     * Défintion pour la barre des boutons
                     */
                    var XMLBoutons = $(d).find('boutons');
                    deplacements = XMLBoutons.attr('deplacements') || deplacements;
                    zooms = XMLBoutons.attr('zoom') || zooms;
                    outils = XMLBoutons.attr('outils') || outils;
                    fs = XMLBoutons.attr('fs') || fs;
                    autoR = XMLBoutons.attr('rotation') || autoR;
                    souris = XMLBoutons.attr('souris') || souris;
                    boutons = XMLBoutons.attr('visible') || boutons;
                    positionX = XMLBoutons.attr('positionX') || positionX;
                    positionY = XMLBoutons.attr('positionY') || positionY;
                    dX = XMLBoutons.attr('dX') || dX;
                    dY = XMLBoutons.attr('dY') || dY;
                    /**
                     * Initialisation de l'interface
                     */
                    init(fenPanoramique);
                    /**
                     * Initialisation de l'affichage du panoramique
                     */
                    switch (panoType)
                    {
                        case "cube":
                            initPanoCube();
                            break;
                        case "sphere":
                            initPanoSphere();
                            break;
                    }
                });
    };
}

/*
 * ajoute la feuille de style pour l'affichage des panoramiques
 * 
 */
$("head").append(
        $(document.createElement("link")).attr({rel: "stylesheet", type: "text/css", href: "panovisu/css/panovisu.css", media: "screen"})
        );

/*
 * Teste si le navigateur supporte les fonctions HTML5-3D
 */
if (!supportWebgl() && !supportCanvas()) {
    alert("Navigateur non supporté");
}

